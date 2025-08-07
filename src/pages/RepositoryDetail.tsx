import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, GitBranch, GitPullRequest, AlertCircle, Plus, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { githubService } from '../features/github/services/github.service';
import type { GitHubRepository, GitHubIssue, GitHubPullRequest } from '../features/github/types/github.types';
import { toast } from 'sonner';

interface RepositoryDetailParams {
  owner: string;
  repo: string;
}

export default function RepositoryDetail() {
  const { owner, repo } = useParams<RepositoryDetailParams>();
  const navigate = useNavigate();
  
  const [repository, setRepository] = useState<GitHubRepository | null>(null);
  const [issues, setIssues] = useState<GitHubIssue[]>([]);
  const [pullRequests, setPullRequests] = useState<GitHubPullRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isCreateIssueOpen, setIsCreateIssueOpen] = useState(false);
  const [newIssue, setNewIssue] = useState({
    title: '',
    description: '',
    labels: ''
  });
  const [isCreatingIssue, setIsCreatingIssue] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!owner || !repo) return;
      
      setIsLoading(true);
      try {
        const [repoData, issuesData, prsData] = await Promise.all([
          githubService.getRepository(owner, repo),
          githubService.getRepositoryIssues(owner, repo),
          githubService.getRepositoryPullRequests(owner, repo)
        ]);
        
        setRepository(repoData);
        setIssues(issuesData);
        setPullRequests(prsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load repository data');
        toast.error('Failed to load repository data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [owner, repo]);

  const handleCreateIssue = async () => {
    if (!owner || !repo || !newIssue.title.trim() || !newIssue.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsCreatingIssue(true);
    try {
      const labels = newIssue.labels ? newIssue.labels.split(',').map(l => l.trim()).filter(Boolean) : [];
      const createdIssue = await githubService.createIssue(owner, repo, {
        title: newIssue.title,
        description: newIssue.description,
        labels
      });
      
      setIssues(prev => [createdIssue, ...prev]);
      setNewIssue({ title: '', description: '', labels: '' });
      setIsCreateIssueOpen(false);
      toast.success('Issue created successfully by vibe-torch bot!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create issue';
      toast.error(errorMessage);
    } finally {
      setIsCreatingIssue(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neu-0 to-neu-500 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-neu-600 rounded w-1/4"></div>
            <div className="h-32 bg-neu-600 rounded"></div>
            <div className="h-64 bg-neu-600 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !repository) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neu-0 to-neu-500 p-6">
        <div className="max-w-6xl mx-auto">
          <Card className="bg-status-error/10 border-status-error">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 text-status-error">
                <AlertCircle className="w-6 h-6" />
                <span className="text-lg font-medium">{error || 'Repository not found'}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neu-0 to-neu-500 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-neu-900">
              {owner}/{repo}
            </h1>
            {repository.description && (
              <p className="text-neu-700 mt-1">{repository.description}</p>
            )}
          </div>
          <Button
            variant="outline"
            onClick={() => window.open(repository.repo_url, '_blank')}
            className="ml-auto"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View on GitHub
          </Button>
        </div>

        {/* Stats Card */}
        <Card className="bg-gradient-to-r from-white to-neu-500 border border-neu-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-cta-500" />
                  <span className="font-medium">{issues.length} Issues</span>
                </div>
                <div className="flex items-center gap-2">
                  <GitPullRequest className="w-5 h-5 text-acc-500" />
                  <span className="font-medium">{pullRequests.length} Pull Requests</span>
                </div>
              </div>
              
              <Dialog open={isCreateIssueOpen} onOpenChange={setIsCreateIssueOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-cta-500 hover:bg-cta-600 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Task
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-neu-0 border-neu-600">
                  <DialogHeader>
                    <DialogTitle className="text-neu-900">Create New Task</DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title" className="text-neu-800">Title *</Label>
                      <Input
                        id="title"
                        value={newIssue.title}
                        onChange={(e) => setNewIssue(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter task title..."
                        className="border-neu-600 focus:border-cta-500"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="description" className="text-neu-800">Description *</Label>
                      <Textarea
                        id="description"
                        value={newIssue.description}
                        onChange={(e) => setNewIssue(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe the task... vibe-torch bot will generate a GitHub issue"
                        rows={4}
                        className="border-neu-600 focus:border-cta-500"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="labels" className="text-neu-800">Labels (optional)</Label>
                      <Input
                        id="labels"
                        value={newIssue.labels}
                        onChange={(e) => setNewIssue(prev => ({ ...prev, labels: e.target.value }))}
                        placeholder="bug, enhancement, feature (comma-separated)"
                        className="border-neu-600 focus:border-cta-500"
                      />
                    </div>
                    
                    <div className="flex justify-end gap-3 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setIsCreateIssueOpen(false)}
                        disabled={isCreatingIssue}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleCreateIssue}
                        disabled={isCreatingIssue || !newIssue.title.trim() || !newIssue.description.trim()}
                        className="bg-cta-500 hover:bg-cta-600 text-white"
                      >
                        {isCreatingIssue ? 'Creating...' : 'Create Issue'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Issues and PRs */}
        <Tabs defaultValue="issues" className="w-full">
          <TabsList className="bg-neu-600 text-neu-900">
            <TabsTrigger value="issues" className="data-[state=active]:bg-cta-500 data-[state=active]:text-white">
              Issues ({issues.length})
            </TabsTrigger>
            <TabsTrigger value="pulls" className="data-[state=active]:bg-acc-500 data-[state=active]:text-white">
              Pull Requests ({pullRequests.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="issues" className="space-y-4">
            {issues.length === 0 ? (
              <Card className="bg-gradient-to-r from-white to-neu-500 border border-neu-600">
                <CardContent className="p-8 text-center">
                  <AlertCircle className="w-12 h-12 text-neu-700 mx-auto mb-4" />
                  <p className="text-neu-700">No issues found</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {issues.map(issue => (
                  <Card key={issue.id} className="bg-gradient-to-r from-white to-neu-500 border border-neu-600 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-neu-900 hover:text-cta-600">
                              <a href={issue.html_url} target="_blank" rel="noopener noreferrer">
                                #{issue.number} {issue.title}
                              </a>
                            </h3>
                            <Badge 
                              variant={issue.state === 'open' ? 'default' : 'secondary'}
                              className={issue.state === 'open' ? 'bg-status-success text-white' : 'bg-neu-700 text-neu-0'}
                            >
                              {issue.state}
                            </Badge>
                          </div>
                          
                          {issue.labels.length > 0 && (
                            <div className="flex gap-2 mb-2">
                              {issue.labels.map(label => (
                                <Badge 
                                  key={label.name}
                                  variant="outline"
                                  style={{ backgroundColor: `#${label.color}20`, borderColor: `#${label.color}` }}
                                  className="text-xs"
                                >
                                  {label.name}
                                </Badge>
                              ))}
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2 text-sm text-neu-700">
                            <span>opened by {issue.user.login}</span>
                            <span>•</span>
                            <span>{new Date(issue.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        <Button
                          variant="ghost"
                          onClick={() => window.open(issue.html_url, '_blank')}
                          className="p-2"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="pulls" className="space-y-4">
            {pullRequests.length === 0 ? (
              <Card className="bg-gradient-to-r from-white to-neu-500 border border-neu-600">
                <CardContent className="p-8 text-center">
                  <GitPullRequest className="w-12 h-12 text-neu-700 mx-auto mb-4" />
                  <p className="text-neu-700">No pull requests found</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {pullRequests.map(pr => (
                  <Card key={pr.id} className="bg-gradient-to-r from-white to-neu-500 border border-neu-600 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-neu-900 hover:text-acc-600">
                              <a href={pr.html_url} target="_blank" rel="noopener noreferrer">
                                #{pr.number} {pr.title}
                              </a>
                            </h3>
                            <Badge 
                              variant={pr.state === 'open' ? 'default' : 'secondary'}
                              className={
                                pr.state === 'open' ? 'bg-status-success text-white' :
                                pr.state === 'merged' ? 'bg-acc-500 text-white' :
                                'bg-neu-700 text-neu-0'
                              }
                            >
                              {pr.state}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-neu-700 mb-2">
                            <GitBranch className="w-4 h-4" />
                            <span>{pr.head.ref} → {pr.base.ref}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-neu-700">
                            <span>opened by {pr.user.login}</span>
                            <span>•</span>
                            <span>{new Date(pr.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        <Button
                          variant="ghost"
                          onClick={() => window.open(pr.html_url, '_blank')}
                          className="p-2"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}