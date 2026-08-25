import { useState } from 'react'
import './UserManagement.css'
import './AssetManagement.css'

// component
import { LoadingSpinner, ToastAlert } from '../../components/LoadingSpinner';
import { ConfirmButton } from '../../components/ConfirmButton';
// hook
import { useUsers } from '../../hooks/useUsers';
import { useLoadingState } from '../../hooks/useLoadingState'

const UserManagement = () => {
    const { users, updateRoleUser, fetchUsers } = useUsers();
    const { loading, startLoading, setError, setSuccess, reset, clearError } = useLoadingState();
    const [confirmSubmit, setConfirmSubmit] = useState({ "isOpen": false, "message": "" })
    const [selectedId, setSelectedId] = useState(null);

    const [formData, setFormData] = useState({
        email: '',
        fullName: '',
        userRole: ''
    });

    const formatRole = {
        'admin': 'ผู้ดูแลระบบ',
        'user': 'ผู้ใช้ทั่วไป'
    }

    const handleEditClick = (selectedItem) => {
        setFormData({
            email: selectedItem.email || '',
            fullName: selectedItem.fullName || '',
            userRole: selectedItem.role || ''
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleConfirmUpdateRole = () => {

        if (!formData.userRole) {
            setError('กรุณาเลือกข้อมูลที่ต้องการจะอัพเดท')
            return;
        }
        setConfirmSubmit({ isOpen: true, })
    }

    const handleUpdateRole = async () => {
        startLoading()
        try {
            const payload = ({
                userId: selectedId,
                userRole: formData.userRole
            })
            await updateRoleUser(payload);
            setSuccess('อัปเดทRoleสำเร็จ')
            await fetchUsers();
            setFormData({ userRole: "", fullName: "", email: "" });
            setConfirmSubmit({ isOpen: false, message: '' });
        } catch (error) {
            console.error("บันทึกข้อมูลไม่สำเร็จ:", error);
            const errorMessage = error.response?.data?.error || 'อัปเดตข้อมูลไม่สำเร็จ';
            setError(errorMessage, 'error');
            setConfirmSubmit({ isOpen: false, message: '' });
            setFormData({ userRole: "", fullName: "", email: "" });
        }
    }
    return (
        <div className="user-management">
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
            <div className="main-user-container">
                <div className="table-user-responsive-wrapper">
                    <table className="user-layout-table">
                        <thead>
                            <tr>
                                <th>Email</th>
                                <th>ชื่อ</th>
                                <th>Role</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((item) => (
                                <tr key={item.userId}
                                    className={`data-user-row ${selectedId === item.userId ? 'selected' : ''}`}
                                    onClick={() => {
                                        setSelectedId(item.userId);
                                        handleEditClick(item)
                                    }}>
                                    <td>{item.email}</td>
                                    <td>{item.fullName}</td>
                                    <td>{formatRole[item.role] || item.role}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="manage-user-container">
                    <div className="header-user-container">
                        จัดการผู้ใช้
                    </div>
                    <form action="" className="form-user-container">
                        <div>
                            <label>Email</label>
                            <input
                                type="text"
                                name='email'
                                value={formData.email}
                                onChange={handleInputChange}
                                disabled
                            />
                        </div>
                        <div>
                            <label>ชื่อ</label>
                            <input
                                type="text"
                                name='fullName'
                                value={formData.fullName}
                                onChange={handleInputChange}
                                disabled
                            />
                        </div>
                        <select
                            value={formData.userRole || ""}

                            onChange={(e) => setFormData({ ...formData, userRole: e.target.value })}
                        >
                            <option value="" disabled>บทบาท</option>

                            <option value="admin">ผู้ดูแลระบบ</option>
                            <option value="user">ผู้ใช้ทั่วไป</option>
                        </select>
                    </form>
                    <div className="btn-user">
                        <button className="btn-confirm" onClick={handleConfirmUpdateRole}>บันทึก</button>
                        {/* <button className="btn-cancel">ลบ</button> */}
                    </div>
                    <ConfirmButton
                        isOpen={confirmSubmit.isOpen}
                        title="ยืนยันการอัปเดทRole?"
                        message="คุณแน่ใจหรือไม่ว่าต้องการการอัปเดทRole?"
                        onConfirm={handleUpdateRole}
                        onCancel={() => setConfirmSubmit({ isOpen: false, message: '' })}
                        confirmText={loading.isLoading ? "กำลังบันทึก..." : "ยืนยัน"}
                        cancelText={loading.isLoading ? "ปิด" : "ยกเลิก"}
                        isLoading={loading.isLoading}
                    />
                </div>
            </div>
        </div>
    )
}

export default UserManagement