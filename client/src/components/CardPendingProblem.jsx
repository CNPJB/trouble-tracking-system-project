import { useNavigate } from 'react-router-dom';
import { formatDate } from '../utils/formatDate';
import './CardPendingProblem.css'

export const CardPendingProblem = ({ data, isReadOnly = false, isMergeMode, isSelected, onSelect,handleClick}) => {
    const navigate = useNavigate();
    const statusLabels = {
        'pending': 'รอรับเรื่อง',
        'in_progress': 'กำลังดำเนินการ',
        'resolved': 'เสร็จสิ้น'
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
            onClick={handleCardClick}>
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
            <div className="header-card">
                <div className="img">
                    {data.images && data.images.length > 0 ? (
                        <img src={data.images[0].imageUrl} alt="" />
                    ) : (
                        <div className="no-image">ไม่มีรูปภาพประกอบ</div>
                    )}
                </div>
                <div className="title-card" key={data.id}>
                    <p style={{color:'gray'}}>{data.ticketId}</p>
                    <p>แจ้ง : {formatDate(data.createdAt)}</p>
                    <div className={`ticketStatus ${data.ticketStatus}`}>
                        {statusLabels[data.ticketStatus] || data.ticketStatus}
                    </div>
                    <p className='location'>{data.location.locationName}</p>
                    <div className="floor-room">
                        <span>ชั้น {data.floor?.floorLevel || '-'}</span>
                        <span>ห้อง {data.room?.roomName || '-'}</span>
                    </div>
                </div>
            </div>
            <div className="description">
                <p>รายละเอียด : {data.description}</p>
                <p>ผู้ดำเนินการ : {data.admin}</p>
            </div>
        </div>
    )
}
