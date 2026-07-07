import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// Custom Hooks
import { useLoadingState } from '../../hooks/useLoadingState.js';
import { useTicketDetail } from '../../hooks/useTicketDetail.js';
// Services
import { ticketService } from '../../services/ticketService.js';
// Components
import { ConfirmButton } from '../../components/ConfirmButton.jsx';
import { TicketActionPanel } from '../../components/componentsAdmin/TicketActionPanel.jsx';
import { LoadingSpinner, ToastAlert } from '../../components/LoadingSpinner.jsx';
import { FaArrowLeft, FaMapMarkerAlt, FaUser, FaClock, FaBox, FaLayerGroup } from 'react-icons/fa';

// Styles
import './IssueManagementDetail.css';

const IssueManagementDetail = () => {
    const { ticketId } = useParams();
    const navigate = useNavigate();
    const {
        ticket,
        isLoading: isFetching,
        error: fetchError,
        refetch
    } = useTicketDetail(ticketId);
    const { loading, startLoading, setSuccess, setError, reset } = useLoadingState();
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        payload: null
    });

    const handleUpdateStatus = async (payload) => {
        setConfirmModal({ isOpen: true, payload });
    };

    const submitUpdateStatus = async () => {
        if (!confirmModal.payload) return;
        startLoading();
        
        try {
            const result = await ticketService.updateTicketStatusAdmin(ticket.ticketId, confirmModal.payload);
            
            if (result.success) {
                setSuccess(result.message); 
                setConfirmModal({ isOpen: false, payload: null });
                refetch();
            }
        } catch (error) {
            console.error("Update Status Error:", error);
            setError(error.response?.data?.message || "เกิดข้อผิดพลาดในการอัปเดตสถานะปัญหา", "error");
            setConfirmModal({ isOpen: false, payload: null });
        }
    };

    const getModalContent = () => {
        const status = confirmModal.payload?.ticketStatus;
        switch (status) {
            case 'in_progress':
                return {
                    title: "ยืนยันการรับเรื่อง",
                    message: "คุณแน่ใจหรือไม่ว่าต้องการ 'รับเรื่อง' เพื่อดำเนินการปัญหานี้? (ระบบจะเริ่มจับเวลา SLA)",
                    confirmText: "รับเรื่องดำเนินการ"
                };
            case 'resolved':
                return {
                    title: "ยืนยันการบันทึกและปิดงาน",
                    message: "คุณแน่ใจหรือไม่ว่าต้องการ 'ปิดงานซ่อมนี้'? (ระบบจะอัปเดตสถานะครุภัณฑ์และส่งแจ้งเตือนไปยังผู้แจ้ง)",
                    confirmText: "บันทึกและปิดงาน"
                };
            case 'rejected':
                return {
                    title: "ยืนยันการปฏิเสธรายการ",
                    message: `คุณแน่ใจหรือไม่ว่าต้องการ 'ปฏิเสธ' รายการนี้ด้วยเหตุผล: "${confirmModal.payload?.adminNote}" ?`,
                    confirmText: "ยืนยันการปฏิเสธ"
                };
            default:
                return { title: "ยืนยัน", message: "คุณแน่ใจหรือไม่?", confirmText: "ยืนยัน" };
        }
    };
    const modalContent = getModalContent();

    // if (isFetching) {
    //     return <LoadingSpinner isLoading={true} message="กำลังโหลดรายละเอียดปัญหา..." />;
    // }

    // จัดการ State กรณีหาตั๋วไม่เจอ หรือ Error
    if (fetchError || !ticket) {
        return (
            <div className="issue-detail-container" style={{ textAlign: 'center', padding: '50px' }}>
                <h2>เกิดข้อผิดพลาด</h2>
                <p style={{ color: '#ef4444' }}>{fetchError || "ไม่พบข้อมูลปัญหา"}</p>
                <button className="btn-back" onClick={() => navigate(-1)} style={{ margin: '20px auto' }}>
                    <FaArrowLeft /> ย้อนกลับ
                </button>
            </div>
        );
    }

    return (
        <div className="issue-detail-container">
            <ToastAlert error={loading.error} onDismiss={reset} />

            {/* ส่วนหัว: ปุ่มย้อนกลับ และ รหัสตั๋ว */}
            <div className="detail-header">
                <button className="btn-back" onClick={() => navigate(-1)}>
                    <FaArrowLeft /> ย้อนกลับ
                </button>
                <div className="title-area">
                    <h1>รหัสปัญหา: {ticket.ticketId}</h1>
                    <span className={`status-badge status-${ticket.ticketStatus}`}>
                        {ticket.ticketStatus}
                    </span>
                </div>
            </div>

            {/* Layout แบ่ง 2 ฝั่ง */}
            <div className="detail-layout">

                {/* ฝั่งซ้าย: ข้อมูลรายละเอียด */}
                <div className="detail-left-panel">
                    <div className="info-card-detail">
                        <h2>{ticket.title}</h2>
                        <p className="ticket-desc">{ticket.description}</p>

                        {/* แสดงรูปภาพ ถ้าไม่มีให้แสดงข้อความ */}
                        {ticket.images && ticket.images.length > 0 && (
                            <div className="image-gallery">
                                {ticket.images.map((img, idx) => (
                                    <img key={idx} src={img.imageUrl} alt={`ticket-${idx}`} className="ticket-img-admin" />
                                ))}
                            </div>
                        )}
                        {!ticket.images || ticket.images.length === 0 && (
                            <div className="frame-no-images">ไม่มีรูปภาพ</div>
                        )}

                        <hr className="divider" />

                        {/* ข้อมูล Metadata */}
                        <div className="meta-grid">
                            <div className="meta-item">
                                <FaMapMarkerAlt className="meta-icon" />
                                <div>
                                    <span className="meta-label">สถานที่</span>
                                    <span className="meta-value">
                                        {ticket.location?.locationName}
                                        {ticket.floor && ` > ชั้น ${ticket.floor.floorLevel}`}
                                        {ticket.room && ` > ห้อง ${ticket.room.roomName}`}
                                    </span>
                                </div>
                            </div>
                            <div className="meta-item">
                                <FaBox className="meta-icon" />
                                <div>
                                    <span className="meta-label">หมวดหมู่ / ครุภัณฑ์</span>
                                    <span className="meta-value">
                                        {ticket.category?.ticketCtgName}
                                        {ticket.equipment && ` (${ticket.equipment.equipmentCode})`}
                                    </span>
                                </div>
                            </div>
                            <div className="meta-item">
                                <FaUser className="meta-icon" />
                                <div>
                                    <span className="meta-label">ผู้แจ้ง</span>
                                    <span className="meta-value">{ticket.user?.fullName}</span>
                                </div>
                            </div>
                            <div className="meta-item">
                                <FaClock className="meta-icon" />
                                <div>
                                    <span className="meta-label">เวลาที่แจ้ง</span>
                                    <span className="meta-value">{new Date(ticket.createdAt).toLocaleString('th-TH')}</span>
                                </div>
                            </div>
                        </div>

                        {ticket.subTickets && ticket.subTickets.length > 0 && (
                            <div className="sub-tickets-section">
                                <h3><FaLayerGroup /> รายการปัญหาที่ถูกรวม ({ticket._count?.subTickets || ticket.subTickets.length} รายการ)</h3>
                                <div className="sub-tickets-list">
                                    {ticket.subTickets.map((sub, index) => (
                                        <div key={sub.ticketId} className="sub-ticket-card">
                                            <div className="sub-ticket-header">
                                                <span className="sub-ticket-id">{sub.ticketId}</span>
                                                <span className="sub-ticket-date">
                                                    {new Date(sub.createdAt).toLocaleString('th-TH', {
                                                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                                                    })} น.
                                                </span>
                                            </div>
                                            <h4 className="sub-ticket-title">{sub.title}</h4>
                                            <p className="sub-ticket-desc">{sub.description}</p>
                                            <div className="sub-ticket-footer">
                                                <FaUser className="meta-icon-small" /> ผู้แจ้ง: {sub.user?.fullName || 'ไม่ระบุ'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ฝั่งขวา: แผงควบคุมสถานะ (State Machine) */}
                <div className="detail-right-panel">
                    <div className="action-card">
                        <h3>อัปเดตสถานะ (Action)</h3>
                        <TicketActionPanel
                            ticket={ticket}
                            onUpdateStatus={handleUpdateStatus}
                            isLoading={loading.isLoading}
                        />
                    </div>
                </div>
            </div>
            <ConfirmButton
                isOpen={confirmModal.isOpen}
                title={modalContent.title}
                message={modalContent.message}
                onConfirm={submitUpdateStatus}
                onCancel={() => setConfirmModal({ isOpen: false, payload: null })}
                confirmText={loading.isLoading ? "กำลังประมวลผล..." : modalContent.confirmText}
                cancelText="ยกเลิก"
                isLoading={loading.isLoading}
            />
        </div>
    );
};

export default IssueManagementDetail;