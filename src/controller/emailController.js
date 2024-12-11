const sendEmail = require('../services/emailService'); // Import the email service

// Controller to handle sending welcome emails
const sendWelcomeEmail = async (req, res) => {
  const { email, name } = req.body;

  try {
    // Call the email service to send the email
    await sendEmail(
      email,                        // Recipient's email
      'Thank You for the booking at PK Photography.',     // Subject
      { name }                      // Data to inject into the template
    );

    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send email', error });
  }
};

module.exports = { sendWelcomeEmail };
