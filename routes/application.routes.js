const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/application.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// Application routes
router.post('/', authenticate, applicationController.createApplication);
router.get('/', authenticate, applicationController.getAllApplications);
router.get('/:externalKey', authenticate, applicationController.getApplication);
router.patch('/:externalKey', authenticate, applicationController.updateApplication);
router.delete('/:externalKey', authenticate, applicationController.deleteApplication);

// Document routes
router.post('/:externalKey/documents', authenticate, applicationController.uploadDocument);
router.delete('/:externalKey/documents/:documentId', authenticate, applicationController.deleteDocument);

// Merchant link routes
router.put('/merchant-links', authenticate, applicationController.generateMerchantLink);
router.post('/emails/merchant-link', authenticate, applicationController.sendMerchantLinkEmail);

// Validation routes
router.get('/validate/:externalKey', authenticate, applicationController.validateApplication);
router.post('/:externalKey/submit', authenticate, applicationController.submitToUnderwriting);

module.exports = router;