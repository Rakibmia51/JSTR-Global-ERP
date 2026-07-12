import React, { useState, useEffect } from "react";
import { FaFileInvoiceDollar, FaUserCheck, FaUserTie, FaCheckCircle } from "react-icons/fa";

const SalesTrackingReport = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3000/api/sales") // আপনার সঠিক এপিআই পাথ
      .then((res) => res.json())
      .then((data) => {
        setSales(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{ padding: "20px" }}>Loading Sales Analysis...</div>;

  return (
    <div style={{ padding: "16px", background: "#f8fafc", minHeight: "100vh", fontFamily: "sans-serif", boxSizing: "border-box" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
        
        {/* হেডার সেকশন */}
        <h2 style={{ color: "#0f172a", marginBottom: "4px", fontSize: "calc(18px + 0.5vw)" }}>📋 Sales Generation Ledger</h2>
        <p style={{ color: "#64748b", fontSize: "13px", marginBottom: "20px" }}>Track Sales Invoices linked to Dealers and Marketing Representatives</p>

        {/* 📱 💻 ১০০% রেসপন্সিভ ডাটা কন্টেইনার */}
        <div className="responsive-table-wrapper" style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 4px 6px rgba(0,0,0,0.02)", width: "100%" }}>
          <table className="desktop-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "#f1f5f9", color: "#475569", fontSize: "12px", fontWeight: "700", textTransform: "uppercase" }}>
                <th style={{ padding: "14px 16px" }}>Invoice / Sales</th>
                <th style={{ padding: "14px 16px" }}>🤝 Dealer Details</th>
                <th style={{ padding: "14px 16px" }}>👤 Reference Employee (MKT)</th>
                <th style={{ padding: "14px 16px" }}>Amount</th>
                <th style={{ padding: "14px 16px" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {sales.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: "30px", textAlign: "center", color: "#94a3b8", fontSize: "14px" }}>No sales transactions found.</td>
                </tr>
              ) : (
                sales.map((sale) => (
                  <tr key={sale._id} style={{ borderBottom: "1px solid #e2e8f0", transition: "background 0.2s" }} className="table-row-hover">
                    
                    {/* ১. ইনভয়েস নাম্বার ও ডেট */}
                    <td style={{ padding: "16px" }} data-label="Invoice">
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <FaFileInvoiceDollar size={18} color="#4f46e5" style={{ flexShrink: 0 }} />
                        <div style={{ minWidth: 0 }}>
                          <span style={{ fontWeight: "700", color: "#1e293b", display: "block", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{sale.invoiceNo}</span>
                          <span style={{ fontSize: "11px", color: "#94a3b8" }}>{sale.createdAt ? new Date(sale.createdAt).toLocaleDateString() : "N/A"}</span>
                        </div>
                      </div>
                    </td>

                    {/* ২. ডিলারের নাম ও ডিলার আইডি */}
                    <td style={{ padding: "16px" }} data-label="Dealer">
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <FaUserCheck color="#0ea5e9" style={{ flexShrink: 0 }} />
                        <div>
                          <span style={{ fontWeight: "600", color: "#334155", display: "block" }}>{sale.dealer?.name || "Unknown Dealer"}</span>
                          <span style={{ fontSize: "12px", color: "#64748b" }}>ID: {sale.dealer?.dealerId || "N/A"}</span>
                        </div>
                      </div>
                    </td>

                    {/* ৩. রেফারেন্স মার্কেটিং এমপ্লয়ি */}
                    <td style={{ padding: "16px" }} data-label="MKT Reference">
                      {sale.employeeInfo ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <FaUserTie color="#10b981" style={{ flexShrink: 0 }} />
                          <div>
                            <span style={{ fontWeight: "600", color: "#0f172a", display: "block" }}>{sale.employeeInfo.name}</span>
                            <span style={{ fontSize: "10px", background: "#dcfce7", color: "#15803d", padding: "1px 6px", borderRadius: "10px", fontWeight: "600", display: "inline-block" }}>
                              {sale.employeeInfo.idNo}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: "#94a3b8", fontSize: "12px", fontStyle: "italic" }}>No MKT Linked ({sale.dealer?.referenceIdNo || "N/A"})</span>
                      )}
                    </td>

                    {/* ৪. অ্যামাউন্ট */}
                    <td style={{ padding: "16px" }} data-label="Amount">
                      <span style={{ fontWeight: "700", color: "#0f172a" }}>Tk {sale.grandTotal?.toLocaleString() || 0}</span>
                      <span style={{ display: "block", fontSize: "11px", color: "#64748b" }}>via {sale.paymentMethod || "Cash"}</span>
                    </td>

                    {/* ৫. পেমেন্ট স্ট্যাটাস */}
                    <td style={{ padding: "16px" }} data-label="Status">
                      <span style={{ 
                        display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "11px", fontWeight: "600",
                        padding: "4px 10px", borderRadius: "20px",
                        background: sale.paymentStatus === "Paid" ? "#ecfdf5" : "#fff7ed",
                        color: sale.paymentStatus === "Paid" ? "#047857" : "#c2410c"
                      }}>
                        <FaCheckCircle size={10} /> {sale.paymentStatus || "Pending"}
                      </span>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* 📱 কাস্টম রেসপন্সিভ সিএসএস মিডিয়া কুয়েরি ইনজেকশন */}
      <style>{`
        .table-row-hover:hover { 
          background-color: #f8fafc; 
        }

        /* 📱 মোবাইল রেসপনসিভ ব্রেকপয়েন্ট (৭৬৮ পিক্সেল বা তার নিচে হলে লেআউট কার্ডে রূপান্তর হবে) */
        @media screen and (max-width: 768px) {
          .responsive-table-wrapper {
            border: none !important;
            box-shadow: none !important;
            background: transparent !important;
          }
          
          .desktop-table, .desktop-table thead, .desktop-table tbody, .desktop-table th, .desktop-table td, .desktop-table tr { 
            display: block; 
            width: 100%;
            box-sizing: border-box;
          }
          
          /* টেবিল হেডার মোবাইলে হাইড থাকবে */
          .desktop-table thead tr { 
            position: absolute;
            top: -9999px;
            left: -9999px;
          }
          
          /* প্রতিটা রো একেকটি সুন্দর স্বাধীন কার্ডে রূপান্তর হবে */
          .desktop-table tr { 
            background: #ffffff;
            border: 1px solid #e2e8f0 !important;
            border-radius: 14px;
            margin-bottom: 14px;
            padding: 8px 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.01), 0 2px 4px -1px rgba(0, 0, 0, 0.01);
          }
          
          .desktop-table tr:hover {
            background-color: #ffffff !important;
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
