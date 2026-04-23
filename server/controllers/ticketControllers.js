import prisma from "../config/prismaClient.js";
import { cloudinary } from '../config/cloudinaryControllers.js';
import { resolve } from "node:dns";
import { rejects } from "node:assert";
import { error } from "node:console";


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
            updatedAt,
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
};

export const getAllTickets = async (req, res) => {
    try {
        const tickets = await prisma.ticket.findMany({
            select: {
                category: {
                    select: {
                        ticketCtgName: true,
                    }
                },
                location: {
                    select: {
                        locationName: true,
                    }
                },
                floor: {
                    select: {
                        floorLevel: true, // แสดงระดับชั้นเสมอ
                    }
                },
                room: {
                    select: {
                        roomName: true, // แสดงชื่อห้องเสมอ                    
                    }
                },
                equipment: {
                    select: {
                        equipmentName: true, // แสดงชื่ออุปกรณ์เสมอ
                    }
                },
                ticketId: true,
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
            }
        });
        res.status(200).json(tickets);
    } catch (error) {
        console.error('Error fetching tickets:', error);
        res.status(500).json({ error: 'Failed to fetch tickets' });
    }
};

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