import axios from "axios";

export const equipmentService = {

    updateEquipment: async (payload) => {
        try {
            const { equipmentId, ...data } = payload;
            const response = await axios.put('/api/manage/updateEquipment', payload);
            return response.data;
        } catch (error) {
            console.error("Error in updateEquipment:", error);
            throw error;
        }
    },

    updateMultipleEquipments: async (payload) => {
        try {
            const { equipmentId, ...data } = payload;
            const response = await axios.put('/api/manage/updateMultipleEquipments', payload);
            return response.data;
        } catch (error) {
            console.error("Error in updateMultipleEquipments:", error);
            throw error;
        }
    }

}