import { useState, useEffect } from 'react';
import API from '../api'; // আপনার এপিআই ক্লায়েন্ট পাথ
import UserPayoutHistory from '../components/UserPayoutHistory';
import { 
  Wallet, 
  ArrowUpRight, 
  CreditCard, 
  Banknote, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw,
  Calendar
} from 'lucide-react';

const UserWallet = () => {
  // ১. লোকাল স্টোরেজ থেকে ইউজারের বেসিক ইনফো রিড করা
  const userRole = localStorage.getItem('userRole') || 'Employee';
  const userIdNo = localStorage.getItem('userIdNo') || 'N/A';
  const userName = localStorage.getItem('userName') || 'User Name';

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  // স্টেট ম্যানেজমেন্ট
  const [myEarnings, setMyEarnings] = useState({
    baseCommission: 0,
    monthlyBonusAmount: 0,
    globalPoolBonusAmount: 0,
    netTotalEarnings: 0,
    isQualified: false
  });
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  // ফর্ম ইনপুট স্টেট
  const [paymentMethod, setPaymentMethod] = useState('Bkash');
  const [accountDetails, setAccountDetails] = useState('');

  // ইউজারের কারেন্ট মাসের লাইভ আর্নিং ডাটা লেজার থেকে তুলে আনা
    // ইউজারের কারেন্ট মাসের আর্নিং ডাটা লেজার থেকে তুলে আনা
  const fetchMyCurrentEarnings = async () => {
    setLoading(true);
    try {
      const response = await API.get(`/commissions?year=${currentYear}&month=${currentMonth}`);
      
      if (response.data.success) {
        // 🔒 🆕 শর্ত: অ্যাডমিন যদি লেজার লক (Permanent Save) না করে, তবে ইউজারের ব্যালেন্স ৳০ দেখাবে
        if (!response.data.isSavedRecord) {
          setMyEarnings({
            baseCommission: 0,
            monthlyBonusAmount: 0,
            globalPoolBonusAmount: 0,
            netTotalEarnings: 0,
            isQualified: false,
            isLockedByAdmin: false // ট্র্যাকিংয়ের জন্য নতুন ফ্ল্যাগ
          });
          setLoading(false);
          return; // এখানেই ফাংশন শেষ, নিচের ডাটা ম্যাপিং স্কিপ করবে
        }

        // 🔓 যদি অ্যাডমিন ইতিমধ্যে লক করে থাকে (isSavedRecord: true), তবেই নিচে ব্যালেন্স দেখাবে
        if (userRole.toLowerCase() === 'dealer') {
          const myData = response.data.dealers?.find(d => d.dealerId === userIdNo);
          if (myData) {
            setMyEarnings({
              baseCommission: myData.commission || 0,
              monthlyBonusAmount: 0,
              globalPoolBonusAmount: 0,
              netTotalEarnings: myData.commission || 0,
              isQualified: myData.status === 'Qualified',
              isLockedByAdmin: true
            });
          }
        } else {
          const myData = response.data.data?.find(e => e.idNo === userIdNo);
          if (myData) {
            setMyEarnings({
              baseCommission: myData.baseCommission || 0,
              monthlyBonusAmount: myData.monthlyBonusAmount || 0,
              globalPoolBonusAmount: myData.globalPoolBonusAmount || 0,
              netTotalEarnings: myData.netTotalEarnings || 0,
              isQualified: myData.qualificationStatus === 'Qualified',
              isLockedByAdmin: true
            });
          }
        }
      }
    } catch (error) {
      console.error("Wallet Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyCurrentEarnings();
  }, []);

  // 🚀 ক্যাশ-আউট রিকোয়েস্ট সাবমিট ফাংশন
  const handleCashoutSubmit = async (e) => {
    e.preventDefault();
    if (myEarnings.netTotalEarnings <= 0 || !myEarnings.isQualified) {
      setStatusMessage({ type: 'error', text: 'You do not have any qualified balance to withdraw!' });
      return;
    }
    if (!accountDetails) {
      setStatusMessage({ type: 'error', text: 'Please enter your Account details/Number!' });
      return;
    }

    setSubmitLoading(true);
    setStatusMessage({ type: '', text: '' });

    try {
      const response = await API.post('/payouts/create', {
        userIdNo,
        name: userName,
        userType: userRole.toLowerCase() === 'dealer' ? 'Dealer' : 'Employee',
        amount: myEarnings.netTotalEarnings,
        year: currentYear,
        month: currentMonth,
        paymentMethod,
        accountDetails
      });

      if (response.data.success) {
        setStatusMessage({ type: 'success', text: response.data.message || 'Withdrawal request submitted successfully!' });
        setAccountDetails('');
      }
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to submit payout request. It might be already processed.'
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans">
      
      {/* 🔝 হেডার */}
      <div className="mb-6">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
          <Wallet className="text-brand" size={28} />
          My Earnings Wallet
        </h2>
        <p className="text-xs text-slate-500 mt-1">💰 চলতি মাসের অর্জিত ব্যালেন্স ওভারভিউ এবং ক্যাশ-আউট গেটওয়ে।</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 📊 বাম অংশ: আর্নিং কার্ড এবং ব্রেকডাউন */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* মেইন ক্যাশ ব্যালেন্স কার্ড */}
          <div className="bg-brand-dark rounded-3xl p-6 text-white relative overflow-hidden shadow-xl shadow-slate-900/10">
            <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 text-white/5 pointer-events-none">
              <Wallet size={200} />
            </div>
            
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Available Payout Balance</span>
                <h3 className="text-4xl font-black mt-1">
                  {loading ? <RefreshCw className="animate-spin inline text-brand" size={30} /> : `৳${myEarnings.netTotalEarnings.toLocaleString()}`}
                </h3>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${myEarnings.isQualified ? 'bg-emerald-500 text-white' : 'bg-red-500/20 text-red-400'}`}>
                {myEarnings.isQualified ? 'Qualified' : 'Not Qualified'}
              </span>
            </div>

            <div className="mt-8 flex items-center gap-4 text-xs font-semibold text-slate-400 border-t border-slate-800 pt-4">
              <div className="flex items-center gap-1.5"><Calendar size={14} className="text-brand" /> Period: <span className="text-slate-200">{new Date(0, currentMonth - 1).toLocaleString('en', { month: 'long' })}, {currentYear}</span></div>
              <div>• ID: <span className="text-slate-200 font-mono">{userIdNo}</span></div>
            </div>
          </div>

          {/* 📋 বিস্তারিত ইনকাম ব্রেকডাউন (শুধুমাত্র কর্মচারীদের জন্য প্রযোজ্য) */}
          {userRole.toLowerCase() !== 'dealer' && (
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <h4 className="text-sm font-bold text-slate-800 mb-4">Earnings Breakdown</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold">
                <div className="p-4 bg-indigo-50/40 border border-indigo-50 rounded-xl">
                  <span className="text-slate-400 block mb-1">Gap Commission</span>
                  <span className="text-lg font-black text-indigo-600">৳{myEarnings.baseCommission.toLocaleString()}</span>
                </div>
                <div className="p-4 bg-amber-50/40 border border-amber-50 rounded-xl">
                  <span className="text-slate-400 block mb-1">Performance Bonus</span>
                  <span className="text-lg font-black text-amber-600">৳{myEarnings.monthlyBonusAmount.toLocaleString()}</span>
                </div>
                <div className="p-4 bg-emerald-50/40 border border-emerald-50 rounded-xl">
                  <span className="text-slate-400 block mb-1">Global Pool Share</span>
                  <span className="text-lg font-black text-emerald-600">৳{myEarnings.globalPoolBonusAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 💳 ডান অংশ: ক্যাশ-আউট রিকোয়েস্ট ফর্ম */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-fit">
          <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <ArrowUpRight className="text-red-500" size={20} />
            Request Cashout
          </h4>
          <p className="text-[11px] text-slate-400 mt-0.5">আপনার অর্জিত পুরো মান্থলি কমিশন এক ক্লিকে উইথড্র করুন।</p>

                    {/* নোটিফিকেশন মেসেজ */}
          {statusMessage.text && (
            <div className={`mt-4 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
              statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'
            }`}>
              {statusMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
              {statusMessage.text}
            </div>
          )}

          <form onSubmit={handleCashoutSubmit} className="mt-5 space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
                {['Bkash', 'Nagad', 'Bank'].map(method => (
                  <button 
                    key={method} 
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`py-2 px-3 border rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all ${
                      paymentMethod === method 
                        ? 'border-brand bg-brand/5 text-brand-dark' 
                        : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {method === 'Bank' ? <Banknote size={16} /> : <CreditCard size={16} />}
                    {method}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">
                {paymentMethod === 'Bank' ? 'Bank Account Details (Name, Branch, A/C)' : `${paymentMethod} Mobile Number`}
              </label>
              <textarea
                rows={paymentMethod === 'Bank' ? 3 : 1}
                placeholder={paymentMethod === 'Bank' ? 'Enter Bank Name, Account No, Routing & Branch...' : 'e.g. 017XXXXXXXX'}
                value={accountDetails}
                onChange={(e) => setAccountDetails(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold outline-none focus:border-brand transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitLoading || myEarnings.netTotalEarnings <= 0 || !myEarnings.isQualified}
              className="w-full py-3 bg-brand-dark hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              {submitLoading ? <RefreshCw size={14} className="animate-spin" /> : null}
              Submit Withdrawal Request
            </button>

            {/* 🆕 কন্ডিশনাল মেসেজ আপডেট */}
            {!myEarnings.isLockedByAdmin ? (
              <p className="text-[10px] text-center font-semibold text-amber-600 mt-2 bg-amber-50 p-2 rounded-lg border border-amber-100">
                ⏳ এই মাসের কমিশন লেজার এখনো অ্যাডমিন প্যানেল থেকে চূড়ান্ত অনুমোদন (Lock) করা হয়নি। অনুমোদন শেষে আপনার ব্যালেন্স আপডেট হবে।
              </p>
            ) : (!myEarnings.isQualified || myEarnings.netTotalEarnings <= 0) && (
              <p className="text-[10px] text-center font-semibold text-red-500 mt-2">
                ⚠️ এই মাসে বোনাস পাওয়ার শর্ত (কোয়ালিফিকেশন বা সেলস টার্গেট) পূরণ হয়নি।
              </p>
            )}
          </form>
        </div>
      </div>

            {/* 🔽 নতুন যুক্ত হলো: উইথড্র হিস্ট্রি টেবিল */}
            <UserPayoutHistory />
    </div>
  );
};

export default UserWallet;
