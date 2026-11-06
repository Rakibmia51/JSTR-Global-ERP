
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, Printer, Download, UserCheck, Calendar, ArrowUpRight, ArrowDownLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import API from '../../api'; // আপনার Axios/API ক্লায়েন্ট পাথ

const StaffStatement = () => {
  const [idNo, setIdNo] = useState('');
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [statementData, setStatementData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState(null);
  const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'; 

  const fetchStatement = async () => {
    if (!idNo.trim()) {
      alert("অনুগ্রহ করে স্টাফ/ডিলার আইডি (idNo) এন্ট্রি দিন!");
      return;
    }

    setLoading(true);
    setApiStatus(null);

    try {
      const token = localStorage.getItem('token');
      const apiUrl = `${SERVER_URL}/api/reports/staff-statement/${idNo.trim()}`;
      
      const { data } = await axios.get(apiUrl, {
        params: { startDate, endDate },
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data && data.success) {
        setStatementData(data);
        setApiStatus({ type: 'success', message: 'Statement loaded successfully!' });
      } else {
        setApiStatus({ type: 'error', message: 'API responded but success flag is false.' });
      }
    } catch (error) {
      console.error("Error Details:", error);
      let errorMsg = "Failed to connect to API!";
      if (error.response) {
        errorMsg = `Server Error (${error.response.status}): ${error.response.data?.message || 'Unknown error'}`;
      } else if (error.request) {
        errorMsg = "Network Error: Backend server is not running or incorrect port!";
      } else {
        errorMsg = error.message;
      }
      setApiStatus({ type: 'error', message: errorMsg });
      setStatementData(null);
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
    if (!statementData || !statementData.transactions) return;
    const headers = ["Date,Transaction ID,Description,Type,Amount,Running Balance"];
    const rows = statementData.transactions.map((t) => [
      `"${new Date(t.date).toLocaleDateString('en-GB')}"`,
      `"${t.transactionId}"`,
      `"${t.description.replace(/"/g, '""')}"`,
      t.type,
      t.amount,
      t.runningBalance
    ].join(','));

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Staff_Statement_${statementData.employeeId}_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 🖨️ A4 Print
  const handlePrintA4 = () => {
    if (!statementData) return;
    const { openingBalance, totalIncomeIn, totalPaymentOut, closingBalance } = statementData.summary;

    let printWindow = window.open('', '_blank', 'height=800,width=1000');
    let htmlContent = `
      <html>
        <head>
          <title>Staff Statement - ${statementData.employeeId}</title>

          <style>
            body { font-family: Arial, sans-serif; color: #1e293b; margin: 15px; background: #fff; }
            .header { text-align: center; margin-bottom: 15px; border-bottom: 2px solid #cbd5e1; padding-bottom: 10px; }
            .employee-info { background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; font-size: 12px; line-height: 1.5; }
            .header h2 { margin: 0; font-size: 20px; color: #0f172a; text-transform: uppercase; }
            .header p { margin: 3px 0; font-size: 11px; color: #475569; }
            
            .summary-grid { display: flex; justify-content: space-between; margin-bottom: 15px; border: 1px solid #cbd5e1; border-radius: 6px; background: #f8fafc; padding: 8px; }
            .summary-item { text-align: center; flex: 1; border-right: 1px solid #e2e8f0; padding: 0 5px; }
            .summary-item:last-child { border-right: none; }
            .summary-label { font-size: 9px; color: #64748b; text-transform: uppercase; font-weight: bold; }
            .summary-val { font-size: 13px; font-weight: bold; color: #0f172a; margin-top: 2px; }

            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 10px; }
            th, td { border: 1px solid #cbd5e1; padding: 5px 6px; text-align: left; }
            th { background-color: #f1f5f9; color: #334155; font-weight: bold; text-transform: uppercase; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            @page { size: A4 portrait; margin: 8mm; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>${companyData.name || "Company Name"}</h2>
            <p><strong>Staff Ledger Statement (Income In vs Payout Out)</strong></p>
            <p>ID: <b>${statementData.employeeId}</b> | Period: ${startDate} to ${endDate}</p>
          </div>

           <div class="employee-info">
            <div><strong>Dealer Name:</strong> ${statementData.employeeInfo.name} (${statementData.employeeId})</div>
            <div><strong>Mobile:</strong> ${statementData.employeeInfo.mobileNo || 'N/A'}</div>
            <div><strong>Address:</strong> ${statementData.employeeInfo.address || 'N/A'}</div>
          </div>

          <div class="summary-grid">
            <div class="summary-item">
              <div class="summary-label">Opening Balance</div>
              <div class="summary-val">৳${openingBalance.toLocaleString()}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Total Income (In)</div>
              <div class="summary-val" style="color: #2563eb;">৳${totalIncomeIn.toLocaleString()}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Total Paid (Out)</div>
              <div class="summary-val" style="color: #059669;">৳${totalPaymentOut.toLocaleString()}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Closing Balance</div>
              <div class="summary-val" style="color: #e11d48;">৳${closingBalance.toLocaleString()}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Txn ID</th>
                <th>Description</th>
                <th class="text-right">Income (In)</th>
                <th class="text-right">Payout (Out)</th>
                <th class="text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              ${statementData.transactions.map(t => `
                <tr>
                  <td>${new Date(t.date).toLocaleDateString('en-GB')}</td>
                  <td><b>${t.transactionId}</b></td>
                  <td>${t.description}</td>
                  <td class="text-right" style="color: ${t.type === 'credit' ? '#2563eb' : '#94a3b8'};">${t.type === 'credit' ? '৳' + t.amount.toLocaleString() : '-'}</td>
                  <td class="text-right" style="color: ${t.type === 'debit' ? '#059669' : '#94a3b8'};">${t.type === 'debit' ? '৳' + t.amount.toLocaleString() : '-'}</td>
                  <td class="text-right" style="font-weight: bold;">৳${t.runningBalance.toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  console.log("Staff Data for Statement:", statementData); // ডিবাগিং এর জন্য লগ

  return (
    // <div className="p-3 sm:p-6 bg-slate-50 min-h-screen">
    <div className="w-full max-w-7xl mx-auto p-2 sm:p-4 lg:p-6 bg-slate-50 min-h-screen"> 

         {/* Top Filter Panel */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Staff Account Statement</h1>
            <p className="text-sm text-slate-500">স্টাফ বা ডিলার আইডি এবং ডেট রেঞ্জ দিয়ে লেজার চেক করুন</p>
          </div>

          {apiStatus && (
            <div className={`p-3 rounded-xl text-xs sm:text-sm flex items-center gap-2 border ${
              apiStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}>
              {apiStatus.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{apiStatus.message}</span>
            </div>
          )}

          {/* Inputs Section */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            <div className="md:col-span-4 flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <UserCheck className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Staff/Dealer ID (e.g. MKT-0001)"
                value={idNo}
                onChange={(e) => setIdNo(e.target.value)}
                className="text-sm outline-none font-semibold text-slate-700 bg-transparent w-full uppercase"
              />
            </div>

            <div className="md:col-span-5 flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="text-sm outline-none font-medium text-slate-700 bg-transparent w-full"
              />
              <span className="text-slate-400 text-xs">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="text-sm outline-none font-medium text-slate-700 bg-transparent w-full"
              />
            </div>

            <div className="md:col-span-3 grid grid-cols-3 gap-2">
              <button
                onClick={fetchStatement}
                className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-2 rounded-xl text-xs sm:text-sm font-medium transition flex items-center justify-center gap-1 shadow-sm"
              >
                <Search className="w-4 h-4" /> Load
              </button>
              <button
                onClick={handleExportCSV}
                className="bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-2 rounded-xl text-xs sm:text-sm font-medium transition flex items-center justify-center gap-1 shadow-sm"
              >
                <Download className="w-4 h-4" /> CSV
              </button>
              <button
                onClick={handlePrintA4}
                className="bg-rose-600 hover:bg-rose-700 text-white py-3 px-2 rounded-xl text-xs sm:text-sm font-medium transition flex items-center justify-center gap-1 shadow-sm"
              >
                <Printer className="w-4 h-4" /> Print
              </button>
            </div>
          </div>
        </div>

      {/* Main Content Area */}
      <div className="bg-white p-3 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
        {loading ? (
          <div className="py-12 text-center text-slate-500 font-medium text-sm">Loading statement...</div>
        ) : statementData ? (
          <div className="space-y-4">

            {/* Staff Header Info */}
            <div className="text-center pb-6 border-b border-slate-200 mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{companyData.name || 'Company Name'}</h2>
              <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">Staff Ledger Statement</p>
              
              <div className="mt-4 inline-block bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-200 text-left text-xs sm:text-sm space-y-1 w-full sm:w-auto">
                <p><strong>Staff Name:</strong> {statementData.employeeInfo.name} (<span className="text-blue-600 font-bold">{statementData.employeeId}</span>)</p>
                <p><strong>Address:</strong> {statementData.employeeInfo.address || 'N/A'}</p>
                <p><strong>Mobile:</strong> {statementData.employeeInfo.mobileNo || 'N/A'}</p>
                <p><strong>Period:</strong> {startDate} to {endDate}</p>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <p className="text-[10px] sm:text-xs text-slate-400 font-medium">Opening Balance</p>
                <p className="text-xs sm:text-base font-bold text-slate-800 mt-1">৳{statementData.summary.openingBalance.toLocaleString()}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-xl border border-blue-200">
                <p className="text-[10px] sm:text-xs text-blue-500 font-semibold flex items-center gap-1"><ArrowDownLeft className="w-3 h-3"/> Total Income (In)</p>
                <p className="text-xs sm:text-base font-bold text-blue-700 mt-1">৳{statementData.summary.totalIncomeIn.toLocaleString()}</p>
              </div>
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                <p className="text-[10px] sm:text-xs text-emerald-600 font-semibold flex items-center gap-1"><ArrowUpRight className="w-3 h-3"/> Total Paid (Out)</p>
                <p className="text-xs sm:text-base font-bold text-emerald-700 mt-1">৳{statementData.summary.totalPaymentOut.toLocaleString()}</p>
              </div>
              <div className="bg-slate-900 text-white p-3 rounded-xl col-span-2 lg:col-span-1">
                <p className="text-[10px] sm:text-xs text-slate-400 font-medium">Closing Balance</p>
                <p className="text-xs sm:text-base font-bold text-rose-400 mt-1">৳{statementData.summary.closingBalance.toLocaleString()}</p>
              </div>
            </div>

            {/* 📱 Mobile Card View (Only visible on small screens) */}
            <div className="block lg:hidden space-y-3 mt-4">
              {statementData.transactions.length > 0 ? (
                statementData.transactions.map((t, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-2">
                    <div className="flex justify-between items-center text-xs border-b border-slate-200 pb-2">
                      <span className="font-bold text-blue-600">{t.transactionId}</span>
                      <span className="text-slate-500">{new Date(t.date).toLocaleDateString('en-GB')}</span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium">{t.description}</p>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-xs">
                      <div>
                        <span className="text-slate-400 text-[10px] block">Type / Amount</span>
                        <span className={`font-bold ${t.type === 'credit' ? 'text-blue-600' : 'text-emerald-600'}`}>
                          {t.type === 'credit' ? `+ ৳${t.amount.toLocaleString()} (In)` : `- ৳${t.amount.toLocaleString()} (Out)`}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 text-[10px] block">Balance</span>
                        <span className="font-bold text-slate-900">৳{t.runningBalance.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs">No transactions found.</div>
              )}
            </div>

            {/* 💻 Desktop Table View (Hidden on small mobile screens) */}
            <div className="hidden lg:block overflow-x-auto rounded-xl border border-slate-200 mt-4">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 text-slate-600 uppercase font-semibold text-xs border-b border-slate-200">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Txn ID</th>
                    <th className="p-3">Description</th>
                    <th className="p-3 text-right">Income (In)</th>
                    <th className="p-3 text-right">Payout (Out)</th>
                    <th className="p-3 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {statementData.transactions.length > 0 ? (
                    statementData.transactions.map((t, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-3 text-slate-500">{new Date(t.date).toLocaleDateString('en-GB')}</td>
                        <td className="p-3 font-bold text-blue-600">{t.transactionId}</td>
                        <td className="p-3 font-medium text-slate-700">{t.description}</td>
                        <td className="p-3 text-right font-bold text-blue-600">
                          {t.type === 'credit' ? `৳${t.amount.toLocaleString()}` : '-'}
                        </td>
                        <td className="p-3 text-right font-bold text-emerald-600">
                          {t.type === 'debit' ? `৳${t.amount.toLocaleString()}` : '-'}
                        </td>
                        <td className="p-3 text-right font-bold text-slate-900">৳{t.runningBalance.toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-slate-400">No transactions found for this date range.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400 text-sm">
            স্টাফ আইডি এবং ডেট রেঞ্জ সিলেক্ট করে "Load" বাটনে ক্লিক করুন।
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffStatement;





// import React, { useState } from 'react';
// import axios from 'axios';
// import { Search, Printer, Download, UserCheck, Calendar, ArrowUpRight, ArrowDownLeft, AlertCircle, CheckCircle2 } from 'lucide-react';

// const StaffStatement = () => {
//   const [idNo, setIdNo] = useState('');
//   const [startDate, setStartDate] = useState(
//     new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
//   );
//   const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
//   const [statementData, setStatementData] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [apiStatus, setApiStatus] = useState(null);

//   const fetchStatement = async () => {
//     if (!idNo.trim()) {
//       alert("অনুগ্রহ করে স্টাফ/ডিলার আইডি (idNo) এন্ট্রি দিন!");
//       return;
//     }

//     setLoading(true);
//     setApiStatus(null);

//     try {
//       const token = localStorage.getItem('token');
//       const apiUrl = `http://localhost:3000/api/reports/staff-statement/${idNo.trim()}`;
      
//       const { data } = await axios.get(apiUrl, {
//         params: { startDate, endDate },
//         headers: { Authorization: `Bearer ${token}` }
//       });

//       if (data && data.success) {
//         setStatementData(data);
//         setApiStatus({ type: 'success', message: 'Statement loaded successfully!' });
//       } else {
//         setApiStatus({ type: 'error', message: 'API responded but success flag is false.' });
//       }
//     } catch (error) {
//       console.error("Error Details:", error);
//       let errorMsg = "Failed to connect to API!";
//       if (error.response) {
//         errorMsg = `Server Error (${error.response.status}): ${error.response.data?.message || 'Unknown error'}`;
//       } else if (error.request) {
//         errorMsg = "Network Error: Backend server is not running or incorrect port!";
//       } else {
//         errorMsg = error.message;
//       }
//       setApiStatus({ type: 'error', message: errorMsg });
//       setStatementData(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // 📥 CSV Export
//   const handleExportCSV = () => {
//     if (!statementData || !statementData.transactions) return;
//     const headers = ["Date,Transaction ID,Description,Type,Amount,Running Balance"];
//     const rows = statementData.transactions.map((t) => [
//       `"${new Date(t.date).toLocaleDateString('en-GB')}"`,
//       `"${t.transactionId}"`,
//       `"${t.description.replace(/"/g, '""')}"`,
//       t.type,
//       t.amount,
//       t.runningBalance
//     ].join(','));

//     const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
//     const encodedUri = encodeURI(csvContent);
//     const link = document.createElement("a");
//     link.setAttribute("href", encodedUri);
//     link.setAttribute("download", `Staff_Statement_${statementData.employeeId}_${startDate}_to_${endDate}.csv`);
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   // 🖨️ A4 Print
//   const handlePrintA4 = () => {
//     if (!statementData) return;
//     const { openingBalance, totalIncomeIn, totalPaymentOut, closingBalance } = statementData.summary;

//     let printWindow = window.open('', '_blank', 'height=800,width=1000');
//     let htmlContent = `
//       <html>
//         <head>
//           <title>Staff Statement - ${statementData.employeeId}</title>
//           <style>
//             body { font-family: Arial, sans-serif; color: #1e293b; margin: 15px; background: #fff; }
//             .header { text-align: center; margin-bottom: 15px; border-bottom: 2px solid #cbd5e1; padding-bottom: 10px; }
//             .header h2 { margin: 0; font-size: 20px; color: #0f172a; text-transform: uppercase; }
//             .header p { margin: 3px 0; font-size: 11px; color: #475569; }
            
//             .summary-grid { display: flex; justify-content: space-between; margin-bottom: 15px; border: 1px solid #cbd5e1; border-radius: 6px; background: #f8fafc; padding: 8px; }
//             .summary-item { text-align: center; flex: 1; border-right: 1px solid #e2e8f0; padding: 0 5px; }
//             .summary-item:last-child { border-right: none; }
//             .summary-label { font-size: 9px; color: #64748b; text-transform: uppercase; font-weight: bold; }
//             .summary-val { font-size: 13px; font-weight: bold; color: #0f172a; margin-top: 2px; }

//             table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 10px; }
//             th, td { border: 1px solid #cbd5e1; padding: 5px 6px; text-align: left; }
//             th { background-color: #f1f5f9; color: #334155; font-weight: bold; text-transform: uppercase; }
//             .text-right { text-align: right; }
//             .text-center { text-align: center; }
//             @page { size: A4 portrait; margin: 8mm; }
//           </style>
//         </head>
//         <body>
//           <div class="header">
//             <h2>ERGON Pharmaceuticals Ltd.</h2>
//             <p><strong>Staff Ledger Statement (Income In vs Payout Out)</strong></p>
//             <p>ID: <b>${statementData.employeeId}</b> | Period: ${startDate} to ${endDate}</p>
//           </div>

//           <div class="summary-grid">
//             <div class="summary-item">
//               <div class="summary-label">Opening Balance</div>
//               <div class="summary-val">৳${openingBalance.toLocaleString()}</div>
//             </div>
//             <div class="summary-item">
//               <div class="summary-label">Total Income (In)</div>
//               <div class="summary-val" style="color: #2563eb;">৳${totalIncomeIn.toLocaleString()}</div>
//             </div>
//             <div class="summary-item">
//               <div class="summary-label">Total Paid (Out)</div>
//               <div class="summary-val" style="color: #059669;">৳${totalPaymentOut.toLocaleString()}</div>
//             </div>
//             <div class="summary-item">
//               <div class="summary-label">Closing Balance</div>
//               <div class="summary-val" style="color: #e11d48;">৳${closingBalance.toLocaleString()}</div>
//             </div>
//           </div>

//           <table>
//             <thead>
//               <tr>
//                 <th>Date</th>
//                 <th>Txn ID</th>
//                 <th>Description</th>
//                 <th class="text-right">Income (In)</th>
//                 <th class="text-right">Payout (Out)</th>
//                 <th class="text-right">Balance</th>
//               </tr>
//             </thead>
//             <tbody>
//               ${statementData.transactions.map(t => `
//                 <tr>
//                   <td>${new Date(t.date).toLocaleDateString('en-GB')}</td>
//                   <td><b>${t.transactionId}</b></td>
//                   <td>${t.description}</td>
//                   <td class="text-right" style="color: ${t.type === 'credit' ? '#2563eb' : '#94a3b8'};">${t.type === 'credit' ? '৳' + t.amount.toLocaleString() : '-'}</td>
//                   <td class="text-right" style="color: ${t.type === 'debit' ? '#059669' : '#94a3b8'};">${t.type === 'debit' ? '৳' + t.amount.toLocaleString() : '-'}</td>
//                   <td class="text-right" style="font-weight: bold;">৳${t.runningBalance.toLocaleString()}</td>
//                 </tr>
//               `).join('')}
//             </tbody>
//           </table>
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
        
//         {/* Top Filter Panel */}
//         <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
//           <div>
//             <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Staff Account Statement</h1>
//             <p className="text-sm text-slate-500">স্টাফ বা ডিলার আইডি এবং ডেট রেঞ্জ দিয়ে লেজার চেক করুন</p>
//           </div>

//           {apiStatus && (
//             <div className={`p-3 rounded-xl text-xs sm:text-sm flex items-center gap-2 border ${
//               apiStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
//             }`}>
//               {apiStatus.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
//               <span>{apiStatus.message}</span>
//             </div>
//           )}

//           {/* Inputs Section */}
//           <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
//             <div className="md:col-span-4 flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
//               <UserCheck className="w-4 h-4 text-slate-400 shrink-0" />
//               <input
//                 type="text"
//                 placeholder="Staff/Dealer ID (e.g. MKT-0001)"
//                 value={idNo}
//                 onChange={(e) => setIdNo(e.target.value)}
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

//             <div className="md:col-span-3 grid grid-cols-3 gap-2">
//               <button
//                 onClick={fetchStatement}
//                 className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-2 rounded-xl text-xs sm:text-sm font-medium transition flex items-center justify-center gap-1 shadow-sm"
//               >
//                 <Search className="w-4 h-4" /> Load
//               </button>
//               <button
//                 onClick={handleExportCSV}
//                 className="bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-2 rounded-xl text-xs sm:text-sm font-medium transition flex items-center justify-center gap-1 shadow-sm"
//               >
//                 <Download className="w-4 h-4" /> CSV
//               </button>
//               <button
//                 onClick={handlePrintA4}
//                 className="bg-rose-600 hover:bg-rose-700 text-white py-3 px-2 rounded-xl text-xs sm:text-sm font-medium transition flex items-center justify-center gap-1 shadow-sm"
//               >
//                 <Printer className="w-4 h-4" /> Print
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Main Content Area */}
//         <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
//           {loading ? (
//             <div className="py-16 text-center text-slate-500 font-medium text-sm">Loading statement...</div>
//           ) : statementData ? (
//             <div className="space-y-6">
//               {/* Summary Cards */}
//               <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
//                 <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
//                   <p className="text-[11px] sm:text-xs text-slate-400 font-medium">Opening Balance</p>
//                   <p className="text-sm sm:text-lg font-bold text-slate-800 mt-1">৳{statementData.summary.openingBalance.toLocaleString()}</p>
//                 </div>
//                 <div className="bg-blue-50 p-3.5 rounded-xl border border-blue-200">
//                   <p className="text-[11px] sm:text-xs text-blue-500 font-semibold flex items-center gap-1"><ArrowDownLeft className="w-3.5 h-3.5"/> Total Income (In)</p>
//                   <p className="text-sm sm:text-lg font-bold text-blue-700 mt-1">৳{statementData.summary.totalIncomeIn.toLocaleString()}</p>
//                 </div>
//                 <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200">
//                   <p className="text-[11px] sm:text-xs text-emerald-600 font-semibold flex items-center gap-1"><ArrowUpRight className="w-3.5 h-3.5"/> Total Paid (Out)</p>
//                   <p className="text-sm sm:text-lg font-bold text-emerald-700 mt-1">৳{statementData.summary.totalPaymentOut.toLocaleString()}</p>
//                 </div>
//                 <div className="bg-slate-900 text-white p-3.5 rounded-xl col-span-2 lg:col-span-1">
//                   <p className="text-[11px] sm:text-xs text-slate-400 font-medium">Closing Balance</p>
//                   <p className="text-sm sm:text-lg font-bold text-rose-400 mt-1">৳{statementData.summary.closingBalance.toLocaleString()}</p>
//                 </div>
//               </div>

//               {/* 📱 Mobile Card View (Visible only on mobile / small screens) */}
//               <div className="block lg:hidden space-y-3 mt-4">
//                 {statementData.transactions.length > 0 ? (
//                   statementData.transactions.map((t, idx) => (
//                     <div key={idx} className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2.5 shadow-xs">
//                       <div className="flex justify-between items-center text-xs border-b border-slate-200 pb-2">
//                         <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{t.transactionId}</span>
//                         <span className="text-slate-500 font-medium">{new Date(t.date).toLocaleDateString('en-GB')}</span>
//                       </div>
                      
//                       <p className="text-xs text-slate-700 font-medium leading-relaxed">{t.description}</p>
                      
//                       <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-xs">
//                         <div>
//                           <span className="text-slate-400 text-[10px] uppercase font-semibold block">Transaction Type</span>
//                           <span className={`font-bold inline-flex items-center gap-1 mt-0.5 ${t.type === 'credit' ? 'text-blue-600' : 'text-emerald-600'}`}>
//                             {t.type === 'credit' ? <ArrowDownLeft className="w-3 h-3"/> : <ArrowUpRight className="w-3 h-3"/>}
//                             {t.type === 'credit' ? `+ ৳${t.amount.toLocaleString()} (Income In)` : `- ৳${t.amount.toLocaleString()} (Payout Out)`}
//                           </span>
//                         </div>
//                         <div className="text-right">
//                           <span className="text-slate-400 text-[10px] uppercase font-semibold block">Balance</span>
//                           <span className="font-bold text-slate-900 text-sm mt-0.5 block">৳{t.runningBalance.toLocaleString()}</span>
//                         </div>
//                       </div>
//                     </div>
//                   ))
//                 ) : (
//                   <div className="p-8 text-center text-slate-400 text-xs">No transactions found for this date range.</div>
//                 )}
//               </div>

//               {/* 💻 Desktop Table View (Visible only on laptop/desktop screens) */}
//               <div className="hidden lg:block overflow-x-auto rounded-xl border border-slate-200 mt-4">
//                 <table className="w-full text-left text-sm whitespace-nowrap">
//                   <thead className="bg-slate-100 text-slate-600 uppercase font-semibold text-xs border-b border-slate-200">
//                     <tr>
//                       <th className="p-3.5">Date</th>
//                       <th className="p-3.5">Txn ID</th>
//                       <th className="p-3.5">Description</th>
//                       <th className="p-3.5 text-right">Income (In)</th>
//                       <th className="p-3.5 text-right">Payout (Out)</th>
//                       <th className="p-3.5 text-right">Balance</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-slate-100 text-sm">
//                     {statementData.transactions.length > 0 ? (
//                       statementData.transactions.map((t, idx) => (
//                         <tr key={idx} className="hover:bg-slate-50">
//                           <td className="p-3.5 text-slate-500">{new Date(t.date).toLocaleDateString('en-GB')}</td>
//                           <td className="p-3.5 font-bold text-blue-600">{t.transactionId}</td>
//                           <td className="p-3.5 font-medium text-slate-700">{t.description}</td>
//                           <td className="p-3.5 text-right font-bold text-blue-600">
//                             {t.type === 'credit' ? `৳${t.amount.toLocaleString()}` : '-'}
//                           </td>
//                           <td className="p-3.5 text-right font-bold text-emerald-600">
//                             {t.type === 'debit' ? `৳${t.amount.toLocaleString()}` : '-'}
//                           </td>
//                           <td className="p-3.5 text-right font-bold text-slate-900">৳{t.runningBalance.toLocaleString()}</td>
//                         </tr>
//                       ))
//                     ) : (
//                       <tr>
//                         <td colSpan="6" className="p-12 text-center text-slate-400">No transactions found for this date range.</td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>

//             </div>
//           ) : (
//             <div className="py-16 text-center text-slate-400 text-sm">
//               স্টাফ আইডি এবং ডেট রেঞ্জ সিলেক্ট করে "Load" বাটনে ক্লিক করুন।
//             </div>
//           )}
//         </div>

//       </div>
//     </div>
//   );
// };

// export default StaffStatement;