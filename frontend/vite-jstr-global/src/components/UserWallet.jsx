


// 1st version of UserWallet.jsx with basic earnings display and cashout request form.
// import { useState, useEffect } from 'react';
// import API from '../api'; // আপনার এপিআই ক্লায়েন্ট পাথ
// import UserPayoutHistory from '../components/UserPayoutHistory';
// import { 
//   Wallet, 
//   ArrowUpRight, 
//   CreditCard, 
//   Banknote, 
//   CheckCircle2, 
//   AlertTriangle, 
//   RefreshCw,
//   Calendar
// } from 'lucide-react';

// const UserWallet = () => {
//   // ১. লোকাল স্টোরেজ থেকে ইউজারের বেসিক ইনফো রিড করা
//   const userRole = localStorage.getItem('userRole') || 'Employee';
//   const userIdNo = localStorage.getItem('userIdNo') || 'N/A';
//   const userName = localStorage.getItem('userName') || 'User Name';

//   const currentYear = new Date().getFullYear();
//   const currentMonth = new Date().getMonth() + 1;

//   // স্টেট ম্যানেজমেন্ট
//   const [myEarnings, setMyEarnings] = useState({
//     baseCommission: 0,
//     monthlyBonusAmount: 0,
//     globalPoolBonusAmount: 0,
//     netTotalEarnings: 0,
//     isQualified: false
//   });
//   const [loading, setLoading] = useState(false);
//   const [submitLoading, setSubmitLoading] = useState(false);
//   const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

//   // ফর্ম ইনপুট স্টেট
//   const [paymentMethod, setPaymentMethod] = useState('Bkash');
//   const [accountDetails, setAccountDetails] = useState('');

//   // ইউজারের কারেন্ট মাসের লাইভ আর্নিং ডাটা লেজার থেকে তুলে আনা
//     // ইউজারের কারেন্ট মাসের আর্নিং ডাটা লেজার থেকে তুলে আনা
//   const fetchMyCurrentEarnings = async () => {
//     setLoading(true);
//     try {
//       const response = await API.get(`/commissions?year=${currentYear}&month=${currentMonth}`);
      
//       if (response.data.success) {
//         // 🔒 🆕 শর্ত: অ্যাডমিন যদি লেজার লক (Permanent Save) না করে, তবে ইউজারের ব্যালেন্স ৳০ দেখাবে
//         if (!response.data.isSavedRecord) {
//           setMyEarnings({
//             baseCommission: 0,
//             monthlyBonusAmount: 0,
//             globalPoolBonusAmount: 0,
//             netTotalEarnings: 0,
//             isQualified: false,
//             isLockedByAdmin: false // ট্র্যাকিংয়ের জন্য নতুন ফ্ল্যাগ
//           });
//           setLoading(false);
//           return; // এখানেই ফাংশন শেষ, নিচের ডাটা ম্যাপিং স্কিপ করবে
//         }

//         // 🔓 যদি অ্যাডমিন ইতিমধ্যে লক করে থাকে (isSavedRecord: true), তবেই নিচে ব্যালেন্স দেখাবে
//         if (userRole.toLowerCase() === 'dealer') {
//           const myData = response.data.dealers?.find(d => d.dealerId === userIdNo);
//           if (myData) {
//             setMyEarnings({
//               baseCommission: myData.commission || 0,
//               monthlyBonusAmount: 0,
//               globalPoolBonusAmount: 0,
//               netTotalEarnings: myData.commission || 0,
//               isQualified: myData.status === 'Qualified',
//               isLockedByAdmin: true
//             });
//           }
//         } else {
//           const myData = response.data.data?.find(e => e.idNo === userIdNo);
//           if (myData) {
//             setMyEarnings({
//               baseCommission: myData.baseCommission || 0,
//               monthlyBonusAmount: myData.monthlyBonusAmount || 0,
//               globalPoolBonusAmount: myData.globalPoolBonusAmount || 0,
//               netTotalEarnings: myData.netTotalEarnings || 0,
//               isQualified: myData.qualificationStatus === 'Qualified',
//               isLockedByAdmin: true
//             });
//           }
//         }
//       }
//     } catch (error) {
//       console.error("Wallet Fetch Error:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchMyCurrentEarnings();
//   }, []);

