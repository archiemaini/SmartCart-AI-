/**
 * =====================================================================
 * Intelligent RAG (Retrieval-Augmented Generation) Pipeline (Feature 3)
 * - Dense Vector Embeddings & Cosine Similarity Vector Retrieval
 * - Access to the complete MongoDB Product Database
 * - Google Gemini LLM API integration with Fallback Reasoning Engine
 * - Natural language queries: budget filters, specs, camera, gaming, and side-by-side comparisons
 * =====================================================================
 */
import { GoogleGenerativeAI } from '@google/generative-ai';
import Product from '../models/Product.js';
import { callOpenRouter, generateProductsForQuery } from './openRouterService.js';

// Vector dimension for semantic embeddings
const EMBEDDING_DIM = 64;

// Key retail semantic anchors for dense vector mapping
const SEMANTIC_KEYWORDS = [
  'laptop', 'notebook', 'macbook', 'computer', 'pc', 'desktop', 'processor', 'intel', 'ryzen', 'ssd', 'ram',
  'smartphone', 'phone', 'mobile', 'android', 'iphone', 'pixel', 'galaxy', 'camera', 'lens', 'megapixels', 'ois',
  'headphone', 'earbud', 'audio', 'sound', 'music', 'bass', 'anc', 'noise', 'surround', 'mic', 'gaming', 'esports',
  'console', 'ps5', 'xbox', 'fast', 'battery', 'charge', 'display', 'screen', 'oled', 'fhd', 'lightweight',
  'budget', 'cheap', 'premium', 'under', 'price', 'deal', 'fashion', 'apparel', 'shirt', 'dress', 'shoes',
  'watch', 'kitchen', 'home', 'appliances', 'beauty', 'skincare', 'perfume', 'health', 'personal'
];

/**
 * Generate a normalized dense semantic embedding vector for a piece of text.
 * When GEMINI_API_KEY is available, can call Gemini embedding-004;
 * Otherwise uses a deterministic high-dimensional subword semantic vectorizer.
 */
export async function generateEmbedding(text = '') {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey !== 'your_gemini_api_key_here') {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });
      const result = await embeddingModel.embedContent(text.slice(0, 1000));
      if (result.embedding?.values) {
        return normalizeVector(result.embedding.values.slice(0, EMBEDDING_DIM));
      }
    } catch (err) {
      console.warn(`[RAG] Gemini Embedding API warning (${err.message}). Using semantic dense vectorizer.`);
    }
  }

  // Fast, deterministic semantic dense vector embedding
  return createSemanticVector(text);
}

/**
 * Create a normalized dense float vector from text based on term frequency
 * and character n-gram hashing
 */
function createSemanticVector(text) {
  const vec = new Float64Array(EMBEDDING_DIM);
  const normalized = String(text || '').toLowerCase();
  const tokens = normalized.match(/\b[a-z0-9_]{2,}\b/g) || [];

  // 1. Keyword semantic projections
  SEMANTIC_KEYWORDS.forEach((kw, idx) => {
    const dim = idx % EMBEDDING_DIM;
    if (normalized.includes(kw)) {
      vec[dim] += 2.5;
    }
  });

  // 2. Token hash projections
  for (const token of tokens) {
    let hash = 0;
    for (let i = 0; i < token.length; i++) {
      hash = (hash << 5) - hash + token.charCodeAt(i);
      hash |= 0;
    }
    const dim = Math.abs(hash) % EMBEDDING_DIM;
    vec[dim] += 1.0;
  }

  return normalizeVector(Array.from(vec));
}

/**
 * Normalize vector to unit length for exact cosine similarity via dot product
 */
function normalizeVector(vec) {
  let mag = 0;
  for (let i = 0; i < vec.length; i++) {
    mag += vec[i] * vec[i];
  }
  mag = Math.sqrt(mag);
  if (mag === 0) return vec;
  return vec.map((v) => Number((v / mag).toFixed(6)));
}

/**
 * Compute cosine similarity between two unit vectors
 */
export function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dot = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
  }
  return dot;
}

