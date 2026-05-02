import axios from "axios";

export const ticketService = {

    mergeTickets: async (payload) => {
        try {
            const response = await axios.patch('/api/manage/mergeTickets', payload);
            return response.data;
        } catch (error) {
            console.error("Error in mergeTickets:", error);
            throw error; 
        }
    },

};