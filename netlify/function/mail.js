import nodemailer from "nodemailer";

/*
 📨 API URL format:
   /mail/{subject}/{message}/{repeat}/{delay}/{to}

 Example:
   /mail/Hello%20World/Test%20Message/2/1/example@gmail.com
*/

const FUNCTION_PREFIX = "/.netlify/functions/mail/";

export async function handler(event) {
  try {
    const path = event.path || "";
    if (!path.startsWith(FUNCTION_PREFIX)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid path" })
      };
    }

    const tail = path.slice(FUNCTION_PREFIX.length);
    const parts = tail.split("/").map(p => decodeURIComponent(p));

    if (parts.length < 5) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Thiếu tham số: /mail/{subject}/{message}/{repeat}/{delay}/{to}"
        })
      };
    }

    const [subject, message, repeatRaw, delayRaw, to] = parts;
    const repeat = parseInt(repeatRaw, 10);
    const delay = parseFloat(delayRaw);

    if (!to || !to.includes("@")) {
      return { statusCode: 400, body: JSON.stringify({ error: "Email nhận không hợp lệ" }) };
    }

    if (!message) {
      return { statusCode: 400, body: JSON.stringify({ error: "Nội dung trống" }) };
    }

    if (isNaN(repeat) || repeat <= 0 || repeat > 50) {
      return { statusCode: 400, body: JSON.stringify({ error: "repeat phải là số từ 1 đến 50" }) };
    }

    if (isNaN(delay) || delay < 0 || delay > 60) {
      return { statusCode: 400, body: JSON.stringify({ error: "delay phải là số từ 0–60 giây" }) };
    }

    // ✅ Cấu hình Gmail (bạn thay thông tin ở đây)
    const EMAIL = "minhgemini2k9@gmail.com";
    const PASSWORD = "kuzz yzhl rwkl yjso"; // App Password (16 ký tự, không phải mật khẩu thật)

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: EMAIL, pass: PASSWORD }
    });

    // 🔁 Gửi lặp
    for (let i = 0; i < repeat; i++) {
      await transporter.sendMail({
        from: `"Mail API" <${EMAIL}>`,
        to,
        subject,
        text: message
      });

      console.log(`✅ Gửi lần ${i + 1}/${repeat} → ${to}`);
      if (i < repeat - 1 && delay > 0) {
        await new Promise(r => setTimeout(r, delay * 1000));
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
    console.error("❌ Lỗi:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
}
