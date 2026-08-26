/**
 * ฟังก์ชันสำหรับส่งอีเมลแจ้งเตือนสถานะตั๋วปัญหาผ่าน Brevo REST API (HTTPS / Port 443)
 * @param {string} toEmail - อีเมลของผู้รับ (User ผู้แจ้ง หรือคนในตั๋วลูก/คนโหวต)
 * @param {Object} ticketData - ข้อมูลตั๋วปัญหา (ticketId, title, status, adminNote, ฯลฯ)
 */
export const sendTicketStatusEmail = async (toEmail, ticketData) => {
    if (!toEmail) {
        console.warn(`[EmailService] Skip sending: No recipient email provided for Ticket ${ticketData.ticketId}`);
        return;
    }

    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
        console.error('[EmailService] Missing BREVO_API_KEY in environment variables.');
        return;
    }

    const senderEmail = process.env.SENDER_EMAIL || process.env.BREVO_SENDER_EMAIL || process.env.EMAIL_USER || 'troubletrackingsystem@gmail.com';
    const senderName = process.env.SENDER_NAME || 'TTS Notification';

    // 1. แปลงสถานะเป็นภาษาไทยให้ User อ่านง่าย
    const statusText = {
        'in_progress': 'กำลังดำเนินการ',
        'resolved': 'ดำเนินการเสร็จสิ้น',
        'rejected': 'ปฏิเสธการรับเรื่อง'
    }[ticketData.ticketStatus] || ticketData.ticketStatus;

    // 2. กำหนดหัวข้ออีเมล (Subject) และเนื้อหาตามสถานะปัจจุบัน
    let subject = `[TTS] อัปเดตสถานะปัญหา รหัส ${ticketData.ticketId}`;
    let statusDetailsHtml = '';

    if (ticketData.ticketStatus === 'in_progress') {
        subject = `⏳ [กำลังดำเนินการ] ปัญหา รหัส ${ticketData.ticketId} ได้รับการรับเรื่องแล้ว`;
        statusDetailsHtml = `
            <p>เจ้าหน้าที่ผู้รับผิดชอบได้เปลี่ยนสถานะปัญหาของคุณเป็น <b>"กำลังดำเนินการ"</b> เรียบร้อยแล้ว ขณะนี้กำลังอยู่ระหว่างตรวจสอบและแก้ไขปัญหาสถานที่ดังกล่าว</p>
        `;
    } else if (ticketData.ticketStatus === 'resolved') {
        subject = `✅ [เสร็จสิ้น] ปัญหา รหัส ${ticketData.ticketId} ได้รับการแก้ไขเรียบร้อยแล้ว`;
        statusDetailsHtml = `
            <p>เจ้าหน้าที่ได้ทำการแก้ไขปัญหาดังกล่าวเสร็จสิ้นแล้ว โดยมีบันทึกการแก้ไขดังนี้:</p>
            <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; margin: 15px 0;">
                <b>บันทึกจากผู้ดูแลระบบ:</b> ${ticketData.adminNote || '-'}
            </div>
            <p>คุณสามารถเข้าสู่ระบบเพื่อทำ <b>"การประเมินความพึงพอใจ"</b> ต่อการให้บริการได้ในหน้าตรวจสอบสถานะปัญหา</p>
        `;
    } else if (ticketData.ticketStatus === 'rejected') {
        subject = `❌ [ปฏิเสธการรับเรื่อง] อัปเดตปัญหา รหัส ${ticketData.ticketId}`;
        statusDetailsHtml = `
            <p>เจ้าหน้าที่ได้ตรวจสอบปัญหาดังกล่าวแล้ว และมีความจำเป็นต้องเปลี่ยนสถานะเป็น <b>"ปฏิเสธการรับเรื่อง"</b> เนื่องจากเหตุผลดังต่อไปนี้:</p>
            <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 12px; margin: 15px 0;">
                <b>เหตุผลจากผู้ดูแลระบบ:</b> ${ticketData.adminNote || '-'}
            </div>
        `;
    }

    // 3. ประกอบร่าง HTML Template ให้ดูเป็นระเบียบสวยงาม
    const htmlContent = `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <div style="text-align: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 15px; margin-bottom: 20px;">
                <h2 style="color: #0f172a; margin: 0;">Trouble Tracking System</h2>
                <p style="color: #64748b; margin: 5px 0 0 0; font-size: 14px;">ระบบแจ้งซ่อมและจัดการปัญหากรณีศึกษา</p>
            </div>
            
            <div style="color: #334155; line-height: 1.6; font-size: 15px;">
                <p>เรียน ผู้ใช้งานระบบ,</p>
                <p>ปัญหาที่คุณมีส่วนเกี่ยวข้อง รหัส <b>${ticketData.ticketId}</b> มีการอัปเดตข้อมูลดังนี้:</p>
                
                <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
                    <tr>
                        <td style="padding: 8px 0; color: #64748b; width: 30%;"><b>หัวข้อปัญหา:</b></td>
                        <td style="padding: 8px 0; color: #0f172a;">${ticketData.title}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #64748b;"><b>สถานะใหม่:</b></td>
                        <td style="padding: 8px 0; color: #0f172a;">
                            <span style="padding: 4px 8px; border-radius: 6px; font-weight: bold; font-size: 13px; background-color: #e2e8f0;">
                                ${statusText}
                            </span>
                        </td>
                    </tr>
                </table>

                ${statusDetailsHtml}

                <div style="text-align: center; margin: 30px 0 20px 0;">
                    <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" 
                       style="background-color: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                       เข้าสู่ระบบเพื่อตรวจสอบสถานะ
                    </a>
                </div>
            </div>

            <div style="border-top: 1px solid #f1f5f9; padding-top: 15px; margin-top: 25px; text-align: center; font-size: 12px; color: #94a3b8;">
                <p>นี่คืออีเมลแจ้งเตือนอัตโนมัติจากระบบ กรุณาอย่าตอบกลับอีเมลฉบับนี้</p>
            </div>
        </div>
    `;

    // 4. ส่งอีเมลผ่าน Brevo Transactional Email REST API (HTTPS / Port 443)
    try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': apiKey,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                sender: {
                    name: senderName,
                    email: senderEmail
                },
                to: [
                    {
                        email: toEmail
                    }
                ],
                subject: subject,
                htmlContent: htmlContent
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP ${response.status} ${response.statusText}`);
        }

        const result = await response.json().catch(() => ({}));
        console.log(`[EmailService] Email successfully sent via Brevo for Ticket ${ticketData.ticketId} with status "${ticketData.ticketStatus}" (Message ID: ${result.messageId || '-'})`);
    } catch (error) {
        console.error(`[EmailService] Failed to send email via Brevo for Ticket ${ticketData.ticketId}:`, error.message || error);
    }
};