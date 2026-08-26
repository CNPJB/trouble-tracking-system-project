import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

// Styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './IssueManagement.css';

// Custom hooks
import { useAuth } from '../../context/AuthContext.jsx';
import { useTickets } from '../../hooks/useTickets.js';
import { useUrgentTickets } from '../../hooks/useUrgentTickets.js';

// Components
import { CardPendingProblem, CardPendingSkeleton } from '../../components/CardPendingProblem.jsx';
import { LoadingSpinner } from '../../components/LoadingSpinner.jsx';
import { FaFire, FaClipboardList, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { SearchBar } from '../../components/SearchBar.jsx'
import { TicketCategoryFilter } from '../../components/TicketCategoryFilter.jsx';
import { TicketLocationFilter } from '../../components/TicketLocationFilter.jsx';
import { TicketStatusFilter } from '../../components/TIcketStatusFilter.jsx';
import { ToggleSwitch } from '../../components/componentsAdmin/ToggleSwitch.jsx';
import { AdvancedFilterPanel } from '../../components/AdvancedFilterPanel.jsx';
import { TicketDateFilter } from '../../components/TicketDateFilter.jsx';

const IssueManagement = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [selectedStatus, setSelectedStatus] = useState('pending,in_progress');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');
    const [searchKeyword, setSearchKeyword] = useState('');
    const [isMyTasksOnly, setIsMyTasksOnly] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const { tickets: normalTickets, isLoading, pagination, changePage, updateFilters
    } = useTickets({
        status: selectedStatus,
        limit: 12,
        excludeSubTickets: true
    }, 'standard');

    const { urgentTickets, isLoadingUrgent } = useUrgentTickets();

    const activeDropdownFiltersCount =
        (selectedCategory ? 1 : 0) +
        (selectedLocation ? 1 : 0) +
        (selectedStatus !== 'pending,in_progress' ? 1 : 0);

    const hasActiveFilter = Boolean(
        searchKeyword || selectedCategory || selectedLocation || isMyTasksOnly || startDate || endDate
    );

    // ==========================================
    // โซนฟังก์ชันจัดการ UI & Filters
    // ==========================================

    // ฟังก์ชันจัดการเมื่อกดปุ่ม Toggle
    const handleToggleMyTasks = () => {
        const newValue = !isMyTasksOnly;
        setIsMyTasksOnly(newValue);
        updateFilters({ adminId: newValue ? user?.userId : undefined });
    };

    const handleSearch = (keyword) => {
        setSearchKeyword(keyword);
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

    const handleStartDateChange = (date) => {
        setStartDate(date);
        updateFilters({ startDate: date || undefined });
    };

    const handleEndDateChange = (date) => {
        setEndDate(date);
        updateFilters({ endDate: date || undefined });
    };

    const handleClearAllFilters = () => {
        setSelectedCategory('');
        setSelectedLocation('');
        setSelectedStatus('pending,in_progress');
        updateFilters({ categoryId: undefined, locationId: undefined, status: 'pending,in_progress' });
    };

    const handleCardClick = (ticketId) => {
        navigate(`/adminPage/IssueManagement/${ticketId}`);
    };

    const renderPagination = () => {
        if (!pagination || pagination.totalPages <= 1) return null;

        const pages = [];
        for (let i = 1; i <= pagination.totalPages; i++) {
            pages.push(
                <button
                    key={i}
                    className={`page-btn ${pagination.currentPage === i ? 'active' : ''}`}
                    onClick={() => changePage(i)}
                >
                    {i}
                </button>
            );
        }

        return (
            <div className="pagination-container">
                <button
                    className="page-btn nav-btn"
                    disabled={!pagination.hasPrevPage}
                    onClick={() => changePage(pagination.currentPage - 1)}
                >
                    <FaChevronLeft />
                </button>

                <div className="page-numbers">
                    {pages}
                </div>

                <button
                    className="page-btn nav-btn"
                    disabled={!pagination.hasNextPage}
                    onClick={() => changePage(pagination.currentPage + 1)}
                >
                    <FaChevronRight />
                </button>
            </div>
        );
    };

    // if (isLoading) return <LoadingSpinner isLoading={true} message="กำลังโหลดข้อมูลปัญหา..." />;

    return (
        <div className="issue-management-container">
            <div className="top-toolbar-modern">
                <div className="searchbar">
                    <SearchBar onSearch={handleSearch} />
                </div>
                <div className='filter-date-responsive-admin'>
                    <TicketDateFilter
                        startDate={startDate}
                        endDate={endDate}
                        onStartDateChange={handleStartDateChange}
                        onEndDateChange={handleEndDateChange}
                        disabled={isLoading}
                    />
                </div>
                <div className="filter-panel-responsive" style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <AdvancedFilterPanel
                        onClearAll={handleClearAllFilters}
                        activeFilterCount={activeDropdownFiltersCount}
                        rightActions={
                            <ToggleSwitch
                                id="my-tasks-toggle"
                                label="งานของฉัน"
                                checked={isMyTasksOnly}
                                onChange={handleToggleMyTasks}
                            />
                        }
                    >
                        {/* ซ่อน Dropdown ทั้งหมดไว้ใน Component นี้ */}
                        <TicketCategoryFilter selectedValue={selectedCategory} onChange={handleCategoryFilter} />
                        <TicketLocationFilter selectedValue={selectedLocation} onChange={handleLocationFilter} />
                        <TicketStatusFilter selectedValue={selectedStatus} onChange={handleStatusFilter} allowedStatuses={['pending', 'in_progress']} allOptionValue="pending,in_progress" />
                    </AdvancedFilterPanel>
                </div>
            </div>

            {/* Section 1: สไลด์โชว์ปัญหาเร่งด่วน */}
            {!hasActiveFilter && urgentTickets.length > 0 && pagination?.currentPage === 1 && selectedStatus.includes('pending') && (
                <div className="urgent-section">
                    <h2 className="section-title urgent-title">
                        <FaFire /> ปัญหาเร่งด่วน (Top 5)
                    </h2>
                    <Swiper
                        modules={[Navigation, Pagination, Autoplay]}
                        spaceBetween={20}
                        slidesPerView={1}
                        navigation
                        pagination={{ clickable: true }}
                        autoplay={{ delay: 5000, disableOnInteraction: false }}
                        breakpoints={{
                            430: { slidesPerView: 1 },
                            860: { slidesPerView: 2 },
                            1200: { slidesPerView: 2 },
                            1536: { slidesPerView: 2 },
                            1920: { slidesPerView: 3 }
                        }}
                        className="urgent-swiper"
                    >
                        {urgentTickets.map(ticket => (
                            <SwiperSlide key={ticket.ticketId}>
                                <div className="clickable-card-wrapper urgent-card">
                                    <CardPendingProblem
                                        data={ticket}
                                        isMergeMode={false}
                                        handleClick={() => handleCardClick(ticket.ticketId)}
                                        showSubTicketBadge={true}
                                    />
                                    <div className="urgency-badge">🔥 Score: {ticket.urgencyScore}</div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            )}

            {/* Section 2: รายการปัญหาทั่วไป (Grid) */}
            <div className="normal-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 className="section-title" style={{ marginBottom: 0 }}>
                        <FaClipboardList /> รายการปัญหารอดำเนินการ {pagination?.currentPage > 1 && `(หน้า ${pagination.currentPage})`}
                    </h2>
                    <span className="total-items-badge">ทั้งหมด {pagination?.totalItems || 0} รายการ</span>
                </div>

                {normalTickets.length === 0 ? (
                    <div className="empty-state-container">
                        <img src="/empty-state.png" alt="No issues" />
                        <p>ไม่มีรายการปัญหาทั่วไปในขณะนี้</p>
                    </div>
                ) : (
                    <div className="issue-grid">
                        {isLoading && normalTickets.length === 0 && (
                            Array.from({ length: 8 }).map((_, index) => (
                                <CardPendingSkeleton key={`skeleton-${index}`} />
                            ))
                        )}

                        {normalTickets.map(ticket => (
                            <div key={ticket.ticketId} className="clickable-card-wrapper">
                                <CardPendingProblem
                                    data={ticket}
                                    isMergeMode={false}
                                    handleClick={() => handleCardClick(ticket.ticketId)}
                                    showSubTicketBadge={true}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {renderPagination()}
        </div>
    );
}

export default IssueManagement;