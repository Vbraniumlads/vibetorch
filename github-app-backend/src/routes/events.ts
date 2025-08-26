import { Router, Request, Response } from 'express';
import { taskQueueService } from '../services/taskQueueService.js';
import { TaskQueue } from '../db/models/TaskQueue.js';

const router = Router();

interface SSEConnection {
  id: string;
  response: Response;
  userId?: number | undefined;
  repoId?: number | undefined;
}

const connections = new Map<string, SSEConnection>();

// Setup SSE connection
function setupSSE(res: Response): void {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  // Send initial connection event
  res.write('data: {"type":"connected"}\n\n');
}

function sendEvent(connectionId: string, eventType: string, data: any): void {
  const connection = connections.get(connectionId);
  if (!connection) return;

  try {
    const event = {
      type: eventType,
      data,
      timestamp: new Date().toISOString()
    };
    
    connection.response.write(`data: ${JSON.stringify(event)}\n\n`);
  } catch (error) {
    console.error('Error sending SSE event:', error);
    // Remove dead connection
    connections.delete(connectionId);
  }
}

function broadcastTaskUpdate(task: TaskQueue): void {
  connections.forEach((connection, connectionId) => {
    // Filter events based on user's access
    if (connection.repoId && connection.repoId !== task.repo_id) {
      return; // Skip if connection is filtered to a different repo
    }
    
    sendEvent(connectionId, 'task_updated', task);
  });
}

// Initialize task update listener
taskQueueService.onTaskUpdated(broadcastTaskUpdate);

// GET /events - SSE endpoint for real-time task updates
router.get('/', (req: Request, res: Response) => {
  const connectionId = Math.random().toString(36).substring(7);
  const userId = req.query.user_id ? parseInt(req.query.user_id as string) : undefined;
  const repoId = req.query.repo_id ? parseInt(req.query.repo_id as string) : undefined;
  
  setupSSE(res);
  
  const connection: SSEConnection = {
    id: connectionId,
    response: res,
    userId,
    repoId
  };
  
  connections.set(connectionId, connection);
  
  console.log(`SSE client connected: ${connectionId}, userId: ${userId}, repoId: ${repoId}`);

  // Handle client disconnect
  req.on('close', () => {
    console.log(`SSE client disconnected: ${connectionId}`);
    connections.delete(connectionId);
  });

  // Send heartbeat every 30 seconds to keep connection alive
  const heartbeatInterval = setInterval(() => {
    if (connections.has(connectionId)) {
      sendEvent(connectionId, 'heartbeat', { timestamp: new Date().toISOString() });
    } else {
      clearInterval(heartbeatInterval);
    }
  }, 30000);
});

// POST /events/test - Test endpoint to send events (development only)
if (process.env.NODE_ENV === 'development') {
  router.post('/test', (req: Request, res: Response) => {
    const { event_type, data } = req.body;
    
    connections.forEach((connection, connectionId) => {
      sendEvent(connectionId, event_type || 'test', data || { message: 'Test event' });
    });
    
    res.json({ 
      message: 'Test event sent',
      connections: connections.size 
    });
  });
}

// GET /events/stats - Get SSE connection stats
router.get('/stats', (req: Request, res: Response) => {
  const stats = {
    total_connections: connections.size,
    connections_by_repo: {} as Record<string, number>,
    connections_by_user: {} as Record<string, number>
  };

  connections.forEach(connection => {
    if (connection.repoId) {
      const repoKey = connection.repoId.toString();
      stats.connections_by_repo[repoKey] = (stats.connections_by_repo[repoKey] || 0) + 1;
    }
    
    if (connection.userId) {
      const userKey = connection.userId.toString();
      stats.connections_by_user[userKey] = (stats.connections_by_user[userKey] || 0) + 1;
    }
  });

  res.json(stats);
});

export { router as eventsRouter };