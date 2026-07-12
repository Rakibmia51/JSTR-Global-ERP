
const mongoose = require('mongoose');
const Invoice = require('../models/Invoice');
const Dealer = require('../models/Dealer');
const User = require('../models/User');


// ১. ডিলার কমিশন ক্যালকুলেটর (নਿয়ম 8)
// const calculateDealerCommission = (amount) => {
//   if (amount < 50000) return amount * 0.05; // 50k এর নিচে 5%
//   return amount * 0.07; // 50k এর উপরে 7%
// };

// ২. এমপ্লয়ি কমিশন ক্যালকুলেটর (নিয়ম ১ থেকে ৭)
// controllers/commissionController.js এর এই ফাংশনটি শুধু আপডেট করুন:
// const calculateEmployeeCommission = (role, totalSales, qualifiedSubsCount = 0) => {
//   let commission = 0;
//   let salesShare = 0;
//   let bestPerf = 0;

//   const r = role?.toUpperCase();

//   // 💡 সমাধান: যদি রোল "AM" হয় অথবা সাধারণ "EMPLOYEE" বা "STAFF" হয় এবং সেলস ২৫,০০০ এর বেশি হয়,
//   // তবে সে স্বয়ংক্রিয়ভাবে ১৫% কমিশন স্ল্যাব কোয়ালিফাই করবে (আপনার ১ নম্বর নিয়ম অনুযায়ী)
//   if ((r === "AM" || r === "EMPLOYEE" || r === "STAFF") && totalSales >= 25000) {
//     commission = totalSales * 0.15; // 15% Commission
//   } 
//   else if (r === "RSM" && qualifiedSubsCount >= 4 && totalSales >= 100000) {
//     commission = totalSales * 0.175; // 17.5%
//     salesShare = totalSales * 0.01;  // 1%
//     bestPerf = totalSales * 0.01;    // 1%
//   } 
//   else if (r === "DSM" && qualifiedSubsCount >= 3 && totalSales >= 150000) {
//     commission = totalSales * 0.20; // 20%
//     salesShare = totalSales * 0.05;  // 5%
//     bestPerf = totalSales * 0.005;  // 0.5%
//   } 
//   else if (r === "SDSM" && qualifiedSubsCount >= 2 && totalSales >= 200000) {
//     commission = totalSales * 0.21; // 21%
//     salesShare = totalSales * 0.01;  // 1%
//     bestPerf = totalSales * 0.005;  // 0.5%
//   } 
//   else if (r === "SM" && qualifiedSubsCount >= 3 && totalSales >= 300000) {
//     commission = totalSales * 0.22; // 22%
//     salesShare = totalSales * 0.005; // 0.5%
//     bestPerf = totalSales * 0.0025; // 0.25%
//   } 
//   else if (r === "NSM" && qualifiedSubsCount >= 4 && totalSales >= 400000) {
//     commission = totalSales * 0.23; // 23%
//     salesShare = totalSales * 0.01;  // 1%
//     bestPerf = totalSales * 0.0025; // 0.25%
//   } 
//   else if (r === "ED" && qualifiedSubsCount >= 4 && totalSales >= 1600000) {
//     commission = totalSales * 0.24; // 24%
//     salesShare = totalSales * 0.005; // 0.5%
//     bestPerf = totalSales * 0.0025; // 0.25%
//   }

//   return {
//     baseCommission: Math.round(commission),
//     salesShareBonus: Math.round(salesShare),
//     performanceBonus: Math.round(bestPerf),
//     totalEarned: Math.round(commission + salesShare + bestPerf)
//   };
// };


// ৩. মেইন এপিআই কন্ট্রোলার
//  const getCommissionLedger = async (req, res) => {
//   try {
//     const db = mongoose.connection.db;
    
//     // সব ইনভয়েস তুলে আনা
//     let allSales = await db.collection("sales").find({}).toArray();
//     if (!allSales || allSales.length === 0) {
//       allSales = await db.collection("invoices").find({}).toArray();
//     }

//     // সব ডিলার এবং ইউজার ম্যাপ তৈরি করা সহজে ট্র্যাকিং এর জন্য
//     const dealers = await Dealer.find({}).lean();
//     const users = await User.find({}).lean();

//     // প্রতিটা ইউজারের নিজস্ব এবং চেইনের টোটাল সেলস হিসাব করার অবজেক্ট
//     const userSalesMap = {};
//     users.forEach(u => { userSalesMap[u.idNo] = { ...u, directSales: 0, totalTeamSales: 0, subNodes: [] }; });

//     const dealerSalesSummary = dealers.map(dlr => {
//       // এই ডিলারের মোট সেলস কত তা হিসাব করা
//       const dlrSalesList = allSales.filter(s => s.dealer?.toString() === dlr._id.toString());
//       const totalDlrSales = dlrSalesList.reduce((acc, curr) => acc + (curr.grandTotal || 0), 0);
      
//       // ডিলার কমিশন হিসাব করা (Rule 8)
//       const commEarned = calculateDealerCommission(totalDlrSales);

//       // এই ডিলারের মেইন মার্কেটিং হ্যান্ডলার কে (MKT-XXXX) তার সেলস ভলিউম বাড়িয়ে দেওয়া
//       if (dlr.referenceIdNo && userSalesMap[dlr.referenceIdNo]) {
//         userSalesMap[dlr.referenceIdNo].directSales += totalDlrSales;
//       }

