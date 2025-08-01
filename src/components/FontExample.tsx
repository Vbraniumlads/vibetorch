import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const FontExample = () => {
  return (
    <Card className="ds-card max-w-2xl">
      <CardHeader>
        <CardTitle className="font-display text-2xl">
          vibetorch Typography System
        </CardTitle>
        <p className="text-muted-foreground">
          Showcasing all three font families in our design system
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Display Font - StyreneB */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Display Font (StyreneB)</h4>
          <h1 className="font-display text-4xl font-medium text-foreground leading-tight">
            vibe must flow
          </h1>
          <h2 className="font-display text-2xl font-medium text-foreground mt-2">
            Keep the Creative Energy Alive
          </h2>
          <h3 className="font-display text-xl font-medium text-foreground mt-2">
            Share Your Unused AI Credits
          </h3>
        </div>

        {/* Body Font - Inter */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Body Font (Inter)</h4>
          <p className="font-body text-base text-foreground leading-relaxed">
            This is our body text using Inter. It's perfect for UI elements, buttons, labels, 
            and all interface text. Inter provides excellent readability at all sizes and 
            works beautifully across different screen densities.
          </p>
          <p className="font-body text-sm text-muted-foreground mt-2">
            Smaller body text in muted colors for secondary information.
          </p>
        </div>

        {/* Serif Font - Copernicus */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Serif Font (Copernicus)</h4>
          <blockquote className="font-serif text-lg text-foreground leading-relaxed border-l-4 border-cta-300 pl-4 italic">
            "When you're not vibing, someone else is — keep the torch burning. 
            This is our serif font for long-form content, quotes, and prose that 
            needs that extra touch of elegance and readability."
          </blockquote>
          <p className="prose-serif font-serif text-base text-foreground mt-4 leading-relaxed">
            Copernicus is perfect for longer reading experiences, documentation, 
            articles, and any content where we want to convey warmth and humanity 
            through typography.
          </p>
        </div>

        {/* Utility Classes Demo */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Utility Classes</h4>
          <div className="space-y-2">
            <p className="font-display text-lg">
              .font-display → StyreneB, weight 500
            </p>
            <p className="font-body text-base">
              .font-body → Inter (default)  
            </p>
            <p className="font-serif text-base">
              .font-serif → Copernicus
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FontExample;