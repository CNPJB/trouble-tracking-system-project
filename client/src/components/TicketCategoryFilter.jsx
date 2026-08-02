import React from 'react';
import { useMasterData } from '../hooks/useMasterData.js';
import { FaFilter } from 'react-icons/fa';
import '../components/componentsStyles/TicketCategoryFilter.css';

export const TicketCategoryFilter = ({ selectedValue, onChange, disabled }) => {
    const { categories, isLoading } = useMasterData();

    return (
        <div className="category-filter-wrapper">
            <select
                className="category-filter-select"
                value={selectedValue || ''}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled || isLoading}
            >
                <option value="">ประเภทปัญหาทั้งหมด</option>
                {categories.map(c => (
                    <option key={c.ticketCtgId} value={c.ticketCtgId}>
                        {c.ticketCtgName}
                    </option>
                ))}
            </select>
        </div>
    );
};