module.exports = {
  email: process.env.EMAIL_USER || 'development@zifypay.com',
  password: process.env.EMAIL_PASS,
  service: 'gmail',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
}; 