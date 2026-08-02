import express from 'express';
import { addTicket, updateTicket, cancelTicket, upvoteTicket, submitFeedback } from '../controllers/ticketControllers.js';
import { getAllTickets, getSimilarTickets, getTicketSummary, getTicketById } from '../controllers/getTicketControllers.js';
import { verifyToken, requireAdmin } from '../middleware/authMiddleware.js';
import { checkTicketExists, checkTicketOwner, checkTicketStatus } from '../middleware/ticketMiddleware.js';
import { upload } from '../config/cloudinaryConfig.js';

const router = express.Router();

router.get('/get', verifyToken, getAllTickets);
router.get('/summary', verifyToken, getTicketSummary)
router.get('/similar', verifyToken, getSimilarTickets)

router.get('/get/:id', 
    verifyToken,
    checkTicketExists,
    getTicketById
);

router.post('/add',
    verifyToken, 
    upload.array('images', 3), 
    addTicket
);

router.patch('/updateTicket/:id',
    verifyToken,
    checkTicketExists, checkTicketOwner, 
    // checkTicketStatus('pending'),
    upload.array('images', 3),
    updateTicket
);

router.post('/upvoteTicket/:id',
    verifyToken,
    checkTicketExists, checkTicketStatus('pending'),
    upvoteTicket
);

router.patch('/cancelTicket/:id',
    verifyToken,
    checkTicketExists, checkTicketOwner, checkTicketStatus('pending'),
    cancelTicket
);

router.post('/submitFeedback/:id',
    verifyToken,
    checkTicketExists, checkTicketOwner, checkTicketStatus('resolved'),
    submitFeedback
);

export default router;