//       return {
//         _id: dlr._id,
//         name: dlr.name,
//         dealerId: dlr.dealerId,
//         totalSales: totalDlrSales,
//         commission: commEarned
//       };
//     });

//     // এমপ্লয়িদের টিম চেইন সেলস এবং কোয়ালিফাইড চাইল্ড গোনার লজিক
//     // (সহজ করার জন্য ডাইরেক্ট সেলস এবং ডাইরেক্ট চিলড্রেন কাউন্টকে এখানে কোয়ালিফিকেশন বেস ধরা হয়েছে)
//     const employeeCommissionSummary = users.map(user => {
//       const userNode = userSalesMap[user.idNo];
      
//       // কার আন্ডারে কতজন সরাসরি কোয়ালিফাইড লোক আছে তা গোনা (যেমন: AM এর জন্য ২৫ক সেলস পার হওয়া)
//       const directTeam = users.filter(u => u.refIdNo === user.idNo);
//       const qualifiedSubs = directTeam.filter(sub => {
//         const subSales = userSalesMap[sub.idNo]?.directSales || 0;
//         // AM কোয়ালিফাই মার্ক ২৫,০০০; RSM কোয়ালিফাই মার্ক ১ লাখ ইত্যাদি
//         if (sub.role?.toUpperCase() === "AM") return subSales >= 25000;
//         if (sub.role?.toUpperCase() === "RSM") return subSales >= 100000;
//         return subSales > 0;
//       }).length;

//       const totalSalesTarget = userNode ? userNode.directSales : 0;
//       const commDetails = calculateEmployeeCommission(user.role, totalSalesTarget, qualifiedSubs);

//       return {
//         _id: user._id,
//         name: user.name,
//         idNo: user.idNo,
//         role: user.role,
//         totalSalesAchieved: totalSalesTarget,
//         qualifiedTeamMembers: qualifiedSubs,
//         ...commDetails
//       };
//     });

//     res.status(200).json({
//       dealers: dealerSalesSummary.filter(d => d.totalSales > 0),
//       employees: employeeCommissionSummary.filter(e => e.totalSalesAchieved > 0 || e.totalEarned > 0)
//     });

//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

//------- 2nd Version of Commission Controller with Auto Positioning and Commission Calculation -------//
// ১. ডিলার কমিশন ক্যালকুলেটর (Rule 8)
// const calculateDealerCommission = (amount) => {
//   if (amount < 50000) return amount * 0.05;
//   return amount * 0.07;
// };

// ২. অটোমেটিক পজিশন এবং কমিশন ইঞ্জিন (Rule 1 to 7)
// const autoDeterminePositionAndCommission = (totalSales, subNodesSummary = []) => {
//   const amQualifiedCount = subNodesSummary.filter(sub => sub.autoPosition === "AM").length;
//   const rsmQualifiedCount = subNodesSummary.filter(sub => sub.autoPosition === "RSM").length;
//   const dsmQualifiedCount = subNodesSummary.filter(sub => sub.autoPosition === "DSM").length;
//   const nsmQualifiedCount = subNodesSummary.filter(sub => sub.autoPosition === "NSM").length;

//   let assignedPosition = "Sales Representative";
//   let commission = 0;
//   let salesShare = 0;
//   let bestPerf = 0;

//   // উচ্চ স্তর থেকে স্তরে অটো-কোয়ালিফিকেশন চেক
//   if (nsmQualifiedCount >= 4 && totalSales >= 1600000) {
//     assignedPosition = "ED";
//     commission = totalSales * 0.24;
//     salesShare = totalSales * 0.005;
//     bestPerf = totalSales * 0.0025;
//   }
//   else if (dsmQualifiedCount >= 4 && totalSales >= 400000) {
//     assignedPosition = "NSM";
//     commission = totalSales * 0.23;
//     salesShare = totalSales * 0.01;
//     bestPerf = totalSales * 0.0025;
//   }
//   else if (dsmQualifiedCount >= 3 && totalSales >= 300000) {
//     assignedPosition = "SM";
//     commission = totalSales * 0.22;
//     salesShare = totalSales * 0.005;
//     bestPerf = totalSales * 0.0025;
//   }
//   else if (dsmQualifiedCount >= 2 && totalSales >= 200000) {
//     assignedPosition = "SDSM";
//     commission = totalSales * 0.21;
//     salesShare = totalSales * 0.01;
//     bestPerf = totalSales * 0.005;
//   }
//   else if (rsmQualifiedCount >= 1 && amQualifiedCount >= 2 && totalSales >= 150000) {
//     assignedPosition = "DSM";
//     commission = totalSales * 0.20;
//     salesShare = totalSales * 0.05;
//     bestPerf = totalSales * 0.005;
//   }
//   else if (amQualifiedCount >= 4 && totalSales >= 100000) {
//     assignedPosition = "RSM";
//     commission = totalSales * 0.175;
//     salesShare = totalSales * 0.01;
//     bestPerf = totalSales * 0.01;
//   }
//   else if (totalSales >= 25000) {
//     assignedPosition = "AM";
//     commission = totalSales * 0.15;
//   }

//   return {
//     autoPosition: assignedPosition,
//     baseCommission: Math.round(commission),
//     salesShareBonus: Math.round(salesShare),
//     performanceBonus: Math.round(bestPerf),
//     totalEarned: Math.round(commission + salesShare + bestPerf)
//   };
// };

