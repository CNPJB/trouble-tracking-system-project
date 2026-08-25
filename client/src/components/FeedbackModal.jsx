import React, { useState, useEffect } from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar, FaTimes } from 'react-icons/fa';
import './componentsStyles/FeedbackModal.css';

const RatingRow = ({ label, rating, onRatingChange }) => {
    const [hoverRating, setHoverRating] = useState(0);

    const handleMouseMove = (e, index) => {
        const { left, width } = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - left;
        const isHalf = x < width / 2;
        setHoverRating(index - (isHalf ? 0.5 : 0));
    };

    const handleMouseLeave = () => {
        setHoverRating(0);
    };

    const handleStarClick = (e, index) => {
        const { left, width } = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - left;
        const isHalf = x < width / 2;
        onRatingChange(index - (isHalf ? 0.5 : 0));
    };

    const renderStars = () => {
        return [1, 2, 3, 4, 5].map((index) => {
            const fillValue = hoverRating || rating; 
            
            let StarIcon = FaRegStar;
            let color = "#e4e5e9";
            
            if (fillValue >= index) {
                StarIcon = FaStar;
                color = "#fcd271";
            } else if (fillValue >= index - 0.5) {
                StarIcon = FaStarHalfAlt;
                color = "#fcd271";
            }

            return (
                <div 
                    key={index}
                    className="star-wrapper"
                    onMouseMove={(e) => handleMouseMove(e, index)}
                    onMouseLeave={handleMouseLeave}
                    onClick={(e) => handleStarClick(e, index)}
                >
                    <StarIcon color={color} size={28} className="star-icon-svg" />
                </div>
            );
        });
    };

    return (
        <div className="rating-row">
            <span className="rating-row-label">{label}</span>
            <div className="star-rating-container">
                {renderStars()}
                <span className="rating-text">
                    {hoverRating > 0 ? hoverRating : rating} / 5
                </span>
            </div>
        </div>
    );
};

export const FeedbackModal = ({ isOpen, onClose, onSubmit, ticketId, isLoading }) => {
    // --- States ---
    const [ratingSpeed, setRatingSpeed] = useState(0);
    const [ratingCompleteness, setRatingCompleteness] = useState(0);
    const [ratingCommunication, setRatingCommunication] = useState(0);
    const [comment, setComment] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    // รีเซ็ตฟอร์มทุกครั้งที่ Modal ถูกเปิดขึ้นมาใหม่
    useEffect(() => {
        if (isOpen) {
            setRatingSpeed(0);
            setRatingCompleteness(0);
            setRatingCommunication(0);
            setComment('');
            setErrorMsg('');
        }
    }, [isOpen]);
    
    if (!isOpen) return null; // ถ้าไม่ได้เปิด Modal ให้ return null

    // --- Action Handlers ---
    const handleReset = () => {
        setRatingSpeed(0);
        setRatingCompleteness(0);
        setRatingCommunication(0);
        setComment('');
        setErrorMsg('');
    };

    const handleClose = () => {
        handleReset();
        onClose();
    };

    const handlePreSubmit = async () => {
        // Validation อย่างรัดกุมก่อนไปถึง Backend
        if (ratingSpeed < 0.5 || ratingCompleteness < 0.5 || ratingCommunication < 0.5) {
            setErrorMsg('กรุณาให้คะแนนอย่างน้อย 0.5 ดาวในทุกหมวดหมู่ครับ');
            return;
        }

        await handleConfirmSubmit();
    };

    const handleConfirmSubmit = async () => {
        // คำนวณคะแนนเฉลี่ย
        const averageRating = parseFloat(((ratingSpeed + ratingCompleteness + ratingCommunication) / 3).toFixed(1));
        
        // ส่งข้อมูลกลับไปให้หน้า Tracking จัดการ API ต่อ
        await onSubmit(ticketId, { 
            rating: averageRating,
            ratingSpeed,
            ratingCompleteness,
            ratingCommunication,
            comment 
        });
    };

    return (
        <div className="feedback-modal-overlay" onClick={handleClose}>
            {/* e.stopPropagation() ป้องกันไม่ให้คลิกที่เนื้อหาแล้ว Modal ปิด */}
            <div className="feedback-modal-content" onClick={(e) => e.stopPropagation()}>
                
                {/* ปุ่มปิด (X) มุมขวาบน */}
                <button className="feedback-close-btn" onClick={handleClose} disabled={isLoading}>
                    <FaTimes />
                </button>

                <div className="feedback-header">
                    <h2>ประเมินความพึงพอใจ</h2>
                    <p>รหัสอ้างอิง: <strong>{ticketId}</strong></p>
                </div>

                <div className="feedback-body">
                    <label className="feedback-label">คะแนนการแก้ปัญหา <span className="req">*</span></label>
                    
                    <RatingRow 
                        label="ความรวดเร็วในการรับเรื่องและแก้ไข" 
                        rating={ratingSpeed} 
                        onRatingChange={(v) => { setRatingSpeed(v); setErrorMsg(''); }} 
                    />
                    <RatingRow 
                        label="ความสมบูรณ์ของการแก้ไข" 
                        rating={ratingCompleteness} 
                        onRatingChange={(v) => { setRatingCompleteness(v); setErrorMsg(''); }} 
                    />
                    <RatingRow 
                        label="การแจ้งผลและสื่อสาร" 
                        rating={ratingCommunication} 
                        onRatingChange={(v) => { setRatingCommunication(v); setErrorMsg(''); }} 
                    />

                    {errorMsg && <p className="feedback-error-text">{errorMsg}</p>}

                    <div className="label-with-counter">
                        <label className="feedback-label mt-4">ข้อเสนอแนะเพิ่มเติม (ถ้ามี)</label>
                        <span className="char-counter">{comment.length}/50</span>
                    </div>
                    <textarea 
                        className="feedback-textarea"
                        placeholder="เขียนคำติชม หรือข้อเสนอแนะเพื่อให้เราปรับปรุงบริการให้ดียิ่งขึ้น..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows="4"
                        disabled={isLoading}
                        maxLength={50}
                        />
                </div>

                <div className="feedback-actions">
                    <button 
                        className="btn-feedback-reset" 
                        onClick={handleReset} 
                        disabled={isLoading}
                    >
                        รีเซ็ต
                    </button>
                    <button 
                        className="btn-feedback-submit" 
                        onClick={handlePreSubmit} 
                        disabled={isLoading}
                    >
                        {isLoading ? "กำลังส่ง..." : "ยืนยันการประเมิน"}
                    </button>
                </div>
            </div>
        </div>
    );
};