// src/lib/mailer.ts
import nodemailer from "nodemailer";
import { env } from "./env";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: false,
  auth: env.SMTP_USER && env.SMTP_PASS ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
});

export async function sendMail(to: string, subject: string, text: string, html?: string) {
  const mailOptions = { from: env.SMTP_FROM, to, subject, text, html };
  try {
    await transporter.sendMail(mailOptions);
    console.log(`[Mailer] Sent to ${to}: ${subject}`);
  } catch (e) {
    console.error("[Mailer] Error:", e);
  }
}

export function buildOTPEmail(code: string) {
  const subject = "Mã Xác Minh (OTP) của bạn";
  const text = `Mã OTP của bạn là: ${code}. Mã này sẽ hết hạn sau 5 phút.`;
  const html = `
    <div style="font-family: Arial,sans-serif;padding:20px;border:1px solid #ddd;border-radius:5px;">
      <h2>Xác minh Tài khoản</h2>
      <p>Bạn đã yêu cầu mã xác minh. Vui lòng dùng mã OTP sau để tiếp tục:</p>
      <h1 style="color:#4CAF50;background:#f0f0f0;padding:10px;border-radius:4px;display:inline-block;">${code}</h1>
      <p>Mã này sẽ hết hạn sau 5 phút.</p>
      <p>Trân trọng,<br/>Đội ngũ Finzy</p>
    </div>
  `;
  return { subject, text, html };
}
