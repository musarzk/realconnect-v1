// lib/email.ts
// Simple email utility – replace with real SMTP config as needed
const nodemailer = require("nodemailer")

// Configure transporter – using environment variables (fallback to console.log)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "localhost",
  port: Number(process.env.SMTP_PORT) || 1025,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
})

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    // If SMTP not configured, just log
    if (!process.env.SMTP_HOST) {
      console.log(`[Email] To: ${to} | Subject: ${subject}\n${html}`)
      return
    }
    await transporter.sendMail({
      from: process.env.SMTP_FROM || "no-reply@example.com",
      to,
      subject,
      html,
    })
    console.log(`Email sent to ${to}`)
  } catch (err) {
    console.error("Failed to send email", err)
  }
}
