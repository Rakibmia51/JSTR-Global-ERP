import { useState, useEffect } from 'react';
import API from '../api'; // আপনার এপিআই ক্লায়েন্ট পাথ
import { 
  FileSpreadsheet, 
  Search, 
  Users, 
  Briefcase, 
  Lock, 
  CheckCircle, 
  XCircle, 
  Download, 
  RefreshCw,
  ChevronDown
} from 'lucide-react';
import AdminArchivePanel from '../components/AdminArchivePanel'; // পূর্বের তৈরি করা লক প্যানেল

const CommissionLedger = () => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  // ড্রপডাউন এবং ফিল্টার স্টেট
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonth);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('employees'); // 'employees' অথবা 'dealers'
  
  // ডেটা স্টেট
  const [ledgerData, setLedgerData] = useState([]);
  const [dealerData, setDealerData] = useState([]);
  const [metaSummary, setMetaSummary] = useState(null);
  const [isSavedRecord, setIsSavedRecord] = useState(false);
  const [loading, setLoading] = useState(false);

  // এপিআই থেকে লেজার ডেটা ফেচ করা
  const fetchLedgerData = async () => {
    setLoading(true);
    try {
      const response = await API.get(`/commissions?year=${year}&month=${month}`);
      if (response.data.success) {
        setLedgerData(response.data.data || []);
        setDealerData(response.data.dealers || []);
        setIsSavedRecord(response.data.isSavedRecord || false);
        setMetaSummary(response.data.summary || null);
      }
    } catch (error) {
      console.error("Failed to fetch ledger:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedgerData();
  }, [year, month]);

  // 📥 ডেটা CSV/Excel ফাইল আকারে এক্সপোর্ট করার মেথড
  // 📥 এক্সপোর্ট করার সময়ও শুধুমাত্র কোয়ালিফাইড মেম্বারদের ডাটা যাবে
  const handleExportToCSV = () => {
    let dataToExport = [];
    let headers = [];
    let filename = `Qualified-Ledger-${month}-${year}.csv`;

    if (activeTab === 'employees') {
      headers = ['ID No', 'Name', 'Position', 'Monthly Direct Sales', 'This Month Team Sales', 'Base Commission', 'Performance Bonus', 'Global Pool Bonus', 'Net Earnings'];
      // 💡 ফিক্স: ledgerData এর পরিবর্তে filteredEmployees ব্যবহার করা হয়েছে
      dataToExport = filteredEmployees.map(e => [
        e.idNo, e.name, e.autoPosition, e.directSalesThisMonth, e.thisMonthSalesVolume, e.baseCommission, e.monthlyBonusAmount, e.globalPoolBonusAmount, e.netTotalEarnings
      ]);
    } else {
      headers = ['Dealer ID', 'Name', 'Total Sales', 'Commission'];
      // 💡 ফিক্স: dealerData এর পরিবর্তে filteredDealers ব্যবহার করা হয়েছে
      dataToExport = filteredDealers.map(d => [
        d.dealerId, d.name, d.totalSales, d.commission
      ]);
    }

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...dataToExport.map(row => row.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  // সার্চ ফিল্টারিং লজিক
// 🔒 ফিক্সড: শুধুমাত্র Qualified কর্মচারীদের ফিল্টার করা (Disqualified রা বাদ যাবে)
  const filteredEmployees = ledgerData.filter(e => {
    const matchesSearch = 
      e.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      e.idNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.autoPosition?.toLowerCase().includes(searchTerm.toLowerCase());
      
    // শুধুমাত্র যাদের স্ট্যাটাস 'Qualified' তারা লিস্টে থাকবে
    return matchesSearch && e.qualificationStatus === 'Qualified';
  });

  // 🔒 ফিক্সড: শুধুমাত্র Qualified ডিলারদের ফিল্টার করা (Disqualified রা বাদ যাবে)
  const filteredDealers = dealerData.filter(d => {
    const matchesSearch = 
      d.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      d.dealerId?.toLowerCase().includes(searchTerm.toLowerCase());
      
    // শুধুমাত্র যাদের স্ট্যাটাস 'Qualified' (৳৫০০০ বা তার বেশি সেলস) তারা লিস্টে থাকবে
    return matchesSearch && d.status === 'Qualified';
  });


  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans">
      
      {/* 🔝 টপ হেডার ও ফিল্টার সেকশন */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="text-brand" size={28} />
            Commission Ledger Dashboard
          </h2>
          <p className="text-sm text-slate-500 mt-1">📊 কোম্পানির মাসিক পে-আউট এবং জেনারেশন বোনাস অডিট প্যানেল।</p>
        </div>

        {/* মাস ও বছর সিলেক্টর */}
        <div className="flex items-center gap-3">
          <select 
            value={month} 
            onChange={(e) => setMonth(Number(e.target.value))}
            className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm outline-none cursor-pointer focus:border-brand"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('en', { month: 'long' })}</option>
            ))}
          </select>

          <select 
            value={year} 
            onChange={(e) => setYear(Number(e.target.value))}
            className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm outline-none cursor-pointer focus:border-brand"
          >
            {Array.from({ length: 5 }, (_, i) => (
              <option key={i} value={currentYear - i}>{currentYear - i}</option>
            ))}
          </select>

          <button 
            onClick={fetchLedgerData}
            className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-brand shadow-sm transition-all"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* 🔒 রেকর্ড স্ট্যাটাস ও লক বাটন ইন্টিগ্রেশন */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          {/* লেজার লক করার বাটন প্যানেল */}
          {!isSavedRecord && <AdminArchivePanel onSuccess={fetchLedgerData} />}
          
          {isSavedRecord && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 text-emerald-800 my-4">
              <Lock size={20} className="text-emerald-600 flex-shrink-0" />
              <div className="text-sm font-medium">
                <span className="font-bold">🔒 এই মাসের লেজার লকড!</span> ডাটাবেজে এই রেকর্ডটি চিরতরে স্ন্যাপশট করা আছে। লাইভ প্রোফাইল পরিবর্তনের কোনো প্রভাব এই ডাটায় পড়বে না।
              </div>
            </div>
          )}
        </div>

        {/* 💰 ছোট খরচের সামারি কার্ড */}
        {metaSummary && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Month Payout</h4>
            <div className="my-2">
              <span className="text-3xl font-black text-slate-800">৳{metaSummary.grandTotalCompanyPayout?.toLocaleString()}</span>
            </div>
            <div className="space-y-1 text-xs border-t border-slate-100 pt-2 font-semibold">
              <div className="flex justify-between text-slate-500"><span>Marketing Team:</span> <span className="text-slate-700">৳{metaSummary.totalEmployeePayout?.toLocaleString()}</span></div>
              <div className="flex justify-between text-slate-500"><span>Dealers Net:</span> <span className="text-slate-700">৳{metaSummary.totalDealerPayout?.toLocaleString()}</span></div>
            </div>
          </div>
        )}
      </div>

      {/* 📑 ট্যাব সুইচ এবং সার্চ বার */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
            <button 
              onClick={() => setActiveTab('employees')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'employees' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <Users size={14} /> Marketing Team ({ledgerData.length})
            </button>
            <button 
              onClick={() => setActiveTab('dealers')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'dealers' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <Briefcase size={14} /> Dealers Net ({dealerData.length})
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-64">
              <input 
                type="text" 
                placeholder="Search by Name, ID, Rank..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none focus:border-brand transition-all"
              />
              <Search size={14} className="absolute left-3 top-3 text-slate-400" />
            </div>
            
            <button 
              onClick={handleExportToCSV}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex-shrink-0"
            >
              <Download size={14} /> Export CSV
            </button>
          </div>
        </div>

                {/* 📊 মেইন ডেটা গ্রিড টেবিল */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 text-slate-400 gap-2">
              <RefreshCw size={24} className="animate-spin text-brand" />
              <span className="text-xs font-semibold">Ledger data computing...</span>
            </div>
          ) : activeTab === 'employees' ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold text-xs uppercase">
                  <th className="p-4">User Details</th>
                  <th className="p-4">Position</th>
                  <th className="p-4 text-right">Personal Sales</th>
                  <th className="p-4 text-right">Team Sales</th>
                  <th className="p-4 text-right">Gap Comm.</th>
                  <th className="p-4 text-right">Perf. Bonus</th>
                  <th className="p-4 text-right">Pool Share</th>
                  <th className="p-4 text-right">Net Income</th>
                  <th className="p-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="text-slate-600 text-xs font-medium divide-y divide-slate-100">
                {filteredEmployees.length === 0 ? (
                  <tr><td colSpan="9" className="text-center p-8 text-slate-400">No records found for this period.</td></tr>
                ) : filteredEmployees.map((emp) => (
                  <tr key={emp.idNo} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 flex flex-col">
                      <span className="font-bold text-slate-800">{emp.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5">{emp.idNo}</span>
                    </td>
                    <td className="p-4"><span className="px-2 py-1 bg-slate-100 text-slate-700 font-bold rounded text-[10px] uppercase">{emp.autoPosition}</span></td>
                    <td className="p-4 text-right font-semibold">৳{emp.directSalesThisMonth?.toLocaleString()}</td>
                    <td className="p-4 text-right font-semibold text-slate-500">৳{emp.thisMonthSalesVolume?.toLocaleString()}</td>
                    <td className="p-4 text-right text-indigo-600 font-semibold">৳{emp.baseCommission?.toLocaleString()}</td>
                    <td className="p-4 text-right text-amber-600 font-semibold">৳{emp.monthlyBonusAmount?.toLocaleString()}</td>
                    <td className="p-4 text-right text-emerald-600 font-semibold">৳{emp.globalPoolBonusAmount?.toLocaleString()}</td>
                    <td className="p-4 text-right font-bold text-slate-900 bg-slate-50/40">৳{emp.netTotalEarnings?.toLocaleString()}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${emp.qualificationStatus === 'Qualified' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                        {emp.qualificationStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            // 🤝 ডিলার টেবিল ভিউ
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold text-xs uppercase">
                  <th className="p-4">Dealer Details</th>
                  <th className="p-4 text-right">Total TurnOver Sales</th>
                  <th className="p-4 text-right">Dealer Commission</th>
                  <th className="p-4 text-center">Audit Status</th>
                </tr>
              </thead>
              <tbody className="text-slate-600 text-xs font-medium divide-y divide-slate-100">
                {filteredDealers.length === 0 ? (
                  <tr><td colSpan="4" className="text-center p-8 text-slate-400">No dealers found.</td></tr>
                ) : filteredDealers.map((dlr) => (
                  <tr key={dlr.dealerId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 flex flex-col">
                      <span className="font-bold text-slate-800">{dlr.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5">{dlr.dealerId}</span>
                    </td>
                    <td className="p-4 text-right font-bold text-slate-700">৳{dlr.totalSales?.toLocaleString()}</td>
                    <td className="p-4 text-right text-brand font-black text-sm">৳{dlr.commission?.toLocaleString()}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${dlr.status === 'Qualified' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                        {dlr.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommissionLedger;

