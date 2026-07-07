import { useQuery } from '@tanstack/react-query';
import { ticketService } from '../services/ticketService';

export const useTicketGroups = () => {
    // ใช้ useQuery เพื่อดึงข้อมูลและจัดการ Cache อัตโนมัติ
    const query = useQuery({
        // queryKey คือ "ชื่อเรียกของ Cache" (สำคัญมาก ต้องตั้งให้ไม่ซ้ำกับตัวอื่น)
        queryKey: ['ticketGroups'], 
        
        // queryFn คือ ฟังก์ชันที่จะใช้ดึงข้อมูล
        queryFn: async () => {
            const result = await ticketService.getTicketGroups();
            if (!result.success) {
                throw new Error('เกิดข้อผิดพลาดในการดึงข้อมูลกลุ่มปัญหา');
            }
            return result.data; // รีเทิร์นเฉพาะ array ของข้อมูล
        },
        
    });

    return {
        ticketGroups: query.data || [], // ถ้ายังไม่มีข้อมูล ให้เป็น array ว่าง
        isLoadingGroups: query.isLoading, // กำลังโหลดครั้งแรกใช่ไหม?
        isError: query.isError, // ดึงข้อมูลพังไหม?
        refetchGroups: query.refetch // ฟังก์ชันสั่งให้ไปดึงข้อมูลใหม่ทันที
    };
};