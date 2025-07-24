const nodemailer = require('nodemailer');
const config = require('../config/mailer.config');

// Validate required configuration
if (!config.email || !config.password) {
  console.error('Missing email configuration. Please set EMAIL_USER and EMAIL_PASS environment variables.');
}

const transporter = nodemailer.createTransport({
  service: config.service || 'gmail',
  auth: {
    user: config.email,
    pass: config.password
  }
});

// Verify transporter configuration
transporter.verify()
  .then(() => console.log('Mailer service is ready'))
  .catch(err => console.error('Mailer service configuration error:', err));

class MailerError extends Error {
  constructor(message, details = null) {
    super(message);
    this.name = 'MailerError';
    this.details = details;
    this.status = 500;
  }
}

exports.sendMerchantDetails = async (email, externalKey, businessName) => {
  // Input validation
  if (!email) {
    throw new MailerError('Email address is required', { field: 'email' });
  }
  if (!externalKey) {
    throw new MailerError('External key is required', { field: 'externalKey' });
  }
  if (!config.frontendUrl) {
    throw new MailerError('Frontend URL is not configured', { config: 'FRONTEND_URL' });
  }

  const merchantFormURL = `${config.frontendUrl}/merchant-form?key=${encodeURIComponent(externalKey)}`;

  const mailOptions = {
    from: `"Zifypay Onboarding" <${config.email}>`,
    to: email,
    subject: 'Complete Your Merchant Application',
    html: `
      <h2>Hi from Zifypay Team 👋</h2>
      <p>Your application for <strong>${businessName || 'your business'}</strong> has been created.</p>
      <p>Please click the button below to complete your merchant onboarding:</p>
      <p style="margin: 20px 0;">
        <a href="${merchantFormURL}" 
           style="background: #2196F3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          📝 Complete Application
        </a>
      </p>
      <p>Or copy and paste this link into your browser:</p>
      <p style="background: #f5f5f5; padding: 10px; border-radius: 4px; word-break: break-all;">
        ${merchantFormURL}
      </p>
      <p>This link will allow you to fill out your merchant application details.</p>
      <p>Need help? Just reply to this email.</p>
      <p>Best regards,<br/>Zifypay Team</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true, email, externalKey };
  } catch (error) {
    console.error('Failed to send email:', error);
    throw new MailerError(
      'Failed to send merchant email', 
      { 
        originalError: error.message,
        email,
        externalKey 
      }
    );
  }
};
