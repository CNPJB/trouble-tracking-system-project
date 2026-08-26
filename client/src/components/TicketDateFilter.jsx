import React from 'react';
import { FaCalendarAlt, FaTimes } from 'react-icons/fa';
import './componentsStyles/TicketDateFilter.css';

export const TicketDateFilter = ({ startDate, endDate, onStartDateChange, onEndDateChange, disabled }) => {

    const handleClear = () => {
        onStartDateChange('');
        onEndDateChange('');
    };

    const hasValue = startDate || endDate;

    return (
        <div className="ticket-date-filter-wrapper">
            <div className={`date-filter-group ${hasValue ? 'active' : ''} ${disabled ? 'disabled' : ''}`}>
                <FaCalendarAlt className="date-filter-icon" />
                
                <div className="date-inputs-container">
                    <div className="date-input-box">
                        <span className="date-label">จาก:</span>
                        <input
                            type="date"
                            className="date-input"
                            value={startDate || ''}
                            onChange={(e) => onStartDateChange(e.target.value)}
                            onClick={(e) => {
                                try {
                                    e.target.showPicker();
                                } catch (error) {
                                    // Fallback for older browsers
                                }
                            }}
                            disabled={disabled}
                            max={endDate || undefined} // ไม่ให้เลือกวันเริ่มต้นเกินวันสิ้นสุด
                        />
                    </div>
                    
                    <div className="date-input-box">
                        <span className="date-label">ถึง:</span>
                        <input
                            type="date"
                            className="date-input"
                            value={endDate || ''}
                            onChange={(e) => onEndDateChange(e.target.value)}
                            onClick={(e) => {
                                try {
                                    e.target.showPicker();
                                } catch (error) {
                                    // Fallback for older browsers
                                }
                            }}
                            disabled={disabled}
                            min={startDate || undefined} // ไม่ให้เลือกวันสิ้นสุดก่อนวันเริ่มต้น
                        />
                    </div>
                </div>

                {hasValue && !disabled && (
                    <button 
                        className="btn-clear-date" 
                        onClick={handleClear}
                        title="ล้างตัวกรองวันที่"
                        type="button"
                    >
                        <FaTimes />
                    </button>
                )}
            </div>
        </div>
    );
};
