import { useNavigate } from 'react-router-dom';
import { formatDate } from '../utils/formatDate';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
// Styles
import './CardPendingProblem.css'

export const CardPendingProblem = ({
    data,
    isReadOnly = false,
    isMergeMode,
    isSelected,
    onSelect,
    handleClick,
    actionSlot
}) => {

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
            onClick={handleCardClick}
            style={{ position: 'relative' }}>

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
                    <h3 className="title">เรื่อง : {data.title}</h3>
                    <p>แจ้ง : {formatDate(data.createdAt)}</p>
                    <div className={`ticketStatus ${data.ticketStatus}`}>
                        {statusLabels[data.ticketStatus] || data.ticketStatus}
                    </div>
                    <p className='location-text'>{data.location.locationName}</p>
                    <div className="floor-room">
                        <span>ชั้น {data.floor?.floorLevel || '-'}</span>
                        <span>ห้อง {data.room?.roomName || '-'}</span>
                    </div>
                </div>
            </div>
            <div className="description">
                <p className='description-text'>รายละเอียด : {data.description}</p>
                <p className='operator'>ผู้ดำเนินการ : {data.admin}</p>
            </div>
        </div>
    )
}

export const CardPendingSkeleton = () => {
    return (
        <SkeletonTheme
            baseColor="#ebebeb"
            highlightColor="#ccc7c7"
            duration={2}
        >
            <div className="skleton-card-pending">
                <div className="header-card">
                    <div className="img">
                        <Skeleton width={150} height={160} borderRadius={8} />
                    </div>
                    <div className="title-card">
                        <p className='operator'><Skeleton width="40%" height={16} count={1} /></p>
                        <h3 className="title"><Skeleton width="60%" height={24} /></h3>
                        <p className='operator'><Skeleton width="40%" height={16} count={1} /></p>
                        <div>
                       
                        </div>
                        <p className='location-text'><Skeleton width="100%" height={16} count={1} /></p>
                        <div className="floor-room">
                            <Skeleton width="40%" height={16} count={1} />
                        </div>
                    </div>
                </div>
                <div className="description">
                    <p className='description-text'><Skeleton width="100%" height={16} count={3} /></p>
                    <p className='operator'><Skeleton width="100%" height={16} count={1} /></p>
                </div>
            </div>
        </SkeletonTheme>
    )
};
