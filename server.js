// server.js
require("dotenv").config();
const express = require("express");
const axios = require("axios");
const fs = require("fs");
const app = express();
const cors = require("cors");

app.use(express.json());
app.use(cors());
const TOKEN_FILE = "./token.json";
async function getAccessToken() {
  try {
    const response = await axios.post(
      "https://enrollment-api-auth.paymentshub.com/oauth/token",
      {
        grant_type: "client_credentials",
        scope: "all",
        client_id: "1676b042eebd375ac46adb7d9f86a533",
        client_secret: "RGzHc8udH2q*RzfGmXP#36SNfVEF7U@E"
      },
      {
        headers: {
          "Content-Type": "application/json", // ✅ Raw JSON, not URL-encoded
        },
      }
    );

    const accessToken = response.data.access_token;

    // Write token to file
    fs.writeFileSync(
      TOKEN_FILE,
      JSON.stringify({ token: accessToken, time: new Date() }, null, 2)
    );

    console.log("✅ Token refreshed and saved!");
    return accessToken;
  } catch (error) {
    console.error("❌ Auth Error:", error.response?.data || error.message);
    throw error;
  }
}


// Cron Job to refresh token every 2 minutes
setInterval(() => {
  console.log("🔄 Refreshing access token...");
  getAccessToken();
}, 2 * 60 * 1000); // 2 minutes

// Middleware to read token from file
app.use((req, res, next) => {
  try {
    const data = fs.readFileSync(TOKEN_FILE);
    const parsed = JSON.parse(data);
    req.accessToken = parsed.token;
  } catch (err) {
    console.error("Failed to read token file.", err);
    return res.status(500).json({ error: "Token not available" });
  }
  next();
});

// Create Application
app.post("/api/application", async (req, res) => {
  try {
    const response = await axios.post(
      "https://enrollment-api-sandbox.paymentshub.com/enroll/application",
      req.body,
      {
        headers: {
          Authorization: `Bearer ${req.accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json(error.response?.data || { error: error.message });
  }
});

// Get Application by externalKey
app.get("/api/application/:externalKey", async (req, res) => {
  try {
    const { externalKey } = req.params;
    const response = await axios.get(
      `https://enrollment-api-sandbox.paymentshub.com/enroll/application/key/${externalKey}`,
      {
        headers: {
          Authorization: `Bearer ${req.accessToken}`,
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json(error.response?.data || { error: error.message });
  }
});

// Update Application Name
app.patch("/api/application/:externalKey", async (req, res) => {
  try {
    const { externalKey } = req.params;
    const response = await axios.patch(
      `https://enrollment-api-sandbox.paymentshub.com/enroll/application/key/${externalKey}`,
      req.body,
      {
        headers: {
          Authorization: `Bearer ${req.accessToken}`,
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json(error.response?.data || { error: error.message });
  }
});

// Submit to Underwriting
app.put("/api/application/submit/:externalKey", async (req, res) => {
  try {
    const { externalKey } = req.params;
    const response = await axios.put(
      `https://enrollment-api-sandbox.paymentshub.com/enroll/application/submit/${externalKey}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${req.accessToken}`,
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json(error.response?.data || { error: error.message });
  }
});


// ✅ Validate Application API
app.get("/api/application/validate/:externalKey", async (req, res) => {
  try {
    const { externalKey } = req.params;
    const response = await axios.get(
      `https://enrollment-api-sandbox.paymentshub.com/enroll/application/validate/${encodeURIComponent(externalKey)}`,
      {
        headers: {
          Authorization: `Bearer ${req.accessToken}`,
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json(error.response?.data || { error: error.message });
  }
});

// Run Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, async () => {
  console.log(`✅ Server running on port ${PORT}`);
      console.log(process.env.CLIENT_SECRET , 
        process.env.CLIENT_ID
    );
    
  await getAccessToken(); // Initial fetch
});
