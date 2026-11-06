
const Invoice = require('../models/Invoice');

//const DeliveryProduct = require('../models/DeliveryProduct'); // যদি আপনার ডেলিভারির আলাদা মডেল থাকে
const Dealer = require('../models/Dealer');
const MonthlyLedger = require('../models/MonthlyLedger'); // আপনার মান্থলি লেজার মডেল
const Payout = require('../models/Payout');


const asyncHandler = require('express-async-handler');

// @desc    Get Detailed Invoice Report (Defaults to Today's data if no dates provided)
// @route   GET /api/reports/detailed-invoices
// @access  Private (Admin / Accounts)
const getDetailedInvoiceReport = asyncHandler(async (req, res) => {
  const { startDate, endDate, dealerId, partnerOrgId } = req.query;

  let query = {};

  // যদি ইউজার ডেট সিলেক্ট করে দেয়, তবে সেই রেঞ্জ অনুযায়ী ফিল্টার করবে
  if (startDate && endDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
    query.createdAt = { $gte: start, $lte: end };
  } else {
    // 👈 ডিফল্টভাবে আজকের (Today) ডেটা অটো-ফিল্টার করবে
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    query.createdAt = { $gte: todayStart, $lte: todayEnd };
  }

  if (dealerId) query.dealer = dealerId;
  if (partnerOrgId) query.partnerOrg = partnerOrgId;

  // ইনভয়েসগুলো ফেচ করা এবং ডিলার পপুলেট করা
  const invoices = await Invoice.find(query)
    .populate({
      path: 'dealer',
      select: 'dealerId name mobile referenceIdNo'
    })
    .sort({ createdAt: -1 });

  // প্রতিটি ইনভয়েসের জন্য ডেটা ফরম্যাট করা
  const reportData = invoices.map((inv, index) => {
    const cashPaid = inv.paymentMethod === 'Cash' ? inv.paidAmount : 0;
    const bankPaid = inv.paymentMethod === 'Bank' ? inv.paidAmount : 0;
    const advanceUsed = inv.advanceAdjustment?.adjustedAmount || 0;

    return {
      serialNo: index + 1,
      date: inv.createdAt,
      invoiceNo: inv.invoiceNo,
      dealerCode: inv.dealer?.dealerId || inv.dealer?.referenceIdNo || 'N/A',
      dealerName: inv.dealer?.name || 'N/A',
      customerName: inv.customerName || 'Walk-in / Direct',
      cash: cashPaid,
      bank: bankPaid,
      advance: advanceUsed,
      gross: inv.grandTotal,
      payable: inv.dueAmount
    };
  });

  res.status(200).json({
    success: true,
    count: reportData.length,
    data: reportData
  });
});


// @desc    Get Dealer Statement (Invoices & Deliveries)
// @route   GET /api/reports/dealer-statement/:dealerId
// @access  Private
// const getDealerStatement = asyncHandler(async (req, res) => {
//   const { dealerId } = req.params;
//   const { startDate, endDate } = req.query;

//   // ডিলার চেক করা
//   const dealer = await Dealer.findById(dealerId);
//   if (!dealer) {
//     res.status(404);
//     throw new Error('Dealer not found');
//   }

//   let dateQuery = {};
//   if (startDate && endDate) {
//     const start = new Date(startDate);
//     start.setHours(0, 0, 0, 0);
//     const end = new Date(endDate);
//     end.setHours(23, 59, 59, 999);
//     dateQuery.createdAt = { $gte: start, $lte: end };
//   }

//   // ১. ডিলারের ইনভয়েস ডেটা ফেচ করা
//   const invoices = await Invoice.find({ dealer: dealerId, ...dateQuery }).sort({ createdAt: 1 });

//   // ২. ডিলারের ডেলিভারি প্রোডাক্টস ডেটা ফেচ করা (যদি মডেল থাকে)
//   const deliveries = await DeliveryProduct.isArray ? [] : await DeliveryProduct.find({ dealer: dealerId, ...dateQuery }).sort({ createdAt: 1 });

