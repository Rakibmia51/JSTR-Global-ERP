// models/Transaction.js
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transactionNo: { type: String, unique: true },
  invoice: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', default: null }, // যদি ইনভয়েসের বিপরীতে পেমেন্ট হয়
  dealer: { type: mongoose.Schema.Types.ObjectId, ref: 'Dealer', default: null },   // যদি ডিলারের লেজার ট্র্যাকিং হয়
  
  type: { 
    type: String, 
    enum: ['Debit', 'Credit'], // Debit = কোম্পানির ক্যাশ আউট/খরচ, Credit = কোম্পানির ক্যাশ ইন/আয়
    required: [true, 'Transaction type is required'] 
  },
  category: { 
    type: String, 
    enum: ['Sales Income', 'Dealer Payment', 'Office Expense', 'Salary', 'Utility Bill', 'Others'], 
    required: true 
  },
  amount: { type: Number, required: [true, 'Amount is required'], min: 0 },
  description: { type: String, trim: true },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

// স্বয়ংক্রিয় ট্রানজেকশন আইডি (যেমন: TXN-171829382)
transactionSchema.pre('save', async function () {
  if (!this.isNew || this.transactionNo) return;
  this.transactionNo = 'TXN-' + Date.now() + Math.floor(Math.random() * 1000);
});

module.exports = mongoose.model('Transaction', transactionSchema);
