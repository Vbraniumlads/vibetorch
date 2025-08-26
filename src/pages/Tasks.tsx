import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../shared/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useToast } from '../hooks/use-toast';
import { RefreshCw, Plus, Search, Filter } from 'lucide-react';

import { TaskTable } from '../features/tasks/components/TaskTable';
import { TaskMetrics } from '../features/tasks/components/TaskMetrics';
import { TaskDetailsDrawer } from '../features/tasks/components/TaskDetailsDrawer';
import { taskService } from '../features/tasks/services/task.service';
import type { TaskQueue, TaskListFilters, TaskEvent, TaskStatus } from '../features/tasks/types/task.types';

export default function Tasks() {
  const [tasks, setTasks] = useState<TaskQueue[]>([]);
  const [metrics, setMetrics] = useState<Record<string, number>>({});
  const [selectedTask, setSelectedTask] = useState<TaskQueue | null>(null);
  const [taskEvents, setTaskEvents] = useState<TaskEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<TaskListFilters>({
    limit: 50,
    offset: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { toast } = useToast();

  // SSE connection for real-time updates
  useEffect(() => {
    const eventSource = taskService.connectToUpdates((updatedTask) => {
      setTasks(prevTasks => {
        const taskIndex = prevTasks.findIndex(t => t.id === updatedTask.id);
        if (taskIndex >= 0) {
          const newTasks = [...prevTasks];
          newTasks[taskIndex] = updatedTask;
          return newTasks;
        } else {
          // New task, add to beginning
          return [updatedTask, ...prevTasks];
        }
      });
      
      // Refresh metrics when tasks update
      loadMetrics();
    });

    return () => {
      eventSource.close();
    };
  }, []);

  const loadTasks = async (newFilters: TaskListFilters = filters) => {
    setIsLoading(true);
    try {
      const tasksData = await taskService.getTasks(newFilters);
      setTasks(tasksData);
    } catch (error) {
      console.error('Failed to load tasks:', error);
      toast({
        title: 'Error',
        description: 'Failed to load tasks',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadMetrics = async () => {
    try {
      const metricsData = await taskService.getMetrics();
      setMetrics(metricsData);
    } catch (error) {
      console.error('Failed to load metrics:', error);
    }
  };

  const loadTaskDetails = async (task: TaskQueue) => {
    try {
      const { task: taskData, events } = await taskService.getTask(task.id);
      setSelectedTask(taskData);
      setTaskEvents(events);
      setIsDrawerOpen(true);
    } catch (error) {
      console.error('Failed to load task details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load task details',
        variant: 'destructive'
      });
    }
  };

  const handleCancelTask = async (taskId: number) => {
    try {
      // TODO: Get actual user ID from auth context
      await taskService.cancelTask(taskId, 1);
      toast({
        title: 'Success',
        description: 'Task canceled successfully'
      });
      loadTasks();
    } catch (error) {
      console.error('Failed to cancel task:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel task',
        variant: 'destructive'
      });
    }
  };

  const handleFiltersChange = (newFilters: Partial<TaskListFilters>) => {
    const updatedFilters = { ...filters, ...newFilters, offset: 0 };
    setFilters(updatedFilters);
    loadTasks(updatedFilters);
  };

  const handleRefresh = () => {
    loadTasks();
    loadMetrics();
  };

  // Initial load
  useEffect(() => {
    loadTasks();
    loadMetrics();
  }, []);

  // Filter tasks based on search term
  const filteredTasks = tasks.filter(task => 
    task.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.id.toString().includes(searchTerm) ||
    (task.error && task.error.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Task Queue</h1>
          <p className="text-muted-foreground mt-1">
            Monitor and manage background tasks
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Task
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <TaskMetrics metrics={metrics} isLoading={isLoading} />

      {/* Tasks Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Tasks</CardTitle>
              <CardDescription>
                View and manage all background tasks
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex items-center gap-4">
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) => 
                  handleFiltersChange({ 
                    status: value === 'all' ? undefined : value as TaskStatus 
                  })
                }
              >
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="queued">Queued</SelectItem>
                  <SelectItem value="running">Running</SelectItem>
                  <SelectItem value="succeeded">Succeeded</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.limit?.toString() || '50'}
                onValueChange={(value) => 
                  handleFiltersChange({ limit: parseInt(value) })
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25 tasks</SelectItem>
                  <SelectItem value="50">50 tasks</SelectItem>
                  <SelectItem value="100">100 tasks</SelectItem>
                </SelectContent>
              </Select>

              {(filters.status || searchTerm) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFilters({ limit: 50, offset: 0 });
                    setSearchTerm('');
                    loadTasks({ limit: 50, offset: 0 });
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>

            {/* Task Table */}
            <TaskTable
              tasks={filteredTasks}
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onViewDetails={loadTaskDetails}
              onCancelTask={handleCancelTask}
              isLoading={isLoading}
            />
          </div>
        </CardContent>
      </Card>

      {/* Task Details Drawer */}
      <TaskDetailsDrawer
        task={selectedTask}
        events={taskEvents}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onCancel={handleCancelTask}
      />
    </div>
  );
}