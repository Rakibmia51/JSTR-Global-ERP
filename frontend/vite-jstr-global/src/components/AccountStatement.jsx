// 1st Step: Import necessary dependencies and components
// import { useState, useEffect } from 'react';
// import API from '../api'; // আপনার Axios/API ক্লায়েন্ট পাথ
// import { 
//   FileSpreadsheet, 
//   Calendar, 
//   Printer, 
//   RefreshCw, 
//   TrendingUp, 
//   TrendingDown, 
//   Scale
// } from 'lucide-react';

// const AccountStatement = () => {
//   const userIdNo = localStorage.getItem('userIdNo')?.trim() || 'N/A';
//   const userName = localStorage.getItem('userName') || 'User Name';
//   const userRole = localStorage.getItem('userRole') || 'Employee';

//   // 🎯 ডেট রেঞ্জ স্টেট (ডিফল্টভাবে চলতি মাসের ১ম দিন থেকে আজ পর্যন্ত)
//   const today = new Date().toISOString().split('T')[0];
//   const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

//   const [startDate, setStartDate] = useState(firstDayOfMonth);
//   const [endDate, setEndDate] = useState(today);
//   const [ledgerLogs, setLedgerLogs] = useState([]);
//   const [summary, setSummary] = useState({ totalCredit: 0, totalDebit: 0, closingBalance: 0 });
//   const [loading, setLoading] = useState(false);

//   // 🔄 নির্দিষ্ট ডেট রেঞ্জের ট্রানজেকশন ডাটা ব্যাকএন্ড কন্ট্রোলার থেকে নিয়ে আসা
//   const fetchAccountStatement = async () => {
//     setLoading(true);
//     try {
//       const response = await API.get(`/accounts/statement?idNo=${userIdNo}&startDate=${startDate}&endDate=${endDate}`);
      
//       if (response.data.success) {
//         setLedgerLogs(response.data.transactions || []);
//         setSummary(response.data.summary || { totalCredit: 0, totalDebit: 0, closingBalance: 0 });
//       }
//     } catch (error) {
//       console.error("Failed to load account statement ledger:", error);
//       setLedgerLogs([]);
//       setSummary({ totalCredit: 0, totalDebit: 0, closingBalance: 0 });
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchAccountStatement();
//   }, [startDate, endDate]);

//   // 🖨️ প্রিন্ট হ্যান্ডলার (A4 ফরম্যাটে প্রিন্ট করার জন্য)
//   const handlePrintStatement = () => {
//     window.print();
//   };

//   return (
//     <div className="p-6 bg-slate-50 min-h-screen font-sans antialiased print:bg-white print:p-0">
      
//       {/* 🔝 কন্ট্রোল বার ও ফিল্টার (প্রিন্ট করার সময় হাইড থাকবে) */}
//       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-6 print:hidden">
//         <div>
//           <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
//             <FileSpreadsheet className="text-indigo-600" size={26} />
//             Account Ledger Statement
//           </h2>
//           <p className="text-xs text-slate-500 mt-1">আপনার অ্যাকাউন্টের যাবতীয় ক্রেডিট এবং ডেবিট ট্রানজেকশন অডিট রিপোর্ট।</p>
//         </div>

//         {/* ডাইনামিক ডেট ফিল্টার উইজেট */}
//         <div className="flex flex-wrap items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
//           <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
//             <Calendar size={14} className="text-slate-400" />
//             <span>From:</span>
//             <input 
//               type="date" 
//               value={startDate} 
//               onChange={(e) => setStartDate(e.target.value)}
//               className="bg-slate-50 border border-slate-200 rounded px-2 py-1 outline-none focus:border-indigo-600 font-medium"
//             />
//           </div>
//           <div className="h-4 w-px bg-slate-200"></div>
//           <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
//             <span>To:</span>
//             <input 
//               type="date" 
//               value={endDate} 
//               onChange={(e) => setEndDate(e.target.value)}
//               className="bg-slate-50 border border-slate-200 rounded px-2 py-1 outline-none focus:border-indigo-600 font-medium"
//             />
//           </div>
//           <button onClick={fetchAccountStatement} className="text-slate-400 hover:text-indigo-600 transition-colors pl-1">
//             <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
//           </button>
//         </div>
//       </div>

//       {loading ? (
//         <div className="text-center p-20 text-slate-400 font-semibold animate-pulse text-xs">Generating transaction ledger snap-logs...</div>
//       ) : (
//         <div className="space-y-6 max-w-5xl mx-auto">
          
//           {/* 🖨️ প্রিন্ট বাটন (প্রিন্ট করার সময় হাইড থাকবে) */}
//           <div className="flex justify-end print:hidden">
//             <button onClick={handlePrintStatement} className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all">
//               <Printer size={14} />
//               Print Official Statement
//             </button>
//           </div>

//           {/* 📊 ৩-কলামের ফিন্যান্সিয়াল কার্ড ওভারভিউ (প্রিন্ট ফ্রেন্ডলি) */}
//           <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans">
//             <div className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center justify-between shadow-sm print:shadow-none">
//               <div>
//                 <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase">Total Credited (In)</span>
//                 <h4 className="text-lg font-black text-emerald-600 mt-1">৳{summary.totalCredit.toLocaleString()}</h4>
//               </div>
//               <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600 print:bg-transparent"><TrendingUp size={20} /></div>
//             </div>

//             <div className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center justify-between shadow-sm print:shadow-none">
//               <div>
//                 <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase">Total Debited (Out)</span>
//                 <h4 className="text-lg font-black text-rose-600 mt-1">৳{summary.totalDebit.toLocaleString()}</h4>
//               </div>
//               <div className="p-2 bg-rose-50 rounded-xl text-rose-600 print:bg-transparent"><TrendingDown size={20} /></div>
//             </div>

