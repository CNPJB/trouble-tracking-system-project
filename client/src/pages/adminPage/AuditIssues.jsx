import React, { useState } from 'react'
import './AuditIssues.css'
// components
import { SearchBar } from '../../components/SearchBar.jsx'
import { DateRangeFilter } from '../../components/DateRangeFilter.jsx'
import { CardPendingProblem } from '../../components/CardpendingProblem.jsx'
import { ConfirmButton } from '../../components/ConfirmButton.jsx'
// hooks 
import { useTicketSearch } from '../../hooks/useTicketSearch.js'
import { useTickets } from '../../hooks/useTickets.js'
import { useFilterDate } from '../../hooks/useFilterDate.js'

// service
import { ticketService } from '../../services/ticketService.js'

const AuditIssues = () => {

    const { tickets } = useTickets();
    const { displayData, searchResult, isSearching, handleSearch } = useTicketSearch(tickets, true);
    const [dateRange, setDateRange] = useState([null, null]);
    const [startDate, endDate] = dateRange;
    const filteredByDateData = useFilterDate(displayData, startDate, endDate, 'createdAt');
    const [isMergeMode, setIsMergeMode] = useState(false);
    const [selectedTickets, setSelectedTickets] = useState([]);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isMerging, setIsMerging] = useState(false);

    const toggleMergeMode = () => {
        setIsMergeMode(!isMergeMode);
        if (isMergeMode) {
            setSelectedTickets([]);
        }
    };

    const handleSelectTicket = (ticket) => {
        const currentTicketId = ticket.ticketId || ticket.id;

        setSelectedTickets((prevSelected) => {
            const isAlreadySelected = prevSelected.find(t => (t.ticketId || t.id) === currentTicketId);

            if (isAlreadySelected) {
                const parentTicket = prevSelected[0];
                const parentId = parentTicket ? (parentTicket.ticketId || parentTicket.id) : null;

                if (currentTicketId === parentId) {
                    return [];
                } else {
                    return prevSelected.filter(t => (t.ticketId || t.id) !== currentTicketId);
                }
            } else {
                return [...prevSelected, ticket];
            }
        });
    };

    const handleConfirmMerge = async () => {
        setIsConfirmOpen(false);
        console.log("จำนวนที่เลือก:", selectedTickets.length);
        if (selectedTickets.length < 2) {
            alert("กรุณาเลือกปัญหาอย่างน้อย 2 รายการ");
            return;
        }
        setIsMerging(true);

        const parentId = selectedTickets[0].ticketId || selectedTickets[0].id;
        const childIds = selectedTickets.slice(1).map(t => t.ticketId || t.id);
        const payload = { parentId, childIds };

        try {
            console.log("ไอดี", parentId, childIds)
            await ticketService.mergeTickets(payload);
            alert("รวมปัญหาสำเร็จแล้ว!");
            setSelectedTickets([]);
            setIsMergeMode(false);
            window.location.reload();


        } catch (error) {
            alert("เกิดข้อผิดพลาดในการรวมปัญหา โปรดลองอีกครั้ง");
        } finally {
            setIsMerging(false);
        }
    };


    return (
        <div className="audit-issues-container">
            <div className="audit-issues-filter-container">
                <div className="audit-issues-searchbar">
                    <SearchBar onSearch={handleSearch} />
                </div>
                <button
                    className={`mearge-btn ${isMergeMode ? 'active-merge' : ''}`}
                    onClick={toggleMergeMode}
                >
                    {isMergeMode ? 'ยกเลิกรวมปัญหา' : 'รวมปัญหา'}
                </button>
                <DateRangeFilter
                    startDate={startDate}
                    endDate={endDate}
                    onChange={(update) => {
                        if (!update) {
                            setDateRange([null, null]); // ถ้ากดกากบาท ล้างเป็น null ทั้งคู่
                        } else {
                            setDateRange(update);
                        }
                    }}
                />
            </div>
            <div className="audit-issues-problem">
                <div className={`audit-issues-selected ${isMergeMode ? 'shrink' : ''}`}>
                    {filteredByDateData.map((ticket, index) => {
                        const currentTicketId = ticket.ticketId || ticket.id;

                        return (
                            <CardPendingProblem
                                key={currentTicketId}
                                data={ticket}
                                isReadOnly={true}
                                isMergeMode={isMergeMode}
                                isSelected={selectedTickets.some(t => (t.ticketId || t.id) === currentTicketId)}
                                onSelect={() => handleSelectTicket(ticket)}
                            />
                        );
                    })}
                    {filteredByDateData.length === 0 && (
                        <div className="no-result">ไม่พบรายการสถานะนี้</div>
                    )}
                </div>
                {isMergeMode && (
                    <div className="show-audit-issues-selected">
                        <h3>รายการที่เลือก ({selectedTickets.length})</h3>

                        <div className="selected-list">
                            {selectedTickets.map((ticket, index) => (
                                <div key={ticket.ticketId} className={`merge-item ${index === 0 ? 'parent' : 'child'}`}>
                                    <span className="badge">
                                        {index === 0 ? `ปัญหา (หลัก) ID : ${ticket.ticketId}`: `ปัญหา (ย่อย ${index} ID : ${ticket.ticketId})`}
                                    </span>
                                    <div className="merge-detail">
                                        <p>{ticket.description || 'ไม่มีหัวข้อ'}</p>
                                        <small>สถานที่: {ticket.location?.locationName || 'ไม่มีสถานที่'}</small>
                                        <small>ชั้น: {ticket.floor?.floorLevel || '-'} ห้อง: {ticket.room?.roomName || '-'}</small>
                                    </div>
                                </div>
                            ))}

                            {selectedTickets.length === 0 && (
                                <p className="empty-text">กรุณาเลือกปัญหาที่ต้องการรวม</p>
                            )}
                        </div>

                        {selectedTickets.length > 1 && (
                            <button className="btn-confirm-merge"
                                onClick={() => setIsConfirmOpen(true)}
                                disabled={isMerging}
                            >
                                ยืนยันการรวมปัญหา
                            </button>
                        )}
                        <ConfirmButton
                            isOpen={isConfirmOpen}
                            title="ยืนยันการรวมปัญหา"
                            message={`คุณแน่ใจหรือไม่ที่จะรวมปัญหาทั้ง ${selectedTickets.length} รายการนี้เข้าด้วยกัน? การกระทำนี้ไม่สามารถย้อนกลับได้`}
                            confirmText="ยืนยัน"
                            cancelText="ยกเลิก"
                            onConfirm={handleConfirmMerge} // ถ้ากดยืนยัน ให้เรียกฟังก์ชันนี้
                            onCancel={() => setIsConfirmOpen(false)} // ถ้ากดยกเลิก ให้ปิด Modal
                        />
                    </div>
                )}
            </div>
        </div>
    )
}

export default AuditIssues