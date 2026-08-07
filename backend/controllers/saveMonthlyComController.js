const saveMonthlyLedger = async (req, res) => {
  try {
    // 📥 ধাপ ১: ফ্রন্টএন্ডের রিকোয়েস্ট বডি (req.body) থেকে বছর ও মাস রিসিভ করা
    // ইউজার যদি বডিতে কিছু না পাঠায়, তবে ডিফল্ট হিসেবে কারেন্ট বছর ও মাস ধরে নিবে
    const currentYear = parseInt(req.body.year) || new Date().getFullYear();
    const currentMonth = parseInt(req.body.month) || (new Date().getMonth() + 1);

    // 🔍 ধাপ ২: ডাবল-লকিং প্রোটেকশন চেক
    // ডাটাবেজে অলরেডি এই নির্দিষ্ট মাস ও বছরের ডেটা সেভ করা আছে কিনা তা MonthlyLedger কালেকশনে খোঁজা হবে
    const existing = await MonthlyLedger.findOne({ year: currentYear, month: currentMonth });
    
    // যদি অলরেডি ডেটা থেকে থাকে, তবে নতুন করে সেভ না করে এরর মেসেজ রিটার্ন করবে
    if (existing) {
      return res.status(400).json({ 
        success: false, 
        message: `This month's (${currentMonth}/${currentYear}) ledger is already saved and locked!` 
      });
    }

    console.log(`🚀 Starting manual ledger save process for ${currentMonth}/${currentYear}...`);

    // ⚙️ ধাপ ৩: কোর ক্যালকুলেশন ইঞ্জিন কল করা
    // আমরা যে 'executeLedgerCalculationEngine' তৈরি করেছি, সেটিকে কল করে চলতি মাসের লাইভ ডেটা জেনারেট করা হবে
    const engineResult = await executeLedgerCalculationEngine(currentYear, currentMonth);

    // 💰 ধাপ ৪: কোম্পানির ফাইনাল পে-আউট হিসাব করা
    // ইঞ্জিনের তৈরি করা কর্মচারীদের ফ্ল্যাট লিস্ট এবং ডিলারদের লিস্ট থেকে মোট খরচের সামারি করা হচ্ছে
    const totalEmployeePayout = engineResult.finalLedgerList.reduce((sum, e) => sum + e.netTotalEarnings, 0);
    const totalDealerPayout = engineResult.qualifiedDealers.reduce((sum, d) => sum + d.commission, 0);

    // 💾 ধাপ ৫: মঙ্গোডিবি-তে চিরদিনের জন্য ডেটা অবজেক্ট আকারে রাইট/সেভ করা
    // MonthlyLedger মডেলের ভেতর সমস্ত লাইভ ডেটা স্ন্যাপশট (Hardcode) হিসেবে ঢুকিয়ে দেওয়া হচ্ছে
    const newMonthlyLedger = new MonthlyLedger({
      year: currentYear,
      month: currentMonth,
      meta: {
        totalCompanySales: engineResult.totalCompanySalesAmount, // কোম্পানির মোট মাসিক সেলস
        poolCounters: engineResult.poolShareCounters,           // কোন পুলে কতজন কোয়ালিফাই করেছে
        processedUsersCount: engineResult.finalLedgerList.length,
        processedDealersCount: engineResult.qualifiedDealers.length
      },
      summary: {
        totalEmployeePayout: Math.round(totalEmployeePayout),
        totalDealerPayout: Math.round(totalDealerPayout),
        grandTotalCompanyPayout: Math.round(totalEmployeePayout + totalDealerPayout)
      },
      employeesData: engineResult.finalLedgerList, // 🔒 কর্মচারীদের সমস্ত ডেটা স্প্রেডসহ ফ্ল্যাট আকারে সেভ হলো
      dealersData: engineResult.qualifiedDealers   // 🔒 ডিলারদের পুরো কমিশন লিস্ট সেভ হলো
    });

    // ডেটাবেজে সেভ কমপ্লিট করা
    await newMonthlyLedger.save();

    // 🎯 ধাপ ৬: ফ্রন্টএন্ডে সাকসেস রেসপন্স পাঠানো
    res.status(200).json({ 
      success: true, 
      message: `Success! Commission ledger for ${currentMonth}/${currentYear} has been permanently saved and locked.` 
    });

  } catch (error) {
    console.error("❌ Manual Ledger Save Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server failed to save monthly ledger", 
      error: error.message 
    });
  }
};
