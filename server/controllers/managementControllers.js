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
export const addLocation  = async (req, res) => {
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

/* Floor Management */
export const addFloor = async (req,res) => {
    try{    
        const {
            floorLevel,
            locationId,
            floorStatus,
        } = req.body;
        
        const floor = await prisma.floor.create({
            data: {
                floorLevel,
                locationId,
                floorStatus,
            }
        });
        res.status(201).json(floor);

    } catch (error) {
        console.error('Error creating floor:', error);
        res.status(500).json({ error: 'Failed to create floor' });
    }
}

export const getFloors = async (req,res) => {
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

/* Room Management */
export const addRoom = async (req,res) => {
    try{    
        const {
            roomName,
            floorId,
            roomStatus,
        } = req.body;
        
        const room = await prisma.room.create({
            data: {
                roomName,
                floorId,
                roomStatus,
            }
        });
        res.status(201).json(room);

    } catch (error) {
        console.error('Error creating room:', error);
        res.status(500).json({ error: 'Failed to create room' });
    }
}

export const getRooms = async (req,res) => {
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

/* Equipment Category Management */
export const addEquipmentCtg =  async (req,res) => {
    try{
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

export const getEquipmentCtgs = async (req,res) => {
    try {
        const equipmentCtgs = await prisma.equipmentCategory.findMany();
        res.status(200).json(equipmentCtgs);
    } catch (error) {
        console.error('Error fetching equipment categories:', error);
        res.status(500).json({ error: 'Failed to fetch equipment categories' });
    }
};

/* Equipment Management */
export const addEquipment =  async (req,res) => {
    try{
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

export const getEquipment = async (req, res) => {
    try {
        const equipment = await prisma.equipment.findMany({
            include: {
                category: true,
                room: true,
            }
        });
        res.status(200).json(equipment);
    } catch (error) {
        console.error('Error fetching equipment:', error);
        res.status(500).json({ error: 'Failed to fetch equipment' });
    }
};
