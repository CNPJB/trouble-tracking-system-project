import prisma from "../config/prismaClient.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinaryUpload.js";
import { generateTicketId } from "../utils/generateID.js";

export const addTicket = async (req, res) => {
    let uploadedImagesForRollback = [];

    try {
        const userId = req.user.userId;
        const {
            ticketCtgId,
            locationId,
            floorId,
            roomId,
            equipmentId,
            title,
            description,
        } = req.body;

        const files = req.files || []; // รับไฟล์จาก multer
        const customTicketId = await generateTicketId();

        if (!files || files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "กรุณาอัปโหลดหรือถ่ายรูปอย่างน้อย 1 รูปก่อนส่งคำร้อง"
            });
        }

        // ตรวจสอบความถูกต้องของข้อมูลที่ส่งมา
        const [category, location, floor, room, equipment] = await Promise.all([
            prisma.ticketCategory.findUnique({ where: { ticketCtgId: parseInt(ticketCtgId) } }),
            prisma.location.findUnique({ where: { locationId: parseInt(locationId) } }),
            floorId ? prisma.floor.findUnique({ where: { floorId: parseInt(floorId) } }) : Promise.resolve(null),
            roomId ? prisma.room.findUnique({ where: { roomId: parseInt(roomId) } }) : Promise.resolve(null),
            equipmentId ? prisma.equipment.findUnique({ where: { equipmentId: parseInt(equipmentId) } }) : Promise.resolve(null)
        ]);

        if (!category || category.ticketCtgStatus !== 'enable') {
            return res.status(400).json({ success: false, message: "ประเภทปัญหานี้ถูกปิดใช้งานไปแล้ว ไม่สามารถแจ้งได้" });
        }
        if (!location || location.locationStatus !== 'active') {
            return res.status(400).json({ success: false, message: "สถานที่นี้ปิดให้บริการ ไม่สามารถแจ้งปัญหาได้" });
        }
        if (floorId && (!floor || floor.floorStatus !== 'active')) {
            return res.status(400).json({ success: false, message: "ชั้นนี้ปิดให้บริการ ไม่สามารถแจ้งปัญหาได้" });
        }
        if (roomId && (!room || room.roomStatus !== 'active')) {
            return res.status(400).json({ success: false, message: "ห้องนี้ปิดให้บริการ ไม่สามารถแจ้งปัญหาได้" });
        }
        if (equipmentId && (!equipment || equipment.equipmentStatus !== 'active')) {
            return res.status(400).json({ success: false, message: "ครุภัณฑ์นี้ไม่ได้อยู่ในสถานะพร้อมใช้งาน หรือถูกส่งซ่อมไปแล้ว" });
        }

        if (equipmentId) {
            const existingActiveTicket = await prisma.ticket.findFirst({
                where: {
                    equipmentId: parseInt(equipmentId),
                    // ห้ามแจ้งใหม่ถ้าของเดิมยังเป็น pending หรือ in_progress
                    ticketStatus: {
                        in: ['pending', 'in_progress']
                    }
                }
            });

            if (existingActiveTicket) {
                // ใช้ Status 409 (Conflict) เพื่อบอกว่าข้อมูลขัดแย้งกับสิ่งที่มีอยู่ในระบบ
                return res.status(409).json({
                    success: false,
                    message: "ครุภัณฑ์นี้มีการแจ้งปัญหาและกำลังดำเนินการอยู่ โปรดกดโหวตที่รายการเดิมแทนการแจ้งใหม่ หรือเป็นปัญหาที่คุณแจ้งไปแล้ว เราจะดำเนินการแก้ไขให้เร็วที่สุด"
                });
            }
        }

        const uploadedImages = [];
        if (files && files.length > 0) {
            const uploadPromises = files.map((file) =>
                uploadToCloudinary(file.buffer, 'TTS-img')
            );
            const cloudinaryResults = await Promise.all(uploadPromises);

            cloudinaryResults.forEach((result) => {
                uploadedImages.push({
                    imageUrl: result.secure_url,
                    imagePublicId: result.public_id,
                    imageType: 'before'
                });

                // เก็บ Public ID ไว้เผื่อต้อง Rollback
                uploadedImagesForRollback.push(result.public_id);
            });
        }

        const dataToCreate = {
            ticketId: customTicketId,
            title,
            description,
            user: { connect: { userId: userId } },
            category: { connect: { ticketCtgId: parseInt(ticketCtgId) } },
            location: { connect: { locationId: parseInt(locationId) } },
        };

        if (floorId) dataToCreate.floor = { connect: { floorId: parseInt(floorId) } };
        if (roomId) dataToCreate.room = { connect: { roomId: parseInt(roomId) } };
        if (equipmentId) dataToCreate.equipment = { connect: { equipmentId: parseInt(equipmentId) } };

        if (uploadedImages.length > 0) {
            dataToCreate.images = { create: uploadedImages };
        }

        // -------------------------------------------------------------
        // ระบบ Retry ป้องกัน ID ชนกัน (Race Condition & Collision)
        // -------------------------------------------------------------
        let newTicket;
        let attempts = 0;
        const MAX_ATTEMPTS = 5;

        while (attempts < MAX_ATTEMPTS) {
            try {
                // สุ่ม ID ใหม่ทุกครั้งที่พยายามเซฟ
                const customTicketId = await generateTicketId();
                dataToCreate.ticketId = customTicketId;

                // สร้างตั๋วพร้อมรูปภาพใน transaction เดียวกัน
                newTicket = await prisma.ticket.create({
                    data: dataToCreate,
                    include: { images: true }
                });

                break; // เซฟสำเร็จ หลุดออกจากลูป

            } catch (error) {
                // เช็คว่า Error เกิดจากเลข ID ซ้ำ (Unique constraint failed - P2002) หรือไม่
                if (error.code === 'P2002' && attempts < MAX_ATTEMPTS - 1) {
                    console.warn(`Ticket ID collision detected. Retrying... (${attempts + 1}/${MAX_ATTEMPTS})`);
                    attempts++;
                    continue; // วนกลับไปสุ่มเลขใหม่
                }

                // ถ้าเป็น Error อื่น หรือเกินจำนวนที่จำกัดแล้ว ให้โยน Error ออกไปที่ catch ตัวนอกสุด
                throw error;
            }
        }

        res.status(201).json({
            success: true,
            message: "Add ticket successfully",
            data: newTicket
        });

    } catch (error) {
        console.error('Error creating ticket:', error);

        if (uploadedImagesForRollback.length > 0) {
            console.log("Database Error! Rolling back images from Cloudinary...");
            const rollbackPromises = uploadedImagesForRollback.map(publicId =>
                deleteFromCloudinary(publicId) // ฟังก์ชันลบรูปที่เราสร้างไว้
            );
            await Promise.all(rollbackPromises).catch(e => console.error("Rollback failed:", e));
        }

        res.status(500).json({
            success: false,
            error: 'Failed to create ticket'
        });
    }
};

