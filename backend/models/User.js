const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // bcryptjs ইম্পোর্ট করলেন

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'] },
    email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true },
    password: { type: String, required: [true, 'Password is required'], minlength: [6, 'Password must be at least 6 characters long'] },
    role: { type: String, enum: ['admin', 'boardMember', 'manager', 'employee', 'dealer'], default: 'employee' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// পাসওয়ার্ড এনক্রিপ্ট করার মিডলওয়্যার (ডাটাবেজে সেভ হওয়ার আগে রান হবে)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// লগইন এর সময় পাসওয়ার্ড ম্যাচ করার মেথড
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
