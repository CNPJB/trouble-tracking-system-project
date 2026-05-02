import { useState, useEffect, useRef, useMemo } from 'react'
import axios from 'axios';
import "./Dashboard.css"
import { SearchBar } from '../components/SearchBar.jsx';
import { CardFinishProblem } from '../components/CardFinishProblem'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { CardPendingProblem } from '../components/CardpendingProblem.jsx';
import { FilterProblem } from '../components/FilterProblem.jsx';

// hook 
import { useTicketSearch } from '../hooks/useTicketSearch.js';
import { useTickets } from '../hooks/useTickets.js';

const Dashboard = () => {
  const { tickets } = useTickets();
  const scrollRef = useRef(null);

  // เรียกใช้งาน hook
  const { displayData, handleSearch, filterStatus, setFilterStatus } = useTicketSearch(tickets);
  

  // const displayTickets = useMemo(() => {
  //   let list = isSearching ? searchResult : tickets;

  //   if (filterStatus !== 'all') {
  //     list = list.filter(t => t.ticketStatus === filterStatus);
  //   }

  //   // 3. จัดลำดับ (Pending ขึ้นก่อน)
  //   return [...list].sort((a, b) => {
  //     if (a.ticketStatus === 'pending' && b.ticketStatus !== 'pending') return -1;
  //     if (a.ticketStatus !== 'pending' && b.ticketStatus === 'pending') return 1;
  //     return 0;
  //   });
  // }, [isSearching, searchResult, tickets, filterStatus]); // คอยดูตัวแปรเหล่านี้ถ้าเปลี่ยนให้คำนวณใหม่
  return (
    <>
      <div className="carousel-container">
        <button className="scroll-btn left" onClick={() =>
          scrollRef.current.scrollBy({ left: -370, behavior: 'smooth' })}>
          <FaChevronLeft />
        </button>
        <div className="card-FinishProblem-grid" ref={scrollRef}>
          {tickets
            ?.filter((ticket) => ticket.ticketStatus === "resolved")
            .map((ticket, index) => (
              <CardFinishProblem key={index} data={ticket} />
            ))}
        </div>
        <button className="scroll-btn right" onClick={() =>
          scrollRef.current.scrollBy({ left: 370, behavior: 'smooth' })}>
          <FaChevronRight />
        </button>
      </div>
      <div className="problem-pending-container">
        <div className="searchbar">
          <SearchBar onSearch={handleSearch} />
        </div>
        <FilterProblem
          data={tickets}
          currentFilter={filterStatus}
          onFilterChange={(status) => {
            setFilterStatus(status)
          }}
        />
        <div className="ticket-pending-list">
          {displayData.map((ticket, index) => (
            <CardPendingProblem key={index} data={ticket} />
          ))}
          {displayData.length === 0 && (
            <div className="no-result">ไม่พบรายการสถานะนี้</div>
          )}
        </div>
      </div>
    </>


  )
}

export default Dashboard
