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

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Avatar className="h-6 w-6">
          <AvatarImage src={user.avatar_url} alt={user.username} />
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium">{user.username}</span>
        <Button
          onClick={onLogout}
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
        >
          <LogOut className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 bg-background/95 backdrop-blur border rounded-lg px-4 py-2">
      <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.avatar_url} alt={user.username} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4" />
          <span className="font-medium">{user.username}</span>
        </div>
      </div>
      <Button
        onClick={onLogout}
        variant="outline"
        size="sm"
      >
        <LogOut className="h-4 w-4 mr-2" />
        Logout
      </Button>
    </div>
  );
}