import express from 'express';
import cors from 'cors';
import ticketRoutes from '../routes/ticketRoutes.js';
import managementRoutes from '../routes/managementRoutes.js';
import ticketManagementRoutes from '../routes/ticketManagementRoutes.js';
import cookiesParser from 'cookie-parser';
import authRoutes from '../routes/authRoutes.js';

const app = express();
const port = process.env.PORT || 3000;

app.set('trust proxy', 1);
// Middleware
app.use(cors({
  // origin: process.env.CLIENT_URL, // Allow requests from this origin
  // credentials: true // Allow cookies to be sent with requests
  // ไว้เทสติงบังคับใช้กับ https (ngrok) และอนุญาตให้ข้ามโดเมนได้
  origin: [
    'http://localhost:5173', // ลิงก์หน้าบ้านบนคอม
    'http://192.168.1.53.nip.io:5173',
    'http://shawl-vertical-depravity.ngrok-free.dev', // ลิงก์หน้าบ้าน ngrok
    'http://nonrestricted-casey-hazelly.ngrok-free.dev',
    process.env.CLIENT_URL // รับ URL หน้าบ้านตอนใช้งานจริง
  ].filter(Boolean),
  credentials: true
}));
app.use(express.json());
app.use(cookiesParser()); // Parse cookies

app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/manage', managementRoutes);
app.use('/api/ticketManagement', ticketManagementRoutes);

app.get('/', (req, res) => {
  res.send('Hello from server testest!!');
});


app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});