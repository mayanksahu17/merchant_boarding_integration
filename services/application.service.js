const Application = require('../models/application.model');

const createApplication = async (applicationData) => {
  const application = new Application({
    ...applicationData,
    applicationEmail: applicationData.email,
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
  return await Application.findOneAndUpdate(
    { externalKey },
    updateData,
    { new: true }
  );
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
  const application = await getApplicationByExternalKey(externalKey);
  if (!application) {
    throw new Error('Application not found');
  }
  
  // Generate a unique link (you might want to use JWT or other secure method)
  const link = `${process.env.FRONTEND_URL}/merchant-form.html?key=${externalKey}`;
  
  // Update application with link if needed
  await updateApplicationByExternalKey(externalKey, { 
    merchantLink: link,
    status: 'link_generated'
  });
  
  return { link };
};

module.exports = {
  createApplication,
  getApplicationByExternalKey,
  getAllApplications,
  updateApplicationByExternalKey,
  changeApplicationStatus,
  deleteApplication,
  generateMerchantLink
};