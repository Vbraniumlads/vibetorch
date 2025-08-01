import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";

interface Task {
  id: string;
  date: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
}

const TaskManagement: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      date: '2024-08-01',
      description: 'Implement GitHub OAuth integration',
      status: 'in-progress'
    },
    {
      id: '2',
      date: '2024-08-02',
      description: 'Develop user dashboard UI components',
      status: 'pending'
    },
    {
      id: '3',
      date: '2024-07-30',
      description: 'Optimize API endpoint performance',
      status: 'completed'
    },
    {
      id: '4',
      date: '2024-08-05',
      description: 'Build token usage monitoring system',
      status: 'blocked'
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    status: 'pending' as Task['status']
  });
  const [editingTask, setEditingTask] = useState<string | null>(null);

  const statusLabels = {
    pending: 'Pending',
    'in-progress': 'In Progress',
    completed: 'Completed',
    blocked: 'Blocked'
  };

  const getStatusClasses = (status: Task['status']) => {
    const statusStyles = {
      pending: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
      'in-progress': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
      completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
      blocked: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
    };
    return statusStyles[status];
  };

  const updateTaskCounts = () => {
    const counts = {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'completed').length,
      inProgress: tasks.filter(t => t.status === 'in-progress').length,
      pending: tasks.filter(t => t.status === 'pending').length,
      blocked: tasks.filter(t => t.status === 'blocked').length
    };
    return counts;
  };

  const toggleStatus = (taskId: string) => {
    const statuses: Task['status'][] = ['pending', 'in-progress', 'completed', 'blocked'];
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const currentIndex = statuses.indexOf(task.status);
        const nextIndex = (currentIndex + 1) % statuses.length;
        return { ...task, status: statuses[nextIndex] };
      }
      return task;
    }));
  };

  const updateTask = (taskId: string, field: 'date' | 'description', value: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, [field]: value } : task
    ));
  };

  const addNewTask = () => {
    if (!newTask.description.trim()) return;
    
    const task: Task = {
      id: Date.now().toString(),
      ...newTask
    };
    
    setTasks([task, ...tasks]);
    setNewTask({
      date: new Date().toISOString().split('T')[0],
      description: '',
      status: 'pending'
    });
    setIsModalOpen(false);
  };

  const counts = updateTaskCounts();

  return (
    <div className="w-full font-body">
      <div className="border-t border-b border-border overflow-hidden shadow-sm bg-background">
        {/* Header */}
        <div className="px-4 sm:px-6 py-5 border-b border-border bg-card">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-display font-semibold mb-1 text-foreground">
                Task Management
              </h1>
              <p className="text-sm text-muted-foreground">
                Plan and track work before agent execution
              </p>
            </div>
            <Button 
              onClick={() => setIsModalOpen(true)}
              className="bg-cta-500 hover:bg-cta-600 text-white font-medium transition-all duration-200 hover:transform hover:-translate-y-1 hover:shadow-lg w-full sm:w-auto"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16" className="mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
              </svg>
              Add New Task
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse bg-card">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-2 sm:px-5 py-4 text-left text-xs sm:text-sm font-semibold uppercase tracking-wide text-foreground w-24 sm:w-32">
                  Date
                </th>
                <th className="px-2 sm:px-5 py-4 text-left text-xs sm:text-sm font-semibold uppercase tracking-wide text-foreground">
                  Task
                </th>
                <th className="px-2 sm:px-5 py-4 text-left text-xs sm:text-sm font-semibold uppercase tracking-wide text-foreground w-28 sm:w-36">
                  Status
                </th>
                <th className="px-2 sm:px-5 py-4 text-center text-xs sm:text-sm font-semibold uppercase tracking-wide text-foreground w-16 sm:w-20">
                  Edit
                </th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task, index) => (
                <tr 
                  key={task.id} 
                  className="border-b border-border transition-all duration-200 hover:bg-muted/50"
                >
                  <td className="px-2 sm:px-5 py-4">
                    <input
                      type="date"
                      value={task.date}
                      onChange={(e) => updateTask(task.id, 'date', e.target.value)}
                      readOnly={editingTask !== task.id}
                      className={`bg-transparent border-none text-xs sm:text-sm font-mono text-muted-foreground transition-all duration-200 w-full ${
                        editingTask === task.id 
                          ? 'border-b-2 border-cta-500 text-foreground' 
                          : 'border-b-2 border-transparent'
                      }`}
                    />
                  </td>
                  <td className="px-2 sm:px-5 py-4">
                    <input
                      type="text"
                      value={task.description}
                      onChange={(e) => updateTask(task.id, 'description', e.target.value)}
                      readOnly={editingTask !== task.id}
                      className={`w-full bg-transparent border-none text-xs sm:text-sm font-medium text-foreground transition-all duration-200 ${
                        editingTask === task.id 
                          ? 'border-b-2 border-cta-500' 
                          : 'border-b-2 border-transparent'
                      }`}
                    />
                  </td>
                  <td className="px-2 sm:px-5 py-4 text-center">
                    <span 
                      className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide cursor-pointer transition-all duration-200 hover:scale-105 ${getStatusClasses(task.status)}`}
                      onClick={() => toggleStatus(task.id)}
                    >
                      <span className="hidden sm:inline">{statusLabels[task.status]}</span>
                      <span className="sm:hidden">
                        {task.status === 'pending' ? 'P' : 
                         task.status === 'in-progress' ? 'IP' : 
                         task.status === 'completed' ? 'C' : 'B'}
                      </span>
                    </span>
                  </td>
                  <td className="px-2 sm:px-5 py-4 text-center">
                    <button
                      onClick={() => setEditingTask(editingTask === task.id ? null : task.id)}
                      className="p-1 sm:p-2 rounded transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-muted"
                    >
                      <svg width="14" height="14" className="sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {editingTask === task.id ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        )}
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-4 border-t border-border text-center bg-muted">
          <div className="text-xs sm:text-sm text-muted-foreground">
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
              <span>Total <strong className="text-foreground">{counts.total}</strong> tasks</span>
              <span className="hidden sm:inline">|</span>
              <span>Completed: <strong className="text-foreground">{counts.completed}</strong></span>
              <span className="hidden sm:inline">|</span>
              <span>In Progress: <strong className="text-foreground">{counts.inProgress}</strong></span>
              <span className="hidden sm:inline">|</span>
              <span>Pending: <strong className="text-foreground">{counts.pending}</strong></span>
              <span className="hidden sm:inline">|</span>
              <span>Blocked: <strong className="text-foreground">{counts.blocked}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/50"
          onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}
        >
          <div className="bg-card rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl border border-border">
            <div className="mb-5">
              <h2 className="text-xl font-display font-semibold text-foreground">
                Add New Task
              </h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">
                  Date
                </label>
                <input
                  type="date"
                  value={newTask.date}
                  onChange={(e) => setNewTask({ ...newTask, date: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md text-sm bg-card text-foreground focus:border-cta-500 focus:ring-1 focus:ring-cta-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">
                  Task Description
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Enter task description..."
                  className="w-full px-3 py-2 border border-border rounded-md text-sm resize-vertical min-h-[80px] bg-card text-foreground placeholder:text-muted-foreground focus:border-cta-500 focus:ring-1 focus:ring-cta-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">
                  Status
                </label>
                <select
                  value={newTask.status}
                  onChange={(e) => setNewTask({ ...newTask, status: e.target.value as Task['status'] })}
                  className="w-full px-3 py-2 border border-border rounded-md text-sm bg-card text-foreground focus:border-cta-500 focus:ring-1 focus:ring-cta-500"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-3 justify-end mt-6">
              <Button
                onClick={() => setIsModalOpen(false)}
                variant="outline"
                className="border-border text-foreground hover:bg-muted"
              >
                Cancel
              </Button>
              <Button 
                onClick={addNewTask}
                className="bg-cta-500 hover:bg-cta-600 text-white"
              >
                Add Task
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManagement;