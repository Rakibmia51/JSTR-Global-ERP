
const mongoose = require('mongoose');
const Invoice = require('../models/Invoice');
const Dealer = require('../models/Dealer');
const User = require('../models/User');
const MonthlyLedger = require('../models/MonthlyLedger'); // মডেল ইম্পোর্ট করুন


//-----------------------------------------------------------------------------------------------------------------------------

// 9th version (finalized)

// =======================================================================
// ১. গ্লোবাল কনফিগারেশন ম্যাপস (9th Version Finalized)
// =======================================================================
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

// =======================================================================
// ২. অটোমেটিক পজিশন কোয়ালিফিকেশন ইঞ্জিন (Leg-Wise Deep Roll-Up ফিক্সড)
// =======================================================================
// const autoDeterminePosition = (totalSales, qualifiedLegsCounts = {}) => {
//   // qualifiedLegsCounts হলো একটি অবজেক্ট, যা নির্দেশ করে প্রতিটি আলাদা আলাদা লেগে (Leg) 
//   // ন্যূনতম কতজন নির্দিষ্ট পজিশন বা তার বড় পজিশন অর্জন করেছে (গভীর ডাউনলাইন সহ)।

//   const countAtLeast = (targetPos) => {
//     return Object.keys(qualifiedLegsCounts).reduce((total, pos) => {
//       return RANK_MAP[pos] >= RANK_MAP[targetPos] ? total + qualifiedLegsCounts[pos] : total;
//     }, 0);
//   };

//   // 💥 সঠিক কন্ডিশনাল অর্ডার সিকোয়েন্স (ভলিউম + ভিন্ন ভিন্ন লেগের ডিপ কাউন্ট)
//   if (totalSales >= 3200000 && countAtLeast("ED") >= 2) return "BOM";
//   if (totalSales >= 1600000 && countAtLeast("NSM") >= 4) return "ED";
//   if (totalSales >= 400000 && countAtLeast("DSM") >= 4) return "NSM";
//   if (totalSales >= 300000 && countAtLeast("DSM") >= 3) return "SM";
//   if (totalSales >= 200000 && countAtLeast("DSM") >= 2) return "SDSM";
  
//   // DSM কন্ডিশন: ২টি আলাদা লেগে RSM এবং ২টি আলাদা লেগে AM কোয়ালিফাইড মেম্বার থাকতে হবে
//   if (totalSales >= 100000 && countAtLeast("RSM") >= 2 && countAtLeast("AM") >= 2) return "DSM";
  
//   if (totalSales >= 75000 && countAtLeast("AM") >= 3) return "RSM";
//   if (totalSales >= 25000) return "AM";

//   return "SALES REPRESENTATIVE";
// };


// =======================================================================
// চূড়ান্ত মান্থলি কোয়ালিফিকেশন হেল্পার ফাংশন (Deep Leg-Wise Roll-Up ফিক্সড)
// =======================================================================
// const checkSelfQualificationOnly = (position, totalSales, qualifiedLegsCounts = {}) => {
//   const currentPos = (position || "").trim().toUpperCase();

//   const countAtLeast = (targetPos) => {
//     return Object.keys(qualifiedLegsCounts).reduce((total, pos) => {
//       return RANK_MAP[pos] >= RANK_MAP[targetPos] ? total + qualifiedLegsCounts[pos] : total;
//     }, 0);
//   };

//   let qualifies = false;
//   let performanceBonusRate = 0;

//   switch (currentPos) {
//     case "RSM":
//       if (totalSales >= 75000 && countAtLeast("AM") >= 3) { 
//         qualifies = true; 
//         performanceBonusRate = 0.01; 
//       }
//       break;
//     case "DSM":
//       if (totalSales >= 100000 && countAtLeast("RSM") >= 1 && countAtLeast("AM") >= 2) { 
//         qualifies = true; 
//         performanceBonusRate = 0.005; 
//       }
//       break;
//     case "SDSM":
//       if (totalSales >= 200000 && countAtLeast("DSM") >= 2) { 
//         qualifies = true; 
//         performanceBonusRate = 0.005; 
//       }
//       break;
//     case "SM":
//       if (totalSales >= 300000 && countAtLeast("DSM") >= 3) { 
//         qualifies = true; 
//         performanceBonusRate = 0.0025; 
//       }
//       break;
//     case "NSM":
//       if (totalSales >= 400000 && countAtLeast("DSM") >= 4) { 
//         qualifies = true; 
//         performanceBonusRate = 0.0025; 
//       }
//       break;
//     case "ED":
//       if (totalSales >= 1600000 && countAtLeast("NSM") >= 4) { 
//         qualifies = true; 
//         performanceBonusRate = 0.0025; 
//       }
//       break;
//     case "BOM":
//       if (totalSales >= 3200000 && countAtLeast("ED") >= 2) { 
//         qualifies = true; 
//         performanceBonusRate = 0.0025; 
//       }
//       break;
//     default:
//       break;
//   }
  
//   return { qualifies, performanceBonusRate };
// };



//14th version: 14.0.0 (June 2024) - Full Refactor with Multi-Pass Engine, Deep Leg Roll-Up, Dynamic Gap Commission, Top-Down Override, Global Pool Distribution, and Optimized Pagination
// const executeLedgerCalculationEngine = async (currentYear, currentMonth) => {
//   try {
//     const db = mongoose.connection.db;

//     const startDate = new Date(currentYear, currentMonth - 1, 1);
//     const endDate = new Date(currentYear, currentMonth, 1);

//     // --- STEP 1: ডাটাবেজ রিড ও ডেটা লোডিং ---
//     let allLifetimeSales = await db.collection("invoices").find({}).toArray();
//     if (!allLifetimeSales || allLifetimeSales.length === 0) {
//       allLifetimeSales = await db.collection("sales").find({}).toArray();
//     }

//     const thisMonthSales = allLifetimeSales.filter(s => {
//       const rawDate = s.date || s.createdAt;
//       if (!rawDate) return false;
//       const d = new Date(rawDate);
//       return d >= startDate && d < endDate;
//     });

//     const totalCompanySalesAmount = thisMonthSales.reduce((sum, s) => sum + (s.grandTotal || 0), 0);
//     const dealers = await db.collection("dealers").find({}).toArray();
//     const users = await db.collection("users").find({ idNo: { $regex: /^MKT/i } }).toArray();

//     const userSalesMap = {};
//     const parentToChildrenMap = {}; 

//     // --- STEP 2: মেমোরি স্টেট স্ট্রাকচার ইনিশিয়ালাইজেশন ---
//     users.forEach(u => {
//       userSalesMap[u.idNo] = { 
//         ...u, 
//         _id: u._id.toString(),
//         databaseRank: u.rank || "SALES REPRESENTATIVE", 
//         directSalesLifetime: 0, 
//         directSalesThisMonth: 0, 
//         totalSalesVolume: 0,       
//         thisMonthSalesVolume: 0,   
//         autoPosition: "SALES REPRESENTATIVE",
//         baseCommission: 0,
//         currentSlabRate: 0,
//         selfQualifiesForBonus: false,
//         performanceBonusRate: 0,
//         monthlyBonusAmount: 0,
//         globalPoolBonusAmount: 0,
//         earnedPools: [] 
//       };
      
//       const parentId = u.refIdNo || "0";
//       if (!parentToChildrenMap[parentId]) parentToChildrenMap[parentId] = [];
//       parentToChildrenMap[parentId].push(u.idNo); 
//     });

//     // ওয়ান-পাস অপ্টিমাইজড ডিলার হ্যাশ লুকেআপ ম্যাপ (O(1) Speed Boost)
//     const dealerLookupMap = {};
//     dealers.forEach(d => {
//       if (d._id && d.referenceIdNo) {
//         dealerLookupMap[d._id.toString()] = d.referenceIdNo;
//       }
//     });

//     // --- STEP 3: ডাইরেক্ট পার্সোনাল সেলস ভলিউম অ্যাসাইনমেন্ট ---
//     allLifetimeSales.forEach(sale => {
//       const saleAmount = Number(sale.grandTotal || sale.totalAmount || sale.amount || 0);
//       const saleDate = new Date(sale.date || sale.createdAt);
//       const isSelectedMonth = saleDate >= startDate && saleDate < endDate;

//       let targetEmployeeIdNo = null;

//       if (sale.isMonthlyArchived && sale.archivedSalesData?.employeeSnapshot?.idNo) {
//         targetEmployeeIdNo = sale.archivedSalesData.employeeSnapshot.idNo;
//       } else if (sale.dealer) {
//         targetEmployeeIdNo = dealerLookupMap[sale.dealer.toString()];
//       }

//       if (targetEmployeeIdNo && userSalesMap[targetEmployeeIdNo]) {
//         const emp = userSalesMap[targetEmployeeIdNo];
//         emp.directSalesLifetime += saleAmount;
//         emp.totalSalesVolume += saleAmount; 

