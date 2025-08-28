export const config = {
  // Server Configuration
  server: {
    port: parseInt(process.env.PORT || '3001', 10),
    env: process.env.NODE_ENV || 'development'
  },

  // Task Queue Worker Configuration
  taskQueue: {
    worker: {
      pollIntervalMs: 5000,  // Milliseconds between polling for new tasks
      batchSize: 1,          // Number of tasks to process concurrently
      taskTypes: ['cloud_run_dispatch'],  // List of task types to process
      heartbeatIntervalMs: 30000,  // Send heartbeat every 30 seconds
      maxRetries: 3          // Default maximum retry attempts for tasks
    },
    priorities: {
      low: 1,
      medium: 5,
      high: 10
    }
  },

  // Database Configuration
  database: {
    maxConnections: 20,
    idleTimeoutMs: 30000,
    connectionTimeoutMs: 5000
  }
};