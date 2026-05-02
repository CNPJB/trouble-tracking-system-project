import express from 'express';
import { addTicket, getAllTickets, updateTicket, upvoteTicket, cancelTicket/*, updateTicketByadmin*/ } from '../controllers/ticketControllers.js';
import { verifyToken, requireAdmin } from '../middleware/authMiddleware.js';
import { checkTicketExists, checkTicketOwner, checkTicketStatus } from '../middleware/ticketMiddleware.js';
import { upload } from '../config/cloudinaryConfig.js';

const router = express.Router();

router.post('/add',
    verifyToken, upload.array('images', 3),
    addTicket
);

router.patch('/updateTicket/:id',
    verifyToken,
    checkTicketExists,
    checkTicketOwner,
    checkTicketStatus('pending'),
    upload.array('images', 3),
    updateTicket
);

router.post('/upvoteTicket/:id',
    verifyToken,
    checkTicketExists,
    checkTicketStatus('pending'),
    upvoteTicket
);

router.patch('/cancelTicket/:id',
    verifyToken,
    checkTicketExists,
    checkTicketOwner,
    checkTicketStatus('pending'),
    cancelTicket
);

router.get('/get', getAllTickets);

//router.patch('/admin/updateticket/:id', upload.array('images', 3), updateTicketByadmin);

export default router;