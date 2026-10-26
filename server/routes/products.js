/**
 * =====================================================================
 * Contributor: ARNAV
 * Role: Product Backend & Storage Engineer
 * Syllabus Sessions: Sessions 37-38 (Express CRUD APIs) & Session 40 (Multer File Upload Route)
 * Feature: Full Product CRUD Endpoints (Create, Read, Update, Delete) & Aggregations
 * =====================================================================
 */
import express from 'express';
import Product from '../models/Product.js';
import { upload } from '../middleware/upload.js';
import { fetchPublicProducts } from '../seed.js';

const router = express.Router();

/**
 * @route   GET /api/products
 * @desc    Fetch all products with optional search, multi-category, price range, and sort
 * @access  Public
 * Demonstrates: Sessions 37-38 - Query Params, REST API, MongoDB Querying
 */
router.get('/', async (req, res, next) => {
  try {
    const { search = '', category = '', minPrice, maxPrice, sort = 'newest' } = req.query;

    const filter = {};

    // Keyword Search (title, brand, description, category)
    if (search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [{ title: regex }, { brand: regex }, { description: regex }, { category: regex }];
    }

    // Category Filter (supports single category or comma-separated list)
    if (category.trim()) {
      const catList = category.split(',').map((c) => c.trim()).filter(Boolean);
      if (catList.length === 1) {
        filter.category = catList[0];
      } else if (catList.length > 1) {
        filter.category = { $in: catList };
      }
    }

    // Price Bounds
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined && minPrice !== '') filter.price.$gte = Number(minPrice);
      if (maxPrice !== undefined && maxPrice !== '') filter.price.$lte = Number(maxPrice);
    }

    // Sorting
    let sortOptions = { createdAt: -1 };
    if (sort === 'price-asc') sortOptions = { price: 1 };
    if (sort === 'price-desc') sortOptions = { price: -1 };
    if (sort === 'rating') sortOptions = { rating: -1, numReviews: -1 };

    const products = await Product.find(filter).sort(sortOptions);
    const total = await Product.countDocuments(filter);

    res.json({
      products,
      total,
      count: products.length,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/products/filters
 * @desc    Get aggregated categories with product counts and price range for the sidebar
 * @access  Public
 * Demonstrates: Session 41 - MongoDB Aggregation Pipeline
 */
router.get('/filters', async (req, res, next) => {
  try {
    const [categories, priceBounds] = await Promise.all([
      Product.aggregate([
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
      priceRange: priceBounds[0] ? { min: priceBounds[0].min, max: priceBounds[0].max } : { min: 0, max: 100000 },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/products/sync-public
 * @desc    Fetch and sync 190+ products from public API (DummyJSON) directly into MongoDB
 * @access  Public / Admin
 * Demonstrates: Sessions 27-28 (Fetch API) & Session 41 (MongoDB insertMany)
 */
router.post('/sync-public', async (req, res, next) => {
  try {
    const products = await fetchPublicProducts();
    if (!products || products.length === 0) {
      return res.status(500).json({ message: 'Failed to fetch from public API' });
    }

    await Product.deleteMany();
    const inserted = await Product.insertMany(products);

    res.json({
      message: `Successfully synced ${inserted.length} real products from public API into MongoDB!`,
      count: inserted.length,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/products/:id
 * @desc    Fetch a single product by ID
 * @access  Public
 * Demonstrates: Sessions 37-38 - Request Params, MongoDB findById
 */
router.get('/:id', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
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

/**
 * @route   POST /api/products
 * @desc    Create a new product (supports Multer file upload OR imageUrl)
 * @access  Public / Admin
 * Demonstrates: Session 38 (CRUD Create), Session 40 (Multer File Uploads)
 */
router.post('/', upload.single('image'), async (req, res, next) => {
  try {
    const { title, brand, category, price, mrp, description, countInStock, imageUrl } = req.body;

    let image = imageUrl;
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    }

    if (!image) {
      return res.status(400).json({ message: 'Product image is required (upload file or provide imageUrl)' });
    }

    if (!title || !price || !category) {
      return res.status(400).json({ message: 'Title, category, and price are required' });
    }

    const newProduct = await Product.create({
      title,
      brand: brand || 'Generic',
      category,
      price: Number(price),
      mrp: mrp ? Number(mrp) : Number(price),
      description: description || '',
      image,
      countInStock: countInStock ? Number(countInStock) : 10,
    });

    res.status(201).json({
      message: 'Product created successfully',
      product: newProduct,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/products/:id
 * @desc    Update a product by ID
 * @access  Public / Admin
 * Demonstrates: Session 38 (CRUD Update)
 */
router.put('/:id', upload.single('image'), async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const { title, brand, category, price, mrp, description, countInStock, imageUrl } = req.body;

    if (title) product.title = title;
    if (brand) product.brand = brand;
    if (category) product.category = category;
    if (price !== undefined) product.price = Number(price);
    if (mrp !== undefined) product.mrp = Number(mrp);
    if (description !== undefined) product.description = description;
    if (countInStock !== undefined) product.countInStock = Number(countInStock);

    if (req.file) {
      product.image = `/uploads/${req.file.filename}`;
    } else if (imageUrl) {
      product.image = imageUrl;
    }

    const updatedProduct = await product.save();

    res.json({
      message: 'Product updated successfully',
      product: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete a product by ID
 * @access  Public / Admin
 * Demonstrates: Session 38 (CRUD Delete)
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully', id: req.params.id });
  } catch (error) {
    next(error);
  }
});

export default router;
