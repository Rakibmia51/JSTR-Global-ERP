import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Search, Eye, EyeOff, Loader2, ShieldCheck, UserCheck } from 'lucide-react'; 

const AdminChangePassword = () => {
  const [targetId, setTargetId] = useState('');
  const [accountName, setAccountName] = useState(''); 
  const [accountType, setAccountType] = useState(''); 
  const [nameLoading, setNameLoading] = useState(false); 

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'; 

  const fetchAccountName = async (idValue) => {
    const id = idValue || targetId;
    if (!id || id.trim().length < 4) return;

    try {
      setNameLoading(true);
      setAccountName('');
      setAccountType('');
      const token = localStorage.getItem('token');

      const response = await axios.get(
        `${SERVER_URL}/api/users/admin/get-name/${id.trim()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setAccountName(response.data.name);
        setAccountType(response.data.type);
      }
    } catch (error) {
      setAccountName('');
      setAccountType('');
      const errMsg = error.response?.data?.message || 'Account not found!';
      toast.error(errMsg);
    } finally {
      setNameLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!targetId) return toast.error("Please enter a User ID or Dealer ID");
    if (!accountName) return toast.error("Please verify the account ID first!");
    if (newPassword !== confirmPassword) return toast.error("Passwords do not match!");
    if (newPassword.length < 6) return toast.error("Password must be at least 6 characters long");

    try {
      setLoading(true);
      const token = localStorage.getItem('token'); 

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.put(
        `${SERVER_URL}/api/users/admin/reset-password`,
        { targetId, newPassword }, 
        config
      );

      if (response.data.success) {
        toast.success(response.data.message || 'Password updated successfully!');
        setTargetId('');
        setAccountName('');
        setAccountType('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Something went wrong!';
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.iconCircle}>
            <ShieldCheck size={24} color="#2563eb" /> {/* মডার্ন ডার্ক টিল কালার আইকন */}
          </div>
          <h2 style={styles.title}>Admin Password Reset</h2>
          <p style={styles.subtitle}>Verify account identity and override access credentials secure.</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Target User / Dealer ID */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>User ID / Dealer ID</label>
            <div style={styles.inputWrapper}>
              <input
                type="text"
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                onBlur={() => fetchAccountName()} 
                required
                placeholder="e.g. MKT-0002 or DLR-0001"
                style={styles.input}
              />
              <button 
                type="button" 
                onClick={() => fetchAccountName()} 
                style={styles.searchButton}
                disabled={nameLoading}
              >
                {nameLoading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Search size={16} />}
              </button>
            </div>

            {/* লাইভ নাম দেখানোর প্রিভিউ বক্স */}
            {accountName && (
              <div style={styles.namePreviewBox}>
                <UserCheck size={16} color="#2563eb" />
                <span style={styles.nameText}>
                  <strong>{accountType}:</strong> {accountName}
                </span>
              </div>
            )}
          </div>

          {/* New Password */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Force New Password</label>
            <div style={styles.inputWrapper}>
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{ ...styles.input, paddingRight: '40px', paddingLeft: '14px' }}
              />
              <button type="button" onClick={() => setShowNew(!showNew)} style={styles.eyeButton}>
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirm New Password</label>
            <div style={styles.inputWrapper}>
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{ ...styles.input, paddingRight: '40px', paddingLeft: '14px' }}
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={styles.eyeButton}>
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading || !accountName}
            style={{ 
              ...styles.submitBtn, 
              backgroundColor: (loading || !accountName) ? '#93c5fd' : '#2563eb', // টিল এবং গ্রে টগল কালার
              cursor: (loading || !accountName) ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Processing...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

// নতুন মডার্ন টিল এবং স্লেট থিম সিএসএস
const styles = {
  wrapper: { 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '80vh', 
    padding: '20px', 
   // backgroundColor: '#f1f5f9' // হালকা স্লেট গ্রে ব্যাকগ্রাউন্ড কালার
  },
  container: { 
    width: '100%', 
    maxWidth: '440px', 
    backgroundColor: '#ffffff', 
    borderRadius: '16px', 
    boxShadow: '0 10px 15px -3px rgb(15 118 110 / 0.05), 0 4px 6px -4px rgb(15 118 110 / 0.05)', 
    padding: '32px 24px', 
    boxSizing: 'border-box', 
    borderTop: '4px solid #2563eb' // টপ বর্ডার প্রিমিয়াম টিল কালার করা হয়েছে
  },
  header: { 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    textAlign: 'center', 
    marginBottom: '28px' 
  },
  iconCircle: { 
    width: '48px', 
    height: '48px', 
    borderRadius: '50%', 
    backgroundColor: '#93c5fd', // সফট লাইট টিল ব্যাকগ্রাউন্ড
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: '16px' 
  },
  title: { 
    fontSize: '22px', 
    fontWeight: '600', 
    color: '#0f172a', // ডিপ চারকোল ব্ল্যাক
    margin: '0 0 8px 0' 
  },
  subtitle: { 
    fontSize: '13px', 
    color: '#475569', 
    margin: 0, 
    lineHeight: '1.5' 
  },
  form: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '20px' 
  },
  inputGroup: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '6px' 
  },
  label: { 
    fontSize: '14px', 
    fontWeight: '500', 
    color: '#334155' 
  },
  inputWrapper: { 
    position: 'relative', 
    display: 'flex', 
    alignItems: 'center' 
  },
  input: { 
    width: '100%', 
    padding: '12px 50px 12px 14px', 
    fontSize: '15px', 
    borderRadius: '8px', 
    border: '1px solid #cbd5e1', 
    backgroundColor: '#ffffff', 
    color: '#0f172a', 
    outline: 'none', 
    boxSizing: 'border-box',
    transition: 'all 0.2s',
    ':focus': {
      borderColor: '#2563eb'
    }
  },
  searchButton: { 
    position: 'absolute', 
    right: '8px', 
    background: '#f8fafc', 
    border: '1px solid #e2e8f0', 
    color: '#2563eb', 
    cursor: 'pointer', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: '6px 10px', 
    borderRadius: '6px',
    transition: 'all 0.2s'
  },
  namePreviewBox: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    backgroundColor: '#f0fdfa', // প্রিভিউ বক্সটি হালকা ডার্ক-টিল লাইট ব্যাকগ্রাউন্ড
    padding: '10px 12px', 
    borderRadius: '8px', 
    border: '1px solid #99f6e4', 
    marginTop: '6px' 
  },
  nameText: { 
    fontSize: '14px', 
    color: '#0f766e' 
  },
  eyeButton: { 
    position: 'absolute', 
    right: '12px', 
    background: 'none', 
    border: 'none', 
    color: '#64748b', 
    cursor: 'pointer', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  submitBtn: { 
    width: '100%', 
    padding: '12px', 
    fontSize: '16px', 
    fontWeight: '500', 
    color: '#ffffff', 
    border: 'none', 
    borderRadius: '8px',
marginTop: '8px',
boxShadow: '0 4px 6px -1px rgb(15 118 110 / 0.1)'
}};

export default AdminChangePassword;