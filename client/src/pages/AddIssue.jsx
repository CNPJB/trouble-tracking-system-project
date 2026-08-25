import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
// Custom Hooks
import { useLoadingState } from '../hooks/useLoadingState.js';
import { useTickets } from '../hooks/useTickets.js';
import { useImageUpload } from '../hooks/useImageUpload.js';
import { useMasterData } from '../hooks/useMasterData.js';
import { useSimilarTickets } from '../hooks/useSimilarTickets.js';
import { useEquipmentValidation } from '../hooks/useEquipmentValidation.js';
// Components
import ImageUploader from '../components/ImageUploader.jsx';
import SimilarTickets from '../components/SimilarTickets.jsx';
import { ConfirmButton } from '../components/ConfirmButton.jsx';
import { LoadingSpinner, ToastAlert } from '../components/LoadingSpinner.jsx';
// Services
import { ticketService } from '../services/ticketService.js';
// Styles
import './pageStyles/AddIssue.css';

function AddIssue() {

  //  Contexts and Hooks for Authentication and Tickets
  const { user } = useAuth();
  const { refetch } = useTickets();
  const navigate = useNavigate();

  // --- State and functions for loading and error handling ---
  const { loading, startLoading, setError, setSuccess, reset, clearError } = useLoadingState();

  // --- State for master data and image upload from custom hooks ---
  const { selectedImages, fileInputRef, handleImageChange, removeImage, clearImages, isCompressing } = useImageUpload(3, setError);
  const { categories, locations, floors, rooms, equipments } = useMasterData();

  // --- State for form data ---
  const [formData, setFormData] = useState({
    categoryId: '',
    title: '',
    locationId: '',
    floorId: '',
    roomId: '',
    equipmentCode: '',
    equipmentName: '',
    description: '',
  });

  // --- Ticket categories checker ---
  const parsedCategoryId = formData.categoryId ? parseInt(formData.categoryId, 10) : null;
  const selectedCategory = categories.find(c => c.ticketCtgId === parsedCategoryId);
  const isEquipmentCategory = selectedCategory?.ticketCtgName === "ด้านอุปกรณ์คอมพิวเตอร์และครุภัณฑ์"
    || selectedCategory?.ticketCtgName === "ด้านซอฟต์แวร์และระบบปฏิบัติการ";

  // --- State to confirm modal visibility ---
  const [confirmUpvote, setConfirmUpvote] = useState({
    isOpen: false,
    ticketId: null
  });

  // --- State to confirm form submission ---
  const [confirmSubmit, setConfirmSubmit] = useState({
    isOpen: false,
  });

  // --- State for debouncing input ---
  const [debouncedTitle, setDebouncedTitle] = useState('');

  // --- State for Similar Tickets Modal on Mobile ---
  const [showSimilarModal, setShowSimilarModal] = useState(false);
  const [hasBypassedSimilar, setHasBypassedSimilar] = useState(false);

  // --- Logic to Debounce Title  ---
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedTitle(formData.title);
    }, 500);

    return () => {
      clearTimeout(timerId);
    };
  }, [formData.title]);

  const normalizeEquipmentCode = (value) => value?.toString().trim().toUpperCase();

  // --- State for validating equipment code ---
  const { equipmentValidation } = useEquipmentValidation(
    isEquipmentCategory,
    formData.equipmentCode,
    equipments
  );

  // --- State for Searching similar ticket from add issue form ---
  const { similarTickets, isSearchingSimilar } = useSimilarTickets(
    formData.categoryId,
    formData.locationId,
    formData.roomId,
    equipmentValidation.status === 'success' ? equipmentValidation.equipmentId : null,
    debouncedTitle,
    user?.userId
  );

  // Logic Auto-fill สถานที่
  useEffect(() => {
    // ถ้าหมวดหมู่ถูกต้อง หาครุภัณฑ์เจอ
    if (isEquipmentCategory && equipmentValidation.status === 'success') {

      setFormData(prev => ({
        ...prev,
        equipmentName: equipmentValidation.equipmentName
      }));

      if (equipmentValidation.roomId) {
        const eqRoomId = equipmentValidation.roomId;
        const foundRoom = rooms.find(r => r.roomId === eqRoomId);

        if (foundRoom) {
          const eqFloorId = foundRoom.floorId;
          const foundFloor = floors.find(f => f.floorId === eqFloorId);

          if (foundFloor) {
            const eqLocationId = foundFloor.locationId;

            setFormData(prev => {
              // เช็คก่อนว่าเปลี่ยนจริงไหม เพื่อไม่ให้ State อัปเดตรัวๆ รบกวนผู้ใช้
              if (prev.locationId === eqLocationId.toString() &&
                prev.floorId === eqFloorId.toString() &&
                prev.roomId === eqRoomId.toString()) {
                return prev;
              }

              return {
                ...prev,
                locationId: eqLocationId.toString(),
                floorId: eqFloorId.toString(),
                roomId: eqRoomId.toString()
              };
            });
          }
        }
      }
    }
  }, [equipmentValidation.status, equipmentValidation.equipmentId, equipmentValidation.equipmentName, rooms, floors, isEquipmentCategory]);

  // --- Logic to handle form input changes ---
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => {
      const newData = { ...prev, [name]: value };

      // Auto-populate floorId when roomId is selected
      if (name === 'roomId' && value) {
        const selectedRoom = rooms.find(r => r.roomId === parseInt(value, 10));
        if (selectedRoom) {
          newData.floorId = selectedRoom.floorId.toString();
        }
      }

      // Reset values when location changes
      if (name === 'locationId') {
        newData.floorId = '';
        newData.roomId = '';
      }

      if (name === 'floorId') {
        newData.roomId = '';
      }

      // Reset equipmentName and equipmentCode when category changes
      if (name === 'categoryId') {
        if (!isEquipmentCategory) {
          newData.equipmentName = '';
          newData.equipmentCode = '';
        }
      }

      return newData;
    });
  };

  /* ============================================
    --- Logic จัดการตัวเลือก (Cascading Dropdown) ---
     ============================================ */
  const activeCategories = useMemo(() => {
    return categories.filter(c => c.ticketCtgStatus === 'enable');
  }, [categories]);

  const activeLocations = useMemo(() => {
    return locations.filter(l => l.locationStatus === 'active');
  }, [locations]);

  //    1. กรอง "ชั้น" ให้เหลือเฉพาะที่อยู่ใน "สถานที่" ที่เลือก
  const availableFloors = useMemo(() => {
    if (!formData.locationId) return [];
    return floors.filter(f =>
      f.locationId === parseInt(formData.locationId, 10) &&
      f.floorStatus === 'active'
    );
  }, [floors, formData.locationId]);

  //    2. กรอง "ห้อง" ให้สัมพันธ์กับสถานที่และชั้น
  const availableRooms = useMemo(() => {
    if (!formData.locationId) return []; // ถ้ายังไม่เลือกสถานที่ ไม่ต้องโชว์ห้อง
    const activeRoomsOnly = rooms.filter(r => r.roomStatus === 'active');

    if (formData.floorId) {
      // กรณี 2.1: เลือกชั้นแล้ว -> โชว์เฉพาะห้องที่อยู่ในชั้นนั้นเป๊ะๆ
      return activeRoomsOnly.filter(r => r.floorId === parseInt(formData.floorId, 10));
    } else {
      // กรณี 2.2: เลือกสถานที่ แต่ข้ามการเลือกชั้น -> ดึงห้อง "ทั้งหมด" ที่อยู่ในสถานที่นั้นมาโชว์
      const validFloorIds = availableFloors.map(f => f.floorId);
      return activeRoomsOnly.filter(r => validFloorIds.includes(r.floorId));
    }
  }, [rooms, availableFloors, formData.locationId, formData.floorId]);

  const availableEquipmentOptions = useMemo(() => {
    if (!isEquipmentCategory) return [];

    return (equipments || [])
      .filter(eq => eq.equipmentStatus === 'active')
      .sort((a, b) => (a.equipmentCode || '').localeCompare(b.equipmentCode || ''));
  }, [equipments, isEquipmentCategory]);

  // --- Logic to handle submission trigger ---
  const handleSubmit = (e) => {
    e.preventDefault();

    reset();
    const hasEquipmentSelection = Boolean(formData.equipmentCode && formData.equipmentCode.trim());

    // Equipment code validation before submission
    if (isEquipmentCategory) {
      if (hasEquipmentSelection && equipmentValidation.status !== 'success') {
        setError(equipmentValidation.message || "กรุณาเลือกรหัสครุภัณฑ์ที่มีในระบบ หรือไม่ระบุ", "warning");
        return;
      }
      if (!formData.equipmentName.trim()) {
        setError("กรุณาระบุชื่อครุภัณฑ์ที่พบปัญหา", "warning");
        return;
      }
    }

    if (!formData.title.trim()) {
      setError("กรุณากรอกหัวข้อปัญหาให้ครบถ้วนและไม่เป็นช่องว่าง", "warning");
      return;
    }

    if (selectedImages.length === 0) {
      setError("กรุณาอัปโหลดหรือถ่ายรูปอย่างน้อย 1 รูปก่อนส่งคำร้อง", "warning");
      return;
    }

    // ถ้าย่อจอ (<= 1024px) แล้วเจอปัญหาคล้ายกัน และยังไม่เคยกดข้าม ให้โชว์ Modal ดักไว้ก่อน
    if (window.innerWidth <= 1024 && similarTickets.length > 0 && !hasBypassedSimilar) {
      setShowSimilarModal(true);
      return;
    }

    // Open confirmation modal instead of submitting directly
    setConfirmSubmit({ isOpen: true });
  };

  // --- Logic to confirm and submit form ---
  const handleConfirmSubmit = async () => {
    if (selectedImages.length === 0) {
      setError("กรุณาอัปโหลดหรือถ่ายรูปอย่างน้อย 1 รูปก่อนส่งคำร้อง", "warning");
      setConfirmSubmit({ isOpen: false });
      return;
    }

    startLoading();

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
      if (isEquipmentCategory) {
        submitData.append('equipmentName', formData.equipmentName.trim());

        if (formData.equipmentCode) {
          const foundEq = equipments.find(
            eq => normalizeEquipmentCode(eq.equipmentCode) === normalizeEquipmentCode(formData.equipmentCode)
          );
          if (foundEq) {
            submitData.append('equipmentId', foundEq.equipmentId);
          }
        }
      }

      selectedImages.forEach(img => {
        submitData.append('images', img.file);
      });

      const result = await ticketService.createTicket(submitData);

      if (result.success) {
        clearImages(); // เคลียร์รูปภาพหลังจากส่งสำเร็จ
        await refetch();

        reset();
        setConfirmSubmit({ isOpen: false });

        navigate('/tracking', {
          state: {
            showToast: true,
            message: "แจ้งปัญหาสำเร็จเรียบร้อยแล้ว!",
          }
        });
      }

    } catch (error) {
      const errorMessage = error.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล";
      const severityLevel = error.response?.status === 409 ? 'warning' : 'error';

      setError(errorMessage, severityLevel);
      setConfirmSubmit({ isOpen: false });
    }
  };

  const handleCancelSubmit = () => {
    setConfirmSubmit({ isOpen: false });
    reset();
  };

  // Handle upvote logic for similar tickets
  const handleUpvote = async (ticketId) => {
    setConfirmUpvote({ isOpen: true, ticketId });
  };

  const handleConfirmUpvote = async () => {
    startLoading();
    try {
      const result = await ticketService.upvoteTicket(confirmUpvote.ticketId);

      if (result.success) {
        await refetch();

        reset();
        setConfirmUpvote({ isOpen: false, ticketId: null });

        navigate('/tracking', {
          state: {
            showToast: true,
            message: "โหวตให้ปัญหานี้สำเร็จเรียบร้อยแล้ว!"
          }
        });
      }

    } catch (error) {
      console.error("Error upvoting ticket:", error);
      setError(error.response?.data?.message || "เกิดข้อผิดพลาดในการโหวต");

      setConfirmUpvote({ isOpen: false, ticketId: null });
    }
  };

  const handleCancelUpvote = () => {
    setConfirmUpvote({ isOpen: false, ticketId: null });
    reset();
  }

  const hasEquipmentInput = Boolean(formData.equipmentCode && formData.equipmentCode.trim());
  const isEquipmentInvalid = isEquipmentCategory && hasEquipmentInput && equipmentValidation.status !== 'success';

  if (!user) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>;
  }

  return (
    <div className="add-issue-container">
      {/* แสดงสถานะการโหลด เมื่อกำลังประมวลผล */}
      <LoadingSpinner
        isLoading={loading.isLoading}
        message="กำลังประมวลผล..."
      />
      {/* แสดงข้อผิดพลาดเมื่อมีการโหลดไม่สำเร็จ */}
      <ToastAlert
        error={loading.error}
        success={loading.success}
        onDismiss={reset}
      />
      {/* ฝั่งซ้าย: ฟอร์มแจ้งปัญหา */}
      <div className="form-section">
        <h2>กรุณากรอกแบบฟอร์มแจ้งปัญหาของคุณ</h2>
        <form id='add-issue' onSubmit={handleSubmit}>

          <div className="form-row">
            <div className="form-group">
              <label>ประเภทปัญหา <span style={{ color: 'red' }}>*</span></label>
              <select name="categoryId" onChange={handleChange} value={formData.categoryId} required>
                <option value="">เลือกประเภทปัญหา</option>
                {activeCategories.map(c => <option key={c.ticketCtgId} value={c.ticketCtgId}>{c.ticketCtgName}</option>)}
              </select>
            </div>
            <div className="form-group">
              <div className="label-with-counter">
                <label>หัวข้อปัญหา <span style={{ color: 'red' }}>*</span></label>
                <span className="char-counter">{formData.title.length}/20</span>
              </div>
              <input type="text" name="title" onChange={handleChange} value={formData.title} placeholder="ระบุหัวข้อปัญหา" maxLength={20} required />
            </div>
          </div>

          {isEquipmentCategory && (
            <div className="form-row">
              {/* ชื่อครุภัณฑ์ */}
              <div className="form-group">
                <div className="label-with-counter">
                  <label>ชื่อครุภัณฑ์ <span style={{ color: 'red' }}>*</span></label>
                  <span className="char-counter">{formData.equipmentName.length}/20</span>
                </div>
                <input
                  type="text"
                  name="equipmentName"
                  onChange={handleChange}
                  value={formData.equipmentName}
                  placeholder="เช่น คอมพิวเตอร์, เมาส์, คีย์บอร์ด"
                  maxLength={20}
                  required={isEquipmentCategory}
                  disabled={equipmentValidation.status === 'success'} // ป้องกันแก้ชื่อถ้าใช้รหัสที่ถูกต้อง
                />
              </div>

              {/* รหัสครุภัณฑ์ */}
              <div className="form-group">
                <label>รหัสครุภัณฑ์ <span className='secondary-label'> (ถ้ามี)</span> </label>
                <input
                  type="text"
                  list={`equipment-codes-${formData.roomId || 'none'}`}
                  name="equipmentCode"
                  onChange={handleChange}
                  value={formData.equipmentCode}
                  placeholder="พิมพ์รหัสครุภัณฑ์"
                />
                <datalist id={`equipment-codes-${formData.roomId || 'none'}`}>
                  {availableEquipmentOptions.map(eq => (
                    <option key={eq.equipmentId} value={eq.equipmentCode} />
                  ))}
                </datalist>
                {equipmentValidation.message && (
                  <small style={{ color: equipmentValidation.status === 'success' ? 'green' : 'red', display: 'block', marginTop: '5px' }}>
                    {equipmentValidation.message}
                  </small>
                )}
              </div>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>สถานที่ <span style={{ color: 'red' }}>*</span></label>
              <select name="locationId" onChange={handleChange} value={formData.locationId} required>
                <option value="">เลือกสถานที่</option>
                {activeLocations.map(l => <option key={l.locationId} value={l.locationId}>{l.locationName}</option>)}
              </select>
            </div>
          </div>

          <div className="form-row form-row-responsive">
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
            <div className="label-with-counter">
              <label>หมายเหตุ</label>
              <span className="char-counter">{formData.description.length}/150</span>
            </div>
            <textarea name="description" onChange={handleChange} value={formData.description} placeholder="ระบุรายละเอียดเพิ่มเติม" rows="4" maxLength={150}></textarea>
          </div>

          {/* ส่วน UI Upload รูปภาพ */}
          <div className="form-group">

          </div>
          <ImageUploader
            selectedImages={selectedImages}
            fileInputRef={fileInputRef}
            onImageChange={handleImageChange}
            onRemoveImage={removeImage}
            maxImages={3}
            minImages={1}
            isCompressing={isCompressing}
          />

          <div className="form-actions" style={{ marginTop: '20px' }}>
            <button
              type="button"
              className="btn-reset"
              disabled={loading.isLoading}
              onClick={() => {
                setFormData({ categoryId: '', title: '', locationId: '', floorId: '', roomId: '', equipmentCode: '', description: '' });
                clearImages(); // รีเซ็ตรูปภาพด้วย
              }}
            >
              รีเซ็ต
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={loading.isLoading || isEquipmentInvalid || isCompressing}
            >
              {loading.isLoading ? 'กำลังบันทึก...' : 'ยืนยัน'}
            </button>
          </div>
        </form>
      </div>
      <div className="similar-tickets-wrapper">
        {isSearchingSimilar && <div className="searching-indicator">กำลังค้นหาปัญหาที่คล้ายกัน...</div>}

        {/* ฝั่งขวา: รายการปัญหา */}
        <SimilarTickets
          tickets={similarTickets}
          onUpvote={handleUpvote}
          currentUserId={user?.userId}
        />
      </div>

      {/* Confirm Modal for Form Submission */}
      <ConfirmButton
        isOpen={confirmSubmit.isOpen}
        title="ยืนยันการส่งแจ้งปัญหา"
        message="คุณแน่ใจหรือไม่ว่าต้องการส่งแจ้งปัญหานี้? โปรดตรวจสอบข้อมูลให้ถูกต้องก่อนยืนยัน"
        onConfirm={handleConfirmSubmit}
        onCancel={handleCancelSubmit}
        confirmText={loading.isLoading ? "กำลังบันทึก..." : "ยืนยัน"}
        cancelText={loading.isLoading ? "ปิด" : "ยกเลิก"}
        isLoading={loading.isLoading}
      />

      {/* Confirm Modal for Upvoting */}
      <ConfirmButton
        isOpen={confirmUpvote.isOpen}
        title="ยืนยันการโหวต"
        message="คุณต้องการโหวตให้ปัญหานี้หรือไม่? การโหวตของคุณจะช่วยให้ปัญหาได้รับการแก้ไขเร็วขึ้น"
        onConfirm={handleConfirmUpvote}
        onCancel={handleCancelUpvote}
        confirmText={loading.isLoading ? "กำลังโหวต..." : "โหวต"}
        cancelText={loading.isLoading ? "ปิด" : "ยกเลิก"}
        isLoading={loading.isLoading}
      />

      {/* Similar Tickets Modal for Mobile */}
      {showSimilarModal && (
        <div className="similar-modal-overlay">
          <div className="similar-modal-content">
            <h3 style={{ marginTop: 0, textAlign: 'center', color: '#333' }}>พบปัญหาที่คล้ายกัน</h3>
            <p style={{ textAlign: 'center', fontSize: '14px', color: '#666', marginBottom: '15px' }}>
              กรุณาตรวจสอบปัญหาด้านล่าง หากตรงกับปัญหาของคุณ สามารถกด "โหวต" แทนการแจ้งใหม่ได้
            </p>

            <div className="similar-modal-body">
              <SimilarTickets
                tickets={similarTickets}
                onUpvote={(id) => {
                  setShowSimilarModal(false);
                  handleUpvote(id);
                }}
                currentUserId={user?.userId}
              />
            </div>

            <div className="similar-modal-actions">
              <button
                type="button"
                className="btn-submit"
                style={{ width: '100%', marginTop: '15px', backgroundColor: '#e0e0e0', color: '#555', padding: '12px' }}
                onClick={() => setShowSimilarModal(false)}
              >
                กลับไปแก้ไขข้อมูล
              </button>
              <button
                type="button"
                className="btn-reset"
                style={{ width: '100%', marginTop: '10px', backgroundColor: '#ffdddd', color: '#d32f2f', padding: '12px' }}
                onClick={() => {
                  setShowSimilarModal(false);
                  setHasBypassedSimilar(true);
                  setConfirmSubmit({ isOpen: true }); // ข้ามไปหน้ายืนยัน
                }}
              >
                ข้าม และยืนยันแจ้งปัญหาใหม่
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddIssue;
