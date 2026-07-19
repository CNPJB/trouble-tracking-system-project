// hooks/useEquipmentValidation.js
import { useState, useEffect } from 'react';

const normalizeEquipmentCode = (value) => value?.toString().trim().toUpperCase();

export const useEquipmentValidation = (
  isEquipmentCategory,
  equipmentCode,
  equipments
) => {
  const [equipmentValidation, setEquipmentValidation] = useState({
    status: null,
    message: '',
    equipmentId: null,
    equipmentName: '',
    roomId: null
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
    if (!isEquipmentCategory) {
      setEquipmentValidation({ status: null, message: '', equipmentId: null, equipmentName: '' });
      return;
    }

    if (!debouncedCode?.trim()) {
      setEquipmentValidation({ status: null, message: '', equipmentId: null, equipmentName: '' });
      return;
    }

    const normalizedCode = normalizeEquipmentCode(debouncedCode);
    const matchingEquipment = (equipments || []).find(
      eq => normalizeEquipmentCode(eq.equipmentCode) === normalizedCode
    );

    if (!matchingEquipment) {
      setEquipmentValidation({
        status: 'not_found',
        message: 'ไม่พบรหัสครุภัณฑ์ในระบบ',
        equipmentId: null,
        equipmentName: '',
        roomId: null
      });
      return;
    }

    if (matchingEquipment.equipmentStatus !== 'active') {
      setEquipmentValidation({
        status: 'inactive',
        message: 'ครุภัณฑ์ไม่พร้อมใช้งาน หรืออยู่ระหว่างซ่อม',
        equipmentId: null,
        equipmentName: '',
        roomId: null
      });
      return;
    }

    setEquipmentValidation({
      status: 'success',
      message: `พบข้อมูล: ${matchingEquipment.equipmentName}`,
      equipmentId: matchingEquipment.equipmentId,
      equipmentName: matchingEquipment.equipmentName,
      roomId: matchingEquipment.roomId
    });
  }, [debouncedCode, equipments, isEquipmentCategory]);

  return { equipmentValidation };
};