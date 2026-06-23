const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile, getAllUsers, getAllEmployees } = require('../controllers/userController');
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
router.get('/all', getAllEmployees);


module.exports = router;
