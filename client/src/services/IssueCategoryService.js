import  axios from "axios";

export const IssueCategoryService = {

    addIssueCategoryApi: async (payload) => {
        try {
            const response = await axios.post('/api/manage/addTicketCategory', payload);
            return response.data;
        } catch (error) {
            console.error("Error in addIssueCategoryApi:", error);
            throw error;
        }

    },

    updateIssueCategoryApi: async (payload) => {
        try {
            const response = await axios.put('/api/manage/updateTicketCategories', payload);
            return response.data;
        } catch (error) {
            console.error("Error in addIssueCategoryApi:", error);
            throw error;
        }

    }
}