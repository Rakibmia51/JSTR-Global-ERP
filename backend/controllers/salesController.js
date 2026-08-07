const User = require('../models/User');
const Dealer = require('../models/Dealer');
const Invoice = require('../models/Invoice');
const MonthlyLedger = require('../models/MonthlyLedger');
// controllers/salesController.js
const mongoose = require('mongoose');


// 1st version of sales controller with native MongoDB driver for performance optimization
//  const getSalesWithEmployee = async (req, res) => {
//   try {
//     // 💡 সমাধান: মঙ্গুজ মডেল এভয়েড করে সরাসরি নেটিভ ড্রাইভার দিয়ে ডাটাবেজ কানেক্ট করা
//     // আপনার ডাটাবেজে কালেকশনের নাম 'sales' অথবা 'invoices' হতে পারে। আমরা দুটিই চেক করার ব্যবস্থা রেখেছি:
//     const db = mongoose.connection.db;
    
//     // ১. প্রথমে 'sales' কালেকশনে খোঁজ করা, না পাওয়া গেলে 'invoices' কালেকশনে খোঁজ করা
//     let allSales = await db.collection("sales").find({}).toArray();
//     if (!allSales || allSales.length === 0) {
//       allSales = await db.collection("invoices").find({}).toArray();
//     }

//     // ডাটাবেজে যদি তাও না পাওয়া যায় সেফটি মেসেজ
//     if (!allSales || allSales.length === 0) {
//       return res.status(200).json({ message: "No invoices found in raw collections" });
//     }

//     // ২. লুপ চালিয়ে ডিলার এবং ডিলারের আন্ডারে থাকা MKT Employee ডাটা মার্চ (Merge) করা
//     const enrichedSales = await Promise.all(
//       allSales.map(async (sale) => {
//         let dealerInfo = null;
//         let employeeInfo = null;

//         if (sale.dealer) {
//           // স্ট্রিং বা অবজেক্ট আইডি উভয় ফরম্যাটেই ডিলার খোঁজা যেন মিস না হয়
//           const dealerId = sale.dealer.toString();
//           dealerInfo = await Dealer.findOne({ 
//             $or: [
//               { _id: dealerId },
//               { _id: new mongoose.Types.ObjectId(dealerId) }
//             ]
//           }).lean();
          
//           // ডিলার পাওয়া গেলে তার 'referenceIdNo' (MKT-0008) দিয়ে এমপ্লয়ি খোঁজা
//           if (dealerInfo && dealerInfo.referenceIdNo) {
//             employeeInfo = await User.findOne({ idNo: dealerInfo.referenceIdNo })
//               .select("name idNo role department")
//               .lean();
//           }
//         }

//         return {
//           ...sale,
//           _id: sale._id.toString(), // ফ্রন্টএন্ডে ইউনিক কী (Key) এররের জন্য স্ট্রিং কনভার্ট
//           dealer: dealerInfo,
//           employeeInfo: employeeInfo
//         };
//       })
//     );

//     res.status(200).json(enrichedSales);
//   } catch (error) {
//     console.error("Native Sales Engine Error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// module.exports = {
//   getSalesWithEmployee,
// };


// 2nd version of sales controller with mongoose population for simplicity