//             <div className="bg-white border border-slate-900/10 p-4 rounded-2xl flex items-center justify-between shadow-sm bg-gradient-to-br from-slate-900 to-slate-850 text-white print:from-white print:to-white print:text-slate-900 print:border-slate-200">
//               <div>
//                 <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase print:text-slate-500">Closing Balance</span>
//                 <h4 className="text-lg font-black mt-1 text-indigo-400 print:text-indigo-600">৳{summary.closingBalance.toLocaleString()}</h4>
//               </div>
//               <div className="p-2 bg-slate-800 rounded-xl text-indigo-400 print:bg-transparent"><Scale size={20} /></div>
//             </div>
//           </div>

//           {/* 🖨️ A4 প্রিন্ট কমপ্লায়েন্ট কন্টেইনার */}
//           <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 print:border-0 print:shadow-none print:p-0 print:m-0">
            
//             {/* প্রিন্ট হেডার লেটারহেড */}
//             <div className="text-center border-b-2 border-slate-800 pb-4 mb-6">
//               <h1 className="text-xl font-black text-slate-900 tracking-wider">SUCCESS GLOBAL LIMITED</h1>
//               <p className="text-[10px] text-slate-500 font-semibold mt-0.5">06 Banani C/A (6th Floor), Dhaka-1212. Tel : 056454.</p>
//               <h3 className="text-xs font-bold bg-slate-100 inline-block px-4 py-1 rounded-full text-slate-800 uppercase tracking-wide mt-2">
//                 STATEMENT OF ACCOUNT
//               </h3>
              
//               <div className="grid grid-cols-2 text-left text-[11px] font-bold text-slate-600 mt-4 max-w-xl">
//                 <div>User ID : <span className="font-mono text-slate-900">{userIdNo}</span></div>
//                 <div>Name : <span className="text-slate-900">{userName}</span></div>
//                 <div className="mt-1">Role / Type : <span className="text-slate-900 uppercase">{userRole}</span></div>
//                 <div className="mt-1">Statement Period : <span className="text-slate-900 font-mono">{startDate} to {endDate}</span></div>
//               </div>
//             </div>

//                        {/* 📋 ট্রানজেকশন ডেটা টেবিল */}
//             <div className="overflow-x-auto">
//               <table className="w-full text-left border-collapse text-[10px] font-medium font-sans">
//                 <thead>
//                   <tr className="bg-slate-900 text-white font-bold uppercase text-[9px] print:bg-slate-100 print:text-slate-900 print:border-b print:border-slate-300">
//                     <th className="p-2.5">Date</th>
//                     <th className="p-2.5">Transaction ID</th>
//                     <th className="p-2.5">Narration / Description</th>
//                     <th className="p-2.5 text-center">Type</th>
//                     <th className="p-2.5 text-right">Credit (In)</th>
//                     <th className="p-2.5 text-right">Debit (Out)</th>
//                     <th className="p-2.5 text-right">Running Balance</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-slate-200 text-slate-700 bg-white">
//                   {ledgerLogs.length === 0 ? (
//                     <tr>
//                       <td colSpan="7" className="p-6 text-center text-slate-400 italic font-normal">
//                         No financial records or ledger transactions found within this date range.
//                       </td>
//                     </tr>
//                   ) : (
//                     ledgerLogs.map((tx, idx) => (
//                       <tr key={tx._id || idx} className="hover:bg-slate-50/50">
//                         <td className="p-2.5 font-mono whitespace-nowrap">
//                           {new Date(tx.date).toLocaleDateString('en-GB')}
//                         </td>
//                         <td className="p-2.5 font-mono font-bold text-slate-500">
//                           {tx.transactionId}
//                         </td>
//                         <td className="p-2.5 font-semibold text-slate-800">
//                           {tx.description}
//                         </td>
//                         <td className="p-2.5 text-center">
//                           <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${
//                             tx.type === 'credit' 
//                               ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
//                               : 'bg-rose-50 text-rose-700 border border-rose-200'
//                           }`}>
//                             {tx.type}
//                           </span>
                          
//                           {/* 🎯 আপনার পে-আউট ডাটাবেজ স্কিমার 'Approved' ও 'Pending' কন্ডিশনাল ব্যাজ সিঙ্ক */}
//                           {tx.type === 'debit' && (
//                             <span className={`block text-[7px] font-extrabold tracking-tighter uppercase mt-0.5 ${
//                               tx.status === 'Approved' 
//                                 ? 'text-emerald-600 bg-emerald-50 px-1 rounded inline-block border border-emerald-200' 
//                                 : 'text-amber-600 bg-amber-50 px-1 rounded inline-block border border-amber-200 animate-pulse'
//                             }`}>
//                               {tx.status || 'Pending'}
//                             </span>
//                           )}
//                         </td>
//                         <td className="p-2.5 text-right font-mono font-bold text-emerald-600">
//                           {tx.type === 'credit' ? `৳${tx.amount.toLocaleString()}` : '-'}
//                         </td>
//                         <td className="p-2.5 text-right font-mono font-bold text-rose-600">
//                           {tx.type === 'debit' ? `৳${tx.amount.toLocaleString()}` : '-'}
//                         </td>
//                         <td className="p-2.5 text-right font-mono font-black text-slate-900">
//                           ৳{tx.runningBalance?.toLocaleString()}
//                         </td>
//                       </tr>
//                     ))
//                   )}
                  
