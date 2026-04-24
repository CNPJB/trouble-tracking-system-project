import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

// ตั้งค่า Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// ตั้งค่า Multer (สร้างตัวแปรไว้ใช้ได้เลย)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // จำกัดขนาดไฟล์ไม่เกิน 5MB
  fileFilter: (req, file, cb) => {
    // ตรวจสอบประเภทไฟล์ (อนุญาตเฉพาะไฟล์รูปภาพ)
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

export { upload, cloudinary };