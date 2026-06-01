import { useState, useEffect, useCallback} from 'react'
import axios from 'axios';

export const useTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchTickets = useCallback(async () => {
        setIsLoading(true); 
        
        try {
            const response = await axios.get('/api/tickets/get');
            setTickets(response.data);
        } catch (error) {
            console.error('Error fetching tickets:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    return { tickets, isLoading, refetch: fetchTickets };
};