//                   {/* ফাইনাল ফুট-নোট সাব-টোটাল লেজার সামারি */}
//                   <tr className="bg-slate-100/80 font-black text-slate-900 text-[10px] border-t-2 border-slate-400">
//                     <td colSpan="4" className="p-2.5 text-right uppercase">Ledger Summary Balance:</td>
//                     <td className="p-2.5 text-right font-mono text-emerald-700">৳{summary.totalCredit.toLocaleString()}</td>
//                     <td className="p-2.5 text-right font-mono text-rose-700">৳{summary.totalDebit.toLocaleString()}</td>
//                     <td className="p-2.5 text-right font-mono text-indigo-700 bg-indigo-50/50 print:bg-transparent">
//                       ৳{summary.closingBalance.toLocaleString()}
//                     </td>
//                   </tr>
//                 </tbody>
//               </table>
//             </div>

//             {/* কোম্পানির অফিশিয়াল সিগনেচার প্যানেল (প্রিন্ট কপিতে দেখা যাবে) */}
//             <div className="hidden print:flex justify-between mt-20 text-[10px] font-bold text-slate-500 text-center px-6">
//               <div className="border-t border-slate-400 w-32 pt-1">Account Holder</div>
//               <div className="border-t border-slate-400 w-32 pt-1">Audited By (Accounts)</div>
//               <div className="border-t border-slate-400 w-32 pt-1">Authorized Stamp</div>
//             </div>

//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AccountStatement;


// 2nd Step: Export the component for use in other parts of the application
// import { useState, useEffect } from 'react';
// import API from '../api'; // আপনার Axios/API ক্লায়েন্ট পাথ
// import { 
//   FileSpreadsheet, 
//   Calendar, 
//   Printer, 
//   RefreshCw, 
//   TrendingUp, 
//   TrendingDown, 
//   Scale
// } from 'lucide-react';

// const AccountStatement = () => {
//   const userIdNo = localStorage.getItem('userIdNo')?.trim() || 'N/A';
//   const userName = localStorage.getItem('userName') || 'User Name';
//   const userRole = localStorage.getItem('userRole') || 'Employee';

//   const today = new Date().toISOString().split('T')[0];
//   const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

//   const [startDate, setStartDate] = useState(firstDayOfMonth);
//   const [endDate, setEndDate] = useState(today);
//   const [ledgerLogs, setLedgerLogs] = useState([]);
//   const [summary, setSummary] = useState({ totalCredit: 0, totalDebit: 0, closingBalance: 0 });
//   const [loading, setLoading] = useState(false);

//   const months = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

//   const fetchAccountStatement = async () => {
//     setLoading(true);
//     try {
//       const response = await API.get(`/accounts/statement?idNo=${userIdNo}&startDate=${startDate}&endDate=${endDate}`);
//       if (response.data.success) {
//         setLedgerLogs(response.data.transactions || []);
//         setSummary(response.data.summary || { totalCredit: 0, totalDebit: 0, closingBalance: 0 });
//       }
//     } catch (error) {
//       console.error("Failed to load account statement ledger:", error);
//       setLedgerLogs([]);
//       setSummary({ totalCredit: 0, totalDebit: 0, closingBalance: 0 });
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchAccountStatement();
//   }, [startDate, endDate]);

//   const handlePrintStatement = () => {
//     window.print();
//   };

//   return (
//     <div className="p-4 sm:p-6 bg-slate-50 min-h-screen font-sans antialiased print:bg-white print:p-0">
      
//       {/* 🎯 🖨️ প্রিন্ট প্রোটেকশন স্টাইল ইনজেকশন (সাইড মেনু এবং হেডার চিরতরে হাইড করার জন্য) */}
//       <style dangerouslySetInnerHTML={{__html: `
//         @media print {
//           /* আপনার অ্যাপের গ্লোবাল সাইডবার, টপবার, ন্যাভবার এবং মেনু হাইড করার জন্য জেনেরিক সিলেক্টর */
//           aside, nav, header, .sidebar, .side-menu, .topbar, .navbar, .no-print, [class*="sidebar"], [class*="nav"] {
//             display: none !important;
//             width: 0 !important;
//             height: 0 !important;
//             visibility: hidden !important;
//           }
//           /* মেইন কন্টেন্ট এরিয়াকে ফুল স্ক্রিন করা */
//           body, main, .main-content, #root {
//             background: white !important;
//             padding: 0 !important;
//             margin: 0 !important;
//             width: 100% !important;
//           }
//           @page {
//             size: A4 portrait;
//             margin: 15mm 10mm 15mm 10mm;
//           }
//         }
//       `}} />

//       {/* 🔝 কন্ট্রোল বার ও ফিল্টার (প্রিন্ট এবং মোবাইলে রেসপন্সিভ লেআউট) */}
//       <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-6 print:hidden">
//         <div>
//           <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
//             <FileSpreadsheet className="text-indigo-600 flex-shrink-0" size={26} />
//             Account Ledger Statement
//           </h2>
//           <p className="text-xs text-slate-500 mt-1">আপনার অ্যাকাউন্টের যাবতীয় ক্রেডিট এবং ডেবিট ট্রানজেকশন অডিট রিপোর্ট।</p>
//         </div>