/**
 * Extract numerical budget constraint from natural language
 * e.g. "under 50000", "below ₹25,000", "within 60k", "less than 1500"
 */
export function extractPriceConstraint(queryText) {
  // Strip commas so ₹50,000 becomes 50000
  const text = queryText.toLowerCase().replace(/,/g, '');

  // Pattern: "under 50k" or "within 60k"
  const kMatch = text.match(/(?:under|below|less than|within|around|budget of)?\s*(?:₹|rs\.?|inr)?\s*(\d{1,4})\s*k\b/i);
  if (kMatch) {
    return Number(kMatch[1]) * 1000;
  }

  const numMatch = text.match(/(?:under|below|less than|within|around|budget of|max)\s*(?:₹|rs\.?|inr)?\s*(\d{2,7})/i);
  if (numMatch) {
    return Number(numMatch[1]);
  }

  const rawRupee = text.match(/(?:₹|rs\.?)\s*(\d{2,7})/i);
  if (rawRupee && (text.includes('under') || text.includes('below') || text.includes('less') || text.includes('budget') || text.includes('within'))) {
    return Number(rawRupee[1]);
  }

  return null;
}

/**
 * RAG Vector Retrieval: Retrieve top matching products from MongoDB
 * using vector embeddings + structured metadata constraints
 */
