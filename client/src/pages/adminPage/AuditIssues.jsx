import React, { useState, useCallback, useRef, useEffect } from 'react';
import { FaTasks, FaTimes } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext.jsx';

// styles
import './AuditIssues.css'

// components
import { SearchBar } from '../../components/SearchBar.jsx'
import { DateRangeFilter } from '../../components/DateRangeFilter.jsx'
import { CardPendingProblem } from '../../components/CardPendingProblem.jsx'
import { ConfirmButton } from '../../components/ConfirmButton.jsx'
import { MergeManagementPanel } from '../../components/componentsAdmin/MergeManagementPanel.jsx'
import { LoadingSpinner, ToastAlert } from '../../components/LoadingSpinner.jsx';
import { TicketCategoryFilter } from '../../components/TicketCategoryFilter.jsx';
import { TicketLocationFilter } from '../../components/TicketLocationFilter.jsx';
import { AdvancedFilterPanel } from '../../components/AdvancedFilterPanel.jsx';
import { TicketDateFilter } from '../../components/TicketDateFilter.jsx';

// hooks 
import { useTickets } from '../../hooks/useTickets.js'
import { useFilterDate } from '../../hooks/useFilterDate.js'
import { useLoadingState } from '../../hooks/useLoadingState.js'
import { useTicketGroups } from '../../hooks/useTicketGroups.js';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll.js';

// service
import { ticketService } from '../../services/ticketService.js'