//         {/* ডাইনামিক রেসপন্সিভ ডেট ফিল্টার উইজেট */}
//         <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm w-full lg:w-auto">
//           <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 w-full sm:w-auto justify-between">
//             <div className="flex items-center gap-1"><Calendar size={14} className="text-slate-400" /> <span>From:</span></div>
//             <input 
//               type="date" 
//               value={startDate} 
//               onChange={(e) => setStartDate(e.target.value)}
//               className="bg-slate-50 border border-slate-200 rounded px-2 py-1 outline-none focus:border-indigo-600 font-medium text-xs cursor-pointer"
//             />
//           </div>
//           <div className="hidden sm:block h-4 w-px bg-slate-200"></div>
//           <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 w-full sm:w-auto justify-between">
//             <span>To:</span>
//             <input 
//               type="date" 
//               value={endDate} 
//               onChange={(e) => setEndDate(e.target.value)}
//               className="bg-slate-50 border border-slate-200 rounded px-2 py-1 outline-none focus:border-indigo-600 font-medium text-xs cursor-pointer"
//             />
//           </div>
//           <button onClick={fetchAccountStatement} className="text-slate-400 hover:text-indigo-600 transition-colors pl-1 self-end sm:self-center">
//             <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
//           </button>
//         </div>
//       </div>

//       {loading ? (
//         <div className="text-center p-20 text-slate-400 font-semibold animate-pulse text-xs">Generating transaction ledger snap-logs...</div>
//       ) : (
//         <div className="space-y-6 max-w-5xl mx-auto">
          
//           {/* 🖨️ প্রিন্ট বাটন (প্রিন্ট করার সময় হাইড থাকবে) */}
//           <div className="flex justify-end print:hidden">
//             <button onClick={handlePrintStatement} className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all w-full sm:w-auto justify-center">
//               <Printer size={14} />
//               Print Official Statement
//             </button>
//           </div>

//           {/* 📊 ৩-কলামের ফিন্যান্সিয়াল কার্ড ওভারভিউ */}
//           <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans print:grid-cols-3">
//             <div className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center justify-between shadow-sm print:shadow-none print:p-2">
//               <div>
//                 <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase">Total Credited (In)</span>
//                 <h4 className="text-base sm:text-lg font-black text-emerald-600 mt-1">৳{summary.totalCredit.toLocaleString()}</h4>
//               </div>
//               <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600 print:hidden"><TrendingUp size={20} /></div>
//             </div>

//             <div className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center justify-between shadow-sm print:shadow-none print:p-2">
//               <div>
//                 <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase">Total Debited (Out)</span>
//                 <h4 className="text-base sm:text-lg font-black text-rose-600 mt-1">৳{summary.totalDebit.toLocaleString()}</h4>
//               </div>
//               <div className="p-2 bg-rose-50 rounded-xl text-rose-600 print:hidden"><TrendingDown size={20} /></div>
//             </div>

//             <div className="bg-white border border-slate-900/10 p-4 rounded-2xl flex items-center justify-between shadow-sm bg-gradient-to-br from-slate-900 to-slate-850 text-white print:from-white print:to-white print:text-slate-900 print:border-slate-200 print:p-2">
//               <div>
//                 <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase print:text-slate-500">Closing Balance</span>
//                 <h4 className="text-base sm:text-lg font-black mt-1 text-indigo-400 print:text-indigo-600">৳{summary.closingBalance.toLocaleString()}</h4>
//               </div>
//               <div className="p-2 bg-slate-800 rounded-xl text-indigo-400 print:hidden"><Scale size={20} /></div>
//             </div>
//           </div>

//           {/* 🖨️ A4 প্রিন্ট কমপ্লায়েন্ট কন্টেইনার */}
//           <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-6 print:border-0 print:shadow-none print:p-0 print:m-0 w-full overflow-hidden">
            
//             {/* প্রিন্ট हेডার লেটারহেড */}
//             <div className="text-center border-b-2 border-slate-800 pb-4 mb-6">
//               <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-wider">SUCCESS GLOBAL LIMITED</h1>
//               <p className="text-[10px] text-slate-500 font-semibold mt-0.5">06 Banani C/A (6th Floor), Dhaka-1212. Tel : 056454.</p>
//               <h3 className="text-xs font-bold bg-slate-100 inline-block px-4 py-1 rounded-full text-slate-800 uppercase tracking-wide mt-2">
//                 STATEMENT OF ACCOUNT
//               </h3>
              
//               <div className="grid grid-cols-1 sm:grid-cols-2 text-left text-[11px] font-bold text-slate-600 mt-4 gap-1 sm:max-w-xl mx-auto">
//                 <div>User ID : <span className="font-mono text-slate-900">{userIdNo}</span></div>
//                 <div>Name : <span className="text-slate-900">{userName}</span></div>
//                 <div>Role / Type : <span className="text-slate-900 uppercase">{userRole}</span></div>
//                 <div>Statement Period : <span className="text-slate-900 font-mono">{startDate} to {endDate}</span></div>
//               </div>
//             </div>

