import { useState } from 'react'
import './Categories.css'

// hook
import { useCategories } from '../../hooks/useCategories'
import { useLoadingState } from '../../hooks/useLoadingState';

// service
import { IssueCategoryService } from '../../services/IssueCategoryService';

// component
import { LoadingSpinner, ToastAlert } from '../../components/LoadingSpinner';
import { ConfirmButton } from '../../components/ConfirmButton';

const Categories = () => {
    const { categories, fetchCategories } = useCategories();
    const [selectedId, setSelectedId] = useState(null);
    const { loading, startLoading, setError, setSuccess, reset, clearError } = useLoadingState();
    const [confirmSubmit, setConfirmSubmit] = useState({ "isOpen": false, "message": "" });
    const [confirmDelete, setConfirmDelete] = useState({ "isOpen": false, "id": null });
    const [formData, setFormData] = useState({
        ticketCtgId: '',
        ticketCtgIdName: '',
        ticketCtgIdStatus: ''
    });

    const formatStatus = {
        'enable': 'ใช้งาน',
        'disable': 'ปิดใช้งาน'
    };

    const handleEditClick = (selectedItem) => {
        setFormData({
            ticketCtgId: selectedItem.ticketCtgId || '',
            ticketCtgName: selectedItem.ticketCtgName || '',
            ticketCtgStatus: selectedItem.ticketCtgStatus || '',
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleConfirmSaveCategory = (e) => {
        if (e) e.preventDefault();
        if (!formData.ticketCtgName || !formData.ticketCtgStatus) {
            setError('กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }
        setConfirmSubmit({ isOpen: true, });
    };

    const handleSaveCategory = async () => {
        startLoading();
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            if (formData.ticketCtgId) {
                await IssueCategoryService.updateIssueCategoryApi({
                    ticketCtgId: formData.ticketCtgId,
                    ticketCtgName: formData.ticketCtgName,
                    ticketCtgStatus: formData.ticketCtgStatus
                });
                setSuccess('อัปเดตประเภทปัญหาสำเร็จ');

            } else {
                await IssueCategoryService.addIssueCategoryApi({
                    ticketCtgName: formData.ticketCtgName,
                    ticketCtgStatus: formData.ticketCtgStatus
                });

                setSuccess('เพิ่มประเภทปัญหาใหม่สำเร็จ');
            }
            await fetchCategories();
            setFormData({ ticketCtgId: '', ticketCtgName: '', ticketCtgStatus: '' });
            setSelectedId(null);
            setConfirmSubmit({ isOpen: false, message: '' });
        } catch (error) {
            console.error("บันทึกข้อมูลไม่สำเร็จ:", error);
            setError('เพิ่มข้อมูลไม่สำเร็จ', 'error');
        }
    };
    const handleCOnfirmDeleteCategory = (e) => {
        if (e) e.preventDefault();
        setConfirmDelete({ isOpen: true, id: selectedId });
    };
    const handleDeleteCategory = async () => {
        if (!selectedId) {
            setError('กรุณาเลือกประเภทปัญหาที่ต้องการลบ');
            return;
        }
        try {
            await IssueCategoryService.deleteIssueCategoryApi(selectedId);
            setSuccess('ลบประเภทปัญหาสำเร็จ');
            await fetchCategories();
            setSelectedId(null);
        } catch (error) {
            console.error("ลบข้อมูลไม่สำเร็จ:", error);
            setError('ลบข้อมูลไม่สำเร็จ', 'error');
        }
        setConfirmDelete({ isOpen: false, id: null });
        setFormData({
            ticketCtgId: '',
            ticketCtgName: '',
            ticketCtgStatus: ''
        });
        setSelectedId(null);
    };
    const handleClearField = () => {
        setFormData({
            ticketCtgId: '',
            ticketCtgName: '',
            ticketCtgStatus: ''
        });
        setSelectedId(null);
    };
    return (
        <div className="Categories-management">
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
            <div className="categories-main-container">
                <div className="table-category-responsive-wrapper">
                    <table className="layout-table">
                        <thead>
                            <tr>
                                <th>ประเภทปัญหา</th>
                                <th>สถานะ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((item) => (
                                <tr key={item.ticketCtgId}
                                    className={`data-category-row ${selectedId === item.ticketCtgId ? 'selected' : ''}`}
                                    onClick={() => {
                                        setSelectedId(item.ticketCtgId);
                                        handleEditClick(item)
                                    }}>
                                    <td>{item.ticketCtgName}</td>
                                    <td>{formatStatus[item.ticketCtgStatus] || item.ticketCtgStatus}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="categories-manage-container">
                    <div className="header-container">
                        จัดการประเภทปัญหา
                    </div>
                    <form action="" className="manage-Categories-container">
                        <div>
                            <label>ประเภทปัญหา</label>
                            <input
                                type="text"
                                name='ticketCtgName'
                                value={formData.ticketCtgName || ''}
                                onChange={handleInputChange}
                            />
                            {formData.ticketCtgName && (
                                <button
                                    type="button"
                                    onClick={handleClearField}
                                    style={{
                                        position: 'absolute',
                                        right: '10px',
                                        top: '38px', // ปรับตำแหน่งความสูงตามดีไซน์ของคุณ
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontSize: '16px',
                                        color: '#888',
                                        fontWeight: 'bold'
                                    }}
                                    title="เคลียร์ข้อความ"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                        <select
                            value={formData.ticketCtgStatus || ''}

                            onChange={(e) => setFormData({ ...formData, ticketCtgStatus: e.target.value })}
                            className="form-control"
                        >
                            <option value="" disabled>เลือกสถานะ</option>

                            <option value="enable">ใช้งาน</option>
                            <option value="disable">ปิดใช้งาน</option>
                        </select>
                    </form>
                    <div className="btn">
                        <button className="btn-confirm" onClick={handleConfirmSaveCategory}>
                            บันทึก
                        </button>
                        <button className="btn-cancel" onClick={handleCOnfirmDeleteCategory}>
                            ลบ
                        </button>
                    </div>
                    <ConfirmButton
                        isOpen={confirmSubmit.isOpen}
                        title="ยืนยันการเพิ่มประเภทปัญหา"
                        message="คุณแน่ใจหรือไม่ว่าต้องการเพิ่มประเภทปัญหาใหม่นี้? โปรดตรวจสอบข้อมูลให้ถูกต้องก่อนยืนยัน"
                        onConfirm={handleSaveCategory}
                        onCancel={() => setConfirmSubmit({ isOpen: false, message: '' })}
                        confirmText={loading.isLoading ? "กำลังบันทึก..." : "ยืนยัน"}
                        cancelText={loading.isLoading ? "ปิด" : "ยกเลิก"}
                        isLoading={loading.isLoading}
                    />
                    <ConfirmButton
                        isOpen={confirmDelete.isOpen}
                        title="ยืนยันการลบประเภทปัญหา"
                        message="คุณแน่ใจหรือไม่ว่าต้องการลบประเภทปัญหานี้? โปรดตรวจสอบข้อมูลให้ถูกต้องก่อนยืนยัน"
                        onConfirm={handleDeleteCategory}
                        onCancel={() => setConfirmDelete({ isOpen: false, id: null })}
                        confirmText={loading.isLoading ? "กำลังลบ..." : "ยืนยัน"}
                        cancelText={loading.isLoading ? "ปิด" : "ยกเลิก"}
                        isLoading={loading.isLoading}
                    />
                </div>
            </div>
        </div>
    )
}

export default Categories