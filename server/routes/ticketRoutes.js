import express from 'express';
import { addTicket, getAllTickets ,updateTicketByadmin} from '../controllers/ticketControllers.js';
import { upload } from '../config/cloudinaryControllers.js';

const router = express.Router();

router.post('/add', upload.single('image'), addTicket);
router.get('/get', getAllTickets);
router.patch('/admin/updateticket/:id', upload.single('image'), updateTicketByadmin);

export default router;