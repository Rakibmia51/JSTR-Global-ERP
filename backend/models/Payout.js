const mongoose = require('mongoose');

const PayoutSchema = new mongoose.Schema({
  userIdNo: { type: String, required: true }, // MKT-0001 বা DLR-0047
  name: { type: String, required: true },
  userType: { type: String, enum: ['Employee', 'Dealer'], required: true },
  
  amount: { type: Number, required: true, min: 1 },
  year: { type: Number, required: true },
  month: { type: Number, required: true },
  
  paymentMethod: { 
    type: String, 
    enum: ['Bank Transfer', 'Bkash', 'Nagad', 'Cash'], 
    required: true 
  },
  accountDetails: { type: String, required: true }, // বিকাশ নাম্বার বা ব্যাংক অ্যাকাউন্ট ডিটেইলস
  
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected'], 
    default: 'Pending' 
  },
  transactionId: { type: String, default: '' }, // পেমেন্ট করার পর ট্রানজেকশন আইডি
  note: { type: String, default: '' },
  approvedBy: { type: String, default: '' }, // কোন অ্যাডমিন অনুমোদন করলো
  approvedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Payout', PayoutSchema);
