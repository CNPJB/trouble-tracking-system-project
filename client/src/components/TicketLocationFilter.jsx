import React from 'react';
import { useMasterData } from '../hooks/useMasterData.js';
import { FaFilter } from 'react-icons/fa';
import '../components/componentsStyles/TicketLocationFilter.css';

export const TicketLocationFilter = ({ selectedValue, onChange, disabled }) => {
    const { locations, isLoading } = useMasterData();

    return (
        <div className="location-filter-wrapper">
            <select
                className="location-filter-select"
                value={selectedValue || ''}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled || isLoading}
            >
                <option value="">สถานที่ทั้งหมด</option>
                {locations.map(l => (
                    <option key={l.locationId} value={l.locationId}>
                        {l.locationName}
                    </option>
                ))}
            </select>
        </div>
    );
};
