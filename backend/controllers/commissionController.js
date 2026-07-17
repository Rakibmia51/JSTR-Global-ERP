
const mongoose = require('mongoose');
const Invoice = require('../models/Invoice');
const Dealer = require('../models/Dealer');
const User = require('../models/User');


//---5th Version of Commission Controller with Auto Positioning and Commission Calculation (Final)---//

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
//   "RSM": 0.175,
//   "AM": 0.15,
//   "SALES REPRESENTATIVE": 0
// };

// // ২. অটোমেটিক পজিশন কোয়ালিফিকেশন ইঞ্জিন (Top to Bottom সিকোয়েন্স)
// // Old Auto Position Determination Logic (Commented Out)
// // const autoDeterminePosition = (totalSales, subNodesSummary = []) => {
// //   const amCount = subNodesSummary.filter(sub => sub.autoPosition === "AM").length;
// //   const rsmCount = subNodesSummary.filter(sub => sub.autoPosition === "RSM").length;
// //   const dsmCount = subNodesSummary.filter(sub => sub.autoPosition === "DSM").length;
// //   const nsmCount = subNodesSummary.filter(sub => sub.autoPosition === "NSM").length;

// //   if (totalSales >= 1600000 && nsmCount >= 4) return "ED";
// //   if (totalSales >= 400000 && dsmCount >= 4) return "NSM";
// //   if (totalSales >= 300000 && dsmCount >= 3) return "SM";
// //   if (totalSales >= 200000 && dsmCount >= 2) return "SDSM";
// //   if (totalSales >= 150000 && rsmCount >= 1 && amCount >= 2) return "DSM";
// //   if (totalSales >= 100000 && amCount >= 4) return "RSM";
// //   if (totalSales >= 25000) return "AM";

// //   return "Sales Representative";
// // };

// // ERGON System: Updated Auto Position Determination Logic
// const autoDeterminePosition = (totalSales, subNodesSummary = []) => {
//   const amCount = subNodesSummary.filter(sub => sub.autoPosition === "AM").length;
//   const rsmCount = subNodesSummary.filter(sub => sub.autoPosition === "RSM").length;
//   const dsmCount = subNodesSummary.filter(sub => sub.autoPosition === "DSM").length;
//   const nsmCount = subNodesSummary.filter(sub => sub.autoPosition === "NSM").length;

//   if (totalSales >= 1600000 && nsmCount >= 4 && dsmCount >= 2) return "ED";
//   if (totalSales >= 600000 && dsmCount >= 6) return "NSM";
//   if (totalSales >= 400000 && dsmCount >= 4) return "SM";
//   if (totalSales >= 200000 && dsmCount >= 2) return "SDSM";
//   if (totalSales >= 100000 && amCount >= 4) return "DSM";
//   if (totalSales >= 100000 && amCount >= 2) return "RSM";
//   if (totalSales >= 25000) return "AM";

//   return "Sales Representative";
// };

// // ৩. বোনাস ও ইনসেনটিভ ক্যালকুলেটর
// // Old Bonus Calculation Logic (Commented Out)
// // const calculateBonuses = (position, totalSales, subNodesSummary = []) => {
// //   const amCount = subNodesSummary.filter(sub => sub.autoPosition === "AM").length;
// //   const rsmCount = subNodesSummary.filter(sub => sub.autoPosition === "RSM").length;
// //   const dsmCount = subNodesSummary.filter(sub => sub.autoPosition === "DSM").length;
// //   const nsmCount = subNodesSummary.filter(sub => sub.autoPosition === "NSM").length;

// //   let salesShare = 0;
// //   let bestPerf = 0;
// //   const p = position?.toUpperCase();

// //   if (p === "RSM" && amCount >= 4 && totalSales >= 100000) {
// //     salesShare = totalSales * 0.01;
// //     bestPerf = totalSales * 0.01;
// //   }
// //    else if (p === "DSM" && rsmCount >= 1 && amCount >= 2 && totalSales >= 150000) {
// //     salesShare = totalSales * 0.05;
// //     bestPerf = totalSales * 0.005;
// //   } else if (p === "SDSM" && dsmCount >= 2 && totalSales >= 200000) {
// //     salesShare = totalSales * 0.01;
// //     bestPerf = totalSales * 0.005;
// //   } else if (p === "SM" && dsmCount >= 3 && totalSales >= 300000) {
// //     salesShare = totalSales * 0.005;
// //     bestPerf = totalSales * 0.0025;
// //   } else if (p === "NSM" && dsmCount >= 4 && totalSales >= 400000) {
// //     salesShare = totalSales * 0.01;
// //     bestPerf = totalSales * 0.0025;
// //   } else if (p === "ED" && nsmCount >= 4 && totalSales >= 1600000) {
// //     salesShare = totalSales * 0.005;
// //     bestPerf = totalSales * 0.0025;
// //   }

