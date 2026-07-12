const express = require('express');
const router = express.Router();

// Destructuring the specific middleware from your combined upload file
const { protect, authorizeRoles } = require('../middleware/authMiddleware.js');
const { getSalesWithEmployee } = require('../controllers/salesController.js');


// --- Routes Definition ---


// ১. Get Sales with Employee Info (ডিলার এবং এমপ্লয়ি ইনফো সহ সেলস ডাটা)
router.get('/', getSalesWithEmployee);






module.exports = router;
