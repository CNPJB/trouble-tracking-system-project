import axios from "axios";

export const ticketService = {

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
    },

    submitFeedback: async (ticketId, payload) => {
        try {
            const response = await axios.post(`/api/tickets/submitFeedback/${ticketId}`, payload, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getTicketsCount: async (params = {}) => {
        try {
            const response = await axios.get('/api/tickets/get', {
                params: {
                    ...params,
                    page: 1,
                    limit: 1
                },
                withCredentials: true
            });
            return response.data.pagination?.totalItems || 0;
        } catch (error) {
            console.error('Error fetching ticket count:', error);
            throw error;
        }
    },

    cancelTicket: async (ticketId) => {
        try {
            const response = await axios.patch(`/api/tickets/cancelTicket/${ticketId}`, {}, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    mergeTickets: async (payload) => {
        try {
            const response = await axios.patch('/api/ticketManagement/mergeTickets', payload);
            return response.data;
        } catch (error) {
            console.error("Error in mergeTickets:", error);
            throw error;
        }
    },

    unmergeTickets: async (payload) => {
        try {
            const response = await axios.patch('/api/ticketManagement/unmergeTickets', payload, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error("Error in unmergeTickets:", error);
            throw error;
        }
    },

    getTicketGroups: async () => {
        try {
            const response = await axios.get('/api/ticketManagement/ticketGroups', {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getTicketById: async (ticketId) => {
        try {
            const response = await axios.get(`/api/tickets/get/${ticketId}`, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching ticket ${ticketId}:`, error);
            throw error;
        }
    },

    updateTicketStatusAdmin: async (ticketId, payloadData) => {
        try {
            const formData = new FormData();
            formData.append('ticketStatus', payloadData.ticketStatus);
            
            if (payloadData.adminNote) {
                formData.append('adminNote', payloadData.adminNote);
            }

            if (payloadData.images && payloadData.images.length > 0) {
                payloadData.images.forEach(file => {
                    formData.append('images', file); 
                });
            }
            const response = await axios.patch(`/api/ticketManagement/updateTicketStatusAdmin/${ticketId}`, formData, {
                    withCredentials: true,
                    headers: { 
                        'Content-Type': 'multipart/form-data' 
                    }
                }
            );

            return response.data;
        } catch (error) {
            console.error("Error in updateTicketStatusAdmin service:", error);
            throw error;
        }
    },

    markUrgentTickets: async (ticketIds) => {
        try {
            const response = await axios.patch('/api/ticketManagement/markUrgentTickets', { ticketIds }, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error("Error marking urgent tickets:", error);
            throw error;
        }
    },

};