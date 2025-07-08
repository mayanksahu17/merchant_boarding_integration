const axios = require('axios');
const { handleApiError } = require('../utils/errorHandler');

exports.createApplication = async (req, res) => {
  try {
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
    res.json(response.data);
  } catch (error) {
    handleApiError(res, error);
  }
};

exports.getApplication = async (req, res) => {
  try {
    const { externalKey } = req.params;
    const response = await axios.get(
      `https://enrollment-api-sandbox.paymentshub.com/enroll/application/key/${externalKey}`,
      {
        headers: {
          Authorization: `Bearer ${req.accessToken}`,
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    handleApiError(res, error);
  }
};

exports.updateApplication = async (req, res) => {
  try {
    const { externalKey } = req.params;
    const response = await axios.patch(
      `https://enrollment-api-sandbox.paymentshub.com/enroll/application/key/${externalKey}`,
      req.body,
      {
        headers: {
          Authorization: `Bearer ${req.accessToken}`,
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    handleApiError(res, error);
  }
};

exports.sendToMerchant = async (req, res) => {
  try {
    const { externalKey } = req.params;
    const response = await axios.put(
      `https://enrollment-api-sandbox.paymentshub.com/enroll/application/merchant/send/key/${externalKey}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${req.accessToken}`,
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    handleApiError(res, error);
  }
};

exports.validateApplication = async (req, res) => {
  try {
    const { externalKey } = req.params;
    const response = await axios.get(
      `https://enrollment-api-sandbox.paymentshub.com/enroll/application/validate/${encodeURIComponent(externalKey)}`,
      {
        headers: {
          Authorization: `Bearer ${req.accessToken}`,
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    handleApiError(res, error);
  }
};

exports.submitToUnderwriting = async (req, res) => {
  try {
    const { externalKey } = req.params;
    const response = await axios.put(
      `https://enrollment-api-sandbox.paymentshub.com/enroll/application/submit/${externalKey}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${req.accessToken}`,
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    handleApiError(res, error);
  }
};