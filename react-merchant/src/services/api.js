import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Login failed';
  }
};

export const createApplication = async (applicationData) => {
  try {
    const response = await api.post('/applications', applicationData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to create application';
  }
};

export const generateMerchantLink = async (externalKey) => {
  try {
    const response = await api.post('/applications/merchant-links', { externalKey });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to generate merchant link';
  }
};

export const sendMerchantLinkEmail = async (email, externalKey) => {
  try {
    const response = await api.post('/applications/emails/merchant-link', { email, externalKey });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to send email';
  }
};

export const submitApplication = async (externalKey) => {
  try {
    const response = await api.post(`/applications/${externalKey}/submit`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to submit application';
  }
};

export const refreshApplications = async () => {
  try {
    const response = await api.get('/applications');
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to refresh applications';
  }
};

export const deleteApplication = async (externalKey) => {
  try {
    const response = await api.delete(`/applications/${externalKey}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to delete application';
  }
};

export const getApplication = async (externalKey) => {
  try {
    const response = await api.get(`/applications/${externalKey}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to get application';
  }
};
export const validateApplication = async (externalKey) => {
  try {
    const response = await api.get(`/applications/validate/${externalKey}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to validate application';
  }
};

export const submitToUnderwriting = async (externalKey, formData) => {
  try {
    // Using PUT or POST depending on your backend implementation
    // Choose one of the following:
    const response = await api.put(`/applications/submit/${externalKey}`, formData);
    // OR
    // const response = await api.post(`/applications/submit/${externalKey}`, formData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to submit application to underwriting';
  }
};
export const updateApplication = async (externalKey, formData) => {
  try {
    const response = await api.patch(`/applications/${externalKey}`, formData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to update application';
  }
};

export default api;