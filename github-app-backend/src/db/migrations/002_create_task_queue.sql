-- Create task_queue table for job processing
CREATE TABLE IF NOT EXISTS task_queue (
  id SERIAL PRIMARY KEY,
  repo_id INTEGER REFERENCES repositories(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  priority INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'queued' CHECK(status IN ('queued', 'running', 'succeeded', 'failed', 'canceled')),
  payload JSONB,
  result JSONB,
  error TEXT,
  created_by INTEGER NOT NULL,
  attempt INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  dedupe_key TEXT,
  claimed_by TEXT,
  claimed_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  finished_at TIMESTAMP WITH TIME ZONE,
  not_before_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_task_queue_status_priority_created ON task_queue(status, priority, created_at);
CREATE INDEX IF NOT EXISTS idx_task_queue_repo_id_created ON task_queue(repo_id, created_at);
CREATE INDEX IF NOT EXISTS idx_task_queue_dedupe_key ON task_queue(dedupe_key) WHERE dedupe_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_task_queue_claimed_by ON task_queue(claimed_by) WHERE claimed_by IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_task_queue_not_before ON task_queue(not_before_at);
CREATE INDEX IF NOT EXISTS idx_task_queue_created_by ON task_queue(created_by);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_task_queue_updated_at BEFORE UPDATE
    ON task_queue FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create task_events table for audit trail (optional observability)
CREATE TABLE IF NOT EXISTS task_events (
  id SERIAL PRIMARY KEY,
  task_id INTEGER NOT NULL REFERENCES task_queue(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_task_events_task_id ON task_events(task_id);
CREATE INDEX IF NOT EXISTS idx_task_events_created_at ON task_events(created_at);