// import { useState, useEffect, useRef } from 'react';
// import API from '../api'; // আপনার তৈরি করা অ্যাক্সিওস/এপিআই ক্লায়েন্ট পাথ
// import { FileText, ChevronDown, ChevronUp, RefreshCw, DollarSign, Award, Users, TrendingUp, ShieldCheck, ArrowDownRight, Printer, Download } from 'lucide-react';

// const SalarySheet = () => {
//   const userIdNo = localStorage.getItem('userIdNo')?.trim() || 'MKT-0001'; 
//   const currentYear = new Date().getFullYear();
//   const currentMonth = new Date().getMonth() + 1;

//   const [selectedYear, setSelectedYear] = useState(currentYear);
//   const [selectedMonth, setSelectedMonth] = useState(currentMonth);
//   const [salaryData, setSalaryData] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [openSection, setOpenSection] = useState(null);

//   // প্রিন্ট এরিয়া রেফারেন্স ট্র্যাকিং
//   const printAreaRef = useRef();

//   const toggleSection = (sectionName) => {
//     setOpenSection(openSection === sectionName ? null : sectionName);
//   };

//   const months = [
//     { value: 1, name: 'January' }, { value: 2, name: 'February' }, { value: 3, name: 'March' }, 
//     { value: 4, name: 'April' }, { value: 5, name: 'May' }, { value: 6, name: 'June' }, 
//     { value: 7, name: 'July' }, { value: 8, name: 'August' }, { value: 9, name: 'September' }, 
//     { value: 10, name: 'October' }, { value: 11, name: 'November' }, { value: 12, name: 'December' }
//   ];
//   const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

//   const fetchMonthlySalarySheet = async () => {
//     setLoading(true);
//     try {
//       const response = await API.get(`/commissions/my-salary-sheet?idNo=${userIdNo}&year=${selectedYear}&month=${selectedMonth}`);
//       if (response.data.success) {
//         setSalaryData(response.data.data);
//       }
//     } catch (error) {
//       console.error("Failed to load monthly salary ledger sheet:", error);
//       setSalaryData(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchMonthlySalarySheet();
//   }, [selectedYear, selectedMonth]);

//   // 🖨️ ১-পৃষ্ঠার PDF জেনারেট এবং ডাউনলোডের জন্য হ্যান্ডলার মেথড
//   const handleDownloadPDF = () => {
//     // প্রিন্ট করার সময় সমস্ত অ্যাকোর্ডিয়ন প্যানেল অটো-ওপেন করে দেওয়া যাতে পূর্ণাঙ্গ রিপোর্ট প্রিন্ট হয়
//     setOpenSection('all'); 
    
//     setTimeout(() => {
//       window.print();
//     }, 300);
//   };

//   return (
//     <div className="p-6 bg-slate-50 min-h-screen font-sans">
      
//       {/* 🔝 হেডার ও ফিল্টার কন্ট্রোল বার (প্রিন্ট করার সময় এটি অটোমেটিক হাইড থাকবে) */}
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-6 print:hidden">
//         <div>
//           <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
//             <FileText className="text-brand" size={26} />
//             Monthly Salary Payslip
//           </h2>
//           <p className="text-xs text-slate-500 mt-1">📊 ৪টি কোর কমিশন সেগমেন্টের রিয়াল-টাইম স্টেপ-বাই-স্টেপ গাণিতিক বিবরণী।</p>
//         </div>

//         <div className="flex flex-wrap items-center gap-2.5 bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex-shrink-0">
//           <div className="relative">
//             <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))} className="bg-transparent text-xs font-bold text-slate-600 outline-none appearance-none cursor-pointer pr-6 pl-1">
//               {months.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
//             </select>
//             <ChevronDown size={12} className="absolute right-0 top-1 text-slate-400 pointer-events-none" />
//           </div>
//           <div className="h-4 w-px bg-slate-200"></div>
//           <div className="relative">
//             <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="bg-transparent text-xs font-bold text-slate-600 outline-none appearance-none cursor-pointer pr-6 pl-1">
//               {years.map(y => <option key={y} value={y}>{y}</option>)}
//             </select>
//             <ChevronDown size={12} className="absolute right-0 top-1 text-slate-400 pointer-events-none" />
//           </div>
//           <button onClick={fetchMonthlySalarySheet} className="text-slate-400 hover:text-brand transition-colors pl-1">
//             <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
//           </button>
//         </div>
//       </div>

