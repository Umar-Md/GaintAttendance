import nodemailer from "nodemailer";

const sendEmail = async ({ from, to, subject, html }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS, 
      },
    });

    await transporter.sendMail({
      from: `"${from.name}" <${from.email}>`,
      to,
      subject,
      html,
    });

    console.log("Email sent to:", to);
  } catch (error) {
    console.error("Email send failed:", error);
  }
};

export default sendEmail;