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
 * Incorporates:
 * 1. Items currently in Cart (High-Intent Signal)
 * 2. Search History Keywords & Queries
 * 3. Viewed Products
 * 4. Past Purchased Orders
 * 5. Explored Categories
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
  const cartProductIds = new Set();
  const categoryScores = {};
  const pricePoints = [];
  const cartCategories = [];

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

  // 1b. Cart items signals (High-Intent Signal: Weight = 12 per item)
  if (user?.cart && user.cart.length > 0) {
    for (const item of user.cart) {
      if (item.product) cartProductIds.add(String(item.product));
      if (item.price) pricePoints.push(item.price);
      if (item.category && item.category !== 'General') {
        categoryScores[item.category] = (categoryScores[item.category] || 0) + 12;
        cartCategories.push(item.category);
      }
    }
  }

  // 1c. Search history signals & keyword extraction (Weight = 8 per search)
  const recentSearches = (user?.activity?.searches || []).slice(-10).reverse();
  for (const s of recentSearches) {
    if (s.category) {
      categoryScores[s.category] = (categoryScores[s.category] || 0) + 6;
    }
    if (s.query) {
      const q = s.query.toLowerCase().trim();
      // Match common shopping keywords to product categories
      if (/(laptop|macbook|notebook|dell|asus|hp|thinkpad|computer|pc|desktop)/i.test(q)) {
        categoryScores['Computers & Accessories'] = (categoryScores['Computers & Accessories'] || 0) + 8;
      } else if (/(phone|mobile|iphone|samsung|oneplus|pixel|smartphone|tablet|ipad)/i.test(q)) {
        categoryScores['Smartphones & Tablets'] = (categoryScores['Smartphones & Tablets'] || 0) + 8;
      } else if (/(headphone|earphone|airpods|earbuds|audio|speaker|watch|smartwatch|band)/i.test(q)) {
        categoryScores['Audio & Wearables'] = (categoryScores['Audio & Wearables'] || 0) + 8;
      } else if (/(gaming|game|controller|ps5|xbox|keyboard|mouse|headset|gpu)/i.test(q)) {
        categoryScores['Gaming & Accessories'] = (categoryScores['Gaming & Accessories'] || 0) + 8;
      } else if (/(kitchen|cooker|kettle|fryer|blender|home|vacuum|cleaner|purifier)/i.test(q)) {
        categoryScores['Home & Kitchen'] = (categoryScores['Home & Kitchen'] || 0) + 8;
      } else if (/(shirt|dress|jeans|shoes|jacket|fashion|apparel|hoodie|clothing)/i.test(q)) {
        categoryScores['Fashion & Apparel'] = (categoryScores['Fashion & Apparel'] || 0) + 8;
      } else if (/(shampoo|serum|cream|skincare|perfume|health|grooming|care)/i.test(q)) {
        categoryScores['Health & Personal Care'] = (categoryScores['Health & Personal Care'] || 0) + 8;
      } else {
        categoryScores['Electronics'] = (categoryScores['Electronics'] || 0) + 4;
      }
    }
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

  // Excluded IDs (do not recommend items already purchased or already sitting in cart)
  const excludedIds = Array.from(new Set([...purchasedProductIds, ...cartProductIds]));

  // 2. Fetch Targeted Recommendations
  // Rail 1: Top Picks For You (matching top affinity categories)
  const topPicksFilter = {
    _id: { $nin: excludedIds },
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
    _id: { $nin: [...excludedIds, ...topPicks.map((p) => p._id)] },
  })
    .sort({ rating: -1 })
    .limit(4);

  // Rail 3: Dedicated Recommendations Based On Cart Items
  let cartRecommendations = null;
  if (user?.cart && user.cart.length > 0) {
    const latestCartItem = user.cart[user.cart.length - 1];
    let cartTargetCategory = latestCartItem.category && latestCartItem.category !== 'General'
      ? latestCartItem.category
      : (cartCategories[0] || topCategory);

    const relatedCartProducts = await Product.find({
      category: cartTargetCategory,
      _id: { $nin: [...excludedIds, ...topPicks.map((p) => p._id), ...categoryRecommendations.map((p) => p._id)] },
    })
      .sort({ rating: -1, numReviews: -1 })
      .limit(4);

    if (relatedCartProducts.length > 0) {
      cartRecommendations = {
        sourceTitle: latestCartItem.title,
        category: cartTargetCategory,
        products: relatedCartProducts,
      };
    }
  }

  // Rail 4: Dedicated Recommendations Based On Search History
  let searchRecommendations = null;
  if (recentSearches.length > 0) {
    const lastSearch = recentSearches[0];
    const searchWords = lastSearch.query
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length >= 2);

    if (searchWords.length > 0) {
      const termRegexes = searchWords.map((w) => new RegExp(w, 'i'));
      const matchingSearchProducts = await Product.find({
        $or: [
          { title: { $in: termRegexes } },
          { tags: { $in: termRegexes } },
          { category: { $in: termRegexes } },
        ],
        _id: {
          $nin: [
            ...excludedIds,
            ...topPicks.map((p) => p._id),
            ...categoryRecommendations.map((p) => p._id),
            ...(cartRecommendations?.products?.map((p) => p._id) || []),
          ],
        },
      })
        .sort({ rating: -1, numReviews: -1 })
        .limit(4);

      if (matchingSearchProducts.length > 0) {
        searchRecommendations = {
          query: lastSearch.query,
          products: matchingSearchProducts,
        };
      }
    }
  }

  // Rail 5: Trending & Top-Rated Overall
  const trending = await Product.find({
    _id: {
      $nin: [
        ...topPicks.map((p) => p._id),
        ...categoryRecommendations.map((p) => p._id),
        ...(cartRecommendations?.products?.map((p) => p._id) || []),
        ...(searchRecommendations?.products?.map((p) => p._id) || []),
      ],
    },
  })
    .sort({ numReviews: -1, rating: -1 })
    .limit(4);

  // User preference metadata
  const userPreferences = {
    topCategories: sortedCategories.slice(0, 4),
    favoriteCategory: topCategory,
    estimatedBudgetPreference: avgPrice,
    cartItemCount: user?.cart?.length || 0,
    recentlyViewed: (user?.activity?.viewedProducts || [])
      .slice(-6)
      .reverse()
      .map((vp) => vp.product)
      .filter(Boolean),
    recentSearches: recentSearches.slice(0, 5),
  };

  return {
    topPicks,
    categoryRecommendations: {
      category: topCategory,
      products: categoryRecommendations,
    },
    cartRecommendations,
    searchRecommendations,
    trending,
    userPreferences,
    hasHistory: sortedCategories.length > 0 || userOrders.length > 0 || (user?.cart?.length || 0) > 0 || recentSearches.length > 0,
  };
}
