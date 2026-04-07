import prisma from "../config/prismaControllers";


export const addTicket = async (req, res) => {
    try {
        const {
            userId,
            ticketCtgId,
            locationId,
            floorId,
            roomId,
            equipmentId,
            title,
            description,
            ticketStatus,
            parentTicketId,
            adminId,
            adminNote,
            rating,
            comment,
            createdAt,
            updatedAt
        } = req.body;

        const ticket = await prisma.ticket.create({
            data: {
                userId,
                ticketCtgId,
                locationId,
                floorId,
                roomId,
                equipmentId,
                title,
                description,
                ticketStatus,
                parentTicketId,
                adminId,
                adminNote,
                rating,
                comment,
                createdAt,
                updatedAt
            }
        });

        res.status(201).json(ticket);
    } catch (error) {
        console.error('Error creating ticket:', error);
        res.status(500).json({ error: 'Failed to create ticket' });
    }
};

