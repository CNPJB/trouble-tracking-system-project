import { formatDate } from './formatDate.js';

export const getTimelineData = (ticket,  formatdate) => {
    const timeline = [];

    timeline.push({
        status: "รอรับเรื่อง",
        date: formatDate(ticket?.createdAt),
        time: ticket?.createdAt ? new Date(ticket.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + " น." : "-",
        color: "red",
        duration: "รอแอดมินตรวจสอบ"
    });

    // 3. ขั้นตอนที่ 2: กำลังดำเนินการ (แสดงเมื่อสถานะไม่ใช่ pending)
    if (ticket?.ticketStatus !== "pending") {
        timeline.push({
            status: "กำลังดำเนินการ",
            date: formatDate(ticket?.updatedAt), // หรือเวลาที่เริ่มดำเนินการจริง
            time: ticket?.updatedAt ? new Date(ticket.updatedAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + " น." : "-",
            color: "yellow",
            duration: "กำลังแก้ไขปัญหา..."
        });
    }

    // 4. ขั้นตอนที่ 3: เสร็จสิ้น (แสดงเมื่อสถานะเป็น finished)
    if (ticket?.ticketStatus === "resolved") {
        timeline.push({
            status: "เสร็จสิ้น",
            date: formatDate(ticket?.finishedAt || ticket?.updatedAt),
            time: ticket?.finishedAt ? new Date(ticket.finishedAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + " น." : "-",
            color: "green",
            duration: ""
        });
    }

    return timeline;
};