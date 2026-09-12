// import React, { useState, useEffect } from "react";
// import { FaFileInvoiceDollar, FaUserCheck, FaUserTie, FaCheckCircle } from "react-icons/fa";

// const SalesTrackingReport = () => {
//   const [sales, setSales] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

//   useEffect(() => {
//     fetch(`${SERVER_URL}/api/sales`) // আপনার সঠিক এপিআই পাথ
//       .then((res) => res.json())
//       .then((data) => {
//         setSales(data);
//         setLoading(false);
//       })
//       .catch((err) => {
//         console.error(err);
//         setLoading(false);
//       });
//   }, []);

//   if (loading) return <div style={{ padding: "20px" }}>Loading Sales Analysis...</div>;

//   return (
//     <div style={{ padding: "16px", background: "#f8fafc", minHeight: "100vh", fontFamily: "sans-serif", boxSizing: "border-box" }}>
//       <div style={{ maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
        
//         {/* হেডার সেকশন */}
//         <h2 style={{ color: "#0f172a", marginBottom: "4px", fontSize: "calc(18px + 0.5vw)" }}>📋 Sales Generation Ledger</h2>
//         <p style={{ color: "#64748b", fontSize: "13px", marginBottom: "20px" }}>Track Sales Invoices linked to Dealers and Marketing Representatives</p>

//         {/* 📱 💻 ১০০% রেসপন্সিভ ডাটা কন্টেইনার */}
//         <div className="responsive-table-wrapper" style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 4px 6px rgba(0,0,0,0.02)", width: "100%" }}>
//           <table className="desktop-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
//             <thead>
//               <tr style={{ background: "#f1f5f9", color: "#475569", fontSize: "12px", fontWeight: "700", textTransform: "uppercase" }}>
//                 <th style={{ padding: "14px 16px" }}>Invoice / Sales</th>
//                 <th style={{ padding: "14px 16px" }}>🤝 Dealer Details</th>
//                 <th style={{ padding: "14px 16px" }}>👤 Reference Employee (MKT)</th>
//                 <th style={{ padding: "14px 16px" }}>Amount</th>
//                 <th style={{ padding: "14px 16px" }}>Status</th>
//               </tr>
//             </thead>
//             <tbody>
//               {sales.length === 0 ? (
//                 <tr>
//                   <td colSpan="5" style={{ padding: "30px", textAlign: "center", color: "#94a3b8", fontSize: "14px" }}>No sales transactions found.</td>
//                 </tr>
//               ) : (
//                 sales.map((sale) => (
//                   <tr key={sale._id} style={{ borderBottom: "1px solid #e2e8f0", transition: "background 0.2s" }} className="table-row-hover">
                    
//                     {/* ১. ইনভয়েস নাম্বার ও ডেট */}
//                     <td style={{ padding: "16px" }} data-label="Invoice">
//                       <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
//                         <FaFileInvoiceDollar size={18} color="#4f46e5" style={{ flexShrink: 0 }} />
//                         <div style={{ minWidth: 0 }}>
//                           <span style={{ fontWeight: "700", color: "#1e293b", display: "block", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{sale.invoiceNo}</span>
//                           <span style={{ fontSize: "11px", color: "#94a3b8" }}>{sale.createdAt ? new Date(sale.createdAt).toLocaleDateString() : "N/A"}</span>
//                         </div>
//                       </div>
//                     </td>

//                     {/* ২. ডিলারের নাম ও ডিলার আইডি */}
//                     <td style={{ padding: "16px" }} data-label="Dealer">
//                       <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
//                         <FaUserCheck color="#0ea5e9" style={{ flexShrink: 0 }} />
//                         <div>
//                           <span style={{ fontWeight: "600", color: "#334155", display: "block" }}>{sale.dealer?.name || "Unknown Dealer"}</span>
//                           <span style={{ fontSize: "12px", color: "#64748b" }}>ID: {sale.dealer?.dealerId || sale.dealer?.idNo || "N/A"}</span>
//                         </div>
//                       </div>
//                     </td>

