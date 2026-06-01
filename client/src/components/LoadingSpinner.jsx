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

export const ToastAlert = ({ error, success, onDismiss, duration = 5000 }) => {
    // ดักว่ามีอะไรให้โชว์ไหม (มี error หรือมี success)
    const activeNotification = error || success;
    // ถ้ามีข้อความ error เข้ามา ให้เริ่มนับเวลา
    useEffect(() => {
        if (activeNotification) {
            const timer = setTimeout(() => {
                onDismiss(); 
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [activeNotification, onDismiss, duration]);

    if (!activeNotification) return null;
    let severity = 'info';
    let message = '';

    if (error) {
        severity = error.severity || 'error';
        message = error.message;
    } else if (success) {
        severity = 'success';
        message = success.message;
    }

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
                <p>{message}</p>
                <button onClick={onDismiss} className="error-close">✕</button>
            </div>
            <div
                className="error-progress"
                style={{ animationDuration: `${duration}ms` }}
            ></div>
        </div>
    );
};