// require('dotenv').config();
// const nodemailer = require('nodemailer');

// const sendEmail = async (name, subject, email, token) => {
//   try {
//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       secure: true,
//       auth: {
//         user: process.env.NODEMAILER_AUTH_USER_EMAIL,
//         pass: process.env.NODEMAILER_AUTH_USER_PASSWORD,
//       }
//     });

//     const displayName = name ? `<b>${name}</b>` : ' ';

//     const mailOptions = {
//       from: process.env.FROM_EMAIL,
//       to: email,
//       subject: subject,
//       html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;"><p>Hi ${displayName}, Please use this OTP: <b>${token}</b></p> <br/><br/> <p><b>Best regards,<br> SarkariPrivateJobs</b></p>.</div>`,
//     };

//     const info = await transporter.sendMail(mailOptions);
//     return info;
//   } catch (error) {
//     throw error;
//   }
// };

// module.exports = {
//   sendEmail
// };



// ####################################
const dotenv = require('dotenv');
dotenv.config();

const nodemailer = require('nodemailer');
const path = require('path');
const ejs = require('ejs');

// Use __dirname to correctly resolve the directory of the current file
const TEMPLATE_DIR = path.join(__dirname, '../services/template');

// Create a transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.NODEMAILER_AUTH_USER_EMAIL, // Your Gmail address
        pass: process.env.NODEMAILER_AUTH_USER_PASSWORD, // App password
    },
});

// Function to send email with a dynamic EJS template
function sendEmail(to, subject, templateName, data) {
    return new Promise(function (resolve, reject) {
        try {
            // Dynamically resolve the template path
            const templatePath = path.join(TEMPLATE_DIR, `${templateName}.ejs`);
            console.log('Resolved Template Path:', templatePath); // Debugging line

            // Render the EJS template to HTML
            ejs.renderFile(templatePath, data, function (err, htmlContent) {
                if (err) {
                    console.error('Error rendering EJS template:', err);
                    return reject(err);
                }

                // Send the email
                transporter.sendMail({
                    from: process.env.FROM_EMAIL,
                    to: to,
                    subject: subject,
                    html: htmlContent,
                }, function (err, info) {
                    if (err) {
                        console.error('Error sending email:', err);
                        return reject(err);
                    }

                    console.log('Email sent successfully:', info.messageId);
                    resolve(info);
                });
            });
        } catch (error) {
            console.error('Error:', error);
            reject(error);
        }
    });
}

module.exports = {
    sendEmail: sendEmail,
};
