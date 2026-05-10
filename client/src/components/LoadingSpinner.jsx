import { useEffect } from 'react';
import './LoadingSpinner.css';

export const LoadingSpinner = ({ isLoading, message = "กำลังโหลด..." }) => {
    if (!isLoading) return null;

    return (
        <div className="loading-overlay">
            <div className="loading-spinner">
                <div className="spinner"></div>
                <p>{message}</p>
            </div>
        </div>
    );
};

export const LoadingButton = ({ isLoading, children, disabled, ...props }) => {
    return (
        <button disabled={isLoading || disabled} {...props}>
            {isLoading ? (
                <>
                    <span className="spinner-small"></span>
                    กำลังประมวลผล...
                </>
            ) : (
                children
            )}
        </button>
    );
};

export const ErrorAlert = ({ error, severity = 'error', onDismiss, duration = 5000 }) => {
    // ถ้ามีข้อความ error เข้ามา ให้เริ่มนับเวลา
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                onDismiss(); // เรียกฟังก์ชันปิด alert เมื่อครบเวลา
            }, duration);

            return () => clearTimeout(timer);// Cleanup function: เคลียร์ timer ทิ้งถ้าผู้ใช้กดปิด (กากบาท) ไปก่อนที่เวลาจะหมด
        }
    }, [error, onDismiss, duration]);

    if (!error) return null;

    const alertIcons = {
        error: '❌',   // แดง: พัง, เกิดข้อผิดพลาด
        warning: '⚠️', // เหลือง: แจ้งเตือน, 409 Conflict
        success: '✅', // เขียว: สำเร็จ
        info: 'ℹ️'     // ฟ้า: ข้อมูลทั่วไป
    };

    return (
        <div className={`error-alert alert-${severity}`}>
            <div className="error-content">
                <span className="error-icon">{alertIcons[severity] || alertIcons.error}</span>
                <p>{error}</p>
                <button onClick={onDismiss} className="error-close">✕</button>
            </div>
            <div
                className="error-progress"
                style={{ animationDuration: `${duration}ms` }}
            ></div>
        </div>
    );
};