//   // 🚀 ক্যাশ-আউট রিকোয়েস্ট সাবমিট ফাংশন
//   const handleCashoutSubmit = async (e) => {
//     e.preventDefault();
//     if (myEarnings.netTotalEarnings <= 0 || !myEarnings.isQualified) {
//       setStatusMessage({ type: 'error', text: 'You do not have any qualified balance to withdraw!' });
//       return;
//     }
//     if (!accountDetails) {
//       setStatusMessage({ type: 'error', text: 'Please enter your Account details/Number!' });
//       return;
//     }

//     setSubmitLoading(true);
//     setStatusMessage({ type: '', text: '' });

//     try {
//       const response = await API.post('/payouts/create', {
//         userIdNo,
//         name: userName,
//         userType: userRole.toLowerCase() === 'dealer' ? 'Dealer' : 'Employee',
//         amount: myEarnings.netTotalEarnings,
//         year: currentYear,
//         month: currentMonth,
//         paymentMethod,
//         accountDetails
//       });

//       if (response.data.success) {
//         setStatusMessage({ type: 'success', text: response.data.message || 'Withdrawal request submitted successfully!' });
//         setAccountDetails('');
//       }
//     } catch (err) {
//       setStatusMessage({
//         type: 'error',
//         text: err.response?.data?.message || 'Failed to submit payout request. It might be already processed.'
//       });
//     } finally {
//       setSubmitLoading(false);
//     }
//   };

//   return (
//     <div className="p-6 bg-slate-50 min-h-screen font-sans">
      
//       {/* 🔝 হেডার */}
//       <div className="mb-6">
//         <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
//           <Wallet className="text-brand" size={28} />
//           My Earnings Wallet
//         </h2>
//         <p className="text-xs text-slate-500 mt-1">💰 চলতি মাসের অর্জিত ব্যালেন্স ওভারভিউ এবং ক্যাশ-আউট গেটওয়ে।</p>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
//         {/* 📊 বাম অংশ: আর্নিং কার্ড এবং ব্রেকডাউন */}
//         <div className="lg:col-span-2 space-y-6">
          
//           {/* মেইন ক্যাশ ব্যালেন্স কার্ড */}
//           <div className="bg-brand-dark rounded-3xl p-6 text-white relative overflow-hidden shadow-xl shadow-slate-900/10">
//             <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 text-white/5 pointer-events-none">
//               <Wallet size={200} />
//             </div>
            
//             <div className="flex justify-between items-start">
//               <div>
//                 <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Available Payout Balance</span>
//                 <h3 className="text-4xl font-black mt-1">
//                   {loading ? <RefreshCw className="animate-spin inline text-brand" size={30} /> : `৳${myEarnings.netTotalEarnings.toLocaleString()}`}
//                 </h3>
//               </div>
//               <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${myEarnings.isQualified ? 'bg-emerald-500 text-white' : 'bg-red-500/20 text-red-400'}`}>
//                 {myEarnings.isQualified ? 'Qualified' : 'Not Qualified'}
//               </span>
//             </div>

//             <div className="mt-8 flex items-center gap-4 text-xs font-semibold text-slate-400 border-t border-slate-800 pt-4">
//               <div className="flex items-center gap-1.5"><Calendar size={14} className="text-brand" /> Period: <span className="text-slate-200">{new Date(0, currentMonth - 1).toLocaleString('en', { month: 'long' })}, {currentYear}</span></div>
//               <div>• ID: <span className="text-slate-200 font-mono">{userIdNo}</span></div>
//             </div>
//           </div>