//       {/* 📄 মেইন পে-স্লিপ রিসিট বডি */}
//       {loading ? (
//         <div className="text-center p-20 text-slate-400 font-semibold animate-pulse text-xs">Compiling monthly revenue breakdown matrix...</div>
//       ) : !salaryData ? (
//         <div className="max-w-3xl mx-auto bg-amber-50 border border-amber-200 text-amber-800 p-5 rounded-2xl text-xs font-semibold shadow-sm print:hidden">
//           ⏳ সিলেক্টেড মাসটির স্যালারি শীট এখনও অ্যাডমিন প্যানেল থেকে চূড়ান্ত অনুমোদন (Lock & Release) করা হয়নি।
//         </div>
//       ) : (
//         <div className="space-y-4 max-w-3xl mx-auto">
          
//           {/* 📥 পিডিএফ ডাউনলোড ও প্রিন্ট অ্যাকশন প্যানেল বোতাম (প্রিন্টে দেখা যাবে না) */}
//           <div className="flex justify-end gap-2.5 print:hidden">
//             <button 
//               onClick={handleDownloadPDF}
//               className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
//             >
//               <Download size={14} /> See & Download PDF
//             </button>
//           </div>

//           {/* 🖨️ প্রিন্ট মিডিয়া প্রোটেক্টেড ১-পেজ কন্টেইনার এরিয়া */}
//           <div 
//             ref={printAreaRef} 
//             className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden print:border-0 print:shadow-none print:m-0 print:p-0"
//           >
//             {/* রিসিট ওয়াটারমার্ক টপ হেডার */}
//             <div className="bg-slate-900 text-white p-6 flex justify-between items-center print:bg-slate-900 print:text-white">
//               <div>
//                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Salary Statement</span>
//                 <h3 className="text-lg font-black tracking-wide">JSTR GLOBAL LIMITED</h3>
//                 <span className="text-[11px] text-slate-400 block font-mono mt-0.5">ID: {salaryData.idNo} | Rank: <span className="text-brand font-black uppercase">{salaryData.autoPosition}</span></span>
//               </div>
//               <div className="text-right">
//                 <span className="text-xs font-bold bg-white/10 px-3 py-1 rounded-lg text-slate-200 block uppercase">{months.find(m => m.value === selectedMonth)?.name} {selectedYear}</span>
//                 <span className="text-[10px] font-bold px-2 py-0.5 rounded mt-1.5 inline-block bg-emerald-500/20 text-emerald-400">{salaryData.qualificationStatus || 'Qualified'}</span>
//               </div>
//             </div>

//             <div className="p-6 space-y-3 print:p-4">
//               <div className="text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100">Earnings & Details Breakdown</div>
              
//                           {/* সেগমেন্ট ১ ও ২: পার্সোনাল ও গ্রুপ সেলস কমিশন */}
//               <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm print:shadow-none">
//                 <div 
//                   onClick={() => toggleSection('commission')} 
//                   className="flex justify-between items-center p-4 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition-colors print:bg-slate-50"
//                 >
//                   <div className="flex items-center gap-3">
//                     <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg print:hidden"><DollarSign size={16} /></div>
//                     <div>
//                       <h5 className="text-xs font-black text-slate-800">1 & 2. Personal & Group Sales Commission</h5>
//                       <p className="text-[10px] text-slate-400 font-bold print:hidden">কোন আইডি বনাম ইনভয়েস থেকে কত কমিশন এলো তার লগ তালিকা।</p>
//                     </div>
//                   </div>
//                   <div className="flex items-center gap-3">
//                     <span className="font-mono font-black text-slate-800 text-sm">৳{Number(salaryData.baseCommission || 0).toLocaleString()}</span>
//                     <div className="print:hidden">
//                       {openSection === 'commission' || openSection === 'all' ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
//                     </div>
//                   </div>
//                 </div>

//                 {(openSection === 'commission' || openSection === 'all') && (
//                   <div className="border-t border-slate-100 bg-white overflow-x-auto">
//                     <table className="w-full text-left border-collapse text-[11px] font-semibold">
//                       <thead>
//                         <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase font-black text-[9px] tracking-wider">
//                           <th className="p-3">Invoice No</th>
//                           <th className="p-3">Team Member</th>
//                           <th className="p-3 text-right">Bill Amt</th>
//                           <th className="p-3 text-right text-indigo-600">Earned</th>
//                         </tr>
//                       </thead>
//                       <tbody className="divide-y divide-slate-100 text-slate-600">
//                         {!salaryData.invoiceBreakdown || salaryData.invoiceBreakdown.length === 0 ? (
//                           <tr><td colSpan="4" className="p-4 text-center text-slate-400 text-[10px]">No team invoices logged for this period.</td></tr>
//                         ) : salaryData.invoiceBreakdown.map((inv, idx) => (
//                           <tr key={idx} className="hover:bg-slate-50/40">
//                             <td className="p-3 font-mono font-bold text-slate-800">{inv.invoiceNo}</td>
//                             <td className="p-3">{inv.memberName} <span className="text-slate-400 block text-[9px] font-mono">{inv.memberId}</span></td>
//                             <td className="p-3 text-right">৳{inv.invoiceAmount?.toLocaleString()}</td>
//                             <td className="p-3 text-right font-black text-indigo-600">৳{inv.earnedAmount?.toLocaleString()}</td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 )}
//               </div>

