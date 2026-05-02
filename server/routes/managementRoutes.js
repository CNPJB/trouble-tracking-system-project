import express from 'express';
import {
    addTicketCategory,
    addLocation,
    addFloor,
    addRoom,
    addEquipmentCtg,
    addEquipment, getEquipment,
    mergeTickets
} from '../controllers/managementControllers.js';
import { verifyToken, requireAdmin } from '../middleware/authMiddleware.js';


const router = express.Router();

router.post('/addTicketCategory', verifyToken, requireAdmin, addTicketCategory);

router.post('/addLocation', verifyToken, requireAdmin, addLocation);

router.post('/addFloor', verifyToken, requireAdmin, addFloor);

router.post('/addRoom', verifyToken, requireAdmin, addRoom);

router.post('/addEquipmentCtg', verifyToken, requireAdmin, addEquipmentCtg);

router.post('/addEquipment', verifyToken, requireAdmin, addEquipment);
router.get('/getEquipmentByadmin', verifyToken, requireAdmin, getEquipment);

router.patch('/mergeTickets', verifyToken, requireAdmin, mergeTickets);



export default router;