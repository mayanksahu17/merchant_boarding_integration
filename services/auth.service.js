const axios = require('axios');
const fs = require('fs');
const { clientId, clientSecret, tokenEndpoint, tokenFile } = require('../config/auth.config');

async function getAccessToken() {
  try {
    const params = new URLSearchParams();
    params.append("grant_type", "client_credentials");
    params.append("scope", "all");
    params.append("client_id", clientId);
    params.append("client_secret", clientSecret);

    const response = await axios.post(tokenEndpoint, params, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const accessToken = response.data.access_token;

    fs.writeFileSync(
      tokenFile,
      JSON.stringify({ token: accessToken, time: new Date() }, null, 2)
    );

    console.log("✅ Token refreshed and saved!");
    return accessToken;
  } catch (error) {
    console.error("❌ Auth Error:", error.response?.data || error.message);
    throw error;
  }
}

function startTokenRefreshInterval() {
  setInterval(() => { 
    console.log("🔄 Refreshing access token...");
    getAccessToken();
  }, 2 * 60 * 1000); // 2 minutes
}

module.exports = {
  getAccessToken,
  startTokenRefreshInterval
};