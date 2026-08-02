import { useState, useMemo } from "react";

import React from 'react'

export const useTicketSearch = (tickets, hideChildren = false) => {
    const [searchResult, setSearchResult] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all')
    const handleSearch = (term) => {
        if (!term || term.trim() === "") {
            setSearchResult([]);
            setIsSearching(false);
            return;
        }
        setIsSearching(true);
        const searchTerm = term.toLowerCase();

        // กรองข้อมูลตามฟิลด์ต่างๆ ของระบบ Ticket
        const result = tickets.filter(t => {
            const contentToSearch = `
        ${t.subject || ''} 
        ${t.description || ''} 
        ${t.location?.locationName || ''} 
        ${t.floor?.floorLevel || ''} 
        ${t.room?.roomName || ''}
      `.toLowerCase();
            return contentToSearch.includes(searchTerm);
        });

        setSearchResult(result);
    };
    const displayData = useMemo(() => {

        let list = isSearching ? searchResult : tickets;

        if (hideChildren) {
            list = list.filter(ticket => ticket.parentTicketId === null);
        }

        if (filterStatus !== 'all') {
            list = list.filter(t => t.ticketStatus === filterStatus);
        }

        // จัดลำดับ (Pending ขึ้นก่อน)
        return [...list].sort((a, b) => {
            if (a.ticketStatus === 'pending' && b.ticketStatus !== 'pending') return -1;
            if (a.ticketStatus !== 'pending' && b.ticketStatus === 'pending') return 1;
            return 0;
        });
    }, [isSearching, searchResult, tickets, filterStatus, hideChildren]);

    return { displayData, handleSearch, filterStatus, setFilterStatus };
}
