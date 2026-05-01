import express from 'express';
import {
    addTicketCategory,
    addLocation,
    addFloor,
    addRoom,
    addEquipmentCtg,
    addEquipment,getEquipment,
    mergeTickets
} from '../controllers/managementControllers.js';
import { verifyToken, requireAdmin } from '../middleware/authMiddleware.js';


const router = express.Router();

router.post('/addTicketCategory', addTicketCategory);

router.post('/addLocation', addLocation);

router.post('/addFloor', addFloor);

router.post('/addRoom', addRoom);

router.post('/addEquipmentCtg', addEquipmentCtg);

router.post('/addEquipment', addEquipment);
router.get('/getEquipment', getEquipment);

router.patch('/mergeTickets', mergeTickets);



export default router;