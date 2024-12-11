// const nodemailer = require('nodemailer');
// const ejs = require('ejs');
// const path = require('path');

// // Create a transporter
// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: 'anshuman55.at@gmail.com', // Your Gmail address
//       pass: 'ahfc vasv ceqp tqne',    // Your Gmail app password
//     },
//   });
  

// // Function to send email
// const sendEmail = async (to, subject, data) => {
//     try {
//       const templatePath = path.join(__dirname, '..', 'template', 'welcomeEmail.ejs');
//       const htmlContent = await ejs.renderFile(templatePath, data);
  
//       const info = await transporter.sendMail({
//         from: 'anshuman55.at@gmail.com',
//         to,
//         subject,
//         html: htmlContent,
//       });
  
//       console.log('Email sent successfully:', info.messageId);
//       console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
//     } catch (error) {
//       console.error('Error sending email:', error);
//       throw error;
//     }
//   };
  

// module.exports = sendEmail;


const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');

// Create a transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'anshuman55.at@gmail.com', // Replace with your email
    pass: 'ahfc vasv ceqp tqne',    // Replace with your app password or email password
  },
});

// Function to send email
const sendEmail = async (to, subject, data) => {
  try {
    // Update template path to match your folder structure
    const templatePath = path.join(__dirname, 'template', 'welcomeEmail.ejs');
    console.log('Resolved Template Path:', templatePath); // Debugging line

    // Render the EJS template to HTML
    const htmlContent = await ejs.renderFile(templatePath, data);

    // Send the email
    const info = await transporter.sendMail({
      from: 'booking@pkphotography.in',
      to,
      subject,
      html: htmlContent,
    });

    console.log('Email sent successfully:', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = sendEmail;