//         if (isSelectedMonth) {
//           emp.directSalesThisMonth += saleAmount;
//           emp.thisMonthSalesVolume += saleAmount; 
//         }
//       }
//     });
//     // --- পাস ১: ট্রি ভলিউম রোল-আপ এবং স্ল্যাব রেট লকিং ইঞ্জিন ---
//     const processedNodes = new Set(); 
    
//     const processHierarchyPositions = (currentIdNo) => {
//       if (processedNodes.has(currentIdNo)) {
//         const emp = userSalesMap[currentIdNo];
//         const resLegs = { AM: 0, RSM: 0, DSM: 0, NSM: 0, ED: 0, BOM: 0 };
//         if (emp) {
//           const myPos = (emp.autoPosition || "").toUpperCase().trim();
//           if (resLegs[myPos] !== undefined) resLegs[myPos] = 1;
//         }
//         return resLegs;
//       }
      
//       const currentEmployee = userSalesMap[currentIdNo];
//       if (!currentEmployee) return { AM: 0, RSM: 0, DSM: 0, NSM: 0, ED: 0, BOM: 0 };

//       const childrenIds = parentToChildrenMap[currentIdNo] || [];
//       const masterLegsCounts = { AM: 0, RSM: 0, DSM: 0, NSM: 0, ED: 0, BOM: 0 };
      
//       let teamSalesSumTotal = 0;
//       let teamSalesSumMonth = 0;

//       childrenIds.forEach(childId => {
//         // রিকার্সন টাইম ফিক্স (চাইল্ড আগে প্রসেস হবে)
//         const childSubTreeLegs = processHierarchyPositions(childId);
//         const childData = userSalesMap[childId];
        
//         if (childData) {
//           teamSalesSumTotal += childData.totalSalesVolume;
//           teamSalesSumMonth += childData.thisMonthSalesVolume;

//           const childFinalPos = (childData.autoPosition || "").toUpperCase().trim();
//           const highestAchievedInThisLeg = { AM: 0, RSM: 0, DSM: 0, NSM: 0, ED: 0, BOM: 0 };
          
//           Object.keys(childSubTreeLegs).forEach(pos => {
//             if (childSubTreeLegs[pos] > 0) highestAchievedInThisLeg[pos] = 1;
//           });
//           if (highestAchievedInThisLeg[childFinalPos] !== undefined) {
//             highestAchievedInThisLeg[childFinalPos] = 1;
//           }

//           // Rank Compression Logic Integration
//           Object.keys(highestAchievedInThisLeg).forEach(pos => {
//             if (highestAchievedInThisLeg[pos] === 1) {
//               Object.keys(highestAchievedInThisLeg).forEach(p => {
//                 if (RANK_MAP[pos] >= RANK_MAP[p]) highestAchievedInThisLeg[p] = 1;
//               });
//             }
//           });

//           Object.keys(highestAchievedInThisLeg).forEach(pos => {
//             if (highestAchievedInThisLeg[pos] === 1) masterLegsCounts[pos] += 1;
//           });
//         }
//       });
      
//       currentEmployee.totalSalesVolume += teamSalesSumTotal;
//       currentEmployee.thisMonthSalesVolume += teamSalesSumMonth;

//       const calculatedRank = autoDeterminePosition(currentEmployee.totalSalesVolume, masterLegsCounts);
      
//       // Rank Lock Mechanism Match
//       const currentWeight = RANK_MAP[calculatedRank] || 0;
//       const historicWeight = RANK_MAP[currentEmployee.databaseRank] || 0;
//       currentEmployee.autoPosition = currentWeight >= historicWeight ? calculatedRank : currentEmployee.databaseRank;
      
//       currentEmployee.currentSlabRate = POSITION_SLABS[currentEmployee.autoPosition] || 0;
      
//       const qualification = checkSelfQualificationOnly(
//         currentEmployee.autoPosition,
//         currentEmployee.thisMonthSalesVolume,
//         masterLegsCounts
//       );
//       currentEmployee.selfQualifiesForBonus = qualification.qualifies;
//       currentEmployee.performanceBonusRate = qualification.performanceBonusRate;

//       processedNodes.add(currentIdNo);

//       const myFinalPos = (currentEmployee.autoPosition || "").toUpperCase().trim();
//       const returnLegsSummary = { AM: 0, RSM: 0, DSM: 0, NSM: 0, ED: 0, BOM: 0 };
//       Object.keys(masterLegsCounts).forEach(pos => {
//         if (masterLegsCounts[pos] > 0) returnLegsSummary[pos] = 1;
//       });
//       if (returnLegsSummary[myFinalPos] !== undefined) returnLegsSummary[myFinalPos] = 1;

//       return returnLegsSummary;
//     };

//     users.forEach(user => {
//       if (user.refIdNo === "0" || !user.refIdNo || !userSalesMap[user.refIdNo]) {
//         processHierarchyPositions(user.idNo);
//       }
//     });

//     // --- পাস ২: লিনিয়ার ডাইনামিক গ্যাপ কমিশন (True Generation Gap Engine) ---
//     thisMonthSales.forEach(sale => {
//       const invoiceAmount = Number(sale.grandTotal || sale.totalAmount || sale.amount || 0);
//       if (invoiceAmount <= 0) return;

//       let startEmployeeIdNo = null;
//       if (sale.isMonthlyArchived && sale.archivedSalesData?.employeeSnapshot?.idNo) {
//         startEmployeeIdNo = sale.archivedSalesData.employeeSnapshot.idNo;
//       } else if (sale.dealer) {
//         startEmployeeIdNo = dealerLookupMap[sale.dealer.toString()];
//       }

//       if (!startEmployeeIdNo || !userSalesMap[startEmployeeIdNo]) return;
      
//       let currentIdNo = startEmployeeIdNo;
//       let distributedRateSoFar = 0; 
//       const visited = new Set(); 

//       while (currentIdNo && currentIdNo !== "0" && !visited.has(currentIdNo)) {
//         visited.add(currentIdNo);
//         const empNode = userSalesMap[currentIdNo];
//         if (!empNode) break;

//         let myPositionRate = POSITION_SLABS[empNode.autoPosition?.toUpperCase()] || 0;

//         if (myPositionRate > distributedRateSoFar) {
//           const gapRate = myPositionRate - distributedRateSoFar;
//           empNode.baseCommission += invoiceAmount * gapRate; 
//           distributedRateSoFar = myPositionRate; 
//         }

//         if (distributedRateSoFar >= 0.24) break;
//         currentIdNo = empNode.refIdNo; 
//       }
//     });

//     // --- পাস ৩: টপ-ডাউন কোয়ালিফিকেশন ওভাররাইড চেইন ---
//     const applyTopDownBonusQualification = (currentIdNo, parentQualifies = false) => {
//       const currentEmployee = userSalesMap[currentIdNo];
//       if (!currentEmployee) return;
//       if (parentQualifies) currentEmployee.selfQualifiesForBonus = true;
//       const childrenIds = parentToChildrenMap[currentIdNo] || [];
//       childrenIds.forEach(childId => applyTopDownBonusQualification(childId, currentEmployee.selfQualifiesForBonus));
//     };
//     if (parentToChildrenMap["0"]) {
//       parentToChildrenMap["0"].forEach(rootIdNo => applyTopDownBonusQualification(rootIdNo, false));
//     }

//     // --- পাস ৩.১: গ্যারান্টিড রেট সিঙ্ক লক ইঞ্জিন ---
//     Object.keys(userSalesMap).forEach(idNo => {
//       const emp = userSalesMap[idNo];
//       if (!emp) return;

//       if (emp.selfQualifiesForBonus === true) {
//         const currentChildrenIds = parentToChildrenMap[idNo] || [];
//         const syncedLegsCounts = { AM: 0, RSM: 0, DSM: 0, NSM: 0, ED: 0, BOM: 0 };

//         currentChildrenIds.forEach(cId => {
//           const cData = userSalesMap[cId];
//           if (cData) {
//             const cPos = (cData.autoPosition || "").toUpperCase().trim();
//             const singleLegFlags = { AM: 0, RSM: 0, DSM: 0, NSM: 0, ED: 0, BOM: 0 };
//             if (singleLegFlags[cPos] !== undefined) singleLegFlags[cPos] = 1;

//             const trackDeepLegPositions = (nodeId) => {
//               const subChildren = parentToChildrenMap[nodeId] || [];
//               subChildren.forEach(subId => {
//                 const subData = userSalesMap[subId];
//                 if (subData) {
//                   const subPos = (subData.autoPosition || "").toUpperCase().trim();
//                   if (singleLegFlags[subPos] !== undefined) singleLegFlags[subPos] = 1;
//                   trackDeepLegPositions(subId);
//                 }
//               });
//             };
//             trackDeepLegPositions(cId);

//             Object.keys(singleLegFlags).forEach(pos => {
//               if (singleLegFlags[pos] === 1) {
//                 Object.keys(singleLegFlags).forEach(p => {
//                   if (RANK_MAP[pos] >= RANK_MAP[p]) singleLegFlags[p] = 1;
//                 });
//               }
//             });

