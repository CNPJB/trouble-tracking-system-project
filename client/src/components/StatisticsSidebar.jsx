import './componentsStyles/StatisticsSidebar.css';
import { NavLink } from 'react-router-dom';
import { FaChartPie, FaListOl, FaMapMarkerAlt, FaThumbsUp } from 'react-icons/fa';
import { FiAlignJustify } from 'react-icons/fi';
import { useState } from 'react';
export const StatisticsSidebar = ({ activeTab, onTabChange }) => {
  // const menuItems = [
  //   { id: 'statistic-all-prblem', label: 'สถิติปัญหา' },
  //   { id: 'all', label: 'ประเภทปัญหาที่รับแจ้งมากสุด' },
  //   { id: 'mine', label: 'สถานที่รับแจ้งมากสุด' },
  //   { id: 'upvoted', label: 'ปัญหาที่ได้รับ Upvote มากสุด' },
  // ];
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const toggleMobile = () => {
    setIsMobileOpen(!isMobileOpen);
  };
  return (
    <>
      <aside className="mobile-sidebar">
        {/* ปุ่มแฮมเบอร์เกอร์ */}
        <button className="navbar-toggle" id="navbar-toggle" onClick={toggleMobile}>
          <FiAlignJustify className="nav-toggle-icon" />
        </button>
        
        {/* 🌟 ฉากหลังสีดำโปร่งแสง (Backdrop) กดแล้วปิดเมนูได้ */}
        <div 
          className={`mobile-backdrop ${isMobileOpen ? 'open' : ''}`} 
          onClick={toggleMobile}
        ></div>

        {/* 🌟 ตัวเมนูที่จะสไลด์มาทับ */}
        <div className={`mobile-menu-content ${isMobileOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <img src="/rmutk-logo.png" alt="Logo" />
          </div>
          
          <nav className="menu-group">
            <NavLink to="/statistics" className="sidebar-statistics-btn" end onClick={toggleMobile}>
              <span>สถิติปัญหา</span>
              <FaChartPie className="nav-icon" />
            </NavLink>

            <NavLink to="/statistics/top-categories" className="sidebar-statistics-btn" onClick={toggleMobile}>
              <span>ประเภทปัญหาที่รับแจ้งมากสุด</span>
              <FaListOl className="nav-icon" />
            </NavLink>

            <NavLink to="/statistics/top-upvoted" className="sidebar-statistics-btn" onClick={toggleMobile}>
              <span>ปัญหาที่ได้รับ Upvote มากสุด</span>
              <FaThumbsUp className="nav-icon" />
            </NavLink>
          </nav>
        </div>
      </aside>
      <aside className="statistics-sidebar">
        <div className="sidebar-header">
          <img src="/rmutk-logo.png" alt="Logo" />
        </div>
        <nav className="menu-group">

          {/* ใช้ end เพื่อไม่ให้สีค้างเวลาไป path ย่อย (เหมือนโค้ดแรก) */}
          <NavLink to="/statistics" className="sidebar-statistics-btn" end>
            <FaChartPie className="nav-icon" />
            <span>สถิติปัญหา</span>
          </NavLink>

          <NavLink to="/statistics/top-categories" className="sidebar-statistics-btn">
            <FaListOl className="nav-icon" />
            <span>ประเภทปัญหาที่รับแจ้งมากสุด</span>
          </NavLink>

          {/* <NavLink to="/statistics/top-locations" className="sidebar-statistics-btn">
          <FaMapMarkerAlt className="nav-icon" />
          <span>สถานที่รับแจ้งมากสุด</span>
        </NavLink> */}

          <NavLink to="/statistics/top-upvoted" className="sidebar-statistics-btn">
            <FaThumbsUp className="nav-icon" />
            <span>ปัญหาที่ได้รับ Upvote มากสุด</span>
          </NavLink>

        </nav>
      </aside>
    </>
  );
};