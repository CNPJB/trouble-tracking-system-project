import { useState } from 'react';
import axios from 'axios';

export const useImportEquipments = (url) => {
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
      window.location.reload();
      alert(response.data.message);
      setFile(null); 
      return true;
    } catch (error) {
      console.error(error);
      if (error.response && error.response.data.errors) {
        setErrorList(error.response.data.errors);
      } else {
        alert("เกิดข้อผิดพลาดในการอัปโหลด");
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
    handleFileChange,
    uploadFile
  };
};