import prisma from "../config/prismaClient.js";

/* Ticket Category Management */
export const addTicketCategory = async (req, res) => {
    try {
        const {
            ticketCtgName,
            ticketCtgStatus,
        } = req.body;

        const ticketCategory = await prisma.ticketCategory.create({
            data: {
                ticketCtgName,
                ticketCtgStatus,
            }
        });
        res.status(201).json(ticketCategory);
    } catch (error) {
        console.error('Error creating ticket category:', error);
        res.status(500).json({ error: 'Failed to create ticket category' });
    }
};

export const updateTicketCategories  = async (req, res) => {
    const { ticketCtgId,ticketCtgName,ticketCtgStatus } = req.body;
    try {
       await prisma.ticketCategory.update({
        where: { ticketCtgId:  Number(ticketCtgId)},
        data: { 
            ticketCtgName: String(ticketCtgName),
            ticketCtgStatus: ticketCtgStatus
        }
       })
       res.status(200).json({ message: 'อัปเดตประเภทปัญหาสำเร็จเรียบร้อย' });
    } catch (error) {
        console.error('Error update ticket categories:', error);
        res.status(500).json({ error: 'Failed to update ticket categories' });
    }
};

export const getTicketCategories = async (req, res) => {
    try {
        const categories = await prisma.ticketCategory.findMany();
        res.status(200).json(categories);
    } catch (error) {
        console.error('Error fetching ticket categories:', error);
        res.status(500).json({ error: 'Failed to fetch ticket categories' });
    }
};

/* Location Management */
export const addLocation = async (req, res) => {
    try {
        const {
            locationName,
            locationStatus,
        } = req.body;

        const location = await prisma.location.create({
            data: {
                locationName,
                locationStatus,
            }
        });
        res.status(201).json(location);
    } catch (error) {
        console.error('Error creating location:', error);
        res.status(500).json({ error: 'Failed to create location' });
    }
};

export const getLocations = async (req, res) => {
    try {
        const locations = await prisma.location.findMany();
        res.status(200).json(locations);
    } catch (error) {
        console.error('Error fetching locations:', error);
        res.status(500).json({ error: 'Failed to fetch locations' });
    }
};

export const deleteLocation = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: 'กรุณาส่ง locationId เพื่อระบุสถานที่ที่ต้องการลบ' });
        }
        const deletedLocation = await prisma.location.delete({
            where: {
                locationId: Number(id), 
            }
        });
        res.status(200).json({ 
            message: 'ลบสถานที่สำเร็จ', 
            deletedLocation 
        });
    } catch (error) {
        console.error('Error deleting location:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'ไม่พบสถานที่นี้ในระบบ' });
        }
        res.status(500).json({ error: 'Failed to delete location' });
    }
};

/* Floor Management */
export const addFloor = async (req, res) => {
    try {
        const {
            floorLevel,
            locationId,
            floorStatus,
        } = req.body;

        const floor = await prisma.floor.create({
            data: {
                floorLevel,
                locationId: Number(locationId),
                floorStatus,
            }
        });
        res.status(201).json(floor);

    } catch (error) {
        console.error('Error creating floor:', error);
        res.status(500).json({ error: 'Failed to create floor' });
    }
}

export const getFloors = async (req, res) => {
    try {
        const floors = await prisma.floor.findMany({
            include: { location: true } // include location details in the response in case it's needed on the frontend
        });
        res.status(200).json(floors);
    } catch (error) {
        console.error('Error fetching floors:', error);
        res.status(500).json({ error: 'Failed to fetch floors' });
    }
};

export const deleteFloor = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: 'กรุณาส่ง floorId เพื่อระบุชั้นที่ต้องการลบ' });
        }
        const deletedFloor = await prisma.floor.delete({
            where: {
                floorId: Number(id), 
            }
        });
        res.status(200).json({ 
            message: 'ลบชั้นสำเร็จ', 
            deletedFloor 
        });
    } catch (error) {
        console.error('Error deleting floor:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'ไม่พบชั้นนี้ในระบบ' });
        }
        res.status(500).json({ error: 'Failed to delete floor' });
    }
};
/* Room Management */
export const addRoom = async (req, res) => {
    try {
        const {
            roomName,
            floorId,
            roomStatus,
        } = req.body;

        const room = await prisma.room.create({
            data: {
                roomName,
                floorId: Number(floorId),
                roomStatus: roomStatus || 'active'
            }
        });
        res.status(201).json(room);

    } catch (error) {
        console.error('Error creating room:', error);
        res.status(500).json({ error: 'Failed to create room' });
    }
}