//   // হিসাব নিকাশ (Totals & Balance)
//   let totalDebit = 0; // মোট বিল / গ্রস
//   let totalCredit = 0; // মোট পরিশোধ (ক্যাশ + ব্যাংক + অ্যাডভান্স)

//   const statementItems = invoices.map((inv, index) => {
//     const paid = (inv.paidAmount || 0) + (inv.advanceAdjustment?.adjustedAmount || 0);
//     const grandTotal = inv.grandTotal || 0;
//     const due = inv.dueAmount || 0;

//     totalDebit += grandTotal;
//     totalCredit += paid;

//     return {
//       serial: index + 1,
//       date: inv.createdAt,
//       invoiceNo: inv.invoiceNo,
//       type: 'Invoice',
//       particulars: `Invoice Sale (Ref: ${inv.invoiceNo})`,
//       debit: grandTotal, // পাওনা / বিল
//       credit: paid,      // জমা / পরিশোধ
//       balance: grandTotal - paid
//     };
//   });

//   res.status(200).json({
//     success: true,
//     dealer: {
//       name: dealer.name,
//       dealerId: dealer.dealerId,
//       mobile: dealer.mobile,
//       address: dealer.address
//     },
//     summary: {
//       totalDebit,
//       totalCredit,
//       currentDue: totalDebit - totalCredit
//     },
//     data: statementItems
//   });
// });

// @desc    Get Dealer Statement (Invoice data based only)
// @route   GET /api/reports/dealer-statement/:dealerId
// @access  Private
const getDealerStatementByCode = asyncHandler(async (req, res) => {
  const { code } = req.params;
  const { startDate, endDate } = req.query;

  // Regex ব্যবহার করা হয়েছে যাতে বড়/ছোট হাতের অক্ষর নিয়ে সমস্যা না হয়
  const dealer = await Dealer.findOne({ 
    $or: [
      { dealerId: { $regex: new RegExp(`^${code}$`, 'i') } }, 
      { referenceIdNo: { $regex: new RegExp(`^${code}$`, 'i') } }
    ] 
  });

  if (!dealer) {
    res.status(404);
    throw new Error('Dealer not found with this code');
  }

  let dateQuery = {};
  if (startDate && endDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    dateQuery.createdAt = { $gte: start, $lte: end };
  }

  const invoices = await Invoice.find({ dealer: dealer._id, ...dateQuery }).sort({ createdAt: 1 });

  let totalDebit = 0;
  let totalCredit = 0;
  let runningBalance = 0;

  const statementItems = invoices.map((inv, index) => {
    const billAmount = inv.grandTotal || 0;
    const paidAmount = (inv.paidAmount || 0) + (inv.advanceAdjustment?.adjustedAmount || 0);
    
    totalDebit += billAmount;
    totalCredit += paidAmount;
    runningBalance += (billAmount - paidAmount);

    return {
      serial: index + 1,
      date: inv.createdAt,
      invoiceNo: inv.invoiceNo,
      type: 'Invoice Sale',
      particulars: `Invoice Bill (Ref: ${inv.invoiceNo})`,
      debit: billAmount,
      credit: paidAmount,
      balance: runningBalance
    };
  });

  res.status(200).json({
    success: true,
    dealer: {
      name: dealer.name,
      dealerId: dealer.dealerId || dealer.referenceIdNo,
      mobile: dealer.mobilePhoneNo,
      address: dealer.address
    },
    summary: {
      totalDebit,
      totalCredit,
      currentDue: totalDebit - totalCredit
    },
    data: statementItems
  });
});


// @desc    Get Staff Statement (Income In vs Payout Out with 10% Audit Fee)
// @route   GET /api/reports/staff-statement/:idNo
// @access  Private
// const getStaffMonthlyStatement = asyncHandler(async (req, res) => {
//   const { idNo } = req.params;
//   const { year, month, startDate, endDate } = req.query;

