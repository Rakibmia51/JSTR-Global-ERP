import { useState, useEffect } from 'react';
import API from '../api'; // আপনার তৈরি করা অ্যাক্সিওস/এপিআই ক্লায়েন্ট পাথ
import { Network, Users, ChevronRight, ChevronDown, User, RefreshCw, Award, TrendingUp, BarChart3 } from 'lucide-react';

// 🌳 রিকার্সিভ চাইল্ড নোড রেন্ডারার সাব-কম্পোনেন্ট (প্রতিটি ডাউনলাইন মেম্বারের কার্ড)
const TreeNode = ({ node }) => {
  // 🔒 ফিক্স: ডিফল্টভাবে ট্রি ক্লোজ বা বন্ধ রাখার জন্য স্টেটটি 'false' করা হলো
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="ml-6 border-l-2 border-slate-200/80 pl-4 my-2 relative">
      {/* কানেক্টিং ডট লিংক */}
      <div className="absolute -left-[7px] top-4 w-3 h-3 rounded-full bg-slate-300 border-2 border-white"></div>
      
      <div className="bg-white hover:bg-slate-50 border border-slate-200/70 p-4 rounded-2xl w-full sm:w-80 shadow-sm transition-all">
        <div className="flex items-center gap-2 mb-2">
          {hasChildren ? (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-slate-100 rounded text-slate-500 transition-colors"
            >
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          ) : (
            <div className="p-1 text-slate-300"><User size={14} /></div>
          )}

          <div className="flex-1">
            <div className="font-bold text-slate-800 text-xs sm:text-sm">{node.name}</div>
            <div className="text-[10px] text-indigo-500 font-mono font-bold">{node.idNo}</div>
          </div>
          
          <span className="px-2 py-0.5 bg-brand/10 text-brand-dark font-black rounded text-[9px] uppercase">
            {node.autoPosition || 'SR'}
          </span>
        </div>

        {/* 📊 ডাউনলাইন চাইল্ড মেম্বারদের সেলস বিবরণী */}
        <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100 text-[10px] font-semibold text-slate-500">
          <div className="bg-slate-50 p-1.5 rounded-lg">
            <span className="text-slate-400 block text-[9px] uppercase tracking-tight">This Month</span>
            <span className="text-slate-700 font-bold">৳{node.thisMonthSalesVolume?.toLocaleString()}</span>
          </div>
          <div className="bg-slate-50 p-1.5 rounded-lg">
            <span className="text-slate-400 block text-[9px] uppercase tracking-tight">Lifetime Volume</span>
            <span className="text-slate-700 font-bold">৳{node.totalSalesVolume?.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* চাইল্ড জেনারেশন রিকার্সন রেন্ডার (ক্লিক করলে ওপেন হবে) */}
      {hasChildren && isExpanded && (
        <div className="mt-2 transition-all">
          {node.children.map(child => (
            <TreeNode key={child.idNo} node={child} />
          ))}
        </div>
      )}
    </div>
  );
};

// 🖥️ মেইন ডাউনলাইন ট্রি স্ক্রিন (মেইন কম্পোনেন্ট)
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

  const fetchMyDownlineTree = async () => {
    setLoading(true);
    try {
      const response = await API.get('/users/tree');
      const responseData = response.data;

      const rawTreeArray = Array.isArray(responseData) ? responseData : responseData.tree || [];

      if (rawTreeArray.length > 0) {
        const mySubTree = findUserSubTree(rawTreeArray, userIdNo);

        if (mySubTree) {
          // 🔒 মেইন রুট বা নিজের প্রথম লেভেলের চাইল্ডদের যেন দেখতে পাওয়া যায়, তাই রুট নোডের children সরাসরি পাঠানো হলো
          setTreeData([mySubTree]); 
          
          setMyProfileStats({
            position: mySubTree.autoPosition || 'SALES REPRESENTATIVE',
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
  };

  useEffect(() => {
    fetchMyDownlineTree();
  }, [userIdNo]);

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans">
      
      {/* হেডার */}
      <div className="mb-6">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
          <Network className="text-brand" size={26} />
          My Downline Genealogy Tree
        </h2>
        <p className="text-xs text-slate-500 mt-1">📊 আপনার অর্গানাইজেশনাল টিম লিংকের নেস্টেড জেনারেশন ট্রি চার্ট কাঠামো।</p>
      </div>

      {/* টপ ৩টি পার্সোনাল প্রোফাইল ও সেলস কার্ড গ্রিড */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        
        {/* কার্ড ১: নিজের কারেন্ট পজিশন / র‍্যাংক */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">My Current Rank</span>
            <h3 className="text-xl font-black text-slate-800 tracking-wide uppercase">
              {loading ? <RefreshCw className="animate-spin text-brand" size={16} /> : `Rank: ${myProfileStats.position}`}
            </h3>
          </div>
          <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <Award size={20} />
          </div>
        </div>

        {/* কার্ড ২: চলতি মাসের মোট টিম সেলস ভলিউম */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Team Sales (This Month)</span>
            <h3 className="text-2xl font-black text-slate-800">
              {loading ? <RefreshCw className="animate-spin text-brand" size={16} /> : `৳${myProfileStats.thisMonthSalesAchieved?.toLocaleString()}`}
            </h3>
          </div>
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <TrendingUp size={20} />
          </div>
        </div>

        {/* কার্ড ৩: সর্বমোট টিম সেলস ভলিউম */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Sales Volume (Lifetime)</span>
            <h3 className="text-2xl font-black text-slate-800">
              {loading ? <RefreshCw className="animate-spin text-brand" size={16} /> : `৳${myProfileStats.totalSalesAchieved?.toLocaleString()}`}
            </h3>
          </div>
          <div className="p-3.5 bg-amber-50 text-amber-600 rounded-xl">
            <BarChart3 size={20} />
          </div>
        </div>

      </div>

      {/* মেইন চার্ট কন্টেইনার এরিয়া */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm min-h-[400px] overflow-x-auto">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Users size={14} className="text-brand" /> Team Hierarchy View
          </span>
          <button 
            onClick={fetchMyDownlineTree}
            className="p-2 hover:bg-slate-50 rounded-xl text-slate-500 transition-colors"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin text-brand' : ''} />
          </button>
        </div>

        {/* ট্রি রেন্ডারিং ব্লক */}
        <div className="mt-4 select-none">
          {loading ? (
            <div className="text-center p-12 text-slate-400 font-semibold animate-pulse text-xs">Structuring direct node channelling...</div>
          ) : treeData.length === 0 ? (
            <div className="text-center p-12 text-slate-400 text-xs">No downline team network linked to this account yet.</div>
          ) : (
            treeData.map(rootNode => (
              <TreeNode key={rootNode.idNo} node={rootNode} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DownlineTree;
