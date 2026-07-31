import './componentsStyles/TrackingSidebar.css';
import React, { useState } from 'react';
import { FiAlignJustify } from 'react-icons/fi';
// นำเข้าไอคอนจากหมวด Lucide (lu) ใน react-icons
import { LuPanelLeftClose } from "react-icons/lu"; 

export const TrackingSidebar = ({ activeTab, onTabChange, counts = {} }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuItems = [
    { id: 'all', label: 'ทั้งหมด', count: counts.all ?? 0 },
    { id: 'mine', label: 'แจ้งโดยคุณ', count: counts.mine ?? 0 },
    { id: 'upvoted', label: 'ติดตาม Upvote', count: counts.upvoted ?? 0 },
  ];

  const handleTabClick = (id) => {
    onTabChange(id);
    setIsOpen(false);
  };

  return (
    <>
      <button className="mobile-hamburger-btn" onClick={() => setIsOpen(true)}>
        <LuPanelLeftClose className='nav-toggle-icon' />
      </button>

      <div
        className={`sidebar-overlay ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(false)}
      ></div>
      
      <aside className={`tracking-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="tracking-sidebar-header">
          <img src="/rmutk-logo.png" alt="Logo" />
        </div>
        
        <div className="container-tracking">
          <div className="menu-group">
            {menuItems.map((item) => (
              <button
                key={item.id}
                className={`sidebar-menu-btn ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => handleTabClick(item.id)} // เปลี่ยนมาใช้ handleTabClick
              >
                <label>{item.label}<span className="personal-count"> ({item.count}) </span></label>
              </button>
            ))}
          </div>

          {/* เส้นแบ่งสัดส่วน */}
          <hr className="sidebar-divider" />

          {/* ปุ่มพิเศษ: รอประเมิน */}
          <div className="special-menu-container">
            <button
              className={`sidebar-menu-btn review-btn ${activeTab === 'review' ? 'active' : ''}`}
              onClick={() => handleTabClick('review')} // เปลี่ยนมาใช้ handleTabClick
            >
              <label>รอประเมิน<span className="personal-count"> ({counts.review ?? 0}) </span></label>
              <span className="badge-exclamation">!</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};