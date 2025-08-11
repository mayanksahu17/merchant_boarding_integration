const fs = require('fs');
const { tokenFile } = require('../config/auth.config');

function verifyToken(req) {
  try {
    const data = fs.readFileSync(tokenFile);
    const parsed = JSON.parse(data);
    return parsed.token;
  } catch (err) {
    throw new Error("Token not available");
  }
}

module.exports = {
  verifyToken
};