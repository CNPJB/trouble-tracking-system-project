import { useState, useEffect, useRef } from 'react'
import axios from 'axios';
import "./Dashboard.css"
import { CardFinishProblem } from '../components/CardFinishProblem'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useTickets } from '../hooks/useTickets.js';

const Dashboard = () => {
    const { tickets } = useTickets();

    const scrollRef = useRef(null);
  return (
    <div className="carousel-container">
        <button className="scroll-btn left" onClick={() => 
            scrollRef.current.scrollBy({ left: -370, behavior: 'smooth' })}>
            <FaChevronLeft />
        </button>
        <div className="card-FinishProblem-grid" ref={scrollRef}>
        {tickets
        // ?.filter((ticket) =>  ticket.ticketStatus === "resolved")
        .map((ticket, index) => (
          <CardFinishProblem key={index} data={ticket} />
        ))}
        </div>
        <button className="scroll-btn right" onClick={() => 
            scrollRef.current.scrollBy({ left: 370, behavior: 'smooth' })}>
            <FaChevronRight />
        </button>
    </div>
    
  )
}

export default Dashboard
