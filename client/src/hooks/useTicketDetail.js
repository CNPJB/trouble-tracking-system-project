import { useState, useEffect, useCallback } from 'react';
// Services
import { ticketService } from '../services/ticketService';

export const useTicketDetail = (ticketId) => {
    const [ticket, setTicket] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchTicketDetail = useCallback(async () => {
        // ถ้าไม่มี ID ส่งมา (เช่น เปิดหน้าเว็บมาผิด) ให้หยุดการทำงานเลย
        if (!ticketId) {
            setIsLoading(false);
            setError("ไม่พบรหัสอ้างอิงของปัญหา (Ticket ID)");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await ticketService.getTicketById(ticketId);
            
            if (response.success) {
                setTicket(response.data);
            }
        } catch (err) {
            console.error("Error fetching ticket detail:", err);
            // ดึงข้อความ Error จาก Backend ถ้ามี หรือใช้ข้อความมาตรฐาน
            setError(err.response?.data?.message || "ไม่สามารถดึงข้อมูลปัญหาได้ กรุณาลองใหม่อีกครั้ง");
        } finally {
            setIsLoading(false);
        }
    }, [ticketId]); // ผูก Dependency ไว้กับ ticketId

    useEffect(() => {
        let isMounted = true;

        if (isMounted) {
            fetchTicketDetail();
        }

        return () => {
            isMounted = false;
        };
    }, [fetchTicketDetail]);

    return { 
        ticket, 
        isLoading, 
        error, 
        refetch: fetchTicketDetail // เผื่อกรณีที่กดปุ่ม 'ลองใหม่' บนหน้าจอ
    };
};