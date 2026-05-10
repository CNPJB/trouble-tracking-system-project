import React from 'react';
import './SimilarTickets.css';
import { FaThumbsUp } from 'react-icons/fa';

const SimilarTickets = ({ tickets, onUpvote, currentUserId }) => {
    return (
        <div className="suggestion-section">
            <h3>โปรดตรวจสอบว่าปัญหาที่คุณแจ้งคล้ายคลึงกับผู้อื่นหรือไม่</h3>

            <div className="ticket-list">
                {tickets.length > 0 ? (
                    tickets.map(ticket => (
                        <div key={ticket.ticketId} className="ticket-card">
                            <div className="ticket-image-container">
                                {ticket.images[0]?.imageUrl && (
                                    <img src={ticket.images[0].imageUrl} alt="ปัญหา" className="ticket-image" />
                                )}
                                {/* ถ้าไม่มีรูป (ไม่มี imageUrl) มันจะโชว์ลายตารางหมากรุกจาก CSS อัตโนมัติ */}
                            </div>
                            <div className="ticket-content">
                                <div className="ticket-info">
                                    <h4>{ticket.title}</h4>
                                    <p>สถานที่: {ticket.location?.locationName || '-'}</p>
                                    <p>ชั้น: {ticket.floor?.floorLevel || '-'}</p>
                                    <p>ห้อง: {ticket.room?.roomName || '-'}</p>

                                    {ticket.equipment?.equipmentCode && (
                                        <p>รหัสครุภัณฑ์: {ticket.equipment.equipmentCode}</p>
                                    )}
                                    <span className="status-badge pending">สถานะ: รอรับเรื่อง</span>
                                </div>
                            </div>

                            <div className="ticket-action">
                                <button
                                    className="btn-upvote"
                                    onClick={() => onUpvote(ticket.ticketId)}
                                    disabled={ticket.userId === currentUserId}
                                >
                                    <FaThumbsUp className="nav-icon" />
                                    Vote ({ticket.upvotes?.length || 0}) 
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="no-suggestion">ยังไม่มีปัญหาที่ใกล้เคียงในระบบ</p>
                )}
            </div>
        </div>
    );
};

export default SimilarTickets;