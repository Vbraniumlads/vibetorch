-- Create task queue table with all required fields
CREATE TABLE IF NOT EXISTS task_queue (
  id SERIAL PRIMARY KEY,
  repo_id INTEGER NOT NULL REFERENCES repositories(id),
  type VARCHAR(100) NOT NULL,
  priority INTEGER DEFAULT 0,
  status VARCHAR(20) NOT NULL CHECK(status IN ('queued', 'running', 'succeeded', 'failed', 'canceled')),
  payload JSONB,
  result JSONB,
  error TEXT,
  created_by INTEGER NOT NULL,
  attempt INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  dedupe_key VARCHAR(255),
  claimed_by VARCHAR(255),
  claimed_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  finished_at TIMESTAMP WITH TIME ZONE,
  not_before_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_task_queue_status_priority_created ON task_queue(status, priority DESC, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_task_queue_repo_created ON task_queue(repo_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_task_queue_dedupe_key ON task_queue(dedupe_key) WHERE dedupe_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_task_queue_claimed_by ON task_queue(claimed_by) WHERE claimed_by IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_task_queue_not_before ON task_queue(not_before_at) WHERE status = 'queued';

-- Create unique constraint on dedupe_key to ensure idempotency
CREATE UNIQUE INDEX IF NOT EXISTS idx_task_queue_dedupe_unique ON task_queue(dedupe_key) WHERE dedupe_key IS NOT NULL AND status NOT IN ('succeeded', 'failed', 'canceled');

-- Create task_events table for audit trail
CREATE TABLE IF NOT EXISTS task_events (
  id SERIAL PRIMARY KEY,
  task_id INTEGER NOT NULL REFERENCES task_queue(id),
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_task_events_task_id ON task_events(task_id);
CREATE INDEX IF NOT EXISTS idx_task_events_created ON task_events(created_at DESC);

-- Create trigger to automatically update updated_at for task_queue
CREATE TRIGGER update_task_queue_updated_at BEFORE UPDATE
    ON task_queue FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to log task events
CREATE OR REPLACE FUNCTION log_task_event()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO task_events (task_id, event_type, event_data)
        VALUES (NEW.id, 'created', row_to_json(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status != NEW.status THEN
            INSERT INTO task_events (task_id, event_type, event_data)
            VALUES (NEW.id, 'status_changed', json_build_object(
                'old_status', OLD.status,
                'new_status', NEW.status,
                'attempt', NEW.attempt
            ));
        END IF;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Create trigger to log task events
CREATE TRIGGER log_task_queue_events
    AFTER INSERT OR UPDATE ON task_queue
    FOR EACH ROW EXECUTE FUNCTION log_task_event();