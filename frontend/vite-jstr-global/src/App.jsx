
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Login from './pages/Login';
import AdminPanel from './pages/AdminPanel';
import ProtectedRoute from './components/ProtectedRoute';

// ড্যাশবোর্ড কম্পোনেন্ট (Navbar ও লিংকের সুবিধার্থে সামান্য আপডেট করা হয়েছে)
const Dashboard = () => {
  const role = localStorage.getItem('userRole');
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>🎉 স্বাগতম ERP ড্যাশবোর্ডে!</h1>
      <p>আপনার অ্যাকাউন্ট রোল: <strong style={{ color: 'green' }}>{role}</strong></p>
      
      {/* শুধুমাত্র অ্যাডমিন হলে এই সিক্রেট লিংকটি দেখা যাবে */}
      {role === 'admin' && (
        <div style={{ margin: '15px 0', padding: '10px', background: '#e2e8f0', borderRadius: '5px' }}>
          <p>আপনি একজন অ্যাডমিন! নিচের লিংকে ক্লিক করুন:</p>
          <Link to="/admin-panel" style={{ fontWeight: 'bold', color: 'blue' }}>অ্যাডমিন প্যানেলে যান</Link>
        </div>
      )}

      <button onClick={handleLogout} style={{ marginTop: '20px', padding: '8px 15px', backgroundColor: 'red', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>লগআউট</button>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />

        {/* ড্যাশবোর্ড প্রটেক্টেড: যে কেউ লগইন করলেই ঢুকতে পারবে */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />

        {/* অ্যাডমিন প্যানেল প্রটেক্টেড: লগইন প্লাস শুধুমাত্র 'admin' রোল লাগবে */}
        <Route 
          path="/admin-panel" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminPanel />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
