import React, { forwardRef } from 'react';
import { FaCalendarAlt, FaTimes } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './componentsStyles/TicketDateFilter.css';

export const TicketDateFilter = ({ startDate, endDate, onStartDateChange, onEndDateChange, disabled }) => {

    const handleClear = () => {
        onStartDateChange('');
        onEndDateChange('');
    };

    const hasValue = startDate || endDate;

    // Convert string "YYYY-MM-DD" to JS Date object
    const parsedStartDate = startDate ? new Date(startDate) : null;
    const parsedEndDate = endDate ? new Date(endDate) : null;

    // Helper to format JS Date back to "YYYY-MM-DD"
    const formatDateStr = (date) => {
        if (!date) return '';
        // Adjust for local timezone
        const offset = date.getTimezoneOffset()
        const adjustedDate = new Date(date.getTime() - (offset*60*1000))
        return adjustedDate.toISOString().split('T')[0]
    };

    // สร้าง custom input เพื่อให้ UI ยังคงเหมือนเดิมแต่มี Placeholder สวยงาม
    const CustomInput = forwardRef(({ value, onClick, placeholder, className }, ref) => (
        <input
            className={className}
            onClick={onClick}
            ref={ref}
            value={value}
            placeholder={placeholder}
            readOnly // ป้องกันมือถือโชว์คีย์บอร์ด
        />
    ));

    return (
        <div className="ticket-date-filter-wrapper">
            <div className={`date-filter-group ${hasValue ? 'active' : ''} ${disabled ? 'disabled' : ''}`}>
                <FaCalendarAlt className="date-filter-icon" />
                
                <div className="date-inputs-container">
                    <div className="date-input-box">
                        <span className="date-label">จาก:</span>
                        <DatePicker
                            selected={parsedStartDate}
                            onChange={(date) => onStartDateChange(formatDateStr(date))}
                            selectsStart
                            startDate={parsedStartDate}
                            endDate={parsedEndDate}
                            maxDate={parsedEndDate}
                            disabled={disabled}
                            dateFormat="dd/MM/yyyy"
                            placeholderText="เริ่ม"
                            customInput={<CustomInput className="date-input custom-date-input" />}
                        />
                    </div>
                    
                    <div className="date-input-box">
                        <span className="date-label">ถึง:</span>
                        <DatePicker
                            selected={parsedEndDate}
                            onChange={(date) => onEndDateChange(formatDateStr(date))}
                            selectsEnd
                            startDate={parsedStartDate}
                            endDate={parsedEndDate}
                            minDate={parsedStartDate}
                            disabled={disabled}
                            dateFormat="dd/MM/yyyy"
                            placeholderText="สิ้นสุด"
                            customInput={<CustomInput className="date-input custom-date-input" />}
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
