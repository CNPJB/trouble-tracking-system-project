import { OAuth2Client } from 'google-auth-library';
import prisma from '../config/prismaClient.js';
import jwt from 'jsonwebtoken';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const ALLOWED_DOMAIN = 'mail.rmutk.ac.th';

// Google Login Controller
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

        // 1. ลองค้นหา User ด้วย email ก่อน
        let user = await prisma.user.findUnique({
            where: { email: email }
        });

        if (!user) {
            // 2. กรณีผู้ใช้ใหม่ (ไม่เคย Login) -> สร้างข้อมูลใหม่
            user = await prisma.user.create({
                data: {
                    email: email,
                    googleId: googleId,
                    fullName: fullName,
                    avatarUrl: avatarUrl,
                }
            });
        } else {
            // 3. กรณีผู้ใช้เก่า -> เช็คว่าข้อมูลเปลี่ยนไปจากเดิมหรือไม่
            const isDataChanged = user.fullName !== fullName || user.avatarUrl !== avatarUrl;

            // ถ้าข้อมูลมีการเปลี่ยนแปลง ค่อยสั่ง Update
            if (isDataChanged) {
                user = await prisma.user.update({
                    where: { email: email },
                    data: {
                        fullName: fullName,
                        avatarUrl: avatarUrl,         
                    }
                });
            }
        }

        // cookies session
        const sessionToken = jwt.sign(
            { userId: user.userId, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        if (process.env.NODE_ENV === 'production') {
            res.cookie('token', sessionToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
                maxAge: 24 * 60 * 60 * 1000, // 1 day
            });
        } else {
            res.cookie('token', sessionToken, {
                httpOnly: true,
                sameSite: 'lax',
                maxAge: 24 * 60 * 60 * 1000, // 1 day
            });
        }

        res.status(200).json({ user });
    } catch (error) {
        console.error('Google login error:', error);
        return res.status(401).json({ message: 'Unauthorized' });
    }
};

// CheckAuth Controller
export const checkAuth = async (req, res) => {
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
    res.clearCookie('token', {
        httpOnly: true,
        sameSite: 'lax',
    });
    res.json({ message: 'Logged out successfully' });
};