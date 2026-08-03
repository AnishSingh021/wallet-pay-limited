/**
 * Seed script — creates an admin user for initial testing.
 * Run with: node src/seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const { generateReferralCode } = require('./utils/referralCode');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log(`ℹ️  Admin already exists: ${existingAdmin.email}`);
      await mongoose.disconnect();
      return;
    }

    const admin = new User({
      email: 'admin@walletpay.com',
      passwordHash: 'Admin@123', // Will be hashed by pre-save hook
      displayName: 'System Admin',
      phone: '+91-9999999999',
      role: 'admin',
      referralCode: generateReferralCode(),
      isApproved: true,
      isActive: true,
    });

    await admin.save();
    console.log(`\n🔐 Admin user created:`);
    console.log(`   ├─ Email:    admin@walletpay.com`);
    console.log(`   ├─ Password: Admin@123`);
    console.log(`   └─ Role:     admin\n`);

    await mongoose.disconnect();
    console.log('✅ Done. MongoDB disconnected.');
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
};

seedAdmin();
