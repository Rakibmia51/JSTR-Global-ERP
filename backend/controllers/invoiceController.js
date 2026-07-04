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

const getNextInvoiceNumber = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const prefix = 'INV';
    
    // Regular Expression to match current year's invoices (e.g., ^INV-2026-)
    const idPattern = new RegExp(`^${prefix}-${currentYear}-`);
    
    // Find the absolute latest invoice created in the current year
    const lastInv = await Invoice.findOne(
      { invoiceNo: idPattern }, 
      { invoiceNo: 1 }, 
      { sort: { invoiceNo: -1 } }
    );

    let nextSerial = 1;
    if (lastInv && lastInv.invoiceNo) {
      const parts = lastInv.invoiceNo.split('-');
      // Extract the serial number from the end and add 1
      nextSerial = parseInt(parts[parts.length - 1], 10) + 1;
    }

    // Format the next invoice number with 5 digits padding (e.g., INV-2026-00001)
    const nextInvoiceNo = `${prefix}-${currentYear}-${String(nextSerial).padStart(5, '0')}`;

    res.status(200).json({ 
      success: true, 
      nextInvoiceNo 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate next invoice number', 
      error: error.message 
    });
  }
};


module.exports = {createInvoice, getNextInvoiceNumber}