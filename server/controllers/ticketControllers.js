import prisma from "../config/prismaClient.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinaryUpload.js";
import { generateTicketId } from "../utils/generateID.js";

/*
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
,            description,
        } = req.body;

        let uploadedImageUrl = null;
        let uploadedImageType = null;

        if (req.file) {
            const result = await new Promise((resolve, rejects) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: "TTS-img",
                        resource_type: "auto"
                    },
                    (error, result) => {
                        if (error) rejects(error);
                        else resolve(result);
                    }
                );
                stream.end(req.file.buffer); // ส่ง buffer ของรูปเข้าไป
            });
            uploadedImageUrl = result.secure_url;
            uploadedImageType = req.file.mimetype.split('/')[1];
        }

        const result = await prisma.$transaction(async (tx) => {
            const ticket = await prisma.ticket.create({
                data: {
                    userId: Number(userId),
                    ticketCtgId: Number(ticketCtgId),
                    locationId: Number(locationId),
                    floorId: floorId ? Number(floorId) : null,
                    roomId: roomId ? Number(roomId) : null,
                    equipmentId: equipmentId ? Number(equipmentId) : null,
                    title,
                    description,
                    ticketStatus,
                    parentTicketId: parentTicketId ? Number(parentTicketId) : null,
                    adminId,
                    adminNote,
                    rating: rating ? Number(rating) : null,
                    comment,
                    createdAt,
                    updatedAt,
                }
            });

            if (uploadedImageUrl) {
                await tx.ticketImage.create({
                    data: {
                        ticketId: ticket.ticketId, // เชื่อม Relation
                        imageUrl: uploadedImageUrl,
                        imageType: "before"
                    }
                });
            }
            return ticket;
        });
        res.status(201).json(result);

    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Failed to create ticket' });
    }
}; */

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

        const files = req.files; // รับไฟล์จาก multer
        const customTicketId = await generateTicketId(); // สร้าง ticketId ด้วยฟังก์ชันที่กำหนดเอง

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
                    message: "ครุภัณฑ์นี้มีการแจ้งปัญหาและกำลังดำเนินการอยู่ โปรดกด 'โหวต' (Upvote) ที่รายการเดิมแทนการแจ้งใหม่ครับ"
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
                const customTicketId = generateTicketId(); 
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

/*
export const updateTicketByadmin = async (req,res) =>{
    try {
        const { id } = req.params;
        const {
            ticketStatus, 
            adminNote,
            adminId,
            timestampInprogress        
        } = req.body;

        let afterRepairUrl = null;

        if (req.file) {
            const result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: "TTS-img",
                        resource_type: "auto"
                    },
                    (error, result) => {
                        if (error) rejects(error);
                        else resolve(result);
                    }
                );  
                stream.end(req.file.buffer);
            });
            afterRepairUrl = result.secure_url;
        }
    const updatedTicket = await prisma.$transaction(async (tx) => {
            // อัปเดตสถานะและโน้ต
            const ticket = await tx.ticket.update({
                where: { ticketId: Number(id) },
                data: {
                    ticketStatus,
                    adminNote,
                    adminId: adminId ? Number(adminId) : undefined,
                    updatedAt: new Date(),
                    timestampInprogress ,
                }
            });

            if (afterRepairUrl) {
                await tx.ticketImage.create({
                    data: {
                        ticketId: ticket.ticketId,
                        imageUrl: afterRepairUrl,
                        imageType: "after" 
                    }
                });
            }

            return ticket;
        });

        res.status(200).json({ message: "แอดมินอัปเดตสถานะเรียบร้อย", data: updatedTicket });
    } catch (error) {
        console.error('Admin Update Error:', error);
        res.status(500).json({ error: 'Failed to update by admin' });
    }
};
*/

export const updateTicket = async (req, res) => {
    let uploadedImagesForRollback = [];

    try {
        const { id } = req.params;

        const {
            ticketCtgId, locationId, floorId, roomId, equipmentId,
            title, description,
            imagesToDelete // หน้าบ้านจะส่งเป็น Array String มา เช่น "[12, 15]" (ID ของ TicketImage ที่จะลบ)
        } = req.body;

        const files = req.files;
        const existingTicket = req.ticket;

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

        if (remainingImagesCount + incomingImagesCount > 3) {
            return res.status(400).json({
                success: false,
                message: `Maximum uploadable images are 3 (remaining: ${remainingImagesCount}, incoming: ${incomingImagesCount})`
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

        const canceledTicket = await prisma.ticket.update({
            where: { ticketId: id },
            data: { ticketStatus: "canceled" }
        });

        res.status(200).json({
            success: true,
            message: "Cancel ticket Successfully!",
            data: canceledTicket
        });

    } catch (error) {
        console.error("Error canceling ticket:", error);
        res.status(500).json({
            success: false,
            message: "Cancel ticket fail.",
            error: error.message
        });
    }
};

export const getAllTickets = async (req, res) => {
    try {
        const tickets = await prisma.ticket.findMany({
            select: {
                ticketId: true,
                category: { select: { ticketCtgName: true } },
                location: { select: { locationName: true } },
                floor: { select: { floorLevel: true } },
                room: { select: { roomName: true } },
                equipment: { select: { equipmentName: true } },
                title: true,
                description: true,
                ticketStatus: true,
                parentTicketId: true,
                adminId: true,
                adminNote: true,
                rating: true,
                comment: true,
                createdAt: true,
                updatedAt: true,
                images: {
                    select: {
                        imageUrl: true,
                        imageType: true
                    }
                },
                ticketCtgId: true,
                locationId: true,
                floorId: true,
                roomId: true,
                equipmentId: true,
                upvotes: true
            }
        });
        res.status(200).json(tickets);
    } catch (error) {
        console.error('Error fetching tickets:', error);
        res.status(500).json({ error: 'Failed to fetch tickets' });
    }
};