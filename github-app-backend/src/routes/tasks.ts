import { Router, Request, Response } from 'express';
import { taskQueueService } from '../services/taskQueueService.js';
import { TaskCreateInput, TaskListFilters } from '../db/models/TaskQueue.js';

const router = Router();

// GET /tasks/metrics - Get task queue metrics (must come before /:id route)
router.get('/metrics', async (req: Request, res: Response) => {
  try {
    const metrics = await taskQueueService.getMetrics();
    res.json({ metrics });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

// GET /tasks - List tasks
router.get('/', async (req: Request, res: Response) => {
  try {
    const filters: TaskListFilters = {};
    
    if (req.query.repo_id) {
      filters.repo_id = parseInt(req.query.repo_id as string);
    }
    if (req.query.status) {
      filters.status = req.query.status as any;
    }
    if (req.query.type) {
      filters.type = req.query.type as string;
    }
    if (req.query.created_by) {
      filters.created_by = parseInt(req.query.created_by as string);
    }
    if (req.query.limit) {
      filters.limit = parseInt(req.query.limit as string);
    }
    if (req.query.offset) {
      filters.offset = parseInt(req.query.offset as string);
    }

    const tasks = await taskQueueService.findTasks(filters);
    res.json({ tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// GET /tasks/:id - Get specific task
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid task ID' });
      return;
    }

    const task = await taskQueueService.findById(id);
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    // Get task events for detailed view
    const events = await taskQueueService.getTaskEvents(id);

    res.json({ task, events });
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

// POST /tasks - Create new task
router.post('/', async (req: Request, res: Response) => {
  try {
    const taskData: TaskCreateInput = {
      repo_id: req.body.repo_id,
      type: req.body.type,
      priority: req.body.priority,
      payload: req.body.payload,
      created_by: req.body.created_by, // TODO: Extract from auth token
      max_attempts: req.body.max_attempts,
      dedupe_key: req.body.dedupe_key,
      not_before_at: req.body.not_before_at
    };

    // Basic validation
    if (!taskData.repo_id || !taskData.type || !taskData.created_by) {
      res.status(400).json({ 
        error: 'Missing required fields: repo_id, type, created_by' 
      });
      return;
    }

    const task = await taskQueueService.createTask(taskData);
    res.status(201).json({ task });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// PATCH /tasks/:id - Update task (mainly for canceling)
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid task ID' });
      return;
    }

    // For now, only support canceling tasks
    if (req.body.status === 'canceled') {
      const userId = req.body.user_id; // TODO: Extract from auth token
      if (!userId) {
        res.status(400).json({ error: 'User ID required for cancellation' });
        return;
      }

      const task = await taskQueueService.cancelTask(id, userId);
      if (!task) {
        res.status(404).json({ 
          error: 'Task not found or cannot be canceled (must be queued and owned by user)' 
        });
        return;
      }

      res.json({ task });
    } else {
      res.status(400).json({ error: 'Only status=canceled is supported' });
      return;
    }
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

export { router as tasksRouter };