import React, { useState, useRef } from 'react';
//Components
import ImageUploader from '../ImageUploader.jsx';
import { FaPlay, FaCheck, FaTimes, FaLock, FaUpload, FaInfoCircle } from 'react-icons/fa';
//Styles
import './TicketActionPanel.css';
//Custom Hooks
import { useImageUpload } from '../../hooks/useImageUpload.js';
import { useLoadingState } from '../../hooks/useLoadingState.js';

export const TicketActionPanel = ({ ticket, onUpdateStatus, isLoading }) => {
    // Local State สำหรับเก็บค่าฟอร์มก่อนส่ง
    const [adminNote, setAdminNote] = useState('');

    // State สำหรับโชว์ช่องกรอกเหตุผลกรณีตั้งใจจะกด "ปฏิเสธ" ตั้งแต่ตอน pending
    const [isRejectMode, setIsRejectMode] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const {
        selectedImages,
        fileInputRef,
        handleImageChange,
        removeImage
    } = useImageUpload(3, (msg) => setErrorMsg(msg));

    // เช็คสถานะปัจจุบันจากฐานข้อมูล[cite: 25]
    const isPending = ticket?.ticketStatus === 'pending';
    const isInProgress = ticket?.ticketStatus === 'in_progress';
    const isClosed = ['resolved', 'rejected', 'duplicate', 'canceled'].includes(ticket?.ticketStatus);

    // ==========================================
    // Action Handlers
    // ==========================================

    // 1. รับเรื่อง (Pending -> In Progress)
    const handleAccept = () => {
        onUpdateStatus({ ticketStatus: 'in_progress' });
    };

    // 2. ปิดงาน (In Progress -> Resolved)
    const handleResolve = () => {
        const rawFiles = selectedImages.map(img => img.file);

        onUpdateStatus({
            ticketStatus: 'resolved',
            adminNote: adminNote,
            images: rawFiles
        });
    };

    // 3. ปฏิเสธ (Pending / In Progress -> Rejected)
    const handleReject = () => {
        if (!isRejectMode && isPending) {
            // ถ้าอยู่หน้า pending แล้วกดปุ่มปฏิเสธครั้งแรก ให้เปิดโหมดกรอกเหตุผลก่อน
            setIsRejectMode(true);
            return;
        }

        if (!adminNote.trim()) {
            setErrorMsg('กรุณาระบุเหตุผลการปฏิเสธให้ผู้แจ้งทราบด้วยครับ');
            return;
        }
        setErrorMsg('');
        onUpdateStatus({
            ticketStatus: 'rejected',
            adminNote: adminNote
        });
    };

    return (
        <div className="action-panel-container">

            {/* กรณีตั๋วถูกปิดไปแล้ว (Read-only) */}
            {isClosed && (
                <div className="panel-section closed-state">
                    <div className="lock-icon-wrapper">
                        <FaLock />
                    </div>
                    <h4>รายการนี้ถูกปิดการแก้ไขแล้ว</h4>
                    <p className="closed-info">
                        <strong>สถานะ:</strong> {ticket.ticketStatus.toUpperCase()} <br />
                        <strong>ผู้ดำเนินการ:</strong> {ticket.admin?.fullName || 'ระบบอัตโนมัติ'}
                    </p>
                    {ticket.adminNote && (
                        <div className="admin-note-display">
                            <strong>บันทึกจากผู้ดูแล:</strong>
                            <p>{ticket.adminNote}</p>
                        </div>
                    )}
                </div>
            )}

            {/* กรณีตั๋วรอรับเรื่อง (Pending) */}
            {isPending && (
                <div className="panel-section">
                    <div className="status-indicator warning">
                        <FaInfoCircle /> รอแอดมินรับเรื่องดำเนินการ
                    </div>

                    {!isRejectMode ? (
                        <div className="button-group-vertical">
                            <button
                                className="btn-action primary"
                                onClick={handleAccept}
                                disabled={isLoading}
                            >
                                <FaPlay /> รับเรื่องดำเนินการ (In Progress)
                            </button>
                            <button
                                className="btn-action danger-outline"
                                onClick={handleReject}
                                disabled={isLoading}
                            >
                                <FaTimes /> ปฏิเสธรายการนี้ (Reject)
                            </button>
                        </div>
                    ) : (
                        // โหมดกรอกเหตุผลปฏิเสธ
                        <div className="reject-mode-box">
                            <label>เหตุผลที่ปฏิเสธ <span className="req">*</span></label>
                            <textarea
                                value={adminNote}
                                onChange={(e) => setAdminNote(e.target.value)}
                                placeholder="เช่น แจ้งซ้ำซ้อน, ไม่ใช่งานของแผนก..."
                                rows="3"
                            />
                            {errorMsg && <p className="error-text">{errorMsg}</p>}
                            <div className="button-group-horizontal">
                                <button className="btn-action danger" onClick={handleReject} disabled={isLoading}>
                                    ยืนยันการปฏิเสธ
                                </button>
                                <button className="btn-action secondary" onClick={() => { setIsRejectMode(false); setErrorMsg(''); }} disabled={isLoading}>
                                    ยกเลิก
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* กรณีตั๋วกำลังดำเนินการ (In Progress) */}
            {isInProgress && (
                <div className="panel-section">
                    <div className="status-indicator processing">
                        <FaPlay /> กำลังดำเนินการแก้ไข
                    </div>

                    <div className="input-group">
                        <label>บันทึกการแก้ไข / เหตุผล (Admin Note)</label>
                        <textarea
                            value={adminNote}
                            onChange={(e) => setAdminNote(e.target.value)}
                            placeholder="ระบุรายละเอียด หรือสาเหตุที่ปัญหาไม่สามารถดำเนินการได้..."
                            rows="4"
                        />
                    </div>
                    
                    <ImageUploader 
                        selectedImages={selectedImages}
                        fileInputRef={fileInputRef}
                        onImageChange={handleImageChange}
                        onRemoveImage={removeImage}
                        maxImages={3}
                    />

                    {errorMsg && <p className="error-text">{errorMsg}</p>}

                    <div className="button-group-vertical mt-4">
                        <button
                            className="btn-action success"
                            onClick={handleResolve}
                            disabled={isLoading}
                        >
                            <FaCheck /> บันทึกและปิดงาน (Resolve)
                        </button>
                        <button
                            className="btn-action danger-outline"
                            onClick={handleReject}
                            disabled={isLoading}
                        >
                            <FaTimes /> ยกเลิก/ปฏิเสธงานซ่อม (Reject)
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
};