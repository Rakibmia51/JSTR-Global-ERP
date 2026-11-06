import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Calendar, Search, Printer, Download, UserCheck } from 'lucide-react';
import API from '../../api'; // আপনার Axios/API ক্লায়েন্ট পাথ

const DealerStatement = () => {
  const [dealerCode, setDealerCode] = useState('');
  const [startDate, setStartDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [statementData, setStatementData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchStatement = async () => {
    if (!dealerCode.trim()) {
      alert("অনুগ্রহ করে ডিলার কোড এন্ট্রি দিন!");
      return;
    }
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`http://localhost:3000/api/reports/dealer-statement/code/${dealerCode.trim()}`, {
        params: { startDate, endDate },
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        setStatementData(data);
      }
    } catch (error) {
      console.error("Error fetching statement:", error);
      alert(error.response?.data?.message || "ডিলার স্টেটমেন্ট পাওয়া যায়নি!");
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

  // 📥 CSV Export Functionality
  const handleExportCSV = () => {
    if (!statementData || !statementData.data || statementData.data.length === 0) {
      alert("এক্সপোর্ট করার মতো কোনো ডেটা নেই!");
      return;
    }

    const headers = ["SL,Date,Particulars,Invoice No,Debit (Bill),Credit (Paid),Balance"];
    const rows = statementData.data.map((row) => {
      const formattedDate = new Date(row.date).toLocaleDateString('en-GB');
      return [
        row.serial,
        `"${formattedDate}"`,
        `"${row.particulars}"`,
        `"${row.invoiceNo}"`,
        row.debit,
        row.credit,
        row.balance
      ].join(',');
    });

    const summaryRow = `,,,Total,${statementData.summary.totalDebit},${statementData.summary.totalCredit},${statementData.summary.currentDue}`;
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows, summaryRow].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Dealer_Statement_${statementData.dealer.dealerId}_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 🖨️ Clean & Professional A4 Print Function (팝업 বা ডেডিকেটেড প্রিন্ট উইন্ডো)
  const handlePrintA4 = () => {
    if (!statementData || !statementData.data || statementData.data.length === 0) {
      alert("প্রিন্ট করার মতো কোনো ডেটা নেই!");
      return;
    }

    let printWindow = window.open('', '_blank', 'height=800,width=1000');
    
    let htmlContent = `
      <html>
        <head>
          <title>Dealer Ledger Statement - ${statementData.dealer.dealerId}</title>
          <style>
            body { font-family: Arial, sans-serif; color: #1e293b; margin: 20px; background: #fff; }
            .header { text-align: center; margin-bottom: 25px; border-bottom: 2px solid #cbd5e1; padding-bottom: 15px; }
            .header h2 { margin: 0; font-size: 24px; color: #0f172a; text-transform: uppercase; }
            .header p { margin: 4px 0; font-size: 13px; color: #475569; }
            .dealer-info { background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; font-size: 12px; line-height: 1.5; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
            th, td { border: 1px solid #cbd5e1; padding: 7px 10px; text-align: left; }
            th { background-color: #f1f5f9; color: #334155; font-weight: bold; text-transform: uppercase; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            tfoot { font-weight: bold; background-color: #f8fafc; }
            @page { size: A4 portrait; margin: 10mm; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>${companyData.name || 'Company Name'}</h2>
            <p><strong>Dealer Ledger Statement</strong></p>
            <p>Period: ${startDate} to ${endDate}</p>
          </div>

          <div class="dealer-info">
            <div><strong>Dealer Name:</strong> ${statementData.dealer.name} (${statementData.dealer.dealerId})</div>
            <div><strong>Mobile:</strong> ${statementData.dealer.mobile || 'N/A'}</div>
            <div><strong>Address:</strong> ${statementData.dealer.address || 'N/A'}</div>
          </div>

          <table>
            <thead>
              <tr>
                <th class="text-center">SL</th>
                <th>Date</th>
                <th>Particulars</th>
                <th>Invoice No</th>
                <th class="text-right">Debit (Bill)</th>
                <th class="text-right">Credit (Paid)</th>
                <th class="text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
    `;

    statementData.data.forEach((row) => {
      const formattedDate = new Date(row.date).toLocaleDateString('en-GB');
      htmlContent += `
        <tr>
          <td class="text-center">${row.serial}</td>
          <td>${formattedDate}</td>
          <td><b>${row.particulars}</b></td>
          <td>${row.invoiceNo}</td>
          <td class="text-right">৳${row.debit.toLocaleString()}</td>
          <td class="text-right" style="color: #059669;">৳${row.credit.toLocaleString()}</td>
          <td class="text-right"><b>৳${row.balance.toLocaleString()}</b></td>
        </tr>
      `;
    });

    htmlContent += `
            </tbody>
            <tfoot>
              <tr>
                <td colspan="4" class="text-right" style="text-transform: uppercase;">Total Summary:</td>
                <td class="text-right">৳${statementData.summary.totalDebit.toLocaleString()}</td>
                <td class="text-right" style="color: #059669;">৳${statementData.summary.totalCredit.toLocaleString()}</td>
                <td class="text-right" style="color: #e11d48;">৳${statementData.summary.currentDue.toLocaleString()}</td>
              </tr>
            </tfoot>
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

  return (
    <div className="p-3 sm:p-6 bg-slate-50 min-h-screen">
      {/* Header & Filter Controls (প্রিন্টে স্বয়ংক্রিয়ভাবে হাইড থাকবে) */}
      <div className="flex flex-col gap-4 mb-6 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Dealer Statement</h1>
          <p className="text-xs sm:text-sm text-slate-500">ডিলার কোড দিয়ে ইনভয়েস ও লেজার স্টেটমেন্ট সার্চ করুন</p>
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3 pt-2 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
            <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200 sm:w-60">
              <UserCheck className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
              <input
                type="text"
                placeholder="Enter Dealer Code..."
                value={dealerCode}
                onChange={(e) => setDealerCode(e.target.value)}
                className="p-1 text-xs sm:text-sm outline-none font-semibold text-slate-700 bg-transparent w-full uppercase"
              />
            </div>

            <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="p-1 text-xs sm:text-sm outline-none font-medium text-slate-700 bg-transparent flex-1"
              />
              <span className="text-slate-400 text-xs">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="p-1 text-xs sm:text-sm outline-none font-medium text-slate-700 bg-transparent flex-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 sm:flex items-center gap-2">
            <button
              onClick={fetchStatement}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Search className="w-4 h-4" /> Load
            </button>
            <button
              onClick={handleExportCSV}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Download className="w-4 h-4" /> CSV
            </button>
            <button
              onClick={handlePrintA4}
              className="bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Printer className="w-4 h-4" /> Print A4
            </button>
          </div>
        </div>
      </div>

      {/* Main Statement UI Area */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
        {loading ? (
          <div className="py-12 text-center text-slate-500 font-medium">Loading statement data...</div>
        ) : statementData ? (
          <div>
            {/* Dealer Header Info */}
            <div className="text-center pb-6 border-b border-slate-200 mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{companyData.name || 'Company Name'}</h2>
              <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">Dealer Ledger Statement</p>
              
              <div className="mt-4 inline-block bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-200 text-left text-xs sm:text-sm space-y-1 w-full sm:w-auto">
                <p><strong>Dealer Name:</strong> {statementData.dealer.name} (<span className="text-blue-600 font-bold">{statementData.dealer.dealerId}</span>)</p>
                <p><strong>Address:</strong> {statementData.dealer.address || 'N/A'}</p>
                <p><strong>Mobile:</strong> {statementData.dealer.mobile || 'N/A'}</p>
                <p><strong>Period:</strong> {startDate} to {endDate}</p>
              </div>
            </div>

            {/* 📱 Mobile View: Responsive Cards Layout */}
            <div className="block md:hidden space-y-3">
              {statementData.data && statementData.data.length > 0 ? (
                statementData.data.map((row) => (
                  <div key={row.invoiceNo} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-2">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                      <span className="font-bold text-blue-600">#{row.invoiceNo}</span>
                      <span className="text-slate-500 font-medium">{new Date(row.date).toLocaleDateString('en-GB')}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-slate-700">
                      <div><span className="text-slate-400">Debit (Bill):</span> ৳{row.debit.toLocaleString()}</div>
                      <div><span className="text-slate-400">Credit (Paid):</span> <span className="text-emerald-600 font-semibold">৳{row.credit.toLocaleString()}</span></div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex justify-between items-center font-bold">
                      <span className="text-slate-500">Running Balance:</span>
                      <span className="text-slate-900">৳{row.balance.toLocaleString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-400 font-medium border border-dashed border-slate-200 rounded-xl">
                  No data found for this date range.
                </div>
              )}

              {/* Mobile Summary Box */}
              {statementData.data && statementData.data.length > 0 && (
                <div className="bg-slate-900 text-white p-4 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between"><span>Total Bill:</span> ৳{statementData.summary.totalDebit.toLocaleString()}</div>
                  <div className="flex justify-between"><span>Total Paid:</span> <span className="text-emerald-400">৳{statementData.summary.totalCredit.toLocaleString()}</span></div>
                  <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-sm">
                    <span>Current Due:</span>
                    <span className="text-rose-400">৳{statementData.summary.currentDue.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>

            {/* 💻 Desktop View: Table Layout */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-100 text-slate-600 uppercase font-semibold text-xs border-b border-slate-200">
                  <tr>
                    <th className="p-3.5 text-center">SL</th>
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5">Particulars</th>
                    <th className="p-3.5">Invoice No</th>
                    <th className="p-3.5 text-right">Debit (Bill)</th>
                    <th className="p-3.5 text-right">Credit (Paid)</th>
                    <th className="p-3.5 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                  {statementData.data && statementData.data.length > 0 ? (
                    statementData.data.map((row) => (
                      <tr key={row.invoiceNo} className="hover:bg-slate-50">
                        <td className="p-3.5 text-center text-slate-500">{row.serial}</td>
                        <td className="p-3.5">{new Date(row.date).toLocaleDateString('en-GB')}</td>
                        <td className="p-3.5 font-medium text-slate-700">{row.particulars}</td>
                        <td className="p-3.5 font-bold text-blue-600">{row.invoiceNo}</td>
                        <td className="p-3.5 text-right font-medium text-slate-800">৳{row.debit.toLocaleString()}</td>
                        <td className="p-3.5 text-right font-medium text-emerald-600">৳{row.credit.toLocaleString()}</td>
                        <td className="p-3.5 text-right font-bold text-slate-900">৳{row.balance.toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="p-12 text-center text-slate-400 font-medium">
                        No data found.
                      </td>
                    </tr>
                  )}
                </tbody>
                {statementData.data && statementData.data.length > 0 && (
                  <tfoot className="bg-slate-100 font-bold text-slate-800 border-t-2 border-slate-300 text-xs sm:text-sm">
                    <tr>
                      <td colSpan="4" className="p-3.5 text-right uppercase">Total:</td>
                      <td className="p-3.5 text-right text-slate-900">৳{statementData.summary.totalDebit.toLocaleString()}</td>
                      <td className="p-3.5 text-right text-emerald-700">৳{statementData.summary.totalCredit.toLocaleString()}</td>
                      <td className="p-3.5 text-right text-rose-600">৳{statementData.summary.currentDue.toLocaleString()}</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400 text-sm">
            অনুগ্রহ করে ডিলার কোড ইনপুট দিয়ে "Load" বাটনে ক্লিক করুন।
          </div>
        )}
      </div>
    </div>
  );
};

export default DealerStatement;