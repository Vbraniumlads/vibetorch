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

  const statusClasses = {
    pending: 'status-pending',
    'in-progress': 'status-in-progress',
    completed: 'status-completed',
    blocked: 'status-blocked'
  };

  const statusLabels = {
    pending: 'Pending',
    'in-progress': 'In Progress',
    completed: 'Completed',
    blocked: 'Blocked'
  };

  const statusColors = {
    pending: { bg: '#E6E4F1', color: '#41376C' },
    'in-progress': { bg: '#fef3c7', color: '#d97706' },
    completed: { bg: '#d1fae5', color: '#059669' },
    blocked: { bg: '#fed7d7', color: '#c53030' }
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
    <div className="w-full" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}>
      <div 
        className="border-t border-b overflow-hidden shadow-sm"
        style={{ 
          background: 'transparent',
          borderColor: '#DDD9C5'
        }}
      >
        {/* Header */}
        <div 
          className="px-6 py-5 border-b"
          style={{ 
            backgroundColor: '#FFFFFF',
            borderColor: '#DDD9C5'
          }}
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 
                className="text-2xl font-semibold mb-1"
                style={{ 
                  color: '#887D4E',
                  fontFamily: 'StyreneB, Styrene, sans-serif'
                }}
              >
                Task Management
              </h1>
              <p className="text-sm" style={{ color: '#A69A64' }}>
                Plan and track work before agent execution
              </p>
            </div>
            <Button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 text-white font-medium transition-all duration-200 hover:transform hover:-translate-y-1 hover:shadow-lg"
              style={{ 
                backgroundColor: '#B05730',
                borderRadius: '6px'
              }}
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
              </svg>
              Add New Task
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse" style={{ backgroundColor: '#FFFFFF' }}>
            <thead style={{ backgroundColor: '#F0EEE5', borderBottom: '2px solid #DDD9C5' }}>
              <tr>
                <th className="px-5 py-4 text-left text-sm font-semibold uppercase tracking-wide" style={{ color: '#887D4E', width: '120px' }}>
                  Date
                </th>
                <th className="px-5 py-4 text-left text-sm font-semibold uppercase tracking-wide" style={{ color: '#887D4E' }}>
                  Task
                </th>
                <th className="px-5 py-4 text-left text-sm font-semibold uppercase tracking-wide" style={{ color: '#887D4E', width: '140px' }}>
                  Status
                </th>
                <th className="px-5 py-4 text-center text-sm font-semibold uppercase tracking-wide" style={{ color: '#887D4E', width: '80px' }}>
                  Edit
                </th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task, index) => (
                <tr 
                  key={task.id} 
                  className="border-b transition-all duration-200 hover:bg-opacity-50"
                  style={{ 
                    borderColor: '#DDD9C5',
                    ':hover': { backgroundColor: '#F0EEE5' }
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F0EEE5'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td className="px-5 py-4">
                    <input
                      type="date"
                      value={task.date}
                      onChange={(e) => updateTask(task.id, 'date', e.target.value)}
                      readOnly={editingTask !== task.id}
                      className="bg-transparent border-none text-sm"
                      style={{
                        fontFamily: 'Fira Code, Fira Mono, Menlo, Consolas, monospace',
                        color: '#A69A64',
                        borderBottom: editingTask === task.id ? '2px solid #B05730' : '2px solid transparent',
                        transition: 'border-color 0.2s ease'
                      }}
                    />
                  </td>
                  <td className="px-5 py-4">
                    <input
                      type="text"
                      value={task.description}
                      onChange={(e) => updateTask(task.id, 'description', e.target.value)}
                      readOnly={editingTask !== task.id}
                      className="w-full bg-transparent border-none text-sm font-medium"
                      style={{
                        color: '#887D4E',
                        borderBottom: editingTask === task.id ? '2px solid #B05730' : '2px solid transparent',
                        transition: 'border-color 0.2s ease'
                      }}
                    />
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span 
                      className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide cursor-pointer transition-all duration-200"
                      style={{
                        backgroundColor: statusColors[task.status].bg,
                        color: statusColors[task.status].color
                      }}
                      onClick={() => toggleStatus(task.id)}
                    >
                      {statusLabels[task.status]}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <button
                      onClick={() => setEditingTask(editingTask === task.id ? null : task.id)}
                      className="p-2 rounded transition-all duration-200 hover:bg-opacity-80"
                      style={{ 
                        color: '#A69A64',
                        ':hover': { backgroundColor: '#F0EEE5', color: '#887D4E' }
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#F0EEE5';
                        e.currentTarget.style.color = '#887D4E';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#A69A64';
                      }}
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

        {/* Footer */}
        <div 
          className="px-6 py-4 border-t text-center"
          style={{ 
            backgroundColor: '#F0EEE5',
            borderColor: '#DDD9C5'
          }}
        >
          <div className="text-sm" style={{ color: '#A69A64' }}>
            Total <strong style={{ color: '#887D4E' }}>{counts.total}</strong> tasks | 
            Completed: <strong style={{ color: '#887D4E' }}>{counts.completed}</strong> | 
            In Progress: <strong style={{ color: '#887D4E' }}>{counts.inProgress}</strong> | 
            Pending: <strong style={{ color: '#887D4E' }}>{counts.pending}</strong> | 
            Blocked: <strong style={{ color: '#887D4E' }}>{counts.blocked}</strong>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl"
            style={{ backgroundColor: '#FFFFFF' }}
          >
            <div className="mb-5">
              <h2 
                className="text-xl font-semibold"
                style={{ 
                  color: '#887D4E',
                  fontFamily: 'StyreneB, Styrene, sans-serif'
                }}
              >
                Add New Task
              </h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#887D4E' }}>
                  Date
                </label>
                <input
                  type="date"
                  value={newTask.date}
                  onChange={(e) => setNewTask({ ...newTask, date: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  style={{ 
                    borderColor: '#DDD9C5',
                    backgroundColor: '#FFFFFF',
                    color: '#887D4E'
                  }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#887D4E' }}>
                  Task Description
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Enter task description..."
                  className="w-full px-3 py-2 border rounded-md text-sm resize-vertical min-h-[80px]"
                  style={{ 
                    borderColor: '#DDD9C5',
                    backgroundColor: '#FFFFFF',
                    color: '#887D4E'
                  }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#887D4E' }}>
                  Status
                </label>
                <select
                  value={newTask.status}
                  onChange={(e) => setNewTask({ ...newTask, status: e.target.value as Task['status'] })}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  style={{ 
                    borderColor: '#DDD9C5',
                    backgroundColor: '#FFFFFF',
                    color: '#887D4E'
                  }}
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 border rounded-md text-sm font-medium transition-all duration-200"
                style={{ 
                  borderColor: '#CBC4A4',
                  color: '#887D4E',
                  ':hover': { backgroundColor: '#F0EEE5' }
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F0EEE5'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                Cancel
              </button>
              <Button 
                onClick={addNewTask}
                className="px-5 py-2 text-white font-medium"
                style={{ backgroundColor: '#B05730' }}
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