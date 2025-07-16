function handleApiError(res, error) {
  if (error.response) {
    res.status(error.response.status).json(error.response.data);
  } else if (error.request) {
    res.status(500).json({ error: 'No response received from server' });
  } else {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  handleApiError
};