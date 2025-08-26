import { useState, useEffect, useCallback } from 'react';
import { Task, TaskFilters, TaskState, TaskEventStreamData } from '../types/task.types';
import { taskService } from '../services/task.service';

const initialState: TaskState = {
  tasks: [],
  selectedTask: null,
  isLoading: false,
  error: null,
  filters: {
    sortBy: 'created_at',
    sortOrder: 'desc'
  },
  isDrawerOpen: false,
  realTimeEnabled: true
};

export function useTasks(initialFilters: TaskFilters = {}) {
  const [state, setState] = useState<TaskState>({
    ...initialState,
    filters: { ...initialState.filters, ...initialFilters }
  });

  const updateTask = useCallback((updatedTask: Task) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(task =>
        task.id === updatedTask.id ? updatedTask : task
      ),
      selectedTask: prev.selectedTask?.id === updatedTask.id ? updatedTask : prev.selectedTask
    }));
  }, []);

  const addTask = useCallback((newTask: Task) => {
    setState(prev => ({
      ...prev,
      tasks: [newTask, ...prev.tasks]
    }));
  }, []);

  const handleTaskUpdate = useCallback((data: TaskEventStreamData) => {
    if (data.type === 'task_updated' && data.task) {
      const existingTaskIndex = state.tasks.findIndex(t => t.id === data.task!.id);
      if (existingTaskIndex >= 0) {
        updateTask(data.task);
      } else {
        addTask(data.task);
      }
    }
  }, [state.tasks, updateTask, addTask]);

  const fetchTasks = useCallback(async (filters: TaskFilters = state.filters) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const tasks = await taskService.getTasks(filters);
      setState(prev => ({
        ...prev,
        tasks,
        isLoading: false,
        filters
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to fetch tasks',
        isLoading: false
      }));
    }
  }, [state.filters]);

  const createTask = useCallback(async (taskData: any) => {
    try {
      const newTask = await taskService.createTask(taskData);
      addTask(newTask);
      return newTask;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create task'
      }));
      throw error;
    }
  }, [addTask]);

  const cancelTask = useCallback(async (id: number) => {
    try {
      const updatedTask = await taskService.cancelTask(id);
      updateTask(updatedTask);
      return updatedTask;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to cancel task'
      }));
      throw error;
    }
  }, [updateTask]);

  const selectTask = useCallback((task: Task | null) => {
    setState(prev => ({
      ...prev,
      selectedTask: task,
      isDrawerOpen: !!task
    }));
  }, []);

  const closeDrawer = useCallback(() => {
    setState(prev => ({
      ...prev,
      isDrawerOpen: false,
      selectedTask: null
    }));
  }, []);

  const setFilters = useCallback((newFilters: Partial<TaskFilters>) => {
    const updatedFilters = { ...state.filters, ...newFilters };
    setState(prev => ({ ...prev, filters: updatedFilters }));
    fetchTasks(updatedFilters);
  }, [state.filters, fetchTasks]);

  const toggleRealTime = useCallback(() => {
    setState(prev => ({
      ...prev,
      realTimeEnabled: !prev.realTimeEnabled
    }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const refresh = useCallback(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Real-time updates
  useEffect(() => {
    if (state.realTimeEnabled) {
      taskService.subscribeToTaskUpdates(handleTaskUpdate);
      return () => taskService.unsubscribeFromTaskUpdates(handleTaskUpdate);
    }
  }, [state.realTimeEnabled, handleTaskUpdate]);

  // Initial fetch
  useEffect(() => {
    fetchTasks();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => taskService.disconnect();
  }, []);

  return {
    tasks: state.tasks,
    selectedTask: state.selectedTask,
    isLoading: state.isLoading,
    error: state.error,
    filters: state.filters,
    isDrawerOpen: state.isDrawerOpen,
    realTimeEnabled: state.realTimeEnabled,
    
    // Actions
    createTask,
    cancelTask,
    selectTask,
    closeDrawer,
    setFilters,
    toggleRealTime,
    clearError,
    refresh,
    fetchTasks
  };
}