import { create } from "node:domain";
import prisma from "../config/prismaClient.js";

export const getMostCategoriesOfProblems = async (req, res) => {
    try {
        const MostCategories = await prisma.TicketCategory.findMany({
            include: {
                _count: {
                    select: {
                        tickets: true
                    }
                }
            },
            orderBy: {
                tickets: {
                    _count: "desc"
                }
            },
        });

        const formattedCategories = MostCategories.map(category => ({
            ticketCtgId: category.ticketCtgId,
            ticketCtgName: category.ticketCtgName,
            ticketCount: category._count.tickets
        }));
        res.json(formattedCategories);
    }
    catch (error) {
        console.error("Error fetching most categories of problems:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const MostUpvotedTickets = async (req, res) => {
    try {
        const mostUpvotedTickets = await prisma.Ticket.findMany({
            orderBy: {
                upvotes: {
                    _count: "desc"
                }
            },
            include: {
                _count: {
                    select: { upvotes: true }
                },
                location: true,
            },

            take: 5
        });
        const formattedTickets = mostUpvotedTickets.map(ticket => ({
            ticketId: ticket.ticketId,
            title: ticket.title,
            location: ticket.location?.locationName || 'ไม่ระบุสถานที่',
            upvoteCount: ticket._count.upvotes
        }));
        res.status(200).json({ success: true, data: formattedTickets });
    } catch (error) {
        console.error("Error fetching most upvoted tickets:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getTicketStats = async (req, res) => {
    try {
        const { year, month } = req.query;
        const targetYear = year ? parseInt(year) : new Date().getFullYear();

        if (month === 'all') {
            const startDate = new Date(targetYear, 0, 1);
            const endDate = new Date(targetYear + 1, 0, 1);

            const tickets = await prisma.ticket.findMany({
                where: { createdAt: { gte: startDate, lt: endDate } },
                select: { createdAt: true, ticketStatus: true } 
            });

            const created = Array(12).fill(0);
            const resolved = Array(12).fill(0);

            tickets.forEach(ticket => {
                const m = ticket.createdAt.getMonth(); // ได้ 0 - 11
                created[m] += 1;
                if (ticket.ticketStatus === 'resolved') resolved[m] += 1;
            });

            return res.status(200).json({ created, resolved });
        }

        else {
            const targetMonth = parseInt(month);
            const startDate = new Date(targetYear, targetMonth, 1);
            const endDate = new Date(targetYear, targetMonth + 1, 1);

            const tickets = await prisma.ticket.findMany({
                where: { createdAt: { gte: startDate, lt: endDate } },
                select: { createdAt: true, ticketStatus: true } // *แก้ status ให้ตรง DB เฮีย
            });

            // ตะกร้า 5 ใบ (สัปดาห์ 1 - 5)
            const created = Array(5).fill(0);
            const resolved = Array(5).fill(0);

            tickets.forEach(ticket => {
                const dayOfMonth = ticket.createdAt.getDate();
                let weekIndex = Math.floor((dayOfMonth - 1) / 7);
                if (weekIndex > 4) weekIndex = 4; // กันเศษเกิน

                created[weekIndex] += 1;
                if (ticket.ticketStatus === 'resolved') resolved[weekIndex] += 1;
            });

            return res.status(200).json({ created, resolved });
        }

    } catch (error) {
        console.error('Error fetching ticket stats:', error);
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงสถิติ' });
    }
};