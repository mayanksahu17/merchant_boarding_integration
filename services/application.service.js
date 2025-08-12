const Application = require('../models/application.model');
const { sendMerchantDetails } = require('./mailer.service');
const axios = require('axios');

const createApplication = async (applicationData) => {
  const application = new Application({
    ...applicationData,
    applicationEmail: applicationData.email,
    status: 'pending',
    applicationEmail: applicationData.email,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  return await application.save();
};

const getApplicationByExternalKey = async (externalKey) => {
  return await Application.findOne({ externalKey });
};

const getAllApplications = async () => {
  return await Application.find().sort({ createdAt: -1 });
};

const updateApplicationByExternalKey = async (externalKey, updateData) => {
  const application = await Application.findOne({ externalKey });
  if (!application) {
    throw new Error('Application not found');
  }

  // If documents are being updated, merge them with existing documents
  if (updateData.documents) {
    const existingDocTypes = application.documents.map(doc => doc.type);
    const newDocs = updateData.documents.filter(doc => !existingDocTypes.includes(doc.type));
    application.documents.push(...newDocs);
    delete updateData.documents;
  }

  // Update other fields
  Object.assign(application, updateData);
  return await application.save();
};

const changeApplicationStatus = async (externalKey, status) => {
  return await Application.findOneAndUpdate(
    { externalKey },
    { status },
    { new: true }
  );
};

const deleteApplication = async (externalKey) => {
  return await Application.findOneAndDelete({ externalKey });
};

const generateMerchantLink = async (externalKey) => {
  const application = await Application.findOne({ externalKey });
  if (!application) {
    throw new Error('Application not found');
  }

  const link = `http://merchant.zifypay.com/merchant-form?key=${encodeURIComponent(externalKey)}`;
  // If link already exists, return it
  if (application.merchantLink) {
    return { 
      link: link,
      applicationEmail: application.applicationEmail 
    };
  }
  
  // Generate a new link

  // Save the link to the application
  application.merchantLink = link;
  await application.save();
  
  return { 
    link,
    applicationEmail: application.applicationEmail 
  };
};

const sendMerchantLinkEmail = async (email, externalKey, applicationName, updateStatus = true) => {
  const application = await Application.findOne({ externalKey });
  if (!application) {
    throw new Error('Application not found');
  }

  // Generate link if not already exists
  const { link } = await generateMerchantLink(externalKey);

  // Send email using your email service
  await sendMerchantDetails(email, externalKey, applicationName);
  // This is a placeholder - implement your email sending logic here
  console.log(`Sending email to ${email} with link ${link}`);

  // Update application status only if updateStatus is true
  if (updateStatus) {
    application.status = 'email_sent';
    await application.save();
  }

  return { link };
};

const addDocument = async (externalKey, documentData) => {
  const application = await Application.findOne({ externalKey });
  if (!application) {
    throw new Error('Application not found');
  }

  // Add the new document
  application.documents.push(documentData);
  return await application.save();
};

const removeDocument = async (externalKey, documentId) => {
  try {
    const application = await Application.findOne({ externalKey });
    if (!application) {
      throw new Error('Application not found');
    }

    // Find the document in the array
    const documentToRemove = application.documents.id(documentId);
    if (!documentToRemove) {
      throw new Error('Document not found');
    }

    // Remove the document from the array
    application.documents.pull(documentId);

    // Save the application
    await application.save();

    return application;
  } catch (error) {
    console.error('Error removing document from MongoDB:', error);
    throw error;
  }
};

const validateDocuments = async (externalKey) => {
  const application = await getApplicationByExternalKey(externalKey);
  if (!application) {
    throw new Error('Application not found');
  }

  // Check if required documents are present
  const requiredDocuments = ['business_license', 'tax_document', 'identity_proof'];
  const uploadedDocumentTypes = application.documents.map(doc => doc.type);
  
  const missingDocuments = requiredDocuments.filter(
    type => !uploadedDocumentTypes.includes(type)
  );

  if (missingDocuments.length > 0) {
    throw new Error(`Missing required documents: ${missingDocuments.join(', ')}`);
  }

  return true;
};

const validateBankDocuments = async (externalKey) => {
  const application = await Application.findOne({ externalKey });
  if (!application) {
    throw new Error('Application not found');
  }

  return application.validateBankDocuments();
};

const submitToUnderwriting = async (externalKey) => {
  const application = await Application.findOne({ externalKey });
  if (!application) {
    throw new Error('Application not found');
  }

  // Validate bank documents before submission
  application.validateBankDocuments();

  // Update status and save
  application.status = 'submitted_to_underwriting';
  return await application.save();
};

const getApplicationPDF = async (externalKey, accessToken) => {
  try {
    const response = await axios.get(
      `https://enrollment-api-sandbox.paymentshub.com/enroll/application/pdf/key/${externalKey}`,
      {
        responseType: 'arraybuffer',
        headers: {
          'Accept': 'application/pdf',
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    // Check if the response is an error (PaymentsHub sends JSON errors even with arraybuffer response)
    const contentType = response.headers['content-type'];
    if (contentType && contentType.includes('application/json')) {
      // Convert arraybuffer to string to parse error
      const decoder = new TextDecoder('utf-8');
      const errorJson = JSON.parse(decoder.decode(response.data));
      throw new Error(errorJson.data?.errors || 'Failed to fetch PDF');
    }

    return response.data;
  } catch (error) {
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('Application PDF not found');
      }
      // Try to parse error message if it's JSON
      if (error.response.data) {
        try {
          const decoder = new TextDecoder('utf-8');
          const errorJson = JSON.parse(decoder.decode(error.response.data));
          throw new Error(errorJson.data?.errors || 'Failed to fetch PDF');
        } catch (e) {
          // If parsing fails, use generic error
          throw new Error('Failed to fetch PDF');
        }
      }
    }
    throw error;
  }
};

const getDocumentTypes = async (accessToken) => {
  try {
    const response = await axios.get(
      `${process.env.API_ENDPOINT}/enroll/document/type/list`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Transform the response to match our API format
    if (response.data && response.data.data) {
      return {
        status: 'success',
        data: response.data.data
      };
    }

    return {
      status: 'success',
      data: [] // Return empty array if no data
    };
  } catch (error) {
    console.error('Error fetching document types:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch document types');
  }
};

const uploadDocumentToPaymentsHub = async (externalKey, documentData, accessToken) => {
  try {
    const response = await axios.put(
      `https://enrollment-api-sandbox.paymentshub.com/enroll/document/upload/key/${externalKey}`,
      {
        fileName: documentData.fileName,
        fileType: documentData.fileType,
        attachment: documentData.attachment // Base64 encoded file
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error uploading document to PaymentsHub:', error);
    throw error;
  }
};

module.exports = {
  createApplication,
  getApplicationByExternalKey,
  getAllApplications,
  updateApplicationByExternalKey,
  changeApplicationStatus,
  deleteApplication,
  generateMerchantLink,
  sendMerchantLinkEmail,
  addDocument,
  removeDocument,
  validateDocuments,
  validateBankDocuments,
  submitToUnderwriting,
  getApplicationPDF,
  getDocumentTypes,
  uploadDocumentToPaymentsHub
};