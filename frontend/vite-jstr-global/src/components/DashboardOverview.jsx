import { useState, useEffect } from 'react';
import API from '../api'; // আপনার তৈরি অ্যাক্সিওস বা এপিআই ক্লায়েন্ট পাথ
import { DollarSign, Calendar, TrendingUp, Wallet, Landmark, ArrowUpRight, AlertTriangle } from 'lucide-react';

const DashboardOverview = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // আপনার ব্যাকএন্ড এন্ডপয়েন্ট ইউআরএল (প্রয়োজন অনুযায়ী পরিবর্তন করে নিন)
        const response = await API.get('/invoices/dashboard-stats');
        
        if (response.data && response.data.success) {
          setMetrics(response.data.data);
        } else {
          setError("Failed to parse dynamic dashboard parameters.");
        }
      } catch (err) {
        console.error("Dashboard frontend fetching error:", err);
        setError("Network error. Could not connect to sales pipeline.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // ৫টি কার্ডের মূল স্ট্রাকচার ও স্কিমা কনফিগারেশন
  const cardSchema = metrics ? [
    { 
      title: 'Total Sales', 
      value: metrics.totalSales || 0, 
      subText: `Total Due: ৳${(metrics.totalDue || 0).toLocaleString()}`,
      subColor: 'text-rose-500',
      icon: DollarSign, 
      bg: 'bg-emerald-50 text-emerald-600 border-emerald-100' 
    },
    { 
      title: 'Yearly Sales', 
      value: metrics.yearlySales || 0, 
      subText: 'Running Calendar Year',
      subColor: 'text-slate-400',
      icon: Calendar, 
      bg: 'bg-blue-50 text-blue-600 border-blue-100' 
    },
    { 
      title: 'Monthly Sales', 
      value: metrics.monthlySales || 0, 
      subText: 'Current Month Matrix',
      subColor: 'text-slate-400',
      icon: TrendingUp, 
      bg: 'bg-purple-50 text-purple-600 border-purple-100' 
    },
    { 
      title: 'Today Sales', 
      value: metrics.todaySales || 0, 
      subText: 'Live Counter Tracker',
      subColor: 'text-emerald-500 animate-pulse',
      icon: Wallet, 
      bg: 'bg-amber-50 text-amber-600 border-amber-100' 
    },
    { 
      title: 'Expense & Bank Balance', 
      value: metrics.bankBalance || 0, 
      subText: `Expense: ৳${(metrics.expense || 0).toLocaleString()}`,
      subColor: 'text-rose-500 font-bold',
      icon: Landmark, 
      bg: 'bg-rose-50 text-rose-600 border-rose-100' 
    },
  ] : [];

  // ⚠️ ১. ডাটা লোডিং বা বাফারিং স্টেট (Skeleton View)
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 p-6 bg-slate-50 min-h-screen">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4 animate-pulse">
            <div className="w-10 h-10 bg-slate-200 rounded-xl"></div>
            <div className="space-y-2">
              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
              <div className="h-6 bg-slate-200 rounded w-3/4"></div>
              <div className="h-2 bg-slate-200 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ⚠️ ২. ব্যাকএন্ডে কোনো ক্র্যাশ বা নেটওয়ার্ক ইরর স্টেট
  if (error) {
    return (
      <div className="p-6 bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="bg-white border border-rose-100 rounded-2xl p-6 text-center max-w-sm shadow-sm">
          <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <AlertTriangle size={24} />
          </div>
          <h4 className="text-sm font-black text-slate-800">Metrics Disconnected</h4>
          <p className="text-xs text-slate-500 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  // 🚀 ৩. মেইন সাকসেসফুল গ্রিড ভিউ UI
  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      
      {/* ৫-কলাম ম্যাট্রিক্স গ্রিড লেআউট */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {cardSchema.map((card, i) => (
          <div 
            key={i} 
            className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group"
          >
            {/* কার্ড আপার রো (আইকন ও অ্যাকশন বাটন) */}
            <div className="flex justify-between items-start">
              <div className={`p-2.5 border rounded-xl ${card.bg}`}>
                <card.icon size={20} />
              </div>
              <span className="text-[10px] text-slate-400 font-bold bg-slate-50 border border-slate-100 px-2 py-0.5 rounded flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                Details <ArrowUpRight size={10} />
              </span>
            </div>

            {/* কার্ড ইনফরমেটিভ টেক্সট ও নাম্বারস */}
            <div className="mt-5">
              <p className="text-xs font-bold text-slate-400 tracking-tight uppercase">
                {card.title}
              </p>
              
              <h3 className="text-xl font-black text-slate-800 font-mono mt-1 tracking-tight">
                ৳{card.value.toLocaleString(undefined, { minimumFractionDigits: 0 })}
              </h3>
              
              <p className={`text-[10px] font-medium font-sans mt-1.5 ${card.subColor}`}>
                {card.subText}
              </p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default DashboardOverview;
