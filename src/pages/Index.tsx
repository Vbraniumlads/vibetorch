import { Button } from "@/components/ui/button";
import VibetorchSteps from "@/components/VibetorchSteps";
import { useState, useEffect } from "react";


export default function VibetorchApp() {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [currentSection, setCurrentSection] = useState(0);
  const [hasInitialAnimationPlayed, setHasInitialAnimationPlayed] = useState(false);

  // Mark initial animation as played after component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setHasInitialAnimationPlayed(true);
    }, 1000); // Match the animation duration
    return () => clearTimeout(timer);
  }, []);

  // Handle global mouse/touch events for dragging
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newOffset = {
          x: e.clientX - startPosition.x,
          y: e.clientY - startPosition.y
        };
        setDragOffset(newOffset);
      }
    };

    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        // Animate back to original position
        setDragOffset({ x: 0, y: 0 });
      }
    };

    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (isDragging) {
        e.preventDefault();
        const touch = e.touches[0];
        const newOffset = {
          x: touch.clientX - startPosition.x,
          y: touch.clientY - startPosition.y
        };
        setDragOffset(newOffset);
      }
    };

    const handleGlobalTouchEnd = () => {
      if (isDragging) {
        setIsDragging(false);
        // Animate back to original position
        setDragOffset({ x: 0, y: 0 });
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      document.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
      document.addEventListener('touchend', handleGlobalTouchEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchmove', handleGlobalTouchMove);
      document.removeEventListener('touchend', handleGlobalTouchEnd);
    };
  }, [isDragging, startPosition]);

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    
    if ('touches' in e) {
      const touch = e.touches[0];
      setStartPosition({ x: touch.clientX, y: touch.clientY });
    } else {
      setStartPosition({ x: e.clientX, y: e.clientY });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <style>{`
        @keyframes panLeft {
          0% {
            transform: translateX(-33%) translateY(-50%);
          }
          100% {
            transform: translateX(0%) translateY(-50%);
          }
        }
        .panel-right::-webkit-scrollbar {
          display: none;
        }
        .panel-right {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      
      {/* Floating Navbar */}
      {/* <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-4xl px-4">
        <div className="bg-card/80 backdrop-blur-lg border border-border/50 rounded-3xl shadow-lg">
          <div className="px-6 py-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <a href="/" className="text-xl font-serif font-bold text-foreground hover:opacity-80 transition-smooth">
                  Vibetorch
                </a>
              </div>

              <div className="hidden md:flex items-center space-x-6">
                <a href="#" className="text-muted-foreground hover:text-foreground transition-smooth text-sm">
                  Docs
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-smooth text-sm">
                  Pricing
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-smooth text-sm">
                  Login
                </a>
                <Button className="ds-btn-primary text-sm font-medium">
                  Share Vibe
                </Button>
              </div>

              <div className="md:hidden">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </div>
            </div>

            {isMenuOpen && (
              <div className="md:hidden border-t border-border/50 mt-3 pt-3">
                <div className="flex flex-col space-y-2">
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-smooth py-2 text-sm">
                    Docs
                  </a>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-smooth py-2 text-sm">
                    Pricing
                  </a>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-smooth py-2 text-sm">
                    Login
                  </a>
                  <Button className="ds-btn-primary text-left text-sm font-medium">
                    Share Vibe
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav> */}

      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left Panel - Marketing */}
        <div className="lg:w-2/5 panel-left p-6 lg:p-8 flex flex-col justify-center lg:fixed lg:h-screen lg:pt-20 relative overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute inset-0 opacity-5 flex items-center justify-center">
            <div className="absolute top-20 left-10 w-32 h-32 bg-cta-500 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-24 h-24 bg-accent rounded-full blur-2xl"></div>
          </div>
          
          {/* Logo Mark */}
          <div className="relative mb-2">
            <div className="w-full h-96 lg:h-[32rem] relative overflow-hidden">
              <img 
                src="/torch.png" 
                alt="Vibetorch" 
                className="w-[150%] h-auto max-h-none object-contain absolute top-1/2 -left-20 transform -translate-y-1/2 rounded-3xl cursor-grab"
                style={{
                  animation: isDragging || hasInitialAnimationPlayed ? 'none' : 'panLeft 1s ease-in-out',
                  transform: `translateX(${-20 + (dragOffset.x * 0.1)}px) translateY(${-50 + (dragOffset.y * 0.03)}%)`,
                  transition: isDragging ? 'none' : 'transform 1.2s cubic-bezier(0.23, 1, 0.32, 1)',
                  cursor: isDragging ? 'grabbing' : 'grab',
                  zIndex: isDragging ? 50 : 10
                }}
                onMouseDown={handleDragStart}
                onTouchStart={handleDragStart}
                draggable={false}
              />
            </div>
          </div>

          {/* Headlines */}
          <div className="mb-8 relative z-10">
            <h1 className="text-4xl lg:text-5xl font-sans font-bold text-amber-800 mb-6 leading-[1.1] tracking-tight" style={{fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>
              Vibe must flow.
            </h1>
            <p className="text-xl text-black mb-8 leading-relaxed font-sans" style={{fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>
              Rest easy, AI's got the night shift.
              Automated Vibe Coding when you're not around.
            </p>
          </div>

          {/* GitHub Link */}
          <div className="absolute top-4 left-4 z-20">
            <a 
              href="https://github.com/Vbraniumlads/exchange-llm-ui" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-amber-700 hover:text-amber-800 transition-colors duration-200 font-medium"
              style={{fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.30.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              View on GitHub
            </a>
          </div>
        </div>

        {/* Right Panel - Vibetorch Steps */}
        <div 
          className="lg:w-3/5 lg:ml-[40%] panel-right overflow-y-auto"
          style={{ 
            height: '100vh',
            scrollSnapType: 'y mandatory',
            scrollBehavior: 'smooth',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
          onScroll={(e) => {
            const scrollTop = e.currentTarget.scrollTop;
            const sectionIndex = Math.round(scrollTop / window.innerHeight);
            setCurrentSection(sectionIndex);
          }}
        >
          <VibetorchSteps />
          {/* Dot Navigation */}
          <div className="fixed right-2 top-1/2 transform -translate-y-1/2 z-50 space-y-2 flex flex-col">
          {/* <div className="right-8 top-1/2 transform space-y-4"> */}
            {[0, 1, 2, 3].map((index) => (
              <button
                key={index}
                onClick={() => {
                  const container = document.querySelector('.panel-right');
                  if (container) {
                    container.scrollTo({
                      top: index * window.innerHeight,
                      behavior: 'smooth'
                    });
                  }
                }}
                className="w-1.5 h-1.5 rounded-full border transition-all duration-300 hover:scale-110"
                style={{
                  backgroundColor: currentSection === index ? '#B05730' : 'transparent',
                  borderColor: '#B05730',
                  opacity: currentSection === index ? 1 : 0.5
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}