const { getAccessToken } = require('../services/auth.service');

exports.refreshToken = async (req, res) => {
  try {
    const token = await getAccessToken();
    res.json({ success: true, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};