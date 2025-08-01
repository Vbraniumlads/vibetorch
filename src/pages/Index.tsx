import { useState } from "react";
import { Menu, X, Download, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import FontExample from "@/components/FontExample";

// Dummy data for fee history
const feeHistory = [
  {
    date: "2024-01-30",
    buyer: "buyer_7k9m2n",
    tokensUsed: "15,432",
    timeSeconds: "28",
    feeEarned: "1.23"
  },
  {
    date: "2024-01-30", 
    buyer: "buyer_3x8p1q",
    tokensUsed: "8,921",
    timeSeconds: "15",
    feeEarned: "0.71"
  },
  {
    date: "2024-01-29",
    buyer: "buyer_9z2v4t", 
    tokensUsed: "22,134",
    timeSeconds: "41",
    feeEarned: "1.77"
  },
  {
    date: "2024-01-29",
    buyer: "buyer_1m5n8r",
    tokensUsed: "6,789",
    timeSeconds: "12",
    feeEarned: "0.54"
  },
  {
    date: "2024-01-28",
    buyer: "buyer_4j7k9l",
    tokensUsed: "31,245",
    timeSeconds: "67",
    feeEarned: "2.50"
  },
  {
    date: "2024-01-28",
    buyer: "buyer_8p3q7w",
    tokensUsed: "12,567",
    timeSeconds: "23",
    feeEarned: "1.01"
  }
];

export default function VibetorchApp() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

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
      <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-4xl px-4">
        <div className="bg-card/80 backdrop-blur-lg border border-border/50 rounded-3xl shadow-lg">
          <div className="px-6 py-3">
            <div className="flex justify-between items-center">
              {/* Brand */}
              <div className="flex items-center">
                <a href="/" className="text-xl font-serif font-bold text-foreground hover:opacity-80 transition-smooth">
                  Vibetorch
                </a>
              </div>

              {/* Desktop Navigation */}
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

              {/* Mobile menu button */}
              <div className="md:hidden">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </div>
            </div>

            {/* Mobile Navigation */}
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
      </nav>

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
          <div className="relative mb-6 group">
            <div className="w-full h-96 lg:h-[32rem] relative overflow-hidden">
              <img 
                src="/torch.png" 
                alt="Vibetorch" 
                className="w-[150%] h-auto max-h-none object-contain absolute top-1/2 left-0 transform -translate-y-1/2 transition-all duration-500 filter hover:brightness-110 hover:drop-shadow-2xl"
                style={{
                  animation: 'panLeft 8s ease-in-out infinite alternate'
                }}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-cta-400/20 via-transparent to-cta-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            <div className="absolute -inset-4 bg-gradient-to-r from-cta-400/30 via-cta-500/30 to-cta-600/30 rounded-3xl blur-xl opacity-0 group-hover:opacity-60 transition-all duration-500 -z-10"></div>
          </div>

          {/* Headlines */}
          <div className="mb-8 relative z-10">
            <h1 className="text-4xl lg:text-5xl font-mono font-bold text-amber-800 mb-6 leading-[1.1] tracking-tight" style={{fontFamily: '"Fira Code", "Fira Mono", Menlo, Consolas, "DejaVu Sans Mono", monospace'}}>
              Vibe must flow.
            </h1>
            <p className="text-xl text-black mb-8 leading-relaxed" style={{fontFamily: '"Fira Code", "Fira Mono", Menlo, Consolas, "DejaVu Sans Mono", monospace'}}>
              Rest easy, AI's got the night shift.
            </p>
          </div>
        </div>

        {/* Right Panel - Dashboard */}
        <div className="lg:w-3/5 lg:ml-[40%] panel-right px-6 lg:px-8 pt-10 pb-5 overflow-y-auto min-h-screen flex flex-col justify-center">
          {/* API Key Card */}
          <Card className="ds-card mb-6">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-display font-bold text-foreground uppercase">
                Steve's Anthropic Vibe
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                claude-3-sonnet - sharing the flow
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded border border-primary/20">
                    $0.08 / 1k tokens
                  </span>
                  <span className="px-2 py-1 bg-accent text-accent-foreground text-xs rounded">
                    250k tokens left
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <Power className={`h-4 w-4 ${isOnline ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className="text-sm text-foreground">
                      Status: {isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                  <Switch
                    checked={isOnline}
                    onCheckedChange={setIsOnline}
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fee History Table */}
          <Card className="ds-card">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-display font-bold text-foreground uppercase">
                  Vibe Flow History
                </CardTitle>
                <Button size="sm" variant="outline" className="border-primary text-primary hover:bg-primary/10 transition-smooth">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-panel-right">
                    <TableRow className="border-border/50">
                      <TableHead className="text-muted-foreground font-medium">Date</TableHead>
                      <TableHead className="text-muted-foreground font-medium">Buyer</TableHead>
                      <TableHead className="text-muted-foreground font-medium">Tokens Used</TableHead>
                      <TableHead className="text-muted-foreground font-medium">Time (s)</TableHead>
                      <TableHead className="text-muted-foreground font-medium text-right">Fee Earned ($)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {feeHistory.map((row, index) => (
                      <TableRow key={index} className="border-border/30 hover:bg-secondary/30 transition-smooth">
                        <TableCell className="text-foreground">{row.date}</TableCell>
                        <TableCell className="font-mono text-sm text-foreground">{row.buyer}</TableCell>
                        <TableCell className="font-mono text-foreground">{row.tokensUsed}</TableCell>
                        <TableCell className="text-foreground">{row.timeSeconds}</TableCell>
                        <TableCell className="text-right font-semibold text-primary">${row.feeEarned}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}