//               {/* সেগমেন্ট ৩: গ্লোবাল কোম্পানি পুল শেয়ার */}
//               <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm print:shadow-none">
//                 <div 
//                   onClick={() => toggleSection('pool')} 
//                   className="flex justify-between items-center p-4 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition-colors print:bg-slate-50"
//                 >
//                   <div className="flex items-center gap-3">
//                     <div className="p-2 bg-amber-50 text-amber-600 rounded-lg print:hidden"><Award size={16} /></div>
//                     <div>
//                       <h5 className="text-xs font-black text-slate-800">3. Global Pool Share (Company Sales)</h5>
//                       <p className="text-[10px] text-slate-400 font-bold print:hidden">কোম্পানি মোট প্রফিট শেয়ার বন্টনের গাণিতিক ধাপের বিবরণ।</p>
//                     </div>
//                   </div>
//                   <div className="flex items-center gap-3">
//                     <span className="font-mono font-black text-slate-800 text-sm">৳{Number(salaryData.globalPoolBonusAmount || 0).toLocaleString()}</span>
//                     <div className="print:hidden">
//                       {openSection === 'pool' || openSection === 'all' ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
//                     </div>
//                   </div>
//                 </div>

//                 {(openSection === 'pool' || openSection === 'all') && (
//                   <div className="border-t border-slate-100 bg-amber-50/5 p-4 space-y-3 text-xs font-semibold">
//                     <div className="bg-white p-3.5 rounded-xl border border-slate-100">
//                       <span className="text-[9px] font-black text-slate-400 block uppercase tracking-wider mb-2">Active Month Pool Share Counters Log</span>
//                       <div className="grid grid-cols-7 gap-2 text-center text-[10px]">
//                         {Object.entries(salaryData.poolCounters || { RSM: 0, DSM: 5, SDSM: 1, SM: 1, NSM: 1, ED: 0, BOM: 0 }).map(([pName, pCount]) => (
//                           <div key={pName} className={`p-1.5 rounded-lg border ${pCount > 0 ? 'bg-amber-50/60 border-amber-200 text-amber-900 font-black' : 'bg-slate-50/50 border-slate-100 text-slate-400'}`}>
//                             <span className="block font-bold text-[9px]">{pName}</span>
//                             <span className="text-xs">{pCount}</span>
//                           </div>
//                         ))}
//                       </div>
//                     </div>

//                     <div className="space-y-2">
//                       {salaryData.poolSteps?.map((step, idx) => (
//                         <div key={idx} className="flex gap-2 items-start bg-white p-3 rounded-xl border border-slate-200/50">
//                           <ArrowDownRight size={14} className="text-amber-500 mt-0.5 flex-shrink-0 print:hidden" />
//                           <p className="font-medium text-slate-700 leading-relaxed text-[11px]">{step}</p>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* সেগমেন্ট ৪: পারফরম্যান্স বোনাস */}
//               <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm print:shadow-none">
//                 <div 
//                   onClick={() => toggleSection('bonus')} 
//                   className="flex justify-between items-center p-4 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition-colors print:bg-slate-50"
//                 >
//                   <div className="flex items-center gap-3">
//                     <div className="p-2 bg-rose-50 text-rose-600 rounded-lg print:hidden"><TrendingUp size={16} /></div>
//                     <div>
//                       <h5 className="text-xs font-black text-slate-800">4. Performance Bonus Amount</h5>
//                       <p className="text-[10px] text-slate-400 font-bold print:hidden">মান্থলি টার্গেট পারফরম্যান্সের লাইভ হিসাব ফর্মুলা বিবরণী।</p>
//                     </div>
//                   </div>
//                   <div className="flex items-center gap-3">
//                     <span className="font-mono font-black text-slate-800 text-sm">৳{Number(salaryData.monthlyBonusAmount || 0).toLocaleString()}</span>
//                     <div className="print:hidden">
//                       {openSection === 'bonus' || openSection === 'all' ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
//                     </div>
//                   </div>
//                 </div>

//                 {(openSection === 'bonus' || openSection === 'all') && (
//                   <div className="border-t border-slate-100 bg-rose-50/10 p-4 space-y-2 text-xs font-semibold text-slate-600">
//                     {salaryData.bonusSteps?.map((step, idx) => (
//                       <div key={idx} className="flex gap-2 items-start bg-white p-2.5 rounded-xl border border-slate-200/50">
//                         <ArrowDownRight size={14} className="text-rose-500 mt-0.5 flex-shrink-0 print:hidden" />
//                         <p className="font-medium text-slate-700 text-[11px]">{step}</p>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>

