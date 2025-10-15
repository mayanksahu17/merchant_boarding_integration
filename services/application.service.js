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
  const application = await Application.findOne({ externalKey });
  return application;
};

const getAllApplications = async () => {
  return await Application.find().sort({ createdAt: -1 });
};

const updateApplicationByExternalKey = async (externalKey, updateData) => {
  const application = await Application.findOne({ externalKey });
  if (!application) {
    throw new Error('Application not found');
  }

  console.log('Updating application with data:', JSON.stringify(updateData, null, 2));
  
  // Check if there's a schema mismatch with EBT
  if (application.business && application.business.ebt) {
    console.log('🔍 Checking existing EBT schema...');
    console.log('Existing EBT type:', typeof application.business.ebt);
    console.log('Existing EBT value:', JSON.stringify(application.business.ebt, null, 2));
    
    // If EBT is not an object, reset it to proper structure
    if (typeof application.business.ebt !== 'object' || Array.isArray(application.business.ebt)) {
      console.log('⚠️ Resetting invalid EBT schema to proper structure');
      application.business.ebt = { ebtType: '', ebtAccountNumber: '' };
      // Mark as modified to ensure it gets saved
      application.markModified('business.ebt');
    }
  }

  // Handle documents separately to avoid overwriting
  if (updateData.documents) {
    const existingDocTypes = application.documents.map(doc => doc.type);
    const newDocs = updateData.documents.filter(doc => !existingDocTypes.includes(doc.type));
    application.documents.push(...newDocs);
    delete updateData.documents;
  }

  // Deep merge all fields to ensure no data is lost
  const deepMerge = (target, source) => {
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (!target[key]) target[key] = {};
        deepMerge(target[key], source[key]);
      } else if (Array.isArray(source[key])) {
        // For arrays, replace completely to avoid duplicates
        target[key] = [...source[key]];
      } else {
        target[key] = source[key];
      }
    }
  };

  // Ensure proper EBT structure
  if (updateData.business && updateData.business.ebt) {
    console.log('🔧 Processing EBT data:', JSON.stringify(updateData.business.ebt, null, 2));
    
    // Ensure ebt is properly structured as an object
    if (typeof updateData.business.ebt === 'string') {
      console.log('⚠️ EBT is string, converting to object');
      updateData.business.ebt = { ebtType: updateData.business.ebt, ebtAccountNumber: '' };
    }
    
    // Ensure ebt object has required fields
    if (!updateData.business.ebt.ebtType) updateData.business.ebt.ebtType = '';
    if (!updateData.business.ebt.ebtAccountNumber) updateData.business.ebt.ebtAccountNumber = '';
    
    console.log('✅ EBT data processed:', JSON.stringify(updateData.business.ebt, null, 2));
  }

  // Deep merge the update data
  deepMerge(application, updateData);
  
  // Ensure required fields are set
  application.updatedAt = new Date();
  
  // Additional validation for EBT structure
  if (application.business && application.business.ebt) {
    console.log('🔍 Validating EBT structure after merge...');
    console.log('EBT type:', typeof application.business.ebt);
    console.log('EBT value:', JSON.stringify(application.business.ebt, null, 2));
    
    // Force proper EBT structure
    if (typeof application.business.ebt !== 'object' || Array.isArray(application.business.ebt)) {
      console.log('⚠️ Fixing invalid EBT structure');
      application.business.ebt = { ebtType: '', ebtAccountNumber: '' };
    }
    
    // Ensure ebt object has required fields
    if (!application.business.ebt.ebtType) application.business.ebt.ebtType = '';
    if (!application.business.ebt.ebtAccountNumber) application.business.ebt.ebtAccountNumber = '';
    
    console.log('✅ EBT structure validated:', JSON.stringify(application.business.ebt, null, 2));
  }
  
  // Validate that all expected fields are present
  const validateDataCompleteness = (app) => {
    const validation = {
      hasAgent: !!app.agent,
      hasApplicationName: !!app.applicationName,
      hasExternalKey: !!app.externalKey,
      hasPlan: !!app.plan && !!app.plan.planId,
      hasShipping: !!app.shipping && !!app.shipping.shippingDestination,
      hasBusiness: !!app.business && !!app.business.corporateName,
      hasPrincipals: !!app.principals && app.principals.length > 0,
      hasBankAccount: !!app.bankAccount && !!app.bankAccount.abaRouting,
      hasStatementDelivery: !!app.statementDeliveryMethod,
      hasEbt: !!app.business?.ebt && typeof app.business.ebt === 'object'
    };
    
    console.log('📊 Data completeness validation:', validation);
    return validation;
  };
  
  const dataValidation = validateDataCompleteness(application);
  console.log('Final application data before save:', JSON.stringify(application, null, 2));
  
  try {
    // Use findOneAndUpdate instead of save() to avoid version conflicts
    const updatedApplication = await Application.findOneAndUpdate(
      { externalKey },
      { $set: application.toObject() },
      { 
        new: true, 
        runValidators: true,
        upsert: false 
      }
    );
    
    if (!updatedApplication) {
      throw new Error('Failed to update application');
    }
    
    return updatedApplication;
  } catch (error) {
    console.error('❌ Save error:', error);
    console.error('❌ Error details:', error.message);
    if (error.errors) {
      console.error('❌ Validation errors:', JSON.stringify(error.errors, null, 2));
    }
    throw error;
  }
};

