
// import React, { useState } from 'react';
// import axios from 'axios';
// import { Search, Calendar, UserCheck, Download, Printer, ArrowUpRight, AlertCircle } from 'lucide-react';

// const StaffAdvanceReports = () => {
//   const [employeeIdNo, setEmployeeIdNo] = useState('');
//   const [dealerCode, setDealerCode] = useState('');
//   const [startDate, setStartDate] = useState(
//     new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
//   );
//   const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
//   const [reportData, setReportData] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [errorMsg, setErrorMsg] = useState(null);

//   const fetchAdvanceReports = async () => {
//     setLoading(true);
//     setErrorMsg(null);

//     try {
//       const token = localStorage.getItem('token');
//       let apiUrl = `http://localhost:3000/api/reports/advance-adjustments`;
      
//       const params = {};
//       const searchTarget = employeeIdNo.trim() || dealerCode.trim();
//       if (searchTarget) params.employeeIdNo = searchTarget.toUpperCase();
//       if (startDate) params.startDate = startDate;
//       if (endDate) params.endDate = endDate;

//       const { data } = await axios.get(apiUrl, {
//         params,
//         headers: { Authorization: `Bearer ${token}` }
//       });

//       if (data && data.success) {
//         setReportData(data);
//       } else {
//         setErrorMsg('Failed to fetch report data.');
//       }
//     } catch (error) {
//       console.error("API Error:", error);
//       setErrorMsg(error.response?.data?.message || 'Server connection error!');
//       setReportData(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleExportCSV = () => {
//     if (!reportData || !reportData.adjustments || reportData.adjustments.length === 0) return;
    
//     const headers = ["Invoice No,Date,Dealer Code,Staff ID,Name,Grand Total,Adjusted Amount,Payment Status"];
//     const rows = reportData.adjustments.map((item) => [
//       `"${item.invoiceNo}"`,
//       `"${new Date(item.date).toLocaleDateString('en-GB')}"`,
//       `"${item.dealerCode || 'N/A'}"`,
//       `"${item.employeeIdNo}"`,
//       `"${item.employeeName.replace(/"/g, '""')}"`,
//       item.grandTotal,
//       item.adjustedAmount,
//       item.paymentStatus
//     ].join(','));

//     const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
//     const encodedUri = encodeURI(csvContent);
//     const link = document.createElement("a");
//     link.setAttribute("href", encodedUri);
//     link.setAttribute("download", `Advance_Adjustment_Report_${startDate}_to_${endDate}.csv`);
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   // 🖨️ A4 Print Function (সিগনেচার সেকশন সহ)
//   const handlePrintA4 = () => {
//     if (!reportData || !reportData.adjustments) return;
//     const { totalAdvanceAdjusted } = reportData.summary;

//     let printWindow = window.open('', '_blank', 'height=800,width=1000');
//     let htmlContent = `
//       <html>
//         <head>
//           <title>Staff & Dealer Advance Adjustment Report</title>
//           <style>
//             body { font-family: Arial, sans-serif; color: #1e293b; margin: 15px; background: #fff; }
//             .header { text-align: center; margin-bottom: 15px; border-bottom: 2px solid #cbd5e1; padding-bottom: 10px; }
//             .header h2 { margin: 0; font-size: 20px; color: #0f172a; text-transform: uppercase; }
//             .header p { margin: 3px 0; font-size: 11px; color: #475569; }
            
//             .summary-box { margin-bottom: 15px; border: 1px solid #cbd5e1; border-radius: 6px; background: #f8fafc; padding: 10px; text-align: center; }
//             .summary-label { font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: bold; }
//             .summary-val { font-size: 15px; font-weight: bold; color: #2563eb; margin-top: 3px; }

//             table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 10px; }
//             th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; }
//             th { background-color: #f1f5f9; color: #334155; font-weight: bold; text-transform: uppercase; }
//             .text-right { text-align: right; }
//             .text-center { text-align: center; }

