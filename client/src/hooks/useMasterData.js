import { useState, useEffect } from 'react';
import axios from 'axios';

export const useMasterData = () => {
    const [categories, setCategories] = useState([]);
    const [locations, setLocations] = useState([]);
    const [floors, setFloors] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [equipments, setEquipments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const ticketStatuses = [
        { value: 'pending', label: 'รอรับเรื่อง' },
        { value: 'in_progress', label: 'กำลังดำเนินการ' },
        { value: 'resolved', label: 'เสร็จสิ้น' },
        { value: 'rejected', label: 'ปฏิเสธ' },
        // { value: 'canceled', label: 'ยกเลิก' },
        { value: 'duplicate', label: 'ถูกรวม' },
    ];

    useEffect(() => {
        const fetchMasterData = async () => {
            try {
                const [catRes, locRes, floorRes, roomRes, equipRes] = await Promise.all([
                    axios.get('/api/manage/getTicketCategories', { withCredentials: true }),
                    axios.get('/api/manage/getLocations', { withCredentials: true }),
                    axios.get('/api/manage/getFloors', { withCredentials: true }),
                    axios.get('/api/manage/getRooms', { withCredentials: true }),
                    axios.get('/api/manage/getEquipment', { withCredentials: true }),
                ]);

                setCategories(catRes.data);
                setLocations(locRes.data);
                setFloors(floorRes.data);
                setRooms(roomRes.data);
                setEquipments(equipRes.data);
            } catch (error) {
                console.error('Error fetching master data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMasterData();
    }, []);

    return {
        categories,
        locations,
        floors,
        rooms,
        equipments,
        ticketStatuses,
        isLoading,
        isLoadingMasterData: isLoading
    };
}