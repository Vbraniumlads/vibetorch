import express from 'express';
import { taskQueueService } from '../services/taskQueueService.js';

const router = express.Router();

router.get('/tasks/stream', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  res.write('data: {"type":"connected","message":"Task event stream connected"}\n\n');

  const listenerId = `sse-${Date.now()}-${Math.random()}`;
  
  taskQueueService.onTaskUpdate(listenerId, (task) => {
    const eventData = {
      type: 'task_updated',
      task: task,
      timestamp: new Date().toISOString()
    };
    
    res.write(`data: ${JSON.stringify(eventData)}\n\n`);
  });

  const heartbeat = setInterval(() => {
    res.write('data: {"type":"heartbeat","timestamp":"' + new Date().toISOString() + '"}\n\n');
  }, 30000);

  req.on('close', () => {
    taskQueueService.removeTaskUpdateListener(listenerId);
    clearInterval(heartbeat);
    console.log('SSE client disconnected:', listenerId);
  });

  req.on('error', (err) => {
    console.error('SSE error:', err);
    taskQueueService.removeTaskUpdateListener(listenerId);
    clearInterval(heartbeat);
  });
});

export { router as eventsRouter };