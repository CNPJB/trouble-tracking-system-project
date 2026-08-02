import express from 'express';
import { googleLogin, checkAuth, logout} from '../controllers/authController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
// For testing local user registration and login (not for production)
import { localRegister, localLogin } from '../controllers/authController.js';

// Create a new router instance
const router = express.Router();

router.post('/google', googleLogin);

router.get('/checkme', verifyToken, checkAuth);

router.post('/logout', logout);

// Register & Login local user (for testing purposes)
if (process.env.NODE_ENV === 'development') {
    console.warn("WARNING: You are running in development mode. The /register-test route is available for testing purposes only. Do NOT use these routes in production!");
    router.post('/register-test', localRegister);
    router.post('/login', localLogin);
} else {
    console.warn("You are running in production mode. The /register-test route is NOT available.");
}

export default router;
