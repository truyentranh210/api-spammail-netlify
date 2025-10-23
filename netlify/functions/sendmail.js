import nodemailer from "nodemailer";

export default async (req, res) => {
  const url = new URL(req.url);
  const path = url.pathname
    .replace("/.netlify/functions/sendmail", "")
    .split("/")
    .filter(Boolean);

  if (path[0] === "home") {
    return new Response(
      JSON.stringify({
        message: "📧 API GỬI MAIL (By Toky)",
        usage: "/mail/{subject}/{content}/{times}/{delay}/{to}/{apikey}",
        example: "/mail/Hello/Test/3/2/test@gmail.com/minhhocgioi"
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  }

  if (path[0] === "mail") {
    const [subject, content, times, delaySec, to, apikey] = path.slice(1);
    if (apikey !== "minhhocgioi") {
      return new Response(JSON.stringify({ error: "❌ Sai API key!" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    const EMAIL = "minhgemini2k9@gmail.com";
    const PASSWORD = "kuzz yzhl rwkl yjso";

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: EMAIL, pass: PASSWORD }
    });

    try {
      const timesNum = parseInt(times) || 1;
      const delay = parseFloat(delaySec) * 1000 || 1000;

      for (let i = 0; i < timesNum; i++) {
        await transporter.sendMail({
          from: EMAIL,
          to,
          subject: decodeURIComponent(subject),
          text: decodeURIComponent(content)
        });
        console.log(`✅ Gửi ${i + 1}/${timesNum} tới ${to}`);
        if (i < timesNum - 1) await new Promise(r => setTimeout(r, delay));
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: `Đã gửi ${timesNum} mail tới ${to}`
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    } catch (err) {
      return new Response(
        JSON.stringify({ error: `Lỗi gửi mail: ${err.message}` }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  return new Response(JSON.stringify({ error: "404 - Not Found" }), {
    status: 404,
    headers: { "Content-Type": "application/json" }
  });
};
