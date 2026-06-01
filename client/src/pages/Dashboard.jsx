import { useState, useRef, useCallback } from 'react'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
// Styles
import "./Dashboard.css"
// Components
import { SearchBar } from '../components/SearchBar.jsx';
import { CardFinishProblem } from '../components/CardFinishProblem'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { CardPendingProblem, CardPendingSkeleton } from '../components/CardPendingProblem.jsx';
import { FilterProblem } from '../components/FilterProblem.jsx';
// Custom Hooks 
// import { useTicketSearch } from '../hooks/useTicketSearch.js';
import { useTickets } from '../hooks/useTickets.js';
import { useTicketSummary } from '../hooks/useTicketSummary.js';
import { useResolvedTickets } from '../hooks/useResolvedTickets.js';

const Dashboard = () => {
  // ดึงข้อมูลตั๋วและฟังก์ชันเปลี่ยนหน้า/ค้นหาจาก Backend
  const {
    tickets,
    pagination,
    isLoading,
    isFetchingNextPage,
    changePage,
    updateFilters
  } = useTickets();
  
  const { displayData, handleSearch, filterStatus, setFilterStatus } = useTicketSearch(tickets);
  
  // ดึงข้อมูลสรุปยอดสำหรับทำ Filter Bar
  const { summary } = useTicketSummary();

  const { resolvedTickets, isLoadingResolved } = useResolvedTickets(10);

  const scrollRef = useRef(null); 

  // --- State for ticket status filter
  const [currentStatus, setCurrentStatus] = useState('all');

  // --- Logic Infinite Scroll ---
  const observerRef = useRef();
  const lastTicketElementRef = useCallback(node => {
    if (isLoading || isFetchingNextPage) return;
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(entries => {
      // ถ้าเลื่อนมาถึงใบสุดท้าย และยังมีหน้าถัดไป ให้โหลดเพิ่ม!
      if (entries[0].isIntersecting && pagination.hasNextPage) {
        changePage(pagination.currentPage + 1);
      }
    });

    if (node) observerRef.current.observe(node);
  }, [isLoading, isFetchingNextPage, pagination.hasNextPage, pagination.currentPage, changePage]);

  // --- Logic ส่งการค้นหาไปให้ Backend ---
  const handleSearch = (keyword) => {
    // โยนคำค้นหาไปให้ Hook
    updateFilters({ search: keyword });
  };

  const handleFilterChange = (status) => {
    setCurrentStatus(status);
    // โยน status ไปให้ Hook เพื่อดึงข้อมูลใหม่จากหน้า 1
    updateFilters({ status: status === 'all' ? undefined : status });
  };

  return (
    <>
      {/* การ์ดแก้ไขสำเร็จด้านบน */}
      <div className="carousel-container">
        <button className="scroll-btn left" onClick={() =>
          scrollRef.current?.scrollBy({ left: -370, behavior: 'smooth' })}>
          <FaChevronLeft />
        </button>
        {/* ใช้ Hooks เรียกตรงๆจาก Backend ได้เลย ไม่ต้องกรองสถานะเอง */}
        <div className="card-FinishProblem-grid" ref={scrollRef}>
          {/* 3. เปลี่ยนจาก tickets.filter เป็น resolvedTickets.map ได้เลย */}
          {isLoadingResolved ? (
            <div style={{ padding: '20px', color: 'gray' }}>กำลังโหลดตั๋วที่แก้ไขสำเร็จ...</div>
          ) : resolvedTickets.length > 0 ? (
            resolvedTickets.map((ticket, index) => (
              <CardFinishProblem key={ticket.ticketId || index} data={ticket} />
            ))
          ) : (
            <div style={{ padding: '20px', color: 'gray' }}>ยังไม่มีรายการที่แก้ไขสำเร็จ</div>
          )}
        </div>

        <button className="scroll-btn right" onClick={() =>
          scrollRef.current.scrollBy({ left: 370, behavior: 'smooth' })}>
          <FaChevronRight />
        </button>
      </div>

      {/* ปุ่มกรองตามสถานะ */}
      <div className="problem-pending-container">
        <div className="searchbar">
          <SearchBar onSearch={handleSearch} />
        </div>
        <FilterProblem
          summary={summary}
          currentFilter={currentStatus}
          onFilterChange={handleFilterChange}
        />

        {/* การ์ดทั้งหมดในระบบรองรับการเลื่อนลงแล้วโหลด เรียงตามเวลาแจ้ง */}
        <div className="ticket-pending-list">
          {/* โหลดครั้งแรก */}
          {isLoading && tickets.length === 0 && (
             Array.from({ length: 8 }).map((_, index) => (
              <CardPendingSkeleton key={`skeleton-${index}`} />
            )
          )}

          {tickets.map((ticket, index) => {
            //  ถ้าเป็นตั๋วใบสุดท้ายของ Array ให้ติดเซ็นเซอร์ไว้ที่มัน!
            if (tickets.length === index + 1) {
              return (
                <div ref={lastTicketElementRef} key={ticket.ticketId}>
                  <CardPendingProblem data={ticket} />
                </div>
              );
            } else {
              return <CardPendingProblem key={ticket.ticketId} data={ticket} />;
            }
          })}

          {/* ไม่พบข้อมูลเลย */}
          {!isLoading && tickets.length === 0 && (
            <div className="no-result">
              <img src="/empty-state.png" alt="empty-state" />
              <span>ไม่พบรายการสถานะนี้</span>
            </div>
          )}

          {/* สถานะกำลังโหลดหน้าถัดไปมาต่อท้าย */}
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
