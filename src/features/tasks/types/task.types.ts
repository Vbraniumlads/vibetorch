export interface Task {
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
  
  // Populated data
  repository?: {
    id: number;
    repo_name: string;
    owner?: {
      login: string;
      avatar_url?: string;
    };
  };
}

export interface TaskEvent {
  id: number;
  task_id: number;
  event_type: string;
  event_data?: any;
  created_at: string;
}

export interface CreateTaskRequest {
  repo_id: number;
  type: string;
  priority?: number;
  payload?: any;
  max_attempts?: number;
  dedupe_key?: string;
  not_before_at?: string;
}

export interface TaskFilters {
  repo_id?: number;
  status?: Task['status'] | Task['status'][];
  type?: string;
  created_by?: number;
  search?: string;
  sortBy?: 'created_at' | 'priority' | 'updated_at' | 'type';
  sortOrder?: 'asc' | 'desc';
}

export interface TaskState {
  tasks: Task[];
  selectedTask: Task | null;
  isLoading: boolean;
  error: string | null;
  filters: TaskFilters;
  isDrawerOpen: boolean;
  realTimeEnabled: boolean;
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

export interface TaskEventStreamData {
  type: 'connected' | 'task_updated' | 'heartbeat';
  task?: Task;
  message?: string;
  timestamp: string;
}

export type TaskStatus = Task['status'];

export const TASK_TYPES = {
  CODE_GENERATION: 'code_generation',
  ISSUE_CREATION: 'issue_creation',
  PR_CREATION: 'pr_creation',
  REPOSITORY_SYNC: 'repository_sync',
  WEBHOOK_PROCESSING: 'webhook_processing',
  ANALYSIS: 'analysis',
  DEPLOYMENT: 'deployment',
  TESTING: 'testing'
} as const;

export type TaskType = typeof TASK_TYPES[keyof typeof TASK_TYPES];

export const TASK_STATUS_COLORS = {
  queued: 'bg-blue-100 text-blue-800',
  running: 'bg-yellow-100 text-yellow-800',
  succeeded: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  canceled: 'bg-gray-100 text-gray-800',
} as const;