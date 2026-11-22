/**
 * =====================================================================
 * Database Seeder Script: Ingest Real Products, Create Admin & User,
 * Seed Sample Orders with Mongoose Populate References
 * =====================================================================
 */
import 'dotenv/config';
import { connectDB, disconnectDB } from './config/db.js';
import Product from './models/Product.js';
import User from './models/User.js';
import Order from './models/Order.js';
import { fetchExternalRealProducts } from './services/productIngestionService.js';
import { generateEmbedding } from './services/ragService.js';

const DEMO_ADMIN = {
  name: 'Admin Manager',
  email: 'smartcartindia99@gmail.com',
  password: 'AdminManager@123',
  role: 'admin',
  addresses: [
    {
      fullName: 'Admin Operations',
      mobileNumber: '9876543210',
      houseNo: 'Suite 401, Tech Park',
      street: 'Sector 62, IT Hub',
      city: 'Mohali',
      state: 'Punjab',
      pinCode: '160062',
      isDefault: true,
    },
  ],
};

const DEMO_USER = {
  name: 'Rahul Sharma',
  email: 'shopper@smartcart.com',
  password: 'shopper1234',
  role: 'user',
  addresses: [
    {
      fullName: 'Rahul Sharma',
      mobileNumber: '9812345678',
      houseNo: 'Flat 302, Green Meadows',
      street: 'Patiala Highway, Urban Estate',
      city: 'Rajpura',
      state: 'Punjab',
      pinCode: '140401',
      isDefault: true,
    },
    {
      fullName: 'Rahul Sharma (Office)',
      mobileNumber: '9812345678',
      houseNo: 'Cabin 12, Block B',
      street: 'Chitkara University Campus',
      city: 'Rajpura',
      state: 'Punjab',
      pinCode: '140401',
      isDefault: false,
    },
  ],
};

async function seedDatabase() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await connectDB();

    console.log('🧹 Clearing previous collections...');
    await Product.deleteMany({});
    await Order.deleteMany({});
    await User.deleteMany({ email: { $in: [DEMO_ADMIN.email, DEMO_USER.email, 'demo@smartcart.com'] } });

    console.log('📥 Fetching real products from external APIs with INR conversion...');
    const productsData = await fetchExternalRealProducts();

    console.log(`🧠 Generating RAG dense vector embeddings for ${productsData.length} products...`);
    for (let i = 0; i < productsData.length; i++) {
      const p = productsData[i];
      const textToEmbed = `${p.title} ${p.brand} ${p.category} ${p.description} ${(p.tags || []).join(' ')}`;
      p.embedding = await generateEmbedding(textToEmbed);
    }

    console.log(`💾 Storing ${productsData.length} products in MongoDB...`);
    const insertedProducts = await Product.insertMany(productsData);
    console.log(`✅ Successfully seeded ${insertedProducts.length} products in INR!`);

    console.log('👤 Creating Authorized Admin and User accounts...');
    const adminUser = await User.create(DEMO_ADMIN);
    const regularUser = await User.create(DEMO_USER);
    console.log(`👑 Admin Account: ${adminUser.email} / admin1234 (Role: admin)`);
    console.log(`🛍️ Customer Account: ${regularUser.email} / shopper1234 (Role: user)`);

    // Create a realistic sample order
    if (insertedProducts.length >= 2) {
      const p1 = insertedProducts[0];
      const p2 = insertedProducts[1];
      const itemsPrice = p1.price + p2.price;
      const taxPrice = Math.round(itemsPrice * 0.18);
      const shippingPrice = 0;
      const totalPrice = itemsPrice + taxPrice;

      const sampleOrder = await Order.create({
        user: regularUser._id,
        items: [
          {
            product: p1._id,
            title: p1.title,
            image: p1.image,
            price: p1.price,
            qty: 1,
          },
          {
            product: p2._id,
            title: p2.title,
            image: p2.image,
            price: p2.price,
            qty: 1,
          },
        ],
        shippingAddress: regularUser.addresses[0],
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
        status: 'Delivered',
        paymentMethod: 'UPI / Razorpay',
        paymentStatus: 'Completed',
        isPaid: true,
        paidAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        paymentResult: {
          id: 'pay_sample_test_123',
          orderId: 'order_sample_test_123',
          status: 'captured',
          email_address: regularUser.email,
        },
      });

      console.log(`📦 Seeded sample past order #${sampleOrder._id} for customer history!`);
    }

    console.log('🎉 Seeding successfully completed!');
    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeder error:', error);
    await disconnectDB().catch(() => {});
    process.exit(1);
  }
}

seedDatabase();
