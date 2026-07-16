// PM2 process file for running the backend on a VPS.
// Usage: cd backend && pm2 start ecosystem.config.js && pm2 save && pm2 startup
module.exports = {
  apps: [{
    name: 'kwg-backend',
    script: 'server.js',
    cwd: __dirname,
    instances: 1,
    exec_mode: 'fork',
    env: { NODE_ENV: 'production' },
    max_memory_restart: '300M'
  }]
};