//             /* Signature Section Styles */
//             .signature-container {
//               display: flex;
//               justify-content: space-between;
//               margin-top: 60px;
//               padding: 0 20px;
//             }
//             .signature-box {
//               text-align: center;
//               width: 30%;
//             }
//             .signature-line {
//               border-top: 1px solid #334155;
//               margin-bottom: 5px;
//             }
//             .signature-title {
//               font-size: 11px;
//               font-weight: bold;
//               color: #334155;
//               text-transform: uppercase;
//             }

//             @page { size: A4 portrait; margin: 8mm; }
//           </style>
//         </head>
//         <body>
//           <div class="header">
//             <h2>ERGON Pharmaceuticals Ltd.</h2>
//             <p><strong>Staff & Dealer Advance Adjustment Report</strong></p>
//             <p>Period: ${startDate} to ${endDate}</p>
//           </div>

//           <div class="summary-box">
//             <div class="summary-label">Total Advance Adjusted (Deducted)</div>
//             <div class="summary-val">৳${totalAdvanceAdjusted.toLocaleString()}</div>
//           </div>

//           <table>
//             <thead>
//               <tr>
//                 <th>Date</th>
//                 <th>Invoice No</th>
//                 <th>Dealer Code</th>
//                 <th>Staff ID</th>
//                 <th>Name</th>
//                 <th class="text-right">Grand Total</th>
//                 <th class="text-right">Adjusted Amount</th>
//                 <th class="text-center">Status</th>
//               </tr>
//             </thead>
//             <tbody>
//               ${reportData.adjustments.map(item => `
//                 <tr>
//                   <td>${new Date(item.date).toLocaleDateString('en-GB')}</td>
//                   <td><b>${item.invoiceNo}</b></td>
//                   <td><b>${item.dealerCode || 'N/A'}</b></td>
//                   <td>${item.employeeIdNo}</td>
//                   <td>${item.employeeName}</td>
//                   <td class="text-right">৳${item.grandTotal.toLocaleString()}</td>
//                   <td class="text-right" style="font-weight: bold; color: #2563eb;">৳${item.adjustedAmount.toLocaleString()}</td>
//                   <td class="text-center">${item.paymentStatus}</td>
//                 </tr>
//               `).join('')}
//             </tbody>
//           </table>

//           <!-- Signature Section -->
//           <div class="signature-container">
//             <div class="signature-box">
//               <div class="signature-line"></div>
//               <div class="signature-title">Received By</div>
//             </div>
//             <div class="signature-box">
//               <div class="signature-line"></div>
//               <div class="signature-title">Checked By</div>
//             </div>
//             <div class="signature-box">
//               <div class="signature-line"></div>
//               <div class="signature-title">Authorized By</div>
//             </div>
//           </div>
//         </body>
//       </html>
//     `;
//     printWindow.document.write(htmlContent);
//     printWindow.document.close();
//     printWindow.focus();
//     setTimeout(() => {
//       printWindow.print();
//       printWindow.close();
//     }, 500);
//   };

//   return (
//     <div className="p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen">
//       <div className="max-w-7xl mx-auto space-y-6">
        
//         {/* Header & Filters Panel */}
//         <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
//           <div>
//             <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Staff & Dealer Advance Reports</h1>
//             <p className="text-sm text-slate-500">ইনভয়েস ভিত্তিক অ্যাডভান্স ও ডিলার ডিডাকশন ট্র্যাক এবং প্রিন্ট করুন</p>
//           </div>

//           {errorMsg && (
//             <div className="p-3 rounded-xl text-xs sm:text-sm flex items-center gap-2 bg-rose-50 text-rose-700 border border-rose-200">
//               <AlertCircle className="w-4 h-4 shrink-0" />
//               <span>{errorMsg}</span>
//             </div>
//           )}

//           <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center pt-2">
//             <div className="md:col-span-3 flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
//               <UserCheck className="w-4 h-4 text-slate-400 shrink-0" />
//               <input
//                 type="text"
//                 placeholder="Staff ID"
//                 value={employeeIdNo}
//                 onChange={(e) => setEmployeeIdNo(e.target.value)}

