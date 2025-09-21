import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendEmail = async (to: string, subject: string, text: string) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to,
      subject,
      text,
    };
    const res = await transporter.sendMail(mailOptions);
    if (!res.accepted) {
      return {
        success: false,
        message: "Email not sent",
        status: 400,
      };
    }
    return {
      success: true,
      message: "Email sent successfully",
      status: 200,
    };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      success: false,
      message: "Email not sent",
      status: 400,
    };
  }
};

export default transporter;
