import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTickets } from '../hooks/useTickets.js';
import axios from 'axios';
import './AddIssue.css';

function AddIssue() {
  //  Contexts and Hooks for Authentication and Tickets
  const { user } = useAuth();
  const { tickets, refetch } = useTickets();
  const navigate = useNavigate();

  // --- 1. State for form data ---
  const [formData, setFormData] = useState({
    categoryId: '',
    title: '',
    locationId: '',
    floorId: '',
    roomId: '',
    equipmentCode: '',
    description: '',
  });

  // --- 2. State for Master Data ---
  const [selectedImages, setSelectedImages] = useState([]);
  const fileInputRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [floors, setFloors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [equipments, setEquipments] = useState([]);
  // State to check equipment status
  const [equipmentValidation, setEquipmentValidation] = useState({ status: null, message: '' });

  // --- 3. Fetch Master Data on Component Mount ---
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [catRes, locRes, floorRes, roomRes, equipRes] = await Promise.all([
          axios.get('/api/manage/getTicketCategories', { withCredentials: true }),
          axios.get('/api/manage/getLocations', { withCredentials: true }),
          axios.get('/api/manage/getFloors', { withCredentials: true }),
          axios.get('/api/manage/getRooms', { withCredentials: true }),
          axios.get('/api/manage/getEquipment', { withCredentials: true }),
        ]);

        setCategories(catRes.data);
        setLocations(locRes.data);
        setFloors(floorRes.data);
        setRooms(roomRes.data);
        setEquipments(equipRes.data);
      } catch (error) {
        console.error('Error fetching master data:', error);
      }
    };
    fetchMasterData();
  }, []);

  //  --- 4. Ticket categories checker ---
  const selectedCategory = categories.find(c => c.ticketCtgId === parseInt(formData.categoryId));
  const isEquipmentCategory = selectedCategory?.ticketCtgName === "ด้านอุปกรณ์คอมพิวเตอร์และครุภัณฑ์"; 

  // --- 5. Logic to handle form input changes ---
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

  // --- 6. Logic to validate equipment code ---
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

  // --- Logic to handle image selection ---
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (selectedImages.length + files.length > 3) {
      alert("อัปโหลดรูปภาพได้สูงสุด 3 รูปเท่านั้นครับ");
      return;
    }

    const newImages = files.map(file => ({
      file,
      previewUrl: URL.createObjectURL(file) // สร้าง URL จำลองเพื่อให้โชว์รูปได้ทันที
    }));

    setSelectedImages(prev => [...prev, ...newImages]);
    e.target.value = null; // รีเซ็ตค่า input เพื่อให้สามารถเลือกไฟล์เดิมได้อีกครั้ง
  };

  const removeImage = (indexToRemove) => {
    setSelectedImages(prev => {
      const newImages = [...prev];

      URL.revokeObjectURL(newImages[indexToRemove].previewUrl);
      newImages.splice(indexToRemove, 1);
      return newImages;
    });
  };

  // --- 7. Logic to filter similar tickets based on form input ---
  const similarTickets = useMemo(() => {
    let filtered = tickets.filter(t => t.ticketStatus === 'pending');

    if (formData.categoryId || formData.locationId || formData.title) {
      filtered = filtered.filter(t => {
        const matchCategory = formData.categoryId ? t.ticketCtgId === parseInt(formData.categoryId) : false;
        const matchLocation = formData.locationId ? t.locationId === parseInt(formData.locationId) : false;
        const matchTitle = formData.title ? t.title.includes(formData.title) : false;
        return matchCategory || matchLocation || matchTitle;
      });
    }

    return filtered.sort((a, b) => (b.upvotes?.length || 0) - (a.upvotes?.length || 0));
  }, [tickets, formData]);

  // --- 8. Logic to handle submission ---
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
      await axios.post(`/api/tickets/upvoteTicket/${ticketId}`, {}, { withCredentials: true });
      refetch();
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
              <label>ประเภทปัญหา <span style={{color: 'red'}}>*</span></label>
              <select name="categoryId" onChange={handleChange} value={formData.categoryId} required>
                <option value="">เลือกประเภทปัญหา</option>
                {categories.map(c => <option key={c.ticketCtgId} value={c.ticketCtgId}>{c.ticketCtgName}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>หัวข้อปัญหา <span style={{color: 'red'}}>*</span></label>
              <input type="text" name="title" onChange={handleChange} value={formData.title} placeholder="ระบุหัวข้อปัญหา" required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>สถานที่ <span style={{color: 'red'}}>*</span></label>
              <select name="locationId" onChange={handleChange} value={formData.locationId} required>
                <option value="">เลือกสถานที่</option>
                {locations.map(l => <option key={l.locationId} value={l.locationId}>{l.locationName}</option>)}
              </select>
            </div>

            {isEquipmentCategory && (
              <div className="form-group highlight-field">
                <label>รหัสครุภัณฑ์ *</label>
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
                {floors.filter(f => f.locationId === parseInt(formData.locationId)).map(f => (
                  <option key={f.floorId} value={f.floorId}>{f.floorLevel || f.floorName}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>ห้อง</label>
              <select name="roomId" onChange={handleChange} value={formData.roomId} disabled={!formData.locationId}>
                <option value="">เลือกห้อง</option>
                {rooms.filter(r => r.floorId === parseInt(formData.floorId) || !formData.floorId).map(r => (
                  <option key={r.roomId} value={r.roomId}>{r.roomName}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>หมายเหตุ</label>
            <textarea name="description" onChange={handleChange} value={formData.description} placeholder="ระบุรายละเอียดเพิ่มเติม" rows="4"></textarea>
          </div>

          {/* ส่วน UI รูปภาพ */}
          <div className="form-group">
            <label>เพิ่มรูปภาพ (ไม่เกิน 3 รูป) <span style={{color: 'red'}}>*</span></label>
            <div className="image-upload-container">

              {/* ซ่อน Input ตัวจริงไว้ แล้วใช้ Ref เรียกแทนเพื่อให้ดีไซน์สวยงาม */}
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                onChange={handleImageChange} 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
              />
              
              {/* ปุ่มกดเพิ่มรูป (+ รูปภาพ) ซ่อนเมื่อครบ 3 รูป */}
              {selectedImages.length < 3 && (
                <button 
                  type="button"
                  className="upload-placeholder" 
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="เพิ่มรูปภาพ"
                >
                  <span>+</span>
                </button>
              )}

              {/* แสดงพรีวิวรูปภาพที่ถูกเลือกมา */}
              {selectedImages.map((img, index) => (
                <div key={index} className="image-preview-box">
                  <img src={img.previewUrl} alt={`preview-${index}`} />
                  <button type="button" className="btn-remove-image" onClick={() => removeImage(index)}>
                    &times;
                  </button>
                </div>
              ))}             

            </div>
          </div>

          <div className="form-actions" style={{ marginTop: '20px' }}>
            <button type="submit" className="btn-submit" disabled={isEquipmentCategory && equipmentValidation.status !== 'success'}>ยืนยัน</button>
            <button type="button" className="btn-reset" onClick={() => {
              setFormData({ categoryId: '', title: '', locationId: '', floorId: '', roomId: '', equipmentCode: '', description: '' });
              setSelectedImages([]); // รีเซ็ตรูปภาพด้วย
            }}>รีเซ็ต</button>
          </div>
        </form>
      </div>

      {/* ฝั่งขวา: รายการปัญหา */}
      <div className="suggestion-section">
        {/* <h3>โปรดตรวจสอบว่าปัญหาที่คุณแจ้งคล้ายคลึงกับผู้อื่นหรือไม่</h3>
        <div className="ticket-list">
          {similarTickets.length > 0 ? similarTickets.map(ticket => (
            <div key={ticket.ticketId} className="ticket-card">
              
              <div className="ticket-info">
                <h4>{ticket.title}</h4>
                  <p>สถานที่: {ticket.location?.locationName || '-'}</p>
                  <p>ชั้น: {ticket.floor?.floorLevel || '-'}</p>
                  <p>ห้อง: {ticket.room?.roomName || '-'}</p>


                  {ticket.equipment?.equipmentCode && <p>
                    รหัสครุภัณฑ์: {ticket.equipment.equipmentCode}</p>}
                <span className="status-badge pending">สถานะ: {ticket.ticketStatus}</span>
              </div>
              <div className="ticket-action">
                <button className="btn-upvote" onClick={() => handleUpvote(ticket.ticketId)} disabled={ticket.userId === user.userId}>
                  UPVOTE ({ticket.upvotes?.length || 0})
                </button>
              </div>
            </div>
          )) : (
            <p className="no-suggestion">ยังไม่มีปัญหาที่ใกล้เคียงในระบบ</p>
          )}
          </div> */}
      </div>
    </div>
  );
}

export default AddIssue;
