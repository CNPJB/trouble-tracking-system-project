import { useState, useEffect } from 'react';
import axios from 'axios';

export const useUrgentTickets = () => {
    const [urgentTickets, setUrgentTickets] = useState([]);
    const [isLoadingUrgent, setIsLoadingUrgent] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const fetchUrgent = async () => {
            setIsLoadingUrgent(true);
            try {
                const response = await axios.get('/api/ticketManagement/urgentTickets'); 
                if (isMounted && response.data.success) {
                    setUrgentTickets(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching urgent tickets:", error);
            } finally {
                if (isMounted) setIsLoadingUrgent(false);
            }
        };

        fetchUrgent();
        return () => { isMounted = false; };
    }, []);

    return { urgentTickets, isLoadingUrgent };
};