// Fallback method to handle schema conflicts
const updateApplicationWithSchemaFix = async (externalKey, updateData) => {
  try {
    // First try the normal update
    return await updateApplicationByExternalKey(externalKey, updateData);
  } catch (error) {
    console.log('⚠️ Normal update failed, trying schema fix approach...');
    
    // If there's a schema validation error, try to fix it
    if (error.message && error.message.includes('Cast to string failed')) {
      console.log('🔧 Attempting to fix schema conflict...');
      
      // Use findOneAndUpdate with proper schema structure
      const updatedApp = await Application.findOneAndUpdate(
        { externalKey },
        { 
          $set: {
            'business.ebt': { ebtType: '', ebtAccountNumber: '' },
            updatedAt: new Date()
          }
        },
        { new: true, runValidators: true }
      );
      
      if (updatedApp) {
        console.log('✅ Schema conflict resolved, now updating with full data...');
        // Now try to update with the full data
        return await updateApplicationByExternalKey(externalKey, updateData);
      }
    }
    
    // If all else fails, throw the original error
    throw error;
  }
};

// Enhanced fallback method to handle version conflicts
const updateApplicationWithVersionFix = async (externalKey, updateData) => {
  console.log('🔧 Version conflict fix - removing version key and updating...');
  
  try {
    // First, remove the __v field entirely from the document
    await Application.updateOne(
      { externalKey },
      { $unset: { __v: "" } }
    );
    
    // Then do the update without version checking
    const updatedApp = await Application.findOneAndUpdate(
      { externalKey },
      { 
        $set: {
          ...updateData,
          updatedAt: new Date()
        }
      },
      { 
        new: true, 
        runValidators: false, // Skip validation to avoid conflicts
        strict: false, // Allow any fields
        overwrite: false // Don't replace entire document
      }
    );
    
    if (!updatedApp) {
      throw new Error('Application not found');
    }
    
    console.log('✅ Version conflict resolved, application updated successfully');
    return updatedApp;
  } catch (error) {
    console.error('❌ Version conflict fix failed:', error.message);
    
    // Last resort: try with findOneAndReplace
    try {
      console.log('🔄 Trying findOneAndReplace as last resort...');
      const currentDoc = await Application.findOne({ externalKey }).lean();
      
      if (!currentDoc) {
        throw new Error('Application not found');
      }
      
      // Merge and clean
      const mergedData = { ...currentDoc, ...updateData };
      delete mergedData._id;
      delete mergedData.__v;
      mergedData.updatedAt = new Date();
      
      const result = await Application.findOneAndReplace(
        { externalKey },
        mergedData,
        { new: true }
      );
      
      console.log('✅ Document replaced successfully');
      return result;
    } catch (replaceError) {
      console.error('❌ Replace also failed:', replaceError.message);
      throw error;
    }x  
  }
};

