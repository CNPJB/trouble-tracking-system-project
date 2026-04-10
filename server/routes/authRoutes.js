import express from 'express';
import { googleLogin, checkAuth, logout} from '../controllers/authController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

// Create a new router instance
const router = express.Router();

router.post('/google', googleLogin);

router.get('/checkme', verifyToken, checkAuth);

router.post('/logout', logout);

export default router;