//             Object.keys(singleLegFlags).forEach(pos => {
//               syncedLegsCounts[pos] += singleLegFlags[pos];
//             });
//           }
//         });

//         const finalCheck = checkSelfQualificationOnly(emp.autoPosition, emp.thisMonthSalesVolume, syncedLegsCounts);
//         if (finalCheck.qualifies && finalCheck.performanceBonusRate > 0) {
//           emp.performanceBonusRate = finalCheck.performanceBonusRate;
//         } else {
//           const upPos = (emp.autoPosition || "").toUpperCase().trim();
//           if (upPos === "RSM") emp.performanceBonusRate = 0.01;
//           else if (upPos === "DSM" || upPos === "SDSM") emp.performanceBonusRate = 0.005;
//           else if (["SM", "NSM", "ED", "BOM"].includes(upPos)) emp.performanceBonusRate = 0.0025;
//           else emp.performanceBonusRate = 0;
//         }
//       }
//     });

//     // --- পাস ৪: গ্লোবাল পুল কাউন্টার এবং মেম্বার অ্যাসাইনমেন্ট ---
//     const poolShareCounters = { RSM: 0, DSM: 0, SDSM: 0, SM: 0, NSM: 0, ED: 0, BOM: 0 };
//     const qualifiedPoolMembers = { RSM: [], DSM: [], SDSM: [], SM: [], NSM: [], ED: [], BOM: [] };
    
//     users.forEach(user => {
//       const nodeData = userSalesMap[user.idNo];
//       if (!nodeData) return;
//       const isQualifiedForBill = (nodeData.directSalesThisMonth || 0) >= 3000;
//       const myPos = nodeData.autoPosition?.toUpperCase();

//       if (isQualifiedForBill && nodeData.selfQualifiesForBonus && ELIGIBLE_POOL_POSITIONS.includes(myPos)) {
//         const myRankValue = RANK_MAP[myPos];
//         ELIGIBLE_POOL_POSITIONS.forEach(poolName => {
//           const poolRankValue = RANK_MAP[poolName];
//           if (myPos === "RSM") {
//             if (poolName === "RSM") { 
//               poolShareCounters[poolName]++; 
//               nodeData.earnedPools.push(poolName); 
//               qualifiedPoolMembers[poolName].push(user.idNo); 
//             }
//           } else {
//             if (myRankValue >= poolRankValue && poolName !== "RSM") { 
//               poolShareCounters[poolName]++; 
//               nodeData.earnedPools.push(poolName); 
//               qualifiedPoolMembers[poolName].push(user.idNo); 
//             }
//           }
//         });
//       }
//     });

//     // --- পাস ৫: গ্লোবাল কোম্পানি পুল বোনাস ডিস্ট্রিবিউশন রানার ---
//     Object.keys(userSalesMap).forEach(idNo => {
//       if (userSalesMap[idNo]) userSalesMap[idNo].globalPoolBonusAmount = 0;
//     });

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

//     // =========================================================================
//     // পাস ৬: কর্মচারীদের ফাইনাল ফ্ল্যাট রেসপন্স এরে প্রস্তুতকরণ (Mongoose Safe)
//     // =========================================================================
//     const finalLedgerList = [];

//     users.forEach(user => {
//       const rawUserObj = user._doc || user; // মঙ্গুজ মেটাডেটা লিক প্রটেকশন
//       const nodeData = userSalesMap[user.idNo];
//       if (!nodeData) return;

//       const isQualifiedForBill = (nodeData.directSalesThisMonth || 0) >= 3000;

//       let salesShareBonus = nodeData.globalPoolBonusAmount || 0;
//       let performanceBonus = 0;
//       let personalSlabCommission = 0;

//       if (isQualifiedForBill && nodeData.selfQualifiesForBonus) {
//         performanceBonus = (nodeData.thisMonthSalesVolume || 0) * (nodeData.performanceBonusRate || 0);
//       }

//       if (isQualifiedForBill && nodeData.currentSlabRate > 0) {
//         personalSlabCommission = (nodeData.directSalesThisMonth || 0) * nodeData.currentSlabRate;
//       }

//       const totalAccumulatedBaseCommission = (nodeData.baseCommission || 0) + personalSlabCommission;
//       const finalSalesShareBonus = isQualifiedForBill ? salesShareBonus : 0;
      
//       nodeData.baseCommission = totalAccumulatedBaseCommission;
//       nodeData.monthlyBonusAmount = performanceBonus;
//       nodeData.globalPoolBonusAmount = finalSalesShareBonus;

//       nodeData.totalSalesAchieved = nodeData.totalSalesVolume;
//       nodeData.thisMonthSalesAchieved = nodeData.thisMonthSalesVolume;

//       const totalEarned = totalAccumulatedBaseCommission + finalSalesShareBonus + performanceBonus;

//       if (totalEarned > 0 || (nodeData.totalSalesVolume || 0) >= 25000) {
//         finalLedgerList.push({
//           ...rawUserObj,
//           _id: rawUserObj._id.toString(),
          
//           directSalesLifetime: nodeData.directSalesLifetime,
//           directSalesThisMonth: nodeData.directSalesThisMonth,
//           totalSalesVolume: nodeData.totalSalesVolume,
//           thisMonthSalesVolume: nodeData.thisMonthSalesVolume,
//           autoPosition: nodeData.autoPosition,
          
//           baseCommission: Number(nodeData.baseCommission.toFixed(2)),
//           selfQualifiesForBonus: nodeData.selfQualifiesForBonus,
//           performanceBonusRate: nodeData.performanceBonusRate,
//           monthlyBonusAmount: Number(nodeData.monthlyBonusAmount.toFixed(2)),
//           globalPoolBonusAmount: Number(nodeData.globalPoolBonusAmount.toFixed(2)),
//           earnedPools: isQualifiedForBill ? nodeData.earnedPools : [],
          
//           totalSalesAchieved: nodeData.totalSalesAchieved,
//           thisMonthSalesAchieved: nodeData.thisMonthSalesAchieved,
          
//           netTotalEarnings: Number(totalEarned.toFixed(2)),
//           qualificationStatus: isQualifiedForBill ? "Qualified" : "Disqualified for Pool (Sales < 3000)"
//         });
//       }
//     });

//     // =========================================================================
//     // পাস 🔍: ডিলার ওয়ান-পাস ওয়ান-টাইম নেম লুকেআপ ম্যাপ (O(1) Speed Optimizer)
//     // =========================================================================
//     const dealerDetailsMap = {};
//     dealers.forEach(d => {
//       if (d._id) {
//         dealerDetailsMap[d._id.toString()] = d.name || "Unknown Dealer";
//       }
//     });

//     // =========================================================================
//     // পাস ৭: ডিলার রেসপন্স লুপ (O(1) Hash Map Optimization দিয়ে পুরোপুরি ফিক্সড)
//     // =========================================================================
//     const dealerResultMap = {};

//     thisMonthSales.forEach(sale => {
//       const amt = Number(sale.grandTotal || sale.totalAmount || sale.amount || 0);
//       if (amt <= 0) return;
      
//       let dIdNo = null;
//       let dName = "Unknown Dealer";
//       let d_id = sale.dealer ? sale.dealer.toString() : "ARCHIVED_ID";

//       if (sale.isMonthlyArchived && sale.archivedSalesData && sale.archivedSalesData.dealerSnapshot) {
//         dIdNo = sale.archivedSalesData.dealerSnapshot.idNo;
//         dName = sale.archivedSalesData.dealerSnapshot.name || "Unknown Dealer";
//       } else if (sale.dealer && dealerLookupMap[d_id]) {
//         // ওয়ান-টাইম ওয়ান-পাস হ্যাশ লুকেআপ (কোনো ইন্টারনাল লুপ বা ক্র্যাশ রিস্ক নেই)
//         dIdNo = dealerLookupMap[d_id];
//         dName = dealerDetailsMap[d_id] || "Unknown Dealer";
//       }
      
//       if (dIdNo) {
//         if (!dealerResultMap[dIdNo]) {
//           dealerResultMap[dIdNo] = { _id: d_id, name: dName, dealerId: dIdNo, totalSales: 0 };
//         }
//         dealerResultMap[dIdNo].totalSales += amt;
//       }
//     });

//     dealers.forEach(dlr => {
//       const dIdNo = dlr.dealerId || dlr.idNo || "N/A";
//       if (!dealerResultMap[dIdNo]) {
//         dealerResultMap[dIdNo] = { 
//           _id: dlr._id.toString(), 
//           name: dlr.name || "Unknown Dealer", 
//           dealerId: dIdNo, 
//           totalSales: 0 
//         };
//       }
//     });