const getSalesWithEmployee = async (req, res) => {
  try {
    // ১. সরাসরি মঙ্গুজ মডেল ব্যবহার করে সব ইনভয়েস নিয়ে আসা (এটি ফাস্ট এবং সিকিউর)
    const allSales = await Invoice.find({}).lean();

    if (!allSales || allSales.length === 0) {
      return res.status(200).json({ message: "No invoices found" });
    }

    // ২. লুপ চালিয়ে আর্কাইভড ও লাইভ ডাটা ডাইনামিকালি মার্চ করা
    const enrichedSales = await Promise.all(
      allSales.map(async (sale) => {
        
        // ক) যদি ইনভয়েসটি ইতিমধ্যে মাসের শেষে আর্কাইভড হয়ে থাকে (isMonthlyArchived: true)
        if (sale.isMonthlyArchived && sale.archivedSalesData) {
          return {
            ...sale,
            _id: sale._id.toString(),
            // আর্কাইভড স্ন্যাপশট ডাটাকে আগের ফরম্যাটের সাথে মিল রেখে রিটার্ন করা
            dealer: sale.archivedSalesData.dealerSnapshot || null,
            employeeInfo: sale.archivedSalesData.employeeSnapshot || null,
            isArchivedRecord: true // ফ্রন্টএন্ডে ট্র্যাকিংয়ের জন্য একটি ফ্ল্যাগ
          };
        }

        // খ) যদি ইনভয়েসটি রানিং মাসের হয় (এখনো আর্কাইভ করা হয়নি)
        let dealerInfo = null;
        let employeeInfo = null;

        if (sale.dealer) {
          const dealerId = sale.dealer.toString();
          
          // লাইভ ডিলার ডাটা খোঁজা
          dealerInfo = await Dealer.findOne({ 
            $or: [
              { _id: dealerId },
              { _id: new mongoose.Types.ObjectId(dealerId) }
            ]
          }).lean();
          
          // ডিলারের লাইভ 'referenceIdNo' দিয়ে কারেন্ট এমপ্লয়ি খোঁজা
          if (dealerInfo && dealerInfo.referenceIdNo) {
            employeeInfo = await User.findOne({ idNo: dealerInfo.referenceIdNo })
              .select("name idNo role department")
              .lean();
          }
        }

        return {
          ...sale,
          _id: sale._id.toString(),
          dealer: dealerInfo,
          employeeInfo: employeeInfo,
          isArchivedRecord: false
        };
      })
    );

    res.status(200).json(enrichedSales);
  } catch (error) {
    console.error("Sales Engine Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// 🆕 ৩. প্রতি মাসের শেষে রান করার জন্য ম্যানুয়াল/অটোমেটিক আর্কাইভ ফাংশন
// এটি কল করলে রানিং মাসের সব ইনভয়েস লক হয়ে যাবে এবং ভবিষ্যতে আইডি চেঞ্জ হলেও ডাটা মুছবে না
const archiveMonthlySales = async (req, res) => {
  try {
    // যে ইনভয়েসগুলো এখনো আর্কাইভ করা হয়নি সেগুলো খুঁজে বের করা
    const pendingInvoices = await Invoice.find({ isMonthlyArchived: false });

    if (!pendingInvoices || pendingInvoices.length === 0) {
      return res.status(200).json({ message: "All invoices are already archived for this month." });
    }

    let archivedCount = 0;

    for (let invoice of pendingInvoices) {
      if (invoice.dealer) {
        const dealerInfo = await Dealer.findById(invoice.dealer).lean();
        
        if (dealerInfo) {
          const employeeInfo = await User.findOne({ idNo: dealerInfo.referenceIdNo }).lean();

          // ইনভয়েস মডেলে স্থায়ীভাবে স্ন্যাপশট অবজেক্ট রাইট করা
          invoice.archivedSalesData = {
            dealerSnapshot: {
              idNo: dealerInfo.dealerId,
              name: dealerInfo.name
            },
            employeeSnapshot: employeeInfo ? {
              idNo: employeeInfo.idNo,
              name: employeeInfo.name,
              department: employeeInfo.department || 'MKT'
            } : { idNo: 'N/A', name: 'System/Deleted', department: 'MKT' },
            archivedAt: new Date()
          };

          invoice.isMonthlyArchived = true;
          await invoice.save();
          archivedCount++;
        }
      }
    }

    res.status(200).json({ 
      message: `Success! Successfully archived and locked ${archivedCount} invoices for this month.` 
    });

  } catch (error) {
    console.error("Archive Process Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// 🆕 এমপ্লয়ী ড্যাশবোর্ডের জন্য শুধুমাত্র কোয়ালিফাইড মেম্বারদের কাউন্ট পাঠানো
const getEmployeeDashboardStats = async (req, res) => {
  try {
    const currentYear = parseInt(req.query.year) || new Date().getFullYear();
    const currentMonth = parseInt(req.query.month) || (new Date().getMonth() + 1);

    const MonthlyLedger = require('../models/MonthlyLedger');
    const savedLedger = await MonthlyLedger.findOne({ year: currentYear, month: currentMonth });

    // ১. যদি অ্যাডমিন এখনও লেজার লক না করে থাকে, তবে ফলব্যাক হিসেবে জিরো ডাটা পাঠানো
    if (!savedLedger) {
      return res.status(200).json({
        success: true,
        isDataLocked: false,
        totalCompanySales: 0,
        totalEmployeeQualify: 0,
        totalDealerQualify: 0,
        poolCounters: { RSM: 0, DSM: 0, SDSM: 0, SM: 0, NSM: 0, ED: 0, BOM: 0 }
      });
    }

    // 🔒 ২. লজিক ফিক্স: কর্মচারীদের স্ন্যাপশট থেকে শুধুমাত্র "Qualified" মেম্বারদের ফিল্টার করে কাউন্ট করা
    const onlyQualifiedEmployeesCount = (savedLedger.employeesData || []).filter(
      emp => emp.qualificationStatus === "Qualified"
    ).length;

    // 🔒 ৩. লজিক ফিক্স: ডিলারদের স্ন্যাপশট থেকে শুধুমাত্র "Qualified" ডিলারদের ফিল্টার করে কাউন্ট করা
    const onlyQualifiedDealersCount = (savedLedger.dealersData || []).filter(
      dlr => dlr.status === "Qualified"
    ).length;

    // ৪. ফ্রন্টএন্ডে নিখুঁত ও ফিল্টারড ডেটা পাঠানো
    res.status(200).json({
      success: true,
      isDataLocked: true,
      totalCompanySales: savedLedger.meta?.totalCompanySales || 0,
      totalEmployeeQualify: onlyQualifiedEmployeesCount, // ডিসকোয়ালিফাইড মেম্বাররা বাদ
      totalDealerQualify: onlyQualifiedDealersCount,     // ডিসকোয়ালিফাইড ডিলাররা বাদ
      poolCounters: savedLedger.meta?.poolCounters || { RSM: 0, DSM: 0, SDSM: 0, SM: 0, NSM: 0, ED: 0, BOM: 0 }
    });

  } catch (error) {
    console.error("Dashboard Stats Filtering Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ⚙️ চলতি মাসের লাইভ হিসাব বের করার ইন্টারনাল হেল্পার ফাংশন
const calculateLiveCurrentMonthSales = async (idNo, year, month) => {
  const db = mongoose.connection.db;
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  // সব ইনভয়েস তুলে আনা
  let allLifetimeSales = await db.collection("invoices").find({}).toArray();
  if (!allLifetimeSales || allLifetimeSales.length === 0) {
    allLifetimeSales = await db.collection("sales").find({}).toArray();
  }

  const dealers = await db.collection("dealers").find({}).toArray();
  const users = await db.collection("users").find({ idNo: { $regex: /^MKT/i } }).toArray();

  const userSalesMap = {};
  const parentToChildrenMap = {}; 

  users.forEach(u => {
    userSalesMap[u.idNo] = { 
      idNo: u.idNo,
      directSalesThisMonth: 0, 
      thisMonthSalesVolume: 0 
    };
    const parentId = u.refIdNo || "0";
    if (!parentToChildrenMap[parentId]) parentToChildrenMap[parentId] = [];
    parentToChildrenMap[parentId].push(u.idNo); 
  });

  // ইনভয়েস লুপ দিয়ে ডাইরেক্ট সেলস ভাগ করা
  allLifetimeSales.forEach(sale => {
    const saleAmount = Number(sale.grandTotal || sale.totalAmount || sale.amount || 0);
    const saleDate = new Date(sale.date || sale.createdAt);
    const isSelectedMonth = saleDate >= startDate && saleDate < endDate;

    if (isSelectedMonth) {
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
        userSalesMap[targetEmployeeIdNo].directSalesThisMonth += saleAmount;
        userSalesMap[targetEmployeeIdNo].thisMonthSalesVolume += saleAmount;
      }
    }
  });

  // রিকার্সিভলি ডাউনলাইন টিমের লাইভ সেলস ভলিউম রোল-আপ করা
  const processedNodes = new Set();
  const rollUpLiveVolume = (currentIdNo) => {
    if (processedNodes.has(currentIdNo)) return;
    const childrenIds = parentToChildrenMap[currentIdNo] || [];
    childrenIds.forEach(childId => rollUpLiveVolume(childId));

    let teamSum = 0;
    childrenIds.forEach(childId => {
      if (userSalesMap[childId]) teamSum += userSalesMap[childId].thisMonthSalesVolume;
    });

    if (userSalesMap[currentIdNo]) userSalesMap[currentIdNo].thisMonthSalesVolume += teamSum;
    processedNodes.add(currentIdNo);
  };

  users.forEach(user => {
    if (user.refIdNo === "0" || !user.refIdNo || !userSalesMap[user.refIdNo]) {
      rollUpLiveVolume(user.idNo);
    }
  });

  // return userSalesMap[idNo] || { directSalesThisMonth: 0, thisMonthSalesVolume: 0 };

  // আপনার calculateLiveCurrentMonthSales ফাংশনের একদম শেষের রিটার্ন লাইনটি এরকম রাখুন:
return userSalesMap[idNo] || { directSalesThisMonth: 0, thisMonthSalesVolume: 0, autoPosition: "LIVE CALCULATION" };

};

// 🆕 কর্মচারীর নিজের মাস ভিত্তিক সেলস এবং লাইফটাইম টোটাল সেলস গেট করা
const getEmployeeMonthWiseSales = async (req, res) => {
  try {
    const { idNo, year, month } = req.query;
    if (!idNo || !year || !month) {
      return res.status(400).json({ success: false, message: "Missing required parameters" });
    }

    const targetYear = parseInt(year);
    const targetMonth = parseInt(month);

    const systemDate = new Date();
    const currentSystemYear = systemDate.getFullYear();
    const currentSystemMonth = systemDate.getMonth() + 1;

    const MonthlyLedger = require('../models/MonthlyLedger');

    // 🔒 ১. ডাটাবেজের সমস্ত ওল্ড লকড রেকর্ড থেকে লাইফটাইম পার্সোনাল এবং লাইফটাইম টিম সেলস ক্যালকুলেট করা
    const allPastLedgers = await MonthlyLedger.find({});
    let lifetimeDirectSalesSum = 0;
    let lifetimeTotalSalesVolumeSum = 0;
    
    allPastLedgers.forEach(ledger => {
      // চলতি চলমান মাস বাদে পেছনের সব মাসের ডাটা সামারি (Sum) হবে
      if (!(ledger.year === currentSystemYear && ledger.month === currentSystemMonth)) {
        const foundEmp = (ledger.employeesData || []).find(emp => emp.idNo === idNo);
        if (foundEmp) {
          // লাইফটাইম পার্সোনাল সেলস যোগ করা
          lifetimeDirectSalesSum += (foundEmp.directSalesThisMonth || 0);
          // লাইফটাইম মোট টিম সেলস ভলিউম যোগ করা (প্যারেন্টদের বেস ভ্যালু প্রোটেকশন)
          // নোট: রিকার্সিভ টিম সামারি ওল্ড লেজারে অলরেডি ক্যালকুলেটেড থাকে, তাই শুধু ওই মাসেরটা যোগ করলেই লাইফটাইম চলে আসবে
          lifetimeTotalSalesVolumeSum += (foundEmp.thisMonthSalesVolume || 0);
        }
      }
    });

        // ⚡ কন্ডিশন ১: যদি চলতি রানিং মাস সিলেক্ট করা হয় -> লাইভ ইনভয়েস কোয়েরি
    if (targetYear === currentSystemYear && targetMonth === currentSystemMonth) {
      console.log(`🌐 Fetching LIVE active sales calculation for ${targetMonth}/${targetYear}`);
      const liveData = await calculateLiveCurrentMonthSales(idNo, targetYear, targetMonth);
      
      const liveDirectThisMonth = Number(liveData.directSalesThisMonth || 0);
      const liveTeamThisMonth = Number(liveData.thisMonthSalesVolume || 0);

      return res.status(200).json({
        success: true,
        isLocked: false,
        // 💥 আপনার রিকোয়ার্ড অবজেক্ট ফরম্যাটে ডাইনামিক লাইভ ডাটা ম্যাপিং
        directSalesThisMonth: liveDirectThisMonth,
        thisMonthSalesVolume: liveTeamThisMonth,
        directSalesLifetime: lifetimeDirectSalesSum + liveDirectThisMonth,
        totalSalesVolume: lifetimeTotalSalesVolumeSum + liveTeamThisMonth,
        // 🎯 ফিক্স: প্লেসহোল্ডার "LIVE CALCULATION" বাদ দিয়ে লাইভ ক্যালকুলেশন থেকে জেনারেট হওয়া রিয়েল র‍্যাংক পজিশন (যেমন: DSM, NSM) পাস করা হলো
        position: liveData.autoPosition || "LIVE CALCULATION"
      });
    }

    // 🔒 কন্ডিশন ২: বিগত ওল্ড আর্কাইভড মাস হলে সরাসরি MonthlyLedger DB থেকে ডেটা রিড
    console.log(`📦 Fetching HISTORICAL locked ledger data for ${targetMonth}/${targetYear}`);
    const savedLedger = await MonthlyLedger.findOne({ year: targetYear, month: targetMonth });

    if (!savedLedger) {
      return res.status(200).json({
        success: true, 
        isLocked: true, 
        directSalesThisMonth: 0, 
        thisMonthSalesVolume: 0, 
        directSalesLifetime: lifetimeDirectSalesSum, 
        totalSalesVolume: lifetimeTotalSalesVolumeSum, 
        position: "N/A"
      });
    }

    const myData = (savedLedger.employeesData || []).find(emp => emp.idNo === idNo);
    
    const selectedDirectSales = myData ? (myData.directSalesThisMonth || 0) : 0;
    const selectedTeamSales = myData ? (myData.thisMonthSalesVolume || 0) : 0;

    res.status(200).json({
      success: true,
      isLocked: true,
      // 💥 ওল্ড রেকর্ড ভিউ মোডেও আপনার রিকোয়ার্ড মেমোরি কি (Keys) বাইন্ডিং
      directSalesThisMonth: selectedDirectSales,
      thisMonthSalesVolume: selectedTeamSales,
      // ওল্ড রেকর্ডের ক্ষেত্রে অলরেডি আর্কাইভড অবজেক্টে লাইফটাইম ট্র্যাকার থাকলে সেটি নিবে, না থাকলে সাম ভ্যালু পাস করবে
      directSalesLifetime: myData && myData.directSalesLifetime ? myData.directSalesLifetime : (lifetimeDirectSalesSum + selectedDirectSales),
      totalSalesVolume: myData && myData.totalSalesVolume ? myData.totalSalesVolume : (lifetimeTotalSalesVolumeSum + selectedTeamSales),
      position: myData ? (myData.autoPosition || myData.position || "LIVE CALCULATION") : "LIVE CALCULATION"
    });


  } catch (error) {
    console.error("Month-wise Sales Engine Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🆕 আলাদা এপিআই: শুধুমাত্র টিমের ইনভয়েস ওয়াইজ ব্রেকডাউন গেট করা
const getTeamInvoicesInvoiceWise = async (req, res) => {
  try {
    const { idNo, year, month } = req.query;
    if (!idNo || !year || !month) {
      return res.status(400).json({ success: false, message: "Missing required parameters" });
    }

    const targetYear = parseInt(year);
    const targetMonth = parseInt(month);
    const db = mongoose.connection.db;

    // ১. ডাউনলাইন আইডি ম্যাপ করার জন্য ইউজার ও ডিলার ডেটা রিড করা
    const users = await db.collection("users").find({ idNo: { $regex: /^MKT/i } }).toArray();
    const dealers = await db.collection("dealers").find({}).toArray();

    // 🌳 রিকার্সিভ কিউ অ্যালগরিদম (আমার পুরো টিমের চেইন মেম্বারদের আইডি লিস্ট বের করা)
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

    const myTeamIdNos = getAllDownlineIdNos(idNo);

    // ২. নির্দিষ্ট মাসের ইনভয়েসগুলো ফিল্টার করা
    let allInvoices = await db.collection("invoices").find({}).toArray();
    if (!allInvoices || allInvoices.length === 0) {
      allInvoices = await db.collection("sales").find({}).toArray();
    }

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 1);

    const filteredInvoices = allInvoices.filter(s => {
      const d = new Date(s.date || s.createdAt);
      return d >= startDate && d < endDate;
    });

    // ৩. ইনভয়েস থেকে শুধুমাত্র আমার টিমের মেম্বারদের বিল আলাদা করা
    const teamInvoicesLog = [];

    filteredInvoices.forEach(sale => {
      let saleEmployeeIdNo = null;
      let dealerName = "General Customer";
      let dealerIdNo = "N/A";

      if (sale.isMonthlyArchived && sale.archivedSalesData?.employeeSnapshot?.idNo) {
        saleEmployeeIdNo = sale.archivedSalesData.employeeSnapshot.idNo;
        dealerName = sale.archivedSalesData.dealerSnapshot?.name || "Unknown";
        dealerIdNo = sale.archivedSalesData.dealerSnapshot?.idNo || "N/A";
      } else if (sale.dealer) {
        const matchingDealer = dealers.find(d => d._id.toString() === sale.dealer.toString());
        if (matchingDealer) {
          saleEmployeeIdNo = matchingDealer.referenceIdNo;
          dealerName = matchingDealer.name;
          dealerIdNo = matchingDealer.dealerId || matchingDealer.idNo || "N/A";
        }
      }

      if (saleEmployeeIdNo && myTeamIdNos.includes(saleEmployeeIdNo)) {
        const creatorEmployee = users.find(u => u.idNo === saleEmployeeIdNo);
        
        teamInvoicesLog.push({
          _id: sale._id.toString(),
          invoiceNo: sale.invoiceNo || "INV-N/A",
          createdAt: sale.date || sale.createdAt,
          grandTotal: Number(sale.grandTotal || 0),
          paymentStatus: sale.paymentStatus || "Paid",
          dealer: { idNo: dealerIdNo, name: dealerName },
          employee: { idNo: saleEmployeeIdNo, name: creatorEmployee ? creatorEmployee.name : "Team Member" }
        });
      }
    });

    res.status(200).json({
      success: true,
      data: teamInvoicesLog
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};





module.exports = {
  getSalesWithEmployee,
  archiveMonthlySales, // নতুন রুট হ্যান্ডলার
  getEmployeeDashboardStats, // নতুন রুট হ্যান্ডলার
  getEmployeeMonthWiseSales, // নতুন রুট হ্যান্ডলার
  getTeamInvoicesInvoiceWise // নতুন রুট হ্যান্ডলার
};
