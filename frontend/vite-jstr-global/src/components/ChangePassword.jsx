import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Lock, Eye, EyeOff, Loader2 } from 'lucide-react'; 

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const { currentPassword, newPassword, confirmPassword } = formData;
  const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'; 

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      return toast.error("New passwords do not match!");
    }

    if (newPassword.length < 6) {
      return toast.error("Password must be at least 6 characters long");
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token'); 

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };

      console.log("Sending data to backend:", { currentPassword, newPassword });

      const response = await axios.put(
        `${SERVER_URL}/api/users/change-password`,
        { currentPassword, newPassword }, 
        config
      );

      if (response.data.success) {
        toast.success(response.data.message || 'Password updated successfully!');
        setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      console.error("Backend Error Detail:", error.response?.data);
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
            <Lock size={24} color="#2563eb" />
          </div>
          <h2 style={styles.title}>Update Password</h2>
          <p style={styles.subtitle}>Ensure your account is using a long, random password to stay secure.</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Current Password */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Current Password</label>
            <div style={styles.inputWrapper}>
              <input
                type={showCurrent ? "text" : "password"}
                name="currentPassword"
                value={currentPassword}
                onChange={handleChange}
                required
                placeholder="••••••••"
                style={styles.input}
              />
              <button 
                type="button" 
                onClick={() => setShowCurrent(!showCurrent)} 
                style={styles.eyeButton}
              >
                {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>New Password</label>
            <div style={styles.inputWrapper}>
              <input
                type={showNew ? "text" : "password"}
                name="newPassword"
                value={newPassword}
                onChange={handleChange}
                required
                placeholder="••••••••"
                style={styles.input}
              />
              <button 
                type="button" 
                onClick={() => setShowNew(!showNew)} 
                style={styles.eyeButton}
              >
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
                name="confirmPassword"
                value={confirmPassword}
                onChange={handleChange}
                required
                placeholder="••••••••"
                style={styles.input}
              />
              <button 
                type="button" 
                onClick={() => setShowConfirm(!showConfirm)} 
                style={styles.eyeButton}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              ...styles.submitBtn, 
              backgroundColor: loading ? '#93c5fd' : '#2563eb',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? (
              <span style={styles.loaderFlex}>
                <Loader2 size={18} style={styles.spinner} /> Updating...
              </span>
            ) : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '80vh',
    padding: '20px',
    backgroundColor: '#f8fafc',
  },
  container: {
    width: '100%',
    maxWidth: '440px',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    padding: '32px 24px',
    boxSizing: 'border-box',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    marginBottom: '28px',
  },
  iconCircle: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: '#eff6ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
  },
  title: {
    fontSize: '22px',
    fontWeight: '600',
    color: '#1e293b',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748b',
    margin: 0,
    lineHeight: '1.5',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#334155',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    padding: '12px 40px 12px 14px',
    fontSize: '15px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#1e293b',
    outline: 'none',
    boxSizing: 'border-box',
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
    justifyContent: 'center',
    padding: 0,
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
  },
  loaderFlex: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  spinner: {
    animation: 'spin 1s linear infinite',
  }
};

export default ChangePassword;
