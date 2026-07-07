import './componentsStyles/TrackingSidebar.css';

export const TrackingSidebar = ({ activeTab, onTabChange, counts = {} }) => {
  const menuItems = [
    { id: 'all', label: 'ทั้งหมด', count: counts.all ?? 0 },
    { id: 'mine', label: 'แจ้งโดยคุณ', count: counts.mine ?? 0 },
    { id: 'upvoted', label: 'ติดตาม Upvote', count: counts.upvoted ?? 0 },
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
          onClick={() => onTabChange('review')}
        >
          <label>รอประเมิน<span className="personal-count"> ({counts.review ?? 0}) </span></label>
          <span className="badge-exclamation">!</span>
        </button>
        
      </div>
    </aside>
  );
};