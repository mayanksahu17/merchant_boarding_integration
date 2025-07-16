const sgMail = require('@sendgrid/mail');
const { sendgridApiKey, fromEmail, noreplyEmail } = require('../config/email.config');

sgMail.setApiKey(sendgridApiKey);

async function sendMerchantLink(email, externalKey, baseUrl) {
  console.log(`Sending merchant link email to ${email} for externalKey: ${externalKey}`);
  const merchantUrl = `${baseUrl}/merchant-form.html?key=${encodeURIComponent(externalKey)}`;
  const msg = {
    to: email,
    from: fromEmail,
    subject: 'Your Merchant Application Link',
    html: `
      <h2>Merchant Application Link</h2>
      <p>You have been invited to complete your merchant application.</p>
      <p><strong>Application ID:</strong> ${externalKey}</p>
      <p>Click the link below to access your application form:</p>
      <p style="margin: 20px 0;">
        <a href="${merchantUrl}" style="background: #2196F3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          📝 Complete Application
        </a>
      </p>
      <p>Or copy and paste this link into your browser:</p>
      <p style="background: #f5f5f5; padding: 10px; border-radius: 4px; word-break: break-all;">
        ${merchantUrl}
      </p>
      <p>This link will allow you to fill out your merchant application details.</p>
      <p>If you have any questions, please contact our support team.</p>
      <p>Best regards,<br>Merchant Onboarding Team</p>
    `
  };
  await sgMail.send(msg);
}

async function sendSubmissionConfirmation(email, applicationName, externalKey) {
  const msg = {
    to: email,
    from: noreplyEmail,
    subject: 'Application Submitted to Underwriting',
    html: `
      <h2>Application Submitted Successfully!</h2>
      <p>Your merchant application has been submitted to underwriting for review.</p>
      <p><strong>Application Name:</strong> ${applicationName}</p>
      <p><strong>Application ID:</strong> ${externalKey}</p>
      <p><strong>Submission Date:</strong> ${new Date().toLocaleDateString()}</p>
      <p>Our underwriting team will review your application and contact you within 2-3 business days.</p>
      <p>You will receive updates on your application status via email.</p>
      <p>Thank you for choosing our merchant services!</p>
      <p>Best regards,<br>Merchant Onboarding Team</p>
    `
  };
  await sgMail.send(msg);
}

module.exports = {
  sendMerchantLink,
  sendSubmissionConfirmation
};