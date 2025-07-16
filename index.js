require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require('./db');
const { getAccessToken, startTokenRefreshInterval } = require('./services/auth.service');

const app = express();
connectDB();

// Middlewares
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname)));

// Routes
const routes = require('./routes');
app.use('/', routes);

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, async () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(process.env.CLIENT_SECRET, process.env.CLIENT_ID);
  
  await getAccessToken(); // Initial fetch
  startTokenRefreshInterval(); // Start token refresh interval
});