import { useAuth } from '../context/AuthContext.jsx';
import './AddIssue.css';

function AddIssue() {
  const { user } = useAuth();

  if (!user) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>;
  }

  return (
    <div>
      <h1>Add Issue</h1>
    </div>
  );
}

export default AddIssue;
