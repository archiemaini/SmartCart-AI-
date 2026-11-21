/**
 * =====================================================================
 * OpenRouter AI Integration Service
 * - Dynamic product synthesis for search queries with 0 catalog results
 * - AI Shopping Assistant Chatbot powered by OpenRouter LLM (DeepSeek / Gemini / Llama)
 * - Automatic persistence into MongoDB with dense vector embeddings
 * =====================================================================
 */
import Product from '../models/Product.js';
import { generateEmbedding } from './ragService.js';

const OPENROUTER_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * Curated high-resolution Unsplash images mapped to product domains
 */
const CATEGORY_IMAGE_MAP = [
  { match: /keyboard|keycap/i, url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80' },
  { match: /mouse|mousepad/i, url: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80' },
  { match: /headphone|earbud|audio|headset|earphone/i, url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80' },
  { match: /laptop|notebook|macbook|computer|pc/i, url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80' },
  { match: /phone|smartphone|mobile|android|iphone/i, url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80' },
  { match: /watch|smartwatch|band/i, url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80' },
  { match: /camera|dslr|lens/i, url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80' },
  { match: /drone|quadcopter/i, url: 'https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?auto=format&fit=crop&w=800&q=80' },
  { match: /shoe|sneaker|footwear|boot/i, url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80' },
  { match: /bag|backpack|luggage|suitcase/i, url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80' },
  { match: /coffee|espresso|cafe/i, url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80' },
  { match: /tea|green tea|chai/i, url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80' },
  { match: /protein|supplement|creatine|fitness|gym/i, url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80' },
  { match: /perfume|cologne|fragrance/i, url: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80' },
  { match: /skincare|serum|cream|cosmetics|beauty/i, url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80' },
  { match: /chair|table|desk|furniture|decor/i, url: 'https://images.unsplash.com/photo-1580481077195-c9f225bf0267?auto=format&fit=crop&w=800&q=80' },
  { match: /kitchen|blender|cookware|pan|knife/i, url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80' },
  { match: /t-shirt|shirt|hoodie|jacket|clothing|apparel/i, url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80' },
  { match: /book|novel|notebook/i, url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80' },
];

/**
 * Map product details to a verified high-resolution photo URL
 */
export function getCuratedProductImage(title = '', category = '', tags = []) {
  const combined = `${title} ${category} ${tags.join(' ')}`.toLowerCase();
  for (const item of CATEGORY_IMAGE_MAP) {
    if (item.match.test(combined)) {
      return item.url;
    }
  }
  return 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80';
}

/**
 * Fetch authentic online product images directly from retail & manufacturer CDNs
 */
export async function fetchRealOnlineProductImages(title = '', brand = '', category = '') {
  const searchQuery = `${brand} ${title} product amazon`.replace(/\s+/g, ' ').trim();
  try {
    const url = `https://www.bing.com/images/search?q=${encodeURIComponent(searchQuery)}&FORM=HDRSC2`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    });
    const html = await res.text();
    const regex = /murl&quot;:&quot;(https:[^&]+)&quot;/g;
    let match;
    const urls = [];
    while ((match = regex.exec(html)) !== null) {
      const imgUrl = decodeURIComponent(match[1]);
      if (
        imgUrl.match(/\.(jpg|jpeg|png|webp)($|\?)/i) ||
        imgUrl.includes('amazon') ||
        imgUrl.includes('flixcart') ||
        imgUrl.includes('media')
      ) {
        if (!imgUrl.includes('1x1') && !imgUrl.includes('pixel') && !imgUrl.includes('favicon')) {
          urls.push(imgUrl);
        }
      }
    }
    if (urls.length > 0) {
      return urls;
    }
  } catch (err) {
    console.warn(`[Image Fetch] Could not fetch real image for "${title}":`, err.message);
  }
  return [];
}

/**
 * Execute raw OpenRouter Chat Completion API call
 */
export async function callOpenRouter({
  messages,
  model = process.env.OPENROUTER_MODEL || 'deepseek/deepseek-chat',
  temperature = 0.7,
  max_tokens = 1500,
}) {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured in server/.env');
  }

  const response = await fetch(OPENROUTER_ENDPOINT, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'http://localhost:5173',
      'X-Title': 'SmartCart India Storefront',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';
  return content;
}

/**
 * Synthesize and persist missing products when user search returns 0 results
 * Returns array of saved MongoDB Product documents
 */
export async function generateProductsForQuery(searchQuery, count = 3) {
  if (!searchQuery || !searchQuery.trim()) return [];

  const cleanQuery = searchQuery.trim();
  console.log(`[OpenRouter] Query "${cleanQuery}" not in catalog. Requesting ${count} products from OpenRouter...`);

  const systemPrompt = `You are a product database generator for an Indian e-commerce platform.
When given a user search query, generate realistic, authentic e-commerce products sold in the Indian market.
All prices must be in Indian Rupees (₹ INR).
Output ONLY a valid JSON array of ${count} products. Do not include markdown codeblocks, explanation, or backticks.
Each object in the array MUST have:
- "title": Descriptive Indian product title (string)
- "brand": Authentic brand name (string)
- "category": Broad retail category, e.g. "Electronics", "Computers & Accessories", "Gaming", "Health & Personal Care", "Home & Kitchen", "Fashion", "Sports & Fitness" (string)
- "price": Selling price in INR (integer, e.g. 1999, 4499, 29990)
- "mrp": Original MRP in INR (integer, strictly greater than price, e.g. 2999, 6999, 39990)
- "description": High-converting detailed product description (string)
- "rating": Decimal between 4.0 and 4.9 (number)
- "numReviews": Integer review count between 25 and 450 (integer)
- "countInStock": Available warehouse stock between 8 and 35 (integer)
- "tags": Array of 3-6 relevant search keyword tags (array of strings)
- "specifications": Key-value object with 3-6 technical specifications (object)
`;

  try {
    const rawContent = await callOpenRouter({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Generate ${count} realistic products matching user search: "${cleanQuery}"` },
      ],
      temperature: 0.6,
      max_tokens: 1800,
    });

    // Strip markdown if model included backticks
    let jsonStr = rawContent.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.slice(7);
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.slice(3);
    }
    if (jsonStr.endsWith('```')) {
      jsonStr = jsonStr.slice(0, -3);
    }
    jsonStr = jsonStr.trim();

    const parsed = JSON.parse(jsonStr);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      console.warn('[OpenRouter] Model did not return an array of products');
      return [];
    }

    // Process and persist into MongoDB
    const createdDocs = [];
    for (const item of parsed) {
      const price = Number(item.price) || 999;
      const mrp = Number(item.mrp) && Number(item.mrp) > price ? Number(item.mrp) : Math.round(price * 1.35);
      const title = String(item.title || `${cleanQuery} Premium Edition`).trim();
      const brand = String(item.brand || 'SmartCart Select').trim();
      const category = String(item.category || 'General').trim();
      const description = String(item.description || title).trim();
      const tags = Array.isArray(item.tags) ? item.tags : [cleanQuery.toLowerCase()];
      
      // Fetch authentic online product image directly from real retail / manufacturer CDNs
      const realImages = await fetchRealOnlineProductImages(title, brand, category);
      const image = realImages.length > 0 ? realImages[0] : getCuratedProductImage(title, category, tags);
      const images = realImages.length > 0 ? realImages.slice(0, 4) : [image];

      // Compute vector embedding for RAG
      const embedding = await generateEmbedding(`${title} ${brand} ${category} ${description} ${tags.join(' ')}`);

      const product = await Product.create({
        title,
        brand,
        category,
        price,
        mrp,
        description,
        image,
        images,
        rating: Number(item.rating) || 4.5,
        numReviews: Number(item.numReviews) || 48,
        countInStock: Number(item.countInStock) || 15,
        tags,
        specifications: item.specifications || {},
        embedding,
      });

      createdDocs.push(product);
    }

    console.log(`[OpenRouter] Successfully generated & persisted ${createdDocs.length} new products in MongoDB for "${cleanQuery}"!`);
    return createdDocs;
  } catch (err) {
    console.error(`[OpenRouter] Failed to generate products for query "${cleanQuery}":`, err.message);
    return [];
  }
}
