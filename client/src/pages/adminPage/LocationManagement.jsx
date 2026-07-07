import { useMemo, useState } from 'react'
import './LocationManagement.css'

// hook
import { useLocations } from '../../hooks/useLocations';
import { useLoadingState } from '../../hooks/useLoadingState';

// components
import { DropdownWithAdd } from '../../components/componentsAdmin/DropdownAdd';
import { PopupAlert } from '../../components/componentsAdmin/popupAlert';
import { LoadingSpinner, ToastAlert } from '../../components/LoadingSpinner';
import { ConfirmButton } from '../../components/ConfirmButton';
// service
import { locationService } from '../../services/locationService';

const LocationManagement = () => {
    const { locations, floors, rooms, fetchRooms, fetchFloors, fetchLocations } = useLocations();
    const [openLocations, setOpenLocations] = useState([]);
    const [openFloors, setOpenFloors] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const { loading, startLoading, setError, setSuccess, reset, clearError } = useLoadingState();
    const [formData, setFormData] = useState({
        location: '',
        locationId: '',
        floor: '',
        room: '',
        locationStatus: '',
        floorStatus: '',
        roomStatus: ''
    });
    const [confirmSubmitLocation, setConfirmSubmitLocation] = useState({ isOpen: false, locationName: '' });
    const [confirmSubmitFloor, setConfirmSubmitFloor] = useState({ isOpen: false, level: '' });
    const [confirmSubmitRoom, setConfirmSubmitRoom] = useState({ isOpen: false, name: '' });
    const [confirmSaveStatus, setConfirmSaveStatus] = useState({ isOpen: false, type: '', message: '' });
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };
    const handleStatusChange = (field, value) => {
        setFormData((prev) => {
            let newData = { ...prev, [field]: value };

            if (field === 'locationStatus' && value === 'inactive') {
                newData.floorStatus = 'inactive';
                newData.roomStatus = 'inactive';
            }
            if (field === 'floorStatus' && value === 'inactive') {
                newData.roomStatus = 'inactive';
            }
            if (field === 'roomStatus' && value === 'enable') {
                if (newData.locationStatus === 'inactive' || newData.floorStatus === 'inactive') {
                    return prev; // ยกเลิกการเปลี่ยนค่า (return ค่าเดิมกลับไป)
                }
            }
            if (field === 'floorStatus' && value === 'enable') {
                if (newData.locationStatus === 'inactive') {
                    return prev;
                }
            }

            return newData;
        });
    };
    const handleEditClick = (selectedItem) => {
        setFormData({
            location: selectedItem.locationName || '',
            locationId: selectedItem.locationId ? String(selectedItem.locationId) : '',
            floor: selectedItem.floorId ? String(selectedItem.floorId) : '',
            room: selectedItem.roomId ? String(selectedItem.roomId) : '',
            locationStatus: selectedItem.locationStatus || '',
            floorStatus: selectedItem.floorStatus || '',
            roomStatus: selectedItem.roomStatus || ''
        });
        setSelectedId(selectedItem.locationId);
    };

    const toggleLocation = (locationId) => {
        setOpenLocations((prev) =>
            prev.includes(locationId)
                ? prev.filter((id) => id !== locationId)
                : [...prev, locationId]
        );
    };

    const toggleFloor = (floorId) => {
        setOpenFloors((prev) =>
            prev.includes(floorId)
                ? prev.filter((id) => id !== floorId)
                : [...prev, floorId]
        );
    };

    const nestedLocations = useMemo(() => {

        if (!locations || locations.length === 0) return [];

        return locations.map((location) => {
            const buildingFloors = floors.filter(floor => floor.locationId === location.locationId);

            const floorsWithRooms = buildingFloors.map((floor) => {

                const floorRooms = rooms.filter(room => room.floorId === floor.floorId);

                return { ...floor, rooms: floorRooms };
            });

            return { ...location, floors: floorsWithRooms };
        });

    }, [locations, floors, rooms]);

    const handleDeleteRoom = async (locationId, floorId, roomId, e) => {
        e.stopPropagation();

        if (window.confirm("ยืนยันการลบห้องนี้?")) {
            try {
                await locationService.deleteRoomApi(roomId);

                await fetchRooms();

                if (formData?.room === String(roomId)) {
                    setFormData(prev => ({ ...prev, room: '' }));
                }

                alert("ลบห้องสำเร็จเรียบร้อย!");

            } catch (error) {
                console.error("ลบข้อมูลไม่สำเร็จ:", error);
                alert(`เกิดข้อผิดพลาด: ${error.response?.data?.error || error.message}`);
            }
        }
    };
    const handleConfirmAddNewRoom = async (roomName) => {
        if (!roomName || String(roomName).trim() === '') {
            setError("กรุณากรอกรายการห้อง", "warning");
            return;
        }

        setConfirmSubmitRoom({
            isOpen: true,
            name: String(roomName).trim()
        });
    }
    const handleAddNewRoom = async () => {
        startLoading();
        try {
            const payload = {
                floorId: Number(formData.floor),
                roomName: confirmSubmitRoom.name,
            };
            await locationService.addRoomApi(payload);

            await fetchRooms();

            setConfirmSubmitRoom({ isOpen: false, name: '' });
            setSuccess("เพิ่มห้องสำเร็จ!");

        } catch (error) {
            const errorMessage = error.response?.data?.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล";
            const severityLevel = error.response?.status === 400 ? 'warning' : 'error';

            setError(errorMessage, severityLevel);
            setConfirmSubmitRoom({ isOpen: false });
        }
    };

    const handleConfirmAddNewFloor = async (floorLevel) => {

        if (!floorLevel || String(floorLevel).trim() === '') {
            setError("กรุณากรอกรายการชั้น", "warning");
            return;
        }

        setConfirmSubmitFloor({
            isOpen: true,
            level: String(floorLevel).trim()
        });
    }
    const handleAddNewfloor = async () => {
        startLoading();
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));

            const payload = {
                locationId: Number(formData.locationId),
                floorLevel: confirmSubmitFloor.level
            };
            console.log("Payload ที่จะส่งไปหลังบ้าน:", payload);
            await locationService.addFloorApi(payload);

            await fetchFloors();

            setConfirmSubmitFloor({ isOpen: false, level: '' });
            setSuccess("เพิ่มชั้นสำเร็จ!");

        } catch (error) {
            const errorMessage = error.response?.data?.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล";
            const severityLevel = error.response?.status === 400 ? 'warning' : 'error';

            setError(errorMessage, severityLevel);
            setConfirmSubmitFloor({ isOpen: false });
        }
    };
    const handleConfirmAddNewLocation = async (locationName, e) => {
        if (e) e.stopPropagation();

        if (!locationName || String(locationName).trim() === '') {
            setError("กรุณากรอกรายการสถานที่", "warning");
            return;
        }

        setConfirmSubmitLocation({
            isOpen: true,
            locationName: String(locationName).trim()
        });
    }
    const handleAddNewLocation = async () => {
        startLoading();

        try {
            await new Promise(resolve => setTimeout(resolve, 1500));

            const payload = {
                locationName: confirmSubmitLocation.locationName,
                locationStatus: 'active'
            };
            await locationService.addLocationApi(payload);

            await fetchLocations();

            setConfirmSubmitLocation({ isOpen: false, locationName: '' });
            setSuccess("เพิ่มสถานที่สำเร็จ!");

        } catch (error) {
            const errorMessage = error.response?.data?.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล";
            const severityLevel = error.response?.status === 400 ? 'warning' : 'error';

            setError(errorMessage, severityLevel);
            setConfirmSubmitLocation({ isOpen: false });
        }
    }

    const handleCancelSubmit = () => {
        setConfirmSubmit({ isOpen: false });
        reset();
    };
    const handleConfirmSaveStatus = () => {
        if (!formData.locationId && !formData.floorId && !formData.roomId) {
            setError("กรุณาเลือกข้อมูลที่ต้องการแก้ไขทางซ้ายมือก่อนครับ", "warning");
            return;
        }
        setConfirmSaveStatus({ isOpen: true, });
    }
    const handleSaveStatus = async () => {
        startLoading();
        try {
            let isUpdated = false;
            await new Promise(resolve => setTimeout(resolve, 1500));
            if (formData.room) {
                await locationService.updateRoomStatusApi({
                    roomId: Number(formData.room),
                    status: formData.roomStatus
                });
                isUpdated = true;
                setSuccess("อัปเดตสถานะห้องสำเร็จ");

            }
            else if (formData.floor) {
                await locationService.updateFloorStatusApi({
                    floorId: Number(formData.floor),
                    status: formData.floorStatus
                });
                isUpdated = true;
                setSuccess("อัปเดตสถานะชั้นสำเร็จ");

            }
            else if (formData.locationId) {
                await locationService.updateLocationStatusApi({
                    locationId: Number(formData.locationId),
                    status: formData.locationStatus
                });
                isUpdated = true;
                setSuccess("อัปเดตสถานะสถานที่สำเร็จ");


            }
            setConfirmSaveStatus({ isOpen: false });
            console.log("จะเซฟห้อง:", formData.room, "สถานะ:", formData.roomStatus);
            console.log("จะเซฟชั้น:", formData.floor, "สถานะ:", formData.floorStatus);
            console.log("จะเซฟตึก:", formData.locationId, "สถานะ:", formData.locationStatus);
            if (isUpdated) {
                await fetchLocations();
                await fetchFloors();
                await fetchRooms();
                setFormData({
                    locationStatus: '',
                    floorStatus: '',
                    roomStatus: ''
                });
                setSelectedId(null);
                setOpenLocations([]);      
                setOpenFloors([]);
            }
        } catch (error) {
            console.error("อัปเดตข้อมูลไม่สำเร็จ:", error);
            setError("อัปเดตข้อมูลไม่สำเร็จ", "error");
        }
    };

    const [alert, setAlert] = useState({ isOpen: false, type: '', message: '' });
    const triggerAlert = (type, message) => {
        setAlert({ isOpen: true, type, message });
    };

    return (
        <div className="location-management">
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
            <div className="main-container">
                <div className="location-container">
                    <h3 style={{ textAlign: 'center' }}>รายการสถานที่</h3>
                    <ul>
                        {nestedLocations.map((item) => {
                            const isLocationOpen = openLocations.includes(item.locationId);

                            return (
                                <li key={item.locationId}>
                                    <strong
                                        onClick={() => {
                                            setSelectedId(item.locationId);
                                            handleEditClick(item);
                                            toggleLocation(item.locationId);
                                        }}
                                    >
                                        <span >
                                            {isLocationOpen ? '' : ''}
                                        </span>
                                        {item.locationName} {item.locationStatus === 'active' ? '(ใช้งาน)' : '(ปิดใช้งาน)'}
                                    </strong>
                                    {isLocationOpen && (
                                        <ul>
                                            {[...item.floors]
                                                .sort((a, b) => a.floorLevel - b.floorLevel)
                                                .map((floor) => {
                                                    const isFloorOpen = openFloors.includes(floor.floorId);

                                                    return (
                                                        <li key={floor.floorId}>
                                                            <div
                                                                onClick={() => {
                                                                    setSelectedId(floor.floorId);
                                                                    handleEditClick({
                                                                        ...floor,
                                                                        locationName: item.locationName,
                                                                        locationId: item.locationId,
                                                                        locationStatus: item.locationStatus,
                                                                    });
                                                                    toggleFloor(floor.floorId);
                                                                }}
                                                            >
                                                                <span >
                                                                    {isFloorOpen ? '' : ''}
                                                                </span>
                                                                ชั้น {floor.floorLevel} {floor.floorStatus === 'active' ? '(ใช้งาน)' : '(ปิดใช้งาน)'}
                                                            </div>
                                                            {isFloorOpen && (
                                                                <ul>
                                                                    {floor.rooms.map((room) => (
                                                                        <li key={room.roomId}
                                                                            onClick={() => {
                                                                                setSelectedId(room.roomId);
                                                                                handleEditClick({
                                                                                    ...room,
                                                                                    floorLevel: floor.floorLevel,
                                                                                    floorId: floor.floorId,
                                                                                    locationName: item.locationName,
                                                                                    locationId: item.locationId,
                                                                                    roomListFromFloor: floor.rooms,

                                                                                    locationStatus: item.locationStatus,
                                                                                    floorStatus: floor.floorStatus,
                                                                                });
                                                                            }}
                                                                        >
                                                                            <span>
                                                                                ห้อง {room.roomName} {room.roomStatus === 'active' ? '(ใช้งาน)' : '(ปิดใช้งาน)'}
                                                                            </span>
                                                                            <button
                                                                                type="button"
                                                                                onClick={(e) => handleDeleteRoom(item.locationId, floor.floorId, room.roomId, e)}
                                                                                style={{ background: 'red', borderRadius: '50%', border: 'none', fontSize: '18px', width: '25px', height: '25px', cursor: 'pointer', color: 'white' }}
                                                                                title="ลบห้องนี้"
                                                                            >
                                                                                -
                                                                            </button>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            )}
                                                        </li>
                                                    );
                                                })}
                                        </ul>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </div>
                <div className="manage-locations-container">
                    <div className="header-container">
                        จัดการสถานที่
                    </div>
                    <form action="" className="manage-location-container">
                        <div className='input-location-button'>
                            <label>สถานที่</label>
                            <DropdownWithAdd
                                name="location"
                                value={formData.locationId || ''}
                                onChange={handleInputChange}
                                placeholder="เลือกสถานที่"
                                addLabel="สร้างสถานที่ใหม่"

                                options={locations?.map((loc) => ({
                                    id: loc.locationId,
                                    label: loc.locationName
                                })) || []}

                                onSaveNew={(newLocationName) => {
                                    if (!newLocationName.trim()) {
                                        alert("กรุณาระบุชื่อสถานที่ที่ต้องการเพิ่มครับ");
                                        return;
                                    }
                                    // เรียกฟังก์ชันเพิ่มสถานที่ใหม่ของคุณ
                                    handleConfirmAddNewLocation(newLocationName);
                                }}
                            />
                        </div>
                        <div className='floor-room'>
                            <DropdownWithAdd
                                name="floor"
                                value={formData.floor || ''}
                                onChange={handleInputChange}
                                placeholder="เลือกชั้น"
                                addLabel="สร้างชั้นใหม่"
                                options={floors
                                    ?.filter((f) => Number(f.locationId) === Number(formData.locationId))
                                    ?.map((f) => ({ id: f.floorId, label: `ชั้น ${f.floorLevel}` })) || []}
                                onSaveNew={(newFloorName) => {
                                    if (!formData.locationId) {
                                        alert("กรุณาเลือกสถานที่ให้เรียบร้อยก่อนสร้างชั้นใหม่ครับ");
                                        return;
                                    }
                                    handleConfirmAddNewFloor(newFloorName);
                                }}
                            />
                            <DropdownWithAdd
                                name="room"
                                value={formData.room || ''}
                                onChange={handleInputChange}
                                placeholder="เลือกห้อง"
                                addLabel="สร้างห้องใหม่"
                                options={rooms
                                    ?.filter((r) => String(r.floorId) === String(formData.floor))
                                    .map((r) => ({ id: r.roomId, label: `ห้อง ${r.roomName}` })) || []}
                                onSaveNew={(newRoomName) => {
                                    if (!formData.floor) {
                                        alert("กรุณาเลือกตึกและชั้นให้เรียบร้อยก่อนสร้างห้องใหม่ครับ");
                                        return;
                                    }
                                    handleConfirmAddNewRoom(newRoomName);
                                }}
                            />
                        </div>

                        <div className="status">
                            <div>
                                <label>สถานะสถานที่</label>
                                <select
                                    name="locationStatus"
                                    value={formData.locationStatus}
                                    onChange={handleInputChange}
                                // onChange={(e) => handleStatusChange('locationStatus', e.target.value)}
                                >
                                    <option value="" disabled>สถานะสถานที่</option>
                                    <option value="active">ใช้งาน</option>
                                    <option value="inactive">ปิดใช้งาน</option>
                                </select>
                            </div>
                            <div>
                                <label>สถานะชั้น</label>
                                <select
                                    name="floorStatus"
                                    onChange={(e) => {
                                        handleInputChange(e);
                                        handleStatusChange('floorStatus', e.target.value);
                                    }}
                                    value={formData.floorStatus || ""}
                                    disabled={!formData.floor || formData.locationStatus === 'inactive'}
                                    style={{ cursor: (!formData.floor || formData.locationStatus === 'inactive') ? 'not-allowed' : 'pointer' }}
                                >
                                    <option value="" disabled>สถานะชั้น</option>
                                    <option value="active">ใช้งาน</option>
                                    <option value="inactive">ปิดใช้งาน</option>
                                </select>
                            </div>
                            <div>
                                <label>สถานะห้อง</label>
                                <select
                                    name="roomStatus"
                                    onChange={(e) => {
                                        handleInputChange(e);
                                        handleStatusChange('roomStatus', e.target.value);
                                    }}
                                    value={formData.roomStatus || ""}
                                    disabled={!formData.room || formData.locationStatus === 'inactive' || formData.floorStatus === 'inactive'}
                                    style={{ cursor: !formData.room ? 'not-allowed' : 'pointer' }}
                                >
                                    <option value="" disabled>สถานะห้อง</option>
                                    <option value="active">ใช้งาน</option>
                                    <option value="inactive">ปิดใช้งาน</option>
                                </select>
                            </div>
                        </div>
                    </form>
                    <div className="btn">
                        <button className="btn-confirm" onClick={handleConfirmSaveStatus}>
                            บันทึก
                        </button>
                        <button className="btn-cancel">ยกเลิก</button>
                    </div>
                    <PopupAlert
                        isOpen={alert.isOpen}
                        type={alert.type}
                        message={alert.message}
                        onClose={() => setAlert({ ...alert, isOpen: false })}
                    />

                    {/* Confirm add location */}
                    <ConfirmButton
                        isOpen={confirmSubmitLocation.isOpen}
                        title="ยืนยันการเพิ่มสถานที่"
                        message="คุณแน่ใจหรือไม่ว่าต้องการเพิ่มสถานที่นี้? โปรดตรวจสอบข้อมูลให้ถูกต้องก่อนยืนยัน"
                        onConfirm={handleAddNewLocation}
                        onCancel={() => setConfirmSubmitLocation({ isOpen: false, locationName: '' })}
                        confirmText={loading.isLoading ? "กำลังบันทึก..." : "ยืนยัน"}
                        cancelText={loading.isLoading ? "ปิด" : "ยกเลิก"}
                        isLoading={loading.isLoading}
                    />
                    {/* Confirm add floor */}
                    <ConfirmButton
                        isOpen={confirmSubmitFloor.isOpen}
                        title="ยืนยันการเพิ่มชั้น"
                        message="คุณแน่ใจหรือไม่ว่าต้องการเพิ่มชั้นนี้? โปรดตรวจสอบข้อมูลให้ถูกต้องก่อนยืนยัน"
                        onConfirm={handleAddNewfloor}
                        onCancel={() => setConfirmSubmitFloor({ isOpen: false, level: '' })}
                        confirmText={loading.isLoading ? "กำลังบันทึก..." : "ยืนยัน"}
                        cancelText={loading.isLoading ? "ปิด" : "ยกเลิก"}
                        isLoading={loading.isLoading}
                    />
                    {/* Confirm add room */}
                    <ConfirmButton
                        isOpen={confirmSubmitRoom.isOpen}
                        title="ยืนยันการเพิ่มห้อง"
                        message="คุณแน่ใจหรือไม่ว่าต้องการเพิ่มห้องนี้? โปรดตรวจสอบข้อมูลให้ถูกต้องก่อนยืนยัน"
                        onConfirm={handleAddNewRoom}
                        onCancel={() => setConfirmSubmitRoom({ isOpen: false, name: '' })}
                        confirmText={loading.isLoading ? "กำลังบันทึก..." : "ยืนยัน"}
                        cancelText={loading.isLoading ? "ปิด" : "ยกเลิก"}
                        isLoading={loading.isLoading}
                    />
                    <ConfirmButton
                        isOpen={confirmSaveStatus.isOpen}
                        title="ยืนยันการบันทึกสถานะ"
                        message={confirmSaveStatus.message}
                        onConfirm={handleSaveStatus}
                        onCancel={() => setConfirmSaveStatus({ isOpen: false, type: '', message: '' })}
                        confirmText={loading.isLoading ? "กำลังบันทึก..." : "ยืนยัน"}
                        cancelText={loading.isLoading ? "ปิด" : "ยกเลิก"}
                        isLoading={loading.isLoading}
                    />
                </div>
            </div>
        </div>
    )
}

export default LocationManagement