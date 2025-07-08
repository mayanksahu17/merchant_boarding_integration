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

router.post('/api/merchant/full-update', async (req, res) => {
  try {
    const { externalKey, ...rest } = req.body;
    if (!externalKey) {
      return res.status(400).json({ error: 'externalKey is required' });
    }
    const response = await axios.patch(
      `https://enrollment-api-sandbox.paymentshub.com/enroll/application/key/${externalKey}`,
      req.body,
      {
        headers: {
          Authorization: `Bearer ${req.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    res.json(response.data);
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      res.status(error.response.status).json(error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('🌐 No response received from server');
      res.status(500).json({ error: 'No response received from server' });
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('⚙️ Error setting up request:', error.message);
      res.status(500).json({ error: error.message });
    }
  }
});

// Serve static files
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

router.get('/merchant-portal', (req, res) => {
  res.sendFile(path.join(__dirname, '../merchant.html'));
});

module.exports = router;