//   if (!idNo) {
//     res.status(400);
//     throw new Error('Staff/Dealer ID No (idNo) is required!');
//   }

//   // ১. ডেট রেঞ্জ বা মাস-বছর ফিল্টার বাউন্ডারি সেটআপ
//   let start, end;
//   if (startDate && endDate) {
//     start = new Date(startDate);
//     end = new Date(endDate);
//     end.setHours(23, 59, 59, 999);
//   } else if (year && month) {
//     start = new Date(Number(year), Number(month) - 1, 1);
//     end = new Date(Number(year), Number(month), 0, 23, 59, 59, 999);
//   } else {
//     // ডিফল্ট চলতি মাস
//     const now = new Date();
//     start = new Date(now.getFullYear(), now.getMonth(), 1);
//     end = new Date();
//     end.setHours(23, 59, 59, 999);
//   }

//   // 🎯 idNo কে বড় হাতের অক্ষরে রূপান্তর করা হলো (Case-Insensitive Search)
//   const searchId = idNo.trim().toUpperCase();

//   // ২. ওপেনিং ব্যালেন্স ক্যালকুলেশন (ডেট রেঞ্জের পূর্বের সকল ইনকাম মাইনাস এপ্রুভড পেআউট)
//   const pastLedgers = await MonthlyLedger.find({
//     createdAt: { $lt: start }
//   });

//   let openingBalance = 0;

//   pastLedgers.forEach(ledger => {
//     let gross = 0;
//     let dataFound = false;

//     // স্টাফ আর্নিংস (Case-Insensitive Match)
//     const emp = ledger.employeesData?.find(e => e.idNo && e.idNo.toUpperCase() === searchId);
//     if (emp) {
//       gross += (emp.baseCommission || 0) + (emp.monthlyBonusAmount || 0) + (emp.globalPoolBonusAmount || 0);
//       dataFound = true;
//     }
    
//     // ডিলার আর্নিংস (Case-Insensitive Match)
//     const dealer = ledger.dealersData?.find(d => d.dealerId && d.dealerId.toUpperCase() === searchId);
//     if (dealer) {
//       gross += Number(dealer.commission || 0);
//       dataFound = true;
//     }

//     if (dataFound) {
//       const charge = Math.round(gross * 0.10); // ১০% সার্ভিস চার্জ
//       openingBalance += (gross - charge);
//     }
//   });

//   // পূর্ববর্তী অনুমোদিত ক্যাশআউট বিয়োগ (Case-Insensitive Search)
//   const pastPayouts = await Payout.find({
//     userIdNo: { $regex: new RegExp(`^${searchId}$`, 'i') },
//     createdAt: { $lt: start },
//     status: 'Approved'
//   });

//   pastPayouts.forEach(po => {
//     openingBalance -= Number(po.amount || 0);
//   });

//   // ৩. সিলেক্টেড ডেট রেঞ্জের লাইভ লেজার এবং পেআউট রিড করা
//   const currentLedgers = await MonthlyLedger.find({
//     createdAt: { $gte: start, $lte: end }
//   }).sort({ createdAt: 1 });

//   const currentPayouts = await Payout.find({
//     userIdNo: { $regex: new RegExp(`^${searchId}$`, 'i') },
//     createdAt: { $gte: start, $lte: end },
//     status: { $in: ['Approved', 'Pending'] }
//   }).sort({ createdAt: 1 });

//   // ৪. টাইমলাইন লগস তৈরি
//   let timelineLogs = [];
//   let totalIncomeIn = 0;
//   let totalPaymentOut = 0;

//   // লেজার থেকে ইনকাম (Credit / In)
//   currentLedgers.forEach(ledger => {
//     const monthNames = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
//     let totalGrossEarnings = 0;
//     let breakdownDetails = [];
//     let isAnyRecordFound = false;

