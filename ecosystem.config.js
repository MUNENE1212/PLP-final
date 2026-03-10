/**
 * PM2 Ecosystem Configuration for Dumuwaks
 *
 * This configuration file defines how PM2 manages the Dumuwaks backend application.
 * It supports both development and production environments.
 *
 * Usage:
 *   pm2 start ecosystem.config.js --only dumuwaks-backend
 *   pm2 reload dumuwaks-backend
 *   pm2 restart dumuwaks-backend
 *   pm2 stop dumuwaks-backend
 *   pm2 delete dumuwaks-backend
 *
 * Documentation:
 *   https://pm2.keymetrics.io/docs/usage/application-declaration/
 */

module.exports = {
  apps: [
    {
      // Application name - used for PM2 commands
      name: 'dumuwaks-backend',

      // Script entry point
      script: './backend/src/server.js',

      // Working directory
      cwd: '/var/www/dumuwaks/current',

      // Number of instances
      // 'max' = number of CPU cores
      // 1 = single instance
      // -1 = all CPUs minus one
      instances: 2,

      // Execution mode
      // 'cluster' = use Node.js cluster mode (recommended for production)
      // 'fork' = single process (default, for development)
      exec_mode: 'cluster',

      // Environment variables
      env: {
        NODE_ENV: 'development',
        PORT: 5000,
      },

      // Production environment variables
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },

      // Watch for file changes (disable in production)
      watch: false,

      // Ignore these directories when watching
      ignore_watch: [
        'node_modules',
        'logs',
        'uploads',
        '.git',
        'coverage',
      ],

      // Maximum memory before restart
      // PM2 will restart the instance if it exceeds this limit
      max_memory_restart: '512M',

      // Logging configuration
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: '/var/www/dumuwaks/shared/logs/pm2-error.log',
      out_file: '/var/www/dumuwaks/shared/logs/pm2-out.log',

      // Merge logs from all instances into one file
      merge_logs: true,

      // Add common log prefix
      log_type: 'json',

      // Auto restart on crash
      autorestart: true,

      // Maximum number of restarts within min_uptime
      // If exceeded, PM2 considers the app as errored and stops restarting
      max_restarts: 10,

      // Minimum uptime before considering app as started
      // If app crashes within this time, it's considered a failed start
      min_uptime: '10s',

      // Time to wait before considering app as unhealthy after a restart
      listen_timeout: 3000,

      // Kill timeout - time to wait before force killing
      kill_timeout: 5000,

      // Wait for app to be ready before killing previous instance
      // This enables zero-downtime reloads
      wait_ready: false,

      // Time to wait between restarts
      restart_delay: 1000,

      // Instance-specific environment file
      // env_file: '/var/www/dumuwaks/shared/.env',

      // Cron pattern for scheduled restarts
      // Uncomment to restart daily at 3 AM
      // cron_restart: '0 3 * * *',

      // Source map support for better stack traces
      source_map_support: true,

      // Instance variables - available in the app
      instance_var: 'INSTANCE_ID',

      // Graceful shutdown timeout
      // Wait this long for connections to close before killing
      shutdown_with_message: true,

      // Additional node arguments
      node_args: '--max-old-space-size=512',

      // Health check configuration (PM2 Plus)
      // Uncomment if using PM2 Plus monitoring
      /*
      instances: 2,
      increment_var: 'NODE_APP_INSTANCE',
      on_stop: (proc) => {
        // Custom stop behavior
      },
      post_update: ['npm install'],
      */
    },

    // Optional: Redis queue worker (if using background jobs)
    /*
    {
      name: 'dumuwaks-worker',
      script: './backend/src/workers/index.js',
      cwd: '/var/www/dumuwaks/current',
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '256M',
      autorestart: true,
      watch: false,
      env_production: {
        NODE_ENV: 'production',
      },
    },
    */
  ],

  // Deployment configuration (for PM2 deploy)
  // This is separate from the GitHub Actions deployment
  /*
  deploy: {
    production: {
      user: 'deploy',
      host: '69.164.244.165',
      ref: 'origin/master',
      repo: 'git@github.com:username/dumuwaks.git',
      path: '/var/www/dumuwaks',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'apt-get install git -y',
    },
  },
  */
};
