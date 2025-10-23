import nodemailer from "nodemailer";

export async function handler(event) {
  try {
    const { subject, message, repeat, delay, to } = event.queryStringParameters;

    if (!subject || !message || !repeat || !delay || !to) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Thiếu tham số! Cần: subject, message, repeat, delay, to" })
      };
    }

    // Cấu hình SMTP
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "minhgemini2k9@gmail.com",
        pass: "kuzz yzhl rwkl yjso" // App password Gmail
      }
    });

    for (let i = 0; i < parseInt(repeat); i++) {
      await transporter.sendMail({
        from: `"TOKY MAIL BOT" <minhgemini2k9@gmail.com>`,
        to,
        subject,
        text: message
      });

      console.log(`✅ Đã gửi lần ${i + 1} tới ${to}`);

      if (i < repeat - 1) {
        await new Promise(resolve => setTimeout(resolve, parseFloat(delay) * 1000));
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: `Đã gửi ${repeat} lần tới ${to}` })
    };

  } catch (err) {
    console.error("❌ Lỗi gửi mail:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
}
