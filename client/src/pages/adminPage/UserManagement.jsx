import { useState } from 'react'
import './UserManagement.css'
import './AssetManagement.css'

// hook
import { useUsers } from '../../hooks/useUsers';

const UserManagement = () => {
    const { users } = useUsers();
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
    return (
        <div className="user-management">
            <div className="main-container">
                <div className="table-responsive-wrapper">
                    <table className="layout-table">
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

                <div className="manage-container">
                    <div className="header-container">
                        จัดการผู้ใช้
                    </div>
                    <form action="" className="manage-user-container">
                        <div>
                            <label>Email</label>
                            <input
                                type="text"
                                name='email'
                                value={formData.email}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div>
                            <label>ชื่อ</label>
                            <input
                                type="text"
                                name='fullName'
                                value={formData.fullName}
                                onChange={handleInputChange}
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
                    <div className="btn">
                        <button className="btn-confirm">บันทึก</button>
                        <button className="btn-cancel">ลบ</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UserManagement