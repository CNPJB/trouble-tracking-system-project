import { useState, useEffect } from 'react';
import axios from 'axios';

export const useSimilarTickets = (categoryId, locationId, roomId, equipmentId, searchTitle, excludeUserId) => {
    const [similarTickets, setSimilarTickets] = useState([]);
    const [isSearchingSimilar, setIsSearchingSimilar] = useState(false);

    useEffect(() => {

        if (!categoryId && !locationId && !roomId && !equipmentId && (!searchTitle || searchTitle.trim() === '')) {
            setSimilarTickets([]);
            return;
        }

        let isMounted = true;

        const fetchSimilar = async () => {
            setIsSearchingSimilar(true);
            try {
                const response = await axios.get('/api/tickets/similar', {
                    params: {
                        search: searchTitle ? searchTitle.trim() : '',
                        categoryId: categoryId || undefined,
                        locationId: locationId || undefined,
                        roomId: roomId || undefined,
                        equipmentId: equipmentId || undefined,
                        excludeUserId: excludeUserId || undefined
                    }
                });

                if (isMounted) {
                    setSimilarTickets(response.data.data || []);
                }

            } catch (error) {
                if (isMounted) {
                    console.error('Error fetching similar tickets:', error);
                    setSimilarTickets([]);
                }
            } finally {
                if (isMounted) setIsSearchingSimilar(false);
            }
        };

        fetchSimilar();

        // Cleanup function คอยทำลาย Request เก่าทิ้งเมื่อผู้ใช้พิมพ์ตัวอักษรใหม่
        return () => {
            isMounted = false;
        };

    }, [categoryId, locationId, roomId, equipmentId, searchTitle, excludeUserId]);

    return { similarTickets, isSearchingSimilar };
};