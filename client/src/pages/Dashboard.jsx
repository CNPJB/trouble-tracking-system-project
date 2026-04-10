import { useAuth } from '../context/AuthContext.jsx';
import './Dashboard.css';

function Dashboard() {
  const { user } = useAuth();

  if (!user) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>;
  }

  return (
    <div>
      <h1>Dashboard</h1>
    </div>
  );
}

export default Dashboard;