// ৩. মেইন এপিআই কন্ট্রোলার ফাংশন
// const getCommissionLedger = async (req, res) => {
//   try {
//     const db = mongoose.connection.db;
    
//     let allSales = await db.collection("sales").find({}).toArray();
//     if (!allSales || allSales.length === 0) {
//       allSales = await db.collection("invoices").find({}).toArray();
//     }

//     const dealers = await Dealer.find({}).lean();
//     const users = await User.find({}).lean();

//     const userSalesMap = {};
//     users.forEach(u => {
//       userSalesMap[u.idNo] = { ...u, directSales: 0, autoPosition: "Sales Representative" };
//     });

//     const dealerSummary = dealers.map(dlr => {
//       const dlrSales = allSales.filter(s => s.dealer?.toString() === dlr._id.toString());
//       const totalAmount = dlrSales.reduce((sum, s) => sum + (s.grandTotal || 0), 0);
      
//       if (dlr.referenceIdNo && userSalesMap[dlr.referenceIdNo]) {
//         userSalesMap[dlr.referenceIdNo].directSales += totalAmount;
//       }

//       return {
//         _id: dlr._id,
//         name: dlr.name,
//         dealerId: dlr.dealerId,
//         totalSales: totalAmount,
//         commission: calculateDealerCommission(totalAmount)
//       };
//     });

//     // প্রথম পাস: প্রাথমিক পজিশন নির্ধারণ
//     users.forEach(user => {
//       const mySales = userSalesMap[user.idNo]?.directSales || 0;
//       const baseResult = autoDeterminePositionAndCommission(mySales, []);
//       userSalesMap[user.idNo].autoPosition = baseResult.autoPosition;
//     });

//     // দ্বিতীয় পাস: টিম বোনাস সহ ফাইনাল কমিশন
//     const employeeSummary = users.map(user => {
//       const directSubs = users.filter(u => u.refIdNo === user.idNo).map(sub => ({
//         idNo: sub.idNo,
//         autoPosition: userSalesMap[sub.idNo]?.autoPosition || "Sales Representative",
//         sales: userSalesMap[sub.idNo]?.directSales || 0
//       }));

//       const myDirectSales = userSalesMap[user.idNo]?.directSales || 0;
//       const finalCommDetails = autoDeterminePositionAndCommission(myDirectSales, directSubs);

//       userSalesMap[user.idNo].autoPosition = finalCommDetails.autoPosition;

//       return {
//         _id: user._id,
//         name: user.name,
//         idNo: user.idNo,
//         role: user.role,
//         position: finalCommDetails.autoPosition,
//         totalSalesAchieved: myDirectSales,
//         ...finalCommDetails
//       };
//     });

//     res.status(200).json({
//       dealers: dealerSummary.filter(d => d.totalSales > 0),
//       employees: employeeSummary.filter(e => e.totalEarned > 0)
//     });

//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };


// module.exports = { getCommissionLedger };  


//----3rd Version of Commission Controller with Auto Positioning and Commission Calculation (Future Plan)----//

// ১. ডিলার কমিশন ক্যালকুলেটর (Rule 8)
// const calculateDealerCommission = (amount) => {
//   if (amount < 50000) return amount * 0.05;
//   return amount * 0.07;
// };

// ২. অটোমেটিক পজিশন এবং কমিশন ইঞ্জিন (Rule 1 to 7)
// const autoDeterminePositionAndCommission = (totalSales, subNodesSummary = []) => {
//   // ডাউনলাইন চাইল্ড নোডদের অলরেডি জেনারেট হওয়া অটো-পজিশন চেক করা হচ্ছে
//   const amQualifiedCount = subNodesSummary.filter(sub => sub.autoPosition === "AM").length;
//   const rsmQualifiedCount = subNodesSummary.filter(sub => sub.autoPosition === "RSM").length;
//   const dsmQualifiedCount = subNodesSummary.filter(sub => sub.autoPosition === "DSM").length;
//   const nsmQualifiedCount = subNodesSummary.filter(sub => sub.autoPosition === "NSM").length;

//   let assignedPosition = "Sales Representative";
//   let commission = 0;
//   let salesShare = 0;
//   let bestPerf = 0;

//   // 💡 উচ্চ স্তর থেকে নিচের স্তরে প্রমোশন ও কমিশন চেক
//   if (nsmQualifiedCount >= 4 && totalSales >= 1600000) {
//     assignedPosition = "ED";
//     commission = totalSales * 0.24;
//     salesShare = totalSales * 0.005;
//     bestPerf = totalSales * 0.0025;
//   }
//   else if (dsmQualifiedCount >= 4 && totalSales >= 400000) {
//     assignedPosition = "NSM";
//     commission = totalSales * 0.23;
//     salesShare = totalSales * 0.01;
//     bestPerf = totalSales * 0.0025;
//   }
//   else if (dsmQualifiedCount >= 3 && totalSales >= 300000) {
//     assignedPosition = "SM";
//     commission = totalSales * 0.22;
//     salesShare = totalSales * 0.005;
//     bestPerf = totalSales * 0.0025;
//   }
//   else if (dsmQualifiedCount >= 2 && totalSales >= 200000) {
//     assignedPosition = "SDSM";
//     commission = totalSales * 0.21;
//     salesShare = totalSales * 0.01;
//     bestPerf = totalSales * 0.005;
//   }
//   else if (rsmQualifiedCount >= 1 && amQualifiedCount >= 2 && totalSales >= 150000) {
//     assignedPosition = "DSM";
//     commission = totalSales * 0.20;
//     salesShare = totalSales * 0.05;
//     bestPerf = totalSales * 0.005;
//   }
//   // 💡 আপনার এক্সাম্পল: ৪ জন AM কোয়ালিফাই এবং ২ নম্বর আইডির নিজের ডাইরেক্ট বা টিম সেলস ১ লাখ হলে RSM হবে
//   else if (amQualifiedCount >= 4 && totalSales >= 100000) {
//     assignedPosition = "RSM";
//     commission = totalSales * 0.175;
//     salesShare = totalSales * 0.01;
//     bestPerf = totalSales * 0.01;
//   }
//   else if (totalSales >= 25000) {
//     assignedPosition = "AM";
//     commission = totalSales * 0.15;
//   }

