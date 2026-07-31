import { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2'; // 🌟 นำเข้า SweetAlert2
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
      // 🌟 เปลี่ยน alert เป็น Swal
      Swal.fire({
        icon: 'warning',
        title: 'แจ้งเตือน',
        text: 'กรุณาเลือกไฟล์ก่อนครับ',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'ตกลง'
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setIsSubmitting(true);
    setErrorList([]);

    try {
      const response = await axios.post(url, formData);

      // รีเฟรชตารางข้อมูล
      if (refetch) {
        await refetch();
      }

      // 🌟 กรณีที่ 1: Backend ตอบกลับเป็น Status 200 แต่มี Error บางบรรทัด
      if (response.data.errors && response.data.errors.length > 0) {
        setErrorList(response.data.errors); 
        Swal.fire({
            icon: 'warning',
            title: 'นำเข้าข้อมูลสำเร็จบางส่วน',
            text: 'พบข้อผิดพลาดบางรายการ กรุณาตรวจสอบรายละเอียดบนหน้าต่างแจ้งเตือน',
            confirmButtonColor: '#f39c12',
            confirmButtonText: 'ดูข้อผิดพลาด'
        });
      } else {
        // 🌟 กรณีที่ 2: สำเร็จ 100% ไม่มี Error
        setFile(null); 
        Swal.fire({
            icon: 'success',
            title: 'อัปโหลดสำเร็จ!',
            text: response.data.message || 'นำเข้าข้อมูลครุภัณฑ์เรียบร้อยแล้ว',
            confirmButtonColor: '#28a745',
            confirmButtonText: 'ตกลง'
        });
      }

      return true;

    } catch (error) {
      console.error("Upload Error:", error);

      if (error.response && error.response.data) {
        // 🌟 กรณีที่ 3: Backend แจ้ง Error กลับมาเป็น HTTP Code (เช่น 400, 422) และแนบลิสต์มา
        if (error.response.data.errors && error.response.data.errors.length > 0) {
          setErrorList(error.response.data.errors);
          Swal.fire({
              icon: 'warning',
              title: 'พบข้อผิดพลาดในไฟล์',
              text: error.response.data.message || 'ข้อมูลบางรายการไม่ถูกต้อง',
              confirmButtonColor: '#f39c12',
              confirmButtonText: 'ดูข้อผิดพลาด'
          });
        } else {
          // 🌟 กรณีที่ 4: Error ทั่วไปจาก Backend (เช่น ไฟล์ไม่ถูกประเภท)
          Swal.fire({
              icon: 'error',
              title: 'เกิดข้อผิดพลาด',
              text: error.response.data.message || 'ไม่สามารถอัปโหลดข้อมูลได้',
              confirmButtonColor: '#d33',
              confirmButtonText: 'ตกลง'
          });
        }
      } else {
        // 🌟 กรณีที่ 5: เซิร์ฟเวอร์ล่ม หรือเน็ตเวิร์คมีปัญหา
        Swal.fire({
          icon: 'error',
          title: 'ข้อผิดพลาดเครือข่าย',
          text: 'เกิดข้อผิดพลาดในการรับส่งข้อมูลกับเซิร์ฟเวอร์',
          confirmButtonColor: '#d33',
          confirmButtonText: 'ตกลง'
        });
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