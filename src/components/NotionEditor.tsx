import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Play, 
  Save, 
  Settings, 
  GitBranch, 
  FileText, 
  Zap,
  Code2,
  MessageSquare,
  Sparkles
} from 'lucide-react';

interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string;
  language: string;
}

interface NotionEditorProps {
  repository: Repository;
  onBack: () => void;
}

export function NotionEditor({ repository, onBack }: NotionEditorProps) {
  const [content, setContent] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: 'Code Review & Optimization',
      description: 'AI will review the codebase and suggest performance improvements',
      status: 'ready',
      estimatedTime: '5-10 min'
    },
    {
      id: 2,
      title: 'Documentation Generation',
      description: 'Generate comprehensive README and API documentation',
      status: 'ready',
      estimatedTime: '3-7 min'
    },
    {
      id: 3,
      title: 'Test Coverage Analysis',
      description: 'Analyze test coverage and suggest additional test cases',
      status: 'ready',
      estimatedTime: '8-12 min'
    }
  ]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [content]);

  const handleRunTask = (taskId: number) => {
    setIsRunning(true);
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, status: 'running' }
        : task
    ));

    // Simulate task completion
    setTimeout(() => {
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, status: 'completed' }
          : task
      ));
      setIsRunning(false);
    }, 3000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-blue-500';
      case 'running': return 'bg-yellow-500 animate-pulse';
      case 'completed': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ready': return 'Ready';
      case 'running': return 'Running...';
      case 'completed': return 'Completed';
      default: return 'Unknown';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Repositories
              </Button>
              <div className="h-6 w-px bg-border"></div>
              <div>
                <h1 className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <GitBranch className="w-5 h-5 text-cta-600" />
                  {repository.name}
                </h1>
                <p className="text-sm text-muted-foreground">{repository.full_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button size="sm">
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Editor Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Description */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-cta-600" />
                  <h2 className="text-lg font-semibold">Project Notes</h2>
                </div>
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Start writing your project notes, ideas, or instructions for AI assistance...

You can describe:
• What you want to build or improve
• Specific requirements or constraints
• Code patterns you prefer
• Testing strategies
• Documentation needs

The AI will use these notes to provide better assistance for your project."
                  className="w-full min-h-[200px] p-4 border border-border rounded-lg bg-background resize-none focus:outline-none focus:ring-2 focus:ring-cta-500 focus:border-transparent text-foreground placeholder:text-muted-foreground"
                  style={{ fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}
                />
              </CardContent>
            </Card>

            {/* Code Snippet */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-5 h-5 text-cta-600" />
                    <h2 className="text-lg font-semibold">Code Workspace</h2>
                  </div>
                  <Badge variant="secondary">{repository.language}</Badge>
                </div>
                <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm text-slate-100">
                  <div className="text-slate-400 mb-2">// AI-generated code will appear here</div>
                  <div className="text-green-400">function optimizePerformance() {`{`}</div>
                  <div className="text-slate-300 ml-4">// TODO: Implement optimization logic</div>
                  <div className="text-green-400">{`}`}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Task Panel */}
          <div className="space-y-6">
            {/* AI Tasks */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-cta-600" />
                  <h2 className="text-lg font-semibold">AI Tasks</h2>
                </div>
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div key={task.id} className="border border-border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-sm">{task.title}</h3>
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(task.status)}`}></div>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">{task.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{task.estimatedTime}</span>
                        <Button
                          size="sm"
                          variant={task.status === 'completed' ? 'secondary' : 'default'}
                          onClick={() => handleRunTask(task.id)}
                          disabled={isRunning || task.status === 'completed'}
                          className="text-xs h-7"
                        >
                          {task.status === 'completed' ? (
                            'Completed'
                          ) : task.status === 'running' ? (
                            'Running...'
                          ) : (
                            <>
                              <Play className="w-3 h-3 mr-1" />
                              Run
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-5 h-5 text-cta-600" />
                  <h2 className="text-lg font-semibold">Quick Actions</h2>
                </div>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                    <MessageSquare className="w-3 h-3 mr-2" />
                    Ask AI a Question
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                    <Code2 className="w-3 h-3 mr-2" />
                    Generate Boilerplate
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                    <FileText className="w-3 h-3 mr-2" />
                    Create Documentation
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Project Stats */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">Project Stats</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Language</span>
                    <span className="text-sm font-medium">{repository.language}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">AI Tasks Completed</span>
                    <span className="text-sm font-medium">
                      {tasks.filter(t => t.status === 'completed').length}/{tasks.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Session Time</span>
                    <span className="text-sm font-medium">12m 34s</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}