//   return {
//     autoPosition: assignedPosition,
//     baseCommission: Math.round(commission),
//     salesShareBonus: Math.round(salesShare),
//     performanceBonus: Math.round(bestPerf),
//     totalEarned: Math.round(commission + salesShare + bestPerf)
//   };
// };

// ৩. মেইন এপিআই কন্ট্রোলার ফাংশন
// const getCommissionLedger = async (req, res) => {
//   try {
//     const db = mongoose.connection.db;
    
//     let allSales = await db.collection("sales").find({}).toArray();
//     if (!allSales || allSales.length === 0) {
//       allSales = await db.collection("invoices").find({}).toArray();
//     }

//     const dealers = await Dealer.find({}).lean();
//     const users = await User.find({}).lean();

//     // মেমোরি ম্যাপ তৈরি
//     const userSalesMap = {};
//     users.forEach(u => {
//       userSalesMap[u.idNo] = { 
//         ...u, 
//         directSales: 0, 
//         totalSalesVolume: 0, // নিজের + পুরো টিমের মোট সেলস ভলিউম ট্র্যাকিং ফিল্ড
//         autoPosition: "Sales Representative" 
//       };
//     });

//     // ডিলারদের সেলস অনুযায়ী মার্কেটিং এমপ্লয়িদের ডাইরেক্ট সেলস যোগ করা
//     dealers.forEach(dlr => {
//       const dlrSales = allSales.filter(s => s.dealer?.toString() === dlr._id.toString());
//       const totalAmount = dlrSales.reduce((sum, s) => sum + (s.grandTotal || 0), 0);
      
//       if (dlr.referenceIdNo && userSalesMap[dlr.referenceIdNo]) {
//         userSalesMap[dlr.referenceIdNo].directSales += totalAmount;
//         userSalesMap[dlr.referenceIdNo].totalSalesVolume += totalAmount;
//       }
//     });

//     // 💡 সমাধান: রিকার্সিভ ফাংশন যা চেইনের নিচ থেকে উপরে (Bottom-Up) টোটাল টিম সেলস পুশ করবে
//     const rollUpSalesAndPositions = (currentIdNo) => {
//       const currentEmployee = userSalesMap[currentIdNo];
//       if (!currentEmployee) return;

//       // সরাসরি ডাউনলাইনে কারা আছে বের করা
//       const children = users.filter(u => u.refIdNo === currentIdNo);
      
//       // প্রথমে চাইল্ডদের হিসাব শেষ করা নিশ্চিত করা (Recursion)
//       children.forEach(child => {
//         rollUpSalesAndPositions(child.idNo);
//       });

//       // চাইল্ডদের ফাইনাল ডাটা অবজেক্ট তৈরি
//       const subNodesSummary = children.map(child => ({
//         idNo: child.idNo,
//         autoPosition: userSalesMap[child.idNo]?.autoPosition || "Sales Representative",
//         sales: userSalesMap[child.idNo]?.totalSalesVolume || 0
//       }));

//       // চাইল্ডদের মোট সেলস প্যারেন্টের 'totalSalesVolume'-এ যোগ করা
//       const teamSalesSum = children.reduce((sum, child) => sum + (userSalesMap[child.idNo]?.totalSalesVolume || 0), 0);
//       currentEmployee.totalSalesVolume += teamSalesSum;

//       // এই এমপ্লয়ির ফাইনাল অটো-পজিশন এবং কমিশন জেনারেট করা
//       const finalResult = autoDeterminePositionAndCommission(currentEmployee.totalSalesVolume, subNodesSummary);
//       currentEmployee.autoPosition = finalResult.autoPosition;
//       currentEmployee.commissionDetails = finalResult;
//     };

//     // রুট নোড (যাদের refIdNo "0" বা খালি) খুঁজে পুরো চেইনে ফাংশনটি ট্রিগার করা
//     users.forEach(user => {
//       if (user.refIdNo === "0" || !user.refIdNo) {
//         rollUpSalesAndPositions(user.idNo);
//       }
//     });

//     // ডিলার সামারি রেসপন্স অবজেক্ট তৈরি
//     const dealerSummary = dealers.map(dlr => {
//       const dlrSales = allSales.filter(s => s.dealer?.toString() === dlr._id.toString());
//       const totalAmount = dlrSales.reduce((sum, s) => sum + (s.grandTotal || 0), 0);
//       return {
//         _id: dlr._id,
//         name: dlr.name,
//         dealerId: dlr.dealerId,
//         totalSales: totalAmount,
//         commission: calculateDealerCommission(totalAmount)
//       };
//     });

