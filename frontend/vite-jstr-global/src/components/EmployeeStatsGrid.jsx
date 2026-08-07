import { useState, useEffect } from 'react';
import API from '../api'; // আপনার তৈরি করা অ্যাক্সিওস/এপিআই ক্লায়েন্ট পাথ
import { BarChart3, Users, Award, TrendingUp, Calendar, RefreshCw } from 'lucide-react';

const EmployeeStatsGrid = () => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() ;

  // স্টেট ম্যানেজমেন্ট
  const [stats, setStats] = useState({
    totalCompanySales: 0,
    totalEmployeeQualify: 0,
    totalDealerQualify: 0,
    poolCounters: { RSM: 0, DSM: 0, SDSM: 0, SM: 0, NSM: 0, ED: 0, BOM: 0 },
    isDataLocked: false
  });
  const [loading, setLoading] = useState(false);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      // ব্যাকএন্ড এপিআই কল
      const response = await API.get(`/sales/stats?year=${currentYear}&month=${currentMonth}`);
      if (response.data.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Error loading dashboard metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  return (
    <div className="space-y-6 font-sans">
      
      {/* 📅 লেজার লকড স্ট্যাটাস নোটিশ */}
      {!stats.isDataLocked && !loading && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2">
          <TrendingUp size={14} className="animate-pulse" />
          গত মাসের হিসাবটি এখনও খসড়া আকারে আছে। অ্যাডমিন প্যানেল থেকে চূড়ান্ত অনুমোদন (Lock) হওয়ার পর এই ড্যাশবোর্ড ডাটা আপডেট হবে।
        </div>
      )}

      {/* 1️⃣ ৩টি প্রধান স্ট্যাটাস কার্ড গ্রিড (Total Sales, Employee Qualify, Dealer Qualify) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* কার্ড ১: মোট কোম্পানি সেলস */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Company Sales</span>
            <h3 className="text-2xl font-black text-slate-800">
              {loading ? <RefreshCw className="animate-spin text-brand" size={18} /> : `৳${stats.totalCompanySales?.toLocaleString()}`}
            </h3>
          </div>
          <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <BarChart3 size={20} />
          </div>
        </div>

        {/* কার্ড ২: কোয়ালিফাইড এমপ্লয়ি সংখ্যা */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Employee Qualify</span>
            <h3 className="text-2xl font-black text-slate-800">
              {loading ? <RefreshCw className="animate-spin text-brand" size={18} /> : `${stats.totalEmployeeQualify} Members`}
            </h3>
          </div>
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <Users size={20} />
          </div>
        </div>

        {/* カード ৩: কোয়ালিফাইড ডিলার সংখ্যা */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Dealer Qualify</span>
            <h3 className="text-2xl font-black text-slate-800">
              {loading ? <RefreshCw className="animate-spin text-brand" size={18} /> : `${stats.totalDealerPayout || stats.totalDealerQualify} Dealers`}
            </h3>
          </div>
          <div className="p-3.5 bg-amber-50 text-amber-600 rounded-xl">
            <Award size={20} />
          </div>
        </div>
      </div>

      {/* 2️⃣ 🎯 গ্লোবাল পুল কাউন্টার মেট্রিক্স সেকশন */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Award className="text-brand" size={16} />
              Global Company Pool Share Counters
            </h4>
            <p className="text-[10px] text-slate-400 mt-0.5">গত মাসের পুলে মোট অর্জিত শেয়ার ও কোয়ালিফাইড মেম্বার কাউন্টার সামারি।</p>
          </div>
          <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-lg flex items-center gap-1">
            <Calendar size={12}/> Month: {currentMonth}/{currentYear}
          </span>
        </div>

        {/* পুল কাউন্টারের ডাইনামিক রেন্ডারিং লেআউট */}
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3 mt-4">
          {Object.entries(stats.poolCounters || {}).map(([poolName, count]) => (
            <div 
              key={poolName} 
              className={`p-3 rounded-xl border text-center transition-all ${
                count > 0 
                  ? 'bg-brand/5 border-brand/20 text-brand-dark shadow-sm' 
                  : 'bg-slate-50/50 border-slate-100 text-slate-400'
              }`}
            >
              <span className="block text-[10px] font-black uppercase tracking-wider mb-1">{poolName}</span>
              <div className="flex items-baseline justify-center gap-0.5">
                <span className={`text-xl font-black ${count > 0 ? 'text-slate-800' : 'text-slate-400'}`}>{count}</span>
                <span className="text-[9px] font-semibold text-slate-400">shares</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmployeeStatsGrid;
