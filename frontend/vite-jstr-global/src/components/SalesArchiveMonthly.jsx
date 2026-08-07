import { useState } from 'react';
import API from '../api'; // আপনার তৈরি করা অ্যাক্সিওস/এপিআই ক্লায়েন্ট
import { Archive, RefreshCw, CheckCircle2 } from 'lucide-react';

const SalesArchiveMonthly = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const handleArchiveTrigger = async () => {
    setLoading(true);
    setMessage('');
    setShowConfirm(false);
    
    try {
      // ব্যাকএন্ড এপিআই কল
      const response = await API.post('/sales/archive-monthly');
      setMessage(response.data.message || 'Archived successfully!');
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || 'Failed to archive monthly sales.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-erp-card border border-slate-100 max-w-xl my-6">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
          <Archive size={24} />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-slate-800">Monthly Sales Data Archiver</h3>
          <p className="text-slate-500 text-sm mt-1">
            এই বাটনে ক্লিক করলে চলতি মাসের সমস্ত ইনভয়েসের ভেতরে ডিলার এবং কর্মচারীর নাম-আইডি স্থায়ীভাবে লক হয়ে যাবে। পরবর্তীতে তাদের আইডি পরিবর্তন হলেও অতীতের এই সেলস রেকর্ড কখনো পরিবর্তন হবে না।
          </p>
          
          {/* নোটিফিকেশন মেসেজ */}
          {message && (
            <div className={`mt-4 p-3 rounded-lg text-sm font-medium flex items-center gap-2 ${
              message.includes('Success') || message.includes('successfully')
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                : 'bg-blue-50 text-blue-700 border border-blue-200'
            }`}>
              <CheckCircle2 size={16} />
              {message}
            </div>
          )}

          {/* অ্যাকশন বাটন */}
          <div className="mt-5">
            {!showConfirm ? (
              <button
                onClick={() => setShowConfirm(true)}
                disabled={loading}
                className="px-4 py-2.5 bg-brand-dark hover:bg-slate-800 text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm transition-all"
              >
                {loading ? <RefreshCw size={16} className="animate-spin" /> : null}
                Run Monthly Archive Lock
              </button>
            ) : (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <p className="text-xs font-bold text-red-600">⚠️ আপনি কি নিশ্চিত? এই অ্যাকশনটি রিভার্স করা যাবে না!</p>
                <div className="flex gap-3">
                  <button
                    onClick={handleArchiveTrigger}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-all"
                  >
                    হ্যাঁ, আর্কাইভ লক করুন
                  </button>
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg transition-all"
                  >
                    বাতিল করুন
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesArchiveMonthly;
