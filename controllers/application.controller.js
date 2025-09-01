const axios = require('axios');

axios.defaults.headers.common["n-partner-identity-origin"] =
  "api-client-15m5ySJRcY4GTqe3oWzHlDCJ1I2SI9AZe+4lBIKpFW4jpVe92aNAPjKZe6gFZOMa";
axios.defaults.headers.common["Content-Type"] = "application/json";

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
      `${process.env.API_ENDPOINT}/enroll/application`,
      req.body,
      {
        headers: {
          Authorization: `Bearer ${req.accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Only send email if sendEmail query param is true
    if (req.query.sendEmail === 'true') {
      await applicationService.sendMerchantLinkEmail(
        req.body.applicationEmail,
        req.body.externalKey,
        req.body.business?.corporateName || req.body.applicationName
      );
    }

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
    
    console.log(`🔍 Retrieving application data for: ${externalKey}`);
    
    // First try to get from MongoDB
    const mongoApplication = await applicationService.getApplicationByExternalKey(externalKey);
    
    if (mongoApplication) {
      console.log(`✅ MongoDB data found for ${externalKey}:`, {
        hasBusiness: !!mongoApplication.business,
        hasPrincipals: !!mongoApplication.principals,
        hasPlan: !!mongoApplication.plan,
        hasBankAccount: !!mongoApplication.bankAccount,
        hasShipping: !!mongoApplication.shipping,
        hasStatementDelivery: !!mongoApplication.statementDeliveryMethod
      });
    } else {
      console.log(`❌ No MongoDB data found for ${externalKey}`);
    }
    
    // Try to get from PaymentsHub API, but don't fail if it's not available
    let paymentsHubResponse = null;
    try {
      const response = await axios.get(
        `${process.env.API_ENDPOINT}/enroll/application/key/${externalKey}`,
        {
          headers: {
            Authorization: `Bearer ${req.accessToken}`,
          },
        }
      );
      paymentsHubResponse = response.data;
      console.log(`✅ PaymentsHub data retrieved for ${externalKey}`);
    } catch (paymentsHubError) {
      console.log(`⚠️ PaymentsHub API not available for ${externalKey}, using MongoDB data only`);
      // Continue with MongoDB data only
    }
    
    // Ensure all required fields are present in the response
    const responseData = {
      mongoApplication,
      paymentsHubResponse,
      status: 'success',
      retrievedAt: new Date().toISOString()
    };
    
    console.log(`📤 Sending response for ${externalKey} with status: ${responseData.status}`);
    
    res.json(responseData);
  } catch (error) {
    console.error(`❌ Error getting application ${req.params.externalKey}:`, error);
    
    // If MongoDB fails, try to return PaymentsHub data if available
    try {
      const response = await axios.get(
        `${process.env.API_ENDPOINT}/enroll/application/key/${req.params.externalKey}`,
        {
          headers: {
            Authorization: `Bearer ${req.accessToken}`,
          },
        }
      );
      
      res.json({
        mongoApplication: null,
        paymentsHubResponse: response.data,
        status: 'partial',
        message: 'MongoDB data unavailable, using PaymentsHub data',
        retrievedAt: new Date().toISOString()
      });
    } catch (paymentsHubError) {
      // Both failed
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve application data',
        error: error.message,
        retrievedAt: new Date().toISOString()
      });
    }
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
      `${process.env.API_ENDPOINT}/enroll/application/key/${externalKey}`,
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
      `${process.env.API_ENDPOINT}/enroll/application/merchant/send/key/${externalKey}`,
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
      `${process.env.API_ENDPOINT}/enroll/application/validate/${encodeURIComponent(externalKey)}`,
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
    
    console.log(`🚀 Submitting application ${externalKey} to underwriting...`);
    
    // This will validate bank documents and update status
    const updatedApplication = await applicationService.submitToUnderwriting(externalKey);
    
    // Call PaymentsHub API
    const response = await axios.put(
      `${process.env.API_ENDPOINT}/enroll/application/submit/${externalKey}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${req.accessToken}`,
        },
      }
    );
    
    console.log(`✅ Application ${externalKey} submitted successfully`);
    
    res.json({
      status: 'success',
      message: 'Application submitted to underwriting successfully',
      mongoApplication: updatedApplication,
      paymentsHubResponse: response.data
    });
  } catch (error) {
    console.error(`❌ Error submitting application ${req.params.externalKey}:`, error);
    
    // Handle different types of errors
    if (error.response) {
      // PaymentsHub API error
      const errorData = error.response.data;
      res.status(error.response.status).json({
        status: 'error',
        message: 'Failed to submit application to PaymentsHub',
        error: errorData,
        mongoApplication: null,
        paymentsHubResponse: null
      });
    } else if (error.request) {
      // Network error
      res.status(500).json({
        status: 'error',
        message: 'Network error - could not reach PaymentsHub',
        error: 'No response received from server',
        mongoApplication: null,
        paymentsHubResponse: null
      });
    } else {
      // Other error (like MongoDB validation)
      res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to submit application',
        error: error.message,
        mongoApplication: null,
        paymentsHubResponse: null
      });
    }
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
    const { link, applicationEmail } = await applicationService.generateMerchantLink(externalKey);

    // Update application status
    await applicationService.changeApplicationStatus(externalKey, 'link_generated');

    res.json({
      status: 'success',
      message: 'Merchant link generated successfully',
      link,
      applicationEmail
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

exports.getDocumentTypes = async (req, res) => {
  try {
    const response = await applicationService.getDocumentTypes(req.accessToken);
    res.json(response);
  } catch (error) {
    console.error('Error in getDocumentTypes controller:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch document types'
    });
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
      let s3Url = null;

      if (!req.file) {
        return res.status(400).json({
          status: 'error',
          message: 'No file uploaded'
        });
      }

      try {
        // Generate unique key for S3
        const key = `applications/${externalKey}/documents/${Date.now()}-${req.file.originalname}`;
        
        // Upload to S3
        s3Url = await s3Service.uploadFile(req.file, key);

        // Convert file to base64 for PaymentsHub
        const base64File = req.file.buffer.toString('base64');

        // Upload to PaymentsHub
        const paymentsHubResponse = await applicationService.uploadDocumentToPaymentsHub(
          externalKey,
          {
            fileName: req.file.originalname,
            fileType: type,
            attachment: base64File
          },
          req.accessToken
        );

        // Save document info to MongoDB
        const updatedApplication = await applicationService.addDocument(externalKey, {
          type,
          url: s3Url,
          key,
          originalName: req.file.originalname
        });

        res.json({
          status: 'success',
          message: 'Document uploaded successfully',
          document: updatedApplication.documents[updatedApplication.documents.length - 1],
          paymentsHubResponse
        });
      } catch (error) {
        // If any error occurs and we've uploaded to S3, try to delete the file
        if (s3Url) {
          try {
            await s3Service.deleteFile(key);
          } catch (s3Error) {
            console.error('Failed to delete S3 file after error:', s3Error);
          }
        }

        // Send error response
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

exports.getApplicationPDF = async (req, res) => {
  try {
    const { externalKey } = req.params;
    const pdfBuffer = await applicationService.getApplicationPDF(externalKey, req.accessToken);
    
    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=application-${externalKey}.pdf`);
    
    // Send the PDF buffer
    res.send(pdfBuffer);
  } catch (error) {
    if (error.message === 'Application PDF not found') {
      res.status(404).json({
        status: 'error',
        message: 'Application PDF not found'
      });
    } else {
      handleApiError(res, error);
    }
  }
};

