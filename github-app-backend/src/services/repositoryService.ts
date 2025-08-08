import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Repository, RepositoryCreateInput, RepositoryUpdateInput } from '../db/models/Repository.js';
import type { GitHubRepository, Todo } from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class RepositoryService {
  private db: Database.Database;

  constructor() {
    const dbPath = path.join(__dirname, '../db/database.sqlite');
    this.db = new Database(dbPath);
    this.initDatabase();
  }

  private initDatabase(): void {
    // Run migrations
    const migrationPath = path.join(__dirname, '../db/migrations/001_create_repositories.sql');
    if (fs.existsSync(migrationPath)) {
      const migration = fs.readFileSync(migrationPath, 'utf8');
      this.db.exec(migration);
    }
  }

  async findByUserId(userId: number): Promise<Repository[]> {
    const stmt = this.db.prepare(`
      SELECT * FROM repositories 
      WHERE user_id = ?
      ORDER BY last_synced_at DESC
    `);
    return stmt.all(userId) as Repository[];
  }

  async findByUserIdAndGithubId(userId: number, githubRepoId: number): Promise<Repository | null> {
    const stmt = this.db.prepare(`
      SELECT * FROM repositories 
      WHERE user_id = ? AND github_repo_id = ?
    `);
    const result = stmt.get(userId, githubRepoId) as Repository | undefined;
    return result || null;
  }

  async create(data: RepositoryCreateInput): Promise<Repository> {
    const now = new Date().toISOString();
    const stmt = this.db.prepare(`
      INSERT INTO repositories (
        user_id, github_repo_id, repo_name, repo_url, description, 
        last_synced_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      data.user_id,
      data.github_repo_id,
      data.repo_name,
      data.repo_url,
      data.description || null,
      now,
      now,
      now
    );

    return this.findById(Number(result.lastInsertRowid))!;
  }

  async update(id: number, data: RepositoryUpdateInput): Promise<Repository | null> {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.repo_name !== undefined) {
      updates.push('repo_name = ?');
      values.push(data.repo_name);
    }
    if (data.repo_url !== undefined) {
      updates.push('repo_url = ?');
      values.push(data.repo_url);
    }
    if (data.description !== undefined) {
      updates.push('description = ?');
      values.push(data.description);
    }
    if (data.last_synced_at !== undefined) {
      updates.push('last_synced_at = ?');
      values.push(data.last_synced_at);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    updates.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(id);

    const stmt = this.db.prepare(`
      UPDATE repositories 
      SET ${updates.join(', ')}
      WHERE id = ?
    `);

    stmt.run(...values);
    return this.findById(id);
  }

  async upsert(userId: number, githubRepoId: number, data: Omit<RepositoryCreateInput, 'user_id' | 'github_repo_id'>): Promise<Repository> {
    const existing = await this.findByUserIdAndGithubId(userId, githubRepoId);

    if (existing) {
      const updated = await this.update(existing.id, {
        ...data,
        last_synced_at: new Date().toISOString()
      });
      if (!updated) {
        throw new Error('Failed to update repository record');
      }
      return updated;
    } else {
      return this.create({
        user_id: userId,
        github_repo_id: githubRepoId,
        ...data
      });
    }
  }

  async deleteByUserId(userId: number): Promise<void> {
    const stmt = this.db.prepare('DELETE FROM repositories WHERE user_id = ?');
    stmt.run(userId);
  }

  private findById(id: number): Repository | null {
    const stmt = this.db.prepare('SELECT * FROM repositories WHERE id = ?');
    const result = stmt.get(id) as Repository | undefined;
    return result || null;
  }

  close(): void {
    this.db.close();
  }

  /**
   * Create an implementation repository based on a parsed todo.
   *
   * NOTE: This is a minimal placeholder to satisfy current webhook flow.
   * It logs intent and can be expanded to actually create a repo, scaffold
   * files, and persist metadata. Keeping the signature stable for callers.
   */
  async createImplementationRepo(
    _github: any,
    sourceRepository: GitHubRepository,
    todo: Todo
  ): Promise<void> {
    const summary = todo.text?.slice(0, 120) || 'implementation task';
    console.log(
      `🧱 [repositoryService] Requested implementation repo for "${summary}" from ${sourceRepository.full_name}`
    );
    // Future: use Octokit to create repo and store record in SQLite
  }
}

export const repositoryService = new RepositoryService();