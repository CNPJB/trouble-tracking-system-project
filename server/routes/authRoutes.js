import express from 'express';
// import { googleLogin, checkAuth, logout, login, registerTestUser } from '../controllers/authController.js';
import { googleLogin, checkAuth, logout} from '../controllers/authController.js';

import { verifyToken } from '../middleware/authMiddleware.js';

// Create a new router instance
const router = express.Router();


// router.post('/login', login);

router.post('/google', googleLogin);

router.get('/checkme', verifyToken, checkAuth);

router.post('/logout', logout);

// router.post('/register-test', registerTestUser);

export default router;
