import { Button } from "@/components/ui/button";
import VibetorchSteps from "@/components/VibetorchSteps";


export default function VibetorchApp() {
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
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-20 left-10 w-32 h-32 bg-cta-500 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-24 h-24 bg-accent rounded-full blur-2xl"></div>
          </div>
          
          {/* Logo Mark */}
          <div className="relative mb-2">
            <div className="w-full h-96 lg:h-[32rem] relative overflow-hidden">
              <img 
                src="/torch.png" 
                alt="Vibetorch" 
                className="w-[150%] h-auto max-h-none object-contain absolute top-1/2 -left-20 transform -translate-y-1/2 rounded-3xl"
                style={{
                  animation: 'panLeft 1s ease-in-out'
                }}
              />
            </div>
          </div>

          {/* Headlines */}
          <div className="mb-8 relative z-10">
            <h1 className="text-4xl lg:text-5xl font-mono font-bold text-amber-800 mb-6 leading-[1.1] tracking-tight" style={{fontFamily: '"Fira Code", "Fira Mono", Menlo, Consolas, "DejaVu Sans Mono", monospace'}}>
              Vibe must flow.
            </h1>
            <p className="text-xl text-black mb-8 leading-relaxed" style={{fontFamily: '"Fira Code", "Fira Mono", Menlo, Consolas, "DejaVu Sans Mono", monospace'}}>
              Rest easy, AI's got the night shift.
              Automated Vibe Coding when you're not around.
            </p>
          </div>
        </div>

        {/* Right Panel - Vibetorch Steps */}
        <div className="lg:w-3/5 lg:ml-[40%] panel-right overflow-y-auto min-h-screen">
          <VibetorchSteps />
        </div>
      </div>
    </div>
  );
}