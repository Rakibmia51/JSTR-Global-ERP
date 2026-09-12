// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { 
//   FaUserTie, 
//   FaCoins, 
//   FaHandshake, 
//   FaCheckCircle, 
//   FaExclamationCircle, 
//   FaFilter, 
//   FaSpinner 
// } from "react-icons/fa";

// export default function CommissionDesk() {
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState("employee");
  
//   // ফিল্টার স্টেট (ডিফল্ট কারেন্ট মাস ও বছর)
//   const [year, setYear] = useState(new Date().getFullYear());
//   const [month, setMonth] = useState(new Date().getMonth() + 1);

//    const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'; 

//   // ব্যাকএন্ড এপিআই থেকে ডেটা ফেচ করার ফাংশন
//   const fetchLedgerData = async () => {
//     setLoading(true);
//     try {
//       const response = await axios.get(`${SERVER_URL}/api/commissions?year=${year}&month=${month}`);
//       setData(response.data);
//       console.log("Fetched Ledger Data:", response.data);
//     } catch (error) {
//       console.error("Error fetching ledger data:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchLedgerData();
//   }, [year, month]);

//   // 🎯 ১. নেস্টেড ট্রি থেকে রিকার্সিভলি সব এমপ্লয়িকে লিনিয়ার অ্যারেতে কনভার্ট করার হেল্পার (Tree Flattener)
//   const flattenEmployees = (nodes) => {
//     let result = [];
//     if (!nodes) return result;
    
//     nodes.forEach(node => {
//       // children অ্যারে আলাদা করে বাকি সব এমপ্লয়ি ডাটা কপি করা
//       const { children, ...employeeData } = node;
//       result.push(employeeData);
      
//       // যদি এই নোডের অধীনে কোনো চাইল্ড থাকে, তবে তাদেরও একই ফাংশনে রিকার্সন চালানো
//       if (node.children && node.children.length > 0) {
//         result = result.concat(flattenEmployees(node.children));
//       }
//     });
//     return result;
//   };

//   // ২. আপনার ব্যাকএন্ড ডাটা থেকে সম্পূর্ণ ফ্ল্যাট বা লিনিয়ার লিস্ট জেনারেট করুন
//   const allEmployeesList = data?.data ? flattenEmployees(data.data) : [];
//   //console.log(allEmployeesList)

//   if (loading) {
//     return (
//       <div style={{ display: "flex", flexDirection: "column", gap: "12px", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#f8fafc" }}>
//         <FaSpinner size={30} color="#4f46e5" className="animate-spin" style={{ animation: "spin 1s linear infinite" }} />
//         <span style={{ fontSize: "14px", color: "#64748b", fontFamily: "sans-serif" }}>Processing ERP Slabs...</span>
//         <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
//       </div>
//     );
//   }

//   return (
//     <div style={{ padding: "16px", background: "#f8fafc", minHeight: "100vh", fontFamily: "sans-serif", boxSizing: "border-box" }}>
//       <div style={{ maxWidth: "1000px", margin: "0 auto", width: "100%" }}>
        
//         {/* হেডার এবং মান্থলি ফিল্টার ড্রপডাউন */}
//         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "24px" }}>
//           <div>
//             <h2 style={{ color: "#0f172a", margin: "0 0 4px 0" }}>💰 ERP Commission Desk</h2>
//             <p style={{ color: "#64748b", fontSize: "13px", margin: 0 }}>Automated Gap Slabs processing with Real-Time Grand Summary</p>
//           </div>
          
//           {/* 📅 ডাইনামিক ডেট ফিল্টার কন্ট্রোল */}
//           <div style={{ display: "flex", gap: "8px", background: "#fff", padding: "6px 12px", borderRadius: "10px", border: "1px solid #e2e8f0", alignItems: "center" }}>
//             <FaFilter color="#64748b" size={12} />
//             <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))} style={{ border: "none", outline: "none", fontSize: "13px", fontWeight: "600", color: "#334155", cursor: "pointer" }}>
//               {Array.from({ length: 12 }, (_, i) => (
//                 <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString("en-US", { month: "long" })}</option>
//               ))}
//             </select>
//             <select value={year} onChange={(e) => setYear(parseInt(e.target.value))} style={{ border: "none", outline: "none", fontSize: "13px", fontWeight: "600", color: "#334155", cursor: "pointer" }}>
//               {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
//             </select>
//           </div>
//         </div>

