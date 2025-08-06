import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import TaskManagement from "./TaskManagement";
import { useAuth } from "@/contexts/AuthContext";
import { GitHubConnectButton } from "./GitHubConnectButton";
import { toast } from 'sonner';
import { githubService } from "../features/github/services/github.service";
import type { GitHubRepository } from "../features/github/types/github.types";

const VibetorchDashboard: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [sliderMode, setSliderMode] = useState(0); // 0: Maintainer, 1: Off, 2: Pioneer
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState(50); // Temporary position during drag
  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showGlow, setShowGlow] = useState(false);
  const [showFillAnimation, setShowFillAnimation] = useState(false);
  
  const sliderRef = useRef<HTMLDivElement>(null);

  const modes = [
    { name: 'Maintainer', desc: 'Let the AI maintain your repositories', pos: 0 },
    { name: 'Off', desc: 'AI agent is disabled for all repositories', pos: 50 },
    { name: 'Pioneer', desc: 'AI suggests new features, architecture improvements, and innovations', pos: 100 }
  ];

  // Fetch repositories on component mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchRepositories();
    }
  }, [isAuthenticated]);

  const fetchRepositories = async () => {
    try {
      setIsLoading(true);
      const repos = await githubService.getRepositories();
      setRepositories(repos);
    } catch (error) {
      console.error('Failed to fetch repositories:', error);
      toast.error('Failed to load repositories');
    } finally {
      setIsLoading(false);
    }
  };

  const syncRepositories = async () => {
    try {
      setIsLoading(true);
      const result = await githubService.syncRepositories();
      setRepositories(result.repositories);
      toast.success(result.message);
    } catch (error) {
      console.error('Failed to sync repositories:', error);
      toast.error('Failed to sync repositories');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging && sliderRef.current) {
        const rect = sliderRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
        setDragPosition(percentage);
      }
    };

    const handleGlobalMouseUp = () => {
      if (isDragging && sliderRef.current) {
        let closestIndex = 0;
        let minDistance = Math.abs(dragPosition - modes[0].pos);
        
        modes.forEach((mode, index) => {
          const distance = Math.abs(dragPosition - mode.pos);
          if (distance < minDistance) {
            minDistance = distance;
            closestIndex = index;
          }
        });
        
        updateSliderMode(closestIndex);
        setDragPosition(modes[closestIndex].pos);
      }
      setIsDragging(false);
    };

    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (isDragging && sliderRef.current) {
        const rect = sliderRef.current.getBoundingClientRect();
        const x = e.touches[0].clientX - rect.left;
        const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
        setDragPosition(percentage);
      }
    };

    const handleGlobalTouchEnd = () => {
      if (isDragging && sliderRef.current) {
        let closestIndex = 0;
        let minDistance = Math.abs(dragPosition - modes[0].pos);
        
        modes.forEach((mode, index) => {
          const distance = Math.abs(dragPosition - mode.pos);
          if (distance < minDistance) {
            minDistance = distance;
            closestIndex = index;
          }
        });
        
        updateSliderMode(closestIndex);
        setDragPosition(modes[closestIndex].pos);
      }
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      document.addEventListener('touchmove', handleGlobalTouchMove);
      document.addEventListener('touchend', handleGlobalTouchEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchmove', handleGlobalTouchMove);
      document.removeEventListener('touchend', handleGlobalTouchEnd);
    };
  }, [isDragging, dragPosition, modes]);

  // Sync dragPosition with sliderMode when not dragging
  useEffect(() => {
    if (!isDragging) {
      setDragPosition(modes[sliderMode].pos);
    }
  }, [sliderMode, isDragging, modes]);

  // Initialize slider position to center (Off mode) on component mount
  useEffect(() => {
    setSliderMode(1); // Set to Off mode (center position)
    setDragPosition(50);
  }, []);

  const updateSliderMode = (index: number) => {
    setSliderMode(index);
    
    // Show fill animation first, then glow effect
    if (index !== 1) { // Only show animation for non-center positions
      setShowFillAnimation(true);
      setTimeout(() => {
        setShowFillAnimation(false);
      }, 800); // Animation duration
    }
    
    // Add glow effect after 0.5 seconds when positioned at 0, 1, or 2
    setTimeout(() => {
      setShowGlow(true);
      // Remove glow after 1 second
      setTimeout(() => {
        setShowGlow(false);
      }, 1000);
    }, 500);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    if (sliderRef.current) {
      const rect = sliderRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setDragPosition(percentage);
    }
    e.preventDefault();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    if (sliderRef.current) {
      const rect = sliderRef.current.getBoundingClientRect();
      const x = e.touches[0].clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setDragPosition(percentage);
    }
    e.preventDefault();
  };

  const getLanguageColor = (language: string) => {
    const colors = {
      'TypeScript': 'bg-blue-500',
      'Python': 'bg-green-500', 
      'JavaScript': 'bg-yellow-500',
      'Swift': 'bg-orange-500',
      'Go': 'bg-cyan-500'
    };
    return colors[language as keyof typeof colors] || 'bg-gray-500';
  };

  const getActivityStatus = (lastSynced: string) => {
    const lastSyncedDate = new Date(lastSynced);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - lastSyncedDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'active';
    if (diffInDays <= 7) return 'maintenance';
    return 'archived';
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      'active': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'maintenance': 'bg-amber-100 text-amber-800 border-amber-200',
      'archived': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return badges[status as keyof typeof badges] || badges.active;
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    
    if (diffInDays > 30) return `${Math.floor(diffInDays / 30)} month${Math.floor(diffInDays / 30) > 1 ? 's' : ''} ago`;
    if (diffInDays > 0) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    if (diffInHours > 0) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  return (
    <div className="h-full font-body p-8 pt-[20px] space-y-8 w-[90%] mx-auto pt-40">
      {/* Mode Selection Slider */}
      <div className="w-full">
        <div className="rounded-lg p-6 bg-background text-center w-[60%] mx-auto">
          <h1 className="text-xl font-display font-bold mb-2 pb-6 text-foreground">
            Agent Vibe Mode
          </h1>
          
          <div className="mb-6">
            
            <div className="relative mb-4">
              <div 
                ref={sliderRef}
                className="h-1.5 bg-muted rounded-full relative cursor-pointer"
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
              >
                {/* Semi-transparent circles at both ends */}
                <div className="w-4 h-4 bg-muted rounded-full absolute top-[-5px] left-0 transform -translate-x-1/2" />
                <div className="w-4 h-4 bg-muted rounded-full absolute top-[-5px] right-0 transform translate-x-1/2" />
                
                {/* Fill from center to slider position with animation */}
                <div 
                  className={`h-full bg-foreground rounded-full absolute top-0 ${
                    showFillAnimation ? 'animate-pulse' : ''
                  }`}
                  style={{
                    left: sliderMode === 1 ? '50%' : `${Math.min(50, isDragging ? dragPosition : modes[sliderMode].pos)}%`,
                    width: sliderMode === 1 ? '0%' : `${Math.abs((isDragging ? dragPosition : modes[sliderMode].pos) - 50)}%`,
                    transition: isDragging ? 'none' : showFillAnimation ? 'all 0.8s ease-out' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: showFillAnimation ? 'scaleY(1.2)' : 'scaleY(1)',
                    transformOrigin: 'center'
                  }}
                />
                <div 
                  className={`w-8 h-8 border-2 border-foreground rounded-full absolute top-[-13px] cursor-grab transform -translate-x-1/2 transition-all duration-300 ${
                    showGlow ? 'shadow-lg shadow-foreground/50 animate-pulse' : ''
                  }`}
                  style={{ 
                    left: `${isDragging ? dragPosition : modes[sliderMode].pos}%`,
                    transition: isDragging ? 'none' : 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: showGlow ? '0 0 20px rgba(var(--foreground), 0.6), 0 0 40px rgba(var(--foreground), 0.3)' : undefined
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setIsDragging(true);
                    setDragPosition(modes[sliderMode].pos);
                    e.preventDefault();
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation();
                    setIsDragging(true);
                    setDragPosition(modes[sliderMode].pos);
                    e.preventDefault();
                  }}
                />
              </div>
            </div>
            
            <div className="flex justify-center text-xs mb-4 pt-3 text-muted-foreground">
              <span className={`${sliderMode !== 1 ? 'font-bold' : 'text-muted-foreground'} text-foreground text-2xl`}>
                {modes[sliderMode].name}
              </span>
            </div>
            
            <div className="text-sm leading-relaxed text-center text-muted-foreground h-12 flex items-center justify-center">
              {modes[sliderMode].desc}
            </div>
          </div>
        </div>
      </div>

      {/* Repository Gallery */}
      <div className="w-full">
        <div className="rounded-lg bg-background">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-display font-semibold text-foreground">
                  Your Repositories
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {repositories.length} repositories • Agent mode: {modes[sliderMode].name}
                </p>
              </div>
              <button 
                onClick={syncRepositories} 
                disabled={isLoading}
                className="px-4 py-2 text-sm bg-muted hover:bg-muted-foreground/20 text-foreground rounded-md transition-colors"
              >
                {isLoading ? 'Syncing...' : 'Sync Repos'}
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cta-500"></div>
                <span className="ml-3 text-muted-foreground">Loading repositories...</span>
              </div>
            ) : repositories.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-12 h-12 mx-auto text-muted-foreground mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <p className="text-muted-foreground mb-4">No repositories found</p>
                <button onClick={syncRepositories} className="px-4 py-2 text-sm bg-muted hover:bg-muted-foreground/20 text-foreground rounded-md transition-colors">
                  Sync Repositories
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {repositories.map((repo) => {
                  const activityStatus = getActivityStatus(repo.last_synced_at);
                  return (
                    <Card key={repo.id} className="hover:shadow-md transition-all duration-200 cursor-pointer group border-border">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <div 
                              className={`w-3 h-3 rounded-full ${
                                sliderMode === 0 ? 'bg-amber-500' : 
                                sliderMode === 1 ? 'bg-muted-foreground' : 
                                'bg-violet-500'
                              }`}
                            />
                            <h3 className="font-medium text-foreground group-hover:text-cta-600 transition-colors text-sm">
                              {repo.repo_name}
                            </h3>
                          </div>
                          <div className="flex items-center space-x-1">
                            <a 
                              href={repo.repo_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                              </svg>
                            </a>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 h-10">
                          {repo.description || 'No description available'}
                        </p>
                        
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-gray-500" />
                            <span className="text-xs text-muted-foreground">GitHub</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            ID: {repo.id}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className={`text-xs px-2 py-1 rounded-full border font-medium ${getStatusBadge(activityStatus)}`}>
                            {activityStatus}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(repo.last_synced_at)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VibetorchDashboard;