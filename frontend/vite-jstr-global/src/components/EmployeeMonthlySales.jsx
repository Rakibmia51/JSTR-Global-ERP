import { useState, useEffect } from 'react';
import API from '../api'; // আপনার তৈরি করা অ্যাক্সিওস/এপিআই ক্লায়েন্ট পাথ
import { ShoppingBag, Users, ChevronDown, RefreshCw, BarChart2 } from 'lucide-react';

const EmployeeMonthlySales = () => {
  const userIdNo = localStorage.getItem('userIdNo') || 'N/A';
  
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  // মাস ও বছর ফিল্টার স্টেট
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [salesData, setSalesData] = useState({
    directSalesThisMonth: 0,
    thisMonthSalesVolume: 0,
    directSalesLifetime: 0,
    totalSalesVolume: 0,
    position: 'SALES REPRESENTATIVE', // ডাইনামিক র‍্যাংক হোল্ডার
    isLocked: false
  });
  const [loading, setLoading] = useState(false);

  const months = [
    { value: 1, name: 'January' }, { value: 2, name: 'February' },
    { value: 3, name: 'March' }, { value: 4, name: 'April' },
    { value: 5, name: 'May' }, { value: 6, name: 'June' },
    { value: 7, name: 'July' }, { value: 8, name: 'August' },
    { value: 9, name: 'September' }, { value: 10, name: 'October' },
    { value: 11, name: 'November' }, { value: 12, name: 'December' }
  ];

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // মাস ভিত্তিক সেলস ডাটা ফেচ করা
  const fetchMonthlySalesHistory = async () => {
    if (userIdNo === 'N/A') return;
    setLoading(true);
    try {
      const response = await API.get(
        `/sales/my-monthly-sales?idNo=${userIdNo}&year=${selectedYear}&month=${selectedMonth}`
      );
      if (response.data.success) {
        setSalesData(response.data);
      }
    } catch (error) {
      console.error("Failed to load monthly sales profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthlySalesHistory();
  }, [selectedYear, selectedMonth]);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm font-sans mt-6">
      
      {/* 🔝 হেডার ও ফিল্টার কন্ট্রোল বার */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-5">
        <div>
          <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <BarChart2 className="text-brand" size={18} />
            My Sales Analytics (Month-wise)
          </h4>
          <p className="text-[11px] text-slate-400 mt-0.5">যেকোনো নির্দিষ্ট মাস সিলেক্ট করে নিজের এবং টিমের সেলস পারফরম্যান্স ট্র্যাক করুন।</p>
        </div>

        {/* ড্রপডাউন ফিল্টার গ্রুপ */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-8 py-2 text-xs font-bold text-slate-600 outline-none appearance-none cursor-pointer focus:border-brand"
            >
              {months.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-3 text-slate-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-8 py-2 text-xs font-bold text-slate-600 outline-none appearance-none cursor-pointer focus:border-brand"
            >
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-3 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 📊 ৪-কলাম বিশিষ্ট সেলস ডিসপ্লে গ্রিড কার্ডস (আপনার অবজেক্ট ফরম্যাট অনুযায়ী) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* কার্ড ১: পার্সোনাল কারেন্ট সেলস এবং ডাইনামিক র‍্যাংক */}
        <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100/40 border border-slate-100 rounded-xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <ShoppingBag size={12} className="text-indigo-500" /> Direct Sales (Month)
            </span>
            <h3 className="text-lg font-black text-slate-800">
              {loading ? <RefreshCw className="animate-spin text-slate-400" size={14} /> : `৳${salesData.directSalesThisMonth?.toLocaleString()}`}
            </h3>
            {/* 🎯 ফিক্সড আপডেট: এখানে এখন লাইভ অথবা আর্কাইভড যেকোনো মোডেই ইউজারের রিয়েল র‍্যাংক শো করবে */}
            <span className="px-2 py-0.5 bg-brand/10 text-brand-dark font-black rounded text-[10px] inline-block mt-1">
              Rank: {salesData.position}
            </span>
          </div>
        </div>

        {/* কার্ড ২: টিম কারেন্ট সেলস ভলিউম */}
        <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100/40 border border-slate-100 rounded-xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Users size={12} className="text-emerald-500" /> Team Sales (Month)
            </span>
            <h3 className="text-lg font-black text-slate-800">
              {loading ? <RefreshCw className="animate-spin text-slate-400" size={14} /> : `৳${salesData.thisMonthSalesVolume?.toLocaleString()}`}
            </h3>
            <span className="text-[9px] font-mono text-slate-400 font-bold block pt-1.5">thisMonthSalesVolume</span>
          </div>
        </div>

        {/* কার্ড ৩: পার্সোনাল লাইফটাইম সেলস */}
        <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100/40 border border-slate-100 rounded-xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <ShoppingBag size={12} className="text-amber-500" /> Direct Sales (Lifetime)
            </span>
            <h3 className="text-lg font-black text-slate-800">
              {loading ? <RefreshCw className="animate-spin text-slate-400" size={14} /> : `৳${salesData.directSalesLifetime?.toLocaleString()}`}
            </h3>
            <span className="text-[9px] font-mono text-slate-400 font-bold block pt-1.5">directSalesLifetime</span>
          </div>
        </div>

        {/* কার্ড ৪: টিম লাইফটাইম টোটাল সেলস ভলিউম */}
        <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100/40 border border-slate-100 rounded-xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-amber-600/80 uppercase tracking-wider flex items-center gap-1">
              <BarChart2 size={12} className="text-brand" /> Total Sales Volume
            </span>
            <h3 className="text-lg font-black text-slate-900">
              {loading ? <RefreshCw className="animate-spin text-slate-400" size={14} /> : `৳${salesData.totalSalesVolume?.toLocaleString()}`}
            </h3>
            <span className="text-[9px] font-mono text-slate-400 font-bold block pt-1.5">totalSalesVolume</span>
          </div>
        </div>

      </div>

      {/* 📊 লাইভ বনাম আর্কাইভড ডেটা ট্র্যাকিং নোটিশ */}
      {!salesData.isLocked ? (
        <p className="text-[10px] font-bold text-indigo-600 mt-4 bg-indigo-50 p-2.5 rounded-xl border border-indigo-100 text-center animate-pulse">
          ⚡ রিয়েল-টাইম লাইভ মোড: আপনি চলতি চলমান মাসের লাইভ সেলস প্রোগ্রেস দেখছেন।
        </p>
      ) : (
        <p className="text-[10px] font-bold text-emerald-600 mt-4 bg-emerald-50 p-2.5 rounded-xl border border-emerald-100 text-center">
          🔒 আর্কাইভড হিস্ট্রি মোড: এই ডাটাটি ডাটাবেজে স্থায়ীভাবে লক করা সেন্ট্রাল লেজার থেকে প্রদর্শিত হচ্ছে।
        </p>
      )}
    </div>
  );
};

export default EmployeeMonthlySales;
