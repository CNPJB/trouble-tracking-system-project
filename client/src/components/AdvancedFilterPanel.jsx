import React, { useState, useEffect, useRef } from 'react';
import { FaFilter, FaTimes } from 'react-icons/fa';
import './componentsStyles/AdvancedFilterPanel.css';

export const AdvancedFilterPanel = ({
    children,            // Slot สำหรับใส่ Dropdown ฟิลเตอร์ต่างๆ (เช่น Category, Location)
    rightActions,        // Slot สำหรับปุ่มฝั่งขวาสุด (เช่น Toggle งานของฉัน หรือ Date Picker)
    onClearAll,           // ฟังก์ชันล้างค่าทั้งหมด
    activeFilterCount = 0 // จำนวนฟิลเตอร์ที่ทำงานอยู่
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const panelRef = useRef(null);

    // ปิด Panel เมื่อคลิกพื้นที่ว่าง
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (panelRef.current && !panelRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        // ผูก Event Listener เฉพาะตอนที่ Panel เปิดอยู่เพื่อประหยัดทรัพยากร
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="advanced-filter-container" ref={panelRef}>
            {/* แถบเครื่องมือหลัก (Top Bar) */}
            <div className="filter-top-bar">

                <button
                    className={`btn-toggle-filter ${isOpen ? 'active' : ''} ${activeFilterCount > 0 ? 'has-filters' : ''}`}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <FaFilter /> ตัวกรอง
                    {activeFilterCount > 0 && (
                        <span className="badge-count">{activeFilterCount}</span>
                    )}
                </button>

                {/* โซนสำหรับวางส่วนขยายฝั่งขวา (เช่น ปุ่ม Toggle งานของฉัน) */}
                {rightActions && (
                    <div className="right-actions-wrapper">
                        {rightActions}
                    </div>
                )}
            </div>

            {/* แผงซ่อนตัวกรอง (Dropdown Panel) */}
            {isOpen && (
                <div className="filter-dropdown-panel">
                    <div className="filter-dropdown-content">
                        {children}
                    </div>
                    <button className="btn-clear-all" onClick={onClearAll}>
                        ล้างทั้งหมด
                    </button>
                </div>
            )}
        </div>
    );
};