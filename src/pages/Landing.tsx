import { ArrowRight, Shield, BarChart3, DollarSign, Zap, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const features = [
  {
    icon: Shield,
    title: "Secure Vibe Vault",
    description: "Your API keys flow through encrypted channels. Your credentials stay yours, always."
  },
  {
    icon: BarChart3,
    title: "Flow Analytics",
    description: "Watch your vibe flow in real-time with beautiful analytics showing your creative impact."
  },
  {
    icon: Users,
    title: "Community Powered",
    description: "Join a community where everyone shares their vibe - together we keep creativity flowing."
  },
  {
    icon: Zap,
    title: "Instant Flow",
    description: "No waiting, no setup - just pure, immediate access to AI creativity when you need it."
  }
];

const steps = [
  {
    number: "01",
    title: "Share Your Vibe",
    description: "Connect your unused AI credits to the vibetorch - your keys stay secure and private."
  },
  {
    number: "02", 
    title: "Let It Flow",
    description: "When you're not creating, others can use your credits to keep their creative energy flowing."
  },
  {
    number: "03",
    title: "Keep the Torch Burning",
    description: "Earn automatically while helping maintain the continuous flow of creative AI access."
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
                <div className="w-8 h-8 rounded-lg bg-cta-gradient flex items-center justify-center">
                  <span className="text-white font-bold text-sm font-display">VT</span>
                </div>
                <span className="text-xl font-display font-medium text-brand">vibetorch</span>
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
                className="ds-btn-primary"
              >
                Join the Flow
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-display font-medium text-foreground mb-6">
              vibe should
              <span className="block text-brand vibe-flow">flow</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Share your unused AI credits so creative energy never stops flowing. 
              When you're not vibing, someone else is - keep the torch burning.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                onClick={() => navigate("/dashboard")}
                className="ds-btn-primary px-8 py-4 text-lg"
              >
                Share My Vibe
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                onClick={() => navigate("/dashboard")}
                className="ds-btn-secondary px-8 py-4 text-lg"
              >
                Get Some Vibe
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-card/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-display font-medium text-foreground mb-4">
              How Vibe Flows
            </h2>
            <p className="text-xl text-muted-foreground">
              Three simple steps to keep the creative energy flowing
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <Card key={index} className="card-elevated bg-card/80 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-cta-gradient flex items-center justify-center">
                      <span className="text-white font-bold font-display">{step.number}</span>
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
            <h2 className="text-3xl lg:text-4xl font-display font-medium text-foreground mb-4">
              Why vibetorch?
            </h2>
            <p className="text-xl text-muted-foreground">
              Built for creators, by creators - where vibe must flow
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
              <div className="text-4xl font-display font-medium text-brand mb-2">∞</div>
              <div className="text-muted-foreground">Vibe Flowing</div>
            </div>
            <div>
              <div className="text-4xl font-display font-medium text-cta mb-2">50K+</div>
              <div className="text-muted-foreground">Creative Minds</div>
            </div>
            <div>
              <div className="text-4xl font-display font-medium text-cta mb-2">24/7</div>
              <div className="text-muted-foreground">Never Stopping</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-display font-medium text-foreground mb-6">
            Ready to Keep the Vibe Flowing?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of creators sharing their vibe so creativity never stops
          </p>
          <Button 
            size="lg"
            onClick={() => navigate("/dashboard")}
            className="ds-btn-primary px-8 py-4 text-lg"
          >
            Light the Torch
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/30 backdrop-blur-sm py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2024 vibetorch. where vibe must flow ✨</p>
          </div>
        </div>
      </footer>
    </div>
  );
}