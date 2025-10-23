import nodemailer from "nodemailer";

export default async (req, res) => {
  const url = new URL(req.url);
  const path = url.pathname.split("/").filter(Boolean);

  // Route /home
  if (path[1] === "home") {
    return new Response(
      JSON.stringify({
        message: "📧 Hướng dẫn sử dụng API gửi mail:",
        usage: "/.netlify/functions/sendmail/mail/{subject}/{content}/{times}/{delay}/{to}/{apikey}",
        example:
          "/.netlify/functions/sendmail/mail/Test/Hello%20from%20Netlify/3/2s/test@gmail.com/minhhocgioi",
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  }

  // Route /mail/:subject/:content/:times/:delay/:to/:apikey
  if (path[1] === "mail") {
    const subject = decodeURIComponent(path[2] || "");
    const content = decodeURIComponent(path[3] || "");
    const times = parseInt(path[4]) || 1;
    const delay = parseFloat(path[5]) * 1000 || 1000;
    const to = decodeURIComponent(path[6] || "");
    const apiKey = path[7];

    if (apiKey !== "minhhocgioi") {
      return new Response(
        JSON.stringify({ error: "❌ Sai API key!" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!subject || !content || !to) {
      return new Response(
        JSON.stringify({
          error: "Thiếu tham số! Cần: subject, content, times, delay, to, apikey",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Gmail account
    const EMAIL = "minhgemini2k9@gmail.com";
    const PASSWORD = "kuzz yzhl rwkl yjso"; // app password

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: EMAIL,
        pass: PASSWORD,
      },
    });

    // Gửi mail nhiều lần
    for (let i = 0; i < times; i++) {
      await transporter.sendMail({
        from: EMAIL,
        to,
        subject,
        text: content,
      });
      console.log(`✅ Sent mail ${i + 1}/${times} to ${to}`);
      if (i < times - 1) await new Promise((r) => setTimeout(r, delay));
    }

    return new Response(
      JSON.stringify({
        status: "✅ Đã gửi thành công!",
        sent: times,
        to,
        delay: delay / 1000 + "s",
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  }

  // Default 404
  return new Response(JSON.stringify({ error: "404 - Not Found" }), {
    status: 404,
    headers: { "Content-Type": "application/json" },
  });
};