//     // এমপ্লয়ি সামারি রেসপন্স অবজেক্ট তৈরি
//     const employeeSummary = users.map(user => {
//       const nodeData = userSalesMap[user.idNo];
//       const comm = nodeData?.commissionDetails || { baseCommission: 0, salesShareBonus: 0, performanceBonus: 0, totalEarned: 0 };
      
//       return {
//         _id: user._id,
//         name: user.name,
//         idNo: user.idNo,
//         role: user.role,
//         position: nodeData?.autoPosition || "Sales Representative",
//         totalSalesAchieved: nodeData?.totalSalesVolume || 0, // নিজের + টিমের টোটাল সেলস
//         ...comm
//       };
//     });

//     res.status(200).json({
//       dealers: dealerSummary.filter(d => d.totalSales > 0),
//       employees: employeeSummary.filter(e => e.totalEarned > 0 || e.totalSalesAchieved >= 25000)
//     });

//   } catch (error) {
//     console.error("Rollup Commission Error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// module.exports = {
//   getCommissionLedger
// };


//---4th Version of Commission Controller with Auto Positioning and Commission Calculation (Final)---//
// This good version will be used in production with proper auto-positioning and commission calculation logic.

// ১. ডিলার কমিশন ক্যালকুলেটর (Rule 8)
// const calculateDealerCommission = (amount) => {
//   if (amount < 50000) return amount * 0.05;
//   return amount * 0.07;
// };

// পজিশন অনুযায়ী ফিক্সড বেস স্ল্যাব রেট ডিক্লেয়ারেশন
// const POSITION_SLABS = {
//   "ED": 0.24,
//   "NSM": 0.23,
//   "SM": 0.22,
//   "SDSM": 0.21,
//   "DSM": 0.20,
//   "RSM": 0.175,
//   "AM": 0.15,
//   "SALES REPRESENTATIVE": 0
// };

// ২. অটোমেটিক পজিশন কোয়ালিফিকেশন ইঞ্জিন
// const autoDeterminePosition = (totalSales, subNodesSummary = []) => {
//   const amQualifiedCount = subNodesSummary.filter(sub => sub.autoPosition === "AM").length;
//   const rsmQualifiedCount = subNodesSummary.filter(sub => sub.autoPosition === "RSM").length;
//   const dsmQualifiedCount = subNodesSummary.filter(sub => sub.autoPosition === "DSM").length;
//   const nsmQualifiedCount = subNodesSummary.filter(sub => sub.autoPosition === "NSM").length;

//   let assignedPosition = "Sales Representative";

//   if (nsmQualifiedCount >= 4 && totalSales >= 1600000) assignedPosition = "ED";
//   else if (dsmQualifiedCount >= 4 && totalSales >= 400000) assignedPosition = "NSM";
//   else if (dsmQualifiedCount >= 3 && totalSales >= 300000) assignedPosition = "SM";
//   else if (dsmQualifiedCount >= 2 && totalSales >= 200000) assignedPosition = "SDSM";
//   else if (rsmQualifiedCount >= 1 && amQualifiedCount >= 2 && totalSales >= 150000) assignedPosition = "DSM";
//   else if (amQualifiedCount >= 4 && totalSales >= 100000) assignedPosition = "RSM";
//   else if (totalSales >= 25000) assignedPosition = "AM";

//   return assignedPosition;
// };

// ৩. বোনাস ও ইনসেনটিভ ক্যালকুলেটর
// const calculateBonuses = (position, totalSales, subNodesSummary = []) => {
//   const amQualifiedCount = subNodesSummary.filter(sub => sub.autoPosition === "AM").length;
//   const rsmQualifiedCount = subNodesSummary.filter(sub => sub.autoPosition === "RSM").length;
//   const dsmQualifiedCount = subNodesSummary.filter(sub => sub.autoPosition === "DSM").length;
//   const nsmQualifiedCount = subNodesSummary.filter(sub => sub.autoPosition === "NSM").length;

//   let salesShare = 0;
//   let bestPerf = 0;
//   const p = position?.toUpperCase();

//   if (p === "RSM" && amQualifiedCount >= 4 && totalSales >= 100000) {
//     salesShare = totalSales * 0.01;
//     bestPerf = totalSales * 0.01;
//   } else if (p === "DSM" && rsmQualifiedCount >= 1 && amQualifiedCount >= 2 && totalSales >= 150000) {
//     salesShare = totalSales * 0.05;
//     bestPerf = totalSales * 0.005;
//   } else if (p === "SDSM" && dsmQualifiedCount >= 2 && totalSales >= 200000) {
//     salesShare = totalSales * 0.01;
//     bestPerf = totalSales * 0.005;
//   } else if (p === "SM" && dsmQualifiedCount >= 3 && totalSales >= 300000) {
//     salesShare = totalSales * 0.005;
//     bestPerf = totalSales * 0.0025;
//   } else if (p === "NSM" && dsmQualifiedCount >= 4 && totalSales >= 400000) {
//     salesShare = totalSales * 0.01;
//     bestPerf = totalSales * 0.0025;
//   } else if (p === "ED" && nsmQualifiedCount >= 4 && totalSales >= 1600000) {
//     salesShare = totalSales * 0.005;
//     bestPerf = totalSales * 0.0025;
//   }

