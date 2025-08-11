function handleApiError(res, error) {
  console.error('API Error:', error);

  // Default error response
  const defaultError = {
    status: 500,
    message: 'Internal server error',
    details: null
  };

  try {
    if (error.response) {
      // Handle axios error responses
      const status = Number(error.response.status) || 500;
      res.status(status).json({
        message: error.response.data?.message || error.message,
        details: error.response.data
      });
    } else if (error.request) {
      // Handle network errors
      res.status(503).json({
        message: 'Service temporarily unavailable',
        details: 'No response received from server'
      });
    } else if (error instanceof TypeError) {
      // Handle type errors
      res.status(400).json({
        message: 'Invalid request',
        details: error.message
      });
    } else {
      // Handle all other errors
      res.status(defaultError.status).json({
        message: error.message || defaultError.message,
        details: error.details || defaultError.details
      });
    }
  } catch (handlingError) {
    // Fallback error response if error handling itself fails
    console.error('Error while handling error:', handlingError);
    res.status(500).json(defaultError);
  }
}

module.exports = {
  handleApiError
};