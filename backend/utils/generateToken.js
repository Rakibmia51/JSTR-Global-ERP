const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  // ইউজারের আইডি দিয়ে একটি টোকেন তৈরি করা হচ্ছে যা ৩০ দিন কাজ করবে
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

module.exports = generateToken;
