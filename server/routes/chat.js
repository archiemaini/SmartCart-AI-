import express from 'express';
import Product from '../models/Product.js';

const router = express.Router();


router.post('/', async (req, res, next) => {
  try {
    const { message = '' } = req.body;
    const msg = message.toLowerCase().trim();

    
    let maxPrice = null;
    const priceMatch = msg.match(/(?:under|below|less than|within|budget of)?\s*(?:₹|rs\.?|inr)?\s*(\d{2,7})/i);
    if (priceMatch && (msg.includes('under') || msg.includes('below') || msg.includes('less') || msg.includes('budget') || msg.includes('₹') || msg.includes('rs'))) {
      maxPrice = Number(priceMatch[1]);
    }

    
    let categoryKeyword = '';
    if (msg.includes('laptop') || msg.includes('macbook') || msg.includes('computer')) categoryKeyword = 'Computers & Accessories';
    else if (msg.includes('phone') || msg.includes('mobile') || msg.includes('electronic')) categoryKeyword = 'Electronics';
    else if (msg.includes('headphone') || msg.includes('earbud') || msg.includes('speaker') || msg.includes('audio')) categoryKeyword = 'Electronics';
    else if (msg.includes('beauty') || msg.includes('skin') || msg.includes('perfume') || msg.includes('fragrance') || msg.includes('cream')) categoryKeyword = 'Health & Personal Care';
    else if (msg.includes('kitchen') || msg.includes('food') || msg.includes('grocer') || msg.includes('furniture')) categoryKeyword = 'Home & Kitchen';
    else if (msg.includes('shirt') || msg.includes('dress') || msg.includes('shoe') || msg.includes('watch') || msg.includes('jewel') || msg.includes('wear')) categoryKeyword = 'Fashion & Apparel';
    else if (msg.includes('car') || msg.includes('motor') || msg.includes('bike')) categoryKeyword = 'Car & Motorbike';

   
    const query = {};
    if (categoryKeyword) {
      query.category = categoryKeyword;
    }
    if (maxPrice) {
      query.price = { $lte: maxPrice };
    }

    
    if (!categoryKeyword && msg.length > 2 && !maxPrice) {
      const words = msg.replace(/[^\w\s]/g, '').split(' ').filter(w => w.length > 2 && !['show', 'find', 'best', 'good', 'some', 'the', 'for'].includes(w));
      if (words.length > 0) {
        query.$or = words.map(w => ({ title: new RegExp(w, 'i') }));
      }
    }

    
    let products = await Product.find(query).sort({ rating: -1, price: 1 }).limit(3);

    
    if (products.length === 0 && (categoryKeyword || maxPrice)) {
      products = await Product.find(categoryKeyword ? { category: categoryKeyword } : {}).sort({ rating: -1 }).limit(3);
    }

    
    let reply = '';
    if (products.length > 0) {
      if (maxPrice && categoryKeyword) {
        reply = `I searched our catalogue and found top-rated **${categoryKeyword}** options within your budget under **₹${maxPrice.toLocaleString('en-IN')}**:`;
      } else if (maxPrice) {
        reply = `Here are great value options in stock priced under **₹${maxPrice.toLocaleString('en-IN')}**:`;
      } else if (categoryKeyword) {
        reply = `Here are our best-selling picks in **${categoryKeyword}**:`;
      } else {
        reply = `Based on your request, here are top recommended products from our MongoDB collection:`;
      }
    } else {
      reply = `Hello! I am your **SmartCart Assistant**. I can help you find products based on budget and variety!\n\nTry asking me:\n• *"Show me laptops under ₹60,000"*\n• *"Best wireless headphones under ₹3,000"*\n• *"Health and skincare products under ₹1,500"*`;
    }

    res.json({
      reply,
      products,
      appliedFilters: { category: categoryKeyword || null, maxPrice },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
