import prisma from "../config/prismaClient.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinaryUpload.js";
import { sendTicketStatusEmail } from "../services/emailService.js";

export const getTicketGroups = async (req, res) => {
    try {
        const groupedTickets = await prisma.ticket.findMany({
            where: {
                subTickets: {
                    some: {} // เฉพาะตั๋วที่มี sub tickets
                },
                ticketStatus: 'pending'
            },
            include: {
                category: { select: { ticketCtgName: true } },
                location: { select: { locationName: true } },
                floor: { select: { floorLevel: true } },
                room: { select: { roomName: true } },
                subTickets: {
                    include: {
                        user: { select: { userId: true, fullName: true } }
                    }
                },
                _count: {
                    select: { subTickets: true }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.status(200).json({
            success: true,
            data: groupedTickets
        });
    } catch (error) {
        console.error('Error fetching ticket groups:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch ticket groups' });
    }
};

export const mergeTickets = async (req, res) => {
    try {
        const { primaryTicketId, duplicateTicketIds } = req.body;

        // 1. Validation เบื้องต้น
        if (!primaryTicketId || !duplicateTicketIds || duplicateTicketIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: "ข้อมูลไม่ครบถ้วน กรุณาระบุตั๋วหลักและตั๋วที่ต้องการยุบรวม"
            });
        }

        if (duplicateTicketIds.includes(primaryTicketId)) {
            return res.status(400).json({
                success: false,
                message: "ตั๋วหลักต้องไม่ซ้ำกับรายชื่อตั๋วที่ต้องการยุบรวม"
            });
        }

        // 2. เริ่มต้น Transaction (ทำงานทุกอย่างในกรอบ tx นี้)
        const result = await prisma.$transaction(async (tx) => {

            // A. ดึงข้อมูลตั๋วหลัก (เพื่อดูว่ามีใครเกี่ยวข้องกันอยู่แล้วบ้าง)
            const primaryTicket = await tx.ticket.findUnique({
                where: { ticketId: primaryTicketId },
                include: { upvotes: true }
            });

            if (!primaryTicket) {
                throw new Error("PRIMARY_NOT_FOUND");
            }

            if (primaryTicket.ticketStatus === 'duplicate') {
                throw new Error("PRIMARY_IS_DUPLICATE");
            }

            // รวบรวม ID ของคนที่ "เกี่ยวข้องกับตั๋วหลัก" อยู่แล้ว (คนแจ้ง + คนโหวต)
            const primaryUsers = new Set(primaryTicket.upvotes.map(u => u.userId));
            primaryUsers.add(primaryTicket.userId);

            // B. ดึงข้อมูลตั๋วซ้ำทั้งหมดที่ส่งมา
            const duplicateTickets = await tx.ticket.findMany({
                where: { ticketId: { in: duplicateTicketIds } },
                include: {
                    upvotes: true,
                    subTickets: {
                        include: { upvotes: true } // ดึงคนโหวตของตั๋วลูกมาด้วย
                    }
                }
            });

            // C. รวบรวมคนจากตั๋วซ้ำเพื่อเตรียมย้ายบ้าน
            const usersToMigrate = new Set();

            const allTicketsToFlatten = new Set();

            duplicateTickets.forEach(ticket => {
                allTicketsToFlatten.add(ticket.ticketId);
                usersToMigrate.add(ticket.userId);
                ticket.upvotes.forEach(u => usersToMigrate.add(u.userId));

                // ถ้าตั๋วนี้มีลูกห้อยมาด้วย ให้จับลูกมันออกมาด้วย (Flatten)
                if (ticket.subTickets && ticket.subTickets.length > 0) {
                    ticket.subTickets.forEach(sub => {
                        allTicketsToFlatten.add(sub.ticketId);
                        usersToMigrate.add(sub.userId);
                        sub.upvotes.forEach(u => usersToMigrate.add(u.userId));
                    });
                }
            });

            // D. กรองคนที่ซ้ำออก (ถ้าเขาโหวตตั๋วหลักอยู่แล้ว ก็ไม่ต้องย้ายไปซ้ำ)
            const newUpvoters = [...usersToMigrate].filter(userId => !primaryUsers.has(userId));

            // E. เริ่มกระบวนการแก้ไข Database

            // 1) เพิ่มคนโหวตใหม่เข้าตั๋วหลัก
            if (newUpvoters.length > 0) {
                await tx.upvote.createMany({
                    data: newUpvoters.map(userId => ({
                        ticketId: primaryTicketId,
                        userId: userId
                    }))
                });
            }

            // 2) เปลี่ยนสถานะตั๋วซ้ำเป็น duplicate และผูก parentTicketId
            await tx.ticket.updateMany({
                where: { ticketId: { in: Array.from(allTicketsToFlatten) } }, // ใช้ ID ทั้งหมดที่รวมลูกหลานแล้ว
                data: {
                    ticketStatus: 'duplicate',
                    parentTicketId: primaryTicketId,
                    updatedAt: new Date()
                }
            });

            return { migratedUsersCount: newUpvoters.length, flattenedCount: allTicketsToFlatten.size };
        });

        res.status(200).json({
            success: true,
            message: `ยุบรวมปัญหาสำเร็จ (โอนย้ายผู้ติดตามจำนวน ${result.migratedUsersCount} คนไปยังตั๋วหลัก)`,
        });

    } catch (error) {
        console.error('Error merging tickets:', error);

        if (error.message === "PRIMARY_NOT_FOUND") {
            return res.status(404).json({ success: false, message: "ไม่พบข้อมูลตั๋วหลักในระบบ" });
        }

        if (error.message === "PRIMARY_IS_DUPLICATE") {
            return res.status(400).json({ success: false, message: "ไม่สามารถใช้ตั๋วที่ถูกรวมไปแล้วเป็นตั๋วหลักได้" });
        }

        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการยุบรวมปัญหา โปรดลองใหม่อีกครั้ง',
            error: error.message
        });
    }
};

