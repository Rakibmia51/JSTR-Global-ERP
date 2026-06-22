const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile, getAllUsers } = require('../controllers/userController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const cpUpload = require('../middleware/uploadMiddleware'); // মাল্টার মিডলওয়্যার


// রেজিস্ট্রেশন এন্ডপয়েন্ট
router.post('/register', cpUpload, registerUser);

// লগইন এন্ডপয়েন্ট
router.post('/login', loginUser);

// প্রাইভেট বা সুরক্ষিত রাউট (মাঝখানে protect মিডলওয়্যার ব্যবহার করা হয়েছে)
router.get('/profile', protect, getUserProfile);

// এই রাউটটি শুধু 'admin' বা 'manager' অ্যাক্সেস করতে পারবে
router.get('/', protect, authorizeRoles('admin', 'manager'), getAllUsers);


// @desc    Seed a dummy user for testing
// @route   POST /api/users/seed-dummy
// @access  Public
const User = require('../models/User');
router.post('/seed-dummy', async (req, res) => {
  try {
    // টেস্ট করার জন্য ১টি ইউনিক আইডি এবং ইমেইল জেনারেট করার জন্য র‍্যান্ডম নম্বর ব্যবহার করা হয়েছে
    const randomNum = Math.floor(Math.random() * 10000);

    const dummyUser = {
      idNo: `EMP-2026-${randomNum}`,
      refIdNo: "REF-5544",
      name: "Jon Doe",
      email: `jondoe_${randomNum}@example.com`,
      password: "password123", // এটি মডেলের .pre('save') মিডলওয়্যার দিয়ে অটো হ্যাশ (Hash) হয়ে যাবে
      role: "employee",
      department: "65df2d308fbc8d32b1a11111", // এখানে আপনার ডাটাবেজের যেকোনো ১টি Department ObjectId বসিয়ে দিন
      dateOfBirth: new Date("1996-04-12"),
      gender: "Male",
      nidNo: `NID-${randomNum}-${Date.now().toString().slice(-5)}`,
      fatherName: "Senior Doe",
      motherName: "Mary Doe",
      spouseName: "Jane Doe",
      mobileNo: "01700000000",
      photo: "uploads/default-profile.png", // ডামি ফাইলের পাথ
      address: "123 Tech Street, Sector 10",
      district: "Dhaka",
      thana: "Uttara",
      nominee: {
        name: "Jane Doe",
        fatherName: "Nominee Father",
        motherName: "Nominee Mother",
        dateOfBirth: new Date("1998-08-22"),
        nidNo: `NOM-NID-${randomNum}`,
        relation: "Wife",
        mobileNo: "01900000000",
        photo: "uploads/default-nominee.png"
      }
    };

    const createdUser = await User.create(dummyUser);

    res.status(201).json({
      success: true,
      message: "Dummy user registered successfully!",
      user: {
        _id: createdUser._id,
        idNo: createdUser.idNo,
        name: createdUser.name,
        email: createdUser.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to seed dummy user", error: error.message });
  }
});

module.exports = router;
