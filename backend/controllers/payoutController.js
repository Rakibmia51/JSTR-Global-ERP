const Payout = require('../models/Payout');
const MonthlyLedger = require('../models/MonthlyLedger');

// 1️⃣ সব পে-আউট রিকোয়েস্ট গেট করা (Filter by Status)
const getPayoutRequests = async (req, res) => {
  try {
    const { status } = req.query; // Pending, Approved, Rejected
    const query = status ? { status } : {};
    
    const payouts = await Payout.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: payouts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2️⃣ নতুন পে-আউট রিকোয়েস্ট সাবমিট করা
const createPayoutRequest = async (req, res) => {
  try {
    const { userIdNo, name, userType, amount, year, month, paymentMethod, accountDetails } = req.body;

    // অলরেডি এই মাস এবং বছরের জন্য পেমেন্ট রিকোয়েস্ট প্রসেসড কিনা চেক করা
    const existing = await Payout.findOne({ userIdNo, year, month, status: { $in: ['Pending', 'Approved'] } });
    if (existing) {
      return res.status(400).json({ success: false, message: "Payout already requested or processed for this month!" });
    }

    const newPayout = new Payout({
      userIdNo, name, userType, amount, year, month, paymentMethod, accountDetails
    });

    await newPayout.save();
    res.status(201).json({ success: true, message: "Payout request submitted successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3️⃣ 🔒 অ্যাডমিন অনুমোদন ইঞ্জিন (Approve/Reject Payout)
const updatePayoutStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, transactionId, note, adminName } = req.body; // status = 'Approved' বা 'Rejected'

    const payout = await Payout.findById(id);
    if (!payout) return res.status(404).json({ success: false, message: "Request not found" });
    if (payout.status !== 'Pending') return res.status(400).json({ success: false, message: "Already processed" });

    payout.status = status;
    payout.note = note || '';
    payout.approvedBy = adminName;
    payout.approvedAt = new Date();

    if (status === 'Approved') {
      payout.transactionId = transactionId || 'CASH-PAID';
    }

    await payout.save();
    res.status(200).json({ success: true, message: `Payout request successfully ${status.toLowerCase()}!` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



// 4️⃣ ইউজারের নিজস্ব উইথড্র হিস্ট্রি গেট করা
const getMyPayoutHistory = async (req, res) => {
  try {
    const { userIdNo } = req.params; // ইউজার আইডি প্যারামস থেকে নেওয়া হবে
    
    // ডাটাবেজ থেকে এই ইউজারের সব রিকোয়েস্ট ডেট ক্রমানুসারে (সর্বশেষটি আগে) নিয়ে আসা
    const history = await Payout.find({ userIdNo }).sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// controllers/payoutController.js এর ভেতরে ইউজারের কারেন্ট মাসের পেমেন্ট স্ট্যাটাস চেক রুট
const getMyCurrentMonthPayoutStatus = async (req, res) => {
  try {
    const { userIdNo, year, month } = req.query;

    if (!userIdNo || !year || !month) {
      return res.status(400).json({ success: false, message: "Missing query parameters" });
    }

    // এই মাস এবং বছরে ইউজারের কোনো Approved বা Pending পে-আউট রেকর্ড আছে কিনা খোঁজা
    const payoutRecord = await Payout.findOne({ 
      userIdNo, 
      year: parseInt(year), 
      month: parseInt(month) 
    });

    res.status(200).json({
      success: true,
      hasRecord: !!payoutRecord,
      status: payoutRecord ? payoutRecord.status : 'None',
      approvedAmount: payoutRecord && payoutRecord.status === 'Approved' ? payoutRecord.amount : 0
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



module.exports = { getPayoutRequests, createPayoutRequest, updatePayoutStatus, getMyPayoutHistory, getMyCurrentMonthPayoutStatus };
