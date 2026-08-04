import React, { useState, useEffect } from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar, FaTimes } from 'react-icons/fa';
import './componentsStyles/FeedbackModal.css';

export const FeedbackModal = ({ isOpen, onClose, onSubmit, ticketId, isLoading }) => {
    // --- States ---
    const [rating, setRating] = useState(0); // คะแนนจริงที่กดเลือก
    const [hoverRating, setHoverRating] = useState(0); // คะแนนชั่วคราวตอนเอาเมาส์ชี้
    const [comment, setComment] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    // รีเซ็ตฟอร์มทุกครั้งที่ Modal ถูกเปิดขึ้นมาใหม่
    useEffect(() => {
        if (isOpen) {
            setRating(0);
            setHoverRating(0);
            setComment('');
            setErrorMsg('');
        }
    }, [isOpen]);
    
    if (!isOpen) return null; // ถ้าไม่ได้เปิด Modal ให้ return null

    // --- Logic คำนวณดาวแบบครึ่งดวง ---
    const handleMouseMove = (e, index) => {
        // หาความกว้างของไอคอนดาว และตำแหน่ง X ที่เมาส์ชี้อยู่
        const { left, width } = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - left;
        // ถ้าเมาส์อยู่ครึ่งซ้าย = ครึ่งดาว (.5), ถ้าอยู่ครึ่งขวา = เต็มดวง
        const isHalf = x < width / 2;
        setHoverRating(index - (isHalf ? 0.5 : 0));
    };

    const handleMouseLeave = () => {
        setHoverRating(0); // เอาเมาส์ออก คืนค่าเป็น 0 เพื่อโชว์คะแนนจริงที่เลือกไว้
    };

    const handleStarClick = (e, index) => {
        const { left, width } = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - left;
        const isHalf = x < width / 2;
        setRating(index - (isHalf ? 0.5 : 0));
        setErrorMsg(''); // ล้าง Error ถ้ามีการกดให้คะแนนแล้ว
    };

    // --- Action Handlers ---
    const handleReset = () => {
        setRating(0);
        setComment('');
        setErrorMsg('');
    };

    const handleClose = () => {
        handleReset();
        onClose();
    };

    const handlePreSubmit = async () => {
        // Validation อย่างรัดกุมก่อนไปถึง Backend
        if (rating < 0.5) {
            setErrorMsg('กรุณาให้คะแนนอย่างน้อย 0.5 ดาวครับ');
            return;
        }

        await handleConfirmSubmit();
    };

    const handleConfirmSubmit = async () => {
        // ส่งข้อมูลกลับไปให้หน้า Tracking จัดการ API ต่อ
        await onSubmit(ticketId, { rating, comment });
    };

    // ฟังก์ชันวาดดาว 5 ดวง
    const renderStars = () => {
        return [1, 2, 3, 4, 5].map((index) => {
            // เช็คว่าจะโชว์คะแนน hover หรือ คะแนนจริง
            const fillValue = hoverRating || rating; 
            
            let StarIcon = FaRegStar; // ค่าเริ่มต้นคือดาวเปล่า
            let color = "#e4e5e9"; // สีเทา
            
            if (fillValue >= index) {
                StarIcon = FaStar; // ดาวเต็ม
                color = "#fcd271"; // สีเหลืองทอง
            } else if (fillValue >= index - 0.5) {
                StarIcon = FaStarHalfAlt; // ดาวครึ่งดวง
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
                    <StarIcon color={color} size={32} className="star-icon-svg" />
                </div>
            );
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
                    <div className="star-rating-container">
                        {renderStars()}
                        <span className="rating-text">
                            {hoverRating > 0 ? hoverRating : rating} / 5
                        </span>
                    </div>
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