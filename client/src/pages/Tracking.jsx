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
import { CardPendingProblem } from '../components/CardpendingProblem.jsx';
import { TrackingSidebar } from '../components/TrackingSidebar.jsx';
import { ConfirmButton } from '../components/ConfirmButton.jsx';
import { StarRating } from '../components/StarRating.jsx';
import { FeedbackModal } from '../components/FeedbackModal.jsx';

// Services
import { ticketService } from '../services/ticketService.js';

// Styles & Icons
import './pageStyles/Tracking.css';
import { FaCaretDown, FaEdit, FaThumbsUp, FaStar } from "react-icons/fa";

const Tracking = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const { loading, startLoading, setError, setSuccess, reset } = useLoadingState();
    const [selectedStatus, setSelectedStatus] = useState('pending,in_progress,duplicate,resolved');
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
    const allowedStatuses = ['pending', 'in_progress', 'duplicate', 'resolved'];
    const [confirmCancelVote, setConfirmCancelVote] = useState({
        isOpen: false,
        ticketId: null
    });
    const [feedbackModal, setFeedbackModal] = useState({
        isOpen: false,
        ticketId: null
    });

    const [isCancelMode, setIsCancelMode] = useState(false);
    const [selectedToCancel, setSelectedToCancel] = useState([]);
    const [confirmCancelSubmit, setConfirmCancelSubmit] = useState({ isOpen: false });
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
            status: allowedStatuses.join(','),
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

    const handleSearch = (keyword) => {
        updateFilters({ search: keyword });
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

    const handleToggleCancelMode = () => {
        setIsCancelMode(!isCancelMode);
        setSelectedToCancel([]); // ล้างค่าที่เลือกไว้เสมอเมื่อเปิด/ปิดโหมด
    };

    const handleSelectToCancel = (ticketId) => {
        setSelectedToCancel(prev =>
            prev.includes(ticketId)
                ? prev.filter(id => id !== ticketId) // ถ้ามีอยู่แล้วให้เอาออก
                : [...prev, ticketId] // ถ้ายังไม่มีให้เพิ่มเข้าไป
        );
    };

    const handleConfirmCancelSubmit = async () => {
        startLoading();
        try {
            const cancelPromises = selectedToCancel.map(id => ticketService.cancelTicket(id));
            await Promise.all(cancelPromises);

            selectedToCancel.forEach(ticketId => {
                removeTicket(ticketId);
            });

            setSuccess(`ยกเลิกรายการแจ้งปัญหาจำนวน ${selectedToCancel.length} รายการสำเร็จ`);

            setIsCancelMode(false);
            setSelectedToCancel([]);
            setConfirmCancelSubmit({ isOpen: false });
            // ✅ รอให้ Backend sync ข้อมูลเสร็จ
            await refetch();
            fetchSidebarCounts();

        } catch (error) {
            console.error("Error bulk canceling tickets:", error);
            setError(error.response?.data?.message || "เกิดข้อผิดพลาดในการยกเลิกรายการ");
            setConfirmCancelSubmit({ isOpen: false });
        }
    };

    const renderTicketActions = (ticket, isOwner) => {
        const isPending = ticket.ticketStatus === 'pending';
        const isResolved = ticket.ticketStatus === 'resolved';
        const needsReview = isOwner && isResolved && ticket.rating === null;
        const afterReview = isOwner && isResolved && ticket.rating !== null;

        if (needsReview) {
            return (
                <button
                    className="badge-btn badge-feedback"
                    onClick={(e) => {
                        e.stopPropagation();
                        setFeedbackModal({ isOpen: true, ticketId: ticket.ticketId });
                    }}
                >
                    Feedback  <FaStar className="star-icons" />
                </button>
            );
        }
        // after review แล้ว ไม่แสดงปุ่มอะไรเลย
        if (afterReview) {
            return (<div></div>);
        }

        if (isOwner) {
            return (
                <button
                    className="badge-btn badge-edit"
                    disabled={!isPending} // Disable ถ้าไม่ใช่ pending
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/edit-issue?ticketId=${ticket.ticketId}`);
                    }}
                >
                    แก้ไข <FaEdit />
                </button>
            );
        }
        else {
            return (
                <button
                    className="badge-btn badge-upvote badge-cancel-hover"
                    disabled={!isPending} // Disable ถ้าไม่ใช่ pending
                    onClick={(e) => {
                        e.stopPropagation();
                        handleCancelVoteClick(ticket.ticketId);
                    }}
                >
                    <span className="default-text">Voted < FaThumbsUp className="thumbsup-icons" /></span>
                    <span className="hover-text">ยกเลิกโหวต ✕</span>
                </button>
            );
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
                <div className="top-toolbar" style={{ flexWrap: 'wrap' }}>
                    <div className="searchbar">
                        <SearchBar onSearch={handleSearch} />
                    </div>

                    {/* โซนปุ่มเปิด/ปิดโหมด ยกเลิกแจ้ง */}
                    <div className="cancel-mode-controls">
                        {!isCancelMode ? (
                            <button
                                className="btn-enter-cancel-mode"
                                onClick={handleToggleCancelMode}
                                disabled={tickets.length === 0}
                            >
                                จัดการรายการ (ยกเลิกแจ้ง)
                            </button>
                        ) : (
                            <div className="cancel-actions-active">
                                <button className="btn-exit-cancel-mode" onClick={handleToggleCancelMode}>
                                    ✕ ออกจากโหมดเลือก
                                </button>
                                <button
                                    className="btn-confirm-cancel-bulk"
                                    disabled={selectedToCancel.length === 0}
                                    onClick={() => setConfirmCancelSubmit({ isOpen: true })}
                                >
                                    ยืนยันการยกเลิก ({selectedToCancel.length})
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* พื้นที่แสดงการ์ด */}
                <div className="ticket-grid">
                    {isLoading && tickets.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '20px' }}>กำลังโหลดข้อมูล...</div>
                    )}

                    {tickets.map((ticket, index) => {
                        const isTicketOwner = ticket.user?.userId === user?.userId;
                        const isPending = ticket.ticketStatus === 'pending';
                        const canBeCanceled = isTicketOwner && isPending;
                        const shouldDimCard = isCancelMode && !canBeCanceled;
                        return (
                            <div
                                ref={tickets.length === index + 1 ? lastTicketElementRef : null}
                                key={ticket.ticketId}
                                style={{
                                    opacity: shouldDimCard ? 0.4 : 1,
                                    pointerEvents: shouldDimCard ? 'none' : 'auto',
                                    transition: 'all 0.3s ease',
                                }}
                            >
                                <CardPendingProblem
                                    data={ticket}
                                    actionSlot={isCancelMode ? null : renderTicketActions(ticket, isTicketOwner)}

                                    isMergeMode={isCancelMode && canBeCanceled}
                                    isSelected={selectedToCancel.includes(ticket.ticketId)}
                                    onSelect={() => handleSelectToCancel(ticket.ticketId)}
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
                isOpen={confirmCancelSubmit.isOpen}
                title="ยืนยันการยกเลิกการแจ้งปัญหา"
                message={`คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการแจ้งปัญหาจำนวน ${selectedToCancel.length} รายการที่เลือกไว้? (การกระทำนี้ไม่สามารถย้อนกลับได้)`}
                onConfirm={handleConfirmCancelSubmit}
                onCancel={() => setConfirmCancelSubmit({ isOpen: false })}
                confirmText={loading.isLoading ? "กำลังประมวลผล..." : "ยืนยันยกเลิก"}
                cancelText="ปิด"
                isLoading={loading.isLoading}
            />
        </div>
    );
}

export default Tracking;