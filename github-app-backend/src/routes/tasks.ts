import express from 'express';
import { taskQueueService } from '../services/taskQueueService.js';
import { TaskCreateInput, TaskQueryOptions } from '../db/models/TaskQueue.js';
import { sanitizeTask, sanitizeTasks, sanitizeTaskEvents } from '../utils/sanitizer.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const taskData: TaskCreateInput = {
      repo_id: req.body.repo_id,
      type: req.body.type,
      priority: req.body.priority,
      payload: req.body.payload,
      created_by: req.body.created_by || 1, // TODO: Get from auth
      max_attempts: req.body.max_attempts,
      dedupe_key: req.body.dedupe_key,
      not_before_at: req.body.not_before_at
    };

    if (!taskData.repo_id || !taskData.type || !taskData.created_by) {
      return res.status(400).json({
        error: 'Missing required fields: repo_id, type, created_by'
      });
    }

    const task = await taskQueueService.createTask(taskData);
    return res.status(201).json(task);
  } catch (error: any) {
    console.error('Error creating task:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const repoId = req.query.repo_id ? parseInt(req.query.repo_id as string) : undefined;
    const createdBy = req.query.created_by ? parseInt(req.query.created_by as string) : undefined;
    
    const options: TaskQueryOptions = {
      ...(repoId && { repo_id: repoId }),
      ...(req.query.status && { status: req.query.status as any }),
      ...(req.query.type && { type: req.query.type as string }),
      ...(createdBy && { created_by: createdBy }),
      limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
      offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
      order_by: req.query.order_by as any || 'created_at',
      order_direction: req.query.order_direction as any || 'desc'
    };

    const tasks = await taskQueueService.findTasks(options);
    
    // Sanitize tasks using the utility function
    const sanitizedTasks = sanitizeTasks(tasks);
    
    return res.json(sanitizedTasks);
  } catch (error: any) {
    console.error('Error fetching tasks:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const task = await taskQueueService.findById(id);
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Sanitize task using the utility function
    const sanitized = sanitizeTask(task);

    return res.json(sanitized);
  } catch (error: any) {
    console.error('Error fetching task:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.get('/:id/status', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const task = await taskQueueService.findById(id);
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Sanitize the task first
    const sanitized = sanitizeTask(task);

    // Return simplified status response with sanitized data
    return res.json({
      id: sanitized.id,
      status: sanitized.status,
      type: sanitized.type,
      priority: sanitized.priority,
      created_at: sanitized.created_at,
      started_at: sanitized.started_at,
      finished_at: sanitized.finished_at,
      attempt: sanitized.attempt,
      max_attempts: sanitized.max_attempts,
      result: sanitized.result,
      error: sanitized.error
    });
  } catch (error: any) {
    console.error('Error fetching task status:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { action } = req.body;

    if (action === 'cancel') {
      const task = await taskQueueService.cancelTask(id);
      if (!task) {
        return res.status(400).json({ error: 'Task cannot be canceled or not found' });
      }
      return res.json(task);
    }

    return res.status(400).json({ error: 'Invalid action' });
  } catch (error: any) {
    console.error('Error updating task:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.get('/:id/events', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const events = await taskQueueService.getTaskEvents(id);
    
    // Sanitize events to remove sensitive information
    const sanitizedEvents = sanitizeTaskEvents(events);
    
    return res.json(sanitizedEvents);
  } catch (error: any) {
    console.error('Error fetching task events:', error);
    return res.status(500).json({ error: error.message });
  }
});

export { router as tasksRouter };