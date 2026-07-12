import React, { useState, useEffect } from "react";
import { FaAward, FaHandshake, FaCoins, FaUserTie, FaSitemap } from "react-icons/fa";

const CommissionLedger = () => {
  const [data, setData] = useState({ summary: { grandPayoutTotal: 0, totalEmployeePayout: 0, totalDealerPayout: 0 }, dealers: [], employees: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("employee"); // employee বা dealer

  useEffect(() => {
    fetch("http://localhost:3000/api/commissions") // আপনার সঠিক ব্যাকএন্ড এন্ডপয়েন্ট দিন
      .then((res) => res.json())
      .then((resData) => {
        setData(resData);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{ padding: "40px", textAlign: "center", fontFamily: "sans-serif" }}>Calculating Real-Time Commissions...</div>;

  return (
    <div style={{ padding: "16px", background: "#f8fafc", minHeight: "100vh", fontFamily: "sans-serif", boxSizing: "border-box" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto", width: "100%" }}>
        
        {/* হেডার */}
        <div style={{ marginBottom: "24px" }}>
          <h2 style={{ color: "#0f172a", margin: "0 0 4px 0" }}>💰 ERP Commission & Incentives Desk</h2>
          <p style={{ color: "#64748b", fontSize: "13px", margin: 0 }}>Automated Gap Slabs processing with Real-Time Grand Summary</p>
        </div>

        {/* 📊 কোম্পানির মোট খরচের ৩টি কার্ড সামারি */}
        <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginBottom: "24px", boxSizing: "border-box" }}>
          <div style={{ flex: "1 1 250px", background: "linear-gradient(135deg, #1e1b4b, #312e81)", color: "#ffffff", padding: "16px 20px", borderRadius: "14px", boxShadow: "0 10px 15px -3px rgba(49, 46, 129, 0.2)" }}>
            <div style={{ fontSize: "11px", opacity: 0.8, textTransform: "uppercase", fontWeight: "600", letterSpacing: "0.5px" }}>💸 Grand Payout Volume</div>
            <div style={{ fontSize: "24px", fontWeight: "800", marginTop: "4px" }}>Tk {data.summary?.grandPayoutTotal?.toLocaleString()}/-</div>
          </div>
          <div style={{ flex: "1 1 200px", background: "#ffffff", border: "1px solid #e2e8f0", padding: "14px 18px", borderRadius: "14px" }}>
            <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: "600" }}>👥 Employee Share</div>
            <div style={{ fontSize: "18px", fontWeight: "700", color: "#4f46e5", marginTop: "2px" }}>Tk {data.summary?.totalEmployeePayout?.toLocaleString()}/-</div>
          </div>
          <div style={{ flex: "1 1 200px", background: "#ffffff", border: "1px solid #e2e8f0", padding: "14px 18px", borderRadius: "14px" }}>
            <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: "600" }}>🤝 Dealer Share</div>
            <div style={{ fontSize: "18px", fontWeight: "700", color: "#10b981", marginTop: "2px" }}>Tk {data.summary?.totalDealerPayout?.toLocaleString()}/-</div>
          </div>
        </div>

        {/* ট্যাব কন্ট্রোলার বোতাম */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <button 
            onClick={() => setActiveTab("employee")}
            style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "none", cursor: "pointer", fontWeight: "700", fontSize: "14px", backgroundColor: activeTab === "employee" ? "#4f46e5" : "#ffffff", color: activeTab === "employee" ? "#ffffff" : "#475569", boxShadow: "0 2px 4px rgba(0,0,0,0.02)", transition: "all 0.2s" }}
          >
            👥 Employee Commissions
          </button>
          <button 
            onClick={() => setActiveTab("dealer")}
            style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "none", cursor: "pointer", fontWeight: "700", fontSize: "14px", backgroundColor: activeTab === "dealer" ? "#4f46e5" : "#ffffff", color: activeTab === "dealer" ? "#ffffff" : "#475569", boxShadow: "0 2px 4px rgba(0,0,0,0.02)", transition: "all 0.2s" }}
          >
            🤝 Dealer Payouts
          </button>
        </div>

        {/* ১. এমপ্লয়ি কমিশন কার্ড লিস্ট */}
        {activeTab === "employee" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {data.employees.length === 0 ? (
              <div style={{ padding: "30px", background: "#fff", borderRadius: "12px", textAlign: "center", color: "#94a3b8" }}>No active employee distributions qualified.</div>
            ) : (
              data.employees.map((emp) => (
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
                    <span style={{ fontSize: "10px", fontWeight: "700", background: "#eff6ff", color: "#2563eb", padding: "2px 8px", borderRadius: "12px" }}>{emp.position}</span>
                  </div>

                  {/* কার্ড মেকট্রিক্স */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#64748b" }}>Team Sales Achieve:</span>
                      <strong style={{ color: "#1e293b" }}>Tk {emp.totalSalesAchieved?.toLocaleString()}</strong>
                    </div>
                    
                    {/* গ্যাপ ব্রেকডাউন */}
                    <div style={{ background: "#f8fafc", padding: "8px 12px", borderRadius: "8px", margin: "4px 0", fontSize: "12px", display: "flex", flexDirection: "column", gap: "4px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", color: "#475569" }}>
                        <span>Earned Gap Commission:</span>
                        <span>Tk {emp.baseCommission?.toLocaleString()}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", color: "#475569" }}>
                        <span>Sales Share Bonus:</span>
                        <span>Tk {emp.salesShareBonus?.toLocaleString()}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", color: "#475569" }}>
                        <span>Performance Incentive:</span>
                        <span>Tk {emp.performanceBonus?.toLocaleString()}</span>
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f1f5f9", paddingTop: "8px" }}>
                      <span style={{ fontWeight: "700", color: "#0f172a", display: "flex", alignItems: "center", gap: "4px" }}><FaCoins color="#eab308" /> Net Commission:</span>
                      <strong style={{ fontSize: "16px", color: "#4f46e5" }}>Tk {emp.totalEarned?.toLocaleString()}/-</strong>
                    </div>
                  </div>

                </div>
              ))
            )}
          </div>
        )}

        {/* ২. ডিলার কমিশন কার্ড লিস্ট */}
        {activeTab === "dealer" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {data.dealers.length === 0 ? (
              <div style={{ padding: "30px", background: "#fff", borderRadius: "12px", textAlign: "center", color: "#94a3b8" }}>No active dealer payout clocked.</div>
            ) : (
              data.dealers.map((dlr) => (
                <div key={dlr._id} style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "16px", boxShadow: "0 2px 4px rgba(0,0,0,0.01)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <FaHandshake color="#0ea5e9" />
                      <div>
                        <strong style={{ color: "#1e293b", fontSize: "14px" }}>{dlr.name}</strong>
                        <span style={{ display: "block", fontSize: "11px", color: "#94a3b8" }}>ID: {dlr.dealerId}</span>
                      </div>
                    </div>
                    <span style={{ fontSize: "11px", fontWeight: "600", padding: "2px 8px", borderRadius: "6px", background: dlr.totalSales >= 50000 ? "#dcfce7" : "#fef3c7", color: dlr.totalSales >= 50000 ? "#16a34a" : "#d97706" }}>
                      {dlr.totalSales >= 50000 ? "Slab: 7%" : "Slab: 5%"}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#475569" }}>
                    <span>Total Sales Booked:</span>
                    <span style={{ fontWeight: "600" }}>Tk {dlr.totalSales?.toLocaleString()}</span>
                  </div>
                    
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#475569", marginTop: "6px" }}>
                      <span>Calculated Commission:</span>
                      <span style={{ fontWeight: "700", color: "#10b981" }}>Tk {dlr.calculatedCommission?.toLocaleString()}</span>      
                    </div>
                        
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#475569", marginTop: "6px", borderTop: "1px dashed #f1f5f9", paddingTop: "6px" }}><span style={{ fontWeight: "600", color: "#0f172a" }}>Payout Amount:<strong style={{ color: "#10b981", fontSize: "15px" }}>Tk {dlr.commission?.toLocaleString()}/-</strong></span>
                    </div>
             </div>
             )))}

            </div>
        )}

      </div>
    </div>
  );
}

export default CommissionLedger;