//     // স্টাফ আর্নিংস (Case-Insensitive Match)
//     const emp = ledger.employeesData?.find(e => e.idNo && e.idNo.toUpperCase() === searchId);
//     if (emp) {
//       const staffGross = (emp.baseCommission || 0) + (emp.monthlyBonusAmount || 0) + (emp.globalPoolBonusAmount || 0);
//       totalGrossEarnings += staffGross;
//       breakdownDetails.push(`Staff: ৳${staffGross.toLocaleString()}`);
//       isAnyRecordFound = true;
//     }

//     // ডিলার আর্নিংস (Case-Insensitive Match)
//     const dealer = ledger.dealersData?.find(d => d.dealerId && d.dealerId.toUpperCase() === searchId);
//     if (dealer) {
//       const dealerGross = Number(dealer.commission || 0);
//       totalGrossEarnings += dealerGross;
//       breakdownDetails.push(`Dealer: ৳${dealerGross.toLocaleString()}`);
//       isAnyRecordFound = true;
//     }

//     if (isAnyRecordFound) {
//       const charge = Math.round(totalGrossEarnings * 0.10);
//       const netPayable = totalGrossEarnings - charge;

//       timelineLogs.push({
//         date: ledger.createdAt,
//         transactionId: `COM-${ledger.year}${String(ledger.month).padStart(2, '0')}`,
//         description: `Monthly Commission Released (${monthNames[ledger.month]}, ${ledger.year}) - [${breakdownDetails.join(' + ')}] | Gross: ৳${totalGrossEarnings.toLocaleString()}, Audit Fee 10%: -৳${charge.toLocaleString()}`,
//         type: 'credit', // Income (In)
//         amount: netPayable
//       });

//       totalIncomeIn += netPayable;
//     }
//   });

//   // পেআউট থেকে পেমেন্ট (Debit / Out)
//   currentPayouts.forEach(po => {
//     timelineLogs.push({
//       date: po.createdAt,
//       transactionId: po.transactionId || `TXN-PO-${po._id.toString().slice(-6).toUpperCase()}`,
//       description: `Cashout Disbursed via ${po.paymentMethod} [Note: ${po.note || 'N/A'}]`,
//       type: 'debit', // Payout (Out)
//       amount: Number(po.amount || 0),
//       status: po.status
//     });

//     if (po.status === 'Approved') {
//       totalPaymentOut += Number(po.amount || 0);
//     }
//   });

//   // ৫. তারিখ অনুযায়ী সর্টিং
//   timelineLogs.sort((a, b) => new Date(a.date) - new Date(b.date));

//   // ৬. রানিং ব্যালেন্স চেইন ক্যালকুলেশন
//   let runningBalance = openingBalance;
//   const finalizedTransactions = timelineLogs.map(log => {
//     if (log.type === 'credit') {
//       runningBalance += log.amount;
//     } else if (log.type === 'debit' && log.status === 'Approved') {
//       runningBalance -= log.amount;
//     }

//     return {
//       ...log,
//       runningBalance: runningBalance
//     };
//   });

//   res.status(200).json({
//     success: true,
//     employeeId: searchId,
//     summary: {
//       openingBalance,
//       totalIncomeIn,
//       totalPaymentOut,
//       closingBalance: runningBalance
//     },
//     transactions: finalizedTransactions.reverse() // সর্বশেষ ট্রানজেকশন উপরে দেখানোর জন্য
//   });
// });


