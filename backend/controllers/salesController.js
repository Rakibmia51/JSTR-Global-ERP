const User = require('../models/User');
const Dealer = require('../models/Dealer');
const Invoice = require('../models/Invoice');

// controllers/salesController.js
const mongoose = require('mongoose');

 const getSalesWithEmployee = async (req, res) => {
  try {
    // 💡 সমাধান: মঙ্গুজ মডেল এভয়েড করে সরাসরি নেটিভ ড্রাইভার দিয়ে ডাটাবেজ কানেক্ট করা
    // আপনার ডাটাবেজে কালেকশনের নাম 'sales' অথবা 'invoices' হতে পারে। আমরা দুটিই চেক করার ব্যবস্থা রেখেছি:
    const db = mongoose.connection.db;
    
    // ১. প্রথমে 'sales' কালেকশনে খোঁজ করা, না পাওয়া গেলে 'invoices' কালেকশনে খোঁজ করা
    let allSales = await db.collection("sales").find({}).toArray();
    if (!allSales || allSales.length === 0) {
      allSales = await db.collection("invoices").find({}).toArray();
    }

    // ডাটাবেজে যদি তাও না পাওয়া যায় সেফটি মেসেজ
    if (!allSales || allSales.length === 0) {
      return res.status(200).json({ message: "No invoices found in raw collections" });
    }

    // ২. লুপ চালিয়ে ডিলার এবং ডিলারের আন্ডারে থাকা MKT Employee ডাটা মার্চ (Merge) করা
    const enrichedSales = await Promise.all(
      allSales.map(async (sale) => {
        let dealerInfo = null;
        let employeeInfo = null;

        if (sale.dealer) {
          // স্ট্রিং বা অবজেক্ট আইডি উভয় ফরম্যাটেই ডিলার খোঁজা যেন মিস না হয়
          const dealerId = sale.dealer.toString();
          dealerInfo = await Dealer.findOne({ 
            $or: [
              { _id: dealerId },
              { _id: new mongoose.Types.ObjectId(dealerId) }
            ]
          }).lean();
          
          // ডিলার পাওয়া গেলে তার 'referenceIdNo' (MKT-0008) দিয়ে এমপ্লয়ি খোঁজা
          if (dealerInfo && dealerInfo.referenceIdNo) {
            employeeInfo = await User.findOne({ idNo: dealerInfo.referenceIdNo })
              .select("name idNo role department")
              .lean();
          }
        }

        return {
          ...sale,
          _id: sale._id.toString(), // ফ্রন্টএন্ডে ইউনিক কী (Key) এররের জন্য স্ট্রিং কনভার্ট
          dealer: dealerInfo,
          employeeInfo: employeeInfo
        };
      })
    );

    res.status(200).json(enrichedSales);
  } catch (error) {
    console.error("Native Sales Engine Error:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSalesWithEmployee,
};