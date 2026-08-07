import { useState, useEffect } from 'react';
import API from '../api'; // আপনার তৈরি করা অ্যাক্সিওস/এপিআই ক্লায়েন্ট পাথ
import { 
  Check, 
  X, 
  RefreshCw, 
  Search, 
  DollarSign, 
  CreditCard, 
  Building, 
  FileText, 
  AlertCircle 
} from 'lucide-react';

const AdminAccountsDashboard = () => {
  // ডাটা ও ফিল্টার স্টেট
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('Pending'); // Pending, Approved, Rejected
  const [searchTerm, setSearchTerm] = useState('');
  
  // এপ্রুভাল মডাল স্টেট
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [transactionId, setTransactionId] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // ব্যাকএন্ড থেকে পে-আউট রিকোয়েস্টের তালিকা নিয়ে আসা
  const fetchPayoutRequests = async () => {
    setLoading(true);
    try {
      // আপনার GET /requests?status=... এপিআই কল করা হচ্ছে
      const response = await API.get(`/payouts/requests?status=${filterStatus}`);
      if (response.data.success) {
        setRequests(response.data.data || []);
      }
    } catch (error) {
      console.error("Failed to load accounts logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayoutRequests();
  }, [filterStatus]);

  // 🚀 এপ্রুভ বা রিজেক্ট অ্যাকশন ট্রিগার ফাংশন
  const handleExecuteClearance = async (actionStatus) => {
    if (actionStatus === 'Approved' && !transactionId) {
      alert('Please input a valid Transaction ID for bank/mobile banking settlement!');
      return;
    }

    setActionLoading(true);
    try {
      // আপনার PUT /api/payouts/action/:id এপিআই কল করা হচ্ছে
      const response = await API.put(`/payouts/action/${selectedPayout._id}`, {
        status: actionStatus,
        transactionId: transactionId,
        note: adminNote,
        adminName: localStorage.getItem('userName') || 'System Admin'
      });

      if (response.data.success) {
        setSelectedPayout(null);
        setTransactionId('');
        setAdminNote('');
        fetchPayoutRequests(); // লিস্ট রিফ্রেশ করা
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Clearance operation failed.');
    } finally {
      setActionLoading(false);
    }
  };

  // সার্চ ফিল্টারিং (নাম এবং আইডি নো দিয়ে খোঁজা)
  const filteredRequests = requests.filter(r => 
    r.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.userIdNo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans">
      
      {/* 🔝 টপ বার: টাইটেল এবং স্ট্যাটাস ফিল্টার */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-1.5">
            <DollarSign className="text-brand" size={28} />
            Accounts & Payout Ledger
          </h2>
          <p className="text-xs text-slate-500 mt-1">💸 মার্কেটিং টিম ও ডিলারদের ক্যাশ-আউট রিকোয়েস্ট অনুমোদন এবং পেমেন্ট গেটওয়ে ক্লিয়ারেন্স প্যানেল।</p>
        </div>

        {/* 📑 স্ট্যাটাস ফিল্টার ট্যাব */}
        <div className="flex bg-slate-200/60 p-1 rounded-xl w-fit text-xs font-bold shadow-sm">
          {['Pending', 'Approved', 'Rejected'].map(status => (
            <button 
              key={status} 
              onClick={() => { setFilterStatus(status); setSearchTerm(''); }}
              className={`px-4 py-2 rounded-lg transition-all ${filterStatus === status ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              {status} Requests
            </button>
          ))}
        </div>
      </div>

      {/* 🔍 সার্চ কন্ট্রোল বার */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 justify-between items-center">
          <div className="relative w-full sm:w-72">
            <input 
              type="text" 
              placeholder="Search by ID No or Name..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-4 py-2 text-xs outline-none focus:border-brand" 
            />
          </div>
          <button 
            onClick={fetchPayoutRequests} 
            className="p-2 bg-slate-50 border border-slate-100 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* 📊 পে-আউট ডাটা গ্রিড টেবিল */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="p-4">Beneficiary</th>
                <th className="p-4">User Type</th>
                <th className="p-4">Settlement Period</th>
                <th className="p-4 text-right">Requested Fund</th>
                <th className="p-4">Account Gateway</th>
                {filterStatus !== 'Pending' && <th className="p-4">Transaction Details</th>}
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 font-medium divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="7" className="text-center p-12 text-slate-400 font-semibold animate-pulse">Loading accounts log matrices...</td></tr>
              ) : filteredRequests.length === 0 ? (
                <tr><td colSpan="7" className="text-center p-12 text-slate-400">No {filterStatus.toLowerCase()} payout request logs found.</td></tr>
              ) : filteredRequests.map(item => (
                <tr key={item._id} className="hover:bg-slate-50/40 transition-colors">
                  {/* বেনেফিশিয়ারি তথ্য */}
                  <td className="p-4 flex flex-col">
                    <span className="font-bold text-slate-800">{item.name}</span>
                    <span className="text-[10px] font-mono text-slate-400 mt-0.5">{item.userIdNo}</span>
                  </td>

                  {/* ইউজার টাইপ */}
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded font-black text-[9px] uppercase ${item.userType === 'Employee' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                      {item.userType}
                    </span>
                  </td>

                  {/* লেজার মাস ও বছর */}
                  <td className="p-4 text-slate-500 font-bold">
                    {new Date(0, item.month - 1).toLocaleString('en', { month: 'short' })}-{item.year}
                  </td>

                  {/* রিকোয়েস্টকৃত অ্যামাউন্ট */}
                  <td className="p-4 text-right font-black text-slate-900 text-sm">
                    ৳{item.amount?.toLocaleString()}
                  </td>

                  {/* পেমেন্ট গেটওয়ে অ্যাকাউন্ট */}
                  <td className="p-4">
                    <div className="flex items-center gap-1.5">
                      {item.paymentMethod === 'Bank Transfer' ? <Building size={14} className="text-blue-500" /> : <CreditCard size={14} className="text-pink-500" />}
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-700">{item.paymentMethod}</span>
                        <span className="text-[10px] text-slate-400 font-mono tracking-tight max-w-[160px] truncate" title={item.accountDetails}>{item.accountDetails}</span>
                      </div>
                    </div>
                  </td>

                  {/* ট্রানজেকশন ডিটেইলস (Approved / Rejected ফিল্টারে দেখাবে) */}
                  {filterStatus !== 'Pending' && (
                    <td className="p-4">
                      <div className="flex flex-col gap-0.5 max-w-[180px]">
                        {item.status === 'Approved' && <span className="font-mono text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 w-fit font-bold">TxID: {item.transactionId}</span>}
                        {item.note && <span className="text-[10px] text-slate-400 italic flex items-center gap-1"><FileText size={11}/> {item.note}</span>}
                        <span className="text-[9px] text-slate-400 font-medium">By: {item.approvedBy || 'System'}</span>
                      </div>
                    </td>
                  )}

                                  {/* অ্যাকশন বাটন */}
                  <td className="p-4 text-center">
                    {item.status === 'Pending' ? (
                      <button 
                        onClick={() => setSelectedPayout(item)}
                        className="px-3 py-1.5 bg-brand-dark hover:bg-slate-800 text-white rounded-xl text-[11px] font-bold shadow-sm active:scale-95 transition-all"
                      >
                        Review & Pay
                      </button>
                    ) : (
                      <span className={`px-2.5 py-1 rounded-full font-black text-[9px] uppercase ${item.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                        {item.status}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 💳 ক্লিয়ারেন্স মডাল পপআপ (অ্যাকশন প্যানেল) */}
      {selectedPayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-100 shadow-2xl animate-in zoom-in-95 duration-150 font-sans">
            <h4 className="text-lg font-bold text-slate-800 flex items-center gap-1.5">
              <DollarSign className="text-brand" size={20} /> 
              Execute Fund Settlement
            </h4>
            <p className="text-xs text-slate-400 mt-1">বেনেফিশিয়ারির একাউন্টে পেমেন্টটি ম্যানুয়ালি ট্রান্সফার করার পর নিচে ট্রন আইডি বসিয়ে এপ্রুভ করুন।</p>
            
            {/* বেনেফিশিয়ারি ওভারভিউ সামারি */}
            <div className="my-4 p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-xs text-slate-600 font-semibold space-y-1.5">
              <div className="flex justify-between"><span>Receiver:</span> <span className="text-slate-800 font-bold">{selectedPayout.name} ({selectedPayout.userIdNo})</span></div>
              <div className="flex justify-between"><span>Net Payable:</span> <span className="text-red-600 font-black text-sm">৳{selectedPayout.amount?.toLocaleString()}</span></div>
              <div className="flex justify-between border-t border-slate-200/60 pt-1.5"><span>Method:</span> <span className="text-slate-700">{selectedPayout.paymentMethod}</span></div>
              <div className="flex flex-col mt-1 bg-white p-2 rounded-lg border border-slate-100 text-[11px] font-mono text-slate-500 break-all">
                <span className="text-[10px] font-bold text-slate-400 uppercase mb-0.5 font-sans">Target Destination Account</span>
                {selectedPayout.accountDetails}
              </div>
            </div>

            {/* ইনপুট ফিল্ডস */}
            <div className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Transaction ID / Reference (Required for Approve)</label>
                <input 
                  type="text" 
                  placeholder="e.g. TRX82937492KS" 
                  value={transactionId} 
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold outline-none font-mono focus:border-brand transition-all" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Internal Accounts Note (Optional)</label>
                <textarea 
                  rows="2" 
                  placeholder="e.g. Paid through official corporate portal..." 
                  value={adminNote} 
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-brand transition-all resize-none" 
                />
              </div>
            </div>

            {/* মডাল অ্যাকশন বাটনস */}
            <div className="flex justify-end gap-3 mt-6 text-xs font-bold">
              <button 
                onClick={() => { setSelectedPayout(null); setTransactionId(''); setAdminNote(''); }} 
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleExecuteClearance('Rejected')}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl flex items-center gap-1 transition-colors disabled:opacity-50"
              >
                <X size={14} /> Reject
              </button>
              <button 
                onClick={() => handleExecuteClearance('Approved')}
                disabled={actionLoading}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md shadow-emerald-200 flex items-center gap-1 transition-all active:scale-95 disabled:opacity-50"
              >
                {actionLoading ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
                Approve & Settle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAccountsDashboard;