//             {/* 📋 ট্রানজেকশন ডেটা টেবিল */}
//             <div className="overflow-x-auto w-full -mx-4 sm:mx-0 px-4 sm:px-0 scrollbar-thin scrollbar-thumb-slate-200">
//               <table className="w-full text-left border-collapse text-[10px] sm:text-xs font-medium font-sans min-w-[750px] lg:min-w-full table-fixed sm:table-auto">
//                 <thead>
//                   <tr className="bg-slate-900 text-white font-bold uppercase text-[9px] print:bg-slate-100 print:text-slate-900 print:border-b print:border-slate-300">
//                     <th className="p-2 sm:p-3 w-[85px] sm:w-auto">Date</th>
//                     <th className="p-2 sm:p-3 w-[100px] sm:w-auto">Transaction ID</th>
//                     <th className="p-2 sm:p-3 min-w-[200px] sm:min-w-none">Narration / Description</th>
//                     <th className="p-2 sm:p-3 text-center w-[75px] sm:w-auto">Type</th>
//                     <th className="p-2 sm:p-3 text-right w-[90px] sm:w-auto">Credit (In)</th>
//                     <th className="p-2 sm:p-3 text-right w-[90px] sm:w-auto">Debit (Out)</th>
//                     <th className="p-2 sm:p-3 text-right w-[100px] sm:w-auto">Running Balance</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-slate-200 text-slate-700 bg-white">
//                   {ledgerLogs.length === 0 ? (
//                     <tr>
//                       <td colSpan="7" className="p-6 text-center text-slate-400 italic font-normal">
//                         No financial records or ledger transactions found within this date range.
//                       </td>
//                     </tr>
//                   ) : (
//                     ledgerLogs.map((tx, idx) => (
//                       <tr key={tx._id || idx} className="hover:bg-slate-50/50 transition-colors">
//                         <td className="p-2 sm:p-3 font-mono whitespace-nowrap text-[9px] sm:text-xs">
//                           {new Date(tx.date).toLocaleDateString('en-GB')}
//                         </td>
//                         <td className="p-2 sm:p-3 font-mono font-bold text-slate-500 text-[9px] sm:text-xs truncate">
//                           {tx.transactionId}
//                         </td>
//                         <td className="p-2 sm:p-3 font-semibold text-slate-800 break-words whitespace-normal text-[9px] sm:text-xs leading-relaxed">
//                           {tx.description}
//                         </td>
//                         <td className="p-2 sm:p-3 text-center whitespace-nowrap">
//                           <span className={`px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-black uppercase border ${
//                             tx.type === 'credit' 
//                               ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
//                               : 'bg-rose-50 text-rose-700 border border-rose-200'
//                           }`}>
//                             {tx.type}
//                           </span>
                          
//                           {/* ডাইনামিক ক্যাশ-আউট স্ট্যাটাস */}
//                           {tx.type === 'debit' && (
//                             <span className={`block text-[7px] sm:text-[8px] font-extrabold tracking-tighter uppercase mt-1 ${
//                               tx.status === 'Approved' 
//                                 ? 'text-emerald-600 bg-emerald-50 px-1 rounded inline-block border border-emerald-200' 
//                                 : 'text-amber-600 bg-amber-50 px-1 rounded inline-block border border-amber-200 animate-pulse'
//                             }`}>
//                               {tx.status || 'Pending'}
//                             </span>
//                           )}
//                         </td>
//                         <td className="p-2 sm:p-3 text-right font-mono font-bold text-emerald-600 whitespace-nowrap text-[9px] sm:text-xs">
//                           {tx.type === 'credit' ? `৳${tx.amount.toLocaleString()}` : '-'}
//                         </td>
//                         <td className="p-2 sm:p-3 text-right font-mono font-bold text-rose-600 whitespace-nowrap text-[9px] sm:text-xs">
//                           {tx.type === 'debit' ? `৳${tx.amount.toLocaleString()}` : '-'}
//                         </td>
//                         <td className="p-2 sm:p-3 text-right font-mono font-black text-slate-900 whitespace-nowrap text-[9px] sm:text-xs">
//                           ৳{tx.runningBalance?.toLocaleString()}
//                         </td>
//                       </tr>
//                     ))
//                   )}
                  
//                   {/* ফাইনাল লেজার সামারি রো */}
//                   <tr className="bg-slate-100/80 font-black text-slate-900 text-[10px] sm:text-xs border-t-2 border-slate-400">
//                     <td colSpan="4" className="p-2.5 sm:p-3 text-right uppercase tracking-wider">Ledger Summary Balance:</td>
//                     <td className="p-2.5 sm:p-3 text-right font-mono text-emerald-700 whitespace-nowrap">৳{summary.totalCredit.toLocaleString()}</td>
//                     <td className="p-2.5 sm:p-3 text-right font-mono text-rose-700 whitespace-nowrap">৳{summary.totalDebit.toLocaleString()}</td>
//                     <td className="p-2.5 sm:p-3 text-right font-mono text-indigo-700 bg-indigo-50/50 print:bg-transparent whitespace-nowrap">
//                       ৳{summary.closingBalance.toLocaleString()}
//                     </td>
//                   </tr>
//                 </tbody>
//               </table>
//             </div>

//             {/* কোম্পানির অফিশিয়াল সিগনেচার প্যানেল (প্রিন্ট কপিতে দেখা যাবে) */}
//             <div className="hidden print:flex justify-between mt-20 text-[10px] font-bold text-slate-500 text-center px-6">
//               <div className="border-t border-slate-400 w-32 pt-1">Account Holder</div>
//               <div className="border-t border-slate-400 w-32 pt-1">Audited By (Accounts)</div>
//               <div className="border-t border-slate-400 w-32 pt-1">Authorized Stamp</div>
//             </div>

//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AccountStatement;


// 3rd Step: Export the component for use in other parts of the application
import { useState, useEffect } from 'react';
import API from '../api'; // আপনার Axios/API ক্লায়েন্ট পাথ
import { 
  FileSpreadsheet, 
  Calendar, 
  Printer, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  Scale
} from 'lucide-react';

