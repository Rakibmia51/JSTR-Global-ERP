const express = require('express');
const router = express.Router();
const {getAccountStatement} = require('../controllers/accountController');

// (অপশনাল) আপনার অথেন্টিকেশন মিডলওয়্যার থাকলে এখানে কল করতে পারেন
// const { protect } = require('../middleware/authMiddleware');

// 🚀 Route mapping for Account Statement Ledger
router.get('/statement', getAccountStatement);

module.exports = router;
