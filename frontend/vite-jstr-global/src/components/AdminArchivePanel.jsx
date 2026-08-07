import { useState } from 'react';
import API from '../api'; // আপনার তৈরি করা অ্যাক্সিওস/এপিআই ক্লায়েন্ট পাথ
import { Archive, RefreshCw, AlertTriangle, CheckCircle2, ChevronDown } from 'lucide-react';

const AdminArchivePanel = () => {
  // কারেন্ট মাস ও বছর ডিফল্ট স্টেট হিসেবে সেট করা হলো
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // মাস এবং বছরের ড্রপডাউন অপশন জেনারেটর
  const months = [
    { value: 1, name: 'January' }, { value: 2, name: 'February' },
    { value: 3, name: 'March' }, { value: 4, name: 'April' },
    { value: 5, name: 'May' }, { value: 6, name: 'June' },
    { value: 7, name: 'July' }, { value: 8, name: 'August' },
    { value: 9, name: 'September' }, { value: 10, name: 'October' },
    { value: 11, name: 'November' }, { value: 12, name: 'December' }
  ];
  
  // বিগত ৪ বছর থেকে আগামী বছর পর্যন্ত অপশন
  const years = Array.from({ length: 6 }, (_, i) => currentYear - 4 + i);

  // 🚀 ব্যাকঅ্যান্ড এপিআই-তে ডেটা লক করার রিকোয়েস্ট পাঠানো
  const handlePermanentlySaveLedger = async () => {
    setLoading(true);
    setStatusMessage({ type: '', text: '' });
    setIsModalOpen(false); // মডাল বন্ধ করা
    
    try {
      // আপনার তৈরি করা POST /save-monthly রুটে বছর ও মাস অবজেক্ট পাঠানো হচ্ছে
      const response = await API.post('/commissions/save-monthly', {
        year: selectedYear,
        month: selectedMonth
      });

      if (response.data.success) {
        setStatusMessage({
          type: 'success',
          text: response.data.message || `Success! Ledger for ${selectedMonth}/${selectedYear} has been locked.`
        });
      }
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to save and lock monthly ledger.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-erp-card border border-slate-100 max-w-2xl my-6 font-sans">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-amber-50 text-amber-600 rounded-xl flex-shrink-0">
          <Archive size={24} />
        </div>
        <div className="flex-1 w-full">
          <h3 className="text-xl font-bold text-slate-800">Monthly Commission Ledger Lock</h3>
          <p className="text-slate-500 text-sm mt-1">
            সিলেক্টেড মাসের সমস্ত লাইভ সেলস, ডিলার কমিশন এবং এমপ্লয়ি বোনাস গণনা করে ডাটাবেজে স্থায়ীভাবে স্ন্যাপশট হিসেবে সেভ করুন। একবার লক করা হলে ওই মাসের ডাটায় আর পরিবর্তন করা যাবে না।
          </p>
          
          {/* 📅 ফিল্টার সেকশন: মাস এবং বছর সিলেক্ট করার ড্রপডাউন */}
          <div className="grid grid-cols-2 gap-4 mt-6 max-w-md">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Target Month</label>
              <div className="relative">
                <select 
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none appearance-none cursor-pointer focus:border-brand transition-all"
                >
                  {months.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Target Year</label>
              <div className="relative">
                <select 
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none appearance-none cursor-pointer focus:border-brand transition-all"
                >
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* 🔔 রেসপন্স মেসেজ নোটিফিকেশন */}
          {statusMessage.text && (
            <div className={`mt-5 p-3.5 rounded-xl text-sm font-medium flex items-center gap-2.5 border ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-red-50 text-red-700 border-red-200'
            }`}>
              {statusMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
              {statusMessage.text}
            </div>
          )}

          {/* 🔘 অ্যাকশন বাটন */}
          <div className="mt-6">
            <button
              onClick={() => setIsModalOpen(true)}
              disabled={loading}
              className="px-5 py-3 bg-brand-dark hover:bg-slate-800 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? <RefreshCw size={16} className="animate-spin" /> : <Archive size={16} />}
              Calculate & Permanent Lock Ledger
            </button>
          </div>
        </div>
      </div>

      {/* ⚠️ ডাবল কনফার্মেশন মডাল পপআপ (Tailwind CSS Modal) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100 scale-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <div className="p-2 bg-red-50 rounded-lg">
                <AlertTriangle size={24} />
              </div>
              <h4 className="text-lg font-bold">আর্কাইভ লকিং কনফার্মেশন!</h4>
            </div>
            
            <p className="text-slate-600 text-sm leading-relaxed">
              আপনি <span className="font-bold text-slate-800">{months.find(m => m.value === selectedMonth)?.name}, {selectedYear}</span> মাসের কমিশন ও সেলস লেজার স্থায়ীভাবে লক করতে যাচ্ছেন।
            </p>
            <div className="my-4 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-500 font-medium space-y-1">
              <p>• এই অ্যাকশনটি সম্পন্ন হতে ১-৩ সেকেন্ড সময় লাগতে পারে।</p>
              <p>• লক করার পর কোনো কর্মচারীর ওল্ড পজিশন বা কমিশন পরিবর্তন সম্ভব নয়।</p>
              <p className="text-red-600 font-bold">• এটি একটি স্থায়ী ডেটা রাইট অপারেশন (Irreversible)।</p>
            </div>

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
              >
                বাতিল করুন
              </button>
              <button
                onClick={handlePermanentlySaveLedger}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md shadow-red-200 transition-all active:scale-95"
              >
                হ্যাঁ, নিশ্চিত করছি
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminArchivePanel;