//   return { salesShareBonus: salesShare, performanceBonus: bestPerf };
// };

// ৪. মেইন এপিআই কন্ট্রোলার ফাংশন
// const getCommissionLedger = async (req, res) => {
//   try {
//     const db = mongoose.connection.db;
    
//     let allSales = await db.collection("sales").find({}).toArray();
//     if (!allSales || allSales.length === 0) {
//       allSales = await db.collection("invoices").find({}).toArray();
//     }

//     const dealers = await Dealer.find({}).lean();
//     const users = await User.find({}).lean();

//     const userSalesMap = {};
//     users.forEach(u => {
//       userSalesMap[u.idNo] = { 
//         ...u, 
//         directSales: 0, 
//         totalSalesVolume: 0, 
//         autoPosition: "Sales Representative",
//         baseCommission: 0, // গ্যাপ কমিশন এখানে জমা হবে
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

//     // পাস ১: রিকার্সিভলি সবার পজিশন এবং টোটাল টিম সেলস ভলিউম বের করা (Bottom-Up)
//     const determineHierarchySpecs = (currentIdNo) => {
//       const currentEmployee = userSalesMap[currentIdNo];
//       if (!currentEmployee) return;

//       const children = users.filter(u => u.refIdNo === currentIdNo);
      
//       children.forEach(child => {
//         determineHierarchySpecs(child.idNo);
//       });

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

//     // 💡 পাস ২: ডাইনামিক গ্যাপ কমিশন (Gap Commission) এবং বোনাস ডিস্ট্রিবিউশন ইঞ্জিন
//     // প্রতিটি ডিলারের করা সেলস সরাসরি চেইনের নিচ থেকে উপরে আপলাইন ধরে ট্রাভার্স করবে এবং গ্যাপ রেট অনুযায়ী ভাগ হবে
//     dealers.forEach(dlr => {
//       const dlrSales = allSales.filter(s => s.dealer?.toString() === dlr._id.toString());
//       const totalInvoiceAmount = dlrSales.reduce((sum, s) => sum + (s.grandTotal || 0), 0);
      
//       if (totalInvoiceAmount <= 0 || !dlr.referenceIdNo) return;

//       let currentIdNo = dlr.referenceIdNo;
//       let distributedRateSoFar = 0; // এই ইনভয়েস থেকে ইতিমধ্যে কত পার্সেন্ট ভাগ হয়েছে

//       // চেইনের নিচ থেকে একদম টপ বস পর্যন্ত লুপ চলবে
//       while (currentIdNo && currentIdNo !== "0") {
//         const empNode = userSalesMap[currentIdNo];
//         if (!empNode) break;

//         const myPositionRate = POSITION_SLABS[empNode.autoPosition?.toUpperCase()] || 0;

//         // যদি বসের স্ল্যাব রেট নিচের স্তরের অলরেডি ডিস্ট্রিবিউটেড রেটের চেয়ে বেশি হয়, তবে সে গ্যাপ পাবে
//         if (myPositionRate > distributedRateSoFar) {
//           const gapRate = myPositionRate - distributedRateSoFar;
//           const gapCommissionAmount = totalInvoiceAmount * gapRate;
          
//           empNode.baseCommission += gapCommissionAmount;
          
//           // রেট আপডেট করা হলো যেন তার উপরের বস এই বসের রেটের ওপর গ্যাপ হিসাব পায়
//           distributedRateSoFar = myPositionRate; 
//         }

//         // চেইনের এক ধাপ উপরে (Upline) যাওয়া
//         currentIdNo = empNode.refIdNo; 
//       }
//     });

//     // পাস ৩: বোনাসসমূহ ক্যালকুলেট করা এবং ফাইনাল অবজেক্ট তৈরি
//     const employeeSummary = users.map(user => {
//       const nodeData = userSalesMap[user.idNo];
//       const children = users.filter(u => u.refIdNo === user.idNo).map(sub => ({
//         idNo: sub.idNo,
//         autoPosition: userSalesMap[sub.idNo]?.autoPosition || "Sales Representative"
//       }));

//       // বোনাস ক্যালকুলেট করা
//       const bonuses = calculateBonuses(nodeData.autoPosition, nodeData.totalSalesVolume, children);
//       const totalEarned = (nodeData.baseCommission || 0) + bonuses.salesShareBonus + bonuses.performanceBonus;

//       return {
//         _id: user._id,
//         name: user.name,
//         idNo: user.idNo,
//         role: user.role,
//         position: nodeData.autoPosition,
//         totalSalesAchieved: nodeData.totalSalesVolume,
//         baseCommission: Math.round(nodeData.baseCommission),
//         salesShareBonus: Math.round(bonuses.salesShareBonus),
//         performanceBonus: Math.round(bonuses.performanceBonus),
//         totalEarned: Math.round(totalEarned)
//       };
//     });

//     // ডিলারদের রিটার্ন অবজেক্ট
//     const dealerSummary = dealers.map(dlr => {
//       const dlrSales = allSales.filter(s => s.dealer?.toString() === dlr._id.toString());
//       const totalAmount = dlrSales.reduce((sum, s) => sum + (s.grandTotal || 0), 0);
//       return {
//         _id: dlr._id,
//         name: dlr.name,
//         dealerId: dlr.dealerId,
//         totalSales: totalAmount,
//         commission: calculateDealerCommission(totalAmount)
//       };
//     });

