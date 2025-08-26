import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TaskTable, 
  TaskDrawer, 
  TaskFilters,
  useTasks 
} from '@/features/tasks';
import { useRepositories } from '@/features/github/hooks/useRepositories';

export default function Tasks() {
  const { repositories } = useRepositories();
  const {
    tasks,
    selectedTask,
    isLoading,
    error,
    filters,
    isDrawerOpen,
    realTimeEnabled,
    createTask,
    cancelTask,
    selectTask,
    closeDrawer,
    setFilters,
    toggleRealTime,
    clearError,
    refresh,
  } = useTasks();

  const repositoryOptions = repositories.map(repo => ({
    id: repo.id,
    name: repo.repo_name
  }));

  const handleCreateTask = () => {
    // TODO: Implement task creation modal or form
    console.log('Create task clicked');
  };

  const handleCancelTask = async (id: number) => {
    try {
      await cancelTask(id);
    } catch (error) {
      console.error('Failed to cancel task:', error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tasks</h1>
          <p className="text-muted-foreground mt-1">
            Monitor and manage your background tasks
          </p>
        </div>
        
        <Button onClick={handleCreateTask} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Create Task
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-red-800">{error}</p>
              <Button variant="ghost" size="sm" onClick={clearError}>
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <TaskFilters
        filters={filters}
        onFiltersChange={setFilters}
        onRefresh={refresh}
        realTimeEnabled={realTimeEnabled}
        onToggleRealTime={toggleRealTime}
        repositoryOptions={repositoryOptions}
        isLoading={isLoading}
      />

      {/* Tasks Table */}
      <TaskTable
        tasks={tasks}
        onTaskSelect={selectTask}
        onCancelTask={handleCancelTask}
        isLoading={isLoading}
        showRepository={!filters.repo_id}
      />

      {/* Task Details Drawer */}
      <TaskDrawer
        task={selectedTask}
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        onCancelTask={handleCancelTask}
      />
    </div>
  );
}