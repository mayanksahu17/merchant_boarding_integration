const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.sendMerchantDetails = async (email, externalKey, businessName) => {
  const merchantFormURL = `${process.env.FRONTEND_URL}/merchant-form?key=${encodeURIComponent(externalKey)}`;

  const mailOptions = {
    from: `"ZifyBot Onboarding" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Merchant Onboarding Details',
    html: `
      <h2>Hi from ZifyBot 👋</h2>
      <p>Your application for <strong>${businessName}</strong> has been created.</p>
      <p>Please click the link below to complete your merchant onboarding:</p>
      <p><a href="${merchantFormURL}" target="_blank">${merchantFormURL}</a></p>
      <br/>
      <p>Need help? Just reply to this email.</p>
      <p>Regards,<br/>ZifyBot Team</p>
    `
  };

  await transporter.sendMail(mailOptions);
};
