import { useState } from 'react';
import {
  FaRegFileAlt,    // 1. ตรวจสอบปัญหา
  FaTools,         // 2. จัดการปัญหา
  FaDesktop,       // 3. จัดการครุภัณฑ์
  FaUserCog,       // 4. จัดการบัญชีผู้ใช้
  FaMapMarkedAlt,  // 5. จัดการสถานที่
  FaTags           // 6. จัดการประเภทปัญหา
} from 'react-icons/fa';
import './Adminsidebar.css'
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
              <span>ตรวจสอบปัญหา</span>
              <FaRegFileAlt className="nav-icon-admin-mb" />
            </NavLink>

            <NavLink to="/adminPage/IssueManagement" className="nav-item" end onClick={toggleMobile}>
              <span>จัดการปัญหา</span>
              <FaTools className="nav-icon-admin-mb" />
            </NavLink>

            <NavLink to="/adminPage/AssetManagement" className="nav-item" onClick={toggleMobile}>
              <span>จัดการครุภัณฑ์</span>
              <FaDesktop className="nav-icon-admin-mb" />
            </NavLink>

            <NavLink to="/adminPage/UserManagement" className="nav-item" onClick={toggleMobile}>
              <span>จัดการผู้ใช้</span>
              <FaUserCog className="nav-icon-admin-mb" />
            </NavLink>

            <NavLink to="/adminPage/LocationManagement" className="nav-item" onClick={toggleMobile}>
              <span>จัดการสถานที่</span>
              <FaMapMarkedAlt className="nav-icon-admin-mb" />
            </NavLink>

            <NavLink to="/adminPage/Categories" className="nav-item" onClick={toggleMobile}>
              <span>จัดการประเภทปัญหา</span>
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
            <span>ตรวจสอบปัญหา</span>
          </NavLink>

          <NavLink to="/adminPage/IssueManagement" className="nav-item" end>
            <FaTools className="nav-icon-admin" />
            <span>จัดการปัญหา</span>
          </NavLink>

          <NavLink to="/adminPage/AssetManagement" className="nav-item">
            <FaDesktop className="nav-icon-admin" />
            <span>จัดการครุภัณฑ์</span>
          </NavLink>

          <NavLink to="/adminPage/UserManagement" className="nav-item">
            <FaUserCog className="nav-icon-admin" />
            <span>จัดการผู้ใช้</span>
          </NavLink>

          <NavLink to="/adminPage/LocationManagement" className="nav-item">
            <FaMapMarkedAlt className="nav-icon-admin" />
            <span>จัดการสถานที่</span>
          </NavLink>

          <NavLink to="/adminPage/Categories" className="nav-item">
            <FaTags className="nav-icon-admin" />
            <span>จัดการประเภทปัญหา</span>
          </NavLink>
        </nav>
      </aside>
    </>
  )
}
