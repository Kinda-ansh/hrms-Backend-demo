require('dotenv').config();
const nodemailer = require('nodemailer');

const sendEmail = async (name, subject, email, token) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      secure: true,
      auth: {
        user: process.env.NODEMAILER_AUTH_USER_EMAIL,
        pass: process.env.NODEMAILER_AUTH_USER_PASSWORD,
      }
    });

    const displayName = name ? `<b>${name}</b>` : ' ';

    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to: email,
      subject: subject,
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;"><p>Hi ${displayName}, Please use this OTP: <b>${token}</b></p> <br/><br/> <p><b>Best regards,<br> SarkariPrivateJobs</b></p>.</div>`,
    };

    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  sendEmail
};
