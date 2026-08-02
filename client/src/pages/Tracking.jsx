import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';

// Custom Hooks
import { useLoadingState } from '../hooks/useLoadingState.js';
import { useTickets } from '../hooks/useTickets.js';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll.js';

// Components
import { LoadingSpinner, ToastAlert } from '../components/LoadingSpinner.jsx';
import { SearchBar } from '../components/SearchBar.jsx';
import { CardPendingProblem } from '../components/CardPendingProblem.jsx';
import { TrackingSidebar } from '../components/TrackingSidebar.jsx';
import { ConfirmButton } from '../components/ConfirmButton.jsx';
import { StarRating } from '../components/StarRating.jsx';
import { FeedbackModal } from '../components/FeedbackModal.jsx';
import { TicketActionMenu } from '../components/TicketActionMenu.jsx';

import { TicketCategoryFilter } from '../components/TicketCategoryFilter.jsx';
import { TicketLocationFilter } from '../components/TicketLocationFilter.jsx';
import { TicketStatusFilter } from '../components/TIcketStatusFilter.jsx';
import { AdvancedFilterPanel } from '../components/AdvancedFilterPanel.jsx';


// Services
import { ticketService } from '../services/ticketService.js';

// Styles & Icons
import './pageStyles/Tracking.css';

