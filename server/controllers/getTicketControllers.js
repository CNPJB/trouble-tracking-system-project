import prisma from "../config/prismaClient.js";

export const getAllTickets = async (req, res) => {
    try {
        // รับค่าจาก Query Parameters
        const page = parseInt(req.query.page) || 1; // หน้า
        const limit = parseInt(req.query.limit) || 10; // จำนวน
        const skip = (page - 1) * limit; // จำนวนที่ข้าม
        const currentUserId = req.user?.userId;
        const whereClause = {};
        const isPersonalView = req.query.isPersonalView === 'true';

        if (isPersonalView) {
            if (!currentUserId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            // กางกำแพงเหล็ก: เห็นแค่อันที่ตัวเองแจ้ง หรือ ไปโหวต
            whereClause.OR = [
                { userId: currentUserId },
                { upvotes: { some: { userId: currentUserId } } }
            ];
        }

        // กรองเฉพาะตั๋วหลัก (ไม่เอา Sub-Tickets) ในกรณีที่ต้องการแสดงเฉพาะตั๋วหลัก
        if (req.query.excludeSubTickets === 'true') {
            whereClause.parentTicketId = null;
        }

        // กรองตามสถานะ (Status)
        if (req.query.status && req.query.status !== 'all') {
            if (req.query.status.includes(',')) {
                whereClause.ticketStatus = { in: req.query.status.split(',') };
            } else {
                // ถ้ามีค่าเดียว ก็ค้นหาปกติ
                whereClause.ticketStatus = req.query.status;
            }
        }
        // ค้นหาข้อความ (Search Keyword)
        if (req.query.search) {
            const searchCondition = {
                OR: [
                    { ticketId: { contains: req.query.search, mode: 'insensitive' } },
                    { title: { contains: req.query.search, mode: 'insensitive' } },
                    { description: { contains: req.query.search, mode: 'insensitive' } },
                    { category: { ticketCtgName: { contains: req.query.search, mode: 'insensitive' } } },
                    { location: { locationName: { contains: req.query.search, mode: 'insensitive' } } },
                    { floor: { floorLevel: { contains: req.query.search, mode: 'insensitive' } } },
                    { room: { roomName: { contains: req.query.search, mode: 'insensitive' } } },
                    { equipment: { equipmentName: { contains: req.query.search, mode: 'insensitive' } } },
                ]
            };

            whereClause.AND = [
                ...(whereClause.AND || []),
                searchCondition
            ];
        }
        // กรอง adminId (ถ้ามีการส่งมา)
        if (req.query.adminId) {
            whereClause.adminId = parseInt(req.query.adminId);
        }

        // กรองตามหมวดหมู่
        if (req.query.categoryId) {
            whereClause.ticketCtgId = parseInt(req.query.categoryId);
        }

        // กรองตามสถานที่
        if (req.query.locationId) {
            whereClause.locationId = parseInt(req.query.locationId);
        }

        /*
        // ยกเว้นตั๋วของตัวเอง (ไม่ต้องโชว์ตั๋วที่ตัวเองเป็นคนแจ้งในช่อง Similar)
        if (req.query.excludeUserId) {
            whereClause.userId = { not: parseInt(req.query.excludeUserId) };
        }
        */

        // เมนู "แจ้งโดยคุณ"
        if (req.query.reporterId) {
            whereClause.userId = parseInt(req.query.reporterId);
            delete whereClause.OR;
        }

        // เมนู "ติดตาม Upvote"
        if (req.query.upvoterId) {
            delete whereClause.OR;
            whereClause.upvotes = {
                some: { userId: parseInt(req.query.upvoterId) }
            };
            whereClause.userId = { not: parseInt(req.query.upvoterId) };
        }

        // เมนู "รอประเมิน"
        if (req.query.needsReviewBy) {
            delete whereClause.OR;
            whereClause.userId = parseInt(req.query.needsReviewBy);
            whereClause.ticketStatus = 'resolved';
            whereClause.rating = null;
        }

        // โชว์เฉพาะตั๋วที่มีการให้คะแนนแล้ว (rating > 0)
        if (req.query.ratedOnly === 'true') {
            whereClause.rating = { gt: 0 };
        }

        // กรองตามช่วงวันที่ (Date Range) จาก createdAt
        if (req.query.startDate || req.query.endDate) {
            whereClause.createdAt = {};
            if (req.query.startDate) {
                // เริ่มต้นที่เวลา 00:00:00 ของวันนั้น
                const start = new Date(req.query.startDate);
                start.setHours(0, 0, 0, 0);
                whereClause.createdAt.gte = start;
            }
            if (req.query.endDate) {
                // สิ้นสุดที่เวลา 23:59:59 ของวันนั้น
                const end = new Date(req.query.endDate);
                end.setHours(23, 59, 59, 999);
                whereClause.createdAt.lte = end;
            }
        }

        const [tickets, totalTickets] = await prisma.$transaction([
            prisma.ticket.findMany({
                where: whereClause,
                skip: skip,
                take: limit,
                orderBy: [
                    // { ticketStatus: 'asc' },
                    { updatedAt: 'desc' }
                ],
                select: {
                    ticketId: true,
                    category: { select: { ticketCtgName: true } },
                    location: { select: { locationName: true } },
                    floor: { select: { floorLevel: true } },
                    room: { select: { roomId: true, roomName: true } },
                    equipment: { select: { equipmentName: true } },
                    title: true,
                    description: true,
                    ticketStatus: true,
                    parentTicketId: true,
                    adminId: true,
                    adminNote: true,
                    rating: true,
                    comment: true,
                    isUrgent: true,
                    createdAt: true,
                    updatedAt: true,
                    images: { select: { imageUrl: true, imageType: true } },
                    ticketCtgId: true,
                    locationId: true,
                    floorId: true,
                    roomId: true,
                    equipment: { select: { equipmentCode: true } },
                    upvotes: { select: { userId: true } },
                    user: { select: { userId: true, fullName: true } },
                    admin: { select: { userId: true, fullName: true } },
                    timestampInprogress: true,
                    timestampFinished: true,
                    _count: {
                        select: { subTickets: true }
                    },
                    subTickets: {
                        include: {
                            user: true
                        }
                    }
                }
            }),
            prisma.ticket.count({
                where: whereClause // count ก็ต้องใช้ where เดียวกับ findMany เพื่อให้นับจำนวนได้ตรงกัน
            })
        ]);
        res.status(200).json({
            success: true,
            data: tickets,
            pagination: {
                currentPage: page,
                itemsPerPage: limit,
                totalItems: totalTickets,
                totalPages: Math.ceil(totalTickets / limit),
                hasNextPage: page < Math.ceil(totalTickets / limit),
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        console.error('Error fetching tickets:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch tickets' });
    }
};

// ดึงข้อมูลสรุปจำนวนตั๋วแยกตามสถานะ
export const getTicketSummary = async (req, res) => {
    try {
        const groupCounts = await prisma.ticket.groupBy({
            by: ['ticketStatus'],
            _count: {
                ticketStatus: true
            }
        });

        // นับจำนวนตั๋วทั้งหมดในระบบ
        const total = await prisma.ticket.count();

        // เตรียม Object เปล่าๆ รอรับข้อมูล
        const summary = {
            all: total,
            pending: 0,
            in_progress: 0,
            resolved: 0,
            rejected: 0
        };

        // เอาผลลัพธ์จาก Database มาหยอดใส่ Object
        groupCounts.forEach(item => {
            if (summary[item.ticketStatus] !== undefined) {
                summary[item.ticketStatus] = item._count.ticketStatus;
            }
        });

        res.status(200).json({ success: true, data: summary });
    } catch (error) {
        console.error('Error fetching ticket summary:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch ticket summary' });
    }
};

export const getSimilarTickets = async (req, res) => {
    try {
        const { search, categoryId, locationId, roomId, equipmentId, excludeUserId } = req.query;

        // ตรวจสอบข้อมูลที่จำเป็น
        if (!search && !categoryId && !locationId && !roomId && !equipmentId) {
            return res.status(200).json({ success: true, data: [] });
        }

        const keyword = search ? search.trim() : '';

        // ป้องกัน SQL Injection: validate ความยาวและชนิด
        if (keyword.length > 200) {
            return res.status(400).json({
                success: false,
                message: "Search keyword too long (max 200 characters)"
            });
        }
        // แปลงค่าเป็นตัวเลข (ป้องกัน Error ถ้าไม่ได้ส่งมา)
        const excludeId = excludeUserId ? parseInt(excludeUserId) : 0;
        const catId = categoryId ? parseInt(categoryId) : null;
        const locId = locationId ? parseInt(locationId) : null;
        const rmId = roomId ? parseInt(roomId) : null;
        const eqId = equipmentId ? parseInt(equipmentId) : 0;

        const userUpvotes = await prisma.upvote.findMany({
            where: { userId: excludeId },
            select: { ticketId: true }
        });
        const upvotedTicketIds = userUpvotes.map(u => u.ticketId);

        /* ==========================================
           STAGE 1: กรองแบบหยาบด้วย PostgreSQL (Trigram)
           ========================================== */
        const suspectedTickets = await prisma.$queryRaw`
            SELECT 
                "ticket_id" as "ticketId", 
                "title", 
                "ticket_ctg_id" as "ticketCtgId", 
                "location_id" as "locationId",
                "room_id" as "roomId",
                "equipment_id" as "equipmentId",
                GREATEST(
                    similarity("title", ${keyword}), 
                    similarity(COALESCE("description", ''), ${keyword})
                ) AS trgm_score
            FROM tickets
            WHERE 
                "ticket_status" = 'pending' 
                AND "user_id" != ${excludeId}
                AND (
                    -- งื่อนไขที่ 1: พิมพ์คำค้นหา และคำคล้ายกัน
                    (${keyword} != '' AND GREATEST(similarity("title", ${keyword}), similarity(COALESCE("description", ''), ${keyword})) > 0.15)
                    -- เงื่อนไขที่ 2: รหัสครุภัณฑ์ตรงกันเป๊ะ
                    OR ("equipment_id" IS NOT NULL AND "equipment_id" = ${eqId} AND ${eqId} != 0)
                    -- เงื่อนไขที่ 3: ห้องเดียวกันเป๊ะ (โอกาสเกิดปัญหาซ้ำสูงมาก)
                    OR ("room_id" IS NOT NULL AND "room_id" = ${rmId} AND ${rmId} != 0)
                    -- เงื่อนไขที่ 4: หมวดหมู่เดียวกัน และสถานที่เดียวกัน (เช่น หมวดแอร์ ที่ตึก A)
                    OR ("location_id" = ${locId} AND "ticket_ctg_id" = ${catId} AND ${locId} != 0 AND ${catId} != 0)
                )
            ORDER BY trgm_score DESC
            LIMIT 30;
        `;

        /* ==========================================
           STAGE 2: จัดอันดับแบบละเอียดด้วย Node.js (Scoring Engine)
           ========================================== */
        const notVotedTickets = suspectedTickets.filter(
            ticket => !upvotedTicketIds.includes(ticket.ticketId)
        );

        const scoredTickets = notVotedTickets.map(ticket => {
            let score = ticket.trgm_score * 100;
            if (catId && ticket.ticketCtgId === catId) score += 30;
            if (locId && ticket.locationId === locId) score += 20;
            if (rmId && ticket.roomId === rmId) score += 50;
            if (eqId !== 0 && ticket.equipmentId === eqId) score += 1000;
            return { ...ticket, totalScore: score };
        });

        // เรียงลำดับแล้วตัดเอา 10 อันดับแรก
        const validTickets = scoredTickets.filter(t => t.totalScore > 0);
        validTickets.sort((a, b) => b.totalScore - a.totalScore);

        const top10Tickets = validTickets.slice(0, 10);
        const top10Ids = top10Tickets.map(t => t.ticketId);

        // ถ้าหาไม่เจอเลย ส่งกลับ
        if (top10Ids.length === 0) {
            return res.status(200).json({
                success: true,
                data: [],
                message: "No similar tickets found. Consider upvoting existing issues or create a new one."
            });
        }

        /* ==========================================
           STAGE 3: ประกอบร่างข้อมูลเตรียมส่งให้ React
           ========================================== */
        const finalTickets = await prisma.ticket.findMany({
            where: { ticketId: { in: top10Ids } },
            select: {
                ticketId: true,
                title: true,
                description: true,
                ticketStatus: true,
                location: { select: { locationName: true } },
                floor: { select: { floorLevel: true } },
                room: { select: { roomName: true } },
                equipment: { select: { equipmentCode: true } },
                images: { select: { imageUrl: true } },
                upvotes: true,
                userId: true
            }
        });

        // Prisma findMany จะไม่ได้เรียงลำดับตาม ID ให้ เราจึงต้องจัดเรียงมันใหม่ให้ตรงกับคะแนนของ top
        const sortedFinalTickets = top10Tickets.map(topTicket =>
            finalTickets.find(f => f.ticketId === topTicket.ticketId)
        );

        res.status(200).json({
            success: true,
            data: sortedFinalTickets
        });
    } catch (error) {
        console.error('Error in Similar Tickets search:', error);
        res.status(500).json({ success: false, error: 'Failed to search similar tickets' });
    }
};

export const getTicketById = async (req, res) => {
    try {
        const { id } = req.params;

        const ticket = await prisma.ticket.findUnique({
            where: { ticketId: id },
            include: {
                category: true,
                location: true,
                floor: true,
                room: true,
                equipment: true,
                images: true,
                // ticketStatus: true,
                user: {
                    select: { userId: true, fullName: true, email: true }
                },
                admin: { select: { userId: true, fullName: true } },
                subTickets: {
                    include: {
                        user: { select: { fullName: true } }
                    }
                },
                _count: { select: { subTickets: true } }

            }
        });

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: "Ticket not found"
            });
        }
        // if (ticket.userId !== req.user.userId) {
        //     return res.status(403).json({
        //         success: false,
        //         message: "You are not authorized to view this ticket"
        //     });
        // }

        res.status(200).json({
            success: true,
            data: ticket
        });

    } catch (error) {
        console.error('Error fetching ticket by ID:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch ticket details'
        });
    }
};