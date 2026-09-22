import prisma from "../config/prismaClient.js";

/* Ticket Category Management */
export const addTicketCategory = async (req, res) => {
    try {
        const {
            ticketCtgName,
            ticketCtgStatus,
        } = req.body;

        // ป้องกันแอปพังกรณีไม่ได้ส่งชื่อมา
        if (!ticketCtgName || typeof ticketCtgName !== 'string') {
            return res.status(400).json({ error: 'กรุณาระบุชื่อหมวดหมู่ให้ถูกต้อง' });
        }

        const cleanName = ticketCtgName.trim();

        // ค้นหาชื่อหมวดหมู่ในระบบ
        const existingCategory = await prisma.ticketCategory.findFirst({
            where: { ticketCtgName: cleanName }
        });

        if (existingCategory) {
            // ถ้ามีอยู่แล้ว และ is_delete เป็น false (f) แปลว่าใช้งานอยู่
            if (!existingCategory.is_delete) {
                return res.status(400).json({ error: 'หมวดหมู่นี้มีอยู่แล้วในระบบ' });
            }

            // ถ้ามีอยู่แล้วแต่ถูกลบไป (is_delete เป็น t) ให้อัปเดตนำกลับมาใช้
            // *** จุดที่แก้ไข: เปลี่ยนจาก id เป็น ticketCtgId ให้ตรงกับ DB ***
            const restoredCategory = await prisma.ticketCategory.update({
                where: { ticketCtgId: existingCategory.ticketCtgId }, 
                data: {
                    is_delete: false,
                    ticketCtgStatus: ticketCtgStatus || 'enable' // อิงตาม Data เดิมที่คุณใช้ enable
                }
            });
            return res.status(200).json(restoredCategory);
        }

        // กรณีไม่เคยมีชื่อนี้เลย ให้สร้างใหม่
        const ticketCategory = await prisma.ticketCategory.create({
            data: {
                ticketCtgName: cleanName,
                ticketCtgStatus: ticketCtgStatus || 'enable',
            }
        });
        res.status(201).json(ticketCategory);
        
    } catch (error) {
        console.error('Error creating ticket category:', error);
        res.status(500).json({ error: 'Failed to create ticket category' });
    }
};

export const updateTicketCategories = async (req, res) => {
    const { ticketCtgId, ticketCtgName, ticketCtgStatus } = req.body;
    try {
        await prisma.ticketCategory.update({
            where: { ticketCtgId: Number(ticketCtgId) },
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
        const categories = await prisma.ticketCategory.findMany({
            where: { is_delete: false }
        });
        res.status(200).json(categories);
    } catch (error) {
        console.error('Error fetching ticket categories:', error);
        res.status(500).json({ error: 'Failed to fetch ticket categories' });
    }
};

export const deleteTicketCategory = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: 'กรุณาส่ง id เพื่อระบุประเภทปัญหาที่ต้องการลบ' });
        }
        const deletedCategory = await prisma.ticketCategory.update({
            where: {
                ticketCtgId: Number(id),
            },
            data: { is_delete: true }

        });
        res.status(200).json({
            message: 'ลบประเภทปัญหาสำเร็จ',
            deletedCategory
        });
    } catch (error) {
        console.error('Error deleting category:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'ไม่พบประเภทปัญหานี้ในระบบ' });
        }
        res.status(500).json({ error: 'Failed to delete category' });
    }
};


