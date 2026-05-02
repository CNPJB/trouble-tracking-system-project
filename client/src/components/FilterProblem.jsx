import React from 'react'
import './FilterProblem.css'

export const FilterProblem = ({ data=[] ,currentFilter, onFilterChange }) => {
    const buttons = [
        { id: 'all', label: 'ทั้งหมด' },
        { id: 'pending', label: 'รอรับเรื่อง' },
        { id: 'in_progress', label: 'กำลังดำเนินการ' },
        { id: 'resolved', label: 'เสร็จสิ้น' },

    ];
    const totalProblem = data ? data.length : 0;

    const getCount = (ticketStatus) => {
        if (ticketStatus === 'all') return totalProblem;
        return data.filter(item => item.ticketStatus === ticketStatus).length;
    }

    const getPercent = (count) => {
        if (totalProblem === 0) return 0;
        return ((count / totalProblem) * 100).toFixed(1);
    }
    return (
        <div className="filter-container">
            {buttons.map((btn) => {
                const count = getCount(btn.id);
                const percentage = getPercent(count);

                return (
                    <button
                        key={btn.id}
                        data-status={btn.id}
                        className={`filter-btn ${currentFilter === btn.id ? 'active' : ''}`}
                        onClick={() => onFilterChange(btn.id)}
                    >
                        <div className="btn-content">
                            <span className="label">{btn.label}</span>
                            <span className="count-badge">
                                {count} รายการ ({percentage}%)
                            </span>
                        </div>
                    </button>
                );
            })}
        </div>
    )
}
