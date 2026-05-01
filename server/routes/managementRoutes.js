import express from 'express';
import { 
        addTicketCategory, getTicketCategories,
        addLocation, getLocations,
        addFloor, getFloors,
        addRoom, getRooms,
        addEquipmentCtg, getEquipmentCtgs,
        addEquipment, getEquipment 
        } from '../controllers/managementControllers.js';
import { verifyToken, requireAdmin } from '../middleware/authMiddleware.js';


const router = express.Router();

router.post('/addTicketCategory', addTicketCategory);
router.get('/getTicketCategories', getTicketCategories);

router.post('/addLocation', addLocation);
router.get('/getLocations', getLocations);

router.post('/addFloor', addFloor);
router.get('/getFloors', getFloors);

router.post('/addRoom', addRoom);
router.get('/getRooms', getRooms);

router.post('/addEquipmentCtg', addEquipmentCtg);
router.get('/getEquipmentCtgs', getEquipmentCtgs);

router.post('/addEquipment', addEquipment);
router.get('/getEquipment', getEquipment);

export default router;