import express from 'express';
import { addTicket } from '../controllers/ticketControllers.js';

const router = express.Router();

router.post('/addTickets', addTicket);

export default router;