export const updateTicket = async (req, res) => {
    let uploadedImagesForRollback = [];

    try {
        const { id } = req.params;
        console.log(req.body)
        const {
            ticketCtgId, locationId, floorId, roomId, equipmentId,
            title, description,ticketStatus, // เพิ่ม ticketStatus เข้ามาเพื่อให้แอดมินสามารถแก้ไขสถานะได้ในกรณีที่ต้องการเปลี่ยนจาก pending เป็น in_progress หรือ resolved ได้เลย
            imagesToDelete // หน้าบ้านจะส่งเป็น Array String มา เช่น "[12, 15]" (ID ของ TicketImage ที่จะลบ)
        } = req.body;
        
        const files = req.files;
        const existingTicket = req.ticket;

        const validationPromises = [
            (ticketCtgId && parseInt(ticketCtgId) !== existingTicket.ticketCtgId) 
                ? prisma.ticketCategory.findUnique({ where: { ticketCtgId: parseInt(ticketCtgId) } }) : Promise.resolve(null),
            (locationId && parseInt(locationId) !== existingTicket.locationId) 
                ? prisma.location.findUnique({ where: { locationId: parseInt(locationId) } }) : Promise.resolve(null),
            (floorId && parseInt(floorId) !== existingTicket.floorId) 
                ? prisma.floor.findUnique({ where: { floorId: parseInt(floorId) } }) : Promise.resolve(null),
            (roomId && parseInt(roomId) !== existingTicket.roomId) 
                ? prisma.room.findUnique({ where: { roomId: parseInt(roomId) } }) : Promise.resolve(null),
            (equipmentId && parseInt(equipmentId) !== existingTicket.equipmentId) 
                ? prisma.equipment.findUnique({ where: { equipmentId: parseInt(equipmentId) } }) : Promise.resolve(null)
        ];

        const [newCategory, newLocation, newFloor, newRoom, newEquipment] = await Promise.all(validationPromises);

        if (newCategory && newCategory.ticketCtgStatus !== 'enable') {
            return res.status(400).json({ success: false, message: "ประเภทปัญหาที่เลือกใหม่ถูกปิดใช้งานไปแล้ว" });
        }
        if (newLocation && newLocation.locationStatus !== 'active') {
            return res.status(400).json({ success: false, message: "สถานที่ที่เลือกใหม่ถูกปิดให้บริการ" });
        }
        if (newFloor && newFloor.floorStatus !== 'active') {
            return res.status(400).json({ success: false, message: "ชั้นที่เลือกใหม่ถูกปิดให้บริการ" });
        }
        if (newRoom && newRoom.roomStatus !== 'active') {
            return res.status(400).json({ success: false, message: "ห้องที่เลือกใหม่ถูกปิดให้บริการ" });
        }
        if (newEquipment && newEquipment.equipmentStatus !== 'active') {
            return res.status(400).json({ success: false, message: "ครุภัณฑ์ที่เลือกใหม่ไม่พร้อมใช้งาน" });
        }

        if (equipmentId) {
            const existingActiveTicket = await prisma.ticket.findFirst({
                where: {
                    equipmentId: parseInt(equipmentId),
                    ticketStatus: {
                        in: ['pending', 'in_progress',]
                    }
                }
            });
            // ถ้าเจอตั๋วที่มีอุปกรณ์เดียวกันและสถานะยังไม่เสร็จสิ้น และไม่ใช่ตั๋วใบเดียวกับที่กำลังแก้ไขอยู่ ให้บล็อกการแก้ไข
            if (existingActiveTicket && existingActiveTicket.ticketId !== id) {
                return res.status(409).json({
                    success: false,
                    message: "ครุภัณฑ์นี้มีการแจ้งปัญหาและกำลังดำเนินการอยู่ โปรดกด 'โหวต' ในหน้าแจ้งปัญหาแทนการแก้ไขข้อมูลใหม่ครับ"
                });
            }
        }

        // Handle image deletion
        let parsedImagesToDelete = [];
        if (imagesToDelete) {
            try {
                parsedImagesToDelete = JSON.parse(imagesToDelete).map(Number);
            } catch (err) {
                return res.status(400).json({ success: false, message: "Invalid imagesToDelete format" });
            }
        }

        const validImagesToDelete = existingTicket.images
            .filter(img => parsedImagesToDelete.includes(img.imageId))
            .map(img => img.imageId);

        // verify that all images to delete belong to the ticket
        const remainingImagesCount = existingTicket.images.length - validImagesToDelete.length;
        const incomingImagesCount = files ? files.length : 0;

        if (remainingImagesCount + incomingImagesCount === 0) {
            return res.status(400).json({
                success: false,
                message: "กรุณาให้มีรูปภาพอย่างน้อย 1 รูป"
            });
        }

        if (remainingImagesCount + incomingImagesCount > 3) {
            return res.status(400).json({
                success: false,
                message: `กรุณาอัปโหลดรูปภาพไม่เกิน 3 รูป (ปัจจุบัน: ${remainingImagesCount}, ใหม่: ${incomingImagesCount})`
            });
        }

        // Upload new images to Cloudinary
        const uploadedImagesData = [];
        if (files && files.length > 0) {
            const uploadPromises = files.map((file) => uploadToCloudinary(file.buffer, 'TTS-img'));
            const cloudinaryResults = await Promise.all(uploadPromises);

            cloudinaryResults.forEach((result) => {
                uploadedImagesData.push({
                    imageUrl: result.secure_url,
                    imageType: "before",
                    imagePublicId: result.public_id,
                });
                // เก็บ Public ID ไว้เผื่อต้อง Rollback
                uploadedImagesForRollback.push(result.public_id);
            });
        }

        // Prepare data for updating ticket
        const dataToUpdate = {
            title: title || existingTicket.title,
            description: description || existingTicket.description,
            ticketStatus: ticketStatus || existingTicket.ticketStatus,// อัปเดตสถานะถ้ามีการส่งมา ถ้าไม่ส่งมาจะคงสถานะเดิมไว้
        };

        // 2. จัดการฟิลด์บังคับ (ใช้วิธี connect เข้ากับ ID เดิมหรือ ID ใหม่)
        if (ticketCtgId) {
            dataToUpdate.category = { connect: { ticketCtgId: parseInt(ticketCtgId) } };
        }
        if (locationId) {
            dataToUpdate.location = { connect: { locationId: parseInt(locationId) } };
        }

        // 3. จัดการฟิลด์ทางเลือก (เคลียร์ค่าว่างด้วย disconnect)
        // ถ้ามีการส่ง id มา ให้ connect แต่ถ้าส่งค่าว่างมา (และของเดิมเคยมีข้อมูล) ให้ disconnect ทิ้ง
        dataToUpdate.floor = floorId
            ? { connect: { floorId: parseInt(floorId) } }
            : (existingTicket.floorId ? { disconnect: true } : undefined);

        dataToUpdate.room = roomId
            ? { connect: { roomId: parseInt(roomId) } }
            : (existingTicket.roomId ? { disconnect: true } : undefined);

        dataToUpdate.equipment = equipmentId
            ? { connect: { equipmentId: parseInt(equipmentId) } }
            : (existingTicket.equipmentId ? { disconnect: true } : undefined);

        // 4. จัดการรูปภาพ (แก้ไขคำว่า image เป็น images ให้ตรงกับ Schema)
        dataToUpdate.images = {
            deleteMany: { imageId: { in: validImagesToDelete } },
            create: uploadedImagesData
        };

        // Update ticket transaction
        const updatedTicket = await prisma.ticket.update({
            where: { ticketId: id },
            data: dataToUpdate,
            include: {
                images: true,
                category: true,
                location: true
            }
        });

        // Delete images from Cloudinary when the database transaction is successful
        if (validImagesToDelete.length > 0) {
            const imagesToRemove = existingTicket.images.filter(img => validImagesToDelete.includes(img.imageId));
            const deletePromises = imagesToRemove.map(img => deleteFromCloudinary(img.imagePublicId));

            // ใช้ Promise.all เพื่อลบพร้อมกัน 
            await Promise.all(deletePromises).catch(err => console.error("Cloudinary Delete Error:", err));
        }

        res.status(200).json({
            success: true,
            message: "Ticket updated successfully",
            data: updatedTicket
        });


    } catch (error) {
        console.error('Error updating ticket:', error);
        // Rollback Cloudinary uploads if needed
        if (uploadedImagesForRollback.length > 0) {
            console.log("Rolling back uploaded images from Cloudinary...");
            const rollbackPromises = uploadedImagesForRollback.map(publicId => deleteFromCloudinary(publicId));
            await Promise.all(rollbackPromises).catch(e => console.error("Rollback failed:", e));
        }

        res.status(500).json({ success: false, message: 'Failed to update ticket', error: error.message });
    }
};

