import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
// Custom Hooks
import { useTickets } from '../hooks/useTickets.js';
import { useImageUpload } from '../hooks/useImageUpload.js';
import { useMasterData } from '../hooks/useMasterData.js';
// Components
import ImageUploader from '../components/ImageUploader.jsx';
import SimilarTickets from '../components/SimilarTickets.jsx';

import axios from 'axios';
import './AddIssue.css';

function AddIssue() {
  //  Contexts and Hooks for Authentication and Tickets
  const { user } = useAuth();
  const { tickets, refetch } = useTickets();
  const navigate = useNavigate();
  // Logic for master data and image upload from custom hooks
  const { selectedImages, fileInputRef, handleImageChange, removeImage, clearImages } = useImageUpload();
  const { categories, locations, floors, rooms, equipments } = useMasterData();

  // --- State for form data ---
  const [formData, setFormData] = useState({
    categoryId: '',
    title: '',
    locationId: '',
    floorId: '',
    roomId: '',
    equipmentCode: '',
    description: '',
  });

  // --- State to check equipment status ---
  const [equipmentValidation, setEquipmentValidation] = useState({ status: null, message: '' });

  // --- Ticket categories checker ---
  const selectedCategory = categories.find(c => c.ticketCtgId === parseInt(formData.categoryId));
  const isEquipmentCategory = selectedCategory?.ticketCtgName === "ด้านอุปกรณ์คอมพิวเตอร์และครุภัณฑ์"
    || selectedCategory?.ticketCtgName === "ด้านซอฟต์แวร์และระบบปฏิบัติการ";

  // --- Logic to handle form input changes ---
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => {
      const newData = { ...prev, [name]: value };

      // Auto-populate floorId when roomId is selected
      if (name === 'roomId' && value) {
        const selectedRoom = rooms.find(r => r.roomId === parseInt(value));
        if (selectedRoom) {
          newData.floorId = selectedRoom.floorId.toString();
        }
      }

      // Reset values when location changes
      if (name === 'locationId') {
        newData.floorId = '';
        newData.roomId = '';
        newData.equipmentCode = '';
      }

      if (name === 'floorId') {
        newData.roomId = '';
        newData.equipmentCode = '';
      }

      return newData;
    });
  };

  // --- Logic to validate equipment code ---
  useEffect(() => {
    if (!isEquipmentCategory || !formData.equipmentCode) {
      setEquipmentValidation({ status: null, message: '' });
      return;
    }
    if (!formData.roomId) {
      setEquipmentValidation({ status: 'error', message: 'กรุณาเลือกห้องก่อนระบุรหัสครุภัณฑ์' });
      return;
    }

    // Find equipment with user input
    const foundEquipment = equipments.find(
      eq => eq.roomId === parseInt(formData.roomId) && eq.equipmentCode === formData.equipmentCode
    );

    if (foundEquipment) {
      setEquipmentValidation({ status: 'success', message: `พบข้อมูล: ${foundEquipment.equipmentName}` });
    } else {
      setEquipmentValidation({ status: 'error', message: 'ไม่พบรหัสครุภัณฑ์นี้ในห้องที่เลือก' });
    }
  }, [formData.equipmentCode, formData.roomId, isEquipmentCategory, equipments]);

  /*
    --- Logic จัดการตัวเลือก (Cascading Dropdown) ---
  */
  //    1. กรอง "ชั้น" ให้เหลือเฉพาะที่อยู่ใน "สถานที่" ที่เลือก
  const availableFloors = useMemo(() => {
    if (!formData.locationId) return [];
    return floors.filter(f => f.locationId === parseInt(formData.locationId, 10));
  }, [floors, formData.locationId]);

  //    2. กรอง "ห้อง" ให้สัมพันธ์กับสถานที่และชั้น
  const availableRooms = useMemo(() => {
    if (!formData.locationId) return []; // ถ้ายังไม่เลือกสถานที่ ไม่ต้องโชว์ห้อง

    if (formData.floorId) {
      // กรณี 2.1: เลือกชั้นแล้ว -> โชว์เฉพาะห้องที่อยู่ในชั้นนั้นเป๊ะๆ
      return rooms.filter(r => r.floorId === parseInt(formData.floorId, 10));
    } else {
      // กรณี 2.2: เลือกสถานที่ แต่ข้ามการเลือกชั้น -> ดึงห้อง "ทั้งหมด" ที่อยู่ในสถานที่นั้นมาโชว์
      const validFloorIds = availableFloors.map(f => f.floorId);
      return rooms.filter(r => validFloorIds.includes(r.floorId));
    }
  }, [rooms, availableFloors, formData.locationId, formData.floorId]);

  // --- Logic to filter similar tickets based on form input ---
  const similarTickets = useMemo(() => {
    let filtered = tickets.filter(t => 
      t.ticketStatus === 'pending' && 
      t.user.userId !== user.userId &&
      t.upvotes?.some(up => up.userId === user.userId) === false // ไม่แสดงตั๋วที่ผู้ใช้เคยโหวตแล้ว
    );

    if (formData.categoryId || formData.locationId || formData.title) {
      filtered = filtered.filter(t => {
        const matchCategory = formData.categoryId ? t.ticketCtgId === parseInt(formData.categoryId) : false;
        const matchLocation = formData.locationId ? t.locationId === parseInt(formData.locationId) : false;
        const matchTitle = formData.title ? t.title.includes(formData.title) : false;
        return matchCategory || matchLocation || matchTitle;
      });
    }

    // เรียงลำดับจากที่มี upvote มากที่สุดไปน้อยที่สุด
    return filtered.sort((a, b) => (b.upvotes?.length || 0) - (a.upvotes?.length || 0));
  }, [tickets, formData]);

  // --- Logic to handle submission ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Equipment code validation before submission
    if (isEquipmentCategory && equipmentValidation.status !== 'success') {
      alert("กรุณาระบุรหัสครุภัณฑ์ให้ถูกต้องตามที่มีในระบบ");
      return;
    }

    // Submit the form data
    try {
      const submitData = new FormData();

      // แมปปิ้งชื่อฟิลด์ให้ตรงกับที่ Backend
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('ticketCtgId', formData.categoryId);
      submitData.append('locationId', formData.locationId);

      if (formData.floorId) submitData.append('floorId', formData.floorId);
      if (formData.roomId) submitData.append('roomId', formData.roomId);

      // ถ้าเป็นหมวดอุปกรณ์และมีรหัสครุภัณฑ์ที่ถูกต้อง ให้ส่ง equipmentId ไปด้วย
      if (isEquipmentCategory && formData.equipmentCode) {
        const foundEq = equipments.find(
          eq => eq.roomId === parseInt(formData.roomId) && eq.equipmentCode === formData.equipmentCode
        );
        if (foundEq) {
          submitData.append('equipmentId', foundEq.equipmentId);
        }
      }

      selectedImages.forEach(img => {
        submitData.append('images', img.file);
      });

      const response = await axios.post('/api/tickets/add', submitData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data' // จำเป็นมากเมื่อมีไฟล์
        }
      });

      if (response.data.success) {
        alert("แจ้งปัญหาสำเร็จเรียบร้อยแล้ว!");
        // 5. นำทางไปหน้า Tracking อัตโนมัติ
        navigate('/tracking');
      }

    } catch (error) {
      console.error("Error submitting ticket:", error);
      alert(error.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  // Handle upvote logic for similar tickets
  const handleUpvote = async (ticketId) => {
    try {
      const response = await axios.post(`/api/tickets/upvoteTicket/${ticketId}`, { 
        withCredentials: true 
      });

      refetch();

      if (response.data.success) {
        alert("ขอบคุณสำหรับการโหวต! ปัญหานี้จะได้รับการแก้ไขโดยเร็วที่สุด");
        navigate('/tracking');
      } 


    } catch (error) {
      console.error("Error upvoting ticket:", error);
    }
  };

  if (!user) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>;
  }

  return (
    <div className="add-issue-container">
      {/* ฝั่งซ้าย: ฟอร์มแจ้งปัญหา */}
      <div className="form-section">
        <h2>กรุณากรอกแบบฟอร์มแจ้งปัญหาของคุณ</h2>
        <form onSubmit={handleSubmit}>

          <div className="form-row">
            <div className="form-group">
              <label>ประเภทปัญหา <span style={{ color: 'red' }}>*</span></label>
              <select name="categoryId" onChange={handleChange} value={formData.categoryId} required>
                <option value="">เลือกประเภทปัญหา</option>
                {categories.map(c => <option key={c.ticketCtgId} value={c.ticketCtgId}>{c.ticketCtgName}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>หัวข้อปัญหา <span style={{ color: 'red' }}>*</span></label>
              <input type="text" name="title" onChange={handleChange} value={formData.title} placeholder="ระบุหัวข้อปัญหา" required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>สถานที่ <span style={{ color: 'red' }}>*</span></label>
              <select name="locationId" onChange={handleChange} value={formData.locationId} required>
                <option value="">เลือกสถานที่</option>
                {locations.map(l => <option key={l.locationId} value={l.locationId}>{l.locationName}</option>)}
              </select>
            </div>

            {isEquipmentCategory && (
              <div className="form-group highlight-field">
                <label>รหัสครุภัณฑ์ <span style={{ color: 'red' }}>*</span></label>
                <input
                  type="text"
                  name="equipmentCode"
                  onChange={handleChange}
                  value={formData.equipmentCode}
                  placeholder="XXXX-XXX-XXXX/XX"
                  required
                  disabled={!formData.roomId} // บังคับเลือกห้องก่อน
                />
                {/* แสดงผลลัพธ์การตรวจสอบ */}
                {equipmentValidation.message && (
                  <small style={{ color: equipmentValidation.status === 'success' ? 'green' : 'red', marginTop: '5px' }}>
                    {equipmentValidation.message}
                  </small>
                )}
              </div>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>ชั้น</label>
              <select name="floorId" onChange={handleChange} value={formData.floorId} disabled={!formData.locationId}>
                <option value="">เลือกชั้น</option>
                {availableFloors.map(f => (
                  <option key={f.floorId} value={f.floorId}>{f.floorLevel || f.floorName}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>ห้อง</label>
              <select
                name="roomId"
                onChange={handleChange}
                value={formData.roomId}
                disabled={!formData.locationId} >
                <option value="">เลือกห้อง</option>
                {availableRooms.map(r => (
                  <option key={r.roomId} value={r.roomId}>{r.roomName}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>หมายเหตุ</label>
            <textarea name="description" onChange={handleChange} value={formData.description} placeholder="ระบุรายละเอียดเพิ่มเติม" rows="4"></textarea>
          </div>

          {/* ส่วน UI Upload รูปภาพ */}
          <ImageUploader
            selectedImages={selectedImages}
            fileInputRef={fileInputRef}
            onImageChange={handleImageChange}
            onRemoveImage={removeImage}
            maxImages={3}
          />

          <div className="form-actions" style={{ marginTop: '20px' }}>
            <button
              type="submit"
              className="btn-submit"
              disabled={isEquipmentCategory && equipmentValidation.status !== 'success'}> {/*|| selectedImages.length === 0 */}
              ยืนยัน
            </button>
            <button type="button" className="btn-reset" onClick={() => {
              setFormData({ categoryId: '', title: '', locationId: '', floorId: '', roomId: '', equipmentCode: '', description: '' });
              clearImages(); // รีเซ็ตรูปภาพด้วย
            }}>รีเซ็ต</button>
          </div>
        </form>
      </div>

      {/* ฝั่งขวา: รายการปัญหา */}
      <SimilarTickets
        tickets={similarTickets}
        onUpvote={handleUpvote}
        currentUserId={user.userId}
      />
    </div>
  );
}

export default AddIssue;
