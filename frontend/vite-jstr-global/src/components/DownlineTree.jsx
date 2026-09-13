
// 1st version of getMyDownlineTree function
// import { useState, useEffect } from 'react';
// import API from '../api'; // আপনার তৈরি করা অ্যাক্সিওস/এপিআই ক্লায়েন্ট পাথ
// import { Network, Users, ChevronRight, ChevronDown, User, RefreshCw, Award, TrendingUp, BarChart3 } from 'lucide-react';

// // 🌳 রিকার্সিভ চাইল্ড নোড রেন্ডারার সাব-কম্পোনেন্ট (প্রতিটি ডাউনলাইন মেম্বারের কার্ড)
// const TreeNode = ({ node }) => {
//   // 🔒 ফিক্স: ডিফল্টভাবে ট্রি ক্লোজ বা বন্ধ রাখার জন্য স্টেটটি 'false' করা হলো
//   const [isExpanded, setIsExpanded] = useState(false);
//   const hasChildren = node.children && node.children.length > 0;

//   return (
//     <div className="ml-6 border-l-2 border-slate-200/80 pl-4 my-2 relative">
//       {/* কানেক্টিং ডট লিংক */}
//       <div className="absolute -left-[7px] top-4 w-3 h-3 rounded-full bg-slate-300 border-2 border-white"></div>
      
//       <div className="bg-white hover:bg-slate-50 border border-slate-200/70 p-4 rounded-2xl w-full sm:w-80 shadow-sm transition-all">
//         <div className="flex items-center gap-2 mb-2">
//           {hasChildren ? (
//             <button 
//               onClick={() => setIsExpanded(!isExpanded)}
//               className="p-1 hover:bg-slate-100 rounded text-slate-500 transition-colors"
//             >
//               {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
//             </button>
//           ) : (
//             <div className="p-1 text-slate-300"><User size={14} /></div>
//           )}

//           <div className="flex-1">
//             <div className="font-bold text-slate-800 text-xs sm:text-sm">{node.name}</div>
//             <div className="text-[10px] text-indigo-500 font-mono font-bold">{node.idNo}</div>
//           </div>
          
//           <span className="px-2 py-0.5 bg-brand/10 text-brand-dark font-black rounded text-[9px] uppercase">
//             {node.autoPosition || 'SR'}
//           </span>
//         </div>

//         {/* 📊 ডাউনলাইন চাইল্ড মেম্বারদের সেলস বিবরণী */}
//         <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100 text-[10px] font-semibold text-slate-500">
//           <div className="bg-slate-50 p-1.5 rounded-lg">
//             <span className="text-slate-400 block text-[9px] uppercase tracking-tight">This Month</span>
//             <span className="text-slate-700 font-bold">৳{node.thisMonthSalesVolume?.toLocaleString()}</span>
//           </div>
//           <div className="bg-slate-50 p-1.5 rounded-lg">
//             <span className="text-slate-400 block text-[9px] uppercase tracking-tight">Lifetime Volume</span>
//             <span className="text-slate-700 font-bold">৳{node.totalSalesVolume?.toLocaleString()}</span>
//           </div>
//         </div>
//       </div>

//       {/* চাইল্ড জেনারেশন রিকার্সন রেন্ডার (ক্লিক করলে ওপেন হবে) */}
//       {hasChildren && isExpanded && (
//         <div className="mt-2 transition-all">
//           {node.children.map(child => (
//             <TreeNode key={child.idNo} node={child} />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// // 🖥️ মেইন ডাউনলাইন ট্রি স্ক্রিন (মেইন কম্পোনেন্ট)
// const DownlineTree = () => {
//   const userIdNo = localStorage.getItem('userIdNo') || 'MKT-0001';
//   const [treeData, setTreeData] = useState([]);
//   const [loading, setLoading] = useState(false);

//   // নিজের মেইন প্রোফাইল ও সেলস মেটা স্টেট
//   const [myProfileStats, setMyProfileStats] = useState({
//     position: 'SALES REPRESENTATIVE',
//     thisMonthSalesAchieved: 0,
//     totalSalesAchieved: 0
//   });

//   // গ্লোবাল ট্রি থেকে লগইন করা সুনির্দিষ্ট ইউজারের সাব-ট্রি খুঁজে বের করার অ্যালগরিদম
//   const findUserSubTree = (nodes, targetId) => {
//     for (let node of nodes) {
//       if (node.idNo === targetId) return node;
//       if (node.children && node.children.length > 0) {
//         const found = findUserSubTree(node.children, targetId);
//         if (found) return found;
//       }
//     }
//     return null;
//   };

