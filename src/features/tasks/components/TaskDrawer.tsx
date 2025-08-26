import React, { useState, useEffect } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from '../../../components/ui/drawer';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { 
  X, 
  Clock, 
  User, 
  Hash, 
  AlertTriangle,
  CheckCircle2,
  Play,
  Calendar,
  Database,
  Code,
  Activity,
  ExternalLink
} from 'lucide-react';
import { Task, TaskEvent, TASK_STATUS_COLORS } from '../types/task.types';
import { taskService } from '../services/task.service';

interface TaskDrawerProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onCancelTask: (id: number) => void;
}

export function TaskDrawer({ task, isOpen, onClose, onCancelTask }: TaskDrawerProps) {
  const [events, setEvents] = useState<TaskEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  useEffect(() => {
    if (task && isOpen) {
      loadTaskEvents();
    }
  }, [task, isOpen]);

  const loadTaskEvents = async () => {
    if (!task) return;
    
    setLoadingEvents(true);
    try {
      const taskEvents = await taskService.getTaskEvents(task.id);
      setEvents(taskEvents);
    } catch (error) {
      console.error('Failed to load task events:', error);
    } finally {
      setLoadingEvents(false);
    }
  };

  if (!task) return null;

  const formatTaskType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getStatusIcon = (status: Task['status']) => {
    const iconProps = { size: 16 };
    
    switch (status) {
      case 'queued':
        return <Clock {...iconProps} className="text-blue-600" />;
      case 'running':
        return <Play {...iconProps} className="text-yellow-600" />;
      case 'succeeded':
        return <CheckCircle2 {...iconProps} className="text-green-600" />;
      case 'failed':
        return <AlertTriangle {...iconProps} className="text-red-600" />;
      case 'canceled':
        return <X {...iconProps} className="text-gray-600" />;
    }
  };

  const formatDuration = (startTime?: string, endTime?: string) => {
    if (!startTime) return '—';
    
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const durationMs = end.getTime() - start.getTime();
    
    if (durationMs < 1000) return '<1s';
    if (durationMs < 60000) return `${Math.round(durationMs / 1000)}s`;
    if (durationMs < 3600000) return `${Math.round(durationMs / 60000)}m`;
    return `${Math.round(durationMs / 3600000)}h`;
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <div className="flex items-center justify-between">
            <DrawerTitle className="flex items-center space-x-3">
              {getStatusIcon(task.status)}
              <span>Task #{task.id}</span>
              <Badge className={TASK_STATUS_COLORS[task.status]}>
                {task.status}
              </Badge>
            </DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" size="sm">
                <X size={16} />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>
        
        <div className="px-6 pb-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="payload">Payload</TabsTrigger>
              <TabsTrigger value="result">Result</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium flex items-center">
                      <Database size={16} className="mr-2" />
                      Task Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Type:</span>
                      <span className="text-sm font-medium">{formatTaskType(task.type)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Priority:</span>
                      <span className="text-sm font-medium">{task.priority}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Attempts:</span>
                      <span className="text-sm font-medium">{task.attempt}/{task.max_attempts}</span>
                    </div>
                    {task.dedupe_key && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Dedupe Key:</span>
                        <span className="text-sm font-mono text-gray-800 truncate max-w-32" title={task.dedupe_key}>
                          {task.dedupe_key}
                        </span>
                      </div>
                    )}
                    {task.claimed_by && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Worker:</span>
                        <span className="text-sm font-mono text-gray-800">{task.claimed_by}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium flex items-center">
                      <Clock size={16} className="mr-2" />
                      Timing
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Created:</span>
                      <span className="text-sm" title={format(new Date(task.created_at), 'PPpp')}>
                        {formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    {task.started_at && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Started:</span>
                        <span className="text-sm" title={format(new Date(task.started_at), 'PPpp')}>
                          {formatDistanceToNow(new Date(task.started_at), { addSuffix: true })}
                        </span>
                      </div>
                    )}
                    {task.finished_at && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Finished:</span>
                        <span className="text-sm" title={format(new Date(task.finished_at), 'PPpp')}>
                          {formatDistanceToNow(new Date(task.finished_at), { addSuffix: true })}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Duration:</span>
                      <span className="text-sm font-medium">
                        {formatDuration(task.started_at, task.finished_at)}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {task.repository && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium flex items-center">
                        <Hash size={16} className="mr-2" />
                        Repository
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-3">
                        {task.repository.owner?.avatar_url && (
                          <img
                            src={task.repository.owner.avatar_url}
                            alt=""
                            className="w-6 h-6 rounded-full"
                          />
                        )}
                        <span className="font-medium">{task.repository.repo_name}</span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {task.error && (
                  <Card className="border-red-200">
                    <CardHeader>
                      <CardTitle className="text-sm font-medium flex items-center text-red-800">
                        <AlertTriangle size={16} className="mr-2" />
                        Error
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-sm text-red-700 whitespace-pre-wrap bg-red-50 p-3 rounded">
                        {task.error}
                      </pre>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="mt-6 flex justify-between">
                <div></div>
                <div className="space-x-2">
                  {task.status === 'queued' && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onCancelTask(task.id)}
                    >
                      <X size={16} className="mr-2" />
                      Cancel Task
                    </Button>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="payload" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Code size={16} className="mr-2" />
                    Task Payload
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {task.payload ? (
                    <ScrollArea className="h-96">
                      <pre className="text-sm bg-gray-50 p-4 rounded overflow-x-auto">
                        {JSON.stringify(task.payload, null, 2)}
                      </pre>
                    </ScrollArea>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No payload data
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="result" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center">
                    <CheckCircle2 size={16} className="mr-2" />
                    Task Result
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {task.result ? (
                    <ScrollArea className="h-96">
                      <pre className="text-sm bg-gray-50 p-4 rounded overflow-x-auto">
                        {JSON.stringify(task.result, null, 2)}
                      </pre>
                    </ScrollArea>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No result data yet
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="events" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Activity size={16} className="mr-2" />
                    Task Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingEvents ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                    </div>
                  ) : events.length > 0 ? (
                    <ScrollArea className="h-96">
                      <div className="space-y-3">
                        {events.map((event) => (
                          <div key={event.id} className="border-l-2 border-gray-200 pl-4 pb-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium capitalize">
                                {event.event_type.replace(/_/g, ' ')}
                              </span>
                              <span className="text-xs text-gray-500">
                                {format(new Date(event.created_at), 'MMM d, HH:mm:ss')}
                              </span>
                            </div>
                            {event.event_data && (
                              <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                                {JSON.stringify(event.event_data, null, 2)}
                              </pre>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No events recorded
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DrawerContent>
    </Drawer>
  );
}