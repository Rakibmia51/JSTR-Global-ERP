const express = require('express');
const router = express.Router();

// Destructuring the specific middleware from your combined upload file
const { protect, authorizeRoles } = require('../middleware/authMiddleware.js');
const { getCommissionLedger, saveMonthlyLedger, getMyMonthlyCommissionStatus, getMyMonthlySalarySheet } = require('../controllers/commissionController.js');



// --- Routes Definition ---

// 💡 নতুন রাউট: এমপ্লয়ি ও ডিলার কমিশন ড্যাশবোর্ডের জন্য
router.get("/", getCommissionLedger);

// 🔒 অ্যাডমিন প্যানেল থেকে লেজার পার্মানেন্টলি লক/সেভ করার রুট
router.post('/save-monthly', saveMonthlyLedger);

// 🆕 কর্মচারীর নিজের মাস ভিত্তিক কমিশন এবং পেইড/আনপেইড স্ট্যাটাস গেট করার রুট
router.get('/my-monthly-commission', getMyMonthlyCommissionStatus);

router.get('/my-salary-sheet', getMyMonthlySalarySheet);



module.exports = router;
