require('dotenv').config();
const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');

const dailyReportEmail = async (name, subject, email, data) => {
  try {
    // Check if environment variables are loaded
    const { NODEMAILER_AUTH_USER_EMAIL, NODEMAILER_AUTH_USER_PASSWORD, FROM_EMAIL } = process.env;
    if (!NODEMAILER_AUTH_USER_EMAIL || !NODEMAILER_AUTH_USER_PASSWORD || !FROM_EMAIL) {
      throw new Error('Missing environment variables for email configuration.');
    }

    // Create a transporter with Gmail's SMTP settings
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      secure: true,
      auth: {
        user: NODEMAILER_AUTH_USER_EMAIL,
        pass: NODEMAILER_AUTH_USER_PASSWORD,
      },
    });

    // Define the path to your EJS template
    const templatePath = path.join(__dirname, '..', 'views', 'dailyReport.ejs');

    // Render the EJS template with data
    const htmlContent = await ejs.renderFile(templatePath, { name, data });

    const mailOptions = {
      from: FROM_EMAIL,
      to: email,
      subject: subject,
      html: htmlContent,
    };


    // Send the email
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error('Error sending email:', error.message);
    throw error;
  }
};

module.exports = {
  dailyReportEmail,
};
