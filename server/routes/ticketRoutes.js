import express from 'express';
import { addTicket, getAllTickets/*, updateTicketByadmin*/} from '../controllers/ticketControllers.js';
import { verifyToken, requireAdmin } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinaryConfig.js';

const router = express.Router();

router.post('/add' , upload.array('images', 3), addTicket);

router.get('/get', getAllTickets);

//router.patch('/admin/updateticket/:id', upload.array('images', 3), updateTicketByadmin);

export default router;