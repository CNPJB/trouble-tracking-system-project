import React from 'react';
import { useEquiptmentCtg } from '../hooks/useEquiptmentCtg.js';
import '../components/componentsStyles/TicketCategoryFilter.css'; // Reusing the same CSS as TicketCategoryFilter

export const EquipmentCategoryFilter = ({ selectedValue, onChange, disabled }) => {
    const { EquipmentCtgs } = useEquiptmentCtg();

    return (
        <div className="category-filter-wrapper">
            <select
                className="category-filter-select"
                value={selectedValue || ''}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
            >
                <option value="">ประเภทครุภัณฑ์ทั้งหมด</option>
                {EquipmentCtgs?.map(c => (
                    <option key={c.equipmentCtgId} value={c.equipmentCtgId}>
                        {c.equipmentCtgName}
                    </option>
                ))}
            </select>
        </div>
    );
};
