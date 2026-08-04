import './componentsStyles/CardFinishProblem.css';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { useNavigate } from 'react-router-dom';
import { StarRating } from './StarRating';
import { formatDate, formatDateTime } from '../utils/formatDate';

export const CardFinishProblem = ({ data }) => {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate(`/ticketDetail?ticketId=${data.ticketId}`);
  };

  return (
    <div className='container-card' onClick={handleClick}>
      <div className="img-card">
        {data.images && data.images.length > 0 ? (
          <img src={data.images[0].imageUrl} alt="" />
        ) : (
          <div className="no-image">
            <img src="/default-noimage.jpg" alt="No Image" />
          </div>
        )}
      </div>
        <div className="main-info-card" key={data.id}>
          <div className="info-card">
            <h1>{data.title}</h1>
            <p>โดย : {data.admin?.fullName || 'ไม่ระบุ'}</p>
            <p>เสร็จสิ้น : {formatDateTime(data.timestampFinished) || '-'}</p>

        </div>
        <div className="review-card">
          <StarRating rating={data?.rating || 0} />
          <p className='text-limit'>
            <img
              src="description.png"
              alt=""
              style={{ width: '20px', height: '20px', gap: '10px', margin: '10px 10px 0 0' }} />{data.comment || '-'}
          </p>

        </div>
      </div>
    </div>
  )
}

export const SkeletonCardFinishProblem = () => {

  return (
    <SkeletonTheme
      baseColor="#ebebeb"
      highlightColor="#ccc7c7"
      duration={2}
    >
      <div className='container-card' >
        <div className="img-card">
          <div >
            <Skeleton width={150} height={160} borderRadius={8} />
          </div>
        </div>
        <div className="main-info-card" >
          <div className="info-card">
            <h1><Skeleton width="60%" height={24} /></h1>
            <p><Skeleton width="80%" height={16} count={2} /></p>
          </div>
          <div className="review-card">
            <p><Skeleton width="80%" height={16} count={4} /></p>
          </div>
        </div>
      </div>
    </SkeletonTheme>
  );
}