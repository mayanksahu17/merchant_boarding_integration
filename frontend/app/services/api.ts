import axios from 'axios';

const API_BASE_URL = 'https://merchant.zifypay.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token if available
api.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const createApplication = (payload: any) => api.post('/application', payload);
export const getApplication = (externalKey: string) => api.get(`/application/key/${externalKey}`);
export const validateApplication = (externalKey: string) => api.get(`/application/validate/${encodeURIComponent(externalKey)}`);
export const submitApplication = (externalKey: string) => api.post(`/application/submit/${externalKey}`);
export const sendMerchantLink = (email: string, externalKey: string) => api.post('/send-merchant-link', { email, externalKey });
export const sendSubmissionConfirmation = (email: string, applicationName: string, externalKey: string) => 
  api.post('/send-submission-confirmation', { email, applicationName, externalKey });

export default api;