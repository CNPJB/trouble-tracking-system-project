import { useState, useEffect } from 'react';
import axios from 'axios';

export const useResolvedTickets = (limit = 10, ratedOnly = false) => {
    const [resolvedTickets, setResolvedTickets] = useState([]);
    const [isLoadingResolved, setIsLoadingResolved] = useState(true);

    useEffect(() => {
        const fetchResolved = async () => {
            try {
                // เรียกใช้ API ตัวเดิม แต่ส่ง query params บังคับสถานะและจำนวนไปเลย
                const response = await axios.get('/api/tickets/get', { 
                    params: { 
                        status: 'resolved', 
                        limit: limit, 
                        page: 1,
                        ratedOnly: ratedOnly
                    } 
                });
                
                setResolvedTickets(response.data.data);
            } catch (error) {
                console.error('Error fetching resolved tickets:', error);
            } finally {
                setIsLoadingResolved(false);
            }
        };

        fetchResolved();
    }, [limit]);

    return { resolvedTickets, isLoadingResolved };
};