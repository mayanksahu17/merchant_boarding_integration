const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

router.get('/refresh', authController.refreshToken);

router.post('/login', authController.login);

module.exports = router;