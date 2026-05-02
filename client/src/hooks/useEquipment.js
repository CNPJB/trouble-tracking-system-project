import { useState, useEffect, useCallback } from 'react'
import axios from 'axios';

export const useEquipment = () => {

    const [equipment, setEquipment] = useState([]);

    const fetchEquipment = useCallback(async () => {
        try {
            const response = await axios.get('/api/manage/getEquipmentByadmin');
            console.log("ข้อมูลจาก Backend:", response.data);
            setEquipment(response.data);
        } catch (error) {
            console.error('Error fetching tickets:', error);
        }
    }, []);

    const addEquipment = useCallback(async (newEquipment) => {
        try {
            await axios.post('/api/equipment/add', newEquipment);
            fetchEquipment(); // เพิ่มเสร็จแล้วดึงข้อมูลใหม่ทันที
        } catch (error) {
            console.error('Error adding equipment:', error);
        }
    }, [fetchEquipment]);

    const updateEquipment = useCallback(async (id,updatedEquipment) => {
        try {
            const response = await axios.patch(`/api/equipment/update/${id}`,updatedEquipment);
            console.log("ข้อมูลจาก Backend:", response.data);
            fetchEquipment();
        } catch (error) {
            console.error('Error update equipment:', error);
        }
    }, [fetchEquipment]);

    const deleteEquipment = useCallback(async (id) => {
        try {
            const response = await axios.delete(`/api/equipment/delete/${id}`);
            console.log("ข้อมูลจาก Backend:", response.data);
            fetchEquipment();
        } catch (error) {
            console.error('Error delete equipment:', error);
        }
    }, [fetchEquipment]);
    useEffect(() => {
        fetchEquipment();
    }, [fetchEquipment]);

    return { equipment, refetch: fetchEquipment, updateEquipment, deleteEquipment,addEquipment };
};