export const upvoteTicket = async (req, res) => {

    try {
        const { id } = req.params;
        const userId = req.user.userId;
        // Middleware checkTicketExists จะเก็บข้อมูลตั๋วไว้ใน req.ticket ให้แล้ว ดังนั้นเราสามารถเข้าถึงได้เลยโดยไม่ต้อง query ซ้ำ
        const existingTicket = req.ticket;

        if (existingTicket.userId === userId) {
            console.log("User attempted to upvote their own ticket:", { userId, ticketId: id });
            return res.status(403).json({
                success: false,
                message: "You cannot upvote your own ticket. Your Issue will be resolved as soon as possible."
            });
        }

        // Check if the user has already upvoted this ticket
        const existingUpvote = await prisma.upvote.findFirst({
            where: {
                ticketId: id,
                userId: userId
            }
        });

        if (existingUpvote) {
            // If the upvote already exists, delete it (cancel the upvote)
            await prisma.upvote.delete({
                where: { upvoteId: existingUpvote.upvoteId }
            });
            return res.status(200).json({
                success: true,
                message: "Cancel upvote successfully.",
                isUpvoted: false
            });
        } else {
            // If the upvote does not exist, create it
            await prisma.upvote.create({
                data: {
                    ticketId: id,
                    userId: userId
                }
            });
            return res.status(200).json({
                success: true,
                message: "Vote successfully!",
                isUpvoted: true
            });
        }
    } catch (error) {
        console.error('Error upvoting ticket:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upvote ticket',
            error: error.message
        });
    }
};

