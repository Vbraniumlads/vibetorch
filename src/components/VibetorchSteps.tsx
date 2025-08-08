import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import TaskManagement from "./TaskManagement";
import { useAuth } from "@/contexts/AuthContext";
import { GitHubConnectButton } from "./GitHubConnectButton";
import { toast } from 'sonner';

const VibetorchSteps: React.FC = () => {
  const { login } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [sliderMode, setSliderMode] = useState(1); // 0: Off, 1: Maintainer, 2: Visionary, 3: Both
  const [isConnecting, setIsConnecting] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState(33.33); // Temporary position during drag
  const [tasks, setTasks] = useState([
    {
      repo: 'my-awesome-project',
      status: 'running',
      description: 'Analyzing code patterns and suggesting performance optimizations for the main data processing pipeline',
      tokens: '2.1K',
      time: '5 min ago',
      cost: '$0.84'
    },
    {
      repo: 'data-pipeline-tool',
      status: 'completed',
      description: 'Fixed memory leak in batch processing function. Reduced memory usage by 40%',
      tokens: '4.2K',
      time: '23 min ago',
      cost: '$1.68'
    },
    {
      repo: 'my-awesome-project',
      status: 'pending',
      description: 'Code review requested: Update error handling in authentication module',
      tokens: 'Est. 1.5K',
      time: 'Pending',
      cost: '~$0.60'
    }
  ]);

  const stepRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];
  const sliderRef = useRef<HTMLDivElement>(null);

  const modes = [
    { name: 'Off', desc: 'AI agent is disabled for all repositories', pos: 0 },
    { name: 'Maintainer', desc: 'AI focuses on code maintenance, bug fixes, and optimization tasks', pos: 33.33 },
    { name: 'Visionary', desc: 'AI suggests new features, architecture improvements, and innovations', pos: 66.66 },
    { name: 'Both', desc: 'Full AI capabilities: maintenance + visionary features combined', pos: 100 }
  ];

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
  }, [isDragging, dragPosition]);

  // Sync dragPosition with sliderMode when not dragging
  useEffect(() => {
    if (!isDragging) {
      setDragPosition(modes[sliderMode].pos);
    }
  }, [sliderMode, isDragging]);

  const scrollToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
    stepRefs[stepIndex].current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'center'
    });
  };

  const handleGitHubConnect = () => {
    setIsConnecting(true);
    // The actual OAuth will be handled by GitHubLoginButton
  };

  const handleLoginSuccess = async (token: string, user: any) => {
    try {
      await login(token, user); // Use the new auth system
      setIsConnecting(false);
      setShowGreeting(true);
      
      // Show greeting for 2 seconds, then trigger left panel slide-out
      setTimeout(() => {
        setIsConnected(true);
        
        // Navigate to task management after left panel animation completes
        setTimeout(() => {
          scrollToStep(2); // Jump to task management step
        }, 1000); // Wait for slide-out animation to complete
      }, 2000); // Show greeting for 2 seconds
    } catch (error) {
      console.error('Login failed:', error);
      setIsConnecting(false);
      toast.error('Login failed. Please try again.');
    }
  };


  const handleModeStart = () => {
    setTimeout(() => scrollToStep(2), 1000);
  };

  const updateSliderMode = (index: number) => {
    setSliderMode(index);
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

  const refreshTasks = () => {
    const newTask = {
      repo: 'data-pipeline-tool',
      status: 'running',
      description: 'Refactoring database connection pooling for better concurrent performance',
      tokens: '1.8K',
      time: 'Just now',
      cost: '$0.72'
    };
    setTasks([newTask, ...tasks]);
  };

  return (
    <div className="h-full font-body">
      {/* Step 1: GitHub Login */}
      <div 
        ref={stepRefs[0]}
        className="flex items-center justify-center p-8"
        style={{ 
          height: '100vh',
          scrollSnapAlign: 'start'
        }}
      >
        <div className="max-w-md w-full">
          <Card className="ds-card p-10 text-center shadow-sm">
            {!showGreeting ? (
              <>
                <h1 className="text-2xl font-display font-bold mb-2 text-foreground">
                  Welcome to
                </h1>
                <h1 className="text-3xl font-tiempos font-bold mb-2 text-foreground">
                  VibeTorch
                </h1>
                <p className="text-sm mb-6 text-muted-foreground">  
                  Log in to your GitHub account to get started
                </p>
                
                <GitHubConnectButton
                  isLoading={isConnecting}
                  onLoginStart={handleGitHubConnect}
                  onLoginSuccess={handleLoginSuccess}
                />
              </>
            ) : (
              <div className="animate-fade-in">
                <div className="mb-4">
                  <svg className="w-16 h-16 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h1 className="text-2xl font-display font-bold mb-2 text-foreground">
                  Welcome, vibetorch-user!
                </h1>
                <p className="text-sm text-muted-foreground">
                  GitHub connection successful. Setting up your workspace...
                </p>
              </div>
            )}
          </Card>
          {!showGreeting && (
            <p className="text-center text-sm mb-6 text-muted-foreground pt-4">
                or scroll to browse what VibeTorch can do.
            </p>
          )}
        </div>
      </div>

      {/* Step 2: Mode Selection */}
      <div 
        ref={stepRefs[1]}
        className="flex items-center justify-center p-8"
        style={{ 
          height: '100vh',
          scrollSnapAlign: 'start'
        }}
      >
        <div className="w-full">
          <div className="border-t border-b border-border p-10 bg-background">
            <h1 className="text-xl font-display font-bold mb-2 text-foreground">
              Set your agent's Vibe Mode.
            </h1>
            <p className="text-sm mb-8 text-muted-foreground">
              Set your AI agent activity level
            </p>
            
            <div className="mb-6">
              <div className="text-base font-medium mb-5 text-foreground">
                Agent Activity Level
              </div>
              
              <div className="relative mb-4">
                <div 
                  ref={sliderRef}
                  className="h-1.5 bg-muted rounded-full relative cursor-pointer shadow-sm"
                  onMouseDown={handleMouseDown}
                  onTouchStart={handleTouchStart}
                >
                  {/* Progress fill */}
                  <div 
                    className={`h-full bg-gradient-to-r from-cta-500 to-cta-600 rounded-full absolute top-0 left-0 transition-all duration-300 ${sliderMode === 0 ? 'opacity-30' : 'opacity-80'}`}
                    style={{
                      width: `${isDragging ? dragPosition : modes[sliderMode].pos}%`,
                      transition: isDragging ? 'none' : 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  />
                  <div 
                    className={`w-5 h-5 bg-gradient-to-br from-cta-500 to-cta-600 rounded-full absolute top-[-7px] cursor-grab shadow-lg border-2 border-background transform -translate-x-1/2 transition-all duration-300 ${isDragging ? 'cursor-grabbing scale-115' : ''} ${sliderMode === 0 ? 'opacity-50' : 'opacity-100'}`}
                    style={{ 
                      left: `${isDragging ? dragPosition : modes[sliderMode].pos}%`,
                      transition: isDragging ? 'none' : 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: isDragging 
                        ? '0 6px 20px rgb(var(--cta-500) / 0.4), 0 0 0 3px rgb(var(--cta-500) / 0.1)' 
                        : '0 3px 10px rgb(var(--cta-500) / 0.3)'
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
              
              <div className="flex justify-between text-xs mb-5 text-muted-foreground">
                <span className={sliderMode === 0 ? 'font-bold text-foreground' : ''}>OFF</span>
                <span className={sliderMode === 1 ? 'font-bold text-foreground' : ''}>MAINTAINER</span>
                <span className={sliderMode === 2 ? 'font-bold text-foreground' : ''}>VISIONARY</span>
                <span className={sliderMode === 3 ? 'font-bold text-foreground' : ''}>BOTH</span>
              </div>
              
              <div className="text-sm leading-relaxed text-center text-muted-foreground h-16 flex items-center justify-center">
                {modes[sliderMode].desc}
              </div>
            </div>

            <div className="bg-muted rounded-lg p-4 mb-6">
              <div className="text-sm font-medium mb-3 text-foreground">
                Repository Status (3 connected)
              </div>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <div 
                    className={`w-2 h-2 rounded-full mr-3 ${
                      sliderMode === 0 ? 'bg-muted-foreground' : 
                      sliderMode === 1 ? 'bg-amber-500' : 
                      'bg-emerald-500'
                    }`}
                  />
                  my-awesome-project
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <div 
                    className={`w-2 h-2 rounded-full mr-3 ${
                      sliderMode === 0 ? 'bg-muted-foreground' : 
                      sliderMode === 1 ? 'bg-amber-500' : 
                      'bg-emerald-500'
                    }`}
                  />
                  data-pipeline-tool
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <div 
                    className={`w-2 h-2 rounded-full mr-3 ${
                      sliderMode === 0 ? 'bg-muted-foreground' : 
                      sliderMode < 3 ? 'bg-muted-foreground' : 
                      'bg-amber-500'
                    }`}
                  />
                  old-archive-repo
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Step 2.5: Task Management */}
      <div ref={stepRefs[2]} className="flex items-center justify-center p-8" style={{ 
        height: '100vh',
        scrollSnapAlign: 'start' 
      }}>
        <div className="w-full">
          <TaskManagement />
        </div>
      </div>

      {/* Step 3: Task Dashboard */}
      <div 
        ref={stepRefs[3]}
        className="flex items-center justify-center p-8"
        style={{ 
          height: '100vh',
          scrollSnapAlign: 'start'
        }}
      >
        <div className="w-full max-w-6xl mx-auto px-4 py-8">
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl md:text-2xl font-light text-foreground">
                  Dashboard
                </h2>
                <p className="text-sm text-muted-foreground">
                  {modes[sliderMode].name} mode active
                </p>
              </div>
              <Button 
                size="sm" 
                onClick={refreshTasks}
                variant="outline"
                className="w-fit"
              >
                Refresh
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 border border-border rounded-lg">
                <div className="text-2xl font-light mb-1 text-foreground">
                  12.4K
                </div>
                <div className="text-xs text-muted-foreground">
                  Tokens Used
                </div>
              </div>
              <div className="text-center p-4 border border-border rounded-lg">
                <div className="text-2xl font-light mb-1 text-foreground">
                  {tasks.length}
                </div>
                <div className="text-xs text-muted-foreground">
                  Active Tasks
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <h3 className="text-sm font-medium text-foreground">Tasks</h3>
              </div>
              
              <div className="border border-border rounded-lg overflow-hidden">
                {/* Mobile view */}
                <div className="block md:hidden">
                  {tasks.map((task, index) => (
                    <div key={index} className="p-4 border-b border-border last:border-b-0">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-sm font-medium text-foreground">{task.repo}</span>
                        <div 
                          className={`w-2 h-2 rounded-full ${
                            task.status === 'running' ? 'bg-yellow-500' :
                            task.status === 'completed' ? 'bg-green-500' : 
                            task.status === 'pending' ? 'bg-blue-500' : 'bg-red-500'
                          }`}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{task.description}</p>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{task.tokens}</span>
                        <span>{task.time}</span>
                        <span>{task.cost}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop view */}
                <div className="hidden md:block">
                  <div className="grid grid-cols-12 gap-4 p-4 border-b border-border bg-muted/30">
                    <div className="col-span-3 text-xs font-medium text-muted-foreground">Repository</div>
                    <div className="col-span-1 text-xs font-medium text-muted-foreground text-center">Status</div>
                    <div className="col-span-5 text-xs font-medium text-muted-foreground">Description</div>
                    <div className="col-span-1 text-xs font-medium text-muted-foreground">Tokens</div>
                    <div className="col-span-1 text-xs font-medium text-muted-foreground">Time</div>
                    <div className="col-span-1 text-xs font-medium text-muted-foreground">Cost</div>
                  </div>
                  {tasks.map((task, index) => (
                    <div key={index} className="grid grid-cols-12 gap-4 p-4 border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors">
                      <div className="col-span-3">
                        <span className="text-sm text-foreground">{task.repo}</span>
                      </div>
                      <div className="col-span-1 flex justify-center">
                        <div 
                          className={`w-2 h-2 rounded-full ${
                            task.status === 'running' ? 'bg-yellow-500' :
                            task.status === 'completed' ? 'bg-green-500' : 
                            task.status === 'pending' ? 'bg-blue-500' : 'bg-red-500'
                          }`}
                        />
                      </div>
                      <div className="col-span-5">
                        <p className="text-sm text-muted-foreground truncate">{task.description}</p>
                      </div>
                      <div className="col-span-1 text-sm text-muted-foreground">{task.tokens}</div>
                      <div className="col-span-1 text-sm text-muted-foreground">{task.time}</div>
                      <div className="col-span-1 text-sm text-muted-foreground">{task.cost}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border border-border rounded-lg">
              <div className="text-sm font-medium mb-3 text-foreground">Monthly Usage</div>
              <div className="bg-muted h-1.5 rounded-full overflow-hidden mb-2">
                <div className="bg-foreground h-full w-2/3 rounded-full transition-all duration-500" />
              </div>
              <div className="text-xs text-muted-foreground">
                12,400 / 18,500 tokens • $4.96 spent
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VibetorchSteps;