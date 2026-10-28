const mongoose = require('mongoose');

const MonthlyLedger = require('../models/MonthlyLedger'); 
const Payout = require('../models/Payout');
/**
 * @desc    Get Account Ledger Statement by Date Range
 * @route   GET /api/accounts/statement
 * @access  Private/Protected
 */
const getAccountStatement = async (req, res) => {
//   try {
//     const { idNo, startDate, endDate } = req.query;

//     if (!idNo) {
//       return res.status(400).json({ success: false, message: "Staff/Dealer ID No (idNo) is required!" });
//     }

//     // ১. ডেট ফিল্টার বাউন্ডারি প্রিপারেশন
//     const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
//     const end = endDate ? new Date(endDate) : new Date();
//     end.setHours(23, 59, 59, 999);

//     // 🎯 ২. ওপেনিং ব্যালেন্স জেনারেট (ডেট রেঞ্জের পূর্বের রিলিজড স্যালারি বনাম এপ্রুভড ক্যাশআউট)
//     // [A] পূর্ববর্তী সমস্ত লকড লেজার থেকে ইউজারের ক্রেডিট ডাটা রিড
//     const pastLedgers = await MonthlyLedger.find({
//       createdAt: { $lt: start }
//     });

//     let openingBalance = 0;

//     pastLedgers.forEach(ledger => {
//       // employeesData অ্যারে থেকে কারেন্ট স্টাফ খুঁজে বের করা
//       const emp = ledger.employeesData?.find(e => e.idNo === idNo);
//       if (emp) {
//         const gross = (emp.baseCommission || 0) + (emp.monthlyBonusAmount || 0) + (emp.globalPoolBonusAmount || 0);
//         const charge = Math.round(gross * 0.10);
//         const netPayable = gross - charge;
//         openingBalance += netPayable;
//       }
      
//       // dealers অ্যারে থেকে কারেন্ট ডিলার খুঁজে বের করা
//       const dealer = ledger.dealers?.find(d => d.dealerId === idNo);
//       if (dealer) {
//         const gross = dealer.commission || 0;
//         const charge = Math.round(gross * 0.10);
//         openingBalance += (gross - charge);
//       }
//     });

//     // [B] 🎯 আপনার স্কিমা অনুযায়ী: পূর্ববর্তী সমস্ত অনুমোদিত (Approved) ক্যাশ-আউটের ডেবিট বিয়োগ
//     const pastPayouts = await Payout.find({
//       userIdNo: idNo,
//       createdAt: { $lt: start },
//       status: 'Approved' // 'Paid' এর জায়গায় স্কিমা অনুযায়ী 'Approved' সেট করা হয়েছে
//     });

//     pastPayouts.forEach(po => {
//       openingBalance -= Number(po.amount || 0);
//     });

//     // 🎯 ৩. সিলেক্টেড ডেট রেঞ্জের ভেতরের লাইভ ডাটা রিড করা
//     const currentLedgers = await MonthlyLedger.find({
//       createdAt: { $gte: start, $lte: end }
//     }).sort({ createdAt: 1 });

//     const currentPayouts = await Payout.find({
//       userIdNo: idNo,
//       createdAt: { $gte: start, $lte: end },
//       status: { $in: ['Approved', 'Pending'] } // Approved এবং Pending দুটোই টাইমলাইন ট্র্যাকিংয়ে আসবে
//     }).sort({ createdAt: 1 });

//     // ৪. ইউনিফাইড লেজার টাইমলাইন তৈরি
//     let timelineLogs = [];

//     // MonthlyLedger থেকে ক্রেডিট ইনজেকশন
//     currentLedgers.forEach(ledger => {
//       const monthNames = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      
//       const emp = ledger.employeesData?.find(e => e.idNo === idNo);
//       if (emp) {
//         const gross = (emp.baseCommission || 0) + (emp.monthlyBonusAmount || 0) + (emp.globalPoolBonusAmount || 0);
//         const charge = Math.round(gross * 0.10);
//         const net = gross - charge;

//         timelineLogs.push({
//           date: ledger.createdAt,
//           transactionId: `SAL-${ledger.year}${String(ledger.month).padStart(2, '0')}`,
//           description: `Monthly Commission Released (${monthNames[ledger.month]}, ${ledger.year}) - [Gross: ৳${gross.toLocaleString()}, Audit Fee 10%: -৳${charge.toLocaleString()}]`,
//           type: 'credit',
//           amount: net
//         });
//       }

//       const dealer = ledger.dealers?.find(d => d.dealerId === idNo);
//       if (dealer) {
//         const gross = dealer.commission || 0;
//         const charge = Math.round(gross * 0.10);
//         const net = gross - charge;

//         timelineLogs.push({
//           date: ledger.createdAt,
//           transactionId: `DLR-${ledger.year}${String(ledger.month).padStart(2, '0')}`,
//           description: `Dealer Account Commission Released (${monthNames[ledger.month]}, ${ledger.year}) - [Gross: ৳${gross.toLocaleString()}, Audit Fee 10%: -৳${charge.toLocaleString()}]`,
//           type: 'credit',
//           amount: net
//         });
//       }
//     });

//     // Payout থেকে ডেবিট উইথড্রাল পুশ (আপনার ডাটাবেজ প্রপার্টি ম্যাচিং)
//     currentPayouts.forEach(po => {
//       timelineLogs.push({
//         date: po.createdAt,
//         transactionId: po.transactionId || `TXN-PO-${po._id.toString().slice(-6).toUpperCase()}`,
//         description: `Cashout Disbursed via ${po.paymentMethod} [Note: ${po.note || 'N/A'}]`,
//         type: 'debit',
//         amount: Number(po.amount || 0),
//         status: po.status // 'Pending' অথবা 'Approved'
//       });
//     });

//     // ৫. ক্রোনোলজিক্যাল অর্ডারে শর্টিং (তারিখ অনুযায়ী সাজানো)
//     timelineLogs.sort((a, b) => new Date(a.date) - new Date(b.date));

//     // ৬. ডাইনামিক রানিং ব্যালেন্স চেইন ক্যালকুলেশন
//     let runningBalance = openingBalance;
//     let totalCredit = 0;
//     let totalDebit = 0;

//     const finalizedLedger = timelineLogs.map(log => {
//       if (log.type === 'credit') {
//         runningBalance += log.amount;
//         totalCredit += log.amount;
//       } else if (log.type === 'debit' && log.status === 'Approved') {
//         // 🎯 লজিক ফিক্স: স্ট্যাটাস 'Approved' হলেই কেবল রানিং ব্যালেন্স থেকে ডেবিট মাইনাস হবে
//         runningBalance -= log.amount;
//         totalDebit += log.amount;
//       }

//       return {
//         ...log,
//         runningBalance: runningBalance
//       };
//     });

//     // ৭. ফ্রন্টএন্ডে সর্বশেষ ডাটা উপরে দেখানোর জন্য রিভার্স করে পাঠানো
//     res.status(200).json({
//       success: true,
//       summary: {
//         totalCredit,
//         totalDebit,
//         closingBalance: runningBalance
//       },
//       transactions: finalizedLedger.reverse()
//     });

//   } catch (error) {
//     console.error("Account Statement Error Details:", error);
//     res.status(500).json({ success: false, message: "Failed to compile financial account ledger statement!" });
//   }

try {
    const { idNo, startDate, endDate } = req.query;

    if (!idNo) {
      return res.status(400).json({ success: false, message: "Staff/Dealer ID No (idNo) is required!" });
    }

    // ১. ডেট ফিল্টার বাউন্ডারি প্রিপারেশন
    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    // 🎯 ২. ওপেনিং ব্যালেন্স জেনারেট (ডেট রেঞ্জের পূর্বের রিলিজড স্যালারি ও ডিলার কমিশন মার্জড চেইন)
    const pastLedgers = await MonthlyLedger.find({
      createdAt: { $lt: start }
    });

    let openingBalance = 0;

    pastLedgers.forEach(ledger => {
      let gross = 0;
      let dataFound = false;

      // [A] স্টাফ ডাটা চেক
      const emp = ledger.employeesData?.find(e => e.idNo === idNo);
      if (emp) {
        gross += (emp.baseCommission || 0) + (emp.monthlyBonusAmount || 0) + (emp.globalPoolBonusAmount || 0);
        dataFound = true;
      }
      
      // [B] ডিলার ডাটা চেক
      const dealer = ledger.dealersData?.find(d => d.dealerId === idNo);
      if (dealer) {
        gross += Number(dealer.commission || 0);
        dataFound = true;
      }

      // যদি ডাটা পাওয়া যায় তবে মার্জড গ্রস থেকে ১০% সার্ভিস চার্জ কেটে ওপেনিংয়ে যোগ হবে
      if (dataFound) {
        const charge = Math.round(gross * 0.10);
        openingBalance += (gross - charge);
      }
    });

    // [C] পূর্ববর্তী সমস্ত অনুমোদিত (Approved) ক্যাশ-আউটের ডেবিট বিয়োগ
    const pastPayouts = await Payout.find({
      userIdNo: idNo,
      createdAt: { $lt: start },
      status: 'Approved'
    });

    pastPayouts.forEach(po => {
      openingBalance -= Number(po.amount || 0);
    });

    // 🎯 ৩. সিলেক্টেড ডেট রেঞ্জের ভেতরের লাইভ ডাটা রিড করা
    const currentLedgers = await MonthlyLedger.find({
      createdAt: { $gte: start, $lte: end }
    }).sort({ createdAt: 1 });

    const currentPayouts = await Payout.find({
      userIdNo: idNo,
      createdAt: { $gte: start, $lte: end },
      status: { $in: ['Approved', 'Pending'] }
    }).sort({ createdAt: 1 });

    // ৪. ইউনিফাইড লেজার টাইমলাইন তৈরি
    let timelineLogs = [];

    // 🎯 MonthlyLedger থেকে স্টাফ ও ডিলার কমিশন মার্জ করে ক্রেডিট ইনজেকশন
    currentLedgers.forEach(ledger => {
      const monthNames = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      
      let totalGrossEarnings = 0;
      let breakdownDetails = [];
      let isAnyRecordFound = false;

      // স্টাফ আর্নিংস ক্যালকুলেশন
      const emp = ledger.employeesData?.find(e => e.idNo === idNo);
      if (emp) {
        const staffGross = (emp.baseCommission || 0) + (emp.monthlyBonusAmount || 0) + (emp.globalPoolBonusAmount || 0);
        totalGrossEarnings += staffGross;
        breakdownDetails.push(`Staff: ৳${staffGross.toLocaleString()}`);
        isAnyRecordFound = true;
      }

      // ডিলার আর্নিংস ক্যালকুলেশন
      const dealer = ledger.dealersData?.find(d => d.dealerId === idNo);
      if (dealer) {
        const dealerGross = Number(dealer.commission || 0);
        totalGrossEarnings += dealerGross;
        breakdownDetails.push(`Dealer: ৳${dealerGross.toLocaleString()}`);
        isAnyRecordFound = true;
      }

      // 🔒 যদি ওই মাসে ইউজার বা ডিলার যেকোনো একটি বা দুটি রেকর্ডই থাকে, তবে মার্জড সিঙ্গেল এন্ট্রি হবে
      if (isAnyRecordFound) {
        const charge = Math.round(totalGrossEarnings * 0.10);
        const netPayable = totalGrossEarnings - charge;

        timelineLogs.push({
          date: ledger.createdAt,
          transactionId: `COM-${ledger.year}${String(ledger.month).padStart(2, '0')}`, // Unified Commission Code
          description: `Monthly Commission Released (${monthNames[ledger.month]}, ${ledger.year}) - [${breakdownDetails.join(' + ')}] | Gross: ৳${totalGrossEarnings.toLocaleString()}, Audit Fee 10%: -৳${charge.toLocaleString()}`,
          type: 'credit',
          amount: netPayable
        });
      }
    });

    // Payout থেকে ডেবিট উইথড্রাল পুশ
    currentPayouts.forEach(po => {
      timelineLogs.push({
        date: po.createdAt,
        transactionId: po.transactionId || `TXN-PO-${po._id.toString().slice(-6).toUpperCase()}`,
        description: `Cashout Disbursed via ${po.paymentMethod} [Note: ${po.note || 'N/A'}]`,
        type: 'debit',
        amount: Number(po.amount || 0),
        status: po.status
      });
    });

    // ৫. ক্রোনোলজিক্যাল অর্ডারে শর্টিং (তারিখ অনুযায়ী সাজানো)
    timelineLogs.sort((a, b) => new Date(a.date) - new Date(b.date));

    // ৬. ডাইনামিক রানিং ব্যালেন্স চেইন ক্যালকুলেশন
    let runningBalance = openingBalance;
    let totalCredit = 0;
    let totalDebit = 0;

    const finalizedLedger = timelineLogs.map(log => {
      if (log.type === 'credit') {
        runningBalance += log.amount;
        totalCredit += log.amount;
      } else if (log.type === 'debit' && log.status === 'Approved') {
        runningBalance -= log.amount;
        totalDebit += log.amount;
      }

      return {
        ...log,
        runningBalance: runningBalance
      };
    });

    // ৭. রেসপন্স রিটার্ন
    res.status(200).json({
      success: true,
      summary: {
        totalCredit,
        totalDebit,
        closingBalance: runningBalance
      },
      transactions: finalizedLedger.reverse()
    });

  } catch (error) {
    console.error("Account Statement Error Details:", error);
    res.status(500).json({ success: false, message: "Failed to compile financial account ledger statement!" });
  }
};

module.exports = {
  getAccountStatement
};