const AccountStatement = () => {
  const userIdNo = localStorage.getItem('userIdNo')?.trim() || 'N/A';
  const userName = localStorage.getItem('userName') || 'User Name';
  const userRole = localStorage.getItem('userRole') || 'Employee';

  const today = new Date().toISOString().split('T');
  const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T');

  const [startDate, setStartDate] = useState(firstDayOfMonth);
  const [endDate, setEndDate] = useState(today);
  const [ledgerLogs, setLedgerLogs] = useState([]);
  const [summary, setSummary] = useState({ totalCredit: 0, totalDebit: 0, closingBalance: 0 });
  const [loading, setLoading] = useState(false);

  const fetchAccountStatement = async () => {
    setLoading(true);
    try {
      const response = await API.get(`/accounts/statement?idNo=${userIdNo}&startDate=${startDate}&endDate=${endDate}`);
      if (response.data.success) {
        setLedgerLogs(response.data.transactions || []);
        setSummary(response.data.summary || { totalCredit: 0, totalDebit: 0, closingBalance: 0 });
      }
    } catch (error) {
      console.error("Failed to load account statement ledger:", error);
      setLedgerLogs([]);
      setSummary({ totalCredit: 0, totalDebit: 0, closingBalance: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccountStatement();
  }, [startDate, endDate]);

  // 🎯 🖨️ মাস্টার প্রিন্ট ট্রিপার লজিক (রুট লেআউট প্যাডিং রিসেট হুক)
  const handlePrintStatement = () => {
    // প্রিন্ট মোড চালু হওয়ার আগে বডিতে মাস্টার ক্লাস ইনজেক্ট করা হচ্ছে
    document.body.classList.add('printing-active-mode');
    
    // ব্রাউজারকে সিইউ সিঙ্ক করার জন্য সামান্য ডিলে দিয়ে প্রিন্ট ডায়ালগ ওপেন করা হলো
    setTimeout(() => {
      window.print();
      // প্রিন্ট ডায়ালগ বন্ধ বা শেষ হওয়ার পর মাস্টার ক্লাস রিমুভ করা হচ্ছে
      document.body.classList.remove('printing-active-mode');
    }, 150);
  };


  // ১. ব্যাকএন্ড থেকে বিদ্যমান প্রোফাইল ডেটা লোড করা (GET /me)
      const [companyData, setCompanyData] = useState({
    name: "",
    legalName: "",
    industry: "",
    size: "",
    registrationNumber: "",
    taxId: "",
    email: "",
    phone: "",
    website: "",
    address: {
      line1: "",
      line2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "Bangladesh",
    },
    currency: "BDT",
    timezone: "Asia/Dhaka",
    fiscalYearStartMonth: 1,
  });

      useEffect(() => {
        const fetchCompanyData = async () => {
          try {
            const companyResponse = await API.get("/company/me");
            if (companyResponse.data.success && companyResponse.data.data) {
              setCompanyData((prev) => ({ ...prev, ...companyResponse.data.data }));
      
              console.log("Company data loaded:", companyResponse.data.data);
            }
          } catch (error) {
            console.error("Error loading company data", error);
          }
        };
        fetchCompanyData();
      }, []);

  return (
    <div className="p-4 sm:p-6 bg-slate-50 min-h-screen font-sans antialiased print:p-0 print:m-0 print:bg-white">
      
      {/* 🎯 গ্লোবাল সিএসএস ইনজেকশন - এটি যেকোনো থার্ড-পার্টি বা প্যারেন্ট ফ্রেমওয়ার্কের সাইডবারকে শতভাগ ডিজেবল করবে */}
      <style dangerouslySetInnerHTML={{__html: `
        /* স্ক্রিন মোডে নরমাল থাকবে, কিন্তু প্রিন্ট মোড অথবা মাস্টার ক্লাস অ্যাক্টিভ হলে কাজ করবে */
        @media print, screen and (.printing-active-mode) {
          body.printing-active-mode {
            background: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          
          /* ১. আপনার অ্যাপের মেইন রুট এবং প্যারেন্ট কন্টেইনারের সমস্ত লেফট মার্জিন/প্যাডিং চিরতরে জিরো */
          body.printing-active-mode #root,
          body.printing-active-mode main,
          body.printing-active-mode .main-content,
          body.printing-active-mode .content-wrapper,
          body.printing-active-mode [class*="layout"],
          body.printing-active-mode [class*="wrapper"],
          body.printing-active-mode [class*="container"] {
            padding: 0 !important;
            padding-left: 0 !important;
            margin: 0 !important;
            margin-left: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            transform: none !important;
          }

          /* ২. সাইডবার, টপবার, মোডাল, ক্লোজ বাটন এবং পপআপ ডাইনামিক ফিল্টারিং */
          body.printing-active-mode aside,
          body.printing-active-mode nav,
          body.printing-active-mode header,
          body.printing-active-mode footer,
          body.printing-active-mode button,
          body.printing-active-mode .sidebar,
          body.printing-active-mode .side-menu,
          body.printing-active-mode .topbar,
          body.printing-active-mode .navbar,
          body.printing-active-mode [class*="sidebar"],
          body.printing-active-mode [class*="nav"],
          body.printing-active-mode [class*="menu"],
          body.printing-active-mode [class*="close"],
          body.printing-active-mode [class*="modal"],
          body.printing-active-mode .ant-layout-sider,
          body.printing-active-mode .no-print {
            display: none !important;
            opacity: 0 !important;
            width: 0 !important;
            height: 0 !important;
            visibility: hidden !important;
          }

          /* ৩. ব্রাউজার ফোর্স কালার ট্রিগার */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* ৪. ওভারভিউ কার্ড ৩ কলাম এলাইনমেন্ট ফিক্স */
          .print-card-grid {
            display: table !important;
            width: 100% !important;
            table-layout: fixed !important;
            border-collapse: separate !important;
            border-spacing: 12px 0px !important;
            margin: 0 -12px 20px -12px !important;
          }

          .print-card-cell {
            display: table-cell !important;
            width: 33.333% !important;
            background: #ffffff !important;
            border: 1px solid #cbd5e1 !important;
            border-left: 5px solid #cbd5e1 !important;
            border-radius: 12px !important;
            padding: 14px !important;
            vertical-align: middle !important;
          }

          .print-border-emerald { border-left-color: #10b981 !important; }
          .print-border-rose { border-left-color: #f43f5e !important; }
          .print-border-indigo { 
            border-left-color: #6366f1 !important;
            background-color: #0f172a !important; 
            color: #ffffff !important;
          }

          .print-full-width {
            width: 100% !important;
            max-width: 100% !important;
          }

          /* ৫. মাল্টি-পেজ ডাটা ব্রেক ওভারল্যাপ প্রোটেকশন */
          table {
            page-break-inside: auto !important;
            width: 100% !important;
          }
          tr {
            page-break-inside: avoid !important;
            page-break-after: auto !important;
          }
          thead {
            display: table-header-group !important;
          }
        }

        @media print {
          @page {
            size: A4 portrait;
            margin: 12mm 10mm 12mm 10mm;
          }
        }
      `}} />

      {/* 🔝 কন্ট্রোল বার ও ফিল্টার (প্রিন্ট পেজে হাইড থাকবে) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-6 print:hidden">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="text-indigo-600 flex-shrink-0" size={26} />
            Account Ledger Statement
          </h2>
          <p className="text-xs text-slate-500 mt-1">আপনার অ্যাকাউন্টের যাবতীয় ক্রেডিট এবং ডেবিট ট্রানজেকশন অডিট রিপোর্ট।</p>
        </div>

        {/* ডেট ফিল্টার উইজেট */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm w-full lg:w-auto">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 w-full sm:w-auto justify-between">
            <div className="flex items-center gap-1"><Calendar size={14} className="text-slate-400" /> <span>From:</span></div>
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded px-2 py-1 outline-none focus:border-indigo-600 font-medium text-xs cursor-pointer"
            />
          </div>
          <div className="hidden sm:block h-4 w-px bg-slate-200"></div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 w-full sm:w-auto justify-between">
            <span>To:</span>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded px-2 py-1 outline-none focus:border-indigo-600 font-medium text-xs cursor-pointer"
            />
          </div>
          <button onClick={fetchAccountStatement} className="text-slate-400 hover:text-indigo-600 transition-colors pl-1 self-end sm:self-center">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center p-20 text-slate-400 font-semibold animate-pulse text-xs">Generating transaction ledger snap-logs...</div>
      ) : (
        <div className="space-y-6 max-w-5xl mx-auto print:max-w-full print:w-full print:px-0">
          
          {/* 🖨️ প্রিন্ট বাটন */}
          <div className="flex justify-end print:hidden">
            <button onClick={handlePrintStatement} className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all w-full sm:w-auto justify-center">
              <Printer size={14} />
              Print Official Statement
            </button>
          </div>

          {/* 📊 ৩-কলামের ফিন্যান্সিয়াল কার্ড ওভারভিউ */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 font-sans print-card-grid print-full-width">
            
            {/* ১. টোটাল ক্রেডিট কার্ড */}
            <div className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center justify-between shadow-sm border-l-4 border-l-emerald-500 print-card-cell print-border-emerald">
              <div className="min-w-0">
                <span className="text-[9px] sm:text-[10px] font-black tracking-wider text-slate-400 uppercase block truncate print:text-slate-500">Total Credited (In)</span>
                <h4 className="text-base sm:text-xl font-black text-emerald-600 mt-1 font-mono truncate">
                  ৳{summary.totalCredit.toLocaleString()}
                </h4>
              </div>
              <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600 flex-shrink-0 hidden sm:block print:hidden">
                <TrendingUp size={20} />
              </div>
            </div>

            {/* ২. টোটাল ডেবিট কার্ড */}
            <div className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center justify-between shadow-sm border-l-4 border-l-rose-500 print-card-cell print-border-rose">
              <div className="min-w-0">
                <span className="text-[9px] sm:text-[10px] font-black tracking-wider text-slate-400 uppercase block truncate print:text-slate-500">Total Debited (Out)</span>
                <h4 className="text-base sm:text-xl font-black text-rose-600 mt-1 font-mono truncate">
                  ৳{summary.totalDebit.toLocaleString()}
                </h4>
              </div>
              <div className="p-2 bg-rose-50 rounded-xl text-rose-600 flex-shrink-0 hidden sm:block print:hidden">
                <TrendingDown size={20} />
              </div>
            </div>

            {/* ৩. ক্লোজিং ব্যালেন্স কার্ড */}
            <div className="col-span-2 md:col-span-1 bg-slate-900 p-4 rounded-2xl flex items-center justify-between shadow-md text-white border-l-4 border-l-indigo-500 md:border-l-0 print-card-cell print-border-indigo">
              <div className="min-w-0">
                <span className="text-[9px] sm:text-[10px] font-black tracking-wider text-slate-400 uppercase block tracking-widest print:text-slate-300">Closing Balance</span>
                <h4 className="text-lg sm:text-xl font-black mt-1 text-indigo-400 font-mono truncate print:text-indigo-200">
                  ৳{summary.closingBalance.toLocaleString()}
                </h4>
              </div>
              <div className="p-2 bg-slate-800 rounded-xl text-indigo-400 flex-shrink-0 hidden sm:block print:hidden">
                <Scale size={20} />
              </div>
            </div>

          </div>

          {/* 🖨️ A4 প্রিন্ট কমপ্লায়েন্ট কন্টেইনার */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-6 print:border-0 print:shadow-none print:p-0 print:m-0 w-full overflow-hidden print:full-width">
            
            {/* প্রিন্ট হেডার লেটারহেড */}
            <div className="text-center border-b-2 border-slate-800 pb-4 mb-6 print:full-width">
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-wider">{companyData.name || 'Company Name'}</h1>
              <p className="text-[10px] text-slate-500 font-semibold mt-0.5">{companyData.address?.line1 || 'Address Line 1'}, {companyData.address?.line2 || 'Address Line 2'}, {companyData.address?.city || 'City'}</p>
              <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Phone: {companyData.phone} | Email: {companyData.email}</p>
              <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Website: {companyData.website}</p>
              <h3 className="text-xs font-bold bg-slate-100 inline-block px-4 py-1 rounded-full text-slate-800 uppercase tracking-wide mt-2">
                STATEMENT OF ACCOUNT
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 text-left text-[11px] font-bold text-slate-600 mt-4 gap-1 sm:max-w-xl mx-auto">
                <div>User ID : <span className="font-mono text-slate-900">{userIdNo}</span></div>
                <div>Name : <span className="text-slate-900">{userName}</span></div>
                <div>Role / Type : <span className="text-slate-900 uppercase">{userRole}</span></div>
                <div>Statement Period : <span className="text-slate-900 font-mono">{startDate} to {endDate}</span></div>
              </div>
            </div>

            {/* 📋 ট্রানজেকশন ডেটা টেবিল */}
            <div className="overflow-x-auto w-full -mx-4 sm:mx-0 px-4 sm:px-0 print:full-width">
              <table className="w-full text-left border-collapse text-[10px] sm:text-xs font-medium font-sans min-w-[750px] lg:min-w-full table-fixed sm:table-auto print:full-width">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold uppercase text-[9px] print:bg-slate-100 print:text-slate-900 print:border-b print:border-slate-300">
                    <th className="p-2 sm:p-3 w-[85px] sm:w-auto">Date</th>
                    <th className="p-2 sm:p-3 w-[100px] sm:w-auto">Transaction ID</th>
                    <th className="p-2 sm:p-3 min-w-[200px] sm:min-w-none">Narration / Description</th>
                    <th className="p-2 sm:p-3 text-center w-[75px] sm:w-auto">Type</th>
                    <th className="p-2 sm:p-3 text-right w-[90px] sm:w-auto">Credit (In)</th>
                    <th className="p-2 sm:p-3 text-right w-[90px] sm:w-auto">Debit (Out)</th>
                    <th className="p-2 sm:p-3 text-right w-[100px] sm:w-auto">Running Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700 bg-white">
                  {ledgerLogs.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-6 text-center text-slate-400 italic font-normal">
                        No financial records or ledger transactions found within this date range.
                      </td>
                    </tr>
                  ) : (
                    ledgerLogs.map((tx, idx) => (
                      <tr key={tx._id || idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-2 sm:p-3 font-mono whitespace-nowrap text-[9px] sm:text-xs">
                          {new Date(tx.date).toLocaleDateString('en-GB')}
                        </td>
                        <td className="p-2 sm:p-3 font-mono font-bold text-slate-500 text-[9px] sm:text-xs truncate">
                          {tx.transactionId}
                        </td>
                        <td className="p-2 sm:p-3 font-semibold text-slate-800 break-words whitespace-normal text-[9px] sm:text-xs leading-relaxed">
                          {tx.description}
                        </td>
                        <td className="p-2 sm:p-3 text-center whitespace-nowrap">
                          <span className={`px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-black uppercase border ${
                            tx.type === 'credit' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {tx.type}
                          </span>
                          {tx.type === 'debit' && (
                            <span className={`block text-[7px] sm:text-[8px] font-extrabold tracking-tighter uppercase mt-1 ${
                              tx.status === 'Approved' 
                                ? 'text-emerald-600 bg-emerald-50 px-1 rounded inline-block border border-emerald-200' 
                                : 'text-amber-600 bg-amber-50 px-1 rounded inline-block border border-amber-200'
                            }`}>
                              {tx.status || 'Pending'}
                            </span>
                          )}
                        </td>
                        <td className="p-2 sm:p-3 text-right font-mono font-bold text-emerald-600 whitespace-nowrap text-[9px] sm:text-xs">
                          {tx.type === 'credit' ? `৳${tx.amount.toLocaleString()}` : '-'}
                        </td>
                        <td className="p-2 sm:p-3 text-right font-mono font-bold text-rose-600 whitespace-nowrap text-[9px] sm:text-xs">
                          {tx.type === 'debit' ? `৳${tx.amount.toLocaleString()}` : '-'}
                        </td>
                        <td className="p-2 sm:p-3 text-right font-mono font-black text-slate-900 whitespace-nowrap text-[9px] sm:text-xs">
                          ৳{tx.runningBalance?.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                  
                  <tr className="bg-slate-100/80 font-black text-slate-900 text-[10px] sm:text-xs border-t-2 border-slate-400">
                    <td colSpan="4" className="p-2.5 sm:p-3 text-right uppercase tracking-wider">Ledger Summary Balance:</td>
                    <td className="p-2.5 sm:p-3 text-right font-mono text-emerald-700 whitespace-nowrap">৳{summary.totalCredit.toLocaleString()}</td>
                    <td className="p-2.5 sm:p-3 text-right font-mono text-rose-700 whitespace-nowrap">৳{summary.totalDebit.toLocaleString()}</td>
                    <td className="p-2.5 sm:p-3 text-right font-mono text-indigo-700 bg-indigo-50/50 print:bg-transparent whitespace-nowrap">
                      ৳{summary.closingBalance.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

                     {/* কোম্পানির অফিশিয়াল সিগনেচার প্যানেল (প্রিন্ট কপিতে দেখা যাবে) */}
            <div className="hidden print:flex justify-between mt-20 text-[10px] font-bold text-slate-500 text-center px-6 print:full-width">
              <div className="border-t border-slate-400 w-32 pt-1">Account Holder</div>
              <div className="border-t border-slate-400 w-32 pt-1">Audited By (Accounts)</div>
              <div className="border-t border-slate-400 w-32 pt-1">Authorized Stamp</div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default AccountStatement;