//                     {/* ৩. রেফারেন্স মার্কেটিং এমপ্লয়ি */}
//                     <td style={{ padding: "16px" }} data-label="MKT Reference">
//                       {sale.employeeInfo ? (
//                         <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
//                           <FaUserTie color="#10b981" style={{ flexShrink: 0 }} />
//                           <div>
//                             <span style={{ fontWeight: "600", color: "#0f172a", display: "block" }}>{sale.employeeInfo.name}</span>
//                             <span style={{ fontSize: "10px", background: "#dcfce7", color: "#15803d", padding: "1px 6px", borderRadius: "10px", fontWeight: "600", display: "inline-block" }}>
//                               {sale.employeeInfo.idNo}
//                             </span>
//                           </div>
//                         </div>
//                       ) : (
//                         <span style={{ color: "#94a3b8", fontSize: "12px", fontStyle: "italic" }}>No MKT Linked ({sale.dealer?.referenceIdNo || "N/A"})</span>
//                       )}
//                     </td>

//                     {/* ৪. অ্যামাউন্ট */}
//                     <td style={{ padding: "16px" }} data-label="Amount">
//                       <span style={{ fontWeight: "700", color: "#0f172a" }}>Tk {sale.grandTotal?.toLocaleString() || 0}</span>
//                       <span style={{ display: "block", fontSize: "11px", color: "#64748b" }}>via {sale.paymentMethod || "Cash"}</span>
//                     </td>

//                     {/* ৫. পেমেন্ট স্ট্যাটাস */}
//                     <td style={{ padding: "16px" }} data-label="Status">
//                       <span style={{ 
//                         display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "11px", fontWeight: "600",
//                         padding: "4px 10px", borderRadius: "20px",
//                         background: sale.paymentStatus === "Paid" ? "#ecfdf5" : "#fff7ed",
//                         color: sale.paymentStatus === "Paid" ? "#047857" : "#c2410c"
//                       }}>
//                         <FaCheckCircle size={10} /> {sale.paymentStatus || "Pending"}
//                       </span>
//                     </td>

//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>

//       </div>

//       {/* 📱 কাস্টম রেসপন্সিভ সিএসএস মিডিয়া কুয়েরি ইনজেকশন */}
//       <style>{`
//         .table-row-hover:hover { 
//           background-color: #f8fafc; 
//         }

//         /* 📱 মোবাইল রেসপনসিভ ব্রেকপয়েন্ট (৭৬৮ পিক্সেল বা তার নিচে হলে লেআউট কার্ডে রূপান্তর হবে) */
//         @media screen and (max-width: 768px) {
//           .responsive-table-wrapper {
//             border: none !important;
//             box-shadow: none !important;
//             background: transparent !important;
//           }
          
//           .desktop-table, .desktop-table thead, .desktop-table tbody, .desktop-table th, .desktop-table td, .desktop-table tr { 
//             display: block; 
//             width: 100%;
//             box-sizing: border-box;
//           }
          
//           /* টেবিল হেডার মোবাইলে হাইড থাকবে */
//           .desktop-table thead tr { 
//             position: absolute;
//             top: -9999px;
//             left: -9999px;
//           }
          
//           /* প্রতিটা রো একেকটি সুন্দর স্বাধীন কার্ডে রূপান্তর হবে */
//           .desktop-table tr { 
//             background: #ffffff;
//             border: 1px solid #e2e8f0 !important;
//             border-radius: 14px;
//             margin-bottom: 14px;
//             padding: 8px 12px;
//             box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.01), 0 2px 4px -1px rgba(0, 0, 0, 0.01);
//           }
          
//           .desktop-table tr:hover {
//             background-color: #ffffff !important;
//           }
          
//           /* প্রতিটা কলামের ডাটা লেবেল বামপাশে সেট হবে */
//           .desktop-table td { 
//             border: none !important;
//             position: relative;
//             padding: 10px 8px 10px 45% !important; 
//             text-align: right !important;
//             display: flex;
//             justify-content: flex-end;
//             align-items: center;
//           }
          
//           .desktop-table td:not(:last-child) {
//             border-bottom: 1px dashed #f1f5f9 !important;
//           }
          
//           /* মোবাইলে বামপাশে কাস্টম ডাটা-লেবেল টেক্সট ইনজেকশন */
//           .desktop-table td:before { 
//             content: attr(data-label);
//             position: absolute;
//             left: 8px;
//             width: 40%; 
//             padding-right: 10px; 
//             white-space: nowrap;
//             text-align: left;
//             font-weight: 700;
//             color: #475569;
//             font-size: 12px;
//             text-transform: uppercase;
//           }