/* Location Management */
export const addLocation = async (req, res) => {
    try {
        const {
            locationName,
            locationStatus,
        } = req.body;

        // ดัก Error ป้องกันแอปพัง
        if (!locationName || typeof locationName !== 'string') {
            return res.status(400).json({ error: 'กรุณาระบุชื่อสถานที่ให้ถูกต้อง' });
        }

        const cleanLocationName = locationName.trim();

        const existingLocation = await prisma.location.findFirst({
            where: { locationName: cleanLocationName }
        });

        if (existingLocation) {
            // ถ้ามีอยู่แล้วและยังใช้งานอยู่
            if (!existingLocation.is_delete) {
                return res.status(400).json({ error: 'สถานที่นี้มีอยู่แล้วในระบบ' });
            }

            // ถ้าระบบเคยลบไปแล้ว ให้นำกลับมาใช้งาน (เช็คชื่อ Primary Key ให้ตรงกับ schema.prisma)
            const restoredLocation = await prisma.location.update({
                where: { locationId: existingLocation.locationId }, // *เปลี่ยนเป็น id ได้ถ้า PK ของคุณชื่อ id
                data: {
                    is_delete: false,
                    locationStatus: locationStatus || 'active' 
                }
            });
            return res.status(200).json(restoredLocation);
        }

        // สร้างใหม่
        const location = await prisma.location.create({
            data: {
                locationName: cleanLocationName,
                locationStatus: locationStatus || 'active',
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
        const locations = await prisma.location.findMany({
            where: { is_delete: false }
        });
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

        const locationIdNum = Number(id);

        // 1. ค้นหา "ชั้น" ทั้งหมดที่อยู่ใน "สถานที่" นี้ก่อน
        // หมายเหตุ: ตรง select: { floorId: true } ถ้า Primary Key ของชั้นชื่อ floor_id ให้แก้เป็น floor_id: true นะครับ
        const floors = await prisma.floor.findMany({
            where: { locationId: locationIdNum },
            select: { floorId: true } 
        });

        // ดึงเฉพาะ ID ของชั้นออกมาเป็น Array เช่น [1, 2, 3]
        const floorIds = floors.map(floor => floor.floorId);

        // 2. ใช้ Transaction เพื่อ Soft Delete ทุกอย่างพร้อมกัน
        const [deletedLocation, deletedFloors, deletedRooms] = await prisma.$transaction([
            // 2.1 Soft delete สถานที่ (Location)
            prisma.location.update({
                where: { locationId: locationIdNum },
                data: { is_delete: true }
            }),

            // 2.2 Soft delete ชั้น (Floor) ทั้งหมดที่อยู่ในสถานที่นี้
            prisma.floor.updateMany({
                where: { locationId: locationIdNum },
                data: { is_delete: true }
            }),

            // 2.3 Soft delete ห้อง (Room) ทั้งหมดที่อยู่ในชั้นเหล่านั้น
            prisma.room.updateMany({
                where: {
                    floorId: {
                        in: floorIds.length > 0 ? floorIds : [-1] // ถ้าไม่มีชั้นเลย ให้ใส่ [-1] กัน Error
                    }
                },
                data: { is_delete: true }
            })
        ]);

        res.status(200).json({
            message: 'ลบสถานที่ รวมถึงชั้นและห้องที่เกี่ยวข้องสำเร็จ',
            deletedLocation,
            summary: {
                floorsDeleted: deletedFloors.count,
                roomsDeleted: deletedRooms.count
            }
        });

    } catch (error) {
        console.error('Error deleting location:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'ไม่พบสถานที่นี้ในระบบ' });
        }
        res.status(500).json({ error: 'Failed to delete location and related data' });
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
        
        if (!floorLevel || typeof floorLevel !== 'string') {
            return res.status(400).json({ error: 'กรุณาระบุชั้นให้ถูกต้อง' });
        }

        const cleanFloorLevel = floorLevel.trim();

        const existingFloor = await prisma.floor.findFirst({
            where: {
                locationId: Number(locationId),
                floorLevel: cleanFloorLevel,
            }
        });

        if (existingFloor) {
            if (!existingFloor.is_delete) {
                return res.status(400).json({ error: `สถานที่นี้มี "ชั้น ${cleanFloorLevel}" อยู่แล้วครับ ไม่สามารถสร้างซ้ำได้` });
            }
            
            // นำชั้นที่ถูกลบไปแล้วกลับมาใช้
            const restoredFloor = await prisma.floor.update({
                where: { floorId: existingFloor.floorId }, // *เปลี่ยนเป็น id ได้ถ้า PK ของคุณชื่อ id
                data: {
                    is_delete: false,
                    floorStatus: floorStatus || 'active'
                }
            });
            return res.status(200).json(restoredFloor);
        }

        const floor = await prisma.floor.create({
            data: {
                floorLevel: cleanFloorLevel,
                locationId: Number(locationId),
                floorStatus: floorStatus || 'active',
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
            where: { is_delete: false },
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

        const floorIdNum = Number(id);

        // ใช้ Transaction เพื่อ Soft Delete ชั้นและห้องที่อยู่ในชั้นนี้พร้อมกัน
        const [deletedFloor, deletedRooms] = await prisma.$transaction([
            // 1. Soft delete ชั้น (Floor)
            prisma.floor.update({
                where: { floorId: floorIdNum },
                data: { is_delete: true }
            }),

            // 2. Soft delete ห้อง (Room) ทั้งหมดที่มี floorId ตรงกับชั้นที่ถูกลบ
            prisma.room.updateMany({
                where: { floorId: floorIdNum },
                data: { is_delete: true }
            })
        ]);

        res.status(200).json({
            message: 'ลบชั้น รวมถึงห้องที่อยู่ในชั้นนี้สำเร็จ',
            deletedFloor,
            summary: {
                roomsDeleted: deletedRooms.count // แจ้งว่ามีกี่ห้องที่ถูกลบไปด้วย
            }
        });

    } catch (error) {
        console.error('Error deleting floor:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'ไม่พบชั้นนี้ในระบบ' });
        }
        res.status(500).json({ error: 'Failed to delete floor and related rooms' });
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

        if (!roomName || typeof roomName !== 'string') {
            return res.status(400).json({ error: 'กรุณาระบุชื่อห้องให้ถูกต้อง' });
        }

        const cleanRoomName = roomName.trim();

        const existingRoom = await prisma.room.findFirst({
            where: {
                floorId: Number(floorId),
                roomName: cleanRoomName,
            }
        });

        if (existingRoom) {
            if (!existingRoom.is_delete) {
                return res.status(400).json({ error: 'ห้องนี้มีอยู่แล้วในระบบ' });
            }

            // นำห้องที่ถูกลบไปแล้วกลับมาใช้
            const restoredRoom = await prisma.room.update({
                where: { roomId: existingRoom.roomId }, // *เปลี่ยนเป็น id ได้ถ้า PK ของคุณชื่อ id
                data: {
                    is_delete: false,
                    roomStatus: roomStatus || 'active'
                }
            });
            return res.status(200).json(restoredRoom);
        }

        const room = await prisma.room.create({
            data: {
                roomName: cleanRoomName,
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
            where: { is_delete: false },
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
        const deletedRoom = await prisma.room.update({
            where: {
                roomId: Number(id),
            },
            data: { is_delete: true }
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

/* Equipment Management */
export const addEquipment = async (req, res) => {
    try {
        const {
            equipmentCode,
            equipmentName,
            equipmentImageUrl,
            equipmentStatus,
            equipmentCtgId,
            roomId,
        } = req.body;

        const equipment = await prisma.equipment.create({
            data: {
                equipmentCode,
                equipmentName,
                equipmentImageUrl,
                equipmentStatus,
                equipmentCtgId,
                roomId,
            }
        });
        res.status(201).json(equipment);

    } catch (error) {
        console.error('Error creating equipment:', error);
        res.status(500).json({ error: 'Failed to create equipment  ' });
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

export const updateRoleUsers = async (req, res) => {
    try {
        const { userId, userRole } = req.body;

        const myUserId = req.user.userId;
        console.log("ID จากหน้าบ้าน:", userId);
        console.log("ข้อมูลใน Token ของฉัน:", req.user);
        if (String(userId) === String(myUserId)) {
            return res.status(400).json({ error: "ไม่อนุญาตให้แก้ไขสิทธิ์ของตัวเอง" });
        }
        const users = await prisma.user.update({
            where: {
                userId: Number(userId)
            }, data: {
                role: userRole
            }
        });
        res.status(200).json(users);
    } catch (error) {
        console.error('Error update users:', error);
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการอัปเดตสิทธิ์ผู้ใช้งาน' });
    }
};

