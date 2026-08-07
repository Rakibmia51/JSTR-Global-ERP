const express = require('express');
const router = express.Router();

// Destructuring the specific middleware from your combined upload file
const { protect, authorizeRoles } = require('../middleware/authMiddleware.js');
const { getSalesWithEmployee , archiveMonthlySales} = require('../controllers/salesController.js');


// --- Routes Definition ---


// ১. Get Sales with Employee Info (ডিলার এবং এমপ্লয়ি ইনফো সহ সেলস ডাটা)
router.get('/', getSalesWithEmployee);


// 🔒 ম্যানুয়াল আর্কাইভ ট্রিগার করার নতুন রুট
router.post('/archive-monthly', archiveMonthlySales);




module.exports = router;