//   const fetchMyDownlineTree = async () => {
//     setLoading(true);
//     try {
//       const response = await API.get('/users/tree');
//       const responseData = response.data;

//       const rawTreeArray = Array.isArray(responseData) ? responseData : responseData.tree || [];

//       if (rawTreeArray.length > 0) {
//         const mySubTree = findUserSubTree(rawTreeArray, userIdNo);

//         if (mySubTree) {
//           // 🔒 মেইন রুট বা নিজের প্রথম লেভেলের চাইল্ডদের যেন দেখতে পাওয়া যায়, তাই রুট নোডের children সরাসরি পাঠানো হলো
//           setTreeData([mySubTree]); 
          
//           setMyProfileStats({
//             position: mySubTree.autoPosition || 'SALES REPRESENTATIVE',
//             thisMonthSalesAchieved: mySubTree.thisMonthSalesVolume || 0,
//             totalSalesAchieved: mySubTree.totalSalesVolume || 0
//           });
//         } else {
//           setTreeData(rawTreeArray);
//           setMyProfileStats({
//             position: rawTreeArray.autoPosition || 'SALES REPRESENTATIVE',
//             thisMonthSalesAchieved: rawTreeArray.thisMonthSalesVolume || 0,
//             totalSalesAchieved: rawTreeArray.totalSalesVolume || 0
//           });
//         }
//       }
//     } catch (error) {
//       console.error("Failed to load network genealogy tree:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchMyDownlineTree();
//   }, [userIdNo]);

//   return (
//     <div className="p-6 bg-slate-50 min-h-screen font-sans">
      
//       {/* হেডার */}
//       <div className="mb-6">
//         <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
//           <Network className="text-brand" size={26} />
//           My Downline Genealogy Tree
//         </h2>
//         <p className="text-xs text-slate-500 mt-1">📊 আপনার অর্গানাইজেশনাল টিম লিংকের নেস্টেড জেনারেশন ট্রি চার্ট কাঠামো।</p>
//       </div>

//       {/* টপ ৩টি পার্সোনাল প্রোফাইল ও সেলস কার্ড গ্রিড */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        
//         {/* কার্ড ১: নিজের কারেন্ট পজিশন / র‍্যাংক */}
//         <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
//           <div className="space-y-1">
//             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">My Current Rank</span>
//             <h3 className="text-xl font-black text-slate-800 tracking-wide uppercase">
//               {loading ? <RefreshCw className="animate-spin text-brand" size={16} /> : `Rank: ${myProfileStats.position}`}
//             </h3>
//           </div>
//           <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-xl">
//             <Award size={20} />
//           </div>
//         </div>

//         {/* কার্ড ২: চলতি মাসের মোট টিম সেলস ভলিউম */}
//         <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
//           <div className="space-y-1">
//             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Team Sales (This Month)</span>
//             <h3 className="text-2xl font-black text-slate-800">
//               {loading ? <RefreshCw className="animate-spin text-brand" size={16} /> : `৳${myProfileStats.thisMonthSalesAchieved?.toLocaleString()}`}
//             </h3>
//           </div>
//           <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl">
//             <TrendingUp size={20} />
//           </div>
//         </div>

//         {/* কার্ড ৩: সর্বমোট টিম সেলস ভলিউম */}
//         <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
//           <div className="space-y-1">
//             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Sales Volume (Lifetime)</span>
//             <h3 className="text-2xl font-black text-slate-800">
//               {loading ? <RefreshCw className="animate-spin text-brand" size={16} /> : `৳${myProfileStats.totalSalesAchieved?.toLocaleString()}`}
//             </h3>
//           </div>
//           <div className="p-3.5 bg-amber-50 text-amber-600 rounded-xl">
//             <BarChart3 size={20} />
//           </div>
//         </div>

//       </div>

//       {/* মেইন চার্ট কন্টেইনার এরিয়া */}
//       <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm min-h-[400px] overflow-x-auto">
//         <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
//           <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
//             <Users size={14} className="text-brand" /> Team Hierarchy View
//           </span>
//           <button 
//             onClick={fetchMyDownlineTree}
//             className="p-2 hover:bg-slate-50 rounded-xl text-slate-500 transition-colors"
//           >
//             <RefreshCw size={14} className={loading ? 'animate-spin text-brand' : ''} />
//           </button>
//         </div>

