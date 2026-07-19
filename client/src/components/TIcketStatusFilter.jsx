import React from 'react';
import { useMasterData } from '../hooks/useMasterData.js';
import { FaFilter } from 'react-icons/fa';
import '../components/componentsStyles/TicketStatusFilter.css';

export const TicketStatusFilter = ({ selectedValue, onChange, disabled }) => {
    const { ticketStatuses, isLoading } = useMasterData();

    return (
        <div className="status-filter-wrapper">
            <div className="status-filter-icon">
                <FaFilter />
            </div>
            <select
                className="status-filter-select"
                value={selectedValue || ''}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled || isLoading}
            >
                <option value="pending,in_progress">สถานะทั้งหมด</option>
                {ticketStatuses.map((status) => (
                    <option key={status.value} value={status.value}>
                        {status.label}
                    </option>
                ))}
            </select>
        </div>
    );
};
