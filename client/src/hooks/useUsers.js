import axios from "axios";
import { useState, useEffect, useCallback } from "react";

export const useUsers = () => {
    const [users, setUsers] = useState([]);

    const fetchUsers = useCallback(async () => {
        try {
            const response = await axios.get('/api/manage/getUsers');
            console.log("ข้อมูลจาก Backend:", response.data);
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    }, []);

    const updateRoleUser = useCallback(async(payload) =>{
        try{
            const response = await axios.patch(`/api/manage/updateRoleUser`,payload)
            return response.data
        }catch (error){
            console.error('Error update role users:', error);
            throw error;
        }
    },[fetchUsers]);
    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    return { users, updateRoleUser,fetchUsers };
};