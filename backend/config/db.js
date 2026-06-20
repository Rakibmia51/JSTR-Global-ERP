const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // ডাটাবেজ কানেক্ট করার চেষ্টা করছে
    const conn = await mongoose.connect(process.env.MONGO_URI);
    
    console.log(`✅ MongoDB Connected Successfully`);
  } catch (error) {
    console.error(`❌ Database Connection Error: ${error.message}`);
    // কানেকশন ফেইল করলে সার্ভার বন্ধ করে দেবে
    process.exit(1); 
  }
};

module.exports = connectDB;
