import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import 'dotenv/config'; // ใช้แบบนี้แทน require('dotenv').config()

// ตั้งค่า Cloudinary
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

// ตั้งค่า Multer (สร้างตัวแปรไว้ใช้ได้เลย)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ส่งออกทั้งสองตัวเพื่อนำไปใช้ในไฟล์อื่น
export { upload, cloudinary };