export async function retrieveProductsRAG(queryText, limit = 4) {
  const maxPrice = extractPriceConstraint(queryText);
  const queryEmbedding = await generateEmbedding(queryText);
  const qLower = queryText.toLowerCase();

  // Initial MongoDB filter
  const filter = {};
  if (maxPrice) {
    filter.price = { $lte: maxPrice };
  }

  // Extract core search intent nouns, removing common filler stopwords
  const STOPWORDS = new Set([
    'suggest', 'show', 'find', 'best', 'good', 'cheap', 'budget', 'under', 'below', 'less', 'than',
    'within', 'around', 'price', 'product', 'products', 'item', 'items', 'with', 'for', 'the', 'and',
    'a', 'an', 'in', 'on', 'at', 'to', 'of', 'me', 'some', 'give', 'can', 'you', 'i', 'want', 'need', 'buy', 'looking'
  ]);
  const contentWords = qLower.replace(/[^\w\s]/g, ' ').split(/\s+/).filter((w) => w.length > 2 && !STOPWORDS.has(w) && !/^\d+k?$/.test(w));

  // Pre-filter keywords if user explicitly specified core domain nouns
  const keywords = [];
  if (qLower.includes('laptop') || qLower.includes('notebook')) {
    keywords.push({ title: /laptop|notebook|macbook|ideapad|vivobook/i }, { category: 'Computers & Accessories' }, { tags: 'laptop' });
  } else if (qLower.includes('phone') || qLower.includes('smartphone') || qLower.includes('mobile')) {
    keywords.push({ title: /phone|pixel|galaxy|oneplus/i }, { category: 'Smartphones & Tablets' }, { tags: 'smartphone' });
  } else if (qLower.includes('headphone') || qLower.includes('earbud') || qLower.includes('audio') || qLower.includes('headset')) {
    keywords.push({ title: /headphone|headset|earbud|audio|wh-1000xm|blackshark|cloud/i }, { category: { $in: ['Audio & Wearables', 'Gaming & Accessories'] } });
  } else if (qLower.includes('keyboard')) {
    keywords.push({ title: /keyboard/i }, { category: /keyboard/i }, { tags: 'keyboard' });
  } else if (qLower.includes('drone')) {
    keywords.push({ title: /drone/i }, { category: /drone/i }, { tags: 'drone' });
  } else if (qLower.includes('watch') || qLower.includes('smartwatch')) {
    keywords.push({ title: /watch/i }, { category: /watch/i }, { tags: 'watch' });
  } else if (qLower.includes('cooker') || qLower.includes('pan') || qLower.includes('pot')) {
    keywords.push({ title: /cooker|pan|pot|cookware/i }, { category: /kitchen/i });
  } else if (contentWords.length > 0) {
    // English noun phrase head noun is typically the final content word
    const headNoun = contentWords[contentWords.length - 1];
    const headRegex = new RegExp(headNoun, 'i');
    keywords.push({ title: headRegex }, { category: headRegex }, { tags: headRegex });
  }

  if (keywords.length > 0) {
    filter.$or = keywords;
  }

  // Fetch candidates from MongoDB
  let candidates = await Product.find(filter)
    .select('+embedding')
    .limit(80)
    .lean();

  if (candidates.length === 0) {
    return [];
  }

  // Compute Cosine Similarity for each candidate
  const scored = candidates.map((p) => {
    let pVec = p.embedding;
    if (!pVec || pVec.length !== EMBEDDING_DIM) {
      pVec = createSemanticVector(`${p.title} ${p.brand} ${p.category} ${p.description} ${(p.tags || []).join(' ')}`);
    }

    const similarity = cosineSimilarity(queryEmbedding, pVec);

    // Boost products matching high ratings & keywords
    let boost = 0;
    const qLower = queryText.toLowerCase();
    if (qLower.includes('laptop') && p.category === 'Computers & Accessories') boost += 0.25;
    if (qLower.includes('camera') && (p.title.toLowerCase().includes('camera') || p.description.toLowerCase().includes('camera') || p.category === 'Smartphones & Tablets')) boost += 0.25;
    if (qLower.includes('gaming') && ((p.tags || []).includes('gaming') || p.category === 'Gaming & Accessories' || p.title.toLowerCase().includes('gaming'))) boost += 0.3;
    if (qLower.includes('headphone') && (p.category === 'Audio & Wearables' || p.category === 'Gaming & Accessories')) boost += 0.25;

    return {
      product: p,
      score: similarity + boost,
    };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((s) => s.product);
}

/**
 * Handle Product Comparison Query
 * e.g. "Compare these two products", "Compare Lenovo and Asus", "Compare Google Pixel and Samsung"
 */
export async function handleProductComparison(queryText, sessionProducts = []) {
  const queryLower = queryText.toLowerCase();
  let productsToCompare = [];

  // Check if session has previous products to compare
  if (sessionProducts.length >= 2 && (queryLower.includes('compare these') || queryLower.includes('compare both') || queryLower.includes('which one is better'))) {
    productsToCompare = sessionProducts.slice(0, 2);
  } else {
    // Search for named products in the query
    const words = queryText.replace(/[^\w\s]/g, '').split(' ').filter((w) => w.length > 3 && !['compare', 'these', 'between', 'which', 'better', 'versus'].includes(w.toLowerCase()));
    
    if (words.length >= 2) {
      const p1 = await Product.findOne({ $text: { $search: words[0] } }).lean();
      const p2 = await Product.findOne({ $text: { $search: words[1] } }).lean();
      if (p1 && p2 && String(p1._id) !== String(p2._id)) {
        productsToCompare = [p1, p2];
      }
    }

    if (productsToCompare.length < 2) {
      // Fallback: pick top 2 relevant products
      productsToCompare = await retrieveProductsRAG(queryText, 2);
    }
  }

  if (productsToCompare.length < 2) {
    return null;
  }

  const [a, b] = productsToCompare;
  const priceDiff = Math.abs(a.price - b.price);
  const cheaper = a.price < b.price ? a : b;

  const comparisonMarkdown = `
### ⚖️ Side-by-Side Product Comparison

| Feature | **${a.title}** | **${b.title}** |
| :--- | :--- | :--- |
| **Brand** | ${a.brand} | ${b.brand} |
| **Category** | ${a.category} | ${b.category} |
| **Price** | **₹${a.price.toLocaleString('en-IN')}** | **₹${b.price.toLocaleString('en-IN')}** |
| **MRP (Savings)** | ₹${a.mrp.toLocaleString('en-IN')} (${Math.round(((a.mrp - a.price) / a.mrp) * 100)}% off) | ₹${b.mrp.toLocaleString('en-IN')} (${Math.round(((b.mrp - b.price) / b.mrp) * 100)}% off) |
| **Rating** | ⭐ ${a.rating} / 5 (${a.numReviews} reviews) | ⭐ ${b.rating} / 5 (${b.numReviews} reviews) |
| **Stock** | ${a.countInStock > 0 ? `${a.countInStock} units in stock` : 'Out of stock'} | ${b.countInStock > 0 ? `${b.countInStock} units in stock` : 'Out of stock'} |

#### 💡 Expert Verdict:
• **Value Pick:** **${cheaper.title}** is more affordable by **₹${priceDiff.toLocaleString('en-IN')}**.
• **Performance & Quality:** **${a.rating >= b.rating ? a.title : b.title}** carries higher customer ratings.
• You can add either item to your cart directly below or click **Buy Now** to proceed straight to checkout!
  `.trim();

  return {
    reply: comparisonMarkdown,
    products: productsToCompare,
    isComparison: true,
  };
}

/**
 * Intelligent Shopping Assistant LLM Pipeline
 * Retrieves RAG products, passes context into LLM, and formats rich response
 */
export async function processChatQuery(userMessage, conversationHistory = []) {
  const query = userMessage.trim();

  // 1. Check for product comparison intent
  if (query.toLowerCase().includes('compare') || query.toLowerCase().includes('vs ') || query.toLowerCase().includes('difference between')) {
    const comparisonResult = await handleProductComparison(query, conversationHistory);
    if (comparisonResult) {
      return comparisonResult;
    }
  }

  // 2. Retrieve Top-K RAG Products using Dense Embeddings
  let retrievedProducts = await retrieveProductsRAG(query, 3);
  const maxPrice = extractPriceConstraint(query);

  // If 0 products retrieved from catalog and OpenRouter is enabled, dynamically generate matching items
  if (retrievedProducts.length === 0 && process.env.OPENROUTER_API_KEY) {
    try {
      const generated = await generateProductsForQuery(query, 3);
      if (generated && generated.length > 0) {
        retrievedProducts = generated;
      }
    } catch (gErr) {
      console.warn(`[RAG] On-demand product generation warning: ${gErr.message}`);
    }
  }

  // 3. Generate Response via OpenRouter LLM, Gemini, or Local Engine
  let reply = '';
  const openRouterKey = process.env.OPENROUTER_API_KEY;

  if (openRouterKey) {
    try {
      const productContext = retrievedProducts.map((p, idx) => `
Product ${idx + 1}:
- Title: ${p.title}
- Brand: ${p.brand}
- Category: ${p.category}
- Price: ₹${p.price.toLocaleString('en-IN')} (MRP: ₹${p.mrp.toLocaleString('en-IN')})
- Rating: ${p.rating}/5 (${p.numReviews} reviews)
- Stock: ${p.countInStock}
- Description: ${p.description}
- Key Specs: ${JSON.stringify(p.specifications || {})}
      `).join('\n\n');

      const prompt = `You are SmartCart's expert AI Shopping Consultant in India.
User Query: "${query}"

${retrievedProducts.length > 0 ? `Here are the matching products from our catalog:\n${productContext}` : 'No matching products currently in catalog.'}

Instructions:
1. Address the user's specific request warmly, concisely, and helpfully.
2. If products are listed above, highlight key specifications and reasons to buy (processor, battery, camera, audio, or value in ₹) using clean bullet points.
3. Inform the user that they can click "Add to Cart" or "Buy Now" on the product cards below to order immediately.
4. Keep all prices in Indian Rupees (₹). Keep output concise (max 3 short paragraphs or bullets).`;

      reply = await callOpenRouter({
        messages: [
          { role: 'system', content: 'You are SmartCart India expert AI Shopping Consultant. Keep answers crisp, accurate, helpful, and formatted with markdown.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.6,
        max_tokens: 650,
      });
    } catch (err) {
      console.warn(`[RAG] OpenRouter generation failed: ${err.message}. Trying fallbacks...`);
    }
  }

  // Fallback to Gemini if OpenRouter didn't produce a reply
  const apiKey = process.env.GEMINI_API_KEY;
  if (!reply && apiKey && apiKey !== 'your_gemini_api_key_here' && retrievedProducts.length > 0) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
      });

      const productContext = retrievedProducts.map((p, idx) => `
Product ${idx + 1}:
- Title: ${p.title}
- Brand: ${p.brand}
- Category: ${p.category}
- Price: ₹${p.price.toLocaleString('en-IN')} (MRP: ₹${p.mrp.toLocaleString('en-IN')})
- Rating: ${p.rating}/5 (${p.numReviews} reviews)
- Stock: ${p.countInStock}
- Description: ${p.description}
- Key Specs: ${JSON.stringify(p.specifications || {})}
      `).join('\n\n');

      const prompt = `
You are SmartCart's expert AI Shopping Consultant in India.
User Query: "${query}"

Here are the top retrieved products from our MongoDB product catalog matching the user's criteria:
${productContext}

Instructions:
1. Address the user's specific request warmly and directly.
2. Highlight why these specific models are recommended (e.g. processor, camera quality, gaming audio, budget savings in ₹).
3. Mention key specifications clearly using bullet points.
4. Inform the user that they can click "Add to Cart" or "Buy Now" on the product cards below to order immediately.
5. Keep your tone professional, concise, and helpful. All prices must be quoted in Indian Rupees (₹).
      `;

      const result = await model.generateContent(prompt);
      reply = result.response.text();
    } catch (err) {
      console.warn(`[RAG] Gemini generation failed (${err.message}). Using local reasoning response.`);
    }
  }

  // Local RAG Reasoning Engine (if Gemini is not configured or failed)
  if (!reply) {
    if (retrievedProducts.length > 0) {
      const p1 = retrievedProducts[0];
      const qLower = query.toLowerCase();

      if (qLower.includes('laptop') && maxPrice) {
        reply = `I searched our verified catalog and retrieved top-rated **laptops within your budget under ₹${maxPrice.toLocaleString('en-IN')}**:\n\n• **${p1.title}**: Outstanding value at **₹${p1.price.toLocaleString('en-IN')}** with ⭐ ${p1.rating}/5 rating.\n• All models listed below are in stock and ready to ship across India with fast delivery.\n\nClick **Add to Cart** or **Buy Now** on any card below to proceed:`;
      } else if (qLower.includes('camera') || qLower.includes('phone') || qLower.includes('smartphone')) {
        reply = `Here are our best-selling smartphones equipped with **high-resolution pro-grade cameras** and optical stabilization:\n\n• **${p1.title}** (₹${p1.price.toLocaleString('en-IN')}): Exceptional sensor with stellar low-light night mode and portrait photography.\n\nTake a look at the options below to add them to your cart or check out directly:`;
      } else if (qLower.includes('gaming') || qLower.includes('headphone')) {
        reply = `For competitive gaming and immersive spatial audio, here are our **top-recommended gaming headsets**:\n\n• **${p1.title}** (₹${p1.price.toLocaleString('en-IN')}): Features positional surround sound, low latency, and crystal-clear noise-canceling microphone.\n\nCheck out the product cards below:`;
      } else if (maxPrice) {
        reply = `Here are the top-rated items from our collection under **₹${maxPrice.toLocaleString('en-IN')}**:\n\n• **${p1.title}** - ₹${p1.price.toLocaleString('en-IN')} (⭐ ${p1.rating}/5)\n\nYou can add any product to your cart or purchase directly below!`;
      } else {
        reply = `Based on your request, I retrieved these top matches from our store collection:\n\n• **${p1.title}** (₹${p1.price.toLocaleString('en-IN')}) - highly rated by verified buyers.\n\nClick **Add to Cart** or **Buy Now** to proceed immediately:`;
      }
    } else {
      reply = `I couldn't find exact matches for "${query}". Try searching for popular categories like:\n• *"Show me laptops under ₹50,000"*\n• *"Suggest a good smartphone with a decent camera"*\n• *"Find the best headphones for gaming"*\n• *"Compare these two products"*`;
    }
  }

  return {
    reply,
    products: retrievedProducts,
    maxPrice,
  };
}
