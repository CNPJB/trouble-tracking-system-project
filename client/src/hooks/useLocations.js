import { useState, useEffect, useCallback,useMemo } from 'react'
import axios from 'axios';


export const useLocations = () => {
    const [locations, setLocations] = useState([]);
    const [floors, setFloors] = useState([]);
    const [rooms, setRooms] = useState([]);
    
    const fetchLocations = useCallback(async () => {
        try {
            const response = await axios.get('/api/manage/getLocations');
            setLocations(response.data);
        } catch (error) {
            console.error('Error fetching locations:', error);
        }
    }, []);
    const fetchFloors = useCallback(async () => {
        try {
            const response = await axios.get('/api/manage/getFloors');
            setFloors(response.data);
        } catch (error) {
            console.error('Error fetching floors:', error);
        }
    }, []);

    const fetchRooms = useCallback(async () => {
        try {
            const response = await axios.get('/api/manage/getRooms');
            setRooms(response.data);
        } catch (error) {
            console.error('Error fetching rooms:', error);
        }
    }, []);

    useEffect(() => {
        fetchLocations();
        fetchFloors();
        fetchRooms();
    }, [fetchLocations, fetchFloors, fetchRooms]);

    return { locations, floors, rooms, fetchLocations, fetchFloors, fetchRooms };
}
