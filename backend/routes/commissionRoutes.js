const express = require('express');
const router = express.Router();

// Destructuring the specific middleware from your combined upload file
const { protect, authorizeRoles } = require('../middleware/authMiddleware.js');
const { getCommissionLedger, saveMonthlyLedger } = require('../controllers/commissionController.js');



// --- Routes Definition ---

// 💡 নতুন রাউট: এমপ্লয়ি ও ডিলার কমিশন ড্যাশবোর্ডের জন্য
router.get("/", getCommissionLedger);

// 🔒 অ্যাডমিন প্যানেল থেকে লেজার পার্মানেন্টলি লক/সেভ করার রুট
router.post('/save-monthly', saveMonthlyLedger);




module.exports = router;
