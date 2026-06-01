import React,  {useEffect} from 'react'
import './PopupAlert.css';

export const PopupAlert = ({ isOpen, type, message, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  // ถ้าสถานะเป็นปิด ไม่ต้องแสดงผล
  if (!isOpen) return null;

  // เช็คประเภทเพื่อเลือก ธีม (คลาส CSS) และ ไอคอน
  const isSuccess = type === 'success';
  const themeClass = isSuccess ? 'success' : 'error';
  const icon = isSuccess ? '✅' : '❌';

  return (
    <div className="popup-alert-overlay">
      <div className={`popup-alert-box ${themeClass}`}>
        <span className="popup-icon">{icon}</span>
        
        <p className="popup-message">{message}</p>
        
        <button 
          className="popup-close-btn" 
          onClick={onClose}
        >
          ✖
        </button>
      </div>
    </div>
  );
};
