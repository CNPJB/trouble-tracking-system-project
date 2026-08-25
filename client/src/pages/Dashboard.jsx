import { useState, useRef, useEffect, useCallback } from 'react'
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
// Styles
import "./pageStyles/Dashboard.css"
import 'swiper/css';
import 'swiper/css/navigation';
// Components
import { SearchBar } from '../components/SearchBar.jsx';
import { CardFinishProblem, SkeletonCardFinishProblem } from '../components/CardFinishProblem'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { CardPendingProblem, CardPendingSkeleton } from '../components/CardPendingProblem.jsx';
import { FilterProblem, SkeletonFilterProblem } from '../components/FilterProblem.jsx';
// Custom Hooks 
import { useTickets } from '../hooks/useTickets.js';
import { useTicketSummary } from '../hooks/useTicketSummary.js';
import { useResolvedTickets } from '../hooks/useResolvedTickets.js';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll.js';

const Dashboard = () => {
  const [selectedStatus, setSelectedStatus] = useState('pending,in_progress,resolved,rejected');
  const {
    tickets, pagination, isLoading, isFetchingNextPage,
    changePage, updateFilters, refetch, removeTicket, } = useTickets({ status: selectedStatus });

  // ดึงข้อมูลสรุปยอดสำหรับทำ Filter Bar
  const { summary } = useTicketSummary();

  // ดึงรายการแก้ไขสำเร็จ (จำกัด 10 รายการ และเอาเฉพาะที่มีการให้คะแนนแล้ว)
  const { resolvedTickets, isLoadingResolved } = useResolvedTickets(10, true);

  const scrollRef = useRef(null);

  // --- State for ticket status filter
  const [currentStatus, setCurrentStatus] = useState('all');
  const allowedStatuses = ['pending', 'in_progress', 'resolved', 'rejected'];

  const lastTicketElementRef = useInfiniteScroll({
    isLoading: isLoading,
    isFetchingNextPage: isFetchingNextPage,
    hasNextPage: pagination?.hasNextPage,
    onLoadMore: () => changePage(pagination.currentPage + 1)
  });

  // --- Logic ส่งการค้นหาไปให้ Backend ---
  const handleSearch = (keyword) => {
    // โยนคำค้นหาไปให้ Hook
    updateFilters({ search: keyword });
  };

  const handleFilterChange = (status) => {
    setCurrentStatus(status);
    if (status === 'all') {
      updateFilters({ status: allowedStatuses.join(',') });
    } else {
      updateFilters({ status });
    }
  };

  return (
    <>
      {/* การ์ดแก้ไขสำเร็จด้านบน */}
      <div className="dashboard-header">
        <div className="carousel-container" >
          {/* ปุ่มเลื่อนซ้าย */}
          <button className="scroll-btn left">
            <FaChevronLeft />
          </button>

          <Swiper
            modules={[Navigation]}
            navigation={{
              prevEl: '.scroll-btn.left',
              nextEl: '.scroll-btn.right',
            }}
            spaceBetween={15} // ระยะห่างระหว่างการ์ด (ปรับได้ตามต้องการ)
            slidesPerView={'auto'} // ให้ความกว้างการ์ดเป็นตัวกำหนด (หรือใส่ตัวเลขเช่น 3, 4)
          >
            {isLoadingResolved ? (
              Array.from({ length: 4 }).map((_, index) => (
                <SwiperSlide key={`skeleton-${index}`} style={{ width: 'auto' }}>
                  <SkeletonCardFinishProblem />
                </SwiperSlide>
              ))
            ) : resolvedTickets.length > 0 ? (
              resolvedTickets.map((ticket, index) => (
                <SwiperSlide key={ticket.ticketId || index} style={{ width: 'auto' }}>
                  <CardFinishProblem data={ticket} />
                </SwiperSlide>
              ))
            ) : (
              <div style={{ padding: '20px', color: 'gray' }}>ยังไม่มีรายการที่แก้ไขสำเร็จที่ได้รับการประเมิน</div>
            )}
          </Swiper>

          {/* ปุ่มเลื่อนขวา */}
          <button className="scroll-btn right">
            <FaChevronRight />
          </button>
        </div>
      </div>

      {/* ปุ่มกรองตามสถานะ */}
      <div className="problem-pending-container">
        <div className="searchbar">
          <SearchBar onSearch={handleSearch} />
        </div>
        <div className='fillter-container'>
          {isLoading && tickets.length === 0 ? (
            <SkeletonFilterProblem />
          ) : (
            <FilterProblem
              summary={summary}
              currentFilter={currentStatus}
              onFilterChange={handleFilterChange}
            />
          )}
        </div>
        {/* การ์ดทั้งหมดในระบบรองรับการเลื่อนลงแล้วโหลด เรียงตามเวลาแจ้ง */}
        <div className="ticket-pending-list">

          {isLoading && tickets.length === 0 && (
            Array.from({ length: 8 }).map((_, index) => (
              <CardPendingSkeleton key={`skeleton-${index}`} />
            ))
          )}

          {tickets.map((ticket, index) => {
            if (tickets.length === index + 1) {
              return (
                <div
                  ref={lastTicketElementRef}
                  key={ticket.ticketId}>
                  <CardPendingProblem data={ticket} />
                </div>
              );
            } else {
              return <CardPendingProblem key={ticket.ticketId} data={ticket} />;
            }
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
      </div>
    </>
  );
}

export default Dashboard
