export interface Todo {
  text: string;
  completed: boolean;
  line: number;
  priority: 'low' | 'normal' | 'medium' | 'high';
  tags: string[];
  claudeMentioned: boolean;
}

export interface ProjectIdea {
  type: 'project' | 'task';
  description: string;
  originalText: string;
}

export interface ProjectSuggestion {
  project: {
    name: string;
    description: string;
    features: string[];
    technology: string;
  };
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  owner: {
    login: string;
    id: number;
  };
}

export interface GitHubIssue {
  number: number;
  title: string;
  body: string | null;
  html_url: string;
  user: {
    login: string;
  };
}

export interface GitHubInstallation {
  id: number;
  account: {
    login: string;
    id: number;
  };
}

export interface WebhookPayload {
  action?: string;
  repository: GitHubRepository;
  installation: GitHubInstallation;
  issue?: GitHubIssue;
  commits?: Array<{
    added?: string[];
    modified?: string[];
    removed?: string[];
  }>;
}

export interface ClaudeRequest {
  type: 'implementation' | 'explanation' | 'review' | 'help' | 'general';
  details: any;
}

export interface ImplementationDetails {
  features: string[];
  technology: string | null;
  requirements: string[];
}

export interface ExplanationDetails {
  topic: string;
  level: 'basic' | 'intermediate' | 'advanced';
}

export interface ReviewDetails {
  codeRef: string | null;
  focusAreas: string[];
}

export interface ProjectFiles {
  [filePath: string]: string;
}

export interface AppConfig {
  githubAppId: string;
  githubPrivateKey: string;
  githubWebhookSecret: string;
  port: number;
  nodeEnv: string;
  claudeApiKey: string | undefined;
}

// GitHub Octokit instance type with REST API
export interface OctokitInstance {
  rest: {
    repos: {
      getContent: (params: any) => Promise<any>;
      createForAuthenticatedUser: (params: any) => Promise<any>;
      createOrUpdateFileContents: (params: any) => Promise<any>;
    };
    issues: {
      createComment: (params: any) => Promise<any>;
      create: (params: any) => Promise<any>;
    };
  };
}