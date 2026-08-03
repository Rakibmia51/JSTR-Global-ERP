
const mongoose = require('mongoose');
const Invoice = require('../models/Invoice');
const Dealer = require('../models/Dealer');
const User = require('../models/User');


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









// 8th version

// ==========================================
// ১. গ্লোবাল কনফিগারেশন ম্যাপস
// ==========================================
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

// অটোমেটিক পজিশন কোয়ালিফিকেশন ইঞ্জিন (লাইফটাইম সেলস এবং ডাউনলাইনের ওপর ভিত্তি করে)
const autoDeterminePosition = (totalSales, subNodesSummary = []) => {
  const counts = { AM: 0, RSM: 0, DSM: 0, NSM: 0, ED: 0, BOM: 0 };
  subNodesSummary.forEach(sub => {
    const pos = (sub.autoPosition || "").toUpperCase().trim();
    if (counts[pos] !== undefined) counts[pos]++;
  });

  const countAtLeast = (targetPos) => {
    return Object.keys(counts).reduce((total, pos) => {
      return RANK_MAP[pos] >= RANK_MAP[targetPos] ? total + counts[pos] : total;
    }, 0);
  };

  if (totalSales >= 6400000 && countAtLeast("ED") >= 2) return "BOM";
  if (totalSales >= 3200000 && countAtLeast("NSM") >= 4) return "ED";
  if (totalSales >= 800000 && countAtLeast("DSM") >= 4) return "NSM";
  if (totalSales >= 600000 && countAtLeast("DSM") >= 3) return "SM";
  if (totalSales >= 400000 && countAtLeast("DSM") >= 2) return "SDSM";
  if (totalSales >= 200000 && countAtLeast("RSM") >= 2 && countAtLeast("AM") >= 2) return "DSM";
  if (totalSales >= 75000 && countAtLeast("AM") >= 3) return "RSM";
  if (totalSales >= 25000) return "AM";

  return "SALES REPRESENTATIVE";
};

// আপনার দেওয়া মান্থলি কোয়ালিফিকেশন হেল্পার ফাংশন
const checkSelfQualificationOnly = (position, totalSales, subNodesSummary = []) => {
  const currentPos = (position || "").trim().toUpperCase();
  const counts = { AM: 0, RSM: 0, DSM: 0, NSM: 0, ED: 0, BOM: 0 };
  subNodesSummary.forEach(sub => {
    const pos = (sub.autoPosition || "").toUpperCase().trim();
    if (counts[pos] !== undefined) counts[pos]++;
  });

  const countAtLeast = (targetPos) => {
    return Object.keys(counts).reduce((total, pos) => {
      return RANK_MAP[pos] >= RANK_MAP[targetPos] ? total + counts[pos] : total;
    }, 0);
  };

  let qualifies = false;
  let performanceBonusRate = 0;

  switch (currentPos) {
    case "RSM":
      if ((totalSales >= 75000 && countAtLeast("AM") >= 3) || totalSales >= 75000) 
          { qualifies = true; performanceBonusRate = 0.01; }
      break;
    case "DSM":
      if ((totalSales >= 100000 && countAtLeast("RSM") >= 1 && countAtLeast("AM") >= 2) || totalSales >= 100000) 
          { qualifies = true; performanceBonusRate = 0.005; }
      break;
    case "SDSM":
      if (totalSales >= 200000 && countAtLeast("DSM") >= 2) 
          { qualifies = true; performanceBonusRate = 0.005; }
      break;
    case "SM":
      if (totalSales >= 300000 && countAtLeast("DSM") >= 3) 
          { qualifies = true; performanceBonusRate = 0.0025; }
      break;
    case "NSM":
      if (totalSales >= 400000 && countAtLeast("DSM") >= 4) 
          { qualifies = true; performanceBonusRate = 0.0025; }
      break;
    case "ED":
      if (totalSales >= 1600000 && countAtLeast("NSM") >= 4) 
          { qualifies = true; performanceBonusRate = 0.0025; }
      break;
    case "BOM":
      if (totalSales >= 3200000 && countAtLeast("ED") >= 2) 
          { qualifies = true; performanceBonusRate = 0.0025; }
      break;
    default:
      break;
  }
  return { qualifies, performanceBonusRate };
};

// ==========================================
// মেইন কন্ট্রোল এপিআই ফাংশন
// ==========================================

