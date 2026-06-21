
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  // ১. ইউজার লগইন না থাকলে সরাসরি লগইন পেজে পাঠিয়ে দেবে
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // ২. রোল-বেসড রেস্ট্রিকশন (অ্যাডমিনের পেজে সাধারণ কর্মচারী ঢুকতে চাইলে)
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    alert("You don't have permission to access this page");
    return <Navigate to="/dashboard" replace />;
  }

  // সবকিছু ঠিক থাকলে নির্দিষ্ট পেজটি দেখতে দেবে
  return children;
};

export default ProtectedRoute;
