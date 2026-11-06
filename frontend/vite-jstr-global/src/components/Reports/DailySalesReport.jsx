

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Search, Download, Printer, FileText } from 'lucide-react';
import API from '../../api'; // আপনার Axios/API ক্লায়েন্ট পাথ

const DetailedInvoiceReport = () => {
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  

  const fetchReport = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const { data } = await axios.get('http://localhost:3000/api/reports/detailed-invoices', {
        params: { startDate, endDate },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (data && data.success) {
        setReports(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching detailed invoice report:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);


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




  // Total Summary Calculations
  const totals = (reports || []).reduce((acc, curr) => {
    acc.cash += Number(curr.cash) || 0;
    acc.bank += Number(curr.bank) || 0;
    acc.advance += Number(curr.advance) || 0;
    acc.gross += Number(curr.gross) || 0;
    acc.payable += Number(curr.payable) || 0;
    return acc;
  }, { cash: 0, bank: 0, advance: 0, gross: 0, payable: 0 });

  const handleExportCSV = () => {
    if (!reports || reports.length === 0) {
      alert("No data available to export!");
      return;
    }
    const headers = ["Serial No,Date,Invoice No,Dealer Code,Name (Dealer/Customer),Cash,Bank,Advance,GROSS,Payable"];
    const rows = reports.map((row, index) => {
      const formattedDate = row.date ? new Date(row.date).toLocaleDateString('en-GB') : '';
      const name = row.dealerCode !== 'N/A' && row.dealerName ? row.dealerName : (row.customerName || 'Walk-in Customer');
      return [index + 1, `"${formattedDate}"`, `"${row.invoiceNo || ''}"`, `"${row.dealerCode || 'N/A'}"`, `"${name}"`, row.cash || 0, row.bank || 0, row.advance || 0, row.gross || 0, row.payable || 0].join(',');
    });
    
    const totalRow = `,,,,,${totals.cash},${totals.bank},${totals.advance},${totals.gross},${totals.payable}`;
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows, totalRow].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Detailed_Invoice_Report_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintA4 = () => {
    if (!reports || reports.length === 0) {
      alert("No data available to print!");
      return;
    }

    let printWindow = window.open('', '_blank', 'height=800,width=1000');
    
    let htmlContent = `
      <html>
        <head>
          <title>Detailed Invoice Report - A4</title>
          <style>
            body { font-family: Arial, sans-serif; color: #333; margin: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .header h2 { margin: 0; font-size: 22px; color: #1e293b; }
            .header p { margin: 4px 0; font-size: 13px; color: #64748b; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
            th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; }
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
            <p><strong>Detailed Invoice Report</strong></p>
            <p>Date Range: ${startDate} to ${endDate}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th class="text-center">Serial No</th>
                <th>Date</th>
                <th>Invoice No</th>
                <th>Dealer Code</th>
                <th>Name (Dealer / Customer)</th>
                <th class="text-right">Cash</th>
                <th class="text-right">Bank</th>
                <th class="text-right">Advance</th>
                <th class="text-right">GROSS</th>
                <th class="text-right">Payable</th>
              </tr>
            </thead>
            <tbody>
    `;

    reports.forEach((row, index) => {
      const formattedDate = row.date ? new Date(row.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '';
      const name = row.dealerCode !== 'N/A' && row.dealerName ? row.dealerName : (row.customerName || 'Walk-in Customer');
      
      htmlContent += `
        <tr>
          <td class="text-center">${index + 1}</td>
          <td>${formattedDate}</td>
          <td><b>${row.invoiceNo}</b></td>
          <td>${row.dealerCode}</td>
          <td>${name}</td>
          <td class="text-right">৳${(row.cash || 0).toLocaleString()}</td>
          <td class="text-right">৳${(row.bank || 0).toLocaleString()}</td>
          <td class="text-right">৳${(row.advance || 0).toLocaleString()}</td>
          <td class="text-right"><b>৳${(row.gross || 0).toLocaleString()}</b></td>
          <td class="text-right" style="color: ${row.payable > 0 ? 'red' : 'inherit'}">${(row.payable || 0) > 0 ? '৳' + (row.payable || 0).toLocaleString() : '-'}</td>
        </tr>
      `;
    });

    htmlContent += `
            </tbody>
            <tfoot>
              <tr>
                <td colspan="5" class="text-right" style="text-transform: uppercase;">Total Summary:</td>
                <td class="text-right">৳${totals.cash.toLocaleString()}</td>
                <td class="text-right">৳${totals.bank.toLocaleString()}</td>
                <td class="text-right">৳${totals.advance.toLocaleString()}</td>
                <td class="text-right">৳${totals.gross.toLocaleString()}</td>
                <td class="text-right">৳${totals.payable.toLocaleString()}</td>
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
      {/* Header & Filters Section */}
      <div className="flex flex-col gap-4 mb-6 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Detailed Invoice Report</h1>
          <p className="text-xs sm:text-sm text-slate-500">তারিখ, ডিলার, কাস্টমার এবং পেমেন্ট ট্রানজ্যাকশন রিপোর্ট</p>
        </div>

        {/* Date Filter & Action Buttons */}
        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
            <Calendar className="w-4 h-4 text-slate-400 ml-1 shrink-0" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="p-1 text-xs sm:text-sm outline-none font-medium text-slate-700 bg-transparent flex-1 sm:flex-none"
            />
            <span className="text-slate-400 text-xs sm:text-sm">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="p-1 text-xs sm:text-sm outline-none font-medium text-slate-700 bg-transparent flex-1 sm:flex-none"
            />
            <button
              onClick={fetchReport}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition flex items-center justify-center gap-1.5 w-full sm:w-auto mt-1 sm:mt-0"
            >
              <Search className="w-4 h-4" /> Filter
            </button>
          </div>

          {/* Export & Print Buttons */}
          <div className="grid grid-cols-2 sm:flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Download className="w-4 h-4 shrink-0" /> Export CSV
            </button>

            <button
              onClick={handlePrintA4}
              className="bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Printer className="w-4 h-4 shrink-0" /> Print / PDF
            </button>
          </div>
        </div>
      </div>

      {/* 📱 Mobile View: Card Layout (Only visible on small screens) */}
      <div className="block md:hidden space-y-3">
        {loading ? (
          <div className="bg-white p-6 text-center text-slate-500 rounded-xl border border-slate-200 shadow-sm">
            Loading reports...
          </div>
        ) : reports && reports.length > 0 ? (
          reports.map((row) => (
            <div key={row.invoiceNo || Math.random()} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 space-y-2.5">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-blue-600">#{row.invoiceNo}</span>
                <span className="text-xs text-slate-500 font-medium">
                  {row.date ? new Date(row.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                </span>
              </div>

              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Dealer Code:</span>
                  <span className="font-semibold text-slate-700">{row.dealerCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Name:</span>
                  <span className="font-medium text-slate-800 text-right">
                    {row.dealerCode !== 'N/A' && row.dealerName ? row.dealerName : (row.customerName || 'Walk-in Customer')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-1 bg-slate-50 p-2 rounded-lg text-center text-[11px]">
                <div>
                  <p className="text-slate-400">Cash</p>
                  <p className="font-bold text-emerald-600">৳{(row.cash || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-slate-400">Bank</p>
                  <p className="font-bold text-indigo-600">৳{(row.bank || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-slate-400">Advance</p>
                  <p className="font-bold text-amber-600">৳{(row.advance || 0).toLocaleString()}</p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-xs font-bold">
                <div>
                  <span className="text-slate-500 font-normal">Gross: </span>
                  <span className="text-slate-800">৳{(row.gross || 0).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-normal">Payable: </span>
                  <span className="text-red-600">{(row.payable || 0) > 0 ? `৳${(row.payable || 0).toLocaleString()}` : '-'}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-6 text-center text-slate-400 rounded-xl border border-slate-200 shadow-sm">
            No invoice reports found.
          </div>
        )}

        {/* Mobile Total Summary Card */}
        {reports && reports.length > 0 && (
          <div className="bg-slate-900 text-white p-4 rounded-xl shadow-md space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-1">Total Summary</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><span className="text-slate-400">Total Cash:</span> ৳{totals.cash.toLocaleString()}</div>
              <div><span className="text-slate-400">Total Bank:</span> ৳{totals.bank.toLocaleString()}</div>
              <div><span className="text-slate-400">Total Advance:</span> ৳{totals.advance.toLocaleString()}</div>
              <div><span className="text-slate-400">Total Gross:</span> ৳{totals.gross.toLocaleString()}</div>
            </div>
            <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-sm">
              <span>Total Payable:</span>
              <span className="text-rose-400">৳{totals.payable.toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>

      {/* 💻 Desktop/Tablet View: Standard Table Layout (Visible on medium+ screens) */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-100 text-slate-600 uppercase font-semibold text-xs border-b border-slate-200">
              <tr>
                <th className="p-3.5 text-center">Serial No</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Invoice No</th>
                <th className="p-3.5">Dealer Code</th>
                <th className="p-3.5">Name (Dealer / Customer)</th>
                <th className="p-3.5 text-right">Cash</th>
                <th className="p-3.5 text-right">Bank</th>
                <th className="p-3.5 text-right">Advance</th>
                <th className="p-3.5 text-right">GROSS</th>
                <th className="p-3.5 text-right">Payable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="10" className="p-8 text-center text-slate-500">Loading reports...</td>
                </tr>
              ) : reports && reports.length > 0 ? (
                reports.map((row) => (
                  <tr key={row.invoiceNo || Math.random()} className="hover:bg-slate-50 transition">
                    <td className="p-3.5 text-center font-medium text-slate-500">{row.serialNo}</td>
                    <td className="p-3.5 text-slate-600 font-medium">
                      {row.date ? new Date(row.date).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      }) : 'N/A'}
                    </td>
                    <td className="p-3.5 font-bold text-blue-600">{row.invoiceNo}</td>
                    <td className="p-3.5 font-semibold text-slate-700">{row.dealerCode}</td>
                    <td className="p-3.5 text-slate-700 font-medium">
                      {row.dealerCode !== 'N/A' && row.dealerName 
                        ? row.dealerName 
                        : (row.customerName || 'Walk-in Customer')}
                    </td>
                    <td className="p-3.5 text-right font-medium text-emerald-600">৳{(row.cash || 0).toLocaleString()}</td>
                    <td className="p-3.5 text-right font-medium text-indigo-600">৳{(row.bank || 0).toLocaleString()}</td>
                    <td className="p-3.5 text-right font-medium text-amber-600">৳{(row.advance || 0).toLocaleString()}</td>
                    <td className="p-3.5 text-right font-bold text-slate-800">৳{(row.gross || 0).toLocaleString()}</td>
                    <td className="p-3.5 text-right font-bold text-red-500">
                      {(row.payable || 0) > 0 ? `৳${(row.payable || 0).toLocaleString()}` : '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="p-8 text-center text-slate-400">
                    No invoice reports found for this date range.
                  </td>
                </tr>
              )}
            </tbody>

            {/* Total Summary Footer */}
            {reports && reports.length > 0 && (
              <tfoot className="bg-slate-100 font-bold text-slate-800 border-t-2 border-slate-300">
                <tr>
                  <td colSpan="5" className="p-3.5 text-right uppercase text-xs tracking-wider">Total Summary:</td>
                  <td className="p-3.5 text-right text-emerald-700">৳{totals.cash.toLocaleString()}</td>
                  <td className="p-3.5 text-right text-indigo-700">৳{totals.bank.toLocaleString()}</td>
                  <td className="p-3.5 text-right text-amber-700">৳{totals.advance.toLocaleString()}</td>
                  <td className="p-3.5 text-right text-slate-900">৳{totals.gross.toLocaleString()}</td>
                  <td className="p-3.5 text-right text-red-600">৳{totals.payable.toLocaleString()}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};

export default DetailedInvoiceReport;