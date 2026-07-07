import './StatisticsSidebar.css';
import { NavLink } from 'react-router-dom';
import { FaChartPie, FaListOl, FaMapMarkerAlt, FaThumbsUp } from 'react-icons/fa';

export const StatisticsSidebar = ({ activeTab, onTabChange }) => {
  // const menuItems = [
  //   { id: 'statistic-all-prblem', label: 'สถิติปัญหา' },
  //   { id: 'all', label: 'ประเภทปัญหาที่รับแจ้งมากสุด' },
  //   { id: 'mine', label: 'สถานที่รับแจ้งมากสุด' },
  //   { id: 'upvoted', label: 'ปัญหาที่ได้รับ Upvote มากสุด' },
  // ];

  return (
    <aside className="statistics-sidebar">
     <div className="sidebar-header">
       <img src="/rmutk-logo.png" alt="Logo"  />
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

        <NavLink to="/statistics/top-locations" className="sidebar-statistics-btn">
          <FaMapMarkerAlt className="nav-icon" />
          <span>สถานที่รับแจ้งมากสุด</span>
        </NavLink>

        <NavLink to="/statistics/top-upvoted" className="sidebar-statistics-btn">
          <FaThumbsUp className="nav-icon" />
          <span>ปัญหาที่ได้รับ Upvote มากสุด</span>
        </NavLink>

      </nav>
    </aside>
  );
};