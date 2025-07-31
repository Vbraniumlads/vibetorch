import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Settings, 
  Plug, 
  BarChart3, 
  CreditCard, 
  FileText, 
  MessageCircle,
  User
} from "lucide-react";

const navigationItems = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Integrations", href: "/integrations", icon: Plug },
  { name: "Usage", href: "/usage", icon: BarChart3 },
  { name: "Billing & Invoices", href: "/billing", icon: CreditCard },
  { name: "Docs", href: "/docs", icon: FileText },
  { name: "Contact", href: "/contact", icon: MessageCircle },
];

interface NavigationProps {
  className?: string;
}

export function Navigation({ className }: NavigationProps) {
  return (
    <nav className={cn("space-y-1", className)}>
      {navigationItems.map((item) => (
        <NavLink
          key={item.name}
          to={item.href}
          className={({ isActive }) =>
            cn(
              "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200",
              "hover:bg-secondary hover:text-primary",
              isActive
                ? "bg-primary/10 text-primary border border-primary/20 neon-glow"
                : "text-muted-foreground hover:text-foreground"
            )
          }
        >
          <item.icon className="mr-3 h-4 w-4" />
          {item.name}
        </NavLink>
      ))}
    </nav>
  );
}

interface UserProfileProps {
  email: string;
  plan: string;
}

export function UserProfile({ email, plan }: UserProfileProps) {
  return (
    <div className="flex items-center space-x-3 p-3 rounded-lg bg-secondary/50 border border-border">
      <div className="flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-gradient-neon flex items-center justify-center">
          <User className="w-4 h-4 text-background" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{email}</p>
        <p className="text-xs text-primary font-semibold">{plan} Plan</p>
      </div>
    </div>
  );
}