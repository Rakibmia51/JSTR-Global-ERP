
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

// @desc    Get Advanced Adjustment Reports from Invoices
// @route   GET /api/reports/advance-adjustments
// @access  Private
const getAdvanceAdjustmentReports = asyncHandler(async (req, res) => {
  const { employeeIdNo, startDate, endDate } = req.query;

  // কুয়েরি বিল্ডআপ
  let query = {
    "advanceAdjustment.employeeIdNo": { $exists: true, $ne: null }
  };

  // যদি নির্দিষ্ট স্টাফ বা ডিলার আইডি দিয়ে ফিল্টার করতে চান
  if (employeeIdNo) {
    query["advanceAdjustment.employeeIdNo"] = employeeIdNo.trim().toUpperCase();
  }

  // ডেট রেঞ্জ ফিল্টার (যদি থাকে)
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    query.createdAt = { $gte: start, $lte: end };
  }

  // ইনভয়েসগুলো ফেচ করা যেখানে অ্যাডভান্স অ্যাডজাস্টমেন্ট রয়েছে
  const invoices = await Invoice.find(query)
  .populate('dealer', 'dealerId name')
  .sort({ createdAt: -1 });

  let totalAdjustedSum = 0;
  let reportDetails = [];

  invoices.forEach(inv => {
    const adv = inv.advanceAdjustment;
    if (adv && adv.adjustedAmount > 0) {
      totalAdjustedSum += Number(adv.adjustedAmount);

      reportDetails.push({
        invoiceId: inv._id,
        invoiceNo: inv.invoiceNo,
        date: inv.createdAt,
        employeeIdNo: adv.employeeIdNo,
        employeeName: adv.employeeName || 'N/A',
        dealerCode: inv.dealer?.dealerId || inv.dealer?.code || 'N/A',
        adjustedAmount: adv.adjustedAmount,
        grandTotal: inv.grandTotal,
        paymentStatus: inv.paymentStatus
      });
    }
  });

  res.status(200).json({
    success: true,
    count: reportDetails.length,
    summary: {
      totalAdvanceAdjusted: totalAdjustedSum
    },
    adjustments: reportDetails
  });
});


// @desc    Get Total Staff Advance Summary Reports
// @route   GET /api/reports/advance-summary
// @access  Private
const getStaffAdvanceSummary = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  let matchQuery = {
    "advanceAdjustment.employeeIdNo": { $exists: true, $ne: null }
  };

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    matchQuery.createdAt = { $gte: start, $lte: end };
  }

  // MongoDB Aggregation দিয়ে স্টাফ/ডিলার অনুযায়ী গ্রুপ ও টোটাল হিসাব করা
  const summaryData = await Invoice.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: "$advanceAdjustment.employeeIdNo",
        employeeName: { $first: "$advanceAdjustment.employeeName" },
        totalInvoices: { $sum: 1 },
        totalAdjustedAmount: { $sum: "$advanceAdjustment.adjustedAmount" }
      }
    },
    { $sort: { totalAdjustedAmount: -1 } }
  ]);

  const grandTotalAdvance = summaryData.reduce((acc, curr) => acc + curr.totalAdjustedAmount, 0);

  res.status(200).json({
    success: true,
    totalStaffCount: summaryData.length,
    grandTotalAdvance,
    summary: summaryData
  });
});




module.exports = { 
  getDetailedInvoiceReport,
  getDealerStatementByCode, 
  getStaffMonthlyStatement, 
  getAdvanceAdjustmentReports,
  getStaffAdvanceSummary 
};