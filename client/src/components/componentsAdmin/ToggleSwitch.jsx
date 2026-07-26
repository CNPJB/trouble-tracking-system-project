import React from 'react';
import '../componentsAdmin/ToggleSwitch.css'; // อ้างอิงไฟล์ CSS ของมันเอง

export const ToggleSwitch = ({ 
    label, 
    checked, 
    onChange, 
    disabled = false,
    id = "custom-toggle" 
}) => {
    return (
        <div className="toggle-switch-wrapper">
            <label htmlFor={id} className={`toggle-label ${disabled ? 'disabled' : ''}`}>
                {/* แสดงข้อความ Label ถ้ามีการส่งค่ามา */}
                {label && <span className="toggle-text">{label}</span>}
                
                <div className={`modern-toggle ${checked ? 'active' : ''} ${disabled ? 'disabled' : ''}`}>
                    <input 
                        id={id}
                        type="checkbox" 
                        checked={checked} 
                        onChange={onChange} 
                        disabled={disabled}
                        hidden 
                    />
                    <div className="toggle-circle"></div>
                </div>
            </label>
        </div>
    );
};