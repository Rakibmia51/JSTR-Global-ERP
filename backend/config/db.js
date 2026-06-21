const mongoose = require('mongoose');
const User = require('../models/User'); // ইউজার মডেল ইম্পোর্ট করলেন

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);
    
    // 🛡️ ডিফল্ট অ্যাডমিন ইউজার তৈরি করার ফাংশন কল
    await seedAdminUser();
  } catch (error) {
    console.error(`❌ Database Connection Error: ${error.message}`);
    process.exit(1); 
  }
};

// ডিফল্ট অ্যাডমিন তৈরি করার আসল লজিক
const seedAdminUser = async () => {
  try {
    // ডাটাবেজে অলরেডি কোনো অ্যাডমিন আছে কিনা চেক করা
    const adminExists = await User.findOne({ role: 'admin' });

    if (!adminExists) {
      console.log('⏳ No admin found! Creating default admin....');
      
      await User.create({
        name: 'Super Admin',
        email: 'admin@example.com', // আপনার ডিফল্ট ইমেইল
        password: 'Password123', // আপনার ডিফল্ট পাসওয়ার্ড (এটি অটোমেটিক Bcrypt দিয়ে হ্যাশ হয়ে যাবে)
        role: 'admin',
        isActive: true
      });

      console.log('🎯 ডিফল্ট অ্যাডমিন ইউজার সফলভাবে তৈরি হয়েছে! (Email: admin@jstr-erp.com)');
    } else {
      console.log('✅ The default admin user has been successfully created!');
    }
  } catch (error) {
    console.error(`❌ There was a problem creating the default admin: ${error.message}`);
  }
};

module.exports = connectDB;