//               {/* গ্র্যান্ড টোটাল নেট পে স্লিপ বটম সেকশন */}
//               <div className="mt-6 pt-5 border-t-2 border-dashed border-slate-200 flex justify-between items-center bg-slate-900 text-white p-5 rounded-2xl shadow-md print:bg-slate-900 print:text-white print:shadow-none">
//                 <div className="flex items-center gap-2">
//                   <ShieldCheck size={20} className="text-emerald-400" />
//                   <div>
//                     <h4 className="text-sm font-black tracking-wide">Total Net Disbursed</h4>
//                     <p className="text-[9px] text-slate-400 font-medium">নিট স্যালারি পে-আউট স্লিপ সামারি।</p>
//                   </div>
//                 </div>
//                 <h3 className="text-2xl font-black font-mono tracking-tight text-emerald-400">
//                   ৳{Number(salaryData.netTotalEarnings || 0).toLocaleString()}
//                 </h3>
//               </div>

//             </div>
//           </div>

//         </div>
//       )}

//            {/* 🛠️ ১-পেজ পিডিএফ এবং কালার ব্যাকগ্রাউন্ড প্রিন্ট নিশ্চিত করার গ্লোবাল সিএসএস */}
//       <style>{`
//         @media print {
//           body {
//             background-color: white !important;
//             color: black !important;
//           }
//           .print\\:hidden {
//             display: none !important;
//           }
//           /* ব্যাকগ্রাউন্ড কালার এবং থিম প্রিন্ট সচল রাখা */
//           * {
//             -webkit-print-color-adjust: exact !important;
//             print-color-adjust: exact !important;
//           }
//           @page {
//             size: A4 portrait;
//             margin: 10mm 15mm;
//           }
//         }
//       `}</style>

//     </div>
//   );
// };

// export default SalarySheet;



import { useState, useEffect } from 'react';
import API from '../api'; // আপনার তৈরি করা অ্যাক্সিওস/এপিআই ক্লায়েন্ট পাথ
import { FileText, ChevronDown, ChevronUp, RefreshCw, DollarSign, Award, Users, TrendingUp, ShieldCheck, ArrowDownRight } from 'lucide-react';

