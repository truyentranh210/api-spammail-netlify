import nodemailer from "nodemailer";

export default async function handler(req, res) {
  const url = new URL(req.url);
  const path = url.pathname.split("/").filter(Boolean);

  // ===============================
  // 🏠 ROUTE: /home
  // ===============================
  if (path[0] === "home") {
    return new Response(
      JSON.stringify({
        message: "📧 API GỬI MAIL TỰ ĐỘNG (By Toky)",
        usage: "/mail/{subject}/{content}/{times}/{delay}/{to}/{apikey}",
        example:
          "/mail/Hello/Test%20from%20Netlify/2/2/test@gmail.com/minhhocgioi",
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  }

  // ===============================
  // 📬 ROUTE: /mail/:subject/:content/:times/:delay/:to/:apikey
  // ===============================
  if (path[0] === "mail") {
    const [_, subject, content, times, delaySec, to, apikey] = path;

    // Check API key
    if (apikey !== "minhhocgioi") {
      return new Response(
        JSON.stringify({ error: "❌ API key không hợp lệ!" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Gmail account (THÊM TRỰC TIẾP Ở ĐÂY)
    const EMAIL = "minhgemini2k9@gmail.com";
    const PASSWORD = "kuzz yzhl rwkl yjso";

    // Cấu hình SMTP Gmail
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: EMAIL, pass: PASSWORD },
    });

    try {
      const timesNum = parseInt(times) || 1;
      const delay = parseFloat(delaySec) * 1000 || 1000;

      for (let i = 0; i < timesNum; i++) {
        await transporter.sendMail({
          from: EMAIL,
          to,
          subject: decodeURIComponent(subject),
          text: decodeURIComponent(content),
        });

        console.log(`✅ Gửi thành công ${i + 1}/${timesNum} lần tới ${to}`);
        if (i < timesNum - 1)
          await new Promise((resolve) => setTimeout(resolve, delay));
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: `Đã gửi ${timesNum} mail đến ${to}`,
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    } catch (err) {
      return new Response(
        JSON.stringify({ error: `Lỗi khi gửi mail: ${err.message}` }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  // ===============================
  // ❌ ROUTE KHÔNG HỢP LỆ
  // ===============================
  return new Response(JSON.stringify({ error: "404 - Not Found" }), {
    status: 404,
    headers: { "Content-Type": "application/json" },
  });
}
