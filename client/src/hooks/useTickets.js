import { useState, useEffect, useCallback } from 'react'
import axios from 'axios';

export const useTickets = (initialParams = {}) => {
    // --- State for value ---
    const [tickets, setTickets] = useState([]);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        hasNextPage: false
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);

    // --- State for Query Parameters
    const [queryParams, setQueryParams] = useState({
        page: 1,
        limit: 10, // ค่าเริ่มต้นดึงมา 10 รายการ
        ...initialParams
    });

    const fetchTickets = useCallback(async () => {
        if (queryParams.page === 1) setIsLoading(true);
        else setIsFetchingNextPage(true);

        try {
            const response = await axios.get('/api/tickets/get', { params: queryParams });

            if (queryParams.page === 1) {
                setTickets(response.data.data);
            } else {
                setTickets(prev => [...prev, ...response.data.data]);
            }

            setPagination(response.data.pagination);
        } catch (error) {
            console.error('Error fetching tickets:', error);
        } finally {
            setIsLoading(false);
            setIsFetchingNextPage(false);
        }
    }, [queryParams]);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    const changePage = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setQueryParams(prev => ({ ...prev, page: newPage }));
        }
    };

    const updateFilters = (newFilters) => {
        // เวลาเปลี่ยน Filter เช่น ค้นหาคำใหม่ ต้องกลับไปหน้า 1 เสมอ
        setQueryParams(prev => ({ ...prev, ...newFilters, page: 1 })); 
    };
    return {
        tickets,
        pagination,
        isLoading,
        isFetchingNextPage,
        refetch: fetchTickets, changePage, updateFilters
    };
};

