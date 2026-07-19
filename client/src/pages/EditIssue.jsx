import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Custom Hooks
import { useTicketDetail } from '../hooks/useTicketDetail.js';
import { useMasterData } from '../hooks/useMasterData.js';
import { useLoadingState } from '../hooks/useLoadingState.js';
import { useImageUpload } from '../hooks/useImageUpload.js';
import { useEquipmentValidation } from '../hooks/useEquipmentValidation.js';

// Components
import ImageUploader from '../components/ImageUploader.jsx';
import { ConfirmButton } from '../components/ConfirmButton.jsx';
import { LoadingSpinner, ToastAlert } from '../components/LoadingSpinner.jsx';

// Services
import { ticketService } from '../services/ticketService.js';

// Styles
import './pageStyles/EditIssue.css';
import { FaTrashAlt, FaSave, FaAngleLeft, FaMapMarkerAlt } from 'react-icons/fa';

function EditIssue() {
    const { user } = useAuth();
    const navigate = useNavigate();

    // ดึง ticketId จาก URL Parameters
    const [searchParams] = useSearchParams();
    const ticketId = searchParams.get('ticketId');

    // เรียกใช้งาน Hooks ข้อมูล
    const { ticket, isLoading: isTicketLoading, error: ticketError } = useTicketDetail(ticketId);
    const { categories, locations, floors, rooms, equipments } = useMasterData();
    const { loading, startLoading, setError, setSuccess, reset } = useLoadingState();

    // State สำหรับเก็บข้อมูลในฟอร์ม
    const [formData, setFormData] = useState({
        categoryId: '',
        title: '',
        locationId: '',
        floorId: '',
        roomId: '',
        equipmentCode: '',
        description: '',
    });

    // State พิเศษสำหรับจัดการรูปภาพเก่า
    const [existingImages, setExistingImages] = useState([]);
    const [imagesToDelete, setImagesToDelete] = useState([]); // เก็บ ID ของรูปเก่าที่จะลบ
    const [confirmSubmit, setConfirmSubmit] = useState({ isOpen: false });
    const { selectedImages, fileInputRef, handleImageChange, removeImage, clearImages } = useImageUpload(3 - existingImages.length, setError);

    // ตรวจสอบสิทธิ์ - เฉพาะเจ้าของ หรือ admin เท่านั้นที่สามารถแก้ไขได้
    useEffect(() => {
        if (ticket && user) {
            const isOwner = ticket.user.userId === user.userId;
            const isAdmin = user.role === 'admin';
            const isPending = ticket.ticketStatus === 'pending';

            if (!isOwner && !isAdmin) {
                navigate(`/ticketDetail?ticketId=${ticketId}`);
            } else if (!isPending && !isAdmin) {
                navigate(`/ticketDetail?ticketId=${ticketId}`);
            }

            setFormData({
                categoryId: ticket.ticketCtgId?.toString() || '',
                title: ticket.title || '',
                locationId: ticket.locationId?.toString() || '',
                floorId: ticket.floorId?.toString() || '',
                roomId: ticket.roomId?.toString() || '',
                equipmentCode: ticket.equipment?.equipmentCode || '',
                description: ticket.description || '',
            });

            // เก็บรูปภาพเดิมที่มีอยู่ไว้ใน State
            if (ticket.images) {
                setExistingImages(ticket.images);
            }
        }
    }, [ticket, user, navigate, ticketId]);

    // ตรวจสอบหมวดหมู่ครุภัณฑ์
    const parsedCategoryId = formData.categoryId ? parseInt(formData.categoryId, 10) : null;
    const selectedCategory = categories.find(c => c.ticketCtgId === parsedCategoryId);
    const isEquipmentCategory = selectedCategory?.ticketCtgName === "ด้านอุปกรณ์คอมพิวเตอร์และครุภัณฑ์"
        || selectedCategory?.ticketCtgName === "ด้านซอฟต์แวร์และระบบปฏิบัติการ";

    const normalizeEquipmentCode = (value) => value?.toString().trim().toUpperCase();

    // เรียกใช้งาน Hook สำหรับตรวจสอบความถูกต้องของรหัสครุภัณฑ์
    const { equipmentValidation } = useEquipmentValidation(
        isEquipmentCategory,
        formData.equipmentCode,
        equipments
    );

    // Logic Auto-fill
    useEffect(() => {
        if (isEquipmentCategory && equipmentValidation.status === 'success' && equipmentValidation.roomId) {
            
            // เช็คว่าผู้ใช้กำลังแก้ไขตั๋วโดยใช้รหัสครุภัณฑ์ "เดิม" ที่บันทึกไว้หรือไม่?
            // ถ้าใช่แปลว่านี่คือจังหวะเปิดหน้าเว็บโหลดข้อมูลครั้งแรก ห้าม! นำที่อยู่เดิมไปทับเด็ดขาด
            const isOriginalEquipment = normalizeEquipmentCode(formData.equipmentCode) === normalizeEquipmentCode(ticket?.equipment?.equipmentCode);
            
            if (isOriginalEquipment) {
                return; // ข้ามการทำงานไปเลย ให้ใช้ locationId, roomId จากตั๋วเดิม
            }

            const eqRoomId = equipmentValidation.roomId;
            const foundRoom = rooms.find(r => r.roomId === eqRoomId);
            
            if (foundRoom) {
                const eqFloorId = foundRoom.floorId;
                const foundFloor = floors.find(f => f.floorId === eqFloorId);
                
                if (foundFloor) {
                    const eqLocationId = foundFloor.locationId;

                    setFormData(prev => {
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
    }, [equipmentValidation.status, equipmentValidation.equipmentId, rooms, floors, isEquipmentCategory, ticket]);

    // ฟังก์ชันจัดการรูปภาพเก่าที่จะลบ (กดกากบาทลบรูปเก่า)
    const handleRemoveExistingImage = (imageId) => {
        setImagesToDelete(prev => [...prev, imageId]); // บันทึก ID ไว้ส่งให้ Backend
        setExistingImages(prev => prev.filter(img => img.imageId !== imageId)); // ลบออกจากหน้าจอชั่วคราว
    };

    // ฟังก์ชันจัดการการเปลี่ยนแปลงในฟอร์ม
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: value };

            // ถ้าเปลี่ยนสถานที่ ให้ล้างชั้นและห้องทิ้ง
            if (name === 'locationId') {
                newData.floorId = '';
                newData.roomId = '';
            }
            // ถ้าเปลี่ยนชั้น ให้ล้างห้องทิ้ง
            if (name === 'floorId') {
                newData.roomId = '';
            }

            return newData;
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        reset();

        const hasEquipmentSelection = Boolean(formData.equipmentCode && formData.equipmentCode.trim());

        if (isEquipmentCategory && hasEquipmentSelection && equipmentValidation.status !== 'success') {
            setError(equipmentValidation.message || "กรุณาเลือกรหัสครุภัณฑ์ที่มีในระบบหรือเลือก 'ไม่ระบุ'", "warning");
            return;
        }

        if (!formData.title.trim()) {
            setError("กรุณากรอกหัวข้อปัญหาให้ครบถ้วนและไม่เป็นช่องว่าง", "warning");
            return;
        }
        setConfirmSubmit({ isOpen: true });
    };

    const handleConfirmSubmit = async () => {
        startLoading(); // แสดงหน้าจอโหลด

        try {
            const submitData = new FormData();

            // แนบข้อมูล Text พื้นฐาน
            submitData.append('title', formData.title);
            submitData.append('description', formData.description);
            submitData.append('ticketCtgId', formData.categoryId);
            submitData.append('locationId', formData.locationId);

            // แนบข้อมูลที่อาจจะมีค่าหรือไม่มีก็ได้ (Optional)
            if (formData.floorId) submitData.append('floorId', formData.floorId);
            if (formData.roomId) submitData.append('roomId', formData.roomId);

            // แนบข้อมูล Equipment ID (ต้องค้นหาจาก equipmentCode ที่ผู้ใช้กรอก)
            if (isEquipmentCategory && formData.equipmentCode) {
                const foundEq = equipments.find(
                    eq => normalizeEquipmentCode(eq.equipmentCode) === normalizeEquipmentCode(formData.equipmentCode)
                );
                if (foundEq) {
                    submitData.append('equipmentId', foundEq.equipmentId);
                }
            }

            // แปลง Array รหัสรูปภาพที่จะลบ เป็น JSON String
            if (imagesToDelete.length > 0) {
                submitData.append('imagesToDelete', JSON.stringify(imagesToDelete));
            }

            // แนบไฟล์รูปภาพ "ใหม่" ที่ผู้ใช้อัปโหลดเพิ่ม
            selectedImages.forEach(img => {
                submitData.append('images', img.file);
            });

            // ส่งข้อมูลไปที่ Service
            const result = await ticketService.updateTicket(ticketId, submitData);

            if (result.success) {
                setSuccess("บันทึกการแก้ไขข้อมูลสำเร็จ");
                setConfirmSubmit({ isOpen: false });

                // เคลียร์รูปภาพใหม่ที่เพิ่งเลือก
                clearImages();

                navigate('/tracking', {
                    state: {
                        showToast: true,
                        message: "แก้ไขข้อมูลปัญหาสำเร็จเรียบร้อยแล้ว"
                    }
                });
            }

        } catch (error) {
            console.error("Error updating ticket:", error);
            const errorMessage = error.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล";
            setError(errorMessage, "error");
            setConfirmSubmit({ isOpen: false });
        }
    };

    // กรองตัวเลือกชั้นและห้องให้สัมพันธ์กัน (Cascading Dropdown)
    const availableFloors = useMemo(() => {
        if (!formData.locationId) return [];
        return floors.filter(f => f.locationId === parseInt(formData.locationId, 10));
    }, [floors, formData.locationId]);

    const availableRooms = useMemo(() => {
        if (!formData.locationId) return [];
        if (formData.floorId) {
            return rooms.filter(r => r.floorId === parseInt(formData.floorId, 10));
        }
        const validFloorIds = availableFloors.map(f => f.floorId);
        return rooms.filter(r => validFloorIds.includes(r.floorId));
    }, [rooms, availableFloors, formData.locationId, formData.floorId]);

    const availableEquipmentOptions = useMemo(() => {
        if (!isEquipmentCategory) return [];

        return (equipments || [])
            .filter(eq => eq.equipmentStatus === 'active')
            .sort((a, b) => (a.equipmentCode || '').localeCompare(b.equipmentCode || ''));
    }, [equipments, isEquipmentCategory]);

    const hasEquipmentInput = Boolean(formData.equipmentCode && formData.equipmentCode.trim());
    const isEquipmentInvalid = isEquipmentCategory && hasEquipmentInput && equipmentValidation.status !== 'success';

    if (isTicketLoading) {
        return <div className="edit-loading-box">กำลังโหลดรายละเอียดข้อมูลปัญหา...</div>;
    }

    // หน้าจอเมื่อเกิดข้อผิดพลาดในการดึงข้อมูลเก่า
    if (ticketError) {
        return (
            <div className="edit-error-box">
                <p>❌ เกิดข้อผิดพลาด: {ticketError}</p>
                <button onClick={() => navigate('/tracking')}>กลับไปหน้าติดตามสถานะ</button>
            </div>
        );
    }

    return (
        <div className="edit-issue-container">
            <LoadingSpinner isLoading={loading.isLoading} message="กำลังบันทึกการแก้ไข..." />
            <ToastAlert error={loading.error} success={loading.success} onDismiss={reset} />

            <div className="edit-header">
                <button className="btn-back" onClick={() => navigate('/tracking')}>
                    <FaAngleLeft /> <FaMapMarkerAlt className="map-marker-icons" />
                </button>
                <h2>แก้ไขรายการแจ้งปัญหา เลขที่ {ticketId}</h2>

            </div>

            <form onSubmit={handleSubmit} className="edit-form-section">

                <div className="half-top-panel">
                    <div className="form-row">
                        <div className="form-group">
                            <label>ประเภทปัญหา <span>*</span></label>
                            <select name="categoryId" onChange={handleChange} value={formData.categoryId} required>
                                <option value="">เลือกประเภทปัญหา</option>
                                {categories.map(c => <option key={c.ticketCtgId} value={c.ticketCtgId}>{c.ticketCtgName}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>หัวข้อปัญหา <span>*</span></label>
                            <input type="text" name="title" onChange={handleChange} value={formData.title} required />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>สถานที่ <span>*</span></label>
                            <select name="locationId" onChange={handleChange} value={formData.locationId} required>
                                <option value="">เลือกสถานที่</option>
                                {locations.map(l => <option key={l.locationId} value={l.locationId}>{l.locationName}</option>)}
                            </select>
                        </div>
                        {isEquipmentCategory && (
                            <div className="form-group">
                                <label>รหัสครุภัณฑ์</label>
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
                                    <small style={{ position: 'absolute', top: '329px', alignSelf: 'center', color: equipmentValidation.status === 'success' ? 'green' : 'red', marginTop: '5px' }}>
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
                                {availableFloors.map(f => <option key={f.floorId} value={f.floorId}>{f.floorLevel || f.floorName}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>ห้อง</label>
                            <select name="roomId" onChange={handleChange} value={formData.roomId} disabled={!formData.locationId}>
                                <option value="">เลือกห้อง</option>
                                {availableRooms.map(r => <option key={r.roomId} value={r.roomId}>{r.roomName}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>หมายเหตุ / รายละเอียดเพิ่มเติม</label>
                        <textarea name="description" onChange={handleChange} value={formData.description} rows="2" style={{ resize: 'none' }}></textarea>
                    </div>
                </div>

                <div className="half-bottom-panel">
                    {existingImages.length > 0 && (
                        <div className="existing-images-compact">
                            <label>รูปภาพเดิมในระบบ</label>
                            <div className="existing-images-row">
                                {existingImages.map((img) => (
                                    <div key={img.imageId} className="compact-image-card">
                                        <img src={img.imageUrl} alt="ภาพเดิม" />
                                        <button type="button" className="btn-compact-delete" onClick={() => handleRemoveExistingImage(img.imageId)}>
                                            <FaTrashAlt />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* โซนรูปใหม่ */}
                    <div className="new-images-compact">
                        <div className="uploader-wrapper">
                            <ImageUploader
                                selectedImages={selectedImages}
                                fileInputRef={fileInputRef}
                                onImageChange={handleImageChange}
                                onRemoveImage={removeImage}
                                maxImages={3 - existingImages.length}
                            />
                        </div>
                    </div>
                </div>
                <div className="form-actions-compact">
                    <button
                        type="submit"
                        className="btn-save-edit"
                        disabled={
                            loading.isLoading || 
                            isEquipmentInvalid ||
                            // ห้ามส่งถ้าไม่มีการเปลี่ยนแปลงข้อมูลเลย
                            (formData.categoryId === (ticket.ticketCtgId?.toString() || '') &&
                            formData.title === (ticket.title || '') &&
                            formData.locationId === (ticket.locationId?.toString() || '') &&
                            formData.floorId === (ticket.floorId?.toString() || '') &&
                            formData.roomId === (ticket.roomId?.toString() || '') &&
                            formData.description === (ticket.description || '') &&
                            formData.equipmentCode === (ticket.equipment?.equipmentCode || '') &&
                            (imagesToDelete.length === 0 && selectedImages.length === 0))
                        }>
                        <FaSave style={{ position: 'relative', top: '3.5px' }} /> บันทึกการเแก้ไข
                    </button>
                </div>
            </form>

            <ConfirmButton
                isOpen={confirmSubmit.isOpen}
                title="ยืนยันการแก้ไขข้อมูล"
                message="คุณต้องการบันทึกการแก้ไขรายการแจ้งปัญหานี้ใช่หรือไม่?"
                onConfirm={handleConfirmSubmit}
                onCancel={() => setConfirmSubmit({ isOpen: false })}
                isLoading={loading.isLoading}
            />
        </div >
    );
}

export default EditIssue;