exports.saveApplication = async (req, res) => {
  try {
    const { externalKey } = req.params;
    
    console.log(`💾 Saving application ${externalKey} to MongoDB...`);
    console.log('📝 Form data received:', {
      hasBusiness: !!req.body.business,
      hasPrincipals: !!req.body.principals,
      hasPlan: !!req.body.plan,
      hasBankAccount: !!req.body.bankAccount,
      hasShipping: !!req.body.shipping,
      hasStatementDelivery: !!req.body.statementDeliveryMethod,
      businessFields: req.body.business ? Object.keys(req.body.business) : [],
      principalCount: req.body.principals ? req.body.principals.length : 0
    });

    // Detailed EBT logging
    if (req.body.business && req.body.business.ebt) {
      console.log('🔍 EBT data received:', {
        type: typeof req.body.business.ebt,
        value: JSON.stringify(req.body.business.ebt, null, 2),
        hasEbtType: !!req.body.business.ebt.ebtType,
        hasEbtAccountNumber: !!req.body.business.ebt.ebtAccountNumber
      });
    }

    // Only save to MongoDB - no PaymentsHub API call
    let savedApplication;
    try {
      // Use the comprehensive save method that handles all error types
      savedApplication = await applicationService.saveApplicationComprehensive(externalKey, req.body);
    } catch (error) {
      console.error('❌ All save strategies failed:', error.message);
      throw error;
    }
    
    console.log(`✅ Application ${externalKey} saved successfully to MongoDB`);
    console.log('📊 Saved data summary:', {
      hasBusiness: !!savedApplication.business,
      hasPrincipals: !!savedApplication.principals,
      hasPlan: !!savedApplication.plan,
      hasBankAccount: !!savedApplication.bankAccount,
      hasShipping: !!savedApplication.shipping,
      hasStatementDelivery: !!savedApplication.statementDeliveryMethod,
      businessFields: savedApplication.business ? Object.keys(savedApplication.business) : [],
      principalCount: savedApplication.principals ? savedApplication.principals.length : 0
    });
    
    res.json({
      status: 'success',
      message: 'Application saved successfully to MongoDB',
      mongoApplication: savedApplication,
      savedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error(`❌ Error saving application ${req.params.externalKey}:`, error);
    handleApiError(res, error);
  }
};

exports.getApplicationDataSummary = async (req, res) => {
  try {
    const { externalKey } = req.params;
  
    
    const application = await applicationService.getApplicationByExternalKey(externalKey);
    
    if (!application) {
      return res.status(404).json({
        status: 'error',
        message: 'Application not found'
      });
    }
    
    // Create a comprehensive data summary
    const dataSummary = {
      externalKey: application.externalKey,
      status: application.status,
      lastUpdated: application.updatedAt,
      dataCompleteness: {
        basicInfo: {
          agent: !!application.agent,
          applicationName: !!application.applicationName,
          externalKey: !!application.externalKey
        },
        business: {
          corporateName: !!application.business?.corporateName,
          dbaName: !!application.business?.dbaName,
          businessType: !!application.business?.businessType,
          federalTaxIdNumber: !!application.business?.federalTaxIdNumber,
          mcc: !!application.business?.mcc,
          phone: !!application.business?.phone,
          email: !!application.business?.email,
          averageTicketAmount: !!application.business?.averageTicketAmount,
          averageMonthlyVolume: !!application.business?.averageMonthlyVolume,
          highTicketAmount: !!application.business?.highTicketAmount,
          merchandiseServicesSold: !!application.business?.merchandiseServicesSold,
          businessContact: !!application.business?.businessContact,
          businessAddress: !!application.business?.businessAddress,
          websites: !!application.business?.websites,
          ebt: !!application.business?.ebt
        },
        plan: {
          planId: !!application.plan?.planId,
          equipmentCostToMerchant: !!application.plan?.equipmentCostToMerchant,
          accountSetupFee: !!application.plan?.accountSetupFee,
          discountFrequency: !!application.plan?.discountFrequency,
          equipment: !!application.plan?.equipment
        },
        shipping: {
          shippingDestination: !!application.shipping?.shippingDestination,
          deliveryMethod: !!application.shipping?.deliveryMethod
        },
        principals: {
          count: application.principals ? application.principals.length : 0,
          hasPersonalGuarantor: application.principals ? application.principals.some(p => p.isPersonalGuarantor) : false
        },
        bankAccount: {
          abaRouting: !!application.bankAccount?.abaRouting,
          accountType: !!application.bankAccount?.accountType,
          demandDepositAccount: !!application.bankAccount?.demandDepositAccount
        },
        statementDeliveryMethod: !!application.statementDeliveryMethod,
        documents: {
          count: application.documents ? application.documents.length : 0,
          types: application.documents ? application.documents.map(d => d.type) : []
        }
      },
      fieldValues: {
        business: application.business || {},
        plan: application.plan || {},
        shipping: application.shipping || {},
        principals: application.principals || [],
        bankAccount: application.bankAccount || {},
        statementDeliveryMethod: application.statementDeliveryMethod
      }
    };
    
    res.json({
      status: 'success',
      message: 'Data summary retrieved successfully',
      dataSummary,
      retrievedAt: new Date().toISOString()
    });
    
  } catch (error) {
    handleApiError(res, error);
  }
};