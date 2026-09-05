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

    // 3. ขั้นตอนที่ 2: กำลังดำเนินการ (แสดงเมื่อมีข้อมูลเวลาเริ่มดำเนินการ หรือสถานะเป็น in_progress/resolved)
    if (ticket?.timestampInprogress || ticket?.ticketStatus === "in_progress" || ticket?.ticketStatus === "resolved") {
        timeline.push({
            status: "กำลังดำเนินการ",
            date: formatDate(ticket?.timestampInprogress),
            time: ticket?.timestampInprogress ? new Date(ticket.timestampInprogress).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + " น." : "-",
            color: "yellow",
            duration: "กำลังแก้ไขปัญหา..."
        });
    }

    // 4. ขั้นตอนที่ 3: เสร็จสิ้น (แสดงเมื่อสถานะเป็น finished)
    if (ticket?.ticketStatus === "resolved") {
        timeline.push({
            status: "เสร็จสิ้น",
            date: formatDate(ticket?.timestampFinished),
            time: ticket?.timestampFinished ? new Date(ticket.timestampFinished).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + " น." : "-",
            color: "green",
            duration: "ดำเนินการเสร็จสิ้น"
        });
    }

    // 5. ขั้นตอนพิเศษ: ปฏิเสธรายการ (แสดงเมื่อสถานะเป็น rejected)
    if (ticket?.ticketStatus === "rejected") {
        timeline.push({
            status: "ปฏิเสธรายการซ่อม",
            date: formatDate(ticket?.timestampRejected),
            time: ticket?.timestampRejected ? new Date(ticket.timestampRejected).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + " น." : "-",
            color: "rejected",
            duration: "รายการถูกปฏิเสธโดยผู้ดูแลระบบ"
        });
    }

    return timeline;
};