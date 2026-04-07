import jwt from 'jsonwebtoken';


export const verifyToken = (req, res, next) => {
  // 1. ล้วงหาคุกกี้ที่ชื่อว่า token
  const token = req.cookies.token;

  // 2. ถ้าไม่มีคุกกี้ แปลว่ายังไม่ได้ล็อกอิน เตะกลับไปเลย
  if (!token) {
    return res.status(401).json({ message: "Access Denied: กรุณาเข้าสู่ระบบ" });
  }

  try {
    // 3. ถ้ามีคุกกี้ ให้แกะรหัส (Verify) ดูว่าของแท้ไหมและหมดอายุหรือยัง
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    
    // 4. ***หัวใจสำคัญ***: เอาข้อมูลที่แกะได้ (เช่น id, email) ฝากใส่ตัวแปร req.user ไว้
    req.user = verified; 
    
    // 5. สั่งให้ผ่านด่านไปทำงานฟังก์ชันถัดไปได้!
    next(); 
    
  } catch (err) {
    // ถ้า token ปลอม หรือหมดอายุ
    res.status(401).json({ message: "Token ไม่ถูกต้องหรือหมดอายุ" });
  }
};