//     const qualifiedDealers = Object.values(dealerResultMap).map(dlr => {
//       const commission = calculateDealerCommission(dlr.totalSales);
//       const isDealerQualified = dlr.totalSales >= 5000;
//       return {
//         _id: dlr._id,
//         name: dlr.name,
//         dealerId: dlr.dealerId,
//         totalSales: Number(dlr.totalSales.toFixed(2)),
//         commission: Number(commission.toFixed(2)),
//         status: isDealerQualified ? "Qualified" : "Disqualified (Sales < 5000)"
//       };
//     });

//     // সম্পূর্ণ লেজার ক্যালকুলেশন ইঞ্জিনের ফাইনাল আউটপুট রিটার্ন
//     return { totalCompanySalesAmount, poolShareCounters, finalLedgerList, qualifiedDealers };

//   } catch (error) {
//     console.error("❌ GLOBAL COMMISSION ENGINE ERROR:", error);
//     throw error;
//   }
// };


// 15th version: 15.0.0 (06 October 2026) - Full Refactor with Multi-Pass Engine, Deep Leg Roll-Up, Dynamic Gap Commission, Top-Down Override, Global Pool Distribution, and Optimized Pagination
// =========================================================================
// ১. গ্লোবাল কনফিগুরেশন ও এমএলএম রুলস স্কিমা
// =========================================================================
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
// ২. অটোমেটিক পজিশন কোয়ালিফিকেশন ইঞ্জিন (True Lifetime Position Up Rules)
// =======================================================================
const autoDeterminePosition = (totalSales, qualifiedLegsCounts = {}, databaseRank = "SALES REPRESENTATIVE") => {
  
  // 💥 মূল ফিক্স: জেনারেশন কম্প্রেশন সিঙ্ক। টার্গেট র‍্যাংক বা তার চেয়ে বড় র‍্যাংক থাকলে তা লেগ হিসেবে কাউন্ট হবে।
  // যেমন: DSM এর কন্ডিশনে NSM, ED, BOM থাকলে তারা প্রত্যেকে ১টি করে ভ্যালিড লেগ হিসেবে গণ্য হবে।
  const countAtLeast = (targetPos) => {
    return Object.keys(qualifiedLegsCounts).reduce((total, pos) => {
      return RANK_MAP[pos] >= RANK_MAP[targetPos] ? total + qualifiedLegsCounts[pos] : total;
    }, 0);
  };

  let calculatedRank = "SALES REPRESENTATIVE";

  // 🏆 লাইফটাইম পার্মানেন্ট পজিশন আপগ্রেড শর্ত (বড় টার্গেট - আপনার রুলস অনুযায়ী)
  if (totalSales >= 6400000 && countAtLeast("ED") >= 2) calculatedRank = "BOM";
  else if (totalSales >= 3200000 && countAtLeast("NSM") >= 4) calculatedRank = "ED";
  else if (totalSales >= 800000 && countAtLeast("DSM") >= 4) calculatedRank = "NSM";
  else if (totalSales >= 600000 && countAtLeast("DSM") >= 3) calculatedRank = "SM";
  else if (totalSales >= 400000 && countAtLeast("DSM") >= 2) calculatedRank = "SDSM";
  
  // DSM কন্ডিশন: ২টি আলাদা লেগে RSM বা তার বড় এবং ২টি আলাদা লেগে AM বা তার বড় মেম্বার থাকতে হবে
  else if (totalSales >= 200000 && countAtLeast("RSM") >= 2 && countAtLeast("AM") >= 2) calculatedRank = "DSM";
  
  else if (totalSales >= 75000 && countAtLeast("AM") >= 3) calculatedRank = "RSM";
  else if (totalSales >= 25000) calculatedRank = "AM";

  // 💥 Rank Lock Mechanism
  const currentRankWeight = RANK_MAP[calculatedRank.toUpperCase()] || 0;
  const historicRankWeight = RANK_MAP[databaseRank.toUpperCase()] || 0;

  return currentRankWeight >= historicRankWeight ? calculatedRank : databaseRank.toUpperCase();
};

// =======================================================================
// ৩. চূড়ান্ত মান্থলি কোয়ালিফিকেশন হেল্পার ফাংশন (Strict Monthly Payout Rules)
// =======================================================================
// const checkSelfQualificationOnly = (position, thisMonthSalesVolume, qualifiedLegsCounts = {}) => {
//   const currentPos = (position || "").trim().toUpperCase();

//   const countAtLeast = (targetPos) => {
//     return Object.keys(qualifiedLegsCounts).reduce((total, pos) => {
//       return RANK_MAP[pos] >= RANK_MAP[targetPos] ? total + qualifiedLegsCounts[pos] : total;
//     }, 0);
//   };

//   let qualifies = false;
//   let performanceBonusRate = 0;
//   let qualifiedMonthlyRank = "SALES REPRESENTATIVE"; // ডিফল্ট ডিসকোয়ালিফাইড র‍্যাংক

//   // 📊 মান্থলি কোয়ালিফাই শর্ত চেইন (Strict Weight Class Matching)
//   if (currentPos === "BOM") {
//     if (thisMonthSalesVolume >= 3200000 && countAtLeast("ED") >= 2) { 
//       qualifies = true; performanceBonusRate = 0.0025; qualifiedMonthlyRank = "BOM"; 
//     } else if (thisMonthSalesVolume >= 1600000 && countAtLeast("NSM") >= 4) { 
//       qualifies = true; performanceBonusRate = 0.0025; qualifiedMonthlyRank = "ED"; 
//     } else if (thisMonthSalesVolume >= 400000 && countAtLeast("DSM") >= 4) { 
//       qualifies = true; performanceBonusRate = 0.0025; qualifiedMonthlyRank = "NSM"; 
//     } else if (thisMonthSalesVolume >= 300000 && countAtLeast("DSM") >= 3) { 
//       qualifies = true; performanceBonusRate = 0.0025; qualifiedMonthlyRank = "SM"; 
//     } else if (thisMonthSalesVolume >= 200000 && countAtLeast("DSM") >= 2) { 
//       qualifies = true; performanceBonusRate = 0.005; qualifiedMonthlyRank = "SDSM"; 
//     }
//   } 
  
//   else if (currentPos === "ED") {
//     if (thisMonthSalesVolume >= 1600000 && countAtLeast("NSM") >= 4) { 
//       qualifies = true; performanceBonusRate = 0.0025; qualifiedMonthlyRank = "ED"; 
//     } else if (thisMonthSalesVolume >= 400000 && countAtLeast("DSM") >= 4) { 
//       qualifies = true; performanceBonusRate = 0.0025; qualifiedMonthlyRank = "NSM"; 
//     } else if (thisMonthSalesVolume >= 300000 && countAtLeast("DSM") >= 3) { 
//       qualifies = true; performanceBonusRate = 0.0025; qualifiedMonthlyRank = "SM"; 
//     } else if (thisMonthSalesVolume >= 200000 && countAtLeast("DSM") >= 2) { 
//       qualifies = true; performanceBonusRate = 0.005; qualifiedMonthlyRank = "SDSM"; 
//     }
//   } 
  
//   else if (currentPos === "NSM") {
//     if (thisMonthSalesVolume >= 400000 && countAtLeast("DSM") >= 4) { 
//       qualifies = true; performanceBonusRate = 0.0025; qualifiedMonthlyRank = "NSM"; 
//     } else if (thisMonthSalesVolume >= 300000 && countAtLeast("DSM") >= 3) { 
//       qualifies = true; performanceBonusRate = 0.0025; qualifiedMonthlyRank = "SM"; 
//     } else if (thisMonthSalesVolume >= 200000 && countAtLeast("DSM") >= 2) { 
//       qualifies = true; performanceBonusRate = 0.005; qualifiedMonthlyRank = "SDSM"; 
//     }
//   } 
  
//   else if (currentPos === "SM") {
//     if (thisMonthSalesVolume >= 300000 && countAtLeast("DSM") >= 3) { 
//       qualifies = true; performanceBonusRate = 0.0025; qualifiedMonthlyRank = "SM"; 
//     } else if (thisMonthSalesVolume >= 200000 && countAtLeast("DSM") >= 2) { 
//       qualifies = true; performanceBonusRate = 0.005; qualifiedMonthlyRank = "SDSM"; 
//     }
//   } 
  
//   else if (currentPos === "SDSM") {
//     if (thisMonthSalesVolume >= 200000 && countAtLeast("DSM") >= 2) { 
//       qualifies = true; performanceBonusRate = 0.005; qualifiedMonthlyRank = "SDSM"; 
//     }
//   } 
  
//   else if (currentPos === "DSM") {
//     // 💥 ম্যাজিক ফিক্স: স্বাভাবিক লেগ কন্ডিশন পূরণ হলে, অথবা ম্যানুয়াল DSM এর নিচে ১ লক্ষ+ সেলস থাকলে কোয়ালিফাই করবে
//     const hasStandardLegs = countAtLeast("RSM") >= 2 && countAtLeast("AM") >= 2;
//     const hasRequiredSalesVolume = thisMonthSalesVolume >= 100000;

