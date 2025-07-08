const express = require('express');
const router = express.Router();
const emailController = require('../controllers/email.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.post('/merchant-link', authenticate, emailController.sendMerchantLink);
router.post('/submission-confirmation', authenticate, emailController.sendSubmissionConfirmation);

module.exports = router;