const emailService = require('../services/email.service');

exports.sendMerchantLink = async (req, res) => {
  try {
    const { email, externalKey } = req.body;
    const baseUrl = req.headers.origin || `http://localhost:${process.env.PORT || 8000}`;
    await emailService.sendMerchantLink(email, externalKey, baseUrl);
    res.json({ success: true, message: 'Merchant link email sent successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.sendSubmissionConfirmation = async (req, res) => {
  try {
    const { email, applicationName, externalKey } = req.body;
    await emailService.sendSubmissionConfirmation(email, applicationName, externalKey);
    res.json({ success: true, message: 'Submission confirmation email sent successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};