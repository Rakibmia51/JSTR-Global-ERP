// controllers/invoiceController.js
const Invoice = require('../models/Invoice');
const Transaction = require('../models/Transaction');

const createInvoice = async (req, res) => {
  try {
    const data = req.body;
    
    // ১. ডিউ এবং পেমেন্ট স্ট্যাটাস ক্যালকুলেশন
    data.dueAmount = data.grandTotal - data.paidAmount;
    if (data.dueAmount === 0) data.paymentStatus = 'Paid';
    else if (data.paidAmount > 0) data.paymentStatus = 'Partially Paid';
    else data.paymentStatus = 'Due';

    // 💡 ২. ডাটা অবজেক্টের ভেতরেই সরাসরি প্রথম 'Created' লগটি যুক্ত করে দেওয়া
    data.historyLog = [{
      action: 'Created',
      grandTotal: data.grandTotal,
      paidAmount: data.paidAmount,
      dueAmount: data.dueAmount < 0 ? 0 : data.dueAmount,
      note: 'Initial invoice creation',
      updatedBy: 'Admin/Staff', // আপনার Auth অনুযায়ী ডাইনামিক করতে পারেন
      updatedAt: new Date()
    }];

    // ৩. ইনভয়েস তৈরি এবং ডাটাবেজে সেভ করা
    const newInvoice = new Invoice(data);
    await newInvoice.save();

    // ৪. যদি কাস্টমার/ডিলার ক্যাশ পেমেন্ট করে, তবে অ্যাকাউন্টিং ট্রানজেকশনে এন্ট্রি দেওয়া
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
    const { id } = req.params; 
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

    // 💡 ২. হিস্ট্রি লগ অবজেক্ট তৈরি করা
    const newLog = {
      action: 'Updated',
      grandTotal: updatedData.grandTotal,
      paidAmount: updatedData.paidAmount,
      dueAmount: updatedData.dueAmount < 0 ? 0 : updatedData.dueAmount,
      note: updatedData.updateNote || 'Invoice details updated',
      updatedBy: 'Admin/Staff', // আপনার Auth মেকানিজম থাকলে req.user.name বা id দিতে পারেন
      updatedAt: new Date()
    };

    // ৩. ডাটাবেজে ইনভয়েস আপডেট এবং একই সাথে historyLog অ্যারেতে পুশ করা
    const updatedInvoice = await Invoice.findByIdAndUpdate(
      id, 
      { 
        $set: updatedData,       // মেইন ইনভয়েস ডাটা আপডেট করবে
        $push: { historyLog: newLog } // historyLog অ্যারেতে নতুন অবজেক্ট যোগ করবে
      }, 
      { new: true, runValidators: true }
    );

    if (!updatedInvoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    // ৪. ট্রানজেকশন হিস্ট্রি (Accounting History) আপডেট করা
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

    res.status(200).json({ 
      success: true, 
      data: updatedInvoice, 
      message: 'Invoice, accounts transaction, and change logs updated successfully' 
    });
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

// ইনভয়েস নম্বর দিয়ে ডাটা খুঁজে বের করার কন্ট্রোলার
const getInvoiceByInvoiceNo = async (req, res) => {
  try {
    const { invoiceNo } = req.params; // ফ্রন্টএন্ড থেকে পাঠানো ইনভয়েস নম্বর
    
    // ডাটাবেজে invoiceNo দিয়ে খোঁজা এবং ডিলার ও প্রোডাক্টের ডাটা পপুলেট (populate) করা
    const invoice = await Invoice.findOne({ invoiceNo: invoiceNo })
      .populate('dealer')
      .populate('items.productName'); // আপনার স্কিমা অনুযায়ী 'product' বা 'productId' হতে পারে

    if (!invoice) {
      return res.status(404).json({ 
        success: false, 
        message: 'এই নম্বরের কোনো ইনভয়েস খুঁজে পাওয়া যায়নি!' 
      });
    }

    // ডাটা পাওয়া গেলে ফ্রন্টএন্ডে পাঠানো হচ্ছে
    res.status(200).json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// সব ইনভয়েস একসাথে নিয়ে আসার কন্ট্রোলার
const getAllInvoices = async (req, res) => {
  try {
    // ডিলার এবং কে ক্রিয়েট করেছে তাদের নাম পপুলেট করা হচ্ছে
    const invoices = await Invoice.find()
      .populate('dealer', 'name dealerId mobilePhoneNo address') // শুধু প্রয়োজনীয় ফিল্ডগুলো পপুলেট করা হচ্ছে
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 }); // নতুন ইনভয়েস সবার উপরে থাকবে

    res.status(200).json({ success: true, data: invoices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};





module.exports = {createInvoice, getNextInvoiceNumber, updateInvoice, getInvoiceById, getInvoiceByInvoiceNo, getAllInvoices};