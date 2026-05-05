import { useState, useRef } from "react";

export const useImageUpload = (maxImages = 3) => {
    const [selectedImages, setSelectedImages] = useState([]);
    const fileInputRef = useRef(null);

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);

        if (selectedImages.length + files.length > maxImages) {
            alert(`อัปโหลดรูปภาพได้สูงสุด ${maxImages} รูปเท่านั้น`);
            return;
        }

        const newImages = files.map(file => ({
            file,
            // สร้าง URL จำลองเพื่อให้โชว์รูปได้ทันที
            previewUrl: URL.createObjectURL(file)
        }));

        setSelectedImages(prev => [...prev, ...newImages]); // เพิ่มรูปใหม่เข้าไปใน Array ของรูปที่เลือกไว้
        // รีเซ็ตค่า input เพื่อให้สามารถเลือกไฟล์เดิมได้อีกครั้งกรณีที่ลบไปแล้วเปลี่ยนใจ
        e.target.value = null;
    };
    const removeImage = (indexToRemove) => {
        setSelectedImages(prev => {
            const newImages = [...prev];
            // คืนหน่วยความจำ
            URL.revokeObjectURL(newImages[indexToRemove].previewUrl);
            newImages.splice(indexToRemove, 1);
            return newImages;
        });


    };
    const clearImages = () => {
        // คืนหน่วยความจำก่อนเคลียร์ Array
        selectedImages.forEach(img => URL.revokeObjectURL(img.previewUrl));
        setSelectedImages([]);
    };

    return {
        selectedImages,
        fileInputRef,
        handleImageChange,
        removeImage,
        clearImages
    };
};