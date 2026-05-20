import nodemailer from "nodemailer";

/**
 * Sends a premium HTML email notification to ivanaffriandi@kakao.com
 * Supports Resend API (highest priority) or Standard SMTP Nodemailer.
 */
export async function sendNotificationEmail(subject: string, htmlContent: string): Promise<boolean> {
  const recipient = "ivanaffriandi@kakao.com";

  // 1. Try Resend API (Fast HTTP fetch)
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendApiKey}`
        },
        body: JSON.stringify({
          from: "Ivan's Portal <onboarding@resend.dev>",
          to: recipient,
          subject: subject,
          html: htmlContent
        })
      });

      if (res.ok) {
        console.log(`[Resend Notification] Email sent successfully: "${subject}"`);
        return true;
      } else {
        const errorData = await res.text();
        console.error(`[Resend Notification Error] Status ${res.status}:`, errorData);
      }
    } catch (err) {
      console.error("[Resend Notification Exception]:", err);
    }
  }

  // 2. Fallback to standard SMTP via Nodemailer
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(smtpPort || "587"),
        secure: smtpPort === "465",
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });

      await transporter.sendMail({
        from: `"Ivan's Portal" <${smtpUser}>`,
        to: recipient,
        subject: subject,
        html: htmlContent
      });

      console.log(`[SMTP Notification] Email sent successfully: "${subject}"`);
      return true;
    } catch (err) {
      console.error("[SMTP Notification Error]:", err);
    }
  }

  // 3. Log warning if not configured
  console.warn(
    `[Notification Pending] Cannot send email notification for "${subject}".\n` +
    `Reason: Neither RESEND_API_KEY nor SMTP environment variables are configured.\n` +
    `Please configure RESEND_API_KEY or (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS) in your .env file.`
  );
  return false;
}
