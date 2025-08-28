import express from 'express';
import { taskQueueService } from '../services/taskQueueService.js';
import { WorkerPullOptions } from '../db/models/TaskQueue.js';

const router = express.Router();

const WORKER_TOKEN = process.env.WORKER_TOKEN || 'default-worker-token';

function authenticateWorker(req: express.Request, res: express.Response, next: express.NextFunction): void {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token || token !== WORKER_TOKEN) {
    res.status(401).json({ error: 'Invalid worker token' });
    return;
  }
  
  next();
}

router.post('/pull', authenticateWorker, async (req, res) => {
  try {
    const options: WorkerPullOptions = {
      types: req.body.types,
      claimed_by: req.body.worker_id || 'unknown-worker',
      limit: req.body.limit || 1
    };

    if (!options.claimed_by) {
      return res.status(400).json({ error: 'worker_id is required' });
    }

    const tasks = await taskQueueService.pullTasksForWorker(options);
    return res.json({ tasks });
  } catch (error: any) {
    console.error('Error pulling tasks for worker:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.post('/tasks/:id/heartbeat', authenticateWorker, async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const workerId = req.body.worker_id;

    if (!workerId) {
      return res.status(400).json({ error: 'worker_id is required' });
    }

    const success = await taskQueueService.heartbeat(taskId, workerId);
    
    if (!success) {
      return res.status(400).json({ error: 'Failed to update heartbeat - task not found or not owned by worker' });
    }

    return res.json({ success: true });
  } catch (error: any) {
    console.error('Error updating task heartbeat:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.post('/tasks/:id/succeed', authenticateWorker, async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const workerId = req.body.worker_id;
    const result = req.body.result;

    if (!workerId) {
      return res.status(400).json({ error: 'worker_id is required' });
    }

    const task = await taskQueueService.markTaskSucceeded(taskId, workerId, result);
    
    if (!task) {
      return res.status(400).json({ error: 'Failed to mark task as succeeded - task not found or not owned by worker' });
    }

    return res.json(task);
  } catch (error: any) {
    console.error('Error marking task as succeeded:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.post('/tasks/:id/fail', authenticateWorker, async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const workerId = req.body.worker_id;
    const error = req.body.error || 'Task failed without error message';
    const shouldRetry = req.body.retry !== false;

    if (!workerId) {
      return res.status(400).json({ error: 'worker_id is required' });
    }

    const task = await taskQueueService.markTaskFailed(taskId, workerId, error, shouldRetry);
    
    if (!task) {
      return res.status(400).json({ error: 'Failed to mark task as failed - task not found or not owned by worker' });
    }

    return res.json(task);
  } catch (error: any) {
    console.error('Error marking task as failed:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.get('/metrics', authenticateWorker, async (req, res) => {
  try {
    const repoId = req.query.repo_id ? parseInt(req.query.repo_id as string) : undefined;
    const metrics = await taskQueueService.getMetrics(repoId);
    return res.json(metrics);
  } catch (error: any) {
    console.error('Error fetching metrics:', error);
    return res.status(500).json({ error: error.message });
  }
});

export { router as workersRouter };