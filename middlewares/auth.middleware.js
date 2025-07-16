const { verifyToken } = require('../services/token.service');

exports.authenticate = async (req, res, next) => {
  try {
    const token = await verifyToken(req);
    req.accessToken = token;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
};

exports.logRequests = (req, res, next) => {
  console.log(`🌐 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
};