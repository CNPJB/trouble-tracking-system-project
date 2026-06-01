import React, { useRef } from 'react';
import './ImportEquipments.css'; // นำเข้าไฟล์ CSS ที่สร้างไว้
import { useImportEquipments } from '../../hooks/useImportEquipments.js';

export const ImportEquipments = () => {
    const fileInputRef = useRef(null);
    const {
        file,
        setFile,
        isSubmitting,
        errorList,
        handleFileChange,
        uploadFile
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
                <button className='confirm-upload-file' type="button" onClick={uploadFile} >
                    คลิกเพื่อเริ่มส่งไฟล์
                </button>
            )}

            {errorList.length > 0 && (
                <ul className="error-list">
                    {errorList.map((err, index) => (
                        <li key={index} className="error-item">⚠️ {err}</li>
                    ))}
                </ul>
            )}
        </div>
    );
};