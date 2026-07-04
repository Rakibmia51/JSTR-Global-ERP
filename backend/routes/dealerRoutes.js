const express = require('express');
const router = express.Router();

// Destructuring the specific middleware from your combined upload file
const { protect, authorizeRoles } = require('../middleware/authMiddleware.js');
const dealerUpload  = require('../middleware/dealerUploadMiddleware.js'); 
const { registerDealer, getDealers, viewDealer, updateDealer, deleteDealer, getDealerByCode } = require('../controllers/dealerController.js');

// --- Routes Definition ---

// ১. Register Dealer (ডিলার রেজিস্ট্রেশন)
router.post('/register',dealerUpload, registerDealer);

// ২. Get All Dealers (ডিলারের লিস্ট)
router.get('/', getDealers);

// ৩. নির্দিষ্ট ডিলারের প্রোফাইল দেখা
router.get('/:id', viewDealer);

// ৪. ডিলার আপডেট করা (নতুন ছবি আপলোড করার সুযোগসহ)
router.put('/:id', dealerUpload, updateDealer);

// ৫. ডিলার ডিলিট করা
router.delete('/:id', deleteDealer);

// ৬. ডিলারের কোড দিয়ে ডিলারের নাম ও আইডি রিটার্ন করা
router.get('/code/:code', getDealerByCode);


module.exports = router;
