const express = require('express');
const router = express.Router();

// Destructuring the specific middleware from your combined upload file
const { protect, authorizeRoles } = require('../middleware/authMiddleware.js');
const { createInvoice, getNextInvoiceNumber } = require('../controllers/invoiceController.js');


// --- Routes Definition ---
router.post('/', createInvoice);

// ১. Get Next Invoice Number (নেক্সট ইনভয়েস নাম্বার জেনারেট করা)
router.get('/next-number', getNextInvoiceNumber);

// router.get('/', getDealers);

// // ২. নির্দিষ্ট ডিলারের প্রোফাইল দেখা
// router.get('/:id', viewDealer);

// // ৩. ডিলার আপডেট করা (নতুন ছবি আপলোড করার সুযোগসহ)
// router.put('/:id', dealerUpload, updateDealer);

// // ৪. ডিলার ডিলিট করা
// router.delete('/:id', deleteDealer);


module.exports = router;
