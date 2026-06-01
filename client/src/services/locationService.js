import axios from "axios";

export const locationService = {

    deleteRoomApi: async (roomId) => {
        try {
            const response = await axios.delete(`/api/manage/deleteRoom/${roomId}`);
            return response.data;
        } catch (error) {
            console.error("Error in deleteRoom:", error);
            throw error;
        }
    },

    deleteFloorApi: async (floorId) => {
        try {
            const response = await axios.delete(`/api/manage/deleteFloor/${floorId}`);
            return response.data;
        } catch (error) {
            console.error("Error in deleteFloor:", error);
            throw error;
        }
    },

    deleteLocationApi: async (locationId) => {
        try {
            const response = await axios.delete(`/api/manage/deleteLocation/${locationId}`);
            return response.data;
        } catch (error) {
            console.error("Error in deleteLocation:", error);
            throw error;
        }
    },

    addRoomApi: async (payload) => {
        try {
            const response = await axios.post(`/api/manage/addRoom`, payload);
            return response.data;
        } catch (error) {
            console.error("Error in addRoom:", error);
            throw error;
        }
    },

    addFloorApi: async (payload) => {
        try {
            const response = await axios.post(`/api/manage/addFloor`, payload);
            return response.data;
        } catch (error) {
            console.error("Error in addFloor:", error);
            throw error;
        }
    },
    
    addLocationApi: async (payload) => {
        try {
            const response = await axios.post(`/api/manage/addLocation`, payload);
            return response.data;
        } catch (error) {
            console.error("Error in addFloor:", error);
            throw error;
        }
    },

    updateLocationStatusApi: async (payload) => {
        const response = await axios.put('/api/manage/updateLocationStatus', payload);
        return response.data;
    },

    updateFloorStatusApi: async (payload) => {
        const response = await axios.put('/api/manage/updateFloorStatus', payload);
        return response.data;
    },

    updateRoomStatusApi: async (payload) => {
        const response = await axios.put('/api/manage/updateRoomStatus', payload);
        return response.data;
    }

};