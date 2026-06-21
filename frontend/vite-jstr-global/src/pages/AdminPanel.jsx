
import { Link } from 'react-router-dom';

const AdminPanel = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ color: 'darkblue' }}>🔐 Admin Control Panel</h1>
      <p>This page is only accessible to users with the **Admin** role.</p>
      <Link to="/dashboard">← Back to Dashboard</Link>
    </div>
  );
};

export default AdminPanel;
