/**
 * =====================================================================
 * Product Routes: Public Browsing, Search, Filters,
 * Real API Sync, and Admin Role-Based Management (Feature 2 & 5)
 * =====================================================================
 */
import express from 'express';
import Product from '../models/Product.js';
import { protect, adminOnly, optionalAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { syncRealProductsIntoDB } from '../services/productIngestionService.js';
import { recordUserSearch, recordProductView } from '../services/recommendationService.js';
import { generateEmbedding, cosineSimilarity } from '../services/ragService.js';
import { generateProductsForQuery } from '../services/openRouterService.js';

const router = express.Router();

/**
 * @route   GET /api/products
 * @desc    Fetch products with AI Semantic Dense Vector Search, category filters, and sorting
 * @access  Public
 */
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const { search = '', category = '', minPrice, maxPrice, sort = search.trim() ? 'relevance' : 'newest' } = req.query;

    const filter = {
      category: { $nin: ['Toys & Games', 'toys & games', 'Toys and Games'] },
    };

    // Category Filter
    if (category.trim()) {
      const catList = category.split(',').map((c) => c.trim()).filter(Boolean);
      if (catList.length === 1) {
        filter.category = catList[0];
      } else if (catList.length > 1) {
        filter.category = { $in: catList };
      }
    }

    // Price Bounds in INR (₹)
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined && minPrice !== '') filter.price.$gte = Number(minPrice);
      if (maxPrice !== undefined && maxPrice !== '') filter.price.$lte = Number(maxPrice);
    }

    // Record user activity for recommendation engine (Feature 4)
    if (search.trim() && req.user) {
      recordUserSearch(req.user._id, search.trim(), category);
    }

    let products = [];
    let total = 0;

    // AI Semantic Dense Vector & Intent Search (when search query is present)
    if (search.trim()) {
      const qClean = search.trim();
      const qLower = qClean.toLowerCase();
      const searchTerms = qLower.split(/\s+/).filter((t) => t.length >= 2);
      const termRegexes = searchTerms.map((t) => new RegExp(`\\b${t}(s|es)?\\b`, 'i'));
      const queryEmbedding = await generateEmbedding(qClean);

      // Fetch candidates matching category and price
      const candidates = await Product.find(filter).select('+embedding').lean();

      // Category conflict detectors
      const isKitchenQuery = /\b(pan|cooker|tawa|kadai|pot|cookware|kettle|blender|grinder|utensil)\b/i.test(qLower);
      const isLaptopQuery = /\b(laptop|notebook|macbook|chromebook)\b/i.test(qLower);
      const isAudioQuery = /\b(headphone|earbud|headset|earphone|speaker|soundbar)\b/i.test(qLower);
      const isFootwearQuery = /\b(shoe|sneaker|footwear|boot|sandal|loafer)\b/i.test(qLower);

      const scored = [];
      for (const p of candidates) {
        const pTitle = (p.title || '').toLowerCase();
        const pDesc = (p.description || '').toLowerCase();
        const pBrand = (p.brand || '').toLowerCase();
        const pCat = (p.category || '').toLowerCase();
        const pTags = (p.tags || []).join(' ').toLowerCase();

        // 1. Strict category exclusion: prevent mobile cases, bedsheets, or apparel from polluting kitchen/tech queries
        if (isKitchenQuery && (pCat.includes('smartphone') || pCat.includes('fashion') || pCat.includes('apparel'))) {
          continue;
        }
        if (isLaptopQuery && (pCat.includes('smartphone') || pCat.includes('fashion') || pCat.includes('home'))) {
          continue;
        }
        if (isAudioQuery && (pCat.includes('smartphone') || pCat.includes('fashion') || pCat.includes('home'))) {
          continue;
        }
        if (isFootwearQuery && !pCat.includes('fashion') && !pCat.includes('apparel') && !pTitle.includes('shoe')) {
          continue;
        }

        // 2. Whole-word term matching
        let titleMatch = 0;
        let otherMatch = 0;

        for (const reg of termRegexes) {
          if (reg.test(pTitle)) titleMatch++;
          else if (reg.test(pBrand) || reg.test(pTags) || reg.test(pCat) || reg.test(pDesc)) otherMatch++;
        }

        // 3. Dense Vector Semantic Similarity
        const pVec = p.embedding;
        const sim = pVec && pVec.length === 64 ? cosineSimilarity(queryEmbedding, pVec) : 0;

        // 4. Score calculation: title matches dominate, followed by tags/category and cosine similarity
        if (titleMatch > 0 || otherMatch > 0 || sim >= 0.72) {
          const score = (titleMatch * 3.5) + (otherMatch * 1.5) + (sim * 1.5);
          scored.push({ product: p, score, titleMatch });
        }
      }

      // Sort
      if (sort === 'price-asc') {
        scored.sort((a, b) => a.product.price - b.product.price);
      } else if (sort === 'price-desc') {
        scored.sort((a, b) => b.product.price - a.product.price);
      } else if (sort === 'rating') {
        scored.sort((a, b) => b.product.rating - a.product.rating);
      } else if (sort === 'newest') {
        scored.sort((a, b) => new Date(b.product.createdAt) - new Date(a.product.createdAt));
      } else {
        // Semantic Match: Best title matches and highest semantic score first
        scored.sort((a, b) => b.score - a.score);
      }

      products = scored.map((s) => s.product);
      total = products.length;

      // Dynamic catalog expansion via OpenRouter when semantic search yields 0 results
      if (products.length === 0 && process.env.OPENROUTER_API_KEY) {
        try {
          const generated = await generateProductsForQuery(qClean, 4);
          if (generated && generated.length > 0) {
            products = generated;
            total = generated.length;
          }
        } catch (err) {
          console.warn(`[OpenRouter Catalog Auto-Fetch] Error: ${err.message}`);
        }
      }
    } else {
      // Standard browsing / category filter
      let sortOptions = { createdAt: -1 };
      if (sort === 'price-asc') sortOptions = { price: 1 };
      if (sort === 'price-desc') sortOptions = { price: -1 };
      if (sort === 'rating') sortOptions = { rating: -1, numReviews: -1 };

      products = await Product.find(filter).sort(sortOptions);
      total = await Product.countDocuments(filter);
    }

    res.json({
      products,
      total,
      count: products.length,
      isSemanticSearch: Boolean(search.trim()),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/products/filters
 * @desc    Get aggregated categories with product counts and INR price bounds
 * @access  Public
 */
router.get('/filters', async (req, res, next) => {
  try {
    const [categories, priceBounds] = await Promise.all([
      Product.aggregate([
        { $match: { category: { $nin: ['Toys & Games', 'toys & games', 'Toys and Games', 'toys and games'] } } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $project: { _id: 0, name: '$_id', count: 1 } },
        { $sort: { name: 1 } },
      ]),
      Product.aggregate([
        { $group: { _id: null, min: { $min: '$price' }, max: { $max: '$price' } } },
      ]),
    ]);

    res.json({
      categories,
      priceRange: priceBounds[0] ? { min: priceBounds[0].min, max: priceBounds[0].max } : { min: 0, max: 150000 },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/products/sync-real (and /sync-public)
 * @desc    Fetch and sync real products from public APIs in INR into MongoDB (Feature 2)
 * @access  Admin Only (or first-time seed)
 */
router.post(['/sync-real', '/sync-public'], optionalAuth, async (req, res, next) => {
  try {
    // Check if products already exist; if so, require admin permissions
    const count = await Product.countDocuments();
    if (count > 0 && (!req.user || req.user.role !== 'admin')) {
      return res.status(403).json({ message: 'Administrative access required to sync product catalog.' });
    }

    const inserted = await syncRealProductsIntoDB();

    res.json({
      message: `Successfully ingested and synced ${inserted.length} real products from Amazon Berkeley Objects dataset into MongoDB!`,
      count: inserted.length,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/products/:id
 * @desc    Fetch single product by ID and record user view for recommendations
 * @access  Public
 */
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Record view in recommendation engine (Feature 4)
    if (req.user) {
      recordProductView(req.user._id, product._id);
    }

    const related = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
    }).limit(4);

    res.json({ product, related });
  } catch (error) {
    next(error);
  }
});

// ─────────────────────────────────────────────────────────────
// Admin-Restricted Product Management APIs (Feature 5)
// ─────────────────────────────────────────────────────────────

/**
 * @route   POST /api/products
 * @desc    Add a new product with file upload or image URL
 * @access  Private (Admin Only)
 */
router.post('/', protect, adminOnly, upload.single('image'), async (req, res, next) => {
  try {
    const { title, brand, category, price, mrp, description, countInStock, imageUrl, tags } = req.body;

    let image = imageUrl;
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    }

    if (!image) {
      return res.status(400).json({ message: 'Product image is required (upload file or provide imageUrl)' });
    }

    if (!title || !price || !category) {
      return res.status(400).json({ message: 'Title, category, and price in INR are required' });
    }

    // Generate vector embedding for RAG
    const embedding = await generateEmbedding(`${title} ${brand || ''} ${category} ${description || ''}`);

    const newProduct = await Product.create({
      title: title.trim(),
      brand: (brand || 'Generic').trim(),
      category: category.trim(),
      price: Number(price),
      mrp: mrp ? Number(mrp) : Math.round(Number(price) * 1.25),
      description: (description || '').trim(),
      image,
      countInStock: countInStock !== undefined ? Number(countInStock) : 10,
      tags: tags ? (Array.isArray(tags) ? tags : String(tags).split(',').map((t) => t.trim())) : [],
      embedding,
    });

    res.status(201).json({
      message: 'Product created successfully by Administrator',
      product: newProduct,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/products/:id
 * @desc    Update an existing product
 * @access  Private (Admin Only)
 */
router.put('/:id', protect, adminOnly, upload.single('image'), async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const { title, brand, category, price, mrp, description, countInStock, imageUrl, tags } = req.body;

    if (title) product.title = title.trim();
    if (brand) product.brand = brand.trim();
    if (category) product.category = category.trim();
    if (price !== undefined) product.price = Number(price);
    if (mrp !== undefined) product.mrp = Number(mrp);
    if (description !== undefined) product.description = description.trim();
    if (countInStock !== undefined) product.countInStock = Number(countInStock);
    if (tags) {
      product.tags = Array.isArray(tags) ? tags : String(tags).split(',').map((t) => t.trim());
    }

    if (req.file) {
      product.image = `/uploads/${req.file.filename}`;
    } else if (imageUrl) {
      product.image = imageUrl;
    }

    // Refresh RAG embedding
    product.embedding = await generateEmbedding(`${product.title} ${product.brand} ${product.category} ${product.description}`);

    const updatedProduct = await product.save();

    res.json({
      message: 'Product updated successfully by Administrator',
      product: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PATCH /api/products/:id/stock
 * @desc    Manage product availability and stock count
 * @access  Private (Admin Only)
 */
router.patch('/:id/stock', protect, adminOnly, async (req, res, next) => {
  try {
    const { countInStock } = req.body;
    if (countInStock === undefined || Number(countInStock) < 0) {
      return res.status(400).json({ message: 'Valid stock count is required' });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { countInStock: Number(countInStock) },
      { new: true }
    );

    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.json({
      message: `Stock updated to ${product.countInStock}`,
      product,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete a product from the catalog
 * @access  Private (Admin Only)
 */
router.delete('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({
      message: 'Product removed from catalog successfully by Administrator',
      id: req.params.id,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
