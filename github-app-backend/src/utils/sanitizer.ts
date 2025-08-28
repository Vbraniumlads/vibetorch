/**
 * Utility functions for sanitizing sensitive data before sending to frontend
 */

const SENSITIVE_KEYS = [
  'claude_oauth_token',
  'github_app_private_key',
  'private_key',
  'access_token',
  'refresh_token',
  'api_key',
  'secret',
  'password',
  'token',
  'authorization'
];

/**
 * Deep sanitize an object by removing sensitive keys
 */
export function sanitizeObject(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  // Handle objects
  if (typeof obj === 'object') {
    const sanitized: any = {};
    
    for (const key in obj) {
      // Check if key contains any sensitive patterns
      const lowerKey = key.toLowerCase();
      const isSensitive = SENSITIVE_KEYS.some(sensitiveKey => 
        lowerKey.includes(sensitiveKey)
      );

      if (!isSensitive) {
        // Recursively sanitize nested objects
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    
    return sanitized;
  }

  // Return primitive values as-is
  return obj;
}

/**
 * Sanitize task data specifically
 */
export function sanitizeTask(task: any): any {
  if (!task) return task;

  const sanitized = { ...task };

  // Sanitize payload
  if (sanitized.payload) {
    sanitized.payload = sanitizePayload(sanitized.payload);
  }

  // Sanitize result
  if (sanitized.result) {
    sanitized.result = sanitizeObject(sanitized.result);
  }

  return sanitized;
}

/**
 * Sanitize task payload specifically
 */
export function sanitizePayload(payload: any): any {
  if (!payload) return payload;

  const sanitized = { ...payload };
  
  // Handle task_data field specifically
  if (sanitized.task_data) {
    const { 
      claude_oauth_token,
      github_app_private_key,
      ...safeTaskData 
    } = sanitized.task_data;
    sanitized.task_data = safeTaskData;
  }

  // Recursively sanitize other fields
  for (const key in sanitized) {
    if (key !== 'task_data') {
      sanitized[key] = sanitizeObject(sanitized[key]);
    }
  }

  return sanitized;
}

/**
 * Sanitize task events
 */
export function sanitizeTaskEvent(event: any): any {
  if (!event) return event;

  const sanitized = { ...event };

  // Sanitize event_data
  if (sanitized.event_data) {
    sanitized.event_data = sanitizeObject(sanitized.event_data);
  }

  return sanitized;
}

/**
 * Sanitize an array of tasks
 */
export function sanitizeTasks(tasks: any[]): any[] {
  return tasks.map(task => sanitizeTask(task));
}

/**
 * Sanitize an array of task events
 */
export function sanitizeTaskEvents(events: any[]): any[] {
  return events.map(event => sanitizeTaskEvent(event));
}