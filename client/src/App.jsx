import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import './App.css'

// Components
import Navbar from "./components/Navbar.jsx";

// Pages
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import AddIssue from "./pages/AddIssue.jsx";





function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>;
  }

  return (
     <Router>
    <div className="App">
      {/* ถ้ามี User ให้แสดง Navbar และ Dashboard */}
      {user ? (
        <>
           <Navbar /> {/* 2. แปะ Navbar ไว้บนสุด */}
          <div style={{ marginTop: '70px' }}> {/* 3. เว้นที่ว่างด้านบนเท่ากับความสูง Navbar */}
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/addIssue" element={<AddIssue />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </>
      ) : (
        // if no user, show login page for all routes
        <Routes>
          <Route path="*" element={<Login />} />
        </Routes>
      )}
    </div>
    </Router>
  );
}

export default App
