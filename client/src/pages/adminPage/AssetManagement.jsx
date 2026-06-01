import React, { useState } from 'react'
import './AssetManagement.css'
// component
import { SearchBar } from '../../components/SearchBar';
import { ImportEquipments } from '../../components/componentsAdmin/ImportEquipments';
import { ConfirmButton } from '../../components/ConfirmButton';
// hook
import { useEquipment } from '../../hooks/useEquipment'
import { useLocations } from '../../hooks/useLocations';
// service


const AssetManagement = () => {
  const { locations, floors, rooms } = useLocations();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [isUpdateConfirmOpen, setIsUpdateConfirmOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const { equipment, deleteEquipment, refetch } = useEquipment();
  const formatStatus = {
    'active': 'ใช้งาน',
    'awaitingSale': 'รอขาย',
    'sentForRepair': 'รอส่งซ่อม',
    'Broken': 'ชำรุด'
  };

  const [formData, setFormData] = useState({
    equipmentName: '',
    equipmentCode: '',
    equipmentStatus: '',
    locationId: '',
    floorId: '',
    roomId: ''
  })

  const handleEditClick = (selectedItem) => {
    setFormData({
      equipmentName: selectedItem.equipmentName,
      equipmentCode: selectedItem.equipmentCode,
      equipmentStatus: selectedItem.equipmentStatus,
      roomId: selectedItem.room.roomId,
      floorId: selectedItem.room?.floor?.floorId || '',
      locationId: selectedItem.room?.floor?.location?.locationId || ''
    })
    setSelectedId(selectedItem.equipmentId);
    console.log(selectedItem)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "locationId") {
      // เปลี่ยนตึก -> ล้างค่าชั้นและห้อง
      setFormData({ ...formData, locationId: value, floorId: '', roomId: '' });
    } else if (name === "floorId") {
      // เปลี่ยนชั้น -> ล้างค่าห้อง
      setFormData({ ...formData, floorId: value, roomId: '' });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleUpdate = async () => {

    if (!selectedId) {
      setIsUpdateConfirmOpen(false);
      alert("กรุณาเลือกครุภัณฑ์ที่ต้องการอัปเดต");
      return;
    }
    if (isSubmitting) return;
    setIsSubmitting(true);
    setIsUpdateConfirmOpen(false);
  }
  const handleDelete = async () => {

    if (!selectedId) {
      setIsDeleteConfirmOpen(false);
      alert("กรุณาเลือกครุภัณฑ์ที่ต้องการลบ");
      return;
    }
    if (isSubmitting) return;

    setIsDeleteConfirmOpen(false);
    setIsSubmitting(true);

    try {
      await deleteEquipment(selectedId);
      setSelectedId(null);
    } finally {
      setIsSubmitting(false);
    }
  }
  return (
    <div className="assetManagement-container">
      <div className="filter-assetManagement-container">
        <div className="audit-issues-searchbar">
          <SearchBar />
        </div>
        <button>ประเภท</button>
        <button>สถานที่</button>
      </div>
      <div className="main-container">
        <div className="table-responsive-wrapper">
          <table className="layout-table">
            <thead>
              <tr>
                <th>ชื่อครุภัณฑ์</th>
                <th>รหัสครุภัณฑ์</th>
                <th>สถานะ</th>
                <th>ห้อง</th>
              </tr>
            </thead>
            <tbody>
              {equipment.map((item) => (
                <tr key={item.equipmentId}
                  className={`data-layout-row ${selectedId === item.equipmentId ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedId(item.equipmentId);
                    handleEditClick(item)
                  }}>
                  <td>{item.equipmentName}</td>
                  <td>{item.equipmentCode}</td>
                  <td>{formatStatus[item.equipmentStatus]}</td>
                  <td>{item.room?.roomName || 'ไม่ระบุ'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="manage-container">
          <div className="header-container">
            จัดการครุภัณฑ์
          </div>
          <form action="" className="manage-equipment-container">
            <div>
              <label>รหัสครุภัณฑ์</label>
              <input
                type="text"
                name='equipmentCode'
                value={formData.equipmentCode}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label>ชื่อครุภัณฑ์</label>
              <input
                type="text"
                name='equipmentName'
                value={formData.equipmentName}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <select
                name="equipmentStatus"
                onChange={handleInputChange}
                value={formData.equipmentStatus || ""}
                required
              >
                <option value="">สถานะ</option>

                {Object.entries(formatStatus).map(([statusKey, statusNameThai]) => (
                  <option key={statusKey} value={statusKey}>
                    {statusNameThai}
                  </option>
                ))}

              </select>
            </div>
            <div className="form-selected">
              <div className="form-location">
                <select name="locationId"
                  onChange={handleInputChange}
                  value={formData.locationId} required>
                  <option value="">เลือกสถานที่</option>
                  {locations.map(l => <option key={l.locationId} value={l.locationId}>{l.locationName}</option>)}
                </select>
              </div>
              <div className="floors-rooms">
                <select name="floorId"
                  onChange={handleInputChange}
                  value={formData.floorId} required>
                  <option value="">เลือกชั้น</option>

                  {floors.filter(f => f.locationId === parseInt(formData.locationId)).map(f => (
                    <option key={f.floorId} value={f.floorId}>{f.floorLevel || f.floorName}</option>
                  ))}
                </select>

                <select name="roomId"
                  onChange={handleInputChange}
                  value={formData.roomId} required>
                  <option value="">เลือกห้อง</option>

                  {rooms.filter(r => r.floorId === parseInt(formData.floorId)).map((r) => (
                    <option key={r.roomId} value={r.roomId}>
                      {r.roomName}
                    </option>
                  ))}
                </select>
              </div>

            </div>
          </form>
          <div className="update-delete">
            <button className='update' onClick={() =>
              setIsUpdateConfirmOpen(true)}>
              อัปเดต
            </button>
            <ConfirmButton
              isOpen={isUpdateConfirmOpen}
              title="ยืนยันการอัปเดต"
              message={`ยืนยันที่จะอัปเดตข้อมูลครุภัณฑ์หรือไม่`}
              confirmText="ยืนยัน"
              cancelText="ยกเลิก"
              onConfirm={handleUpdate}
              onCancel={() => setIsUpdateConfirmOpen(false)}
              disabled={isSubmitting}
            />
            <button className='delete' onClick={() => {
              setIsDeleteConfirmOpen(true);
            }}>
              ลบ
            </button>
            <ConfirmButton
              isOpen={isDeleteConfirmOpen}
              title="ยืนยันการลบ"
              message={`ยืนยันที่จะลบครุภัณฑ์หรือไม่`}
              confirmText="ยืนยัน"
              cancelText="ยกเลิก"
              onConfirm={handleDelete}
              onCancel={() => setIsDeleteConfirmOpen(false)}
              disabled={isSubmitting}
            />
          </div>
          <div className='btn-import'>
            <ImportEquipments />
          </div>
        </div>
      </div>
    </div>
  )
}

export default AssetManagement