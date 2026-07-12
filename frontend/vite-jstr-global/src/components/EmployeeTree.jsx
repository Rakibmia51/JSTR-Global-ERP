
// ভাগ ১: ইম্পোর্ট এবং মোবাইল ফ্রেন্ডলি TreeBranch

import { useEffect, useState } from "react";
import { 
  FaChevronRight, FaChevronDown, FaUserAlt, FaUsers, 
  FaSearch, FaSitemap, FaBuilding, FaUserTie, FaNetworkWired 
} from "react-icons/fa";

const TreeBranch = ({ node, searchTerm, level = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = node.children && node.children.length > 0;

  // সার্চ টার্ম ম্যাচিং লজিক
  const matchesSearch = 
    node.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    node.idNo?.toLowerCase().includes(searchTerm.toLowerCase());

  // চাইল্ড নোড সার্চ ট্র্যাকিং
  const hasMatchingChild = (currentNode) => {
    if (!searchTerm) return false;
    const directMatch = currentNode.children?.some(child => 
      child.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      child.idNo?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (directMatch) return true;
    return currentNode.children?.some(child => hasMatchingChild(child)) || false;
  };

  const childMatches = hasMatchingChild(node);
  const shouldRender = matchesSearch || childMatches;

  if (searchTerm && !shouldRender) return null;

  const isExpanded = searchTerm ? childMatches || matchesSearch : isOpen;

// 💡 পজিশন অনুযায়ী ডাইনামিক প্রিমিয়াম কালার ব্যাজ নির্ধারণ
 const getPositionBadgeStyle = (pos) => {
    const p = pos?.toUpperCase()?.trim(); // স্পেস এবং কেস সেন্সিটিভিটি ফিক্স
    
    switch (p) {
      case "ED": 
        return { bg: "#faf5ff", text: "#a855f7", border: "#d8b4fe" };
      case "NSM": 
        return { bg: "#fff7ed", text: "#f97316", border: "#ffedd5" };
      case "SM": 
        return { bg: "#f0fdf4", text: "#16a34a", border: "#bbf7d0" };
      case "SDSM": // 💡 SDSM-এর জন্য বিশেষ প্রিমিয়াম ডার্ক পার্পেল/টিয়াল ব্যাজ
        return { bg: "#f0fdfa", text: "#0d9488", border: "#99f6e4" };
      case "DSM": 
        return { bg: "#ecfdf5", text: "#059669", border: "#a7f3d0" };
      case "RSM": 
        return { bg: "#eff6ff", text: "#2563eb", border: "#bfdbfe" };
      case "AM": 
        return { bg: "#f0fdf4", text: "#15803d", border: "#bbf7d0" };
      default: 
        return { bg: "#f8fafc", text: "#64748b", border: "#cbd5e1" };
    }
  };
 // node.position (যা এপিআই থেকে জেনারেট হচ্ছে) ব্যবহার করা হচ্ছে
  const badge = getPositionBadgeStyle(node.position);

 return (
    <div style={{ margin: "8px 0", position: "relative", boxSizing: "border-box", width: "100%" }}>
      {/* এমপ্লয়ি কার্ড ডিজাইন */}
      <div
        onClick={() => hasChildren && setIsOpen(!isOpen)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 12px",
          background: matchesSearch && searchTerm ? "#f0fdf4" : "#ffffff",
          border: matchesSearch && searchTerm ? "2px solid #10b981" : "1px solid #e2e8f0",
          borderRadius: "12px",
          cursor: hasChildren ? "pointer" : "default",
          transition: "all 0.3s ease",
          boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
          width: "100%",
          boxSizing: "border-box",
          minWidth: 0
        }}
        className="tree-card-hover"
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0, flex1: 1 }}>
          {/* ড্রপডাউন অ্যারো */}
          <span style={{ color: "#94a3b8", display: "flex", flexShrink: 0 }}>
            {hasChildren ? (isExpanded ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />) : <span style={{ width: "4px", height: "4px", background: "#cbd5e1", borderRadius: "50%", marginLeft: "4px" }} />}
          </span>

          {/* অবতার আইকন */}
          <div style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            background: hasChildren ? "linear-gradient(135deg, #4f46e5, #3730a3)" : "linear-gradient(135deg, #0ea5e9, #0284c7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            flexShrink: 0
          }}>
            {hasChildren ? <FaUserTie size={12} /> : <FaUserAlt size={11} />}
          </div>

          {/* নাম, আইডি, পজিশন এবং ডাবল সেলস ডিসপ্লে */}
          <div style={{ display: "flex", flexDirection: "column", minWidth: 0, flex1: 1 }}>
            <span style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {node.name}
            </span>
            
            <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", marginTop: "4px" }}>
              {/* কাস্টম আইডি */}
              <span style={{ fontSize: "10px", color: "#64748b", fontWeight: "500" }}>{node.idNo}</span>
              
              {/* 💡 ফিক্সড কন্ডিশন: টেক্সট পুরোপুরি .toUpperCase() আকারে ডাইনামিকালি প্রিন্ট হবে */}
              <span style={{ 
                fontSize: "9px", 
                fontWeight: "700", 
                padding: "1px 6px", 
                borderRadius: "10px", 
                backgroundColor: badge.bg, 
                color: badge.text,
                border: `1px solid ${badge.border}`,
                textTransform: "uppercase"
              }}>{node.position ? node.position.toUpperCase() : "REPRESENTATIVE"}</span>

              {/* চলতি মাসের সেলস কাউন্টার (গ্রিন কালার ট্যাগ) */}
              {node.thisMonthSalesAchieved > 0 && (
                <span style={{ fontSize: "10px", color: "#16a34a", fontWeight: "700", background: "#f0fdf4", padding: "1px 6px", borderRadius: "6px", border: "1px solid #bbf7d0" }}>
                  Month: Tk {node.thisMonthSalesAchieved.toLocaleString()}/-
                </span>
              )}

              {/* সর্বকালের মোট সেলস কাউন্টার (ব্লু কালার ট্যাগ) */}
              {node.totalSalesAchieved > 0 && (
                <span style={{ fontSize: "10px", color: "#2563eb", fontWeight: "700", background: "#eff6ff", padding: "1px 6px", borderRadius: "6px", border: "1px solid #bfdbfe" }}>
                  Total: Tk {node.totalSalesAchieved.toLocaleString()}/-
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ডাইরেক্ট টিম কাউন্টার ব্যাজ */}
        {hasChildren && (
          <div style={{ display: "flex", alignItems: "center", gap: "3px", background: "#f1f5f9", padding: "3px 6px", borderRadius: "6px", flexShrink: 0, marginLeft: "6px" }}>
            <FaUsers size={11} color="#475569" />
            <span style={{ fontSize: "10px", fontWeight: "700", color: "#1e293b" }}>{node.children.length}</span>
          </div>
        )}
      </div>

      {/* চাইল্ড লুপ */}
      {hasChildren && isExpanded && (
        <div style={{ marginLeft: "12px", paddingLeft: "10px", borderLeft: "1.5px dashed #e2e8f0", boxSizing: "border-box", width: "calc(100% - 12px)" }}>
          {node.children.map((child) => (
            <TreeBranch key={child._id} node={child} searchTerm={searchTerm} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

// ==========================================
// भाग ২: মেইন কন্টেইনার ও ফ্লেক্সিবল সাইডবার
// ==========================================
const EmployeeHierarchyTree = () => {
  const [treeData, setTreeData] = useState([]);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3000/api/users/tree")
      .then((res) => res.json())
      .then((data) => {
        setTreeData(data);

        let count = 0;
        const countAllNodes = (nodesList) => {
          nodesList.forEach((emp) => {
            count++;
            if (emp.children && emp.children.length > 0) {
              countAllNodes(emp.children);
            }
          });
        };
        countAllNodes(data);
        setTotalEmployees(count);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading tree:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", width: "100vw", justifyContent: "center", alignItems: "center", background: "#f8fafc", fontFamily: "sans-serif" }}>
        <div style={{ width: "36px", height: "36px", border: "4px solid #e2e8f0", borderTopColor: "#4f46e5", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <p style={{ marginTop: "14px", color: "#64748b", fontWeight: "500" }}>Building ERP Tree Hierarchy...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    // মেইন লেআউট ক্লাস: 'main-container-responsive' (CSS নিচে দেওয়া আছে)
    <div className="main-container-responsive" style={{ display: "flex", height: "100vh", width: "100vw", backgroundColor: "#f8fafc", boxSizing: "border-box", fontFamily: "'Inter', sans-serif", overflow: "hidden" }}>
      
      {/* 💻 কন্ট্রোল সাইডবার প্যানেল */}
      <div className="sidebar-responsive" style={{ background: "#ffffff", borderRight: "1px solid #e2e8f0", padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between", boxSizing: "border-box" }}>
        <div>
          {/* ব্র্যান্ড হেডার */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
            <div style={{ background: "linear-gradient(135deg, #4f46e5, #3730a3)", borderRadius: "10px", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>
              <FaBuilding size={18} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#0f172a" }}>JSTR Global</h2>
              <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase" }}>ERP Enterprise</span>
            </div>
          </div>

          {/* সার্চ ফিল্টার বক্স */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#475569", textTransform: "uppercase", marginBottom: "6px", letterSpacing: "0.5px" }}>Search Hierarchy</label>
            <div style={{ position: "relative" }}>
              <FaSearch style={{ position: "absolute", left: "14px", top: "14px", color: "#94a3b8" }} />
              <input
                type="text"
                placeholder="Search Name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: "100%", padding: "12px 14px 12px 42px", border: "1px solid #cbd5e1", borderRadius: "10px", fontSize: "14px", outline: "none", boxSizing: "border-box", background: "#f8fafc" }}
                className="input-focus-effect"
              />
            </div>
          </div>

          {/* কাউন্টার কার্ড */}
          <div style={{ background: "linear-gradient(135deg, #4f46e5, #6366f1)", padding: "16px 20px", borderRadius: "14px", color: "#ffffff", boxShadow: "0 10px 15px -5px rgba(79, 70, 229, 0.2)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <FaSitemap size={20} />
              <div>
                <div style={{ fontSize: "11px", opacity: 0.8, textTransform: "uppercase", fontWeight: "600" }}>Total Members</div>
                <div style={{ fontSize: "22px", fontWeight: "800", marginTop: "2px" }}>{totalEmployees} <span style={{ fontSize: "12px", fontWeight: "400", opacity: 0.9 }}>Active</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* বটম ফুটার নোড */}
        <div className="sidebar-footer-hidden" style={{ display: "flex", alignItems: "center", gap: "8px", color: "#94a3b8", fontSize: "12px", fontWeight: "500", marginTop: "20px" }}>
          <FaNetworkWired /> <span>Real-Time Sync</span>
        </div>
      </div>


    {/* ভাগ ৩: মেইন ট্রি প্যানেল এবং গ্লোবাল কাস্টম CSS */}
      {/* 🌳 ডানপাশের মেইন ফুল-স্ক্রিন ইন্টারঅ্যাক্টিভ ট্রি ভিউ প্যানেল */}
      <div style={{ flexGrow: 1, padding: "24px", overflowY: "auto", boxSizing: "border-box", background: "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)" }} className="custom-tree-scrollbar">
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          
          {/* মেইন ভিউ হেডার */}
          <div style={{ marginBottom: "20px" }}>
            <h1 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: "#0f172a", letterSpacing: "-0.5px" }}>Corporate Tree Topology</h1>
            <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#64748b" }}>Click parent rows to navigate team members</p>
          </div>

          {/* রুট নোড কন্টেইনার */}
          <div className="tree-body-responsive" style={{ background: "rgba(255, 255, 255, 0.7)", backdropFilter: "blur(12px)", border: "1px solid #ffffff", borderRadius: "16px", padding: "16px", boxShadow: "0 10px 15px -5px rgba(0, 0, 0, 0.02)" }}>
            {treeData.length === 0 ? (
              <div style={{ padding: "20px", textAlign: "center", color: "#94a3b8", fontSize: "14px" }}>No structural hierarchies found.</div>
            ) : (
              treeData.map((rootNode) => (
                <TreeBranch key={rootNode._id} node={rootNode} searchTerm={searchTerm} />
              ))
            )}
          </div>
        </div>
      </div>

      {/* 📱 💻 ১০০% রেসপন্সিভ গ্লোবাল সিএসএস মিডিয়া কুয়েরি ইনজেকশন */}
      <style>{`
        /* ডিফল্ট পিসি/ডেস্কটপ ডিজাইন (২টি কলাম পাশাপাশি) */
        .sidebar-responsive {
          width: 320px;
          min-width: 320px;
        }

        /* 📱 মোবাইল ও ট্যাবলেট রেসপন্সিভ ব্রেকপয়েন্ট (৭৬৮ পিক্সেলের নিচে হলে ১ কলাম হবে) */
        @media (max-width: 768px) {
          .main-container-responsive {
            flex-direction: column !important; /* ২ কলাম ভেঙে ১ কলামে রূপান্তর */
            overflow-y: auto !important;
          }
          .sidebar-responsive {
            width: 100% !important;
            min-width: 100% !important;
            height: auto !important;
            border-right: none !important;
            border-bottom: 1px solid #e2e8f0 !important;
            padding: 16px !important;
          }
          .tree-body-responsive {
            padding: 12px !important;
            background: #ffffff !important;
          }
          .sidebar-footer-hidden {
            display: none !important; /* মোবাইলে ফুটার হাইড */
          }
          body, html {
            overflow-x: hidden !important;
          }
        }

        /* সুন্দর হোভার ও ফোকাস ইফেক্টসমূহ */
        .tree-card-hover:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05) !important;
          border-color: #cbd5e1 !important;
        }
        .input-focus-effect:focus {
          border-color: #6366f1 !important;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1) !important;
          background: #ffffff !important;
        }
        .custom-tree-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-tree-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-tree-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
      `}</style>

    </div>
  );
};

export default EmployeeHierarchyTree;
