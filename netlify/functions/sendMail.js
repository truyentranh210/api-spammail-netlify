import nodemailer from "nodemailer";

/**
 * URL pattern (pretty): /mail/{subject}/{message}/{repeat}/{delay}/{to}
 * Example:
 *  /mail/Hello/Chao%20ban/3/1/abc@gmail.com
 *
 * NOTE: set environment variables on Netlify:
 *   EMAIL_USER  => your gmail (e.g. minhgemini2k9@gmail.com)
 *   EMAIL_PASS  => app password (16 ký tự)
 */

const FUNCTION_PREFIX = "/.netlify/functions/mail/";

export async function handler(event) {
  try {
    // event.path will look like: /.netlify/functions/mail/subject/message/...
    const path = event.path || "";
    if (!path.startsWith(FUNCTION_PREFIX)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid path" })
      };
    }

    // lấy phần sau prefix
    const tail = path.slice(FUNCTION_PREFIX.length); // subject/message/repeat/delay/to
    const parts = tail.split("/").map(p => decodeURIComponent(p));

    // Expect exactly 5 parts
    if (parts.length < 5) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Thiếu tham số. Cú pháp: /mail/{subject}/{message}/{repeat}/{delay}/{to}"
        })
      };
    }

    const [subjectRaw, messageRaw, repeatRaw, delayRaw, toRaw] = parts;
    const subject = subjectRaw || "No Subject";
    const message = messageRaw || "";
    const repeat = parseInt(repeatRaw, 10);
    const delay = parseFloat(delayRaw);
    const to = toRaw;

    // Basic validation
    if (!message) {
      return { statusCode: 400, body: JSON.stringify({ error: "message trống" }) };
    }
    if (!to || !to.includes("@")) {
      return { statusCode: 400, body: JSON.stringify({ error: "email nhận không hợp lệ" }) };
    }
    if (!Number.isFinite(repeat) || repeat <= 0 || repeat > 50) {
      return { statusCode: 400, body: JSON.stringify({ error: "repeat phải là số nguyên 1..50" }) };
    }
    if (!Number.isFinite(delay) || delay < 0 || delay > 60) {
      return { statusCode: 400, body: JSON.stringify({ error: "delay phải là số (giây) 0..60" }) };
    }

    // transporter dùng biến môi trường (đặt trên Netlify dashboard)
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;
    if (!user || !pass) {
      return { statusCode: 500, body: JSON.stringify({ error: "EMAIL_USER / EMAIL_PASS chưa được cấu hình" }) };
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass }
    });

    // Gửi lần lượt, chờ giữa mỗi lần (synchronous để giới hạn tỉ lệ gửi)
    for (let i = 0; i < repeat; i++) {
      const mailOptions = {
        from: `"Mail API" <${user}>`,
        to,
        subject,
        text: message
      };

      // sendMail trả Promise
      await transporter.sendMail(mailOptions);

      // nếu có delay, chờ (trừ lần cuối)
      if (i < repeat - 1 && delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay * 1000));
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: `Đã gửi ${repeat} lần tới ${to}`
      })
    };

  } catch (err) {
    console.error("sendMail error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || String(err) })
    };
  }
}
