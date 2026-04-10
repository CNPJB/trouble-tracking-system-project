import React from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

export const StarRating = ({rating}) => {
    const stars = Array.from({ length: 5 }, (_, index) => {
    
    const starValue = index + 1; // ตำแหน่งดาว (1, 2, 3, 4, 5)

    // ตรรกะการเช็คว่าควรโชว์ดาวแบบไหน
    if (rating >= starValue) {
      // 1. ถ้าคะแนนมากกว่าหรือเท่ากับตำแหน่งดาว = โชว์ดาวเต็ม
      return <FaStar key={index} color="#ffc107" size={15} />;
      
    } else if (rating >= starValue - 0.5) {
      // 2. ถ้าคะแนนมี .5 เช่น ส่งมา 4.5 ตำแหน่งดาวที่ 5 จะเข้าเงื่อนไขนี้ = โชว์ครึ่งดาว
      return <FaStarHalfAlt key={index} color="#ffc107" size={15} />;
      
    } else {
      // 3. นอกนั้น = โชว์ดาวเปล่า (สีเทา)
      return <FaRegStar key={index} color="#e4e5e9" size={15} />;
    }
  });
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
    <span style={{ marginLeft: '1px', color: '#666' }}>{rating}</span>
      {stars}
      {/* (ตัวเลือกเสริม) โชว์ตัวเลขกำกับไว้ข้างหลัง */}
    
    </div>
  )
}
