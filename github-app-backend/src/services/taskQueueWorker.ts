import { taskQueueService } from './taskQueueService.js';
import { cloudRunTrigger } from './cloudRunTrigger.js';
import { config as appConfig } from '../config.js';

interface TaskWorkerOptions {
  workerKey: string;
  pollIntervalMs?: number;
  batchSize?: number;
  taskTypes?: string[];
}

class TaskQueueWorker {
  private workerKey: string;
  private pollIntervalMs: number;
  private batchSize: number;
  private taskTypes: string[];
  private isRunning: boolean = false;
  private currentTasks: Map<number, any> = new Map();
  private intervalId: NodeJS.Timeout | undefined;

  constructor(options: TaskWorkerOptions) {
    this.workerKey = options.workerKey;
    this.pollIntervalMs = options.pollIntervalMs || 5000; // Poll every 5 seconds by default
    this.batchSize = options.batchSize || 1; // Process one task at a time by default
    this.taskTypes = options.taskTypes || ['cloud_run_dispatch'];
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('⚠️  Worker is already running');
      return;
    }

    this.isRunning = true;
    console.log(`🚀 Task queue worker started (key: ${this.workerKey})`);
    console.log(`   - Poll interval: ${this.pollIntervalMs}ms`);
    console.log(`   - Batch size: ${this.batchSize}`);
    console.log(`   - Task types: ${this.taskTypes.join(', ')}`);

    // Start processing loop
    await this.processTasks();
    
    // Set up polling interval
    this.intervalId = setInterval(async () => {
      if (this.isRunning) {
        await this.processTasks();
      }
    }, this.pollIntervalMs);
  }

  async stop(): Promise<void> {
    this.isRunning = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }

    console.log(`🛑 Task queue worker stopped (key: ${this.workerKey})`);
    
    // Wait for current tasks to complete
    if (this.currentTasks.size > 0) {
      console.log(`⏳ Waiting for ${this.currentTasks.size} tasks to complete...`);
      await Promise.all(Array.from(this.currentTasks.values()));
    }
  }

  private async processTasks(): Promise<void> {
    try {
      // Pull tasks from the queue
      const tasks = await taskQueueService.pullTasksForWorker({
        claimed_by: this.workerKey,
        types: this.taskTypes,
        limit: this.batchSize
      });

      if (tasks.length === 0) {
        return; // No tasks to process
      }

      console.log(`📥 Pulled ${tasks.length} task(s) from queue`);

      // Process each task
      for (const task of tasks) {
        if (!this.isRunning) break;

        const taskPromise = this.processTask(task);
        this.currentTasks.set(task.id, taskPromise);

        // Don't await here to allow concurrent processing up to batchSize
        taskPromise.finally(() => {
          this.currentTasks.delete(task.id);
        });
      }

      // Wait for all tasks in this batch to complete
      await Promise.all(Array.from(this.currentTasks.values()));

    } catch (error) {
      console.error('❌ Error processing tasks:', error);
    }
  }

  private async processTask(task: any): Promise<void> {
    const startTime = Date.now();
    console.log(`🔄 Processing task ${task.id} (type: ${task.type})`);

    try {
      // Send periodic heartbeats
      const heartbeatInterval = setInterval(async () => {
        await taskQueueService.heartbeat(task.id, this.workerKey);
      }, appConfig.taskQueue.worker.heartbeatIntervalMs);

      try {
        let result: any;

        switch (task.type) {
          case 'cloud_run_dispatch':
            result = await this.processCloudRunDispatch(task);
            break;
          default:
            throw new Error(`Unsupported task type: ${task.type}`);
        }

        // Mark task as succeeded
        await taskQueueService.markTaskSucceeded(task.id, this.workerKey, result);
        
        const duration = Date.now() - startTime;
        console.log(`✅ Task ${task.id} completed in ${duration}ms`);

      } finally {
        clearInterval(heartbeatInterval);
      }

    } catch (error: any) {
      console.error(`❌ Task ${task.id} failed:`, error.message);
      
      // Mark task as failed (will retry if attempts remaining)
      await taskQueueService.markTaskFailed(
        task.id,
        this.workerKey,
        error.message || 'Unknown error',
        true // Allow retry
      );
    }
  }

  private async processCloudRunDispatch(task: any): Promise<any> {
    const { payload } = task;
    
    if (!payload || !payload.task_data) {
      throw new Error('Invalid task payload: missing task_data');
    }

    console.log(`🚀 Dispatching to Cloud Run for repo ${payload.repository_id}`);

    // Trigger Cloud Run and wait for completion
    const result = await cloudRunTrigger.triggerAndPoll({
      repository_id: payload.repository_id,
      task_data: payload.task_data,
      priority: task.priority || 1
    });

    console.log(`☁️  Cloud Run task completed: ${JSON.stringify(result)}`);

    return {
      cloud_run_task_id: result.taskId,
      local_task_id: result.localTaskId,
      claude_output: result.claude_output,
      success: result.success,
      message: result.message,
      execution_time_ms: result.execution_time_ms,
      workflow_params: payload.workflow_params,
      completed_at: new Date().toISOString()
    };
  }

  getStatus(): { 
    isRunning: boolean; 
    workerKey: string; 
    currentTasks: number; 
    taskTypes: string[] 
  } {
    return {
      isRunning: this.isRunning,
      workerKey: this.workerKey,
      currentTasks: this.currentTasks.size,
      taskTypes: this.taskTypes
    };
  }
}

// Create and export a singleton worker instance
export const taskQueueWorker = new TaskQueueWorker({
  workerKey: `worker_${appConfig.server.env}_${Date.now()}`,
  pollIntervalMs: appConfig.taskQueue.worker.pollIntervalMs,
  batchSize: appConfig.taskQueue.worker.batchSize,
  taskTypes: appConfig.taskQueue.worker.taskTypes
});

// Graceful shutdown handling
process.on('SIGINT', async () => {
  console.log('\n🛑 SIGINT received, shutting down worker...');
  await taskQueueWorker.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 SIGTERM received, shutting down worker...');
  await taskQueueWorker.stop();
  process.exit(0);
});