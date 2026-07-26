import React, { useState, useRef, useEffect } from 'react';
import { FaEllipsisV, FaEdit, FaTrashAlt, FaThumbsDown, FaStar } from 'react-icons/fa';
import './componentsStyles/TicketActionMenu.css'; // เดี๋ยวเราจะสร้างไฟล์ CSS นี้กันครับ

export const TicketActionMenu = ({ 
    ticket, 
    currentUserId, 
    onEdit, 
    onCancelVote, 
    onFeedback, 
    onCancelTicket 
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    // เช็คสิทธิ์และสถานะ
    const isOwner = ticket.user?.userId === currentUserId;
    const isPending = ticket.ticketStatus === 'pending';
    const isResolved = ticket.ticketStatus === 'resolved';
    const hasRated = ticket.rating !== null;

    // ปิดเมนูเมื่อคลิกพื้นที่อื่นบนหน้าจอ
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleMenu = (e) => {
        e.stopPropagation(); // ป้องกันไม่ให้การคลิกทะลุไปโดน Card
        setIsOpen(!isOpen);
    };

    const handleAction = (e, actionCallback) => {
        e.stopPropagation();
        setIsOpen(false);
        if (actionCallback) actionCallback();
    };

    return (
        <div className="kebab-menu-container" ref={menuRef}>
            <button className="kebab-trigger-btn" onClick={toggleMenu}>
                <FaEllipsisV />
            </button>

            {isOpen && (
                <div className="kebab-dropdown-menu">
                    {isOwner ? (
                        /* เมนูสำหรับเจ้าของตั๋ว */
                        <>
                            <button 
                                className="kebab-item" 
                                disabled={!isPending}
                                onClick={(e) => handleAction(e, () => onEdit(ticket.ticketId))}
                            >
                                <FaEdit className="menu-icon text-yellow" /> แก้ไขรายการ
                            </button>

                            <button 
                                className="kebab-item" 
                                disabled={!isPending}
                                onClick={(e) => handleAction(e, () => onCancelTicket(ticket.ticketId))}
                            >
                                <FaTrashAlt className="menu-icon text-red" /> ยกเลิกแจ้งปัญหา
                            </button>

                            <button 
                                className="kebab-item" 
                                disabled={!isResolved || hasRated}
                                onClick={(e) => handleAction(e, () => onFeedback(ticket.ticketId))}
                            >
                                <FaStar className="menu-icon text-orange" /> ประเมินความพึงพอใจ
                            </button>
                        </>
                    ) : (
                        /* เมนูสำหรับผู้โหวต/ติดตาม */
                        <button 
                            className="kebab-item" 
                            disabled={!isPending}
                            onClick={(e) => handleAction(e, () => onCancelVote(ticket.ticketId))}
                        >
                            <FaThumbsDown className="menu-icon text-red" /> ยกเลิกการโหวต
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};