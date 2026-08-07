import { useState, useEffect } from 'react';
import API from '../api'; // আপনার তৈরি করা অ্যাক্সিওস/এপিআই ক্লায়েন্ট পাথ
import { Award, Target, Flame, CheckCircle, Trophy, RefreshCw, Star } from 'lucide-react';

const RankProgress = () => {
  const userIdNo = localStorage.getItem('userIdNo') || 'MKT-0002'; // উদাহরণস্বরূপ MKT-0002 দিয়ে চেক করা হচ্ছে

  // ১. অফিশিয়াল র্যাংক ও প্রমোশন রিকোয়ারমেন্ট গাইড বুক
  const RANK_MAP = {
    "SALES REPRESENTATIVE": 0, "AM": 1, "RSM": 2, "DSM": 3, 
    "SDSM": 4, "SM": 5, "NSM": 6, "ED": 7, "BOM": 8
  };

  const RANK_REQUIREMENTS = {
    "AM": { next: "AM", sales: 25000, condition: "৳২৫,০০০ লাইফটাইম সেলস ভলিউম হতে হবে।" },
    "RSM": { next: "RSM", sales: 75000, childRank: "AM", childCount: 3, condition: "৳৭৫,০০০ সেলস ভলিউম এবং সরাসরি নিচে ৩ জন AM (বা তার বড় র্যাংক) থাকতে হবে।" },
    "DSM": { next: "DSM", sales: 200000, condition: "৳২,০০,০০০ সেলস ভলিউম এবং সরাসরি নিচে (২ জন RSM + ২ জন AM) অথবা ৪ জন RSM থাকতে হবে।" },
    "SDSM": { next: "SDSM", sales: 400000, childRank: "DSM", childCount: 2, condition: "৳৪,০০,০০০ সেলস ভলিউম এবং সরাসরি নিচে ২ জন DSM (বা তার বড় র্যাংক) থাকতে হবে।" },
    "SM": { next: "SM", sales: 600000, childRank: "DSM", childCount: 3, condition: "৳৬,০০,০০০ সেলস ভলিউম এবং সরাসরি নিচে ৩ জন DSM (বা তার বড় র্যাংক) থাকতে হবে।" },
    "NSM": { next: "NSM", sales: 800000, childRank: "DSM", childCount: 4, condition: "৳৮,০০,০০০ সেলস ভলিউম এবং সরাসরি নিচে ৪ জন DSM (বা তার বড় র্যাংক) থাকতে হবে।" },
    "ED": { next: "ED", sales: 3200000, childRank: "NSM", childCount: 4, condition: "৳৩২,০০,০০০ সেলস ভলিউম এবং সরাসরি নিচে ৪ জন NSM (বা তার বড় র্যাংক) থাকতে হবে।" },
    "BOM": { next: "BOM", sales: 6400000, childRank: "ED", childCount: 2, condition: "৳৬৪,০০,০০০ সেলস ভলিউম এবং সরাসরি নিচে ২ জন ED (বা তার বড় র্যাংক) থাকতে হবে।" }
  };

  // স্টেট ম্যানেজমেন্ট
  const [loading, setLoading] = useState(false);
  const [uiData, setUiData] = useState({
    currentRank: 'SALES REPRESENTATIVE',
    currentSales: 0,
    nextRank: 'AM',
    targetSales: 25000,
    conditionText: '',
    progressPercentage: 0,
    remainingSales: 25000,
    subNodesSummary: []
  });

  // 🌳 গ্লোবাল নেস্টেড ট্রি থেকে লগইন করা সুনির্দিষ্ট ইউজারের অবজেক্ট খুঁজে বের করার রিকার্সিভ ফাংশন
  const findUserInTree = (nodes, targetId) => {
    for (let node of nodes) {
      if (node.idNo === targetId) return node;
      if (node.children && node.children.length > 0) {
        const found = findUserInTree(node.children, targetId);
        if (found) return found;
      }
    }
    return null;
  };

  const calculateRankProgress = async () => {
    setLoading(true);
    try {
      // 📡 আপনার শেয়ার করা রেডিমেড ট্রি এপিআই কল করা হচ্ছে
      const response = await API.get('/users/tree');
      const rawTreeArray = Array.isArray(response.data) ? response.data : response.data.tree || [];

      if (rawTreeArray.length > 0) {
        // গ্লোবাল ট্রি থেকে নিজের ডাটা ফিল্টার করা
        const myData = findUserInTree(rawTreeArray, userIdNo);

        if (myData) {
          const currentRank = (myData.autoPosition || "SALES REPRESENTATIVE").toUpperCase().trim();
          const currentSales = Number(myData.totalSalesVolume || 0);

          // পরবর্তী টার্গেট র্যাংক নির্ধারণ করা
          const rankOrder = ["SALES REPRESENTATIVE", "AM", "RSM", "DSM", "SDSM", "SM", "NSM", "ED", "BOM"];
          const currentIndex = rankOrder.indexOf(currentRank);
          const nextRank = currentIndex < rankOrder.length - 1 ? rankOrder[currentIndex + 1] : "MAX";

          // টার্গেট র্যাংকের শর্ত লোড করা
          const requirements = RANK_REQUIREMENTS[nextRank] || { sales: currentSales, condition: "সর্বোচ্চ র্যাংক অর্জিত হয়েছে!" };

          // সেলস প্রোগ্রেস পার্সেন্টেজ হিসাব
          let salesPercentage = (currentSales / requirements.sales) * 100;
          if (salesPercentage > 100) salesPercentage = 100;
          if (nextRank === "MAX") salesPercentage = 100;

          // চাইল্ডদের বর্তমান র্যাংক সামারি ট্র্যাকিং (ডানপাশের গাইডের জন্য)
          const directChildrenSummary = (myData.children || []).map(child => ({
            idNo: child.idNo,
            name: child.name,
            autoPosition: child.autoPosition || "SALES REPRESENTATIVE"
          }));

          setUiData({
            currentRank,
            currentSales,
            nextRank,
            targetSales: requirements.sales,
            conditionText: requirements.condition,
            progressPercentage: Math.round(salesPercentage),
            remainingSales: requirements.sales > currentSales ? (requirements.sales - currentSales) : 0,
            subNodesSummary: directChildrenSummary
          });
        }
      }
    } catch (error) {
      console.error("Failed to parse rank progress from tree API:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateRankProgress();
  }, [userIdNo]);

  // সরাসরি নিচে থাকা চাইল্ডদের র্যাংক কাউন্টার হেল্পার (ইউআই ডিসপ্লের জন্য)
  const countChildRankAtLeast = (targetPos) => {
    return uiData.subNodesSummary.reduce((total, sub) => {
      const pos = (sub.autoPosition || "").toUpperCase().trim();
      return RANK_MAP[pos] >= RANK_MAP[targetPos] ? total + 1 : total;
    }, 0);
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans">
      
      {/* 🔝 হেডার */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Trophy className="text-amber-500" size={26} />
            My Rank Promotion Progress
          </h2>
          <p className="text-xs text-slate-500 mt-1">📈 আপনার লাইফটাইম ক্যারিয়ার ভলিউম ট্র্যাকিং এবং পরবর্তী পদোন্নতি টার্গেট এনালাইটিক্স।</p>
        </div>
        <button 
          onClick={calculateRankProgress}
          className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-brand shadow-sm transition-colors"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin text-brand' : ''} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 🏆 বাম অংশ: কারেন্ট বনাম নেক্সট র্যাংক ডিসপ্লে কার্ড */}
        <div className="lg:col-span-2 bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 text-slate-50/50 pointer-events-none">
            <Award size={160} />
          </div>

          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-brand/5 text-brand-dark rounded-xl"><Star size={22} className="fill-brand/20" /></div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Achieved Status</span>
                <h4 className="text-lg font-black text-slate-800 uppercase">{uiData.currentRank}</h4>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-black rounded-lg uppercase font-mono">Level {uiData.progressPercentage >= 100 && uiData.nextRank === 'MAX' ? 'MAX' : 'Active'}</span>
          </div>

          {/* 📊 মেইন প্রোগ্রেস বার ভিজুয়ালাইজেশন */}
          <div className="my-8 space-y-3">
            <div className="flex justify-between items-end text-xs font-bold">
              <span className="text-slate-500 uppercase tracking-wide flex items-center gap-1">
                <Target size={14} className="text-indigo-500" /> Next Milestone: <span className="text-slate-800 font-extrabold">{uiData.nextRank}</span>
              </span>
              <span className="text-brand-dark font-black text-sm">{uiData.progressPercentage}%</span>
            </div>
            
            {/* প্রোগ্রেস ট্র্যাক লাইন */}
            <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/40">
              <div 
                style={{ width: `${uiData.progressPercentage}%` }}
                className="h-full bg-gradient-to-r from-brand to-indigo-600 rounded-full transition-all duration-500 shadow-inner relative"
              >
                <div className="absolute right-1 top-0.5 w-1 h-1 bg-white rounded-full animate-ping"></div>
              </div>
            </div>

            <div className="flex justify-between text-[10px] text-slate-400 font-bold font-mono">
              <span>৳{uiData.currentSales?.toLocaleString()} (Current Volume)</span>
              <span>Target: ৳{uiData.targetSales?.toLocaleString()}</span>
            </div>
          </div>

          {/* 🎯 রিমেইনিং বিবরণী */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100/70 text-xs font-semibold text-slate-600">
            {uiData.remainingSales > 0 ? (
              <p className="flex items-center gap-1.5">
                <Flame size={14} className="text-red-500 animate-bounce" /> 
                পরবর্তী পদোন্নতি অর্জন করতে আপনার টিম ভলিউমে আরও <span className="text-red-600 font-black">৳{uiData.remainingSales?.toLocaleString()}</span> মূল্যের সেলস সম্পন্ন করতে হবে।
              </p>
            ) : (
              <p className="flex items-center gap-1.5 text-emerald-700 font-bold">
                <CheckCircle size={14} className="text-emerald-500" /> অভিনন্দন! আপনি পরবর্তী র্যাংকের সমস্ত সেলস ক্রাইটেরিয়া সফলভাবে কোয়ালিফাই করেছেন।
              </p>
            )}
          </div>
        </div>

               {/* 📜 ডান অংশ: অফিশিয়াল র্যাংক কন্ডিশন ও সরাসরি চাইল্ডদের লাইভ স্ট্যাটাস কাউন্টার */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-fit space-y-4">
          <div>
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 mb-1.5">
              <Target size={16} className="text-brand" />
              Milestone Criteria Guide
            </h4>
            <p className="text-[10px] text-slate-400 font-medium">কোম্পানির অফিশিয়াল পদোন্নতি কন্ডিশন ও টার্গেট ম্যানুয়াল বিবরণী।</p>
          </div>
          
          <div className="space-y-3 text-xs font-semibold">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/50">
              <span className="text-[9px] font-bold text-slate-400 block uppercase mb-1">Target Rank Requirements</span>
              <p className="text-slate-700 leading-relaxed font-bold">{uiData.conditionText}</p>
            </div>

            {/* 📊 লাইভ ডাউনলাইন র্যাংক অডিট কাউন্টার (আপনার ইউজার চাইল্ডস ডাটা থেকে জেনারেটেড) */}
            <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
              <span className="text-[9px] font-bold text-slate-400 block uppercase mb-2">Your Direct Team Rank Summary</span>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-slate-600">
                <div className="bg-white p-2 rounded-lg border border-slate-100 flex justify-between">
                  <span>Total AM:</span> 
                  <span className="text-indigo-600 font-black">{countChildRankAtLeast("AM")}</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-100 flex justify-between">
                  <span>Total RSM:</span> 
                  <span className="text-indigo-600 font-black">{countChildRankAtLeast("RSM")}</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-100 flex justify-between col-span-2">
                  <span>Total DSM:</span> 
                  <span className="text-indigo-600 font-black">{countChildRankAtLeast("DSM")}</span>
                </div>
              </div>
            </div>
            
            <div className="p-3.5 bg-brand/5 rounded-xl border border-brand/10 text-[10px] text-slate-500 leading-relaxed font-medium">
              💡 <span className="font-bold text-brand-dark">নোট:</span> কিউমুলেティブ বটম-আপ লজিকের কারণে আপনার কোনো ডাউনলাইন মেম্বারের র্যাংক যদি টার্গেট র্যাংকের চেয়ে বড় হয় (যেমন: RSM এর জায়গায় DSM থাকে), তবে সিস্টেম তাকেও পদোন্নতির কাউন্টার হিসেবে অটো-গণনা করবে।
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RankProgress;
