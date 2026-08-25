import React, { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom';
import './pageStyles/Statistics.css';

// Components
import { StatisticsSidebar } from '../components/StatisticsSidebar.jsx';
import { ChartForStatistic } from '../components/ChartForStatistic.jsx';
import { PieChartStatus } from '../components/PieChartStatus.jsx';
// Hooks
import { useStatistics } from '../hooks/useStatistics.js';
// Utils
import { getRealWeekDay } from '../utils/getRealWeekDay.js';

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
        return `#${index + 1}`;
    };

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonthIndex = currentDate.getMonth();

    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [selectedMonth, setSelectedMonth] = useState('all');

    const { mostCategoriesOfProblems, mostUpvotedTickets, ticketStats } = useStatistics(selectedYear, selectedMonth);

    const availableYears = [];
    for (let y = currentYear; y >= 2026; y--) {
        availableYears.push(y);
    }

    const percentage = (count) => {
        if (!mostCategoriesOfProblems) return '0.00';
        const total = mostCategoriesOfProblems.reduce((sum, category) => sum + category.ticketCount, 0);
        return total > 0 ? ((count / total) * 100).toFixed(2) : '0.00';
    };

    const monthNames = [
        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];

    let chartCategories = [];
    let finalCreated = [];
    let finalResolved = [];
    let finalRejected = [];

    if (selectedMonth === 'all') {
        const allMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
        const displayCount = (selectedYear === currentYear) ? currentMonthIndex + 1 : 12;

        chartCategories = allMonths.slice(0, displayCount);
        finalCreated = (ticketStats?.created || Array(12).fill(0)).slice(0, displayCount);
        finalResolved = (ticketStats?.resolved || Array(12).fill(0)).slice(0, displayCount);
        finalRejected = (ticketStats?.rejected || Array(12).fill(0)).slice(0, displayCount);
    } else {
        // เรียกใช้ฟังก์ชันคำนวณวันจากไฟล์ Utils
        const dynamicWeekLabels = getRealWeekDay(selectedYear, selectedMonth);
        const weeksCount = dynamicWeekLabels.length;

        chartCategories = dynamicWeekLabels;
        finalCreated = (ticketStats?.created || Array(weeksCount).fill(0)).slice(0, weeksCount);
        finalResolved = (ticketStats?.resolved || Array(weeksCount).fill(0)).slice(0, weeksCount);
        finalRejected = (ticketStats?.rejected || Array(weeksCount).fill(0)).slice(0, weeksCount);
    }
    const chartSeries = [
        { name: 'การแจ้งปัญหา', data: finalCreated },
        { name: 'แก้ไขเสร็จสิ้น', data: finalResolved },
        { name: 'ถูกปฏิเสธ', data: finalRejected }
    ];
    const totalCreated = finalCreated.reduce((sum, val) => sum + val, 0);
    const totalResolved = finalResolved.reduce((sum, val) => sum + val, 0);
    const totalRejected = finalRejected.reduce((sum, val) => sum + val, 0);

    const totalPending = totalCreated - (totalResolved + totalRejected);
    const pieSeries = [
        totalPending > 0 ? totalPending : 0,
        totalResolved,
        totalRejected
    ];
    const pieLabels = ['กำลังดำเนินการ', 'แก้ไขเสร็จสิ้น', 'ถูกปฏิเสธ'];
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

                                    <div style={{ flex: '1', backgroundColor: '#fff', padding: '20px', borderRadius: '8px' }}>
                                        <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>สัดส่วนสถานะปัญหา</h3>
                                        <PieChartStatus series={pieSeries} labels={pieLabels} />
                                    </div>
                                </div>
                            } />

                            <Route path="/top-categories" element={
                                <div className="statistic-type-of-problem">
                                    <h2>ประเภทปัญหารับแจ้งมากสุด</h2>
                                    <div className="stat-cards-wrapper">
                                        {mostCategoriesOfProblems && mostCategoriesOfProblems.map((category, index) => {
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

                            <Route path="top-upvoted" element={(
                                <div className="statistic-type-of-problem">
                                    <h2>ปัญหาที่ได้รับ Upvote มากที่สุด</h2>
                                    <div className="stat-cards-wrapper">
                                        {mostUpvotedTickets && mostUpvotedTickets.map((ticket, index) => {
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