//           {/* 📋 বিস্তারিত ইনকাম ব্রেকডাউন (শুধুমাত্র কর্মচারীদের জন্য প্রযোজ্য) */}
//           {userRole.toLowerCase() !== 'dealer' && (
//             <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
//               <h4 className="text-sm font-bold text-slate-800 mb-4">Earnings Breakdown</h4>
//               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold">
//                 <div className="p-4 bg-indigo-50/40 border border-indigo-50 rounded-xl">
//                   <span className="text-slate-400 block mb-1">Gap Commission</span>
//                   <span className="text-lg font-black text-indigo-600">৳{myEarnings.baseCommission.toLocaleString()}</span>
//                 </div>
//                 <div className="p-4 bg-amber-50/40 border border-amber-50 rounded-xl">
//                   <span className="text-slate-400 block mb-1">Performance Bonus</span>
//                   <span className="text-lg font-black text-amber-600">৳{myEarnings.monthlyBonusAmount.toLocaleString()}</span>
//                 </div>
//                 <div className="p-4 bg-emerald-50/40 border border-emerald-50 rounded-xl">
//                   <span className="text-slate-400 block mb-1">Global Pool Share</span>
//                   <span className="text-lg font-black text-emerald-600">৳{myEarnings.globalPoolBonusAmount.toLocaleString()}</span>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* 💳 ডান অংশ: ক্যাশ-আউট রিকোয়েস্ট ফর্ম */}
//         <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-fit">
//           <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
//             <ArrowUpRight className="text-red-500" size={20} />
//             Request Cashout
//           </h4>
//           <p className="text-[11px] text-slate-400 mt-0.5">আপনার অর্জিত পুরো মান্থলি কমিশন এক ক্লিকে উইথড্র করুন।</p>

//                     {/* নোটিফিকেশন মেসেজ */}
//           {statusMessage.text && (
//             <div className={`mt-4 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
//               statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'
//             }`}>
//               {statusMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
//               {statusMessage.text}
//             </div>
//           )}

//           <form onSubmit={handleCashoutSubmit} className="mt-5 space-y-4">
//             <div>
//               <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Payment Method</label>
//               <div className="grid grid-cols-3 gap-2">
//                 {['Bkash', 'Nagad', 'Bank'].map(method => (
//                   <button 
//                     key={method} 
//                     type="button"
//                     onClick={() => setPaymentMethod(method)}
//                     className={`py-2 px-3 border rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all ${
//                       paymentMethod === method 
//                         ? 'border-brand bg-brand/5 text-brand-dark' 
//                         : 'border-slate-200 text-slate-500 hover:bg-slate-50'
//                     }`}
//                   >
//                     {method === 'Bank' ? <Banknote size={16} /> : <CreditCard size={16} />}
//                     {method}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             <div>
//               <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">
//                 {paymentMethod === 'Bank' ? 'Bank Account Details (Name, Branch, A/C)' : `${paymentMethod} Mobile Number`}
//               </label>
//               <textarea
//                 rows={paymentMethod === 'Bank' ? 3 : 1}
//                 placeholder={paymentMethod === 'Bank' ? 'Enter Bank Name, Account No, Routing & Branch...' : 'e.g. 017XXXXXXXX'}
//                 value={accountDetails}
//                 onChange={(e) => setAccountDetails(e.target.value)}
//                 required
//                 className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold outline-none focus:border-brand transition-all resize-none"
//               />
//             </div>

//             <button
//               type="submit"
//               disabled={submitLoading || myEarnings.netTotalEarnings <= 0 || !myEarnings.isQualified}
//               className="w-full py-3 bg-brand-dark hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
//             >
//               {submitLoading ? <RefreshCw size={14} className="animate-spin" /> : null}
//               Submit Withdrawal Request
//             </button>

