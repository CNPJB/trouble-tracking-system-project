import { useMemo, useState } from 'react'
import './LocationManagement.css'

// hook
import { useLocations } from '../../hooks/useLocations';

// components
import { DropdownWithAdd } from '../../components/componentsAdmin/DropdownAdd';
import { PopupAlert } from '../../components/componentsAdmin/popupAlert';

// service
import { locationService } from '../../services/locationService';

const LocationManagement = () => {
    const { locations, floors, rooms, fetchRooms, fetchFloors, fetchLocations } = useLocations();
    const [openLocations, setOpenLocations] = useState([]);
    const [openFloors, setOpenFloors] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [formData, setFormData] = useState({
        location: '',
        locationId: '',
        floor: '',
        room: '',
        locationStatus: '',
        floorStatus: '',
        roomStatus: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
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

    const handleAddNewRoom = async (floorId, roomName, e) => {

        if (e) {
            e.stopPropagation();
        }

        const finalRoomName = formData.room;
        if (!roomName) {
            alert("กรุณาระบุชื่อห้องครับ");
            return;
        }

        if (window.confirm("ยืนยันการเพิ่มห้องนี้?")) {
            try {
                console.log("เช็คค่า floorId ก่อนส่ง:", floorId, typeof floorId);
                const payload = {
                    floorId: Number(floorId),
                    roomName: String(roomName)
                };
                await locationService.addRoomApi(payload);

                await fetchRooms();

                alert("เพิ่มห้องสำเร็จเรียบร้อย!");

            } catch (error) {
                console.error("❌ เพิ่มข้อมูลไม่สำเร็จ:", error);
                alert(`เกิดข้อผิดพลาด: ${error.response?.data?.error || error.message}`);
            }
        }
    };

    const handleAddNewfloor = async (locationId, floorLevel, e) => {

        if (e) {
            e.stopPropagation();
        }

        const finalFloorLevel = formData.floor;
        if (!floorLevel) {
            alert("กรุณาระบุระดับชั้นครับ");
            return;
        }

        if (window.confirm("ยืนยันการเพิ่มชั้นนี้?")) {
            try {
                console.log("เช็คค่า locationId ก่อนส่ง:", locationId, typeof locationId);
                const payload = {
                    locationId: Number(locationId),
                    floorLevel: String(floorLevel)
                };
                await locationService.addFloorApi(payload);

                await fetchFloors();

                triggerAlert('success', 'เพิ่มชั้นสำเร็จเรียบร้อย');

            } catch (error) {
                triggerAlert('error', 'ไม่สามารถเพิ่มชั้นได้ กรุณาลองใหม่');
                alert(`เกิดข้อผิดพลาด: ${error.response?.data?.error || error.message}`);
            }
        }
    };

    const handleAddNewLocation = async (location, e) => {

        if (e) {
            e.stopPropagation();
        }

        const finalLocation = formData.location;
        if (!location) {
            alert("กรุณากรอกรายการสถานที่");
            return;
        }
        if (window.confirm("ยืนยันการเพิ่มชั้นนี้?")) {
            try {
                console.log("เช็คค่า location ก่อนส่ง:", location, typeof location);
                const payload = {
                    locationName: String(location),
                    locationStatus: 'active'
                };
                await locationService.addLocationApi(payload);

                await fetchLocations();

                triggerAlert('success', 'เพิ่มสถานสำเร็จเรียบร้อย');

            } catch (error) {
                triggerAlert('error', 'ไม่สามารถเพิ่มสถานที่ได้ กรุณาลองใหม่');
                alert(`เกิดข้อผิดพลาด: ${error.response?.data?.error || error.message}`);
            }
        }
    }

    const handleSaveStatus = async () => {
        try {
            let isUpdated = false;
            if (!formData.locationId && !formData.floorId && !formData.roomId) {
                alert("กรุณาเลือกข้อมูลที่ต้องการแก้ไขทางซ้ายมือก่อนครับ");
                return;
            }
            if (formData.room) {
                await locationService.updateRoomStatusApi({
                    roomId: Number(formData.room),
                    status: formData.roomStatus
                });
                isUpdated = true;
                triggerAlert('success', 'อัปเดตสถานะห้องสำเร็จ');

            }
            else if (formData.floor) {
                await locationService.updateFloorStatusApi({
                    floorId: Number(formData.floor),
                    status: formData.floorStatus
                });
                isUpdated = true;
                triggerAlert('success', 'อัปเดตสถานะชั้นสำเร็จ');

            }
            else if (formData.locationId) {
                await locationService.updateLocationStatusApi({
                    locationId: Number(formData.locationId),
                    status: formData.locationStatus
                });
                isUpdated = true;
                triggerAlert('success', 'อัปเดตสถานะสถานที่สำเร็จ');

            }
            console.log("จะเซฟห้อง:", formData.room, "สถานะ:", formData.roomStatus);
            console.log("จะเซฟชั้น:", formData.floor, "สถานะ:", formData.floorStatus);
            console.log("จะเซฟตึก:", formData.locationId, "สถานะ:", formData.locationStatus);
            if (isUpdated) {
                await fetchLocations();
                await fetchFloors();
                await fetchRooms();
            }
        } catch (error) {
            console.error("อัปเดตข้อมูลไม่สำเร็จ:", error);
            triggerAlert('error', 'อัปเดตข้อมูลไมสำเร็จ');
        }
    };

    const [alert, setAlert] = useState({ isOpen: false, type: '', message: '' });
    const triggerAlert = (type, message) => {
        setAlert({ isOpen: true, type, message });
    };

    return (
        <div className="location-management">
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
                                    handleAddNewLocation(newLocationName);
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
                                    handleAddNewfloor(formData.locationId, newFloorName);
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
                                    handleAddNewRoom(formData.floor, newRoomName);
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
                                    onChange={handleInputChange}
                                    value={formData.floorStatus || ""}
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
                                    onChange={handleInputChange}
                                    value={formData.roomStatus || ""}
                                >
                                    <option value="" disabled>สถานะห้อง</option>
                                    <option value="active">ใช้งาน</option>
                                    <option value="inactive">ปิดใช้งาน</option>
                                </select>
                            </div>
                        </div>
                    </form>
                    <div className="btn">
                        <button className="btn-confirm" onClick={handleSaveStatus}>
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
                </div>
            </div>
        </div>
    )
}

export default LocationManagement