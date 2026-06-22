const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
  try {

    //  ইমেজ ফাইলের পাথ বের করা
    const photo = req.files && req.files['photo'] ? req.files['photo'][0].path : 'uploads/default-profile.png';
    const nomineePhoto = req.files && req.files['nomineePhoto'] ? req.files['nomineePhoto'][0].path : 'uploads/default-nominee.png';
   
    // রিকোয়েস্ট বডি থেকে টেক্সট ডাটা নেওয়া
    const {
      idNo,
      refIdNo,
      name,
      email,
      password,
      role,
      department,
      dateOfBirth,
      gender,
      nidNo,
      fatherName,
      motherName,
      spouseName,
      mobileNo,
      address,
      district,
      thana,
      // নমিনি অবজেক্টের ভেতরের ডাটা
      nomineeName,
      nomineeFatherName,
      nomineeMotherName,
      nomineeDateOfBirth,
      nomineeNidNo,
      nomineeRelation,
      nomineeMobileNo,
    } = req.body;

    // ১. মেইন রিকোয়ার্ড ফিল্ডগুলো চেক করা (Validation)
    if (
      !idNo || !name || !email || !password || !department || 
      !dateOfBirth || !gender || !nidNo || !fatherName || !motherName || 
      !mobileNo || !address || !district || !thana
    ) {
      return res.status(400).json({ message: 'All mandatory staff fields are required' });
    }

    // ২. নমিনির রিকোয়ার্ড ফিল্ডগুলো চেক করা (Nominee Validation)
    if (
      !nomineeName || !nomineeFatherName || !nomineeMotherName || 
      !nomineeDateOfBirth || !nomineeNidNo || !nomineeRelation || !nomineeMobileNo
    ) {
      return res.status(400).json({ message: 'All nominee fields are required' });
    }

    // ৩. ডুপ্লিকেট অ্যাকাউন্ট চেক (Email, ID No, NID No ইউনিক হতে হবে)
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const idExists = await User.findOne({ idNo });
    if (idExists) {
      return res.status(400).json({ message: 'User with this ID Number already exists' });
    }

    const nidExists = await User.findOne({ nidNo });
    if (nidExists) {
      return res.status(400).json({ message: 'User with this NID Number already exists' });
    }

    // ৪. নতুন ইউজার অবজেক্ট তৈরি এবং ডাটাবেজে সেভ
    const user = await User.create({
      idNo,
      refIdNo,
      name,
      email,
      password,
      role,
      department, // Department ObjectId অথবা String (আপনার চয়েস অনুযায়ী)
      dateOfBirth,
      gender,
      nidNo,
      fatherName,
      motherName,
      spouseName,
      mobileNo,
      address,
      district,
      thana,
      photo,
      // স্ট্রাকচার্ড নমিনি অবজেক্ট
      nominee: {
        name: nomineeName,
        fatherName: nomineeFatherName,
        motherName: nomineeMotherName,
        dateOfBirth: nomineeDateOfBirth,
        nidNo: nomineeNidNo,
        relation: nomineeRelation,
        mobileNo: nomineeMobileNo,
        photo: nomineePhoto
      }
    });

    // ৫. রেসপন্স পাঠানো
    if (user) {
      res.status(201).json({
        success: true,
        message: 'User registered successfully!',
        data: {
          _id: user._id,
          idNo: user.idNo,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department
        }
      });
    } else {
      res.status(400).json({ message: 'Invalid user data provided' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
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


module.exports = { registerUser, loginUser, getUserProfile, getAllUsers };
