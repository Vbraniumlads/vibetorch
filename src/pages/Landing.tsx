import { ArrowRight, Shield, BarChart3, DollarSign, Zap, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const features = [
  {
    icon: Shield,
    title: "Secure Key Vault",
    description: "Your API keys are encrypted and stored securely. Only you have access to your credentials."
  },
  {
    icon: BarChart3,
    title: "Token Metering",
    description: "Real-time tracking of token usage with detailed analytics and billing breakdowns."
  },
  {
    icon: DollarSign,
    title: "Flexible Pricing",
    description: "Set your own hourly rates or token-based pricing. You control your earning potential."
  },
  {
    icon: Zap,
    title: "Instant Access",
    description: "Buyers get immediate access to LLM compute without long setup processes."
  }
];

const steps = [
  {
    number: "01",
    title: "Upload Your API Key",
    description: "Securely store your LLM API keys in our encrypted vault. Your credentials remain private."
  },
  {
    number: "02", 
    title: "Set Your Pricing",
    description: "Define hourly rates or token-based pricing for your compute resources."
  },
  {
    number: "03",
    title: "Earn From Usage",
    description: "Others use your keys through our platform and you earn fees automatically."
  }
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background geometric-bg">
      {/* Navigation */}
      <nav className="border-b border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-neon flex items-center justify-center">
                  <span className="text-background font-bold text-sm">IE</span>
                </div>
                <span className="text-xl font-bold text-neon">Inference Exchange</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate("/dashboard")}
                className="text-muted-foreground hover:text-primary"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => navigate("/dashboard")}
                className="bg-gradient-neon text-background hover:opacity-90 neon-glow"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
              Monetize Your
              <span className="block text-neon animate-pulse-neon">Unused LLM Credits</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Turn your idle OpenAI, Claude, and Gemini API credits into revenue. 
              Connect with buyers who need compute instantly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                onClick={() => navigate("/dashboard")}
                className="bg-gradient-neon text-background hover:opacity-90 neon-glow px-8 py-4 text-lg"
              >
                Start Selling
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate("/dashboard")}
                className="border-neon text-primary hover:bg-primary/10 px-8 py-4 text-lg"
              >
                Start Buying
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-card/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground">
              Simple steps to start earning from your API credits
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <Card key={index} className="card-elevated bg-card/80 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-neon flex items-center justify-center">
                      <span className="text-background font-bold">{step.number}</span>
                    </div>
                    <CardTitle className="text-xl text-foreground">{step.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Why Choose Inference Exchange?
            </h2>
            <p className="text-xl text-muted-foreground">
              Built for the modern AI economy
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="card-elevated bg-card/80 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-all duration-300 group">
                <CardHeader className="pb-3">
                  <feature.icon className="h-8 w-8 text-primary group-hover:text-primary-glow transition-colors" />
                  <CardTitle className="text-lg text-foreground">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-card/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-neon mb-2">$2M+</div>
              <div className="text-muted-foreground">Total Earnings Paid</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-neon-cyan mb-2">50K+</div>
              <div className="text-muted-foreground">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-neon-purple mb-2">99.9%</div>
              <div className="text-muted-foreground">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
            Ready to Start Earning?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of developers already monetizing their LLM credits
          </p>
          <Button 
            size="lg"
            onClick={() => navigate("/dashboard")}
            className="bg-gradient-neon text-background hover:opacity-90 neon-glow px-8 py-4 text-lg"
          >
            Get Started Today
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/30 backdrop-blur-sm py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2024 Inference Exchange. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}