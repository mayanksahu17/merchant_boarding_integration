module.exports = {
  apps: [
    {
      name: "merchant-api",
      script: "index.js",
      cwd: "/home/ubuntu/merchant_boarding_integration",
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      watch: false,
      max_restarts: 10,
      max_memory_restart: "300M",
      env: {
        NODE_ENV: "production"
      },
      out_file: "/home/ubuntu/.pm2/logs/merchant-api-out.log",
      error_file: "/home/ubuntu/.pm2/logs/merchant-api-error.log",
      time: true
    }
  ]
}
