import type { Todo, ProjectIdea, ProjectSuggestion } from '../types/index.js';

class TodoParser {
  extractTodos(content: string): Todo[] {
    const todos: Todo[] = [];
    const lines = content.split('\n');
    
    // Patterns for different todo formats
    const patterns = [
      // Markdown checkboxes: - [ ] task or - [x] task
      /^[\s]*-\s*\[([ x])\]\s*(.+)/i,
      // Todo comments: // TODO: task or # TODO: task
      /^[\s]*(?:\/\/|#)\s*TODO:?\s*(.+)/i,
      // Simple bullet points: - task or * task
      /^[\s]*[-*]\s*(.+)/,
      // Numbered lists: 1. task
      /^[\s]*\d+\.\s*(.+)/,
      // GitHub issues format: - Issue: task
      /^[\s]*-\s*(?:Issue|Task|Feature):?\s*(.+)/i
    ];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (!line) continue;
      
      for (const pattern of patterns) {
        const match = line.match(pattern);
        if (match) {
          let text: string;
          let completed = false;
          
          if (pattern.source.includes('\\[([ x])\\]')) {
            // Checkbox format
            completed = match[1].toLowerCase() === 'x';
            text = match[2].trim();
          } else if (pattern.source.includes('TODO')) {
            // TODO comment format
            text = match[1].trim();
          } else {
            // Other formats
            text = match[1].trim();
          }
          
          todos.push({
            text,
            completed,
            line: i + 1,
            priority: this.extractPriority(text),
            tags: this.extractTags(text),
            claudeMentioned: text.toLowerCase().includes('@claude')
          });
          break;
        }
      }
    }
    
    return todos;
  }
  
  extractPriority(text: string): Todo['priority'] {
    const priorityPatterns = [
      { pattern: /\[high\]|\[urgent\]|\[critical\]/i, level: 'high' as const },
      { pattern: /\[medium\]/i, level: 'medium' as const },
      { pattern: /\[low\]/i, level: 'low' as const },
      { pattern: /!{3,}/, level: 'high' as const },
      { pattern: /!{2}/, level: 'medium' as const },
      { pattern: /!{1}/, level: 'low' as const }
    ];
    
    for (const { pattern, level } of priorityPatterns) {
      if (pattern.test(text)) {
        return level;
      }
    }
    
    return 'normal';
  }
  
  extractTags(text: string): string[] {
    const tagPattern = /#(\w+)/g;
    const tags: string[] = [];
    let match: RegExpExecArray | null;
    
    while ((match = tagPattern.exec(text)) !== null) {
      tags.push(match[1]);
    }
    
    return tags;
  }
  
  extractProjectIdea(text: string): ProjectIdea {
    // Look for common patterns that indicate a project idea
    const ideaPatterns = [
      /create\s+(.+)/i,
      /build\s+(.+)/i,
      /implement\s+(.+)/i,
      /develop\s+(.+)/i,
      /make\s+(.+)/i,
      /add\s+(.+)/i
    ];
    
    for (const pattern of ideaPatterns) {
      const match = text.match(pattern);
      if (match) {
        return {
          type: 'project',
          description: match[1].trim(),
          originalText: text
        };
      }
    }
    
    return {
      type: 'task',
      description: text,
      originalText: text
    };
  }
  
  generateProjectSuggestion(todo: Todo): ProjectSuggestion {
    const idea = this.extractProjectIdea(todo.text);
    
    return {
      project: {
        name: this.generateRepoName(idea.description),
        description: `Implementation of: ${idea.description}`,
        features: this.extractFeatures(todo.text),
        technology: this.suggestTechnology(todo.text)
      }
    };
  }
  
  generateRepoName(description: string): string {
    return description
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
  }
  
  extractFeatures(text: string): string[] {
    const features: string[] = [];
    
    // Look for feature keywords
    const featureKeywords = [
      'authentication', 'auth', 'login',
      'api', 'rest', 'graphql',
      'database', 'db', 'storage',
      'ui', 'interface', 'frontend',
      'backend', 'server',
      'mobile', 'responsive',
      'real-time', 'websocket',
      'payment', 'stripe',
      'notification', 'email'
    ];
    
    const lowerText = text.toLowerCase();
    for (const keyword of featureKeywords) {
      if (lowerText.includes(keyword)) {
        features.push(keyword);
      }
    }
    
    return features.length > 0 ? features : ['core-functionality'];
  }
  
  suggestTechnology(text: string): string {
    const techMentions: Record<string, RegExp> = {
      'react': /react/i,
      'vue': /vue/i,
      'angular': /angular/i,
      'node': /node\.?js/i,
      'python': /python/i,
      'django': /django/i,
      'flask': /flask/i,
      'express': /express/i,
      'next': /next\.?js/i,
      'typescript': /typescript|ts/i,
      'javascript': /javascript|js/i
    };
    
    for (const [tech, pattern] of Object.entries(techMentions)) {
      if (pattern.test(text)) {
        return tech;
      }
    }
    
    return 'javascript'; // Default
  }
}

export const todoParser = new TodoParser();