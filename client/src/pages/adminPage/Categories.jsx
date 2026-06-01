import { useState } from 'react'
import './Categories.css'

// hook
import { useCategories } from '../../hooks/useCategories'

// service
import { IssueCategoryService } from '../../services/IssueCategoryService';

// component
import { PopupAlert } from '../../components/componentsAdmin/popupAlert';

const Categories = () => {
    const { categories, fetchCategories } = useCategories();
    const [selectedId, setSelectedId] = useState(null);

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

    const handleSaveCategory = async (e) => {
        if (e) e.preventDefault();

        if (!formData.ticketCtgName || !formData.ticketCtgStatus) {
            triggerAlert('error', 'กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }

        try {
            if (formData.ticketCtgId) {
                await IssueCategoryService.updateIssueCategoryApi({
                    ticketCtgId: formData.ticketCtgId,
                    ticketCtgName: formData.ticketCtgName,
                    ticketCtgStatus: formData.ticketCtgStatus
                });
                triggerAlert('success', 'อัปเดตประเภทปัญหาสำเร็จ');

            } else {
                await IssueCategoryService.addIssueCategoryApi({
                    ticketCtgName: formData.ticketCtgName,
                    ticketCtgStatus: formData.ticketCtgStatus
                });

                triggerAlert('success', 'เพิ่มประเภทปัญหาใหม่สำเร็จ');
            }
            await fetchCategories();
            setFormData({});

        } catch (error) {
            console.error("บันทึกข้อมูลไม่สำเร็จ:", error);
            triggerAlert('error', 'เพิ่มข้อมูลไม่สำเร็จ');
        }
    };

    const [alert, setAlert] = useState({ isOpen: false, type: '', message: '' });
    const triggerAlert = (type, message) => {
        setAlert({ isOpen: true, type, message });
    };
    return (
        <div className="Categories-management">
            <div className="main-container">
                <div className="table-responsive-wrapper">
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

                <div className="manage-container">
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
                        <button className="btn-confirm" onClick={handleSaveCategory}>
                            บันทึก
                        </button>
                        <button className="btn-cancel" onClick={() => setFormData({})}>ลบ</button>
                    </div>
                    <PopupAlert
                        isOpen={alert.isOpen}
                        type={alert.type}
                        message={alert.message}
                        onClose={() => setAlert({ ...alert, isOpen: false })}
                    />
                </div>
            </div>
        </div>
    )
}

export default Categories