//             {/* 🆕 কন্ডিশনাল মেসেজ আপডেট */}
//             {!myEarnings.isLockedByAdmin ? (
//               <p className="text-[10px] text-center font-semibold text-amber-600 mt-2 bg-amber-50 p-2 rounded-lg border border-amber-100">
//                 ⏳ এই মাসের কমিশন লেজার এখনো অ্যাডমিন প্যানেল থেকে চূড়ান্ত অনুমোদন (Lock) করা হয়নি। অনুমোদন শেষে আপনার ব্যালেন্স আপডেট হবে।
//               </p>
//             ) : (!myEarnings.isQualified || myEarnings.netTotalEarnings <= 0) && (
//               <p className="text-[10px] text-center font-semibold text-red-500 mt-2">
//                 ⚠️ এই মাসে বোনাস পাওয়ার শর্ত (কোয়ালিফিকেশন বা সেলস টার্গেট) পূরণ হয়নি।
//               </p>
//             )}
//           </form>
//         </div>
//       </div>

//             {/* 🔽 নতুন যুক্ত হলো: উইথড্র হিস্ট্রি টেবিল */}
//             <UserPayoutHistory />
//     </div>
//   );
// };

// export default UserWallet;



// 2nd version of UserWallet.jsx with improved UI and additional features.
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
  const userIdNo = localStorage.getItem('userIdNo')?.trim() || 'N/A';
  const userName = localStorage.getItem('userName') || 'User Name';

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  // 🎯 পাস্ট মান্থ/বকেয়া বিল ট্র্যাকিংয়ের জন্য ফিল্টার স্টেট (ডাইনামিক মান্থ সিঙ্ক)
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  // স্টেট ম্যানেজমেন্ট
  const [myEarnings, setMyEarnings] = useState({
    baseCommission: 0,
    dealerCommissionAmount: 0, 
    monthlyBonusAmount: 0,
    globalPoolBonusAmount: 0,
    grossEarningsTotal: 0,     
    serviceCharge: 0,          
    netTotalEarnings: 0,       
    isQualified: false,
    isLockedByAdmin: false
  });
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  // ফর্ম ইনপুট স্টেট
  const [paymentMethod, setPaymentMethod] = useState('Bkash');
  const [accountDetails, setAccountDetails] = useState('');

  const months = [
    { value: 1, name: 'January' }, { value: 2, name: 'February' }, { value: 3, name: 'March' }, 
    { value: 4, name: 'April' }, { value: 5, name: 'May' }, { value: 6, name: 'June' }, 
    { value: 7, name: 'July' }, { value: 8, name: 'August' }, { value: 9, name: 'September' }, 
    { value: 10, name: 'October' }, { value: 11, name: 'November' }, { value: 12, name: 'December' }
  ];
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // 🔄 ইউজারের সিলেক্টেড মাসের লাইভ আর্নিং ডাটা লেজার শিট থেকে তুলে আনা
  const fetchMyCurrentEarnings = async () => {
    setLoading(true);
    setStatusMessage({ type: '', text: '' }); 
    try {
      // 🚀 currentMonth-এর বদলে এখন সিলেক্টেড selectedMonth ও selectedYear কুয়েরি হবে
      const response = await API.get(`/commissions/my-salary-sheet?idNo=${userIdNo}&year=${selectedYear}&month=${selectedMonth}`);
      
      if (response.data.success && response.data.data) {
        const serverData = response.data.data;
        
        const baseComm = Number(serverData.baseCommission || 0);
        const dealerComm = Number(serverData.dealerCommissionAmount || serverData.dealerProfile?.dealerCommission || 0);
        const poolBonus = Number(serverData.globalPoolBonusAmount || 0);
        const monthlyBonus = Number(serverData.monthlyBonusAmount || 0);

        const gross = baseComm + dealerComm + poolBonus + monthlyBonus;
        const charge = Math.round(gross * 0.10);
        const netPayable = gross - charge;

        setMyEarnings({
          baseCommission: baseComm,
          dealerCommissionAmount: dealerComm,
          monthlyBonusAmount: monthlyBonus,
          globalPoolBonusAmount: poolBonus,
          grossEarningsTotal: serverData.financials?.grandTotal || gross,
          serviceCharge: serverData.financials?.serviceCharge || charge,
          netTotalEarnings: serverData.financials?.netPayable || netPayable,
          isQualified: serverData.qualificationStatus === 'Qualified' || serverData.dealerProfile?.status === 'Qualified',
          isLockedByAdmin: serverData.isStaffRecordFound || serverData.dealerProfile?.isDealerRecordFound
        });
      } else {
        resetWalletBalances();
      }
    } catch (error) {
      console.error("Wallet Fetch Error:", error);
      resetWalletBalances();
    } finally {
      setLoading(false);
    }
  };

  const resetWalletBalances = () => {
    setMyEarnings({
      baseCommission: 0,
      dealerCommissionAmount: 0,
      monthlyBonusAmount: 0,
      globalPoolBonusAmount: 0,
      grossEarningsTotal: 0,
      serviceCharge: 0,
      netTotalEarnings: 0,
      isQualified: false,
      isLockedByAdmin: false
    });
  };

  // 🎯 যখনই ইউজার ড্রপডাউন থেকে মাস বা বছর পরিবর্তন করবেন, তখনই আর্নিং পুনরায় ক্যালকুলেট হবে
  useEffect(() => {
    fetchMyCurrentEarnings();
  }, [selectedYear, selectedMonth]);

  // 🚀 ক্যাশ-আউট রিকোয়েস্ট সাবমিট ফাংশন (সিলেক্টেড মাস ট্র্যাকিং সহ)
  const handleCashoutSubmit = async (e) => {
    e.preventDefault();
    
    if (!myEarnings.isLockedByAdmin) {
      setStatusMessage({ type: 'error', text: 'This target month ledger is not locked or released by admin yet!' });
      return;
    }
    if (myEarnings.netTotalEarnings <= 0 || !myEarnings.isQualified) {
      setStatusMessage({ type: 'error', text: 'You do not have any qualified balance to withdraw for this month!' });
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
        year: selectedYear,   // 🎯 সিলেক্টেড ইয়ার ব্যাকএন্ডে যাবে
        month: selectedMonth, // 🎯 সিলেক্টেড মান্থ ব্যাকএন্ডে যাবে
        paymentMethod: paymentMethod === 'Bank' ? 'Bank Transfer' : paymentMethod, 
        accountDetails
      });

      if (response.data.success) {
        setStatusMessage({ type: 'success', text: response.data.message || 'Withdrawal request submitted successfully for the selected month!' });
        setAccountDetails('');
        fetchMyCurrentEarnings(); 
      }
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to submit payout request. It might be already processed for this month.'
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans">
      
      {/* 🔝 হেডার ও ডাইনামিক ফিল্টার বার */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Wallet className="text-indigo-600" size={28} />
            My Earnings Wallet
          </h2>
          <p className="text-xs text-slate-500 mt-1">💰 বকেয়া বা যেকোনো মাসের অর্জিত ব্যালেন্স সিলেক্ট করে ক্যাশ-আউট করুন।</p>
        </div>

        {/* 🎯 মাস ও বছর সিলেক্টর ড্রপডাউন উইজেট */}
        <div className="flex flex-wrap items-center gap-2.5 bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex-shrink-0">
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))} className="bg-transparent text-xs font-bold text-slate-600 outline-none pr-4 cursor-pointer">
            {months.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
          </select>
          <div className="h-4 w-px bg-slate-200"></div>
          <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="bg-transparent text-xs font-bold text-slate-600 outline-none pr-4 cursor-pointer">
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button onClick={fetchMyCurrentEarnings} className="text-slate-400 hover:text-indigo-600 transition-colors pl-1">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 📊 বাম অংশ: আর্নিং কার্ড এবং বিস্তারিত ব্রেকডাউন */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* মেইন ক্যাশ ব্যালেন্স কার্ড */}
          <div className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden shadow-xl shadow-slate-900/10">
            <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 text-white/5 pointer-events-none">
              <Wallet size={200} />
            </div>
            
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Available Payout Balance (Net)</span>
                <h3 className="text-4xl font-black mt-1">
                  {loading ? <RefreshCw className="animate-spin inline text-indigo-500" size={30} /> : `৳${myEarnings.netTotalEarnings.toLocaleString()}`}
                </h3>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${myEarnings.isQualified ? 'bg-emerald-500 text-white' : 'bg-red-500/20 text-red-400'}`}>
                {myEarnings.isQualified ? 'Qualified' : 'Not Qualified'}
              </span>
            </div>

            <div className="mt-8 flex items-center gap-4 text-xs font-semibold text-slate-400 border-t border-slate-800 pt-4">
              <div className="flex items-center gap-1.5">
                <Calendar size={14} className="text-indigo-500" /> 
                Selected Period: <span className="text-slate-200">{months.find(m => m.value === selectedMonth)?.name}, {selectedYear}</span>
              </div>
              <div>• ID: <span className="text-slate-200 font-mono">{userIdNo}</span></div>
            </div>
          </div>

          {/* 📋 বিস্তারিত ইনকাম ব্রেকডাউন সামারি */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <h4 className="text-sm font-bold text-slate-800 mb-4">Earnings Breakdown ({months.find(m => m.value === selectedMonth)?.name})</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-semibold">
              
              <div className="p-3.5 bg-indigo-50/40 border border-indigo-50 rounded-xl">
                <span className="text-slate-400 block mb-1">Base Staff Comm.</span>
                <span className="text-base font-black text-indigo-600">৳{myEarnings.baseCommission.toLocaleString()}</span>
              </div>

              <div className={`p-3.5 border rounded-xl ${myEarnings.dealerCommissionAmount > 0 ? 'bg-emerald-50/40 border-emerald-100' : 'bg-slate-50/40 border-slate-100 opacity-60'}`}>
                <span className="text-slate-400 block mb-1">Dealer Commission</span>
                <span className="text-base font-black text-emerald-600">৳{myEarnings.dealerCommissionAmount.toLocaleString()}</span>
              </div>

              <div className="p-3.5 bg-amber-50/40 border border-amber-50 rounded-xl">
                <span className="text-slate-400 block mb-1">Performance Bonus</span>
                <span className="text-base font-black text-amber-600">৳{myEarnings.monthlyBonusAmount.toLocaleString()}</span>
              </div>

              <div className="p-3.5 bg-sky-50/40 border border-sky-50 rounded-xl">
                <span className="text-slate-400 block mb-1">Global Pool Share</span>
                <span className="text-base font-black text-sky-600">৳{myEarnings.globalPoolBonusAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* গ্রস টোটাল বনাম ১০% সার্ভিস চার্জ অডিট ইনফো */}
            {myEarnings.grossEarningsTotal > 0 && (
              <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap gap-6 text-[11px] font-bold text-slate-500">
                <div>Gross Earnings: <span className="text-slate-800 font-mono">৳{myEarnings.grossEarningsTotal.toLocaleString()}</span></div>
                <div className="text-rose-600">Less Service Charge (10%): <span className="font-mono">- ৳{myEarnings.serviceCharge.toLocaleString()}</span></div>
              </div>
            )}
          </div>
        </div>

                {/* 💳 ডান অংশ: ক্যাশ-আউট রিকোয়েস্ট ফর্ম */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-fit">
          <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <ArrowUpRight className="text-red-500" size={20} />
            Request Cashout
          </h4>
          <p className="text-[11px] text-slate-400 mt-0.5">নির্বাচিত মাসের সম্পূর্ণ নিট কমিশন উইথড্র করুন।</p>

          {statusMessage.text && (
            <div className={`mt-4 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
              statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'
            }`}>
              {statusMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
              <span className="leading-tight">{statusMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleCashoutSubmit} className="mt-5 space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Payment Method</label>
              {/* 🎯 ৪টি মেথডের জন্য grid-cols-2 sm:grid-cols-4 সেট করা হয়েছে */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['Bkash', 'Nagad', 'Bank', 'Cash'].map(method => (
                  <button 
                    key={method} 
                    type="button"
                    disabled={myEarnings.payoutStatus === 'Pending' || myEarnings.payoutStatus === 'Paid'}
                    onClick={() => setPaymentMethod(method)}
                    className={`py-2 px-3 border rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all ${
                      paymentMethod === method 
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-950' 
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
                {paymentMethod === 'Bank' 
                  ? 'Bank Account Details (Name, Branch, A/C)' 
                  : paymentMethod === 'Cash'
                  ? 'Office Location / Disbursing Counter Details'
                  : `${paymentMethod} Mobile Number`
                }
              </label>
              <textarea
                rows={paymentMethod === 'Bank' || paymentMethod === 'Cash' ? 3 : 1}
                disabled={myEarnings.payoutStatus === 'Pending' || myEarnings.payoutStatus === 'Paid'}
                placeholder={
                  paymentMethod === 'Bank' 
                    ? 'Enter Bank Name, Account No, Routing & Branch...' 
                    : paymentMethod === 'Cash'
                    ? 'e.g. Head Office (Banani Branch) or Self Pick up...'
                    : 'e.g. 017XXXXXXXX'
                }
                value={accountDetails}
                onChange={(e) => setAccountDetails(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold outline-none focus:border-indigo-600 transition-all resize-none disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={submitLoading || myEarnings.netTotalEarnings <= 0 || !myEarnings.isQualified || myEarnings.payoutStatus === 'Pending' || myEarnings.payoutStatus === 'Paid'}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              {submitLoading ? <RefreshCw size={14} className="animate-spin" /> : null}
              {myEarnings.payoutStatus === 'Paid' ? 'Payout Disbursed (Paid)' : myEarnings.payoutStatus === 'Pending' ? 'Approval Pending...' : 'Submit Withdrawal Request'}
            </button>

            {/* 🆕 কন্ডিশনাল মেসেজ আপডেট */}
            {!myEarnings.isLockedByAdmin ? (
              <p className="text-[10px] text-center font-semibold text-amber-600 mt-2 bg-amber-50 p-2 rounded-lg border border-amber-100">
                ⏳ এই নির্বাচিত মাসের কমিশন লেজার এখনও অ্যাডমিন অনুমোদন (Lock) করেনি।
              </p>
            ) : myEarnings.payoutStatus === 'Paid' ? (
              <p className="text-[10px] text-center font-semibold text-green-600 mt-2 bg-green-50 p-2 rounded-lg border border-green-100">
                ✅ এই মাসের বিল সম্পূর্ণ পরিশোধ (Paid) করা হয়েছে।
              </p>
            ) : myEarnings.payoutStatus === 'Pending' ? (
              <p className="text-[10px] text-center font-semibold text-amber-600 mt-2 bg-amber-50 p-2 rounded-lg border border-amber-100">
                ⏳ আপনার রিকোয়েস্ট অ্যাডমিন প্যানেলে পেন্ডিং আছে। পেইড হলে ব্যালেন্স ০ হবে।
              </p>
            ) : (!myEarnings.isQualified || myEarnings.netTotalEarnings <= 0) && (
              <p className="text-[10px] text-center font-semibold text-red-500 mt-2">
                ⚠️ এই মাসে বোনাস পাওয়ার শর্ত (কোয়ালিফিকেশন বা সেলস টার্গেট) পূরণ হয়নি।
              </p>
            )}
          </form>
        </div>

      </div>

      {/* 🔽 উইথড্র হিস্ট্রি টেবিল */}
      <UserPayoutHistory />
    </div>
  );
};

export default UserWallet;



// 3rd version of UserWallet.jsx with enhanced features and better UI.
