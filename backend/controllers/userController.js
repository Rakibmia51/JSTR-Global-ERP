const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const Department = require('../models/Department');

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const userData = { ...req.body };

    // 💡 সমাধান: ফ্রন্টএন্ড থেকে আসা নমিনি স্ট্রিংটিকে অবজেক্টে রূপান্তর করা হচ্ছে
    if (userData.nominee && typeof userData.nominee === 'string') {
      userData.nominee = JSON.parse(userData.nominee);
    } else if (!userData.nominee) {
      userData.nominee = {};
    }

    // ছবি আপলোড হয়ে থাকলে সেগুলোর পাথ স্কিমা অনুযায়ী বসানো হচ্ছে
    if (req.files) {
      if (req.files.photo && req.files.photo[0]) {
        userData.photo = req.files.photo[0].path;
      }
      if (req.files.nomineePhoto && req.files.nomineePhoto[0]) {
        userData.nominee.photo = req.files.nomineePhoto[0].path;
      }
    }

    // যদি কোনো ছবি আপলোড না করা হয়, তবে ডিফল্ট ছবির নাম সেট করা হচ্ছে
    if (!userData.photo) userData.photo = 'default-profile.png';
    if (!userData.nominee.photo) userData.nominee.photo = 'default-nominee.png';

    // ডেটাবেসে ইউজার তৈরি করা
    const newEmployee = await User.create(userData);

    return res.status(201).json({
      success: true,
      message: 'Employee and Nominee registered successfully!',
      data: newEmployee
    });

  } catch (error) {
    console.error("Mongoose Nominee Validation Failure:", error);
    return res.status(400).json({
      success: false,
      message: error.message // মঙ্গুজ বলবে কোন ফিল্ডটি এখনো মিসিং আছে
    });
  }
};


// @desc    Auth user & get token (Login)
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ১. ইমেইল ও পাসওয়ার্ড ইনপুট দেওয়া হয়েছে কিনা চেক করা
    if (!email || !password) {
      return res.status(400).json({ message: 'please enter email and password' });
    }

    // ২. ইমেইল অনুযায়ী ইউজার ডাটাবেজে আছে কিনা চেক করা
    const user = await User.findOne({ email });

    // ৩. ইউজার থাকলে পাসওয়ার্ড ম্যাচ করানো (User মডেলের matchPassword মেথড কল করা)
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id), // লগইন সফল হলে টোকেন পাঠানো হচ্ছে
        message: 'Login successful!'
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private (টোকেন লাগবে)
const getUserProfile = async (req, res) => {
  try {
    // authMiddleware অলরেডি req.user এর মধ্যে ইউজারের ডাটা সেট করে দিয়েছে
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password'); // পাসওয়ার্ড ছাড়া সব ইউজার নিয়ে আসবে
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// @desc    Get all employees list
// @route   GET /api/users
// @access  Private/Public (আপনার প্রজেক্ট অনুযায়ী)
const getAllEmployees = async (req, res) => {
  try {
    // .populate('department', 'name') দিলে শুধু ডিপার্টমেন্টের আইডি না এসে নামও চলে আসবে
    const employees = await User.find({}).populate('department', 'name').sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};



module.exports = { registerUser, loginUser, getUserProfile, getAllUsers, getAllEmployees };
