import React, { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom';
import './pageStyles/Statistics.css';

// Components
import { StatisticsSidebar } from '../components/StatisticsSidebar.jsx';
import { ChartForStatistic } from '../components/ChartForStatistic.jsx';
// Hooks
import { useStatistics } from '../hooks/useStatistics.js';

const Statistics = () => {
    const [activeTab, setActiveTab] = useState('statistic-all-prblem');
    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
    };
    const getRankStyle = (index) => {
        if (index === 0) return 'rank-gold';
        if (index === 1) return 'rank-silver';
        if (index === 2) return 'rank-bronze';
        return 'rank-normal';
    };
    const getMedalIcon = (index) => {
        if (index === 0) return '1';
        if (index === 1) return '2';
        if (index === 2) return '3';
        return `#${index + 1}`; // อันดับ 4 จะโชว์ #4 แทนเหรียญ
    };

    const percentage = (count) => {
        const total = mostCategoriesOfProblems.reduce((sum, category) => sum + category.ticketCount, 0);
        return total > 0 ? ((count / total) * 100).toFixed(2) : '0.00';
    };
    const currentDate = new Date();
    const currentYear = new Date().getFullYear();
    const currentMonthIndex = new Date().getMonth();
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [selectedMonth, setSelectedMonth] = useState('all');
    const { mostCategoriesOfProblems, mostUpvotedTickets, ticketStats } = useStatistics(selectedYear, selectedMonth);
    const availableYears = [];
    for (let y = currentYear; y >= 2026; y--) {
        availableYears.push(y);
    }

    const monthNames = [
        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    let chartCategories = [];
    let finalCreated = [];
    let finalResolved = [];

    if (selectedMonth === 'all') {
        const allMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
        const displayCount = (selectedYear === currentYear) ? currentMonthIndex + 1 : 12;

        chartCategories = allMonths.slice(0, displayCount);
        finalCreated = (ticketStats?.created || Array(12).fill(0)).slice(0, displayCount);
        finalResolved = (ticketStats?.resolved || Array(12).fill(0)).slice(0, displayCount);
    } else {
        chartCategories = ['สัปดาห์ที่ 1', 'สัปดาห์ที่ 2', 'สัปดาห์ที่ 3', 'สัปดาห์ที่ 4', 'สัปดาห์ที่ 5'];
        finalCreated = ticketStats?.created || Array(5).fill(0);
        finalResolved = ticketStats?.resolved || Array(5).fill(0);
    }

    const chartSeries = [
        { name: 'การแจ้งปัญหา', data: finalCreated },
        { name: 'แก้ไขเสร็จสิ้น', data: finalResolved }
    ];
    return (
        <div className="Statistics-layout">
            <StatisticsSidebar
                activeTab={activeTab}
                onTabChange={handleTabChange}
            />
            <main className="Statistics-main-content">
                <div className="Statistics-layout-content">
                    <div className="Statistics-content">
                        <Routes>
                            <Route path="/" element={
                                <div className="dashboard-container">
                                    <h1>ภาพรวมการแจ้งปัญหาและการแก้ไขปัญหา</h1>
                                    <div className="filter-section">
                                        <div>
                                            <label style={{ marginRight: '10px', fontWeight: 'bold' }}>ปี: </label>
                                            <select
                                                value={selectedYear}
                                                onChange={(e) => {
                                                    const newYear = parseInt(e.target.value);
                                                    setSelectedYear(newYear);

                                                    if (newYear === currentYear && selectedMonth !== 'all' && selectedMonth > currentMonthIndex) {
                                                        setSelectedMonth(currentMonthIndex);
                                                    }
                                                }}
                                                style={{ padding: '8px', borderRadius: '4px' }}
                                            >
                                                {availableYears.map(year => (
                                                    <option key={year} value={year}>ปี {year}</option>
                                                ))}
                                            </select>
                                        </div>


                                        <div>
                                            <label style={{ marginRight: '10px', fontWeight: 'bold' }}>เดือน: </label>
                                            <select
                                                value={selectedMonth}

                                                onChange={(e) => setSelectedMonth(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                                                style={{ padding: '8px', borderRadius: '4px' }}
                                            >

                                                <option value="all">📊 ภาพรวมทั้งปี</option>

                                                {monthNames.map((name, index) => {
                                                    const isFutureMonth = (selectedYear === currentYear) && (index > currentMonthIndex);
                                                    return (
                                                        <option
                                                            key={index}
                                                            value={index}
                                                            disabled={isFutureMonth}
                                                        >
                                                            {name} {isFutureMonth ? '(ยังไม่ถึง)' : ''}
                                                        </option>
                                                    );
                                                })}
                                            </select>
                                        </div>

                                    </div>

                                    <div className="chart-section">
                                        <ChartForStatistic
                                            series={chartSeries}
                                            categories={chartCategories}
                                        />
                                    </div>
                                </div>
                            } />
                            <Route path="/top-categories" element={
                                <div className="statistic-type-of-problem">
                                    <h2>ประเภทปัญหาที่รับแจ้งมากสุด</h2>
                                    {/* วนลูปแสดงข้อมูลการ์ดจัดอันดับ */}
                                    <div className="stat-cards-wrapper">

                                        {mostCategoriesOfProblems.map((category, index) => {
                                            const rankClass = getRankStyle(index);
                                            const medal = getMedalIcon(index);

                                            return (
                                                <div key={category.ticketCtgId || index} className={`stat-card-container ${rankClass}`}>
                                                    <div className="rank-badge">
                                                        {medal}
                                                    </div>
                                                    <div className="stat-card-info">
                                                        <h4>{category.ticketCtgName}</h4>
                                                        <p>จำนวน: {category.ticketCount} รายการ</p>
                                                    </div>
                                                    <div className="stat-card-percentage">
                                                        {percentage(category.ticketCount)}%
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            } />
                            
                            {/* <Route path="/statistics/top-locations" element={<div className='statistic-location'>แสดงข้อมูลสถานที่รับแจ้งมากสุด</div>} /> */}
                            <Route path="top-upvoted" element={(
                                <div className="statistic-type-of-problem">
                                    <h2>ปัญหาที่ได้รับ Upvote มากที่สุด</h2>
                                    {/* วนลูปแสดงข้อมูลการ์ดจัดอันดับ */}
                                    <div className="stat-cards-wrapper">

                                    {mostUpvotedTickets.map((ticket, index) => {
                                        const rankClass = getRankStyle(index);
                                        const medal = getMedalIcon(index);

                                        return (
                                            <div key={ticket.ticketId || index} className={`stat-card-container ${rankClass}`}>
                                                <div className="rank-badge">
                                                    {medal}
                                                </div>
                                                <div className="stat-card-info">
                                                    <h4>{ticket.title}</h4>
                                                    <p>{ticket.location}</p>
                                                </div>
                                                <div className="stat-card-upvote">
                                                    <p>vote: {ticket.upvoteCount}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            )} />
                        </Routes>
                    </div>
                </div>
            </main>
        </div>

    )
}

export default Statistics