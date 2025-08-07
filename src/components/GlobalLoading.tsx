import React from 'react';

interface GlobalLoadingProps {
  isLoading: boolean;
  message?: string;
}

export function GlobalLoading({ isLoading, message = "Loading..." }: GlobalLoadingProps) {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-card/90 border border-border/50 shadow-2xl">
        {/* Animated VibeTorch Logo */}
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cta-500 to-cta-600 flex items-center justify-center animate-pulse">
            <div className="w-8 h-8 bg-white rounded-full opacity-90"></div>
          </div>
          {/* Ripple effect */}
          <div className="absolute inset-0 rounded-full border-2 border-cta-500/30 animate-ping"></div>
          <div className="absolute inset-0 rounded-full border border-cta-500/20 animate-ping" style={{ animationDelay: '0.5s' }}></div>
        </div>

        {/* Loading Text */}
        <div className="text-center">
          <p className="text-foreground font-medium mb-1">{message}</p>
          <div className="flex items-center gap-1 justify-center">
            <div className="w-2 h-2 bg-cta-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-cta-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-cta-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}