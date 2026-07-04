// controllers/invoiceController.js
const Invoice = require('../models/Invoice');
const Transaction = require('../models/Transaction');

const createInvoice = async (req, res) => {
  try {
    const data = req.body;
    
    // ১. ডিউ ক্যালকুলেশন
    data.dueAmount = data.grandTotal - data.paidAmount;
    if(data.dueAmount === 0) data.paymentStatus = 'Paid';
    else if(data.paidAmount > 0) data.paymentStatus = 'Partially Paid';
    else data.paymentStatus = 'Due';

    // ২. ইনভয়েস তৈরি করা
    const newInvoice = new Invoice(data);
    await newInvoice.save();

    // ৩. 💡 যদি কাস্টমার/ডিলার ক্যাশ পেমেন্ট করে, তবে অ্যাকাউন্টিং ট্রানজেকশনে এন্ট্রি দেওয়া
    if (data.paidAmount > 0) {
      await Transaction.create({
        invoice: newInvoice._id,
        dealer: data.dealer || null,
        type: 'Credit', // কোম্পানিতে টাকা ঢুকলো
        category: 'Sales Income',
        amount: data.paidAmount,
        description: `Received payment for Invoice No: ${newInvoice.invoiceNo}`
      });
    }

    res.status(201).json({ success: true, data: newInvoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {createInvoice}