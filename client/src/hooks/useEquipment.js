import { useState, useEffect, useCallback } from 'react'
import axios from 'axios';

export const useEquipment = () => {

    const [equipment, setEquipment] = useState([]);
    const [filterCategory, setFilterCategory] = useState("");
    const [filterLocation, setFilterLocation] = useState("");

    const fetchEquipment = useCallback(async () => {
        try {
            const response = await axios.get('/api/manage/getEquipmentByadmin', {
                params: {
                    categoryId: filterCategory || undefined,
                    LocationId: filterLocation || undefined
                }
            });
            setEquipment(response.data);
        } catch (error) {
            console.error('Error fetching tickets:', error);
        }
    }, [filterCategory,filterLocation]);

    const addEquipment = useCallback(async (newEquipment) => {
        try {
            await axios.post('/api/manage/addEquipment', newEquipment);
            fetchEquipment(); // เพิ่มเสร็จแล้วดึงข้อมูลใหม่ทันที
        } catch (error) {
            console.error('Error adding equipment:', error);
        }
    }, [fetchEquipment]);

    const updateEquipment = useCallback(async (id, updatedEquipment) => {
        try {
            const response = await axios.patch(`/api/manage/updateEquipment/${id}`, updatedEquipment);
            fetchEquipment();
        } catch (error) {
            console.error('Error update equipment:', error);
        }
    }, [fetchEquipment]);

    const deleteEquipment = useCallback(async (id) => {
        try {
            const response = await axios.delete(`/api/manage/deleteEquipment/${id}`);
            fetchEquipment();
        } catch (error) {
            console.error('Error delete equipment:', error);
        }
    }, [fetchEquipment]);
    useEffect(() => {
        fetchEquipment();
    }, [fetchEquipment]);

    return {
        equipment, 
        filterLocation, setFilterLocation,
        filterCategory, setFilterCategory, 
        refetch: fetchEquipment, updateEquipment, deleteEquipment, addEquipment
    };
};