//     res.status(200).json({
//       dealers: dealerSummary.filter(d => d.totalSales > 0),
//       employees: employeeSummary.filter(e => e.totalEarned > 0 || e.totalSalesAchieved >= 25000)
//     });



//   } catch (error) {
//     console.error("Advanced Gap Commission Engine Error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// module.exports = {
//   getCommissionLedger
// };

//---5th Version of Commission Controller with Auto Positioning and Commission Calculation (Final)---//

// ১. ডিলার কমিশন ক্যালকুলেটর (Rule 8)
const calculateDealerCommission = (amount) => {
  if (amount < 50000) return amount * 0.05; // 50k এর নিচে 5%
  return amount * 0.07; // 50k এর উপরে 7%
};

// পজিশন অনুযায়ী ফিক্সড বেস স্ল্যাব রেট (টোটাল ২৪% এর ভাগ)
const POSITION_SLABS = {
  "ED": 0.24,
  "NSM": 0.23,
  "SM": 0.22,
  "SDSM": 0.21,
  "DSM": 0.20,
  "RSM": 0.175,
  "AM": 0.15,
  "SALES REPRESENTATIVE": 0
};

// ২. অটোমেটিক পজিশন কোয়ালিফিকেশন ইঞ্জিন (Top to Bottom সিকোয়েন্স)
const autoDeterminePosition = (totalSales, subNodesSummary = []) => {
  const amCount = subNodesSummary.filter(sub => sub.autoPosition === "AM").length;
  const rsmCount = subNodesSummary.filter(sub => sub.autoPosition === "RSM").length;
  const dsmCount = subNodesSummary.filter(sub => sub.autoPosition === "DSM").length;
  const nsmCount = subNodesSummary.filter(sub => sub.autoPosition === "NSM").length;

  if (totalSales >= 1600000 && nsmCount >= 4) return "ED";
  if (totalSales >= 400000 && dsmCount >= 4) return "NSM";
  if (totalSales >= 300000 && dsmCount >= 3) return "SM";
  if (totalSales >= 200000 && dsmCount >= 2) return "SDSM";
  if (totalSales >= 150000 && rsmCount >= 1 && amCount >= 2) return "DSM";
  if (totalSales >= 100000 && amCount >= 4) return "RSM";
  if (totalSales >= 25000) return "AM";

  return "Sales Representative";
};

// ৩. বোনাস ও ইনসেনটিভ ক্যালকুলেটর
const calculateBonuses = (position, totalSales, subNodesSummary = []) => {
  const amCount = subNodesSummary.filter(sub => sub.autoPosition === "AM").length;
  const rsmCount = subNodesSummary.filter(sub => sub.autoPosition === "RSM").length;
  const dsmCount = subNodesSummary.filter(sub => sub.autoPosition === "DSM").length;
  const nsmCount = subNodesSummary.filter(sub => sub.autoPosition === "NSM").length;

  let salesShare = 0;
  let bestPerf = 0;
  const p = position?.toUpperCase();

  if (p === "RSM" && amCount >= 4 && totalSales >= 100000) {
    salesShare = totalSales * 0.01;
    bestPerf = totalSales * 0.01;
  } else if (p === "DSM" && rsmCount >= 1 && amCount >= 2 && totalSales >= 150000) {
    salesShare = totalSales * 0.05;
    bestPerf = totalSales * 0.005;
  } else if (p === "SDSM" && dsmCount >= 2 && totalSales >= 200000) {
    salesShare = totalSales * 0.01;
    bestPerf = totalSales * 0.005;
  } else if (p === "SM" && dsmCount >= 3 && totalSales >= 300000) {
    salesShare = totalSales * 0.005;
    bestPerf = totalSales * 0.0025;
  } else if (p === "NSM" && dsmCount >= 4 && totalSales >= 400000) {
    salesShare = totalSales * 0.01;
    bestPerf = totalSales * 0.0025;
  } else if (p === "ED" && nsmCount >= 4 && totalSales >= 1600000) {
    salesShare = totalSales * 0.005;
    bestPerf = totalSales * 0.0025;
  }

  return { salesShareBonus: salesShare, performanceBonus: bestPerf };
};

