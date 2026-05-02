import { useTickets } from '../hooks/useTickets.js';
import { useSearchParams } from 'react-router-dom';
import { formatDate } from '../utils/formatDate.js';
import { getTimelineData } from '../utils/timeline.js';
import { StarRating } from '../components/StarRating.jsx';
import './DetailTicket.css'

const DetailTicket = () => {
    const { tickets } = useTickets();
    const [searchParams] = useSearchParams();
    const ticketIdFromUrl = searchParams.get('ticketId');
    const ticket = tickets?.find((t) => String(t.ticketId) === String(ticketIdFromUrl));
    const timelineData = getTimelineData(ticket, formatDate);
    return (
        <>
            <div className="container-detail">
                {ticket && (
                    <div className="detail-ticket"   >
                        <div className="header-ticket">
                            <div className="type-status-ticket">
                                <span className="ticket-type">{ticket.category.ticketCtgName}</span>
                                <span className="ticket-status">{ticket.ticketStatus}</span>
                            </div>
                            <div className="header-ticket-title">
                                <h2 >{ticket.title}</h2>
                            </div>
                            <div className="starRating">
                                <div className="star">
                                    <StarRating rating={ticket?.rating || 0} />
                                </div>
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
                            {ticket.images && ticket.images.length > 0 ? (
                                <div className="before-img-ticket">
                                    {ticket.images?.filter(img => img.imageType === 'before').length > 0 ? (
                                        ticket.images
                                            .filter(img => img.imageType === 'before')
                                            .slice(0, 3) // จำกัดไม่เกิน 3 รูป
                                            .map((img, index) => (
                                                <img
                                                    key={index}
                                                    src={img.imageUrl}
                                                    alt={`ก่อนซ่อม ${index + 1}`}
                                                    className="clickable-img"
                                                    onClick={() => window.open(img.imageUrl, '_blank')} // กดดูรูปใหญ่
                                                />
                                            ))
                                    ) : (
                                        <p className="no-image-text">ไม่มีรูปประกอบ</p>
                                    )}
                                </div>
                            ) : (
                                <div className="no-image">ไม่มีรูปภาพประกอบ</div>
                            )}
                            <div className="after-img-ticket">
                                {ticket.images?.filter(img => img.imageType === 'after').length > 0 ? (
                                    ticket.images
                                        .filter(img => img.imageType === 'after')
                                        .slice(0, 3) // จำกัดไม่เกิน 3 รูป
                                        .map((img, index) => (
                                            <img
                                                key={index}
                                                src={img.imageUrl}
                                                alt={`หลังซ่อม ${index + 1}`}
                                                className="clickable-img"
                                                onClick={() => window.open(img.imageUrl, '_blank')}
                                            />
                                        ))
                                ) : (
                                    <p className="no-image">รอแอดมินอัปโหลดหลักฐาน</p>
                                )}
                            </div>
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
                                <p className="time-text">{item.time}</p>
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