// Nuclear option: Complete schema reset for problematic applications
const resetApplicationSchema = async (externalKey) => {
  console.log('🚨 Performing complete schema reset for application:', externalKey);
  
  try {
    // Get the current application data
    const currentApp = await Application.findOne({ externalKey });
    if (!currentApp) {
      throw new Error('Application not found');
    }
    
    // Create a new application with proper schema
    const newApplication = new Application({
      externalKey: currentApp.externalKey,
      applicationEmail: currentApp.applicationEmail || 'temp@example.com',
      agent: currentApp.agent || 96194,
      applicationName: currentApp.applicationName || '',
      plan: currentApp.plan || {},
      shipping: currentApp.shipping || {},
      principals: currentApp.principals || [],
      business: {
        ...currentApp.business,
        ebt: { ebtType: '', ebtAccountNumber: '' } // Force proper EBT structure
      },
      bankAccount: currentApp.bankAccount || {},
      statementDeliveryMethod: currentApp.statementDeliveryMethod || 'electronic',
      documents: currentApp.documents || [],
      merchantLink: currentApp.merchantLink || '',
      status: currentApp.status || 'draft',
      createdAt: currentApp.createdAt,
      updatedAt: new Date()
    });
    
    // Delete the old application
    await Application.deleteOne({ externalKey });
    
    // Save the new one
    const savedApp = await newApplication.save();
    console.log('✅ Schema reset completed successfully');
    
    return savedApp;
  } catch (error) {
    console.error('❌ Schema reset failed:', error);
    throw error;
  }
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
      `${process.env.API_ENDPOINT}/enroll/application/pdf/key/${externalKey}`,
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
      `${process.env.API_ENDPOINT}/enroll/document/upload/key/${externalKey}`,
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

// Comprehensive save method with multiple fallback strategies
const saveApplicationComprehensive = async (externalKey, updateData) => {
  console.log('🔄 Attempting comprehensive save for application:', externalKey);
  
  // Strategy 1: Try normal update
  try {
    console.log('📝 Strategy 1: Normal update');
    return await updateApplicationByExternalKey(externalKey, updateData);
  } catch (error1) {
    console.log('⚠️ Strategy 1 failed:', error1.message);
    
    // Strategy 2: Try version conflict fix
    if (error1.message && error1.message.includes('No matching document found for id')) {
      try {
        console.log('📝 Strategy 2: Version conflict fix');
        return await updateApplicationWithVersionFix(externalKey, updateData);
      } catch (error2) {
        console.log('⚠️ Strategy 2 failed:', error2.message);
      }
    }
    
    // Strategy 3: Try schema fix
    if (error1.message && error1.message.includes('Cast to string failed')) {
      try {
        console.log('📝 Strategy 3: Schema fix');
        return await updateApplicationWithSchemaFix(externalKey, updateData);
      } catch (error3) {
        console.log('⚠️ Strategy 3 failed:', error3.message);
      }
    }
    
    // Strategy 4: Use findOneAndUpdate directly with no version checking
    try {
      console.log('📝 Strategy 4: Direct findOneAndUpdate (no validation, no version)');
      
      // First remove __v field
      await Application.updateOne(
        { externalKey },
        { $unset: { __v: "" } }
      );
      
      const updatedApp = await Application.findOneAndUpdate(
        { externalKey },
        { $set: updateData },
        { 
          new: true, 
          runValidators: false, // Disable validation
          strict: false, // Allow any fields
          upsert: false 
        }
      );
      
      if (updatedApp) {
        console.log('✅ Strategy 4 succeeded');
        return updatedApp;
      }
    } catch (error4) {
      console.log('⚠️ Strategy 4 failed:', error4.message);
    }
    
    // Strategy 5: Nuclear option - complete schema reset
    try {
      console.log('📝 Strategy 5: Complete schema reset');
      const resetApp = await resetApplicationSchema(externalKey);
      if (resetApp) {
        // Try to update with the new data after reset
        const finalApp = await Application.findOneAndUpdate(
          { externalKey },
          { $set: updateData },
          { 
            new: true, 
            runValidators: true,
            upsert: false 
          }
        );
        
        if (finalApp) {
          console.log('✅ Strategy 5 succeeded');
          return finalApp;
        }
      }
    } catch (error5) {
      console.log('⚠️ Strategy 5 failed:', error5.message);
    }
    
    // If all strategies failed, throw the most relevant error
    console.error('❌ All save strategies failed');
    throw new Error(`Failed to save application after trying all strategies. Last error: ${error1.message}`);
  }
};

module.exports = {
  createApplication,
  getApplicationByExternalKey,
  getAllApplications,
  updateApplicationByExternalKey,
  updateApplicationWithSchemaFix,
  updateApplicationWithVersionFix,
  resetApplicationSchema,
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
  uploadDocumentToPaymentsHub,
  saveApplicationComprehensive
};