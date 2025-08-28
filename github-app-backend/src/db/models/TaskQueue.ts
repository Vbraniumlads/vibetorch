export interface TaskQueue {
  id: number;
  repo_id: number;
  type: string;
  priority: number;
  status: 'queued' | 'running' | 'succeeded' | 'failed' | 'canceled';
  payload?: any;
  result?: any;
  error?: string;
  created_by: number;
  attempt: number;
  max_attempts: number;
  dedupe_key?: string;
  claimed_by?: string;
  claimed_at?: string;
  started_at?: string;
  finished_at?: string;
  not_before_at?: string;
  created_at: string;
  updated_at: string;
}

export interface TaskEvent {
  id: number;
  task_id: number;
  event_type: string;
  event_data?: any;
  created_at: string;
}

export interface TaskCreateInput {
  repo_id: number;
  type: string;
  priority?: number;
  payload?: any;
  created_by: number;
  max_attempts?: number;
  dedupe_key?: string;
  not_before_at?: string;
}

export interface TaskUpdateInput {
  status?: TaskQueue['status'];
  payload?: any;
  result?: any;
  error?: string;
  attempt?: number;
  claimed_by?: string;
  claimed_at?: string;
  started_at?: string;
  finished_at?: string;
  not_before_at?: string;
}

export interface TaskQueryOptions {
  repo_id?: number;
  status?: TaskQueue['status'] | TaskQueue['status'][];
  type?: string;
  created_by?: number;
  limit?: number;
  offset?: number;
  order_by?: 'created_at' | 'priority' | 'updated_at';
  order_direction?: 'asc' | 'desc';
}

export interface WorkerPullOptions {
  types?: string[];
  claimed_by: string;
  limit?: number;
}

export interface TaskMetrics {
  total_tasks: number;
  queued_tasks: number;
  running_tasks: number;
  succeeded_tasks: number;
  failed_tasks: number;
  canceled_tasks: number;
  average_runtime?: number;
  success_rate?: number;
}

export type TaskStatus = TaskQueue['status'];