const axios = require('axios');
const multer = require('multer');
const { handleApiError } = require('../utils/errorHandler');
const applicationService = require('../services/application.service');
const s3Service = require('../services/s3.service');

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPG, PNG, and DOC files are allowed.'));
    }
  }
}).single('file');

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
    await applicationService.sendMerchantLinkEmail(
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
    
    // This will validate bank documents and update status
    const updatedApplication = await applicationService.submitToUnderwriting(externalKey);
    
    // Call PaymentsHub API
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

    if (!externalKey) {
      return res.status(400).json({
        status: 'error',
        message: 'External key is required'
      });
    }

    // Get application to verify it exists
    const application = await applicationService.getApplicationByExternalKey(externalKey);
    if (!application) {
      return res.status(404).json({
        status: 'error',
        message: 'Application not found'
      });
    }

    // Generate the merchant link
    const { link } = await applicationService.generateMerchantLink(externalKey);

    // Update application status
    await applicationService.changeApplicationStatus(externalKey, 'link_generated');

    res.json({
      status: 'success',
      message: 'Merchant link generated successfully',
      link
    });
  } catch (error) {
    handleApiError(res, error);
  }
};

exports.sendMerchantLinkEmail = async (req, res) => {
  try {
    const { email, externalKey } = req.body;

    if (!email || !externalKey) {
      return res.status(400).json({
        status: 'error',
        message: 'Email and external key are required'
      });
    }

    // Get application to verify it exists
    const application = await applicationService.getApplicationByExternalKey(externalKey);
    if (!application) {
      return res.status(404).json({
        status: 'error',
        message: 'Application not found'
      });
    }

    // Generate link if not already generated
    const { link } = await applicationService.generateMerchantLink(externalKey);

    // Send email
    await applicationService.sendMerchantLinkEmail(email, externalKey, application.applicationName);

    res.json({
      status: 'success',
      message: 'Merchant link email sent successfully',
      link
    });
  } catch (error) {
    handleApiError(res, error);
  }
};

exports.uploadDocument = async (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          status: 'error',
          message: err.message
        });
      }

      const { externalKey } = req.params;
      const { type } = req.body;

      if (!req.file) {
        return res.status(400).json({
          status: 'error',
          message: 'No file uploaded'
        });
      }

      if (!type || !['voided_check', 'bank_statement', 'processing_statement'].includes(type)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid document type'
        });
      }

      try {
        // Generate unique key for S3
        const key = `applications/${externalKey}/documents/${Date.now()}-${req.file.originalname}`;
        
        // Upload to S3
        const url = await s3Service.uploadFile(req.file, key);

        // Save document info to MongoDB
        const updatedApplication = await applicationService.addDocument(externalKey, {
          type,
          url,
          key,
          originalName: req.file.originalname
        });

        res.json({
          status: 'success',
          message: 'Document uploaded successfully',
          document: updatedApplication.documents[updatedApplication.documents.length - 1]
        });
      } catch (error) {
        // If MongoDB save fails, try to delete the uploaded file from S3
        if (error && url) {
          try {
            await s3Service.deleteFile(key);
          } catch (s3Error) {
            console.error('Failed to delete S3 file after MongoDB error:', s3Error);
          }
        }

        res.status(500).json({
          status: 'error',
          message: error.message || 'Failed to upload document'
        });
      }
    });
  } catch (error) {
    handleApiError(res, error);
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const { externalKey, documentId } = req.params;

    // Get document info before deletion
    const application = await applicationService.getApplicationByExternalKey(externalKey);
    if (!application) {
      return res.status(404).json({
        status: 'error',
        message: 'Application not found'
      });
    }

    const document = application.documents.id(documentId);
    if (!document) {
      return res.status(404).json({
        status: 'error',
        message: 'Document not found'
      });
    }

    // Only remove document from MongoDB
    const updatedApplication = await applicationService.removeDocument(externalKey, documentId);

    res.json({
      status: 'success',
      message: 'Document deleted successfully from database',
      application: updatedApplication
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    handleApiError(res, error);
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