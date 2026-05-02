import prisma from "../config/prismaClient.js";

// Generate a unique ticket ID

export async function generateTicketId() {
    const year = new Date().getFullYear();
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

    let isUnique = false;
    let newTicketId = '';

    while (!isUnique) {
        let randomPart = '';
        for (let i = 0; i < 5; i++) {
            const randomIndex = Math.floor(Math.random() * chars.length);
            randomPart += chars[randomIndex];
        }

        newTicketId = `${year}-${randomPart}`;

        // Check if the generated ID already exists in the database
        const existingTicket = await prisma.ticket.findUnique({
            where: { ticketId: newTicketId }
        });

        if (!existingTicket) {
            isUnique = true; // ID is unique, exit the loop
        }
    }

    return newTicketId;
}