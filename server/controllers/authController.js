import { OAuth2Client } from 'google-auth-library';
import { verifyToken } from '../middleware/authMiddleware.js';
import prisma from '../config/prismaClient.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';


const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const ALLOWED_DOMAIN = 'mail.rmutk.ac.th';

export const googleLogin = async (req, res) => {
    const { token } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { email, name: fullName, sub: googleId, picture: avatarUrl, hd } = payload;

        if (hd !== ALLOWED_DOMAIN && !email.endsWith(`@${ALLOWED_DOMAIN}`)) {
            return res.status(403).json({ 
                message: 'Access denied: Unauthorized domain' 
            });
        }

        // Check if user already exists in the daabase
        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    email,
                    googleId,
                    fullName,
                    avatarUrl
                }
            });
        }

        // cookies session
        const sessionToken = jwt.sign(
            { userId: user.userId, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );
        res.cookie('token', sessionToken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000, // 1 day
            sameSite: 'lax',
        });

        res.status(201).json({ user });
    } catch (error) {
        console.error('Google login error:', error);
        return res.status(401).json({ message: 'Unauthorized' });
    }
};

// CheckAuth Middleware
export const checkAuth = async (req, res, next) => {
    try {
        const userId = req.user.userId;

        const user = await prisma.user.findUnique({ where: { userId } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
       res.json({ user });
    } catch (error) {
        console.error('CheckAuth error:', error);
        return res.status(401).json({ message: 'Unauthorized' });
    }
};

// Logout
export const logout = (req, res) => {
    res.clearCookie('token',{
        httpOnly: true,
        sameSite: 'lax',
    });
    res.json({ message: 'Logged out successfully' });
};