import React, { useState } from 'react';
// Styles
import './MergeManagementPanel.css';
// Components
import { FaSearch, FaTimes, FaChevronDown, FaChevronUp, FaLayerGroup, FaUnlink } from 'react-icons/fa';


export const MergeManagementPanel = ({
    activeTab,
    onTabChange,
    allTickets = [],
    selectedTickets,
    groupedTicketsFromApi = [],
    isLoadingGroups,
    onReset,
    onConfirm,
    onRemoveTicket,
    onUnmergeAction,
    isLoading
}) => {
    // State สำหรับเปิด-ปิด Accordion รายการตั๋วลูก
    const [expandedGroupId, setExpandedGroupId] = useState(null);

    // แยกตั๋วใบแรกเป็น Main Ticket ส่วนที่เหลือเป็น Sub Tickets
    const mainTicket = selectedTickets.length > 0 ? selectedTickets[0] : null;
    const subTickets = selectedTickets.length > 1 ? selectedTickets.slice(1) : [];

    // const groupedTickets = allTickets.filter(t => t._count?.subTickets > 0 || (t.subTickets && t.subTickets.length > 0));

    const toggleExpand = (ticketId) => {
        setExpandedGroupId(prev => prev === ticketId ? null : ticketId);
    };
    return (
        <div className="merge-panel-container">
            {/* 1. ส่วนหัว (Tabs) */}
            <div className="merge-panel-tabs">
                <button
                    className={`panel-tab ${activeTab === 'merge' ? 'active' : ''}`}
                    onClick={() => onTabChange('merge')}
                >
                    รวมกลุ่มปัญหาซ้ำ
                </button>
                <button
                    className={`panel-tab ${activeTab === 'manage' ? 'active' : ''}`}
                    onClick={() => onTabChange('manage')}
                >
                    จัดการกลุ่มของปัญหา
                </button>
                <button
                    className={`panel-tab urgent-tab ${activeTab === 'urgent' ? 'active' : ''}`}
                    onClick={() => onTabChange('urgent')}
                >
                    จัดการตั๋วด่วน
                </button>
            </div>

            {/* 2. ส่วนเนื้อหา */}
            <div className="merge-panel-content">
                {activeTab === 'merge' && (
                    <>
                        <div className="selection-header">
                            รายการที่เลือก ({selectedTickets.length})
                        </div>

                        <div className="selected-tickets-list">
                            {selectedTickets.length === 0 ? (
                                <div className="empty-selection">
                                    <p>กรุณาเลือกรายการปัญหาจากด้านซ้ายอย่างน้อย 2 รายการ</p>
                                </div>
                            ) : (
                                <>
                                    {/* Main Ticket (ใบแรกที่ถูกเลือก - สีเขียว) */}
                                    {mainTicket && (
                                        <div className="ticket-list-item main-ticket">
                                            <button
                                                className="btn-remove-selected"
                                                onClick={() => onRemoveTicket(mainTicket.ticketId)}
                                                title="นำออกจากรายการ"
                                            >
                                                <FaTimes />
                                            </button>
                                            <div className="item-badge main-badge">Main Ticket: {mainTicket.ticketId}</div>
                                            <div className="item-details">
                                                <p className="item-title">{mainTicket.title}</p>
                                                <div className="item-meta">
                                                    <span>สถานที่: {mainTicket.location?.locationName}</span>
                                                    <div className='floor-room-info'>
                                                        <p>ชั้น: {mainTicket.floor?.floorLevel || '-'} </p>
                                                        <p>ห้อง: {mainTicket.room?.roomName || '-'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Sub Tickets (ใบต่อๆ ไป - สีเหลือง) */}
                                    {subTickets.map(ticket => (
                                        <div key={ticket.ticketId} className="ticket-list-item sub-ticket">
                                            <button
                                                className="btn-remove-selected"
                                                onClick={() => onRemoveTicket(ticket.ticketId)}
                                                title="นำออกจากรายการ"
                                            >
                                                <FaTimes />
                                            </button>
                                            <div className="item-badge sub-badge">Sub Ticket: {ticket.ticketId}</div>
                                            <div className="item-details">
                                                <p className="item-title">{ticket.title}</p>
                                                <div className="item-meta">
                                                    <span>สถานที่: {ticket.location?.locationName}</span>
                                                    <div className='floor-room-info'>
                                                        <p>ชั้น: {ticket.floor?.floorLevel || '-'} </p>
                                                        <p>ห้อง: {ticket.room?.roomName || '-'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    </>
                )}

                {activeTab === 'urgent' && (
                    <>
                        <div className="selection-header selection-header-urgent">
                            ตั๋วที่เลือกเป็นตั๋วด่วน ({selectedTickets.length})
                        </div>

                        <div className="selected-tickets-list">
                            {selectedTickets.length === 0 ? (
                                <div className="empty-selection">
                                    <p>กรุณาเลือกรายการปัญหาจากด้านซ้าย เพื่อตั้งเป็นตั๋วด่วน</p>
                                </div>
                            ) : (
                                <>
                                    {selectedTickets.map(ticket => (
                                        <div key={ticket.ticketId} className="ticket-list-item ticket-list-item-urgent">
                                            <button
                                                className="btn-remove-selected"
                                                onClick={() => onRemoveTicket(ticket.ticketId)}
                                                title="นำออกจากรายการ"
                                            >
                                                <FaTimes />
                                            </button>
                                            <div className="item-badge item-badge-urgent">Urgent: {ticket.ticketId}</div>
                                            <div className="item-details">
                                                <p className="item-title">{ticket.title}</p>
                                                <div className="item-meta">
                                                    <span>สถานที่: {ticket.location?.locationName}</span>
                                                    <div className='floor-room-info'>
                                                        <p>ชั้น: {ticket.floor?.floorLevel || '-'} </p>
                                                        <p>ห้อง: {ticket.room?.roomName || '-'}</p>
                                                    </div>
                                                </div>
                                                {ticket._count?.subTickets > 0 && (
                                                    <div className="urgent-sub-ticket-info">
                                                        <FaLayerGroup /> รวมตั๋วลูกที่จะเป็นตั๋วด่วนด้วย ({ticket._count.subTickets} รายการ)
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    </>
                )}

                {activeTab === 'manage' && (
                    <>
                        <div className="selection-header">
                            กลุ่มปัญหาทั้งหมด ({groupedTicketsFromApi.length} กลุ่ม)
                        </div>

                        <div className="selected-tickets-list">
                            {isLoadingGroups ? (
                                <div className="empty-selection">
                                    <p>กำลังโหลดกลุ่มปัญหา...</p>
                                </div>
                            ) : groupedTicketsFromApi.length === 0 ? (
                                <div className="empty-selection">
                                    <p>ยังไม่มีการจัดกลุ่มปัญหาในขณะนี้</p>
                                </div>
                            ) : (
                                !isLoadingGroups && groupedTicketsFromApi.length > 0 && groupedTicketsFromApi.map(group => {
                                    const isExpanded = expandedGroupId === group.ticketId;
                                    const subCount = group._count?.subTickets || (group.subTickets?.length || 0);

                                    return (
                                        <div key={group.ticketId} className="group-accordion-wrapper">
                                            {/* การ์ด Main Ticket (คลิกเพื่อขยาย) */}
                                            <div
                                                className={`ticket-list-item main-ticket clickable-card ${isExpanded ? 'expanded' : ''}`}
                                                onClick={() => toggleExpand(group.ticketId)}
                                            >
                                                <div className="item-badge main-badge" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                                    <span><FaLayerGroup /> Main: {group.ticketId} (รวม {subCount} รายการ)</span>

                                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                        {/* แสดงปุ่ม "ยุบกลุ่ม" เฉพาะตอนกางการ์ดออก*/}
                                                        {isExpanded && (
                                                            <button
                                                                className="btn-disband-group"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onUnmergeAction({ mainTicketId: group.ticketId });
                                                                }}
                                                                title="ยุบกลุ่มปัญหานี้ (แยกตั๋วลูกทั้งหมดออก)"
                                                            >
                                                                ยุบกลุ่ม
                                                            </button>
                                                        )}
                                                        {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                                                    </div>
                                                </div>
                                                <div className="item-details">
                                                    <p className="item-title">{group.title}</p>
                                                    <div className="item-meta">
                                                        <span>สถานที่: {group.location?.locationName}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* โซนตั๋วลูก (จะแสดงก็ต่อเมื่อ isExpanded เป็น true) */}
                                            {isExpanded && (
                                                <div className="accordion-sub-tickets">
                                                    {group.subTickets && group.subTickets.length > 0 ? (
                                                        group.subTickets.map(sub => (
                                                            <div key={sub.ticketId} className="ticket-list-item sub-ticket accordion-sub-item" style={{ position: 'relative' }}>

                                                                <button
                                                                    className="btn-unlink-sub"
                                                                    onClick={() => onUnmergeAction({ subTicketId: sub.ticketId, mainTicketId: group.ticketId })}
                                                                    title="แยกรายการนี้ออกจากกลุ่ม"
                                                                >
                                                                    <FaUnlink /> <p className="p-unlink-text">แยกออก</p>
                                                                </button>

                                                                <div className="item-badge sub-badge">Sub Ticket: {sub.ticketId}</div>
                                                                <div className="item-details">
                                                                    <p className="item-title">{sub.title}</p>
                                                                    <div className="item-meta">
                                                                        <span>ผู้แจ้ง: {sub.user?.fullName || 'ไม่ระบุ'}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="loading-subs-placeholder">
                                                            กำลังโหลดข้อมูลตั๋วลูก...
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* 3. ส่วนปุ่มควบคุม (Footer) */}
            {activeTab === 'merge' && (
                <div className="merge-panel-actions">
                    <button className="btn-reset-selection" onClick={onReset} disabled={selectedTickets.length === 0 || isLoading}>รีเซ็ต</button>
                    <button className="btn-confirm-merge" onClick={onConfirm} disabled={selectedTickets.length < 2 || isLoading}>{isLoading ? 'กำลังบันทึก...' : 'บันทึก'}</button>
                </div>
            )}
            
            {activeTab === 'urgent' && (
                <div className="merge-panel-actions merge-panel-actions-urgent">
                    <button className="btn-reset-selection" onClick={onReset} disabled={selectedTickets.length === 0 || isLoading}>รีเซ็ต</button>
                    <button className="btn-confirm-merge btn-confirm-urgent" onClick={onConfirm} disabled={selectedTickets.length === 0 || isLoading}>{isLoading ? 'กำลังบันทึก...' : 'ตั้งเป็นตั๋วด่วน'}</button>
                </div>
            )}
        </div>
    );
};