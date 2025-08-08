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
      pending: 'bg-transparent text-cta-600 border border-cta-600',
      'in-progress': 'bg-transparent text-acc-600 border border-acc-600',
      completed: 'bg-transparent text-foreground border border-foreground',
      blocked: 'bg-transparent text-muted-foreground border border-muted-foreground'
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
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-light text-foreground">
              Tasks
            </h1>
            <p className="text-sm text-muted-foreground">
              Plan and track work
            </p>
          </div>
          <Button 
            onClick={() => setIsModalOpen(true)}
            variant="outline"
            className="w-fit"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16" className="mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
            </svg>
            Add Task
          </Button>
        </div>

        {/* Mobile Card View */}
        <div className="block md:hidden space-y-3">
          {tasks.map((task, index) => (
            <div key={task.id} className="border border-border rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <input
                  type="text"
                  value={task.description}
                  onChange={(e) => updateTask(task.id, 'description', e.target.value)}
                  readOnly={editingTask !== task.id}
                  className={`text-sm font-medium bg-transparent border-none w-full ${
                    editingTask === task.id ? 'text-foreground' : 'text-foreground'
                  }`}
                />
                <button
                  onClick={() => setEditingTask(editingTask === task.id ? null : task.id)}
                  className="p-1 text-muted-foreground hover:text-foreground"
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {editingTask === task.id ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    )}
                  </svg>
                </button>
              </div>
              <div className="flex items-center justify-between text-sm">
                <input
                  type="date"
                  value={task.date}
                  onChange={(e) => updateTask(task.id, 'date', e.target.value)}
                  readOnly={editingTask !== task.id}
                  className="bg-transparent border-none text-muted-foreground"
                />
                <span 
                  className={`px-2 py-1 rounded text-xs cursor-pointer ${getStatusClasses(task.status)}`}
                  onClick={() => toggleStatus(task.id)}
                >
                  {task.status === 'pending' ? 'P' : 
                   task.status === 'in-progress' ? 'IP' : 
                   task.status === 'completed' ? 'C' : 'B'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block border border-border rounded-lg overflow-hidden">
          <table className="w-full border-collapse">
            <thead className="border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Task</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">Edit</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task, index) => (
                <tr 
                  key={task.id} 
                  className="border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <input
                      type="date"
                      value={task.date}
                      onChange={(e) => updateTask(task.id, 'date', e.target.value)}
                      readOnly={editingTask !== task.id}
                      className="bg-transparent border-none text-sm text-muted-foreground w-full"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={task.description}
                      onChange={(e) => updateTask(task.id, 'description', e.target.value)}
                      readOnly={editingTask !== task.id}
                      className="w-full bg-transparent border-none text-sm text-foreground"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span 
                      className={`px-2 py-1 rounded text-xs cursor-pointer ${getStatusClasses(task.status)}`}
                      onClick={() => toggleStatus(task.id)}
                    >
                      {statusLabels[task.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => setEditingTask(editingTask === task.id ? null : task.id)}
                      className="p-1 text-muted-foreground hover:text-foreground"
                    >
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

        {/* Footer Stats */}
        <div className="text-center">
          <div className="text-xs text-muted-foreground">
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
              <span>{counts.total} tasks</span>
              <span>•</span>
              <span>{counts.completed} completed</span>
              <span>•</span>
              <span>{counts.inProgress} in progress</span>
              <span>•</span>
              <span>{counts.pending} pending</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 px-4"
          onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}
        >
          <div className="bg-background rounded-lg p-6 w-full max-w-md shadow-xl border border-border">
            <div className="mb-6">
              <h2 className="text-lg font-light text-foreground">
                Add Task
              </h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2 text-foreground">
                  Date
                </label>
                <input
                  type="date"
                  value={newTask.date}
                  onChange={(e) => setNewTask({ ...newTask, date: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded text-sm bg-transparent text-foreground focus:border-foreground focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm mb-2 text-foreground">
                  Description
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Enter task description..."
                  className="w-full px-3 py-2 border border-border rounded text-sm resize-vertical min-h-[80px] bg-transparent text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm mb-2 text-foreground">
                  Status
                </label>
                <select
                  value={newTask.status}
                  onChange={(e) => setNewTask({ ...newTask, status: e.target.value as Task['status'] })}
                  className="w-full px-3 py-2 border border-border rounded text-sm bg-transparent text-foreground focus:border-foreground focus:outline-none"
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
              >
                Cancel
              </Button>
              <Button 
                onClick={addNewTask}
                className="bg-foreground text-background hover:bg-foreground/90"
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