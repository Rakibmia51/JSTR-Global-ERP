const mongoose = require('mongoose');

const MonthlyLedgerSchema = new mongoose.Schema({
  year: { type: Number, required: true },
  month: { type: Number, required: true },
  meta: {
    totalCompanySales: { type: Number, required: true },
    poolCounters: { type: mongoose.Schema.Types.Mixed },
    processedUsersCount: { type: Number },
    processedDealersCount: { type: Number }
  },
  summary: {
    totalEmployeePayout: { type: Number },
    totalDealerPayout: { type: Number },
    grandTotalCompanyPayout: { type: Number }
  },
  // 🔒 কর্মচারীদের ফাইনাল ফ্ল্যাট হিস্ট্রি (আপনার চাওয়া হুবহু ফরম্যাটে)
  employeesData: [{ type: mongoose.Schema.Types.Mixed }],
  // 🔒 ডিলারদের ফাইনাল কমিশন হিস্ট্রি
  dealersData: [{ type: mongoose.Schema.Types.Mixed }]
}, { timestamps: true });

// একই মাস ও বছরের লেজার যেন ডাবল সেভ না হতে পারে (ইউনিক ইনডেক্স)
MonthlyLedgerSchema.index({ year: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('MonthlyLedger', MonthlyLedgerSchema);
