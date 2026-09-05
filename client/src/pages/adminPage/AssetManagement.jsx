import React, { useState, useEffect } from 'react'
import { FaFilter } from 'react-icons/fa';
import './AssetManagement.css'
// component
import { SearchBar } from '../../components/SearchBar';
import { ImportEquipments } from '../../components/componentsAdmin/ImportEquipments';
import { ConfirmButton } from '../../components/ConfirmButton';
import { LoadingSpinner, ToastAlert } from '../../components/LoadingSpinner';
import { AdvancedFilterPanel } from '../../components/AdvancedFilterPanel.jsx';
import { EquipmentCategoryFilter } from '../../components/EquipmentCategoryFilter.jsx';
import { TicketLocationFilter } from '../../components/TicketLocationFilter.jsx';

// hook
import { useEquipment } from '../../hooks/useEquipment'
import { useLocations } from '../../hooks/useLocations';
import { useCategories } from '../../hooks/useCategories';
import { useLoadingState } from '../../hooks/useLoadingState';
import { useEquiptmentCtg } from '../../hooks/useEquiptmentCtg';
// service
import { equipmentService } from '../../services/equipmentService';


const AssetManagement = () => {
  const { locations, floors, rooms } = useLocations();
  const { categories } = useCategories();
  const [selectedEquipments, setSelectedEquipments] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [isUpdateConfirmOpen, setIsUpdateConfirmOpen] = useState({ isOpen: false });
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const { loading, startLoading, setError, setSuccess, reset, clearError } = useLoadingState();
  const { equipment, filterCategory, setFilterCategory, filterLocation, setFilterLocation, searchQuery, setSearchQuery, softDeleteEquipment, refetch, EquipmentCtgs } = useEquipment();
  const [selectedDetails, setSelectedDetails] = useState([]);
  const formatStatus = {
    'active': 'ใช้งาน',
    'awaiting_sale': 'รอขาย',
    'sent_for_repair': 'รอส่งซ่อม',
    'broken': 'ชำรุด'
  };
  // console.log('ssss', EquipmentCtgs)
  // console.log(equipment)
  const [formData, setFormData] = useState({
    equipmentName: '',
    equipmentCode: '',
    equipmentStatus: '',
    locationId: '',
    floorId: '',
    roomId: ''
  })

  useEffect(() => {
    if (selectedEquipments.length > 1) {
      // โหมด Bulk: ล้างค่าฟอร์มให้ว่าง เพื่อให้ผู้ใช้เลือกเปลี่ยนแค่บางช่อง
      setFormData({
        equipmentCode: "",
        equipmentName: "",
        equipmentStatus: "",
        locationId: "",
        floorId: "",
        roomId: ""
      });

    } else if (selectedEquipments.length === 1) {
      // โหมด Single (ติ๊ก 1 อัน): ดึงค่าเก่ามาโชว์ในฟอร์ม
      const selectedItem = selectedDetails.find(item => String(item.equipmentId) === String(selectedEquipments[0]));

      if (selectedItem) {
        setFormData({
          equipmentCode: selectedItem.equipmentCode || "",
          equipmentName: selectedItem.equipmentName || "",
          equipmentStatus: selectedItem.equipmentStatus || "",
          locationId: selectedItem.locationId || "",
          floorId: selectedItem.floorId || "",
          roomId: selectedItem.roomId || ""
        });
      }
    } else {
      // กรณีไม่ได้เลือกอะไรเลย: ล้างฟอร์ม
      setFormData({
        equipmentCode: "",
        equipmentName: "",
        equipmentStatus: "",
        locationId: "",
        floorId: "",
        roomId: ""
      });
    }
  }, [selectedEquipments, selectedDetails]);

  useEffect(() => {
    setSelectedDetails((prevDetails) => {
      let updatedDetails = [...prevDetails];

      selectedEquipments.forEach((id) => {
        if (!updatedDetails.find((item) => String(item.equipmentId) === String(id))) {
          const foundItem = equipment.find((eq) => String(eq.equipmentId) === String(id));
          if (foundItem) {
            updatedDetails.push(foundItem);
          }
        }
      });

      return updatedDetails.filter((item) => selectedEquipments.includes(String(item.equipmentId)));
    });
  }, [selectedEquipments, equipment]);

  // const uniqueCategories = Array.from(
  //   new Map(
  //     equipment
  //       .filter((item) => item.category) // กรองเอาเฉพาะอันที่มีข้อมูล category ป้องกัน Error
  //       .map((item) => [item.category.equipmentCtgId, item.category]) // จับคู่ ID กับ ข้อมูล
  //   ).values()
  // );

  const handleSelectAll = () => {
    const isAllSelected = selectedEquipments.length === equipment.length && equipment.length > 0;

    if (isAllSelected) {
      setSelectedEquipments([]);
      setSelectedId(null);
      // console.log("ค่าที่เลือก",[])
    } else {
      const allIds = equipment.map(item => String(item.equipmentId));
      setSelectedEquipments(allIds);
      // console.log("ค่าที่เลือก",allIds)
      setSelectedId(null); // ล้าง selectedId เพราะตอนนี้เราเลือกหลายรายการ
    }


  };
  const handleSelectOne = (e, id) => {
    const targetId = String(id);
    if (e.target.checked) {
      setSelectedEquipments(prev => [...prev, targetId]);
      // console.log("เพิ่ม ID:", targetId); 
    } else {
      setSelectedEquipments(prev => prev.filter(itemId => String(itemId) !== targetId));
      // console.log("เอา ID ออก:", targetId);
    }
  };

  const handleEditClick = (selectedItem) => {
    setFormData({
      equipmentName: selectedItem.equipmentName,
      equipmentCode: selectedItem.equipmentCode,
      equipmentStatus: selectedItem.equipmentStatus,
      roomId: selectedItem.room?.roomId || '',
      floorId: selectedItem.room?.floor?.floorId || '',
      locationId: selectedItem.room?.floor?.location?.locationId || ''
    })
    setSelectedId(selectedItem.equipmentId);
    // console.log(selectedItem)
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
  const handleConfirmUpdateEquipment = async () => {
    if (!selectedId && selectedEquipments.length === 0) {
      console.log("เลือก", selectedId)
      setError("กรุณากรอกรายการครุภัณฑ์", "warning");
      return;
    }

    setIsUpdateConfirmOpen({
      isOpen: true,
    });
  }

  const handleUpdate = async () => {
    startLoading();
    try {
      const isBulkMode = selectedEquipments.length > 1;

      if (isBulkMode) {

        if (formData.equipmentStatus === "" &&
          formData.locationId === "" &&
          formData.floorId === "" &&
          formData.roomId === "") {

          setError("กรุณาเลือกข้อมูลที่ต้องการแก้ไขอย่างน้อย 1 ช่อง", "warning");
          setIsUpdateConfirmOpen({ isOpen: false }); // ปิดป๊อปอัพ
          return;
        }
        const payload = selectedEquipments.map(id => {

          // if (selectedEquipments.roomId === "") {
          //   setError("กรุณาเลือกห้อง", "warning");
          //   setIsUpdateConfirmOpen({ isOpen: false }); // ปิดป๊อปอัพ
          //   return;
          // }
          const updateData = { equipmentId: Number(id) };

          if (formData.equipmentStatus !== "") updateData.equipmentStatus = String(formData.equipmentStatus);
          if (formData.locationId !== "") updateData.locationId = Number(formData.locationId);
          if (formData.floorId !== "") updateData.floorId = Number(formData.floorId);
          if (formData.roomId !== "") updateData.roomId = Number(formData.roomId);
          return updateData;
        });

        console.log("Payload แบบ Array ปลอดภัย 100%:", payload);
        await equipmentService.updateMultipleEquipments(payload);
        setSuccess(`อัปเดตข้อมูลสำเร็จ ${selectedEquipments.length} รายการ`);

      } else {
        const targetId = selectedEquipments.length === 1 ? selectedEquipments[0] : selectedId;

        const payload = {
          equipmentId: Number(targetId),
          equipmentStatus: String(formData.equipmentStatus),
          locationId: Number(formData.locationId),
          floorId: Number(formData.floorId),
          roomId: Number(formData.roomId)
        };
        console.log('onemode', payload)
        await equipmentService.updateEquipment(payload);
        setSuccess("อัปเดตข้อมูลสำเร็จ");
      }

      await refetch();
      setSelectedEquipments([]);
      setSelectedDetails([]);
      setSelectedId(null);
      setFormData({
        equipmentCode: "",
        equipmentName: "",
        equipmentStatus: "",
        locationId: "",
        floorId: "",
        roomId: ""
      });
      setIsUpdateConfirmOpen({ isOpen: false });

    } catch (error) {
      console.error("Update Error:", error);
      const errorMessage = error.response?.data?.error || "เกิดข้อผิดพลาดในการอัปเดตข้อมูล";
      setError(errorMessage, error.response?.status === 400 ? 'warning' : 'error');
      setIsUpdateConfirmOpen({ isOpen: false });
    }
  }
  const handleDelete = async () => {
    // 🌟 ดึง ID ทั้งหมดที่ต้องการลบ (รองรับทั้งการติ๊ก Checkbox หลายอัน และการคลิกเลือกทีละอัน)
    const targetIds = selectedEquipments.length > 0 ? selectedEquipments : (selectedId ? [String(selectedId)] : []);

    if (targetIds.length === 0) {
      setIsDeleteConfirmOpen(false);
      // แนะนำให้ใช้ setError แทน alert เพื่อให้ UI เป็นไปในทางเดียวกันครับ
      setError("กรุณาเลือกครุภัณฑ์ที่ต้องการลบ", "warning");
      return;
    }

    if (isSubmitting) return;

    setIsDeleteConfirmOpen(false);
    setIsSubmitting(true);
    startLoading(); // แสดงสถานะกำลังโหลด

    try {
      // วนลูปส่งคำสั่ง Soft Delete ไปที่ API ตามจำนวน ID ที่เลือก
      for (const id of targetIds) {
        await softDeleteEquipment(id);
      }

      setSuccess(`ลบข้อมูลสำเร็จจำนวน ${targetIds.length} รายการ`);
      await refetch(); // รีเฟรชตาราง ข้อมูลที่ลบจะหายไปทันที

      // ล้างค่าที่เลือกไว้ทั้งหมด
      setSelectedId(null);
      setSelectedEquipments([]);
      setSelectedDetails([]);

    } catch (error) {
      console.error("Delete Error:", error);
      setError("เกิดข้อผิดพลาดในการลบข้อมูล", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  const activeDropdownFiltersCount = (filterCategory ? 1 : 0) + (filterLocation ? 1 : 0);

  const handleClearAllFilters = () => {
    setFilterCategory('');
    setFilterLocation('');
  };

  return (
    <div className="assetManagement-container">
      <div className="filter-assetManagement-container-responsive">
        <div className="searchbar">
          <SearchBar onSearch={(text) => setSearchQuery(text)} />
        </div>
        <div className='filter-panel-responsive-asset'>
          <AdvancedFilterPanel
            onClearAll={handleClearAllFilters}
            activeFilterCount={activeDropdownFiltersCount}
          >
            <EquipmentCategoryFilter selectedValue={filterCategory} onChange={setFilterCategory} />
            <TicketLocationFilter selectedValue={filterLocation} onChange={setFilterLocation} />
          </AdvancedFilterPanel>
        </div>
      </div>
      <div className="main-container">
        <div className="table-responsive-wrapper">
          <table className="layout-table">
            <thead>
              <tr>
                <th style={{ width: '50px', textAlign: 'center' }}>
                  <button
                    type="button"
                    className="btn-toggle-all"
                    onClick={handleSelectAll}
                    // 🌟 เพิ่มบรรทัดนี้: เช็คเงื่อนไขเดียวกับข้อความเป๊ะๆ
                    style={{
                      backgroundColor: selectedEquipments.length === equipment.length && equipment.length > 0 ? '#dc3545' : '#28a745'
                    }}
                  >
                    {selectedEquipments.length === equipment.length && equipment.length > 0 ? 'ยกเลิกทั้งหมด' : 'เลือกทั้งหมด'}
                  </button>
                </th>
                <th>ชื่อครุภัณฑ์</th>
                <th>รหัสครุภัณฑ์</th>
                <th>ประเภท</th>
                <th>สถานะ</th>
                {/* <th>สถานที่</th> */}
                <th>ชั้น</th>
                <th>ห้อง</th>
              </tr>
            </thead>
            <tbody>
              {equipment.length > 0 ? (
                equipment.map((item) => (
                  <tr key={item.equipmentId}
                    // 🌟 ปรับ className: ให้ไฮไลท์แถวถ้า "ถูกติ๊ก Checkbox" หรือ "กำลังกดแก้ไขอยู่"
                    className={`data-layout-row ${selectedEquipments.includes(item.equipmentId) || selectedId === item.equipmentId ? 'selected' : ''}`}
                    // onClick เดิมของคุณ (คลิกทั้งแถวเพื่อแก้ไขข้อมูล)
                    onClick={() => {
                      setSelectedId(item.equipmentId);
                      handleEditClick(item);
                      const isCurrentlyChecked = selectedEquipments.includes(String(item.equipmentId));
                      const mockEvent = { target: { checked: !isCurrentlyChecked } };

                      handleSelectOne(mockEvent, String(item.equipmentId));
                    }}
                  >
                    {/* 🌟 1. เพิ่มคอลัมน์ Checkbox ไว้ซ้ายสุด */}
                    {/* ใส่ onClick={(e) => e.stopPropagation()} เพื่อดักไว้ ไม่ให้พอกดติ๊ก Checkbox แล้วทะลุไปเรียก handleEditClick ของแถว */}
                    <td style={{ textAlign: 'center', width: '50px' }}>
                      <input
                        type="checkbox"
                        checked={selectedEquipments.includes(String(item.equipmentId))}
                        onChange={(e) => handleSelectOne(e, String(item.equipmentId))}
                        style={{ cursor: 'pointer', transform: 'scale(1.2)' }} // ขยายขนาด Checkbox นิดนึงให้กดง่าย
                      />
                    </td>
                    <td>{item.equipmentName}</td>
                    <td>{item.equipmentCode}</td>
                    <td>{item.category?.equipmentCtgName}</td>
                    <td>{formatStatus[item.equipmentStatus]}</td>
                    {/* <td>{item.location?.locationName || 'ไม่ระบุ'}</td> */}
                    <td>{item.floor?.floorLevel || 'ไม่ระบุ'}</td>
                    <td>{item.room?.roomName || 'ไม่ระบุ'}</td>
                  </tr>
                ))
              ) : (
                // กรณีที่กรองแล้วไม่เจอข้อมูลเลย
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                    ไม่พบข้อมูลครุภัณฑ์ที่ค้นหา
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="manage-container">
          <div className="header-container">
            จัดการครุภัณฑ์
          </div>
          <form action="" className="manage-equipment-container">
            {selectedEquipments.length > 1 ? (
              <div className="showSelected" style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#e3f2fd', borderRadius: '5px' }}>

                <span style={{ color: '#1565c0', fontWeight: 'bold' }}>
                  🛠️ กำลังแก้ไขครุภัณฑ์พร้อมกัน {selectedEquipments.length} รายการ
                </span>

                <ul style={{ fontSize: '13px', color: '#333', marginTop: '10px', marginBottom: '5px', paddingLeft: '20px', maxHeight: '100px', overflowY: 'auto' }}>
                  {selectedDetails.map((item) => (
                    <li key={item.equipmentId}>
                      <strong>{item.equipmentCode}</strong> : {item.equipmentName} - {formatStatus[item.equipmentStatus] || 'ไม่ทราบสถานะ'}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <>
                <div>
                  <label>รหัสครุภัณฑ์</label>
                  <input
                    type="text"
                    name='equipmentCode'
                    value={formData.equipmentCode}
                    onChange={handleInputChange}
                    disabled
                  />
                </div>

                <div>
                  <label>ชื่อครุภัณฑ์</label>
                  <input
                    type="text"
                    name='equipmentName'
                    value={formData.equipmentName}
                    onChange={handleInputChange}
                    disabled
                  />
                </div>
              </>
            )}

            <div>
              <label>สถานะครุภัณฑ์</label>
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
          <div className="update-delete">
            <button className='update' onClick={handleConfirmUpdateEquipment}>
              อัปเดต
            </button>
            <ConfirmButton
              isOpen={isUpdateConfirmOpen.isOpen}
              title="ยืนยันการเพิ่มชั้น"
              message="คุณแน่ใจหรือไม่ว่าต้องการอัปเดตข้อมูลครุภัณฑ์นี้?"
              onConfirm={handleUpdate}
              onCancel={() => setIsUpdateConfirmOpen({ isOpen: false, level: '' })}
              confirmText={loading.isLoading ? "กำลังบันทึก..." : "ยืนยัน"}
              cancelText={loading.isLoading ? "ปิด" : "ยกเลิก"}
              isLoading={loading.isLoading}
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

          {/* 🌟 ส่วนปุ่มนำเข้า และ ลิงก์ดาวน์โหลดที่เพิ่มใหม่ */}
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

            {/* ลิงก์ดาวน์โหลดไฟล์ตัวอย่าง */}
            <a
              href="/template-equipment.xlsx"
              download="template-equipment.xlsx"
              style={{
                color: '#6c757d', /* สีเทาเข้ม หรือเปลี่ยนเป็นสีฟ้า #2196f3 ก็ได้ */
                fontSize: '14px',
                textDecoration: 'underline',
                cursor: 'pointer'
              }}
            >
              📥 ดาวน์โหลดไฟล์ตัวอย่างสำหรับนำเข้า (.csv หรือ .xlsx)
            </a>
          </div>
          <div className='btn-import'>
            <ImportEquipments />
          </div>
        </div >
      </div >
    </div >
  )
}

export default AssetManagement