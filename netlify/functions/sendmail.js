import nodemailer from "nodemailer";

export default async function handler(req, res) {
  const url = new URL(req.url);
  const path = url.pathname.split("/").filter(Boolean);

  // /home
  if (path[0] === "home") {
    return new Response(
      JSON.stringify({
        message: "📧 Hướng dẫn sử dụng API gửi mail:",
        usage: "/.netlify/functions/sendmail/mail/{subject}/{content}/{times}/{delay}/{to}/{apikey}",
        example:
          "/.netlify/functions/sendmail/mail/Hello/This%20is%20a%20test/3/2s/test@gmail.com/minhhocgioi",
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  }

  // /mail/:subject/:content/:times/:delay/:to/:apikey
  if (path[0] === "mail") {
    const [_, subject, content, times, delaySec, to, apikey] = path;
    if (apikey !== "minhhocgioi") {
      return new Response(
        JSON.stringify({ error: "❌ Sai API key!" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const EMAIL = process.env.EMAIL;
    const PASSWORD = process.env.PASSWORD;

    if (!EMAIL || !PASSWORD)
      return new Response(
        JSON.stringify({
          error: "⚠️ Chưa khai báo EMAIL hoặc PASSWORD trong biến môi trường Netlify!",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: EMAIL, pass: PASSWORD },
    });

    const timesNum = parseInt(times) || 1;
    const delay = parseFloat(delaySec) * 1000 || 1000;

    for (let i = 0; i < timesNum; i++) {
      await transporter.sendMail({
        from: EMAIL,
        to,
        subject: decodeURIComponent(subject),
        text: decodeURIComponent(content),
      });
      if (i < timesNum - 1) await new Promise((r) => setTimeout(r, delay));
    }

    return new Response(
      JSON.stringify({
        success: true,
        sent: timesNum,
        to,
        delay: delay / 1000 + "s",
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  }

  // Mặc định: 404
  return new Response(JSON.stringify({ error: "404 - Not Found" }), {
    status: 404,
    headers: { "Content-Type": "application/json" },
  });
}
