import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDate, formatDateTime } from '../utils/formatDate';
import { FaLayerGroup } from 'react-icons/fa'
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
// Styles
import './componentsStyles/CardPendingProblem.css'

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
    const [imageSrc, setImageSrc] = useState(() => {
        const imageUrl = data?.images?.[0]?.imageUrl;
        return typeof imageUrl === 'string' && imageUrl.trim() ? imageUrl : '/default-noimage.jpg';
    });

    useEffect(() => {
        const imageUrl = data?.images?.[0]?.imageUrl;
        setImageSrc(typeof imageUrl === 'string' && imageUrl.trim() ? imageUrl : '/default-noimage.jpg');
    }, [data?.images]);

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
                    {imageSrc === '/default-noimage.jpg' ? (
                        <div className="no-image">
                            <img src={imageSrc} alt="No Image" />
                        </div>
                    ) : (
                        <img src={imageSrc} alt="" onError={() => setImageSrc('/default-noimage.jpg')} />
                    )}
                </div>
                <div className="title-card" key={data.id}>
                    <p style={{ color: 'gray' }}>{data.ticketId}</p>
                    <h3 className='title-problem'>{data.title}</h3>
                    <p><b>แจ้ง:</b> {formatDateTime(data.createdAt)}</p>
                    <div className={`ticketStatus ${data.ticketStatus}`}>
                        {statusLabels[data.ticketStatus] || data.ticketStatus}
                    </div>
                    <p className='location-text'>{data.location.locationName}</p>
                    <div className="floor-room">
                        <span><b>ชั้น:</b> {data.floor?.floorLevel || '-'}</span>
                        <span><b>ห้อง:</b> {data.room?.roomName || '-'}</span>
                    </div>
                </div>
            </div>
            <div className="description-container">
                <p className='des'><b>รายละเอียด : </b>{data.description}</p>
                <p className='oparetor'><b>ดำเนินการโดย : </b>{data.admin?.fullName || '-'}</p>
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
