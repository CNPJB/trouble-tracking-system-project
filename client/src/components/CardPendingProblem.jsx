// Styles
import './componentsStyles/CardPendingProblem.css';
import { useNavigate } from 'react-router-dom';
import { formatDate, formatDateTime } from '../utils/formatDate';
import { FaLayerGroup } from 'react-icons/fa'


export const CardPendingProblem = ({
    data,
    isReadOnly = false,
    isMergeMode,
    isSelected,
    onSelect,
    handleClick,
    actionSlot,
    showSubTicketBadge = false
}) => {

    const navigate = useNavigate();
    const statusLabels = {
        'pending': 'รอรับเรื่อง',
        'in_progress': 'กำลังดำเนินการ',
        'resolved': 'เสร็จสิ้น',
        'duplicate': 'ถูกรวม',
        'rejected': 'ปฏิเสธ',
        'canceled': 'ยกเลิก'
    };

    const handleCardClick = (e) => {
        if (isMergeMode) {
            if (onSelect) onSelect();
            return;
        }
        if (isReadOnly) {
            return;
        }
        if (handleClick) {
            handleClick(e);
        } else {
            navigate(`/ticketDetail?ticketId=${data.ticketId}`);
        }
    };
    return (
        <div className={`container-pending-card ${isSelected ? 'selected-card' : ''}`}
            onClick={handleCardClick}
            style={{ position: 'relative' }}>
            {showSubTicketBadge && data._count?.subTickets > 0 && (
                <div>
                    <span className="merged-badge" title="ตั๋วนี้ถูกรวมปัญหาที่คล้ายกันมาแล้ว">
                        <FaLayerGroup /> Sub {data._count.subTickets}
                    </span>
                </div>
            )}
            {isMergeMode && (
                <div className="card-checkbox-wrapper"
                    onClick={(e) => e.stopPropagation()}>
                    <input
                        type="checkbox"
                        className="large-checkbox"
                        checked={isSelected}
                        onChange={onSelect}
                    />
                </div>
            )}

            {/* ถ้าส่ง actionSlot มา ก็เรนเดอร์ลงมุมขวาบนเลย */}
            {actionSlot && (
                <div className="action-badge-container" >
                    {actionSlot}
                </div>
            )}

            <div className="header-card">
                <div className="img">
                    {data.images && data.images.length > 0 ? (
                        <img src={data.images[0].imageUrl} alt="" />
                    ) : (
                        <div className="no-image">ไม่มีรูปภาพประกอบ</div>
                    )}
                </div>
                <div className="title-card" key={data.id}>
                    <p style={{ color: 'gray' }}>{data.ticketId}</p>
                    <h3>{data.title}</h3>
                    <p><b>แจ้ง:</b> {formatDateTime(data.createdAt)}</p>
                    <div className={`ticketStatus ${data.ticketStatus}`}>
                        {statusLabels[data.ticketStatus] || data.ticketStatus}
                    </div>
                    <p className='location'>{data.location.locationName}</p>
                    <div className="floor-room">
                        <span><b>ชั้น:</b> {data.floor?.floorLevel || '-'}</span>
                        <span><b>ห้อง:</b> {data.room?.roomName || '-'}</span>
                    </div>
                </div>
            </div>
            <div className="description">
                <p>{data.description}</p>
                <p><b>ผู้ดำเนินการ:</b> {data.admin?.fullName || '-'}</p>
            </div>
        </div>
    )
}

export const CardPendingSkeleton = () => {
    return (
        <div className="skleton-card-pending">
            <div className="header-skleton-card">
                <div className="skleton-img"></div>
                <div className="skleton-title-card">
                    <p className="skleton-text"></p>
                    <h3 className="skleton-text"></h3>
                    <p className="skleton-text"></p>
                    <p className='skleton-text'></p>
                    <div className="skleton-text"></div>
                </div>
            </div>
            <div className="skleton-description">
                <p className="skleton-text"></p>
                <p className="skleton-text"></p>
            </div>
        </div>
    )
};
