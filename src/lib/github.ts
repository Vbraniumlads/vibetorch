import { Octokit } from '@octokit/rest';
import { createAppAuth } from '@octokit/auth-app';

export interface GitHubUser {
  id: number;
  login: string;
  name: string;
  email: string;
  avatar_url: string;
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string;
  private: boolean;
  html_url: string;
  updated_at: string;
  language: string;
  stargazers_count: number;
  forks_count: number;
}

class GitHubService {
  private octokit: Octokit | null = null;
  private userToken: string | null = null;

  constructor() {
    this.initializeFromStorage();
  }

  private initializeFromStorage() {
    const token = localStorage.getItem('github_token');
    if (token) {
      this.userToken = token;
      this.octokit = new Octokit({
        auth: token,
      });
    }
  }

  public setUserToken(token: string) {
    this.userToken = token;
    localStorage.setItem('github_token', token);
    this.octokit = new Octokit({
      auth: token,
    });
  }

  public clearToken() {
    this.userToken = null;
    localStorage.removeItem('github_token');
    localStorage.removeItem('github_user');
    this.octokit = null;
  }

  public isAuthenticated(): boolean {
    return !!this.userToken && !!this.octokit;
  }

  public getLoginUrl(): string {
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    const redirectUri = `${window.location.origin}/auth/callback`;
    const scope = 'user:email,repo,read:org';
    const state = Math.random().toString(36).substring(7);
    
    localStorage.setItem('github_auth_state', state);
    
    return `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${state}`;
  }

  public async exchangeCodeForToken(code: string, state: string): Promise<string> {
    const storedState = localStorage.getItem('github_auth_state');
    if (state !== storedState) {
      throw new Error('Invalid state parameter');
    }

    localStorage.removeItem('github_auth_state');

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const response = await fetch(`${apiUrl}/api/auth/github`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for session
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to exchange code for token');
    }

    const { access_token, user } = await response.json();
    this.setUserToken(access_token);
    
    // Store user info
    localStorage.setItem('github_user', JSON.stringify(user));
    
    return access_token;
  }

  public async getCurrentUser(): Promise<GitHubUser> {
    if (!this.octokit) {
      throw new Error('Not authenticated');
    }

    const cachedUser = localStorage.getItem('github_user');
    if (cachedUser) {
      return JSON.parse(cachedUser);
    }

    const { data } = await this.octokit.rest.users.getAuthenticated();
    const user: GitHubUser = {
      id: data.id,
      login: data.login,
      name: data.name || data.login,
      email: data.email || '',
      avatar_url: data.avatar_url,
    };

    localStorage.setItem('github_user', JSON.stringify(user));
    return user;
  }

  public async getUserRepositories(): Promise<GitHubRepository[]> {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const response = await fetch(`${apiUrl}/api/github/repositories`, {
      method: 'GET',
      credentials: 'include', // Include cookies for session
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch repositories');
    }

    const { repositories } = await response.json();
    return repositories;
  }

  public async getRepository(owner: string, repo: string): Promise<GitHubRepository> {
    if (!this.octokit) {
      throw new Error('Not authenticated');
    }

    const { data } = await this.octokit.rest.repos.get({
      owner,
      repo,
    });

    return {
      id: data.id,
      name: data.name,
      full_name: data.full_name,
      description: data.description || '',
      private: data.private,
      html_url: data.html_url,
      updated_at: data.updated_at,
      language: data.language || 'Unknown',
      stargazers_count: data.stargazers_count,
      forks_count: data.forks_count,
    };
  }
}

export const githubService = new GitHubService();