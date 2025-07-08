export const generateRandomKey = () => "EXT" + Math.floor(Math.random() * 1e14);

export const ensureApplicationStructure = (app: any) => {
  if (!app.emailsSent) {
    app.emailsSent = {
      [EMAIL_TYPES.WELCOME]: false,
      [EMAIL_TYPES.MERCHANT_LINK]: false,
      [EMAIL_TYPES.STATUS_UPDATE]: false,
      [EMAIL_TYPES.REMINDER]: false,
      [EMAIL_TYPES.SUBMISSION_CONFIRMATION]: false
    };
  }
  
  if (!app.emailHistory) {
    app.emailHistory = [];
  }
  
  // Ensure status is using the new constants
  if (app.status === 'pending') app.status = APPLICATION_STATUSES.PENDING;
  if (app.status === 'submitted') app.status = APPLICATION_STATUSES.SUBMITTED;
  if (app.status === 'validated') app.status = APPLICATION_STATUSES.VALIDATED;
  if (app.status === 'error') app.status = APPLICATION_STATUSES.ERROR;
  
  return app;
};