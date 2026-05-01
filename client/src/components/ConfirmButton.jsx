import React from 'react';
import './ConfirmButton.css'

export const ConfirmButton = ({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = "ยืนยัน",
    cancelText = "ยกเลิก"
}) => {
    // ถ้า isOpen เป็น false จะไม่แสดงอะไรเลย
    if (!isOpen) return null;

    return (
        <div className="confirm-modal-overlay">
            <div className="confirm-modal-content">
                <h3 className="confirm-modal-title">{title}</h3>
                <p className="confirm-modal-message">{message}</p>

                <div className="confirm-modal-actions">
                    <button className="confirm-btn-cancel" onClick={onCancel}>
                        {cancelText}
                    </button>
                    <button className="confirm-btn-submit" onClick={onConfirm}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};