const fs = require('fs');
const { tokenFile } = require('../config/auth.config');

exports.readTokenFile = (req, res, next) => {
  try {
    const data = fs.readFileSync(tokenFile);
    const parsed = JSON.parse(data);
    req.accessToken = parsed.token;
    next();
  } catch (err) {
    console.error("Failed to read token file.", err);
    return res.status(500).json({ error: "Token not available" });
  }
};