//                 className="text-sm outline-none font-semibold text-slate-700 bg-transparent w-full uppercase"
//               />
//             </div>

//             <div className="md:col-span-5 flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
//               <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
//               <input
//                 type="date"
//                 value={startDate}
//                 onChange={(e) => setStartDate(e.target.value)}
//                 className="text-sm outline-none font-medium text-slate-700 bg-transparent w-full"
//               />
//               <span className="text-slate-400 text-xs">to</span>
//               <input
//                 type="date"
//                 value={endDate}
//                 onChange={(e) => setEndDate(e.target.value)}
//                 className="text-sm outline-none font-medium text-slate-700 bg-transparent w-full"
//               />
//             </div>

//             <div className="md:col-span-4 grid grid-cols-3 gap-2">
//               <button
//                 onClick={fetchAdvanceReports}
//                 className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-2 rounded-xl text-xs sm:text-sm font-medium transition flex items-center justify-center gap-1 shadow-sm"
//               >
//                 <Search className="w-4 h-4" /> Load
//               </button>
//               <button
//                 onClick={handleExportCSV}
//                 disabled={!reportData || reportData.adjustments?.length === 0}
//                 className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white py-3 px-2 rounded-xl text-xs sm:text-sm font-medium transition flex items-center justify-center gap-1 shadow-sm"
//               >
//                 <Download className="w-4 h-4" /> CSV
//               </button>
//               <button
//                 onClick={handlePrintA4}
//                 disabled={!reportData || reportData.adjustments?.length === 0}
//                 className="bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white py-3 px-2 rounded-xl text-xs sm:text-sm font-medium transition flex items-center justify-center gap-1 shadow-sm"
//               >
//                 <Printer className="w-4 h-4" /> Print
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Report Content Section */}
//         <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
//           {loading ? (
//             <div className="py-16 text-center text-slate-500 font-medium text-sm">Loading advance reports...</div>
//           ) : reportData ? (
//             <div className="space-y-6">
              
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
//                   <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total Invoices Processed</p>
//                   <p className="text-xl font-bold text-slate-800 mt-1">{reportData.count} <span className="text-xs font-normal text-slate-500">Invoices</span></p>
//                 </div>
//                 <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
//                   <p className="text-xs text-blue-500 font-semibold uppercase tracking-wider flex items-center gap-1">
//                     <ArrowUpRight className="w-4 h-4"/> Total Advance Adjusted (Deducted)
//                   </p>
//                   <p className="text-xl font-bold text-blue-700 mt-1">৳{reportData.summary.totalAdvanceAdjusted.toLocaleString()}</p>
//                 </div>
//               </div>

//               {/* 📱 Mobile Card View */}
//               <div className="block lg:hidden space-y-3 mt-4">
//                 {reportData.adjustments.length > 0 ? (
//                   reportData.adjustments.map((item, idx) => (
//                     <div key={idx} className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2.5">
//                       <div className="flex justify-between items-center text-xs border-b border-slate-200 pb-2">
//                         <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{item.invoiceNo}</span>
//                         <span className="text-slate-500 font-medium">{new Date(item.date).toLocaleDateString('en-GB')}</span>
//                       </div>
                      
//                       <div>
//                         <p className="text-xs font-bold text-slate-800">{item.employeeName} <span className="text-blue-600">({item.employeeIdNo})</span></p>
//                         <p className="text-[11px] text-slate-500">Dealer Code: <span className="font-semibold text-slate-700">{item.dealerCode || 'N/A'}</span></p>
//                       </div>

//                       <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-xs">
//                         <div>
//                           <span className="text-slate-400 text-[10px] uppercase font-semibold block">Grand Total</span>
//                           <span className="font-bold text-slate-700">৳{item.grandTotal.toLocaleString()}</span>
//                         </div>
//                         <div className="text-right">
//                           <span className="text-slate-400 text-[10px] uppercase font-semibold block">Adjusted Amount</span>
//                           <span className="font-bold text-blue-600 text-sm">৳{item.adjustedAmount.toLocaleString()}</span>
//                         </div>
//                       </div>
//                     </div>
//                   ))
//                 ) : (
//                   <div className="p-8 text-center text-slate-400 text-xs">No advance adjustments found for this filter.</div>
//                 )}
//               </div>

