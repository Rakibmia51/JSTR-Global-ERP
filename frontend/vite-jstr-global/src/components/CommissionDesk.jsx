import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  FaUserTie, 
  FaCoins, 
  FaHandshake, 
  FaCheckCircle, 
  FaExclamationCircle, 
  FaFilter, 
  FaSpinner 
} from "react-icons/fa";

export default function CommissionDesk() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("employee");
  
  // ফিল্টার স্টেট (ডিফল্ট কারেন্ট মাস ও বছর)
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  // ব্যাকএন্ড এপিআই থেকে ডেটা ফেচ করার ফাংশন
  const fetchLedgerData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:3000/api/commissions?year=${year}&month=${month}`);
      setData(response.data);
      console.log("Fetched Ledger Data:", response.data);
    } catch (error) {
      console.error("Error fetching ledger data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedgerData();
  }, [year, month]);

  // 🎯 ১. নেস্টেড ট্রি থেকে রিকার্সিভলি সব এমপ্লয়িকে লিনিয়ার অ্যারেতে কনভার্ট করার হেল্পার (Tree Flattener)
  const flattenEmployees = (nodes) => {
    let result = [];
    if (!nodes) return result;
    
    nodes.forEach(node => {
      // children অ্যারে আলাদা করে বাকি সব এমপ্লয়ি ডাটা কপি করা
      const { children, ...employeeData } = node;
      result.push(employeeData);
      
      // যদি এই নোডের অধীনে কোনো চাইল্ড থাকে, তবে তাদেরও একই ফাংশনে রিকার্সন চালানো
      if (node.children && node.children.length > 0) {
        result = result.concat(flattenEmployees(node.children));
      }
    });
    return result;
  };

  // ২. আপনার ব্যাকএন্ড ডাটা থেকে সম্পূর্ণ ফ্ল্যাট বা লিনিয়ার লিস্ট জেনারেট করুন
  const allEmployeesList = data?.data ? flattenEmployees(data.data) : [];
  //console.log(allEmployeesList)

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#f8fafc" }}>
        <FaSpinner size={30} color="#4f46e5" className="animate-spin" style={{ animation: "spin 1s linear infinite" }} />
        <span style={{ fontSize: "14px", color: "#64748b", fontFamily: "sans-serif" }}>Processing ERP Slabs...</span>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ padding: "16px", background: "#f8fafc", minHeight: "100vh", fontFamily: "sans-serif", boxSizing: "border-box" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto", width: "100%" }}>
        
        {/* হেডার এবং মান্থলি ফিল্টার ড্রপডাউন */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "24px" }}>
          <div>
            <h2 style={{ color: "#0f172a", margin: "0 0 4px 0" }}>💰 ERP Commission Desk</h2>
            <p style={{ color: "#64748b", fontSize: "13px", margin: 0 }}>Automated Gap Slabs processing with Real-Time Grand Summary</p>
          </div>
          
          {/* 📅 ডাইনামিক ডেট ফিল্টার কন্ট্রোল */}
          <div style={{ display: "flex", gap: "8px", background: "#fff", padding: "6px 12px", borderRadius: "10px", border: "1px solid #e2e8f0", alignItems: "center" }}>
            <FaFilter color="#64748b" size={12} />
            <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))} style={{ border: "none", outline: "none", fontSize: "13px", fontWeight: "600", color: "#334155", cursor: "pointer" }}>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString("en-US", { month: "long" })}</option>
              ))}
            </select>
            <select value={year} onChange={(e) => setYear(parseInt(e.target.value))} style={{ border: "none", outline: "none", fontSize: "13px", fontWeight: "600", color: "#334155", cursor: "pointer" }}>
              {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {/* 📊 কোম্পানির মোট খরচের ৩টি কার্ড সামারি */}
        <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginBottom: "24px", boxSizing: "border-box" }}>
          <div style={{ flex: "1 1 250px", background: "linear-gradient(135deg, #1e1b4b, #312e81)", color: "#ffffff", padding: "16px 20px", borderRadius: "14px", boxShadow: "0 10px 15px -3px rgba(49, 46, 129, 0.2)" }}>
            <div style={{ fontSize: "11px", opacity: 0.8, textTransform: "uppercase", fontWeight: "600", letterSpacing: "0.5px" }}>💸 Grand Payout Volume</div>
            <div style={{ fontSize: "24px", fontWeight: "800", marginTop: "4px" }}>Tk {data?.summary?.grandPayoutTotal?.toLocaleString() || 0}/-</div>
          </div>
          <div style={{ flex: "1 1 200px", background: "#ffffff", border: "1px solid #e2e8f0", padding: "14px 18px", borderRadius: "14px" }}>
            <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: "600" }}>👥 Employee Share</div>
            <div style={{ fontSize: "18px", fontWeight: "700", color: "#4f46e5", marginTop: "2px" }}>Tk {data?.summary?.totalEmployeePayout?.toLocaleString() || 0}/-</div>
          </div>
          <div style={{ flex: "1 1 200px", background: "#ffffff", border: "1px solid #e2e8f0", padding: "14px 18px", borderRadius: "14px" }}>
            <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: "600" }}>🤝 Dealer Share</div>
            <div style={{ fontSize: "18px", fontWeight: "700", color: "#10b981", marginTop: "2px" }}>Tk {data?.summary?.totalDealerPayout?.toLocaleString() || 0}/-</div>
          </div>
        </div>

        {/* ট্যাব কন্ট্রোলার বোতাম */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <button onClick={() => setActiveTab("employee")} style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "none", cursor: "pointer", fontWeight: "700", fontSize: "14px", backgroundColor: activeTab === "employee" ? "#4f46e5" : "#ffffff", color: activeTab === "employee" ? "#ffffff" : "#475569", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
            👥 Employee ({allEmployeesList.length})
          </button>
          <button onClick={() => setActiveTab("dealer")} style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "none", cursor: "pointer", fontWeight: "700", fontSize: "14px", backgroundColor: activeTab === "dealer" ? "#4f46e5" : "#ffffff", color: activeTab === "dealer" ? "#ffffff" : "#475569", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
            🤝 Dealer ({data?.dealers?.length || 0})
          </button>
        </div>

        {/* ১. এমপ্লয়ি কমিশন কার্ড লিস্ট */}
        {activeTab === "employee" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {allEmployeesList.length === 0 ? (
              <div style={{ padding: "30px", background: "#fff", borderRadius: "12px", textAlign: "center", color: "#94a3b8" }}>No active employee distributions qualified.</div>
            ) : (
              allEmployeesList.map((emp) => {
                // নেট কমিশন = গ্যাপ কমিশন + গ্লোবাল পুল বোনাস + পারফরম্যান্স ইনসেন্টিভ
                const netCommission = (emp.baseCommission || 0) + (emp.globalPoolBonusAmount || 0) + (emp.monthlyBonusAmount || 0);
                
                return (
                  <div key={emp._id} style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "16px", boxShadow: "0 2px 4px rgba(0,0,0,0.01)" }}>
                    
                    {/* কার্ড হেডার */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px dashed #f1f5f9", paddingBottom: "10px", marginBottom: "10px" }}>
                      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", color: "#4f46e5" }}><FaUserTie size={14} /></div>
                        <div>
                          <strong style={{ display: "block", color: "#0f172a", fontSize: "14px" }}>{emp.name}</strong>
                          <span style={{ fontSize: "11px", color: "#64748b" }}>ID: {emp.idNo}</span>
                        </div>
                      </div>
                      <span style={{ fontSize: "10px", fontWeight: "700", background: "#eff6ff", color: "#2563eb", padding: "2px 8px", borderRadius: "12px" }}>{emp.position || emp.autoPosition}</span>
                    </div>

                    {/* কার্ড মেটরিক্স */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", fontFamily: "sans-serif" }}>
                      
                      <div style={{ color: "#64748b" }}>Lifetime Sales Achieve:</div>
                      <strong style={{ color: "#1e293b", fontSize: "14px", marginBottom: "4px" }}>Tk {emp.totalSalesAchieved?.toLocaleString()}</strong>

                      <div style={{ color: "#64748b" }}>This Month Sales Volume:</div>
                      <strong style={{ color: "#1e293b", fontSize: "14px", marginBottom: "4px" }}>Tk {emp.thisMonthSalesAchieved?.toLocaleString()}</strong>

                      <div style={{ color: "#64748b" }}>Earned Gap Commission:</div>
                      <strong style={{ color: "#1e293b", fontSize: "14px", marginBottom: "4px" }}>Tk {emp.baseCommission?.toLocaleString()}</strong>

                      <div style={{ color: "#64748b" }}>Global Pool Shared ({emp.earnedPools?.join(", ") || "None"}):</div>
                      <strong style={{ color: "#1e293b", fontSize: "14px", marginBottom: "4px" }}>Tk {emp.globalPoolBonusAmount?.toLocaleString()}</strong>

                      <div style={{ color: "#64748b" }}>Performance Incentive ({((emp.performanceBonusRate || 0) * 100).toFixed(2)}%):</div>
                      <strong style={{ color: "#1e293b", fontSize: "14px", marginBottom: "8px" }}>Tk {emp.monthlyBonusAmount?.toLocaleString()}</strong>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f1f5f9", paddingTop: "8px" }}>
                        <span style={{ fontWeight: "700", color: "#0f172a", display: "flex", alignItems: "center", gap: "4px" }}>
                          <FaCoins color="#eab308" /> Net Commission:
                        </span>
                        <strong style={{ fontSize: "16px", color: "#4f46e5" }}>Tk {netCommission.toLocaleString()}/-</strong>
                      </div>

                    </div>


                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ২. ডিলার কমিশন কার্ড লিস্ট */}
        {activeTab === "dealer" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {!data?.dealers || data.dealers.length === 0 ? (
              <div style={{ padding: "30px", background: "#fff", borderRadius: "12px", textAlign: "center", color: "#94a3b8" }}>No active dealer payout clocked.</div>
            ) : (
              data.dealers.map((dlr) => (
                <div key={dlr._id} style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "16px", boxShadow: "0 2px 4px rgba(0,0,0,0.01)" }}>
                  
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
                      {dlr.status}
                    </span>
                  </div>

                  {/* ডিলার মেটরিক্স বডি */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#64748b" }}>Monthly Sales Volume:</span>
                      <strong style={{ color: "#1e293b" }}>Tk {dlr.totalSales?.toLocaleString()}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f1f5f9", paddingTop: "8px", marginTop: "4px" }}>
                      <span style={{ fontWeight: "700", color: "#0f172a" }}>🤝 Commission Payout:</span>
                      <strong style={{ fontSize: "16px", color: "#10b981" }}>Tk {dlr.commission?.toLocaleString()}/-</strong>
                    </div>
                  </div>

                </div>
              ))
            )}
          </div>
        )}

      </div>
    </div>
  );
}

