
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
      

        {/* অ্যাডমিন প্যানেল প্রটেক্টেড: লগইন প্লাস শুধুমাত্র 'admin' রোল লাগবে */}
        <Route 
          path="/admin-panel" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Sidebar/>
            </ProtectedRoute>
          } 
        />

      
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['employee']}>
              <Sidebar/>
            </ProtectedRoute>
          } 
        />
      </Routes>

      
    </Router>
  );
}

export default App;
