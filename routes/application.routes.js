const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/application.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// Document type routes (must be before :externalKey routes)
router.get('/document-types', authenticate, applicationController.getDocumentTypes);

// Application routes
router.post('/', authenticate, applicationController.createApplication);
router.get('/', authenticate, applicationController.getAllApplications);

// Document routes
router.post('/:externalKey/documents', authenticate, applicationController.uploadDocument);
router.delete('/:externalKey/documents/:documentId', authenticate, applicationController.deleteDocument);

// Merchant link routes
router.put('/merchant-links', authenticate, applicationController.generateMerchantLink);
router.post('/emails/merchant-link', authenticate, applicationController.sendMerchantLinkEmail);

// Application specific routes
router.get('/:externalKey', authenticate, applicationController.getApplication);
router.patch('/:externalKey', authenticate, applicationController.updateApplication);
router.delete('/:externalKey', authenticate, applicationController.deleteApplication);

// Validation routes
router.get('/validate/:externalKey', authenticate, applicationController.validateApplication);
router.post('/:externalKey/submit', authenticate, applicationController.submitToUnderwriting);

// Get application PDF
router.get('/pdf/:externalKey', authenticate, applicationController.getApplicationPDF);

module.exports = router;