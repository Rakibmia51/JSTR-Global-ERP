import { useState, useEffect } from 'react';
import API from '../api'; // আপনার তৈরি করা অ্যাক্সিওস/এপিআই ক্লায়েন্ট পাথ
import { BarChart2, ChevronDown, RefreshCw, FileText, Search, Calendar } from 'lucide-react';

const TeamInvoicesLog = () => {
  const userIdNo = localStorage.getItem('userIdNo') || 'N/A';
  
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const months = [
    { value: 1, name: 'January' }, { value: 2, name: 'February' }, { value: 3, name: 'March' }, 
    { value: 4, name: 'April' }, { value: 5, name: 'May' }, { value: 6, name: 'June' }, 
    { value: 7, name: 'July' }, { value: 8, name: 'August' }, { value: 9, name: 'September' }, 
    { value: 10, name: 'October' }, { value: 11, name: 'November' }, { value: 12, name: 'December' }
  ];
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const fetchTeamInvoices = async () => {
    if (userIdNo === 'N/A') return;
    setLoading(true);
    try {
      // 💡 আলাদা ডেডিকেটেড এন্ডপয়েন্টে হিট করা হচ্ছে
      const response = await API.get(
        `/sales/team-invoices-log?idNo=${userIdNo}&year=${selectedYear}&month=${selectedMonth}`
      );
      if (response.data.success) {
        setInvoices(response.data.data || []);
      }
    } catch (error) {
      console.error("Failed to load team invoice logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamInvoices();
  }, [selectedYear, selectedMonth]);

  // ইনভয়েস নম্বর বা কর্মচারীর নাম দিয়ে সার্চ ফিল্টারিং
  const filteredInvoices = invoices.filter(inv => 
    inv.invoiceNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.employee?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.employee?.idNo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans">
      
      {/* 🔝 হেডার ও ফিল্টার কন্ট্রোল বার */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <FileText className="text-brand" size={26} />
            Team Invoices Statement
          </h2>
          <p className="text-xs text-slate-500 mt-1">📊 আপনার পুরো ডাউনলাইন টিম চেইনের মেম্বারদের জেনারেট হওয়া ইনভয়েস বিবরণী।</p>
        </div>

        {/* ড্রপডাউন ফিল্টার গ্রুপ */}
        <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-200/60 shadow-sm flex-shrink-0">
          <div className="relative">
            <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-transparent text-xs font-bold text-slate-600 outline-none appearance-none cursor-pointer pr-5 pl-1"
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
              className="bg-transparent text-xs font-bold text-slate-600 outline-none appearance-none cursor-pointer pr-5 pl-1"
            >
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-0 top-1 text-slate-400 pointer-events-none" />
          </div>
          <button onClick={fetchTeamInvoices} className="text-slate-400 hover:text-brand transition-colors pl-1">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* 🔍 সার্চ ও কাউন্টার বার */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 justify-between items-center">
          <div className="relative w-full sm:w-72">
            <input 
              type="text" 
              placeholder="Search by Invoice No or Member..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none focus:border-brand transition-all" 
            />
            <Search size={14} className="absolute left-3 top-3 text-slate-400" />
          </div>
          <span className="px-3 py-1.5 bg-brand/10 text-brand-dark rounded-xl text-xs font-black uppercase flex items-center gap-1">
            <Calendar size={13}/> Total Billed Count: {filteredInvoices.length}
          </span>
        </div>

        {/* 📊 ডাটা টেবিল */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="p-4">Invoice details</th>
                <th className="p-4">Team Representative</th>
                <th className="p-4">Dealer / Client</th>
                <th className="p-4 text-right">Invoice Amount</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 font-medium divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="5" className="text-center p-12 text-slate-400 font-semibold animate-pulse">Mapping downline billing matrices...</td></tr>
              ) : filteredInvoices.length === 0 ? (
                <tr><td colSpan="5" className="text-center p-12 text-slate-400">No team invoices recorded for this period.</td></tr>
              ) : filteredInvoices.map((inv) => (
                <tr key={inv._id} className="hover:bg-slate-50/40 transition-colors">
                  
                  {/* ইনভয়েস নম্বর ও ডেট */}
                  <td className="p-4 flex flex-col">
                    <span className="font-bold text-slate-800 font-mono text-sm">{inv.invoiceNo}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      {new Date(inv.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </td>

                  {/* কোন কর্মচারী সেলসটি করেছে */}
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-700">{inv.employee?.name}</span>
                      <span className="text-[10px] text-indigo-600 font-mono font-bold">{inv.employee?.idNo}</span>
                    </div>
                  </td>

                  {/* কার নামে ইনভয়েস হয়েছে (ডিলার) */}
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-700">{inv.dealer?.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">ID: {inv.dealer?.idNo}</span>
                    </div>
                  </td>

                  {/* ইনভয়েস গ্র্যান্ড টোটাল */}
                  <td className="p-4 text-right font-black text-slate-900 text-sm">
                    ৳{inv.grandTotal?.toLocaleString()}
                  </td>

                  {/* পেমেন্ট স্ট্যাটাস */}
                  <td className="p-4 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      inv.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                    }`}>
                      {inv.paymentStatus}
                    </span>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TeamInvoicesLog;
