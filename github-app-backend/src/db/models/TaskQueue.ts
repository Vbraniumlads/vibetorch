export type TaskStatus = 'queued' | 'running' | 'succeeded' | 'failed' | 'canceled';

export interface TaskQueue {
  id: number;
  repo_id: number;
  type: string;
  priority: number;
  status: TaskStatus;
  payload?: Record<string, any>;
  result?: Record<string, any>;
  error?: string;
  created_by: number;
  attempt: number;
  max_attempts: number;
  dedupe_key?: string;
  claimed_by?: string;
  claimed_at?: string;
  started_at?: string;
  finished_at?: string;
  not_before_at: string;
  created_at: string;
  updated_at: string;
}

export interface TaskEvent {
  id: number;
  task_id: number;
  event_type: string;
  event_data?: Record<string, any>;
  created_at: string;
}

export interface TaskCreateInput {
  repo_id: number;
  type: string;
  priority?: number;
  payload?: Record<string, any>;
  created_by: number;
  max_attempts?: number;
  dedupe_key?: string;
  not_before_at?: string;
}

export interface TaskUpdateInput {
  status?: TaskStatus;
  result?: Record<string, any>;
  error?: string;
  attempt?: number;
  claimed_by?: string;
  claimed_at?: string;
  started_at?: string;
  finished_at?: string;
  not_before_at?: string;
}

export interface TaskListFilters {
  repo_id?: number;
  status?: TaskStatus;
  type?: string;
  created_by?: number;
  limit?: number;
  offset?: number;
}

export interface WorkerPullRequest {
  worker_id: string;
  task_types?: string[];
  lease_duration_ms?: number;
}

export interface TaskHeartbeat {
  worker_id: string;
  lease_extension_ms?: number;
}

export interface TaskCompletion {
  worker_id: string;
  result?: Record<string, any>;
  error?: string;
}