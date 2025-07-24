const Application = require('../models/application.model');

const createApplication = async (applicationData) => {
  const application = new Application({
    ...applicationData,
    status: 'pending',
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

  // If link already exists, return it
  if (application.merchantLink) {
    return { link: application.merchantLink };
  }
  
  // Generate a new link
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const link = `${baseUrl}/merchant-form?key=${encodeURIComponent(externalKey)}`;
  
  // Save the link to the application
  application.merchantLink = link;
  await application.save();
  
  return { link };
};

const sendMerchantLinkEmail = async (email, externalKey, applicationName) => {
  const application = await Application.findOne({ externalKey });
  if (!application) {
    throw new Error('Application not found');
  }

  // Generate link if not already exists
  const { link } = await generateMerchantLink(externalKey);

  // Send email using your email service
  // This is a placeholder - implement your email sending logic here
  console.log(`Sending email to ${email} with link ${link}`);

  // Update application status
  application.status = 'email_sent';
  await application.save();

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
  submitToUnderwriting
};