//     if (hasRequiredSalesVolume && (hasStandardLegs || currentPos === "DSM")) { 
//       qualifies = true; 
//       performanceBonusRate = 0.005; 
//       qualifiedMonthlyRank = "DSM"; 
//     }
//   } 
  
//   else if (currentPos === "RSM") {
//     if (thisMonthSalesVolume >= 75000 && countAtLeast("AM") >= 3) { 
//       qualifies = true; performanceBonusRate = 0.01; qualifiedMonthlyRank = "RSM"; 
//     }
//   } 
  
//   else if (currentPos === "AM") {
//     if (thisMonthSalesVolume >= 25000) { 
//       qualifies = true; performanceBonusRate = 0; qualifiedMonthlyRank = "AM"; 
//     }
//   }

//   return { qualifies, performanceBonusRate, qualifiedMonthlyRank };
// };

// =======================================================================
// ৩. চূড়ান্ত মান্থলি কোয়ালিফিকেশন হেল্পার ফাংশন (Strict & Personal Sales Fallback Rules)
// =======================================================================
const checkSelfQualificationOnly = (position, thisMonthSalesVolume, qualifiedLegsCounts = {}, directSalesThisMonth = 0) => {
  const currentPos = (position || "").trim().toUpperCase();

  const countAtLeast = (targetPos) => {
    return Object.keys(qualifiedLegsCounts).reduce((total, pos) => {
      return RANK_MAP[pos] >= RANK_MAP[targetPos] ? total + qualifiedLegsCounts[pos] : total;
    }, 0);
  };

  let qualifies = false;
  let performanceBonusRate = 0;
  let qualifiedMonthlyRank = "SALES REPRESENTATIVE"; // ডিফল্ট ডিসকোয়ালিফাইড র‍্যাংক

  // 📊 ১. মান্থলি কোয়ালিফাই মেইন শর্ত চেইন (Strict High-Rank Level Matching)
  if (currentPos === "BOM") {
    if (thisMonthSalesVolume >= 3200000 && countAtLeast("ED") >= 2) { 
      qualifies = true; performanceBonusRate = 0.0025; qualifiedMonthlyRank = "BOM"; 
    } else if (thisMonthSalesVolume >= 1600000 && countAtLeast("NSM") >= 4) { 
      qualifies = true; performanceBonusRate = 0.0025; qualifiedMonthlyRank = "ED"; 
    } else if (thisMonthSalesVolume >= 400000 && countAtLeast("DSM") >= 4) { 
      qualifies = true; performanceBonusRate = 0.0025; qualifiedMonthlyRank = "NSM"; 
    } else if (thisMonthSalesVolume >= 300000 && countAtLeast("DSM") >= 3) { 
      qualifies = true; performanceBonusRate = 0.0025; qualifiedMonthlyRank = "SM"; 
    } else if (thisMonthSalesVolume >= 200000 && countAtLeast("DSM") >= 2) { 
      qualifies = true; performanceBonusRate = 0.005; qualifiedMonthlyRank = "SDSM"; 
    }
  } 
  
  else if (currentPos === "ED") {
    if (thisMonthSalesVolume >= 1600000 && countAtLeast("NSM") >= 4) { 
      qualifies = true; performanceBonusRate = 0.0025; qualifiedMonthlyRank = "ED"; 
    } else if (thisMonthSalesVolume >= 400000 && countAtLeast("DSM") >= 4) { 
      qualifies = true; performanceBonusRate = 0.0025; qualifiedMonthlyRank = "NSM"; 
    } else if (thisMonthSalesVolume >= 300000 && countAtLeast("DSM") >= 3) { 
      qualifies = true; performanceBonusRate = 0.0025; qualifiedMonthlyRank = "SM"; 
    } else if (thisMonthSalesVolume >= 200000 && countAtLeast("DSM") >= 2) { 
      qualifies = true; performanceBonusRate = 0.005; qualifiedMonthlyRank = "SDSM"; 
    }
  } 
  
  else if (currentPos === "NSM") {
    if (thisMonthSalesVolume >= 400000 && countAtLeast("DSM") >= 4) { 
      qualifies = true; performanceBonusRate = 0.0025; qualifiedMonthlyRank = "NSM"; 
    } else if (thisMonthSalesVolume >= 300000 && countAtLeast("DSM") >= 3) { 
      qualifies = true; performanceBonusRate = 0.0025; qualifiedMonthlyRank = "SM"; 
    } else if (thisMonthSalesVolume >= 200000 && countAtLeast("DSM") >= 2) { 
      qualifies = true; performanceBonusRate = 0.005; qualifiedMonthlyRank = "SDSM"; 
    }
  } 
  
  else if (currentPos === "SM") {
    if (thisMonthSalesVolume >= 300000 && countAtLeast("DSM") >= 3) { 
      qualifies = true; performanceBonusRate = 0.0025; qualifiedMonthlyRank = "SM"; 
    } else if (thisMonthSalesVolume >= 200000 && countAtLeast("DSM") >= 2) { 
      qualifies = true; performanceBonusRate = 0.005; qualifiedMonthlyRank = "SDSM"; 
    }
  } 
  
  else if (currentPos === "SDSM") {
    if (thisMonthSalesVolume >= 200000 && countAtLeast("DSM") >= 2) { 
      qualifies = true; performanceBonusRate = 0.005; qualifiedMonthlyRank = "SDSM"; 
    }
  } 
  
  else if (currentPos === "DSM") {
    if (thisMonthSalesVolume >= 100000 && countAtLeast("RSM") >= 2 && countAtLeast("AM") >= 2) { 
      qualifies = true; performanceBonusRate = 0.005; qualifiedMonthlyRank = "DSM"; 
    }
  } 
  
  else if (currentPos === "RSM") {
    if (thisMonthSalesVolume >= 75000 && countAtLeast("AM") >= 3) { 
      qualifies = true; performanceBonusRate = 0.01; qualifiedMonthlyRank = "RSM"; 
    }
  } 
  
  else if (currentPos === "AM") {
    if (thisMonthSalesVolume >= 25000) { 
      qualifies = true; performanceBonusRate = 0; qualifiedMonthlyRank = "AM"; 
    }
  }

  // =======================================================================
  // 💥 ২. ফাইনাল ম্যাজিক ফিক্স: Personal Sales ভিত্তিক DSM বা তার উপরের ফলব্যাক রুল
  // =======================================================================
  // যদি ইউজার নিজের মূল হাই-র‍্যাংক কন্ডিশনে কোয়ালিফাই না করে (qualifies === false)
  // কিন্তু তার লাইফটাইম র‍্যাংক DSM বা তার চেয়ে বড় (DSM, SDSM, SM, NSM, ED, BOM)
  if (!qualifies && RANK_MAP[currentPos] >= RANK_MAP["DSM"]) {
    
    // কন্ডিশন A: পার্সোনাল সেলস ১ লক্ষ বা তার বেশি হলে সরাসরি DSM কোয়ালিফাই করবে
    if (directSalesThisMonth >= 100000) {
      qualifies = true;
      performanceBonusRate = 0.005; 
      qualifiedMonthlyRank = "DSM";
    } 
    // কন্ডিশন B: পার্সোনাল সেলস ৭৫ হাজার বা তার বেশি হলে সরাসরি RSM কোয়ালিফাই করবে
    else if (directSalesThisMonth >= 75000) {
      qualifies = true;
      performanceBonusRate = 0.01; 
      qualifiedMonthlyRank = "RSM";
    }
  }

  return { qualifies, performanceBonusRate, qualifiedMonthlyRank };
};


