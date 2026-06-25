const mongoose = require('mongoose');
const User = require('../models/User'); // ইউজার মডেল ইম্পোর্ট করলেন
const Department = require('../models/Department')

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

    // 1️⃣ প্রথমে চেক করুন আপনার ডেটাবেসে কোনো ডিপার্টমেন্ট মডেল আছে কি না এবং সেটি ইমপোর্ট করা হয়েছে কি না
  // এখানে 'Department' কালেকশন থেকে 'Engineering' নামের ডিপার্টমেন্ট খোঁজা হচ্ছে
  let dept = await Department.findOne({ name: 'Engineering' });

  // 2️⃣ যদি ডেটাবেসে কোনো ডিপার্টমেন্ট না থাকে, তবে একটি ডিফল্ট ডিপার্টমেন্ট তৈরি করে নিন
  if (!dept) {
    dept = await Department.create({ name: 'Engineering' }); 
    console.log("✅ 'Engineering' department created automatically.");
  }

    if (!adminExists) {
      console.log('⏳ No admin found! Creating default admin....');
      
      await User.create({
        idNo: 'ADMIN001',
        name: 'Super Admin',
        email: 'admin@example.com',
        password: '123456',
        role: 'admin',
        isActive: true,
        gender: 'Male',
        dateOfBirth: new Date('1990-01-01'),
        nidNo: '1234567890123',
        fatherName: 'Father Name',
        motherName: 'Mother Name',
        mobileNo: '01700000000',
        address: 'Dhaka, Bangladesh',
        district: 'Dhaka',
        thana: 'Mirpur',
        department: dept._id, // ✅ সমাধান: এখানে "Engineering" স্ট্রিংয়ের বদলে ডেটাবেসের ObjectId দেওয়া হয়েছে
        
        nominee: {
          name: 'Nominee Name',
          fatherName: 'Nominee Father',
          motherName: 'Nominee Mother',
          dateOfBirth: new Date('1995-05-12'),
          nidNo: '9876543210123',
          mobileNo: '01800000000', // ✅ সমাধান: মিসিং মোবাইল নাম্বার যোগ করা হয়েছে
          relation: 'Spouse'        // ✅ সমাধান: মিসিং রিলেশন (সম্পর্ক) যোগ করা হয়েছে
        }
      });

      console.log('🎯 Default admin user created successfully! (Email: admin@jstr-erp.com)');
    } else {
      console.log('✅ The default admin user has been successfully created!');
    }
  } catch (error) {
    console.error(`❌ There was a problem creating the default admin: ${error.message}`);
  }
};

module.exports = connectDB;
