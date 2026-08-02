import express from 'express';

// Controllers
import { getTicketGroups, mergeTickets, unmergeTickets, getUrgentTickets, updateTicketStatusAdmin } from '../controllers/ticketManagementControllers.js';

// Middleware
import { verifyToken, requireAdmin } from '../middleware/authMiddleware.js';
import { checkTicketExists, checkTicketOwner, checkTicketStatus } from '../middleware/ticketMiddleware.js';

import { upload } from '../config/cloudinaryConfig.js';

const router = express.Router();

router.get('/ticketGroups',
    verifyToken,
    requireAdmin,
    getTicketGroups
);

router.patch('/mergeTickets', 
    verifyToken, 
    requireAdmin,   
    mergeTickets
);

router.patch('/unmergeTickets',
    verifyToken,
    requireAdmin,
    unmergeTickets
);

router.get('/urgentTickets',
    verifyToken,
    requireAdmin,
    getUrgentTickets
);

router.patch('/updateTicketStatusAdmin/:id',
    verifyToken,
    checkTicketExists,
    requireAdmin,
    upload.array('images', 3),
    updateTicketStatusAdmin
);

export default router;