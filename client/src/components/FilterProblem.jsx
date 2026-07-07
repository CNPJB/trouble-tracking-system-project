import React from 'react'
import './componentsStyles/FilterProblem.css'
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

export const FilterProblem = ({ summary, currentFilter, onFilterChange }) => {
    const buttons = [
        { id: 'all', label: 'ทั้งหมด' },
        { id: 'pending', label: 'รอรับเรื่อง' },
        { id: 'in_progress', label: 'กำลังดำเนินการ' },
        { id: 'resolved', label: 'เสร็จสิ้น' },

    ];

    // ดึงยอดรวมทั้งหมดจาก summary object
    const totalProblem = summary?.all || 0;

    const getCount = (statusId) => {
        return summary?.[statusId] || 0;
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
                            <span className="label">{btn.label} </span>
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

export const SkeletonFilterProblem = () => {
    return (
        <SkeletonTheme
            baseColor="#ebebeb"
            highlightColor="#ccc7c7"
            duration={2}
        >
            {/* โครงสร้างเหมือนตัวจริงเป๊ะ คือมี filter-container แค่ 1 ตัวครอบทั้งหมด */}
            <div className="filter-container">

                {/* วนลูปสร้างปุ่ม Skeleton 4 อัน ไว้ข้างในนี้เลย */}
                {Array.from({ length: 4 }).map((_, index) => (
                    <button
                        key={`skeleton-btn-${index}`}
                        className="filter-btn"
                        disabled
                        style={{ cursor: 'default' }}
                    >
                        <div className="btn-content">
                            <span className="label">
                                <Skeleton width={200} />
                            </span>
                        </div>
                    </button>
                ))}

            </div>
        </SkeletonTheme>
    )
}