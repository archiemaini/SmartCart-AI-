/**
 * =====================================================================
 * Personalized Product Recommendation Engine (Feature 4)
 * Analyzes:
 * 1. Previous Search History
 * 2. Previously Viewed Products
 * 3. Previous Order History
 * 4. Frequently Explored Categories
 * Computes category affinities, price preferences, and collaborative signals
 * =====================================================================
 */
import User from '../models/User.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

/**
 * Track user search query
 */
export async function recordUserSearch(userId, query, category = '') {
  if (!userId || !query) return;
  try {
    await User.findByIdAndUpdate(userId, {
      $push: {
        'activity.searches': {
          $each: [{ query: query.trim(), category: category.trim(), timestamp: new Date() }],
          $slice: -30, // Keep last 30 searches
        },
      },
    });
  } catch (err) {
    console.warn(`[RecEngine] Error recording search: ${err.message}`);
  }
}

/**
 * Track user product view
 */
export async function recordProductView(userId, productId) {
  if (!userId || !productId) return;
  try {
    const product = await Product.findById(productId);
    if (!product) return;

    await User.findByIdAndUpdate(userId, {
      $push: {
        'activity.viewedProducts': {
          $each: [{ product: product._id, category: product.category, timestamp: new Date() }],
          $slice: -40, // Keep last 40 viewed products
        },
      },
    });

    // Update explored category count
    await recordCategoryExplored(userId, product.category);
  } catch (err) {
    console.warn(`[RecEngine] Error recording view: ${err.message}`);
  }
}

/**
 * Record exploration of a category
 */
export async function recordCategoryExplored(userId, category) {
  if (!userId || !category) return;
  try {
    const user = await User.findById(userId);
    if (!user) return;

    const existingCatIndex = user.activity?.exploredCategories?.findIndex(
      (c) => c.category?.toLowerCase() === category.toLowerCase()
    );

    if (existingCatIndex >= 0) {
      user.activity.exploredCategories[existingCatIndex].count += 1;
      user.activity.exploredCategories[existingCatIndex].lastExplored = new Date();
    } else {
      if (!user.activity) user.activity = { searches: [], viewedProducts: [], exploredCategories: [] };
      if (!user.activity.exploredCategories) user.activity.exploredCategories = [];
      user.activity.exploredCategories.push({
        category,
        count: 1,
        lastExplored: new Date(),
      });
    }

    await user.save();
  } catch (err) {
    console.warn(`[RecEngine] Error recording category: ${err.message}`);
  }
}

/**
 * Recommendation Algorithm: Generate personalized recommendations for a user
 */
export async function getPersonalizedRecommendations(userId) {
  let user = null;
  let userOrders = [];

  if (userId) {
    user = await User.findById(userId).populate('activity.viewedProducts.product');
    userOrders = await Order.find({ user: userId });
  }

  // 1. Gather all purchased product IDs and category affinities
  const purchasedProductIds = new Set();
  const categoryScores = {};
  const pricePoints = [];

  // Order history signals (Weight = 5 per item)
  for (const order of userOrders) {
    for (const item of order.items || []) {
      if (item.product) purchasedProductIds.add(String(item.product));
      pricePoints.push(item.price);
    }
  }

  // Find categories from purchased orders
  const orderedProducts = await Product.find({ _id: { $in: Array.from(purchasedProductIds) } });
  for (const p of orderedProducts) {
    categoryScores[p.category] = (categoryScores[p.category] || 0) + 5;
  }

  // Viewed products signals (Weight = 3 per view)
  if (user?.activity?.viewedProducts) {
    for (const vp of user.activity.viewedProducts) {
      if (vp.category) {
        categoryScores[vp.category] = (categoryScores[vp.category] || 0) + 3;
      }
      if (vp.product?.price) {
        pricePoints.push(vp.product.price);
      }
    }
  }

  // Search history signals (Weight = 2 per search)
  if (user?.activity?.searches) {
    for (const s of user.activity.searches) {
      if (s.category) {
        categoryScores[s.category] = (categoryScores[s.category] || 0) + 2;
      }
    }
  }

  // Explored categories signals (Weight = 1 per exploration)
  if (user?.activity?.exploredCategories) {
    for (const ec of user.activity.exploredCategories) {
      categoryScores[ec.category] = (categoryScores[ec.category] || 0) + (ec.count || 1);
    }
  }

  // Sort categories by highest affinity
  const sortedCategories = Object.entries(categoryScores)
    .sort((a, b) => b[1] - a[1])
    .map(([cat]) => cat);

  const topCategory = sortedCategories[0] || 'Electronics';
  const secondaryCategory = sortedCategories[1] || 'Computers & Accessories';

  // Compute average price preference
  let avgPrice = 25000;
  if (pricePoints.length > 0) {
    avgPrice = Math.round(pricePoints.reduce((a, b) => a + b, 0) / pricePoints.length);
  }

  // 2. Fetch Targeted Recommendations
  // Rail 1: Top Picks For You (matching top affinity categories)
  const topPicksFilter = {
    _id: { $nin: Array.from(purchasedProductIds) },
  };
  if (sortedCategories.length > 0) {
    topPicksFilter.category = { $in: sortedCategories.slice(0, 3) };
  }

  const topPicks = await Product.find(topPicksFilter)
    .sort({ rating: -1, numReviews: -1 })
    .limit(6);

  // Rail 2: Because You Explored [Top Category]
  const categoryRecommendations = await Product.find({
    category: topCategory,
    _id: { $nin: [...Array.from(purchasedProductIds), ...topPicks.map((p) => p._id)] },
  })
    .sort({ rating: -1 })
    .limit(4);

  // Rail 3: Trending & Top-Rated Overall
  const trending = await Product.find({
    _id: { $nin: [...topPicks.map((p) => p._id), ...categoryRecommendations.map((p) => p._id)] },
  })
    .sort({ numReviews: -1, rating: -1 })
    .limit(4);

  // User preference metadata
  const userPreferences = {
    topCategories: sortedCategories.slice(0, 4),
    favoriteCategory: topCategory,
    estimatedBudgetPreference: avgPrice,
    recentlyViewed: (user?.activity?.viewedProducts || [])
      .slice(-6)
      .reverse()
      .map((vp) => vp.product)
      .filter(Boolean),
    recentSearches: (user?.activity?.searches || []).slice(-5).reverse(),
  };

  return {
    topPicks,
    categoryRecommendations: {
      category: topCategory,
      products: categoryRecommendations,
    },
    trending,
    userPreferences,
    hasHistory: sortedCategories.length > 0 || userOrders.length > 0,
  };
}