const Tracking = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const { loading, startLoading, setError, setSuccess, reset } = useLoadingState();
    const [selectedStatus, setSelectedStatus] = useState('pending,in_progress,duplicate,resolved,rejected');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');
    const {
        tickets, isLoading, isFetchingNextPage, pagination,
        changePage, updateFilters, refetch, removeTicket, updateTicketStatus
    } = useTickets({ isPersonalView: true, status: selectedStatus }, 'personal');
    const [activeTab, setActiveTab] = useState('all');
    const [sidebarCounts, setSidebarCounts] = useState({
        all: 0,
        mine: 0,
        upvoted: 0,
        review: 0
    });
    const allowedStatuses = ['pending', 'in_progress', 'duplicate', 'resolved', 'rejected'];
    const [confirmCancelVote, setConfirmCancelVote] = useState({
        isOpen: false,
        ticketId: null
    });
    const [feedbackModal, setFeedbackModal] = useState({
        isOpen: false,
        ticketId: null
    });

    // Cancel Ticket State
    const [confirmSingleCancel, setConfirmSingleCancel] = useState({ isOpen: false, ticketId: null });

    const activeDropdownFiltersCount =
        (selectedCategory ? 1 : 0) +
        (selectedLocation ? 1 : 0) +
        (selectedStatus !== 'pending,in_progress,duplicate,resolved,rejected' ? 1 : 0);


    const lastTicketElementRef = useInfiniteScroll({
        isLoading: isLoading,
        isFetchingNextPage: isFetchingNextPage,
        hasNextPage: pagination?.hasNextPage,
        onLoadMore: () => changePage(pagination.currentPage + 1)
    });

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);

        const baseFilters = {
            reporterId: undefined,
            upvoterId: undefined,
            needsReviewBy: undefined,
            status: selectedStatus,
            search: undefined
        };

        if (tabId === 'mine') {
            updateFilters({ ...baseFilters, reporterId: user?.userId });
        } else if (tabId === 'upvoted') {
            updateFilters({ ...baseFilters, upvoterId: user?.userId });
        } else if (tabId === 'review') {
            updateFilters({ ...baseFilters, needsReviewBy: user?.userId });
        } else {
            updateFilters(baseFilters);
        }
    };

    // Search functionality
    const handleSearch = (keyword) => {
        updateFilters({ search: keyword });
    };

    const handleCategoryFilter = (categoryId) => {
        setSelectedCategory(categoryId || '');
        updateFilters({ categoryId: categoryId || undefined });
    };

    const handleLocationFilter = (locationId) => {
        setSelectedLocation(locationId || '');
        updateFilters({ locationId: locationId || undefined });
    };

    const handleStatusFilter = (status) => {
        setSelectedStatus(status || '');
        updateFilters({ status: status || undefined });
    };

    const handleClearAllFilters = () => {
        setSelectedCategory('');
        setSelectedLocation('');
        setSelectedStatus('pending,in_progress,duplicate,resolved,rejected');
        updateFilters({ categoryId: undefined, locationId: undefined, status: 'pending,in_progress,duplicate,resolved,rejected' });
    };

    const handleCancelVoteClick = (ticketId) => {
        setConfirmCancelVote({ isOpen: true, ticketId });
    };

    const handleConfirmCancelVote = async () => {
        if (!confirmCancelVote.ticketId) return;

        startLoading();
        try {
            const result = await ticketService.upvoteTicket(confirmCancelVote.ticketId);

            if (result.success) {
                removeTicket(confirmCancelVote.ticketId);
                setSuccess("ยกเลิกการโหวตและติดตามปัญหานี้สำเร็จเรียบร้อยแล้ว");
                setConfirmCancelVote({ isOpen: false, ticketId: null });
                await refetch();
                fetchSidebarCounts();
            }
        } catch (error) {
            console.error("Error canceling vote:", error);
            setError(error.response?.data?.message || "เกิดข้อผิดพลาดในการยกเลิกโหวต");
            setConfirmCancelVote({ isOpen: false, ticketId: null });
        }
    };

    const handleCloseCancelVoteModal = () => {
        setConfirmCancelVote({ isOpen: false, ticketId: null });
        reset();
    };

    const handleFeedbackSubmit = async (ticketId, payload) => {
        startLoading();
        try {
            const result = await ticketService.submitFeedback(ticketId, payload);

            if (result.success) {
                updateTicketStatus(ticketId, 'resolved');
                setSuccess("ส่งผลการประเมินสำเร็จ ขอบคุณสำหรับความคิดเห็นครับ");
                setFeedbackModal({ isOpen: false, ticketId: null });
                await refetch();
                fetchSidebarCounts();
            }
        } catch (error) {
            console.error("Error submitting feedback:", error);
            setError(error.response?.data?.message || "เกิดข้อผิดพลาดในการส่งประเมิน", "error");
        }
    };

    // แสดง Toast Alert เมื่อมีการส่งข้อความผ่าน location state (เช่น หลังจากแก้ไขปัญหาเสร็จ)
    useEffect(() => {
        if (location.state?.showToast && location.state?.message) {
            setSuccess(location.state.message);
            // ล้าง state เพื่อไม่ให้แสดงซ้ำ
            window.history.replaceState({}, document.title);
        }
    }, [location.state, setSuccess]);

    // Sync active tab with URL query parameter on initial load
    useEffect(() => {
        const tabFromUrl = searchParams.get('tab');
        if (tabFromUrl && ['all', 'mine', 'upvoted', 'review'].includes(tabFromUrl)) {
            handleTabChange(tabFromUrl);
        }
    }, []);

    const fetchSidebarCounts = async () => {
        if (!user?.userId) return;

        try {
            const [allCount, mineCount, upvotedCount, reviewCount] = await Promise.all([
                ticketService.getTicketsCount({ isPersonalView: true, status: allowedStatuses.join(',') }),
                ticketService.getTicketsCount({ reporterId: user.userId, status: allowedStatuses.join(',') }),
                ticketService.getTicketsCount({ upvoterId: user.userId, status: allowedStatuses.join(',') }),
                ticketService.getTicketsCount({ needsReviewBy: user.userId })
            ]);

            setSidebarCounts({
                all: allCount,
                mine: mineCount,
                upvoted: upvotedCount,
                review: reviewCount
            });
        } catch (error) {
            console.error('Error fetching sidebar counts:', error);
        }
    };

    useEffect(() => {
        fetchSidebarCounts();
    }, [user]);

    const handleSingleCancelClick = (ticketId) => {
        setConfirmSingleCancel({ isOpen: true, ticketId });
    };

    const submitSingleCancel = async () => {
        if (!confirmSingleCancel.ticketId) return;
        startLoading();
        try {
            const result = await ticketService.cancelTicket(confirmSingleCancel.ticketId);
            if (result.success) {
                removeTicket(confirmSingleCancel.ticketId);
                setSuccess(`ยกเลิกรายการแจ้งปัญหาสำเร็จ`);
                setConfirmSingleCancel({ isOpen: false, ticketId: null });
                await refetch();
                fetchSidebarCounts();
            }
        } catch (error) {
            setError(error.response?.data?.message || "เกิดข้อผิดพลาดในการยกเลิกรายการ");
            setConfirmSingleCancel({ isOpen: false, ticketId: null });
        }
    };

    if (!user) {
        return <div style={{ textAlign: 'center', marginTop: '50px' }}>Authentication required</div>;
    }
    return (
        <div className="tracking-page-layout">
            <LoadingSpinner
                isLoading={loading.isLoading}
                message="กำลังประมวลผล..."
            />
            <ToastAlert
                error={loading.error}
                success={loading.success}
                onDismiss={reset}
            />
            <TrackingSidebar
                activeTab={activeTab}
                onTabChange={handleTabChange}
                counts={sidebarCounts}
            />
            <main className="tracking-main-content">
                {/* แถบเครื่องมือด้านบน (ค้นหา + Dropdowns) */}
                <div className="top-toolbar-tracking" style={{ flexWrap: 'wrap' }}>
                    <div className="searchbar">
                        <SearchBar onSearch={handleSearch} />
                    </div>
                    <div className="filter-panel-responsive-tracking">
                        <AdvancedFilterPanel
                            onClearAll={handleClearAllFilters}
                            activeFilterCount={activeDropdownFiltersCount}
                        >
                            {/* ซ่อน Dropdown ทั้งหมดไว้ใน Component นี้ */}
                            <TicketCategoryFilter selectedValue={selectedCategory} onChange={handleCategoryFilter} />
                            <TicketLocationFilter selectedValue={selectedLocation} onChange={handleLocationFilter} />
                            <TicketStatusFilter selectedValue={selectedStatus} onChange={handleStatusFilter} allOptionValue="pending,in_progress,duplicate,resolved,rejected" />
                        </AdvancedFilterPanel>
                    </div>
                </div>

                {/* พื้นที่แสดงการ์ด */}
                <div className="ticket-grid">
                    {tickets.map((ticket, index) => (
                        <div ref={tickets.length === index + 1 ? lastTicketElementRef : null} key={ticket.ticketId}>
                            <CardPendingProblem
                                data={ticket}
                                isMergeMode={false}
                                actionSlot={
                                    <TicketActionMenu
                                        ticket={ticket}
                                        currentUserId={user?.userId}
                                        onEdit={(id) => navigate(`/edit-issue?ticketId=${id}`)}
                                        onCancelVote={(id) => handleCancelVoteClick(id)}
                                        onFeedback={(id) => setFeedbackModal({ isOpen: true, ticketId: id })}
                                        onCancelTicket={(id) => handleSingleCancelClick(id)}
                                    />
                                }
                            />
                        </div>
                    ))}

                    {!isLoading && tickets.length === 0 && (
                        <div className="no-result-tracking">
                            <img src="/empty-state.png" alt="empty-state" />
                            <span>ไม่พบรายการสถานะนี้</span>
                        </div>
                    )}
                </div>
            </main>
            <ConfirmButton
                isOpen={confirmCancelVote.isOpen}
                title="ยืนยันการยกเลิกโหวต"
                message="คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการติดตามและการโหวตปัญหานี้? หากยกเลิก คุณจะไม่ได้รับการแจ้งเตือนเมื่อปัญหานี้ได้รับการแก้ไข"
                onConfirm={handleConfirmCancelVote}
                onCancel={handleCloseCancelVoteModal}
                confirmText={loading.isLoading ? "กำลังดำเนินการ..." : "ยืนยันยกเลิก"}
                cancelText="ปิด"
                isLoading={loading.isLoading}
            />

            <FeedbackModal
                isOpen={feedbackModal.isOpen}
                onClose={() => setFeedbackModal({ isOpen: false, ticketId: null })}
                onSubmit={handleFeedbackSubmit}
                ticketId={feedbackModal.ticketId}
                isLoading={loading.isLoading}
            />

            <ConfirmButton
                isOpen={confirmSingleCancel.isOpen}
                title="ยืนยันการยกเลิกรายการ"
                message="คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการแจ้งปัญหานี้? (การกระทำนี้ไม่สามารถย้อนกลับได้)"
                onConfirm={submitSingleCancel}
                onCancel={() => setConfirmSingleCancel({ isOpen: false, ticketId: null })}
                confirmText={loading.isLoading ? "กำลังดำเนินการ..." : "ยืนยันยกเลิก"}
                cancelText="ปิด"
                isLoading={loading.isLoading}
            />
        </div>
    );
}

export default Tracking;