//         {/* 📊 কোম্পানির মোট খরচের ৩টি কার্ড সামারি */}
//         <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginBottom: "24px", boxSizing: "border-box" }}>
//           <div style={{ flex: "1 1 250px", background: "linear-gradient(135deg, #1e1b4b, #312e81)", color: "#ffffff", padding: "16px 20px", borderRadius: "14px", boxShadow: "0 10px 15px -3px rgba(49, 46, 129, 0.2)" }}>
//             <div style={{ fontSize: "11px", opacity: 0.8, textTransform: "uppercase", fontWeight: "600", letterSpacing: "0.5px" }}>💸 Grand Payout Volume</div>
//             <div style={{ fontSize: "24px", fontWeight: "800", marginTop: "4px" }}>Tk {data?.summary?.grandPayoutTotal?.toLocaleString() || 0}/-</div>
//           </div>
//           <div style={{ flex: "1 1 200px", background: "#ffffff", border: "1px solid #e2e8f0", padding: "14px 18px", borderRadius: "14px" }}>
//             <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: "600" }}>👥 Employee Share</div>
//             <div style={{ fontSize: "18px", fontWeight: "700", color: "#4f46e5", marginTop: "2px" }}>Tk {data?.summary?.totalEmployeePayout?.toLocaleString() || 0}/-</div>
//           </div>
//           <div style={{ flex: "1 1 200px", background: "#ffffff", border: "1px solid #e2e8f0", padding: "14px 18px", borderRadius: "14px" }}>
//             <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: "600" }}>🤝 Dealer Share</div>
//             <div style={{ fontSize: "18px", fontWeight: "700", color: "#10b981", marginTop: "2px" }}>Tk {data?.summary?.totalDealerPayout?.toLocaleString() || 0}/-</div>
//           </div>
//         </div>

//         {/* ট্যাব কন্ট্রোলার বোতাম */}
//         <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
//           <button onClick={() => setActiveTab("employee")} style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "none", cursor: "pointer", fontWeight: "700", fontSize: "14px", backgroundColor: activeTab === "employee" ? "#4f46e5" : "#ffffff", color: activeTab === "employee" ? "#ffffff" : "#475569", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
//             👥 Employee ({allEmployeesList.length})
//           </button>
//           <button onClick={() => setActiveTab("dealer")} style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "none", cursor: "pointer", fontWeight: "700", fontSize: "14px", backgroundColor: activeTab === "dealer" ? "#4f46e5" : "#ffffff", color: activeTab === "dealer" ? "#ffffff" : "#475569", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
//             🤝 Dealer ({data?.dealers?.length || 0})
//           </button>
//         </div>

//         {/* ১. এমপ্লয়ি কমিশন কার্ড লিস্ট */}
//         {activeTab === "employee" && (
//           <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
//             {allEmployeesList.length === 0 ? (
//               <div style={{ padding: "30px", background: "#fff", borderRadius: "12px", textAlign: "center", color: "#94a3b8" }}>No active employee distributions qualified.</div>
//             ) : (
//               allEmployeesList.map((emp) => {
//                 // নেট কমিশন = গ্যাপ কমিশন + গ্লোবাল পুল বোনাস + পারফরম্যান্স ইনসেন্টিভ
//                 const netCommission = (emp.baseCommission || 0) + (emp.globalPoolBonusAmount || 0) + (emp.monthlyBonusAmount || 0);
                
//                 return (
//                   <div key={emp._id} style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "16px", boxShadow: "0 2px 4px rgba(0,0,0,0.01)" }}>
                    
//                     {/* কার্ড হেডার */}
//                     <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px dashed #f1f5f9", paddingBottom: "10px", marginBottom: "10px" }}>
//                       <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
//                         <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", color: "#4f46e5" }}><FaUserTie size={14} /></div>
//                         <div>
//                           <strong style={{ display: "block", color: "#0f172a", fontSize: "14px" }}>{emp.name}</strong>
//                           <span style={{ fontSize: "11px", color: "#64748b" }}>ID: {emp.idNo}</span>
//                         </div>
//                       </div>
//                       <span style={{ fontSize: "10px", fontWeight: "700", background: "#eff6ff", color: "#2563eb", padding: "2px 8px", borderRadius: "12px" }}>{emp.position || emp.autoPosition}</span>
//                     </div>

//                     {/* কার্ড মেটরিক্স */}
//                     <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", fontFamily: "sans-serif" }}>
                      
