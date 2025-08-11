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
    const response = await api.put('/applications/merchant-links', { externalKey });
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

export const getDocumentTypes = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/applications/document-types`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch document types');
  }
};

export const uploadDocument = async (externalKey, file, type) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await axios.post(`${API_BASE_URL}/applications/${externalKey}/documents`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to upload document');
  }
};

export const deleteDocument = async (externalKey, documentId) => {
  try {
    const response = await api.delete(`/applications/${externalKey}/documents/${documentId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to delete document';
  }
};

export const downloadApplicationPDF = async (externalKey) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/applications/pdf/${externalKey}`, {
      responseType: 'blob',
      headers: {
        'Accept': 'application/pdf'
      }
    });

    // Create a URL for the blob
    const url = window.URL.createObjectURL(new Blob([response.data]));
    
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `application-${externalKey}.pdf`);
    
    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL
    window.URL.revokeObjectURL(url);
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to download PDF');
  }
};

export default api;