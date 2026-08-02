import { cloudinary } from '../config/cloudinaryConfig.js';
import streamifier from 'streamifier';

// ฟังก์ชันสำหรับอัปโหลดไฟล์ไปยัง Cloudinary
export const uploadToCloudinary = (fileBuffer, folderName) => {
    return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: folderName }, 
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

// ฟังก์ชันสำหรับลบไฟล์จาก Cloudinary โดยใช้ publicId
export const deleteFromCloudinary = (publicId) => {
    return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (result) resolve(result);
      else reject(error);
    });
  });
};