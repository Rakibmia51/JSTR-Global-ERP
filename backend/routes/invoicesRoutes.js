const express = require('express');
const router = express.Router();

// Destructuring the specific middleware from your combined upload file
const { protect, authorizeRoles } = require('../middleware/authMiddleware.js');
const { createInvoice, getNextInvoiceNumber, updateInvoice, getInvoiceById, getInvoiceByInvoiceNo, getAllInvoices } = require('../controllers/invoiceController.js');


// --- Routes Definition ---
router.post('/', createInvoice);

// ১. Get Next Invoice Number (নেক্সট ইনভয়েস নাম্বার জেনারেট করা)
router.get('/next-number', getNextInvoiceNumber);
// 💡 নিয়ম: এটি অবশ্যই মঙ্গোডিবি আইডির (/:id) রাউটের উপরে থাকবে
router.get('/invoice-no/:invoiceNo', getInvoiceByInvoiceNo);

// ২. ইনভয়েস আপডেট করা
router.put('/:id', updateInvoice);

router.get('/:id', getInvoiceById);
router.get('/', getAllInvoices);



module.exports = router;
