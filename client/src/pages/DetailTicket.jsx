import React, { useState } from 'react';
import { useTickets } from '../hooks/useTickets.js';
import { useSearchParams } from 'react-router-dom';
// Utils
import { formatDate } from '../utils/formatDate.js';
import { getTimelineData } from '../utils/timeline.js';
// Hooks
import { useTicketDetail } from '../hooks/useTicketDetail.js';
// Components
import { StarRating } from '../components/StarRating.jsx';
// Styles
import './pageStyles/DetailTicket.css'

const DetailTicket = () => {
    const [searchParams] = useSearchParams();
    const ticketIdFromUrl = searchParams.get('ticketId');
    const { ticket, isLoading, error } = useTicketDetail(ticketIdFromUrl);
    const [showMoreBeforeImages, setShowMoreBeforeImages] = useState(false)
    const [showMoreAfterImages, setShowMoreAfterImages] = useState(false)

    const statusLabels = {
        'pending': 'รอรับเรื่อง',
        'in_progress': 'กำลังดำเนินการ',
        'resolved': 'เสร็จสิ้น'
    };
    if (isLoading) return <div>กำลังโหลด...</div>;
    if (error) return <div>❌ {error}</div>;
    if (!ticket) return <div>ไม่พบข้อมูล</div>;

    const beforeImages = ticket?.images?.filter(img => img.imageType === 'before') || [];
    const afterImages = ticket?.images?.filter(img => img.imageType === 'after') || [];
    const timelineData = getTimelineData(ticket, formatDate);
    return (
        <>
            <div className="container-detail">
                {ticket && (
                    <div className="detail-ticket"   >
                        <div className="header-ticket">
                            <div className="type-status-ticket">
                                <span className="ticket-type">{ticket.category.ticketCtgName}</span>
                                <span className={`ticketStatus ${ticket.ticketStatus}`}>{statusLabels[ticket.ticketStatus]}</span>
                            </div>
                            <div className="header-ticket-title">
                                <h2 >{ticket.title}</h2>
                            </div>
                            <div className="starRating">
                                {ticket?.rating > 0 ? (
                                    <div className="star">
                                        <StarRating rating={ticket?.rating || 0} />
                                    </div>
                                ) : (
                                    <p className="no-rating"></p>
                                )
                                }
                                <p>{formatDate(ticket.createdAt)}</p>
                            </div>
                            <div className="location">
                                <div className="building">
                                    <p>สถานที่ : {ticket.location.locationName}</p>
                                </div>
                                <div className="floor">
                                    <p>
                                        {/* if ticket.floor doesn't exists return '-' */}
                                        ชั้น : {ticket.floor?.floorLevel || '-'}
                                    </p>
                                    <span>
                                        {/* if ticket.room doesn't exists return '-' */}
                                        ห้อง : {ticket.room?.roomName || '-'}
                                    </span>
                                </div>
                                <div className="ticket-description">
                                    <p>รายละเอียด : {ticket.description}</p>
                                </div>
                            </div>
                        </div>
                        <div className="ticket-img">
                            {/* ---------------- รูปก่อนแจ้ง ---------------- */}
                            {ticket.images && ticket.images.length > 0 ? (
                                <div className="before-img-ticket">
                                    {beforeImages.length > 0 ? (
                                        <>
                                            <div className="img-group">
                                                {beforeImages.slice(0, 1).map((img, index) => (
                                                    <img
                                                        key={index}
                                                        src={img.imageUrl}
                                                        alt={`ก่อนซ่อม ${index + 1}`}
                                                        className="clickable-img"
                                                        // ถ้ารูปเดียวเปิดแท็บใหม่ ถ้ารูปเยอะเปิด Modal
                                                        onClick={() => beforeImages.length === 1 ? window.open(img.imageUrl, '_blank') : setShowMoreBeforeImages(true)}
                                                    />
                                                ))}
                                            </div>
                                            {/* ปุ่มดูรูปเพิ่มเติม */}
                                            {beforeImages.length > 1 && (
                                                <p
                                                    className="see-more-text"
                                                    onClick={() => setShowMoreBeforeImages(true)}
                                                    style={{ cursor: 'pointer', color: '#007bff', fontSize: '14px', marginTop: '8px', fontWeight: 'bold' }}
                                                >
                                                </p>
                                            )}
                                        </>
                                    ) : (
                                        <p className="no-image-text">ไม่มีรูปประกอบ</p>
                                    )}
                                </div>
                            ) : (
                                <div className="no-image">ไม่มีรูปภาพประกอบ</div>
                            )}

                            {/* ---------------- รูปหลังแจ้ง ---------------- */}
                            <div className="after-img-ticket">
                                {afterImages.length > 0 ? (
                                    <>
                                        <div className="img-group">
                                            {afterImages.slice(0, 1).map((img, index) => (
                                                <img
                                                    key={index}
                                                    src={img.imageUrl}
                                                    alt={`หลังซ่อม ${index + 1}`}
                                                    className="clickable-img"
                                                    // ถ้ารูปเดียวเปิดแท็บใหม่ ถ้ารูปเยอะเปิด Modal
                                                    onClick={() => afterImages.length === 1 ? window.open(img.imageUrl, '_blank') : setShowMoreAfterImages(true)}
                                                />
                                            ))}
                                        </div>
                                        {/* ปุ่มดูรูปเพิ่มเติม */}
                                        {afterImages.length > 1 && (
                                            <p
                                                className="see-more-text"
                                                onClick={() => setShowMoreAfterImages(true)}
                                                style={{ cursor: 'pointer', color: '#007bff', fontSize: '14px', marginTop: '8px', fontWeight: 'bold' }}
                                            ></p>
                                        )}
                                    </>
                                ) : (
                                    <p className="no-image">รอแอดมินอัปโหลดหลักฐาน</p>
                                )}
                            </div>

                            {/* ---------------- Popup Modal ก่อนแจ้ง ---------------- */}
                            {showMoreBeforeImages && (
                                <div className="modal-backdrop" onClick={() => setShowMoreBeforeImages(false)}>
                                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                                        <h4>รูปก่อนแจ้งทั้งหมด</h4>
                                        <div className="gallery">
                                            {beforeImages.map((img, i) => (
                                                // แก้จาก img.url เป็น img.imageUrl ให้ตรงกับฐานข้อมูล
                                                <img key={i} src={img.imageUrl} alt={`before-${i}`} style={{ width: '100%', marginBottom: '10px' }} />
                                            ))}
                                        </div>
                                        <button onClick={() => setShowMoreBeforeImages(false)}>ปิด</button>
                                    </div>
                                </div>
                            )}

                            {/* ---------------- Popup Modal หลังแจ้ง ---------------- */}
                            {showMoreAfterImages && (
                                <div className="modal-backdrop" onClick={() => setShowMoreAfterImages(false)}>
                                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                                        <h4>รูปหลังแจ้งทั้งหมด</h4>
                                        <div className="gallery">
                                            {afterImages.map((img, i) => (
                                                // แก้จาก img.url เป็น img.imageUrl เช่นกัน
                                                <img key={i} src={img.imageUrl} alt={`after-${i}`} style={{ width: '100%', marginBottom: '10px' }} />
                                            ))}
                                        </div>
                                        <button onClick={() => setShowMoreAfterImages(false)}>ปิด</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="roadmap-working">
                {ticket && (
                    <div className="main-comment">
                        <div className="comment">
                            {ticket.comment && (
                                <p>ความคิดเห็น : {ticket.comment}</p>
                            )}
                            {ticket.admin && (
                                <p>ผู้ดำเนินการ : {ticket.admin}</p>
                            )}
                            {ticket.adminNote && (
                                <p>ความคิดเห็นผู้ดูแลระบบ : {ticket.adminNote}</p>
                            )}
                        </div>
                    </div>
                )}
                <div className="timeline-container">
                    {timelineData.map((item, index) => (
                        <div key={index} className="timeline-item">
                            <div className="timeline-content-left">
                                <p className="status-text">{item.status}</p>
                                <p className="date-text">{item.date}</p>
                            </div>
                            <div className="timeline-middle">
                                <div className={`dot ${item.color}`}></div>
                                {index !== timelineData.length - 1 && <div className="line"></div>}
                            </div>
                            <div className="timeline-content-right">
                                {item.duration && <p>{item.duration}</p>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>

    )
}

export default DetailTicket