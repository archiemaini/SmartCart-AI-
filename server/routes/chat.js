/**
 * =====================================================================
 * Intelligent AI Shopping Assistant Chatbot Endpoint (Feature 3)
 * Full Access to MongoDB Product Database via Vector Embeddings & RAG
 * =====================================================================
 */
import express from 'express';
import { processChatQuery } from '../services/ragService.js';

const router = express.Router();

/**
 * @route   POST /api/chat
 * @desc    RAG Shopping Assistant Chatbot with dense vector similarity & LLM reasoning
 * @access  Public
 */
router.post('/', async (req, res, next) => {
  try {
    const { message = '', history = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const response = await processChatQuery(message.trim(), history);

    res.json(response);
  } catch (error) {
    next(error);
  }
});

export default router;
