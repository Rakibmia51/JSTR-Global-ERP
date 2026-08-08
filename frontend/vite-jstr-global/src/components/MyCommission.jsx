import { useState, useEffect } from 'react';
import API from '../api'; // আপনার তৈরি করা অ্যাক্সিওস/এপিআই ক্লায়েন্ট পাথ
import { Landmark, Wallet, DollarSign, ChevronDown, RefreshCw, CheckCircle, AlertTriangle, HelpCircle, FileText } from 'lucide-react';

const MyCommission = () => {
  const userIdNo = localStorage.getItem('userIdNo') || 'N/A';
  
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [payoutData, setPayoutData] = useState({
    status: 'Pending',
    amount: 0,
    paymentMethod: 'N/A',
    accountDetails: 'N/A',
    transactionId: 'N/A',
    note: '',
    salesPayout: 0,
    poolBonus: 0,
    isLocked: false
  });
  const [loading, setLoading] = useState(false);

  const months = [
    { value: 1, name: 'January' }, { value: 2, name: 'February' }, { value: 3, name: 'March' }, 
    { value: 4, name: 'April' }, { value: 5, name: 'May' }, { value: 6, name: 'June' }, 
    { value: 7, name: 'July' }, { value: 8, name: 'August' }, { value: 9, name: 'September' }, 
    { value: 10, name: 'October' }, { value: 11, name: 'November' }, { value: 12, name: 'December' }
  ];
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const fetchMonthlyPayoutStatus = async () => {
    if (userIdNo === 'N/A') return;
    setLoading(true);
    try {
      const response = await API.get(
        `/commissions/my-monthly-commission?idNo=${userIdNo}&year=${selectedYear}&month=${selectedMonth}`
      );
      if (response.data.success) {
        setPayoutData(response.data);
      }
    } catch (error) {
      console.error("Failed to load monthly payout schema:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthlyPayoutStatus();
  }, [selectedYear, selectedMonth]);

  const isApproved = payoutData.status?.toLowerCase() === 'approved';

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans">
      
      {/* हेডার ও ফিল্টার বার */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Landmark className="text-brand" size={26} />
            My Commission Statement
          </h2>
          <p className="text-xs text-slate-500 mt-1">📊 আপনার নির্দিষ্ট মাসের পে-আউট স্লিপ এবং লাইভ ট্রানজেকশন ডেটা ট্র্যাক করুন।</p>
        </div>

        <div className="flex items-center gap-2.5 bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex-shrink-0">
          <div className="relative">
            <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-transparent text-xs font-bold text-slate-600 outline-none appearance-none cursor-pointer pr-6 pl-1"
            >
              {months.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-0 top-1 text-slate-400 pointer-events-none" />
          </div>
          <div className="h-4 w-px bg-slate-200"></div>
          <div className="relative">
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent text-xs font-bold text-slate-600 outline-none appearance-none cursor-pointer pr-6 pl-1"
            >
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-0 top-1 text-slate-400 pointer-events-none" />
          </div>
          <button onClick={fetchMonthlyPayoutStatus} className="text-slate-400 hover:text-brand transition-colors pl-1">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* বাম অংশ: আর্নিং বিবরণী কার্ড গ্রিড */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4 h-fit">
          
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sales Payout</span>
              <h3 className="text-lg font-black text-slate-800">
                ৳{payoutData.salesPayout?.toLocaleString()}
              </h3>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><DollarSign size={16} /></div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Global Pool Bonus</span>
              <h3 className="text-lg font-black text-slate-800">
                ৳{payoutData.poolBonus?.toLocaleString()}
              </h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Wallet size={16} /></div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Net Disbursed</span>
              <h3 className="text-lg font-black text-slate-900">
                ৳{payoutData.amount?.toLocaleString()}
              </h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Landmark size={16} /></div>
          </div>

          {/* 📄 নতুন যুক্ত হলো: ট্রানজেকশন রিসিট মেমো ডিটেইলস */}
          <div className="sm:col-span-3 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-50 pb-2">
              <FileText size={14} className="text-brand" /> Transaction Receipt Details
            </h4>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold text-slate-500">
              <div>
                <span className="text-[10px] text-slate-400 block mb-0.5">Method</span>
                <span className="text-slate-800 font-bold bg-slate-100 px-2 py-0.5 rounded font-mono">{payoutData.paymentMethod}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block mb-0.5">Account Number</span>
                <span className="text-slate-800 font-bold font-mono">{payoutData.accountDetails}</span>
              </div>
              <div className="col-span-2 sm:col-span-2">
                <span className="text-[10px] text-slate-400 block mb-0.5">Transaction ID (TxnID)</span>
                <span className="text-indigo-600 font-black font-mono tracking-wide selection:bg-indigo-100">{payoutData.transactionId}</span>
              </div>
            </div>

            {payoutData.note && (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px] font-medium text-slate-500">
                <span className="font-bold text-slate-700 block mb-0.5">Admin Note:</span>
                "{payoutData.note}"
              </div>
            )}
          </div>
        </div>

        {/* 💳 ডান অংশ: ডেডিকেটেড payouts স্ট্যাটাস কালার ইন্ডিকেটর */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between items-center text-center h-fit">
          <div className="w-full border-b border-slate-100 pb-3 mb-4 text-left">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Settlement Status</h4>
          </div>

          <div className="my-4 space-y-3 w-full flex flex-col items-center">
            <div className={`p-5 rounded-full ${isApproved ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
              {isApproved ? <CheckCircle size={36} /> : <AlertTriangle size={36} />}
            </div>
            <div>
              <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border ${
                isApproved ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-amber-50 border-amber-200 text-amber-700'
              }`}>
                {loading ? 'Processing...' : payoutData.status}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium px-4 pt-2">
              {isApproved 
                ? "আপনার পে-আউট স্লিপটি ফাইনাল অনুমোদন করা হয়েছে এবং ফান্ডটি ট্রান্সফার সম্পন্ন হয়েছে।" 
                : "এই মাসের কমিশন পেমেন্ট স্টেটমেন্টটি প্রসেসিংয়ে রয়েছে অথবা অ্যাডমিন অনুমোদনের অপেক্ষায় আছে।"}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MyCommission;