//               {/* 💻 Desktop Table View */}
//               <div className="hidden lg:block overflow-x-auto rounded-xl border border-slate-200 mt-4">
//                 <table className="w-full text-left text-sm whitespace-nowrap">
//                   <thead className="bg-slate-100 text-slate-600 uppercase font-semibold text-xs border-b border-slate-200">
//                     <tr>
//                       <th className="p-3.5">Date</th>
//                       <th className="p-3.5">Invoice No</th>
//                       <th className="p-3.5">Dealer Code</th>
//                       <th className="p-3.5">Staff ID</th>
//                       <th className="p-3.5">Name</th>
//                       <th className="p-3.5 text-right">Grand Total</th>
//                       <th className="p-3.5 text-right">Adjusted Advance</th>
//                       <th className="p-3.5 text-center">Status</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-slate-100 text-sm">
//                     {reportData.adjustments.length > 0 ? (
//                       reportData.adjustments.map((item, idx) => (
//                         <tr key={idx} className="hover:bg-slate-50">
//                           <td className="p-3.5 text-slate-500">{new Date(item.date).toLocaleDateString('en-GB')}</td>
//                           <td className="p-3.5 font-bold text-blue-600">{item.invoiceNo}</td>
//                           <td className="p-3.5 font-bold text-slate-700">{item.dealerCode || 'N/A'}</td>
//                           <td className="p-3.5 font-semibold text-slate-600">{item.employeeIdNo}</td>
//                           <td className="p-3.5 font-medium text-slate-700">{item.employeeName}</td>
//                           <td className="p-3.5 text-right font-medium text-slate-700">৳{item.grandTotal.toLocaleString()}</td>
//                           <td className="p-3.5 text-right font-bold text-blue-600">৳{item.adjustedAmount.toLocaleString()}</td>
//                           <td className="p-3.5 text-center">
//                             <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-xs font-semibold">
//                               {item.paymentStatus}
//                             </span>
//                           </td>
//                         </tr>
//                       ))
//                     ) : (
//                       <tr>
//                         <td colSpan="8" className="p-12 text-center text-slate-400">No advance adjustments found for this date range.</td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>

//             </div>
//           ) : (
//             <div className="py-16 text-center text-slate-400 text-sm">
//               স্টাফ আইডি কোড এবং ডেট রেঞ্জ সিলেক্ট করে "Load" বাটনে ক্লিক করুন।
//             </div>
//           )}
//         </div>

//       </div>
//     </div>
//   );
// };

// export default StaffAdvanceReports;



import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, Calendar, UserCheck, Download, Printer, ArrowUpRight, AlertCircle, Users, FileText } from 'lucide-react';
import API from '../../api'; // আপনার Axios/API ক্লায়েন্ট পাথ

