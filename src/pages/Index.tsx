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

export default function InferenceExchange() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 h-16 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="flex items-center justify-between h-full px-4 lg:px-6">
          {/* Left: Brand Logo */}
          <div className="flex items-center">
            <a href="/" className="text-xl font-bold text-neon hover:opacity-80 transition-smooth">
              Inference Exchange
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <a href="#" className="text-muted-foreground hover:text-foreground transition-smooth">
              Docs
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-smooth">
              Pricing
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-smooth">
              Login
            </a>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground transition-smooth">
              Start Selling
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-sm">
            <div className="px-4 py-2 space-y-2">
              <a href="#" className="block py-2 text-muted-foreground hover:text-foreground transition-smooth">
                Docs
              </a>
              <a href="#" className="block py-2 text-muted-foreground hover:text-foreground transition-smooth">
                Pricing
              </a>
              <a href="#" className="block py-2 text-muted-foreground hover:text-foreground transition-smooth">
                Login
              </a>
              <Button className="w-full mt-2 bg-primary hover:bg-primary/90 text-primary-foreground transition-smooth">
                Start Selling
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)]">
        {/* Left Panel - Marketing */}
        <div className="lg:w-2/5 panel-left p-6 lg:p-8 flex flex-col justify-center">
          {/* Logo Mark */}
          <div className="mb-8">
            <div className="w-16 h-16 rounded-lg bg-gradient-neon flex items-center justify-center">
              <span className="text-background font-bold text-xl">IE</span>
            </div>
          </div>

          {/* Headlines */}
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 leading-tight">
              Monetize your idle LLM credits
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              List your API key, set a price, earn automatically.
            </p>

            {/* Benefits List */}
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-primary mr-3"></div>
                Secure vault storage
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-primary mr-3"></div>
                Real-time metering & payouts
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-primary mr-3"></div>
                Zero code to start
              </li>
            </ul>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground transition-smooth flex-1">
              Start Selling
            </Button>
            <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 transition-smooth flex-1">
              Start Buying
            </Button>
          </div>

          {/* Footer Note */}
          <p className="text-xs text-muted-foreground">
            Inspired by inference.net
          </p>
        </div>

        {/* Right Panel - Dashboard */}
        <div className="lg:w-3/5 panel-right p-6 lg:p-8 overflow-y-auto">
          {/* API Key Card */}
          <Card className="glass-card mb-6">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-foreground">
                Steve's Anthropic Key
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                claude-3-sonnet - thinking
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
          <Card className="glass-card">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-foreground">
                  Fee History
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