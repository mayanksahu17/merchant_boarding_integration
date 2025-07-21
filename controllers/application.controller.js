const axios = require('axios');
const { handleApiError } = require('../utils/errorHandler');
const applicationService = require('../services/application.service');
const mailerService = require('../services/mailer.service');

exports.createApplication = async (req, res) => {
  try {
    const savedApplication = await applicationService.createApplication(req.body);

    // Call PaymentsHub API
    const response = await axios.post(
      "https://enrollment-api-sandbox.paymentshub.com/enroll/application",
      req.body,
      {
        headers: {
          Authorization: `Bearer ${req.accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Send email automatically
    await mailerService.sendMerchantDetails(
      req.body.email,
      req.body.externalKey,
      req.body.business?.corporateName || req.body.applicationName
    );

    res.json({
      mongoApplication: savedApplication,
      paymentsHubResponse: response.data
    });
  } catch (error) {
    handleApiError(res, error);
  }
};

exports.getApplication = async (req, res) => {
  try {
    const { externalKey } = req.params;
    
    // First try to get from MongoDB
    const mongoApplication = await applicationService.getApplicationByExternalKey(externalKey);
    
    // Then get from PaymentsHub API
    const response = await axios.get(
      `https://enrollment-api-sandbox.paymentshub.com/enroll/application/key/${externalKey}`,
      {
        headers: {
          Authorization: `Bearer ${req.accessToken}`,
        },
      }
    );
    
    res.json({
      mongoApplication,
      paymentsHubResponse: response.data
    });
  } catch (error) {
    handleApiError(res, error);
  }
};

exports.updateApplication = async (req, res) => {
  try {
    const { externalKey } = req.params;

    console.log('Updating application:', req.body);

    // Update in MongoDB
    const updatedApplication = await applicationService.updateApplicationByExternalKey(externalKey, req.body);
    
    // Update in PaymentsHub API
    const response = await axios.patch(
      `https://enrollment-api-sandbox.paymentshub.com/enroll/application/key/${externalKey}`,
      req.body,
      {
        headers: {
          Authorization: `Bearer ${req.accessToken}`,
        },
      }
    );
    
    res.json({
      mongoApplication: updatedApplication,
      paymentsHubResponse: response.data
    });
  } catch (error) {
    handleApiError(res, error);
  }
};

exports.sendToMerchant = async (req, res) => {
  try {
    const { externalKey } = req.params;
    
    // Update status in MongoDB
    const updatedApplication = await applicationService.changeApplicationStatus(externalKey, 'sent_to_merchant');
    
    // Send to merchant in PaymentsHub API
    const response = await axios.put(
      `https://enrollment-api-sandbox.paymentshub.com/enroll/application/merchant/send/key/${externalKey}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${req.accessToken}`,
        },
      }
    );
    
    res.json({
      mongoApplication: updatedApplication,
      paymentsHubResponse: response.data
    });
  } catch (error) {
    handleApiError(res, error);
  }
};

exports.validateApplication = async (req, res) => {
  try {
    const { externalKey } = req.params;
    
    // Get from MongoDB
    const mongoApplication = await applicationService.getApplicationByExternalKey(externalKey);
    
    // Validate in PaymentsHub API
    const response = await axios.get(
      `https://enrollment-api-sandbox.paymentshub.com/enroll/application/validate/${encodeURIComponent(externalKey)}`,
      {
        headers: {
          Authorization: `Bearer ${req.accessToken}`,
        },
      }
    );
    
    res.json({
      mongoApplication,
      paymentsHubResponse: response.data
    });
  } catch (error) {
    handleApiError(res, error);
  }
};

exports.submitToUnderwriting = async (req, res) => {
  try {
    const { externalKey } = req.params;
    
    // Update status in MongoDB
    const updatedApplication = await applicationService.changeApplicationStatus(externalKey, 'submitted_to_underwriting');
    
    // Submit to underwriting in PaymentsHub API
    const response = await axios.put(
      `https://enrollment-api-sandbox.paymentshub.com/enroll/application/submit/${externalKey}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${req.accessToken}`,
        },
      }
    );
    
    res.json({
      mongoApplication: updatedApplication,
      paymentsHubResponse: response.data
    });
  } catch (error) {
    handleApiError(res, error);
  }
};

exports.getAllApplications = async (req, res) => {
  try {
    const applications = await applicationService.getAllApplications();
    res.json(applications);
  } catch (error) {
    handleApiError(res, error);
  }
};

exports.generateMerchantLink = async (req, res) => {
  try {
    const { externalKey } = req.body;
    const { link } = await applicationService.generateMerchantLink(externalKey);
    res.json({ link });
  } catch (error) {
    handleApiError(res, error);
  }
};

exports.sendMerchantLinkEmail = async (req, res) => {
  try {
    const { email, externalKey } = req.body;
    
    // Input validation
    if (!email || !externalKey) {
      return res.status(400).json({
        message: 'Missing required fields',
        details: {
          email: !email ? 'Email is required' : null,
          externalKey: !externalKey ? 'External key is required' : null
        }
      });
    }
    
    // Get application to verify it exists
    const application = await applicationService.getApplicationByExternalKey(externalKey);
    if (!application) {
      return res.status(404).json({
        message: 'Application not found',
        details: { externalKey }
      });
    }
    
    // Generate or get existing link
    const link = application.merchantLink || 
      (await applicationService.generateMerchantLink(externalKey)).link;
    
    try {
      // Send email using mailer service
      const emailResult = await mailerService.sendMerchantDetails(
        email, 
        externalKey, 
        application.business?.corporateName || application.applicationName || 'Your Business'
      );
      
      // Update application status only if email was sent successfully
      await applicationService.changeApplicationStatus(externalKey, 'email_sent');
      
      return res.status(200).json({ 
        message: 'Merchant link email sent successfully',
        link,
        details: emailResult
      });
    } catch (emailError) {
      // Handle specific mailer errors
      if (emailError.name === 'MailerError') {
        return res.status(emailError.status || 500).json({
          message: emailError.message,
          details: emailError.details
        });
      }
      
      // Handle unexpected errors
      console.error('Email sending failed:', emailError);
      return res.status(500).json({ 
        message: 'Failed to send merchant link email',
        details: {
          error: emailError.message,
          email,
          externalKey
        }
      });
    }
  } catch (error) {
    // Handle application-level errors
    console.error('Application processing failed:', error);
    if (error.name === 'MailerError') {
      return res.status(error.status || 500).json({
        message: error.message,
        details: error.details
      });
    }
    
    return res.status(500).json({ 
      message: 'Failed to process merchant link email request',
      details: {
        error: error.message
      }
    });
  }
};

exports.deleteApplication = async (req, res) => {
  try {
    const { externalKey } = req.params;
    const deletedApp = await applicationService.deleteApplication(externalKey);
    
    if (!deletedApp) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    // Optionally call PaymentsHub API to delete there too
    
    res.json({ message: 'Application deleted successfully' });
  } catch (error) {
    handleApiError(res, error);
  }
};