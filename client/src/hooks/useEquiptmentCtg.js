import { useState,useEffect,useCallback } from "react";

import axios from 'axios';

export const useEquiptmentCtg = () => {
    const [EquipmentCtgs, setEquipmentCtgs] = useState([]);
    const fetchEquiptmentCtg = useCallback(async () => {
        try {
            const response = await axios.get('/api/manage/getEquipmentCtgs');
            setEquipmentCtgs(response.data);
        } catch (error) {
            console.error('Error fetching EquipmentCtgs:', error);
        }
    }, []);

    useEffect(() => {
        fetchEquiptmentCtg();
    }, [fetchEquiptmentCtg]);

    return{ EquipmentCtgs, fetchEquiptmentCtg}
};