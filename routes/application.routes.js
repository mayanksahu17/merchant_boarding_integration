const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/application.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.post('/', authenticate, applicationController.createApplication);
router.get('/:externalKey', authenticate, applicationController.getApplication);
router.patch('/:externalKey', authenticate, applicationController.updateApplication);
router.put('/merchant/send/:externalKey', authenticate, applicationController.sendToMerchant);
router.get('/validate/:externalKey', authenticate, applicationController.validateApplication);
router.put('/submit/:externalKey', authenticate, applicationController.submitToUnderwriting);
router.post('/submit/:externalKey', authenticate, applicationController.submitToUnderwriting);

module.exports = router;