// @desc    Get Staff Statement with Employee Info (Name, Phone, Address, Rank)
// @route   GET /api/reports/staff-statement/:idNo
// @access  Private
const getStaffMonthlyStatement = asyncHandler(async (req, res) => {
  const { idNo } = req.params;
  const { year, month, startDate, endDate } = req.query;

  if (!idNo) {
    res.status(400);
    throw new Error('Staff/Dealer ID No (idNo) is required!');
  }

  // ১. ডেট রেঞ্জ বা মাস-বছর ফিল্টার বাউন্ডারি সেটআপ
  let start, end;
  if (startDate && endDate) {
    start = new Date(startDate);
    end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
  } else if (year && month) {
    start = new Date(Number(year), Number(month) - 1, 1);
    end = new Date(Number(year), Number(month), 0, 23, 59, 59, 999);
  } else {
    // ডিফল্ট চলতি মাস
    const now = new Date();
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    end = new Date();
    end.setHours(23, 59, 59, 999);
  }

  const searchId = idNo.trim().toUpperCase();

  // স্টাফ বা ডিলারের বেসিক ইনফো খোঁজার জন্য ভেরিয়েবল
  let employeeInfo = {
    name: 'N/A',
    mobileNo: 'N/A',
    address: 'N/A',
    rank: 'N/A'
  };

  // ২. ওপেনিং ব্যালেন্স ক্যালকুলেশন এবং ইনফো এক্সট্র্যাক্ট
  const pastLedgers = await MonthlyLedger.find({
    createdAt: { $lt: start }
  });

  let openingBalance = 0;

  pastLedgers.forEach(ledger => {
    let gross = 0;
    let dataFound = false;

    // স্টাফ আর্নিংস
    const emp = ledger.employeesData?.find(e => e.idNo && e.idNo.toUpperCase() === searchId);
    if (emp) {
      gross += (emp.baseCommission || 0) + (emp.monthlyBonusAmount || 0) + (emp.globalPoolBonusAmount || 0);
      dataFound = true;
      // ইনফো আপডেট
      if (emp.name) employeeInfo.name = emp.name;
      if (emp.mobileNo || emp.phone) employeeInfo.mobileNo = emp.mobileNo || emp.phone;
      if (emp.address) employeeInfo.address = emp.address;
      if (emp.rank) employeeInfo.rank = emp.rank;
    }
    
    // ডিলার আর্নিংস
    const dealer = ledger.dealersData?.find(d => d.dealerId && d.dealerId.toUpperCase() === searchId);
    if (dealer) {
      gross += Number(dealer.commission || 0);
      dataFound = true;
      if (dealer.name) employeeInfo.name = dealer.name;
      if (dealer.mobileNo || dealer.phone) employeeInfo.mobileNo = dealer.mobileNo || dealer.phone;
      if (dealer.address) employeeInfo.address = dealer.address;
      if (dealer.status) employeeInfo.rank = `Dealer (${dealer.status})`;
    }

    if (dataFound) {
      const charge = Math.round(gross * 0.10);
      openingBalance += (gross - charge);
    }
  });

  // পূর্ববর্তী অনুমোদিত ক্যাশআউট বিয়োগ
  const pastPayouts = await Payout.find({
    userIdNo: { $regex: new RegExp(`^${searchId}$`, 'i') },
    createdAt: { $lt: start },
    status: 'Approved'
  });

  pastPayouts.forEach(po => {
    openingBalance -= Number(po.amount || 0);
    // পেআউট থেকে নাম বা অ্যাকাউন্ট ডিটেইলস নেওয়া যেতে পারে যদি লেজারে না থাকে
    if (po.name && employeeInfo.name === 'N/A') employeeInfo.name = po.name;
  });

  // ৩. সিলেক্টেড ডেট রেঞ্জের লাইভ লেজার এবং পেআউট রিড করা
  const currentLedgers = await MonthlyLedger.find({
    createdAt: { $gte: start, $lte: end }
  }).sort({ createdAt: 1 });

  const currentPayouts = await Payout.find({
    userIdNo: { $regex: new RegExp(`^${searchId}$`, 'i') },
    createdAt: { $gte: start, $lte: end },
    status: { $in: ['Approved', 'Pending'] }
  }).sort({ createdAt: 1 });

  // ৪. টাইমলাইন লগস তৈরি
  let timelineLogs = [];
  let totalIncomeIn = 0;
  let totalPaymentOut = 0;

  currentLedgers.forEach(ledger => {
    const monthNames = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    let totalGrossEarnings = 0;
    let breakdownDetails = [];
    let isAnyRecordFound = false;

    const emp = ledger.employeesData?.find(e => e.idNo && e.idNo.toUpperCase() === searchId);
    if (emp) {
      const staffGross = (emp.baseCommission || 0) + (emp.monthlyBonusAmount || 0) + (emp.globalPoolBonusAmount || 0);
      totalGrossEarnings += staffGross;
      breakdownDetails.push(`Staff: ৳${staffGross.toLocaleString()}`);
      isAnyRecordFound = true;

      // লাইভ লেজার থেকে লেটেস্ট ইনফো ক্যাপচার
      if (emp.name) employeeInfo.name = emp.name;
      if (emp.mobileNo || emp.phone) employeeInfo.mobileNo = emp.mobileNo || emp.phone;
      if (emp.address) employeeInfo.address = emp.address;
      if (emp.rank) employeeInfo.rank = emp.rank;
    }

    const dealer = ledger.dealersData?.find(d => d.dealerId && d.dealerId.toUpperCase() === searchId);
    if (dealer) {
      const dealerGross = Number(dealer.commission || 0);
      totalGrossEarnings += dealerGross;
      breakdownDetails.push(`Dealer: ৳${dealerGross.toLocaleString()}`);
      isAnyRecordFound = true;

      if (dealer.name) employeeInfo.name = dealer.name;
      if (dealer.mobileNo || dealer.phone) employeeInfo.mobileNo = dealer.mobileNo || dealer.phone;
      if (dealer.address) employeeInfo.address = dealer.address;
    }

    if (isAnyRecordFound) {
      const charge = Math.round(totalGrossEarnings * 0.10);
      const netPayable = totalGrossEarnings - charge;

      timelineLogs.push({
        date: ledger.createdAt,
        transactionId: `COM-${ledger.year}${String(ledger.month).padStart(2, '0')}`,
        description: `Monthly Commission Released (${monthNames[ledger.month]}, ${ledger.year}) - [${breakdownDetails.join(' + ')}] | Gross: ৳${totalGrossEarnings.toLocaleString()}, Audit Fee 10%: -৳${charge.toLocaleString()}`,
        type: 'credit',
        amount: netPayable
      });

      totalIncomeIn += netPayable;
    }
  });

  currentPayouts.forEach(po => {
    timelineLogs.push({
      date: po.createdAt,
      transactionId: po.transactionId || `TXN-PO-${po._id.toString().slice(-6).toUpperCase()}`,
      description: `Cashout Disbursed via ${po.paymentMethod} [Note: ${po.note || 'N/A'}]`,
      type: 'debit',
      amount: Number(po.amount || 0),
      status: po.status
    });

    if (po.status === 'Approved') {
      totalPaymentOut += Number(po.amount || 0);
    }
  });

  // ৫. সর্টিং ও ব্যালেন্স ক্যালকুলেশন
  timelineLogs.sort((a, b) => new Date(a.date) - new Date(b.date));

  let runningBalance = openingBalance;
  const finalizedTransactions = timelineLogs.map(log => {
    if (log.type === 'credit') {
      runningBalance += log.amount;
    } else if (log.type === 'debit' && log.status === 'Approved') {
      runningBalance -= log.amount;
    }

    return {
      ...log,
      runningBalance: runningBalance
    };
  });

  res.status(200).json({
    success: true,
    employeeId: searchId,
    employeeInfo: employeeInfo, // স্টাফের নাম, ফোন, ঠিকানা ও র‍্যাংক এখানে পাঠানো হলো
    summary: {
      openingBalance,
      totalIncomeIn,
      totalPaymentOut,
      closingBalance: runningBalance
    },
    transactions: finalizedTransactions.reverse()
  });
});



module.exports = { getDetailedInvoiceReport, getDealerStatementByCode, getStaffMonthlyStatement };