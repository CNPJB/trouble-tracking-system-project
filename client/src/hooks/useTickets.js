import { useState, useEffect, useCallback} from 'react'
import axios from 'axios';

export const useTickets = () => {
    const [tickets, setTickets] = useState([]);

    const fetchTickets = useCallback(async () => {
        try {
            const response = await axios.get('/api/tickets/get');
            console.log("ข้อมูลจาก Backend:", response.data);
            setTickets(response.data);
        } catch (error) {
            console.error('Error fetching tickets:', error);
        }
    }, []);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    return { tickets, refetch: fetchTickets };
};