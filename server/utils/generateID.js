import prisma from "../config/prismaClient.js";

// Generate a unique ticket ID

export function generateTicketId() {
    const year = new Date().getFullYear();
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

    let randomPart = '';
    for (let i = 0; i < 5; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        randomPart += chars[randomIndex];
    }

    return `${year}-${randomPart}`;
}