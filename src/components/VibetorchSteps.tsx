import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import TaskManagement from "./TaskManagement";

const VibetorchSteps: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [sliderMode, setSliderMode] = useState(1); // 0: Off, 1: Maintainer, 2: Visionary, 3: Both
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
        
        // Update position smoothly during drag
        setDragPosition(percentage);
      }
    };

    const handleGlobalMouseUp = () => {
      if (isDragging && sliderRef.current) {
        // Find closest mode and snap to it when drag ends
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
        
        // Update position smoothly during drag
        setDragPosition(percentage);
      }
    };

    const handleGlobalTouchEnd = () => {
      if (isDragging && sliderRef.current) {
        // Find closest mode and snap to it when drag ends
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
    setTimeout(() => scrollToStep(1), 1000);
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
    <div className="h-full font-body" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}>
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
          <div 
            className="border rounded-2xl p-10 shadow-sm"
            style={{ 
              background: 'linear-gradient(180deg, #FFFFFF 0%, #F9F8F4 100%)',
              borderColor: '#DDD9C5'
            }}
          >
            
            <h1 
              className="text-2xl font-display font-bold mb-2"
              style={{ 
                fontFamily: 'StyreneB, Styrene, sans-serif',
                color: '#887D4E',
                letterSpacing: '-0.01em'
              }}
            >
              Welcome to
            </h1>
                         <h1 
               className="text-3xl font-tiempos font-bold mb-2 text-black"
               style={{ 
                 letterSpacing: '-0.01em'
               }}
            >
              VibeTorch
            </h1>
            <p className="text-sm mb-6">  
              Log in to your GitHub account to get started
            </p>
            
            <Button 
              onClick={handleGitHubConnect}
              className="w-full py-4 px-6 text-white font-medium transition-all duration-200 hover:transform hover:-translate-y-1 hover:shadow-lg flex items-center justify-center gap-3"
              style={{ 
                backgroundColor: '#24292e',
                borderRadius: '6px',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
              }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              Connect GitHub →
            </Button>

            {/* <div 
              className="mt-6 p-4 rounded-lg text-sm"
              style={{ 
                backgroundColor: '#F0EEE5',
                color: '#A69A64'
              }}
            >
              🎭 <strong>Demo Mode:</strong> Click to simulate GitHub OAuth login
            </div> */}
          </div>
          

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
          <div 
            className="border-t border-b p-10 shadow-sm"
            style={{ 
              background: 'transparent',
              borderColor: '#DDD9C5'
            }}
          >

            <h1
              className="text-xl font-display font-bold mb-2"
              style={{ 
                fontFamily: 'StyreneB, Styrene, sans-serif',
                color: 'black',
                letterSpacing: '-0.01em'
              }}
            >
              Set your agent's Vibe Mode.
            </h1>
            <p 
              className="text-sm mb-8"
              style={{ color: '#A69A64' }}
            >
              Set your AI agent activity level
            </p>
            
            <div 
              className="rounded-xl p-6 mb-6"
            >
              <div 
                className="text-base font-medium mb-5"
                style={{ color: '#887D4E' }}
              >
                Agent Activity Level
              </div>
              
              <div className="relative mb-4">
                <div 
                  ref={sliderRef}
                  className="h-1.5 rounded-full relative cursor-pointer"
                  style={{ 
                    background: 'linear-gradient(90deg, #F0EEE5 0%, #DDD9C5 100%)',
                    boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.05)'
                  }}
                  onMouseDown={handleMouseDown}
                  onTouchStart={handleTouchStart}
                >
                  {/* Progress fill */}
                  <div 
                    className="h-full rounded-full absolute top-0 left-0"
                    style={{
                      background: 'linear-gradient(90deg, #B05730, #884325)',
                      width: `${isDragging ? dragPosition : modes[sliderMode].pos}%`,
                      transition: isDragging ? 'none' : 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      opacity: sliderMode === 0 ? 0.3 : 0.8
                    }}
                  />
                  <div 
                    className={`w-5 h-5 rounded-full absolute top-[-7px] cursor-grab shadow-lg border-2 border-white ${isDragging ? 'cursor-grabbing' : ''}`}
                    style={{ 
                      background: 'linear-gradient(135deg, #B05730, #884325)',
                      left: `${isDragging ? dragPosition : modes[sliderMode].pos}%`, 
                      transform: 'translateX(-50%)',
                      transition: isDragging ? 'none' : 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.15s ease-out, box-shadow 0.15s ease-out',
                      opacity: sliderMode === 0 ? 0.5 : 1,
                      boxShadow: isDragging ? '0 6px 20px rgba(176, 87, 48, 0.4), 0 0 0 3px rgba(176, 87, 48, 0.1)' : '0 3px 10px rgba(176, 87, 48, 0.3)',
                      scale: isDragging ? '1.15' : '1'
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
              
              <div 
                className="flex justify-between text-xs mb-5"
                style={{ color: '#A69A64' }}
              >
                <span className={sliderMode === 0 ? 'font-bold' : ''}>OFF</span>
                <span className={sliderMode === 1 ? 'font-bold' : ''}>MAINTAINER</span>
                <span className={sliderMode === 2 ? 'font-bold' : ''}>VISIONARY</span>
                <span className={sliderMode === 3 ? 'font-bold' : ''}>BOTH</span>
              </div>
              

              <div 
                className="text-sm leading-relaxed text-center"
                style={{ 
                  color: '#A69A64',
                  height: '4.2rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {modes[sliderMode].desc}
              </div>
            </div>

            <div 
              className="rounded-lg p-4 mb-6 text-left"
            >
              <div 
                className="text-sm font-medium mb-3"
                style={{ color: '#887D4E' }}
              >
                Repository Status (3 connected)
              </div>
              <div className="space-y-2">
                <div className="flex items-center text-sm" style={{ color: '#A69A64' }}>
                  <div 
                    className="w-2 h-2 rounded-full mr-3" 
                    style={{ 
                      backgroundColor: sliderMode === 0 ? '#DDD9C5' : sliderMode === 1 ? '#FFCC00' : '#34C759'
                    }} 
                  />
                  my-awesome-project
                </div>
                <div className="flex items-center text-sm" style={{ color: '#A69A64' }}>
                  <div 
                    className="w-2 h-2 rounded-full mr-3" 
                    style={{ 
                      backgroundColor: sliderMode === 0 ? '#DDD9C5' : sliderMode === 1 ? '#FFCC00' : '#34C759'
                    }} 
                  />
                  data-pipeline-tool
                </div>
                <div className="flex items-center text-sm" style={{ color: '#A69A64' }}>
                  <div 
                    className="w-2 h-2 rounded-full mr-3" 
                    style={{ 
                      backgroundColor: sliderMode === 0 ? '#DDD9C5' : sliderMode < 3 ? '#DDD9C5' : '#FFCC00'
                    }} 
                  />
                  old-archive-repo
                </div>
              </div>
            </div>

            {/* <Button 
              onClick={handleModeStart}
              className="w-full py-4 px-6 text-white font-medium transition-all duration-200 hover:transform hover:-translate-y-1 hover:shadow-lg"
              style={{ 
                backgroundColor: '#B05730',
                borderRadius: '6px',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
              }}
            >
              Start Vibetorch Agent
            </Button> */}
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
        <div className="w-full">
          <div 
            className="border-t border-b p-8 shadow-sm"
            style={{ 
              background: 'transparent',
              borderColor: '#DDD9C5'
            }}
          >
            <div className="flex items-center mb-8">
              {/* <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-display font-semibold text-sm mr-4"
                style={{ 
                  background: 'linear-gradient(135deg, #B05730, #884325)',
                  fontFamily: 'StyreneB, Styrene, sans-serif'
                }}
              >
                VT
              </div> */}
              <div className="flex-1">
                <h1 
                  className="text-2xl font-display font-semibold"
                  style={{ 
                    fontFamily: 'StyreneB, Styrene, sans-serif',
                    color: 'black',
                    letterSpacing: '-0.01em'
                  }}
                >
                  Vibetorch Dashboard
                </h1>
                <p 
                  className="text-sm"
                  style={{ color: '#A69A64' }}
                >
                  Agent is active in {modes[sliderMode].name} mode
                </p>
              </div>
              <Button 
                size="sm" 
                onClick={refreshTasks}
                className="text-white font-medium"
                style={{ 
                  backgroundColor: '#B05730',
                  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
                }}
              >
                Refresh
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div 
                className="rounded-xl p-5"
                style={{ backgroundColor: '#F0EEE5' }}
              >
                <div 
                  className="text-2xl font-semibold mb-1"
                  style={{ color: '#B05730' }}
                >
                  12.4K
                </div>
                <div 
                  className="text-xs uppercase tracking-wide"
                  style={{ color: '#A69A64' }}
                >
                  Tokens Used
                </div>
              </div>
              <div 
                className="rounded-xl p-5"
                style={{ backgroundColor: '#F0EEE5' }}
              >
                <div 
                  className="text-2xl font-semibold mb-1"
                  style={{ color: '#B05730' }}
                >
                  {tasks.length}
                </div>
                <div 
                  className="text-xs uppercase tracking-wide"
                  style={{ color: '#A69A64' }}
                >
                  Active Tasks
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div 
                className="flex items-center gap-2 mb-4 text-base font-medium"
                style={{ color: '#887D4E' }}
              >
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#34C759' }} />
                Current Tasks
              </div>
              
              <div 
                className="border rounded-lg overflow-hidden"
                style={{ 
                  backgroundColor: '#FFFFFF',
                  borderColor: '#DDD9C5'
                }}
              >
                {/* Table Header */}
                <div 
                  className="px-4 py-3 border-b"
                  style={{ 
                    backgroundColor: '#F0EEE5',
                    borderColor: '#DDD9C5'
                  }}
                >
                  <div className="grid grid-cols-12 gap-2 text-xs font-semibold uppercase tracking-wide" style={{ color: '#887D4E' }}>
                    <div className="col-span-3">Repository</div>
                    <div className="col-span-1">Status</div>
                    <div className="col-span-5">Description</div>
                    <div className="col-span-1">Tokens</div>
                    <div className="col-span-1">Time</div>
                    <div className="col-span-1">Cost</div>
                  </div>
                </div>

                {/* Table Rows */}
                <div className="max-h-60 overflow-y-auto">
                  {tasks.map((task, index) => (
                    <div
                      key={index} 
                      className="px-4 py-3 border-b last:border-b-0 transition-all duration-150"
                      style={{ borderColor: '#DDD9C5' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F0EEE5'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <div className="grid grid-cols-12 gap-2 items-center">
                        {/* Repository */}
                        <div className="col-span-3">
                          <span className="text-sm font-medium overflow-hidden whitespace-nowrap text-ellipsis block" style={{ color: '#887D4E' }}>
                            {task.repo}
                          </span>
                        </div>

                        {/* Status */}
                        <div className="col-span-1 flex justify-center">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor: task.status === 'running' ? '#D97706' :
                                             task.status === 'completed' ? '#059669' : 
                                             task.status === 'pending' ? '#6C5DAC' : '#c53030'
                            }}
                          />
                        </div>

                        {/* Description */}
                        <div className="col-span-5">
                          <p 
                            className="text-sm overflow-hidden whitespace-nowrap text-ellipsis"
                            style={{
                              color: '#A69A64'
                            }}
                          >
                            {task.description}
                          </p>
                        </div>

                        {/* Tokens */}
                        <div className="col-span-1 text-sm overflow-hidden whitespace-nowrap text-ellipsis" style={{ color: '#A69A64' }}>
                          {task.tokens}
                        </div>

                        {/* Time */}
                        <div className="col-span-1 text-sm overflow-hidden whitespace-nowrap text-ellipsis" style={{ color: '#A69A64' }}>
                          {task.time}
                        </div>

                        {/* Cost */}
                        <div className="col-span-1 text-sm overflow-hidden whitespace-nowrap text-ellipsis" style={{ color: '#A69A64' }}>
                          {task.cost}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div 
              className="rounded-lg p-4 border"
              style={{ 
                backgroundColor: '#F0EEE5',
                borderColor: '#DDD9C5'
              }}
            >
              <div className="text-sm font-medium mb-3" style={{ color: '#887D4E' }}>Monthly Claude Token Usage</div>
              <div className="bg-gray-200 h-2 rounded-full overflow-hidden mb-2">
                <div className="h-full w-2/3 rounded-full transition-all duration-500" style={{ backgroundColor: '#B05730' }} />
              </div>
              <div className="text-xs" style={{ color: '#A69A64' }}>
                12,400 / 18,500 tokens used this month • $4.96 spent
              </div>
            </div>
          </div>
          

        </div>
      </div>
    </div>
  );
};

export default VibetorchSteps;