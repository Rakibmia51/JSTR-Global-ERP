const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // ১. চেক করা হচ্ছে রিকোয়েস্টের Headers-এ Bearer টোকেন আছে কিনা
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // 'Bearer <token>' থেকে শুধু টোকেন স্ট্রিংটি আলাদা করা হচ্ছে
      token = req.headers.authorization.split(' ')[1];

      // ২. টোকেনটি ভেরিফাই করা হচ্ছে
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // ৩. টোকেন থেকে ইউজারের আইডি নিয়ে ডাটাবেজ থেকে ইউজারকে খুঁজে বের করা (পাসওয়ার্ড ছাড়া)
      req.user = await User.findById(decoded.id).select('-password');

      // সবকিছু ঠিক থাকলে পরবর্তী ফাংশন বা কন্ট্রোলারে যাওয়ার অনুমতি দেওয়া হচ্ছে
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Unauthorized, invalid token' });
    }
  }

  // যদি কোনো টোকেন পাঠানোই না হয়
  if (!token) {
    res.status(401).json({ message: 'Unauthorized, no token' });
  }
};

// রোল ভেরিফাই করার মিডলওয়্যার
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // req.user আসছে আগের protect মিডলওয়্যার থেকে
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `No permission, this work is only allowed for ${allowedRoles.join(', ')}` 
      });
    }
    next(); // রোল মিলে গেলে পরের ফাংশনে যাওয়ার অনুমতি দেবে
  };
};

module.exports = { protect, authorizeRoles };
