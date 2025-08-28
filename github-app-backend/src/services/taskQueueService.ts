import { Pool } from 'pg';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import {
  TaskQueue,
  TaskEvent,
  TaskCreateInput,
  TaskUpdateInput,
  TaskQueryOptions,
  WorkerPullOptions,
  TaskMetrics,
  TaskStatus
} from '../db/models/TaskQueue.js';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class TaskQueueService {
  private pool: Pool;
  private eventListeners: Map<string, (task: TaskQueue) => void> = new Map();

  constructor() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    this.pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    this.initDatabase();
  }

  private async initDatabase(): Promise<void> {
    try {
      const client = await this.pool.connect();

      const migrationPath = path.join(__dirname, '../db/migrations/002_create_task_queue_pg.sql');

      if (fs.existsSync(migrationPath)) {
        console.log('📦 Running task queue migration:', migrationPath);
        const migration = fs.readFileSync(migrationPath, 'utf8');

        try {
          await client.query(migration);
          console.log('✅ Task queue migration executed successfully');
        } catch (error: any) {
          if (error.code === '42P07' || error.message.includes('already exists')) {
            console.log('⚠️  Task queue tables already exist, skipping migration');
          } else {
            console.error('❌ Task queue migration error:', error.message);
            throw error;
          }
        }
      }

      client.release();
    } catch (error) {
      console.error('❌ Failed to initialize task queue database:', error);
      throw error;
    }
  }

  async createTask(data: TaskCreateInput): Promise<TaskQueue> {
    if (data.dedupe_key) {
      const existing = await this.findByDedupeKey(data.dedupe_key);
      if (existing && existing.status !== 'succeeded' && existing.status !== 'failed' && existing.status !== 'canceled') {
        return existing;
      }
    }

    const query = `
      INSERT INTO task_queue (
        repo_id, type, priority, status, payload, created_by, 
        max_attempts, dedupe_key, not_before_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    // Ensure payload is properly serialized
    let payloadJson = null;
    if (data.payload) {
      try {
        payloadJson = JSON.stringify(data.payload);
        // Check if stringification resulted in "[object Object]"
        if (payloadJson === '"[object Object]"') {
          console.error('Invalid payload object:', data.payload);
          payloadJson = JSON.stringify({ error: 'Invalid payload format', original: String(data.payload) });
        }
      } catch (error) {
        console.error('Failed to stringify payload:', error);
        payloadJson = JSON.stringify({ error: 'Failed to serialize payload' });
      }
    }

    const values = [
      data.repo_id,
      data.type,
      data.priority || 0,
      'queued',
      payloadJson,
      data.created_by,
      data.max_attempts || 3,
      data.dedupe_key || null,
      data.not_before_at || new Date().toISOString()
    ];

    const result = await this.pool.query(query, values);
    const task = this.transformDbRow(result.rows[0]);

    this.notifyListeners('task_created', task);
    return task;
  }

  async findById(id: number): Promise<TaskQueue | null> {
    const query = `
      SELECT 
        tq.*,
        r.repo_name,
        r.owner_login,
        r.owner_avatar_url
      FROM task_queue tq
      LEFT JOIN repositories r ON tq.repo_id = r.id
      WHERE tq.id = $1
    `;
    const result = await this.pool.query(query, [id]);
    return result.rows[0] ? this.transformDbRowWithRepository(result.rows[0]) : null;
  }

  async findByDedupeKey(dedupeKey: string): Promise<TaskQueue | null> {
    const query = 'SELECT * FROM task_queue WHERE dedupe_key = $1';
    const result = await this.pool.query(query, [dedupeKey]);
    return result.rows[0] ? this.transformDbRow(result.rows[0]) : null;
  }

  async findTasks(options: TaskQueryOptions = {}): Promise<TaskQueue[]> {
    let query = `
      SELECT 
        tq.*,
        r.repo_name,
        r.owner_login,
        r.owner_avatar_url
      FROM task_queue tq
      LEFT JOIN repositories r ON tq.repo_id = r.id
      WHERE 1=1
    `;
    const values: any[] = [];
    let paramCounter = 1;

    if (options.repo_id) {
      query += ` AND tq.repo_id = $${paramCounter++}`;
      values.push(options.repo_id);
    }

    if (options.status) {
      if (Array.isArray(options.status)) {
        query += ` AND tq.status = ANY($${paramCounter++})`;
        values.push(options.status);
      } else {
        query += ` AND tq.status = $${paramCounter++}`;
        values.push(options.status);
      }
    }

    if (options.type) {
      query += ` AND tq.type = $${paramCounter++}`;
      values.push(options.type);
    }

    if (options.created_by) {
      query += ` AND tq.created_by = $${paramCounter++}`;
      values.push(options.created_by);
    }

    const orderBy = options.order_by || 'created_at';
    const orderDirection = options.order_direction || 'desc';
    query += ` ORDER BY tq.${orderBy} ${orderDirection}`;

    if (options.limit) {
      query += ` LIMIT $${paramCounter++}`;
      values.push(options.limit);
    }

    if (options.offset) {
      query += ` OFFSET $${paramCounter++}`;
      values.push(options.offset);
    }

    const result = await this.pool.query(query, values);
    return result.rows.map(row => this.transformDbRowWithRepository(row));
  }

  async updateTask(id: number, data: TaskUpdateInput): Promise<TaskQueue | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCounter = 1;

    if (data.status !== undefined) {
      updates.push(`status = $${paramCounter++}`);
      values.push(data.status);
    }

    if (data.payload !== undefined) {
      updates.push(`payload = $${paramCounter++}`);
      values.push(data.payload ? JSON.stringify(data.payload) : null);
    }

    if (data.result !== undefined) {
      updates.push(`result = $${paramCounter++}`);
      values.push(data.result ? JSON.stringify(data.result) : null);
    }

    if (data.error !== undefined) {
      updates.push(`error = $${paramCounter++}`);
      values.push(data.error);
    }

    if (data.attempt !== undefined) {
      updates.push(`attempt = $${paramCounter++}`);
      values.push(data.attempt);
    }

    if (data.claimed_by !== undefined) {
      updates.push(`claimed_by = $${paramCounter++}`);
      values.push(data.claimed_by);
    }

    if (data.claimed_at !== undefined) {
      updates.push(`claimed_at = $${paramCounter++}`);
      values.push(data.claimed_at);
    }

    if (data.started_at !== undefined) {
      updates.push(`started_at = $${paramCounter++}`);
      values.push(data.started_at);
    }

    if (data.finished_at !== undefined) {
      updates.push(`finished_at = $${paramCounter++}`);
      values.push(data.finished_at);
    }

    if (data.not_before_at !== undefined) {
      updates.push(`not_before_at = $${paramCounter++}`);
      values.push(data.not_before_at);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    values.push(id);

    const query = `
      UPDATE task_queue 
      SET ${updates.join(', ')}
      WHERE id = $${paramCounter}
      RETURNING *
    `;

    const result = await this.pool.query(query, values);
    if (result.rows[0]) {
      const task = this.transformDbRow(result.rows[0]);
      this.notifyListeners('task_updated', task);
      return task;
    }
    return null;
  }

  async cancelTask(id: number, userId?: number): Promise<TaskQueue | null> {
    let query = `
      UPDATE task_queue 
      SET status = 'canceled', finished_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND status = 'queued'
    `;
    const values = [id];

    if (userId) {
      query += ' AND created_by = $2';
      values.push(userId);
    }

    query += ' RETURNING *';

    const result = await this.pool.query(query, values);
    if (result.rows[0]) {
      const task = this.transformDbRow(result.rows[0]);
      this.notifyListeners('task_canceled', task);
      return task;
    }
    return null;
  }

  async pullTasksForWorker(options: WorkerPullOptions): Promise<TaskQueue[]> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      let query = `
        SELECT * FROM task_queue 
        WHERE status = 'queued' 
        AND not_before_at <= CURRENT_TIMESTAMP
        AND (claimed_at IS NULL OR claimed_at < CURRENT_TIMESTAMP - INTERVAL '5 minutes')
      `;

      const values: any[] = [];
      let paramCounter = 1;

      if (options.types && options.types.length > 0) {
        query += ` AND type = ANY($${paramCounter++})`;
        values.push(options.types);
      }

      query += ` ORDER BY priority DESC, created_at ASC`;

      if (options.limit) {
        query += ` LIMIT $${paramCounter++}`;
        values.push(options.limit);
      }

      query += ' FOR UPDATE SKIP LOCKED';

      const selectResult = await client.query(query, values);

      if (selectResult.rows.length === 0) {
        await client.query('COMMIT');
        return [];
      }

      const taskIds = selectResult.rows.map(row => row.id);
      const updateQuery = `
        UPDATE task_queue 
        SET status = 'running', 
            claimed_by = $1, 
            claimed_at = CURRENT_TIMESTAMP,
            started_at = CURRENT_TIMESTAMP
        WHERE id = ANY($2)
        RETURNING *
      `;

      const updateResult = await client.query(updateQuery, [options.claimed_by, taskIds]);
      await client.query('COMMIT');

      const tasks = updateResult.rows.map(row => this.transformDbRow(row));
      tasks.forEach(task => this.notifyListeners('task_claimed', task));

      return tasks;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async heartbeat(taskId: number, workerKey: string): Promise<boolean> {
    const query = `
      UPDATE task_queue 
      SET claimed_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND claimed_by = $2 AND status = 'running'
    `;

    const result = await this.pool.query(query, [taskId, workerKey]);
    return result.rowCount === 1;
  }

  async markTaskSucceeded(taskId: number, workerKey: string, result?: any): Promise<TaskQueue | null> {
    const query = `
      UPDATE task_queue 
      SET status = 'succeeded', 
          result = $3,
          finished_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND claimed_by = $2 AND status = 'running'
      RETURNING *
    `;

    const queryResult = await this.pool.query(query, [
      taskId,
      workerKey,
      result ? JSON.stringify(result) : null
    ]);

    if (queryResult.rows[0]) {
      const task = this.transformDbRow(queryResult.rows[0]);
      this.notifyListeners('task_succeeded', task);
      return task;
    }
    return null;
  }

  async markTaskFailed(taskId: number, workerKey: string, error: string, shouldRetry = true): Promise<TaskQueue | null> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      const getTaskQuery = 'SELECT * FROM task_queue WHERE id = $1 AND claimed_by = $2 AND status = \'running\'';
      const taskResult = await client.query(getTaskQuery, [taskId, workerKey]);

      if (taskResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return null;
      }

      const task = taskResult.rows[0];
      const newAttempt = task.attempt + 1;
      const canRetry = shouldRetry && newAttempt < task.max_attempts;

      let updateQuery: string;
      let updateValues: any[];

      if (canRetry) {
        const backoffMinutes = Math.pow(2, newAttempt - 1);
        const retryTime = new Date();
        retryTime.setMinutes(retryTime.getMinutes() + backoffMinutes);

        updateQuery = `
          UPDATE task_queue 
          SET status = 'queued',
              attempt = $3,
              error = $4,
              claimed_by = NULL,
              claimed_at = NULL,
              started_at = NULL,
              not_before_at = $5
          WHERE id = $1 AND claimed_by = $2
          RETURNING *
        `;
        updateValues = [taskId, workerKey, newAttempt, error, retryTime.toISOString()];
      } else {
        updateQuery = `
          UPDATE task_queue 
          SET status = 'failed',
              attempt = $3,
              error = $4,
              finished_at = CURRENT_TIMESTAMP
          WHERE id = $1 AND claimed_by = $2
          RETURNING *
        `;
        updateValues = [taskId, workerKey, newAttempt, error];
      }

      const updateResult = await client.query(updateQuery, updateValues);
      await client.query('COMMIT');

      if (updateResult.rows[0]) {
        const updatedTask = this.transformDbRow(updateResult.rows[0]);
        this.notifyListeners(canRetry ? 'task_retry_scheduled' : 'task_failed', updatedTask);
        return updatedTask;
      }
      return null;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getTaskEvents(taskId: number): Promise<TaskEvent[]> {
    const query = `
      SELECT * FROM task_events 
      WHERE task_id = $1 
      ORDER BY created_at ASC
    `;

    const result = await this.pool.query(query, [taskId]);
    return result.rows;
  }

  async getMetrics(repoId?: number): Promise<TaskMetrics> {
    let query = `
      SELECT 
        COUNT(*) as total_tasks,
        COUNT(CASE WHEN status = 'queued' THEN 1 END) as queued_tasks,
        COUNT(CASE WHEN status = 'running' THEN 1 END) as running_tasks,
        COUNT(CASE WHEN status = 'succeeded' THEN 1 END) as succeeded_tasks,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_tasks,
        COUNT(CASE WHEN status = 'canceled' THEN 1 END) as canceled_tasks,
        AVG(CASE 
          WHEN started_at IS NOT NULL AND finished_at IS NOT NULL 
          THEN EXTRACT(EPOCH FROM (finished_at::timestamp - started_at::timestamp))
        END) as average_runtime
      FROM task_queue
    `;

    const values: any[] = [];
    if (repoId) {
      query += ' WHERE repo_id = $1';
      values.push(repoId);
    }

    const result = await this.pool.query(query, values);
    const row = result.rows[0];

    const totalCompleted = parseInt(row.succeeded_tasks) + parseInt(row.failed_tasks);
    const successRate = totalCompleted > 0 ?
      (parseInt(row.succeeded_tasks) / totalCompleted) * 100 :
      undefined;

    const metrics: TaskMetrics = {
      total_tasks: parseInt(row.total_tasks),
      queued_tasks: parseInt(row.queued_tasks),
      running_tasks: parseInt(row.running_tasks),
      succeeded_tasks: parseInt(row.succeeded_tasks),
      failed_tasks: parseInt(row.failed_tasks),
      canceled_tasks: parseInt(row.canceled_tasks),
    };

    if (row.average_runtime) {
      metrics.average_runtime = parseFloat(row.average_runtime);
    }

    if (successRate !== undefined) {
      metrics.success_rate = successRate;
    }

    return metrics;
  }

  onTaskUpdate(listenerId: string, callback: (task: TaskQueue) => void): void {
    this.eventListeners.set(listenerId, callback);
  }

  removeTaskUpdateListener(listenerId: string): void {
    this.eventListeners.delete(listenerId);
  }

  private notifyListeners(eventType: string, task: TaskQueue): void {
    this.eventListeners.forEach(callback => {
      try {
        callback(task);
      } catch (error) {
        console.error('Error in task update listener:', error);
      }
    });
  }

  private transformDbRow(row: any): TaskQueue {
    return {
      ...row,
      payload: row.payload || undefined,
      result: row.result || undefined,
    };
  }

  private transformDbRowWithRepository(row: any): TaskQueue {
    const task = this.transformDbRow(row);
    
    // Add repository information if available
    if (row.repo_name) {
      (task as any).repository = {
        id: row.repo_id,
        repo_name: row.repo_name,
        owner: row.owner_login ? {
          login: row.owner_login,
          avatar_url: row.owner_avatar_url
        } : undefined
      };
    }
    
    return task;
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

export const taskQueueService = new TaskQueueService();