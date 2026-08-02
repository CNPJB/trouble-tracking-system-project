import { useState, useRef } from "react";
import imageCompression from 'browser-image-compression';

export const useImageUpload = (maxImages = 3, setError = null) => {
    const [selectedImages, setSelectedImages] = useState([]);
    const [isCompressing, setIsCompressing] = useState(false);
    const fileInputRef = useRef(null);

    // useEffect(() => {
    //     return () => {
    //         // เมื่อปิดหน้าเว็บ ให้ทำลาย URL ทิ้งทั้งหมด
    //         selectedImages.forEach(img => URL.revokeObjectURL(img.previewUrl));
    //     };
    // }, [selectedImages]);

    const handleImageChange = async (e) => {
        const files = Array.from(e.target.files);

        if (selectedImages.length + files.length > maxImages) {
            if (setError) {
                setError(`อัปโหลดรูปภาพได้สูงสุด ${maxImages} รูปเท่านั้น`, 'error');
            }
            e.target.value = null;
            return;
        }

        // เริ่มโหลด
        setIsCompressing(true);

        try {
            // ตั้งค่าการบีบอัด (Best Practice สำหรับเว็บทั่วไป)
            const options = {
                maxSizeMB: 0.2,           // บีบให้เหลือไฟล์ละไม่เกิน 200KB (เพียงพอมากสำหรับดูบนเว็บ)
                maxWidthOrHeight: 960,   // ลดขนาดความกว้าง/ยาวสูงสุดไม่เกิน HD
                useWebWorker: true,       // ใช้ Web Worker เพื่อไม่ให้ UI หน้าเว็บค้างระหว่างคำนวณ
                // fileType: 'image/webp' // (Option) แปลงไฟล์เป็น WebP
            };

            // ใช้ Promise.all เพื่อบีบอัดหลายๆ รูปพร้อมกัน (Parallel)
            const compressedFilesPromises = files.map(async (file) => {
                // โยนไฟล์ดิบเข้าฟังก์ชันบีบอัด
                const compressedBlob = await imageCompression(file, options);

                // browser-image-compression คืนค่ามาเป็น Blob เราควรแปลงกลับเป็น File object เพื่อให้เข้ากันได้กับลอจิก FormData เดิม
                const compressedFile = new File([compressedBlob], file.name, {
                    type: compressedBlob.type,
                    lastModified: Date.now(),
                });

                return {
                    file: compressedFile, // ใช้ไฟล์ที่ถูกบีบอัดแล้ว
                    previewUrl: URL.createObjectURL(compressedFile) // สร้าง URL สำหรับ Preview
                };
            });

            const newImages = await Promise.all(compressedFilesPromises);

            setSelectedImages(prev => [...prev, ...newImages]);

        } catch (error) {
            console.error("Error compressing images:", error);
            if (setError) setError("เกิดข้อผิดพลาดในการประมวลผลรูปภาพ กรุณาลองใหม่อีกครั้ง", "error");
        } finally {
            // ปิดโหลด และรีเซ็ต input
            setIsCompressing(false);
            e.target.value = null;
        }
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
        clearImages,
        isCompressing
    };
};