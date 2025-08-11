
export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/admin/auth`,
  APPLICATIONS: `${API_BASE_URL}/applications`,
  APPLICATION: (externalKey) => `${API_BASE_URL}/application/${externalKey}`,
  SUBMIT_APPLICATION: (externalKey) => `${API_BASE_URL}/application/submit/${externalKey}`,
  VALIDATE_APPLICATION: (externalKey) => `${API_BASE_URL}/application/validate/${externalKey}`,
  SEND_MERCHANT_LINK: `${API_BASE_URL}/send-merchant-link`,
  SEND_SUBMISSION_CONFIRMATION: `${API_BASE_URL}/send-submission-confirmation`,
  PLANS: `${API_BASE_URL}/plans`,
};