import express from 'express';
import { 
        addTicketCategory, getTicketCategories,
        addLocation, getLocations,
        addFloor, getFloors,
        addRoom, getRooms,
        addEquipmentCtg, getEquipmentCtgs,
        addEquipment, getEquipment,
        mergeTickets
        } from '../controllers/managementControllers.js';
import { verifyToken, requireAdmin } from '../middleware/authMiddleware.js';


const router = express.Router();

router.post('/addTicketCategory', verifyToken, requireAdmin, addTicketCategory);
router.get('/getTicketCategories', verifyToken, getTicketCategories);

router.post('/addLocation', verifyToken, requireAdmin, addLocation);
router.get('/getLocations', verifyToken, getLocations);

router.post('/addFloor', verifyToken, requireAdmin, addFloor);
router.get('/getFloors', verifyToken, getFloors);

router.post('/addRoom', verifyToken, requireAdmin, addRoom);
router.get('/getRooms', verifyToken, getRooms);

router.post('/addEquipmentCtg', verifyToken, requireAdmin, addEquipmentCtg);
router.get('/getEquipmentCtgs', verifyToken, getEquipmentCtgs);

router.post('/addEquipment', verifyToken, requireAdmin, addEquipment);
router.get('/getEquipment', verifyToken, getEquipment);
router.get('/getEquipmentByadmin', verifyToken, requireAdmin, getEquipment);

router.patch('/mergeTickets', verifyToken, requireAdmin, mergeTickets);



export default router;