//                       <div style={{ color: "#64748b" }}>Lifetime Sales Achieve:</div>
//                       <strong style={{ color: "#1e293b", fontSize: "14px", marginBottom: "4px" }}>Tk {emp.totalSalesAchieved?.toLocaleString()}</strong>

//                       <div style={{ color: "#64748b" }}>This Month Sales Volume:</div>
//                       <strong style={{ color: "#1e293b", fontSize: "14px", marginBottom: "4px" }}>Tk {emp.thisMonthSalesAchieved?.toLocaleString()}</strong>

//                       <div style={{ color: "#64748b" }}>Earned Gap Commission:</div>
//                       <strong style={{ color: "#1e293b", fontSize: "14px", marginBottom: "4px" }}>Tk {emp.baseCommission?.toLocaleString()}</strong>

//                       <div style={{ color: "#64748b" }}>Global Pool Shared ({emp.earnedPools?.join(", ") || "None"}):</div>
//                       <strong style={{ color: "#1e293b", fontSize: "14px", marginBottom: "4px" }}>Tk {emp.globalPoolBonusAmount?.toLocaleString()}</strong>

//                       <div style={{ color: "#64748b" }}>Performance Incentive ({((emp.performanceBonusRate || 0) * 100).toFixed(2)}%):</div>
//                       <strong style={{ color: "#1e293b", fontSize: "14px", marginBottom: "8px" }}>Tk {emp.monthlyBonusAmount?.toLocaleString()}</strong>

//                       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f1f5f9", paddingTop: "8px" }}>
//                         <span style={{ fontWeight: "700", color: "#0f172a", display: "flex", alignItems: "center", gap: "4px" }}>
//                           <FaCoins color="#eab308" /> Net Commission:
//                         </span>
//                         <strong style={{ fontSize: "16px", color: "#4f46e5" }}>Tk {netCommission.toLocaleString()}/-</strong>
//                       </div>

//                     </div>


//                   </div>
//                 );
//               })
//             )}
//           </div>
//         )}

//         {/* ২. ডিলার কমিশন কার্ড লিস্ট */}
//         {activeTab === "dealer" && (
//           <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
//             {!data?.dealers || data.dealers.length === 0 ? (
//               <div style={{ padding: "30px", background: "#fff", borderRadius: "12px", textAlign: "center", color: "#94a3b8" }}>No active dealer payout clocked.</div>
//             ) : (
//               data.dealers.map((dlr) => (
//                 <div key={dlr._id} style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "16px", boxShadow: "0 2px 4px rgba(0,0,0,0.01)" }}>
                  
//                   {/* ডিলার কার্ড হেডার */}
//                   <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", borderBottom: "1px dashed #f1f5f9", paddingBottom: "10px" }}>
//                     <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
//                       <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center" }}>
//                         <FaHandshake color="#10b981" size={16} />
//                       </div>
//                       <div>
//                         <strong style={{ color: "#1e293b", fontSize: "14px", display: "block" }}>{dlr.name}</strong>
//                         <span style={{ fontSize: "11px", color: "#64748b" }}>Dealer ID: {dlr.dealerId}</span>
//                       </div>
//                     </div>
//                     {/* কোয়ালিফাইড স্ট্যাটাস ব্যাজ */}
//                     <span style={{ 
//                       fontSize: "11px", 
//                       fontWeight: "600", 
//                       padding: "3px 10px", 
//                       borderRadius: "20px", 
//                       backgroundColor: dlr.totalSales >= 5000 ? "#e6f4ea" : "#fce8e6", 
//                       color: dlr.totalSales >= 5000 ? "#137333" : "#c5221f",
//                       display: "flex",
//                       alignItems: "center",
//                       gap: "4px"
//                     }}>
//                       {dlr.totalSales >= 5000 ? <FaCheckCircle size={10} /> : <FaExclamationCircle size={10} />}
//                       {dlr.status}
//                     </span>
//                   </div>

//                   {/* ডিলার মেটরিক্স বডি */}
//                   <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px" }}>
//                     <div style={{ display: "flex", justifyContent: "space-between" }}>
//                       <span style={{ color: "#64748b" }}>Monthly Sales Volume:</span>
//                       <strong style={{ color: "#1e293b" }}>Tk {dlr.totalSales?.toLocaleString()}</strong>
//                     </div>
//                     <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f1f5f9", paddingTop: "8px", marginTop: "4px" }}>
//                       <span style={{ fontWeight: "700", color: "#0f172a" }}>🤝 Commission Payout:</span>
//                       <strong style={{ fontSize: "16px", color: "#10b981" }}>Tk {dlr.commission?.toLocaleString()}/-</strong>
//                     </div>
//                   </div>

