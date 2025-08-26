import { Task, CreateTaskRequest, TaskFilters, TaskMetrics, TaskEventStreamData } from '../types/task.types.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

class TaskService {
  private eventSource: EventSource | null = null;
  private eventListeners: Set<(data: TaskEventStreamData) => void> = new Set();

  async getTasks(filters: TaskFilters = {}): Promise<Task[]> {
    const params = new URLSearchParams();
    
    if (filters.repo_id) params.append('repo_id', filters.repo_id.toString());
    if (filters.status) {
      if (Array.isArray(filters.status)) {
        filters.status.forEach(status => params.append('status', status));
      } else {
        params.append('status', filters.status);
      }
    }
    if (filters.type) params.append('type', filters.type);
    if (filters.created_by) params.append('created_by', filters.created_by.toString());
    if (filters.sortBy) params.append('order_by', filters.sortBy);
    if (filters.sortOrder) params.append('order_direction', filters.sortOrder);
    
    const response = await fetch(`${API_BASE_URL}/tasks?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch tasks');
    }
    
    return response.json();
  }

  async getTask(id: number): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch task');
    }
    
    return response.json();
  }

  async createTask(taskData: CreateTaskRequest): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...taskData,
        created_by: 1 // TODO: Get from auth context
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create task');
    }
    
    return response.json();
  }

  async cancelTask(id: number): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'cancel'
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to cancel task');
    }
    
    return response.json();
  }

  async getTaskEvents(id: number): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}/events`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch task events');
    }
    
    return response.json();
  }

  async getMetrics(repoId?: number): Promise<TaskMetrics> {
    const params = new URLSearchParams();
    if (repoId) params.append('repo_id', repoId.toString());
    
    const response = await fetch(`${API_BASE_URL}/worker/metrics?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_WORKER_TOKEN || 'default-worker-token'}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch metrics');
    }
    
    return response.json();
  }

  subscribeToTaskUpdates(callback: (data: TaskEventStreamData) => void): void {
    this.eventListeners.add(callback);
    
    if (!this.eventSource) {
      this.eventSource = new EventSource(`${API_BASE_URL}/events/tasks/stream`);
      
      this.eventSource.onmessage = (event) => {
        try {
          const data: TaskEventStreamData = JSON.parse(event.data);
          this.eventListeners.forEach(listener => listener(data));
        } catch (error) {
          console.error('Error parsing SSE data:', error);
        }
      };
      
      this.eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
      };
      
      this.eventSource.onopen = () => {
        console.log('SSE connection opened');
      };
    }
  }

  unsubscribeFromTaskUpdates(callback: (data: TaskEventStreamData) => void): void {
    this.eventListeners.delete(callback);
    
    if (this.eventListeners.size === 0 && this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.eventListeners.clear();
  }
}

export const taskService = new TaskService();