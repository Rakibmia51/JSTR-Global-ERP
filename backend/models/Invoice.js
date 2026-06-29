// models/Invoice.js
const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceNo: { type: String, unique: true, trim: true },
  
  // কার নামে ইনভয়েস হচ্ছে (Dealer অথবা সাধারণ Customer)
  dealer: { type: mongoose.Schema.Types.ObjectId, ref: 'Dealer', default: null },
  customerName: { type: String, trim: true },
  customerMobile: { type: String, trim: true },

  // প্রোডাক্টের তালিকা
  items: [{
    productName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true }
  }],

  // হিসাব-নিকাশ
  subTotal: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0, min: 0 },
  tax: { type: Number, default: 0, min: 0 },
  grandTotal: { type: Number, required: true, min: 0 },
  
  // পেমেন্ট ইনফো
  paidAmount: { type: Number, default: 0, min: 0 },
  dueAmount: { type: Number, required: true, min: 0 },
  paymentStatus: { 
    type: String, 
    enum: ['Paid', 'Partially Paid', 'Due'], 
    default: 'Due' 
  },
  paymentMethod: { 
    type: String, 
    enum: ['Cash', 'Bank Transfer', 'Mobile Banking', 'Bkash', 'Nagad'], 
    default: 'Cash' 
  },
  
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // কোন কর্মচারী ইনভয়েসটি বানালো
}, { timestamps: true });

// স্বয়ংক্রিয় ইনভয়েস নম্বর জেনারেশন মিডলওয়্যার
invoiceSchema.pre('save', async function () {
  if (!this.isNew || this.invoiceNo) return;

  try {
    const currentYear = new Date().getFullYear();
    const prefix = 'INV';
    
    const idPattern = new RegExp(`^${prefix}-${currentYear}-`);
    const lastInv = await mongoose.model('Invoice').findOne({ invoiceNo: idPattern }, { invoiceNo: 1 }, { sort: { invoiceNo: -1 } });

    let nextSerial = 1;
    if (lastInv && lastInv.invoiceNo) {
      const parts = lastInv.invoiceNo.split('-');
      nextSerial = parseInt(parts[parts.length - 1], 10) + 1;
    }

    this.invoiceNo = `${prefix}-${currentYear}-${String(nextSerial).padStart(5, '0')}`;
  } catch (error) {
    throw error;
  }
});

module.exports = mongoose.model('Invoice', invoiceSchema);
