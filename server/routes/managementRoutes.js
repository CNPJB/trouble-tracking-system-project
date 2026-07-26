import express from 'express';
import multer from 'multer';
import {
        addTicketCategory, getTicketCategories,updateTicketCategories,
        addLocation, getLocations,deleteLocation,updateLocationStatus,
        addFloor, getFloors,deleteFloor,updateFloorStatus,
        addRoom, getRooms,deleteRoom, updateRoomStatus,
        getUsers,updateRoleUsers,
        addEquipmentCtg, getEquipmentCtgs,
} from '../controllers/managementControllers.js';
import { getEquipment, addEquipment,deleteEquipment, uploadEquipments,updateEquipment,updateMultipleEquipments } from '../controllers/EquipmentControllers.js';
import { getMostCategoriesOfProblems, MostUpvotedTickets, getTicketStats} from '../controllers/statisticController.js';
import { verifyToken, requireAdmin } from '../middleware/authMiddleware.js';

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.post('/addTicketCategory', verifyToken, requireAdmin, addTicketCategory);
router.get('/getTicketCategories', verifyToken, getTicketCategories);
router.put('/updateTicketCategories', verifyToken, requireAdmin, updateTicketCategories);

router.post('/addLocation', verifyToken, requireAdmin, addLocation);
router.get('/getLocations', verifyToken, getLocations);
router.delete('/deleteLocation/:id', verifyToken, requireAdmin, deleteLocation);
router.put('/updateLocationStatus', verifyToken, requireAdmin, updateLocationStatus);

router.post('/addFloor', verifyToken, requireAdmin, addFloor);
router.get('/getFloors', verifyToken, getFloors);
router.delete('/deleteFloor/:id', verifyToken, requireAdmin, deleteFloor);
router.put('/updateFloorStatus', verifyToken, requireAdmin, updateFloorStatus);

router.post('/addRoom', verifyToken, requireAdmin, addRoom);
router.get('/getRooms', verifyToken, getRooms);
router.delete('/deleteRoom/:id', verifyToken, requireAdmin, deleteRoom);
router.put('/updateRoomStatus', verifyToken, requireAdmin, updateRoomStatus);

router.get('/getUsers', verifyToken, requireAdmin, getUsers);
router.patch('/updateRoleUser', verifyToken, requireAdmin, updateRoleUsers);

router.post('/addEquipmentCtg', verifyToken, requireAdmin, addEquipmentCtg);
router.get('/getEquipmentCtgs', verifyToken, getEquipmentCtgs);

router.post('/addEquipment', verifyToken, requireAdmin, addEquipment);
router.get('/getEquipment', verifyToken, getEquipment);
router.get('/getEquipmentByadmin', verifyToken, requireAdmin, getEquipment);
router.delete('/deleteEquipment/:id', verifyToken, requireAdmin, deleteEquipment);      
router.post('/uploadEquipments', verifyToken, requireAdmin, upload.single('file'), uploadEquipments);
router.put('/updateEquipment', verifyToken, requireAdmin,updateEquipment)
router.put('/updateMultipleEquipments', verifyToken, requireAdmin,updateMultipleEquipments)

// router.patch('/mergeTickets', verifyToken, requireAdmin, mergeTickets);

router.get('/getMostCategoriesOfProblems', verifyToken, getMostCategoriesOfProblems);
router.get('/getMostUpvotedTickets', verifyToken, MostUpvotedTickets);
router.get('/getTicket-stats', verifyToken, getTicketStats);



export default router;