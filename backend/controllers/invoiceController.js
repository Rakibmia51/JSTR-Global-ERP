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

const updateInvoice = async (req, res) => {
  try {
    const { id } = req.params; // ইউআরএল থেকে ইনভয়েস আইডি নেওয়া (যেমন: /api/invoices/:id)
    const updatedData = req.body;

    // ১. নতুন করে ডিউ এবং পেমেন্ট স্ট্যাটাস ক্যালকুলেশন
    updatedData.dueAmount = updatedData.grandTotal - updatedData.paidAmount;
    
    if (updatedData.dueAmount === 0) {
      updatedData.paymentStatus = 'Paid';
    } else if (updatedData.paidAmount > 0) {
      updatedData.paymentStatus = 'Partially Paid';
    } else {
      updatedData.paymentStatus = 'Due';
    }

    // ২. ডাটাবেজে ইনভয়েস আপডেট করা ({ new: true } দিলে আপডেটেড ডাটা রিটার্ন করে)
    const updatedInvoice = await Invoice.findByIdAndUpdate(id, updatedData, { new: true });

    if (!updatedInvoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    // ৩. 💡 ট্রানজেকশন হিস্ট্রি (Accounting History) আপডেট করা
    // আগের পুরানো ট্রানজেকশনটি ডিলিট করে দেওয়া হচ্ছে যেন ডাবল এন্ট্রি বা হিস্ট্রি এলোমেলো না হয়
    await Transaction.deleteMany({ invoice: id });

    // এখন নতুন পেইড অ্যামাউন্টের ওপর ভিত্তি করে নতুন ট্রানজেকশন এন্ট্রি তৈরি করা
    if (updatedData.paidAmount > 0) {
      await Transaction.create({
        invoice: updatedInvoice._id,
        dealer: updatedData.dealer || null,
        type: 'Credit', 
        category: 'Sales Income',
        amount: updatedData.paidAmount,
        description: `Updated payment for Invoice No: ${updatedInvoice.invoiceNo} (Edited)`
      });
    }

    res.status(200).json({ success: true, data: updatedInvoice, message: 'Invoice and history updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Backend Controller: getInvoiceById
const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await Invoice.findById(id).populate('dealer'); // আইডি দিয়ে ডাটাবেজে খোঁজা
      // .populate('dealers') 
      // // .populate('items.productName');

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    res.status(200).json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


module.exports = {createInvoice, getNextInvoiceNumber, updateInvoice, getInvoiceById};