// ৪. মেইন এপিআই কন্ট্রোলার ফাংশন
const getCommissionLedger = async (req, res) => {
  try {
    const db = mongoose.connection.db;
    
    let allSales = await db.collection("sales").find({}).toArray();
    if (!allSales || allSales.length === 0) {
      allSales = await db.collection("invoices").find({}).toArray();
    }

    const dealers = await db.collection("dealers").find({}).toArray();
    const users = await db.collection("users").find({ idNo: { $regex: /^MKT/i } }).toArray();

    const userSalesMap = {};
    users.forEach(u => {
      userSalesMap[u.idNo] = { 
        ...u, 
        directSales: 0, 
        totalSalesVolume: 0, 
        autoPosition: "Sales Representative",
        baseCommission: 0,
        salesShareBonus: 0,
        performanceBonus: 0
      };
    });

    // ডিলার সেলস ডিস্ট্রিবিউশন
    dealers.forEach(dlr => {
      const dlrSales = allSales.filter(s => s.dealer?.toString() === dlr._id.toString());
      const totalAmount = dlrSales.reduce((sum, s) => sum + (s.grandTotal || 0), 0);
      
      if (dlr.referenceIdNo && userSalesMap[dlr.referenceIdNo]) {
        userSalesMap[dlr.referenceIdNo].directSales += totalAmount;
        userSalesMap[dlr.referenceIdNo].totalSalesVolume += totalAmount;
      }
    });

    // পাস ১: নিচ থেকে উপরে সবার পজিশন এবং টোটাল টিম সেলস ভলিউম বের করা (Bottom-Up)
    const determineHierarchySpecs = (currentIdNo) => {
      const currentEmployee = userSalesMap[currentIdNo];
      if (!currentEmployee) return;

      const children = users.filter(u => u.refIdNo === currentIdNo);
      children.forEach(child => determineHierarchySpecs(child.idNo));

      const subNodesSummary = children.map(child => ({
        idNo: child.idNo,
        autoPosition: userSalesMap[child.idNo]?.autoPosition || "Sales Representative"
      }));

      const teamSalesSum = children.reduce((sum, child) => sum + (userSalesMap[child.idNo]?.totalSalesVolume || 0), 0);
      currentEmployee.totalSalesVolume += teamSalesSum;
      currentEmployee.autoPosition = autoDeterminePosition(currentEmployee.totalSalesVolume, subNodesSummary);
    };

    users.forEach(user => {
      if (user.refIdNo === "0" || !user.refIdNo) {
        determineHierarchySpecs(user.idNo);
      }
    });

    // পাস ২: ডাইনামিক গ্যাপ কমিশন (Gap Commission Engine)
    dealers.forEach(dlr => {
      const dlrSales = allSales.filter(s => s.dealer?.toString() === dlr._id.toString());
      const totalInvoiceAmount = dlrSales.reduce((sum, s) => sum + (s.grandTotal || 0), 0);
      
      if (totalInvoiceAmount <= 0 || !dlr.referenceIdNo) return;

      let currentIdNo = dlr.referenceIdNo;
      let distributedRateSoFar = 0;

      while (currentIdNo && currentIdNo !== "0") {
        const empNode = userSalesMap[currentIdNo];
        if (!empNode) break;

        const myPositionRate = POSITION_SLABS[empNode.autoPosition?.toUpperCase()] || 0;

        if (myPositionRate > distributedRateSoFar) {
          const gapRate = myPositionRate - distributedRateSoFar;
          const gapCommissionAmount = totalInvoiceAmount * gapRate;
          
          empNode.baseCommission += gapCommissionAmount;
          distributedRateSoFar = myPositionRate; 
        }
        currentIdNo = empNode.refIdNo; 
      }
    });

    // পাস ৩: বোনাসসমূহ ক্যালকুলেট করা এবং কোয়ালিফাইড লিস্ট ফিল্টারিং
    const qualifiedEmployees = [];
    users.forEach(user => {
      const nodeData = userSalesMap[user.idNo];
      const children = users.filter(u => u.refIdNo === user.idNo).map(sub => ({
        idNo: sub.idNo,
        autoPosition: userSalesMap[sub.idNo]?.autoPosition || "Sales Representative"
      }));

      const bonuses = calculateBonuses(nodeData.autoPosition, nodeData.totalSalesVolume, children);
      const totalEarned = (nodeData.baseCommission || 0) + bonuses.salesShareBonus + bonuses.performanceBonus;

      if (totalEarned > 0 || nodeData.totalSalesVolume >= 25000) {
        qualifiedEmployees.push({
          _id: user._id.toString(),
          name: user.name,
          idNo: user.idNo,
          role: user.role,
          position: nodeData.autoPosition,
          totalSalesAchieved: nodeData.totalSalesVolume,
          baseCommission: Math.round(nodeData.baseCommission),
          salesShareBonus: Math.round(bonuses.salesShareBonus),
          performanceBonus: Math.round(bonuses.performanceBonus),
          totalEarned: Math.round(totalEarned)
        });
      }
    });

    const qualifiedDealers = dealers.map(dlr => {
      const dlrSales = allSales.filter(s => s.dealer?.toString() === dlr._id.toString());
      const totalAmount = dlrSales.reduce((sum, s) => sum + (s.grandTotal || 0), 0);
      return {
        _id: dlr._id.toString(),
        name: dlr.name,
        dealerId: dlr.dealerId,
        totalSales: totalAmount,
        commission: calculateDealerCommission(totalAmount)
      };
    }).filter(d => d.totalSales > 0);

    // গ্র্যান্ড পে-আউট সামারি টোটাল কাউন্ট হিসাব
    const totalEmployeePayout = qualifiedEmployees.reduce((sum, e) => sum + e.totalEarned, 0);
    const totalDealerPayout = qualifiedDealers.reduce((sum, d) => sum + d.commission, 0);
    const grandPayoutTotal = totalEmployeePayout + totalDealerPayout;

    res.status(200).json({
      summary: {
        totalEmployeePayout: Math.round(totalEmployeePayout),
        totalDealerPayout: Math.round(totalDealerPayout),
        grandPayoutTotal: Math.round(grandPayoutTotal)
      },
      dealers: qualifiedDealers,
      employees: qualifiedEmployees
    });

  } catch (error) {
    console.error("Advanced Gap Commission Engine Error:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCommissionLedger
};