export const cancelTicket = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await prisma.$transaction(async (tx) => {
            
            // ดึงข้อมูลตั๋วเพื่อตรวจสอบสถานะ และดูว่ามีตั๋วลูกห้อยมาด้วยหรือไม่
            const ticketToCancel = await tx.ticket.findUnique({
                where: { ticketId: id },
                select: { 
                    ticketStatus: true, 
                    _count: { select: { subTickets: true } } 
                }
            });

            if (!ticketToCancel) {
                throw new Error("TICKET_NOT_FOUND");
            }

            // ดักความปลอดภัย: อนุญาตให้ยกเลิกได้เฉพาะตอนที่ยังเป็น pending เท่านั้น
            if (ticketToCancel.ticketStatus !== 'pending') {
                throw new Error("CANNOT_CANCEL");
            }

            // เปลี่ยนสถานะตั๋วหลักเป็น 'canceled'
            const canceledTicket = await tx.ticket.update({
                where: { ticketId: id },
                data: { 
                    ticketStatus: "canceled",
                    updatedAt: new Date()
                }
            });

            // Auto-Unmerge: หากตั๋วใบนี้มีลูก ให้ทำการปลดแอกตั๋วลูกทั้งหมด
            if (ticketToCancel._count.subTickets > 0) {
                await tx.ticket.updateMany({
                    where: { 
                        parentTicketId: id,
                        ticketStatus: 'duplicate'
                    },
                    data: {
                        ticketStatus: 'pending', 
                        parentTicketId: null,    
                        updatedAt: new Date()
                    }
                });
            }

            return {
                canceledTicket,
                releasedSubTicketsCount: ticketToCancel._count.subTickets
            };
        });

        res.status(200).json({
            success: true,
            message: result.releasedSubTicketsCount > 0 
                ? `ยกเลิกรายการสำเร็จ และระบบได้แยกตั๋วที่ถูกรวม ${result.releasedSubTicketsCount} รายการกลับสู่กระดาน`
                : "ยกเลิกรายการแจ้งปัญหาสำเร็จ",
            data: result.canceledTicket
        });

    } catch (error) {
        console.error("Error canceling ticket:", error);
        
        if (error.message === "TICKET_NOT_FOUND") {
            return res.status(404).json({ success: false, message: "ไม่พบรายการปัญหา" });
        }
        if (error.message === "CANNOT_CANCEL") {
            return res.status(400).json({ success: false, message: "ไม่สามารถยกเลิกได้เนื่องจากแอดมินกำลังดำเนินการหรือปิดงานไปแล้ว" });
        }

        res.status(500).json({
            success: false,
            message: "เกิดข้อผิดพลาดในการยกเลิกรายการ",
            error: error.message
        });
    }
};