export const unmergeTickets = async (req, res) => {
    try {
        const { subTicketId, mainTicketId } = req.body;

        if (!subTicketId && !mainTicketId) {
            return res.status(400).json({
                success: false,
                message: "กรุณาระบุรหัสปัญหาที่ต้องการแยก (subTicketId) หรือรหัสกลุ่มปัญหาที่ต้องการยุบ (mainTicketId)"
            });
        }

        if (subTicketId && mainTicketId) {
            return res.status(400).json({
                success: false,
                message: "ไม่สามารถดำเนินการพร้อมกันได้ กรุณาเลือกแยกทีละรายการ หรือยุบทั้งกลุ่มอย่างใดอย่างหนึ่ง"
            });
        }

        let resultCount = 0;
        let actionMessage = "";

        // แยกออกทีละใบ (Remove Single Sub-ticket)
        if (subTicketId) {
            const ticket = await prisma.ticket.findUnique({
                where: { ticketId: subTicketId },
                select: { ticketStatus: true, parentTicketId: true }
            });

            if (!ticket || ticket.ticketStatus !== 'duplicate' || !ticket.parentTicketId) {
                return res.status(404).json({
                    success: false,
                    message: "ไม่พบข้อมูลตั๋วลูก หรือตั๋วใบนี้ไม่ได้อยู่ในการรวมกลุ่มใดๆ"
                });
            }

            // คืนสถานะกลับเป็น pending และล้างร่องรอยการรวมกลุ่ม
            await prisma.ticket.update({
                where: { ticketId: subTicketId },
                data: {
                    ticketStatus: 'pending',
                    parentTicketId: null,
                    updatedAt: new Date()
                }
            });

            resultCount = 1;
            actionMessage = `แยกรายการปัญหา ${subTicketId} ออกจากกลุ่มสำเร็จ`;
        }

        // ยุบทั้งกลุ่ม (Disband Entire Group)
        if (mainTicketId) {
            // ใช้ updateMany เพื่อความเร็ว: อัปเดตตั๋วทุกใบที่ผูกกับแม่คนนี้
            const updateResult = await prisma.ticket.updateMany({
                where: {
                    parentTicketId: mainTicketId,
                    ticketStatus: 'duplicate'
                },
                data: {
                    ticketStatus: 'pending',
                    parentTicketId: null,
                    updatedAt: new Date()
                }
            });

            if (updateResult.count === 0) {
                return res.status(404).json({
                    success: false,
                    message: "ไม่พบตั๋วลูกที่ถูกรวมอยู่ในกลุ่มปัญหานี้ หรือกลุ่มนี้ถูกยุบไปแล้ว"
                });
            }

            resultCount = updateResult.count;
            actionMessage = `ยุบกลุ่มปัญหาหลัก ${mainTicketId} สำเร็จ (แยกตั๋วลูกจำนวน ${resultCount} รายการ)`;
        }

        res.status(200).json({
            success: true,
            message: actionMessage
        });

    } catch (error) {
        console.error('Error unmerging tickets:', error);
        res.status(500).json({
            success: false,
            message: "เกิดข้อผิดพลาดในการแยกกลุ่มปัญหา โปรดลองใหม่อีกครั้ง",
            error: error.message
        });
    }
};

