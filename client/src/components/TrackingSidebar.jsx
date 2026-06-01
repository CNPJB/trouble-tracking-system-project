import './TrackingSidebar.css';

export const TrackingSidebar = ({ activeTab, onTabChange }) => {
  const menuItems = [
    { id: 'all', label: 'ทั้งหมด' },
    { id: 'mine', label: 'แจ้งโดยคุณ' },
    { id: 'upvoted', label: 'ติดตาม Upvote' },
  ];

  return (
    <aside className="tracking-sidebar">
      <div className="menu-group">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`sidebar-menu-btn ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => onTabChange(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* เส้นแบ่งสัดส่วน */}
      <hr className="sidebar-divider" />

      {/* ปุ่มพิเศษ: รอประเมิน */}
      <div className="special-menu-container">
        <button
          className={`sidebar-menu-btn review-btn ${activeTab === 'review' ? 'active' : ''}`}
          onClick={() => onTabChange('review')}
        >
          รอประเมิน <span className="badge-exclamation">!</span>
        </button>
        
      </div>
    </aside>
  );
};