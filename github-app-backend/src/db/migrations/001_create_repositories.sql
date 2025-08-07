-- Create repositories table
CREATE TABLE IF NOT EXISTS repositories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  github_repo_id INTEGER NOT NULL, -- GitHub's repository ID
  repo_name TEXT NOT NULL,
  repo_url TEXT NOT NULL,
  description TEXT,
  last_synced_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, github_repo_id) -- Prevent duplicate repos per user
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_repositories_user_id ON repositories(user_id);
CREATE INDEX IF NOT EXISTS idx_repositories_last_synced ON repositories(last_synced_at);