//           /* মোবাইল ভিউতে আইকন কন্টেইনার এবং এলাইনমেন্ট ঠিক করা */
//           .desktop-table td > div {
//             justify-content: flex-end;
//             width: 100%;
//           }
//         }
//       `}</style>
//     </div>
//   );

// };

// export default SalesTrackingReport;



import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Eye, Search, Calendar, FileText, User as UserIcon } from 'lucide-react';

const SalesTrackingReport = () => {
  const [sales, setSales] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 📊 সার্ভার-সাইড পেজিনেশন ও ফিল্টারের নতুন স্টেটসমূহ
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(20); // প্রতি পেজে ২০টি করে ডাটা দেখাবে

  const navigate = useNavigate();
  const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

  // 🔄 ব্যাকএন্ড থেকে অপ্টিমাইজড সেলস ডাটা ফেচ করা
  const fetchSalesData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${SERVER_URL}/api/sales`, {
        params: {
          page: currentPage,
          limit: limit,
          search: searchTerm.trim()
        }
      });

      // আপনার ব্যাকএন্ড কন্ট্রোলারের স্ট্যান্ডার্ড রেসপন্স রিড করা হচ্ছে
      if (response.data.success) {
        setSales(response.data.data || []);
        setTotalPages(response.data.totalPages || 1);
        setTotalCount(response.data.total || 0);
      }
    } catch (err) {
      console.error("Error fetching sales tracking report:", err);
      setError('Failed to load sales tracking report');
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, searchTerm, SERVER_URL]);

  // পেজ নম্বর বা সার্চ চেঞ্জ হলে অটোমেটিক ডাটা রি-লোডের ট্রিগার
  useEffect(() => {
    fetchSalesData();
  }, [currentPage, searchTerm, fetchSalesData]);

  // লাইভ সার্চ হ্যান্ডলার (টাইপ করার সাথে সাথে ডাটা কুয়েরি হবে)
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // সার্চের লেখা চেঞ্জ হলেই পেজ ১ এ যাবে
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchSalesData();
  };

  if (loading && sales.length === 0) {
    return <div style={{ padding: "40px", textAlign: "center", fontSize: "16px", fontWeight: "600", color: "#475569" }}>Loading Sales Tracking Report...</div>;
  }

  if (error) {
    return <div style={{ padding: "40px", textAlign: "center", color: "#ef4444", fontWeight: "600" }}>{error}</div>;
  }

  return (
    <div style={{ padding: "20px", background: "#f8fafc", minHeight: "100vh" }}>
      
      {/* 🏷️ হেডার প্যানেল */}
      <div style={{ background: "#ffffff", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0", marginBottom: "24px", boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)" }}>
        <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a", margin: 0 }}>Sales Tracking & Employee Engine</h2>
        <p style={{ fontSize: "14px", color: "#64748b", marginTop: "4px", marginBottom: 0 }}>Monitor sales invoices mapped dynamically with linked distribution dealers and tracking officers.</p>
      </div>

      {/* 🔍 সার্চ ফিল্টার বক্স */}
      <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "12px", marginBottom: "24px", maxWidth: "500px" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <input 
            type="text"
            placeholder="Search by Invoice No or Customer..."
            value={searchTerm}
            onChange={handleSearchChange}
            style={{
              width: "100%", padding: "10px 16px 10px 40px", borderRadius: "12px", border: "1px solid #cbd5e1",
              fontSize: "14px", outline: "none", background: "#ffffff", color: "#000000"
            }}
          />
          <Search size={18} style={{ position: "absolute", left: "14px", top: "13px", color: "#94a3b8" }} />
        </div>
        <button type="submit" style={{ background: "#4f46e5", color: "#ffffff", padding: "10px 20px", borderRadius: "12px", border: "none", fontWeight: "600", fontSize: "14px", cursor: "pointer" }}>
          Search
        </button>
      </form>

      {/* 📊 মেইন টেবিল কন্টেইনার */}
      <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)" }}>
        <div className="overflow-x-auto">
          <table className="desktop-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "#f1f5f9", borderBottom: "1px solid #e2e8f0", color: "#475569", fontSize: "12px", fontWeight: "700", textTransform: "uppercase" }}>
                <th style={{ padding: "16px" }}>Invoice Details</th>
                <th style={{ padding: "16px" }}>Client Info</th>
                <th style={{ padding: "16px" }}>Assigned Dealer</th>
                <th style={{ padding: "16px" }}>Tracking Employee</th>
                <th style={{ padding: "16px" }}>Grand Total</th>
                <th style={{ padding: "16px" }}>Status</th>
                <th style={{ padding: "16px", textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody style={{ fontSize: "14px", color: "#334155" }}>
              {sales.map((sale) => (
                <tr key={sale._id} style={{ borderBottom: "1px solid #f1f5f9" }} className="table-row-hover">
                  
                  <td style={{ padding: "16px" }} data-label="Invoice Details">
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <FileText size={16} style={{ color: "#6366f1" }} />
                      <div>
                        <div style={{ fontWeight: "700", color: "#0f172a" }}>{sale.invoiceNo}</div>
                        <div style={{ fontSize: "12px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                          <Calendar size={12} /> {new Date(sale.createdAt).toLocaleDateString('en-BD', { dateStyle: 'medium' })}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td style={{ padding: "16px" }} data-label="Client Info">
                    <div style={{ fontWeight: "600", color: "#1e293b" }}>{sale.customerName || 'Walk-in Customer'}</div>
                    <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>{sale.customerMobile || 'No Contact'}</div>
                  </td>

                  <td style={{ padding: "16px" }} data-label="Assigned Dealer">
                    {sale.dealer ? (
                      <div>
                        <div style={{ fontWeight: "600", color: "#0f172a" }}>{sale.dealer.name}</div>
                        <div style={{ fontSize: "12px", color: "#4f46e5", fontFamily: "monospace", marginTop: "2px" }}>ID: {sale.dealer.dealerId}</div>
                      </div>
                    ) : (
                      <span style={{ fontSize: "13px", color: "#94a3b8", fontStyle: "italic" }}>Direct Channel</span>
                    )}
                  </td>

                  <td style={{ padding: "16px" }} data-label="Tracking Employee">
                    {sale.employeeInfo ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <UserIcon size={14} style={{ color: "#0ea5e9" }} />
                        <div>
                          <div style={{ fontWeight: "600", color: "#0f172a" }}>{sale.employeeInfo.name}</div>
                          <div style={{ fontSize: "11px", color: "#0ea5e9", fontWeight: "700", textTransform: "uppercase" }}>{sale.employeeInfo.idNo}</div>
                        </div>
                      </div>
                    ) : (
                      <span style={{ fontSize: "13px", color: "#94a3b8" }}>N/A</span>
                    )}
                  </td>

                  <td style={{ padding: "16px", fontWeight: "700", color: "#0f172a" }} data-label="Grand Total">
                    ৳{sale.grandTotal?.toLocaleString() || 0}
                  </td>

                  <td style={{ padding: "16px" }} data-label="Status">
                    <span style={{
                      padding: "4px 10px", borderRadius: "9999px", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", border: "1px solid",
                      background: sale.paymentStatus === 'Paid' ? '#f0fdf4' : sale.paymentStatus === 'Partially Paid' ? '#fffbeb' : '#fef2f2',
                      color: sale.paymentStatus === 'Paid' ? '#16a34a' : sale.paymentStatus === 'Partially Paid' ? '#d97706' : '#dc2626',
                      borderColor: sale.paymentStatus === 'Paid' ? '#bbf7d0' : sale.paymentStatus === 'Partially Paid' ? '#fde68a' : '#fecaca'
                    }}>
                      {sale.paymentStatus || sale.status}
                    </span>
                  </td>

                  <td style={{ padding: "16px", textAlign: "center" }} data-label="Actions">
                    <button 
                      onClick={() => navigate(`/admin-panel/accounting/update-invoice/${sale._id}`)}
                      style={{ padding: "6px 12px", background: "#f1f5f9", border: "none", borderRadius: "8px", color: "#4f46e5", fontWeight: "600", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}
                    >
                      <Eye size={14} /> View
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* 📊 পেজিনেশন কন্ট্রোল প্যানেল */}
      {sales.length > 0 && (
        <div style={{ 
          display: "flex", justifyContent: "between", alignItems: "center", gap: "12px", 
          marginTop: "16px", padding: "14px 20px", background: "#ffffff", 
          borderRadius: "14px", border: "1px solid #e2e8f0", flexWrap: "wrap" 
        }} className="pagination-container">
          <span style={{ fontSize: "13px", fontWeight: "500", color: "#64748b" }}>
            Showing Page <span style={{ color: "#4f46e5", fontWeight: "700" }}>{currentPage}</span> of <span style={{ fontWeight: "700", color: "#1e293b" }}>{totalPages}</span> ({totalCount} total sales transactions)
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <button 
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              style={{
                padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "8px",
                background: "#ffffff", color: "#334155", fontSize: "13px", fontWeight: "600",
                cursor: currentPage === 1 ? "not-allowed" : "pointer", opacity: currentPage === 1 ? 0.4 : 1,
                transition: "all 0.2s"
              }}
            >
              Previous
            </button>
            
            {[...Array(totalPages)].map((_, index) => {
              const pageNum = index + 1;
              if (pageNum === 1 || pageNum === totalPages || Math.abs(currentPage - pageNum) <= 1) {
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    style={{
                      padding: "8px 14px", borderRadius: "8px", fontSize: "13px", fontWeight: "700",
                      border: currentPage === pageNum ? "1px solid #4f46e5" : "1px solid #cbd5e1",
                      background: currentPage === pageNum ? "#4f46e5" : "#ffffff",
                      color: currentPage === pageNum ? "#ffffff" : "#334155",
                      cursor: "pointer", transition: "all 0.2s"
                    }}
                  >
                    {pageNum}
                  </button>
                );
              }
              if (pageNum === 2 || pageNum === totalPages - 1) {
                return <span key={pageNum} style={{ color: "#94a3b8", padding: "0 4px" }}>...</span>;
              }
              return null;
            })}

            <button 
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              style={{
                padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "8px",
                background: "#ffffff", color: "#334155", fontSize: "13px", fontWeight: "600",
                cursor: currentPage === totalPages ? "not-allowed" : "pointer", opacity: currentPage === totalPages ? 0.4 : 1,
                transition: "all 0.2s"
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* যদি ডাটাবেস বা ফিল্টারে কোনো সেলস ডাটা না পাওয়া যায় */}
      {sales.length === 0 && !loading && (
        <div style={{ textAlign: "center", padding: "40px", background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", color: "#94a3b8", fontWeight: "500" }}>
          No sales transaction records found.
        </div>
      )}

      {/* 📱 রেসপন্সিভ মোবাইল মিডিয়া কুয়েরি স্টাইলিং */}
      <style>{`
        .table-row-hover:hover {
          background-color: #f8fafc !important;
          transition: background-color 0.15s ease;
        }
        @media screen and (max-width: 640px) {
          .pagination-container {
            flex-direction: column !important;
            align-items: center !important;
            text-align: center;
            gap: 10px !important;
          }
        }
        @media screen and (max-width: 1024px) {
          .desktop-table thead { display: none; }
          .desktop-table tr { 
            display: block; 
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            margin-bottom: 16px;
            padding: 8px;
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.02);
          }
          /* প্রতিটা কলামের ডাটা লেবেল বামপাশে সেট হবে */
          .desktop-table td { 
            border: none !important;
            position: relative;
            padding: 10px 8px 10px 45% !important; 
            text-align: right !important;
            display: flex;
            justify-content: flex-end;
            align-items: center;
          }
          
          .desktop-table td:not(:last-child) {
            border-bottom: 1px dashed #f1f5f9 !important;
          }
          
          /* মোবাইলে বামপাশে কাস্টম ডাটা-লেবেল টেক্সট ইনজেকশন */
          .desktop-table td:before { 
            content: attr(data-label);
            position: absolute;
            left: 8px;
            width: 40%; 
            padding-right: 10px; 
            white-space: nowrap;
            text-align: left;
            font-weight: 700;
            color: #475569;
            font-size: 12px;
            text-transform: uppercase;
          }

          /* মোবাইল ভিউতে আইকন কন্টেইনার এবং এলাইনমেন্ট ঠিক করা */
          .desktop-table td > div {
            justify-content: flex-end;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default SalesTrackingReport;

      