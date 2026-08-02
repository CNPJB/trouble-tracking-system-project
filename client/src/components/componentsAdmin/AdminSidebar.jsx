import { useState } from 'react';
import {
  FaRegFileAlt,    // 1. ตรวจสอบปัญหา
  FaTools,         // 2. จัดการปัญหา
  FaDesktop,       // 3. จัดการครุภัณฑ์
  FaUserCog,       // 4. จัดการบัญชีผู้ใช้
  FaMapMarkedAlt,  // 5. จัดการสถานที่
  FaTags           // 6. จัดการประเภทปัญหา
} from 'react-icons/fa';
import './AdminSidebar.css'
import { NavLink } from 'react-router-dom';
import { LuPanelLeftClose } from "react-icons/lu"; 

export const AdminSidebar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const toggleMobile = () => {
    setIsMobileOpen(!isMobileOpen);
  };
  return (
    <>
      <aside className="mobile-sidebar">
        <button className="admin-navbar-toggle" id="navbar-toggle" onClick={toggleMobile}>
         <LuPanelLeftClose className='nav-toggle-icon' />
        </button>
        
        <div className={`mobile-backdrop ${isMobileOpen ? 'open' : ''}`} onClick={toggleMobile}></div>

        <div className={`mobile-menu-content ${isMobileOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <img src="/rmutk-logo.png" alt="Logo" />
          </div>
          
          <nav className="sidebar-nav">
            <NavLink to="/adminPage/AuditIssues" className="nav-item" onClick={toggleMobile}>
              <span>Audit Issues</span>
              <FaRegFileAlt className="nav-icon-admin-mb" />
            </NavLink>

            <NavLink to="/adminPage/IssueManagement" className="nav-item" end onClick={toggleMobile}>
              <span>Issue Management</span>
              <FaTools className="nav-icon-admin-mb" />
            </NavLink>

            <NavLink to="/adminPage/AssetManagement" className="nav-item" onClick={toggleMobile}>
              <span>Asset Management</span>
              <FaDesktop className="nav-icon-admin-mb" />
            </NavLink>

            <NavLink to="/adminPage/UserManagement" className="nav-item" onClick={toggleMobile}>
              <span>User Management</span>
              <FaUserCog className="nav-icon-admin-mb" />
            </NavLink>

            <NavLink to="/adminPage/LocationManagement" className="nav-item" onClick={toggleMobile}>
              <span>Location Management</span>
              <FaMapMarkedAlt className="nav-icon-admin-mb" />
            </NavLink>

            <NavLink to="/adminPage/Categories" className="nav-item" onClick={toggleMobile}>
              <span>Issue Categories</span>
              <FaTags className="nav-icon-admin-mb" />
            </NavLink>
          </nav>
        </div>
      </aside>

      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <img src="/rmutk-logo.png" alt="Logo" />
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/adminPage/AuditIssues" className="nav-item">
            <FaRegFileAlt className="nav-icon-admin" />
            <span>Audit Issues</span>
          </NavLink>

          <NavLink to="/adminPage/IssueManagement" className="nav-item" end>
            <FaTools className="nav-icon-admin" />
            <span>Issue Management</span>
          </NavLink>

          <NavLink to="/adminPage/AssetManagement" className="nav-item">
            <FaDesktop className="nav-icon-admin" />
            <span>Asset Management</span>
          </NavLink>

          <NavLink to="/adminPage/UserManagement" className="nav-item">
            <FaUserCog className="nav-icon-admin" />
            <span>User Management</span>
          </NavLink>

          <NavLink to="/adminPage/LocationManagement" className="nav-item">
            <FaMapMarkedAlt className="nav-icon-admin" />
            <span>Location Management</span>
          </NavLink>

          <NavLink to="/adminPage/Categories" className="nav-item">
            <FaTags className="nav-icon-admin" />
            <span>Issue Categories</span>
          </NavLink>
        </nav>
      </aside>
    </>
  )
}
