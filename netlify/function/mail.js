import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config(); // read .env in local

// NOTE: This function is meant for LOCAL testing only if .env contains credentials.
// Do NOT commit .env or deploy code with credentials in repo.

const FUNCTION_PREFIX = "/.netlify/functions/mail/";

export async function handler(event) {
  try {
    const path = event.path || "";
    if (!path.startsWith(FUNCTION_PREFIX)) {
      return { statusCode: 400, body: JSON.stringify({ error: "Invalid path" }) };
    }

    const tail = path.slice(FUNCTION_PREFIX.length);
    const parts = tail.split("/").map(p => decodeURIComponent(p));

    if (parts.length < 5) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Cú pháp: /mail/{subject}/{message}/{repeat}/{delay}/{to}" })
      };
    }

    const [subjectRaw, messageRaw, repeatRaw, delayRaw, toRaw] = parts;
    const subject = subjectRaw || "No Subject";
    const message = messageRaw || "";
    const repeat = parseInt(repeatRaw, 10);
    const delay = parseFloat(delayRaw);
    const to = toRaw;

    if (!to || !to.includes("@")) return { statusCode: 400, body: JSON.stringify({ error: "Email không hợp lệ" }) };
    if (!message) return { statusCode: 400, body: JSON.stringify({ error: "message trống" }) };
    if (!Number.isFinite(repeat) || repeat <= 0 || repeat > 20) return { statusCode: 400, body: JSON.stringify({ error: "repeat 1..20" }) };
    if (!Number.isFinite(delay) || delay < 0 || delay > 60) return { statusCode: 400, body: JSON.stringify({ error: "delay 0..60 (giây)" }) };

    // Read creds from env (local .env or Netlify env vars)
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;
    if (!user || !pass) {
      return { statusCode: 500, body: JSON.stringify({ error: "Không tìm thấy EMAIL_USER/EMAIL_PASS trong env" }) };
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass }
    });

    for (let i = 0; i < repeat; i++) {
      await transporter.sendMail({
        from: `"Mail API" <${user}>`,
        to,
        subject,
        text: message
      });
      if (i < repeat - 1 && delay > 0) {
        await new Promise(r => setTimeout(r, Math.floor(delay * 1000)));
      }
    }

    return { statusCode: 200, body: JSON.stringify({ success: true, message: `Đã gửi ${repeat} lần tới ${to}` }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message || String(err) }) };
  }
}
