// hooks/useEquipmentValidation.js
import { useState, useEffect } from 'react';

export const useEquipmentValidation = (
  isEquipmentCategory,
  equipmentCode,
  roomId,
  equipments
) => {
  const [equipmentValidation, setEquipmentValidation] = useState({ 
    status: null, 
    message: '' 
  });
  const [debouncedCode, setDebouncedCode] = useState('');

  // Debounce equipment code
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCode(equipmentCode);
    }, 500);
    return () => clearTimeout(timer);
  }, [equipmentCode]);

  // Validate equipment
  useEffect(() => {
    if (!isEquipmentCategory || !debouncedCode) {
      setEquipmentValidation({ status: null, message: '' });
      return;
    }
    if (!roomId) {
      setEquipmentValidation({ 
        status: 'error', 
        message: 'กรุณาเลือกห้องก่อนระบุรหัสครุภัณฑ์' 
      });
      return;
    }
    // Checl if equipment status is not 'active'
    const equipmentInRoom = equipments.filter(eq => eq.roomId === parseInt(roomId, 10));
    const inactiveEquipment = equipmentInRoom.find(eq => eq.equipmentCode === debouncedCode && eq.equipmentStatus !== 'active');
    if (inactiveEquipment) {
      setEquipmentValidation({ 
        status: 'error', 
        message: 'ครุภัณฑ์ไม่พร้อมใช้งาน หรืออยู่ระหว่างซ่อม' 
      });
      return;
    }

    const found = equipments.find(
      eq => eq.roomId === parseInt(roomId, 10) && 
            eq.equipmentCode === debouncedCode
    );

    if (found) {
      setEquipmentValidation({ 
        status: 'success', 
        message: `พบข้อมูล: ${found.equipmentName}` 
      });
    } else {
      setEquipmentValidation({ 
        status: 'error', 
        message: 'ไม่พบรหัสครุภัณฑ์นี้ในห้องที่เลือก' 
      });
    }
  }, [debouncedCode, roomId, equipments, isEquipmentCategory]);

  return { equipmentValidation };
};