export const getRooms = async (req, res) => {
    try {
        const rooms = await prisma.room.findMany({
            include: { floor: true }
        });
        res.status(200).json(rooms);
    } catch (error) {
        console.error('Error fetching rooms:', error);
        res.status(500).json({ error: 'Failed to fetch rooms' });
    }
};

export const deleteRoom = async (req, res) => {
    console.log("พารามิเตอร์ที่ส่งมาคือ:", req.params);
    try {
        const { id } = req.params;
        console.log(" roomId ที่ส่งมาคือ:", id);
        if (!id) {
            return res.status(400).json({ error: 'กรุณาส่ง roomId เพื่อระบุห้องที่ต้องการลบ' });
        }
        const deletedRoom = await prisma.room.delete({
            where: {
                roomId: Number(id), 
            }
        });
        res.status(200).json({ 
            message: 'ลบห้องสำเร็จ', 
            deletedRoom 
        });
    } catch (error) {
        console.error('Error deleting room:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'ไม่พบห้องนี้ในระบบ' });
        }
        res.status(500).json({ error: 'Failed to delete room' });
    }
};
// update status  location floor room

export const updateLocationStatus = async (req, res) => {
    const { locationId, status } = req.body;
    try {
        await prisma.location.update({
            where: { locationId: Number(locationId) },
            data: { locationStatus: status }
        });

        await prisma.floor.updateMany({
            where: { locationId: Number(locationId) },
            data: { floorStatus: status } 
        });

        const floorsInLocation = await prisma.floor.findMany({
            where: { locationId: Number(locationId) },
            select: { floorId: true }
        });
        const floorIds = floorsInLocation.map(f => f.floorId);

        if (floorIds.length > 0) {
            await prisma.room.updateMany({
                where: { floorId: { in: floorIds } },
                data: { roomStatus: status }
            });
        }

        res.json({ message: "อัปเดตตึก ชั้น และห้อง เรียบร้อย" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateFloorStatus = async (req, res) => {
    const { floorId, status } = req.body;
    try {
        
        await prisma.floor.update({
            where: { floorId: Number(floorId) },
            data: { floorStatus: status }
        });

        await prisma.room.updateMany({
            where: { floorId: Number(floorId) },
            data: { roomStatus: status } 
        });

        res.json({ message: "อัปเดตชั้นและห้อง เรียบร้อย" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateRoomStatus = async (req, res) => {
    const { roomId, status } = req.body;
    try {
        await prisma.room.update({
            where: { roomId: Number(roomId) },
            data: { roomStatus: status }
        });
        res.json({ message: "อัปเดตห้อง เรียบร้อย" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
/* Equipment Category Management */
export const addEquipmentCtg = async (req, res) => {
    try {
        const {
            equipmentCtgName,
            equipmentCtgStatus,
        } = req.body;

        const equipmentCtg = await prisma.equipmentCategory.create({
            data: {
                equipmentCtgName,
                equipmentCtgStatus,
            }
        });
        res.status(201).json(equipmentCtg);

    } catch (error) {
        console.error('Error creating equipment category:', error);
        res.status(500).json({ error: 'Failed to create equipment category' });
    }
}

export const getEquipmentCtgs = async (req, res) => {
    try {
        const equipmentCtgs = await prisma.equipmentCategory.findMany();
        res.status(200).json(equipmentCtgs);
    } catch (error) {
        console.error('Error fetching equipment categories:', error);
        res.status(500).json({ error: 'Failed to fetch equipment categories' });
    }
};

export const mergeTickets = async (req, res) => {
    try {
        const { parentId, childIds } = req.body;

        if (!parentId || !childIds || !Array.isArray(childIds) || childIds.length === 0) {
            return res.status(400).json({
                error: 'ข้อมูลไม่ครบถ้วน กรุณาส่งตัวแม่และตัวลูกอย่างน้อย 1 รายการ'
            });
        }

        await prisma.ticket.updateMany({
            where: {
                ticketId: { in: childIds }
            },
            data: {
                parentTicketId: parentId,
            }
        });
        console.log(`ดำเนินการรวมปัญหา: แม่ = ${parentId}, ลูกๆ =`, childIds);

        res.status(200).json({
            message: 'รวมปัญหาสำเร็จเรียบร้อยแล้ว',
            mergedCount: childIds.length
        });
    } catch (error) {
        console.error('Error merging tickets:', error);
        res.status(500).json({ error: 'Failed to merge tickets' });
    }
}

export const getUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany();
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};