const StaffAdvanceReports = () => {
  const [reportType, setReportType] = useState('summary'); // 'summary' অথবা 'details'
  const [employeeIdNo, setEmployeeIdNo] = useState('');
  const [dealerCode, setDealerCode] = useState('');
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [reportData, setReportData] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'; 

  // 🔍 Fetch Report Data
  const fetchReport = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const token = localStorage.getItem('token');
      const params = {};
      const searchTarget = employeeIdNo.trim() || dealerCode.trim();
      if (searchTarget) params.employeeIdNo = searchTarget.toUpperCase();
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      if (reportType === 'summary') {
        const { data } = await axios.get(`${SERVER_URL}/api/reports/advance-summary`, {
          params: { startDate, endDate },
          headers: { Authorization: `Bearer ${token}` }
        });
        if (data && data.success) {
          setSummaryData(data);
          setReportData(null);
        }
      } else {
        const { data } = await axios.get(`${SERVER_URL}/api/reports/advance-adjustments`, {
          params,
          headers: { Authorization: `Bearer ${token}` }
        });
        if (data && data.success) {
          setReportData(data);
          setSummaryData(null);
        }
      }
    } catch (error) {
      console.error("API Error:", error);
      setErrorMsg(error.response?.data?.message || 'Server connection error!');
    } finally {
      setLoading(false);
    }
  };

  // কোম্পানির ডেটা রাখার জন্য স্টেট ডিক্লেয়ার করা হলো
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
            const loadSidebarCompanyData = async () => {
              try {
                const response = await API.get("/company/me");
                
                // ব্যাকএন্ড থেকে ডেটা সফলভাবে আসলে স্টেটে সেট হবে
                if (response.data && response.data.success && response.data.data) {
                  setCompanyData(response.data.data);
                }
              } catch (error) {
                // যদি ইউজার নতুন হয় এবং কোনো কোম্পানি প্রোফাইল না থাকে (404 Error)
                if (error.response && error.response.status === 404) {
                  console.log("New user: Sidebar initialized with default fallback text.");
                  setCompanyData({ name: "" }); // স্টেট খালি রাখা হলো যাতে প্লেসহোল্ডার দেখায়
                } else {
                  console.error("Failed to load company data in sidebar:", error);
                }
              }
            };
        
            loadSidebarCompanyData();
          }, []);

  // 📥 CSV Export
  const handleExportCSV = () => {
    if (reportType === 'details' && reportData && reportData.adjustments?.length > 0) {
      const headers = ["Invoice No,Date,Dealer Code,Staff ID,Name,Grand Total,Adjusted Amount,Payment Status"];
      const rows = reportData.adjustments.map((item) => [
        `"${item.invoiceNo}"`,
        `"${new Date(item.date).toLocaleDateString('en-GB')}"`,
        `"${item.dealerCode || 'N/A'}"`,
        `"${item.employeeIdNo}"`,
        `"${item.employeeName.replace(/"/g, '""')}"`,
        item.grandTotal,
        item.adjustedAmount,
        item.paymentStatus
      ].join(','));
      downloadCSV(headers, rows, `Advance_Details_Report_${startDate}_to_${endDate}.csv`);
    } else if (reportType === 'summary' && summaryData && summaryData.summary?.length > 0) {
      const headers = ["Staff/Dealer ID,Name,Total Invoices,Total Adjusted Amount"];
      const rows = summaryData.summary.map((item) => [
        `"${item._id}"`,
        `"${item.employeeName ? item.employeeName.replace(/"/g, '""') : 'N/A'}"`,
        item.totalInvoices,
        item.totalAdjustedAmount
      ].join(','));
      downloadCSV(headers, rows, `Advance_Summary_Report_${startDate}_to_${endDate}.csv`);
    }
  };

  const downloadCSV = (headers, rows, filename) => {
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 🖨️ A4 Print Function
  const handlePrintA4 = () => {
    if (reportType === 'details' && (!reportData || !reportData.adjustments)) return;
    if (reportType === 'summary' && (!summaryData || !summaryData.summary)) return;

    let printWindow = window.open('', '_blank', 'height=800,width=1000');
    let htmlContent = `
      <html>
        <head>
          <title>${reportType === 'summary' ? 'Staff Advance Summary Report' : 'Staff Advance Details Report'}</title>
          <style>
            body { font-family: Arial, sans-serif; color: #1e293b; margin: 15px; background: #fff; }
            .header { text-align: center; margin-bottom: 15px; border-bottom: 2px solid #cbd5e1; padding-bottom: 10px; }
            .header h2 { margin: 0; font-size: 20px; color: #0f172a; text-transform: uppercase; }
            .header p { margin: 3px 0; font-size: 11px; color: #475569; }
            
            .summary-box { margin-bottom: 15px; border: 1px solid #cbd5e1; border-radius: 6px; background: #f8fafc; padding: 10px; text-align: center; }
            .summary-label { font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: bold; }
            .summary-val { font-size: 15px; font-weight: bold; color: #2563eb; margin-top: 3px; }

            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 10px; }
            th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; }
            th { background-color: #f1f5f9; color: #334155; font-weight: bold; text-transform: uppercase; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }

            .signature-container { display: flex; justify-content: space-between; margin-top: 60px; padding: 0 20px; }
            .signature-box { text-align: center; width: 30%; }
            .signature-line { border-top: 1px solid #334155; margin-bottom: 5px; }
            .signature-title { font-size: 11px; font-weight: bold; color: #334155; text-transform: uppercase; }

            @page { size: A4 portrait; margin: 8mm; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>${companyData.name || 'Company Name'}</h2>
            <p><strong>${reportType === 'summary' ? 'Total Staff Advance Summary Report' : 'Detailed Staff Advance Adjustment Report'}</strong></p>
            <p>Period: ${startDate} to ${endDate}</p>
          </div>

          ${reportType === 'summary' ? `
            <div class="summary-box">
              <div class="summary-label">Grand Total Advance Deducted</div>
              <div class="summary-val">৳${summaryData.grandTotalAdvance.toLocaleString()}</div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Staff ID</th>
                  <th>Name</th>
                  <th class="text-center">Total Invoices</th>
                  <th class="text-right">Total Adjusted Amount</th>
                </tr>
              </thead>
              <tbody>
                ${summaryData.summary.map(item => `
                  <tr>
                    <td><b>${item._id}</b></td>
                    <td>${item.employeeName || 'N/A'}</td>
                    <td class="text-center">${item.totalInvoices}</td>
                    <td class="text-right" style="font-weight: bold; color: #2563eb;">৳${item.totalAdjustedAmount.toLocaleString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : `
            <div class="summary-box">
              <div class="summary-label">Total Advance Adjusted</div>
              <div class="summary-val">৳${reportData.summary.totalAdvanceAdjusted.toLocaleString()}</div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Invoice No</th>
                  <th>Dealer Code</th>
                  <th>Staff ID</th>
                  <th>Name</th>
                  <th class="text-right">Grand Total</th>
                  <th class="text-right">Adjusted Amount</th>
                  <th class="text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                ${reportData.adjustments.map(item => `
                  <tr>
                    <td>${new Date(item.date).toLocaleDateString('en-GB')}</td>
                    <td><b>${item.invoiceNo}</b></td>
                    <td><b>${item.dealerCode || 'N/A'}</b></td>
                    <td>${item.employeeIdNo}</td>
                    <td>${item.employeeName}</td>
                    <td class="text-right">৳${item.grandTotal.toLocaleString()}</td>
                    <td class="text-right" style="font-weight: bold; color: #2563eb;">৳${item.adjustedAmount.toLocaleString()}</td>
                    <td class="text-center">${item.paymentStatus}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `}

          <div class="signature-container">
            <div class="signature-box"><div class="signature-line"></div><div class="signature-title">Received By</div></div>
            <div class="signature-box"><div class="signature-line"></div><div class="signature-title">Checked By</div></div>
            <div class="signature-box"><div class="signature-line"></div><div class="signature-title">Authorized By</div></div>
          </div>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
  };

  return (
    <div className="p-3 sm:p-6 lg:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        
        {/* Top Header & Controls Panel */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-slate-800">Staff & Dealer Advance Reports</h1>
              <p className="text-xs sm:text-sm text-slate-500">সামারি অথবা ডিটেইলস রিপোর্ট সিলেক্ট করে ম্যানেজ করুন</p>
            </div>

            {/* Report Type Selector */}
            <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl w-full lg:w-auto">
              <button
                onClick={() => setReportType('summary')}
                className={`flex-1 lg:flex-none px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  reportType === 'summary' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-4 h-4" /> Summary Report
              </button>
              <button
                onClick={() => setReportType('details')}
                className={`flex-1 lg:flex-none px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  reportType === 'details' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-4 h-4" /> Details Report
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl text-xs sm:text-sm flex items-center gap-2 bg-rose-50 text-rose-700 border border-rose-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center pt-2">
            {reportType === 'details' && (
              <div className="md:col-span-3 flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <UserCheck className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Staff ID"
                  value={employeeIdNo}
                  onChange={(e) => setEmployeeIdNo(e.target.value)}
                  className="text-sm outline-none font-semibold text-slate-700 bg-transparent w-full uppercase"
                />
              </div>
            )}

            {/* <div className={`${reportType === 'details' ? 'md:col-span-5' : 'md:col-span-8'} flex flex-col sm:flex-row items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200`}>
              <div className="flex items-center gap-2 w-full">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="text-xs sm:text-sm outline-none font-medium text-slate-700 bg-transparent w-full" />
              </div>
              <span className="text-slate-400 text-xs hidden sm:inline">to</span>
              <div className="flex items-center gap-2 w-full">
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="text-xs sm:text-sm outline-none font-medium text-slate-700 bg-transparent w-full" />
              </div>
            </div> */}
            {/* 📅 Optimized Date Range Picker */}
            <div className={`${reportType === 'details' ? 'md:col-span-5' : 'md:col-span-8'} bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 sm:space-y-0 sm:flex sm:items-center sm:gap-3`}>
              
              {/* Start Date */}
              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 w-full shadow-2xs">
                <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                <div className="flex flex-col w-full">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider leading-none">From Date</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="text-xs sm:text-sm outline-none font-semibold text-slate-700 bg-transparent w-full mt-0.5"
                  />
                </div>
              </div>

              <span className="text-slate-400 text-xs font-semibold hidden sm:inline text-center shrink-0">TO</span>

              {/* End Date */}
              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 w-full shadow-2xs">
                <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                <div className="flex flex-col w-full">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider leading-none">To Date</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="text-xs sm:text-sm outline-none font-semibold text-slate-700 bg-transparent w-full mt-0.5"
                  />
                </div>
              </div>

            </div>

            <div className="md:col-span-4 grid grid-cols-3 gap-2">
              <button onClick={fetchReport} className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-2 rounded-xl text-xs sm:text-sm font-medium transition flex items-center justify-center gap-1 shadow-sm">
                <Search className="w-4 h-4" /> Load
              </button>
              <button onClick={handleExportCSV} disabled={(!reportData && !summaryData)} className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white py-3 px-2 rounded-xl text-xs sm:text-sm font-medium transition flex items-center justify-center gap-1 shadow-sm">
                <Download className="w-4 h-4" /> CSV
              </button>
              <button onClick={handlePrintA4} disabled={(!reportData && !summaryData)} className="bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white py-3 px-2 rounded-xl text-xs sm:text-sm font-medium transition flex items-center justify-center gap-1 shadow-sm">
                <Printer className="w-4 h-4" /> Print
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Display Area */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
          {loading ? (
            <div className="py-16 text-center text-slate-500 font-medium text-sm">Loading report...</div>
          ) : reportType === 'summary' && summaryData ? (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <p className="text-xs text-blue-500 font-semibold uppercase">Total Staff/Dealers</p>
                  <p className="text-lg sm:text-xl font-bold text-blue-800">{summaryData.totalStaffCount} Persons</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xs text-blue-500 font-semibold uppercase">Grand Total Advance</p>
                  <p className="text-lg sm:text-xl font-bold text-blue-700">৳{summaryData.grandTotalAdvance.toLocaleString()}</p>
                </div>
              </div>

              {/* 📱 Mobile Card View for Summary */}
              <div className="block lg:hidden space-y-3">
                {summaryData.summary.length > 0 ? (
                  summaryData.summary.map((item, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2 text-xs">
                      <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                        <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{item._id}</span>
                        <span className="text-slate-500 font-semibold">{item.totalInvoices} Invoices</span>
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{item.employeeName || 'N/A'}</p>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                        <span className="text-slate-400 uppercase text-[10px]">Total Adjusted Amount</span>
                        <span className="font-bold text-blue-700 text-sm">৳{item.totalAdjustedAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-400 text-xs">No records found.</div>
                )}
              </div>

              {/* 💻 Desktop Table View for Summary */}
              <div className="hidden lg:block overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-100 text-slate-600 uppercase font-semibold text-xs border-b border-slate-200">
                    <tr>
                      <th className="p-3.5">Staff / Dealer ID</th>
                      <th className="p-3.5">Name</th>
                      <th className="p-3.5 text-center">Total Invoices</th>
                      <th className="p-3.5 text-right">Total Adjusted Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {summaryData.summary.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-3.5 font-bold text-blue-600">{item._id}</td>
                        <td className="p-3.5 font-medium text-slate-700">{item.employeeName || 'N/A'}</td>
                        <td className="p-3.5 text-center font-semibold text-slate-600">{item.totalInvoices}</td>
                        <td className="p-3.5 text-right font-bold text-blue-700">৳{item.totalAdjustedAmount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : reportType === 'details' && reportData ? (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <p className="text-xs text-blue-500 font-semibold uppercase">Total Invoices</p>
                  <p className="text-lg sm:text-xl font-bold text-blue-800">{reportData.count} Invoices</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xs text-blue-500 font-semibold uppercase">Total Advance Adjusted</p>
                  <p className="text-lg sm:text-xl font-bold text-blue-700">৳{reportData.summary.totalAdvanceAdjusted.toLocaleString()}</p>
                </div>
              </div>

              {/* 📱 Mobile Card View for Details */}
              <div className="block lg:hidden space-y-3">
                {reportData.adjustments.length > 0 ? (
                  reportData.adjustments.map((item, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2 text-xs">
                      <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                        <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{item.invoiceNo}</span>
                        <span className="text-slate-500">{new Date(item.date).toLocaleDateString('en-GB')}</span>
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{item.employeeName} <span className="text-blue-600 font-normal">({item.employeeIdNo})</span></p>
                        <p className="text-slate-500">Dealer Code: <span className="font-semibold text-slate-700">{item.dealerCode || 'N/A'}</span></p>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                        <div>
                          <span className="text-slate-400 text-[10px] uppercase block">Grand Total</span>
                          <span className="font-semibold text-slate-700">৳{item.grandTotal.toLocaleString()}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-400 text-[10px] uppercase block">Adjusted Advance</span>
                          <span className="font-bold text-blue-600 text-sm">৳{item.adjustedAmount.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-400 text-xs">No records found.</div>
                )}
              </div>

              {/* 💻 Desktop Table View for Details */}
              <div className="hidden lg:block overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-100 text-slate-600 uppercase font-semibold text-xs border-b border-slate-200">
                    <tr>
                      <th className="p-3.5">Date</th>
                      <th className="p-3.5">Invoice No</th>
                      <th className="p-3.5">Dealer Code</th>
                      <th className="p-3.5">Staff ID</th>
                      <th className="p-3.5">Name</th>
                      <th className="p-3.5 text-right">Grand Total</th>
                      <th className="p-3.5 text-right">Adjusted Advance</th>
                      <th className="p-3.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {reportData.adjustments.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-3.5 text-slate-500">{new Date(item.date).toLocaleDateString('en-GB')}</td>
                        <td className="p-3.5 font-bold text-blue-600">{item.invoiceNo}</td>
                        <td className="p-3.5 font-semibold text-slate-700">{item.dealerCode || 'N/A'}</td>
                        <td className="p-3.5 font-semibold text-slate-600">{item.employeeIdNo}</td>
                        <td className="p-3.5 font-medium text-slate-700">{item.employeeName}</td>
                        <td className="p-3.5 text-right font-medium text-slate-700">৳{item.grandTotal.toLocaleString()}</td>
                        <td className="p-3.5 text-right font-bold text-blue-600">৳{item.adjustedAmount.toLocaleString()}</td>
                        <td className="p-3.5 text-center">
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-xs font-semibold">
                            {item.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center text-slate-400 text-sm">
              উপরে থেকে রিপোর্ট টাইপ সিলেক্ট করে "Load" বাটনে ক্লিক করুন।
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default StaffAdvanceReports;