import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate, useSearchParams, useLocation  } from 'react-router-dom';

// Custom Hooks
import { useLoadingState } from '../hooks/useLoadingState.js';
import { useTickets } from '../hooks/useTickets.js';

// Components
import { LoadingSpinner, ToastAlert } from '../components/LoadingSpinner.jsx';
import { SearchBar } from '../components/SearchBar.jsx';
import { CardPendingProblem } from '../components/CardpendingProblem.jsx';
import { TrackingSidebar } from '../components/TrackingSidebar.jsx';
import { ConfirmButton } from '../components/ConfirmButton.jsx';
import { StarRating } from '../components/StarRating.jsx';

// Services
import { ticketService } from '../services/ticketService.js';

// Styles & Icons
import './pageStyles/Tracking.css';
import { FaCaretDown, FaEdit, FaThumbsUp } from "react-icons/fa";

const Tracking = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation(); 
    const [searchParams] = useSearchParams();
    const { loading, startLoading, setError, setSuccess, reset } = useLoadingState();
    const {
        tickets, isLoading, isFetchingNextPage, pagination,
        changePage, updateFilters, refetch
    } = useTickets({ isPersonalView: true });
    const [activeTab, setActiveTab] = useState('all');
    const [confirmCancelVote, setConfirmCancelVote] = useState({
        isOpen: false,
        ticketId: null
    });

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);

        const baseFilters = {
            reporterId: undefined,
            upvoterId: undefined,
            needsReviewBy: undefined,
            status: undefined,
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

    const handleStatusFilter = (e) => {
        const status = e.target.value;
        updateFilters({ status: status === 'all' ? undefined : status });
    };

    const observerRef = useRef();
    const lastTicketElementRef = useCallback(node => {
        if (isLoading || isFetchingNextPage) return;
        if (observerRef.current) observerRef.current.disconnect();
        observerRef.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && pagination.hasNextPage) {
                changePage(pagination.currentPage + 1);
            }
        });
        if (node) observerRef.current.observe(node);
    }, [isLoading, isFetchingNextPage, pagination.hasNextPage, pagination.currentPage, changePage]);

    const handleCancelVoteClick = (ticketId) => {
        setConfirmCancelVote({ isOpen: true, ticketId });
    };

    const handleConfirmCancelVote = async () => {
        if (!confirmCancelVote.ticketId) return;

        startLoading();
        try {
            const result = await ticketService.upvoteTicket(confirmCancelVote.ticketId);

            if (result.success) {
                setSuccess("ยกเลิกการโหวตและติดตามปัญหานี้สำเร็จเรียบร้อยแล้ว");
                setConfirmCancelVote({ isOpen: false, ticketId: null });
                refetch();
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

    useEffect(() => {
        if (location.state?.showToast && location.state?.message) {
            setSuccess(location.state.message);
            // ล้าง state เพื่อไม่ให้แสดงซ้ำ
            window.history.replaceState({}, document.title);
        }
    }, [location.state, setSuccess]);

    useEffect(() => {
        const tabFromUrl = searchParams.get('tab');
        if (tabFromUrl && ['all', 'mine', 'upvoted', 'review'].includes(tabFromUrl)) {
            handleTabChange(tabFromUrl);
        }
    }, []);

    const renderTicketActions = (ticket, isOwner) => {
        const isPending = ticket.ticketStatus === 'pending';
        const isResolved = ticket.ticketStatus === 'resolved';
        const needsReview = isOwner && isResolved && ticket.rating === null;

        // ลอจิก 1: รอการประเมิน (โชว์ Mockup โหวตดาว)
        if (needsReview) {
            return (
                <div
                    className="review-badge-wrapper"
                    onClick={(e) => {
                        e.stopPropagation();
                        console.log("เปิด Modal ให้คะแนนตั๋ว:", ticket.ticketId);
                    }}
                >
                    <StarRating />
                </div>
            );
        }
        // ลอจิก 2: ปุ่มของเจ้าของตั๋ว (ปุ่มแก้ไข)
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
        // ลอจิก 3: ปุ่มของคนที่มาโหวต (ปุ่มยกเลิกโหวต)
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
            />
            <main className="tracking-main-content">
                {/* แถบเครื่องมือด้านบน (ค้นหา + Dropdowns) */}
                <div className="top-toolbar">
                    <div className="searchbar">
                        <SearchBar onSearch={handleSearch} />
                    </div>
                    {/* <div className="filter-dropdowns">
                        <div className="status-filter-wrapper" >
                            <select className="custom-select" onChange={handleStatusFilter}>
                                <option value="all">สถานะทั้งหมด</option>
                                <option value="pending">รอรับเรื่อง</option>
                                <option value="in_progress">กำลังดำเนินการ</option>
                                <option value="resolved">เสร็จสิ้น</option>
                            </select> <FaCaretDown className="filter-icons" />
                        </div>
                    </div> */}
                </div>

                {/* พื้นที่แสดงการ์ด */}
                <div className="ticket-grid">
                    {isLoading && tickets.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '20px' }}>กำลังโหลดข้อมูล...</div>
                    )}

                    {tickets.map((ticket, index) => {
                        // 🌟 เช็คว่าคนที่ล็อกอินอยู่ เป็นคนแจ้งตั๋วใบนี้หรือไม่
                        const isTicketOwner = ticket.user?.userId === user?.userId;
                        return (
                            <div ref={tickets.length === index + 1 ? lastTicketElementRef : null} key={ticket.ticketId}>
                                <CardPendingProblem
                                    data={ticket}
                                    actionSlot={renderTicketActions(ticket, isTicketOwner)}
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
        </div>
    );
}

export default Tracking;