const SalarySheet = () => {
  const userIdNo = localStorage.getItem('userIdNo')?.trim() || 'MKT-0001'; 
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [salaryData, setSalaryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openSection, setOpenSection] = useState('all'); // প্রিন্ট অপ্টিমাইজড এর জন্য ডিফল্ট অল ওপেন

  const toggleSection = (sectionName) => {
    setOpenSection(openSection === sectionName ? null : sectionName);
  };

  const months = [
    { value: 1, name: 'January' }, { value: 2, name: 'February' }, { value: 3, name: 'March' }, 
    { value: 4, name: 'April' }, { value: 5, name: 'May' }, { value: 6, name: 'June' }, 
    { value: 7, name: 'July' }, { value: 8, name: 'August' }, { value: 9, name: 'September' }, 
    { value: 10, name: 'October' }, { value: 11, name: 'November' }, { value: 12, name: 'December' }
  ];
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const fetchMonthlySalarySheet = async () => {
    setLoading(true);
    try {
      const response = await API.get(`/commissions/my-salary-sheet?idNo=${userIdNo}&year=${selectedYear}&month=${selectedMonth}`);
      if (response.data.success) {
        setSalaryData(response.data.data);
      }
    } catch (error) {
      console.error("Failed to load monthly salary ledger sheet:", error);
      setSalaryData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthlySalarySheet();
  }, [selectedYear, selectedMonth]);

  const handleDownloadPDF = () => {
    setOpenSection('all');
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const sumField = (arr, field) => arr?.reduce((t, x) => t + Number(x[field] || 0), 0) || 0;

  return (
    <div className="p-6 bg-slate-100 min-h-screen font-sans antialiased print:bg-white print:p-0">
      
      {/* 🔝 কন্ট্রোল এবং ফিল্টার বার (প্রিন্ট মোডে হাইড থাকবে) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-6 print:hidden">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <FileText className="text-brand" size={26} />
            Official Salary Statement
          </h2>
          <p className="text-xs text-slate-500 mt-1">কোম্পানির অফিশিয়াল ৪-সেগমেন্ট গাণিতিক পে-স্লিপ অডিট লগ বুক।</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex-shrink-0">
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))} className="bg-transparent text-xs font-bold text-slate-600 outline-none pr-4 cursor-pointer">
            {months.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
          </select>
          <div className="h-4 w-px bg-slate-200"></div>
          <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="bg-transparent text-xs font-bold text-slate-600 outline-none pr-4 cursor-pointer">
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button onClick={fetchMonthlySalarySheet} className="text-slate-400 hover:text-brand transition-colors pl-1">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center p-20 text-slate-400 font-semibold animate-pulse text-xs">Compiling official statement format...</div>
      ) : !salaryData ? (
        <div className="max-w-5xl mx-auto bg-amber-50 border border-amber-200 text-amber-800 p-5 rounded-2xl text-xs font-semibold shadow-sm print:hidden">
          ⏳ এই মাসের স্যালারি শীট এখনও অ্যাডমিন অনুমোদন (Lock & Release) করেনি।
        </div>
      ) : (
        <div className="space-y-4 max-w-5xl mx-auto">
          
          <div className="flex justify-end gap-2.5 print:hidden">
            <button onClick={handleDownloadPDF} className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all">
              See & Download One-Page PDF
            </button>
          </div>

          {/* 🖨️ কোম্পানির আসল লেটারহেড কন্টেইনার (A4 Portrait Compliant) */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 print:border-0 print:shadow-none print:p-0 print:m-0">
            
            <div className="text-center border-b-2 border-slate-800 pb-4 mb-6">
              <h1 className="text-xl font-black text-slate-900 tracking-wider">JSTR Global LIMITED</h1>
              <p className="text-[10px] text-slate-500 font-semibold mt-0.5">06 Banani C/A (6rd Floor), Dhaka-1212. Tel : 056454.</p>
              <h3 className="text-xs font-bold bg-slate-100 inline-block px-4 py-1 rounded-full text-slate-800 uppercase tracking-wide mt-2">
                Salary Statement for the month of {salaryData.monthName} {salaryData.year}
              </h3>
              
              <div className="grid grid-cols-2 text-left text-[11px] font-bold text-slate-600 mt-4 max-w-md">
                <div>Staff ID : <span className="font-mono text-slate-900">{salaryData.staffId}</span></div>
                <div>Name of Staff : <span className="text-slate-900">{salaryData.staffName}</span></div>
              </div>
            </div>

                       {/* সেগমেন্ট ১: 1 PERSONAL SALES COMMISSION [১.১.১] */}
            <div className="mb-4">
              <div onClick={() => toggleSection('p1')} className="bg-slate-900 text-white text-[11px] font-black px-3 py-2 flex justify-between items-center rounded-t cursor-pointer select-none">
                <span>1 PERSONAL SALES COMMISSION</span>
                <span className="print:hidden">{openSection === 'p1' || openSection === 'all' ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}</span>
              </div>
              
              {(openSection === 'p1' || openSection === 'all') && (
                <div className="border border-t-0 border-slate-300 overflow-x-auto">
                  <table className="w-full text-left border-collapse text-[10px] font-medium font-sans">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-300 text-slate-700 font-bold uppercase text-[9px]">
                        <th className="p-2 border-r border-slate-200">Staff ID</th>
                        <th className="p-2 border-r border-slate-200">Rank</th>
                        <th className="p-2 border-r border-slate-200">Ref. ID</th>
                        <th className="p-2 border-r border-slate-200">Name of Staff</th>
                        <th className="p-2 border-r border-slate-200 text-right">A G S</th>
                        <th className="p-2 border-r border-slate-200 text-center">P %</th>
                        <th className="p-2 border-r border-slate-200 text-right">P S</th>
                        <th className="p-2 border-r border-slate-200 text-right">G S</th>
                        <th className="p-2 text-right">Comm</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-800">
                      {salaryData.personalCommissionLog?.map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50/50">
                          <td className="p-2 border-r border-slate-200 font-mono font-bold">{row.staffId}</td>
                          <td className="p-2 border-r border-slate-200 uppercase font-bold text-slate-500">{row.rank}</td>
                          <td className="p-2 border-r border-slate-200 font-mono text-slate-400">{row.refId}</td>
                          <td className="p-2 border-r border-slate-200 font-bold">{row.nameOfStaff}</td>
                          <td className="p-2 border-r border-slate-200 text-right font-mono">{row.ags?.toLocaleString()}</td>
                          <td className="p-2 border-r border-slate-200 text-center font-mono">{row.pPercentage?.toFixed(2)}%</td>
                          <td className="p-2 border-r border-slate-200 text-right font-mono">{row.ps?.toLocaleString()}</td>
                          <td className="p-2 border-r border-slate-200 text-right font-mono">{row.gs?.toLocaleString()}</td>
                          <td className="p-2 text-right font-mono font-black text-slate-900">৳{row.comm?.toLocaleString()}</td>
                        </tr>
                      ))}
                      <tr className="bg-slate-100/70 border-t border-slate-300 font-black text-slate-900">
                        <td colSpan="4" className="p-2 text-right uppercase border-r border-slate-200">Sub-Total:</td>
                        <td className="p-2 text-right font-mono border-r border-slate-200">{sumField(salaryData.personalCommissionLog, 'ags').toLocaleString()}</td>
                        <td className="border-r border-slate-200"></td>
                        <td className="p-2 text-right font-mono border-r border-slate-200">{sumField(salaryData.personalCommissionLog, 'ps').toLocaleString()}</td>
                        <td className="p-2 text-right font-mono border-r border-slate-200">{sumField(salaryData.personalCommissionLog, 'gs').toLocaleString()}</td>
                        <td className="p-2 text-right font-mono text-indigo-700">৳{sumField(salaryData.personalCommissionLog, 'comm').toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* সেগমেন্ট ২: 2 GROUP SALES COMMISSION [১.১.১] */}
            <div className="mb-4">
              <div onClick={() => toggleSection('p2')} className="bg-slate-900 text-white text-[11px] font-black px-3 py-2 flex justify-between items-center rounded-t cursor-pointer select-none">
                <span>2 GROUP SALES COMMISSION (GAP LOG)</span>
                <span className="print:hidden">{openSection === 'p2' || openSection === 'all' ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}</span>
              </div>
              
              {(openSection === 'p2' || openSection === 'all') && (
                <div className="border border-t-0 border-slate-300 overflow-x-auto">
                  <table className="w-full text-left border-collapse text-[10px] font-medium font-sans">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-300 text-slate-700 font-bold uppercase text-[9px]">
                        <th className="p-2 border-r border-slate-200">Staff ID</th>
                        <th className="p-2 border-r border-slate-200">Rank</th>
                        <th className="p-2 border-r border-slate-200">Ref. ID</th>
                        <th className="p-2 border-r border-slate-200">Name of Staff</th>
                        <th className="p-2 border-r border-slate-200 text-right">A G S</th>
                        <th className="p-2 border-r border-slate-200 text-center">P %</th>
                        <th className="p-2 border-r border-slate-200 text-right">P S</th>
                        <th className="p-2 border-r border-slate-200 text-right">G S</th>
                        <th className="p-2 text-right">Comm</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-700">
                      {salaryData.groupCommissionLog?.slice(0, 8).map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50/50">
                          <td className="p-2 border-r border-slate-200 font-mono font-bold text-slate-800">{row.staffId}</td>
                          <td className="p-2 border-r border-slate-200 font-bold text-indigo-600">{row.rank}</td>
                          <td className="p-2 border-r border-slate-200 font-mono text-slate-400">{row.refId}</td>
                          <td className="p-2 border-r border-slate-200 text-slate-800 font-semibold">{row.nameOfStaff}</td>
                          <td className="p-2 border-r border-slate-200 text-right font-mono">{row.ags?.toLocaleString()}</td>
                          <td className="p-2 border-r border-slate-200 text-center font-mono text-indigo-600">{row.pPercentage?.toFixed(2)}%</td>
                          <td className="p-2 border-r border-slate-200 text-right font-mono">{row.ps?.toLocaleString()}</td>
                          <td className="p-2 border-r border-slate-200 text-right font-mono">{row.gs?.toLocaleString()}</td>
                          <td className="p-2 text-right font-mono font-bold text-slate-900">৳{row.comm?.toLocaleString()}</td>
                        </tr>
                      ))}
                      <tr className="bg-slate-100/70 border-t border-slate-300 font-black text-slate-900">
                        <td colSpan="4" className="p-2 text-right uppercase border-r border-slate-200">Sub-Total:</td>
                        <td className="p-2 text-right font-mono border-r border-slate-200">৳{sumField(salaryData.groupCommissionLog, 'ags').toLocaleString()}</td>
                        <td className="border-r border-slate-200"></td>
                        <td className="p-2 text-right font-mono border-r border-slate-200">{sumField(salaryData.groupCommissionLog, 'ps').toLocaleString()}</td>
                        <td className="p-2 text-right font-mono border-r border-slate-200">{sumField(salaryData.groupCommissionLog, 'gs').toLocaleString()}</td>
                        <td className="p-2 text-right font-mono text-indigo-700">৳{sumField(salaryData.groupCommissionLog, 'comm').toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>

                       {/* সেগমেন্ট ৩: 3 COMPANY SALES SHARE [১.১.২] */}
            <div className="mb-6">
              <div onClick={() => toggleSection('p3')} className="bg-slate-900 text-white text-[11px] font-black px-3 py-2 flex justify-between items-center rounded-t cursor-pointer select-none">
                <span>3 COMPANY SALES SHARE / GLOBAL POOL BREAKDOWN</span>
                <span className="print:hidden">{openSection === 'p3' || openSection === 'all' ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}</span>
              </div>
              
              {(openSection === 'p3' || openSection === 'all') && (
                <div className="border border-t-0 border-slate-300 overflow-x-auto">
                  
                  {/* একটিভ মান্থ পুল শেয়ার ইন্ডিকেটর লগ */}
                  <div className="bg-slate-50 p-3 border-b border-slate-200">
                    <span className="text-[9px] font-black text-slate-400 block uppercase tracking-wider mb-2">Active Month Pool Share Counters Log</span>
                    <div className="grid grid-cols-7 gap-1 text-center text-[9px]">
                      {Object.entries(salaryData.poolCounters || { RSM: 0, DSM: 5, SDSM: 1, SM: 1, NSM: 1, ED: 0, BOM: 0 }).map(([pName, pCount]) => (
                        <div key={pName} className={`p-1 rounded border ${pCount > 0 ? 'bg-amber-50 border-amber-200 text-amber-900 font-black' : 'bg-white border-slate-100 text-slate-400'}`}>
                          <span>{pName} ({pCount})</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <table className="w-full text-left border-collapse text-[10px] font-medium font-sans">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-300 text-slate-700 font-bold uppercase text-[9px]">
                        <th className="p-2 border-r border-slate-200">Target Pool</th>
                        <th className="p-2 border-r border-slate-200">Staff ID</th>
                        <th className="p-2 border-r border-slate-200">Name of Staff</th>
                        <th className="p-2 border-r border-slate-200 text-right">Global Sales Co.</th>
                        <th className="p-2 border-r border-slate-200 text-center">Share %</th>
                        <th className="p-2 border-r border-slate-200 text-center">Share Count</th>
                        <th className="p-2 text-right">Earned Payout</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-800 font-semibold">
                      {salaryData.companyShareLogs?.map((row, i) => (
                        <tr key={i} className="hover:bg-amber-50/20">
                          <td className="p-2 border-r border-slate-200 text-amber-700 font-black font-mono">COMPANY SHARE ({row.poolName})</td>
                          <td className="p-2 border-r border-slate-200 font-mono">{row.staffId}</td>
                          <td className="p-2 border-r border-slate-200">{row.nameOfStaff}</td>
                          <td className="p-2 border-r border-slate-200 text-right font-mono">৳{row.globalSales?.toLocaleString()}</td>
                          <td className="p-2 border-r border-slate-200 text-center text-indigo-600 font-black font-mono">{row.percentage?.toFixed(2)}%</td>
                          <td className="p-2 border-r border-slate-200 text-center font-mono">{row.shareCount} জন</td>
                          <td className="p-2 text-right font-mono font-black text-emerald-700">৳{row.comm?.toLocaleString()}</td>
                        </tr>
                      ))}
                      <tr className="bg-slate-100/70 border-t border-slate-300 font-black text-slate-900">
                        <td colSpan="6" className="p-2 text-right uppercase border-r border-slate-200">Sub-Total Pool Allocation:</td>
                        <td className="p-2 text-right font-mono text-emerald-700">৳{sumField(salaryData.companyShareLogs, 'comm').toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>

                  {/* স্টেপ বাই স্টেপ ম্যাথমেটিকাল টেক্সট রেন্ডারিং */}
                  <div className="p-3 bg-amber-50/20 border-t border-slate-200 space-y-1 text-[11px] text-slate-600 font-medium">
                    {salaryData.poolSteps?.map((step, idx) => (
                      <div key={idx} className="flex gap-1.5 items-start">
                        <ArrowDownRight size={12} className="text-amber-500 mt-0.5 flex-shrink-0" />
                        <p>{step}</p>
                      </div>
                    ))}
                  </div>

                </div>
              )}
            </div>

                       {/* ------------------------------------------------------------- */}
            {/* সেগমেন্ট ৪: 4. Performance Bonus Amount */}
            {/* ------------------------------------------------------------- */}
            <div className="mb-6">
              <div 
                onClick={() => toggleSection('bonus')} 
                className="bg-slate-900 text-white text-[11px] font-black px-3 py-2 flex justify-between items-center rounded-t cursor-pointer select-none"
              >
                <span>4 PERFORMANCE BONUS AMOUNT</span>
                <span className="print:hidden">
                  {openSection === 'bonus' || openSection === 'all' ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                </span>
              </div>
              
              {(openSection === 'bonus' || openSection === 'all') && (
                <div className="border border-t-0 border-slate-300 bg-white">
                  
                  {/* ইনভয়েস স্টাইল লাক্সারি ডাইরেক্ট বোনাস ডিসপ্লে টেবিল */}
                  <table className="w-full text-left border-collapse text-[10px] font-medium font-sans">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-300 text-slate-700 font-bold uppercase text-[9px]">
                        <th className="p-2 border-r border-slate-200">Staff ID</th>
                        <th className="p-2 border-r border-slate-200">Name of Staff</th>
                        <th className="p-2 border-r border-slate-200 text-center">Bonus Rate (%)</th>
                        <th className="p-2 border-r border-slate-200 text-right">Team Target Volume</th>
                        <th className="p-2 text-right text-rose-600">Earned Bonus</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-800 font-semibold">
                      <tr className="hover:bg-rose-50/10">
                        <td className="p-2 border-r border-slate-200 font-mono">{salaryData.idNo || salaryData.staffId}</td>
                        <td className="p-2 border-r border-slate-200">{salaryData.staffName || salaryData.name}</td>
                        <td className="p-2 border-r border-slate-200 text-center font-mono text-rose-600">
                          {((salaryData.performanceBonusRate || 0.0025) * 100).toFixed(4)}%
                        </td>
                        <td className="p-2 border-r border-slate-200 text-right font-mono">
                          ৳{(salaryData.thisMonthSalesAchieved || salaryData.thisMonthSalesVolume || 0).toLocaleString()}
                        </td>
                        <td className="p-2 text-right font-mono font-black text-rose-600">
                          ৳{Number(salaryData.monthlyBonusAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                      <tr className="bg-slate-100/70 border-t border-slate-300 font-black text-slate-900">
                        <td colSpan="4" className="p-2 text-right uppercase border-r border-slate-200">Sub-Total Performance Payout:</td>
                        <td className="p-2 text-right font-mono text-rose-600">
                          ৳{Number(salaryData.monthlyBonusAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* স্টেপ বাই স্টেপ গাণিতিক সমীকরণ গাইডবক্স */}
                  {salaryData.bonusSteps && salaryData.bonusSteps.length > 0 && (
                    <div className="p-3.5 bg-rose-50/10 border-t border-slate-200 space-y-1 text-[11px] text-slate-600 font-medium">
                      <span className="text-[10px] font-black text-rose-700 block uppercase mb-1 tracking-wide">Mathematical Calculation Formula Flow</span>
                      {salaryData.bonusSteps.map((step, idx) => (
                        <div key={idx} className="flex gap-1.5 items-start">
                          <ArrowDownRight size={12} className="text-rose-500 mt-0.5 flex-shrink-0" />
                          <p className="text-slate-700 leading-relaxed font-medium">{step}</p>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              )}
            </div>

            {/* 💰 ফাইনal গ্র্যান্ড টোটাল নেট পেয়েবল মেমো স্লিপ (সার্ভিস চার্জ সহ) */}
            <div className="border-2 border-dashed border-slate-400 rounded-2xl p-4 bg-slate-50 max-w-md ml-auto text-xs font-bold space-y-2.5 print:border-slate-800 print:bg-white">
              <div className="flex justify-between text-slate-600">
                <span>Grand Total Earnings:</span>
                <span className="font-mono text-slate-900">
                  ৳{Number(salaryData.financials?.grandTotal || (Number(salaryData.baseCommission || 0) + Number(salaryData.globalPoolBonusAmount || 0) + Number(salaryData.monthlyBonusAmount || 0))).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-rose-600 border-b border-slate-200 pb-2">
                <span>Less Service Charge (10%):</span>
                <span className="font-mono">
                  - ৳{Number(salaryData.financials?.serviceCharge || ((Number(salaryData.baseCommission || 0) + Number(salaryData.globalPoolBonusAmount || 0) + Number(salaryData.monthlyBonusAmount || 0)) * 0.10)).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-sm font-black text-slate-900 pt-1">
                <span className="text-slate-800">Net Payable Amount:</span>
                <span className="font-mono text-emerald-700 text-base">
                  ৳{Number(salaryData.netTotalEarnings || salaryData.financials?.netPayable || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* অফিশিয়াল সিগনেচার সেকশন */}
            <div className="hidden print:flex justify-between items-center mt-16 text-[10px] font-bold text-slate-500 px-6">
              <div className="border-t border-slate-400 pt-1 w-32 text-center">Prepared By</div>
              <div className="border-t border-slate-400 pt-1 w-32 text-center">Verified Audit</div>
              <div className="border-t border-slate-400 pt-1 w-32 text-center">Managing Director</div>
            </div>

          </div>
        </div>
      )}

      {/* 🛠️ গ্লোবাল প্রিন্ট লেআউট ইঞ্জিন সিএসএস */}
      <style>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            box-shadow: none !important;
          }
          @page {
            size: A4 portrait;
            margin: 8mm 12mm;
          }
        }
      `}</style>

    </div>
  );
};

export default SalarySheet;