export const getUrgentTickets = async (req, res) => {
    try {
        // 1. ดึงตั๋วสถานะ pending ทั้งหมด พร้อมยอดนับลูกและโหวต
        const pendingTickets = await prisma.ticket.findMany({
            where: { ticketStatus: 'pending' },
            include: {
                location: true,
                floor: true,
                room: true,
                images: true,
                _count: {
                    select: { subTickets: true }
                },
                upvotes: { select: { upvoteId: true } } // ดึงมาเพื่อนับจำนวน
            }
        });

        // 2. คำนวณคะแนนใน Memory
        const scoredTickets = pendingTickets.map(ticket => {
            const subCount = ticket._count?.subTickets || 0;
            const voteCount = ticket.upvotes?.length || 0;
            const score = (subCount * 5) + voteCount;

            // ลบ upvotes ทิ้งเพื่อไม่ให้ payload บวมเกินความจำเป็น
            const { upvotes, ...ticketData } = ticket;
            return { ...ticketData, urgencyScore: score };
        });

        // 3. เรียงจากคะแนนมากไปน้อย
        scoredTickets.sort((a, b) => b.urgencyScore - a.urgencyScore);

        // 4. ตัดเอาแค่ 5 อันดับแรกที่มีคะแนนมากกว่า 0 (ถ้าไม่มีคะแนนเลยก็ไม่ต้องโชว์ด่วน)
        const top5Urgent = scoredTickets
            .filter(t => t.urgencyScore > 0)
            .slice(0, 5);

        res.status(200).json({ success: true, data: top5Urgent });
    } catch (error) {
        console.error('Error fetching urgent tickets:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch urgent tickets' });
    }
};

