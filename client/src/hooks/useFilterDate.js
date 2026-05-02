// ไฟล์: src/hooks/useDateFilter.js
import { useMemo } from 'react';

export const useFilterDate = (data, startDate, endDate, dateField = 'createdAt') => {
    
    const filteredData = useMemo(() => {
        // ถ้าไม่มีข้อมูล ให้ส่ง Array ว่างกลับไป
        if (!data) return [];

        return data.filter(item => {
            // 1. ถ้าไม่ได้เลือกวันที่ ให้ผ่านหมด
            if (!startDate && !endDate) return true;

            // 2. ถ้าข้อมูลนั้นไม่มีฟิลด์วันที่ ให้ผ่านไปเลย (กันแอปพัง)
            if (!item[dateField]) return true;

            const itemDate = new Date(item[dateField]);
            itemDate.setHours(0, 0, 0, 0);

            // 3. เลือกแค่วันเริ่มต้น
            if (startDate && !endDate) {
                const start = new Date(startDate).setHours(0, 0, 0, 0);
                return itemDate.getTime() >= start;
            }

            // 4. เลือกครบทั้งเริ่มและจบ
            if (startDate && endDate) {
                const start = new Date(startDate).setHours(0, 0, 0, 0);
                const end = new Date(endDate).setHours(0, 0, 0, 0);
                return itemDate.getTime() >= start && itemDate.getTime() <= end;
            }

            return true;
        });
    }, [data, startDate, endDate, dateField]); // จะคำนวณใหม่ก็ต่อเมื่อตัวแปรพวกนี้เปลี่ยนค่า

    return filteredData;
};