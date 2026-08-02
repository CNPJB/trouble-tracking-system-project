import { useState, useEffect, useCallback } from 'react'
import axios from 'axios';

export const useCategories = () => {

    const [categories, setCategories] = useState([]);

    const fetchCategories = useCallback(async () => {
        try {
            const response = await axios.get('/api/manage/getTicketCategories');
            console.log("ข้อมูลจาก Backend:", response.data);
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching tickets:', error);
        }
    }, []);
    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);
    return { categories, fetchCategories };
}