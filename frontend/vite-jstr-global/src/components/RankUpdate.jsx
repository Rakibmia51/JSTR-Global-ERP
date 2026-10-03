import  { useState } from 'react';
import axios from 'axios';

// Base application configuration (Update with your actual backend gateway URL if necessary)
 const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

const AVAILABLE_RANKS = [
  "SALES REPRESENTATIVE", "AM", "RSM", "DSM", 
  "SDSM", "SM", "NSM", "ED", "BOM"
];

export default function AdminRankPanel() {
  const [searchId, setSearchId] = useState('');
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [employee, setEmployee] = useState(null);
  const [selectedRank, setSelectedRank] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  // 1. Fetch employee tree metrics and rank configurations
  const handleFetchEmployee = async (e) => {
    e.preventDefault();
    if (!searchId.trim()) return;

    setLoading(true);
    setEmployee(null);
    setMessage({ type: '', text: '' });

    try {
      // Calls your getEmployeeDetailsById endpoint
      const response = await axios.get(`${SERVER_URL}/api/users/details/${searchId.trim()}`);
      
      // Checking structure from your userDetailsResponse formatter
      if (response.data && response.data.idNo) {
        setEmployee(response.data);
        setSelectedRank(response.data.currentRankPosition);
      } else if (response.data.success && response.data.data) {
        setEmployee(response.data.data);
        setSelectedRank(response.data.data.currentRankPosition);
      } else {
        setMessage({ type: 'error', text: 'No employee data resolved.' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Employee not found or server issue occurred.' 
      });
    } finally {
      setLoading(false);
    }
  };

  // 2. Submit manual rank overwrite via the true compression baseline
  const handleUpdateRank = async () => {
    if (!employee || !selectedRank) return;
    
    setUpdating(true);
    setMessage({ type: '', text: '' });

    try {
      // Calls the newly created updateEmployeeRankByAdmin endpoint
      const response = await axios.put(`${SERVER_URL}/api/rank-update/update`, {
        idNo: employee.idNo,
        newRank: selectedRank
      });

      if (response.data.success || response.status === 200) {
        setMessage({ 
          type: 'success', 
          text: response.data.message || `Rank updated to ${selectedRank} successfully!` 
        });
        
        // Instant structural sync: Refreshing baseline view metrics
        setEmployee(prev => ({
          ...prev,
          currentRankPosition: selectedRank
        }));
      }
    } catch (err) {
      console.error(err);
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Failed to update user rank configuration.' 
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🛡️ Admin Rank Management Dashboard</h2>
      <p style={styles.subtitle}>Override user rank metrics directly into the database validation engine.</p>

      {/* SEARCH INTERFACE BAR */}
      <form onSubmit={handleFetchEmployee} style={styles.searchForm}>
        <input
          type="text"
          placeholder="Enter Employee Marketing ID (e.g., MKT1002)"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          style={styles.input}
          disabled={loading}
        />
        <button type="submit" style={styles.searchBtn} disabled={loading}>
          {loading ? 'Searching...' : 'Lookup Account'}
        </button>
      </form>

      {/* STATUS & CONSOLE ERROR MESSAGES */}
      {message.text && (
        <div style={{
          ...styles.alert,
          backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
          color: message.type === 'success' ? '#155724' : '#721c24',
          borderColor: message.type === 'success' ? '#c3e6cb' : '#f5c6cb'
        }}>
          {message.text}
        </div>
      )}

      {/* CORE SYSTEM METRICS VISUALIZER */}
      {employee && (
        <div style={styles.profileCard}>
          <div style={styles.cardHeader}>
            <div>
              <h3 style={styles.employeeName}>{employee.name}</h3>
              <p style={styles.employeeMeta}>ID No: <strong>{employee.idNo}</strong> | Sponsor Ref: <strong>{employee.refIdNo || 'None'}</strong></p>
            </div>
            <span style={styles.badge}>{employee.currentRankPosition}</span>
          </div>

          <hr style={styles.divider} />

          {/* DYNAMIC SALES GRAPHS & TREE METRICS */}
          <div style={styles.metricsGrid}>
            <div style={styles.metricItem}>
              <span style={styles.metricLabel}>Personal Volume (All-Time)</span>
              <span style={styles.metricValue}>৳ {employee.salesMetrics?.personalSalesAllTime?.toLocaleString() || 0}</span>
            </div>
            <div style={styles.metricItem}>
              <span style={styles.metricLabel}>Personal Volume (This Month)</span>
              <span style={styles.metricValue}>৳ {employee.salesMetrics?.personalSalesThisMonth?.toLocaleString() || 0}</span>
            </div>
            <div style={styles.metricItem}>
              <span style={styles.metricLabel}>Team Volume Rollup (All-Time)</span>
              <span style={styles.metricValue} style={{...styles.metricValue, color: '#0056b3'}}>
                ৳ {employee.salesMetrics?.teamSalesAllTime?.toLocaleString() || 0}
              </span>
            </div>
            <div style={styles.metricItem}>
              <span style={styles.metricLabel}>Team Volume Rollup (This Month)</span>
              <span style={styles.metricValue} style={{...styles.metricValue, color: '#28a745'}}>
                ৳ {employee.salesMetrics?.teamSalesThisMonth?.toLocaleString() || 0}
              </span>
            </div>
          </div>

          <hr style={styles.divider} />

          {/* ADMINISTRATIVE OVERWRITE MANAGEMENT ENGINE */}
          <div style={styles.adminActionArea}>
            <label style={styles.actionLabel}>🛠️ Overwrite Structural Target Rank Base:</label>
            <div style={styles.actionControl}>
              <select 
                value={selectedRank} 
                onChange={(e) => setSelectedRank(e.target.value)}
                style={styles.select}
                disabled={updating}
              >
                {AVAILABLE_RANKS.map((rank) => (
                  <option key={rank} value={rank}>{rank}</option>
                ))}
              </select>
              <button 
                onClick={handleUpdateRank} 
                style={styles.updateBtn}
                disabled={updating || selectedRank === employee.currentRankPosition}
              >
                {updating ? 'Updating Base...' : 'Apply Lock Rank'}
              </button>
            </div>
            <small style={styles.hintText}>
              * Overwriting changes the permanent record baseline database properties. The True Compression structural tree engines will prevent drop downs beneath this value.
            </small>
          </div>
        </div>
      )}
    </div>
  );
}

// Minimalist, Clean Dashboard CSS-in-JS Architecture Stylesheet
const styles = {
  container: {
    maxWidth: '850px',
    margin: '40px auto',
    padding: '24px',
    fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
  },
  title: {
    margin: '0 0 8px 0',
    color: '#212529',
    fontSize: '28px'
  },
  subtitle: {
    margin: '0 0 24px 0',
    color: '#6c757d',
    fontSize: '15px'
  },
  searchForm: {
    display: 'flex',
    gap: '12px',
    marginBottom: '20px'
  },
  input: {
    flex: 1,
    padding: '12px 16px',
    fontSize: '16px',
    border: '1px solid #ced4da',
    borderRadius: '6px',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  searchBtn: {
    padding: '12px 24px',
    fontSize: '16px',
    backgroundColor: '#212529',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600'
  },
  alert: {
    padding: '12px 16px',
    borderRadius: '6px',
    marginBottom: '20px',
    border: '1px solid transparent',
    fontSize: '15px',
    fontWeight: '500'
  },
  profileCard: {
    border: '1px solid #e3e6f0',
    borderRadius: '8px',
    padding: '24px',
    backgroundColor: '#f8f9fc'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  employeeName: {
    margin: '0 0 6px 0',
    fontSize: '22px',
    color: '#4e73df'
  },
  employeeMeta: {
    margin: 0,
    color: '#5a5c69',
    fontSize: '14px'
  },
  badge: {
    backgroundColor: '#4e73df',
    color: '#fff',
    padding: '6px 12px',
    borderRadius: '20px',
    fontWeight: 'bold',
    fontSize: '13px',
    letterSpacing: '0.5px'
  },
  divider: {
    margin: '20px 0',
    border: '0',
    borderTop: '1px solid #e3e6f0'
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px'
  },
  metricItem: {
    backgroundColor: '#fff',
    padding: '14px 18px',
    borderRadius: '6px',
    border: '1px solid #eaecf4',
    display: 'flex',
    flexDirection: 'column'
  },
  metricLabel: {
    fontSize: '13px',
    color: '#858796',
    marginBottom: '6px',
    textTransform: 'uppercase',
    fontWeight: '600'
  },
  metricValue: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#2e59d9'
  },
  adminActionArea: {
    backgroundColor: '#fff3cd',
    border: '1px solid #ffeeba',
    borderRadius: '6px',
    padding: '18px'
  },
  actionLabel: {
    display: 'block',
    fontWeight: '700',
    color: '#856404',
    marginBottom: '10px',
    fontSize: '15px'
  },
  actionControl: {
    display: 'flex',
    gap: '12px',
    marginBottom: '8px'
  },
  select: {
    padding: '10px 14px',
    fontSize: '15px',
    borderRadius: '6px',
    border: '1px solid #ced4da',
    outline: 'none',
    backgroundColor: '#fff',
    flex: 1
  },
  updateBtn: {
    padding: '10px 20px',
    backgroundColor: '#e74a3b',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  hintText: {
    fontSize: '12px',
    color: '#856404',
    fontStyle: 'italic'
  }
};

