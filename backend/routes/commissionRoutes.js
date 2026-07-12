const express = require('express');
const router = express.Router();

// Destructuring the specific middleware from your combined upload file
const { protect, authorizeRoles } = require('../middleware/authMiddleware.js');
const { getCommissionLedger } = require('../controllers/commissionController.js');



// --- Routes Definition ---

// 💡 নতুন রাউট: এমপ্লয়ি ও ডিলার কমিশন ড্যাশবোর্ডের জন্য
router.get("/", getCommissionLedger);






module.exports = router;
