import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const useTicketSummary = () => {
    const [summary, setSummary] = useState({ 
        all: 0, pending: 0, in_progress: 0, resolved: 0, rejected: 0,
    });

    const fetchSummary = useCallback(async () => {
        try {
            const response = await axios.get('/api/tickets/summary');
            setSummary(response.data.data);
        } catch (error) {
            console.error('Error fetching ticket summary:', error);
        }
    }, []);

    useEffect(() => {
        fetchSummary();
    }, [fetchSummary]);

    return { summary, refetchSummary: fetchSummary };
};