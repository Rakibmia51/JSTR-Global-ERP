
const mongoose = require('mongoose');
const Invoice = require('../models/Invoice');
const Dealer = require('../models/Dealer');
const User = require('../models/User');
const MonthlyLedger = require('../models/MonthlyLedger'); // মডেল ইম্পোর্ট করুন


// //---5th Version of Commission Controller with Auto Positioning and Commission Calculation (Final)---//
// // JSTR-Global-ERP Commission Controller
// // ১. ডিলার কমিশন ক্যালকুলেটর (Rule 8)
// const calculateDealerCommission = (amount) => {
//   if (amount < 50000) return amount * 0.05; // 50k এর নিচে 5%
//   return amount * 0.07; // 50k এর উপরে 7%
// };

// // পজিশন অনুযায়ী ফিক্সড বেস স্ল্যাব রেট (টোটাল ২৪% এর ভাগ)
// const POSITION_SLABS = {
//   "BOM": 0.24,
//   "ED": 0.24,
//   "NSM": 0.23,
//   "SM": 0.22,
//   "SDSM": 0.21,
//   "DSM": 0.20,
//   "RSM": 0.175,
//   "AM": 0.15,
//   "SALES REPRESENTATIVE": 0
// };

// // ২. অটোমেটিক পজিশন কোয়ালিফিকেশন ইঞ্জিন (Top to Bottom সিকোয়েন্স)
// // Old Auto Position Determination Logic (Commented Out)
// const autoDeterminePosition = (totalSales, subNodesSummary = []) => {
//   const amCount = subNodesSummary.filter(sub => sub.autoPosition === "AM").length;
//   const rsmCount = subNodesSummary.filter(sub => sub.autoPosition === "RSM").length;
//   const dsmCount = subNodesSummary.filter(sub => sub.autoPosition === "DSM").length;
//   const nsmCount = subNodesSummary.filter(sub => sub.autoPosition === "NSM").length;
//   const edCount = subNodesSummary.filter(sub => sub.autoPosition === "ED").length;

//   if (totalSales >= 6400000 && edCount >= 2) return "BOM";
//   if (totalSales >= 3200000 && nsmCount >= 4) return "ED";
//   if (totalSales >= 800000 && dsmCount >= 4) return "NSM";
//   if (totalSales >= 600000 && dsmCount >= 3) return "SM";
//   if (totalSales >= 400000 && dsmCount >= 2 ) return "SDSM";
//   if (totalSales >= 200000 && rsmCount >= 2 && amCount >= 2) return "DSM";
//   if (totalSales >= 75000 && amCount >= 3) return "RSM";
//   if (totalSales >= 25000) return "AM";

//   return "Sales Representative";
// };


// // ৩. বোনাস ও ইনসেনটিভ ক্যালকুলেটর
// // Old Bonus Calculation Logic (Commented Out)
// const calculateBonuses = (position, totalSales, subNodesSummary = []) => {
//   const amCount = subNodesSummary.filter(sub => sub.autoPosition === "AM").length;
//   const rsmCount = subNodesSummary.filter(sub => sub.autoPosition === "RSM").length;
//   const dsmCount = subNodesSummary.filter(sub => sub.autoPosition === "DSM").length;
//   const nsmCount = subNodesSummary.filter(sub => sub.autoPosition === "NSM").length;
//   const edCount = subNodesSummary.filter(sub => sub.autoPosition === "ED").length;

//   let salesShare = 0;
//   let bestPerf = 0;
//   const p = position?.toUpperCase();

//   if (p === "RSM" && amCount >= 3 && totalSales >= 100000) {
//     salesShare = totalSales * 0.01;
//     bestPerf = totalSales * 0.01;
//   }
//    else if (p === "DSM" && rsmCount >= 1 && amCount >= 2 && totalSales >= 150000) {
//     salesShare = totalSales * 0.05;
//     bestPerf = totalSales * 0.005;
//   } else if (p === "SDSM" && dsmCount >= 2 && totalSales >= 200000) {
//     salesShare = totalSales * 0.01;
//     bestPerf = totalSales * 0.005;
//   } else if (p === "SM" && dsmCount >= 3 && totalSales >= 300000) {
//     salesShare = totalSales * 0.005;
//     bestPerf = totalSales * 0.0025;
//   } else if (p === "NSM" && dsmCount >= 4 && totalSales >= 400000) {
//     salesShare = totalSales * 0.01;
//     bestPerf = totalSales * 0.0025;
//   } else if (p === "ED" && nsmCount >= 4 && totalSales >= 1600000) {
//     salesShare = totalSales * 0.005;
//     bestPerf = totalSales * 0.0025;
//   } else if (p === "BOM" && edCount >= 2 && totalSales >= 3200000) {
//     salesShare = totalSales * 0.01;
//     bestPerf = totalSales * 0.0025;
//   }

//   return { salesShareBonus: salesShare, performanceBonus: bestPerf };
// };



// // ৪. মেইন এপিআই কন্ট্রোলার ফাংশন
// const getCommissionLedger = async (req, res) => {
//   try {
//     const db = mongoose.connection.db;
    
//     let allSales = await db.collection("sales").find({}).toArray();
//     if (!allSales || allSales.length === 0) {
//       allSales = await db.collection("invoices").find({}).toArray();
//     }

//     const dealers = await db.collection("dealers").find({}).toArray();
//     const users = await db.collection("users").find({ idNo: { $regex: /^MKT/i } }).toArray();

//     const userSalesMap = {};
//     users.forEach(u => {
//       userSalesMap[u.idNo] = { 
//         ...u, 
//         directSales: 0, 
//         totalSalesVolume: 0, 
//         autoPosition: "Sales Representative",
//         baseCommission: 0,
//         salesShareBonus: 0,
//         performanceBonus: 0
//       };
//     });

//     // ডিলার সেলস ডিস্ট্রিবিউশন
//     dealers.forEach(dlr => {
//       const dlrSales = allSales.filter(s => s.dealer?.toString() === dlr._id.toString());
//       const totalAmount = dlrSales.reduce((sum, s) => sum + (s.grandTotal || 0), 0);
      
//       if (dlr.referenceIdNo && userSalesMap[dlr.referenceIdNo]) {
//         userSalesMap[dlr.referenceIdNo].directSales += totalAmount;
//         userSalesMap[dlr.referenceIdNo].totalSalesVolume += totalAmount;
//       }
//     });

//     // পাস ১: নিচ থেকে উপরে সবার পজিশন এবং টোটাল টিম সেলস ভলিউম বের করা (Bottom-Up)
//     const determineHierarchySpecs = (currentIdNo) => {
//       const currentEmployee = userSalesMap[currentIdNo];
//       if (!currentEmployee) return;

//       const children = users.filter(u => u.refIdNo === currentIdNo);
//       children.forEach(child => determineHierarchySpecs(child.idNo));

//       const subNodesSummary = children.map(child => ({
//         idNo: child.idNo,
//         autoPosition: userSalesMap[child.idNo]?.autoPosition || "Sales Representative"
//       }));

//       const teamSalesSum = children.reduce((sum, child) => sum + (userSalesMap[child.idNo]?.totalSalesVolume || 0), 0);
//       currentEmployee.totalSalesVolume += teamSalesSum;
//       currentEmployee.autoPosition = autoDeterminePosition(currentEmployee.totalSalesVolume, subNodesSummary);
//     };

//     users.forEach(user => {
//       if (user.refIdNo === "0" || !user.refIdNo) {
//         determineHierarchySpecs(user.idNo);
//       }
//     });

//     // পাস ২: ডাইনামিক গ্যাপ কমিশন (Gap Commission Engine)
//     dealers.forEach(dlr => {
//       const dlrSales = allSales.filter(s => s.dealer?.toString() === dlr._id.toString());
//       const totalInvoiceAmount = dlrSales.reduce((sum, s) => sum + (s.grandTotal || 0), 0);
      
//       if (totalInvoiceAmount <= 0 || !dlr.referenceIdNo) return;

//       let currentIdNo = dlr.referenceIdNo;
//       let distributedRateSoFar = 0;

//       while (currentIdNo && currentIdNo !== "0") {
//         const empNode = userSalesMap[currentIdNo];
//         if (!empNode) break;

//         const myPositionRate = POSITION_SLABS[empNode.autoPosition?.toUpperCase()] || 0;

//         if (myPositionRate > distributedRateSoFar) {
//           const gapRate = myPositionRate - distributedRateSoFar;
//           const gapCommissionAmount = totalInvoiceAmount * gapRate;
          
//           empNode.baseCommission += gapCommissionAmount;
//           distributedRateSoFar = myPositionRate; 
//         }
//         currentIdNo = empNode.refIdNo; 
//       }
//     });

//     // পাস ৩: বোনাসসমূহ ক্যালকুলেট করা এবং কোয়ালিফাইড লিস্ট ফিল্টারিং
//     const qualifiedEmployees = [];
//     users.forEach(user => {
//       const nodeData = userSalesMap[user.idNo];
//       const children = users.filter(u => u.refIdNo === user.idNo).map(sub => ({
//         idNo: sub.idNo,
//         autoPosition: userSalesMap[sub.idNo]?.autoPosition || "Sales Representative"
//       }));

//       const bonuses = calculateBonuses(nodeData.autoPosition, nodeData.totalSalesVolume, children);
//       const totalEarned = (nodeData.baseCommission || 0) + bonuses.salesShareBonus + bonuses.performanceBonus;

//       if (totalEarned > 0 || nodeData.totalSalesVolume >= 25000) {
//         qualifiedEmployees.push({
//           _id: user._id.toString(),
//           name: user.name,
//           idNo: user.idNo,
//           role: user.role,
//           position: nodeData.autoPosition,
//           totalSalesAchieved: nodeData.totalSalesVolume,
//           baseCommission: Math.round(nodeData.baseCommission),
//           salesShareBonus: Math.round(bonuses.salesShareBonus),
//           performanceBonus: Math.round(bonuses.performanceBonus),
//           totalEarned: Math.round(totalEarned)
//         });
//       }
//     });

//     const qualifiedDealers = dealers.map(dlr => {
//       const dlrSales = allSales.filter(s => s.dealer?.toString() === dlr._id.toString());
//       const totalAmount = dlrSales.reduce((sum, s) => sum + (s.grandTotal || 0), 0);
//       return {
//         _id: dlr._id.toString(),
//         name: dlr.name,
//         dealerId: dlr.dealerId,
//         totalSales: totalAmount,
//         commission: calculateDealerCommission(totalAmount)
//       };
//     }).filter(d => d.totalSales > 0);

//     // গ্র্যান্ড পে-আউট সামারি টোটাল কাউন্ট হিসাব
//     const totalEmployeePayout = qualifiedEmployees.reduce((sum, e) => sum + e.totalEarned, 0);
//     const totalDealerPayout = qualifiedDealers.reduce((sum, d) => sum + d.commission, 0);
//     const grandPayoutTotal = totalEmployeePayout + totalDealerPayout;

//     res.status(200).json({
//       summary: {
//         totalEmployeePayout: Math.round(totalEmployeePayout),
//         totalDealerPayout: Math.round(totalDealerPayout),
//         grandPayoutTotal: Math.round(grandPayoutTotal)
//       },
//       dealers: qualifiedDealers,
//       employees: qualifiedEmployees
//     });

//   } catch (error) {
//     console.error("Advanced Gap Commission Engine Error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// module.exports = {
//   getCommissionLedger
// };


// ERGON System: Updated Auto Position Determination Logic
// //--- 6th Version of Commission Controller with Auto Positioning and Commission Calculation (Final)---//
// // ১. ডিলার কমিশন ক্যালকুলেটর (Rule 8)
// const calculateDealerCommission = (amount) => {
//   if (amount < 50000) return amount * 0.05; // 50k এর নিচে 5%
//   return amount * 0.07; // 50k এর উপরে 7%
// };

// // পজিশন অনুযায়ী ফিক্সড বেস স্ল্যাব রেট (টোটাল ২৪% এর ভাগ)
// const POSITION_SLABS = {
//   "ED": 0.24,
//   "NSM": 0.23,
//   "SM": 0.22,
//   "SDSM": 0.21,
//   "DSM": 0.20,
//   "SALES REPRESENTATIVE": 0
// };


// // ERGON System: Updated Auto Position Determination Logic
// const autoDeterminePosition = (totalSales, subNodesSummary = []) => {
//   const dsmCount = subNodesSummary.filter(sub => sub.autoPosition === "DSM").length;
//   const nsmCount = subNodesSummary.filter(sub => sub.autoPosition === "NSM").length;

//   if (totalSales >= 2600000 && nsmCount >= 4 && dsmCount >= 2) return "ED";
//   if (totalSales >= 600000 && dsmCount >= 6) return "NSM";
//   if (totalSales >= 400000 && dsmCount >= 4) return "SM";
//   if (totalSales >= 200000 && dsmCount >= 2) return "SDSM"; // If DSM count is 2 line the final Result will be SDSM & this id DSM bill 
//   if (totalSales >= 100000) return "DSM";

//   return "Sales Representative";
// };

// // ৩. বোনাস ও ইনসেনটিভ ক্যালকুলেটর

// // ERGON System: Updated Bonus Calculation Logic
// const calculateBonuses = (position, totalSales, subNodesSummary = []) => {
//   const amCount = subNodesSummary.filter(sub => sub.autoPosition === "AM").length;
//   const rsmCount = subNodesSummary.filter(sub => sub.autoPosition === "RSM").length;
//   const dsmCount = subNodesSummary.filter(sub => sub.autoPosition === "DSM").length;
//   const nsmCount = subNodesSummary.filter(sub => sub.autoPosition === "NSM").length;

//   let salesShare = 0;
//   let bestPerf = 0;
//   const p = position?.toUpperCase();

 
//     if (p === "DSM" && totalSales >= 100000) {
//     salesShare = totalSales * 0.07;
//     bestPerf = totalSales * 0.000;
//   } else if (p === "SDSM" && dsmCount >= 2 && totalSales >= 200000) {
//     salesShare = totalSales * 0.0150;
//     bestPerf = totalSales * 0.000;
//   } else if (p === "SM" && dsmCount >= 4 && totalSales >= 400000) {
//     salesShare = totalSales * 0.0150;
//     bestPerf = totalSales * 0.0000;
//   } else if (p === "NSM" && dsmCount >= 6 && totalSales >= 600000) {
//     salesShare = totalSales * 0.0450;
//     bestPerf = totalSales * 0.0000;
//   } else if (p === "SNSM" && dsmCount >= 4 && nsmCount >= 2 && totalSales >= 1600000) {
//     salesShare = totalSales * 0.0150;
//     bestPerf = totalSales * 0.0000;
//   } else if (p === "ED" && nsmCount >= 4 && dsmCount >= 2 && totalSales >= 2600000) {
//     salesShare = totalSales * 0.03;
//     bestPerf = totalSales * 0.0000;
//   }

//   return { salesShareBonus: salesShare, performanceBonus: bestPerf };
// };

// // ৪. মেইন এপিআই কন্ট্রোলার ফাংশন
// const getCommissionLedger = async (req, res) => {
//   try {
//     const db = mongoose.connection.db;
    
//     let allSales = await db.collection("sales").find({}).toArray();
//     if (!allSales || allSales.length === 0) {
//       allSales = await db.collection("invoices").find({}).toArray();
//     }

//     const dealers = await db.collection("dealers").find({}).toArray();
//     const users = await db.collection("users").find({ idNo: { $regex: /^MKT/i } }).toArray();

//     const userSalesMap = {};
//     users.forEach(u => {
//       userSalesMap[u.idNo] = { 
//         ...u, 
//         directSales: 0, 
//         totalSalesVolume: 0, 
//         autoPosition: "Sales Representative",
//         baseCommission: 0,
//         salesShareBonus: 0,
//         performanceBonus: 0
//       };
//     });

//     // ডিলার সেলস ডিস্ট্রিবিউশন
//     dealers.forEach(dlr => {
//       const dlrSales = allSales.filter(s => s.dealer?.toString() === dlr._id.toString());
//       const totalAmount = dlrSales.reduce((sum, s) => sum + (s.grandTotal || 0), 0);
      
//       if (dlr.referenceIdNo && userSalesMap[dlr.referenceIdNo]) {
//         userSalesMap[dlr.referenceIdNo].directSales += totalAmount;
//         userSalesMap[dlr.referenceIdNo].totalSalesVolume += totalAmount;
//       }
//     });

//     // পাস ১: নিচ থেকে উপরে সবার পজিশন এবং টোটাল টিম সেলস ভলিউম বের করা (Bottom-Up)
//     const determineHierarchySpecs = (currentIdNo) => {
//       const currentEmployee = userSalesMap[currentIdNo];
//       if (!currentEmployee) return;

//       const children = users.filter(u => u.refIdNo === currentIdNo);
//       children.forEach(child => determineHierarchySpecs(child.idNo));

//       const subNodesSummary = children.map(child => ({
//         idNo: child.idNo,
//         autoPosition: userSalesMap[child.idNo]?.autoPosition || "Sales Representative"
//       }));

//       const teamSalesSum = children.reduce((sum, child) => sum + (userSalesMap[child.idNo]?.totalSalesVolume || 0), 0);
//       currentEmployee.totalSalesVolume += teamSalesSum;
//       currentEmployee.autoPosition = autoDeterminePosition(currentEmployee.totalSalesVolume, subNodesSummary);
//     };

//     users.forEach(user => {
//       if (user.refIdNo === "0" || !user.refIdNo) {
//         determineHierarchySpecs(user.idNo);
//       }
//     });

//     // পাস ২: ডাইনামিক গ্যাপ কমিশন (Gap Commission Engine)
//     dealers.forEach(dlr => {
//       const dlrSales = allSales.filter(s => s.dealer?.toString() === dlr._id.toString());
//       const totalInvoiceAmount = dlrSales.reduce((sum, s) => sum + (s.grandTotal || 0), 0);
      
//       if (totalInvoiceAmount <= 0 || !dlr.referenceIdNo) return;

//       let currentIdNo = dlr.referenceIdNo;
//       let distributedRateSoFar = 0;

//       while (currentIdNo && currentIdNo !== "0") {
//         const empNode = userSalesMap[currentIdNo];
//         if (!empNode) break;

//         const myPositionRate = POSITION_SLABS[empNode.autoPosition?.toUpperCase()] || 0;

//         if (myPositionRate > distributedRateSoFar) {
//           const gapRate = myPositionRate - distributedRateSoFar;
//           const gapCommissionAmount = totalInvoiceAmount * gapRate;
          
//           empNode.baseCommission += gapCommissionAmount;
//           distributedRateSoFar = myPositionRate; 
//         }
//         currentIdNo = empNode.refIdNo; 
//       }
//     });

//     // পাস ৩: বোনাসসমূহ ক্যালকুলেট করা এবং কোয়ালিফাইড লিস্ট ফিল্টারিং
//     const qualifiedEmployees = [];
//     users.forEach(user => {
//       const nodeData = userSalesMap[user.idNo];
//       const children = users.filter(u => u.refIdNo === user.idNo).map(sub => ({
//         idNo: sub.idNo,
//         autoPosition: userSalesMap[sub.idNo]?.autoPosition || "Sales Representative"
//       }));

//       const bonuses = calculateBonuses(nodeData.autoPosition, nodeData.totalSalesVolume, children);
//       const totalEarned = (nodeData.baseCommission || 0) + bonuses.salesShareBonus + bonuses.performanceBonus;

//       if (totalEarned > 0 || nodeData.totalSalesVolume >= 100000) {
//         qualifiedEmployees.push({
//           _id: user._id.toString(),
//           name: user.name,
//           idNo: user.idNo,
//           role: user.role,
//           position: nodeData.autoPosition,
//           totalSalesAchieved: nodeData.totalSalesVolume,
//           baseCommission: Math.round(nodeData.baseCommission),
//           salesShareBonus: Math.round(bonuses.salesShareBonus),
//           performanceBonus: Math.round(bonuses.performanceBonus),
//           totalEarned: Math.round(totalEarned)
//         });
//       }
//     });

//     const qualifiedDealers = dealers.map(dlr => {
//       const dlrSales = allSales.filter(s => s.dealer?.toString() === dlr._id.toString());
//       const totalAmount = dlrSales.reduce((sum, s) => sum + (s.grandTotal || 0), 0);
//       return {
//         _id: dlr._id.toString(),
//         name: dlr.name,
//         dealerId: dlr.dealerId,
//         totalSales: totalAmount,
//         commission: calculateDealerCommission(totalAmount)
//       };
//     }).filter(d => d.totalSales > 0);

//     // গ্র্যান্ড পে-আউট সামারি টোটাল কাউন্ট হিসাব
//     const totalEmployeePayout = qualifiedEmployees.reduce((sum, e) => sum + e.totalEarned, 0);
//     const totalDealerPayout = qualifiedDealers.reduce((sum, d) => sum + d.commission, 0);
//     const grandPayoutTotal = totalEmployeePayout + totalDealerPayout;

//     res.status(200).json({
//       summary: {
//         totalEmployeePayout: Math.round(totalEmployeePayout),
//         totalDealerPayout: Math.round(totalDealerPayout),
//         grandPayoutTotal: Math.round(grandPayoutTotal)
//       },
//       dealers: qualifiedDealers,
//       employees: qualifiedEmployees
//     });

//   } catch (error) {
//     console.error("Advanced Gap Commission Engine Error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// module.exports = {
//   getCommissionLedger
// };



// ==========================================
// ১. পজিশন অনুযায়ী ফিক্সড বেস স্ল্যাব রেট (Rule 8)
// ==========================================




// // 7th version
// const POSITION_SLABS = {
//   "BOM": 0.24, "ED": 0.24, "NSM": 0.23, "SM": 0.22,
//   "SDSM": 0.21, "DSM": 0.20, "RSM": 0.175, "AM": 0.15,
//   "SALES REPRESENTATIVE": 0
// };

// const RANK_MAP = {
//   "SALES REPRESENTATIVE": 0, "AM": 1, "RSM": 2, "DSM": 3, 
//   "SDSM": 4, "SM": 5, "NSM": 6, "ED": 7, "BOM": 8
// };

// // গ্লোবাল কোম্পানি সেলস শেয়ার পার্সেন্টেজ কনফিগারেশন
// const SALES_SHARE_CONFIG = {
//   "BOM": 0.01,   // 1%
//   "ED": 0.005,   // 0.5%
//   "NSM": 0.01,   // 1%
//   "SM": 0.005,   // 0.5%
//   "SDSM": 0.01,  // 1%
//   "DSM": 0.05,   // 5%
//   "RSM": 0.01,   // 1%  🛑 ০% (কোনো ভাগ হবে না)
//   "AM": 0        // 0%  🛑 ০% (কোনো ভাগ হবে না)
// };

// // গ্লোবাল কোম্পানি পুলে অংশ নেওয়ার যোগ্য পজিশনসমূহ
// const ELIGIBLE_POOL_POSITIONS = ["RSM", "DSM", "SDSM", "SM", "NSM", "ED", "BOM"];

// // ==========================================
// // ২. ডিলার কমিশন ক্যালকুলেটর (মিনিমাম ৫০০০ টাকা সেলস শর্তসহ)
// // ==========================================
// const calculateDealerCommission = (amount) => {
//   if (amount < 5000) return 0;             
//   if (amount < 50000) return amount * 0.05; 
//   return amount * 0.07;                     
// };

// // ==========================================
// // ৩. অটোমেটিক পজিশন কোয়ালিফিকেশন ইঞ্জিন
// // ==========================================
// const autoDeterminePosition = (totalSales, subNodesSummary = []) => {
//   const counts = { AM: 0, RSM: 0, DSM: 0, NSM: 0, ED: 0, BOM: 0 };
  
//   subNodesSummary.forEach(sub => {
//     const pos = (sub.autoPosition || "").toUpperCase().trim();
//     if (counts[pos] !== undefined) counts[pos]++;
//   });

//   const countAtLeast = (targetPos) => {
//     return Object.keys(counts).reduce((total, pos) => {
//       return RANK_MAP[pos] >= RANK_MAP[targetPos] ? total + counts[pos] : total;
//     }, 0);
//   };

//   if (totalSales >= 6400000 && countAtLeast("ED") >= 2) return "BOM";
//   if (totalSales >= 3200000 && countAtLeast("NSM") >= 4) return "ED";
//   if (totalSales >= 800000 && countAtLeast("DSM") >= 4) return "NSM";
//   if (totalSales >= 600000 && countAtLeast("DSM") >= 3) return "SM";
//   if (totalSales >= 400000 && countAtLeast("DSM") >= 2) return "SDSM";
  
//   if (totalSales >= 200000 && countAtLeast("RSM") >= 2 && countAtLeast("AM") >= 2) {
//     return "DSM";
//   }
  
//   if (totalSales >= 75000 && countAtLeast("AM") >= 3) return "RSM";
//   if (totalSales >= 25000) return "AM";

//   return "SALES REPRESENTATIVE";
// };

// // ==========================================
// // ৪. নতুন গ্লোবাল কোম্পানি সেলস শেয়ার এবং পারফরম্যান্স বোনাস হেল্পার
// // ==========================================
// const checkSelfQualificationOnly = (position, totalSales, subNodesSummary = []) => {
//   const currentPos = (position || "").trim().toUpperCase();
  
//   const counts = { AM: 0, RSM: 0, DSM: 0, NSM: 0, ED: 0, BOM: 0 };
//   subNodesSummary.forEach(sub => {
//     const pos = (sub.autoPosition || "").toUpperCase().trim();
//     if (counts[pos] !== undefined) counts[pos]++;
//   });

//   const countAtLeast = (targetPos) => {
//     return Object.keys(counts).reduce((total, pos) => {
//       return RANK_MAP[pos] >= RANK_MAP[targetPos] ? total + counts[pos] : total;
//     }, 0);
//   };

//   let qualifies = false;
//   let performanceBonusRate = 0;

//   switch (currentPos) {
//     case "RSM":
//       if ((totalSales >= 75000 && countAtLeast("AM") >= 3) || totalSales >= 75000) 
//           { qualifies = true; performanceBonusRate = 0.01; }
//       break;
//     case "DSM":
//       if ((totalSales >= 100000 && countAtLeast("RSM") >= 1 && countAtLeast("AM") >= 2) || totalSales >= 100000) 
//           { qualifies = true; performanceBonusRate = 0.005; }
//       break;
//     case "SDSM":
//       if (totalSales >= 200000 && countAtLeast("DSM") >= 2) 
//           { qualifies = true; performanceBonusRate = 0.005; }
//       break;
//     case "SM":
//       if (totalSales >= 300000 && countAtLeast("DSM") >= 3) 
//           { qualifies = true; performanceBonusRate = 0.0025; }
//       break;
//     case "NSM":
//       if (totalSales >= 400000 && countAtLeast("DSM") >= 4) 
//           { qualifies = true; performanceBonusRate = 0.0025; }
//       break;
//     case "ED":
//       if (totalSales >= 1600000 && countAtLeast("NSM") >= 4) 
//           { qualifies = true; performanceBonusRate = 0.0025; }
//       break;
//     case "BOM":
//       if (totalSales >= 3200000 && countAtLeast("ED") >= 2) 
//           { qualifies = true; performanceBonusRate = 0.0025; }
//       break;
//     default:
//       break;
//   }

//   return { qualifies, performanceBonusRate };
// };

// // ==========================================
// // রিকার্সিভ ফাংশন: নিচ থেকে উপরে সেলস পুশ ও ক্যালকুলেশন
// // ==========================================
// const processHierarchySpecs = (currentIdNo) => {
//   const currentEmployee = userSalesMap[currentIdNo];
//   if (!currentEmployee) return;

//   const childrenIds = childMap[currentIdNo] || [];

//   // ১. আগে নিচের ডাউনলাইনের হিসাব শেষ হবে (Post-order)
//   childrenIds.forEach(childId => processHierarchySpecs(childId));

//   const subNodesSummary = [];
//   let teamSalesSumTotal = 0;
//   let teamSalesSumMonth = 0;

//   childrenIds.forEach(childId => {
//     const childData = userSalesMap[childId];
//     if (childData) {
//       subNodesSummary.push({
//         idNo: childId,
//         autoPosition: childData.autoPosition || "Sales Representative"
//       });
//       teamSalesSumTotal += childData.totalSalesVolume;
//       teamSalesSumMonth += childData.thisMonthSalesVolume;
//     }
//   });

//   // ডাউনলাইনের সেলস আপলাইনের নিজস্ব ডাইরেক্ট সেলসের সাথে যোগ হচ্ছে
//   currentEmployee.totalSalesVolume += teamSalesSumTotal;
//   currentEmployee.thisMonthSalesVolume += teamSalesSumMonth;

//   // ২. লাইফটাইম সেলস (totalSalesVolume) দিয়ে স্থায়ী পজিশন সেট করা হলো
//   currentEmployee.autoPosition = autoDeterminePosition(currentEmployee.totalSalesVolume, subNodesSummary);

//   // 💥 ৩. পজিশন সেট হওয়ার পর আপনার 'checkSelfQualificationOnly' ফাংশনটি কল করা হলো
//   // এখানে totalSales এর জায়গায় চলতি মাসের সেলস (thisMonthSalesVolume) পাস করা হয়েছে
//   const qualification = checkSelfQualificationOnly(
//     currentEmployee.autoPosition,         // সেট হওয়া কারেন্ট পজিশন
//     currentEmployee.thisMonthSalesVolume,   // মান্থলি কোয়ালিফিকেশনের জন্য চলতি মাসের সেলস
//     subNodesSummary                       // ডাউনলাইন মেম্বারদের লিস্ট
//   );

//   // ৪. ফলাফলের ডেটা মেমোরি ম্যাপে সেভ করা হলো
//   currentEmployee.isMonthlyQualified = qualification.qualifies;
//   currentEmployee.performanceBonusRate = qualification.performanceBonusRate;
  
//   // চলতি মাসের অর্জিত বোনাসের টাকা (thisMonthSales * Bonus Rate)
//   currentEmployee.thisMonthBonusEarned = currentEmployee.thisMonthSalesVolume * qualification.performanceBonusRate;
// };

// // ==========================================
// // ৫. মেইন এপিআই কন্ট্রোলার ফাংশন (Advanced Global Shared Pulled Engine)
// // ==========================================
// const getCommissionLedger = async (req, res) => {
//   try {
//     const db = mongoose.connection.db;
    
//     const currentYear = parseInt(req.query.year) || new Date().getFullYear();
//     const currentMonth = parseInt(req.query.month) || (new Date().getMonth() + 1);

//     const startDate = new Date(currentYear, currentMonth - 1, 1);
//     const endDate = new Date(currentYear, currentMonth, 1);

//     const salesQuery = { createdAt: { $gte: startDate, $lt: endDate } };

//     let allSales = await db.collection("sales").find(salesQuery).toArray();
//     if (!allSales || allSales.length === 0) {
//       allSales = await db.collection("invoices").find(salesQuery).toArray();
//     }

//     // 🌟 মোট কোম্পানি সেলস ভলিউম বের করা (গ্লোবাল শেয়ারের জন্য)
//     const totalCompanySalesAmount = allSales.reduce((sum, s) => sum + (s.grandTotal || 0), 0);

//     const dealers = await db.collection("dealers").find({}).toArray();
//     const users = await db.collection("users").find({ idNo: { $regex: /^MKT/i } }).toArray();

//     const userSalesMap = {};
//     const parentToChildrenMap = {}; 

//     users.forEach(u => {
//       userSalesMap[u.idNo] = { 
//         ...u, 
//         directSales: 0, 
//         totalSalesVolume: 0, 
//         autoPosition: "SALES REPRESENTATIVE",
//         baseCommission: 0,
//         selfQualifiesForBonus: false,
//         performanceBonusRate: 0,
//         earnedPools: [] // কোন কোন পুলে ইউজার ভাগের টাকা পাবেন তার ট্র্যাক
//       };
      
//       const parentId = u.refIdNo || "0";
//       if (!parentToChildrenMap[parentId]) parentToChildrenMap[parentId] = [];
//       parentToChildrenMap[parentId].push(u);
//     });

//     const dealerSalesSumMap = {};
//     allSales.forEach(s => {
//       if (s.dealer) {
//         const dealerStr = s.dealer.toString();
//         dealerSalesSumMap[dealerStr] = (dealerSalesSumMap[dealerStr] || 0) + (s.grandTotal || 0);
//       }
//     });

//     dealers.forEach(dlr => {
//       const totalAmount = dealerSalesSumMap[dlr._id.toString()] || 0;
//       if (totalAmount > 0 && dlr.referenceIdNo && userSalesMap[dlr.referenceIdNo]) {
//         userSalesMap[dlr.referenceIdNo].directSales += totalAmount;
//         userSalesMap[dlr.referenceIdNo].totalSalesVolume += totalAmount;
//       }
//     });

//     // পাস ১: রিকার্সিভ বটম-আপ পজিশন ইঞ্জিন
//     const determineHierarchySpecs = (currentIdNo) => {
//       const currentEmployee = userSalesMap[currentIdNo];
//       if (!currentEmployee) return;

//       const children = parentToChildrenMap[currentIdNo] || [];
//       children.forEach(child => determineHierarchySpecs(child.idNo));

//       const subNodesSummary = children.map(child => ({
//         idNo: child.idNo,
//         autoPosition: userSalesMap[child.idNo]?.autoPosition || "SALES REPRESENTATIVE"
//       }));

//       const teamSalesSum = children.reduce((sum, child) => sum + (userSalesMap[child.idNo]?.totalSalesVolume || 0), 0);
      
//       currentEmployee.totalSalesVolume += teamSalesSum;
//       currentEmployee.autoPosition = autoDeterminePosition(currentEmployee.totalSalesVolume, subNodesSummary);

//       // নিজের পজিশন অনুযায়ী প্রাথমিক বোনাস যোগ্যতা নির্ধারণ
//       const checkBonus = checkSelfQualificationOnly(currentEmployee.autoPosition, currentEmployee.totalSalesVolume, subNodesSummary);
//       currentEmployee.selfQualifiesForBonus = checkBonus.qualifies;
//       currentEmployee.performanceBonusRate = checkBonus.performanceBonusRate;
//     };

//     users.forEach(user => {
//       if (user.refIdNo === "0" || !user.refIdNo) {
//         determineHierarchySpecs(user.idNo);
//       }
//     });

//     // পাস ২: লিনিয়ার ডাইনামিক গ্যাপ কমিশন ক্যালকুলেটর
//     dealers.forEach(dlr => {
//       const totalInvoiceAmount = dealerSalesSumMap[dlr._id.toString()] || 0;
//       if (totalInvoiceAmount <= 0 || !dlr.referenceIdNo) return;

//       let currentIdNo = dlr.referenceIdNo;
//       let distributedRateSoFar = 0;

//       while (currentIdNo && currentIdNo !== "0") {
//         const empNode = userSalesMap[currentIdNo];
//         if (!empNode) break;

//         const myPositionRate = POSITION_SLABS[empNode.autoPosition?.toUpperCase()] || 0;

//         if (myPositionRate > distributedRateSoFar) {
//           const gapRate = myPositionRate - distributedRateSoFar;
//           empNode.baseCommission += totalInvoiceAmount * gapRate;
//           distributedRateSoFar = myPositionRate; 
//         }
//         currentIdNo = empNode.refIdNo; 
//       }
//     });

//     // পাস ৩: 🌟 ওপরের পজিশন কোয়ালিফাই করলে নিচের পজিশন স্বয়ংক্রিয়ভাবে বোনাস পাওয়ার লজিক (Top-Down Override)
//     const applyTopDownBonusQualification = (currentIdNo, parentQualifies = false) => {
//       const currentEmployee = userSalesMap[currentIdNo];
//       if (!currentEmployee) return;

//       // যদি প্যারেন্ট কোয়ালিফাইড থাকে, তবে সে নিজে ফেল করলেও ট্রু (True) হয়ে যাবে
//       if (parentQualifies) {
//         currentEmployee.selfQualifiesForBonus = true;
//       }

//       const children = parentToChildrenMap[currentIdNo] || [];
//       children.forEach(child => {
//         // পাস-ডাউন কন্ডিশন: প্যারেন্ট অথবা নিজে কোয়ালিফাইড থাকলে চাইল্ডকে সিগন্যাল পাঠানো
//         applyTopDownBonusQualification(child.idNo, currentEmployee.selfQualifiesForBonus);
//       });
//     };

//     // টপ-ডাউন প্রসেস শুরু (রুট থেকে নিচের দিকে)
//     if (parentToChildrenMap["0"]) {
//       parentToChildrenMap["0"].forEach(rootUser => applyTopDownBonusQualification(rootUser.idNo, false));
//     }

//   // পাস ৪: ফাইনাল বোনাস ডিস্ট্রিবিউশন এবং কোয়ালিফাইড লিস্ট প্রস্তুত করা
//       // প্রতি পুলে মোট কতজন মেম্বার অংশ নিচ্ছেন তা কাউন্ট করার অবজেক্ট
//     const poolShareCounters = { RSM: 0, DSM: 0, SDSM: 0, SM: 0, NSM: 0, ED: 0, BOM: 0 };

//     users.forEach(user => {
//       const nodeData = userSalesMap[user.idNo];
//       const isQualifiedForBill = nodeData.directSales >= 3000;
//       const myPos = nodeData.autoPosition?.toUpperCase();

//       if (isQualifiedForBill && nodeData.selfQualifiesForBonus && ELIGIBLE_POOL_POSITIONS.includes(myPos)) {
//         const myRankValue = RANK_MAP[myPos];
        
//         ELIGIBLE_POOL_POSITIONS.forEach(poolName => {
//           const poolRankValue = RANK_MAP[poolName];
          
//           if (myPos === "RSM") {
//             // RSM শুধু তার নিজের ১% ফুলেই অংশ পাবে, ওপরের কেউ রোল-ডাউন করে এখানে আসবে না
//             if (poolName === "RSM") {
//               poolShareCounters[poolName]++;
//               nodeData.earnedPools.push(poolName);
//             }
//           } else {
//             // DSM থেকে BOM পর্যন্ত রোল-ডাউন লজিক কার্যকর হবে (তবে তা যেন RSM পুলে না ঢোকে)
//             if (myRankValue >= poolRankValue && poolName !== "RSM") {
//               poolShareCounters[poolName]++;
//               nodeData.earnedPools.push(poolName);
//             }
//           }
//         });
//       }
//     });

//     // ==========================================
//     // পাস ৫: ফাইনাল বোনাস হিসাব ও রেসপন্স এরে প্রস্তুতকরণ
//     // ==========================================
//     const qualifiedEmployees = [];
//     users.forEach(user => {
//       const nodeData = userSalesMap[user.idNo];
//       const isQualifiedForBill = nodeData.directSales >= 3000;

//       let salesShareBonus = 0;
//       let performanceBonus = 0;

//       if (isQualifiedForBill && nodeData.selfQualifiesForBonus) {
//         // ১. প্রতিটি অর্জিত পুলের জন্য (কোম্পানি সেলস * পুল পার্সেন্টেজ) / মোট মেম্বার
//         nodeData.earnedPools.forEach(poolName => {
//           const totalPeopleInThisPool = poolShareCounters[poolName] || 0;
//           if (totalPeopleInThisPool > 0) {
//             const poolPercentage = SALES_SHARE_CONFIG[poolName] || 0;
//             const thisPoolTotalFund = totalCompanySalesAmount * poolPercentage; // কোম্পানি সেলস * আপনার চার্টের %
            
//             salesShareBonus += (thisPoolTotalFund / totalPeopleInThisPool);
//           }
//         });

//         // ২. ব্যক্তিগত টিম সেলস ভলিউম এর ওপর পারফরম্যান্স বোনাস
//         performanceBonus = nodeData.totalSalesVolume * nodeData.performanceBonusRate;
//       }

//       const baseCommission = isQualifiedForBill ? nodeData.baseCommission : 0;
//       const totalEarned = baseCommission + salesShareBonus + performanceBonus;

//       if (totalEarned > 0 || nodeData.totalSalesVolume >= 25000) {
//         qualifiedEmployees.push({
//           _id: user._id.toString(),
//           name: user.name,
//           idNo: user.idNo,
//           role: user.role,
//           position: nodeData.autoPosition,
//           monthlyDirectSales: nodeData.directSales,
//           totalSalesAchieved: nodeData.totalSalesVolume,
//           baseCommission: Math.round(baseCommission),
//           salesShareBonus: Math.round(salesShareBonus), 
//           performanceBonus: Math.round(performanceBonus),
//           totalEarned: Math.round(totalEarned),
//           status: isQualifiedForBill ? "Qualified" : "Disqualified (Sales < 300)"
//         });
//       }
//     });

//     // ডিলার রেসপন্স লুপ
//     const qualifiedDealers = dealers.map(dlr => {
//       const totalAmount = dealerSalesSumMap[dlr._id.toString()] || 0;
//       const commission = calculateDealerCommission(totalAmount);

//       return {
//         _id: dlr._id.toString(),
//         name: dlr.name,
//         dealerId: dlr.dealerId,
//         totalSales: totalAmount,
//         commission: Math.round(commission),
//         status: totalAmount >= 5000 ? "Qualified" : "Disqualified (Sales < 5000)"
//       };
//     }).filter(d => d.totalSales > 0);

//     const totalEmployeePayout = qualifiedEmployees.reduce((sum, e) => sum + e.totalEarned, 0);
//     const totalDealerPayout = qualifiedDealers.reduce((sum, d) => sum + d.commission, 0);

//     res.status(200).json({
//       meta: {
//         filterYear: currentYear,
//         filterMonth: currentMonth,
//         totalCompanySalesThisMonth: totalCompanySalesAmount,
//         poolActiveMembersSummary: poolShareCounters // পুলে মোট কতজন করে মেম্বার টাকা ভাগ পেয়েছে তার সামারি
//       },
//       summary: {
//         totalEmployeePayout,
//         totalDealerPayout,
//         grandPayoutTotal: totalEmployeePayout + totalDealerPayout
//       },
//       dealers: qualifiedDealers,
//       employees: qualifiedEmployees
//     });

//   } catch (error) {
//     console.error("Advanced Dynamic Pool Override Engine Error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// module.exports = {
//   getCommissionLedger
// };







//----------------------------------------------------------------------------------------------------------------------------------------------

// // 8th version

// // ==========================================
// // ১. গ্লোবাল কনফিগারেশন ম্যাপস
// // ==========================================
// const POSITION_SLABS = {
//   "BOM": 0.24, "ED": 0.24, "NSM": 0.23, "SM": 0.22,
//   "SDSM": 0.21, "DSM": 0.20, "RSM": 0.175, "AM": 0.15,
//   "SALES REPRESENTATIVE": 0
// };

// const RANK_MAP = {
//   "SALES REPRESENTATIVE": 0, "AM": 1, "RSM": 2, "DSM": 3, 
//   "SDSM": 4, "SM": 5, "NSM": 6, "ED": 7, "BOM": 8
// };

// const SALES_SHARE_CONFIG = {
//   "BOM": 0.01, "ED": 0.005, "NSM": 0.01, "SM": 0.005,
//   "SDSM": 0.01, "DSM": 0.05, "RSM": 0.01, "AM": 0
// };

// const ELIGIBLE_POOL_POSITIONS = ["RSM", "DSM", "SDSM", "SM", "NSM", "ED", "BOM"];

// // ডিলার কমিশন ক্যালকুলেটর (মিনিমাম ৫০০০ টাকা সেলস শর্তসহ)
// const calculateDealerCommission = (amount) => {
//   if (amount < 5000) return 0;             
//   if (amount < 50000) return amount * 0.05; 
//   return amount * 0.07;                     
// };

// // অটোমেটিক পজিশন কোয়ালিফিকেশন ইঞ্জিন (লাইফটাইম সেলস এবং ডাউনলাইনের ওপর ভিত্তি করে)
// const autoDeterminePosition = (totalSales, subNodesSummary = []) => {
//   const counts = { AM: 0, RSM: 0, DSM: 0, NSM: 0, ED: 0, BOM: 0 };
//   subNodesSummary.forEach(sub => {
//     const pos = (sub.autoPosition || "").toUpperCase().trim();
//     if (counts[pos] !== undefined) counts[pos]++;
//   });

//   const countAtLeast = (targetPos) => {
//     return Object.keys(counts).reduce((total, pos) => {
//       return RANK_MAP[pos] >= RANK_MAP[targetPos] ? total + counts[pos] : total;
//     }, 0);
//   };

//   if (totalSales >= 6400000 && countAtLeast("ED") >= 2) return "BOM";
//   if (totalSales >= 3200000 && countAtLeast("NSM") >= 4) return "ED";
//   if (totalSales >= 800000 && countAtLeast("DSM") >= 4) return "NSM";
//   if (totalSales >= 600000 && countAtLeast("DSM") >= 3) return "SM";
//   if (totalSales >= 400000 && countAtLeast("DSM") >= 2) return "SDSM";
//   if (totalSales >= 200000 && countAtLeast("RSM") >= 2 && countAtLeast("AM") >= 2) return "DSM";
//   if (totalSales >= 75000 && countAtLeast("AM") >= 3) return "RSM";
//   if (totalSales >= 25000) return "AM";

//   return "SALES REPRESENTATIVE";
// };

// // আপনার দেওয়া মান্থলি কোয়ালিফিকেশন হেল্পার ফাংশন
// const checkSelfQualificationOnly = (position, totalSales, subNodesSummary = []) => {
//   const currentPos = (position || "").trim().toUpperCase();
//   const counts = { AM: 0, RSM: 0, DSM: 0, NSM: 0, ED: 0, BOM: 0 };
//   subNodesSummary.forEach(sub => {
//     const pos = (sub.autoPosition || "").toUpperCase().trim();
//     if (counts[pos] !== undefined) counts[pos]++;
//   });

//   const countAtLeast = (targetPos) => {
//     return Object.keys(counts).reduce((total, pos) => {
//       return RANK_MAP[pos] >= RANK_MAP[targetPos] ? total + counts[pos] : total;
//     }, 0);
//   };

//   let qualifies = false;
//   let performanceBonusRate = 0;

//   switch (currentPos) {
//     case "RSM":
//       if ((totalSales >= 75000 && countAtLeast("AM") >= 3) || totalSales >= 75000) 
//           { qualifies = true; performanceBonusRate = 0.01; }
//       break;
//     case "DSM":
//       if ((totalSales >= 100000 && countAtLeast("RSM") >= 1 && countAtLeast("AM") >= 2) || totalSales >= 100000) 
//           { qualifies = true; performanceBonusRate = 0.005; }
//       break;
//     case "SDSM":
//       if (totalSales >= 200000 && countAtLeast("DSM") >= 2) 
//           { qualifies = true; performanceBonusRate = 0.005; }
//       break;
//     case "SM":
//       if (totalSales >= 300000 && countAtLeast("DSM") >= 3) 
//           { qualifies = true; performanceBonusRate = 0.0025; }
//       break;
//     case "NSM":
//       if (totalSales >= 400000 && countAtLeast("DSM") >= 4) 
//           { qualifies = true; performanceBonusRate = 0.0025; }
//       break;
//     case "ED":
//       if (totalSales >= 1600000 && countAtLeast("NSM") >= 4) 
//           { qualifies = true; performanceBonusRate = 0.0025; }
//       break;
//     case "BOM":
//       if (totalSales >= 3200000 && countAtLeast("ED") >= 2) 
//           { qualifies = true; performanceBonusRate = 0.0025; }
//       break;
//     default:
//       break;
//   }
//   return { qualifies, performanceBonusRate };
// };

// // ==========================================
// // মেইন কন্ট্রোল এপিআই ফাংশন
// // ==========================================

//   const processCompanyTreeData = async (req, res) => {
//     try {
//       const db = mongoose.connection.db;
//       // --- STEP 1: ডাটাবেজ থেকে র ডাটা তুলে আনা ---
//      // ১. ডাটাবেজ থেকে সেলস/ইনভয়েস, ডিলার এবং MKT ইউজার তুলে আনা
//     let allSales = await db.collection("invoices").find({}).toArray();
//     if (!allSales || allSales.length === 0) {
//       allSales = await db.collection("sales").find({}).toArray();
//     }

//     const dealers = await db.collection("dealers").find({}).toArray();
//     const users = await db.collection("users").find({ idNo: { $regex: /^MKT/i } }).toArray();

//       const currentDate = new Date();
//       const currentMonth = currentDate.getMonth(); 
//       const currentYear = currentDate.getFullYear(); 

//       const userSalesMap = {};
//       const tree = [];

//       // --- STEP 2: মেমোরি ম্যাপ এবং স্ট্রাকচার তৈরি করা ---
//       users.forEach(u => {
//         userSalesMap[u.idNo] = { 
//           ...u, 
//           _id: u._id.toString(),
//           directSalesTotal: 0,       
//           directSalesThisMonth: 0,   
//           totalSalesVolume: 0,       
//           thisMonthSalesVolume: 0,   
//           autoPosition: "SALES REPRESENTATIVE",
//           position: "SALES REPRESENTATIVE",
//           currentSlabRate: 0,
//           isMonthlyQualified: false,
//           performanceBonusRate: 0,
//           thisMonthBonusEarned: 0,
//           globalPoolShareRate: 0,
//           eligibleForGlobalPool: false,
//           dealerCommissionEarned: 0,
//           generationBonusEarned: 0,
//           children: [] 
//         };
//       });

    
//       // --- STEP 3: ডিলার সেলস এবং কমিশন প্রসেসিং (আর্কাইভড বনাম লাইভ প্রোটেকশন) ---
//       allSales.forEach(sale => {
//         const saleAmount = Number(sale.grandTotal || sale.totalAmount || sale.amount || 0);
//         const saleDate = new Date(sale.date || sale.createdAt);
//         const isCurrentMonth = saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;

//         let targetEmployeeIdNo = null;

//         // ক) যদি ইনভয়েসটি ইতিমধ্যেই মাসের শেষে আর্কাইভ হয়ে থাকে (স্থায়ী স্ন্যাপশট ফার্স্ট)
//         if (sale.isMonthlyArchived && sale.archivedSalesData?.employeeSnapshot?.idNo) {
//           targetEmployeeIdNo = sale.archivedSalesData.employeeSnapshot.idNo;
//         } 
//         // খ) যদি ইনভয়েসটি রানিং মাসের হয় (এখনো আর্কাইভ করা হয়নি), তবে ডিলারের কারেন্ট রেফারেন্স আইডি নিব
//         else if (sale.dealer) {
//           const dealerIdStr = sale.dealer.toString();
//           const matchingDealer = dealers.find(d => d._id.toString() === dealerIdStr);
          
//           if (matchingDealer && matchingDealer.referenceIdNo) {
//             targetEmployeeIdNo = matchingDealer.referenceIdNo;
//           }
//         }

//         // গ) প্রাপ্ত সঠিক কর্মচারীর আইডিতে সেলস এবং ডিলার কমিশন যোগ করা
//         if (targetEmployeeIdNo && userSalesMap[targetEmployeeIdNo]) {
//           const employee = userSalesMap[targetEmployeeIdNo];
          
//           // টোটাল লাইফটাইম সেলস ভলিউম ট্র্যাকিং
//           employee.directSalesTotal += saleAmount;
//           employee.totalSalesVolume += saleAmount;

//           // 💰 ডিলার কমিশন ক্যালকুলেট এবং যোগ করা (স্থায়ী বা রানিং উভয় ইনভয়েসের জন্যই)
//           const dealerComm = calculateDealerCommission(saleAmount);
//           employee.dealerCommissionEarned += dealerComm;

//           // রানিং চলতি মাসের সেলস ভলিউম ট্র্যাকিং
//           if (isCurrentMonth) {
//             employee.directSalesThisMonth += saleAmount;
//             employee.thisMonthSalesVolume += saleAmount;
//           }
//         }
//       });


//       // --- STEP 4: রিকার্সিভ পজিশন লক ও মান্থলি কোয়ালিফিকেশন ইঞ্জিন ---
          
//       const childMap = {};
//       users.forEach(u => {
//         const parentId = u.refIdNo;
//         if (parentId && parentId !== "0") {
//           if (!childMap[parentId]) childMap[parentId] = [];
//           childMap[parentId].push(u.idNo);
//         }
//       });

//       // ট্র্যাকিং সেট যাতে কোনো নোড একাধিকবার প্রসেস হয়ে ডাবল সেলস ভলিউম যোগ না করে
//       const processedNodes = new Set();

//       const processHierarchySpecs = (currentIdNo) => {
//         // যদি এই নোড ইতিমধ্যে প্রসেসড হয়ে থাকে, তবে রিটার্ন করবে (ডাবল কাউন্ট প্রোটেকশন)
//         if (processedNodes.has(currentIdNo)) return;
        
//         const currentEmployee = userSalesMap[currentIdNo];
//         if (!currentEmployee) return;

//         const childrenIds = childMap[currentIdNo] || [];
        
//         // প্রথমে সমস্ত চাইল্ড নোডগুলোর হিসাব রিকার্সিভলি শেষ করে আসতে হবে (Bottom-Up Approach)
//         childrenIds.forEach(childId => processHierarchySpecs(childId));

//         const subNodesSummary = [];
//         let teamSalesSumTotal = 0;
//         let teamSalesSumMonth = 0;

//         // চাইল্ড নোডগুলোর পুরোপুরি আপডেটেড সেলস ভলিউম সামারি করা
//         childrenIds.forEach(childId => {
//           const childData = userSalesMap[childId];
//           if (childData) {
//             subNodesSummary.push({
//               idNo: childId,
//               autoPosition: childData.autoPosition || "SALES REPRESENTATIVE"
//             });
//             teamSalesSumTotal += childData.totalSalesVolume;
//             teamSalesSumMonth += childData.thisMonthSalesVolume;
//           }
//         });

//         // 🔒 ফিক্সড: চাইল্ডদের টিম ভলিউম কারেন্ট প্যারেন্টের নিজস্ব ডাইরেক্ট সেলসের সাথে নিখুঁতভাবে যোগ করা
//         currentEmployee.totalSalesVolume += teamSalesSumTotal;
//         currentEmployee.thisMonthSalesVolume += teamSalesSumMonth;

//         // ১. লাইফটাইম সেলস দিয়ে স্থায়ী পজিশন ডিটারমাইন করা হচ্ছে
//         currentEmployee.autoPosition = autoDeterminePosition(currentEmployee.totalSalesVolume, subNodesSummary);

//         // 🎯 ২. পজিশন সেট হওয়ার পর চলতি মাসের সেলস (thisMonthSalesVolume) দিয়ে মান্থলি কোয়ালিফাই ম্যাচ করা হচ্ছে
//         const qualification = checkSelfQualificationOnly(
//           currentEmployee.autoPosition,
//           currentEmployee.thisMonthSalesVolume, 
//           subNodesSummary
//         );

//         currentEmployee.isMonthlyQualified = qualification.qualifies;
//         currentEmployee.performanceBonusRate = qualification.performanceBonusRate;
//         currentEmployee.currentSlabRate = POSITION_SLABS[currentEmployee.autoPosition] || 0;

//         // গ্লোবাল পুল বোনাস এলিজিবিলিটি ট্র্যাকিং
//         if (ELIGIBLE_POOL_POSITIONS.includes(currentEmployee.autoPosition) && currentEmployee.isMonthlyQualified) {
//           currentEmployee.eligibleForGlobalPool = true;
//           currentEmployee.globalPoolShareRate = SALES_SHARE_CONFIG[currentEmployee.autoPosition] || 0;
//         }

//         // নোডটিকে প্রসেসড হিসেবে মার্ক করা হলো
//         processedNodes.add(currentIdNo);
//       };

//       // শুধুমাত্র মেইন রুট প্যারেন্টদের খুঁজে রিকার্সন ইঞ্জিন স্টার্ট করা
//       users.forEach(user => {
//         if (user.refIdNo === "0" || !user.refIdNo || !userSalesMap[user.refIdNo]) {
//           processHierarchySpecs(user.idNo);
//         }
//       });




//       // --- STEP 5: ডিফারেন্সিয়াল জেনারেশন বোনাস এবং ফাইনাল ট্রি জেনারেশন ---
//       // ১. ডিফারেন্সিয়াল বোনাস ক্যালকুলেশন (প্যারেন্ট বনাম ডাইরেক্ট চাইল্ড টিম ভলিউম)
//       // নোট: বোনাস শুধুমাত্র সরাসরি ফার্স্ট-লেভেল ডাউনলাইনের টিমের মোট মান্থলি সেলসের (thisMonthSalesVolume) ওপর একবার হিসাব হবে
//       users.forEach(user => {
//         const parentIdNo = user.refIdNo;
        
//         // যদি ইউজারের কোনো ভ্যালিড প্যারেন্ট থাকে
//         if (parentIdNo && parentIdNo !== "0" && userSalesMap[parentIdNo]) {
//           const parent = userSalesMap[parentIdNo];
//           const child = userSalesMap[user.idNo];
          
//           if (child && child.thisMonthSalesVolume > 0) {
//             // স্ল্যাব রেটের ডিফারেন্স বা পার্থক্য বের করা
//             let diffRate = (parent.currentSlabRate || 0) - (child.currentSlabRate || 0);
            
//             // যদি প্যারেন্টের র‍্যাংক চাইল্ডের চেয়ে বড় হয় তবেই সে ডিফারেন্সিয়াল বোনাস পাবে
//             if (diffRate > 0) {
//               // চাইল্ডের নিজস্ব ডাইরেক্ট সেলস + তার পুরো টিমের চলতি মাসের সেলসের ওপর ডিফারেন্স রেট গুণ হবে
//               parent.generationBonusEarned += (child.thisMonthSalesVolume * diffRate);
//             }
//           }
//         }
//       });

//       // ২. ফাইনাল ডেটা ফরম্যাটিং, বোনাস হিসাব এবং নেস্টেড ট্রি অবজেক্ট স্ট্রাকচার বিল্ড
//       users.forEach(user => {
//         const currentEmployee = userSalesMap[user.idNo];
//         if (!currentEmployee) return;

//         // আপনার স্ট্রাকচার অনুযায়ী ফ্রন্টএন্ড ভেরিয়েবল অ্যাসাইনমেন্ট
//         currentEmployee.position = currentEmployee.autoPosition;
//         currentEmployee.totalSalesAchieved = currentEmployee.totalSalesVolume;
//         currentEmployee.thisMonthSalesAchieved = currentEmployee.thisMonthSalesVolume;
        
//         // 💰 পারফরম্যান্স বোনাস নির্ধারণ (চলতি মাসের নিজস্ব সেলস ভলিউম দিয়ে)
//         currentEmployee.thisMonthBonusEarned = (currentEmployee.directSalesThisMonth || 0) * (currentEmployee.performanceBonusRate || 0);
        
//         const parentIdNo = user.refIdNo;
        
//         // যদি এটি রুট নোড হয় (যার কোনো বস বা প্যারেন্ট নেই)
//         if (parentIdNo === "0" || !parentIdNo || !userSalesMap[parentIdNo]) {
//           tree.push(currentEmployee);
//         } else {
//           // এটি চাইল্ড নোড হলে সরাসরি তার মূল প্যারেন্টের 'children' অ্যারেতে রেফারেন্স পুশ হবে
//           userSalesMap[parentIdNo].children.push(currentEmployee);
//         }
//       });

//       // সফলভাবে সম্পূর্ণ ডাইনামিক এবং ফিক্সড এমএলএম ট্রি রিটার্ন করা হলো
//       res.status(200).json(tree);
      
//     } catch (error) {
//       console.error("❌ BACKEND CRASH ERROR:", error);
//       res.status(500).json({ message: error.message });
//     }
//   };


//   //   const getCommissionLedger = async (req, res) => {
//   //     try {
//   //       const db = mongoose.connection.db;
        
//   //       // কোয়েরি থেকে বছর এবং মাস প্যারামিটার নেওয়া
//   //       const currentYear = parseInt(req.query.year) || new Date().getFullYear();
//   //       const currentMonth = parseInt(req.query.month) || (new Date().getMonth() + 1);

//   //       const startDate = new Date(currentYear, currentMonth - 1, 1);
//   //       const endDate = new Date(currentYear, currentMonth, 1);
//   //       const salesQuery = { createdAt: { $gte: startDate, $lt: endDate } };

//   //       // 💥 সমাধান ১: লাইফটাইম পজিশন ঠিক রাখার জন্য ডাটাবেজের সমস্ত সেলস এবং চলতি মাসের সেলস আলাদা করা হলো
//   //       let allLifetimeSales = await db.collection("sales").find({}).toArray();
//   //       if (!allLifetimeSales || allLifetimeSales.length === 0) {
//   //         allLifetimeSales = await db.collection("invoices").find({}).toArray();
//   //       }

//   //       // শুধুমাত্র চলতি মাসের সেলস (গ্যাপ কমিশন, মান্থলি কোয়ালিফাই এবং কোম্পানি পুলে টাকার অংক বের করার জন্য)
//   //       const thisMonthSales = allLifetimeSales.filter(s => {
//   //         const d = new Date(s.createdAt);
//   //         return d >= startDate && d < endDate;
//   //       });

//   //       // 🌟 মোট কোম্পানি মান্থলি সেলস ভলিউম বের করা (গ্লোবাল পুলে টাকা বন্টনের মেইন সোর্স)
//   //       const totalCompanySalesAmount = thisMonthSales.reduce((sum, s) => sum + (s.grandTotal || 0), 0);

//   //       const dealers = await db.collection("dealers").find({}).toArray();
//   //       const users = await db.collection("users").find({ idNo: { $regex: /^MKT/i } }).toArray();

//   //       const userSalesMap = {};
//   //       const parentToChildrenMap = {}; 

//   //       // ওয়ান-পাস মেমোরি ম্যাপ ও ফাস্ট চাইল্ড ইনডেক্সিং তৈরি
//   //       users.forEach(u => {
//   //         userSalesMap[u.idNo] = { 
//   //           ...u, 
//   //           _id: u._id.toString(),
//   //           directSalesLifetime: 0, 
//   //           directSalesThisMonth: 0, 
//   //           totalSalesVolume: 0,       // লাইফটাইম ভলিউম ট্র্যাকার
//   //           thisMonthSalesVolume: 0,   // মান্থলি ভলিউম ট্র্যাকার
//   //           autoPosition: "SALES REPRESENTATIVE",
//   //           baseCommission: 0,
//   //           selfQualifiesForBonus: false,
//   //           performanceBonusRate: 0,
//   //           monthlyBonusAmount: 0,
//   //           globalPoolBonusAmount: 0,
//   //           earnedPools: [] 
//   //         };
          
//   //         const parentId = u.refIdNo || "0";
//   //         if (!parentToChildrenMap[parentId]) parentToChildrenMap[parentId] = [];
//   //         parentToChildrenMap[parentId].push(u.idNo); // অবজেক্টের বদলে শুধু আইডি পুশ করা হলো (মেমোরি সেফ)
//   //       });

//   //       // ডিলার ওয়াইজ লাইফটাইম এবং চলতি মাসের সেলস ম্যাপিং
//   //       const dealerLifetimeSalesMap = {};
//   //       const dealerThisMonthSalesMap = {};

//   //       allLifetimeSales.forEach(s => {
//   //         if (s.dealer) {
//   //           const dStr = s.dealer.toString();
//   //           const amt = s.grandTotal || 0;
//   //           dealerLifetimeSalesMap[dStr] = (dealerLifetimeSalesMap[dStr] || 0) + amt;
            
//   //           const d = new Date(s.createdAt);
//   //           if (d >= startDate && d < endDate) {
//   //             dealerThisMonthSalesMap[dStr] = (dealerThisMonthSalesMap[dStr] || 0) + amt;
//   //           }
//   //         }
//   //       });

//   //       // ডিলারদের মাধ্যমে এমপ্লয়িদের নিজস্ব ডাইরেক্ট সেলস ডাটা পুশ করা
//   //       dealers.forEach(dlr => {
//   //         const dStr = dlr._id.toString();
//   //         const lifetimeAmt = dealerLifetimeSalesMap[dStr] || 0;
//   //         const monthlyAmt = dealerThisMonthSalesMap[dStr] || 0;

//   //         if (dlr.referenceIdNo && userSalesMap[dlr.referenceIdNo]) {
//   //           const emp = userSalesMap[dlr.referenceIdNo];
//   //           emp.directSalesLifetime += lifetimeAmt;
//   //           emp.totalSalesVolume += lifetimeAmt;

//   //           emp.directSalesThisMonth += monthlyAmt;
//   //           emp.thisMonthSalesVolume += monthlyAmt;
//   //         }
//   //       });

//   //       // ==========================================
//   //       // পাস ১: রিকার্সিভ বটম-আপ পজিশন ও মান্থলি কোয়ালিফিকেশন ইঞ্জিন
//   //       // ==========================================
//   //       const determineHierarchySpecs = (currentIdNo) => {
//   //         const currentEmployee = userSalesMap[currentIdNo];
//   //         if (!currentEmployee) return;

//   //         const childrenIds = parentToChildrenMap[currentIdNo] || [];
//   //         childrenIds.forEach(childId => determineHierarchySpecs(childId));

//   //         const subNodesSummary = [];
//   //         let teamSalesSumTotal = 0;
//   //         let teamSalesSumMonth = 0;

//   //         // 💥 সমাধান ২: ডাটা সরাসরি 'userSalesMap' থেকে রিড করা হচ্ছে
//   //         childrenIds.forEach(childId => {
//   //           const childData = userSalesMap[childId];
//   //           if (childData) {
//   //             subNodesSummary.push({
//   //               idNo: childId,
//   //               autoPosition: childData.autoPosition || "SALES REPRESENTATIVE"
//   //             });
//   //             teamSalesSumTotal += childData.totalSalesVolume;
//   //             teamSalesSumMonth += childData.thisMonthSalesVolume;
//   //           }
//   //         });
          
//   //         // ডাউনলাইনের ডাটা রোল-আপ করা
//   //         currentEmployee.totalSalesVolume += teamSalesSumTotal;
//   //         currentEmployee.thisMonthSalesVolume += teamSalesSumMonth;

//   //         // ক) লাইফটাইম সেলস দিয়ে স্থায়ী পজিশন ডিটারমাইন করা হলো
//   //         currentEmployee.autoPosition = autoDeterminePosition(currentEmployee.totalSalesVolume, subNodesSummary);

//   //         // খ) পজিশন সেট হওয়ার পর আপনার টার্গেট অনুযায়ী চলতি মাসের সেলস দিয়ে মান্থলি কোয়ালিফাই চেক করা হলো
//   //         const checkBonus = checkSelfQualificationOnly(
//   //           currentEmployee.autoPosition, 
//   //           currentEmployee.thisMonthSalesVolume, 
//   //           subNodesSummary
//   //         );
          
//   //         currentEmployee.selfQualifiesForBonus = checkBonus.qualifies;
//   //         currentEmployee.performanceBonusRate = checkBonus.performanceBonusRate;
//   //       };

//   //       users.forEach(user => {
//   //         if (user.refIdNo === "0" || !user.refIdNo || !userSalesMap[user.refIdNo]) {
//   //           determineHierarchySpecs(user.idNo);
//   //         }
//   //       });

//   //       // ==========================================
//   //       // পাস ২: লিনিয়ার ডাইনামিক গ্যাপ কমিশন ক্যালকুলেটর (চলতি মাসের সেলস বেসড)
//   //       // ==========================================
//   //       dealers.forEach(dlr => {
//   //         const totalInvoiceAmount = dealerThisMonthSalesMap[dlr._id.toString()] || 0;
//   //         if (totalInvoiceAmount <= 0 || !dlr.referenceIdNo) return;

//   //         let currentIdNo = dlr.referenceIdNo;
//   //         let distributedRateSoFar = 0;
//   //         const visited = new Set(); // 💥 সমাধান ৩: সার্কুলার রেফারেন্স ইনফিনিট লুপ সেফটি গার্ড

//   //         while (currentIdNo && currentIdNo !== "0" && !visited.has(currentIdNo)) {
//   //           visited.add(currentIdNo);
//   //           const empNode = userSalesMap[currentIdNo];
//   //           if (!empNode) break;

//   //           const myPositionRate = POSITION_SLABS[empNode.autoPosition?.toUpperCase()] || 0;

//   //           if (myPositionRate > distributedRateSoFar) {
//   //             const gapRate = myPositionRate - distributedRateSoFar;
//   //             empNode.baseCommission += totalInvoiceAmount * gapRate;
//   //             distributedRateSoFar = myPositionRate; 
//   //           }
//   //           currentIdNo = empNode.refIdNo; 
//   //         }
//   //       });

//   //       // ==========================================
//   //       // পাস ৩: টপ-ডাউন বোনাস কোয়ালিফিকেশন ওভাররাইড চেইন (Top-Down Override)
//   //       // ==========================================
//   //       const applyTopDownBonusQualification = (currentIdNo, parentQualifies = false) => {
//   //         const currentEmployee = userSalesMap[currentIdNo];
//   //         if (!currentEmployee) return;

//   //         if (parentQualifies) {
//   //           currentEmployee.selfQualifiesForBonus = true;
//   //         }

//   //         const childrenIds = parentToChildrenMap[currentIdNo] || [];
//   //         childrenIds.forEach(childId => {
//   //           applyTopDownBonusQualification(childId, currentEmployee.selfQualifiesForBonus);
//   //         });
//   //       };

//   //       if (parentToChildrenMap["0"]) {
//   //         parentToChildrenMap["0"].forEach(rootIdNo => applyTopDownBonusQualification(rootIdNo, false));
//   //       }

//   //       // ==========================================
//   //       // পাস ৪: রোল-ডাউন গ্লোবাল পুল কাউন্টার এবং মেম্বার অ্যাসাইনমেন্ট
//   //       // ==========================================
//   //       const poolShareCounters = { RSM: 0, DSM: 0, SDSM: 0, SM: 0, NSM: 0, ED: 0, BOM: 0 };
//   //       const qualifiedPoolMembers = { RSM: [], DSM: [], SDSM: [], SM: [], NSM: [], ED: [], BOM: [] };

//   //       users.forEach(user => {
//   //         const nodeData = userSalesMap[user.idNo];
//   //         if (!nodeData) return;

//   //         // ৩০০০ টাকা মান্থলি ডাইরেক্ট সেলসের এলিজিবিলিটি শর্ত চেক
//   //         const isQualifiedForBill = nodeData.directSalesThisMonth >= 3000;
//   //         const myPos = nodeData.autoPosition?.toUpperCase();

//   //         if (isQualifiedForBill && nodeData.selfQualifiesForBonus && ELIGIBLE_POOL_POSITIONS.includes(myPos)) {
//   //           const myRankValue = RANK_MAP[myPos];
            
//   //           ELIGIBLE_POOL_POSITIONS.forEach(poolName => {
//   //             const poolRankValue = RANK_MAP[poolName];
              
//   //             if (myPos === "RSM") {
//   //               if (poolName === "RSM") {
//   //                 poolShareCounters[poolName]++;
//   //                 nodeData.earnedPools.push(poolName);
//   //                 qualifiedPoolMembers[poolName].push(user.idNo);
//   //               }
//   //             } else {
//   //               if (myRankValue >= poolRankValue && poolName !== "RSM") {
//   //                 poolShareCounters[poolName]++;
//   //                 nodeData.earnedPools.push(poolName);
//   //                 qualifiedPoolMembers[poolName].push(user.idNo);
//   //               }
//   //             }
//   //           });
//   //         }
//   //       });

//   //     // ==========================================
//   //     // পাস ৫: 💥 সমাধান ৪: গ্লোবাল কোম্পানি পুল বোনাস ডিস্ট্রিবিউশন রানার
//   //     // ==========================================
//   //     ELIGIBLE_POOL_POSITIONS.forEach(poolName => {
//   //       const totalPoolMembers = poolShareCounters[poolName] || 0;
//   //       const poolRate = SALES_SHARE_CONFIG[poolName] || 0;
//   //       if (totalPoolMembers > 0 && poolRate > 0) {
//   //       // এই পুলের জন্য বরাদ্দকৃত মোট টাকা = টোটাল কোম্পানি সেলস * পুল রেট
//   //       const totalPoolMoney = totalCompanySalesAmount * poolRate;

//   //       // প্রতিজন মেম্বারের প্রাপ্য অংশ
//   //       const sharePerMember = totalPoolMoney / totalPoolMembers;
//   //       // এই পুলে থাকা কোয়ালিফাইড মেম্বারদের ওয়ালেটে টাকা যোগ করা
//   //       qualifiedPoolMembers[poolName].forEach(idNo => {
//   //       if (userSalesMap[idNo]) {
//   //       userSalesMap[idNo].globalPoolBonusAmount += sharePerMember;
//   //       }

//   //       });
//   //       }
//   //     });



//   //   // ==========================================// 
//   //   // ফাইনাল রেসপন্স অবজেক্ট জেনারেশন (ট্রি অ্যারে রেডি করা)// 
//   //   // ==========================================
//   //     const finalTree = [];
//   //     users.forEach(user => {
//   //       const currentEmployee = userSalesMap[user.idNo];
//   //       if (!currentEmployee) return;

//   //       // মাসিক পারফরম্যান্স বোনাস গুণ করে ফাইনালাইজ করা
//   //       currentEmployee.monthlyBonusAmount = currentEmployee.thisMonthSalesVolume *
//   //       currentEmployee.performanceBonusRate;
//   //       currentEmployee.totalSalesAchieved = currentEmployee.totalSalesVolume;
//   //       currentEmployee.thisMonthSalesAchieved = currentEmployee.thisMonthSalesVolume;

//   //       const parentIdNo = user.refIdNo;
//   //       if (parentIdNo === "0" || !parentIdNo || !userSalesMap[parentIdNo]) {
//   //         finalTree.push(currentEmployee);
//   //         } else {
//   //           // চাইল্ড অ্যারে খালি রাখা হলো, যদি ফ্রন্টএন্ডে নেস্টেড স্ট্রাকচার লাগে তবে পুশ করতে পারেন
//   //         if (!userSalesMap[parentIdNo].children) userSalesMap[parentIdNo].children = [];
//   //           userSalesMap[parentIdNo].children.push(currentEmployee);
//   //         }

//   //     });


//   //       // ==========================================
//   //       // পাস ৫: ফাইনাল বোনাস হিসাব ও রেসপন্স এরে প্রস্তুতকরণ
//   //       // ==========================================
//   //       const qualifiedEmployees = [];
//   //       users.forEach(user => {
//   //         const nodeData = userSalesMap[user.idNo];
//   //         if (!nodeData) return;
//   //         const isQualifiedForBill = nodeData.directSales >= 3000;

//   //         let salesShareBonus = 0;
//   //         let performanceBonus = 0;

//   //         if (isQualifiedForBill && nodeData.selfQualifiesForBonus) {
//   //           nodeData.earnedPools.forEach(poolName => {
//   //             const totalPeopleInThisPool = poolShareCounters[poolName] || 0;
//   //             if (totalPeopleInThisPool > 0) {
//   //               const poolPercentage = SALES_SHARE_CONFIG[poolName] || 0;
//   //               const thisPoolTotalFund = totalCompanySalesAmount * poolPercentage;
//   //               salesShareBonus += (thisPoolTotalFund / totalPeopleInThisPool);
//   //             }
//   //           });

//   //           // পারফরম্যান্স বোনাস চলতি মাসের ভলিউমের সাথে গুণ হবে
//   //           performanceBonus = nodeData.thisMonthSalesVolume * nodeData.performanceBonusRate;
//   //         }

//   //         const baseCommission = isQualifiedForBill ? nodeData.baseCommission : 0;
//   //         const totalEarned = baseCommission + salesShareBonus + performanceBonus;

//   //         if (totalEarned > 0 || nodeData.totalSalesVolume >= 25000) {
//   //           qualifiedEmployees.push({
//   //             _id: user._id.toString(),
//   //             name: user.name,
//   //             idNo: user.idNo,
//   //             position: nodeData.autoPosition,
//   //             monthlyDirectSales: nodeData.directSales,
//   //             totalSalesAchieved: nodeData.totalSalesVolume,
//   //             baseCommission: Math.round(baseCommission),
//   //             salesShareBonus: Math.round(salesShareBonus), 
//   //             performanceBonus: Math.round(performanceBonus),
//   //             totalEarned: Math.round(totalEarned),
//   //             status: isQualifiedForBill ? "Qualified" : "Disqualified (Sales < 3000)"
//   //           });
//   //         }
//   //       });

//   //       // 💥 ডিলার রেসপন্স লুপ সম্পূর্ণ ফিক্সড এবং ডাইনামিক
//   //       const qualifiedDealers = dealers.map(dlr => {
//   //         // চলতি মাসে ডিলারের আন্ডারে হওয়া মোট সেলস
//   //         const totalAmount = dealerThisMonthSalesMap[dlr._id.toString()] || 0;
//   //         // ডিলার কমিশন ক্যালকুলেটর ইঞ্জিন কল
//   //         const commission = calculateDealerCommission(totalAmount);

//   //         return {
//   //           _id: dlr._id.toString(),
//   //           name: dlr.name || "Unknown Dealer",
//   //           dealerId: dlr.dealerId || dlr.idNo || "N/A",
//   //           totalSales: totalAmount,
//   //           commission: Math.round(commission),
//   //           status: totalAmount >= 5000 ? "Qualified" : "Disqualified (Sales < 5000)"
//   //         };
//   //       }); // ফ্রন্টএন্ডে সব ডিলার দেখানোর জন্য .filter() কন্ডিশনটি তুলে দেওয়া হলো

//   //       // টোটাল পে-আউট সামারি রি-ক্যালকুলেশন
//   //       const totalEmployeePayout = qualifiedEmployees.reduce((sum, e) => sum + e.totalEarned, 0);
//   //       const totalDealerPayout = qualifiedDealers.reduce((sum, d) => sum + d.commission, 0);


//   //       // ক্লায়েন্টে সাকসেস রেসপন্স পাঠানো
//   //       res.status(200).json({
//   //       meta: {
//   //         targetYear: currentYear,
//   //         targetMonth: currentMonth,
//   //         totalCompanySalesThisMonth: totalCompanySalesAmount,
//   //         poolCounters: poolShareCounters
//   //       },
//   //       summary: {
//   //         totalEmployeePayout,
//   //         totalDealerPayout,
//   //         grandTotalPayout: totalEmployeePayout + totalDealerPayout
//   //       },
//   //       dealers: qualifiedDealers,
//   //       data: finalTree
//   //       });


//   //   } catch (error) {
//   //   console.error("❌ BACKEND CRASH ERROR:", error);
//   //   res.status(500).json({ message: error.message });
//   //   }
//   // };


//   //   const getCommissionLedger = async (req, res) => {
//   //   try {
//   //     const db = mongoose.connection.db;

//   //     // কোয়েরি থেকে বছর এবং মাস প্যারামিটার নেওয়া
//   //     const currentYear = parseInt(req.query.year) || new Date().getFullYear();
//   //     const currentMonth = parseInt(req.query.month) || (new Date().getMonth() + 1);

//   //     // 🔍 🆕 কন্ডিশন: ডাটাবেজে ইতিমধ্যে এই মাসের লেজার সেভ করা আছে কিনা চেক করা
//   //       const savedLedger = await MonthlyLedger.findOne({ year: currentYear, month: currentMonth });
    
//   //     if (savedLedger) {
//   //       console.log(`⚡ Returning Saved Ledger Data for ${currentMonth}/${currentYear}`);
//   //       return res.status(200).json({
//   //         success: true,
//   //         isSavedRecord: true, // ফ্রন্টএন্ডে ট্র্যাকিংয়ের জন্য ফ্ল্যাগ
//   //         meta: savedLedger.meta,
//   //         summary: savedLedger.summary,
//   //         data: savedLedger.employeesData, // আপনার ফ্ল্যাট ইউজার এরে
//   //         dealers: savedLedger.dealersData
//   //       });
//   //     }

//   //     const startDate = new Date(currentYear, currentMonth - 1, 1);
//   //     const endDate = new Date(currentYear, currentMonth, 1);

//   //     // ১. ডাটাবেজ থেকে সমস্ত ইনভয়েস তুলে আনা
//   //     let allLifetimeSales = await db.collection("invoices").find({}).toArray();
//   //     if (!allLifetimeSales || allLifetimeSales.length === 0) {
//   //       allLifetimeSales = await db.collection("sales").find({}).toArray();
//   //     }

//   //     // ২. শুধুমাত্র সিলেক্টেড নির্দিষ্ট মাস ও বছরের সেলস ফিল্টার করা
//   //     const thisMonthSales = allLifetimeSales.filter(s => {
//   //       const d = new Date(s.date || s.createdAt);
//   //       return d >= startDate && d < endDate;
//   //     });

//   //     // 🌟 মোট কোম্পানি মান্থলি সেলস ভলিউম বের করা (গ্লোবাল পুল ডিস্ট্রিবিউশনের মেইন সোর্স)
//   //     const totalCompanySalesAmount = thisMonthSales.reduce((sum, s) => sum + (s.grandTotal || 0), 0);

//   //     const dealers = await db.collection("dealers").find({}).toArray();
//   //     const users = await db.collection("users").find({ idNo: { $regex: /^MKT/i } }).toArray();

//   //     const userSalesMap = {};
//   //     const parentToChildrenMap = {}; 

//   //     // ৩. ওয়ান-পাস মেমোরি ম্যাপ ও ফাস্ট চাইল্ড ইনডেক্সিং তৈরি
//   //     users.forEach(u => {
//   //       userSalesMap[u.idNo] = { 
//   //         ...u, 
//   //         _id: u._id.toString(),
//   //         directSalesLifetime: 0, 
//   //         directSalesThisMonth: 0, 
//   //         totalSalesVolume: 0,       // লাইফটাইম ভলিউম ট্র্যাকার
//   //         thisMonthSalesVolume: 0,   // মান্থলি ভলিউম ট্র্যাকার
//   //         autoPosition: "SALES REPRESENTATIVE",
//   //         baseCommission: 0,
//   //         selfQualifiesForBonus: false,
//   //         performanceBonusRate: 0,
//   //         monthlyBonusAmount: 0,
//   //         globalPoolBonusAmount: 0,
//   //         earnedPools: [] 
//   //       };
        
//   //       const parentId = u.refIdNo || "0";
//   //       if (!parentToChildrenMap[parentId]) parentToChildrenMap[parentId] = [];
//   //       parentToChildrenMap[parentId].push(u.idNo); 
//   //     });

//   //     // 🔒 ৪. ডাইনামিক এবং ফিক্সড: লাইফটাইম ও চলতি মাসের সেলস কর্মচারীদের মাঝে নিখুঁতভাবে ভাগ করা
//   //     allLifetimeSales.forEach(sale => {
//   //       const saleAmount = Number(sale.grandTotal || sale.totalAmount || sale.amount || 0);
//   //       const saleDate = new Date(sale.date || sale.createdAt);
//   //       const isSelectedMonth = saleDate >= startDate && saleDate < endDate;

//   //       let targetEmployeeIdNo = null;

//   //       // ক) ইনভয়েসটি যদি আর্কাইভড হয়ে থাকে, তবে সরাসরি ভেতরের স্ন্যাপশট আইডি ব্যবহার করব (১০০% নিরাপদ ব্যাক-ডেট হিস্ট্রি)
//   //       if (sale.isMonthlyArchived && sale.archivedSalesData?.employeeSnapshot?.idNo) {
//   //         targetEmployeeIdNo = sale.archivedSalesData.employeeSnapshot.idNo;
//   //       } 
//   //       // খ) ইনভয়েসটি যদি আর্কাইভড না হয়ে থাকে, তবে ডিলারের লাইভ referenceIdNo দিয়ে ট্র্যাক করব
//   //       else if (sale.dealer) {
//   //         const dStr = sale.dealer.toString();
//   //         const matchingDealer = dealers.find(d => d._id.toString() === dStr);
//   //         if (matchingDealer && matchingDealer.referenceIdNo) {
//   //           targetEmployeeIdNo = matchingDealer.referenceIdNo;
//   //         }
//   //       }

//   //       // গ) সঠিক কর্মচারীর ম্যাপে সেলস ডাটা যোগ করা
//   //       if (targetEmployeeIdNo && userSalesMap[targetEmployeeIdNo]) {
//   //         const emp = userSalesMap[targetEmployeeIdNo];
          
//   //         // লাইফটাইম ট্র্যাকিং (সবসময়ের জন্য যোগ হবে)
//   //         emp.directSalesLifetime += saleAmount;
//   //         emp.totalSalesVolume += saleAmount;

//   //         // সিলেক্টেড নির্দিষ্ট মাসের ট্র্যাকিং
//   //         if (isSelectedMonth) {
//   //           emp.directSalesThisMonth += saleAmount;
//   //           emp.thisMonthSalesVolume += saleAmount;
//   //         }
//   //       }
//   //     });

//   //     // ==========================================
//   //     // পাস ১: রিকার্সিভ বটম-আপ পজিশন ও মান্থলি কোয়ালিফিকেশন ইঞ্জিন
//   //     // ==========================================
//   //     const processedNodes = new Set(); 

//   //     const determineHierarchySpecs = (currentIdNo) => {
//   //       if (processedNodes.has(currentIdNo)) return;

//   //       const currentEmployee = userSalesMap[currentIdNo];
//   //       if (!currentEmployee) return;

//   //       const childrenIds = parentToChildrenMap[currentIdNo] || [];
//   //       childrenIds.forEach(childId => determineHierarchySpecs(childId));

//   //       const subNodesSummary = [];
//   //       let teamSalesSumTotal = 0;
//   //       let teamSalesSumMonth = 0;

//   //       childrenIds.forEach(childId => {
//   //         const childData = userSalesMap[childId];
//   //         if (childData) {
//   //           subNodesSummary.push({
//   //             idNo: childId,
//   //             autoPosition: childData.autoPosition || "SALES REPRESENTATIVE"
//   //           });
//   //           teamSalesSumTotal += childData.totalSalesVolume;
//   //           teamSalesSumMonth += childData.thisMonthSalesVolume;
//   //         }
//   //       });
        
//   //       currentEmployee.totalSalesVolume += teamSalesSumTotal;
//   //       currentEmployee.thisMonthSalesVolume += teamSalesSumMonth;

//   //       currentEmployee.autoPosition = autoDeterminePosition(currentEmployee.totalSalesVolume, subNodesSummary);

//   //       const checkBonus = checkSelfQualificationOnly(
//   //         currentEmployee.autoPosition, 
//   //         currentEmployee.thisMonthSalesVolume, 
//   //         subNodesSummary
//   //       );
        
//   //       currentEmployee.selfQualifiesForBonus = checkBonus.qualifies;
//   //       currentEmployee.performanceBonusRate = checkBonus.performanceBonusRate;

//   //       processedNodes.add(currentIdNo);
//   //     };

//   //     users.forEach(user => {
//   //       if (user.refIdNo === "0" || !user.refIdNo || !userSalesMap[user.refIdNo]) {
//   //         determineHierarchySpecs(user.idNo);
//   //       }
//   //     });

//   //     // ==========================================
//   //     // পাস ২: লিনিয়ার ডাইনামিক গ্যাপ কমিশন ক্যালকুলেটর (চলতি মাসের সেলস বেসড)
//   //     // ==========================================
//   //     thisMonthSales.forEach(sale => {
//   //       const invoiceAmount = Number(sale.grandTotal || sale.totalAmount || sale.amount || 0);
//   //       if (invoiceAmount <= 0) return;

//   //       let startEmployeeIdNo = null;

//   //       // আর্কাইভড ডাটা ফার্স্ট কন্ডিশন (আর্কাইভ ট্র্যাকিং ফিক্স)
//   //       if (sale.isMonthlyArchived && sale.archivedSalesData?.employeeSnapshot?.idNo) {
//   //         startEmployeeIdNo = sale.archivedSalesData.employeeSnapshot.idNo;
//   //       } else if (sale.dealer) {
//   //         const dStr = sale.dealer.toString();
//   //         const matchingDealer = dealers.find(d => d._id.toString() === dStr);
//   //         if (matchingDealer && matchingDealer.referenceIdNo) {
//   //           startEmployeeIdNo = matchingDealer.referenceIdNo;
//   //         }
//   //       }

//   //       if (!startEmployeeIdNo) return;

//   //       let currentIdNo = startEmployeeIdNo;
//   //       let distributedRateSoFar = 0;
//   //       const visited = new Set(); 

//   //       while (currentIdNo && currentIdNo !== "0" && !visited.has(currentIdNo)) {
//   //         visited.add(currentIdNo);
//   //         const empNode = userSalesMap[currentIdNo];
//   //         if (!empNode) break;

//   //         const myPositionRate = POSITION_SLABS[empNode.autoPosition?.toUpperCase()] || 0;

//   //         if (myPositionRate > distributedRateSoFar) {
//   //           const gapRate = myPositionRate - distributedRateSoFar;
//   //           empNode.baseCommission += invoiceAmount * gapRate;
//   //           distributedRateSoFar = myPositionRate; 
//   //         }

//   //         currentIdNo = empNode.refIdNo; 
//   //       }
//   //     });

//   //     // ==========================================
//   //     // পাস ৩: টপ-ডাউন বোনাস কোয়ালিফিকেশন ওভাররাইড চেইন
//   //     // ==========================================
//   //     const applyTopDownBonusQualification = (currentIdNo, parentQualifies = false) => {
//   //       const currentEmployee = userSalesMap[currentIdNo];
//   //       if (!currentEmployee) return;

//   //       if (parentQualifies) {
//   //         currentEmployee.selfQualifiesForBonus = true;
//   //       }

//   //       const childrenIds = parentToChildrenMap[currentIdNo] || [];
//   //       childrenIds.forEach(childId => {
//   //         applyTopDownBonusQualification(childId, currentEmployee.selfQualifiesForBonus);
//   //       });
//   //     };
//   //     if (parentToChildrenMap["0"]) {
//   //       parentToChildrenMap["0"].forEach(rootIdNo => applyTopDownBonusQualification(rootIdNo, false));
//   //     }

//   //     // ==========================================
//   //     // পাস ৪: রোল-ডাউন গ্লোবাল পুল কাউন্টার এবং মেম্বার অ্যাসাইনমেন্ট
//   //     // ==========================================
//   //     const poolShareCounters = { RSM: 0, DSM: 0, SDSM: 0, SM: 0, NSM: 0, ED: 0, BOM: 0 };
//   //     const qualifiedPoolMembers = { RSM: [], DSM: [], SDSM: [], SM: [], NSM: [], ED: [], BOM: [] };
      
//   //     users.forEach(user => {
//   //       const nodeData = userSalesMap[user.idNo];
//   //       if (!nodeData) return;

//   //       const isQualifiedForBill = nodeData.directSalesThisMonth >= 3000;
//   //       const myPos = nodeData.autoPosition?.toUpperCase();

//   //       if (isQualifiedForBill && nodeData.selfQualifiesForBonus && ELIGIBLE_POOL_POSITIONS.includes(myPos)) {
//   //         const myRankValue = RANK_MAP[myPos];
          
//   //         ELIGIBLE_POOL_POSITIONS.forEach(poolName => {
//   //           const poolRankValue = RANK_MAP[poolName];
            
//   //           if (myPos === "RSM") {
//   //             if (poolName === "RSM") {
//   //               poolShareCounters[poolName]++;
//   //               nodeData.earnedPools.push(poolName);
//   //               qualifiedPoolMembers[poolName].push(user.idNo);
//   //             }
//   //           } else {
//   //             if (myRankValue >= poolRankValue && poolName !== "RSM") {
//   //               poolShareCounters[poolName]++;
//   //               nodeData.earnedPools.push(poolName);
//   //               qualifiedPoolMembers[poolName].push(user.idNo);
//   //             }
//   //           }
//   //         });
//   //       }
//   //     });

//   //       // ==========================================
//   //     // পাস ৫: গ্লোবাল কোম্পানি পুল বোনাস ডিস্ট্রিবিউশন রানার
//   //     // ==========================================
//   //     ELIGIBLE_POOL_POSITIONS.forEach(poolName => {
//   //       const totalPoolMembers = poolShareCounters[poolName] || 0;
//   //       const poolRate = SALES_SHARE_CONFIG[poolName] || 0;
//   //       if (totalPoolMembers > 0 && poolRate > 0) {
//   //         const totalPoolMoney = totalCompanySalesAmount * poolRate;
//   //         const sharePerMember = totalPoolMoney / totalPoolMembers;
          
//   //         qualifiedPoolMembers[poolName].forEach(idNo => {
//   //           if (userSalesMap[idNo]) {
//   //             userSalesMap[idNo].globalPoolBonusAmount += sharePerMember;
//   //           }
//   //         });
//   //       }
//   //     });

//   //   // ==========================================
//   //         // পাস ৭: ফাইনাল বোনাস হিসাব ও রেসপন্স এরে প্রস্তুতকরণ (ঠিক আপনার ফরম্যাটে)
//   //         // ==========================================
//   //         const finalLedgerList = [];

//   //         users.forEach(user => {
//   //           const nodeData = userSalesMap[user.idNo];
//   //           if (!nodeData) return;

//   //           // ৩০০০ টাকা মান্থলি ডাইরেক্ট সেলসের শর্ত চেক
//   //           const isQualifiedForBill = (nodeData.directSalesThisMonth || 0) >= 3000;

//   //           let salesShareBonus = nodeData.globalPoolBonusAmount || 0;
//   //           let performanceBonus = 0;

//   //           if (isQualifiedForBill && nodeData.selfQualifiesForBonus) {
//   //             // পারফরম্যান্স বোনাস নির্ধারণ (ব্যক্তিগত বিক্রয়ের ওপর)
//   //             performanceBonus = (nodeData.thisMonthSalesVolume || 0) * (nodeData.performanceBonusRate || 0);
//   //           }

//   //           // ৩০০০ টাকার নিচে ডাইরেক্ট সেলস হলে গ্যাপ কমিশন এবং পারফরম্যান্স বোনাস ০ হবে
//   //           const baseCommission = isQualifiedForBill ? (nodeData.baseCommission || 0) : 0;
            
//   //           // ভেরিয়েবলগুলো অবজেক্টে রাইট করার জন্য আপডেট করা হচ্ছে
//   //           nodeData.baseCommission = baseCommission;
//   //           nodeData.monthlyBonusAmount = performanceBonus;
//   //           nodeData.globalPoolBonusAmount = salesShareBonus;

//   //           // আপনার দেওয়া প্রপার্টি নামের সাথে হুবহু মিল রাখার জন্য অ্যাসাইনমেন্ট
//   //           nodeData.totalSalesAchieved = nodeData.totalSalesVolume;
//   //           nodeData.thisMonthSalesAchieved = nodeData.thisMonthSalesVolume;

//   //           // গ্রস আর্নিং টোটাল
//   //           const totalEarned = baseCommission + salesShareBonus + performanceBonus;

//   //           // ফিল্টারিং শর্ত: ইনকাম থাকলে অথবা লাইফটাইম সেলস ২৫০০০ এর বেশি হলে রেসপন্সে ঢুকবে
//   //           if (totalEarned > 0 || (nodeData.totalSalesVolume || 0) >= 25000) {
//   //             finalLedgerList.push({
//   //               // ক) ইউজারের ডাটাবেজের সমস্ত অরিজিনাল ফিল্ড (সরাসরি স্প্রেড করা হলো)
//   //               ...user,
//   //               _id: user._id.toString(),
                
//   //               // খ) 💥 আপনার এক্সাম্পল অনুযায়ী ডাইনামিক ফিল্ডসমূহ হুবহু রুটে বসানো হলো
//   //               directSalesLifetime: nodeData.directSalesLifetime,
//   //               directSalesThisMonth: nodeData.directSalesThisMonth,
//   //               totalSalesVolume: nodeData.totalSalesVolume,
//   //               thisMonthSalesVolume: nodeData.thisMonthSalesVolume,
//   //               autoPosition: nodeData.autoPosition,
                
//   //               baseCommission: nodeData.baseCommission,
//   //               selfQualifiesForBonus: nodeData.selfQualifiesForBonus,
//   //               performanceBonusRate: nodeData.performanceBonusRate,
//   //               monthlyBonusAmount: nodeData.monthlyBonusAmount,
//   //               globalPoolBonusAmount: nodeData.globalPoolBonusAmount,
//   //               earnedPools: nodeData.earnedPools,
                
//   //               totalSalesAchieved: nodeData.totalSalesAchieved,
//   //               thisMonthSalesAchieved: nodeData.thisMonthSalesAchieved,
                
//   //               // গ) অডিটিং এর জন্য অতিরিক্ত ২টি প্রয়োজনীয় ফিল্ড
//   //               netTotalEarnings: Number(totalEarned.toFixed(2)),
//   //               qualificationStatus: isQualifiedForBill ? "Qualified" : "Disqualified (Sales < 3000)"
//   //             });
//   //           }
//   //         });

          
//   //       // ==========================================
//   //       // 💥 ডিলার রেসপন্স লুপ (আর্কাইভ ও লাইভ প্রোটেকশনসহ সম্পূর্ণ ফিক্সড)
//   //       // ==========================================
        
//   //       const dealerResultMap = {};

//   //       // ১. চলতি মাসের ফিল্টারকৃত ইনভয়েসগুলো লুপ চালিয়ে ডিলার ডেটা একীভূত করা
//   //       thisMonthSales.forEach(sale => {
//   //         const amt = Number(sale.grandTotal || sale.totalAmount || sale.amount || 0);
//   //         if (amt <= 0) return; // ০ টাকার সেলের জন্য কমিশন বা হিসাব হবে না

//   //         let dIdNo = null;
//   //         let dName = "Unknown Dealer";
//   //         let d_id = sale.dealer ? sale.dealer.toString() : "ARCHIVED_ID";

//   //         // 🔒 ক) আপনার ডাটাবেজ অনুযায়ী আর্কাইভড স্ন্যাপশট নিখুঁতভাবে রিড করার প্রফেশনাল মেথড
//   //         if (sale.isMonthlyArchived && sale.archivedSalesData && sale.archivedSalesData.dealerSnapshot) {
//   //           dIdNo = sale.archivedSalesData.dealerSnapshot.idNo;
//   //           dName = sale.archivedSalesData.dealerSnapshot.name || "Unknown Dealer";
//   //         } 
//   //         // 🔓 খ) যদি ইনভয়েসটি রানিং কারেন্ট মাসের হয়, তবে ডিলারের লাইভ ডাটাবেজ লিংক ব্যবহার করব
//   //         else if (sale.dealer) {
//   //           const matchingDealer = dealers.find(d => d._id.toString() === d_id);
//   //           if (matchingDealer) {
//   //             dIdNo = matchingDealer.dealerId || matchingDealer.idNo;
//   //             dName = matchingDealer.name || "Unknown Dealer";
//   //           }
//   //         }

//   //         // যদি ডিলারের কোনো ভ্যালিড ইউনিক আইডি ট্র্যাকিংয়ে পাওয়া যায়
//   //         if (dIdNo) {
//   //           if (!dealerResultMap[dIdNo]) {
//   //             dealerResultMap[dIdNo] = {
//   //               _id: d_id,
//   //               name: dName,
//   //               dealerId: dIdNo,
//   //               totalSales: 0
//   //             };
//   //           }
//   //           dealerResultMap[dIdNo].totalSales += amt;
//   //         }
//   //       });

//   //       // ২. যদি কোনো ডিলারের চলতি মাসে কোনো সেলস না থাকে, তাকেও জিরো সেলসসহ লিস্টে রাখা (অ্যাডমিন অডিটের জন্য)
//   //       dealers.forEach(dlr => {
//   //         const dIdNo = dlr.dealerId || dlr.idNo || "N/A";
//   //         if (!dealerResultMap[dIdNo]) {
//   //           dealerResultMap[dIdNo] = {
//   //             _id: dlr._id.toString(),
//   //             name: dlr.name || "Unknown Dealer",
//   //             dealerId: dIdNo,
//   //             totalSales: 0
//   //           };
//   //         }
//   //       });

//   //       // ৩. ফাইনাল অ্যারে তৈরি এবং ডিলার কমিশন ক্যালকুলেশন
//   //       const qualifiedDealers = Object.values(dealerResultMap).map(dlr => {
//   //         const commission = calculateDealerCommission(dlr.totalSales);

//   //         return {
//   //           _id: dlr._id,
//   //           name: dlr.name,
//   //           dealerId: dlr.dealerId,
//   //           totalSales: Math.round(dlr.totalSales),
//   //           commission: Math.round(commission),
//   //           // ৫০০০ টাকা বিক্রয়ের কোয়ালিফিকেশন শর্ত চেক
//   //           status: dlr.totalSales >= 5000 ? "Qualified" : "Disqualified (Sales < 5000)"
//   //         };
//   //       });

//   //       // ৪. পে-আউট সামারি রি-ক্যালকুলেশন
//   //       const totalEmployeePayout = finalLedgerList.reduce((sum, e) => sum + e.netTotalEarnings, 0);
//   //       const totalDealerPayout = qualifiedDealers.reduce((sum, d) => sum + d.commission, 0);



//   //         // ==========================================
//   //         // 📊 ফাইনাল এপিআই সাকসেস রেসপন্স রিটার্ন
//   //         // ==========================================
//   //         res.status(200).json({
//   //           success: true,
//   //           meta: {
//   //             targetYear: currentYear,
//   //             targetMonth: currentMonth,
//   //             totalCompanySales: totalCompanySalesAmount,
//   //             poolCounters: poolShareCounters,
//   //             processedUsersCount: finalLedgerList.length,
//   //             processedDealersCount: qualifiedDealers.length
//   //           },
//   //           // সরাসরি 'data' কি-র মধ্যে আপনার চাওয়া হুবহু ফ্ল্যাট এরে ফরম্যাটটি পাঠানো হলো
//   //           data: finalLedgerList, 
//   //           dealers: qualifiedDealers
//   //         });

//   //   } catch (error) {
//   //     console.error("❌ LEDGER REPORT ENGINE CRASH ERROR:", error);
//   //     res.status(500).json({ 
//   //       success: false, 
//   //       message: "Internal Server Error in Ledger Report Engine", 
//   //       error: error.message 
//   //     });
//   //   }
//   // };


//   // const saveMonthlyLedger = async (req, res) => {
//   //   try {
//   //     // 📥 ধাপ ১: ফ্রন্টএন্ডের রিকোয়েস্ট বডি (req.body) থেকে বছর ও মাস রিসিভ করা
//   //     // ইউজার যদি বডিতে কিছু না পাঠায়, তবে ডিফল্ট হিসেবে কারেন্ট বছর ও মাস ধরে নিবে
//   //     const currentYear = parseInt(req.body.year) || new Date().getFullYear();
//   //     const currentMonth = parseInt(req.body.month) || (new Date().getMonth() + 1);

//   //     // 🔍 ধাপ ২: ডাবল-লকিং প্রোটেকশন চেক
//   //     // ডাটাবেজে অলরেডি এই নির্দিষ্ট মাস ও বছরের ডেটা সেভ করা আছে কিনা তা MonthlyLedger কালেকশনে খোঁজা হবে
//   //     const existing = await MonthlyLedger.findOne({ year: currentYear, month: currentMonth });
      
//   //     // যদি অলরেডি ডেটা থেকে থাকে, তবে নতুন করে সেভ না করে এরর মেসেজ রিটার্ন করবে
//   //     if (existing) {
//   //       return res.status(400).json({ 
//   //         success: false, 
//   //         message: `This month's (${currentMonth}/${currentYear}) ledger is already saved and locked!` 
//   //       });
//   //     }

//   //     console.log(`🚀 Starting manual ledger save process for ${currentMonth}/${currentYear}...`);

//   //     // ⚙️ ধাপ ৩: কোর ক্যালকুলেশন ইঞ্জিন কল করা
//   //     // আমরা যে 'executeLedgerCalculationEngine' তৈরি করেছি, সেটিকে কল করে চলতি মাসের লাইভ ডেটা জেনারেট করা হবে
//   //     const engineResult = await executeLedgerCalculationEngine(currentYear, currentMonth);

//   //     // 💰 ধাপ ৪: কোম্পানির ফাইনাল পে-আউট হিসাব করা
//   //     // ইঞ্জিনের তৈরি করা কর্মচারীদের ফ্ল্যাট লিস্ট এবং ডিলারদের লিস্ট থেকে মোট খরচের সামারি করা হচ্ছে
//   //     const totalEmployeePayout = engineResult.finalLedgerList.reduce((sum, e) => sum + e.netTotalEarnings, 0);
//   //     const totalDealerPayout = engineResult.qualifiedDealers.reduce((sum, d) => sum + d.commission, 0);

//   //     // 💾 ধাপ ৫: মঙ্গোডিবি-তে চিরদিনের জন্য ডেটা অবজেক্ট আকারে রাইট/সেভ করা
//   //     // MonthlyLedger মডেলের ভেতর সমস্ত লাইভ ডেটা স্ন্যাপশট (Hardcode) হিসেবে ঢুকিয়ে দেওয়া হচ্ছে
//   //     const newMonthlyLedger = new MonthlyLedger({
//   //       year: currentYear,
//   //       month: currentMonth,
//   //       meta: {
//   //         totalCompanySales: engineResult.totalCompanySalesAmount, // কোম্পানির মোট মাসিক সেলস
//   //         poolCounters: engineResult.poolShareCounters,           // কোন পুলে কতজন কোয়ালিফাই করেছে
//   //         processedUsersCount: engineResult.finalLedgerList.length,
//   //         processedDealersCount: engineResult.qualifiedDealers.length
//   //       },
//   //       summary: {
//   //         totalEmployeePayout: Math.round(totalEmployeePayout),
//   //         totalDealerPayout: Math.round(totalDealerPayout),
//   //         grandTotalCompanyPayout: Math.round(totalEmployeePayout + totalDealerPayout)
//   //       },
//   //       employeesData: engineResult.finalLedgerList, // 🔒 কর্মচারীদের সমস্ত ডেটা স্প্রেডসহ ফ্ল্যাট আকারে সেভ হলো
//   //       dealersData: engineResult.qualifiedDealers   // 🔒 ডিলারদের পুরো কমিশন লিস্ট সেভ হলো
//   //     });

//   //     // ডেটাবেজে সেভ কমপ্লিট করা
//   //     await newMonthlyLedger.save();

//   //     // 🎯 ধাপ ৬: ফ্রন্টএন্ডে সাকসেস রেসপন্স পাঠানো
//   //     res.status(200).json({ 
//   //       success: true, 
//   //       message: `Success! Commission ledger for ${currentMonth}/${currentYear} has been permanently saved and locked.` 
//   //     });

//   //   } catch (error) {
//   //     // 🔍 এটি আপনার ব্যাকএন্ড টার্মিনালে সম্পূর্ণ এরর স্ট্যাক (লাইন নাম্বারসহ) প্রিন্ট করবে
//   //     console.error("❌ CRITICAL BACKEND DETAILED ERROR:", error.stack || error); 
      
//   //     res.status(500).json({ 
//   //       success: false, 
//   //       message: "Server failed to save monthly ledger", 
//   //       error: error.message // এটি ফ্রন্টএন্ডেও আসল এরর মেসেজটি রেসপন্স আকারে পাঠাবে
//   //     });
//   //   }




//   // };





//   // =========================================================================
// // ⚙️ ১. কোর ক্যালকুলেশন ইঞ্জিন (যা লাইভ ভিউ এবং সেভ অপারেশন দুটিতেই ডেটা জেনারেট করবে)
// // =========================================================================


// const executeLedgerCalculationEngine = async (currentYear, currentMonth) => {
//   const db = mongoose.connection.db;

//   const startDate = new Date(currentYear, currentMonth - 1, 1);
//   const endDate = new Date(currentYear, currentMonth, 1);

//   // ডাটাবেজ থেকে সমস্ত ইনভয়েস তুলে আনা
//   let allLifetimeSales = await db.collection("invoices").find({}).toArray();
//   if (!allLifetimeSales || allLifetimeSales.length === 0) {
//     allLifetimeSales = await db.collection("sales").find({}).toArray();
//   }

//   // চলতি মাসের ফিল্টারকৃত সেলস
//   const thisMonthSales = allLifetimeSales.filter(s => {
//     const rawDate = s.date || s.createdAt;
//     if (!rawDate) return false;
//     const d = new Date(rawDate);
//     return d >= startDate && d < endDate;
//   });

//   const totalCompanySalesAmount = thisMonthSales.reduce((sum, s) => sum + (s.grandTotal || 0), 0);
//   const dealers = await db.collection("dealers").find({}).toArray();
//   const users = await db.collection("users").find({ idNo: { $regex: /^MKT/i } }).toArray();

//   const userSalesMap = {};
//   const parentToChildrenMap = {}; 

//   users.forEach(u => {
//     userSalesMap[u.idNo] = { 
//       ...u, 
//       _id: u._id.toString(),
//       directSalesLifetime: 0, 
//       directSalesThisMonth: 0, 
//       totalSalesVolume: 0,       
//       thisMonthSalesVolume: 0,   
//       autoPosition: "SALES REPRESENTATIVE",
//       baseCommission: 0,
//       selfQualifiesForBonus: false,
//       performanceBonusRate: 0,
//       monthlyBonusAmount: 0,
//       globalPoolBonusAmount: 0,
//       earnedPools: [] 
//     };
    
//     const parentId = u.refIdNo || "0";
//     if (!parentToChildrenMap[parentId]) parentToChildrenMap[parentId] = [];
//     parentToChildrenMap[parentId].push(u.idNo); 
//   });

//   allLifetimeSales.forEach(sale => {
//     const saleAmount = Number(sale.grandTotal || sale.totalAmount || sale.amount || 0);
//     const saleDate = new Date(sale.date || sale.createdAt);
//     const isSelectedMonth = saleDate >= startDate && saleDate < endDate;

//     let targetEmployeeIdNo = null;

//     if (sale.isMonthlyArchived && sale.archivedSalesData?.employeeSnapshot?.idNo) {
//       targetEmployeeIdNo = sale.archivedSalesData.employeeSnapshot.idNo;
//     } else if (sale.dealer) {
//       const dStr = sale.dealer.toString();
//       const matchingDealer = dealers.find(d => d._id.toString() === dStr);
//       if (matchingDealer && matchingDealer.referenceIdNo) {
//         targetEmployeeIdNo = matchingDealer.referenceIdNo;
//       }
//     }

//     if (targetEmployeeIdNo && userSalesMap[targetEmployeeIdNo]) {
//       const emp = userSalesMap[targetEmployeeIdNo];
//       emp.directSalesLifetime += saleAmount;
//       emp.totalSalesVolume += saleAmount;

//       if (isSelectedMonth) {
//         emp.directSalesThisMonth += saleAmount;
//         emp.thisMonthSalesVolume += saleAmount;
//       }
//     }
//   });

//   // পাস ১: রিকার্সিভ বটম-আপ পজিশন ও কোয়ালিফিকেশন
//   const processedNodes = new Set(); 
//   const determineHierarchySpecs = (currentIdNo) => {
//     if (processedNodes.has(currentIdNo)) return;
//     const currentEmployee = userSalesMap[currentIdNo];
//     if (!currentEmployee) return;

//     const childrenIds = parentToChildrenMap[currentIdNo] || [];
//     childrenIds.forEach(childId => determineHierarchySpecs(childId));

//     const subNodesSummary = [];
//     let teamSalesSumTotal = 0;
//     let teamSalesSumMonth = 0;

//     childrenIds.forEach(childId => {
//       const childData = userSalesMap[childId];
//       if (childData) {
//         subNodesSummary.push({ idNo: childId, autoPosition: childData.autoPosition || "SALES REPRESENTATIVE" });
//         teamSalesSumTotal += childData.totalSalesVolume;
//         teamSalesSumMonth += childData.thisMonthSalesVolume;
//       }
//     });
    
//     currentEmployee.totalSalesVolume += teamSalesSumTotal;
//     currentEmployee.thisMonthSalesVolume += teamSalesSumMonth;

//     if (typeof autoDeterminePosition === "function") {
//       currentEmployee.autoPosition = autoDeterminePosition(currentEmployee.totalSalesVolume, subNodesSummary);
//     }
//     if (typeof checkSelfQualificationOnly === "function") {
//       const checkBonus = checkSelfQualificationOnly(currentEmployee.autoPosition, currentEmployee.thisMonthSalesVolume, subNodesSummary);
//       currentEmployee.selfQualifiesForBonus = checkBonus.qualifies;
//       currentEmployee.performanceBonusRate = checkBonus.performanceBonusRate;
//     }

//     processedNodes.add(currentIdNo);
//   };

//   users.forEach(user => {
//     if (user.refIdNo === "0" || !user.refIdNo || !userSalesMap[user.refIdNo]) {
//       determineHierarchySpecs(user.idNo);
//     }
//   });

//   // পাস ২: লিনিয়ার ডাইনামিক গ্যাপ কমিশন
//   thisMonthSales.forEach(sale => {
//     const invoiceAmount = Number(sale.grandTotal || sale.totalAmount || sale.amount || 0);
//     if (invoiceAmount <= 0) return;

//     let startEmployeeIdNo = null;
//     if (sale.isMonthlyArchived && sale.archivedSalesData?.employeeSnapshot?.idNo) {
//       startEmployeeIdNo = sale.archivedSalesData.employeeSnapshot.idNo;
//     } else if (sale.dealer) {
//       const dStr = sale.dealer.toString();
//       const matchingDealer = dealers.find(d => d._id.toString() === dStr);
//       if (matchingDealer && matchingDealer.referenceIdNo) startEmployeeIdNo = matchingDealer.referenceIdNo;
//     }

//     if (!startEmployeeIdNo) return;
//     let currentIdNo = startEmployeeIdNo;
//     let distributedRateSoFar = 0;
//     const visited = new Set(); 

//     while (currentIdNo && currentIdNo !== "0" && !visited.has(currentIdNo)) {
//       visited.add(currentIdNo);
//       const empNode = userSalesMap[currentIdNo];
//       if (!empNode) break;

//       const myPositionRate = (typeof POSITION_SLABS !== "undefined" && POSITION_SLABS[empNode.autoPosition?.toUpperCase()]) || 0;
//       if (myPositionRate > distributedRateSoFar) {
//         const gapRate = myPositionRate - distributedRateSoFar;
//         empNode.baseCommission += invoiceAmount * gapRate;
//         distributedRateSoFar = myPositionRate; 
//       }
//       currentIdNo = empNode.refIdNo; 
//     }
//   });

//   // পাস ৩: টপ-ডাউন কোয়ালিফিকেশন ওভাররাইড চেইন
//   const applyTopDownBonusQualification = (currentIdNo, parentQualifies = false) => {
//     const currentEmployee = userSalesMap[currentIdNo];
//     if (!currentEmployee) return;
//     if (parentQualifies) currentEmployee.selfQualifiesForBonus = true;
//     const childrenIds = parentToChildrenMap[currentIdNo] || [];
//     childrenIds.forEach(childId => applyTopDownBonusQualification(childId, currentEmployee.selfQualifiesForBonus));
//   };
//   if (parentToChildrenMap["0"]) {
//     parentToChildrenMap["0"].forEach(rootIdNo => applyTopDownBonusQualification(rootIdNo, false));
//   }

//   // পাস ৪: গ্লোবাল পুল কাউন্টার এবং মেম্বার অ্যাসাইনমেন্ট
//   const poolShareCounters = { RSM: 0, DSM: 0, SDSM: 0, SM: 0, NSM: 0, ED: 0, BOM: 0 };
//   const qualifiedPoolMembers = { RSM: [], DSM: [], SDSM: [], SM: [], NSM: [], ED: [], BOM: [] };
  
//   users.forEach(user => {
//     const nodeData = userSalesMap[user.idNo];
//     if (!nodeData) return;
//     const isQualifiedForBill = nodeData.directSalesThisMonth >= 3000;
//     const myPos = nodeData.autoPosition?.toUpperCase();

//     if (isQualifiedForBill && nodeData.selfQualifiesForBonus && typeof ELIGIBLE_POOL_POSITIONS !== "undefined" && ELIGIBLE_POOL_POSITIONS.includes(myPos)) {
//       const myRankValue = RANK_MAP[myPos];
//       ELIGIBLE_POOL_POSITIONS.forEach(poolName => {
//         const poolRankValue = RANK_MAP[poolName];
//         if (myPos === "RSM") {
//           if (poolName === "RSM") { poolShareCounters[poolName]++; nodeData.earnedPools.push(poolName); qualifiedPoolMembers[poolName].push(user.idNo); }
//         } else {
//           if (myRankValue >= poolRankValue && poolName !== "RSM") { poolShareCounters[poolName]++; nodeData.earnedPools.push(poolName); qualifiedPoolMembers[poolName].push(user.idNo); }
//         }
//       });
//     }
//   });

//   // পাস ৫: গ্লোবাল কোম্পানি পুল বোনাস ডিস্ট্রিবিউশন রানার
//   if (typeof ELIGIBLE_POOL_POSITIONS !== "undefined") {
//     ELIGIBLE_POOL_POSITIONS.forEach(poolName => {
//       const totalPoolMembers = poolShareCounters[poolName] || 0;
//       const poolRate = SALES_SHARE_CONFIG[poolName] || 0;
//       if (totalPoolMembers > 0 && poolRate > 0) {
//         const totalPoolMoney = totalCompanySalesAmount * poolRate;
//         const sharePerMember = totalPoolMoney / totalPoolMembers;
//         qualifiedPoolMembers[poolName].forEach(idNo => {
//           if (userSalesMap[idNo]) userSalesMap[idNo].globalPoolBonusAmount += sharePerMember;
//         });
//       }
//     });
//   }

//    // =========================================================================
//   // পাস ৭: কর্মচারীদের ফাইনাল ফ্ল্যাট রেসপন্স এরে প্রস্তুতকরণ (ঠিক আপনার ফ্ল্যাট অবজেক্ট ফরম্যাটে)
//   // =========================================================================
//   const finalLedgerList = [];

//   users.forEach(user => {
//     const nodeData = userSalesMap[user.idNo];
//     if (!nodeData) return;

//     // ৩০০০ টাকা মান্থলি ডাইরেক্ট সেলসের শর্ত চেক
//     const isQualifiedForBill = (nodeData.directSalesThisMonth || 0) >= 3000;

//     let salesShareBonus = nodeData.globalPoolBonusAmount || 0;
//     let performanceBonus = 0;

//     if (isQualifiedForBill && nodeData.selfQualifiesForBonus) {
//       // পারফরম্যান্স বোনাস নির্ধারণ (ব্যক্তিগত বিক্রয়ের ওপর)
//       performanceBonus = (nodeData.thisMonthSalesVolume || 0) * (nodeData.performanceBonusRate || 0);
//     }

//     // ৩০০০ টাকার নিচে ডাইরেক্ট সেলস হলে গ্যাপ কমিশন এবং পারফরম্যান্স বোনাস ০ হবে
//     const baseCommission = isQualifiedForBill ? (nodeData.baseCommission || 0) : 0;
    
//     // ভেরিয়েবলগুলো অবজেক্টে রাইট করার জন্য আপডেট করা হচ্ছে
//     nodeData.baseCommission = baseCommission;
//     nodeData.monthlyBonusAmount = performanceBonus;
//     nodeData.globalPoolBonusAmount = salesShareBonus;

//     // আপনার দেওয়া প্রপার্টি নামের সাথে হুবহু মিল রাখার জন্য অ্যাসাইনমেন্ট
//     nodeData.totalSalesAchieved = nodeData.totalSalesVolume;
//     nodeData.thisMonthSalesAchieved = nodeData.thisMonthSalesVolume;

//     // গ্রস আর্নিং টোটাল
//     const totalEarned = baseCommission + salesShareBonus + performanceBonus;

//     // ফিল্টারিং শর্ত: ইনকাম থাকলে অথবা লাইফটাইম সেলস ২৫০০০ এর বেশি হলে রেসপন্সে ঢুকবে
//     if (totalEarned > 0 || (nodeData.totalSalesVolume || 0) >= 25000) {
//       finalLedgerList.push({
//         // ক) ইউজারের ডাটাবেজের সমস্ত অরিজিনাল ফিল্ড (সরাসরি স্প্রেড করা হলো)
//         ...user,
//         _id: user._id.toString(),
        
//         // খ) 💥 আপনার এক্সাম্পল অনুযায়ী ডাইনামিক ফিল্ডসমূহ হুবহু রুটে বসানো হলো
//         directSalesLifetime: nodeData.directSalesLifetime,
//         directSalesThisMonth: nodeData.directSalesThisMonth,
//         totalSalesVolume: nodeData.totalSalesVolume,
//         thisMonthSalesVolume: nodeData.thisMonthSalesVolume,
//         autoPosition: nodeData.autoPosition,
        
//         baseCommission: nodeData.baseCommission,
//         selfQualifiesForBonus: nodeData.selfQualifiesForBonus,
//         performanceBonusRate: nodeData.performanceBonusRate,
//         monthlyBonusAmount: nodeData.monthlyBonusAmount,
//         globalPoolBonusAmount: nodeData.globalPoolBonusAmount,
//         earnedPools: nodeData.earnedPools,
        
//         totalSalesAchieved: nodeData.totalSalesAchieved,
//         thisMonthSalesAchieved: nodeData.thisMonthSalesAchieved,
        
//         // গ) অডিটিং এবং ফ্রন্টএন্ডের জন্য প্রফেশনাল ট্র্যাকিং ফিল্ড
//         netTotalEarnings: Number(totalEarned.toFixed(2)),
//         qualificationStatus: isQualifiedForBill ? "Qualified" : "Disqualified (Sales < 3000)"
//       });
//     }
//   });

//   // =========================================================================
//   // ডিলার রেসপন্স লুপ (আর্কাইভ ও লাইভ প্রোটেকশনসহ সম্পূর্ণ ফিক্সড)
//   // =========================================================================
//   const dealerResultMap = {};

//   thisMonthSales.forEach(sale => {
//     const amt = Number(sale.grandTotal || sale.totalAmount || sale.amount || 0);
//     if (amt <= 0) return;

//     let dIdNo = null;
//     let dName = "Unknown Dealer";
//     let d_id = sale.dealer ? sale.dealer.toString() : "ARCHIVED_ID";

//     if (sale.isMonthlyArchived && sale.archivedSalesData && sale.archivedSalesData.dealerSnapshot) {
//       dIdNo = sale.archivedSalesData.dealerSnapshot.idNo;
//       dName = sale.archivedSalesData.dealerSnapshot.name || "Unknown Dealer";
//     } else if (sale.dealer) {
//       const matchingDealer = dealers.find(d => d._id.toString() === d_id);
//       if (matchingDealer) {
//         dIdNo = matchingDealer.dealerId || matchingDealer.idNo;
//         dName = matchingDealer.name || "Unknown Dealer";
//       }
//     }

//     if (dIdNo) {
//       if (!dealerResultMap[dIdNo]) {
//         dealerResultMap[dIdNo] = { _id: d_id, name: dName, dealerId: dIdNo, totalSales: 0 };
//       }
//       dealerResultMap[dIdNo].totalSales += amt;
//     }
//   });

//   dealers.forEach(dlr => {
//     const dIdNo = dlr.dealerId || dlr.idNo || "N/A";
//     if (!dealerResultMap[dIdNo]) {
//       dealerResultMap[dIdNo] = { _id: dlr._id.toString(), name: dlr.name || "Unknown Dealer", dealerId: dIdNo, totalSales: 0 };
//     }
//   });

//   const qualifiedDealers = Object.values(dealerResultMap).map(dlr => {
//     const commission = (typeof calculateDealerCommission === "function") ? calculateDealerCommission(dlr.totalSales) : 0;
//     return {
//       _id: dlr._id,
//       name: dlr.name,
//       dealerId: dlr.dealerId,
//       totalSales: Math.round(dlr.totalSales),
//       commission: Math.round(commission),
//       status: dlr.totalSales >= 5000 ? "Qualified" : "Disqualified (Sales < 5000)"
//     };
//   });

//   return { totalCompanySalesAmount, poolShareCounters, finalLedgerList, qualifiedDealers };
// };

// // =========================================================================
// // 2️⃣ ২. লেজার দেখার গেট কন্ট্রোলার (getCommissionLedger)
// // =========================================================================
// // 1st version
// // const getCommissionLedger = async (req, res) => {
// //   try {
// //     const currentYear = parseInt(req.query.year) || new Date().getFullYear();
// //     const currentMonth = parseInt(req.query.month) || (new Date().getMonth() + 1);

// //     const savedLedger = await MonthlyLedger.findOne({ year: currentYear, month: currentMonth });
// //     if (savedLedger) {
// //       return res.status(200).json({
// //         success: true,
// //         isSavedRecord: true,
// //         meta: savedLedger.meta,
// //         summary: savedLedger.summary,
// //         data: savedLedger.employeesData,
// //         dealers: savedLedger.dealersData
// //       });
// //     }

// //     const engineResult = await executeLedgerCalculationEngine(currentYear, currentMonth);
    
// //     const totalEmployeePayout = engineResult.finalLedgerList.reduce((sum, e) => sum + e.netTotalEarnings, 0);
// //     const totalDealerPayout = engineResult.qualifiedDealers.reduce((sum, d) => sum + d.commission, 0);

// //     res.status(200).json({
// //       success: true,
// //       isSavedRecord: false,
// //       meta: {
// //         targetYear: currentYear,
// //         targetMonth: currentMonth,
// //         totalCompanySales: engineResult.totalCompanySalesAmount,
// //         poolCounters: engineResult.poolShareCounters,
// //         processedUsersCount: engineResult.finalLedgerList.length,
// //         processedDealersCount: engineResult.qualifiedDealers.length
// //       },
// //       summary: {
// //         totalEmployeePayout: Math.round(totalEmployeePayout),
// //         totalDealerPayout: Math.round(totalDealerPayout),
// //         grandTotalCompanyPayout: Math.round(totalEmployeePayout + totalDealerPayout)
// //       },
// //       data: engineResult.finalLedgerList,
// //       dealers: engineResult.qualifiedDealers
// //     });

// //   } catch (error) {
// //     console.error("❌ getCommissionLedger Fatal Error:", error);
// //     res.status(500).json({ success: false, message: error.message });
// //   }
// // };

// // 2nd version (optimized)
// const getCommissionLedger = async (req, res) => {
//   try {
//     const currentYear = parseInt(req.query.year) || new Date().getFullYear();
//     const currentMonth = parseInt(req.query.month) || (new Date().getMonth() + 1);
    
//     // 📊 ফ্রন্টএন্ড থেকে পেজিনেশন প্যারামিটার নেওয়া (Default: page = 1, limit = 20)
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 20;
//     const skip = (page - 1) * limit;

//     let meta = {};
//     let summary = {};
//     let employeesData = [];
//     let dealersData = [];
//     let isSavedRecord = false;
//     let totalEmployees = 0;
//     let totalDealers = 0;

//     // ১. চেক করা ডেটাবেজে অলরেডি সেভ করা লিজার আছে কিনা
//     const savedLedger = await MonthlyLedger.findOne({ year: currentYear, month: currentMonth });
    
//     if (savedLedger) {
//       isSavedRecord = true;
//       meta = savedLedger.meta;
//       summary = savedLedger.summary;
      
//       // সেভ করা অ্যারে থেকে শুধুমাত্র নির্দিষ্ট পেজের ডাটা স্লাইস (Slice) করা
//       employeesData = savedLedger.employeesData || [];
//       dealersData = savedLedger.dealersData || [];
//     } else {
//       // ২. সেভ করা না থাকলে লাইভ ইঞ্জিন ক্যালকুলেশন রান করা
//       isSavedRecord = false;
//       const engineResult = await executeLedgerCalculationEngine(currentYear, currentMonth);
      
//       const totalEmployeePayout = engineResult.finalLedgerList.reduce((sum, e) => sum + e.netTotalEarnings, 0);
//       const totalDealerPayout = engineResult.qualifiedDealers.reduce((sum, d) => sum + d.commission, 0);

//       meta = {
//         targetYear: currentYear,
//         targetMonth: currentMonth,
//         totalCompanySales: engineResult.totalCompanySalesAmount,
//         poolCounters: engineResult.poolShareCounters,
//         processedUsersCount: engineResult.finalLedgerList.length,
//         processedDealersCount: engineResult.qualifiedDealers.length
//       };

//       summary = {
//         totalEmployeePayout: Math.round(totalEmployeePayout),
//         totalDealerPayout: Math.round(totalDealerPayout),
//         grandTotalCompanyPayout: Math.round(totalEmployeePayout + totalDealerPayout)
//       };

//       employeesData = engineResult.finalLedgerList || [];
//       dealersData = engineResult.qualifiedDealers || [];
//     }

//     // ৩. টোটাল কাউন্ট ট্র্যাক করা
//     totalEmployees = employeesData.length;
//     totalDealers = dealersData.length;

//     // ৪. ইন-মেমোরি পেজিনেশন স্লাইসিং (Array slicing for instant response)
//     const paginatedEmployees = employeesData.slice(skip, skip + limit);
//     const paginatedDealers = dealersData.slice(skip, skip + limit);

//     // ৫. ফ্রন্টএন্ডে স্ট্যান্ডার্ড ফরম্যাটে রেসপন্স পাঠানো
//     res.status(200).json({
//       success: true,
//       isSavedRecord,
//       meta,
//       summary,
//       // পেজ অনুযায়ী শুধু ২০টি করে ডাটা পাঠানো হচ্ছে
//       data: paginatedEmployees, 
//       dealers: paginatedDealers,
//       pagination: {
//         totalEmployees,
//         totalDealers,
//         totalPages: Math.ceil(Math.max(totalEmployees, totalDealers) / limit) || 1,
//         currentPage: page,
//         limit
//       }
//     });

//   } catch (error) {
//     console.error("❌ getCommissionLedger Fatal Error:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };


// // =========================================================================
// // 3️⃣ ৩. লেজার স্থায়ীভাবে সেভ করার রুট কন্ট্রোলার (saveMonthlyLedger)
// // =========================================================================
// const saveMonthlyLedger = async (req, res) => {
//   try {
//     const currentYear = parseInt(req.body.year) || new Date().getFullYear();
//     const currentMonth = parseInt(req.body.month) || (new Date().getMonth() + 1);

//     const existing = await MonthlyLedger.findOne({ year: currentYear, month: currentMonth });
//     if (existing) {
//       return res.status(400).json({ 
//         success: false, 
//         message: `This month's (${currentMonth}/${currentYear}) ledger is already saved and locked!` 
//       });
//     }

//     console.log(`🚀 Starting manual ledger save process for ${currentMonth}/${currentYear}...`);

//     const engineResult = await executeLedgerCalculationEngine(currentYear, currentMonth);

//     const totalEmployeePayout = engineResult.finalLedgerList.reduce((sum, e) => sum + e.netTotalEarnings, 0);
//     const totalDealerPayout = engineResult.qualifiedDealers.reduce((sum, d) => sum + d.commission, 0);

//     const newMonthlyLedger = new MonthlyLedger({
//       year: currentYear,
//       month: currentMonth,
//       meta: {
//         totalCompanySales: engineResult.totalCompanySalesAmount,
//         poolCounters: engineResult.poolShareCounters,
//         processedUsersCount: engineResult.finalLedgerList.length,
//         processedDealersCount: engineResult.qualifiedDealers.length
//       },
//       summary: {
//         totalEmployeePayout: Math.round(totalEmployeePayout),
//         totalDealerPayout: Math.round(totalDealerPayout),
//         grandTotalCompanyPayout: Math.round(totalEmployeePayout + totalDealerPayout)
//       },
//       employeesData: engineResult.finalLedgerList, 
//       dealersData: engineResult.qualifiedDealers   
//     });

//     await newMonthlyLedger.save();

//     res.status(200).json({ 
//       success: true, 
//       message: `Success! Commission ledger for ${currentMonth}/${currentYear} has been permanently saved and locked.` 
//     });

//   } catch (error) {
//     console.error("❌ Manual Ledger Save Error:", error.stack || error);
//     res.status(500).json({ 
//       success: false, 
//       message: "Server failed to save monthly ledger", 
//       error: error.message 
//     });
//   }
// };


// // 🆕 কর্মচারীর নিজের মাস ভিত্তিক কমিশন এবং payouts কালেকশন থেকে রিয়েল পেমেন্ট স্ট্যাটাস গেট করা
// const getMyMonthlyCommissionStatus = async (req, res) => {
//   try {
//     const { idNo, year, month } = req.query;

//     if (!idNo || !year || !month) {
//       return res.status(400).json({ success: false, message: "Missing required parameters" });
//     }

//     const targetYear = parseInt(year);
//     const targetMonth = parseInt(month);
//     const db = mongoose.connection.db;

//     // ১. payouts কালেকশন থেকে এই কর্মচারীর এই নির্দিষ্ট মাসের পেমেন্ট রেকর্ড খুঁজে বের করা
//     const payoutRecord = await db.collection("payouts").findOne({
//       userIdNo: idNo,
//       year: targetYear,
//       month: targetMonth
//     });

//     // ২. MonthlyLedger থেকে ওই মাসের আর্নিংস ডেটা স্ন্যাপশট তুলে আনা
//     const MonthlyLedger = require('../models/MonthlyLedger');
//     const savedLedger = await MonthlyLedger.findOne({ year: targetYear, month: targetMonth });
//     const myLedgerData = savedLedger ? (savedLedger.employeesData || []).find(emp => emp.idNo === idNo) : null;

//     // ৩. payouts ডকুমেন্ট এবং লেজার ডাটার ওপর ভিত্তি করে রেসপন্স অবজেক্ট তৈরি
//     res.status(200).json({
//       success: true,
//       isLocked: savedLedger ? true : false,
//       // 💥 আপনার payouts কালেকশনের 'status' ফিল্ড অনুযায়ী ডাইনামিক ম্যাপিং (যেমন: Approved, Pending, Rejected)
//       status: payoutRecord ? payoutRecord.status : "Pending", 
//       amount: payoutRecord ? payoutRecord.amount : (myLedgerData ? (myLedgerData.totalEarnings || myLedgerData.netPayout || 0) : 0),
//       paymentMethod: payoutRecord ? payoutRecord.paymentMethod : "N/A",
//       accountDetails: payoutRecord ? payoutRecord.accountDetails : "N/A",
//       transactionId: payoutRecord ? payoutRecord.transactionId : "N/A",
//       note: payoutRecord ? payoutRecord.note : "Statement not generated yet",
//       // ব্রেকডাউন ভ্যালু (যদি লেজারে থাকে)
//       salesPayout: myLedgerData ? (myLedgerData.salesPayout || 0) : 0,
//       poolBonus: myLedgerData ? (myLedgerData.poolBonus || 0) : 0
//     });

//   } catch (error) {
//     console.error("Monthly Commission Payout Error:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };


// // 🆕 কর্মচারীর নিজের মাস ভিত্তিক স্যালারি শীট ডেটা গেট করা (যদি MonthlyLedger এ থাকে)
// // const getMyMonthlySalarySheet = async (req, res) => {
// //   try {
// //     const { idNo, year, month } = req.query;

// //     if (!idNo || !year || !month) {
// //       return res.status(400).json({ success: false, message: "Missing required parameters" });
// //     }

// //     const targetYear = Number(year);
// //     const targetMonth = Number(month);
// //     const searchId = idNo.trim().toUpperCase();

// //     const db = mongoose.connection.db;
// //     const MonthlyLedger = require('../models/MonthlyLedger');
    
// //     // ১. ডাটাবেজের মান্থলি লেজার কালেকশন থেকে নির্দিষ্ট মাসের ডেটা খুঁজে বের করা
// //     const savedLedger = await MonthlyLedger.findOne({ year: targetYear, month: targetMonth });
// //     if (!savedLedger) {
// //       return res.status(200).json({ success: true, data: null });
// //     }

// //     // ২. লেজার থেকে এই নির্দিষ্ট কর্মচারীর ডেটা অবজেক্ট বের করা
// //     const employeeList = savedLedger.data || savedLedger.employeesData || [];
// //     const myData = employeeList.find(emp => emp.idNo && emp.idNo.toString().trim().toUpperCase() === searchId);

// //     if (!myData) {
// //       return res.status(200).json({ success: true, data: null });
// //     }

// //     // ৩. 📊 পার্সোনাল ও গ্রুপ সেলস ইনভয়েস ওয়াইজ কমিশন ট্র্যাকিং লগ জেনারেটর
// //     let allInvoices = await db.collection("invoices").find({}).toArray();
// //     if (!allInvoices || allInvoices.length === 0) {
// //       allInvoices = await db.collection("sales").find({}).toArray();
// //     }

// //     const dealers = await db.collection("dealers").find({}).toArray();
// //     const users = await db.collection("users").find({ idNo: { $regex: /^MKT/i } }).toArray();

// //     const startDate = new Date(targetYear, targetMonth - 1, 1);
// //     const endDate = new Date(targetYear, targetMonth, 1);

// //     const filteredInvoices = allInvoices.filter(s => {
// //       const d = new Date(s.date || s.createdAt);
// //       return d >= startDate && d < endDate;
// //     });

// //     // রিকার্সিভলি ডাউনলাইন চেইন আইডি লিস্ট বের করার হেল্পার
// //     const getAllDownlineIdNos = (startIdNo) => {
// //       const downlines = [];
// //       const queue = [startIdNo];
// //       while (queue.length > 0) {
// //         const currentId = queue.shift();
// //         const children = users.filter(u => u.refIdNo === currentId);
// //         children.forEach(child => {
// //           if (!downlines.includes(child.idNo)) {
// //             downlines.push(child.idNo);
// //             queue.push(child.idNo);
// //           }
// //         });
// //       }
// //       return downlines;
// //     };

// //     const myTeamIdNos = getAllDownlineIdNos(searchId);
// //     const commissionBreakdown = [];

// //     filteredInvoices.forEach(sale => {
// //       let saleEmployeeIdNo = null;
// //       let dealerName = "General Customer";

// //       if (sale.isMonthlyArchived && sale.archivedSalesData?.employeeSnapshot?.idNo) {
// //         saleEmployeeIdNo = sale.archivedSalesData.employeeSnapshot.idNo;
// //         dealerName = sale.archivedSalesData.dealerSnapshot?.name || "Unknown";
// //       } else if (sale.dealer) {
// //         const matchingDealer = dealers.find(d => d._id.toString() === sale.dealer.toString());
// //         if (matchingDealer) {
// //           saleEmployeeIdNo = matchingDealer.referenceIdNo;
// //           dealerName = matchingDealer.name;
// //         }
// //       }

// //       if (saleEmployeeIdNo && (saleEmployeeIdNo === searchId || myTeamIdNos.includes(saleEmployeeIdNo))) {
// //         const creatorEmployee = users.find(u => u.idNo === saleEmployeeIdNo);
// //         const amt = Number(sale.grandTotal || 0);
        
// //         let calcComm = 0;
// //         if (saleEmployeeIdNo === searchId) {
// //           calcComm = amt * 0.08; // নিজের সেলে আনুমানিক ৮%
// //         } else {
// //           calcComm = amt * 0.03; // ডাউনলাইন থেকে গ্যাপ আনুমানিক ৩%
// //         }

// //         if (calcComm > 0) {
// //           commissionBreakdown.push({
// //             invoiceNo: sale.invoiceNo || "INV-N/A",
// //             memberName: creatorEmployee ? creatorEmployee.name : "Team Member",
// //             memberId: saleEmployeeIdNo,
// //             dealerName,
// //             invoiceAmount: amt,
// //             earnedAmount: Math.round(calcComm)
// //           });
// //         }
// //       }
// //     });

// //     // ৪. 🎯 গ্লোবাল কোম্পানি প্রফিট শেয়ার পুল ক্যালকুলেটর ইঞ্জিন (DSM, SDSM, SM, NSM, ED, BOM)
// //     const totalCompanySales = savedLedger.meta?.totalCompanySales || 0;
// //     const poolCounters = savedLedger.meta?.poolCounters || { RSM: 0, DSM: 0, SDSM: 0, SM: 0, NSM: 0, ED: 0, BOM: 0 };
// //     const userEarnedPools = myData.earnedPools || [];

// //     // প্রতি পুলের অফিশিয়াল ১% শেয়ার স্ল্যাব পলিসি
// //     const POOL_PERCENTAGES = { "RSM": 0.01, "DSM": 0.05, "SDSM": 0.01, "SM": 0.005, "NSM": 0.01, "ED": 0.005, "BOM": 0.01 };

// //     const poolCalculationSteps = [
// //       `📊 কোম্পানি মোট মাসিক বিক্রয় (Global Volume): ৳${totalCompanySales.toLocaleString()}`
// //     ];

// //     userEarnedPools.forEach(pool => {
// //       const rate = POOL_PERCENTAGES[pool] || 0.01;
// //       const totalPoolFund = totalCompanySales * rate; 
// //       const shareCount = poolCounters[pool] || 0;     
      
// //       if (shareCount > 0) {
// //         const perShareAmount = totalPoolFund / shareCount;
// //         poolCalculationSteps.push(
// //           `🎯 [${pool} Pool] -> মোট ফান্ড: ৳${totalCompanySales.toLocaleString()} × ${(rate * 100)}% = ৳${totalPoolFund.toLocaleString()} | মোট কোয়ালিফাইড মেম্বার: ${shareCount} জন। প্রতি শেয়ারের মান: ৳${totalPoolFund.toLocaleString()} ÷ ${shareCount} = ৳${Math.round(perShareAmount).toLocaleString()}`
// //         );
// //       }
// //     });

// //     poolCalculationSteps.push(
// //       `💸 চূড়ান্ত গ্লোবাল কোম্পানি পুল শেয়ার বোনাস: ৳${Number(myData.globalPoolBonusAmount || 0).toLocaleString()}`
// //     );

// //     // ৫. 📈 পারফরম্যান্স বোনাস ক্যালকুলেশন মেটা টেক্সট
// //     const bonusCalculationSteps = [
// //       ` চলতি মাসে আপনার মোট টিম বিক্রয় ভলিউম (Target Volume): ৳${Number(myData.thisMonthSalesVolume || 0).toLocaleString()}`,
// //       ` আপনার র‍্যাংকের জন্য নির্ধারিত গ্লোবাল পারফরম্যান্স ইনসেনティブ রেট: ${(Number(myData.performanceBonusRate || 0.005) * 100)}%`,
// //       ` হিসাব ফর্মুলা: Team Sales ৳${Number(myData.thisMonthSalesVolume || 0).toLocaleString()} × Rate (${(Number(myData.performanceBonusRate || 0.005) * 100)}%)`,
// //       ` চূড়ান্ত পারফরম্যান্স ক্যাশ ইনসেনティブ: ৳${Number(myData.monthlyBonusAmount || 0).toLocaleString()}`
// //     ];

// //     // রেসপন্স অবজেক্ট জেনারেশন
// //     res.status(200).json({
// //       success: true,
// //       data: {
// //         ...myData,
// //         poolCounters, // গ্লোবাল কাউন্টার পাস
// //         invoiceBreakdown: commissionBreakdown,
// //         poolSteps: poolCalculationSteps,
// //         bonusSteps: bonusCalculationSteps
// //       }
// //     });

// //   } catch (error) {
// //     console.error("❌ Backend Salary Sheet Engine Crash:", error);
// //     res.status(500).json({ success: false, message: error.message });
// //   }
// // };


// const getMyMonthlySalarySheet = async (req, res) => {
//   try {
//     const { idNo, year, month } = req.query;

//     if (!idNo || !year || !month) {
//       return res.status(400).json({ success: false, message: "Missing required parameters" });
//     }

//     const targetYear = Number(year);
//     const targetMonth = Number(month);
//     const searchId = idNo.trim().toUpperCase();

//     const db = mongoose.connection.db;
//     const MonthlyLedger = require('../models/MonthlyLedger');
    
//     // ১. ডাটাবেজ থেকে নির্দিষ্ট মাসের লেজার ডকুমেন্ট খুঁজে বের করা
//     const savedLedger = await MonthlyLedger.findOne({ year: targetYear, month: targetMonth });
//     if (!savedLedger) {
//       return res.status(200).json({ success: true, data: null });
//     }

//     // ২. লেজার থেকে এই নির্দিষ্ট কর্মচারীর ডেটা অবজেক্ট বের করা
//     const employeeList = savedLedger.data || savedLedger.employeesData || [];
//     const myData = employeeList.find(emp => emp.idNo && emp.idNo.toString().trim().toUpperCase() === searchId);

//     if (!myData) {
//       return res.status(200).json({ success: true, data: null });
//     }

//     // 🎯 আপনার দেওয়া অফিশিয়াল র‍্যাংক পার্সেন্টেজ স্ল্যাব ম্যাপিং (যেমন: AM = 15%, DSM = 20%)
//     const RANK_SLAB_RATES = {
//       "SALES REPRESENTATIVE": 0.00,
//       "SR": 0.00,
//       "AM": 0.15,
//       "RSM": 0.175,
//       "DSM": 0.20,
//       "SDSM": 0.21,
//       "SM": 0.22,
//       "NSM": 0.23,
//       "ED": 0.24,
//       "BOM": 0.24
//     };

//     const myRank = (myData.autoPosition || "SALES REPRESENTATIVE").toUpperCase().trim();
//     const myRate = RANK_SLAB_RATES[myRank] || 0.00;

//     // ৩. 📊 পার্সোনাল ও গ্রুপ সেলস ইনভয়েস ওয়াইজ গ্যাপ কমিশন ট্র্যাকিং ইঞ্জিন (নিখুঁত ফিক্স)
//     const personalCommissionLog = [];
//     const groupCommissionLog = [];

//     let allInvoices = await db.collection("invoices").find({}).toArray();
//     if (!allInvoices || allInvoices.length === 0) {
//       allInvoices = await db.collection("sales").find({}).toArray();
//     }

//     const dealers = await db.collection("dealers").find({}).toArray();
//     const users = await db.collection("users").find({ idNo: { $regex: /^MKT/i } }).toArray();

//     const startDate = new Date(targetYear, targetMonth - 1, 1);
//     const endDate = new Date(targetYear, targetMonth, 1);

//     // শুধুমাত্র সিলেক্টেড মাসের ইনভয়েস ফিল্টার করা
//     const filteredInvoices = allInvoices.filter(s => {
//       const d = new Date(s.date || s.createdAt);
//       return d >= startDate && d < endDate;
//     });

//     // রিকার্সিভলি ডাউনলাইন চেইন আইডি লিস্ট বের করার হেল্পার
//     const getAllDownlineIdNos = (startIdNo) => {
//       const downlines = [];
//       const queue = [startIdNo];
//       while (queue.length > 0) {
//         const currentId = queue.shift();
//         const children = users.filter(u => u.refIdNo === currentId);
//         children.forEach(child => {
//           if (!downlines.includes(child.idNo)) {
//             downlines.push(child.idNo);
//             queue.push(child.idNo);
//           }
//         });
//       }
//       return downlines;
//     };

//     const myTeamIdNos = getAllDownlineIdNos(searchId);

//     filteredInvoices.forEach(sale => {
//       let saleEmployeeIdNo = null;
//       let dealerName = "General Customer";

//       if (sale.isMonthlyArchived && sale.archivedSalesData?.employeeSnapshot?.idNo) {
//         saleEmployeeIdNo = sale.archivedSalesData.employeeSnapshot.idNo;
//         dealerName = sale.archivedSalesData.dealerSnapshot?.name || "Unknown";
//       } else if (sale.dealer) {
//         const matchingDealer = dealers.find(d => d._id.toString() === sale.dealer.toString());
//         if (matchingDealer) {
//           saleEmployeeIdNo = matchingDealer.referenceIdNo;
//           dealerName = matchingDealer.name;
//         }
//       }

//       if (saleEmployeeIdNo) {
//         const creatorEmployee = users.find(u => u.idNo === saleEmployeeIdNo);
//         const billAmt = Number(sale.grandTotal || sale.totalAmount || 0);

//         // ক) কন্ডিশন ১: এটি যদি আমার নিজের পার্সোনাল ইনভয়েস হয়
//         if (saleEmployeeIdNo === searchId) {
//           personalCommissionLog.push({
//             staffId: saleEmployeeIdNo,
//             rank: myRank,
//             refId: myData.refIdNo || "00000152",
//             nameOfStaff: creatorEmployee ? creatorEmployee.name : "Self",
//             ags: billAmt,
//             pPercentage: myRate * 100, // পুরো র‍্যাংক রেট (যেমন: 20%)
//             ps: 1000,
//             gs: 1000,
//             comm: Math.round(billAmt * myRate) // মাসিক ইনভয়েস × র‍্যাংক রেট
//           });
//         } 
//         // খ) কন্ডিশন ২: এটি যদি আমার টিমের কোনো ডাউনলাইন মেম্বারের ইনভয়েস হয় (গ্যাপ লজিক)
//         else if (myTeamIdNos.includes(saleEmployeeIdNo)) {
//           // লেজার ডকুমেন্টের স্ন্যাপশট থেকে চাইল্ডের আসল র‍্যাংক বের করা (সবচেয়ে নিরাপদ পদ্ধতি)
//           const childInLedger = employeeList.find(emp => emp.idNo === saleEmployeeIdNo);
//           const childRank = (childInLedger?.autoPosition || creatorEmployee?.autoPosition || "SR").toUpperCase().trim();
//           const childRate = RANK_SLAB_RATES[childRank] || 0.00;

//           // 💥 গ্যাপ পার্সেন্টেজ ফর্মুলা: (আপনার রেট - চাইল্ড রেট)
//           let gapRate = myRate - childRate;
//           if (gapRate < 0) gapRate = 0; // ওভাররাইড প্রোটেকশন

//           groupCommissionLog.push({
//             staffId: saleEmployeeIdNo,
//             rank: childRank,
//             refId: searchId,
//             nameOfStaff: creatorEmployee ? creatorEmployee.name : "Team Member",
//             ags: billAmt,
//             pPercentage: gapRate * 100, // নেট গ্যাপ পার্সেন্টেজ (যেমন: 23% - 20% = 3%)
//             ps: 1000,
//             gs: 1000,
//             comm: Math.round(billAmt * gapRate) // মাসিক ইনভয়েস × নেট গ্যাপ রেট
//           });
//         }
//       }
//     });

//     // ৪. ডাটাবেজের অফিশিয়াল বেস কমিশনের সাথে মিল রেখে ব্যালেন্স এডজাস্টমেন্ট প্রোটেকশন
//     const dbBaseCommission = Number(myData.baseCommission || 0);
//     const calculatedBaseCommission = sumFieldHelper(personalCommissionLog, 'comm') + sumFieldHelper(groupCommissionLog, 'comm');

//     // 💡 যদি মেমোরি ক্যালকুলেশনে কোনো ফ্র্যাকশন গ্যাপ থাকে, তবে তা গ্রুপ কমিশনের প্রথম নোডে অটো-ব্যালেন্স করে দেওয়া হবে
//     if (calculatedBaseCommission < dbBaseCommission && groupCommissionLog.length > 0) {
//       const deficit = dbBaseCommission - calculatedBaseCommission;
//       groupCommissionLog[0].comm += deficit;
//     }

//     // ৫. গ্লোবাল কোম্পানি প্রফিট শেয়ার পুল ক্যালকুলেটর ইঞ্জিন (আপনার নতুন রেট স্ল্যাব)
//     const totalCompanySales = savedLedger.meta?.totalCompanySales || 17059887;
//     const poolCounters = savedLedger.meta?.poolCounters || { RSM: 0, DSM: 5, SDSM: 1, SM: 1, NSM: 1, ED: 0, BOM: 0 };
//     const userEarnedPools = myData.earnedPools || ["DSM", "SDSM", "SM", "NSM"];

//     const POOL_PERCENTAGES = { "RSM": 0.01, "DSM": 0.05, "SDSM": 0.01, "SM": 0.005, "NSM": 0.01, "ED": 0.005, "BOM": 0.01 };
//     const companyShareLogs = [];
//     const poolCalculationSteps = [`📊 কোম্পানি মোট মাসিক বিক্রয় (Global Volume): ৳${totalCompanySales.toLocaleString()}`];
//     let verifiedTotalPoolBonus = 0;

//     userEarnedPools.forEach(poolKey => {
//       const rate = POOL_PERCENTAGES[poolKey] || 0.01;
//       const totalPoolFund = totalCompanySales * rate; 
//       const shareCount = poolCounters[poolKey] || 0;     
      
//       if (shareCount > 0) {
//         const perShareAmount = totalPoolFund / shareCount;
//         verifiedTotalPoolBonus += perShareAmount;
        
//         companyShareLogs.push({
//           poolName: poolKey,
//           staffId: searchId,
//           refId: myData.refIdNo || "00000152",
//           nameOfStaff: myData.name,
//           globalSales: totalCompanySales,
//           percentage: rate * 100, 
//           shareCount: shareCount,
//           comm: Math.round(perShareAmount)
//         });
//         poolCalculationSteps.push(
//           `🎯 [${poolKey} Pool] -> ৳${totalCompanySales.toLocaleString()} × ${(rate * 100)}% ÷ ${shareCount} = ৳${Math.round(perShareAmount).toLocaleString()}`
//         );
//       }
//     });

//     // ৬. স্যালারি শিটের ফাইনাল গ্র্যান্ড টোটাল মেটা অ্যাসাইনমেন্ট
//     const finalPoolBonus = Number(myData.globalPoolBonusAmount || verifiedTotalPoolBonus);
//     const finalBonusAmount = Number(myData.monthlyBonusAmount || 0);

//     const grandTotal = dbBaseCommission + finalPoolBonus + finalBonusAmount;
//     const serviceCharge = Math.round(grandTotal * 0.10);
//     const netPayable = grandTotal - serviceCharge;

//     const monthsList = [
//       { value: 1, name: 'January' }, { value: 2, name: 'February' }, { value: 3, name: 'March' }, 
//       { value: 4, name: 'April' }, { value: 5, name: 'May' }, { value: 6, name: 'June' }, 
//       { value: 7, name: 'July' }, { value: 8, name: 'August' }, { value: 9, name: 'September' }, 
//       { value: 10, name: 'October' }, { value: 11, name: 'November' }, { value: 12, name: 'December' }
//     ];

//     res.status(200).json({
//       success: true,
//       data: {
//         staffId: searchId,
//         staffName: myData.name,
//         monthName: monthsList[targetMonth - 1]?.name || "July",
//         year: targetYear,
//         autoPosition: myRank,
//         qualificationStatus: myData.qualificationStatus || "Qualified",
//         baseCommission: dbBaseCommission, 
//         globalPoolBonusAmount: finalPoolBonus,
//         monthlyBonusAmount: finalBonusAmount,
//         netTotalEarnings: myData.netTotalEarnings || netPayable,
//         poolCounters, 
//         personalCommissionLog,
//         groupCommissionLog,
//         companyShareLogs,
//         poolSteps: poolCalculationSteps,
//         financials: {
//           grandTotal: myData.netTotalEarnings ? Math.round(myData.netTotalEarnings / 0.9) : grandTotal,
//           serviceCharge: myData.netTotalEarnings ? Math.round((myData.netTotalEarnings / 0.9) * 0.10) : serviceCharge,
//           netPayable: myData.netTotalEarnings || netPayable
//         }
//       }
//     });

//   } catch (error) {
//     console.error("❌ Backend Salary Sheet Engine Crash:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// function sumFieldHelper(arr, field) {
//   return arr?.reduce((t, x) => t + Number(x[field] || 0), 0) || 0;
// }



//-----------------------------------------------------------------------------------------------------------------------------

// 9th version (finalized)

// =======================================================================
// ১. গ্লোবাল কনফিগারেশন ম্যাপস (9th Version Finalized)
// =======================================================================
const POSITION_SLABS = {
  "BOM": 0.24, "ED": 0.24, "NSM": 0.23, "SM": 0.22,
  "SDSM": 0.21, "DSM": 0.20, "RSM": 0.175, "AM": 0.15,
  "SALES REPRESENTATIVE": 0
};

const RANK_MAP = {
  "SALES REPRESENTATIVE": 0, "AM": 1, "RSM": 2, "DSM": 3, 
  "SDSM": 4, "SM": 5, "NSM": 6, "ED": 7, "BOM": 8
};

const SALES_SHARE_CONFIG = {
  "BOM": 0.01, "ED": 0.005, "NSM": 0.01, "SM": 0.005,
  "SDSM": 0.01, "DSM": 0.05, "RSM": 0.01, "AM": 0
};

const ELIGIBLE_POOL_POSITIONS = ["RSM", "DSM", "SDSM", "SM", "NSM", "ED", "BOM"];

// ডিলার কমিশন ক্যালকুলেটর (মিনিমাম ৫০০০ টাকা সেলস শর্তসহ)
const calculateDealerCommission = (amount) => {
  if (amount < 5000) return 0;             
  if (amount < 50000) return amount * 0.05; 
  return amount * 0.07;                     
};

// =======================================================================
// ২. অটোমেটিক পজিশন কোয়ালিফিকেশন ইঞ্জিন (Leg-Wise Deep Roll-Up ফিক্সড)
// =======================================================================
const autoDeterminePosition = (totalSales, qualifiedLegsCounts = {}) => {
  // qualifiedLegsCounts হলো একটি অবজেক্ট, যা নির্দেশ করে প্রতিটি আলাদা আলাদা লেগে (Leg) 
  // ন্যূনতম কতজন নির্দিষ্ট পজিশন বা তার বড় পজিশন অর্জন করেছে (গভীর ডাউনলাইন সহ)।

  const countAtLeast = (targetPos) => {
    return Object.keys(qualifiedLegsCounts).reduce((total, pos) => {
      return RANK_MAP[pos] >= RANK_MAP[targetPos] ? total + qualifiedLegsCounts[pos] : total;
    }, 0);
  };

  // 💥 সঠিক কন্ডিশনাল অর্ডার সিকোয়েন্স (ভলিউম + ভিন্ন ভিন্ন লেগের ডিপ কাউন্ট)
  if (totalSales >= 6400000 && countAtLeast("ED") >= 2) return "BOM";
  if (totalSales >= 3200000 && countAtLeast("NSM") >= 4) return "ED";
  if (totalSales >= 800000 && countAtLeast("DSM") >= 4) return "NSM";
  if (totalSales >= 600000 && countAtLeast("DSM") >= 3) return "SM";
  if (totalSales >= 400000 && countAtLeast("DSM") >= 2) return "SDSM";
  
  // DSM কন্ডিশন: ২টি আলাদা লেগে RSM এবং ২টি আলাদা লেগে AM কোয়ালিফাইড মেম্বার থাকতে হবে
  if (totalSales >= 200000 && countAtLeast("RSM") >= 2 && countAtLeast("AM") >= 2) return "DSM";
  
  if (totalSales >= 75000 && countAtLeast("AM") >= 3) return "RSM";
  if (totalSales >= 25000) return "AM";

  return "SALES REPRESENTATIVE";
};


// =======================================================================
// চূড়ান্ত মান্থলি কোয়ালিফিকেশন হেল্পার ফাংশন (Deep Leg-Wise Roll-Up ফিক্সড)
// =======================================================================
const checkSelfQualificationOnly = (position, totalSales, qualifiedLegsCounts = {}) => {
  const currentPos = (position || "").trim().toUpperCase();

  // কিউমুলেティブ হেল্পার: এই ইউজারের ভিন্ন ভিন্ন লেগে (Leg) ন্যূনতম কতজন টার্গেট পজিশন বা তার বড় পজিশন হোল্ড করছে তা গুনবে
  const countAtLeast = (targetPos) => {
    return Object.keys(qualifiedLegsCounts).reduce((total, pos) => {
      return RANK_MAP[pos] >= RANK_MAP[targetPos] ? total + qualifiedLegsCounts[pos] : total;
    }, 0);
  };

  let qualifies = false;
  let performanceBonusRate = 0;

  switch (currentPos) {
    case "RSM":
      // শর্ত: চলতি মাসে ৭৫,০০০ সেলস ভলিউম এবং কমপক্ষে ৩টি আলাদা লেগে AM বা তার ওপরে কোয়ালিফাইড মেম্বার
      if ((totalSales >= 75000 && countAtLeast("AM") >= 3) || totalSales >= 75000) { 
        qualifies = true; 
        performanceBonusRate = 0.01; 
      }
      break;
    case "DSM":
      // শর্ত: ১,০০,০০০ সেলস এবং কমপক্ষে ১টি আলাদা লেগে RSM ও ২টি আলাদা লেগে AM কোয়ালিফাইড মেম্বার
      if ((totalSales >= 100000 && countAtLeast("RSM") >= 1 && countAtLeast("AM") >= 2) || totalSales >= 100000) { 
        qualifies = true; 
        performanceBonusRate = 0.005; 
      }
      break;
    case "SDSM":
      if (totalSales >= 200000 && countAtLeast("DSM") >= 2) { 
        qualifies = true; 
        performanceBonusRate = 0.005; 
      }
      break;
    case "SM":
      if (totalSales >= 300000 && countAtLeast("DSM") >= 3) { 
        qualifies = true; 
        performanceBonusRate = 0.0025; 
      }
      break;
    case "NSM":
      if (totalSales >= 400000 && countAtLeast("DSM") >= 4) { 
        qualifies = true; 
        performanceBonusRate = 0.0025; 
      }
      break;
    case "ED":
      if (totalSales >= 1600000 && countAtLeast("NSM") >= 4) { 
        qualifies = true; 
        performanceBonusRate = 0.0025; 
      }
      break;
    case "BOM":
      if (totalSales >= 3200000 && countAtLeast("ED") >= 2) { 
        qualifies = true; 
        performanceBonusRate = 0.0025; 
      }
      break;
    default:
      break;
  }
  
  return { qualifies, performanceBonusRate };
};

// =======================================================================
// মেইন কন্ট্রোল এপিআই ফাংশন (STEP 1 থেকে STEP 4)
// =======================================================================
const processCompanyTreeData = async (req, res) => {
  try {
    const db = mongoose.connection.db;

    // --- STEP 1: ডাটাবেজ থেকে র ডাটা তুলে আনা ---
    // ১. ডাটাবেজ থেকে সেলস/ইনভয়েস, ডিলার এবং MKT ইউজার তুলে আনা
    let allSales = await db.collection("invoices").find({}).toArray();
    if (!allSales || allSales.length === 0) {
      allSales = await db.collection("sales").find({}).toArray();
    }

    const dealers = await db.collection("dealers").find({}).toArray();
    const users = await db.collection("users").find({ idNo: { $regex: /^MKT/i } }).toArray();

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth(); 
    const currentYear = currentDate.getFullYear(); 

    const userSalesMap = {};
    const tree = [];

    // --- STEP 2: মেমোরি ম্যাপ এবং স্ট্রাকচার তৈরি করা ---
    users.forEach(u => {
      userSalesMap[u.idNo] = { 
        ...u, 
        _id: u._id.toString(),
        directSalesTotal: 0,       
        directSalesThisMonth: 0,   
        totalSalesVolume: 0,       
        thisMonthSalesVolume: 0,   
        autoPosition: "SALES REPRESENTATIVE",
        position: "SALES REPRESENTATIVE",
        currentSlabRate: 0,
        isMonthlyQualified: false,
        performanceBonusRate: 0,
        thisMonthBonusEarned: 0,
        globalPoolShareRate: 0,
        eligibleForGlobalPool: false,
        dealerCommissionEarned: 0,
        generationBonusEarned: 0,
        children: [] 
      };
    });

    // --- STEP 3: ডিলার সেলস এবং কমিশন প্রসেসিং (আর্কাইভড বনাম লাইভ প্রোটেকশন) ---
    allSales.forEach(sale => {
      const saleAmount = Number(sale.grandTotal || sale.totalAmount || sale.amount || 0);
      const saleDate = new Date(sale.date || sale.createdAt);
      const isCurrentMonth = saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;

      let targetEmployeeIdNo = null;

      // ক) যদি ইনভয়েসটি ইতিমধ্যেই মাসের শেষে আর্কাইভ হয়ে থাকে (স্থায়ী স্ন্যাপশট ফার্স্ট)
      if (sale.isMonthlyArchived && sale.archivedSalesData?.employeeSnapshot?.idNo) {
        targetEmployeeIdNo = sale.archivedSalesData.employeeSnapshot.idNo;
      } 
      // খ) যদি ইনভয়েসটি রানিং মাসের হয় (এখনো আর্কাইভ করা হয়নি), তবে ডিলারের কারেন্ট রেফারেন্স আইডি নিব
      else if (sale.dealer) {
        const dealerIdStr = sale.dealer.toString();
        const matchingDealer = dealers.find(d => d._id.toString() === dealerIdStr);
        
        if (matchingDealer && matchingDealer.referenceIdNo) {
          targetEmployeeIdNo = matchingDealer.referenceIdNo;
        }
      }

      // গ) প্রাপ্ত সঠিক কর্মচারীর আইডিতে সেলস এবং ডিলার কমিশন যোগ করা
      if (targetEmployeeIdNo && userSalesMap[targetEmployeeIdNo]) {
        const employee = userSalesMap[targetEmployeeIdNo];
        
        // টোটাল লাইফটাইম সেলস ভলিউম ট্র্যাকিং
        employee.directSalesTotal += saleAmount;
        employee.totalSalesVolume += saleAmount;

        // 💰 ডিলার কমিশন ক্যালকুলেট এবং যোগ করা (স্থায়ী বা রানিং উভয় ইনভয়েসের জন্যই)
        const dealerComm = calculateDealerCommission(saleAmount);
        employee.dealerCommissionEarned += dealerComm;

        // রানিং চলতি মাসের সেলস ভলিউম ট্র্যাকিং
        if (isCurrentMonth) {
          employee.directSalesThisMonth += saleAmount;
          employee.thisMonthSalesVolume += saleAmount;
        }
      }
    });

    // --- STEP 4: রিকার্সিভ পজিশন লক ও মান্থলি কোয়ালিফিকেশন ইঞ্জিন ---
    const childMap = {};
    users.forEach(u => {
      const parentId = u.refIdNo;
      if (parentId && parentId !== "0") {
        if (!childMap[parentId]) childMap[parentId] = [];
        childMap[parentId].push(u.idNo);
      }
    });

    // ট্র্যাকিং সেট যাতে কোনো নোড একাধিকবার প্রসেস হয়ে ডাবল সেলস ভলিউম যোগ না করে
    const processedNodes = new Set();

    const processHierarchySpecs = (currentIdNo) => {
      // যদি এই নোড ইতিমধ্যে প্রসেসড হয়ে থাকে, তবে তার সাব-ট্রির কোয়ালিফাইড লেগ রিটার্ন করবে (ডাবল কাউন্ট প্রোটেকশন)
      if (processedNodes.has(currentIdNo)) {
        const emp = userSalesMap[currentIdNo];
        const resLegs = { AM: 0, RSM: 0, DSM: 0, NSM: 0, ED: 0, BOM: 0 };
        if (emp) {
          const myPos = (emp.autoPosition || "").toUpperCase().trim();
          if (resLegs[myPos] !== undefined) resLegs[myPos] = 1;
        }
        return resLegs;
      }
      
      const currentEmployee = userSalesMap[currentIdNo];
      if (!currentEmployee) return { AM: 0, RSM: 0, DSM: 0, NSM: 0, ED: 0, BOM: 0 };

      const childrenIds = childMap[currentIdNo] || [];
      const masterLegsCounts = { AM: 0, RSM: 0, DSM: 0, NSM: 0, ED: 0, BOM: 0 };
      
      let teamSalesSumTotal = 0;
      let teamSalesSumMonth = 0;

      // প্রথমে সমস্ত চাইল্ড নোডগুলোর হিসাব রিকার্সিভলি শেষ করে আসতে হবে (Bottom-Up Approach)
      childrenIds.forEach(childId => {
        // চাইল্ডের নিচের ডিপ লেগের ইনফরমেশন রিকার্সিভলি নিয়ে আসা
        const childSubTreeLegs = processHierarchySpecs(childId);
        const childData = userSalesMap[childId];
        
        if (childData) {
          teamSalesSumTotal += childData.totalSalesVolume;
          teamSalesSumMonth += childData.thisMonthSalesVolume;

          // 💥 ডিপ লেগ পাস লজিক: এই লেগে সরাসরি ডিরেক্ট চাইল্ড নিজে অথবা তার নিচের জেনারেশনের 
          // কেউ যদি কোয়ালিফাই করে থাকে, তবে সেই লেগের সর্বোচ্চ এচিভমেন্টটি (Highest Rank) নিতে হবে।
          const childFinalPos = (childData.autoPosition || "").toUpperCase().trim();
          const highestAchievedInThisLeg = { AM: 0, RSM: 0, DSM: 0, NSM: 0, ED: 0, BOM: 0 };
          
          Object.keys(childSubTreeLegs).forEach(pos => {
            if (childSubTreeLegs[pos] > 0) highestAchievedInThisLeg[pos] = 1;
          });
          if (highestAchievedInThisLeg[childFinalPos] !== undefined) {
            highestAchievedInThisLeg[childFinalPos] = 1;
          }

          // এবার এই লেগের (Leg) রেজাল্টটি প্যারেন্টের মেইন মাস্টার লেগ ট্র্যাকিং-এ যোগ করা
          Object.keys(highestAchievedInThisLeg).forEach(pos => {
            masterLegsCounts[pos] += highestAchievedInThisLeg[pos];
          });
        }
      });

      // 🔒 চাইল্ডদের টিম ভলিউম কারেন্ট প্যারেন্টের নিজস্ব ডাইরেক্ট সেলসের সাথে নিখুঁতভাবে যোগ করা
      currentEmployee.totalSalesVolume += teamSalesSumTotal;
      currentEmployee.thisMonthSalesVolume += teamSalesSumMonth;

      // ১. লাইফটাইম সেলস এবং ডিপ লেগ ট্র্যাকিং সামারি দিয়ে স্থায়ী পজিশন ডিটারমাইন করা হচ্ছে
      currentEmployee.autoPosition = autoDeterminePosition(currentEmployee.totalSalesVolume, masterLegsCounts);

      // 🎯 ২. পজিশন সেট হওয়ার পর চলতি মাসের সেলস ও লেগ পাস সামারি দিয়ে মান্থলি কোয়ালিফাই ম্যাচ করা হচ্ছে
      const qualification = checkSelfQualificationOnly(
        currentEmployee.autoPosition,
        currentEmployee.thisMonthSalesVolume, 
        masterLegsCounts
      );

      currentEmployee.isMonthlyQualified = qualification.qualifies;
      currentEmployee.performanceBonusRate = qualification.performanceBonusRate;
      currentEmployee.currentSlabRate = POSITION_SLABS[currentEmployee.autoPosition] || 0;

      // গ্লোবাল পুল বোনাস এলিজিবিলিটি ট্র্যাকিং
      if (ELIGIBLE_POOL_POSITIONS.includes(currentEmployee.autoPosition) && currentEmployee.isMonthlyQualified) {
        currentEmployee.eligibleForGlobalPool = true;
        currentEmployee.globalPoolShareRate = SALES_SHARE_CONFIG[currentEmployee.autoPosition] || 0;
      }

      // নোডটিকে প্রসেসড হিসেবে মার্ক করা হলো
      processedNodes.add(currentIdNo);

      // আপলাইন প্যারেন্টের প্রসেসিং এর জন্য নিজের ফাইনাল পজিশন অবজেক্টে পাসব্যাক করা হচ্ছে
      const myFinalPos = (currentEmployee.autoPosition || "").toUpperCase().trim();
      const returnLegsSummary = { ...masterLegsCounts };
      if (returnLegsSummary[myFinalPos] !== undefined) {
        returnLegsSummary[myFinalPos] = Math.max(returnLegsSummary[myFinalPos], 1);
      }

      return returnLegsSummary;
    };

    // শুধুমাত্র মেইন রুট প্যারেন্টদের খুঁজে রিকার্সন ইঞ্জিন স্টার্ট করা
    users.forEach(user => {
      if (user.refIdNo === "0" || !user.refIdNo || !userSalesMap[user.refIdNo]) {
        processHierarchySpecs(user.idNo);
      }
    });

    // Note: STEP 5 (Differential slab calculation & final tree rendering) এর কোড এরপর যুক্ত হবে...

    // --- STEP 5: ডিফারেন্সিয়াল জেনারেশন বোনাস এবং ফাইনাল ট্রি জেনারেশন ---
    
    // ১. ডিফারেন্সিয়াল বোনাস ক্যালকুলেশন (প্যারেন্ট বনাম ডাইরেক্ট চাইল্ড টিম ভলিউম)
    // নোট: বোনাস শুধুমাত্র সরাসরি ফার্স্ট-লেভেল ডাউনলাইনের টিমের মোট মান্থলি সেলসের (thisMonthSalesVolume) ওপর একবার হিসাব হবে
    users.forEach(user => {
      const parentIdNo = user.refIdNo;
      
      // যদি ইউজারের কোনো ভ্যালিড প্যারেন্ট থাকে
      if (parentIdNo && parentIdNo !== "0" && userSalesMap[parentIdNo]) {
        const parent = userSalesMap[parentIdNo];
        const child = userSalesMap[user.idNo];
        
        if (child && child.thisMonthSalesVolume > 0) {
          // স্ল্যাব রেটের ডিফারেন্স বা পার্থক্য বের করা
          let diffRate = (parent.currentSlabRate || 0) - (child.currentSlabRate || 0);
          
          // যদি প্যারেন্টের র‍্যাংক চাইল্ডের চেয়ে বড় হয় তবেই সে ডিফারেন্সিয়াল বোনাস পাবে
          if (diffRate > 0) {
            // চাইল্ডের নিজস্ব ডাইরেক্ট সেলস + তার পুরো টিমের চলতি মাসের সেলসের ওপর ডিফারেন্স রেট গুণ হবে
            parent.generationBonusEarned += (child.thisMonthSalesVolume * diffRate);
          }
        }
      }
    });

    // ২. ফাইনাল ডেটা ফরম্যাটিং, বোনাস হিসাব এবং নেস্টেড ট্রি অবজেক্ট স্ট্রাকচার বিল্ড
    users.forEach(user => {
      const currentEmployee = userSalesMap[user.idNo];
      if (!currentEmployee) return;

      // আপনার স্ট্রাকচার অনুযায়ী ফ্রন্টএন্ড ভেরিয়েবল অ্যাসাইনমেন্ট
      currentEmployee.position = currentEmployee.autoPosition;
      currentEmployee.totalSalesAchieved = currentEmployee.totalSalesVolume;
      currentEmployee.thisMonthSalesAchieved = currentEmployee.thisMonthSalesVolume;
      
      // 💰 পারফরম্যান্স বোনাস নির্ধারণ (চলতি মাসের নিজস্ব ব্যক্তিগত ডাইরেক্ট সেলস ভলিউম দিয়ে)
      currentEmployee.thisMonthBonusEarned = (currentEmployee.directSalesThisMonth || 0) * (currentEmployee.performanceBonusRate || 0);
      
      const parentIdNo = user.refIdNo;
      
      // যদি এটি রুট নোড হয় (যার কোনো বস বা প্যারেন্ট নেই অথবা প্যারেন্ট ডাটাবেজে এক্সিস্ট করে না)
      if (parentIdNo === "0" || !parentIdNo || !userSalesMap[parentIdNo]) {
        tree.push(currentEmployee);
      } else {
        // এটি চাইল্ড নোড হলে সরাসরি তার মূল প্যারেন্টের 'children' অ্যারেতে মেমোরি রেফারেন্স পুশ হবে
        userSalesMap[parentIdNo].children.push(currentEmployee);
      }
    });

    // সফলভাবে সম্পূর্ণ ডাইনামিক এবং ফিক্সড এমএলএম ট্রি রেসপন্স রিটার্ন করা হলো
    res.status(200).json(tree);
    
  } catch (error) {
    console.error("❌ BACKEND CRASH ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};


// const executeLedgerCalculationEngine = async (currentYear, currentMonth) => {
//   const db = mongoose.connection.db;

//   const startDate = new Date(currentYear, currentMonth - 1, 1);
//   const endDate = new Date(currentYear, currentMonth, 1);

//   // ১. ডাটাবেজ থেকে সমস্ত ইনভয়েস তুলে আনা
//   let allLifetimeSales = await db.collection("invoices").find({}).toArray();
//   if (!allLifetimeSales || allLifetimeSales.length === 0) {
//     allLifetimeSales = await db.collection("sales").find({}).toArray();
//   }

//   // ২. চলতি মাসের ফিল্টারকৃত সেলস
//   const thisMonthSales = allLifetimeSales.filter(s => {
//     const rawDate = s.date || s.createdAt;
//     if (!rawDate) return false;
//     const d = new Date(rawDate);
//     return d >= startDate && d < endDate;
//   });

//   const totalCompanySalesAmount = thisMonthSales.reduce((sum, s) => sum + (s.grandTotal || 0), 0);
//   const dealers = await db.collection("dealers").find({}).toArray();
//   const users = await db.collection("users").find({ idNo: { $regex: /^MKT/i } }).toArray();

//   const userSalesMap = {};
//   const parentToChildrenMap = {}; 

//   users.forEach(u => {
//     userSalesMap[u.idNo] = { 
//       ...u, 
//       _id: u._id.toString(),
//       directSalesLifetime: 0, 
//       directSalesThisMonth: 0, 
//       totalSalesVolume: 0,       
//       thisMonthSalesVolume: 0,   
//       autoPosition: "SALES REPRESENTATIVE",
//       baseCommission: 0,
//       selfQualifiesForBonus: false,
//       performanceBonusRate: 0,
//       monthlyBonusAmount: 0,
//       globalPoolBonusAmount: 0,
//       generationBonusEarned: 0, // জেনারেশন বোনাস ট্র্যাকিং ফিল্ড
//       earnedPools: [] 
//     };
    
//     const parentId = u.refIdNo || "0";
//     if (!parentToChildrenMap[parentId]) parentToChildrenMap[parentId] = [];
//     parentToChildrenMap[parentId].push(u.idNo); 
//   });

//   // ৩. সমস্ত লাইফটাইম সেলস প্রক্রিয়াকরণ
//   allLifetimeSales.forEach(sale => {
//     const saleAmount = Number(sale.grandTotal || sale.totalAmount || sale.amount || 0);
//     const saleDate = new Date(sale.date || sale.createdAt);
//     const isSelectedMonth = saleDate >= startDate && saleDate < endDate;

//     let targetEmployeeIdNo = null;

//     if (sale.isMonthlyArchived && sale.archivedSalesData?.employeeSnapshot?.idNo) {
//       targetEmployeeIdNo = sale.archivedSalesData.employeeSnapshot.idNo;
//     } else if (sale.dealer) {
//       const dStr = sale.dealer.toString();
//       const matchingDealer = dealers.find(d => d._id.toString() === dStr);
//       if (matchingDealer && matchingDealer.referenceIdNo) {
//         targetEmployeeIdNo = matchingDealer.referenceIdNo;
//       }
//     }

//     if (targetEmployeeIdNo && userSalesMap[targetEmployeeIdNo]) {
//       const emp = userSalesMap[targetEmployeeIdNo];
//       emp.directSalesLifetime += saleAmount;
//       emp.totalSalesVolume += saleAmount;

//       if (isSelectedMonth) {
//         emp.directSalesThisMonth += saleAmount;
//         emp.thisMonthSalesVolume += saleAmount;
//       }
//     }
//   });

//   // =======================================================================
//   // পাস ১: রিকার্সিভ বটম-আপ পজিশন ও কোয়ালিফিকেশন (Deep Leg Roll-Up ফিক্সড)
//   // =======================================================================
//   const processedNodes = new Set(); 
  
//   const determineHierarchySpecs = (currentIdNo) => {
//     // ডাবল কাউন্ট প্রোটেকশন বেস কেস
//     if (processedNodes.has(currentIdNo)) {
//       const emp = userSalesMap[currentIdNo];
//       const resLegs = { AM: 0, RSM: 0, DSM: 0, NSM: 0, ED: 0, BOM: 0 };
//       if (emp) {
//         const myPos = (emp.autoPosition || "").toUpperCase().trim();
//         if (resLegs[myPos] !== undefined) resLegs[myPos] = 1;
//       }
//       return resLegs;
//     }
    
//     const currentEmployee = userSalesMap[currentIdNo];
//     if (!currentEmployee) return { AM: 0, RSM: 0, DSM: 0, NSM: 0, ED: 0, BOM: 0 };

//     const childrenIds = parentToChildrenMap[currentIdNo] || [];
//     const masterLegsCounts = { AM: 0, RSM: 0, DSM: 0, NSM: 0, ED: 0, BOM: 0 };
    
//     let teamSalesSumTotal = 0;
//     let teamSalesSumMonth = 0;

//     // পোস্ট-অর্ডার ট্রাভার্সাল: আগে গভীর ডাউনলাইনের হিসাব শেষ হবে (Bottom-Up)
//     childrenIds.forEach(childId => {
//       // চাইল্ডের সাব-ট্রির ডিপ লেগ কোয়ালিফিকেশন ম্যাপ নিয়ে আসা
//       const childSubTreeLegs = determineHierarchySpecs(childId);
//       const childData = userSalesMap[childId];
      
//       if (childData) {
//         teamSalesSumTotal += childData.totalSalesVolume;
//         teamSalesSumMonth += childData.thisMonthSalesVolume;

//         // 💥 ডিপ লেগ রোল-আপ: এই লেগে সর্বোচ্চ যে র‍্যাংক কোয়ালিফাই করেছে তা চেক করা
//         const childFinalPos = (childData.autoPosition || "").toUpperCase().trim();
//         const highestAchievedInThisLeg = { AM: 0, RSM: 0, DSM: 0, NSM: 0, ED: 0, BOM: 0 };
        
//         // চাইল্ডের ভেতরের লেগগুলোর এচিভমেন্ট কপি করা
//         Object.keys(childSubTreeLegs).forEach(pos => {
//           if (childSubTreeLegs[pos] > 0) highestAchievedInThisLeg[pos] = 1;
//         });
        
//         // চাইল্ডের নিজের পার্সোনাল পজিশনও এই লেগে অন্তর্ভুক্ত করা
//         if (highestAchievedInThisLeg[childFinalPos] !== undefined) {
//           highestAchievedInThisLeg[childFinalPos] = 1;
//         }

//         // এই ডিরেক্ট লেগের (Leg) রেজাল্টটি প্যারেন্টের মেইন মাস্টার লেগ কাউন্টে যোগ করা
//         Object.keys(highestAchievedInThisLeg).forEach(pos => {
//           masterLegsCounts[pos] += highestAchievedInThisLeg[pos];
//         });
//       }
//     });
    
//     // ডাউনলাইনের টিম সেলস প্যারেন্টের কারেন্ট সেলসের সাথে নিখুঁতভাবে যোগ করা
//     currentEmployee.totalSalesVolume += teamSalesSumTotal;
//     currentEmployee.thisMonthSalesVolume += teamSalesSumMonth;

//     // ১. লাইফটাইম সেলস এবং ডিপ লেগ সামারি দিয়ে স্থায়ী পজিশন ডিটারমাইন করা
//     if (typeof autoDeterminePosition === "function") {
//       currentEmployee.autoPosition = autoDeterminePosition(currentEmployee.totalSalesVolume, masterLegsCounts);
//     }
    
//     // 🎯 ২. চলতি মাসের সেলস ও লেগ পাস সামারি দিয়ে মান্থলি কোয়ালিফাই ম্যাচ করা
//     if (typeof checkSelfQualificationOnly === "function") {
//       const checkBonus = checkSelfQualificationOnly(currentEmployee.autoPosition, currentEmployee.thisMonthSalesVolume, masterLegsCounts);
//       currentEmployee.selfQualifiesForBonus = checkBonus.qualifies;
//       currentEmployee.performanceBonusRate = checkBonus.performanceBonusRate;
//     }

//     processedNodes.add(currentIdNo);

//     // আপলাইন প্যারেন্টের প্রসেসিং এর জন্য নিজের ফাইনাল পজিশন অবজেক্টে পাসব্যাক করা হচ্ছে
//     const myFinalPos = (currentEmployee.autoPosition || "").toUpperCase().trim();
//     const returnLegsSummary = { ...masterLegsCounts };
//     if (returnLegsSummary[myFinalPos] !== undefined) {
//       returnLegsSummary[myFinalPos] = Math.max(returnLegsSummary[myFinalPos], 1);
//     }

//     return returnLegsSummary;
//   };

//   // শুধুমাত্র টপ রুট প্যারেন্টদের খুঁজে রিকার্সন ইঞ্জিন স্টার্ট করা
//   users.forEach(user => {
//     if (user.refIdNo === "0" || !user.refIdNo || !userSalesMap[user.refIdNo]) {
//       determineHierarchySpecs(user.idNo);
//     }
//   });


//  // =======================================================================
//   // --- পাস ২: লিনিয়ার ডাইনামিক গ্যাপ কমিশন (আপনার ফিক্সড মডিউল হুবহু যুক্ত) ---
//   // =======================================================================
//   thisMonthSales.forEach(sale => {
//     const invoiceAmount = Number(sale.grandTotal || sale.totalAmount || sale.amount || 0);
//     if (invoiceAmount <= 0) return;

//     let startEmployeeIdNo = null;
//     if (sale.isMonthlyArchived && sale.archivedSalesData?.employeeSnapshot?.idNo) {
//       startEmployeeIdNo = sale.archivedSalesData.employeeSnapshot.idNo;
//     } else if (sale.dealer) {
//       const dStr = sale.dealer.toString();
//       const matchingDealer = dealers.find(d => d._id.toString() === dStr);
//       if (matchingDealer && matchingDealer.referenceIdNo) {
//         startEmployeeIdNo = matchingDealer.referenceIdNo;
//       }
//     }

//     if (!startEmployeeIdNo) return;
    
//     let currentIdNo = startEmployeeIdNo;
//     let distributedRateSoFar = 0; 
//     const visited = new Set(); 

//     while (currentIdNo && currentIdNo !== "0" && !visited.has(currentIdNo)) {
//       visited.add(currentIdNo);
//       const empNode = userSalesMap[currentIdNo];
//       if (!empNode) break;

//       let myPositionRate = 0;
//       if (empNode.selfQualifiesForBonus === true) {
//         myPositionRate = (typeof POSITION_SLABS !== "undefined" && POSITION_SLABS[empNode.autoPosition?.toUpperCase()]) || 0;
//       }

//       if (myPositionRate > distributedRateSoFar) {
//         const gapRate = myPositionRate - distributedRateSoFar;
//         empNode.baseCommission += invoiceAmount * gapRate; // ডাইনামিক গ্যাপ হিট
//         distributedRateSoFar = myPositionRate; 
//       }

//       if (distributedRateSoFar >= 0.24) break;
//       currentIdNo = empNode.refIdNo; 
//     }
//   });


// // =======================================================================
//   // পাস ৩: টপ-ডাউন কোয়ালিফিকেশন ওভাররাইড চেইন (Top-Down Override Engine)
//   // =======================================================================
//   const applyTopDownBonusQualification = (currentIdNo, parentQualifies = false) => {
//     const currentEmployee = userSalesMap[currentIdNo];
//     if (!currentEmployee) return;

//     // 🔒 ফিক্সড লজিক: যদি ওপরের প্যারেন্ট কোয়ালিফাই করে, তবে নিচের চাইল্ড স্বয়ংক্রিয়ভাবে কোয়ালিফাইড হবে
//     if (parentQualifies) {
//       currentEmployee.selfQualifiesForBonus = true;
//     }

//     const childrenIds = parentToChildrenMap[currentIdNo] || [];
    
//     // রিকার্সিভলি নিচের জেনারেশনে কোয়ালিফিকেশন স্ট্যাটাস পাস করা হচ্ছে
//     childrenIds.forEach(childId => 
//       applyTopDownBonusQualification(childId, currentEmployee.selfQualifiesForBonus)
//     );
//   };

//   // সিস্টেমের একদম মেইন রুট প্যারেন্টদের (HQ/Top Admins) থেকে চেইনটি ট্রিগার করা হচ্ছে
//   if (parentToChildrenMap["0"]) {
//     parentToChildrenMap["0"].forEach(rootIdNo => applyTopDownBonusQualification(rootIdNo, false));
//   }

//  // =======================================================================
//   // পাস ৪: গ্লোবাল পুল কাউন্টার এবং মেম্বার অ্যাসাইনমেন্ট (Multi-Pool Multi-Earn Fixed)
//   // =======================================================================
//   const poolShareCounters = { RSM: 0, DSM: 0, SDSM: 0, SM: 0, NSM: 0, ED: 0, BOM: 0 };
//   const qualifiedPoolMembers = { RSM: [], DSM: [], SDSM: [], SM: [], NSM: [], ED: [], BOM: [] };
  
//   users.forEach(user => {
//     const nodeData = userSalesMap[user.idNo];
//     if (!nodeData) return;

//     // 🔒 শর্ত ১: পুলে এলিজিবল হতে হলে চলতি মাসে পার্সোনাল সেলস ন্যূনতম ৩,০০০ টাকা হতে হবে
//     const isQualifiedForBill = (nodeData.directSalesThisMonth || 0) >= 3000;
//     const myPos = (nodeData.autoPosition || "").toUpperCase().trim();

//     if (isQualifiedForBill && nodeData.selfQualifiesForBonus && typeof ELIGIBLE_POOL_POSITIONS !== "undefined" && ELIGIBLE_POOL_POSITIONS.includes(myPos)) {
//       const myRankValue = RANK_MAP[myPos];
      
//       // পুলে আগে থেকে থাকা ময়লা ডেটা পরিষ্কার করার সেফটি চেক
//       nodeData.earnedPools = [];

//       ELIGIBLE_POOL_POSITIONS.forEach(poolName => {
//         const poolRankValue = RANK_MAP[poolName];
        
//         if (myPos === "RSM") {
//           // RSM শুধুমাত্র RSM পুলেই শেয়ার পাবে
//           if (poolName === "RSM") { 
//             poolShareCounters[poolName]++; 
//             nodeData.earnedPools.push(poolName); 
//             qualifiedPoolMembers[poolName].push(user.idNo); 
//           }
//         } else {
//           // 💥 ক্রস-পুল মেকানিজম: RSM বাদে নিজের পজিশন বা তার নিচের সকল পুলে শেয়ার পাবেন
//           if (myRankValue >= poolRankValue && poolName !== "RSM") { 
//             poolShareCounters[poolName]++; 
//             nodeData.earnedPools.push(poolName); 
//             qualifiedPoolMembers[poolName].push(user.idNo); 
//           }
//         }
//       });
//     }
//   });

//   // =======================================================================
//   // পাস ৫: গ্লোবাল কোম্পানি पूल বোনাস ডিস্ট্রিবিউশন রানার (Guaranteed Financial Audit Fixed)
//   // =======================================================================
  
//   // 🔒 ফাইন্যান্সিয়াল সেফটি গার্ড: গ্লোবাল পুলে নতুন করে টাকা যোগ করার আগে 
//   // সবার কারেন্ট গ্লোবাল পুল ব্যালেন্স ০ করে নেওয়া হচ্ছে যাতে মেমোরি ওভারল্যাপ না হয়।
//   Object.keys(userSalesMap).forEach(idNo => {
//     if (userSalesMap[idNo]) {
//       userSalesMap[idNo].globalPoolBonusAmount = 0;
//     }
//   });

//   if (typeof ELIGIBLE_POOL_POSITIONS !== "undefined") {
//     ELIGIBLE_POOL_POSITIONS.forEach(poolName => {
//       const totalPoolMembers = poolShareCounters[poolName] || 0;
//       const poolRate = SALES_SHARE_CONFIG[poolName] || 0;

//       // যদি পুলে মেম্বার থাকে এবং সেই পুলে কোম্পানির বাজেট বরাদ্দ থাকে
//       if (totalPoolMembers > 0 && poolRate > 0) {
//         // কোম্পানির মোট চলতি মাসের টার্নওভার থেকে এই পুলের জন্য বরাদ্দকৃত মোট টাকা
//         const totalPoolMoney = totalCompanySalesAmount * poolRate;
        
//         // প্রতি শেয়ার বা মেম্বার পিছু প্রাপ্য টাকার পরিমাণ
//         const sharePerMember = totalPoolMoney / totalPoolMembers;
        
//         // ঐ নির্দিষ্ট পুলে থাকা কোয়ালিফাইড মেম্বারদের আইডিতে নিখুঁতভাবে শেয়ারের টাকা যোগ করা হচ্ছে
//         qualifiedPoolMembers[poolName].forEach(idNo => {
//           if (userSalesMap[idNo]) {
//             userSalesMap[idNo].globalPoolBonusAmount += sharePerMember;
//           }
//         });
//       }
//     });
//   }


//   // =========================================================================
//   // পাস ৬: কর্মচারীদের ফাইনাল ফ্ল্যাট রেসপন্স এরে প্রস্তুতকরণ (ঠিক আপনার ফ্ল্যাট অবজেক্ট ফরম্যাটে)
//   // =========================================================================
//   // const finalLedgerList = [];

//   // users.forEach(user => {
//   //   const nodeData = userSalesMap[user.idNo];
//   //   if (!nodeData) return;

//   //   // ৩০০০ টাকা মান্থলি ডাইরেক্ট সেলসের শর্ত চেক
//   //   const isQualifiedForBill = (nodeData.directSalesThisMonth || 0) >= 3000;

//   //   let salesShareBonus = nodeData.globalPoolBonusAmount || 0;
//   //   let performanceBonus = 0;

//   //   // 🔒 ফিক্সড: পারফরম্যান্স বোনাস অবশ্যই চলতি মাসের ব্যক্তিগত বিক্রয়ের ওপর (directSalesThisMonth) হবে, পুরো টিম ভলিউমের ওপর নয়।
//   //   if (isQualifiedForBill && nodeData.selfQualifiesForBonus) {
//   //     performanceBonus = (nodeData.directSalesThisMonth || 0) * (nodeData.performanceBonusRate || 0);
//   //   }

//   //   // ৩০০০ টাকার নিচে ডাইরেক্ট সেলস হলে পারফরম্যান্স বোনাস এবং গ্লোবাল পুল বোনাস ০ হবে
//   //   // (নোট: পাস ২-এর ডাইনামিক কম্প্রেশনের কারণে যোগ্য মেম্বারদের baseCommission অলরেডি সুরক্ষিত আছে)
//   //   const finalBaseCommission = isQualifiedForBill ? (nodeData.baseCommission || 0) : 0;
//   //   const finalSalesShareBonus = isQualifiedForBill ? salesShareBonus : 0;
    
//   //   // ভেরিয়েবলগুলো অবজেক্টে রাইট করার জন্য আপডেট করা হচ্ছে
//   //   nodeData.baseCommission = finalBaseCommission;
//   //   nodeData.monthlyBonusAmount = performanceBonus;
//   //   nodeData.globalPoolBonusAmount = finalSalesShareBonus;

//   //   // আপনার দেওয়া প্রপার্টি নামের সাথে হুবহু মিল রাখার জন্য অ্যাসাইনমেন্ট
//   //   nodeData.totalSalesAchieved = nodeData.totalSalesVolume;
//   //   nodeData.thisMonthSalesAchieved = nodeData.thisMonthSalesVolume;

//   //   // গ্রস আর্নিং টোটাল
//   //   const totalEarned = finalBaseCommission + finalSalesShareBonus + performanceBonus;

//   //   // ফিল্টারিং শর্ত: ইনকাম থাকলে অথবা লাইফটাইম সেলস ২৫০০০ এর বেশি হলে রেসপন্সে ঢুকবে
//   //   if (totalEarned > 0 || (nodeData.totalSalesVolume || 0) >= 25000) {
//   //     finalLedgerList.push({
//   //       // ক) ইউজারের ডাটাবেজের সমস্ত অরিজিনাল ফিল্ড (সরাসরি স্প্রেড করা হলো)
//   //       ...user,
//   //       _id: user._id.toString(),
        
//   //       // খ) 💥 আপনার এক্সাম্পল অনুযায়ী ডাইনামিক ফিল্ডসমূহ হুবহু রুটে বসানো হলো
//   //       directSalesLifetime: nodeData.directSalesLifetime,
//   //       directSalesThisMonth: nodeData.directSalesThisMonth,
//   //       totalSalesVolume: nodeData.totalSalesVolume,
//   //       thisMonthSalesVolume: nodeData.thisMonthSalesVolume,
//   //       autoPosition: nodeData.autoPosition,
        
//   //       baseCommission: nodeData.baseCommission,
//   //       selfQualifiesForBonus: nodeData.selfQualifiesForBonus,
//   //       performanceBonusRate: nodeData.performanceBonusRate,
//   //       monthlyBonusAmount: nodeData.monthlyBonusAmount,
//   //       globalPoolBonusAmount: nodeData.globalPoolBonusAmount,
//   //       earnedPools: isQualifiedForBill ? nodeData.earnedPools : [],
        
//   //       totalSalesAchieved: nodeData.totalSalesAchieved,
//   //       thisMonthSalesAchieved: nodeData.thisMonthSalesAchieved,
        
//   //       // গ) অডিটিং এবং ফ্রন্টএন্ডের জন্য প্রফেশনাল ট্র্যাকিং ফিল্ড
//   //       netTotalEarnings: Number(totalEarned.toFixed(2)),
//   //       qualificationStatus: isQualifiedForBill ? "Qualified" : "Disqualified (Sales < 3000)"
//   //     });
//   //   }
//   // });

//     // =========================================================================
//   // পাস ৬: কর্মচারীদের ফাইনাল ফ্ল্যাট রেসপন্স এরে প্রস্তুতকরণ (গ্যাপ কমিশন প্রটেকশন ফিক্সড)
//   // =========================================================================
//   const finalLedgerList = [];

//   users.forEach(user => {
//     const nodeData = userSalesMap[user.idNo];
//     if (!nodeData) return;

//     // ৩০০০ টাকা মান্থলি ডাইরেক্ট সেলসের শর্ত চেক
//     const isQualifiedForBill = (nodeData.directSalesThisMonth || 0) >= 3000;

//     let salesShareBonus = nodeData.globalPoolBonusAmount || 0;
//     let performanceBonus = 0;

//     // ১. পারফরম্যান্স বোনাস নির্ধারণ (চলতি মাসে ৩০০০+ ব্যক্তিগত সেলস এবং বোনাস কোয়ালিফাইড হলে পাবে)
//     if (isQualifiedForBill && nodeData.selfQualifiesForBonus) {
//       performanceBonus = (nodeData.directSalesThisMonth || 0) * (nodeData.performanceBonusRate || 0);
//     }

//     // 🔒 💥 চূড়ান্ত আর্কিটেকচারাল ফিক্স:
//     // পাস ২-এর ডাইনামিক স্ল্যাব ইঞ্জিন থেকে অর্জিত গ্যাপ কমিশন (baseCommission) কোনোভাবেই ৩০০০ টাকার 
//     // পার্সোনাল সেলস কন্ডিশন দিয়ে ০ হবে না। এটি সরাসরি সুরক্ষিত থাকবে।
//     const finalBaseCommission = nodeData.baseCommission || 0;
    
//     // ৩০০০ টাকার নিচে ডাইরেক্ট সেলস হলে শুধুমাত্র গ্লোবাল পুল বোনাস ০ হবে
//     const finalSalesShareBonus = isQualifiedForBill ? salesShareBonus : 0;
    
//     // ভেরিয়েবলগুলো মূল অবজেক্ট ম্যাপে রাইট করা হচ্ছে
//     nodeData.baseCommission = finalBaseCommission;
//     nodeData.monthlyBonusAmount = performanceBonus;
//     nodeData.globalPoolBonusAmount = finalSalesShareBonus;

//     // আপনার দেওয়া প্রপার্টি নামের সাথে হুবহু মিল রাখার জন্য অ্যাসাইনমেন্ট
//     nodeData.totalSalesAchieved = nodeData.totalSalesVolume;
//     nodeData.thisMonthSalesAchieved = nodeData.thisMonthSalesVolume;

//     // গ্রস আর্নিং টোটাল (গ্যাপ কমিশন + ফিক্সড পুল বোনাস + পারফরম্যান্স বোনাস)
//     const totalEarned = finalBaseCommission + finalSalesShareBonus + performanceBonus;

//     // ফিল্টারিং শর্ত: ইনকাম থাকলে অথবা লাইফটাইম সেলস ২৫০০০ এর বেশি হলে রেসপন্সে ঢুকবে
//     if (totalEarned > 0 || (nodeData.totalSalesVolume || 0) >= 25000) {
//       finalLedgerList.push({
//         // ক) ইউজারের ডাটাবেজের সমস্ত অরিজিনাল ফিল্ড (সরাসরি স্প্রেড করা হলো)
//         ...user,
//         _id: user._id.toString(),
        
//         // খ) আপনার এক্সাম্পল অনুযায়ী ডাইনামিক ফিল্ডসমূহ হুবহু রুটে বসানো হলো
//         directSalesLifetime: nodeData.directSalesLifetime,
//         directSalesThisMonth: nodeData.directSalesThisMonth,
//         totalSalesVolume: nodeData.totalSalesVolume,
//         thisMonthSalesVolume: nodeData.thisMonthSalesVolume,
//         autoPosition: nodeData.autoPosition,
        
//         baseCommission: Number(nodeData.baseCommission.toFixed(2)),
//         selfQualifiesForBonus: nodeData.selfQualifiesForBonus,
//         performanceBonusRate: nodeData.performanceBonusRate,
//         monthlyBonusAmount: Number(nodeData.monthlyBonusAmount.toFixed(2)),
//         globalPoolBonusAmount: Number(nodeData.globalPoolBonusAmount.toFixed(2)),
//         earnedPools: isQualifiedForBill ? nodeData.earnedPools : [],
        
//         totalSalesAchieved: nodeData.totalSalesAchieved,
//         thisMonthSalesAchieved: nodeData.thisMonthSalesAchieved,
        
//         // গ) অডিটিং এবং ফ্রন্টএন্ডের জন্য প্রফেশনাল ট্র্যাকিং ফিল্ড
//         netTotalEarnings: Number(totalEarned.toFixed(2)),
//         qualificationStatus: isQualifiedForBill ? "Qualified" : "Disqualified for Pool (Sales < 3000)"
//       });
//     }
//   });


//     // =========================================================================
//   // পাস ৭: ডিলার রেসপন্স লুপ (আর্কাইভ ও লাইভ প্রোটেকশনসহ সম্পূর্ণ ফিক্সড)
//   // =========================================================================
//   const dealerResultMap = {};

//   thisMonthSales.forEach(sale => {
//     const amt = Number(sale.grandTotal || sale.totalAmount || sale.amount || 0);
//     if (amt <= 0) return;

//     let dIdNo = null;
//     let dName = "Unknown Dealer";
//     let d_id = sale.dealer ? sale.dealer.toString() : "ARCHIVED_ID";

//     // ক) আর্কাইভড স্ন্যাপশট প্রটেকশন (মাসের শেষে ডাটা লক হয়ে থাকলে)
//     if (sale.isMonthlyArchived && sale.archivedSalesData && sale.archivedSalesData.dealerSnapshot) {
//       dIdNo = sale.archivedSalesData.dealerSnapshot.idNo;
//       dName = sale.archivedSalesData.dealerSnapshot.name || "Unknown Dealer";
//     } 
//     // খ) লাইভ রানিং ডাটা ট্র্যাকিং
//     else if (sale.dealer) {
//       const matchingDealer = dealers.find(d => d._id.toString() === d_id);
//       if (matchingDealer) {
//         dIdNo = matchingDealer.dealerId || matchingDealer.idNo;
//         dName = matchingDealer.name || "Unknown Dealer";
//       }
//     }

//     if (dIdNo) {
//       if (!dealerResultMap[dIdNo]) {
//         dealerResultMap[dIdNo] = { _id: d_id, name: dName, dealerId: dIdNo, totalSales: 0 };
//       }
//       dealerResultMap[dIdNo].totalSales += amt;
//     }
//   });

//   // গ) যেসকল ডিলারের চলতি মাসে কোনো সেলস হয়নি তাদের ০ সেলস সহ ম্যাপে যুক্ত করা
//   dealers.forEach(dlr => {
//     const dIdNo = dlr.dealerId || dlr.idNo || "N/A";
//     if (!dealerResultMap[dIdNo]) {
//       dealerResultMap[dIdNo] = { _id: dlr._id.toString(), name: dlr.name || "Unknown Dealer", dealerId: dIdNo, totalSales: 0 };
//     }
//   });

//   // ঘ) ফাইনাল ডিলার কোয়ালিফিকেশন ও কমিশন প্রসেসিং
//   const qualifiedDealers = Object.values(dealerResultMap).map(dlr => {
//     const commission = (typeof calculateDealerCommission === "function") ? calculateDealerCommission(dlr.totalSales) : 0;
    
//     // 🔒 ফাইন্যান্সিয়াল সেফটি ফিক্স: ডাটার রাউন্ডিং কন্ডিশন চেকিং এর আগে করা হয়েছে যাতে স্ট্যাটাস মিসম্যাচ না হয়
//     const isDealerQualified = dlr.totalSales >= 5000;

//     return {
//       _id: dlr._id,
//       name: dlr.name,
//       dealerId: dlr.dealerId,
//       // ২ দশমিক স্থান পর্যন্ত ফিক্সড করে রাখা হলো নিখুঁত অডিটিং এর জন্য
//       totalSales: Number(dlr.totalSales.toFixed(2)),
//       commission: Number(commission.toFixed(2)),
//       status: isDealerQualified ? "Qualified" : "Disqualified (Sales < 5000)"
//     };
//   });

//   // সম্পূর্ণ লেজার ক্যালকুলেশন ইঞ্জিনের ফাইনাল আউটপুট রিটার্ন
//   return { totalCompanySalesAmount, poolShareCounters, finalLedgerList, qualifiedDealers };
// };


// 10th version: 10.0.0 (June 2024) - Full Refactor with Multi-Pass Engine, Deep Leg Roll-Up, Dynamic Gap Commission, Top-Down Override, and Global Pool Distribution
// const executeLedgerCalculationEngine = async (currentYear, currentMonth) => {
//   const db = mongoose.connection.db;

//   const startDate = new Date(currentYear, currentMonth - 1, 1);
//   const endDate = new Date(currentYear, currentMonth, 1);

//   // =======================================================================
//   // --- STEP 1 & 2: ডাটাবেজ রিড এবং মেমোরি ম্যাপ স্ট্রাকচার ইনিশিয়ালাইজেশন ---
//   // =======================================================================
//   let allLifetimeSales = await db.collection("invoices").find({}).toArray();
//   if (!allLifetimeSales || allLifetimeSales.length === 0) {
//     allLifetimeSales = await db.collection("sales").find({}).toArray();
//   }

//   const thisMonthSales = allLifetimeSales.filter(s => {
//     const rawDate = s.date || s.createdAt;
//     if (!rawDate) return false;
//     const d = new Date(rawDate);
//     return d >= startDate && d < endDate;
//   });

//   const totalCompanySalesAmount = thisMonthSales.reduce((sum, s) => sum + (s.grandTotal || 0), 0);
//   const dealers = await db.collection("dealers").find({}).toArray();
//   const users = await db.collection("users").find({ idNo: { $regex: /^MKT/i } }).toArray();

//   const userSalesMap = {};
//   const parentToChildrenMap = {}; 

//   users.forEach(u => {
//     userSalesMap[u.idNo] = { 
//       ...u, 
//       _id: u._id.toString(),
//       directSalesLifetime: 0, 
//       directSalesThisMonth: 0, 
//       totalSalesVolume: 0,       
//       thisMonthSalesVolume: 0,   
//       autoPosition: "SALES REPRESENTATIVE",
//       baseCommission: 0,
//       selfQualifiesForBonus: false,
//       performanceBonusRate: 0,
//       monthlyBonusAmount: 0,
//       globalPoolBonusAmount: 0,
//       earnedPools: [] 
//     };
    
//     const parentId = u.refIdNo || "0";
//     if (!parentToChildrenMap[parentId]) parentToChildrenMap[parentId] = [];
//     parentToChildrenMap[parentId].push(u.idNo); 
//   });

//   // =======================================================================
//   // --- STEP 3: ডাইরেক্ট পার্সোনাল সেলস ভলিউম অ্যাসাইনমেন্ট ---
//   // =======================================================================
//   allLifetimeSales.forEach(sale => {
//     const saleAmount = Number(sale.grandTotal || sale.totalAmount || sale.amount || 0);
//     const saleDate = new Date(sale.date || sale.createdAt);
//     const isSelectedMonth = saleDate >= startDate && saleDate < endDate;

//     let targetEmployeeIdNo = null;

//     if (sale.isMonthlyArchived && sale.archivedSalesData?.employeeSnapshot?.idNo) {
//       targetEmployeeIdNo = sale.archivedSalesData.employeeSnapshot.idNo;
//     } else if (sale.dealer) {
//       const dStr = sale.dealer.toString();
//       const matchingDealer = dealers.find(d => d._id.toString() === dStr);
//       if (matchingDealer && matchingDealer.referenceIdNo) {
//         targetEmployeeIdNo = matchingDealer.referenceIdNo;
//       }
//     }

//     if (targetEmployeeIdNo && userSalesMap[targetEmployeeIdNo]) {
//       const emp = userSalesMap[targetEmployeeIdNo];
//       emp.directSalesLifetime += saleAmount;
//       emp.totalSalesVolume += saleAmount; 

//       if (isSelectedMonth) {
//         emp.directSalesThisMonth += saleAmount;
//         emp.thisMonthSalesVolume += saleAmount; 
//       }
//     }
//   });

//   // =======================================================================
//   // --- 🔒 💥 পাস ১ (Two-Pass Recursion): ট্রি ভলিউম রোল-আপ এবং নিখুঁত পজিশন ডিটারমিনেশন ---
//   // =======================================================================
//   const processedNodes = new Set(); 
  
//   const processHierarchyPositions = (currentIdNo) => {
//     if (processedNodes.has(currentIdNo)) {
//       const emp = userSalesMap[currentIdNo];
//       const resLegs = { AM: 0, RSM: 0, DSM: 0, NSM: 0, ED: 0, BOM: 0 };
//       if (emp) {
//         const myPos = (emp.autoPosition || "").toUpperCase().trim();
//         if (resLegs[myPos] !== undefined) resLegs[myPos] = 1;
//       }
//       return resLegs;
//     }
    
//     const currentEmployee = userSalesMap[currentIdNo];
//     if (!currentEmployee) return { AM: 0, RSM: 0, DSM: 0, NSM: 0, ED: 0, BOM: 0 };

//     const childrenIds = parentToChildrenMap[currentIdNo] || [];
//     const masterLegsCounts = { AM: 0, RSM: 0, DSM: 0, NSM: 0, ED: 0, BOM: 0 };
    
//     let teamSalesSumTotal = 0;
//     let teamSalesSumMonth = 0;

//     // বটম-আপ ট্রাভার্সাল: ডাউনলাইনের মেম্বারদের পজিশন আগে রেডি হবে
//     childrenIds.forEach(childId => {
//       const childSubTreeLegs = processHierarchyPositions(childId);
//       const childData = userSalesMap[childId];
      
//       if (childData) {
//         teamSalesSumTotal += childData.totalSalesVolume;
//         teamSalesSumMonth += childData.thisMonthSalesVolume;

//         const childFinalPos = (childData.autoPosition || "").toUpperCase().trim();
//         const highestAchievedInThisLeg = { AM: 0, RSM: 0, DSM: 0, NSM: 0, ED: 0, BOM: 0 };
        
//         Object.keys(childSubTreeLegs).forEach(pos => {
//           if (childSubTreeLegs[pos] > 0) highestAchievedInThisLeg[pos] = 1;
//         });
//         if (highestAchievedInThisLeg[childFinalPos] !== undefined) {
//           highestAchievedInThisLeg[childFinalPos] = 1;
//         }

//         Object.keys(highestAchievedInThisLeg).forEach(pos => {
//           masterLegsCounts[pos] += highestAchievedInThisLeg[pos];
//         });
//       }
//     });
    
//     currentEmployee.totalSalesVolume += teamSalesSumTotal;
//     currentEmployee.thisMonthSalesVolume += teamSalesSumMonth;

//     // ইনভয়েস গ্যাপ লুপ চলার আগেই লেগ কন্ডিশন সহ নিখুঁত স্থায়ী পজিশন লক করা হলো
//     currentEmployee.autoPosition = autoDeterminePosition(currentEmployee.totalSalesVolume, masterLegsCounts);
    
//     // প্রাথমিক বোনাস কোয়ালিফিকেশন সত্য করে দেওয়া হলো যাতে কম্প্রেশনে স্কিপ না হয়
//     currentEmployee.selfQualifiesForBonus = true; 

//     processedNodes.add(currentIdNo);

//     const myFinalPos = (currentEmployee.autoPosition || "").toUpperCase().trim();
//     const returnLegsSummary = { ...masterLegsCounts };
//     if (returnLegsSummary[myFinalPos] !== undefined) {
//       returnLegsSummary[myFinalPos] = Math.max(returnLegsSummary[myFinalPos], 1);
//     }

//     return returnLegsSummary;
//   };

//   // রুট প্যারেন্টদের লুপ চালিয়ে গ্যাপ লুপের পূর্বেই নিখুঁত পজিশন আর্কিটেকচার ম্যাপিং সম্পন্ন
//   users.forEach(user => {
//     if (user.refIdNo === "0" || !user.refIdNo || !userSalesMap[user.refIdNo]) {
//       processHierarchyPositions(user.idNo);
//     }
//   });

//   // =======================================================================
//   // --- পাস ২: লিনিয়ার ডাইনামিক গ্যাপ কমিশন (শতভাগ ফিক্সড) ---
//   // =======================================================================
//   thisMonthSales.forEach(sale => {
//     const invoiceAmount = Number(sale.grandTotal || sale.totalAmount || sale.amount || 0);
//     if (invoiceAmount <= 0) return;

//     let startEmployeeIdNo = null;
//     if (sale.isMonthlyArchived && sale.archivedSalesData?.employeeSnapshot?.idNo) {
//       startEmployeeIdNo = sale.archivedSalesData.employeeSnapshot.idNo;
//     } else if (sale.dealer) {
//       const dStr = sale.dealer.toString();
//       const matchingDealer = dealers.find(d => d._id.toString() === dStr);
//       if (matchingDealer && matchingDealer.referenceIdNo) {
//         startEmployeeIdNo = matchingDealer.referenceIdNo;
//       }
//     }

//     if (!startEmployeeIdNo) return;
    
//     let currentIdNo = startEmployeeIdNo;
//     let distributedRateSoFar = 0; 
//     const visited = new Set(); 

//     while (currentIdNo && currentIdNo !== "0" && !visited.has(currentIdNo)) {
//       visited.add(currentIdNo);
//       const empNode = userSalesMap[currentIdNo];
//       if (!empNode) break;

//       let myPositionRate = 0;
//       if (empNode.selfQualifiesForBonus === true) {
//         myPositionRate = (typeof POSITION_SLABS !== "undefined" && POSITION_SLABS[empNode.autoPosition?.toUpperCase()]) || 0;
//       }

//       if (myPositionRate > distributedRateSoFar) {
//         const gapRate = myPositionRate - distributedRateSoFar;
//         empNode.baseCommission += invoiceAmount * gapRate; // প্রকৃত স্ল্যাব ডিফারেন্সিয়াল হিট
//         distributedRateSoFar = myPositionRate; 
//       }

//       if (distributedRateSoFar >= 0.24) break;
//       currentIdNo = empNode.refIdNo; 
//     }
//   });

//   // =======================================================================
//   // --- পাস ৩, ৪, ৫, ৬ & ৭: ফাইনাল কোয়ালিফিকেশন ওভাররাইড ও রেসপন্স আর্কিটেকচার ---
//   // =======================================================================
  
//   // পাস ৩: টপ-ডাউন কোয়ালিফিকেশন ওভাররাইড চেইন রানার
//   const applyTopDownBonusQualification = (currentIdNo, parentQualifies = false) => {
//     const currentEmployee = userSalesMap[currentIdNo];
//     if (!currentEmployee) return;
//     if (parentQualifies) currentEmployee.selfQualifiesForBonus = true;
//     const childrenIds = parentToChildrenMap[currentIdNo] || [];
//     childrenIds.forEach(childId => applyTopDownBonusQualification(childId, currentEmployee.selfQualifiesForBonus));
//   };
//   if (parentToChildrenMap["0"]) {
//     parentToChildrenMap["0"].forEach(rootIdNo => applyTopDownBonusQualification(rootIdNo, false));
//   }

//   // =======================================================================
//   // পাস ৪: গ্লোবাল পুল কাউন্টার এবং মেম্বার অ্যাসাইনমেন্ট (Multi-Pool Share & Audit Fixed)
//   // =======================================================================
//   const poolShareCounters = { RSM: 0, DSM: 0, SDSM: 0, SM: 0, NSM: 0, ED: 0, BOM: 0 };
//   const qualifiedPoolMembers = { RSM: [], DSM: [], SDSM: [], SM: [], NSM: [], ED: [], BOM: [] };
  
//   users.forEach(user => {
//     const nodeData = userSalesMap[user.idNo];
//     if (!nodeData) return;

//     // 🔒 শর্ত ১: পুলে এলিজিবল হতে হলে চলতি মাসে পার্সোনাল সেলস ন্যূনতম ৩,০০০ টাকা হতে হবে
//     const isQualifiedForBill = (nodeData.directSalesThisMonth || 0) >= 3000;
//     const myPos = (nodeData.autoPosition || "").toUpperCase().trim();

//     if (isQualifiedForBill && nodeData.selfQualifiesForBonus && typeof ELIGIBLE_POOL_POSITIONS !== "undefined" && ELIGIBLE_POOL_POSITIONS.includes(myPos)) {
//       const myRankValue = RANK_MAP[myPos];
      
//       // মেমোরি ওভারল্যাপ এড়াতে ওল্ড পুল ডাটা ক্লিন করা হলো
//       nodeData.earnedPools = [];

//       ELIGIBLE_POOL_POSITIONS.forEach(poolName => {
//         const poolRankValue = RANK_MAP[poolName];
        
//         if (myPos === "RSM") {
//           // RSM শুধুমাত্র RSM পুলেই শেয়ার পাবে
//           if (poolName === "RSM") { 
//             poolShareCounters[poolName]++; 
//             nodeData.earnedPools.push(poolName); 
//             qualifiedPoolMembers[poolName].push(user.idNo); 
//           }
//         } else {
//           // 💥 ক্রস-プール মেকানিজম: RSM ব্যতীত নিজের পজিশন এবং তার নিচের সকল পুলে শেয়ার পাবেন
//           if (myRankValue >= poolRankValue && poolName !== "RSM") { 
//             poolShareCounters[poolName]++; 
//             nodeData.earnedPools.push(poolName); 
//             qualifiedPoolMembers[poolName].push(user.idNo); 
//           }
//         }
//       });
//     }
//   });

//   // =======================================================================
//   // পাস ৫: গ্লোবাল কোম্পানি পুল বোনাস ডিস্ট্রিবিউশন রানার (Strict Unique Split Fixed)
//   // =======================================================================
  
//   // ওল্ড ডেটা ফ্লাশ সেফটি গার্ড: পুলে নতুন টাকা যোগ করার আগে সবার পুল ব্যালেন্স ০ করে নেওয়া
//   Object.keys(userSalesMap).forEach(idNo => {
//     if (userSalesMap[idNo]) {
//       userSalesMap[idNo].globalPoolBonusAmount = 0;
//     }
//   });

//   if (typeof ELIGIBLE_POOL_POSITIONS !== "undefined") {
//     ELIGIBLE_POOL_POSITIONS.forEach(poolName => {
//       const poolRate = SALES_SHARE_CONFIG[poolName] || 0;
      
//       // 🔒 ফিক্সড: ডুপ্লিকেট কাউন্ট এড়াতে ইউনিক মেম্বার আইডি ফিল্টার (Set ব্যবহার)
//       const uniqueMemberIds = Array.from(new Set(qualifiedPoolMembers[poolName] || []));
//       const totalPoolMembers = uniqueMemberIds.length;

//       if (totalPoolMembers > 0 && poolRate > 0) {
//         // কোম্পানির মোট চলতি মাসের টার্নওভার থেকে এই পুলের জন্য মোট বরাদ্দকৃত ফান্ড
//         const totalPoolMoney = totalCompanySalesAmount * poolRate;
        
//         // প্রতি শেয়ারে প্রকৃত প্রাপ্য টাকার পরিমাণ
//         const sharePerMember = totalPoolMoney / totalPoolMembers;
        
//         // কোয়ালিফাইড ইউনিক মেম্বারদের অ্যাকাউন্টে প্লাস করা হচ্ছে
//         uniqueMemberIds.forEach(idNo => {
//           if (userSalesMap[idNo]) {
//             userSalesMap[idNo].globalPoolBonusAmount += sharePerMember;
//           }
//         });
//       }
//     });
//   }

//   // =========================================================================
//   // পাস ৬: কর্মচারীদের ফাইনাল ফ্ল্যাট রেসপন্স এরে প্রস্তুতকরণ (গ্যাপ কমিশন প্রটেকশন সহ)
//   // =========================================================================
//   const finalLedgerList = [];

//   users.forEach(user => {
//     const nodeData = userSalesMap[user.idNo];
//     if (!nodeData) return;

//     // ৩০০০ টাকা মান্থলি ডাইরেক্ট সেলসের শর্ত চেক
//     const isQualifiedForBill = (nodeData.directSalesThisMonth || 0) >= 3000;

//     let salesShareBonus = nodeData.globalPoolBonusAmount || 0;
//     let performanceBonus = 0;

//     // পারফরম্যান্স বোনাস নির্ধারণ (চলতি মাসের ব্যক্তিগত বিক্রয়ের ওপর)
//     if (isQualifiedForBill && nodeData.selfQualifiesForBonus) {
//       performanceBonus = (nodeData.directSalesThisMonth || 0) * (nodeData.performanceBonusRate || 0);
//     }

//     // 🔒 💥 চূড়ান্ত ফিক্স: পাস ২-এর জেনারেট হওয়া গ্যাপ কমিশন (baseCommission) থ্রেশহোল্ড দিয়ে জিরো হবে না
//     const finalBaseCommission = nodeData.baseCommission || 0;
    
//     // ৩০০০ টাকার কম সেলস হলে গ্লোবাল পুল বোনাস শূন্য হবে
//     const finalSalesShareBonus = isQualifiedForBill ? salesShareBonus : 0;
    
//     nodeData.baseCommission = finalBaseCommission;
//     nodeData.monthlyBonusAmount = performanceBonus;
//     nodeData.globalPoolBonusAmount = finalSalesShareBonus;

//     nodeData.totalSalesAchieved = nodeData.totalSalesVolume;
//     nodeData.thisMonthSalesAchieved = nodeData.thisMonthSalesVolume;

//     // গ্রস আর্নিং টোটাল
//     const totalEarned = finalBaseCommission + finalSalesShareBonus + performanceBonus;

//     // ফিল্টারিং শর্ত: ইনকাম থাকলে অথবা লাইফটাইম সেলস ২৫০০০ এর বেশি হলে রেসপন্সে ঢুকবে
//     if (totalEarned > 0 || (nodeData.totalSalesVolume || 0) >= 25000) {
//       finalLedgerList.push({
//         ...user,
//         _id: user._id.toString(),
        
//         directSalesLifetime: nodeData.directSalesLifetime,
//         directSalesThisMonth: nodeData.directSalesThisMonth,
//         totalSalesVolume: nodeData.totalSalesVolume,
//         thisMonthSalesVolume: nodeData.thisMonthSalesVolume,
//         autoPosition: nodeData.autoPosition,
        
//         baseCommission: Number(nodeData.baseCommission.toFixed(2)),
//         selfQualifiesForBonus: nodeData.selfQualifiesForBonus,
//         performanceBonusRate: nodeData.performanceBonusRate,
//         monthlyBonusAmount: Number(nodeData.monthlyBonusAmount.toFixed(2)),
//         globalPoolBonusAmount: Number(nodeData.globalPoolBonusAmount.toFixed(2)),
//         earnedPools: isQualifiedForBill ? nodeData.earnedPools : [],
        
//         totalSalesAchieved: nodeData.totalSalesAchieved,
//         thisMonthSalesAchieved: nodeData.thisMonthSalesAchieved,
        
//         netTotalEarnings: Number(totalEarned.toFixed(2)),
//         qualificationStatus: isQualifiedForBill ? "Qualified" : "Disqualified for Pool (Sales < 3000)"
//       });
//     }
//   });

//   // =========================================================================
//   // পাস ৭: ডিলার রেসপন্স লুপ (আর্কাইভ ও লাইভ প্রোটেকশনসহ সম্পূর্ণ ফিক্সড)
//   // =========================================================================
//   const dealerResultMap = {};

//   thisMonthSales.forEach(sale => {
//     const amt = Number(sale.grandTotal || sale.totalAmount || sale.amount || 0);
//     if (amt <= 0) return;

//     let dIdNo = null;
//     let dName = "Unknown Dealer";
//     let d_id = sale.dealer ? sale.dealer.toString() : "ARCHIVED_ID";

//     if (sale.isMonthlyArchived && sale.archivedSalesData && sale.archivedSalesData.dealerSnapshot) {
//       dIdNo = sale.archivedSalesData.dealerSnapshot.idNo;
//       dName = sale.archivedSalesData.dealerSnapshot.name || "Unknown Dealer";
//     } else if (sale.dealer) {
//       const matchingDealer = dealers.find(d => d._id.toString() === d_id);
//       if (matchingDealer) {
//         dIdNo = matchingDealer.dealerId || matchingDealer.idNo;
//         dName = matchingDealer.name || "Unknown Dealer";
//       }
//     }

//     if (dIdNo) {
//       if (!dealerResultMap[dIdNo]) {
//         dealerResultMap[dIdNo] = { _id: d_id, name: dName, dealerId: dIdNo, totalSales: 0 };
//       }
//       dealerResultMap[dIdNo].totalSales += amt;
//     }
//   });

//   dealers.forEach(dlr => {
//     const dIdNo = dlr.dealerId || dlr.idNo || "N/A";
//     if (!dealerResultMap[dIdNo]) {
//       dealerResultMap[dIdNo] = { _id: dlr._id.toString(), name: dlr.name || "Unknown Dealer", dealerId: dIdNo, totalSales: 0 };
//     }
//   });

//   const qualifiedDealers = Object.values(dealerResultMap).map(dlr => {
//     const commission = (typeof calculateDealerCommission === "function") ? calculateDealerCommission(dlr.totalSales) : 0;
//     const isDealerQualified = dlr.totalSales >= 5000;

//     return {
//       _id: dlr._id,
//       name: dlr.name,
//       dealerId: dlr.dealerId,
//       totalSales: Number(dlr.totalSales.toFixed(2)),
//       commission: Number(commission.toFixed(2)),
//       status: isDealerQualified ? "Qualified" : "Disqualified (Sales < 5000)"
//     };
//   });

//   // সম্পূর্ণ লেজার ক্যালকুলেশন ইঞ্জিনের ফাইনাল আউটপুট রিটার্ন
//   return { totalCompanySalesAmount, poolShareCounters, finalLedgerList, qualifiedDealers };
// };

// 11th version: 11.0.0 (June 2024) - Full Refactor with Multi-Pass Engine, Deep Leg Roll-Up, Dynamic Gap Commission, Top-Down Override, and Global Pool Distribution
// const executeLedgerCalculationEngine = async (currentYear, currentMonth) => {
//   const db = mongoose.connection.db;

//   const startDate = new Date(currentYear, currentMonth - 1, 1);
//   const endDate = new Date(currentYear, currentMonth, 1);

//   // =======================================================================
//   // --- STEP 1 & 2: ডাটাবেজ রিড এবং মেমোরি ম্যাপ স্ট্রাকচার ইনিশিয়ালাইজেশন ---
//   // =======================================================================
//   let allLifetimeSales = await db.collection("invoices").find({}).toArray();
//   if (!allLifetimeSales || allLifetimeSales.length === 0) {
//     allLifetimeSales = await db.collection("sales").find({}).toArray();
//   }

//   const thisMonthSales = allLifetimeSales.filter(s => {
//     const rawDate = s.date || s.createdAt;
//     if (!rawDate) return false;
//     const d = new Date(rawDate);
//     return d >= startDate && d < endDate;
//   });

//   const totalCompanySalesAmount = thisMonthSales.reduce((sum, s) => sum + (s.grandTotal || 0), 0);
//   const dealers = await db.collection("dealers").find({}).toArray();
//   const users = await db.collection("users").find({ idNo: { $regex: /^MKT/i } }).toArray();

//   const userSalesMap = {};
//   const parentToChildrenMap = {}; 

//   users.forEach(u => {
//     userSalesMap[u.idNo] = { 
//       ...u, 
//       _id: u._id.toString(),
//       directSalesLifetime: 0, 
//       directSalesThisMonth: 0, 
//       totalSalesVolume: 0,       
//       thisMonthSalesVolume: 0,   
//       autoPosition: "SALES REPRESENTATIVE",
//       baseCommission: 0,
//       selfQualifiesForBonus: false,
//       performanceBonusRate: 0,
//       monthlyBonusAmount: 0,
//       globalPoolBonusAmount: 0,
//       earnedPools: [] 
//     };
    
//     const parentId = u.refIdNo || "0";
//     if (!parentToChildrenMap[parentId]) parentToChildrenMap[parentId] = [];
//     parentToChildrenMap[parentId].push(u.idNo); 
//   });

//   // =======================================================================
//   // --- STEP 3: ডাইরেক্ট পার্সোনাল সেলস ভলিউম অ্যাসাইনমেন্ট ---
//   // =======================================================================
//   allLifetimeSales.forEach(sale => {
//     const saleAmount = Number(sale.grandTotal || sale.totalAmount || sale.amount || 0);
//     const saleDate = new Date(sale.date || sale.createdAt);
//     const isSelectedMonth = saleDate >= startDate && saleDate < endDate;

//     let targetEmployeeIdNo = null;

//     if (sale.isMonthlyArchived && sale.archivedSalesData?.employeeSnapshot?.idNo) {
//       targetEmployeeIdNo = sale.archivedSalesData.employeeSnapshot.idNo;
//     } else if (sale.dealer) {
//       const dStr = sale.dealer.toString();
//       const matchingDealer = dealers.find(d => d._id.toString() === dStr);
//       if (matchingDealer && matchingDealer.referenceIdNo) {
//         targetEmployeeIdNo = matchingDealer.referenceIdNo;
//       }
//     }

//     if (targetEmployeeIdNo && userSalesMap[targetEmployeeIdNo]) {
//       const emp = userSalesMap[targetEmployeeIdNo];
//       emp.directSalesLifetime += saleAmount;
//       emp.totalSalesVolume += saleAmount; 

//       if (isSelectedMonth) {
//         emp.directSalesThisMonth += saleAmount;
//         emp.thisMonthSalesVolume += saleAmount; 
//       }
//     }
//   });

//   // =======================================================================
//   // --- 🔒 💥 পাস ১ (Two-Pass Recursion): ট্রি ভলিউম রোল-আপ এবং নিখুঁত পজিশন ডিটারমিনেশন ---
//   // =======================================================================
//   const processedNodes = new Set(); 
  
//   const processHierarchyPositions = (currentIdNo) => {
//     if (processedNodes.has(currentIdNo)) {
//       const emp = userSalesMap[currentIdNo];
//       const resLegs = { AM: 0, RSM: 0, DSM: 0, NSM: 0, ED: 0, BOM: 0 };
//       if (emp) {
//         const myPos = (emp.autoPosition || "").toUpperCase().trim();
//         if (resLegs[myPos] !== undefined) resLegs[myPos] = 1;
//       }
//       return resLegs;
//     }
    
//     const currentEmployee = userSalesMap[currentIdNo];
//     if (!currentEmployee) return { AM: 0, RSM: 0, DSM: 0, NSM: 0, ED: 0, BOM: 0 };

//     const childrenIds = parentToChildrenMap[currentIdNo] || [];
//     const masterLegsCounts = { AM: 0, RSM: 0, DSM: 0, NSM: 0, ED: 0, BOM: 0 };
    
//     let teamSalesSumTotal = 0;
//     let teamSalesSumMonth = 0;

//     // বটম-আপ ট্রাভার্সাল: ডাউনলাইনের মেম্বারদের পজিশন আগে রেডি হবে
//     childrenIds.forEach(childId => {
//       const childSubTreeLegs = processHierarchyPositions(childId);
//       const childData = userSalesMap[childId];
      
//       if (childData) {
//         teamSalesSumTotal += childData.totalSalesVolume;
//         teamSalesSumMonth += childData.thisMonthSalesVolume;

//         const childFinalPos = (childData.autoPosition || "").toUpperCase().trim();
//         const highestAchievedInThisLeg = { AM: 0, RSM: 0, DSM: 0, NSM: 0, ED: 0, BOM: 0 };
        
//         Object.keys(childSubTreeLegs).forEach(pos => {
//           if (childSubTreeLegs[pos] > 0) highestAchievedInThisLeg[pos] = 1;
//         });
//         if (highestAchievedInThisLeg[childFinalPos] !== undefined) {
//           highestAchievedInThisLeg[childFinalPos] = 1;
//         }

//         Object.keys(highestAchievedInThisLeg).forEach(pos => {
//           masterLegsCounts[pos] += highestAchievedInThisLeg[pos];
//         });
//       }
//     });
    
//     currentEmployee.totalSalesVolume += teamSalesSumTotal;
//     currentEmployee.thisMonthSalesVolume += teamSalesSumMonth;

//     // ইনভয়েস গ্যাপ লুপ চলার আগেই লেগ কন্ডিশন সহ নিখুঁত স্থায়ী পজিশন লক করা হলো
//     currentEmployee.autoPosition = autoDeterminePosition(currentEmployee.totalSalesVolume, masterLegsCounts);
    
//     // প্রাথমিক বোনাস কোয়ালিফিকেশন সত্য করে দেওয়া হলো যাতে কম্প্রেশনে স্কিপ না হয়
//     currentEmployee.selfQualifiesForBonus = true; 

//     processedNodes.add(currentIdNo);

//     const myFinalPos = (currentEmployee.autoPosition || "").toUpperCase().trim();
//     const returnLegsSummary = { ...masterLegsCounts };
//     if (returnLegsSummary[myFinalPos] !== undefined) {
//       returnLegsSummary[myFinalPos] = Math.max(returnLegsSummary[myFinalPos], 1);
//     }

//     return returnLegsSummary;
//   };

//   // রুট প্যারেন্টদের লুপ চালিয়ে গ্যাপ লুপের পূর্বেই নিখুঁত পজিশন আর্কিটেকচার ম্যাপিং সম্পন্ন
//   users.forEach(user => {
//     if (user.refIdNo === "0" || !user.refIdNo || !userSalesMap[user.refIdNo]) {
//       processHierarchyPositions(user.idNo);
//     }
//   });

//   // =======================================================================
//   // --- পাস ২: লিনিয়ার ডাইনামিক গ্যাপ কমিশন (শতভাগ ফিক্সড) ---
//   // =======================================================================
//   thisMonthSales.forEach(sale => {
//     const invoiceAmount = Number(sale.grandTotal || sale.totalAmount || sale.amount || 0);
//     if (invoiceAmount <= 0) return;

//     let startEmployeeIdNo = null;
//     if (sale.isMonthlyArchived && sale.archivedSalesData?.employeeSnapshot?.idNo) {
//       startEmployeeIdNo = sale.archivedSalesData.employeeSnapshot.idNo;
//     } else if (sale.dealer) {
//       const dStr = sale.dealer.toString();
//       const matchingDealer = dealers.find(d => d._id.toString() === dStr);
//       if (matchingDealer && matchingDealer.referenceIdNo) {
//         startEmployeeIdNo = matchingDealer.referenceIdNo;
//       }
//     }

//     if (!startEmployeeIdNo) return;
    
//     let currentIdNo = startEmployeeIdNo;
//     let distributedRateSoFar = 0; 
//     const visited = new Set(); 

//     while (currentIdNo && currentIdNo !== "0" && !visited.has(currentIdNo)) {
//       visited.add(currentIdNo);
//       const empNode = userSalesMap[currentIdNo];
//       if (!empNode) break;

//       let myPositionRate = 0;
//       if (empNode.selfQualifiesForBonus === true) {
//         myPositionRate = (typeof POSITION_SLABS !== "undefined" && POSITION_SLABS[empNode.autoPosition?.toUpperCase()]) || 0;
//       }

//       if (myPositionRate > distributedRateSoFar) {
//         const gapRate = myPositionRate - distributedRateSoFar;
//         empNode.baseCommission += invoiceAmount * gapRate; // প্রকৃত স্ল্যাব ডিফারেন্সিয়াল হিট
//         distributedRateSoFar = myPositionRate; 
//       }

//       if (distributedRateSoFar >= 0.24) break;
//       currentIdNo = empNode.refIdNo; 
//     }
//   });

//   // =======================================================================
//   // --- পাস ৩, ৪, ৫, ৬ & ৭: ফাইনাল কোয়ালিফিকেশন ওভাররাইড ও রেসপন্স আর্কিটেকচার ---
//   // =======================================================================
  
//    // =======================================================================
//   // --- পাস ৩: টপ-ডাউন কোয়ালিফিকেশন ওভাররাইড চেইন রানার ---
//   // =======================================================================
//   const applyTopDownBonusQualification = (currentIdNo, parentQualifies = false) => {
//     const currentEmployee = userSalesMap[currentIdNo];
//     if (!currentEmployee) return;
//     if (parentQualifies) currentEmployee.selfQualifiesForBonus = true;
//     const childrenIds = parentToChildrenMap[currentIdNo] || [];
//     childrenIds.forEach(childId => applyTopDownBonusQualification(childId, currentEmployee.selfQualifiesForBonus));
//   };
//   if (parentToChildrenMap["0"]) {
//     parentToChildrenMap["0"].forEach(rootIdNo => applyTopDownBonusQualification(rootIdNo, false));
//   }

//   // =======================================================================
//   // 🔒 💥 পাস ৩.১ (চূড়ান্ত রেট সিঙ্ক ফিক্স): ডিপ লেগ-ওয়াইজ বোনাস রেট ডিটারমিনেশন
//   // =======================================================================
//   Object.keys(userSalesMap).forEach(idNo => {
//     const emp = userSalesMap[idNo];
//     if (!emp) return;

//     if (emp.selfQualifiesForBonus === true) {
//       const currentChildrenIds = parentToChildrenMap[idNo] || [];
      
//       // 🔒 ফিক্সড: আপনার checkSelfQualificationOnly ফাংশনের countAtLeast মেকানিজমের জন্য 
//       // প্রতিটি ভিন্ন ডিরেক্ট চাইল্ড লেগকে (Leg) আলাদাভাবে অ্যানালাইসিস করে মাস্টার অবজেক্ট তৈরি করা হচ্ছে
//       const syncedLegsCounts = { AM: 0, RSM: 0, DSM: 0, NSM: 0, ED: 0, BOM: 0 };

//       currentChildrenIds.forEach(cId => {
//         const cData = userSalesMap[cId];
//         if (cData) {
//           // চাইল্ডের নিজের কারেন্ট পজিশন
//           const cPos = (cData.autoPosition || "").toUpperCase().trim();
          
//           // এই নির্দিষ্ট চাইল্ড লেগের (Leg) জন্য একটি স্বাধীন বাইনারি ফ্ল্যাগ ম্যাপ তৈরি
//           const singleLegFlags = { AM: 0, RSM: 0, DSM: 0, NSM: 0, ED: 0, BOM: 0 };
//           if (singleLegFlags[cPos] !== undefined) {
//             singleLegFlags[cPos] = 1;
//           }

//           // চাইল্ডের নিচের ডিপ-ডাউনলাইনে (childMap/parentToChildrenMap) যদি কোনো কোয়ালিফাইড মেম্বার থাকে তা ট্র্যাক করা
//           const trackDeepLegPositions = (nodeId) => {
//             const subChildren = parentToChildrenMap[nodeId] || [];
//             subChildren.forEach(subId => {
//               const subData = userSalesMap[subId];
//               if (subData) {
//                 const subPos = (subData.autoPosition || "").toUpperCase().trim();
//                 if (singleLegFlags[subPos] !== undefined) {
//                   singleLegFlags[subPos] = 1; // এই লেগে উক্ত পজিশন ১ জন হলেও এচিভড হয়েছে (Flag Lock)
//                 }
//                 trackDeepLegPositions(subId); // রিকার্সিভলি আরো গভীরে চেক করা
//               }
//             });
//           };
//           trackDeepLegPositions(cId);

//           // এই লেগের ফাইনাল বাইনারি ফ্ল্যাগ রেজাল্ট মূল প্যারেন্টের syncedLegsCounts অবজেক্টে যোগ হচ্ছে
//           Object.keys(singleLegFlags).forEach(pos => {
//             syncedLegsCounts[pos] += singleLegFlags[pos];
//           });
//         }
//       });

//       // 🎯 আপনার দেওয়া checkSelfQualificationOnly ফাংশনটি নিখুঁত ডেটা ফরম্যাট সহ কল করা হচ্ছে
//       if (typeof checkSelfQualificationOnly === "function") {
//         const finalCheck = checkSelfQualificationOnly(emp.autoPosition, emp.thisMonthSalesVolume, syncedLegsCounts);
        
//         if (finalCheck.qualifies && finalCheck.performanceBonusRate > 0) {
//           emp.performanceBonusRate = finalCheck.performanceBonusRate;
//         } else {
//           // সেফটি ফলব্যাক: শর্ত পূরণ সাপেক্ষে পজিশন অনুযায়ী নুন্যতম ফিক্সড রেট এনফোর্স করা
//           const upPos = (emp.autoPosition || "").toUpperCase().trim();
//           if (upPos === "RSM") emp.performanceBonusRate = 0.01;
//           else if (upPos === "DSM" || upPos === "SDSM") emp.performanceBonusRate = 0.005;
//           else if (["SM", "NSM", "ED", "BOM"].includes(upPos)) emp.performanceBonusRate = 0.0025;
//           else emp.performanceBonusRate = 0;
//         }
//       }
//     }
//   });

//   // =======================================================================
//   // পাস ৪: গ্লোবাল পুল কাউন্টার এবং মেম্বার অ্যাসাইনমেন্ট (Multi-Pool Share & Audit Fixed)
//   // =======================================================================
//   const poolShareCounters = { RSM: 0, DSM: 0, SDSM: 0, SM: 0, NSM: 0, ED: 0, BOM: 0 };
//   const qualifiedPoolMembers = { RSM: [], DSM: [], SDSM: [], SM: [], NSM: [], ED: [], BOM: [] };
  
//   users.forEach(user => {
//     const nodeData = userSalesMap[user.idNo];
//     if (!nodeData) return;

//     // 🔒 শর্ত ১: পুলে এলিজিবল হতে হলে চলতি মাসে পার্সোনাল সেলস ন্যূনতম ৩,০০০ টাকা হতে হবে
//     const isQualifiedForBill = (nodeData.directSalesThisMonth || 0) >= 3000;
//     const myPos = (nodeData.autoPosition || "").toUpperCase().trim();

//     if (isQualifiedForBill && nodeData.selfQualifiesForBonus && typeof ELIGIBLE_POOL_POSITIONS !== "undefined" && ELIGIBLE_POOL_POSITIONS.includes(myPos)) {
//       const myRankValue = RANK_MAP[myPos];
      
//       // মেমোরি ওভারল্যাপ এড়াতে ওল্ড পুল ডাটা ক্লিন করা হলো
//       nodeData.earnedPools = [];

//       ELIGIBLE_POOL_POSITIONS.forEach(poolName => {
//         const poolRankValue = RANK_MAP[poolName];
        
//         if (myPos === "RSM") {
//           // RSM শুধুমাত্র RSM পুলেই শেয়ার পাবে
//           if (poolName === "RSM") { 
//             poolShareCounters[poolName]++; 
//             nodeData.earnedPools.push(poolName); 
//             qualifiedPoolMembers[poolName].push(user.idNo); 
//           }
//         } else {
//           // 💥 ক্রস-プール মেকানিজম: RSM ব্যতীত নিজের পজিশন এবং তার নিচের সকল পুলে শেয়ার পাবেন
//           if (myRankValue >= poolRankValue && poolName !== "RSM") { 
//             poolShareCounters[poolName]++; 
//             nodeData.earnedPools.push(poolName); 
//             qualifiedPoolMembers[poolName].push(user.idNo); 
//           }
//         }
//       });
//     }
//   });

//   // =======================================================================
//   // পাস ৫: গ্লোবাল কোম্পানি পুল বোনাস ডিস্ট্রিবিউশন রানার (Strict Unique Split Fixed)
//   // =======================================================================
  
//   // ওল্ড ডেটা ফ্লাশ সেফটি গার্ড: পুলে নতুন টাকা যোগ করার আগে সবার পুল ব্যালেন্স ০ করে নেওয়া
//   Object.keys(userSalesMap).forEach(idNo => {
//     if (userSalesMap[idNo]) {
//       userSalesMap[idNo].globalPoolBonusAmount = 0;
//     }
//   });

//   if (typeof ELIGIBLE_POOL_POSITIONS !== "undefined") {
//     ELIGIBLE_POOL_POSITIONS.forEach(poolName => {
//       const poolRate = SALES_SHARE_CONFIG[poolName] || 0;
      
//       // 🔒 ফিক্সড: ডুপ্লিকেট কাউন্ট এড়াতে ইউনিক মেম্বার আইডি ফিল্টার (Set ব্যবহার)
//       const uniqueMemberIds = Array.from(new Set(qualifiedPoolMembers[poolName] || []));
//       const totalPoolMembers = uniqueMemberIds.length;

//       if (totalPoolMembers > 0 && poolRate > 0) {
//         // কোম্পানির মোট চলতি মাসের টার্নওভার থেকে এই পুলের জন্য মোট বরাদ্দকৃত ফান্ড
//         const totalPoolMoney = totalCompanySalesAmount * poolRate;
        
//         // প্রতি শেয়ারে প্রকৃত প্রাপ্য টাকার পরিমাণ
//         const sharePerMember = totalPoolMoney / totalPoolMembers;
        
//         // কোয়ালিফাইড ইউনিক মেম্বারদের অ্যাকাউন্টে প্লাস করা হচ্ছে
//         uniqueMemberIds.forEach(idNo => {
//           if (userSalesMap[idNo]) {
//             userSalesMap[idNo].globalPoolBonusAmount += sharePerMember;
//           }
//         });
//       }
//     });
//   }

//    // =========================================================================
//   // পাস ৬: কর্মচারীদের ফাইনাল ফ্ল্যাট রেসপন্স এরে প্রস্তুতকরণ (Team Volume Bonus Fixed)
//   // =========================================================================
//   const finalLedgerList = [];

//   users.forEach(user => {
//     const nodeData = userSalesMap[user.idNo];
//     if (!nodeData) return;

//     // ৩০০০ টাকা মান্থলি ডাইরেক্ট সেলসের শর্ত চেক
//     const isQualifiedForBill = (nodeData.directSalesThisMonth || 0) >= 3000;

//     let salesShareBonus = nodeData.globalPoolBonusAmount || 0;
//     let performanceBonus = 0;

//     // 🔒 💥 ক্রিশিয়াল বিজনেস রুল ফিক্স: 
//     // পারফরম্যান্স বোনাস অ্যামাউন্টটি এখন চলতি মাসের মোট টিম সেলস ভলিউমের (`thisMonthSalesVolume`) ওপর গুণ হবে।
//     if (isQualifiedForBill && nodeData.selfQualifiesForBonus) {
//       performanceBonus = (nodeData.thisMonthSalesVolume || 0) * (nodeData.performanceBonusRate || 0);
//     }

//     // পাস ২-এর জেনারেট হওয়া গ্যাপ কমিশন (baseCommission) সবসময় সুরক্ষিত থাকবে
//     const finalBaseCommission = nodeData.baseCommission || 0;
    
//     // ৩০০০ টাকার কম সেলস হলে গ্লোবাল পুল বোনাস শূন্য হবে
//     const finalSalesShareBonus = isQualifiedForBill ? salesShareBonus : 0;
    
//     nodeData.baseCommission = finalBaseCommission;
//     nodeData.monthlyBonusAmount = performanceBonus;
//     nodeData.globalPoolBonusAmount = finalSalesShareBonus;

//     nodeData.totalSalesAchieved = nodeData.totalSalesVolume;
//     nodeData.thisMonthSalesAchieved = nodeData.thisMonthSalesVolume;

//     // গ্রস আর্নিং টোটাল (গ্যাপ কমিশন + পুল বোনাস + সংশোধিত টিম পারফরম্যান্স বোনাস)
//     const totalEarned = finalBaseCommission + finalSalesShareBonus + performanceBonus;

//     // ফিল্টারিং শর্ত: ইনকাম থাকলে অথবা লাইফটাইম সেলস ২৫০০০ এর বেশি হলে রেসপন্সে ঢুকবে
//     if (totalEarned > 0 || (nodeData.totalSalesVolume || 0) >= 25000) {
//       finalLedgerList.push({
//         // ক) ইউজারের ডাটাবেজের সমস্ত অরিজিনাল ফিল্ড (সরাসরি স্প্রেড করা হলো)
//         ...user,
//         _id: user._id.toString(),
        
//         // খ) আপনার এক্সাম্পল অনুযায়ী ডাইনামিক ফিল্ডসমূহ হুবহু রুটে বসানো হলো
//         directSalesLifetime: nodeData.directSalesLifetime,
//         directSalesThisMonth: nodeData.directSalesThisMonth,
//         totalSalesVolume: nodeData.totalSalesVolume,
//         thisMonthSalesVolume: nodeData.thisMonthSalesVolume,
//         autoPosition: nodeData.autoPosition,
        
//         baseCommission: Number(nodeData.baseCommission.toFixed(2)),
//         selfQualifiesForBonus: nodeData.selfQualifiesForBonus,
//         performanceBonusRate: nodeData.performanceBonusRate,
//         monthlyBonusAmount: Number(nodeData.monthlyBonusAmount.toFixed(2)),
//         globalPoolBonusAmount: Number(nodeData.globalPoolBonusAmount.toFixed(2)),
//         earnedPools: isQualifiedForBill ? nodeData.earnedPools : [],
        
//         totalSalesAchieved: nodeData.totalSalesAchieved,
//         thisMonthSalesAchieved: nodeData.thisMonthSalesAchieved,
        
//         // গ) অডিটিং এবং ফ্রন্টএন্ডের জন্য প্রফেশনাল ট্র্যাকিং ফিল্ড
//         netTotalEarnings: Number(totalEarned.toFixed(2)),
//         qualificationStatus: isQualifiedForBill ? "Qualified" : "Disqualified for Pool/Bonus (Sales < 3000)"
//       });
//     }
//   });


//   // =========================================================================
//   // পাস ৭: ডিলার রেসপন্স লুপ (আর্কাইভ ও লাইভ প্রোটেকশনসহ সম্পূর্ণ ফিক্সড)
//   // =========================================================================
//   const dealerResultMap = {};

//   thisMonthSales.forEach(sale => {
//     const amt = Number(sale.grandTotal || sale.totalAmount || sale.amount || 0);
//     if (amt <= 0) return;

//     let dIdNo = null;
//     let dName = "Unknown Dealer";
//     let d_id = sale.dealer ? sale.dealer.toString() : "ARCHIVED_ID";

//     if (sale.isMonthlyArchived && sale.archivedSalesData && sale.archivedSalesData.dealerSnapshot) {
//       dIdNo = sale.archivedSalesData.dealerSnapshot.idNo;
//       dName = sale.archivedSalesData.dealerSnapshot.name || "Unknown Dealer";
//     } else if (sale.dealer) {
//       const matchingDealer = dealers.find(d => d._id.toString() === d_id);
//       if (matchingDealer) {
//         dIdNo = matchingDealer.dealerId || matchingDealer.idNo;
//         dName = matchingDealer.name || "Unknown Dealer";
//       }
//     }

//     if (dIdNo) {
//       if (!dealerResultMap[dIdNo]) {
//         dealerResultMap[dIdNo] = { _id: d_id, name: dName, dealerId: dIdNo, totalSales: 0 };
//       }
//       dealerResultMap[dIdNo].totalSales += amt;
//     }
//   });

//   dealers.forEach(dlr => {
//     const dIdNo = dlr.dealerId || dlr.idNo || "N/A";
//     if (!dealerResultMap[dIdNo]) {
//       dealerResultMap[dIdNo] = { _id: dlr._id.toString(), name: dlr.name || "Unknown Dealer", dealerId: dIdNo, totalSales: 0 };
//     }
//   });

//   const qualifiedDealers = Object.values(dealerResultMap).map(dlr => {
//     const commission = (typeof calculateDealerCommission === "function") ? calculateDealerCommission(dlr.totalSales) : 0;
//     const isDealerQualified = dlr.totalSales >= 5000;

//     return {
//       _id: dlr._id,
//       name: dlr.name,
//       dealerId: dlr.dealerId,
//       totalSales: Number(dlr.totalSales.toFixed(2)),
//       commission: Number(commission.toFixed(2)),
//       status: isDealerQualified ? "Qualified" : "Disqualified (Sales < 5000)"
//     };
//   });

//   // সম্পূর্ণ লেজার ক্যালকুলেশন ইঞ্জিনের ফাইনাল আউটপুট রিটার্ন
//   return { totalCompanySalesAmount, poolShareCounters, finalLedgerList, qualifiedDealers };
// };

// 12th version: 12.0.0 (June 2024) - Full Refactor with Multi-Pass Engine, Deep Leg Roll-Up, Dynamic Gap Commission, Top-Down Override, Global Pool Distribution, and Optimized Pagination
const executeLedgerCalculationEngine = async (currentYear, currentMonth) => {
  const db = mongoose.connection.db;

  const startDate = new Date(currentYear, currentMonth - 1, 1);
  const endDate = new Date(currentYear, currentMonth, 1);

  // =======================================================================
  // --- STEP 1 & 2: ডাটাবেজ রিড এবং মেমোরি ম্যাপ স্ট্রাকচার ইনিশিয়ালাইজেশন ---
  // =======================================================================
  let allLifetimeSales = await db.collection("invoices").find({}).toArray();
  if (!allLifetimeSales || allLifetimeSales.length === 0) {
    allLifetimeSales = await db.collection("sales").find({}).toArray();
  }

  const thisMonthSales = allLifetimeSales.filter(s => {
    const rawDate = s.date || s.createdAt;
    if (!rawDate) return false;
    const d = new Date(rawDate);
    return d >= startDate && d < endDate;
  });

  const totalCompanySalesAmount = thisMonthSales.reduce((sum, s) => sum + (s.grandTotal || 0), 0);
  const dealers = await db.collection("dealers").find({}).toArray();
  const users = await db.collection("users").find({ idNo: { $regex: /^MKT/i } }).toArray();

  const userSalesMap = {};
  const parentToChildrenMap = {}; 

  users.forEach(u => {
    userSalesMap[u.idNo] = { 
      ...u, 
      _id: u._id.toString(),
      directSalesLifetime: 0, 
      directSalesThisMonth: 0, 
      totalSalesVolume: 0,       
      thisMonthSalesVolume: 0,   
      autoPosition: "SALES REPRESENTATIVE",
      baseCommission: 0,
      currentSlabRate: 0,
      selfQualifiesForBonus: false,
      performanceBonusRate: 0,
      monthlyBonusAmount: 0,
      globalPoolBonusAmount: 0,
      earnedPools: [] 
    };
    
    const parentId = u.refIdNo || "0";
    if (!parentToChildrenMap[parentId]) parentToChildrenMap[parentId] = [];
    parentToChildrenMap[parentId].push(u.idNo); 
  });

  // =======================================================================
  // --- STEP 3: ডাইরেক্ট পার্সোনাল সেলস ভলিউম অ্যাসাইনমেন্ট ---
  // =======================================================================
  allLifetimeSales.forEach(sale => {
    const saleAmount = Number(sale.grandTotal || sale.totalAmount || sale.amount || 0);
    const saleDate = new Date(sale.date || sale.createdAt);
    const isSelectedMonth = saleDate >= startDate && saleDate < endDate;

    let targetEmployeeIdNo = null;

    if (sale.isMonthlyArchived && sale.archivedSalesData?.employeeSnapshot?.idNo) {
      targetEmployeeIdNo = sale.archivedSalesData.employeeSnapshot.idNo;
    } else if (sale.dealer) {
      const dStr = sale.dealer.toString();
      const matchingDealer = dealers.find(d => d._id.toString() === dStr);
      if (matchingDealer && matchingDealer.referenceIdNo) {
        targetEmployeeIdNo = matchingDealer.referenceIdNo;
      }
    }

    if (targetEmployeeIdNo && userSalesMap[targetEmployeeIdNo]) {
      const emp = userSalesMap[targetEmployeeIdNo];
      emp.directSalesLifetime += saleAmount;
      emp.totalSalesVolume += saleAmount; 

      if (isSelectedMonth) {
        emp.directSalesThisMonth += saleAmount;
        emp.thisMonthSalesVolume += saleAmount; 
      }
    }
  });

  // =======================================================================
  // 🔒 মান্থলি কোয়ালিফিকেশন হেল্পার ইঞ্জিন (AM & Below Fallback Enabled)
  // =======================================================================
  const checkSelfQualificationLegWise = (position, totalSales, qualifiedLegsCounts = {}) => {
    const currentPos = (position || "").trim().toUpperCase();
    const countAtLeast = (targetPos) => {
      return Object.keys(qualifiedLegsCounts).reduce((total, pos) => {
        return RANK_MAP[pos] >= RANK_MAP[targetPos] ? total + qualifiedLegsCounts[pos] : total;
      }, 0);
    };

    let qualifies = false;
    let performanceBonusRate = 0;

    switch (currentPos) {
      case "RSM":
        if ((totalSales >= 75000 && countAtLeast("AM") >= 3) || totalSales >= 75000) { qualifies = true; performanceBonusRate = 0.01; }
        break;
      case "DSM":
        if ((totalSales >= 100000 && countAtLeast("RSM") >= 1 && countAtLeast("AM") >= 2) || totalSales >= 100000) { qualifies = true; performanceBonusRate = 0.005; }
        break;
      case "SDSM":
        if (totalSales >= 200000 && countAtLeast("DSM") >= 2) { qualifies = true; performanceBonusRate = 0.005; }
        break;
      case "SM":
        if (totalSales >= 300000 && countAtLeast("DSM") >= 3) { qualifies = true; performanceBonusRate = 0.0025; }
        break;
      case "NSM":
        if (totalSales >= 400000 && countAtLeast("DSM") >= 4) { qualifies = true; performanceBonusRate = 0.0025; }
        break;
      case "ED":
        if (totalSales >= 1600000 && countAtLeast("NSM") >= 4) { qualifies = true; performanceBonusRate = 0.0025; }
        break;
      case "BOM":
        if (totalSales >= 3200000 && countAtLeast("ED") >= 2) { qualifies = true; performanceBonusRate = 0.0025; }
        break;
      // 🔒 💥 ক্রিশিয়াল ফিক্স: AM এবং Sales Representative মেম্বারদের জন্য ট্রু কোয়ালিফিকেশন এনফোর্সমেন্ট
      case "AM":
      case "SALES REPRESENTATIVE":
        qualifies = true;
        performanceBonusRate = 0;
        break;
      default:
        qualifies = true;
        break;
    }
    return { qualifies, performanceBonusRate };
  };

  // =======================================================================
  // --- পাস ১ (Two-Pass Recursion): পজিশন ও স্ল্যাব রেট প্রাক-লকিং ইঞ্জিন ---
  // =======================================================================
  const processedNodes = new Set(); 
  
  const processHierarchyPositions = (currentIdNo) => {
    if (processedNodes.has(currentIdNo)) {
      const emp = userSalesMap[currentIdNo];
      const resLegs = { AM: 0, RSM: 0, DSM: 0, NSM: 0, ED: 0, BOM: 0 };
      if (emp) {
        const myPos = (emp.autoPosition || "").toUpperCase().trim();
        if (resLegs[myPos] !== undefined) resLegs[myPos] = 1;
      }
      return resLegs;
    }
    
    const currentEmployee = userSalesMap[currentIdNo];
    if (!currentEmployee) return { AM: 0, RSM: 0, DSM: 0, NSM: 0, ED: 0, BOM: 0 };

    const childrenIds = parentToChildrenMap[currentIdNo] || [];
    const masterLegsCounts = { AM: 0, RSM: 0, DSM: 0, NSM: 0, ED: 0, BOM: 0 };
    
    let teamSalesSumTotal = 0;
    let teamSalesSumMonth = 0;

    childrenIds.forEach(childId => {
      const childSubTreeLegs = processHierarchyPositions(childId);
      const childData = userSalesMap[childId];
      
      if (childData) {
        teamSalesSumTotal += childData.totalSalesVolume;
        teamSalesSumMonth += childData.thisMonthSalesVolume;

        const childFinalPos = (childData.autoPosition || "").toUpperCase().trim();
        const highestAchievedInThisLeg = { AM: 0, RSM: 0, DSM: 0, NSM: 0, ED: 0, BOM: 0 };
        
        Object.keys(childSubTreeLegs).forEach(pos => {
          if (childSubTreeLegs[pos] > 0) highestAchievedInThisLeg[pos] = 1;
        });
        if (highestAchievedInThisLeg[childFinalPos] !== undefined) {
          highestAchievedInThisLeg[childFinalPos] = 1;
        }

        Object.keys(highestAchievedInThisLeg).forEach(pos => {
          masterLegsCounts[pos] += highestAchievedInThisLeg[pos];
        });
      }
    });
    
    currentEmployee.totalSalesVolume += teamSalesSumTotal;
    currentEmployee.thisMonthSalesVolume += teamSalesSumMonth;

    currentEmployee.autoPosition = autoDeterminePosition(currentEmployee.totalSalesVolume, masterLegsCounts);
    currentEmployee.currentSlabRate = POSITION_SLABS[currentEmployee.autoPosition] || 0;
    
    const qualification = checkSelfQualificationLegWise(
      currentEmployee.autoPosition,
      currentEmployee.thisMonthSalesVolume,
      masterLegsCounts
    );
    currentEmployee.selfQualifiesForBonus = qualification.qualifies;
    currentEmployee.performanceBonusRate = qualification.performanceBonusRate;

    processedNodes.add(currentIdNo);

    const myFinalPos = (currentEmployee.autoPosition || "").toUpperCase().trim();
    const returnLegsSummary = { ...masterLegsCounts };
    if (returnLegsSummary[myFinalPos] !== undefined) {
      returnLegsSummary[myFinalPos] = Math.max(returnLegsSummary[myFinalPos], 1);
    }

    return returnLegsSummary;
  };

  users.forEach(user => {
    if (user.refIdNo === "0" || !user.refIdNo || !userSalesMap[user.refIdNo]) {
      processHierarchyPositions(user.idNo);
    }
  });

    // =======================================================================
  // --- পাস ২: লিনিয়ার ডাইনামিক গ্যাপ কমিশন (The True MLM Generation Gap Engine) ---
  // =======================================================================
  thisMonthSales.forEach(sale => {
    const invoiceAmount = Number(sale.grandTotal || sale.totalAmount || sale.amount || 0);
    if (invoiceAmount <= 0) return;

    let startEmployeeIdNo = null;
    if (sale.isMonthlyArchived && sale.archivedSalesData?.employeeSnapshot?.idNo) {
      startEmployeeIdNo = sale.archivedSalesData.employeeSnapshot.idNo;
    } else if (sale.dealer) {
      const dStr = sale.dealer.toString();
      const matchingDealer = dealers.find(d => d._id.toString() === dStr);
      if (matchingDealer && matchingDealer.referenceIdNo) {
        startEmployeeIdNo = matchingDealer.referenceIdNo;
      }
    }

    if (!startEmployeeIdNo) return;
    
    let currentIdNo = startEmployeeIdNo;
    let distributedRateSoFar = 0; 
    const visited = new Set(); 

    // ইনভয়েসের মূল বিক্রয়কারীর নিজস্ব ডিরেক্ট লেগের সর্বোচ্চ স্ল্যাব নির্ধারণ লুপ
    let directLegHeadIdNo = startEmployeeIdNo;
    const legVisited = new Set();
    while (
      directLegHeadIdNo && 
      userSalesMap[directLegHeadIdNo] && 
      userSalesMap[directLegHeadIdNo].refIdNo && 
      userSalesMap[directLegHeadIdNo].refIdNo !== "0" && 
      userSalesMap[directLegHeadIdNo].refIdNo !== "MKT-0001" && // বসের আইডি কন্ডিশন
      !legVisited.has(directLegHeadIdNo)
    ) {
      legVisited.add(directLegHeadIdNo);
      directLegHeadIdNo = userSalesMap[directLegHeadIdNo].refIdNo;
    }

    let legHeadMaxSlab = 0;
    const legHeadNode = userSalesMap[directLegHeadIdNo];
    if (legHeadNode) {
      legHeadMaxSlab = POSITION_SLABS[legHeadNode.autoPosition?.toUpperCase()] || 0;
    }

    while (currentIdNo && currentIdNo !== "0" && !visited.has(currentIdNo)) {
      visited.add(currentIdNo);
      const empNode = userSalesMap[currentIdNo];
      if (!empNode) break;

      let myPositionRate = 0;
      if (empNode.selfQualifiesForBonus === true) {
        myPositionRate = empNode.currentSlabRate || 0;
      }

      // 🔒 স্ল্যাব প্রোটেকশন গার্ড: শুধুমাত্র মেইন বস নোডে আসলেই ডিস্ট্রিবিউশন কন্ডিশন লক হবে
      if (empNode.idNo === "MKT-0001" || empNode.refIdNo === "0" || !userSalesMap[empNode.refIdNo]) {
        distributedRateSoFar = Math.max(distributedRateSoFar, legHeadMaxSlab);
      }

      if (myPositionRate > distributedRateSoFar) {
        const gapRate = myPositionRate - distributedRateSoFar;
        empNode.baseCommission += invoiceAmount * gapRate; // নিখুঁত কমিশন ডিস্ট্রিবিউশন
        distributedRateSoFar = myPositionRate; 
      }

      if (distributedRateSoFar >= 0.24) break;
      currentIdNo = empNode.refIdNo; 
    }
  });

  // =======================================================================
  // --- পাস ৩, ৪, ৫, ৬ & ৭: ওভাররাইড, গ্লোবাল পুল ও ফাইনাল রেসপন্স মেকার ---
  // =======================================================================
  
  // পাস ৩: টপ-ডাউন কোয়ালিফিকেশন ওভাররাইড চেইন রানার
  const applyTopDownBonusQualification = (currentIdNo, parentQualifies = false) => {
    const currentEmployee = userSalesMap[currentIdNo];
    if (!currentEmployee) return;
    if (parentQualifies) currentEmployee.selfQualifiesForBonus = true;
    const childrenIds = parentToChildrenMap[currentIdNo] || [];
    childrenIds.forEach(childId => applyTopDownBonusQualification(childId, currentEmployee.selfQualifiesForBonus));
  };
  if (parentToChildrenMap["0"]) {
    parentToChildrenMap["0"].forEach(rootIdNo => applyTopDownBonusQualification(rootIdNo, false));
  }

  // 🔒 পাস ৩.১: গ্যারান্টিড রেট সিঙ্ক লক ইঞ্জিন
  Object.keys(userSalesMap).forEach(idNo => {
    const emp = userSalesMap[idNo];
    if (!emp) return;

    if (emp.selfQualifiesForBonus === true) {
      const currentChildrenIds = parentToChildrenMap[idNo] || [];
      const syncedLegsCounts = { AM: 0, RSM: 0, DSM: 0, NSM: 0, ED: 0, BOM: 0 };

      currentChildrenIds.forEach(cId => {
        const cData = userSalesMap[cId];
        if (cData) {
          const cPos = (cData.autoPosition || "").toUpperCase().trim();
          const singleLegFlags = { AM: 0, RSM: 0, DSM: 0, NSM: 0, ED: 0, BOM: 0 };
          if (singleLegFlags[cPos] !== undefined) singleLegFlags[cPos] = 1;

          const trackDeepLegPositions = (nodeId) => {
            const subChildren = parentToChildrenMap[nodeId] || [];
            subChildren.forEach(subId => {
              const subData = userSalesMap[subId];
              if (subData) {
                const subPos = (subData.autoPosition || "").toUpperCase().trim();
                if (singleLegFlags[subPos] !== undefined) singleLegFlags[subPos] = 1;
                trackDeepLegPositions(subId);
              }
            });
          };
          trackDeepLegPositions(cId);

          Object.keys(singleLegFlags).forEach(pos => {
            syncedLegsCounts[pos] += singleLegFlags[pos];
          });
        }
      });

      const finalCheck = checkSelfQualificationLegWise(emp.autoPosition, emp.thisMonthSalesVolume, syncedLegsCounts);
      if (finalCheck.qualifies && finalCheck.performanceBonusRate > 0) {
        emp.performanceBonusRate = finalCheck.performanceBonusRate;
      } else {
        const upPos = (emp.autoPosition || "").toUpperCase().trim();
        if (upPos === "RSM") emp.performanceBonusRate = 0.01;
        else if (upPos === "DSM" || upPos === "SDSM") emp.performanceBonusRate = 0.005;
        else if (["SM", "NSM", "ED", "BOM"].includes(upPos)) emp.performanceBonusRate = 0.0025;
        else emp.performanceBonusRate = 0;
      }
    }
  });

  // পাস ৪: গ্লোবাল পুল কাউন্টার এবং মেম্বার অ্যাসাইনমেন্ট
  const poolShareCounters = { RSM: 0, DSM: 0, SDSM: 0, SM: 0, NSM: 0, ED: 0, BOM: 0 };
  const qualifiedPoolMembers = { RSM: [], DSM: [], SDSM: [], SM: [], NSM: [], ED: [], BOM: [] };
  
  users.forEach(user => {
    const nodeData = userSalesMap[user.idNo];
    if (!nodeData) return;
    const isQualifiedForBill = (nodeData.directSalesThisMonth || 0) >= 3000;
    const myPos = nodeData.autoPosition?.toUpperCase();

    if (isQualifiedForBill && nodeData.selfQualifiesForBonus && typeof ELIGIBLE_POOL_POSITIONS !== "undefined" && ELIGIBLE_POOL_POSITIONS.includes(myPos)) {
      const myRankValue = RANK_MAP[myPos];
      ELIGIBLE_POOL_POSITIONS.forEach(poolName => {
        const poolRankValue = RANK_MAP[poolName];
        if (myPos === "RSM") {
          if (poolName === "RSM") { poolShareCounters[poolName]++; nodeData.earnedPools.push(poolName); qualifiedPoolMembers[poolName].push(user.idNo); }
        } else {
          if (myRankValue >= poolRankValue && poolName !== "RSM") { poolShareCounters[poolName]++; nodeData.earnedPools.push(poolName); qualifiedPoolMembers[poolName].push(user.idNo); }
        }
      });
    }
  });

  // পাস ৫: গ্লোবাল কোম্পানি পুল বোনাস ডিস্ট্রিবিউশন
  Object.keys(userSalesMap).forEach(idNo => {
    if (userSalesMap[idNo]) userSalesMap[idNo].globalPoolBonusAmount = 0;
  });

  if (typeof ELIGIBLE_POOL_POSITIONS !== "undefined") {
    ELIGIBLE_POOL_POSITIONS.forEach(poolName => {
      const poolRate = SALES_SHARE_CONFIG[poolName] || 0;
      const uniqueMemberIds = Array.from(new Set(qualifiedPoolMembers[poolName] || []));
      const totalPoolMembers = uniqueMemberIds.length;

      if (totalPoolMembers > 0 && poolRate > 0) {
        const totalPoolMoney = totalCompanySalesAmount * poolRate;
        const sharePerMember = totalPoolMoney / totalPoolMembers;
        
        uniqueMemberIds.forEach(idNo => {
          if (userSalesMap[idNo]) userSalesMap[idNo].globalPoolBonusAmount += sharePerMember;
        });
      }
    });
  }

    // =========================================================================
  // পাস ৬: কর্মচারীদের ফাইনাল ফ্ল্যাট রেসপন্স এরে প্রস্তুতকরণ (টিম ভলিউম পারফরম্যান্স বোনাস সহ)
  // =========================================================================
  const finalLedgerList = [];

  users.forEach(user => {
    const nodeData = userSalesMap[user.idNo];
    if (!nodeData) return;

    // ৩০০০ টাকা মান্থলি ডাইরেক্ট সেলসের শর্ত চেক
    const isQualifiedForBill = (nodeData.directSalesThisMonth || 0) >= 3000;

    let salesShareBonus = nodeData.globalPoolBonusAmount || 0;
    let performanceBonus = 0;

    // 🔒 💥 ক্রিশিয়াল বিজনেস রুল ফিক্স: 
    // পারফরম্যান্স বোনাস অ্যামাউন্টটি এখন চলতি মাসের মোট টিম সেলস ভলিউমের (`thisMonthSalesVolume`) ওপর গুণ হবে।
    if (isQualifiedForBill && nodeData.selfQualifiesForBonus) {
      performanceBonus = (nodeData.thisMonthSalesVolume || 0) * (nodeData.performanceBonusRate || 0);
    }

    // পাস ২-এর জেনারেট হওয়া গ্যাপ কমিশন (baseCommission) সবসময় সুরক্ষিত থাকবে, জিরো হবে না
    const finalBaseCommission = nodeData.baseCommission || 0;
    
    // ৩০০০ টাকার কম সেলস হলে গ্লোবাল পুল বোনাস শূন্য হবে
    const finalSalesShareBonus = isQualifiedForBill ? salesShareBonus : 0;
    
    nodeData.baseCommission = finalBaseCommission;
    nodeData.monthlyBonusAmount = performanceBonus;
    nodeData.globalPoolBonusAmount = finalSalesShareBonus;

    nodeData.totalSalesAchieved = nodeData.totalSalesVolume;
    nodeData.thisMonthSalesAchieved = nodeData.thisMonthSalesVolume;

    // গ্রস আর্নিং টোটাল (গ্যাপ কমিশন + পুল বোনাস + সংশোধিত টিম পারফরম্যান্স বোনাস)
    const totalEarned = finalBaseCommission + finalSalesShareBonus + performanceBonus;

    // ফিল্টারিং শর্ত: ইনকাম থাকলে অথবা লাইফটাইম সেলস ২৫০০০ এর বেশি হলে রেসপন্সে ঢুকবে
    if (totalEarned > 0 || (nodeData.totalSalesVolume || 0) >= 25000) {
      finalLedgerList.push({
        // ক) ইউজারের ডাটাবেজের সমস্ত অরিজিনাল ফিল্ড (সরাসরি স্প্রেড করা হলো)
        ...user,
        _id: user._id.toString(),
        
        // খ) আপনার এক্সাম্পল অনুযায়ী ডাইনামিক ফিল্ডসমূহ হুবহু রুটে বসানো হলো
        directSalesLifetime: nodeData.directSalesLifetime,
        directSalesThisMonth: nodeData.directSalesThisMonth,
        totalSalesVolume: nodeData.totalSalesVolume,
        thisMonthSalesVolume: nodeData.thisMonthSalesVolume,
        autoPosition: nodeData.autoPosition,
        
        baseCommission: Number(nodeData.baseCommission.toFixed(2)),
        selfQualifiesForBonus: nodeData.selfQualifiesForBonus,
        performanceBonusRate: nodeData.performanceBonusRate,
        monthlyBonusAmount: Number(nodeData.monthlyBonusAmount.toFixed(2)),
        globalPoolBonusAmount: Number(nodeData.globalPoolBonusAmount.toFixed(2)),
        earnedPools: isQualifiedForBill ? nodeData.earnedPools : [],
        
        totalSalesAchieved: nodeData.totalSalesAchieved,
        thisMonthSalesAchieved: nodeData.thisMonthSalesAchieved,
        
        // গ) অডিটিং এবং ফ্রন্টএন্ডের জন্য প্রফেশনাল ট্র্যাকিং ফিল্ড
        netTotalEarnings: Number(totalEarned.toFixed(2)),
        qualificationStatus: isQualifiedForBill ? "Qualified" : "Disqualified for Pool (Sales < 3000)"
      });
    }
  });

  // =========================================================================
  // পাস ৭: ডিলার রেসপন্স লুপ (আর্কাইভ ও লাইভ প্রোটেকশনসহ সম্পূর্ণ ফিক্সড)
  // =========================================================================
  const dealerResultMap = {};

  thisMonthSales.forEach(sale => {
    const amt = Number(sale.grandTotal || sale.totalAmount || sale.amount || 0);
    if (amt <= 0) return;

    let dIdNo = null;
    let dName = "Unknown Dealer";
    let d_id = sale.dealer ? sale.dealer.toString() : "ARCHIVED_ID";

    if (sale.isMonthlyArchived && sale.archivedSalesData && sale.archivedSalesData.dealerSnapshot) {
      dIdNo = sale.archivedSalesData.dealerSnapshot.idNo;
      dName = sale.archivedSalesData.dealerSnapshot.name || "Unknown Dealer";
    } else if (sale.dealer) {
      const matchingDealer = dealers.find(d => d._id.toString() === d_id);
      if (matchingDealer) {
        dIdNo = matchingDealer.dealerId || matchingDealer.idNo;
        dName = matchingDealer.name || "Unknown Dealer";
      }
    }

    if (dIdNo) {
      if (!dealerResultMap[dIdNo]) {
        dealerResultMap[dIdNo] = { _id: d_id, name: dName, dealerId: dIdNo, totalSales: 0 };
      }
      dealerResultMap[dIdNo].totalSales += amt;
    }
  });

  dealers.forEach(dlr => {
    const dIdNo = dlr.dealerId || dlr.idNo || "N/A";
    if (!dealerResultMap[dIdNo]) {
      dealerResultMap[dIdNo] = { _id: dlr._id.toString(), name: dlr.name || "Unknown Dealer", dealerId: dIdNo, totalSales: 0 };
    }
  });

  const qualifiedDealers = Object.values(dealerResultMap).map(dlr => {
    const commission = (typeof calculateDealerCommission === "function") ? calculateDealerCommission(dlr.totalSales) : 0;
    const isDealerQualified = dlr.totalSales >= 5000;

    return {
      _id: dlr._id,
      name: dlr.name,
      dealerId: dlr.dealerId,
      totalSales: Number(dlr.totalSales.toFixed(2)),
      commission: Number(commission.toFixed(2)),
      status: isDealerQualified ? "Qualified" : "Disqualified (Sales < 5000)"
    };
  });

  // সম্পূর্ণ লেজার ক্যালকুলেশন ইঞ্জিনের ফাইনাল আউটপুট রিটার্ন
  return { totalCompanySalesAmount, poolShareCounters, finalLedgerList, qualifiedDealers };
};

//13th version: 13.0.0 (June 2024) - Full Refactor with Multi-Pass Engine, Deep Leg Roll-Up, Dynamic Gap Commission, Top-Down Override, Global Pool Distribution, and Optimized Pagination
// const executeLedgerCalculationEngine = async (currentYear, currentMonth) => {
//   const db = mongoose.connection.db;

//   const startDate = new Date(currentYear, currentMonth - 1, 1);
//   const endDate = new Date(currentYear, currentMonth, 1);

//   // =======================================================================
//   // --- STEP 1 & 2: ডাটাবেজ রিড এবং মেমোরি ম্যাপ স্ট্রাকচার ইনিশিয়ালাইজেশন ---
//   // =======================================================================
//   let allLifetimeSales = await db.collection("invoices").find({}).toArray();
//   if (!allLifetimeSales || allLifetimeSales.length === 0) {
//     allLifetimeSales = await db.collection("sales").find({}).toArray();
//   }

//   const thisMonthSales = allLifetimeSales.filter(s => {
//     const rawDate = s.date || s.createdAt;
//     if (!rawDate) return false;
//     const d = new Date(rawDate);
//     return d >= startDate && d < endDate;
//   });

//   const totalCompanySalesAmount = thisMonthSales.reduce((sum, s) => sum + (s.grandTotal || 0), 0);
//   const dealers = await db.collection("dealers").find({}).toArray();
//   const users = await db.collection("users").find({ idNo: { $regex: /^MKT/i } }).toArray();

//   const userSalesMap = {};
//   const parentToChildrenMap = {}; 

//   users.forEach(u => {
//     userSalesMap[u.idNo] = { 
//       ...u, 
//       _id: u._id.toString(),
//       directSalesLifetime: 0, 
//       directSalesThisMonth: 0, 
//       totalSalesVolume: 0,       
//       thisMonthSalesVolume: 0,   
//       autoPosition: "SALES REPRESENTATIVE",
//       baseCommission: 0,
//       currentSlabRate: 0,
//       selfQualifiesForBonus: false,
//       performanceBonusRate: 0,
//       monthlyBonusAmount: 0,
//       globalPoolBonusAmount: 0,
//       earnedPools: [] 
//     };
    
//     const parentId = u.refIdNo || "0";
//     if (!parentToChildrenMap[parentId]) parentToChildrenMap[parentId] = [];
//     parentToChildrenMap[parentId].push(u.idNo); 
//   });

//   // =======================================================================
//   // --- STEP 3: ডাইরেক্ট পার্সোনাল সেলস ভলিউম অ্যাসাইনমেন্ট ---
//   // =======================================================================
//   allLifetimeSales.forEach(sale => {
//     const saleAmount = Number(sale.grandTotal || sale.totalAmount || sale.amount || 0);
//     const saleDate = new Date(sale.date || sale.createdAt);
//     const isSelectedMonth = saleDate >= startDate && saleDate < endDate;

//     let targetEmployeeIdNo = null;

//     if (sale.isMonthlyArchived && sale.archivedSalesData?.employeeSnapshot?.idNo) {
//       targetEmployeeIdNo = sale.archivedSalesData.employeeSnapshot.idNo;
//     } else if (sale.dealer) {
//       const dStr = sale.dealer.toString();
//       const matchingDealer = dealers.find(d => d._id.toString() === dStr);
//       if (matchingDealer && matchingDealer.referenceIdNo) {
//         targetEmployeeIdNo = matchingDealer.referenceIdNo;
//       }
//     }

//     if (targetEmployeeIdNo && userSalesMap[targetEmployeeIdNo]) {
//       const emp = userSalesMap[targetEmployeeIdNo];
//       emp.directSalesLifetime += saleAmount;
//       emp.totalSalesVolume += saleAmount; 

//       if (isSelectedMonth) {
//         emp.directSalesThisMonth += saleAmount;
//         emp.thisMonthSalesVolume += saleAmount; 
//       }
//     }
//   });

//   // =======================================================================
//   // --- পাস ১: ট্রি ভলিউম রোল-আপ এবং স্ল্যাব রেট লকিং ইঞ্জিন ---
//   // =======================================================================
//   const processedNodes = new Set(); 
  
//   const processHierarchyPositions = (currentIdNo) => {
//     if (processedNodes.has(currentIdNo)) {
//       const emp = userSalesMap[currentIdNo];
//       const resLegs = { AM: 0, RSM: 0, DSM: 0, NSM: 0, ED: 0, BOM: 0 };
//       if (emp) {
//         const myPos = (emp.autoPosition || "").toUpperCase().trim();
//         if (resLegs[myPos] !== undefined) resLegs[myPos] = 1;
//       }
//       return resLegs;
//     }
    
//     const currentEmployee = userSalesMap[currentIdNo];
//     if (!currentEmployee) return { AM: 0, RSM: 0, DSM: 0, NSM: 0, ED: 0, BOM: 0 };

//     const childrenIds = parentToChildrenMap[currentIdNo] || [];
//     const masterLegsCounts = { AM: 0, RSM: 0, DSM: 0, NSM: 0, ED: 0, BOM: 0 };
    
//     let teamSalesSumTotal = 0;
//     let teamSalesSumMonth = 0;

//     childrenIds.forEach(childId => {
//       const childSubTreeLegs = processHierarchyPositions(childId);
//       const childData = userSalesMap[childId];
      
//       if (childData) {
//         teamSalesSumTotal += childData.totalSalesVolume;
//         teamSalesSumMonth += childData.thisMonthSalesVolume;

//         const childFinalPos = (childData.autoPosition || "").toUpperCase().trim();
//         const highestAchievedInThisLeg = { AM: 0, RSM: 0, DSM: 0, NSM: 0, ED: 0, BOM: 0 };
        
//         Object.keys(childSubTreeLegs).forEach(pos => {
//           if (childSubTreeLegs[pos] > 0) highestAchievedInThisLeg[pos] = 1;
//         });
//         if (highestAchievedInThisLeg[childFinalPos] !== undefined) {
//           highestAchievedInThisLeg[childFinalPos] = 1;
//         }

//         Object.keys(highestAchievedInThisLeg).forEach(pos => {
//           masterLegsCounts[pos] += highestAchievedInThisLeg[pos];
//         });
//       }
//     });
    
//     currentEmployee.totalSalesVolume += teamSalesSumTotal;
//     currentEmployee.thisMonthSalesVolume += teamSalesSumMonth;

//     currentEmployee.autoPosition = autoDeterminePosition(currentEmployee.totalSalesVolume, masterLegsCounts);
//     currentEmployee.currentSlabRate = POSITION_SLABS[currentEmployee.autoPosition] || 0;
    
//     const qualification = checkSelfQualificationOnly(
//       currentEmployee.autoPosition,
//       currentEmployee.thisMonthSalesVolume,
//       masterLegsCounts
//     );
//     currentEmployee.selfQualifiesForBonus = qualification.qualifies;
//     currentEmployee.performanceBonusRate = qualification.performanceBonusRate;

//     processedNodes.add(currentIdNo);

//     const myFinalPos = (currentEmployee.autoPosition || "").toUpperCase().trim();
//     const returnLegsSummary = { ...masterLegsCounts };
//     if (returnLegsSummary[myFinalPos] !== undefined) {
//       returnLegsSummary[myFinalPos] = Math.max(returnLegsSummary[myFinalPos], 1);
//     }

//     return returnLegsSummary;
//   };

//   users.forEach(user => {
//     if (user.refIdNo === "0" || !user.refIdNo || !userSalesMap[user.refIdNo]) {
//       processHierarchyPositions(user.idNo);
//     }
//   });

//   // =======================================================================
//   // --- পাস ২: লিনিয়ার ডাইনামিক গ্যাপ কমিশন (The True MLM Generation Gap Engine) ---
//   // =======================================================================
//   thisMonthSales.forEach(sale => {
//     const invoiceAmount = Number(sale.grandTotal || sale.totalAmount || sale.amount || 0);
//     if (invoiceAmount <= 0) return;

//     let startEmployeeIdNo = null;
//     if (sale.isMonthlyArchived && sale.archivedSalesData?.employeeSnapshot?.idNo) {
//       startEmployeeIdNo = sale.archivedSalesData.employeeSnapshot.idNo;
//     } else if (sale.dealer) {
//       const dStr = sale.dealer.toString();
//       const matchingDealer = dealers.find(d => d._id.toString() === dStr);
//       if (matchingDealer && matchingDealer.referenceIdNo) {
//         startEmployeeIdNo = matchingDealer.referenceIdNo;
//       }
//     }

//     if (!startEmployeeIdNo) return;
    
//     let currentIdNo = startEmployeeIdNo;
    
//     // 🔒 গ্যাপ ডিস্ট্রিবিউশন রেট সবসময় ০% থেকে শুরু হবে যাতে অরিজিনাল ইনভয়েসকারী পুরো টাকা পায়
//     let distributedRateSoFar = 0; 
//     const visited = new Set(); 

//     // ইনভয়েসের মূল বিক্রয়কারীর নিজস্ব ডিরেক্ট লেগের সর্বোচ্চ স্ল্যাব নির্ধারণ লুপ
//     let directLegHeadIdNo = startEmployeeIdNo;
//     const legVisited = new Set();
//     while (
//       directLegHeadIdNo && 
//       userSalesMap[directLegHeadIdNo] && 
//       userSalesMap[directLegHeadIdNo].refIdNo && 
//       userSalesMap[directLegHeadIdNo].refIdNo !== "0" && 
//       userSalesMap[directLegHeadIdNo].refIdNo !== "MKT-0001" && 
//       !legVisited.has(directLegHeadIdNo)
//     ) {
//       legVisited.add(directLegHeadIdNo);
//       directLegHeadIdNo = userSalesMap[directLegHeadIdNo].refIdNo;
//     }

//     let legHeadMaxSlab = 0;
//     const legHeadNode = userSalesMap[directLegHeadIdNo];
//     if (legHeadNode) {
//       legHeadMaxSlab = POSITION_SLABS[legHeadNode.autoPosition?.toUpperCase()] || 0;
//     }

//     while (currentIdNo && currentIdNo !== "0" && !visited.has(currentIdNo)) {
//       visited.add(currentIdNo);
//       const empNode = userSalesMap[currentIdNo];
//       if (!empNode) break;

//       let myPositionRate = 0;
//       if (empNode.selfQualifiesForBonus === true) {
//         myPositionRate = empNode.currentSlabRate || 0;
//       }

//       // 🔒 স্ল্যাব প্রোটেকশন গার্ড: শুধুমাত্র মেইন রুট বা বস নোডে আসলেই ডিস্ট্রিবিউশন বাউণ্ডারি লক হবে
//       if (empNode.idNo === "MKT-0001" || empNode.refIdNo === "0" || !userSalesMap[empNode.refIdNo]) {
//         distributedRateSoFar = Math.max(distributedRateSoFar, legHeadMaxSlab);
//       }

//       if (myPositionRate > distributedRateSoFar) {
//         const gapRate = myPositionRate - distributedRateSoFar;
        
//         // গ্যাপ এবং নিজের পার্সোনাল সেলসের পুরো স্ল্যাব কমিশন সরাসরি পাস ২ থেকেই সুনির্দিষ্টভাবে যোগ হচ্ছে
//         empNode.baseCommission += invoiceAmount * gapRate; 
        
//         distributedRateSoFar = myPositionRate; 
//       }

//       if (distributedRateSoFar >= 0.24) break;
//       currentIdNo = empNode.refIdNo; 
//     }
//   });

//   // =======================================================================
//   // --- পাস ৩, ৪, ৫, ৬ & VII: ওভাররাইড, গ্লোবাল পুল ও ফাইনাল রেসপন্স মেকার ---
//   // =======================================================================
  
//   // পাস ৩: টপ-ডাউন কোয়ালিফিকেশন ওভাররাইড চেইন চেইন রানার
//   const applyTopDownBonusQualification = (currentIdNo, parentQualifies = false) => {
//     const currentEmployee = userSalesMap[currentIdNo];
//     if (!currentEmployee) return;
//     if (parentQualifies) currentEmployee.selfQualifiesForBonus = true;
//     const childrenIds = parentToChildrenMap[currentIdNo] || [];
//     childrenIds.forEach(childId => applyTopDownBonusQualification(childId, currentEmployee.selfQualifiesForBonus));
//   };
//   if (parentToChildrenMap["0"]) {
//     parentToChildrenMap["0"].forEach(rootIdNo => applyTopDownBonusQualification(rootIdNo, false));
//   }

//   // 🔒 পাস ৩.১: গ্যারান্টিড রেট সিঙ্ক লক ইঞ্জিন (Binary Leg Flags Fixed)
//   Object.keys(userSalesMap).forEach(idNo => {
//     const emp = userSalesMap[idNo];
//     if (!emp) return;

//     if (emp.selfQualifiesForBonus === true) {
//       const currentChildrenIds = parentToChildrenMap[idNo] || [];
//       const syncedLegsCounts = { AM: 0, RSM: 0, DSM: 0, NSM: 0, ED: 0, BOM: 0 };

//       currentChildrenIds.forEach(cId => {
//         const cData = userSalesMap[cId];
//         if (cData) {
//           const cPos = (cData.autoPosition || "").toUpperCase().trim();
//           const singleLegFlags = { AM: 0, RSM: 0, DSM: 0, NSM: 0, ED: 0, BOM: 0 };
//           if (singleLegFlags[cPos] !== undefined) singleLegFlags[cPos] = 1;

//           const trackDeepLegPositions = (nodeId) => {
//             const subChildren = parentToChildrenMap[nodeId] || [];
//             subChildren.forEach(subId => {
//               const subData = userSalesMap[subId];
//               if (subData) {
//                 const subPos = (subData.autoPosition || "").toUpperCase().trim();
//                 if (singleLegFlags[subPos] !== undefined) singleLegFlags[subPos] = 1;
//                 trackDeepLegPositions(subId);
//               }
//             });
//           };
//           trackDeepLegPositions(cId);

//           Object.keys(singleLegFlags).forEach(pos => {
//             syncedLegsCounts[pos] += singleLegFlags[pos];
//           });
//         }
//       });

//       const finalCheck = checkSelfQualificationOnly(emp.autoPosition, emp.thisMonthSalesVolume, syncedLegsCounts);
//       if (finalCheck.qualifies && finalCheck.performanceBonusRate > 0) {
//         emp.performanceBonusRate = finalCheck.performanceBonusRate;
//       } else {
//         const upPos = (emp.autoPosition || "").toUpperCase().trim();
//         if (upPos === "RSM") emp.performanceBonusRate = 0.01;
//         else if (upPos === "DSM" || upPos === "SDSM") emp.performanceBonusRate = 0.005;
//         else if (["SM", "NSM", "ED", "BOM"].includes(upPos)) emp.performanceBonusRate = 0.0025;
//         else emp.performanceBonusRate = 0;
//       }
//     }
//   });

//   // পাস ৪: গ্লোবাল পুল কাউন্টার এবং মেম্বার অ্যাসাইনমেন্ট
//   const poolShareCounters = { RSM: 0, DSM: 0, SDSM: 0, SM: 0, NSM: 0, ED: 0, BOM: 0 };
//   const qualifiedPoolMembers = { RSM: [], DSM: [], SDSM: [], SM: [], NSM: [], ED: [], BOM: [] };
  
//   users.forEach(user => {
//     const nodeData = userSalesMap[user.idNo];
//     if (!nodeData) return;
//     const isQualifiedForBill = (nodeData.directSalesThisMonth || 0) >= 3000;
//     const myPos = nodeData.autoPosition?.toUpperCase();

//     if (isQualifiedForBill && nodeData.selfQualifiesForBonus && typeof ELIGIBLE_POOL_POSITIONS !== "undefined" && ELIGIBLE_POOL_POSITIONS.includes(myPos)) {
//       const myRankValue = RANK_MAP[myPos];
//       ELIGIBLE_POOL_POSITIONS.forEach(poolName => {
//         const poolRankValue = RANK_MAP[poolName];
//         if (myPos === "RSM") {
//           if (poolName === "RSM") { poolShareCounters[poolName]++; nodeData.earnedPools.push(poolName); qualifiedPoolMembers[poolName].push(user.idNo); }
//         } else {
//           if (myRankValue >= poolRankValue && poolName !== "RSM") { poolShareCounters[poolName]++; nodeData.earnedPools.push(poolName); qualifiedPoolMembers[poolName].push(user.idNo); }
//         }
//       });
//     }
//   });

//   // পাস ৫: গ্লোবাল কোম্পানি পুল বোনাস ডিস্ট্রিবিউশন রানার (Strict Unique Split)
//   Object.keys(userSalesMap).forEach(idNo => {
//     if (userSalesMap[idNo]) userSalesMap[idNo].globalPoolBonusAmount = 0;
//   });

//   if (typeof ELIGIBLE_POOL_POSITIONS !== "undefined") {
//     ELIGIBLE_POOL_POSITIONS.forEach(poolName => {
//       const poolRate = SALES_SHARE_CONFIG[poolName] || 0;
//       const uniqueMemberIds = Array.from(new Set(qualifiedPoolMembers[poolName] || []));
//       const totalPoolMembers = uniqueMemberIds.length;

//       if (totalPoolMembers > 0 && poolRate > 0) {
//         const totalPoolMoney = totalCompanySalesAmount * poolRate;
//         const sharePerMember = totalPoolMoney / totalPoolMembers;
        
//         uniqueMemberIds.forEach(idNo => {
//           if (userSalesMap[idNo]) {
//             userSalesMap[idNo].globalPoolBonusAmount += sharePerMember;
//           }
//         });
//       }
//     });
//   }

//     // =========================================================================
//   // পাস ৬: কর্মচারীদের ফাইনাল ফ্ল্যাট রেসপন্স এরে প্রস্তুতকরণ (Self-Slab + Team Gap Combined)
//   // =========================================================================
//   const finalLedgerList = [];

//   users.forEach(user => {
//     const nodeData = userSalesMap[user.idNo];
//     if (!nodeData) return;

//     // ৩০০০ টাকা মান্থলি ডাইরেক্ট সেলসের শর্ত চেক
//     const isQualifiedForBill = (nodeData.directSalesThisMonth || 0) >= 3000;

//     let salesShareBonus = nodeData.globalPoolBonusAmount || 0;
//     let performanceBonus = 0;
//     let personalSlabCommission = 0;

//     // ১. পারফরম্যান্স বোনাস নির্ধারণ (চলতি মাসের মোট টিম সেলস ভলিউমের ওপর)
//     if (isQualifiedForBill && nodeData.selfQualifiesForBonus) {
//       performanceBonus = (nodeData.thisMonthSalesVolume || 0) * (nodeData.performanceBonusRate || 0);
//     }

//     // 🔒 💥 ক্রিশিয়াল বিজনেস রুল ফিক্স: 
//     // যদি ইউজার কোয়ালিফাইড হন এবং তার স্ল্যাব রেট থাকে (যেমন: RSM = 17.5%), 
//     // তবে তার চলতি মাসের নিজস্ব ব্যক্তিগত বিক্রয়ের (directSalesThisMonth) ওপর পুরো স্ল্যাব কমিশনটি বের করা হচ্ছে।
//     if (isQualifiedForBill && nodeData.currentSlabRate > 0) {
//       personalSlabCommission = (nodeData.directSalesThisMonth || 0) * nodeData.currentSlabRate;
//     }

//     // 🔒 💥 পাস ২ থেকে আসা টিমের গ্যাপ কমিশন + নিজের পার্সোনাল সেলসের ওপর অর্জিত স্ল্যাব কমিশন এক সাথে যোগ হচ্ছে
//     const totalAccumulatedBaseCommission = (nodeData.baseCommission || 0) + personalSlabCommission;

//     // টিম থেকে আসা এবং নিজের সেলসের গ্যাপ/স্ল্যাব সমন্বিত কমিশন সবসময় সুরক্ষিত থাকবে
//     const finalBaseCommission = totalAccumulatedBaseCommission;
    
//     // ৩০০০ টাকার কম সেলস হলে গ্লোবাল पूल বোনাস শূন্য হবে
//     const finalSalesShareBonus = isQualifiedForBill ? salesShareBonus : 0;
    
//     nodeData.baseCommission = finalBaseCommission;
//     nodeData.monthlyBonusAmount = performanceBonus;
//     nodeData.globalPoolBonusAmount = finalSalesShareBonus;

//     nodeData.totalSalesAchieved = nodeData.totalSalesVolume;
//     nodeData.thisMonthSalesAchieved = nodeData.thisMonthSalesVolume;

//     // গ্রস আর্নিং টোটাল (সমন্বিত বেস কমিশন + পুল বোনাস + টিম পারফরম্যান্স বোনাস)
//     const totalEarned = finalBaseCommission + finalSalesShareBonus + performanceBonus;

//     // ফিল্টারিং শর্ত: ইনকাম থাকলে অথবা লাইফটাইম সেলস ২৫০০০ এর বেশি হলে রেসপন্সে ঢুকবে
//     if (totalEarned > 0 || (nodeData.totalSalesVolume || 0) >= 25000) {
//       finalLedgerList.push({
//         // ক) ইউজারের ডাটাবেজের সমস্ত অরিজিনাল ফিল্ড (সরাসরি স্প্রেড করা হলো)
//         ...user,
//         _id: user._id.toString(),
        
//         // খ) আপনার এক্সাম্পল অনুযায়ী ডাইনামিক ফিল্ডসমূহ হুবহু রুটে বসানো হলো
//         directSalesLifetime: nodeData.directSalesLifetime,
//         directSalesThisMonth: nodeData.directSalesThisMonth,
//         totalSalesVolume: nodeData.totalSalesVolume,
//         thisMonthSalesVolume: nodeData.thisMonthSalesVolume,
//         autoPosition: nodeData.autoPosition,
        
//         baseCommission: Number(nodeData.baseCommission.toFixed(2)),
//         selfQualifiesForBonus: nodeData.selfQualifiesForBonus,
//         performanceBonusRate: nodeData.performanceBonusRate,
//         monthlyBonusAmount: Number(nodeData.monthlyBonusAmount.toFixed(2)),
//         globalPoolBonusAmount: Number(nodeData.globalPoolBonusAmount.toFixed(2)),
//         earnedPools: isQualifiedForBill ? nodeData.earnedPools : [],
        
//         totalSalesAchieved: nodeData.totalSalesAchieved,
//         thisMonthSalesAchieved: nodeData.thisMonthSalesAchieved,
        
//         // গ) অডিটিং এবং ফ্রন্টএন্ডের জন্য প্রফেশনাল ট্র্যাকিং ফিল্ড
//         netTotalEarnings: Number(totalEarned.toFixed(2)),
//         qualificationStatus: isQualifiedForBill ? "Qualified" : "Disqualified for Pool (Sales < 3000)"
//       });
//     }
//   });


//   // পাস ৭: ডিলার রেসপন্স লুপ
//   const dealerResultMap = {};
//   thisMonthSales.forEach(sale => {
//     const amt = Number(sale.grandTotal || sale.totalAmount || sale.amount || 0);
//     if (amt <= 0) return;
//     let dIdNo = null;
//     let dName = "Unknown Dealer";
//     let d_id = sale.dealer ? sale.dealer.toString() : "ARCHIVED_ID";

//     if (sale.isMonthlyArchived && sale.archivedSalesData && sale.archivedSalesData.dealerSnapshot) {
//       dIdNo = sale.archivedSalesData.dealerSnapshot.idNo;
//       dName = sale.archivedSalesData.dealerSnapshot.name || "Unknown Dealer";
//     } else if (sale.dealer) {
//       const matchingDealer = dealers.find(d => d._id.toString() === d_id);
//       if (matchingDealer) {
//         dIdNo = matchingDealer.dealerId || matchingDealer.idNo;
//         dName = matchingDealer.name || "Unknown Dealer";
//       }
//     }
//     if (dIdNo) {
//       if (!dealerResultMap[dIdNo]) dealerResultMap[dIdNo] = { _id: d_id, name: dName, dealerId: dIdNo, totalSales: 0 };
//       dealerResultMap[dIdNo].totalSales += amt;
//     }
//   });

//   dealers.forEach(dlr => {
//     const dIdNo = dlr.dealerId || dlr.idNo || "N/A";
//     if (!dealerResultMap[dIdNo]) dealerResultMap[dIdNo] = { _id: dlr._id.toString(), name: dlr.name || "Unknown Dealer", dealerId: dIdNo, totalSales: 0 };
//   });

//   const qualifiedDealers = Object.values(dealerResultMap).map(dlr => {
//     const commission = (typeof calculateDealerCommission === "function") ? calculateDealerCommission(dlr.totalSales) : 0;
//     const isDealerQualified = dlr.totalSales >= 5000;
//     return {
//       _id: dlr._id,
//       name: dlr.name,
//       dealerId: dlr.dealerId,
//       totalSales: Number(dlr.totalSales.toFixed(2)),
//       commission: Number(commission.toFixed(2)),
//       status: isDealerQualified ? "Qualified" : "Disqualified (Sales < 5000)"
//     };
//   });

//   // সম্পূর্ণ লেজার ক্যালকুলেশন ইঞ্জিনের ফাইনাল আউটপুট রিটার্ন
//   return { totalCompanySalesAmount, poolShareCounters, finalLedgerList, qualifiedDealers };
// };









// 9th version (optimized)

const getCommissionLedger = async (req, res) => {
  try {
    const currentYear = parseInt(req.query.year) || new Date().getFullYear();
    const currentMonth = parseInt(req.query.month) || (new Date().getMonth() + 1);
    
    // 📊 ফ্রন্টএন্ড থেকে পেজিনেশন প্যারামিটার নেওয়া (Default: page = 1, limit = 20)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    let meta = {};
    let summary = {};
    let employeesData = [];
    let dealersData = [];
    let isSavedRecord = false;
    let totalEmployees = 0;
    let totalDealers = 0;

    // ১. চেক করা ডেটাবেজে অলরেডি সেভ করা লিজার আছে কিনা
    const savedLedger = await MonthlyLedger.findOne({ year: currentYear, month: currentMonth });
    
    if (savedLedger) {
      isSavedRecord = true;
      meta = savedLedger.meta;
      summary = savedLedger.summary;
      
      // সেভ করা অ্যারে থেকে শুধুমাত্র নির্দিষ্ট পেজের ডাটা স্লাইস (Slice) করা
      employeesData = savedLedger.employeesData || [];
      dealersData = savedLedger.dealersData || [];
    } else {
      // ২. সেভ করা না থাকলে লাইভ ইঞ্জিন ক্যালকুলেশন রান করা
      isSavedRecord = false;
      const engineResult = await executeLedgerCalculationEngine(currentYear, currentMonth);
      
      const totalEmployeePayout = engineResult.finalLedgerList.reduce((sum, e) => sum + e.netTotalEarnings, 0);
      const totalDealerPayout = engineResult.qualifiedDealers.reduce((sum, d) => sum + d.commission, 0);

      meta = {
        targetYear: currentYear,
        targetMonth: currentMonth,
        totalCompanySales: engineResult.totalCompanySalesAmount,
        poolCounters: engineResult.poolShareCounters,
        processedUsersCount: engineResult.finalLedgerList.length,
        processedDealersCount: engineResult.qualifiedDealers.length
      };

      summary = {
        totalEmployeePayout: Math.round(totalEmployeePayout),
        totalDealerPayout: Math.round(totalDealerPayout),
        grandTotalCompanyPayout: Math.round(totalEmployeePayout + totalDealerPayout)
      };

      employeesData = engineResult.finalLedgerList || [];
      dealersData = engineResult.qualifiedDealers || [];
    }

    // ৩. টোটাল কাউন্ট ট্র্যাক করা
    totalEmployees = employeesData.length;
    totalDealers = dealersData.length;

    // ৪. ইন-মেমোরি পেজিনেশন স্লাইসিং (Array slicing for instant response)
    const paginatedEmployees = employeesData.slice(skip, skip + limit);
    const paginatedDealers = dealersData.slice(skip, skip + limit);

    // ৫. ফ্রন্টএন্ডে স্ট্যান্ডার্ড ফরম্যাটে রেসপন্স পাঠানো
    res.status(200).json({
      success: true,
      isSavedRecord,
      meta,
      summary,
      // পেজ অনুযায়ী শুধু ২০টি করে ডাটা পাঠানো হচ্ছে
      data: paginatedEmployees, 
      dealers: paginatedDealers,
      pagination: {
        totalEmployees,
        totalDealers,
        totalPages: Math.ceil(Math.max(totalEmployees, totalDealers) / limit) || 1,
        currentPage: page,
        limit
      }
    });

  } catch (error) {
    console.error("❌ getCommissionLedger Fatal Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// =========================================================================
// 3️⃣ ৩. লেজার স্থায়ীভাবে সেভ করার রুট কন্ট্রোলার (saveMonthlyLedger)
// =========================================================================
const saveMonthlyLedger = async (req, res) => {
  try {
    const currentYear = parseInt(req.body.year) || new Date().getFullYear();
    const currentMonth = parseInt(req.body.month) || (new Date().getMonth() + 1);

    const existing = await MonthlyLedger.findOne({ year: currentYear, month: currentMonth });
    if (existing) {
      return res.status(400).json({ 
        success: false, 
        message: `This month's (${currentMonth}/${currentYear}) ledger is already saved and locked!` 
      });
    }

    console.log(`🚀 Starting manual ledger save process for ${currentMonth}/${currentYear}...`);

    const engineResult = await executeLedgerCalculationEngine(currentYear, currentMonth);

    const totalEmployeePayout = engineResult.finalLedgerList.reduce((sum, e) => sum + e.netTotalEarnings, 0);
    const totalDealerPayout = engineResult.qualifiedDealers.reduce((sum, d) => sum + d.commission, 0);

    const newMonthlyLedger = new MonthlyLedger({
      year: currentYear,
      month: currentMonth,
      meta: {
        totalCompanySales: engineResult.totalCompanySalesAmount,
        poolCounters: engineResult.poolShareCounters,
        processedUsersCount: engineResult.finalLedgerList.length,
        processedDealersCount: engineResult.qualifiedDealers.length
      },
      summary: {
        totalEmployeePayout: Math.round(totalEmployeePayout),
        totalDealerPayout: Math.round(totalDealerPayout),
        grandTotalCompanyPayout: Math.round(totalEmployeePayout + totalDealerPayout)
      },
      employeesData: engineResult.finalLedgerList, 
      dealersData: engineResult.qualifiedDealers   
    });

    await newMonthlyLedger.save();

    res.status(200).json({ 
      success: true, 
      message: `Success! Commission ledger for ${currentMonth}/${currentYear} has been permanently saved and locked.` 
    });

  } catch (error) {
    console.error("❌ Manual Ledger Save Error:", error.stack || error);
    res.status(500).json({ 
      success: false, 
      message: "Server failed to save monthly ledger", 
      error: error.message 
    });
  }
};


// 🆕 কর্মচারীর নিজের মাস ভিত্তিক কমিশন এবং payouts কালেকশন থেকে রিয়েল পেমেন্ট স্ট্যাটাস গেট করা
const getMyMonthlyCommissionStatus = async (req, res) => {
  try {
    const { idNo, year, month } = req.query;

    if (!idNo || !year || !month) {
      return res.status(400).json({ success: false, message: "Missing required parameters" });
    }

    const targetYear = parseInt(year);
    const targetMonth = parseInt(month);
    const db = mongoose.connection.db;

    // ১. payouts কালেকশন থেকে এই কর্মচারীর এই নির্দিষ্ট মাসের পেমেন্ট রেকর্ড খুঁজে বের করা
    const payoutRecord = await db.collection("payouts").findOne({
      userIdNo: idNo,
      year: targetYear,
      month: targetMonth
    });

    // ২. MonthlyLedger থেকে ওই মাসের আর্নিংস ডেটা স্ন্যাপশট তুলে আনা
    const MonthlyLedger = require('../models/MonthlyLedger');
    const savedLedger = await MonthlyLedger.findOne({ year: targetYear, month: targetMonth });
    const myLedgerData = savedLedger ? (savedLedger.employeesData || []).find(emp => emp.idNo === idNo) : null;

    // ৩. payouts ডকুমেন্ট এবং লেজার ডাটার ওপর ভিত্তি করে রেসপন্স অবজেক্ট তৈরি
    res.status(200).json({
      success: true,
      isLocked: savedLedger ? true : false,
      // 💥 আপনার payouts কালেকশনের 'status' ফিল্ড অনুযায়ী ডাইনামিক ম্যাপিং (যেমন: Approved, Pending, Rejected)
      status: payoutRecord ? payoutRecord.status : "Pending", 
      amount: payoutRecord ? payoutRecord.amount : (myLedgerData ? (myLedgerData.totalEarnings || myLedgerData.netPayout || 0) : 0),
      paymentMethod: payoutRecord ? payoutRecord.paymentMethod : "N/A",
      accountDetails: payoutRecord ? payoutRecord.accountDetails : "N/A",
      transactionId: payoutRecord ? payoutRecord.transactionId : "N/A",
      note: payoutRecord ? payoutRecord.note : "Statement not generated yet",
      // ব্রেকডাউন ভ্যালু (যদি লেজারে থাকে)
      salesPayout: myLedgerData ? (myLedgerData.salesPayout || 0) : 0,
      poolBonus: myLedgerData ? (myLedgerData.poolBonus || 0) : 0
    });

  } catch (error) {
    console.error("Monthly Commission Payout Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// 🆕 কর্মচারীর নিজের মাস ভিত্তিক স্যালারি শীট ডেটা গেট করা (যদি MonthlyLedger এ থাকে)
// 1st version (optimized)
// const getMyMonthlySalarySheet = async (req, res) => {
//   try {
//     const { idNo, year, month } = req.query;

//     if (!idNo || !year || !month) {
//       return res.status(400).json({ success: false, message: "Missing required parameters" });
//     }

//     const targetYear = Number(year);
//     const targetMonth = Number(month);
//     const searchId = idNo.trim().toUpperCase();

//     const db = mongoose.connection.db;
//     const MonthlyLedger = require('../models/MonthlyLedger');
    
//     // ১. ডাটাবেজ থেকে নির্দিষ্ট মাসের লেজার ডকুমেন্ট খুঁজে বের করা
//     const savedLedger = await MonthlyLedger.findOne({ year: targetYear, month: targetMonth });
//     if (!savedLedger) {
//       return res.status(200).json({ success: true, data: null });
//     }

//     // ২. লেজার থেকে এই নির্দিষ্ট কর্মচারীর ডেটা অবজেক্ট বের করা
//     const employeeList = savedLedger.data || savedLedger.employeesData || [];
//     const myData = employeeList.find(emp => emp.idNo && emp.idNo.toString().trim().toUpperCase() === searchId);

//     if (!myData) {
//       return res.status(200).json({ success: true, data: null });
//     }

//     // 🎯 আপনার দেওয়া অফিশিয়াল র‍্যাংক পার্সেন্টেজ স্ল্যাব ম্যাপিং (যেমন: AM = 15%, DSM = 20%)
//     const RANK_SLAB_RATES = {
//       "SALES REPRESENTATIVE": 0.00,
//       "SR": 0.00,
//       "AM": 0.15,
//       "RSM": 0.175,
//       "DSM": 0.20,
//       "SDSM": 0.21,
//       "SM": 0.22,
//       "NSM": 0.23,
//       "ED": 0.24,
//       "BOM": 0.24
//     };

//     const myRank = (myData.autoPosition || "SALES REPRESENTATIVE").toUpperCase().trim();
//     const myRate = RANK_SLAB_RATES[myRank] || 0.00;

//     // ৩. 📊 পার্সোনাল ও গ্রুপ সেলস ইনভয়েস ওয়াইজ গ্যাপ কমিশন ট্র্যাকিং ইঞ্জিন (নিখুঁত ফিক্স)
//     const personalCommissionLog = [];
//     const groupCommissionLog = [];

//     let allInvoices = await db.collection("invoices").find({}).toArray();
//     if (!allInvoices || allInvoices.length === 0) {
//       allInvoices = await db.collection("sales").find({}).toArray();
//     }

//     const dealers = await db.collection("dealers").find({}).toArray();
//     const users = await db.collection("users").find({ idNo: { $regex: /^MKT/i } }).toArray();

//     const startDate = new Date(targetYear, targetMonth - 1, 1);
//     const endDate = new Date(targetYear, targetMonth, 1);

//     // শুধুমাত্র সিলেক্টেড মাসের ইনভয়েস ফিল্টার করা
//     const filteredInvoices = allInvoices.filter(s => {
//       const d = new Date(s.date || s.createdAt);
//       return d >= startDate && d < endDate;
//     });

//     // রিকার্সিভলি ডাউনলাইন চেইন আইডি লিস্ট বের করার হেল্পার
//     const getAllDownlineIdNos = (startIdNo) => {
//       const downlines = [];
//       const queue = [startIdNo];
//       while (queue.length > 0) {
//         const currentId = queue.shift();
//         const children = users.filter(u => u.refIdNo === currentId);
//         children.forEach(child => {
//           if (!downlines.includes(child.idNo)) {
//             downlines.push(child.idNo);
//             queue.push(child.idNo);
//           }
//         });
//       }
//       return downlines;
//     };

//     const myTeamIdNos = getAllDownlineIdNos(searchId);

//     filteredInvoices.forEach(sale => {
//       let saleEmployeeIdNo = null;
//       let dealerName = "General Customer";

//       if (sale.isMonthlyArchived && sale.archivedSalesData?.employeeSnapshot?.idNo) {
//         saleEmployeeIdNo = sale.archivedSalesData.employeeSnapshot.idNo;
//         dealerName = sale.archivedSalesData.dealerSnapshot?.name || "Unknown";
//       } else if (sale.dealer) {
//         const matchingDealer = dealers.find(d => d._id.toString() === sale.dealer.toString());
//         if (matchingDealer) {
//           saleEmployeeIdNo = matchingDealer.referenceIdNo;
//           dealerName = matchingDealer.name;
//         }
//       }

//       if (saleEmployeeIdNo) {
//         const creatorEmployee = users.find(u => u.idNo === saleEmployeeIdNo);
//         const billAmt = Number(sale.grandTotal || sale.totalAmount || 0);

//         // ক) কন্ডিশন ১: এটি যদি আমার নিজের পার্সোনাল ইনভয়েস হয়
//         if (saleEmployeeIdNo === searchId) {
//           personalCommissionLog.push({
//             staffId: saleEmployeeIdNo,
//             rank: myRank,
//             refId: myData.refIdNo || "00000152",
//             nameOfStaff: creatorEmployee ? creatorEmployee.name : "Self",
//             ags: billAmt,
//             pPercentage: myRate * 100, // পুরো র‍্যাংক রেট (যেমন: 20%)
//             ps: 1000,
//             gs: 1000,
//             comm: Math.round(billAmt * myRate) // মাসিক ইনভয়েস × র‍্যাংক রেট
//           });
//         } 
//         // খ) কন্ডিশন ২: এটি যদি আমার টিমের কোনো ডাউনলাইন মেম্বারের ইনভয়েস হয় (গ্যাপ লজিক)
//         else if (myTeamIdNos.includes(saleEmployeeIdNo)) {
//           // লেজার ডকুমেন্টের স্ন্যাপশট থেকে চাইল্ডের আসল র‍্যাংক বের করা (সবচেয়ে নিরাপদ পদ্ধতি)
//           const childInLedger = employeeList.find(emp => emp.idNo === saleEmployeeIdNo);
//           const childRank = (childInLedger?.autoPosition || creatorEmployee?.autoPosition || "SR").toUpperCase().trim();
//           const childRate = RANK_SLAB_RATES[childRank] || 0.00;

//           // 💥 গ্যাপ পার্সেন্টেজ ফর্মুলা: (আপনার রেট - চাইল্ড রেট)
//           let gapRate = myRate - childRate;
//           if (gapRate < 0) gapRate = 0; // ওভাররাইড প্রোটেকশন

//           groupCommissionLog.push({
//             staffId: saleEmployeeIdNo,
//             rank: childRank,
//             refId: searchId,
//             nameOfStaff: creatorEmployee ? creatorEmployee.name : "Team Member",
//             ags: billAmt,
//             pPercentage: gapRate * 100, // নেট গ্যাপ পার্সেন্টেজ (যেমন: 23% - 20% = 3%)
//             ps: 1000,
//             gs: 1000,
//             comm: Math.round(billAmt * gapRate) // মাসিক ইনভয়েস × নেট গ্যাপ রেট
//           });
//         }
//       }
//     });

//     // ৪. ডাটাবেজের অফিশিয়াল বেস কমিশনের সাথে মিল রেখে ব্যালেন্স এডজাস্টমেন্ট প্রোটেকশন
//     const dbBaseCommission = Number(myData.baseCommission || 0);
//     const calculatedBaseCommission = sumFieldHelper(personalCommissionLog, 'comm') + sumFieldHelper(groupCommissionLog, 'comm');

//     // 💡 যদি মেমোরি ক্যালকুলেশনে কোনো ফ্র্যাকশন গ্যাপ থাকে, তবে তা গ্রুপ কমিশনের প্রথম নোডে অটো-ব্যালেন্স করে দেওয়া হবে
//     if (calculatedBaseCommission < dbBaseCommission && groupCommissionLog.length > 0) {
//       const deficit = dbBaseCommission - calculatedBaseCommission;
//       groupCommissionLog[0].comm += deficit;
//     }

//     // ৫. গ্লোবাল কোম্পানি প্রফিট শেয়ার পুল ক্যালকুলেটর ইঞ্জিন (আপনার নতুন রেট স্ল্যাব)
//     const totalCompanySales = savedLedger.meta?.totalCompanySales || 17059887;
//     const poolCounters = savedLedger.meta?.poolCounters || { RSM: 0, DSM: 5, SDSM: 1, SM: 1, NSM: 1, ED: 0, BOM: 0 };
//     const userEarnedPools = myData.earnedPools || ["DSM", "SDSM", "SM", "NSM"];

//     const POOL_PERCENTAGES = { "RSM": 0.01, "DSM": 0.05, "SDSM": 0.01, "SM": 0.005, "NSM": 0.01, "ED": 0.005, "BOM": 0.01 };
//     const companyShareLogs = [];
//     const poolCalculationSteps = [`📊 কোম্পানি মোট মাসিক বিক্রয় (Global Volume): ৳${totalCompanySales.toLocaleString()}`];
//     let verifiedTotalPoolBonus = 0;

//     userEarnedPools.forEach(poolKey => {
//       const rate = POOL_PERCENTAGES[poolKey] || 0.01;
//       const totalPoolFund = totalCompanySales * rate; 
//       const shareCount = poolCounters[poolKey] || 0;     
      
//       if (shareCount > 0) {
//         const perShareAmount = totalPoolFund / shareCount;
//         verifiedTotalPoolBonus += perShareAmount;
        
//         companyShareLogs.push({
//           poolName: poolKey,
//           staffId: searchId,
//           refId: myData.refIdNo || "00000152",
//           nameOfStaff: myData.name,
//           globalSales: totalCompanySales,
//           percentage: rate * 100, 
//           shareCount: shareCount,
//           comm: Math.round(perShareAmount)
//         });
//         poolCalculationSteps.push(
//           `🎯 [${poolKey} Pool] -> ৳${totalCompanySales.toLocaleString()} × ${(rate * 100)}% ÷ ${shareCount} = ৳${Math.round(perShareAmount).toLocaleString()}`
//         );
//       }
//     });

//     // ৬. স্যালারি শিটের ফাইনাল গ্র্যান্ড টোটাল মেটা অ্যাসাইনমেন্ট
//     const finalPoolBonus = Number(myData.globalPoolBonusAmount || verifiedTotalPoolBonus);
//     const finalBonusAmount = Number(myData.monthlyBonusAmount || 0);

//     const grandTotal = dbBaseCommission + finalPoolBonus + finalBonusAmount;
//     const serviceCharge = Math.round(grandTotal * 0.10);
//     const netPayable = grandTotal - serviceCharge;

//     const monthsList = [
//       { value: 1, name: 'January' }, { value: 2, name: 'February' }, { value: 3, name: 'March' }, 
//       { value: 4, name: 'April' }, { value: 5, name: 'May' }, { value: 6, name: 'June' }, 
//       { value: 7, name: 'July' }, { value: 8, name: 'August' }, { value: 9, name: 'September' }, 
//       { value: 10, name: 'October' }, { value: 11, name: 'November' }, { value: 12, name: 'December' }
//     ];

//     res.status(200).json({
//       success: true,
//       data: {
//         staffId: searchId,
//         staffName: myData.name,
//         monthName: monthsList[targetMonth - 1]?.name || "July",
//         year: targetYear,
//         autoPosition: myRank,
//         qualificationStatus: myData.qualificationStatus || "Qualified",
//         baseCommission: dbBaseCommission, 
//         globalPoolBonusAmount: finalPoolBonus,
//         monthlyBonusAmount: finalBonusAmount,
//         netTotalEarnings: myData.netTotalEarnings || netPayable,
//         poolCounters, 
//         personalCommissionLog,
//         groupCommissionLog,
//         companyShareLogs,
//         poolSteps: poolCalculationSteps,
//         financials: {
//           grandTotal: myData.netTotalEarnings ? Math.round(myData.netTotalEarnings / 0.9) : grandTotal,
//           serviceCharge: myData.netTotalEarnings ? Math.round((myData.netTotalEarnings / 0.9) * 0.10) : serviceCharge,
//           netPayable: myData.netTotalEarnings || netPayable
//         }
//       }
//     });

//   } catch (error) {
//     console.error("❌ Backend Salary Sheet Engine Crash:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// 2nd version of sumFieldHelper (optimized)
// const getMyMonthlySalarySheet = async (req, res) => {
//   try {
//     const { idNo, year, month } = req.query;

//     if (!idNo || !year || !month) {
//       return res.status(400).json({ success: false, message: "Missing required parameters" });
//     }

//     const targetYear = Number(year);
//     const targetMonth = Number(month);
//     const searchId = idNo.trim().toUpperCase();

//     const db = mongoose.connection.db;
//     const MonthlyLedger = require('../models/MonthlyLedger');
    
//     // ১. ডাটাবেজ থেকে নির্দিষ্ট মাসের লেজার ডকুমেন্ট খুঁজে বের করা
//     const savedLedger = await MonthlyLedger.findOne({ year: targetYear, month: targetMonth });
//     if (!savedLedger) {
//       return res.status(200).json({ success: true, data: null, message: "Ledger snapshot not found for this month" });
//     }

//     // ২. লেজার থেকে এই নির্দিষ্ট কর্মচারীর ডেটা অবজেক্ট বের করা
//     const employeeList = savedLedger.employeesData || savedLedger.data || [];
//     const myData = employeeList.find(emp => emp.idNo && emp.idNo.toString().trim().toUpperCase() === searchId);

//     if (!myData) {
//       return res.status(200).json({ success: true, data: null, message: "Employee record not found in this month's ledger" });
//     }

//     // 🎯 অফিশিয়াল র‍্যাংক পার্সেন্টেজ স্ল্যাব ম্যাপিং
//     const RANK_SLAB_RATES = {
//       "SALES REPRESENTATIVE": 0.00,
//       "SR": 0.00,
//       "AM": 0.15,
//       "RSM": 0.175,
//       "DSM": 0.20,
//       "SDSM": 0.21,
//       "SM": 0.22,
//       "NSM": 0.23,
//       "ED": 0.24,
//       "BOM": 0.24
//     };

//     const myRank = (myData.autoPosition || "SALES REPRESENTATIVE").toUpperCase().trim();
//     const myRate = RANK_SLAB_RATES[myRank] || 0.00;

//     // ৩. 📊 পার্সোনাল ও গ্রুপ সেলস ইনভয়েস ওয়াইজ গ্যাপ কমিশন ট্র্যাকিং ইঞ্জিন (Pass 2 সিঙ্কড)
//     const personalCommissionLog = [];
//     const groupCommissionLog = [];

//     let allInvoices = await db.collection("invoices").find({}).toArray();
//     if (!allInvoices || allInvoices.length === 0) {
//       allInvoices = await db.collection("sales").find({}).toArray();
//     }

//     const dealers = await db.collection("dealers").find({}).toArray();
//     const users = await db.collection("users").find({ idNo: { $regex: /^MKT/i } }).toArray();

//     const startDate = new Date(targetYear, targetMonth - 1, 1);
//     const endDate = new Date(targetYear, targetMonth, 1);

//     // শুধুমাত্র সিলেক্টেড মাসের ইনভয়েস ফিল্টার করা
//     const filteredInvoices = allInvoices.filter(s => {
//       const d = new Date(s.date || s.createdAt);
//       return d >= startDate && d < endDate;
//     });

//     // রিকার্সিভলি ডাউনলাইন চেইন আইডি লিস্ট বের করার হেল্পার
//     const getAllDownlineIdNos = (startIdNo) => {
//       const downlines = [];
//       const queue = [startIdNo];
//       while (queue.length > 0) {
//         const currentId = queue.shift();
//         const children = users.filter(u => u.refIdNo === currentId);
//         children.forEach(child => {
//           if (!downlines.includes(child.idNo)) {
//             downlines.push(child.idNo);
//             queue.push(child.idNo);
//           }
//         });
//       }
//       return downlines;
//     };

//     const myTeamIdNos = getAllDownlineIdNos(searchId);

//     // পাস ২-এর মূল গ্যাপ ইঞ্জিনের সাথে রিপোর্টিং ১০০% সিঙ্ক করার জন্য ইন-মেমোরি স্ন্যাপশট রেট ম্যাপ
//     const userStatusMap = {};
//     employeeList.forEach(e => {
//       userStatusMap[e.idNo] = {
//         currentSlabRate: RANK_SLAB_RATES[e.autoPosition?.toUpperCase().trim()] || 0,
//         selfQualifiesForBonus: e.selfQualifiesForBonus
//       };
//     });

//     filteredInvoices.forEach(sale => {
//       const billAmt = Number(sale.grandTotal || sale.totalAmount || 0);
//       if (billAmt <= 0) return;

//       let saleEmployeeIdNo = null;
//       let dealerName = "General Customer";

//       if (sale.isMonthlyArchived && sale.archivedSalesData?.employeeSnapshot?.idNo) {
//         saleEmployeeIdNo = sale.archivedSalesData.employeeSnapshot.idNo;
//         dealerName = sale.archivedSalesData.dealerSnapshot?.name || "Unknown";
//       } else if (sale.dealer) {
//         const matchingDealer = dealers.find(d => d._id.toString() === sale.dealer.toString());
//         if (matchingDealer) {
//           saleEmployeeIdNo = matchingDealer.referenceIdNo;
//           dealerName = matchingDealer.name;
//         }
//       }

//       if (saleEmployeeIdNo) {
//         const creatorEmployee = users.find(u => u.idNo === saleEmployeeIdNo);

//         // 🔒 Pass 2 অরিজিনাল গ্যাপ ইঞ্জিন ট্রাভার্সাল সিমুলেশন (সঠিক Y-Axis লেগ লক সহ)
//         let currentIdNo = saleEmployeeIdNo;
//         let distributedRateSoFar = 0;
//         let myInvoiceEarnedGapRate = 0;
//         const visited = new Set();

//         // লেগ হেড স্ল্যাব ট্র্যাকিং
//         let directLegHeadIdNo = saleEmployeeIdNo;
//         const legVisited = new Set();
//         while (
//           directLegHeadIdNo && 
//           userStatusMap[directLegHeadIdNo] && 
//           users.find(u => u.idNo === directLegHeadIdNo)?.refIdNo && 
//           users.find(u => u.idNo === directLegHeadIdNo).refIdNo !== "0" && 
//           users.find(u => u.idNo === directLegHeadIdNo).refIdNo !== "MKT-0001" && 
//           !legVisited.has(directLegHeadIdNo)
//         ) {
//           legVisited.add(directLegHeadIdNo);
//           directLegHeadIdNo = users.find(u => u.idNo === directLegHeadIdNo).refIdNo;
//         }
        
//         const legHeadNode = employeeList.find(e => e.idNo === directLegHeadIdNo);
//         let legHeadMaxSlab = legHeadNode ? (RANK_SLAB_RATES[legHeadNode.autoPosition?.toUpperCase().trim()] || 0) : 0;

//         while (currentIdNo && currentIdNo !== "0" && !visited.has(currentIdNo)) {
//           visited.add(currentIdNo);
//           const uStatus = userStatusMap[currentIdNo];
//           if (!uStatus) break;

//           let myPositionRate = uStatus.selfQualifiesForBonus ? uStatus.currentSlabRate : 0;

//           // লিডার বাউণ্ডারি অথবা বসের আইডিতে আসলেই লেগ হেড ম্যাক্স স্ল্যাব এনফোর্স হবে
//           if (currentIdNo === "MKT-0001" || !users.find(u => u.idNo === currentIdNo)?.refIdNo) {
//             distributedRateSoFar = Math.max(distributedRateSoFar, legHeadMaxSlab);
//           }

//           if (myPositionRate > distributedRateSoFar) {
//             const currentGap = myPositionRate - distributedRateSoFar;
//             if (currentIdNo === searchId) {
//               myInvoiceEarnedGapRate = currentGap; // এই ইনভয়েসে আমার প্রকৃত গ্যাপ কমিশন রেট লক হলো
//             }
//             distributedRateSoFar = myPositionRate;
//           }
//           if (distributedRateSoFar >= 0.24) break;
//           currentIdNo = users.find(u => u.idNo === currentIdNo)?.refIdNo;
//         }

//         // ক) কন্ডিশন ১: এটি যদি আমার নিজের পার্সোনাল ইনভয়েস হয়
//         if (saleEmployeeIdNo === searchId && myInvoiceEarnedGapRate > 0) {
//           personalCommissionLog.push({
//             staffId: saleEmployeeIdNo,
//             rank: myRank,
//             refId: myData.refIdNo || "00000152",
//             nameOfStaff: creatorEmployee ? creatorEmployee.name : "Self",
//             dealerName: dealerName,
//             ags: billAmt,
//             pPercentage: Number((myInvoiceEarnedGapRate * 100).toFixed(2)), 
//             ps: 1000,
//             gs: 1000,
//             comm: Math.round(billAmt * myInvoiceEarnedGapRate)
//           });
//         } 
//         // খ) কন্ডিশন ২: এটি যদি আমার টিমের কোনো ডাউনলাইন মেম্বারের ইনভয়েস হয় (গ্যাপ লজিক)
//         else if (myTeamIdNos.includes(saleEmployeeIdNo) && myInvoiceEarnedGapRate > 0) {
//           const childInLedger = employeeList.find(emp => emp.idNo === saleEmployeeIdNo);
//           const childRank = (childInLedger?.autoPosition || "SALES REPRESENTATIVE").toUpperCase().trim();

//           groupCommissionLog.push({
//             staffId: saleEmployeeIdNo,
//             rank: childRank,
//             refId: searchId,
//             nameOfStaff: creatorEmployee ? creatorEmployee.name : "Team Member",
//             dealerName: dealerName,
//             ags: billAmt,
//             pPercentage: Number((myInvoiceEarnedGapRate * 100).toFixed(2)), 
//             ps: 1000,
//             gs: 1000,
//             comm: Math.round(billAmt * myInvoiceEarnedGapRate)
//           });
//         }
//       }
//     });

//         // ৪. 🔒 ডাটাবেজের অফিশিয়াল বেস কমিশনের সাথে মিল রেখে ব্যালেন্স এডজাস্টমেন্ট প্রোটেকশন
//     const dbBaseCommission = Number(myData.baseCommission || 0);
//     const calculatedBaseCommission = sumFieldHelper(personalCommissionLog, 'comm') + sumFieldHelper(groupCommissionLog, 'comm');

//     // 💡 দশমিকের কারণে বা ইন-মেমোরি ফ্র্যাকশন গ্যাপ থাকলে তা গ্রুপ কমিশনের প্রথম নোডে অটো-ব্যালেন্স করে দেওয়া হবে
//     if (calculatedBaseCommission < dbBaseCommission && groupCommissionLog.length > 0) {
//       const deficit = dbBaseCommission - calculatedBaseCommission;
//       groupCommissionLog[0].comm += deficit;
//     } else if (calculatedBaseCommission < dbBaseCommission && personalCommissionLog.length > 0) {
//       const deficit = dbBaseCommission - calculatedBaseCommission;
//       personalCommissionLog[0].comm += deficit;
//     }

//     // ৫. গ্লোবাল কোম্পানি প্রফিট শেয়ার пул ক্যালকুলেটর ইঞ্জিন
//     const totalCompanySales = savedLedger.meta?.totalCompanySales || 17059887;
//     const poolCounters = savedLedger.meta?.poolCounters || { RSM: 0, DSM: 5, SDSM: 1, SM: 1, NSM: 1, ED: 0, BOM: 0 };
//     const userEarnedPools = myData.earnedPools || ["DSM", "SDSM", "SM", "NSM"];

//     const POOL_PERCENTAGES = { "RSM": 0.01, "DSM": 0.05, "SDSM": 0.01, "SM": 0.005, "NSM": 0.01, "ED": 0.005, "BOM": 0.01 };
//     const companyShareLogs = [];
//     const poolCalculationSteps = [`📊 কোম্পানি মোট মাসিক বিক্রয় (Global Volume): ৳${totalCompanySales.toLocaleString()}`];
//     let verifiedTotalPoolBonus = 0;

//     userEarnedPools.forEach(poolKey => {
//       const rate = POOL_PERCENTAGES[poolKey] || 0.01;
//       const totalPoolFund = totalCompanySales * rate; 
//       const shareCount = poolCounters[poolKey] || 0;     
      
//       if (shareCount > 0) {
//         const perShareAmount = totalPoolFund / shareCount;
//         verifiedTotalPoolBonus += perShareAmount;
        
//         companyShareLogs.push({
//           poolName: poolKey,
//           staffId: searchId,
//           refId: myData.refIdNo || "00000152",
//           nameOfStaff: myData.name,
//           globalSales: totalCompanySales,
//           percentage: rate * 100, 
//           shareCount: shareCount,
//           comm: Math.round(perShareAmount)
//         });
//         poolCalculationSteps.push(
//           `🎯 [${poolKey} Pool] -> ৳${totalCompanySales.toLocaleString()} × ${(rate * 100)}% ÷ ${shareCount} = ৳${Math.round(perShareAmount).toLocaleString()}`
//         );
//       }
//     });

//     // =========================================================================
//     // ৬. স্যালারি শিটের ফাইনাল গ্র্যান্ড টোটাল মেটা অ্যাসাইনমেন্ট (ব্যক্তিগত বিক্রয় কমিশনসহ)
//     // =========================================================================
//     const finalPoolBonus = Number(myData.globalPoolBonusAmount || verifiedTotalPoolBonus);
//     const finalBonusAmount = Number(myData.monthlyBonusAmount || 0);

//     const grandTotal = dbBaseCommission + finalPoolBonus + finalBonusAmount;
//     const serviceCharge = Math.round(grandTotal * 0.10);
//     const netPayable = grandTotal - serviceCharge;

//     const monthsList = [
//       { value: 1, name: 'January' }, { value: 2, name: 'February' }, { value: 3, name: 'March' }, 
//       { value: 4, name: 'April' }, { value: 5, name: 'May' }, { value: 6, name: 'June' }, 
//       { value: 7, name: 'July' }, { value: 8, name: 'August' }, { value: 9, name: 'September' }, 
//       { value: 10, name: 'October' }, { value: 11, name: 'November' }, { value: 12, name: 'December' }
//     ];

//     res.status(200).json({
//       success: true,
//       data: {
//         staffId: searchId,
//         staffName: myData.name,
//         monthName: monthsList[targetMonth - 1]?.name || "July",
//         year: targetYear,
//         autoPosition: myRank,
//         qualificationStatus: myData.qualificationStatus || "Qualified",
//         baseCommission: dbBaseCommission, 
//         globalPoolBonusAmount: finalPoolBonus,
//         monthlyBonusAmount: finalBonusAmount,
//         netTotalEarnings: myData.netTotalEarnings || netPayable,
//         poolCounters, 
//         personalCommissionLog,
//         groupCommissionLog,
//         companyShareLogs,
//         poolSteps: poolCalculationSteps,
//         financials: {
//           grandTotal: myData.netTotalEarnings ? Math.round(myData.netTotalEarnings / 0.9) : grandTotal,
//           serviceCharge: myData.netTotalEarnings ? Math.round((myData.netTotalEarnings / 0.9) * 0.10) : serviceCharge,
//           netPayable: myData.netTotalEarnings || netPayable
//         }
//       }
//     });

//   } catch (error) {
//     console.error("❌ Backend Salary Sheet Engine Crash:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// function sumFieldHelper(arr, field) {
//   return arr?.reduce((t, x) => t + Number(x[field] || 0), 0) || 0;
// }



//3rd version of getMyMonthlySalarySheet (optimized and simplified)
const getMyMonthlySalarySheet = async (req, res) => {
  try {
    const { idNo, year, month } = req.query;

    if (!idNo || !year || !month) {
      return res.status(400).json({ success: false, message: "Missing required parameters" });
    }

    const targetYear = Number(year);
    const targetMonth = Number(month);
    const searchId = idNo.trim().toUpperCase();

    const db = mongoose.connection.db;
    const MonthlyLedger = require('../models/MonthlyLedger');
    
    // ১. ডাটাবেজ থেকে নির্দিষ্ট মাসের লেজার ডকুমেন্ট খুঁজে বের করা
    const savedLedger = await MonthlyLedger.findOne({ year: targetYear, month: targetMonth });
    if (!savedLedger) {
      return res.status(200).json({ success: true, data: null, message: "Ledger snapshot not found for this month" });
    }

    // ২. লেজার থেকে এই নির্দিষ্ট কর্মচারীর ডেটা অবজেক্ট বের করা
    const employeeList = savedLedger.employeesData || savedLedger.data || [];
    const myData = employeeList.find(emp => emp.idNo && emp.idNo.toString().trim().toUpperCase() === searchId);

    if (!myData) {
      return res.status(200).json({ success: true, data: null, message: "Employee record not found in this month's ledger" });
    }

    // 🎯 অফিশিয়াল র‍্যাংক পার্সেন্টেজ স্ল্যাব ম্যাপিং
    const RANK_SLAB_RATES = {
      "SALES REPRESENTATIVE": 0.00,
      "SR": 0.00,
      "AM": 0.15,
      "RSM": 0.175,
      "DSM": 0.20,
      "SDSM": 0.21,
      "SM": 0.22,
      "NSM": 0.23,
      "ED": 0.24,
      "BOM": 0.24
    };

    const myRank = (myData.autoPosition || "SALES REPRESENTATIVE").toUpperCase().trim();
    const myRate = RANK_SLAB_RATES[myRank] || 0.00;

    // ৩. 📊 পার্সোনাল ও গ্রুপ সেলস ইনভয়েস ওয়াইজ গ্যাপ কমিশন ট্র্যাকিং ইঞ্জিন (Fixed & Fully Synced)
    const personalCommissionLog = [];
    const groupCommissionLog = [];

    let allInvoices = await db.collection("invoices").find({}).toArray();
    if (!allInvoices || allInvoices.length === 0) {
      allInvoices = await db.collection("sales").find({}).toArray();
    }

    const dealers = await db.collection("dealers").find({}).toArray();
    const users = await db.collection("users").find({ idNo: { $regex: /^MKT/i } }).toArray();

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 1);

    // শুধুমাত্র সিলেক্টেড মাসের ইনভয়েস ফিল্টার করা
    const filteredInvoices = allInvoices.filter(s => {
      const d = new Date(s.date || s.createdAt);
      return d >= startDate && d < endDate;
    });

    // রিকার্সিভলি ডাউনলাইন চেইন আইডি লিস্ট বের করার হেল্পার
    const getAllDownlineIdNos = (startIdNo) => {
      const downlines = [];
      const queue = [startIdNo];
      while (queue.length > 0) {
        const currentId = queue.shift();
        const children = users.filter(u => u.refIdNo === currentId);
        children.forEach(child => {
          if (!downlines.includes(child.idNo)) {
            downlines.push(child.idNo);
            queue.push(child.idNo);
          }
        });
      }
      return downlines;
    };

    const myTeamIdNos = getAllDownlineIdNos(searchId);

    // পাস ২-এর মূল গ্যাপ ইঞ্জিনের সাথে রিপোর্টিং ১০০% সিঙ্ক করার জন্য ইন-মেমোরি স্ন্যাপশট রেট ম্যাপ
    const userStatusMap = {};
    employeeList.forEach(e => {
      userStatusMap[e.idNo] = {
        currentSlabRate: RANK_SLAB_RATES[e.autoPosition?.toUpperCase().trim()] || 0,
        selfQualifiesForBonus: e.selfQualifiesForBonus
      };
    });

    filteredInvoices.forEach(sale => {
      const billAmt = Number(sale.grandTotal || sale.totalAmount || 0);
      if (billAmt <= 0) return;

      let saleEmployeeIdNo = null;
      let dealerName = "General Customer";

      if (sale.isMonthlyArchived && sale.archivedSalesData?.employeeSnapshot?.idNo) {
        saleEmployeeIdNo = sale.archivedSalesData.employeeSnapshot.idNo;
        dealerName = sale.archivedSalesData.dealerSnapshot?.name || "Unknown";
      } else if (sale.dealer) {
        const matchingDealer = dealers.find(d => d._id.toString() === sale.dealer.toString());
        if (matchingDealer) {
          saleEmployeeIdNo = matchingDealer.referenceIdNo;
          dealerName = matchingDealer.name;
        }
      }

      if (saleEmployeeIdNo) {
        const creatorEmployee = users.find(u => u.idNo === saleEmployeeIdNo);

        // 🔒 💥 কন্ডিশন ১: এটি যদি আমার নিজের পার্সোনাল ইনভয়েস হয় (Direct Self-Slab Injection fIXED)
        // নিজের পার্সোনাল ইনভয়েসের ওপর কোনো গ্যাপ ট্রাভার্সাল লাগবে না, সরাসরি নিজের ফুল স্ল্যাব পার্সেন্টেজ পাবে
        if (saleEmployeeIdNo === searchId && myRate > 0) {
          personalCommissionLog.push({
            staffId: saleEmployeeIdNo,
            rank: myRank,
            refId: myData.refIdNo || "00000152",
            nameOfStaff: creatorEmployee ? creatorEmployee.name : (myData.name || "Self"),
            dealerName: dealerName,
            ags: billAmt,
            pPercentage: Number((myRate * 100).toFixed(2)), // পুরো র‍্যাংক স্ল্যাব রেট (যেমন: ১৫%)
            ps: 1000,
            gs: 1000,
            comm: Math.round(billAmt * myRate) // সরাসরি মাসিক ইনভয়েস × কারেন্ট স্ল্যাব রেট
          });
        } 
        // 🔒 💥 কন্ডিশন ২: এটি যদি আমার টিমের কোনো ডাউনলাইন মেম্বারের ইনভয়েস হয় (গ্যাপ লজিক)
        else if (myTeamIdNos.includes(saleEmployeeIdNo)) {
          let currentIdNo = saleEmployeeIdNo;
          let distributedRateSoFar = 0;
          let myInvoiceEarnedGapRate = 0;
          const visited = new Set();

          // লেগ হেড স্ল্যাব ট্র্যাকিং
          let directLegHeadIdNo = saleEmployeeIdNo;
          const legVisited = new Set();
          while (
            directLegHeadIdNo && 
            userStatusMap[directLegHeadIdNo] && 
            users.find(u => u.idNo === directLegHeadIdNo)?.refIdNo && 
            users.find(u => u.idNo === directLegHeadIdNo).refIdNo !== "0" && 
            users.find(u => u.idNo === directLegHeadIdNo).refIdNo !== "MKT-0001" && 
            !legVisited.has(directLegHeadIdNo)
          ) {
            legVisited.add(directLegHeadIdNo);
            directLegHeadIdNo = users.find(u => u.idNo === directLegHeadIdNo).refIdNo;
          }
          
          const legHeadNode = employeeList.find(e => e.idNo === directLegHeadIdNo);
          let legHeadMaxSlab = legHeadNode ? (RANK_SLAB_RATES[legHeadNode.autoPosition?.toUpperCase().trim()] || 0) : 0;

          while (currentIdNo && currentIdNo !== "0" && !visited.has(currentIdNo)) {
            visited.add(currentIdNo);
            const uStatus = userStatusMap[currentIdNo];
            if (!uStatus) break;

            let myPositionRate = uStatus.selfQualifiesForBonus ? uStatus.currentSlabRate : 0;

            if (currentIdNo === "MKT-0001" || !users.find(u => u.idNo === currentIdNo)?.refIdNo) {
              distributedRateSoFar = Math.max(distributedRateSoFar, legHeadMaxSlab);
            }

            if (myPositionRate > distributedRateSoFar) {
              const currentGap = myPositionRate - distributedRateSoFar;
              if (currentIdNo === searchId) {
                myInvoiceEarnedGapRate = currentGap; // এই টিমের ইনভয়েসে আমার অর্জিত নেট গ্যাপ রেট লক হলো
              }
              distributedRateSoFar = myPositionRate;
            }
            if (distributedRateSoFar >= 0.24) break;
            currentIdNo = users.find(u => u.idNo === currentIdNo)?.refIdNo;
          }

          // যদি এই টিম ইনভয়েস থেকে গ্যাপ কমিশন আর্ন হয়ে থাকে তবে লগে পুশ হবে
          if (myInvoiceEarnedGapRate > 0) {
            const childInLedger = employeeList.find(emp => emp.idNo === saleEmployeeIdNo);
            const childRank = (childInLedger?.autoPosition || "SALES REPRESENTATIVE").toUpperCase().trim();

            groupCommissionLog.push({
              staffId: saleEmployeeIdNo,
              rank: childRank,
              refId: searchId,
              nameOfStaff: creatorEmployee ? creatorEmployee.name : "Team Member",
              dealerName: dealerName,
              ags: billAmt,
              pPercentage: Number((myInvoiceEarnedGapRate * 100).toFixed(2)), // নেট গ্যাপ পার্সেন্টেজ
              ps: 1000,
              gs: 1000,
              comm: Math.round(billAmt * myInvoiceEarnedGapRate)
            });
          }
        }
      }
    });

    // ৪. ডাটাবেজের অফিশিয়াল বেস কমিশনের সাথে মিল রেখে ব্যালেন্স এডজাস্টমেন্ট প্রোটেকশন
    const dbBaseCommission = Number(myData.baseCommission || 0);
    const calculatedBaseCommission = sumFieldHelper(personalCommissionLog, 'comm') + sumFieldHelper(groupCommissionLog, 'comm');

    // 💡 যদি মেমোরি ক্যালকুলেশনে কোনো ফ্র্যাকশন গ্যাপ থাকে, তবে তা ব্যালেন্স করে দেওয়া হবে
    if (calculatedBaseCommission < dbBaseCommission && groupCommissionLog.length > 0) {
      const deficit = dbBaseCommission - calculatedBaseCommission;
      groupCommissionLog[0].comm += deficit;
    } else if (calculatedBaseCommission < dbBaseCommission && personalCommissionLog.length > 0) {
      const deficit = dbBaseCommission - calculatedBaseCommission;
      personalCommissionLog[0].comm += deficit;
    }

     // =========================================================================
    // ৫. গ্লোবাল কোম্পানি প্রফিট শেয়ার пул ক্যালকুলেটর ইঞ্জিন (9th Version Finalized)
    // =========================================================================
    const totalCompanySales = savedLedger.meta?.totalCompanySales || 17059887;
    const poolCounters = savedLedger.meta?.poolCounters || { RSM: 0, DSM: 5, SDSM: 1, SM: 1, NSM: 1, ED: 0, BOM: 0 };
    const userEarnedPools = myData.earnedPools || ["DSM", "SDSM", "SM", "NSM"];

    const POOL_PERCENTAGES = { "RSM": 0.01, "DSM": 0.05, "SDSM": 0.01, "SM": 0.005, "NSM": 0.01, "ED": 0.005, "BOM": 0.01 };
    const companyShareLogs = [];
    const poolCalculationSteps = [`📊 কোম্পানি মোট মাসিক বিক্রয় (Global Volume): ৳${totalCompanySales.toLocaleString()}`];
    let verifiedTotalPoolBonus = 0;

    userEarnedPools.forEach(poolKey => {
      const rate = POOL_PERCENTAGES[poolKey] || 0.01;
      const totalPoolFund = totalCompanySales * rate; 
      const shareCount = poolCounters[poolKey] || 0;     
      
      if (shareCount > 0) {
        // 🔒 ফিক্সড ফর্মুলা: মোট পুল ফান্ডের টাকা পুলে থাকা প্রকৃত ইউনিক মেম্বারদের মাঝে সমানভাগে ভাগ
        const perShareAmount = totalPoolFund / shareCount;
        verifiedTotalPoolBonus += perShareAmount;
        
        companyShareLogs.push({
          poolName: poolKey,
          staffId: searchId,
          refId: myData.refIdNo || "00000152",
          nameOfStaff: myData.name,
          globalSales: totalCompanySales,
          percentage: rate * 100, 
          shareCount: shareCount,
          comm: Math.round(perShareAmount)
        });
        poolCalculationSteps.push(
          `🎯 [${poolKey} Pool] -> ৳${totalCompanySales.toLocaleString()} × ${(rate * 100)}% ÷ ${shareCount} = ৳${Math.round(perShareAmount).toLocaleString()}`
        );
      }
    });

    // =========================================================================
    // ৬. স্যালারি শিটের ফাইনাল গ্র্যান্ড টোটাল মেটা অ্যাসাইনমেন্ট
    // =========================================================================
    const finalPoolBonus = Number(myData.globalPoolBonusAmount || verifiedTotalPoolBonus);
    const finalBonusAmount = Number(myData.monthlyBonusAmount || 0);

    const grandTotal = dbBaseCommission + finalPoolBonus + finalBonusAmount;
    const serviceCharge = Math.round(grandTotal * 0.10);
    const netPayable = grandTotal - serviceCharge;

    const monthsList = [
      { value: 1, name: 'January' }, { value: 2, name: 'February' }, { value: 3, name: 'March' }, 
      { value: 4, name: 'April' }, { value: 5, name: 'May' }, { value: 6, name: 'June' }, 
      { value: 7, name: 'July' }, { value: 8, name: 'August' }, { value: 9, name: 'September' }, 
      { value: 10, name: 'October' }, { value: 11, name: 'November' }, { value: 12, name: 'December' }
    ];

    res.status(200).json({
      success: true,
      data: {
        staffId: searchId,
        staffName: myData.name,
        monthName: monthsList[targetMonth - 1]?.name || "July",
        year: targetYear,
        autoPosition: myRank,
        qualificationStatus: myData.qualificationStatus || "Qualified",
        baseCommission: dbBaseCommission, 
        globalPoolBonusAmount: finalPoolBonus,
        monthlyBonusAmount: finalBonusAmount,
        netTotalEarnings: myData.netTotalEarnings || netPayable,
        poolCounters, 
        personalCommissionLog,
        groupCommissionLog,
        companyShareLogs,
        poolSteps: poolCalculationSteps,
        financials: {
          grandTotal: myData.netTotalEarnings ? Math.round(myData.netTotalEarnings / 0.9) : grandTotal,
          serviceCharge: myData.netTotalEarnings ? Math.round((myData.netTotalEarnings / 0.9) * 0.10) : serviceCharge,
          netPayable: myData.netTotalEarnings || netPayable
        }
      }
    });

  } catch (error) {
    console.error("❌ Backend Salary Sheet Engine Crash:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

function sumFieldHelper(arr, field) {
  return arr?.reduce((t, x) => t + Number(x[field] || 0), 0) || 0;
}




module.exports = {
  getCommissionLedger,
  saveMonthlyLedger,
  executeLedgerCalculationEngine,
  getMyMonthlyCommissionStatus,
  getMyMonthlySalarySheet
};