//         {/* ট্রি রেন্ডারিং ব্লক */}
//         <div className="mt-4 select-none">
//           {loading ? (
//             <div className="text-center p-12 text-slate-400 font-semibold animate-pulse text-xs">Structuring direct node channelling...</div>
//           ) : treeData.length === 0 ? (
//             <div className="text-center p-12 text-slate-400 text-xs">No downline team network linked to this account yet.</div>
//           ) : (
//             treeData.map(rootNode => (
//               <TreeNode key={rootNode.idNo} node={rootNode} />
//             ))
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DownlineTree;


// 2th version of getMyDownlineTree function with sales and position calculation
import { useState, useEffect, useCallback } from 'react';
import API from '../api'; // আপনার তৈরি করা অ্যাক্সিওস/এপিআই ক্লায়েন্ট পাথ
import { Network, Users, ChevronRight, ChevronDown, User, RefreshCw, Award, TrendingUp, BarChart3, Briefcase, Layers } from 'lucide-react';

// 🎨 জেনারেশন লেভেল বা রো (Row Level) অনুযায়ী প্রিমিয়াম কালার থিম ম্যাপার
const getGenerationRowTheme = (level = 0) => {
  // লেভেল অনুযায়ী ভিন্ন ভিন্ন কালার (০ থেকে ৪ নম্বর লেভেল পর্যন্ত, এরপর লুপ হবে)
  const rem = level % 4;
  
  if (rem === 0) {
    // 💜 লেভেল ০ (রুট/নিজের কার্ড): রয়্যাল পার্পল থিম
    return {
      bg: 'bg-purple-50/60 hover:bg-purple-50/90',
      border: 'border-purple-200/80',
      badge: 'bg-purple-100 text-purple-700',
      text: 'text-purple-900',
      iconBg: 'bg-purple-100 text-purple-600',
      lineColor: 'border-purple-200'
    };
  }
  if (rem === 1) {
    // 💙 লেভেল ১ (১ম ডাউনলাইন জেনারেশন): ওশান ব্লু থিম
    return {
      bg: 'bg-blue-50/60 hover:bg-blue-50/90',
      border: 'border-blue-200/80',
      badge: 'bg-blue-100 text-blue-700',
      text: 'text-blue-900',
      iconBg: 'bg-blue-100 text-blue-600',
      lineColor: 'border-blue-200'
    };
  }
  if (rem === 2) {
    // 💚 লেভেল ২ (২য় ডাউনলাইন জেনারেশন): এমারেল্ড গ্রিন থিম
    return {
      bg: 'bg-emerald-50/60 hover:bg-emerald-50/90',
      border: 'border-emerald-200/80',
      badge: 'bg-emerald-100 text-emerald-700',
      text: 'text-emerald-900',
      iconBg: 'bg-emerald-100 text-emerald-600',
      lineColor: 'border-emerald-200'
    };
  }
  // 💛 লেভেল ৩ (৩য় ডাউনলাইন জেনারেশন): ওয়ার্ম অ্যাম্বার/গোল্ড থিম
  return {
    bg: 'bg-amber-50/60 hover:bg-amber-50/90',
    border: 'border-amber-200/80',
    badge: 'bg-amber-100 text-amber-700',
    text: 'text-amber-900',
    iconBg: 'bg-amber-100 text-amber-600',
    lineColor: 'border-amber-200'
  };
};

