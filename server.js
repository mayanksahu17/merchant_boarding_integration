// server.js
require("dotenv").config();
const express = require("express");
const axios = require("axios");
const fs = require("fs");
const app = express();
const cors = require("cors");
const path = require("path");
const sgMail = require('@sendgrid/mail');

app.use(express.json());
app.use(cors());

// Serve static files
app.use(express.static(path.join(__dirname)));

const TOKEN_FILE = "./token.json";
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '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';
sgMail.setApiKey(SENDGRID_API_KEY);

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

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`🌐 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running!', timestamp: new Date().toISOString() });
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

// Send to Merchant
app.put("/api/application/merchant/send/:externalKey", async (req, res) => {
  try {
    const { externalKey } = req.params;
    const response = await axios.put(
      `https://enrollment-api-sandbox.paymentshub.com/enroll/application/merchant/send/key/${externalKey}`,
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

// Validate Application
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

// Submit Application to Underwriting (new route)
app.post("/api/application/submit/:externalKey", async (req, res) => {
  try {
    const { externalKey } = req.params;
    console.log(`🚀 Submitting application ${externalKey} to underwriting...`);
    
    const response = await axios.put(
      `https://enrollment-api-sandbox.paymentshub.com/enroll/application/submit/${externalKey}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${req.accessToken}`,
        },
      }
    );
    
    console.log(`✅ Application ${externalKey} submitted successfully`);
    res.json(response.data);
  } catch (error) {
    console.error(`❌ Error submitting application ${req.params.externalKey}:`, error.response?.data || error.message);
    res.status(500).json(error.response?.data || { error: error.message });
  }
});

// Full merchant update endpoint
app.post('/api/merchant/full-update', async (req, res) => {
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

// Serve merchant portal
app.get("/merchant-portal", (req, res) => {
  res.sendFile(path.join(__dirname, 'merchant.html'));
});

// Send merchant form link email
app.post('/api/send-merchant-link', async (req, res) => {
  const { email, externalKey } = req.body;
  if (!email || !externalKey) {
    return res.status(400).json({ error: 'email and externalKey are required' });
  }
  try {
    // Construct merchant form link (assuming server is same as frontend origin)
    const baseUrl = req.headers.origin || `http://localhost:${PORT}`;
    const merchantUrl = `${baseUrl}/merchant-form.html?key=${encodeURIComponent(externalKey)}`;
    const msg = {
      to: email,
      from: 'development@zifypay.com',
      subject: 'Your Merchant Application Link',
      html: `
        <h2>Merchant Application Link</h2>
        <p>You have been invited to complete your merchant application.</p>
        <p><strong>Application ID:</strong> ${externalKey}</p>
        <p>Click the link below to access your application form:</p>
        <p style="margin: 20px 0;">
          <a href="${merchantUrl}" style="background: #2196F3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            📝 Complete Application
          </a>
        </p>
        <p>Or copy and paste this link into your browser:</p>
        <p style="background: #f5f5f5; padding: 10px; border-radius: 4px; word-break: break-all;">
          ${merchantUrl}
        </p>
        <p>This link will allow you to fill out your merchant application details.</p>
        <p>If you have any questions, please contact our support team.</p>
        <p>Best regards,<br>Merchant Onboarding Team</p>
      `
    };
    await sgMail.send(msg);
    res.json({ success: true, message: 'Merchant link email sent successfully.' });
  } catch (error) {
    console.error('SendGrid error:', error.response?.body || error.message);
    res.status(500).json({ error: error.message, details: error.response?.body });
  }
});

// Send application submission confirmation email
app.post('/api/send-submission-confirmation', async (req, res) => {
  const { email, applicationName, externalKey } = req.body;
  if (!email || !applicationName || !externalKey) {
    return res.status(400).json({ error: 'email, applicationName, and externalKey are required' });
  }
  try {
    const msg = {
      to: email,
      from: 'noreply@merchantonboarding.com',
      subject: 'Application Submitted to Underwriting',
      html: `
        <h2>Application Submitted Successfully!</h2>
        <p>Your merchant application has been submitted to underwriting for review.</p>
        <p><strong>Application Name:</strong> ${applicationName}</p>
        <p><strong>Application ID:</strong> ${externalKey}</p>
        <p><strong>Submission Date:</strong> ${new Date().toLocaleDateString()}</p>
        <p>Our underwriting team will review your application and contact you within 2-3 business days.</p>
        <p>You will receive updates on your application status via email.</p>
        <p>Thank you for choosing our merchant services!</p>
        <p>Best regards,<br>Merchant Onboarding Team</p>
      `
    };
    await sgMail.send(msg);
    res.json({ success: true, message: 'Submission confirmation email sent successfully.' });
  } catch (error) {
    console.error('SendGrid error:', error.response?.body || error.message);
    res.status(500).json({ error: error.message, details: error.response?.body });
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
