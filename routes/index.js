const express = require('express');
const router = express.Router();
const applicationRoutes = require('./application.routes');
const authRoutes = require('./auth.routes');
const emailRoutes = require('./email.routes');

router.use('/api/application', applicationRoutes);
router.use('/api/auth', authRoutes);
router.use('/api/email', emailRoutes);

// Test endpoint
router.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running!', timestamp: new Date().toISOString() });
});

// Serve static files
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

router.get('/merchant-portal', (req, res) => {
  res.sendFile(path.join(__dirname, '../merchant.html'));
});

module.exports = router;