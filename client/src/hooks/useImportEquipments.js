import { useState } from 'react';
import axios from 'axios';
// hooks
import { useEquipment } from '../hooks/useEquipment'
import { useLoadingState } from '../hooks/useLoadingState'

export const useImportEquipments = (url) => {
  const { loading, reset } = useLoadingState();
  const { refetch } = useEquipment();
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorList, setErrorList] = useState([]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setErrorList([]);
  };

  const uploadFile = async () => {
    if (!file) {
      alert("กรุณาเลือกไฟล์ก่อนครับ");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setIsSubmitting(true);
    setErrorList([]);

    try {
      const response = await axios.post(url, formData);

      if (refetch) {
        await refetch();
      }
      if (response.data.errors && response.data.errors.length > 0) {
        setErrorList(response.data.errors); // เอาไปโชว์ในเว็บให้ผู้ใช้ดูว่าพังบรรทัดไหน
      } else {
        setFile(null); // ถ้าไม่มี Error เลย ค่อยล้างไฟล์ทิ้ง
      }

      return true;

    } catch (error) {
      console.error("Upload Error:", error);

      if (error.response && error.response.data) {
        if (error.response.data.errors) {
          setErrorList(error.response.data.errors);
        } else if (error.response.data.message) {
          alert(error.response.data.message);
        }
      } else {
        alert("เกิดข้อผิดพลาดในการรับส่งข้อมูลกับเซิร์ฟเวอร์");
      }

      return false;

    } finally {
      setIsSubmitting(false);
    }
  };
  return {
    file,
    setFile,
    isSubmitting,
    errorList,
    setErrorList,
    handleFileChange,
    uploadFile,
    loading, 
    reset  
  };
};