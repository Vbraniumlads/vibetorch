import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, GitBranch, Star, Eye, Clock, Folder } from 'lucide-react';
import { useAuth } from "@/contexts/AuthContext";

interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string;
  private: boolean;
  stargazers_count: number;
  watchers_count: number;
  language: string;
  updated_at: string;
  html_url: string;
  clone_url: string;
}

interface RepositoryGalleryProps {
  onRepositorySelect: (repo: Repository) => void;
}

export function RepositoryGallery({ onRepositorySelect }: RepositoryGalleryProps) {
  const { user } = useAuth();
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [filteredRepos, setFilteredRepos] = useState<Repository[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data for demonstration - replace with actual GitHub API call
  useEffect(() => {
    const fetchRepositories = async () => {
      try {
        setIsLoading(true);
        // TODO: Replace with actual GitHub API call
        // const response = await fetch(`https://api.github.com/users/${user?.username}/repos`);
        // const data = await response.json();
        
        // Mock data for now
        const mockRepos: Repository[] = [
          {
            id: 1,
            name: "ai-coding-assistant",
            full_name: `${user?.username}/ai-coding-assistant`,
            description: "AI-powered coding assistant that helps with code generation and optimization",
            private: false,
            stargazers_count: 42,
            watchers_count: 15,
            language: "TypeScript",
            updated_at: "2024-01-15T10:30:00Z",
            html_url: "https://github.com/example/ai-coding-assistant",
            clone_url: "https://github.com/example/ai-coding-assistant.git"
          },
          {
            id: 2,
            name: "data-pipeline",
            full_name: `${user?.username}/data-pipeline`,
            description: "ETL pipeline for processing large datasets with real-time analytics",
            private: true,
            stargazers_count: 18,
            watchers_count: 8,
            language: "Python",
            updated_at: "2024-01-12T14:20:00Z",
            html_url: "https://github.com/example/data-pipeline",
            clone_url: "https://github.com/example/data-pipeline.git"
          },
          {
            id: 3,
            name: "react-dashboard",
            full_name: `${user?.username}/react-dashboard`,
            description: "Modern dashboard built with React, TypeScript, and Tailwind CSS",
            private: false,
            stargazers_count: 127,
            watchers_count: 34,
            language: "React",
            updated_at: "2024-01-10T09:15:00Z",
            html_url: "https://github.com/example/react-dashboard",
            clone_url: "https://github.com/example/react-dashboard.git"
          },
          {
            id: 4,
            name: "blockchain-explorer",
            full_name: `${user?.username}/blockchain-explorer`,
            description: "Blockchain explorer with transaction tracking and analytics",
            private: false,
            stargazers_count: 89,
            watchers_count: 22,
            language: "JavaScript",
            updated_at: "2024-01-08T16:45:00Z",
            html_url: "https://github.com/example/blockchain-explorer",
            clone_url: "https://github.com/example/blockchain-explorer.git"
          },
          {
            id: 5,
            name: "ml-model-api",
            full_name: `${user?.username}/ml-model-api`,
            description: "REST API for serving machine learning models in production",
            private: true,
            stargazers_count: 56,
            watchers_count: 12,
            language: "Python",
            updated_at: "2024-01-05T11:30:00Z",
            html_url: "https://github.com/example/ml-model-api",
            clone_url: "https://github.com/example/ml-model-api.git"
          },
          {
            id: 6,
            name: "mobile-app",
            full_name: `${user?.username}/mobile-app`,
            description: "Cross-platform mobile app built with React Native",
            private: false,
            stargazers_count: 73,
            watchers_count: 19,
            language: "React Native",
            updated_at: "2024-01-03T13:20:00Z",
            html_url: "https://github.com/example/mobile-app",
            clone_url: "https://github.com/example/mobile-app.git"
          }
        ];
        
        setRepositories(mockRepos);
        setFilteredRepos(mockRepos);
      } catch (err) {
        setError('Failed to fetch repositories');
        console.error('Error fetching repositories:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchRepositories();
    }
  }, [user]);

  // Filter repositories based on search query
  useEffect(() => {
    const filtered = repositories.filter(repo =>
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.language?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredRepos(filtered);
  }, [searchQuery, repositories]);

  const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      'TypeScript': 'bg-blue-500',
      'JavaScript': 'bg-yellow-500',
      'Python': 'bg-green-500',
      'React': 'bg-cyan-500',
      'React Native': 'bg-purple-500',
      'Java': 'bg-orange-500',
      'Go': 'bg-indigo-500',
    };
    return colors[language] || 'bg-gray-500';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cta-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Your Repositories
        </h1>
        <p className="text-muted-foreground">
          Select a repository to start coding with AI assistance
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <input
          type="text"
          placeholder="Search repositories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-cta-500 focus:border-transparent"
        />
      </div>

      {/* Repository Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRepos.map((repo) => (
          <Card 
            key={repo.id}
            className="hover:shadow-lg transition-all duration-200 cursor-pointer border-border/50 hover:border-cta-500/50 group"
            onClick={() => onRepositorySelect(repo)}
          >
            <CardContent className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Folder className="w-5 h-5 text-cta-600" />
                  <h3 className="font-semibold text-foreground group-hover:text-cta-600 transition-colors truncate">
                    {repo.name}
                  </h3>
                </div>
                {repo.private && (
                  <Badge variant="secondary" className="text-xs">
                    Private
                  </Badge>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2 h-10">
                {repo.description || 'No description available'}
              </p>

              {/* Language & Stats */}
              <div className="flex items-center justify-between mb-4">
                {repo.language && (
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getLanguageColor(repo.language)}`}></div>
                    <span className="text-sm text-muted-foreground">{repo.language}</span>
                  </div>
                )}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    <span>{repo.stargazers_count}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span>{repo.watchers_count}</span>
                  </div>
                </div>
              </div>

              {/* Updated */}
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>Updated {formatDate(repo.updated_at)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No results */}
      {filteredRepos.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Folder className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No repositories found</p>
        </div>
      )}
      </div>
    </div>
  );
}