const AuditIssues = () => {
    const { user } = useAuth();
    const { tickets, isLoading, isFetchingNextPage, pagination,
        changePage, updateFilters, refetch, removeTicket, updateTicketStatus,
        updateTicketAfterMerge, updateTicketAfterUnmerge
    } = useTickets({ status: 'pending' });
    const { loading, startLoading, setError, setSuccess, reset } = useLoadingState();
    const [selectedMergeTickets, setSelectedMergeTickets] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');
    const [confirmMergeModal, setConfirmMergeModal] = useState({ isOpen: false });
    const [confirmUrgentModal, setConfirmUrgentModal] = useState({ isOpen: false });
    const [activePanelTab, setActivePanelTab] = useState('merge');
    const { ticketGroups, isLoadingGroups, refetchGroups } = useTicketGroups();
    const [confirmUnmergeModal, setConfirmUnmergeModal] = useState({
        isOpen: false,
        payload: null,
        type: null
    });
    const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);

    const activeDropdownFiltersCount =
        (selectedCategory ? 1 : 0) +
        (selectedLocation ? 1 : 0);

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const lastTicketElementRef = useInfiniteScroll({
        isLoading: isLoading,
        isFetchingNextPage: isFetchingNextPage,
        hasNextPage: pagination?.hasNextPage,
        onLoadMore: () => changePage(pagination.currentPage + 1)
    });

    const handleSelectTicket = (ticket) => {
        if (activePanelTab === 'urgent' && ticket.isUrgent) {
            setError("ตั๋วนี้ถูกตั้งเป็นตั๋วด่วนอยู่แล้ว ไม่จำเป็นต้องเลือกซ้ำ", "warning");
            return;
        }

        setSelectedMergeTickets(prevSelected => {
            // เช็คว่าตั๋วใบนี้ถูกเลือกไว้แล้วหรือยัง?
            const isAlreadySelected = prevSelected.some(t => t.ticketId === ticket.ticketId);

            if (isAlreadySelected) {
                // ลอจิกเอาออก: ใช้ filter กรองใบนี้ทิ้ง 
                // (ถ้าใบที่เอาออกคือ index 0 ใบถัดไปจะขยับขึ้นมาเป็น Main อัตโนมัติ)
                return prevSelected.filter(t => t.ticketId !== ticket.ticketId);
            }
            else {
                // // ลอจิกเพิ่มเข้า: เช็คก่อนว่าหมวดหมู่ตรงกับ Main Ticket ไหม?
                // if (prevSelected.length > 0) {
                //     const mainTicket = prevSelected[0];
                //     if (mainTicket.ticketCtgId !== ticket.ticketCtgId) {
                //         // ถ้าคนละหมวดหมู่ ให้เด้งแจ้งเตือนและ "ไม่เพิ่ม" เข้า Array
                //         setError("ไม่สามารถรวมปัญหาข้ามหมวดหมู่ได้ กรุณาเลือกปัญหาประเภทเดียวกัน", "warning");
                //         return prevSelected;
                //     }
                // }

                // reset(); // เคลียร์แจ้งเตือนเก่าทิ้ง
                return [...prevSelected, ticket]; //
            }
        });
    };

    const handleRemoveSelectedTicket = (ticketId) => {
        setSelectedMergeTickets(prev => prev.filter(t => t.ticketId !== ticketId));
        reset();
    };

    const handleResetSelection = () => {
        setSelectedMergeTickets([]);
        reset();
    };

    const handleConfirmMerge = () => {
        if (selectedMergeTickets.length < 2) return;
        setConfirmMergeModal({ isOpen: true });
    };

    const handleTabChange = (tab) => {
        if (activePanelTab !== tab) {
            setActivePanelTab(tab);
            setSelectedMergeTickets([]); // ล้างรายการที่เลือกเมื่อสลับแท็บ
            reset(); // ล้างข้อความแจ้งเตือน
        }
    };

    const handleConfirmUrgent = () => {
        if (selectedMergeTickets.length === 0) return;
        setConfirmUrgentModal({ isOpen: true });
    };

    const submitMerge = async () => {
        startLoading(); // แสดงหน้าจอโหลด

        try {
            // A. เตรียม Payload ส่งให้ Backend
            // ใบแรก (index 0) คือ Main Ticket
            const primaryTicketId = selectedMergeTickets[0]?.ticketId;
            // ใบที่เหลือ (ตั้งแต่ index 1 เป็นต้นไป) คือ Sub Tickets ที่จะถูกยุบรวม
            const duplicateTicketIds = selectedMergeTickets.slice(1).map(t => t.ticketId);

            const payload = {
                primaryTicketId,
                duplicateTicketIds
            };

            // B. ยิง API ผ่าน Service
            const result = await ticketService.mergeTickets(payload);

            if (result.success) {
                // C. เมื่อสำเร็จ: แจ้งเตือน -> ปิด Modal -> ล้างค่าที่เลือก -> รีเฟรชกระดาน
                setSuccess(`รวมกลุ่มปัญหาสำเร็จ! ข้อมูลถูกโอนย้ายไปยังตั๋วหลัก ${primaryTicketId} เรียบร้อยแล้ว`);
                setConfirmMergeModal({ isOpen: false });
                setSelectedMergeTickets([]);

                // ใช้ Optimistic Update ทำงานแบบ Real-time โดยไม่ต้องรีเฟรช
                updateTicketAfterMerge(primaryTicketId, duplicateTicketIds);

                // ดึงข้อมูลแค่กลุ่มด้านขวาใหม่ให้เป็นปัจจุบัน
                await refetchGroups();
            }
        } catch (error) {
            console.error("Error merging tickets:", error);
            setError(error.response?.data?.message || "เกิดข้อผิดพลาดในการรวมกลุ่มปัญหา", "error");
            setConfirmMergeModal({ isOpen: false });
        }
    };

    const handleUnmergeAction = (payload) => {
        const type = payload.subTicketId ? 'single' : 'group';
        setConfirmUnmergeModal({ isOpen: true, payload, type });
    };

    const submitUnmerge = async () => {
        if (!confirmUnmergeModal.payload) return;
        startLoading(); // แสดงหน้าจอโหลด

        try {
            // ดึงข้อมูลออกมาจาก payload
            const { subTicketId, mainTicketId } = confirmUnmergeModal.payload;

            // เตรียม payload ส่งให้ API (ส่งตัวใดตัวหนึ่งเท่านั้น)
            const apiPayload = confirmUnmergeModal.type === 'single' ? { subTicketId } : { mainTicketId };

            const result = await ticketService.unmergeTickets(apiPayload);

            if (result.success) {
                setSuccess(result.message || "ดำเนินการแยกกลุ่มปัญหาสำเร็จ");
                setConfirmUnmergeModal({ isOpen: false, payload: null, type: null });

                // 🚀 ใช้ Optimistic Update ทำงานแบบ Real-time โดยไม่ต้องรีเฟรช 🚀
                const targetMainTicketId = confirmUnmergeModal.type === 'single' ? mainTicketId : apiPayload.mainTicketId;
                updateTicketAfterUnmerge(targetMainTicketId, result.unmergedTickets, confirmUnmergeModal.type === 'single');

                // ดึงข้อมูลแค่กลุ่มด้านขวาใหม่ให้เป็นปัจจุบัน
                await refetchGroups();
            }
        } catch (error) {
            console.error("Error unmerging tickets:", error);
            setError(error.response?.data?.message || "เกิดข้อผิดพลาดในการแยกกลุ่มปัญหา", "error");
            setConfirmUnmergeModal({ isOpen: false, payload: null, type: null });
        }
    };

    const submitUrgentTickets = async () => {
        if (selectedMergeTickets.length === 0) return;
        startLoading();

        try {
            const ticketIds = selectedMergeTickets.map(t => t.ticketId);
            const result = await ticketService.markUrgentTickets(ticketIds);

            if (result.success) {
                setSuccess(`ตั้งค่าตั๋วด่วนสำเร็จ!`);
                setSelectedMergeTickets([]);
                setConfirmUrgentModal({ isOpen: false });
                refetch();
            }
        } catch (error) {
            console.error("Error setting urgent tickets:", error);
            setError(error.response?.data?.message || "เกิดข้อผิดพลาดในการตั้งค่าตั๋วด่วน", "error");
            setConfirmUrgentModal({ isOpen: false });
        }
    };

    // ==========================================
    // โซนฟังก์ชันจัดการ UI & Filters
    // ==========================================
    const handleSearch = (keyword) => {
        updateFilters({ search: keyword });
        if (selectedMergeTickets.length > 0) handleResetSelection();
    };

    const handleCategoryFilter = (categoryId) => {
        setSelectedCategory(categoryId);
        updateFilters({ categoryId: categoryId || undefined });
        if (selectedMergeTickets.length > 0) handleResetSelection();
    };

    const handleLocationFilter = (locationId) => {
        setSelectedLocation(locationId);
        updateFilters({ locationId: locationId || undefined });
        if (selectedMergeTickets.length > 0) handleResetSelection();
    };

    const handleStartDateChange = (date) => {
        setStartDate(date);
        updateFilters({ startDate: date || undefined });
    };

    const handleEndDateChange = (date) => {
        setEndDate(date);
        updateFilters({ endDate: date || undefined });
        if (selectedMergeTickets.length > 0) handleResetSelection();
    };

    const handleClearAllFilters = () => {
        setSelectedCategory('');
        setSelectedLocation('');
        updateFilters({ categoryId: undefined, locationId: undefined });
        if (selectedMergeTickets.length > 0) handleResetSelection();
    };

    // if (isLoading) return <LoadingSpinner isLoading={true} message="กำลังโหลดข้อมูลปัญหา..." />;

    return (
        <div className="audit-issues-container">
            <ToastAlert
                error={loading.error}
                success={loading.success}
                onDismiss={reset}
            />
            <div className="audit-issues-filter-container">
                <div className="searchbar">
                    <SearchBar onSearch={handleSearch} />
                </div>
                <div className='filter-date-responsive-audit'>
                    <TicketDateFilter
                        startDate={startDate}
                        endDate={endDate}
                        onStartDateChange={handleStartDateChange}
                        onEndDateChange={handleEndDateChange}
                        disabled={loading.isLoading}
                    />
                </div>
                <div className="filter-panel-responsive-audit">
                    <AdvancedFilterPanel
                        onClearAll={handleClearAllFilters}
                        activeFilterCount={activeDropdownFiltersCount}
                    >
                        {/* โยนเข้าไปเฉพาะ 2 ตัวกรองที่ต้องการ */}
                        <TicketCategoryFilter selectedValue={selectedCategory} onChange={handleCategoryFilter} />
                        <TicketLocationFilter selectedValue={selectedLocation} onChange={handleLocationFilter} />
                    </AdvancedFilterPanel>
                </div>
            </div>
            <div className="audit-issues-content">
                <div className="audit-issues-card-list">
                    {tickets.map((ticket, index) => {

                        const isSelected = selectedMergeTickets.some(t => t.ticketId === ticket.ticketId);

                        return (
                            <div
                                ref={tickets.length === index + 1 ? lastTicketElementRef : null}
                                key={ticket.ticketId}
                                className={`audit-card-wrapper ${activePanelTab === 'manage' ? 'disabled-card' : ''}`}
                            >
                                <CardPendingProblem
                                    data={ticket}
                                    isMergeMode={activePanelTab === 'merge' || activePanelTab === 'urgent'}
                                    isSelected={isSelected}
                                    onSelect={() => handleSelectTicket(ticket)}
                                    showSubTicketBadge={true}
                                />
                            </div>
                        );
                    })}

                    {!isLoading && tickets.length === 0 && (
                        <div className="no-result">
                            <img src="/empty-state.png" alt="empty-state" />
                            <span>ไม่พบรายการสถานะนี้</span>
                        </div>
                    )}

                    {isFetchingNextPage && (
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                            กำลังโหลดปัญหาเพิ่มเติม... ⏳
                        </div>
                    )}
                </div>
                <aside className={`audit-right-panel ${isMobilePanelOpen ? 'open' : ''}`}>
                    {/* Overlay สำหรับปิด Panel บนมือถือ */}
                    {isMobilePanelOpen && (
                        <div className="panel-overlay" onClick={() => setIsMobilePanelOpen(false)}></div>
                    )}

                    <div className="panel-content-wrapper">
                        {/* Header สำหรับปิด Panel บนมือถือ */}
                        <div className="panel-close-header">
                            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#334155' }}>จัดการปัญหา</h3>
                            <button className="btn-close-panel" onClick={() => setIsMobilePanelOpen(false)}>
                                <FaTimes />
                            </button>
                        </div>

                        <MergeManagementPanel
                            activeTab={activePanelTab}
                            onTabChange={handleTabChange}
                            allTickets={tickets}
                            selectedTickets={selectedMergeTickets}
                            groupedTicketsFromApi={ticketGroups}
                            isLoadingGroups={isLoadingGroups}
                            onUnmergeAction={handleUnmergeAction}
                            onReset={handleResetSelection}
                            onConfirm={activePanelTab === 'urgent' ? handleConfirmUrgent : handleConfirmMerge}
                            onRemoveTicket={handleRemoveSelectedTicket}
                            isLoading={false}
                        />
                    </div>
                </aside>

                {/* Floating Button สำหรับเปิด Panel บนหน้าจอเล็ก */}
                <button
                    className="btn-floating-panel"
                    onClick={() => setIsMobilePanelOpen(true)}
                >
                    <FaTasks /> จัดการปัญหา
                    {selectedMergeTickets.length > 0 && (
                        <span className="floating-badge">{selectedMergeTickets.length}</span>
                    )}
                </button>
            </div>
            <ConfirmButton
                isOpen={confirmMergeModal.isOpen}
                title="ยืนยันการรวมกลุ่มปัญหา"
                message={`คุณแน่ใจหรือไม่ว่าต้องการนำปัญหาจำนวน ${selectedMergeTickets.length - 1} รายการ ไปรวมกับตั๋วหลัก (Main Ticket: ${selectedMergeTickets[0]?.ticketId})? ระบบจะทำการย้ายผู้โหวตทั้งหมดไปที่ตั๋วหลักอัตโนมัติ`}
                onConfirm={submitMerge}
                onCancel={() => setConfirmMergeModal({ isOpen: false })}
                confirmText={loading.isLoading ? "กำลังประมวลผล..." : "ยืนยันการรวมตั๋ว"}
                cancelText="ปิด"
                isLoading={loading.isLoading}
            />

            <ConfirmButton
                isOpen={confirmUnmergeModal.isOpen}
                title={
                    confirmUnmergeModal.type === 'single'
                        ? "ยืนยันการแยกรายการปัญหา"
                        : "ยืนยันการยุบกลุ่มปัญหา (Disband Group)"
                }
                message={
                    confirmUnmergeModal.type === 'single'
                        ? `คุณแน่ใจหรือไม่ว่าต้องการแยกรายการปัญหา ${confirmUnmergeModal.payload?.subTicketId} ออกจากกลุ่มนี้? ปัญหานี้จะกลับไปแสดงที่หน้ากระดานรอดำเนินการตามปกติ`
                        : `คุณแน่ใจหรือไม่ว่าต้องการ "ยุบกลุ่ม" ปัญหาหลัก ${confirmUnmergeModal.payload?.mainTicketId}? รายการปัญหาย่อยทั้งหมดในกลุ่มนี้จะถูกแยกตัวออก และกลับไปแสดงบนหน้ากระดานตามปกติ`
                }
                onConfirm={submitUnmerge}
                onCancel={() => setConfirmUnmergeModal({ isOpen: false, payload: null, type: null })}
                confirmText={
                    loading.isLoading
                        ? "กำลังประมวลผล..."
                        : (confirmUnmergeModal.type === 'single' ? "ยืนยันการแยก" : "ยืนยันการยุบกลุ่ม")
                }
                cancelText="ปิด"
                isLoading={loading.isLoading}
            />

            {/* ตัวแปรช่วยคำนวณจำนวนตั๋วลูกเพื่อแสดงใน Modal */}
            {(() => {
                const totalSubTickets = selectedMergeTickets.reduce((sum, t) => sum + (t._count?.subTickets || 0), 0);
                const subTicketMessage = totalSubTickets > 0 ? ` (และตั๋วลูกที่เกี่ยวข้องกันอีก ${totalSubTickets} รายการ)` : '';

                return (
                    <ConfirmButton
                        isOpen={confirmUrgentModal.isOpen}
                        title="ยืนยันการตั้งเป็นตั๋วด่วน"
                        message={`คุณแน่ใจหรือไม่ว่าต้องการตั้งค่าตั๋วจำนวน ${selectedMergeTickets.length} รายการ${subTicketMessage} ให้เป็นตั๋วด่วนพิเศษ?`}
                        onConfirm={submitUrgentTickets}
                        onCancel={() => setConfirmUrgentModal({ isOpen: false })}
                        confirmText={loading.isLoading ? "กำลังประมวลผล..." : "ยืนยัน"}
                        cancelText="ปิด"
                        isLoading={loading.isLoading}
                    />
                );
            })()}
        </div>
    )
}

export default AuditIssues