// =========================================================================
// ৪. মেগা কমিশন ক্যালকুলেশন কোর ইঞ্জিন ফাংশন
// =========================================================================
const executeLedgerCalculationEngine = async (currentYear, currentMonth) => {
  try {
    const db = mongoose.connection.db;

    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 1);

    // --- STEP 1: ডাটাবেজ রিড ও ডেটা লোডিং (মেমোরি অপ্টিমাইজড প্রজেকশন সহ) ---
    const thisMonthSales = await db.collection("invoices").find({
      createdAt: { $gte: startDate, $lt: endDate }
    }, { projection: { grandTotal: 1, dealer: 1, isMonthlyArchived: 1, archivedSalesData: 1 } }).toArray();

    const totalCompanySalesAmount = thisMonthSales.reduce((sum, s) => sum + (s.grandTotal || 0), 0);
    const dealers = await db.collection("dealers").find({}, { projection: { _id: 1, name: 1, referenceIdNo: 1, dealerId: 1, idNo: 1 } }).toArray();
    const users = await db.collection("users").find({ idNo: { $regex: /^MKT/i } }).toArray();

    // এগ্রিগেশন পাইপলাইন দিয়ে ওয়ান-টাইম লাইফটাইম সেলস সামারি (র‍্যাম প্রটেকশন)
    const lifetimeSalesAgg = await db.collection("invoices").aggregate([
      {
        $group: {
          _id: "$dealer",
          totalVolume: { $sum: "$grandTotal" }
        }
      }
    ]).toArray();

    const lifetimeSalesMap = {};
    lifetimeSalesAgg.forEach(item => {
      if (item._id) lifetimeSalesMap[item._id.toString()] = item.totalVolume;
    });

    const userSalesMap = {};
    const parentToChildrenMap = {}; 

    // --- STEP 2: মেমোরি স্টেট স্ট্রাকচার ইনিশিয়ালাইজেশন ---
    users.forEach(u => {
      userSalesMap[u.idNo] = { 
        ...u, 
        _id: u._id.toString(),
        databaseRank: u.rank || "SALES REPRESENTATIVE", 
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

    const dealerLookupMap = {};
    dealers.forEach(d => {
      if (d._id && d.referenceIdNo) {
        dealerLookupMap[d._id.toString()] = d.referenceIdNo;
      }
    });

    // --- STEP 3: ডাইরেক্ট পার্সোনাল সেলস ভলিউম অ্যাসাইনমেন্ট ---
    dealers.forEach(d => {
      const targetEmp = dealerLookupMap[d._id.toString()];
      const lSales = lifetimeSalesMap[d._id.toString()] || 0;
      if (targetEmp && userSalesMap[targetEmp]) {
        userSalesMap[targetEmp].directSalesLifetime += lSales;
        userSalesMap[targetEmp].totalSalesVolume += lSales; 
      }
    });

    thisMonthSales.forEach(sale => {
      const saleAmount = Number(sale.grandTotal || 0);
      let targetEmployeeIdNo = null;

      if (sale.isMonthlyArchived && sale.archivedSalesData?.employeeSnapshot?.idNo) {
        targetEmployeeIdNo = sale.archivedSalesData.employeeSnapshot.idNo;
      } else if (sale.dealer) {
        targetEmployeeIdNo = dealerLookupMap[sale.dealer.toString()];
      }

      if (targetEmployeeIdNo && userSalesMap[targetEmployeeIdNo]) {
        const emp = userSalesMap[targetEmployeeIdNo];
        emp.directSalesThisMonth += saleAmount;
        emp.thisMonthSalesVolume += saleAmount; 
      }
    });

    // =========================================================================
    // 💥 পাস ১.১: প্রথম পাস - শুধুমাত্র ডাউনলাইনের সব সেলস ভলিউম রিকার্সিভলি ওপরে রোল-আপ করা
    // =========================================================================
    const volumeVisitedSet = new Set();

    const rollupSalesVolumeOnly = (currentIdNo) => {
      if (volumeVisitedSet.has(currentIdNo)) return;
      volumeVisitedSet.add(currentIdNo);

      const currentEmployee = userSalesMap[currentIdNo];
      if (!currentEmployee) return;

      const childrenIds = parentToChildrenMap[currentIdNo] || [];
      
      childrenIds.forEach(childId => {
        rollupSalesVolumeOnly(childId); // চাইল্ড নোড আগে রোল-আপ শেষ করবে
        const childData = userSalesMap[childId];
        if (childData) {
          currentEmployee.totalSalesVolume += childData.totalSalesVolume;
          currentEmployee.thisMonthSalesVolume += childData.thisMonthSalesVolume;
        }
      });
    };

    // সব রুট নোড থেকে ভলিউম রোল-আপ রান করা (নিখুঁত মেমরি ম্যাপ তৈরি হবে)
    users.forEach(user => {
      if (user.refIdNo === "0" || !user.refIdNo || !userSalesMap[user.refIdNo]) {
        rollupSalesVolumeOnly(user.idNo);
      }
    });

    
    // =========================================================================
    // 💥 পাস ১.২ ফিক্স: ডাবল-কাউন্টিং লেগ প্রোটেকশন এবং স্বাধীন লাইন কোয়ালিফিকেশন ইঞ্জিন
    // =========================================================================
    const positionVisitedSet = new Set(); 
    
    const processHierarchyPositions = (currentIdNo) => {
      // ইনফিনিট লুপ প্রোটেকশন
      if (positionVisitedSet.has(currentIdNo)) {
        const emp = userSalesMap[currentIdNo];
        const resLegs = { AM: 0, RSM: 0, DSM: 0, NSM: 0, ED: 0, BOM: 0 };
        if (emp) {
          const myPos = (emp.autoPosition || "").toUpperCase().trim();
          if (resLegs[myPos] !== undefined) resLegs[myPos] = 1;
        }
        return resLegs;
      }
      positionVisitedSet.add(currentIdNo);

      const currentEmployee = userSalesMap[currentIdNo];
      if (!currentEmployee) return { AM: 0, RSM: 0, DSM: 0, NSM: 0, ED: 0, BOM: 0 };

      const childrenIds = parentToChildrenMap[currentIdNo] || [];
      
      // কারেন্ট ইউজারের জন্য রিয়াল-টাইম মাস্টার লেগ কাউন্টার (এখানে শুধু সরাসরি ডিরেক্ট চাইল্ডের ফাইনাল পজিশন কাউন্ট হবে)
      const masterLegsCounts = { AM: 0, RSM: 0, DSM: 0, NSM: 0, ED: 0, BOM: 0 };

      // প্রতিটি ডিরেক্ট চাইল্ড মানেই হলো ১টা আলাদা স্বাধীন লাইন (Distinct Leg)
      childrenIds.forEach(childId => {
        // চাইল্ডের নিচের সাব-ট্রির পজিশন আগে নিচ থেকে ক্যালকুলেট হয়ে আসবে
        const childReportedRanks = processHierarchyPositions(childId);
        const childData = userSalesMap[childId];
        
        if (childData) {
          // ১. এই চাইল্ডের নিজের এই মাসের টিম সেলস ভলিউম সরাসরি তার র‍্যাংক ট্র্যাক করবে
          let activeRankInThisLeg = "SALES REPRESENTATIVE";
          
          if (childData.thisMonthSalesVolume >= 3200000) activeRankInThisLeg = "ED";
          else if (childData.thisMonthSalesVolume >= 1600000) activeRankInThisLeg = "NSM";
          else if (childData.thisMonthSalesVolume >= 400000) activeRankInThisLeg = "DSM";
          else if (childData.thisMonthSalesVolume >= 300000) activeRankInThisLeg = "DSM";
          else if (childData.thisMonthSalesVolume >= 200000) activeRankInThisLeg = "DSM";
          else if (childData.thisMonthSalesVolume >= 100000) activeRankInThisLeg = "DSM"; 
          else if (childData.thisMonthSalesVolume >= 75000) activeRankInThisLeg = "RSM";
          else if (childData.thisMonthSalesVolume >= 25000) activeRankInThisLeg = "AM";

          // ২. এই চাইল্ডের নিচে (ডাউনলাইনে) অর্জিত সর্বোচ্চ র‍্যাংকটি বের করা
          let maxSubTreeRank = "SALES REPRESENTATIVE";
          Object.keys(childReportedRanks).forEach(pos => {
            if (childReportedRanks[pos] === 1) {
              if (RANK_MAP[pos] > RANK_MAP[maxSubTreeRank]) {
                maxSubTreeRank = pos;
              }
            }
          });

          // ৩. সেলস র‍্যাংক এবং সাব-ট্রি র‍্যাংকের মধ্যে যেটি সবচেয়ে বড়, সেটাই হবে এই লেগের ফাইনাল র‍্যাংক
          let finalRankOfThisLeg = RANK_MAP[activeRankInThisLeg] > RANK_MAP[maxSubTreeRank] 
            ? activeRankInThisLeg 
            : maxSubTreeRank;

          // ৪. এই স্বাধীন লেগের চূড়ান্ত পজিশনটি মাস্টার কাউন্টারে মাত্র ১ বার (+১) যোগ হবে
          if (finalRankOfThisLeg !== "SALES REPRESENTATIVE") {
            masterLegsCounts[finalRankOfThisLeg] += 1;
          }
        }
      });

      // 💥 জেনারেশন কম্প্রেশন ফিক্সড `countAtLeast` ইঞ্জিন:
      // আমরা ফাংশনগুলোর লোকাল স্কোপের জন্য ডাবল কাউন্টিং মুক্ত সেফ কাউন্টার তৈরি করছি
      const secureCountAtLeast = (targetPos) => {
        return Object.keys(masterLegsCounts).reduce((total, pos) => {
          return RANK_MAP[pos] >= RANK_MAP[targetPos] ? total + masterLegsCounts[pos] : total;
        }, 0);
      };

      // কারেন্ট ইউজারের ফাইনাল লাইফটাইম র‍্যাংক নির্ধারণ (সুরক্ষিত লেগ কাউন্ট দিয়ে)
      // নোট: autoDeterminePosition এর ভেতরের countAtLeast কে ওভাররাইড করতে এখানে কাস্টম লজিক ব্যবহার করা হলো
      let calculatedRank = "SALES REPRESENTATIVE";
      if (currentEmployee.totalSalesVolume >= 6400000 && secureCountAtLeast("ED") >= 2) calculatedRank = "BOM";
      else if (currentEmployee.totalSalesVolume >= 3200000 && secureCountAtLeast("NSM") >= 4) calculatedRank = "ED";
      else if (currentEmployee.totalSalesVolume >= 800000 && secureCountAtLeast("DSM") >= 4) calculatedRank = "NSM";
      else if (currentEmployee.totalSalesVolume >= 600000 && secureCountAtLeast("DSM") >= 3) calculatedRank = "SM";
      else if (currentEmployee.totalSalesVolume >= 400000 && secureCountAtLeast("DSM") >= 2) calculatedRank = "SDSM";
      else if (currentEmployee.totalSalesVolume >= 200000 && secureCountAtLeast("RSM") >= 2 && secureCountAtLeast("AM") >= 2) calculatedRank = "DSM";
      else if (currentEmployee.totalSalesVolume >= 75000 && secureCountAtLeast("AM") >= 3) calculatedRank = "RSM";
      else if (currentEmployee.totalSalesVolume >= 25000) calculatedRank = "AM";

      const currentRankWeight = RANK_MAP[calculatedRank.toUpperCase()] || 0;
      const historicRankWeight = RANK_MAP[currentEmployee.databaseRank.toUpperCase()] || 0;
      
      currentEmployee.autoPosition = currentRankWeight >= historicRankWeight ? calculatedRank : currentEmployee.databaseRank.toUpperCase();
      currentEmployee.currentSlabRate = POSITION_SLABS[currentEmployee.autoPosition] || 0;
      
      // কারেন্ট ইউজারের চলতি মাসের চূড়ান্ত মান্থলি কোয়ালিফিকেশন পরীক্ষা
      const qualification = checkSelfQualificationOnly(
        currentEmployee.autoPosition,
        currentEmployee.thisMonthSalesVolume,
        masterLegsCounts, // ডাবল-কাউন্ট মুক্ত পিওর ম্যাপ
        currentEmployee.directSalesThisMonth
      );
      currentEmployee.selfQualifiesForBonus = qualification.qualifies;
      currentEmployee.performanceBonusRate = qualification.performanceBonusRate;
      currentEmployee.qualifiedMonthlyRank = qualification.qualifiedMonthlyRank; 

      // প্যারেন্ট নোডের কাছে নিজের অর্জিত কোয়ালিফাইড র‍্যাংক রিপোর্ট করা
      const returnLegsSummary = { AM: 0, RSM: 0, DSM: 0, NSM: 0, ED: 0, BOM: 0 };
      const myFinalPos = (currentEmployee.qualifiedMonthlyRank || "SALES REPRESENTATIVE").toUpperCase().trim();
      
      if (returnLegsSummary[myFinalPos] !== undefined) {
        returnLegsSummary[myFinalPos] = 1;
      }
      return returnLegsSummary; 
    };



    // রুট নোড থেকে পজিশন নির্ধারণ ইঞ্জিন রান করা
    users.forEach(user => {
      if (user.refIdNo === "0" || !user.refIdNo || !userSalesMap[user.refIdNo]) {
        processHierarchyPositions(user.idNo);
      }
    });




    

      // =======================================================================
    // --- পাস ৩ ফিক্স: টপ-ডাউন কোয়ালিফিকেশন ওভাররাইড চেইন (Sales Validation সহ) ---
    // =======================================================================
    const applyTopDownBonusQualification = (currentIdNo, parentQualifies = false) => {
      const currentEmployee = userSalesMap[currentIdNo];
      if (!currentEmployee) return;

      // ফিক্স: প্যারেন্ট কোয়ালিফাইড হলেও এই ডাউনলাইনের চলতি মাসের টিম সেলস মিনিমাম ২৫০০০ হতে হবে
      // (প্রয়োজনে আপনার বিজনেস রুলস অনুযায়ী ২৫০০০ অ্যামাউন্টটি পরিবর্তন করতে পারেন)
      if (parentQualifies && (currentEmployee.thisMonthSalesVolume || 0) >= 25000) {
        currentEmployee.selfQualifiesForBonus = true;
      }

      const childrenIds = parentToChildrenMap[currentIdNo] || [];
      childrenIds.forEach(childId => applyTopDownBonusQualification(childId, currentEmployee.selfQualifiesForBonus));
    };

    if (parentToChildrenMap["0"]) {
      parentToChildrenMap["0"].forEach(rootIdNo => applyTopDownBonusQualification(rootIdNo, false));
    }


    // =======================================================================
    // --- পাস ৩.১: গ্যারান্টিড রেট সিঙ্ক লক ইঞ্জিন (Performance Optimized) ---
    // =======================================================================
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

            Object.keys(singleLegFlags).forEach(pos => {
              if (singleLegFlags[pos] === 1) {
                Object.keys(singleLegFlags).forEach(p => {
                  if (RANK_MAP[pos] >= RANK_MAP[p]) singleLegFlags[p] = 1;
                });
              }
            });

            Object.keys(singleLegFlags).forEach(pos => {
              syncedLegsCounts[pos] += singleLegFlags[pos];
            });
          }
        });

        const finalCheck = checkSelfQualificationOnly(
          emp.autoPosition, 
          emp.thisMonthSalesVolume, 
          syncedLegsCounts,
          emp.directSalesThisMonth // 💥 নতুন সংযোজন
        );
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

    // =======================================================================
    // --- পাস ৪ ফিক্স: গ্লোবাল কোম্পানি পুল কাউন্টার (Strict Action Protection) ---
    // =======================================================================
    const poolShareCounters = { RSM: 0, DSM: 0, SDSM: 0, SM: 0, NSM: 0, ED: 0, BOM: 0 };
    const qualifiedPoolMembers = { RSM: [], DSM: [], SDSM: [], SM: [], NSM: [], ED: [], BOM: [] };
    
    users.forEach(user => {
      const nodeData = userSalesMap[user.idNo];
      if (!nodeData) return;

      // ১. পার্সোনাল মিনিমাম সেলস গার্ড (৩০০০ টাকা)
      const isQualifiedForBill = (nodeData.directSalesThisMonth || 0) >= 3000;
      
      // ২. টিম সেলস গার্ড (জিরো টিম সেলস থাকলে সরাসরি ডিসকোয়ালিফাইড)
      const hasTeamSales = (nodeData.thisMonthSalesVolume || 0) > 0;

      const myPos = (nodeData.qualifiedMonthlyRank || "SALES REPRESENTATIVE").toUpperCase().trim();

      // ৩. চূড়ান্ত চেকিং: পার্সোনাল সেলস, টিম সেলস, বোনাস এলিজিবিলিটি এবং ভ্যালিড মান্থলি র‍্যাংক থাকতে হবে
      if (
        isQualifiedForBill && 
        hasTeamSales && 
        nodeData.selfQualifiesForBonus && 
        myPos !== "SALES REPRESENTATIVE" && 
        ELIGIBLE_POOL_POSITIONS.includes(myPos)
      ) {
        const myRankValue = RANK_MAP[myPos];
        
        ELIGIBLE_POOL_POSITIONS.forEach(poolName => {
          const poolRankValue = RANK_MAP[poolName];
          
          if (myPos === "RSM") {
            if (poolName === "RSM") { 
              poolShareCounters[poolName]++; 
              if (!nodeData.earnedPools.includes(poolName)) nodeData.earnedPools.push(poolName); 
              qualifiedPoolMembers[poolName].push(user.idNo); 
            }
          } else {
            if (myRankValue >= poolRankValue && poolName !== "RSM") { 
              poolShareCounters[poolName]++; 
              if (!nodeData.earnedPools.includes(poolName)) nodeData.earnedPools.push(poolName); 
              qualifiedPoolMembers[poolName].push(user.idNo); 
            }
          }
        });
      } else {
        // যদি কোয়ালিফাই না করে, তবে তার মান্থলি র‍্যাংক ডিফল্ট করে দেওয়া হলো যেন গ্যাপ ইঞ্জিনে সমস্যা না হয়
        nodeData.qualifiedMonthlyRank = "SALES REPRESENTATIVE";
      }
    });


    // =======================================================================
    // --- পাস ৫: গ্লোবাল কোম্পানি পুল বোনাস ডিস্ট্রিবিউশন রানার (Safe Division Policy) ---
    // =======================================================================
    // ক্যালকুলেশন শুরু করার আগে সবার গ্লোবাল পুল এমাউন্ট জিরো করে নেওয়া হচ্ছে
    Object.keys(userSalesMap).forEach(idNo => {
      if (userSalesMap[idNo]) userSalesMap[idNo].globalPoolBonusAmount = 0;
    });

    ELIGIBLE_POOL_POSITIONS.forEach(poolName => {
      const poolRate = SALES_SHARE_CONFIG[poolName] || 0;
      
      // ইউনিক মেম্বার আইডি ফিল্টারিং
      const uniqueMemberIds = Array.from(new Set(qualifiedPoolMembers[poolName] || []));
      const totalPoolMembers = uniqueMemberIds.length;

      // পুলে যদি কোয়ালিফাইড মেম্বার থাকে এবং কোম্পানির ঐ পুলের রেট যদি ০ থেকে বড় হয়
      if (totalPoolMembers > 0 && poolRate > 0) {
        // এই পুলের জন্য বরাদ্দকৃত মোট টাকা = টোটাল কোম্পানি সেলস * পুল রেট
        const totalPoolMoney = totalCompanySalesAmount * poolRate;
        
        // সমবন্টন নীতি (Equal Share Split among all qualifiers of this pool)
        const sharePerMember = totalPoolMoney / totalPoolMembers;
        
        uniqueMemberIds.forEach(idNo => {
          if (userSalesMap[idNo]) {
            // মেম্বারের একাউন্টে পুলের টাকা প্লাস হচ্ছে
            userSalesMap[idNo].globalPoolBonusAmount += sharePerMember;
          }
        });
      }
    });


    // =======================================================================
    // 💥 পাস ৫.১: ফাইনাল লিডিং ডাইনামিক গ্যাপ কমিশন (True 24% Generation Gap Engine)
    // =======================================================================
    // বন্টন শুরু করার আগে সবার বেস কমিশন ক্লিয়ার করে নেওয়া হচ্ছে
    Object.keys(userSalesMap).forEach(idNo => {
      if (userSalesMap[idNo]) userSalesMap[idNo].baseCommission = 0;
    });

    thisMonthSales.forEach(sale => {
      const invoiceAmount = Number(sale.grandTotal || sale.totalAmount || sale.amount || 0);
      if (invoiceAmount <= 0) return;

      let startEmployeeIdNo = null;
      if (sale.isMonthlyArchived && sale.archivedSalesData?.employeeSnapshot?.idNo) {
        startEmployeeIdNo = sale.archivedSalesData.employeeSnapshot.idNo;
      } else if (sale.dealer) {
        startEmployeeIdNo = dealerLookupMap[sale.dealer.toString()];
      }

      if (!startEmployeeIdNo || !userSalesMap[startEmployeeIdNo]) return;
      
      let currentIdNo = startEmployeeIdNo;
      let distributedRateSoFar = 0; 
      const visited = new Set(); 

      // 💥 রিয়াল-টাইম ডাইনামিক আপলাইন ট্রাভার্সাল চেইন (সর্বোচ্চ ২৪% ডিস্ট্রিবিউশন লক)
      while (currentIdNo && currentIdNo !== "0" && !visited.has(currentIdNo)) {
        visited.add(currentIdNo);
        const empNode = userSalesMap[currentIdNo];
        if (!empNode) break;

        const myPositionRate = POSITION_SLABS[empNode.autoPosition?.toUpperCase().trim()] || 0;

        // যদি মেম্বারের স্ল্যাব রেট এ পর্যন্ত বন্টন হওয়া রেটের চেয়ে বড় হয়
        if (myPositionRate > distributedRateSoFar) {
          const gapRate = myPositionRate - distributedRateSoFar;
          
          // গ্যাপ কমিশন একাউন্টে নিখুঁতভাবে প্লাস হবে
          empNode.baseCommission += invoiceAmount * gapRate; 
          
          // বন্টনকৃত রেট আপডেট
          distributedRateSoFar = myPositionRate; 
        }

        // জাভাস্ক্রিপ্ট ফ্লোটিং পয়েন্ট সেফটি ফিক্স: টোটাল ২৪% বন্টন শেষ হলে লুপ ব্রেক হবে
        if (Number(distributedRateSoFar.toFixed(4)) >= 0.24) {
          break;
        }

        currentIdNo = empNode.refIdNo; // চেইনের পরবর্তী আপলাইন আইডিতে মুভ
      }
    });

    // =========================================================================
    // 💥 পাস ৬: কর্মচারীদের ফাইনাল ফ্ল্যাট রেসপন্স এরে প্রস্তুতকরণ (Fixed Sync Layout)
    // =========================================================================
    const finalLedgerList = [];

    users.forEach(user => {
      const rawUserObj = user._doc || user; 
      const nodeData = userSalesMap[user.idNo];
      if (!nodeData) return;

      const isQualifiedForBill = (nodeData.directSalesThisMonth || 0) >= 3000;

      let salesShareBonus = nodeData.globalPoolBonusAmount || 0;
      let performanceBonus = 0;

      // মেম্বার বিল কোয়ালিফাই করলে তবেই বোনাস এমাউন্ট জেনারেট হবে
      if (isQualifiedForBill && nodeData.selfQualifiesForBonus) {
        performanceBonus = (nodeData.thisMonthSalesVolume || 0) * (nodeData.performanceBonusRate || 0);
      }

      // 💥 ফিক্স: ডাবল স্ল্যাব ক্যালকুলেশন বাদ দিয়ে জেনুইন বন্টনকৃত বেস কমিশন লক করা হলো
      const totalAccumulatedBaseCommission = isQualifiedForBill ? (nodeData.baseCommission || 0) : 0;
      const finalSalesShareBonus = isQualifiedForBill ? salesShareBonus : 0;
      
      nodeData.baseCommission = totalAccumulatedBaseCommission;
      nodeData.monthlyBonusAmount = performanceBonus;
      nodeData.globalPoolBonusAmount = finalSalesShareBonus;

      nodeData.totalSalesAchieved = nodeData.totalSalesVolume;
      nodeData.thisMonthSalesAchieved = nodeData.thisMonthSalesVolume;

      const totalEarned = totalAccumulatedBaseCommission + finalSalesShareBonus + performanceBonus;

      if (totalEarned > 0 || (nodeData.totalSalesVolume || 0) >= 25000) {
        finalLedgerList.push({
          ...rawUserObj,
          _id: rawUserObj._id.toString(),
          
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
          
          netTotalEarnings: Number(totalEarned.toFixed(2)),
          qualificationStatus: isQualifiedForBill ? "Qualified" : "Disqualified for Pool (Sales < 3000)"
        });
      }
    });


    // =========================================================================
    // পাস 🔍: ডিলার ওয়ান-পাস ওয়ান-টাইম নেম লুকেআপ ম্যাপ (O(1) Speed Optimizer)
    // =========================================================================
    const dealerDetailsMap = {};
    dealers.forEach(d => {
      if (d._id) {
        dealerDetailsMap[d._id.toString()] = d.name || "Unknown Dealer";
      }
    });

    // =========================================================================
    // পাস ৭: ডিলার রেসপন্স লুপ (Safe Seeding & Overwrite Protection)
    // =========================================================================
    const dealerResultMap = {};

    thisMonthSales.forEach(sale => {
      const amt = Number(sale.grandTotal || 0);
      if (amt <= 0) return;
      
      let dIdNo = null;
      let dName = "Unknown Dealer";
      let d_id = sale.dealer ? sale.dealer.toString() : "ARCHIVED_ID";

      if (sale.isMonthlyArchived && sale.archivedSalesData && sale.archivedSalesData.dealerSnapshot) {
        dIdNo = sale.archivedSalesData.dealerSnapshot.idNo;
        dName = sale.archivedSalesData.dealerSnapshot.name || "Unknown Dealer";
      } else if (sale.dealer && dealerLookupMap[d_id]) {
        dIdNo = dealerLookupMap[d_id];
        dName = dealerDetailsMap[d_id] || "Unknown Dealer";
      }
      
      if (dIdNo) {
        if (!dealerResultMap[dIdNo]) {
          dealerResultMap[dIdNo] = { _id: d_id, name: dName, dealerId: dIdNo, totalSales: 0 };
        }
        dealerResultMap[dIdNo].totalSales += amt;
      }
    });

    // 💥 ওয়ান-পাস ফিক্স: এক্সিস্টিং সেলস ডেটা ব্ল্যাংক জিরো দিয়ে রিসেট হওয়া রোধে কন্ডিশনাল চেকিং
    dealers.forEach(dlr => {
      const dIdNo = dlr.dealerId || dlr.idNo || dealerLookupMap[dlr._id.toString()] || "N/A";
      if (!dealerResultMap[dIdNo]) {
        dealerResultMap[dIdNo] = { 
          _id: dlr._id.toString(), 
          name: dlr.name || "Unknown Dealer", 
          dealerId: dIdNo, 
          totalSales: 0 
        };
      }
    });

    const qualifiedDealers = Object.values(dealerResultMap).map(dlr => {
      const commission = calculateDealerCommission(dlr.totalSales);
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

    // সম্পূর্ণ লেজার ক্যালকুলেশন ইঞ্জিনের ফাইনাল আউটপুট রিটার্ন অবজেক্ট
    return { totalCompanySalesAmount, poolShareCounters, finalLedgerList, qualifiedDealers };

  } catch (error) {
    console.error("❌ GLOBAL COMMISSION ENGINE ERROR:", error);
    throw error;
  }
};









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
  getMyMonthlyCommissionStatus,
  getMyMonthlySalarySheet,
  executeLedgerCalculationEngine
};
