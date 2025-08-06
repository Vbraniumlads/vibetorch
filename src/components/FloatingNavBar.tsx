import React from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useAuth as useFeatureAuth } from '@/features/auth/hooks/useAuth';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, CreditCard, User } from 'lucide-react';

const FloatingNavBar: React.FC = () => {
  const { user, logout } = useFeatureAuth();
  const { isAuthenticated, githubUsername } = useAuth();

  if (!isAuthenticated) return null;

  const handleLogout = async () => {
    await logout();
  };

  const displayName = user?.name || user?.login || githubUsername || 'User';
  const avatarUrl = user?.avatar_url;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-background/95 backdrop-blur-sm border border-border rounded-full px-6 py-3 shadow-lg">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-cta-500 to-cta-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">V</span>
            </div>
            <span className="font-tiempos font-bold text-foreground">VibeTorch</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground hover:text-foreground"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Billings
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={avatarUrl} alt={displayName} />
                    <AvatarFallback className="text-xs">
                      {displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-foreground">{displayName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem>
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloatingNavBar;
