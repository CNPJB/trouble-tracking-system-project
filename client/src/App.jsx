import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import './App.css';
import './index.css';

// Components
import Navbar from "./components/Navbar.jsx";
import { AdminLayout } from "./components/componentsAdmin/AdminLayout.jsx";
import { AdminPageSkeleton } from "./components/componentsAdmin/AdminPageSkeleton.jsx";

// Pages
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import AddIssue from "./pages/AddIssue.jsx";
import DetailTicket from './pages/DetailTicket.jsx';
import Tracking from "./pages/Tracking.jsx";
import EditIssue from './pages/EditIssue';
import Statistics from "./pages/Statistics.jsx";

// Pages admin
const AuditIssues = React.lazy(() => import('./pages/adminPage/AuditIssues.jsx'))
const AssetManagement = React.lazy(() => import('./pages/adminPage/AssetManagement.jsx'))
const IssueManagement = React.lazy(() => import('./pages/adminPage/IssueManagement.jsx'))
const UserManagement = React.lazy(() => import('./pages/adminPage/UserManagement.jsx'))
const LocationManagement = React.lazy(() => import('./pages/adminPage/LocationManagement.jsx'))
const Categories = React.lazy(() => import('./pages/adminPage/Categories.jsx'))
const IssueManagementDetail = React.lazy(() => import('./pages/adminPage/IssueManagementDetail.jsx'))

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-loading-screen">
        <div className="loader-container">
          <div className="tbs-spinner"></div>
          <h2 className="loading-text">กำลังโหลดระบบ...</h2>
          <p className="loading-subtext">Trouble Tracking System</p>
        </div>
      </div>
    );
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
                <Route path="/edit-issue" element={<EditIssue />} />
                <Route path="/statistics/*" element={<Statistics />} />

                <Route path="/adminPage" element={
                  user.role === 'admin' ? <AdminLayout /> : <Navigate to="/" />
                }>
                  {/* หน้าลูกๆ ไม่ต้องเขียน Layout ซ้ำแล้ว */}
                  <Route path="Management" element={
                    <Suspense fallback={<AdminPageSkeleton />}></Suspense>
                  } />
                  <Route path="AuditIssues" element={
                    <Suspense fallback={<AdminPageSkeleton />}><AuditIssues /></Suspense>
                  } />
                  <Route path="IssueManagement" element={
                    <Suspense fallback={<AdminPageSkeleton />}><IssueManagement /></Suspense>
                  } />
                  <Route path="IssueManagement/:ticketId" element={
                    <Suspense fallback={<AdminPageSkeleton />}><IssueManagementDetail /></Suspense>
                  } />
                  <Route path="AssetManagement" element={
                    <Suspense fallback={<AdminPageSkeleton />}><AssetManagement /></Suspense>
                  } />
                  <Route path="UserManagement" element={
                    <Suspense fallback={<AdminPageSkeleton />}><UserManagement /></Suspense>
                  } />
                  <Route path="LocationManagement" element={
                    <Suspense fallback={<AdminPageSkeleton />}><LocationManagement /></Suspense>
                  } />
                  <Route path="Categories" element={
                    <Suspense fallback={<AdminPageSkeleton />}><Categories /></Suspense>
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
