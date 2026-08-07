import { useState, useEffect } from 'react';
import API from '../api';
import { Clock, CheckCircle, XCircle, ShieldCheck, StickyNote, HelpCircle } from 'lucide-react';

const UserPayoutHistory = () => {
  const userIdNo = localStorage.getItem('userIdNo') || 'N/A';
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchMyHistory = async () => {
    if (userIdNo === 'N/A') return;
    setLoading(true);
    try {
      const response = await API.get(`/payouts/my-history/${userIdNo}`);
      if (response.data.success) {
        setHistoryList(response.data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch payout history:", error);
    } finally {
      setLoading(false);
    }
  };

  // স্ক্রিন লোড হওয়ার সময় ডাটা নিয়ে আসা
  useEffect(() => {
    fetchMyHistory();
  }, [userIdNo]);

  // স্ট্যাটাস ব্যাজ কালার ও আইকন ডাইনামিক জেনারেটর
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full font-bold text-[10px] uppercase flex items-center gap-1 w-fit">
            <CheckCircle size={12} /> Approved
          </span>
        );
      case 'Rejected':
        return (
          <span className="px-2.5 py-1 bg-red-50 text-red-600 rounded-full font-bold text-[10px] uppercase flex items-center gap-1 w-fit">
            <XCircle size={12} /> Rejected
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 bg-amber-50 text-amber-600 rounded-full font-bold text-[10px] uppercase flex items-center gap-1 w-fit animate-pulse">
            <Clock size={12} /> Pending
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mt-8 font-sans">
      <div className="p-5 border-b border-slate-100 flex justify-between items-center">
        <div>
          <h4 className="text-base font-bold text-slate-800">Withdrawal Request History</h4>
          <p className="text-[11px] text-slate-400 mt-0.5">আপনার বিগত মাসগুলোর সমস্ত সাবমিটকৃত ক্যাশ-আউট ট্র্যাকিং তালিকা।</p>
        </div>
        <button 
          onClick={fetchMyHistory}
          className="text-xs font-bold text-brand hover:underline flex items-center gap-1"
        >
          Refresh Log
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
              <th className="p-4">Requested Date</th>
              <th className="p-4">Settlement Period</th>
              <th className="p-4 text-right">Amount</th>
              <th className="p-4">Payment Method</th>
              <th className="p-4">Transaction ID</th>
              <th className="p-4">Status</th>
              <th className="p-4">Admin Remarks</th>
            </tr>
          </thead>
          <tbody className="text-slate-600 text-xs font-medium divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan="7" className="text-center p-8 text-slate-400">Loading payout records...</td></tr>
            ) : historyList.length === 0 ? (
              <tr><td colSpan="7" className="text-center p-8 text-slate-400">No payout history found in this wallet ledger.</td></tr>
            ) : historyList.map((item) => (
              <tr key={item._id} className="hover:bg-slate-50/40 transition-colors">
                {/* রিকোয়েস্ট ডেট */}
                <td className="p-4 font-semibold text-slate-500">
                  {new Date(item.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
                
                {/* লেজার পিরিয়ড */}
                <td className="p-4 text-slate-700 font-bold">
                  {new Date(0, item.month - 1).toLocaleString('en', { month: 'short' })}-{item.year}
                </td>
                
                {/* অ্যামাউন্ট */}
                <td className="p-4 text-right font-black text-slate-900">
                  ৳{item.amount?.toLocaleString()}
                </td>
                
                {/* পেমেন্ট মেথড */}
                <td className="p-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-800">{item.paymentMethod}</span>
                    <span className="text-[10px] text-slate-400 font-mono tracking-tight max-w-[150px] truncate" title={item.accountDetails}>
                      {item.accountDetails}
                    </span>
                  </div>
                </td>
                
                {/* ট্রানজেকশন আইডি */}
                <td className="p-4 font-mono text-[11px]">
                  {item.transactionId ? (
                    <span className="text-indigo-600 bg-indigo-50/50 px-1.5 py-0.5 rounded font-bold border border-indigo-100 flex items-center gap-1 w-fit">
                      <ShieldCheck size={11} /> {item.transactionId}
                    </span>
                  ) : (
                    <span className="text-slate-400 italic">Processing...</span>
                  )}
                </td>
                
                {/* স্ট্যাটাস ব্যাজ */}
                <td className="p-4">{getStatusBadge(item.status)}</td>
                
                {/* অ্যাডমিন নোট */}
                <td className="p-4 text-slate-400 italic max-w-[180px] truncate" title={item.note || 'No notes added'}>
                  {item.note ? (
                    <span className="flex items-center gap-1 text-slate-600">
                      <StickyNote size={12} className="text-slate-400 flex-shrink-0" /> {item.note}
                    </span>
                  ) : (
                    <span className="text-slate-300">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserPayoutHistory;