const processCompanyTreeData = async (req, res) => {
  try {
    const db = mongoose.connection.db;
    // --- STEP 1: ডাটাবেজ থেকে র ডাটা তুলে আনা ---
    let allSales = await db.collection("sales").find({}).toArray();
    if (!allSales || allSales.length === 0) {
      allSales = await db.collection("invoices").find({}).toArray();
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

    // --- STEP 3: ডিলার সেলস এবং কমিশন প্রসেসিং ---
    dealers.forEach(dlr => {
      const dlrSales = allSales.filter(s => s.dealer?.toString() === dlr._id?.toString());
      dlrSales.forEach(sale => {
        const saleAmount = Number(sale.grandTotal || sale.totalAmount || sale.amount || 0);
        const saleDate = new Date(sale.date || sale.createdAt);

        if (dlr.referenceIdNo && userSalesMap[dlr.referenceIdNo]) {
          const employee = userSalesMap[dlr.referenceIdNo];
          employee.directSalesTotal += saleAmount;
          employee.totalSalesVolume += saleAmount;

          const dealerComm = calculateDealerCommission(saleAmount);
          employee.dealerCommissionEarned += dealerComm;

          if (saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear) {
            employee.directSalesThisMonth += saleAmount;
            employee.thisMonthSalesVolume += saleAmount;
          }
        }
      });
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

    const processHierarchySpecs = (currentIdNo) => {
      const currentEmployee = userSalesMap[currentIdNo];
      if (!currentEmployee) return;

      const childrenIds = childMap[currentIdNo] || [];
      childrenIds.forEach(childId => processHierarchySpecs(childId));

      const subNodesSummary = [];
      let teamSalesSumTotal = 0;
      let teamSalesSumMonth = 0;

      childrenIds.forEach(childId => {
        const childData = userSalesMap[childId];
        if (childData) {
          subNodesSummary.push({
            idNo: childId,
            autoPosition: childData.autoPosition || "SALES REPRESENTATIVE"
          });
          teamSalesSumTotal += childData.totalSalesVolume;
          teamSalesSumMonth += childData.thisMonthSalesVolume;
        }
      });

      currentEmployee.totalSalesVolume += teamSalesSumTotal;
      currentEmployee.thisMonthSalesVolume += teamSalesSumMonth;

      // ১. লাইফটাইম সেলস দিয়ে স্থায়ী পজিশন ডিটারমাইন করা হচ্ছে
      currentEmployee.autoPosition = autoDeterminePosition(currentEmployee.totalSalesVolume, subNodesSummary);

      // 🎯 ২. পজিশন সেট হওয়ার পর চলতি মাসের সেলস (thisMonthSalesVolume) দিয়ে মান্থলি কোয়ালিফাই ম্যাচ করা হচ্ছে
      const qualification = checkSelfQualificationOnly(
        currentEmployee.autoPosition,
        currentEmployee.thisMonthSalesVolume, 
        subNodesSummary
      );

      currentEmployee.isMonthlyQualified = qualification.qualifies;
      currentEmployee.performanceBonusRate = qualification.performanceBonusRate;
      currentEmployee.currentSlabRate = POSITION_SLABS[currentEmployee.autoPosition] || 0;

      if (ELIGIBLE_POOL_POSITIONS.includes(currentEmployee.autoPosition) && currentEmployee.isMonthlyQualified) {
        currentEmployee.eligibleForGlobalPool = true;
        currentEmployee.globalPoolShareRate = SALES_SHARE_CONFIG[currentEmployee.autoPosition] || 0;
      }
    };

    users.forEach(user => {
      if (user.refIdNo === "0" || !user.refIdNo || !userSalesMap[user.refIdNo]) {
        processHierarchySpecs(user.idNo);
      }
    });

    // --- STEP 5: ডিফারেন্সিয়াল জেনারেশন বোনাস এবং ফাইনাল ট্রি জেনারেশন ---
    users.forEach(user => {
      const parentIdNo = user.refIdNo;
      if (parentIdNo && parentIdNo !== "0" && userSalesMap[parentIdNo]) {
        const parent = userSalesMap[parentIdNo];
        const child = userSalesMap[user.idNo];
        if (child) {
          let diffRate = parent.currentSlabRate - child.currentSlabRate;
          if (diffRate > 0) {
            parent.generationBonusEarned += (child.thisMonthSalesVolume * diffRate);
          }
        }
      }
    });

    users.forEach(user => {
      const currentEmployee = userSalesMap[user.idNo];
      if (!currentEmployee) return;

      currentEmployee.position = currentEmployee.autoPosition;
      currentEmployee.totalSalesAchieved = currentEmployee.totalSalesVolume;
      currentEmployee.thisMonthSalesAchieved = currentEmployee.thisMonthSalesVolume;
      currentEmployee.thisMonthBonusEarned = currentEmployee.thisMonthSalesVolume * currentEmployee.performanceBonusRate;
      const parentIdNo = user.refIdNo;
      if (parentIdNo === "0" || !parentIdNo || !userSalesMap[parentIdNo]) {
        tree.push(currentEmployee);
        } else {
          userSalesMap[parentIdNo].children.push(currentEmployee);
          }});

      res.status(200).json(tree);
    } catch (error) {
      console.error("❌ BACKEND CRASH ERROR:", error);
      res.status(500).json({ message: error.message });
      }};



const getCommissionLedger = async (req, res) => {
  try {
    const db = mongoose.connection.db;
    
    // কোয়েরি থেকে বছর এবং মাস প্যারামিটার নেওয়া
    const currentYear = parseInt(req.query.year) || new Date().getFullYear();
    const currentMonth = parseInt(req.query.month) || (new Date().getMonth() + 1);

    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 1);
    const salesQuery = { createdAt: { $gte: startDate, $lt: endDate } };

    // 💥 সমাধান ১: লাইফটাইম পজিশন ঠিক রাখার জন্য ডাটাবেজের সমস্ত সেলস এবং চলতি মাসের সেলস আলাদা করা হলো
    let allLifetimeSales = await db.collection("sales").find({}).toArray();
    if (!allLifetimeSales || allLifetimeSales.length === 0) {
      allLifetimeSales = await db.collection("invoices").find({}).toArray();
    }

    // শুধুমাত্র চলতি মাসের সেলস (গ্যাপ কমিশন, মান্থলি কোয়ালিফাই এবং কোম্পানি পুলে টাকার অংক বের করার জন্য)
    const thisMonthSales = allLifetimeSales.filter(s => {
      const d = new Date(s.createdAt);
      return d >= startDate && d < endDate;
    });

    // 🌟 মোট কোম্পানি মান্থলি সেলস ভলিউম বের করা (গ্লোবাল পুলে টাকা বন্টনের মেইন সোর্স)
    const totalCompanySalesAmount = thisMonthSales.reduce((sum, s) => sum + (s.grandTotal || 0), 0);

    const dealers = await db.collection("dealers").find({}).toArray();
    const users = await db.collection("users").find({ idNo: { $regex: /^MKT/i } }).toArray();

    const userSalesMap = {};
    const parentToChildrenMap = {}; 

    // ওয়ান-পাস মেমোরি ম্যাপ ও ফাস্ট চাইল্ড ইনডেক্সিং তৈরি
    users.forEach(u => {
      userSalesMap[u.idNo] = { 
        ...u, 
        _id: u._id.toString(),
        directSalesLifetime: 0, 
        directSalesThisMonth: 0, 
        totalSalesVolume: 0,       // লাইফটাইম ভলিউম ট্র্যাকার
        thisMonthSalesVolume: 0,   // মান্থলি ভলিউম ট্র্যাকার
        autoPosition: "SALES REPRESENTATIVE",
        baseCommission: 0,
        selfQualifiesForBonus: false,
        performanceBonusRate: 0,
        monthlyBonusAmount: 0,
        globalPoolBonusAmount: 0,
        earnedPools: [] 
      };
      
      const parentId = u.refIdNo || "0";
      if (!parentToChildrenMap[parentId]) parentToChildrenMap[parentId] = [];
      parentToChildrenMap[parentId].push(u.idNo); // অবজেক্টের বদলে শুধু আইডি পুশ করা হলো (মেমোরি সেফ)
    });

    // ডিলার ওয়াইজ লাইফটাইম এবং চলতি মাসের সেলস ম্যাপিং
    const dealerLifetimeSalesMap = {};
    const dealerThisMonthSalesMap = {};

    allLifetimeSales.forEach(s => {
      if (s.dealer) {
        const dStr = s.dealer.toString();
        const amt = s.grandTotal || 0;
        dealerLifetimeSalesMap[dStr] = (dealerLifetimeSalesMap[dStr] || 0) + amt;
        
        const d = new Date(s.createdAt);
        if (d >= startDate && d < endDate) {
          dealerThisMonthSalesMap[dStr] = (dealerThisMonthSalesMap[dStr] || 0) + amt;
        }
      }
    });

    // ডিলারদের মাধ্যমে এমপ্লয়িদের নিজস্ব ডাইরেক্ট সেলস ডাটা পুশ করা
    dealers.forEach(dlr => {
      const dStr = dlr._id.toString();
      const lifetimeAmt = dealerLifetimeSalesMap[dStr] || 0;
      const monthlyAmt = dealerThisMonthSalesMap[dStr] || 0;

      if (dlr.referenceIdNo && userSalesMap[dlr.referenceIdNo]) {
        const emp = userSalesMap[dlr.referenceIdNo];
        emp.directSalesLifetime += lifetimeAmt;
        emp.totalSalesVolume += lifetimeAmt;

        emp.directSalesThisMonth += monthlyAmt;
        emp.thisMonthSalesVolume += monthlyAmt;
      }
    });

    // ==========================================
    // পাস ১: রিকার্সিভ বটম-আপ পজিশন ও মান্থলি কোয়ালিফিকেশন ইঞ্জিন
    // ==========================================
    const determineHierarchySpecs = (currentIdNo) => {
      const currentEmployee = userSalesMap[currentIdNo];
      if (!currentEmployee) return;

      const childrenIds = parentToChildrenMap[currentIdNo] || [];
      childrenIds.forEach(childId => determineHierarchySpecs(childId));

      const subNodesSummary = [];
      let teamSalesSumTotal = 0;
      let teamSalesSumMonth = 0;

      // 💥 সমাধান ২: ডাটা সরাসরি 'userSalesMap' থেকে রিড করা হচ্ছে
      childrenIds.forEach(childId => {
        const childData = userSalesMap[childId];
        if (childData) {
          subNodesSummary.push({
            idNo: childId,
            autoPosition: childData.autoPosition || "SALES REPRESENTATIVE"
          });
          teamSalesSumTotal += childData.totalSalesVolume;
          teamSalesSumMonth += childData.thisMonthSalesVolume;
        }
      });
      
      // ডাউনলাইনের ডাটা রোল-আপ করা
      currentEmployee.totalSalesVolume += teamSalesSumTotal;
      currentEmployee.thisMonthSalesVolume += teamSalesSumMonth;

      // ক) লাইফটাইম সেলস দিয়ে স্থায়ী পজিশন ডিটারমাইন করা হলো
      currentEmployee.autoPosition = autoDeterminePosition(currentEmployee.totalSalesVolume, subNodesSummary);

      // খ) পজিশন সেট হওয়ার পর আপনার টার্গেট অনুযায়ী চলতি মাসের সেলস দিয়ে মান্থলি কোয়ালিফাই চেক করা হলো
      const checkBonus = checkSelfQualificationOnly(
        currentEmployee.autoPosition, 
        currentEmployee.thisMonthSalesVolume, 
        subNodesSummary
      );
      
      currentEmployee.selfQualifiesForBonus = checkBonus.qualifies;
      currentEmployee.performanceBonusRate = checkBonus.performanceBonusRate;
    };

    users.forEach(user => {
      if (user.refIdNo === "0" || !user.refIdNo || !userSalesMap[user.refIdNo]) {
        determineHierarchySpecs(user.idNo);
      }
    });

    // ==========================================
    // পাস ২: লিনিয়ার ডাইনামিক গ্যাপ কমিশন ক্যালকুলেটর (চলতি মাসের সেলস বেসড)
    // ==========================================
    dealers.forEach(dlr => {
      const totalInvoiceAmount = dealerThisMonthSalesMap[dlr._id.toString()] || 0;
      if (totalInvoiceAmount <= 0 || !dlr.referenceIdNo) return;

      let currentIdNo = dlr.referenceIdNo;
      let distributedRateSoFar = 0;
      const visited = new Set(); // 💥 সমাধান ৩: সার্কুলার রেফারেন্স ইনফিনিট লুপ সেফটি গার্ড

      while (currentIdNo && currentIdNo !== "0" && !visited.has(currentIdNo)) {
        visited.add(currentIdNo);
        const empNode = userSalesMap[currentIdNo];
        if (!empNode) break;

        const myPositionRate = POSITION_SLABS[empNode.autoPosition?.toUpperCase()] || 0;

        if (myPositionRate > distributedRateSoFar) {
          const gapRate = myPositionRate - distributedRateSoFar;
          empNode.baseCommission += totalInvoiceAmount * gapRate;
          distributedRateSoFar = myPositionRate; 
        }
        currentIdNo = empNode.refIdNo; 
      }
    });

    // ==========================================
    // পাস ৩: টপ-ডাউন বোনাস কোয়ালিফিকেশন ওভাররাইড চেইন (Top-Down Override)
    // ==========================================
    const applyTopDownBonusQualification = (currentIdNo, parentQualifies = false) => {
      const currentEmployee = userSalesMap[currentIdNo];
      if (!currentEmployee) return;

      if (parentQualifies) {
        currentEmployee.selfQualifiesForBonus = true;
      }

      const childrenIds = parentToChildrenMap[currentIdNo] || [];
      childrenIds.forEach(childId => {
        applyTopDownBonusQualification(childId, currentEmployee.selfQualifiesForBonus);
      });
    };

    if (parentToChildrenMap["0"]) {
      parentToChildrenMap["0"].forEach(rootIdNo => applyTopDownBonusQualification(rootIdNo, false));
    }

    // ==========================================
    // পাস ৪: রোল-ডাউন গ্লোবাল পুল কাউন্টার এবং মেম্বার অ্যাসাইনমেন্ট
    // ==========================================
    const poolShareCounters = { RSM: 0, DSM: 0, SDSM: 0, SM: 0, NSM: 0, ED: 0, BOM: 0 };
    const qualifiedPoolMembers = { RSM: [], DSM: [], SDSM: [], SM: [], NSM: [], ED: [], BOM: [] };

    users.forEach(user => {
      const nodeData = userSalesMap[user.idNo];
      if (!nodeData) return;

      // ৩০০০ টাকা মান্থলি ডাইরেক্ট সেলসের এলিজিবিলিটি শর্ত চেক
      const isQualifiedForBill = nodeData.directSalesThisMonth >= 3000;
      const myPos = nodeData.autoPosition?.toUpperCase();

      if (isQualifiedForBill && nodeData.selfQualifiesForBonus && ELIGIBLE_POOL_POSITIONS.includes(myPos)) {
        const myRankValue = RANK_MAP[myPos];
        
        ELIGIBLE_POOL_POSITIONS.forEach(poolName => {
          const poolRankValue = RANK_MAP[poolName];
          
          if (myPos === "RSM") {
            if (poolName === "RSM") {
              poolShareCounters[poolName]++;
              nodeData.earnedPools.push(poolName);
              qualifiedPoolMembers[poolName].push(user.idNo);
            }
          } else {
            if (myRankValue >= poolRankValue && poolName !== "RSM") {
              poolShareCounters[poolName]++;
              nodeData.earnedPools.push(poolName);
              qualifiedPoolMembers[poolName].push(user.idNo);
            }
          }
        });
      }
    });

    // ==========================================
    // পাস ৫: 💥 সমাধান ৪: গ্লোবাল কোম্পানি পুল বোনাস ডিস্ট্রিবিউশন রানার
    // ==========================================
    ELIGIBLE_POOL_POSITIONS.forEach(poolName => {
      const totalPoolMembers = poolShareCounters[poolName] || 0;
      const poolRate = SALES_SHARE_CONFIG[poolName] || 0;
      if (totalPoolMembers > 0 && poolRate > 0) {
      // এই পুলের জন্য বরাদ্দকৃত মোট টাকা = টোটাল কোম্পানি সেলস * পুল রেট
      const totalPoolMoney = totalCompanySalesAmount * poolRate;

      // প্রতিজন মেম্বারের প্রাপ্য অংশ
      const sharePerMember = totalPoolMoney / totalPoolMembers;
      // এই পুলে থাকা কোয়ালিফাইড মেম্বারদের ওয়ালেটে টাকা যোগ করা
      qualifiedPoolMembers[poolName].forEach(idNo => {
      if (userSalesMap[idNo]) {
      userSalesMap[idNo].globalPoolBonusAmount += sharePerMember;
      }

      });
      }
      });

// ==========================================// ফাইনাল রেসপন্স অবজেক্ট জেনারেশন (ট্রি অ্যারে রেডি করা)// ==========================================
const finalTree = [];
users.forEach(user => {
const currentEmployee = userSalesMap[user.idNo];
if (!currentEmployee) return;

// মাসিক পারফরম্যান্স বোনাস গুণ করে ফাইনালাইজ করা
currentEmployee.monthlyBonusAmount = currentEmployee.thisMonthSalesVolume *
currentEmployee.performanceBonusRate;
currentEmployee.totalSalesAchieved = currentEmployee.totalSalesVolume;
currentEmployee.thisMonthSalesAchieved = currentEmployee.thisMonthSalesVolume;

const parentIdNo = user.refIdNo;
if (parentIdNo === "0" || !parentIdNo || !userSalesMap[parentIdNo]) {
  finalTree.push(currentEmployee);
  } else {
    // চাইল্ড অ্যারে খালি রাখা হলো, যদি ফ্রন্টএন্ডে নেস্টেড স্ট্রাকচার লাগে তবে পুশ করতে পারেন
    if (!userSalesMap[parentIdNo].children) userSalesMap[parentIdNo].children = [];
    userSalesMap[parentIdNo].children.push(currentEmployee);}

    });


// ==========================================
    // পাস ৫: ফাইনাল বোনাস হিসাব ও রেসপন্স এরে প্রস্তুতকরণ
    // ==========================================
    const qualifiedEmployees = [];
    users.forEach(user => {
      const nodeData = userSalesMap[user.idNo];
      if (!nodeData) return;
      const isQualifiedForBill = nodeData.directSales >= 3000;

      let salesShareBonus = 0;
      let performanceBonus = 0;

      if (isQualifiedForBill && nodeData.selfQualifiesForBonus) {
        nodeData.earnedPools.forEach(poolName => {
          const totalPeopleInThisPool = poolShareCounters[poolName] || 0;
          if (totalPeopleInThisPool > 0) {
            const poolPercentage = SALES_SHARE_CONFIG[poolName] || 0;
            const thisPoolTotalFund = totalCompanySalesAmount * poolPercentage;
            salesShareBonus += (thisPoolTotalFund / totalPeopleInThisPool);
          }
        });

        // পারফরম্যান্স বোনাস চলতি মাসের ভলিউমের সাথে গুণ হবে
        performanceBonus = nodeData.thisMonthSalesVolume * nodeData.performanceBonusRate;
      }

      const baseCommission = isQualifiedForBill ? nodeData.baseCommission : 0;
      const totalEarned = baseCommission + salesShareBonus + performanceBonus;

      if (totalEarned > 0 || nodeData.totalSalesVolume >= 25000) {
        qualifiedEmployees.push({
          _id: user._id.toString(),
          name: user.name,
          idNo: user.idNo,
          position: nodeData.autoPosition,
          monthlyDirectSales: nodeData.directSales,
          totalSalesAchieved: nodeData.totalSalesVolume,
          baseCommission: Math.round(baseCommission),
          salesShareBonus: Math.round(salesShareBonus), 
          performanceBonus: Math.round(performanceBonus),
          totalEarned: Math.round(totalEarned),
          status: isQualifiedForBill ? "Qualified" : "Disqualified (Sales < 3000)"
        });
      }
    });

    // 💥 ডিলার রেসপন্স লুপ সম্পূর্ণ ফিক্সড এবং ডাইনামিক
    const qualifiedDealers = dealers.map(dlr => {
      // চলতি মাসে ডিলারের আন্ডারে হওয়া মোট সেলস
      const totalAmount = dealerThisMonthSalesMap[dlr._id.toString()] || 0;
      // ডিলার কমিশন ক্যালকুলেটর ইঞ্জিন কল
      const commission = calculateDealerCommission(totalAmount);

      return {
        _id: dlr._id.toString(),
        name: dlr.name || "Unknown Dealer",
        dealerId: dlr.dealerId || dlr.idNo || "N/A",
        totalSales: totalAmount,
        commission: Math.round(commission),
        status: totalAmount >= 5000 ? "Qualified" : "Disqualified (Sales < 5000)"
      };
    }); // ফ্রন্টএন্ডে সব ডিলার দেখানোর জন্য .filter() কন্ডিশনটি তুলে দেওয়া হলো

    // টোটাল পে-আউট সামারি রি-ক্যালকুলেশন
    const totalEmployeePayout = qualifiedEmployees.reduce((sum, e) => sum + e.totalEarned, 0);
    const totalDealerPayout = qualifiedDealers.reduce((sum, d) => sum + d.commission, 0);


// ক্লায়েন্টে সাকসেস রেসপন্স পাঠানো
res.status(200).json({
meta: {
  targetYear: currentYear,
  targetMonth: currentMonth,
  totalCompanySalesThisMonth: totalCompanySalesAmount,
  poolCounters: poolShareCounters
},
summary: {
  totalEmployeePayout,
  totalDealerPayout,
  grandTotalPayout: totalEmployeePayout + totalDealerPayout
},
dealers: qualifiedDealers,
data: finalTree
});



///



} catch (error) {
console.error("❌ BACKEND CRASH ERROR:", error);
res.status(500).json({ message: error.message });
}
};








      module.exports = {
  processCompanyTreeData, getCommissionLedger
};