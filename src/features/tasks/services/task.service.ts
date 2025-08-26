import { apiClient } from '../../../shared/services/api.service.js';
import { TaskQueue, TaskStatus, TaskCreateInput, TaskListFilters, TaskEvent } from '../types/task.types.js';

interface TaskResponse {
  task: TaskQueue;
  events?: TaskEvent[];
}

interface TasksResponse {
  tasks: TaskQueue[];
}

interface MetricsResponse {
  metrics: Record<string, number>;
}

class TaskService {
  async getTasks(filters?: TaskListFilters): Promise<TaskQueue[]> {
    const searchParams = new URLSearchParams();
    
    if (filters?.repo_id) searchParams.append('repo_id', filters.repo_id.toString());
    if (filters?.status) searchParams.append('status', filters.status);
    if (filters?.type) searchParams.append('type', filters.type);
    if (filters?.created_by) searchParams.append('created_by', filters.created_by.toString());
    if (filters?.limit) searchParams.append('limit', filters.limit.toString());
    if (filters?.offset) searchParams.append('offset', filters.offset.toString());
    
    const endpoint = `/tasks${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    const response = await apiClient.get<TasksResponse>(endpoint);
    return response.tasks;
  }

  async getTask(id: number): Promise<{ task: TaskQueue; events: TaskEvent[] }> {
    const response = await apiClient.get<TaskResponse>(`/tasks/${id}`);
    return {
      task: response.task,
      events: response.events || []
    };
  }

  async createTask(data: TaskCreateInput): Promise<TaskQueue> {
    const response = await apiClient.post<TaskResponse>('/tasks', data);
    return response.task;
  }

  async cancelTask(id: number, userId: number): Promise<TaskQueue> {
    const response = await apiClient.post<TaskResponse>(`/tasks/${id}`, {
      status: 'canceled',
      user_id: userId
    });
    return response.task;
  }

  async getMetrics(): Promise<Record<string, number>> {
    const response = await apiClient.get<MetricsResponse>('/tasks/metrics');
    return response.metrics;
  }

  // Server-sent events connection
  connectToUpdates(
    onUpdate: (task: TaskQueue) => void,
    options?: { userId?: number; repoId?: number }
  ): EventSource {
    const searchParams = new URLSearchParams();
    if (options?.userId) searchParams.append('user_id', options.userId.toString());
    if (options?.repoId) searchParams.append('repo_id', options.repoId.toString());
    
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    const url = `${API_BASE_URL}/events${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    
    const eventSource = new EventSource(url);
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'task_updated' && data.data) {
          onUpdate(data.data);
        }
      } catch (error) {
        console.error('Error parsing SSE data:', error);
      }
    };
    
    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
    };
    
    return eventSource;
  }
}

export const taskService = new TaskService();