export const updateTicketStatusAdmin = async (req, res) => {
    let uploadedImagesForRollback = []; // เตรียม Array ไว้เก็บ ID รูปเผื่อต้อง Rollback

    try {
        const { id } = req.params;
        const { ticketStatus, adminNote } = req.body;
        const adminId = req.user.userId;
        const files = req.files;

        // 1. ดึงข้อมูลตั๋วปัจจุบันมาตรวจสอบก่อน
        const ticket = await prisma.ticket.findUnique({
            where: { ticketId: id },
            select: {
                ticketStatus: true,
                equipmentId: true,
                adminId: true,
                title: true,
                subTickets: {
                    select: { equipmentId: true }
                }
            }
        });

        if (!ticket) {
            return res.status(404).json({ success: false, message: "ไม่พบข้อมูลปัญหาในระบบ" });
        }

        const currentStatus = ticket.ticketStatus;

        // 2. State Machine Validation
        if (currentStatus === 'pending' && !['in_progress', 'rejected'].includes(ticketStatus)) {
            return res.status(400).json({ success: false, message: "สถานะ 'รอรับเรื่อง' สามารถเปลี่ยนเป็น 'กำลังดำเนินการ' หรือ 'ปฏิเสธ' ได้เท่านั้น" });
        }
        if (currentStatus === 'in_progress' && !['resolved', 'rejected'].includes(ticketStatus)) {
            return res.status(400).json({ success: false, message: "สถานะ 'กำลังดำเนินการ' สามารถเปลี่ยนเป็น 'เสร็จสิ้น' หรือ 'ปฏิเสธ' ได้เท่านั้น" });
        }
        if (['resolved', 'rejected', 'duplicate', 'canceled'].includes(currentStatus)) {
            return res.status(400).json({ success: false, message: "รายการนี้ถูกปิดไปแล้ว ไม่สามารถเปลี่ยนสถานะได้อีก" });
        }

        // 3. บังคับกรอก Admin Note กรณี Rejected
        if (['rejected'].includes(ticketStatus) && (!adminNote || adminNote.trim() === '')) {
            return res.status(400).json({ success: false, message: "กรุณาระบุเหตุผลการปฏิเสธ" });
        }

        // 4. จัดการอัปโหลดรูปภาพ (เฉพาะกรณี Resolved)
        const uploadedImagesData = [];
        if (ticketStatus === 'resolved') {
            if (files && files.length > 0) {
                // ใช้เทคนิค Promise.all เหมือนใน addTicket
                const uploadPromises = files.map((file) => uploadToCloudinary(file.buffer, 'TTS-img'));
                const cloudinaryResults = await Promise.all(uploadPromises);

                cloudinaryResults.forEach((result) => {
                    uploadedImagesData.push({
                        imageUrl: result.secure_url,
                        imageType: "after", // กำหนดว่าเป็นรูป "หลังซ่อม"
                        imagePublicId: result.public_id,
                    });
                    // เก็บ Public ID ไว้เผื่อ Database พัง จะได้ตามไปลบทิ้งได้
                    uploadedImagesForRollback.push(result.public_id);
                });
            } else {
                // ถ้าแอดมินไม่ได้อัปโหลดรูป ให้ใช้รูป default อัตโนมัติ
                uploadedImagesData.push({
                    imageUrl: '/default-noimage-admin-1.jpg',
                    imageType: "after",
                    imagePublicId: 'default-noimage'
                });
            }
        }

        // 5. เริ่ม Transaction เพื่ออัปเดตข้อมูลทุกตารางพร้อมกัน
        const result = await prisma.$transaction(async (tx) => {

            // 5.1 เตรียมข้อมูลอัปเดต Ticket
            const updateData = {
                ticketStatus,
                updatedAt: new Date()
            };

            // กำหนดผู้รับผิดชอบเฉพาะครั้งแรกที่มีการรับงานเท่านั้น
            // เพื่อป้องกันแอดมินคนถัดมาเขียนทับผู้ดำเนินการเดิม
            if (!ticket.adminId) {
                updateData.adminId = adminId;
            }

            // ใส่ Admin Note ถ้ามีการส่งมา
            if (adminNote) updateData.adminNote = adminNote;

            // ประทับตราเวลา (Timestamps)
            if (ticketStatus === 'in_progress') {
                updateData.timestampInprogress = new Date();
            } else if (['resolved', 'rejected'].includes(ticketStatus)) {
                updateData.timestampFinished = new Date();
            }

            // สั่งอัปเดตตั๋ว
            const updatedTicket = await tx.ticket.update({
                where: { ticketId: id },
                data: updateData
            });

            // 5.2 เซฟรูปลง Database (ถ้ามี)
            if (uploadedImagesData.length > 0) {
                await tx.ticketImage.createMany({
                    data: uploadedImagesData.map(img => ({
                        ticketId: id,
                        imageUrl: img.imageUrl,
                        imageType: img.imageType,
                        imagePublicId: img.imagePublicId
                    }))
                });
            }

            // 5.3 ซิงค์สถานะครุภัณฑ์ (Equipment Status Workflow)

            const equipmentIdsSet = new Set();

            if (ticket.equipmentId) {
                equipmentIdsSet.add(ticket.equipmentId); // ใส่ของแม่
            }

            if (ticket.subTickets && ticket.subTickets.length > 0) {
                ticket.subTickets.forEach(sub => {
                    if (sub.equipmentId) {
                        equipmentIdsSet.add(sub.equipmentId); // ใส่ของลูก
                    }
                });
            }

            const allEquipmentIds = Array.from(equipmentIdsSet);

            if (allEquipmentIds.length > 0) {
                let newEqStatus = null;

                if (ticketStatus === 'in_progress') {
                    newEqStatus = 'sent_for_repair'; // แจ้งซ่อม -> สถานะส่งซ่อม
                } else if (ticketStatus === 'resolved') {
                    newEqStatus = 'active'; // ซ่อมเสร็จ -> กลับมาพร้อมใช้งาน
                } else if (ticketStatus === 'rejected') {
                    newEqStatus = 'broken'; // ปฏิเสธการซ่อม -> คืนค่ากลับไป broken
                }

                if (newEqStatus) {
                    // ใช้ updateMany และเงื่อนไข { in: [...] } เพื่ออัปเดตหลายชิ้นพร้อมกัน
                    await tx.equipment.updateMany({
                        where: {
                            equipmentId: { in: allEquipmentIds }
                        },
                        data: { equipmentStatus: newEqStatus }
                    });
                }
            }

            const subTicketUpdateData = {
                ticketStatus,
                adminId,
                updatedAt: new Date()
            };

            if (adminNote) {
                subTicketUpdateData.adminNote = `[ดำเนินการจากปัญหาหลัก]: ${adminNote}`;
            }

            if (ticketStatus === 'in_progress') {
                subTicketUpdateData.timestampInprogress = new Date();
            } else if (['resolved', 'rejected'].includes(ticketStatus)) {
                subTicketUpdateData.timestampFinished = new Date();
            }

            await tx.ticket.updateMany({
                where: { parentTicketId: id },
                data: subTicketUpdateData
            });

            return updatedTicket;
        });

        // ส่ง Email
        if (['in_progress', 'resolved', 'rejected'].includes(ticketStatus)) {

            // ดึง User ทั้งหมดที่เกี่ยวข้องกับปัญหานี้
            const relatedUsers = await prisma.user.findMany({
                where: {
                    OR: [
                        { ticketsCreated: { some: { ticketId: id } } },           // ผู้แจ้งปัญหาหลัก
                        { ticketsCreated: { some: { parentTicketId: id } } },     // ผู้แจ้งตั๋วลูก (ที่ถูกยุบรวม)
                        { upvotes: { some: { ticketId: id } } }                   // ผู้โหวตติดตามปัญหา
                    ]
                },
                select: { email: true }
            });

            // กรองเอาเฉพาะคนที่มี Email ในระบบ
            const userEmails = relatedUsers
                .map(u => u.email)
                .filter(email => email !== null && email !== undefined);

            // เตรียมข้อมูลตั๋วเพื่อส่งให้ Template อีเมล
            const ticketDataForEmail = {
                ticketId: id,
                title: ticket.title,
                ticketStatus: ticketStatus,
                adminNote: adminNote
            };

            // สั่งส่งอีเมลแบบ Fire and Forget (วนลูปส่งเบื้องหลัง ไม่ต้องรอให้ส่งเสร็จถึงจะตอบกลับหน้าเว็บ)
            userEmails.forEach(email => {
                sendTicketStatusEmail(email, ticketDataForEmail)
                    .catch(err => console.error(`Failed to send email in background.`, err));
            });
        }

        res.status(200).json({
            success: true,
            message: `อัปเดตสถานะเป็น ${ticketStatus} สำเร็จเรียบร้อย`,
            data: result
        });

    } catch (error) {
        console.error('Error updating ticket status:', error);

        // Rollback: ถ้าเซฟลง Database ไม่สำเร็จ แต่ดันอัปโหลดรูปขึ้น Cloudinary ไปแล้ว ต้องลบรูปทิ้ง[cite: 27]
        if (uploadedImagesForRollback.length > 0) {
            console.log("Rolling back uploaded images from Cloudinary...");
            const rollbackPromises = uploadedImagesForRollback.map(publicId => deleteFromCloudinary(publicId));
            await Promise.all(rollbackPromises).catch(e => console.error("Rollback failed:", e));
        }

        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการอัปเดตสถานะปัญหา',
            error: error.message
        });
    }
};