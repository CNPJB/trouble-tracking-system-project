import { useState, useEffect } from 'react';
import axios from 'axios';

export const useStatistics = (year, month) => {
    const [mostCategoriesOfProblems, setMostCategoriesOfProblems] = useState([]);
    const [mostUpvotedTickets, setMostUpvotedTickets] = useState([]);
    const [ticketStats, setTicketStats] = useState({
        created: [0, 0, 0, 0, 0],
        resolved: [0, 0, 0, 0, 0]
    });
    const fetchMostCategoriesOfProblems = async () => {
        try {
            const response = await axios.get('/api/manage/getMostCategoriesOfProblems');
            setMostCategoriesOfProblems(response.data);
        } catch (error) {
            console.error('Error fetching most categories of problems:', error);
        }
    };

    const fetchMostUpvotedTickets = async () => {
        try {
            const response = await axios.get('/api/manage/getMostUpvotedTickets');
            setMostUpvotedTickets(response.data.data);
        } catch (error) {
            console.error('Error fetching most upvoted tickets:', error);
        }
    };

    const fetchTicketStats = async () => {
        try {
            if (year === undefined || month === undefined) return;
            const response = await axios.get(`/api/manage/getTicket-stats?year=${year}&month=${month}`);
            setTicketStats({
                created: response.data.created,
                resolved: response.data.resolved
            });
        } catch (error) {
            console.error('Error fetching getTicket-stats', error);
        }
    };
    useEffect(() => {
        fetchTicketStats();
    }, [year, month]);
    useEffect(() => {
        fetchMostCategoriesOfProblems();
        fetchMostUpvotedTickets();
    }, []);

    return { mostCategoriesOfProblems, mostUpvotedTickets, ticketStats };
}