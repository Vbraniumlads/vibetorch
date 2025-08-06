import React from 'react';
import { Button } from '../../../shared/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../../shared/components/ui/avatar';
import { LogOut, User } from 'lucide-react';
import type { User as UserType } from '../types/auth.types';

interface UserProfileProps {
  user: UserType;
  onLogout: () => void;
  compact?: boolean;
}

export function UserProfile({ user, onLogout, compact = false }: UserProfileProps) {
  const initials = user.username.slice(0, 2).toUpperCase();
  const displayName = user.name || user.username;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Avatar className="h-7 w-7 ring-2 ring-background border">
          <AvatarImage 
            src={user.avatar_url} 
            alt={displayName}
            referrerPolicy="no-referrer"
          />
          <AvatarFallback className="text-xs font-medium bg-gradient-to-br from-cta-500 to-cta-600 text-white">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium truncate" title={displayName}>
            {user.name ? user.name : `@${user.username}`}
          </span>
        </div>
        <Button
          onClick={onLogout}
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive transition-colors"
          title="Logout"
        >
          <LogOut className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 bg-background/95 backdrop-blur border rounded-lg px-4 py-3 shadow-sm">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 ring-2 ring-background border">
          <AvatarImage 
            src={user.avatar_url} 
            alt={displayName}
            referrerPolicy="no-referrer"
          />
          <AvatarFallback className="font-medium bg-gradient-to-br from-cta-500 to-cta-600 text-white">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium truncate" title={displayName}>
              {displayName}
            </span>
          </div>
          {user.name && (
            <span className="text-xs text-muted-foreground truncate" title={`@${user.username}`}>
              @{user.username}
            </span>
          )}
        </div>
      </div>
      <Button
        onClick={onLogout}
        variant="outline"
        size="sm"
        className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-colors"
      >
        <LogOut className="h-4 w-4 mr-2" />
        Logout
      </Button>
    </div>
  );
}