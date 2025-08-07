import { Router, Request, Response } from 'express';
import { githubRepositoriesService } from '../services/githubRepositoriesService.js';
import { repositoryService } from '../services/repositoryService';
import jwt from 'jsonwebtoken';
import { GitHubRepositoryData } from '../db/models/Repository';

const router = Router();

// Get user repositories from database
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authorization header is required' });
      return;
    }

    // Extract JWT token and get user ID
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret') as any;
    const userId = decoded.userId;

    if (!userId) {
      res.status(401).json({ error: 'Invalid token: user ID not found' });
      return;
    }

    // Get repositories from database
    const repositories = await repositoryService.findByUserId(userId);

    res.json(repositories);

  } catch (error) {
    console.error('❌ Error in repositories endpoint:', error);

    if (error instanceof Error) {
      if (error.message.includes('jwt')) {
        res.status(401).json({ error: 'Invalid or expired token' });
        return;
      }

      res.status(500).json({
        error: 'Failed to fetch repositories',
        message: error.message
      });
      return;
    }

    res.status(500).json({ error: 'Internal server error' });
  }
});

// Sync repositories from GitHub API to database
router.post('/sync', async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authorization header is required' });
      return;
    }

    // Extract JWT token and get user ID
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret') as any;
    const userId = decoded.userId;

    if (!userId) {
      res.status(401).json({ error: 'Invalid token: user ID not found' });
      return;
    }

    // Fetch repositories from GitHub API
    const githubRepos = await githubRepositoriesService.fetchRepositories(authHeader, {
      per_page: 100, // Get more repos in one call
      type: 'owner', // Only user's own repos
      sort: 'updated',
      direction: 'desc'
    });

    // Sync each repository to database
    const syncedRepos = [];
    for (const githubRepo of githubRepos.repositories) {
      const syncedRepo = await repositoryService.upsert(userId, githubRepo.id, {
        repo_name: githubRepo.name,
        repo_url: githubRepo.html_url,
        description: githubRepo.description || ''
      });
      syncedRepos.push(syncedRepo);
    }

    res.json({
      message: `Successfully synced ${syncedRepos.length} repositories`,
      repositories: syncedRepos
    });

  } catch (error) {
    console.error('❌ Error in repository sync endpoint:', error);

    if (error instanceof Error) {
      if (error.message.includes('jwt')) {
        res.status(401).json({ error: 'Invalid or expired token' });
        return;
      }
      if (error.message.includes('authentication failed')) {
        res.status(401).json({ error: 'GitHub authentication failed. Please re-authenticate.' });
        return;
      }
      if (error.message.includes('rate limit')) {
        res.status(429).json({ error: 'GitHub API rate limit exceeded. Please try again later.' });
        return;
      }

      res.status(500).json({
        error: 'Failed to sync repositories',
        message: error.message
      });
      return;
    }

    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a specific repository
router.get('/:owner/:repo', async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const { owner, repo } = req.params;

    if (!owner || !repo) {
      res.status(400).json({ error: 'Owner and repository name are required' });
      return;
    }

    const repository = await githubRepositoriesService.fetchRepository(authHeader, owner, repo);

    res.json(repository);

  } catch (error) {
    console.error(`❌ Error fetching repository ${req.params.owner}/${req.params.repo}:`, error);

    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
        return;
      }
      if (error.message.includes('authentication failed')) {
        res.status(401).json({ error: 'GitHub authentication failed. Please re-authenticate.' });
        return;
      }
      if (error.message.includes('Insufficient permissions')) {
        res.status(403).json({ error: error.message });
        return;
      }

      res.status(500).json({
        error: 'Failed to fetch repository',
        message: error.message
      });
      return;
    }

    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search repositories
router.get('/search/:query', async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const { query } = req.params;

    if (!query || query.trim().length === 0) {
      res.status(400).json({ error: 'Search query is required' });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const per_page = Math.min(parseInt(req.query.per_page as string) || 30, 100);
    const sort = (req.query.sort as 'stars' | 'forks' | 'help-wanted-issues' | 'updated') || 'updated';
    const order = (req.query.order as 'asc' | 'desc') || 'desc';

    const result = await githubRepositoriesService.searchRepositories(authHeader, query, {
      page,
      per_page,
      sort,
      order,
    });

    res.json(result);

  } catch (error) {
    console.error('❌ Error in repository search endpoint:', error);

    if (error instanceof Error) {
      if (error.message.includes('Invalid search query')) {
        res.status(422).json({ error: 'Invalid search query' });
        return;
      }
      if (error.message.includes('authentication failed')) {
        res.status(401).json({ error: 'GitHub authentication failed. Please re-authenticate.' });
        return;
      }
      if (error.message.includes('rate limit')) {
        res.status(429).json({ error: 'GitHub API rate limit exceeded. Please try again later.' });
        return;
      }

      res.status(500).json({
        error: 'Failed to search repositories',
        message: error.message
      });
      return;
    }

    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as repositoriesRouter };