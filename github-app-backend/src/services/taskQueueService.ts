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
  TaskListFilters,
  TaskStatus,
  WorkerPullRequest,
  TaskHeartbeat,
  TaskCompletion
} from '../db/models/TaskQueue.js';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class TaskQueueService {
  private pool: Pool;
  private eventCallbacks: ((task: TaskQueue) => void)[] = [];

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
    console.log('🚀 Initializing TaskQueue database...');

    try {
      const client = await this.pool.connect();
      console.log('✅ TaskQueue: Connected to PostgreSQL');

      const migrationPath = path.join(__dirname, '../db/migrations/002_create_task_queue.sql');

      if (fs.existsSync(migrationPath)) {
        console.log('📦 Running TaskQueue migration:', migrationPath);
        const migration = fs.readFileSync(migrationPath, 'utf8');

        try {
          await client.query(migration);
          console.log('✅ TaskQueue migration executed successfully');
        } catch (error: any) {
          if (error.code === '42P07' || error.message.includes('already exists')) {
            console.log('⚠️  TaskQueue tables already exist, skipping migration');
          } else {
            console.error('❌ TaskQueue migration error:', error.message);
            throw error;
          }
        }
      }

      client.release();
      console.log('✅ TaskQueue database initialization complete');
    } catch (error) {
      console.error('❌ Failed to initialize TaskQueue database:', error);
      throw error;
    }
  }

  // Task CRUD operations
  async createTask(data: TaskCreateInput): Promise<TaskQueue> {
    // Check for existing task with same dedupe_key
    if (data.dedupe_key) {
      const existing = await this.findByDedupeKey(data.dedupe_key);
      if (existing) {
        return existing;
      }
    }

    const query = `
      INSERT INTO task_queue (
        repo_id, type, priority, payload, created_by, max_attempts, dedupe_key, not_before_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      data.repo_id,
      data.type,
      data.priority || 0,
      data.payload ? JSON.stringify(data.payload) : null,
      data.created_by,
      data.max_attempts || 3,
      data.dedupe_key || null,
      data.not_before_at || new Date().toISOString()
    ];

    const result = await this.pool.query(query, values);
    const task = this.transformDbRow(result.rows[0]);
    
    await this.logEvent(task.id, 'created', { created_by: data.created_by });
    this.notifyTaskUpdated(task);
    
    return task;
  }

  async findById(id: number): Promise<TaskQueue | null> {
    const query = 'SELECT * FROM task_queue WHERE id = $1';
    const result = await this.pool.query(query, [id]);
    return result.rows[0] ? this.transformDbRow(result.rows[0]) : null;
  }

  async findByDedupeKey(dedupeKey: string): Promise<TaskQueue | null> {
    const query = 'SELECT * FROM task_queue WHERE dedupe_key = $1 ORDER BY created_at DESC LIMIT 1';
    const result = await this.pool.query(query, [dedupeKey]);
    return result.rows[0] ? this.transformDbRow(result.rows[0]) : null;
  }

  async findTasks(filters: TaskListFilters = {}): Promise<TaskQueue[]> {
    const conditions: string[] = [];
    const values: any[] = [];
    let paramCounter = 1;

    if (filters.repo_id) {
      conditions.push(`repo_id = $${paramCounter++}`);
      values.push(filters.repo_id);
    }
    if (filters.status) {
      conditions.push(`status = $${paramCounter++}`);
      values.push(filters.status);
    }
    if (filters.type) {
      conditions.push(`type = $${paramCounter++}`);
      values.push(filters.type);
    }
    if (filters.created_by) {
      conditions.push(`created_by = $${paramCounter++}`);
      values.push(filters.created_by);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit = filters.limit || 50;
    const offset = filters.offset || 0;

    const query = `
      SELECT * FROM task_queue 
      ${whereClause}
      ORDER BY priority DESC, created_at ASC
      LIMIT $${paramCounter++} OFFSET $${paramCounter}
    `;

    values.push(limit, offset);

    const result = await this.pool.query(query, values);
    return result.rows.map(row => this.transformDbRow(row));
  }

  async updateTask(id: number, data: TaskUpdateInput): Promise<TaskQueue | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCounter = 1;

    if (data.status !== undefined) {
      updates.push(`status = $${paramCounter++}`);
      values.push(data.status);
    }
    if (data.result !== undefined) {
      updates.push(`result = $${paramCounter++}`);
      values.push(JSON.stringify(data.result));
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
      await this.logEvent(id, 'updated', data);
      this.notifyTaskUpdated(task);
      return task;
    }
    return null;
  }

  async cancelTask(id: number, userId: number): Promise<TaskQueue | null> {
    // Only allow canceling queued tasks
    const query = `
      UPDATE task_queue 
      SET status = 'canceled', finished_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND status = 'queued' AND created_by = $2
      RETURNING *
    `;

    const result = await this.pool.query(query, [id, userId]);
    if (result.rows[0]) {
      const task = this.transformDbRow(result.rows[0]);
      await this.logEvent(id, 'canceled', { canceled_by: userId });
      this.notifyTaskUpdated(task);
      return task;
    }
    return null;
  }

  // Worker operations
  async pullTask(request: WorkerPullRequest): Promise<TaskQueue | null> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');

      // Find next available task
      let query = `
        SELECT * FROM task_queue 
        WHERE status = 'queued' 
        AND not_before_at <= CURRENT_TIMESTAMP
        AND (claimed_at IS NULL OR claimed_at < CURRENT_TIMESTAMP - INTERVAL '5 minutes')
      `;
      
      const values: any[] = [];
      let paramCounter = 1;

      if (request.task_types && request.task_types.length > 0) {
        query += ` AND type = ANY($${paramCounter++})`;
        values.push(request.task_types);
      }

      query += ' ORDER BY priority DESC, created_at ASC LIMIT 1 FOR UPDATE SKIP LOCKED';

      const result = await client.query(query, values);
      
      if (result.rows.length === 0) {
        await client.query('COMMIT');
        return null;
      }

      const task = result.rows[0];
      const leaseDuration = request.lease_duration_ms || 300000; // 5 minutes default
      const leaseExpiry = new Date(Date.now() + leaseDuration);

      // Claim the task
      const updateQuery = `
        UPDATE task_queue 
        SET status = 'running', 
            claimed_by = $1, 
            claimed_at = $2,
            started_at = CURRENT_TIMESTAMP,
            attempt = attempt + 1
        WHERE id = $3
        RETURNING *
      `;

      const updateResult = await client.query(updateQuery, [
        request.worker_id,
        leaseExpiry.toISOString(),
        task.id
      ]);

      await client.query('COMMIT');

      const claimedTask = this.transformDbRow(updateResult.rows[0]);
      await this.logEvent(task.id, 'claimed', { worker_id: request.worker_id });
      this.notifyTaskUpdated(claimedTask);

      return claimedTask;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async heartbeat(taskId: number, heartbeat: TaskHeartbeat): Promise<boolean> {
    const extensionMs = heartbeat.lease_extension_ms || 300000; // 5 minutes default
    const newLeaseExpiry = new Date(Date.now() + extensionMs);

    const query = `
      UPDATE task_queue 
      SET claimed_at = $1
      WHERE id = $2 AND claimed_by = $3 AND status = 'running'
    `;

    const result = await this.pool.query(query, [
      newLeaseExpiry.toISOString(),
      taskId,
      heartbeat.worker_id
    ]);

    if (result.rowCount && result.rowCount > 0) {
      await this.logEvent(taskId, 'heartbeat', { worker_id: heartbeat.worker_id });
      return true;
    }
    return false;
  }

  async completeTask(taskId: number, completion: TaskCompletion): Promise<TaskQueue | null> {
    const status = completion.error ? 'failed' : 'succeeded';
    
    const updateData: TaskUpdateInput = {
      status,
      finished_at: new Date().toISOString(),
      ...(completion.result && { result: completion.result }),
      ...(completion.error && { error: completion.error })
    };

    const task = await this.updateTask(taskId, updateData);
    
    if (task) {
      await this.logEvent(taskId, status, { worker_id: completion.worker_id });
      
      // If task failed and hasn't exceeded max attempts, requeue it
      if (status === 'failed' && task.attempt < task.max_attempts) {
        await this.requeueTask(taskId);
      }
    }

    return task;
  }

  private async requeueTask(taskId: number): Promise<void> {
    // Calculate backoff delay (exponential backoff)
    const task = await this.findById(taskId);
    if (!task) return;

    const backoffMs = Math.min(1000 * Math.pow(2, task.attempt - 1), 300000); // Max 5 minutes
    const notBeforeAt = new Date(Date.now() + backoffMs);

    const query = `
      UPDATE task_queue 
      SET status = 'queued', 
          claimed_by = NULL, 
          claimed_at = NULL,
          started_at = NULL,
          finished_at = NULL,
          not_before_at = $1
      WHERE id = $2
    `;

    await this.pool.query(query, [notBeforeAt.toISOString(), taskId]);
    await this.logEvent(taskId, 'requeued', { attempt: task.attempt, backoff_ms: backoffMs });
  }

  // Event logging
  async logEvent(taskId: number, eventType: string, eventData?: Record<string, any>): Promise<void> {
    const query = `
      INSERT INTO task_events (task_id, event_type, event_data)
      VALUES ($1, $2, $3)
    `;

    await this.pool.query(query, [
      taskId,
      eventType,
      eventData ? JSON.stringify(eventData) : null
    ]);
  }

  async getTaskEvents(taskId: number): Promise<TaskEvent[]> {
    const query = 'SELECT * FROM task_events WHERE task_id = $1 ORDER BY created_at ASC';
    const result = await this.pool.query(query, [taskId]);
    return result.rows.map(row => ({
      ...row,
      event_data: row.event_data ? JSON.parse(row.event_data) : null
    }));
  }

  // Metrics
  async getMetrics(): Promise<Record<string, number>> {
    const queries = [
      { key: 'queued', query: "SELECT COUNT(*) as count FROM task_queue WHERE status = 'queued'" },
      { key: 'running', query: "SELECT COUNT(*) as count FROM task_queue WHERE status = 'running'" },
      { key: 'succeeded_today', query: "SELECT COUNT(*) as count FROM task_queue WHERE status = 'succeeded' AND finished_at > CURRENT_DATE" },
      { key: 'failed_today', query: "SELECT COUNT(*) as count FROM task_queue WHERE status = 'failed' AND finished_at > CURRENT_DATE" },
      { key: 'avg_runtime_minutes', query: "SELECT AVG(EXTRACT(EPOCH FROM (finished_at - started_at))/60) as count FROM task_queue WHERE finished_at IS NOT NULL AND started_at IS NOT NULL" }
    ];

    const metrics: Record<string, number> = {};
    
    for (const { key, query } of queries) {
      try {
        const result = await this.pool.query(query);
        metrics[key] = parseFloat(result.rows[0].count) || 0;
      } catch (error) {
        console.error(`Failed to get metric ${key}:`, error);
        metrics[key] = 0;
      }
    }

    return metrics;
  }

  // Real-time notifications
  onTaskUpdated(callback: (task: TaskQueue) => void): void {
    this.eventCallbacks.push(callback);
  }

  private notifyTaskUpdated(task: TaskQueue): void {
    this.eventCallbacks.forEach(callback => {
      try {
        callback(task);
      } catch (error) {
        console.error('Error in task update callback:', error);
      }
    });
  }

  private transformDbRow(row: any): TaskQueue {
    return {
      ...row,
      payload: row.payload ? JSON.parse(row.payload) : null,
      result: row.result ? JSON.parse(row.result) : null,
    };
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

export const taskQueueService = new TaskQueueService();