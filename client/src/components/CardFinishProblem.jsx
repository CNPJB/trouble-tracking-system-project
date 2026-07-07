import './componentsStyles/CardFinishProblem.css';
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
        ) :(
          <div className="no-image">ไม่มีรูปภาพประกอบ</div>
        )}
      </div>
        <div className="main-info-card" key={data.id}>
          <div className="info-card">
            <h1 style={{ fontSize: '25px',margin: 0 }}>{data.title}</h1>
            <p>โดย : {data.admin?.fullName || 'ไม่ระบุ'}</p>
            <p>เสร็จสิ้น : {formatDateTime(data.timestampFinished) || '-'}</p>

          </div>
          <div className="review-card">
            <StarRating rating={data?.rating || 0} />
            <p className='text-limit'><img
              src="description.png"
              alt=""
              style={{ width: '20px', height: '20px', gap: '10px' }} />{data.comment}</p>
              
          </div>
        </div>
    </div>
  )
}
