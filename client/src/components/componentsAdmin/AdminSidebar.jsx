import React  from 'react'
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

export const AdminSidebar = () => {
  return (
    <aside className="admin-sidebar">
      <div className="sidebar-header">
       <img src="/rmutk-logo.png" alt="Logo"  />
      </div>

      <nav className="sidebar-nav">
        {/* ใช้ end เพื่อให้สีเขียวไม่ค้างตอนไปหน้าอื่น */}

        <NavLink to="/adminPage/AuditIssues" className="nav-item">
          <FaRegFileAlt className="nav-icon" />
          <span>Audit Issues</span>
        </NavLink>

        <NavLink to="/" className="nav-item" end>
          <FaTools className="nav-icon" />
          <span>Issue Management</span>
        </NavLink>

        <NavLink to="/adminPage/AssetManagement" className="nav-item">
          <FaDesktop className="nav-icon" />
          <span>Asset Management</span>
        </NavLink>

        <NavLink to="/tracking" className="nav-item">
          <FaUserCog className="nav-icon" />
          <span>User Management</span>
        </NavLink>

        <NavLink to="/tracking" className="nav-item">
          <FaMapMarkedAlt className="nav-icon" />
          <span>Location Management</span>
        </NavLink>

        <NavLink to="/tracking" className="nav-item">
          <FaTags className="nav-icon" />
          <span>Issue Categories</span>
        </NavLink>
      </nav>
    </aside>
  )
}
