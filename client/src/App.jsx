import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import './App.css';
import './index.css';

// Components
import Navbar from "./components/Navbar.jsx";
import { AdminLayout } from "./components/componentsAdmin/adminLayout.jsx";

// Pages
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import AddIssue from "./pages/AddIssue.jsx";
import DetailTicket from './pages/DetailTicket.jsx';
import Tracking from "./pages/Tracking.jsx";

// Pages admin
const AuditIssues = React.lazy(() => import('./pages/adminPage/AuditIssues.jsx'))
const AssetManagement = React.lazy(() => import('./pages/adminPage/AssetManagement.jsx'))


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
                <Route path="/tracking" element={<Tracking />} />

                <Route path="/ticketDetail" element={<DetailTicket />} />

                <Route path="*" element={<Navigate to="/" />} />

                <Route path="/adminPage" element={
                  user.role === 'admin' ? <AdminLayout /> : <Navigate to="/" />
                }>
                  {/* หน้าลูกๆ ไม่ต้องเขียน Layout ซ้ำแล้ว */}
                  <Route path="Management" element={
                    <Suspense fallback={<div>Loading...</div>}></Suspense>
                  } />
                  <Route path="AuditIssues" element={
                    <Suspense fallback={<div>Loading...</div>}><AuditIssues /></Suspense>
                  } />
                  <Route path="AssetManagement" element={
                    <Suspense fallback={<div>Loading...</div>}><AssetManagement /></Suspense>
                  } />
                </Route>
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
