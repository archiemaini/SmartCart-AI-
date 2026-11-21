/**
 * =====================================================================
 * Personalized Product Recommendations API (Feature 4)
 * Returns tailored product recommendations based on search history,
 * viewed products, order history, and explored categories
 * =====================================================================
 */
import express from 'express';
import { optionalAuth, protect } from '../middleware/auth.js';
import {
  getPersonalizedRecommendations,
  recordUserSearch,
  recordProductView,
  recordCategoryExplored,
} from '../services/recommendationService.js';

const router = express.Router();

/**
 * @route   GET /api/recommendations
 * @desc    Get personalized product recommendations for the user
 * @access  Public (Tailored if authenticated, trending if guest)
 */
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const userId = req.user?._id || null;
    const recommendations = await getPersonalizedRecommendations(userId);
    res.json(recommendations);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/recommendations/track
 * @desc    Explicitly record client-side user activity for personalization
 * @access  Private
 */
router.post('/track', protect, async (req, res, next) => {
  try {
    const { action, query, productId, category } = req.body;
    const userId = req.user._id;

    if (action === 'search' && query) {
      await recordUserSearch(userId, query, category);
    } else if (action === 'view' && productId) {
      await recordProductView(userId, productId);
    } else if (action === 'category' && category) {
      await recordCategoryExplored(userId, category);
    }

    res.json({ status: 'ok', tracked: action });
  } catch (error) {
    next(error);
  }
});

export default router;