//                 </div>
//               ))
//             )}
//           </div>
//         )}

//       </div>
//     </div>
//   );
// }

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaHandshake, FaCheckCircle, FaExclamationCircle, FaUser, FaCalculator } from 'react-icons/fa';

const CommissionDesk = () => {
  // 📆 তারিখ ফিল্টার স্টেট
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  
  // 📊 ডাটা ও লোডিং স্টেট
  const [meta, setMeta] = useState(null);
  const [summary, setSummary] = useState(null);
  const [employeesList, setEmployeesList] = useState([]);
  const [dealersList, setDealersList] = useState([]);
  const [isSavedRecord, setIsSavedRecord] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // 📑 ট্যাব এবং পেজিনেশন স্টেট
  const [activeTab, setActiveTab] = useState('employee'); // 'employee' or 'dealer'
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(20); // প্রতি পেজে ২০টি করে ডাটা

  const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

  // 🔄 ব্যাকএন্ড থেকে কমিশন লিজার ডাটা ফেচ করা
  const fetchLedgerData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${SERVER_URL}/api/commissions`, {
        params: {
          year,
          month,
          page: currentPage,
          limit
        }
      });

      if (response.data.success) {
        const resData = response.data;
        setMeta(resData.meta);
        setSummary(resData.summary);
        setEmployeesList(resData.data || []);
        setDealersList(resData.dealers || []);
        setIsSavedRecord(resData.isSavedRecord);
        setTotalPages(resData.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error("Error fetching commission ledger:", err);
      setError(err.response?.data?.message || 'Failed to calculate or fetch commission ledger data.');
    } finally {
      setLoading(false);
    }
  }, [year, month, currentPage, limit, SERVER_URL]);

  // বছর, মাস বা পেজ চেঞ্জ হলে অটোমেটিক ডাটা রি-লোডের ট্রিগার
  useEffect(() => {
    fetchLedgerData();
  }, [currentPage, fetchLedgerData]);

  // ফিল্টার সাবমিট হ্যান্ডলার (নতুন মাস/বছর সিলেক্ট করলে পেজ ১ থেকে ক্যালকুলেশন শুরু হবে)
  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchLedgerData();
  };

  if (loading && employeesList.length === 0 && dealersList.length === 0) {
    return <div style={{ padding: "40px", textAlign: "center", fontSize: "16px", fontWeight: "600", color: "#475569" }}>Calculating & Loading Commission Ledger Engine...</div>;
  }

  return (
    <div style={{ padding: "20px", background: "#f8fafc", minHeight: "100vh" }}>
      
      {/* 🏷️ হেডার ও কন্ট্রোল প্যানেল */}
      <div style={{ background: "#ffffff", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0", marginBottom: "24px", boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
              <FaCalculator style={{ color: "#4f46e5" }} /> Commission & Ledger Engine
            </h2>
            <p style={{ fontSize: "14px", color: "#64748b", marginTop: "4px", marginBottom: 0 }}>
              {isSavedRecord ? "🔒 Showing historically locked and finalized record." : "⚡ Showing live dynamic calculation engine data."}
            </p>
          </div>
          
          {/* 📅 মাস ও বছর সিলেক্টর ফর্ম */}
          <form onSubmit={handleFilterSubmit} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <select 
              value={month} 
              onChange={(e) => setMonth(parseInt(e.target.value))}
              style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", outline: "none", background: "#white", color: "#000" }}
            >
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>{new Date(2000, i).toLocaleString('en-US', { month: 'long' })}</option>
              ))}
            </select>
            <select 
              value={year} 
              onChange={(e) => setYear(parseInt(e.target.value))}
              style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", outline: "none", background: "#white", color: "#000" }}
            >
              {[...Array(7)].map((_, i) => {
                const y = new Date().getFullYear() - 3 + i;
                return <option key={y} value={y}>{y}</option>;
              })}
            </select>
            <button type="submit" style={{ background: "#4f46e5", color: "#ffffff", padding: "8px 16px", borderRadius: "8px", border: "none", fontWeight: "600", fontSize: "14px", cursor: "pointer" }}>
              Process
            </button>
          </form>
        </div>
      </div>

      {/* 📊 সামারি ড্যাশবোর্ড কার্ডস */}
      {summary && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginBottom: "24px" }}>
          <div style={{ background: "#ffffff", padding: "20px", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Employee Payout</span>
            <h3 style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a", margin: "6px 0 0 0" }}>৳{summary.totalEmployeePayout?.toLocaleString()}</h3>
          </div>
          <div style={{ background: "#ffffff", padding: "20px", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Dealer Commission</span>
            <h3 style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a", margin: "6px 0 0 0" }}>৳{summary.totalDealerPayout?.toLocaleString()}</h3>
          </div>
          <div style={{ background: "#4f46e5", padding: "20px", borderRadius: "14px", border: "none", color: "#ffffff" }}>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#e0e7ff", textTransform: "uppercase" }}>Grand Payout Budget</span>
            <h3 style={{ fontSize: "24px", fontWeight: "800", color: "#ffffff", margin: "6px 0 0 0" }}>৳{summary.grandTotalCompanyPayout?.toLocaleString()}</h3>
          </div>
        </div>
      )}

      {error && <div style={{ padding: "16px", background: "#fef2f2", color: "#ef4444", borderRadius: "12px", border: "1px solid #fca5a5", marginBottom: "24px", fontWeight: "600", fontSize: "14px" }}>{error}</div>}

      {/* 📑 ট্যাব নেভিগেশন প্যানেল */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "2px solid #e2e8f0", marginBottom: "20px" }}>
        <button 
          onClick={() => { setActiveTab('employee'); setCurrentPage(1); }}
          style={{ padding: "10px 20px", border: "none", background: "none", fontSize: "15px", fontWeight: "700", color: activeTab === 'employee' ? '#4f46e5' : '#64748b', borderBottom: activeTab === 'employee' ? '3px solid #4f46e5' : '3px solid transparent', cursor: "pointer", transition: "all 0.15s" }}
        >
          Staff Ledgers ({meta?.processedUsersCount || 0})
        </button>
        <button 
          onClick={() => { setActiveTab('dealer'); setCurrentPage(1); }}
          style={{ padding: "10px 20px", border: "none", background: "none", fontSize: "15px", fontWeight: "700", color: activeTab === 'dealer' ? '#4f46e5' : '#64748b', borderBottom: activeTab === 'dealer' ? '3px solid #4f46e5' : '3px solid transparent', cursor: "pointer", transition: "all 0.15s" }}
        >
          Distribution Dealers ({meta?.processedDealersCount || 0})
        </button>
      </div>

           {/* 📦 মেইন কন্টেন্ট বডি */}
      <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden", padding: "20px", boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)" }}>
        
        {/* ক) এমপ্লয়ি টেবিল ভিউ */}
        {activeTab === "employee" && (
          <div className="overflow-x-auto">
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "#f1f5f9", color: "#475569", fontSize: "12px", fontWeight: "700", textTransform: "uppercase", borderBottom: "1px solid #e2e8f0" }}>
                  <th style={{ padding: "12px 16px" }}>Officer Details</th>
                  <th style={{ padding: "12px 16px" }}>Role & Position</th>
                  <th style={{ padding: "12px 16px" }}>Base Salary</th>
                  <th style={{ padding: "12px 16px" }}>Bonus & Com.</th>
                  <th style={{ padding: "12px 16px" }}>Net Earnings</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: "14px", color: "#334155" }}>
                {employeesList.length === 0 ? (
                  <tr><td colSpan="5" style={{ padding: "24px", textAlign: "center", color: "#94a3b8" }}>No active employee commission logs generated.</td></tr>
                ) : (
                  employeesList.map((emp, index) => (
                    <tr key={index} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "14px 16px", fontWeight: "700", color: "#0f172a" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><FaUser size={12} color="#6366f1" /> {emp.name}</div>
                        <div style={{ fontSize: "11px", color: "#94a3b8", fontFamily: "monospace", marginTop: "2px" }}>ID: {emp.idNo}</div>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ fontWeight: "600", textTransform: "capitalize" }}>{emp.role}</div>
                        <div style={{ fontSize: "12px", color: "#64748b" }}>{emp.autoPosition || 'N/A'}</div>
                      </td>
                      <td style={{ padding: "14px 16px" }}>৳{emp.baseCommission?.toLocaleString()}</td>
                      <td style={{ padding: "14px 16px", color: "#16a34a", fontWeight: "600" }}>+৳{((emp.globalPoolBonusAmount || 0) + (emp.monthlyBonusAmount || 0))?.toLocaleString()}</td>
                      <td style={{ padding: "14px 16px", fontWeight: "800", color: "#4f46e5" }}>৳{emp.netTotalEarnings?.toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* খ) ডিলার কার্ড গ্রিড ভিউ */}
        {activeTab === "dealer" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
            {dealersList.length === 0 ? (
              <div style={{ gridColumn: "1/-1", padding: "24px", textAlign: "center", color: "#94a3b8" }}>No distribution dealers qualified for targets this month.</div>
            ) : (
              dealersList.map((dlr, index) => (
                <div key={index} style={{ background: "#f8fafc", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 1px 2px 0 rgba(0,0,0,0.02)" }}>
                  
                  {/* ডিলার কার্ড হেডার */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", borderBottom: "1px dashed #f1f5f9", paddingBottom: "10px" }}>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <FaHandshake color="#10b981" size={16} />
                      </div>
                      <div>
                        <strong style={{ color: "#1e293b", fontSize: "14px", display: "block" }}>{dlr.name}</strong>
                        <span style={{ fontSize: "11px", color: "#64748b" }}>Dealer ID: {dlr.dealerId}</span>
                      </div>
                    </div>
                    {/* কোয়ালিফাইড স্ট্যাটাস ব্যাজ */}
                    <span style={{ 
                      fontSize: "11px", 
                      fontWeight: "600", 
                      padding: "3px 10px", 
                      borderRadius: "20px", 
                      backgroundColor: dlr.totalSales >= 5000 ? "#e6f4ea" : "#fce8e6", 
                      color: dlr.totalSales >= 5000 ? "#137333" : "#c5221f",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px"
                    }}>
                      {dlr.totalSales >= 5000 ? <FaCheckCircle size={10} /> : <FaExclamationCircle size={10} />}
                      {dlr.status || 'Qualified'}
                    </span>
                  </div>

                  {/* ডিলার মেটরিক্স বডি */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#64748b" }}>Monthly Sales Volume:</span>
                      <strong style={{ color: "#1e293b" }}>Tk {dlr.totalSales?.toLocaleString()}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f1f5f9", paddingTop: "8px", marginTop: "4px" }}>
                      <span style={{ fontW: "700", color: "#0f172a" }}>🤝 Commission Payout:</span>
                      <strong style={{ fontSize: "16px", color: "#10b981" }}>Tk {dlr.commission?.toLocaleString()}/-</strong>
                    </div>
                  </div>

                </div>
              ))
            )}
          </div>
        )}

        {/* 📊 সার্ভার-সাইড পেজিনেশন কন্ট্রোল বাটন প্যানেল */}
        {((activeTab === "employee" && employeesList.length > 0) || (activeTab === "dealer" && dealersList.length > 0)) && (
          <div style={{ 
            display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", 
            marginTop: "24px", padding: "14px 20px", background: "#ffffff", 
            borderRadius: "14px", border: "1px solid #e2e8f0", flexWrap: "wrap" 
          }} className="pagination-container">
            <span style={{ fontSize: "13px", fontWeight: "500", color: "#64748b" }}>
              Showing Page <span style={{ color: "#4f46e5", fontWeight: "700" }}>{currentPage}</span> of <span style={{ fontWeight: "700", color: "#1e293b" }}>{totalPages}</span>
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button 
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                style={{
                  padding: "8px 14px", border: "1px solid #cbd5e1", borderRadius: "8px",
                  background: "#ffffff", color: "#334155", fontSize: "13px", fontWeight: "600",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer", opacity: currentPage === 1 ? 0.4 : 1,
                  transition: "all 0.15s"
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
                        cursor: "pointer", transition: "all 0.15s"
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
                  padding: "8px 14px", border: "1px solid #cbd5e1", borderRadius: "8px",
                  background: "#ffffff", color: "#334155", fontSize: "13px", fontWeight: "600",
                  cursor: currentPage === totalPages ? "not-allowed" : "pointer", opacity: currentPage === totalPages ? 0.4 : 1,
                  transition: "all 0.15s"
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}

      {/* 📱 অতিরিক্ত রেসপনসিভ প্যানেল সিএসএস ফিক্স */}
      <style>{`
        @media screen and (max-width: 640px) {
          .pagination-container {
            flex-direction: column !important;
            align-items: center !important;
            text-align: center;
            gap: 10px !important;
          }
        }
      `}</style>
    </div>
    </div>
  );  
};

export default CommissionDesk;