// 🌳 ১. জেনারেশন লেভেল ভিত্তিক কালার ও মাল্টি-মেট্রিক্স সমৃদ্ধ রিকার্সিভ চাইল্ড নোড রেন্ডারার
const TreeNode = ({ node, level = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const childrenList = node.children || [];
  const hasChildren = childrenList.length > 0;
  
  // ⚡ কারেন্ট জেনারেশন রো অনুযায়ী ডাইনামিক কালার থিম রিড করা হচ্ছে
  const theme = getGenerationRowTheme(level);

  return (
    <div className={`ml-6 border-l-2 ${theme.lineColor} pl-6 my-3 relative`}>
      {/* অ্যাক্টিভ কানেক্টিং ডট ইন্ডিকেটর */}
      <div className={`absolute -left-[7px] top-5 w-3 h-3 rounded-full border-2 border-white transition-all duration-300 ${hasChildren && isExpanded ? 'bg-indigo-600 scale-110 shadow-[0_0_8px_rgba(79,70,229,0.5)]' : 'bg-slate-300'}`}></div>
      
      <div className={`${theme.bg} border ${theme.border} p-4 rounded-2xl w-full sm:w-85 shadow-xs hover:shadow-sm transition-all duration-200`}>
        <div className="flex items-center gap-3">
          
          {/* এক্সপ্যান্ড / কলাপ্স অ্যাকশন বাটন */}
          {hasChildren ? (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className={`p-1.5 rounded-lg transition-all duration-200 ${isExpanded ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100/70 text-slate-500 hover:bg-slate-200'}`}
            >
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          ) : (
            <div className={`p-1.5 ${theme.iconBg} rounded-lg`}>
              <User size={14} />
            </div>
          )}

          {/* ইউজার ডেসক্রিপশন */}
          <div className="flex-1 min-w-0">
            <div className={`font-bold ${theme.text} text-sm truncate`}>{node.name}</div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">{node.idNo}</div>
          </div>
          
          {/* জেনারেশন রো ব্যাজ */}
          <span className={`px-2 py-0.5 ${theme.badge} font-black rounded-md text-[9px] uppercase tracking-wider`}>
            {level === 0 ? 'Root' : `Gen - ${level}`}
          </span>
        </div>

        {/* 📊 ৩টি ডাইনামিক মেট্রিক্স গ্রিড (Month Sales, Total Sales, Line Count) */}
        <div className="grid grid-cols-3 gap-1.5 mt-3 pt-3 border-t border-slate-100 text-[9px] font-semibold text-slate-600">
          
          {/* ১. চলতি মাসের সেলস */}
          <div className="bg-white/80 p-1.5 rounded-xl border border-slate-100/70 text-center">
            <span className="text-slate-400 block text-[8px] uppercase tracking-tight mb-0.5">Month Sales</span>
            <span className="text-slate-700 font-bold">৳{node.thisMonthSalesVolume?.toLocaleString() || 0}</span>
          </div>

          {/* ২. সর্বমোট লাইফটাইম সেলস */}
          <div className="bg-white/80 p-1.5 rounded-xl border border-slate-100/70 text-center">
            <span className="text-slate-400 block text-[8px] uppercase tracking-tight mb-0.5">Total Sales</span>
            <span className="text-slate-700 font-bold">৳{node.totalSalesVolume?.toLocaleString() || 0}</span>
          </div>

          {/* ৩. ডিরেক্ট লাইন বা চাইল্ড কাউন্ট */}
          <div className="bg-white/80 p-1.5 rounded-xl border border-slate-100/70 text-center">
            <span className="text-slate-400 block text-[8px] uppercase tracking-tight mb-0.5">Line Count</span>
            <span className="text-indigo-600 font-bold flex items-center justify-center gap-0.5">
              <Layers size={9} /> {childrenList.length} Lines
            </span>
          </div>

        </div>
      </div>

      {/* চাইল্ড নোড রেন্ডারার লুপ (এখানে জেনারেশন level + 1 করে পাঠানো হচ্ছে) */}
      {hasChildren && isExpanded && (
        <div className="mt-1 transition-all duration-300 origin-top">
          {childrenList.map(child => (
            <TreeNode key={child.idNo} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

// 🖥️ ২. মেইন ডাউনলাইন ট্রি স্ক্রিন (মেইন কম্পোনেন্ট)
const DownlineTree = () => {
  const userIdNo = localStorage.getItem('userIdNo') || 'MKT-0001';
  const [treeData, setTreeData] = useState([]);
  const [loading, setLoading] = useState(false);

  // নিজের মেইন প্রোফাইল ও সেলস মেটা স্টেট
  const [myProfileStats, setMyProfileStats] = useState({
    position: 'SALES REPRESENTATIVE',
    thisMonthSalesAchieved: 0,
    totalSalesAchieved: 0
  });

  // গ্লোবাল ট্রি থেকে লগইন করা সুনির্দিষ্ট ইউজারের সাব-ট্রি খুঁজে বের করার অ্যালগরিদম
  const findUserSubTree = (nodes, targetId) => {
    for (let node of nodes) {
      if (node.idNo === targetId) return node;
      if (node.children && node.children.length > 0) {
        const found = findUserSubTree(node.children, targetId);
        if (found) return found;
      }
    }
    return null;
  };

  const fetchMyDownlineTree = useCallback(async () => {
    setLoading(true);
    try {
      const response = await API.get('/users/tree');
      const responseData = response.data;

      const rawTreeArray = Array.isArray(responseData) ? responseData : responseData.tree || [];

      if (rawTreeArray.length > 0) {
        const mySubTree = findUserSubTree(rawTreeArray, userIdNo);

        if (mySubTree) {
          setTreeData([mySubTree]); 
          
          setMyProfileStats({
            position: mySubTree.autoPosition || mySubTree.role || 'SALES REPRESENTATIVE',
            thisMonthSalesAchieved: mySubTree.thisMonthSalesVolume || 0,
            totalSalesAchieved: mySubTree.totalSalesVolume || 0
          });
        } else {
          setTreeData(rawTreeArray);
          setMyProfileStats({
            position: rawTreeArray.autoPosition || 'SALES REPRESENTATIVE',
            thisMonthSalesAchieved: rawTreeArray.thisMonthSalesVolume || 0,
            totalSalesAchieved: rawTreeArray.totalSalesVolume || 0
          });
        }
      }
    } catch (error) {
      console.error("Failed to load network genealogy tree:", error);
    } finally {
      setLoading(false);
    }
  }, [userIdNo]);

  useEffect(() => {
    fetchMyDownlineTree();
  }, [fetchMyDownlineTree]);

  return (
    <div className="p-4 sm:p-6 bg-slate-50/50 min-h-screen font-sans text-black">
      
      {/* হেডার */}
      <div className="mb-6 bg-white p-5 rounded-2xl border border-slate-200/60 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Network className="text-indigo-600" size={26} />
            My Downline Genealogy Tree
          </h2>
          <p className="text-xs text-slate-500 mt-1">📊 আপনার অর্গানাইজেশনাল টিম লিংকের নেস্টেড জেনারেশন ট্রি চার্ট কাঠামো।</p>
        </div>
        <button 
          onClick={fetchMyDownlineTree}
          className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-2 transition active:scale-95 border border-slate-200"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin text-indigo-600' : ''} /> Refresh Network
        </button>
      </div>

      {/* টপ ৩টি পার্সোনাল প্রোফাইল ও সেলস কার্ড গ্রিড */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mb-6">
        
        {/* কার্ড ১: কারেন্ট র‍্যাংক */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">My Current Rank</span>
            <h3 className="text-sm sm:text-base font-black text-slate-800 uppercase tracking-wide truncate max-w-[180px]">
              {loading ? 'Loading...' : myProfileStats.position}
            </h3>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Award size={20} />
          </div>
        </div>

               {/* কার্ড ২: টিম সেলস */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Team Sales (This Month)</span>
            <h3 className="text-xl font-black text-slate-900">
              ৳{myProfileStats.thisMonthSalesAchieved?.toLocaleString() || 0}
            </h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <TrendingUp size={20} />
          </div>
        </div>

        {/* কার্ড ৩: সর্বমোট সেলস */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-xs flex items-center justify-between sm:col-span-2 md:col-span-1">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Sales Volume (Lifetime)</span>
            <h3 className="text-xl font-black text-slate-900">
              ৳{myProfileStats.totalSalesAchieved?.toLocaleString() || 0}
            </h3>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <BarChart3 size={20} />
          </div>
        </div>

      </div>

      {/* মেইন চার্ট কন্টেইনার এরিয়া */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-xs min-h-[450px] overflow-x-auto">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-4">
          <Briefcase size={16} className="text-indigo-600" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Team Hierarchy Network View
          </span>
        </div>

        {/* ট্রি রেন্ডারিং充 ব্লক */}
        <div className="mt-4 select-none">
          {loading ? (
            <div className="text-center py-20 text-slate-400 font-medium text-xs flex flex-col items-center justify-center gap-2">
              <RefreshCw className="animate-spin text-indigo-600" size={18} />
              <span>Structuring direct node channelling...</span>
            </div>
          ) : treeData.length === 0 ? (
            <div className="text-center py-20 text-slate-400 text-xs font-medium">
              No downline team network linked to this account yet.
            </div>
          ) : (
            treeData.map(rootNode => (
              <div key={rootNode.idNo} className="-ml-6">
                {/* রুট লেভেলে level = 0 পাস করা হচ্ছে */}
                <TreeNode node={rootNode} level={0} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DownlineTree;

