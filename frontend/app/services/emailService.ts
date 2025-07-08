import { sendMerchantLink, sendSubmissionConfirmation } from './api';

export const sendMerchantLinkEmail = async (email: string, externalKey: string) => {
  try {
    await sendMerchantLink(email, externalKey);
    return true;
  } catch (error) {
    console.error('Failed to send merchant link:', error);
    throw error;
  }
};

export const sendApplicationSubmittedEmail = async (
  email: string, 
  applicationName: string, 
  externalKey: string
) => {
  try {
    await sendSubmissionConfirmation(email, applicationName, externalKey);
    return true;
  } catch (error) {
    console.error('Failed to send submission confirmation:', error);
    throw error;
  }
};