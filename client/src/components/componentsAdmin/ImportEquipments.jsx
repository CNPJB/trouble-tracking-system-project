import React, { useRef,useState } from 'react';
import './ImportEquipments.css'; // นำเข้าไฟล์ CSS ที่สร้างไว้
// hook
import { useImportEquipments } from '../../hooks/useImportEquipments.js';
import { useLoadingState } from '../../hooks/useLoadingState';
// component
import  { ToastAlert } from '../../components/LoadingSpinner';
import { ConfirmButton } from '../../components/ConfirmButton';

export const ImportEquipments = () => {
    const fileInputRef = useRef(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const {
        file,
        setFile,
        isSubmitting,
        errorList,
        setErrorList,
        handleFileChange,
        uploadFile,
        loading,
        reset
    } = useImportEquipments('/api/manage/uploadEquipments');

    const handleButtonClick = () => {
        fileInputRef.current.click();
    };

    const handleRemoveFile = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="import-container">
            <input
                type="file"
                name="file"
                ref={fileInputRef}
                className="hidden-input" // ซ่อนด้วย CSS (display: none ในไฟล์ css)
                style={{ display: 'none' }}
                accept=".xlsx, .xls"
                onChange={handleFileChange}
            />

            {!file ? (
                <button
                    type="button"
                    className="btn-import-custom"
                    onClick={handleButtonClick}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'กำลังนำเข้า...' : 'นำเข้า'}
                </button>
            ) : (
                <div className="file-display-badge">
                    <span className="file-name-text">📄 {file.name}</span>
                    <button
                        type="button"
                        className="btn-remove-file"
                        onClick={handleRemoveFile}
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* ปุ่มกดยืนยันอัปโหลด (ถ้าเลือกไฟล์แล้ว) */}
           {file && !isSubmitting && (
                <button 
                    className='confirm-upload-file' 
                    type="button" 
                    // 🌟 เปลี่ยนจากการเรียก uploadFile ทันที เป็นการสั่งเปิดหน้าต่าง Confirm ก่อน
                    onClick={() => setIsConfirmOpen(true)} 
                >
                    คลิกเพื่อเริ่มส่งไฟล์
                </button>
            )}

            {/* =====================================
                🌟 นำ ConfirmButton มาใช้สำหรับยืนยันการอัปโหลด 
            ===================================== */}
            {file && (
                <ConfirmButton
                    isOpen={isConfirmOpen}
                    title="ยืนยันการนำเข้าข้อมูล"
                    message={`คุณแน่ใจหรือไม่ว่าต้องการนำเข้าข้อมูลจากไฟล์ "${file.name}" ?`}
                    onConfirm={() => {
                        setIsConfirmOpen(false);
                        uploadFile(); 
                    }}
                    
                    onCancel={() => setIsConfirmOpen(false)}        
                    confirmText="ยืนยัน"
                    cancelText="ยกเลิก"
                />
            )}

            {/* {errorList.length > 0 && (
                <div className="custom-modal-overlay">
                    <div className="custom-modal-content">
                        
                        <div className="modal-header">
                            <h3 style={{ margin: 0, color: '#d32f2f' }}>⚠️ นำเข้าข้อมูลไม่สำเร็จบางส่วน</h3>
                        </div>
                        
                        <div className="modal-body">
                            <p>พบข้อผิดพลาดในไฟล์ดังนี้:</p>
                            <ul className="error-popup-list">
                                {errorList.map((err, index) => (
                                    <li key={index}>{err}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="modal-footer">
                            <button 
                                className="btn-close-modal" 
                                onClick={() => setErrorList([])} // 🌟 พอกดปุ่มนี้ เคลียร์ค่าทิ้ง ป๊อปอัพจะปิดทันที
                            >
                                ปิดหน้าต่าง
                            </button>
                        </div>
                        
                    </div>
                </div>
            )} */}
        </div>
    );
};