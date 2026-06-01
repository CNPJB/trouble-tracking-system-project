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

    createTicket: async (formData) => {
        try {
            const response = await axios.post('/api/tickets/add', formData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data; // คืนค่าเฉพาะส่วน data ออกไป
        } catch (error) {
            // โยน error ออกไปให้หน้า UI จัดการแจ้งเตือน
            throw error;
        }

    },
    
    updateTicket: async (ticketId, formData) => {
        try {
            const response = await axios.patch(`/api/tickets/updateTicket/${ticketId}`, formData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    upvoteTicket: async (ticketId) => {
        try {
            const response = await axios.post(`/api/tickets/upvoteTicket/${ticketId}`, {}, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};