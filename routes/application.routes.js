const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/application.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// Existing routes
router.post('/', authenticate, applicationController.createApplication);
router.get('/:externalKey', authenticate, applicationController.getApplication);
router.patch('/:externalKey', authenticate, applicationController.updateApplication);
router.put('/merchant/send/:externalKey', authenticate, applicationController.sendToMerchant);
router.get('/validate/:externalKey', authenticate, applicationController.validateApplication);
router.put('/submit/:externalKey', authenticate, applicationController.submitToUnderwriting);
router.post('/submit/:externalKey', authenticate, applicationController.submitToUnderwriting);

// New routes
router.get('/', authenticate, applicationController.getAllApplications);
router.post('/merchant-links', authenticate, applicationController.generateMerchantLink);
router.post('/emails/merchant-link', authenticate, applicationController.sendMerchantLinkEmail);
router.delete('/:externalKey', authenticate, applicationController.deleteApplication);


module.exports = router;