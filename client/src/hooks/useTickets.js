import { useState, useEffect, useCallback } from 'react'
import axios from 'axios';

export const useTickets = (initialParams = {}, mode = 'infinite') => {
    // --- State for value ---
    const [tickets, setTickets] = useState([]);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);

    // --- State for Query Parameters
    const [queryParams, setQueryParams] = useState({
        page: 1,
        limit: 16, // ค่าเริ่มต้นดึงมา 16 รายการ
        ...initialParams
    });

    // --- State สำหรับตอนอยากรีเฟรชข้อมูลหน้าเดิม ---
    const [refetchTrigger, setRefetchTrigger] = useState(0);

    // Logic get ticket
    useEffect(() => {
        // สัญญาณบอกว่า "คำสั่งนี้ยังถูกต้องการอยู่ไหม?"
        let isMounted = true;

        const fetchTickets = async () => {
            if (queryParams.page === 1) setIsLoading(true);
            else setIsFetchingNextPage(true);

            try {
                const response = await axios.get('/api/tickets/get', { params: queryParams });
                //ถ้าผู้ใช้กดปุ่ม Filter จน queryParams เปลี่ยนไปแล้ว ให้ข้ามการอัปเดต state นี้ไปเลย
                if (isMounted) {
                    if (mode === 'standard') {
                        // โหมดตัวเลขหน้า: ทับข้อมูลเดิมไปเลย ไม่ว่าหน้าไหน
                        setTickets(response.data.data);
                    } else {
                        // โหมด Infinite Scroll (ของเดิม)
                        if (queryParams.page === 1) {
                            setTickets(response.data.data);
                        } else {
                            setTickets(prev => {
                                // หาข้อมูลตัวใหม่ที่ "ยังไม่มี" ใน prev
                                const newUniqueTickets = response.data.data.filter(
                                    newTicket =>
                                        !prev.some(existingTicket =>
                                            existingTicket.ticketId === newTicket.ticketId)
                                );

                                // เอาของเก่ามาต่อกับของใหม่(ที่คัดแล้ว)
                                return [...prev, ...newUniqueTickets];
                            });
                        }                    
                    }
                    setPagination(response.data.pagination);
                }
            } catch (error) {
                if (isMounted) console.error('Error fetching tickets:', error);
            } finally {
                // อัปเดต Loading เฉพาะ Request ที่ไม่ถูกยกเลิก
                if (isMounted) {
                    setIsLoading(false);
                    setIsFetchingNextPage(false);
                }
            }
        };

        fetchTickets();

        // Cleanup Function: ของ React จะทำงานเมื่อ queryParams เปลี่ยน
        return () => {
            isMounted = false;
        };
    }, [queryParams, refetchTrigger, mode]);

    const changePage = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setQueryParams(prev => ({ ...prev, page: newPage }));
        }
    };

    // ฟังก์ชันอัปเดตฟิลเตอร์
    const updateFilters = (newFilters) => {
        setQueryParams(prev => ({ ...prev, ...newFilters, page: 1 }));
    };

    // ฟังก์ชันลบตั๋วออกจาก list ทันทีหลังยกเลิก (Optimistic Update)
    const removeTicket = useCallback((ticketId) => {
        setTickets(prev => prev.filter(ticket => ticket.ticketId !== ticketId));
    }, []);

    // ฟังก์ชันอัปเดตสถานะตั๋วทันที (Optimistic Update)
    const updateTicketStatus = useCallback((ticketId, newStatus) => {
        setTickets(prev =>
            prev.map(ticket =>
                ticket.ticketId === ticketId
                    ? { ...ticket, ticketStatus: newStatus, rating: null }
                    : ticket
            )
        );
    }, []);

    // ฟังก์ชันดึงข้อมูลใหม่ (ทำให้ return Promise เพื่อให้รอได้)
    const refetch = useCallback(() => {
        return new Promise(resolve => {
            setRefetchTrigger(prev => prev + 1);
            setTimeout(resolve, 300);
        });
    }, []);

    return {
        tickets,
        pagination,
        isLoading,
        setIsLoading,
        isFetchingNextPage,
        refetch,
        changePage,
        updateFilters,
        removeTicket,
        updateTicketStatus
    };
};