// //   return { salesShareBonus: salesShare, performanceBonus: bestPerf };
// // };

// // ERGON System: Updated Bonus Calculation Logic
// const calculateBonuses = (position, totalSales, subNodesSummary = []) => {
//   const amCount = subNodesSummary.filter(sub => sub.autoPosition === "AM").length;
//   const rsmCount = subNodesSummary.filter(sub => sub.autoPosition === "RSM").length;
//   const dsmCount = subNodesSummary.filter(sub => sub.autoPosition === "DSM").length;
//   const nsmCount = subNodesSummary.filter(sub => sub.autoPosition === "NSM").length;

//   let salesShare = 0;
//   let bestPerf = 0;
//   const p = position?.toUpperCase();

//   if (p === "RSM" && amCount >= 4 && totalSales >= 100000) {
//     salesShare = totalSales * 0.01;
//     bestPerf = totalSales * 0.01;
//   }
//    else if (p === "DSM" && amCount >= 4 && totalSales >= 100000) {
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



//--- 6th Version of Commission Controller with Auto Positioning and Commission Calculation (Final)---//
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
  "SALES REPRESENTATIVE": 0
};


// ERGON System: Updated Auto Position Determination Logic
const autoDeterminePosition = (totalSales, subNodesSummary = []) => {
  const dsmCount = subNodesSummary.filter(sub => sub.autoPosition === "DSM").length;
  const nsmCount = subNodesSummary.filter(sub => sub.autoPosition === "NSM").length;

  if (totalSales >= 1600000 && nsmCount >= 4 && dsmCount >= 2) return "ED";
  if (totalSales >= 600000 && dsmCount >= 6) return "NSM";
  if (totalSales >= 400000 && dsmCount >= 4) return "SM";
  if (totalSales >= 200000 && dsmCount >= 2) return "SDSM";
  if (totalSales >= 100000) return "DSM";

  return "Sales Representative";
};

// ৩. বোনাস ও ইনসেনটিভ ক্যালকুলেটর

// ERGON System: Updated Bonus Calculation Logic
const calculateBonuses = (position, totalSales, subNodesSummary = []) => {
  const amCount = subNodesSummary.filter(sub => sub.autoPosition === "AM").length;
  const rsmCount = subNodesSummary.filter(sub => sub.autoPosition === "RSM").length;
  const dsmCount = subNodesSummary.filter(sub => sub.autoPosition === "DSM").length;
  const nsmCount = subNodesSummary.filter(sub => sub.autoPosition === "NSM").length;

  let salesShare = 0;
  let bestPerf = 0;
  const p = position?.toUpperCase();

 
    if (p === "DSM" && totalSales >= 100000) {
    salesShare = totalSales * 0.07;
    bestPerf = totalSales * 0.000;
  } else if (p === "SDSM" && dsmCount >= 2 && totalSales >= 200000) {
    salesShare = totalSales * 0.0150;
    bestPerf = totalSales * 0.000;
  } else if (p === "SM" && dsmCount >= 4 && totalSales >= 400000) {
    salesShare = totalSales * 0.0150;
    bestPerf = totalSales * 0.0000;
  } else if (p === "NSM" && dsmCount >= 6 && totalSales >= 600000) {
    salesShare = totalSales * 0.0450;
    bestPerf = totalSales * 0.0000;
  } else if (p === "SNSM" && dsmCount >= 4 && nsmCount >= 2 && totalSales >= 1600000) {
    salesShare = totalSales * 0.0150;
    bestPerf = totalSales * 0.0000;
  } else if (p === "ED" && nsmCount >= 4 && dsmCount >= 2 && totalSales >= 2600000) {
    salesShare = totalSales * 0.03;
    bestPerf = totalSales * 0.0000;
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

      if (totalEarned > 0 || nodeData.totalSalesVolume >= 100000) {
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