export const submitFeedback = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;
        const userId = req.user.userId;
        // เช็คว่าส่งคะแนนมาถูกต้องไหม (อนุญาต 0.5 - 5 ดาว)
        if (rating === undefined || rating === null || rating < 0.5 || rating > 5) {
            return res.status(400).json({ 
                success: false, 
                message: "กรุณาระบุคะแนนประเมินระหว่าง 0.5 ถึง 5 ดาว" 
            });
        }

        const existingTicket = await prisma.ticket.findUnique({
            where: { ticketId: id }
        });

        // ห้ามประเมินซ้ำ (ถ้า rating ไม่ใช่ null แปลว่าเคยประเมินไปแล้ว)
        if (existingTicket.rating !== null) {
            return res.status(409).json({ 
                success: false, 
                message: "รายการปัญหานี้ได้รับการประเมินไปเรียบร้อยแล้ว" 
            });
        }

        // อัปเดตข้อมูลลง Database
        const updatedTicket = await prisma.ticket.update({
            where: { ticketId: id },
            data: {
                rating: parseFloat(rating),
                comment: comment ? comment.trim() : null, // ถ้าไม่ได้พิมพ์อะไรมาให้เก็บเป็น null
                updatedAt: new Date()
            }
        });

        res.status(200).json({
            success: true,
            message: "บันทึกผลการประเมินสำเร็จ ขอบคุณสำหรับความคิดเห็นครับ",
            data: updatedTicket
        });

    } catch (error) {
        console.error('Error submitting feedback:', error);
        res.status(500).json({ 
            success: false, 
            message: 'ระบบเกิดข้อผิดพลาดในการบันทึกการประเมิน โปรดลองใหม่อีกครั้ง' 
        });
    }
};