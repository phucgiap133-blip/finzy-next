import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendMail(to: string, subject: string, text: string, html?: string) {
  const mailOptions = { from: process.env.SMTP_FROM, to, subject, text, html };
  try {
    await transporter.sendMail(mailOptions);
    console.log(`[Mailer] Sent to ${to}: ${subject}`);
  } catch (e) {
    console.error("[Mailer] Error:", e);
  }
}

/**
 * Hàm hỗ trợ tạo nội dung email cho mã OTP.
 */
export function buildOTPEmail(code: string) {
    const subject = "Mã Xác Minh (OTP) của bạn";
    const text = `Mã OTP của bạn là: ${code}. Mã này sẽ hết hạn sau 5 phút. Vui lòng không chia sẻ mã này với bất kỳ ai.`;
    
    // Nội dung HTML cơ bản (nên dùng template engine trong production)
    const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
            <h2>Xác minh Tài khoản</h2>
            <p>Bạn đã yêu cầu mã xác minh. Vui lòng sử dụng mã OTP sau để tiếp tục:</p>
            <h1 style="color: #4CAF50; background-color: #f0f0f0; padding: 10px; border-radius: 4px; display: inline-block;">${code}</h1>
            <p>Mã này sẽ hết hạn sau 5 phút.</p>
            <p>Trân trọng,</p>
            <p>Đội ngũ Finzy</p>
        </div>
    `;

    return { subject, text, html };
}