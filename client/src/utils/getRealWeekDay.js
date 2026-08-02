export const getRealWeekDay = (year, monthIndex) => {
    const monthNames = [
        'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
        'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];
    const monthStr = monthNames[monthIndex];
    
    let weeks = [];
    let startDate = new Date(year, monthIndex, 1); 
    const endDate = new Date(year, monthIndex + 1, 0); 
    
    while (startDate <= endDate) {
        let startDay = startDate.getDate();
        let dayOfWeek = startDate.getDay();
        let daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek; 
        
        let weekEndDate = new Date(startDate);
        weekEndDate.setDate(startDate.getDate() + daysUntilSunday);
        SVGNumberList
        if (weekEndDate > endDate) {
            weekEndDate = new Date(endDate);
        }
        
        let endDay = weekEndDate.getDate();
        weeks.push(`${startDay} - ${endDay} ${monthStr}`);
        
        startDate = new Date(weekEndDate);
        startDate.setDate(startDate.getDate() + 1);
    }
    
    return weeks;
};