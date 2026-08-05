import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import { useLanguage } from '../context/LanguageContext'; // ✅ এটি সঠিক পাথ

const Login = () => {
  const [idNo, setIdNo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { language, toggleLanguage, t } = useLanguage(); // ভাষা এবং ডিকশনারি নিলেন

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await API.post('/users/login', { idNo, password });
      
      // 💾 লোকাল স্টোরেজে টোকেন ও বেসিক ডেটা সংরক্ষণ
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userRole', response.data.role);
      localStorage.setItem('userIdNo', response.data.idNo);
      localStorage.setItem('userName', response.data.name);
      
      // ✅ ফিক্স: ব্যাকএন্ড সরাসরি 'response.data.department' পাঠাচ্ছে (কোনো .user অবজেক্ট ছাড়াই)
      localStorage.setItem('userDepartmentName', response.data.departmentName || 'N/A');
      localStorage.setItem('userDepartmentCode', response.data.departmentCode || 'N/A'); 

      // 🔄 ৩ ধরণের ইউজারের রোল অনুযায়ী ডাইনামিক রিডাইরেকশন (কেস-সেন্সিটিভ ফিক্সড)
      const role = response.data.role;
      if (role === "Admin" || role === "admin") {
        navigate('/admin-panel'); 
      } else if (role === "Employee" || role === "employee") {
        navigate('/employee-panel'); 
      } else if (role === "Dealer" || role === "dealer") {
        navigate('/dealer-panel'); 
      } else {
        navigate('/'); // কোনো রোল ম্যাচ না করলে ডিফল্ট হোম
      }
      
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-brand-dark p-4 relative">
      
      {/* ভাষা পরিবর্তনের টগল বাটন (টপ-রাইট কর্নারে থাকবে) */}
      <button 
        onClick={toggleLanguage}
        className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white font-medium px-4 py-2 rounded-lg border border-white/20 transition-all text-sm"
      >
        {language === 'en' ? '🌐 বাংলা' : '🌐 English'}
      </button>

      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-erp-card border border-slate-100">
        <div className="text-center mb-8">
          {/* ডিকশনারি থেকে ডাইনামিক টেক্সট বসানো হচ্ছে */}
          <h2 className="text-3xl font-extrabold text-brand tracking-tight">{t.title}</h2>
          <p className="text-textSecondary mt-2 text-sm">{t.loginSub}</p>
        </div>

        {error && (
          <div className="mb-5 bg-red-50 text-red-600 border-l-4 border-red-500 p-3 rounded-r-lg text-sm font-medium">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">{t.idNoLabel}</label>
            <input type="text" value={idNo} onChange={(e) => setIdNo(e.target.value)} placeholder="ID Number" required className="erp-input" />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">{t.passLabel}</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="erp-input" />
          </div>

          <button type="submit" disabled={loading} className="erp-btn-primary">
            {loading ? t.loading : t.loginBtn}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
