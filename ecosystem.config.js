module.exports = {
  apps: [
    {
      name: 'backend',
      cwd: './server',
      script: 'index.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log',
      time: true,
      watch: false,
      max_memory_restart: '1G',
      restart_delay: 4000
    },
    {
      name: 'frontend',
      cwd: './client',
      script: 'npm',
      args: 'start',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_file: './logs/frontend-combined.log',
      time: true,
      watch: false,
      max_memory_restart: '1G',
      restart_delay: 4000
    }
  ]
};
