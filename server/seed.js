/**
 * =====================================================================
 * Contributor: ARNAV
 * Role: Product Backend & Storage Engineer
 * Syllabus Sessions: Sessions 27-28 (REST API Consumption) & Session 41 (MongoDB insertMany CRUD)
 * Feature: Public API Ingestion (DummyJSON 190+ Products) & Database Seeding
 * =====================================================================
 */
import 'dotenv/config';
import { connectDB, disconnectDB } from './config/db.js';
import Product from './models/Product.js';
import User from './models/User.js';
import Order from './models/Order.js';

/**
 * Category Normalizer to match retail storefront categories
 */
function mapCategory(rawCat) {
  const cat = String(rawCat || '').toLowerCase();
  if (cat.includes('laptop') || cat.includes('tablet')) return 'Computers & Accessories';
  if (cat.includes('smartphone') || cat.includes('mobile') || cat.includes('electronic')) return 'Electronics';
  if (cat.includes('beauty') || cat.includes('fragrance') || cat.includes('skin')) return 'Health & Personal Care';
  if (cat.includes('kitchen') || cat.includes('grocer') || cat.includes('home-dec') || cat.includes('furniture')) return 'Home & Kitchen';
  if (cat.includes('shirt') || cat.includes('dress') || cat.includes('shoe') || cat.includes('watch') || cat.includes('jewel') || cat.includes('bag') || cat.includes('top') || cat.includes('sunglasses')) return 'Fashion & Apparel';
  if (cat.includes('auto') || cat.includes('motor')) return 'Car & Motorbike';
  if (cat.includes('light')) return 'Home Improvement';
  return 'Office Products';
}

/**
 * Fetch products from Public API (DummyJSON) and convert to INR
 */
export async function fetchPublicProducts() {
  try {
    console.log('[Seed] Fetching 190+ real products from public API (https://dummyjson.com/products)...');
    const res = await fetch('https://dummyjson.com/products?limit=200');
    if (!res.ok) throw new Error(`API responded with status ${res.status}`);
    const data = await res.json();

    const formatted = data.products.map((p) => {
      // Convert USD to INR (e.g. ₹85/USD)
      const inrPrice = Math.round(p.price * 85);
      const discount = p.discountPercentage || Math.floor(Math.random() * 25) + 10;
      const mrp = Math.round(inrPrice / (1 - discount / 100));

      return {
        title: p.title,
        brand: p.brand || p.title.split(' ')[0] || 'Generic',
        category: mapCategory(p.category),
        price: inrPrice,
        mrp: mrp > inrPrice ? mrp : Math.round(inrPrice * 1.25),
        description: p.description,
        image: p.thumbnail || p.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
        rating: Number((p.rating || 4.2).toFixed(1)),
        numReviews: Math.floor(Math.random() * 3000) + 250,
        countInStock: p.stock || 25,
      };
    });

    console.log(`[Seed] Successfully formatted ${formatted.length} products from Public API.`);
    return formatted;
  } catch (err) {
    console.warn(`[Seed] Could not reach external public API (${err.message}). Using backup catalogue.`);
    return null;
  }
}

const demoUser = {
  name: 'Demo Shopper',
  email: 'demo@smartcart.com',
  password: 'demo1234',
  role: 'admin',
};

async function seedData() {
  try {
    await connectDB();

    console.log('[Seed] Clearing existing products and orders in MongoDB...');
    await Product.deleteMany();
    await Order.deleteMany();

    // Fetch from real public API
    let productsToInsert = await fetchPublicProducts();

    if (!productsToInsert || productsToInsert.length === 0) {
      // Fallback in case of network issue
      productsToInsert = [
        {
          title: 'Sony WH-1000XM5 Wireless Headphones',
          brand: 'Sony',
          category: 'Electronics',
          price: 24990,
          mrp: 29990,
          description: 'Industry-leading noise cancellation with two processors and 8 microphones.',
          image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
          rating: 4.8,
          numReviews: 450,
          countInStock: 15,
        },
        {
          title: 'Apple MacBook Air M2 (13-inch)',
          brand: 'Apple',
          category: 'Computers & Accessories',
          price: 94900,
          mrp: 114900,
          description: 'Thin design with fast Apple M2 chip and Liquid Retina display.',
          image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
          rating: 4.9,
          numReviews: 890,
          countInStock: 8,
        },
      ];
    }

    console.log(`[Seed] Inserting ${productsToInsert.length} products into MongoDB...`);
    const createdProducts = await Product.insertMany(productsToInsert);
    console.log(`[Seed] ✅ ${createdProducts.length} products successfully saved in MongoDB!`);

    // Ensure Demo User
    let user = await User.findOne({ email: demoUser.email });
    if (!user) {
      user = await User.create(demoUser);
      console.log(`[Seed] Created demo user: ${demoUser.email} (Password: ${demoUser.password})`);
    } else {
      console.log(`[Seed] Demo user exists: ${demoUser.email}`);
    }

    // Demo Order
    if (createdProducts.length >= 2) {
      await Order.create({
        user: user._id,
        items: [
          {
            product: createdProducts[0]._id,
            title: createdProducts[0].title,
            image: createdProducts[0].image,
            price: createdProducts[0].price,
            qty: 1,
          },
          {
            product: createdProducts[1]._id,
            title: createdProducts[1].title,
            image: createdProducts[1].image,
            price: createdProducts[1].price,
            qty: 2,
          },
        ],
        shippingAddress: {
          fullName: user.name,
          address: 'Chitkara University Campus, Patiala Highway',
          city: 'Rajpura',
          postalCode: '140401',
          country: 'India',
        },
        itemsPrice: createdProducts[0].price + createdProducts[1].price * 2,
        shippingPrice: 0,
        taxPrice: Math.round((createdProducts[0].price + createdProducts[1].price * 2) * 0.18),
        totalPrice: Math.round((createdProducts[0].price + createdProducts[1].price * 2) * 1.18),
        status: 'Confirmed',
      });
      console.log('[Seed] Sample demo order created with Mongoose .populate() references!');
    }

    await disconnectDB();
    console.log('🎉 [Seed] Seeding complete! MongoDB is now loaded with real public API products.');
    process.exit(0);
  } catch (error) {
    console.error('❌ [Seed] Error seeding database:', error.message);
    await disconnectDB().catch(() => {});
    process.exit(1);
  }
}

// Run seeder if executed directly
if (process.argv[1]?.endsWith('seed.js')) {
  seedData();
}