import { Router, Request, Response } from 'express';
import { taskQueueService } from '../services/taskQueueService.js';
import { WorkerPullRequest, TaskHeartbeat, TaskCompletion } from '../db/models/TaskQueue.js';

const router = Router();

// Middleware to validate worker authentication
const validateWorkerAuth = (req: Request, res: Response, next: Function) => {
  const authHeader = req.headers.authorization;
  const workerToken = process.env.WORKER_TOKEN;
  
  if (!workerToken) {
    res.status(500).json({ error: 'Worker authentication not configured' });
    return;
  }
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid authorization header' });
    return;
  }
  
  const token = authHeader.substring(7);
  if (token !== workerToken) {
    res.status(401).json({ error: 'Invalid worker token' });
    return;
  }
  
  next();
};

// Apply worker authentication to all worker routes
router.use(validateWorkerAuth);

// POST /worker/pull - Pull next available task
router.post('/pull', async (req: Request, res: Response) => {
  try {
    const pullRequest: WorkerPullRequest = {
      worker_id: req.body.worker_id,
      task_types: req.body.task_types,
      lease_duration_ms: req.body.lease_duration_ms
    };

    if (!pullRequest.worker_id) {
      res.status(400).json({ error: 'worker_id is required' });
      return;
    }

    const task = await taskQueueService.pullTask(pullRequest);
    
    if (!task) {
      res.status(204).send(); // No tasks available
      return;
    }

    res.json({ task });
  } catch (error) {
    console.error('Error pulling task:', error);
    res.status(500).json({ error: 'Failed to pull task' });
  }
});

// POST /worker/tasks/:id/heartbeat - Send heartbeat to extend lease
router.post('/tasks/:id/heartbeat', async (req: Request, res: Response) => {
  try {
    const taskId = parseInt(req.params.id);
    if (isNaN(taskId)) {
      res.status(400).json({ error: 'Invalid task ID' });
      return;
    }

    const heartbeat: TaskHeartbeat = {
      worker_id: req.body.worker_id,
      lease_extension_ms: req.body.lease_extension_ms
    };

    if (!heartbeat.worker_id) {
      res.status(400).json({ error: 'worker_id is required' });
      return;
    }

    const success = await taskQueueService.heartbeat(taskId, heartbeat);
    
    if (!success) {
      res.status(404).json({ error: 'Task not found or not owned by worker' });
      return;
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error sending heartbeat:', error);
    res.status(500).json({ error: 'Failed to send heartbeat' });
  }
});

// POST /worker/tasks/:id/succeed - Mark task as succeeded
router.post('/tasks/:id/succeed', async (req: Request, res: Response) => {
  try {
    const taskId = parseInt(req.params.id);
    if (isNaN(taskId)) {
      res.status(400).json({ error: 'Invalid task ID' });
      return;
    }

    const completion: TaskCompletion = {
      worker_id: req.body.worker_id,
      result: req.body.result
    };

    if (!completion.worker_id) {
      res.status(400).json({ error: 'worker_id is required' });
      return;
    }

    const task = await taskQueueService.completeTask(taskId, completion);
    
    if (!task) {
      res.status(404).json({ error: 'Task not found or not owned by worker' });
      return;
    }

    res.json({ task });
  } catch (error) {
    console.error('Error marking task as succeeded:', error);
    res.status(500).json({ error: 'Failed to complete task' });
  }
});

// POST /worker/tasks/:id/fail - Mark task as failed
router.post('/tasks/:id/fail', async (req: Request, res: Response) => {
  try {
    const taskId = parseInt(req.params.id);
    if (isNaN(taskId)) {
      res.status(400).json({ error: 'Invalid task ID' });
      return;
    }

    const completion: TaskCompletion = {
      worker_id: req.body.worker_id,
      error: req.body.error,
      result: req.body.result // Optional partial results
    };

    if (!completion.worker_id) {
      res.status(400).json({ error: 'worker_id is required' });
      return;
    }

    const task = await taskQueueService.completeTask(taskId, completion);
    
    if (!task) {
      res.status(404).json({ error: 'Task not found or not owned by worker' });
      return;
    }

    res.json({ task });
  } catch (error) {
    console.error('Error marking task as failed:', error);
    res.status(500).json({ error: 'Failed to complete task' });
  }
});

// GET /worker/health - Health check for workers
router.get('/health', (_req: Request, res: Response) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString() 
  });
});

export { router as workerRouter };