const express = require('express');
const router = express.Router();
const { 
  getPayoutRequests, 
  createPayoutRequest, 
  updatePayoutStatus, 
  getMyPayoutHistory,
  getMyCurrentMonthPayoutStatus
} = require('../controllers/payoutController');

// 🔒 আশা করি আপনার অ্যাপে অলরেডি কোনো মিডলওয়্যার আছে, না থাকলে সাধারণ রাউট হিসেবেও কাজ করবে
// const { protect, admin } = require('../middleware/authMiddleware');

// 1️⃣ রাউট ১: সব পে-আউট রিকোয়েস্ট গেট করা (অ্যাডমিন প্যানেলের জন্য)
// এপিআই কল: GET /api/payouts/requests?status=Pending
router.get('/requests', getPayoutRequests);

router.get('/my-current-month-status', getMyCurrentMonthPayoutStatus);

// 2️⃣ রাউট ২: নতুন পে-আউট রিকোয়েস্ট সাবমিট করা (Employee/Dealer প্যানেল থেকে)
// এপিআই কল: POST /api/payouts/create
router.post('/create', createPayoutRequest);

// 3️⃣ 🔒 রাউট ৩: পে-আউট রিকোয়েস্ট এপ্রুভ বা রিজেক্ট করা (শুধুমাত্র অ্যাডমিন)
// এপিআই কল: PUT /api/payouts/action/6a5112a1a1752f...
router.put('/action/:id', updatePayoutStatus);

// এপিআই এন্ডপয়েন্ট: GET /api/payouts/my-history/MKT-0001
router.get('/my-history/:userIdNo', getMyPayoutHistory);




module.exports = router;
