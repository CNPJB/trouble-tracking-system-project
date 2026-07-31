import React from 'react';
import { useMasterData } from '../hooks/useMasterData.js';
import { FaFilter } from 'react-icons/fa';
import '../components/componentsStyles/TicketStatusFilter.css';

export const TicketStatusFilter = ({ selectedValue, onChange, disabled, allowedStatuses, allOptionValue = "pending,in_progress" }) => {
    const { ticketStatuses, isLoading } = useMasterData();

    const displayStatuses = allowedStatuses
        ? ticketStatuses.filter(status => allowedStatuses.includes(status.value))
        : ticketStatuses;

    return (
        <div className="status-filter-wrapper">
            <select
                className="status-filter-select"
                value={selectedValue || ''}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled || isLoading}
            >
                <option value={allOptionValue}>สถานะทั้งหมด</option>
                {displayStatuses.map((status) => (
                    <option key={status.value} value={status.value}>
                        {status.label}
                    </option>
                ))}
            </select>
        </div>
    );
};
