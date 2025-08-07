import type { Todo, ProjectSuggestion, GitHubRepository, ProjectFiles, OctokitInstance } from '../types/index.js';
import { todoParser } from './todoParser.js';

// Use Octokit type alias
type Octokit = OctokitInstance;

class RepositoryService {
  async createImplementationRepo(
    octokit: Octokit, 
    sourceRepo: GitHubRepository, 
    todo: Todo
  ): Promise<GitHubRepository> {
    try {
      console.log(`🚀 Creating implementation repo for todo: ${todo.text}`);
      
      // Generate project suggestion
      const projectSuggestion = todoParser.generateProjectSuggestion(todo);
      const repoName = projectSuggestion.project.name;
      
      // Create the repository
      const { data: newRepo } = await octokit.rest.repos.createForAuthenticatedUser({
        name: repoName,
        description: `${projectSuggestion.project.description} | Generated from todo in ${sourceRepo.full_name}`,
        private: false,
        auto_init: true,
        gitignore_template: this.getGitignoreTemplate(projectSuggestion.project.technology),
        license_template: 'mit'
      });
      
      console.log(`✅ Created repository: ${newRepo.full_name}`);
      
      // Initialize the repository with project structure
      await this.initializeProject(octokit, newRepo, projectSuggestion, todo, sourceRepo);
      
      // Create initial issue mentioning Claude
      await this.createInitialIssue(octokit, newRepo, todo, sourceRepo);
      
      return newRepo;
    } catch (error) {
      console.error('❌ Error creating implementation repo:', error);
      throw error;
    }
  }
  
  private async initializeProject(
    octokit: Octokit,
    repo: GitHubRepository, 
    projectSuggestion: ProjectSuggestion, 
    originalTodo: Todo, 
    sourceRepo: GitHubRepository
  ): Promise<void> {
    const { owner, name } = repo;
    const { project } = projectSuggestion;
    
    // Create README.md
    const readmeContent = this.generateReadme(project, originalTodo, sourceRepo);
    await this.createFile(octokit, owner.login, name, 'README.md', readmeContent, 'Initialize project README');
    
    // Create project structure based on technology
    const projectFiles = this.generateProjectStructure(project.technology, project);
    
    for (const [filePath, content] of Object.entries(projectFiles)) {
      await this.createFile(octokit, owner.login, name, filePath, content, `Add ${filePath}`);
    }
    
    // Create CLAUDE.md with implementation instructions for Claude
    const claudeInstructions = this.generateClaudeInstructions(project, originalTodo);
    await this.createFile(octokit, owner.login, name, 'CLAUDE.md', claudeInstructions, 'Add Claude implementation instructions');
  }
  
  private async createFile(
    octokit: Octokit, 
    owner: string, 
    repo: string, 
    path: string, 
    content: string, 
    message: string
  ): Promise<void> {
    try {
      await octokit.rest.repos.createOrUpdateFileContents({
        owner,
        repo,
        path,
        message,
        content: Buffer.from(content).toString('base64')
      });
      console.log(`📝 Created file: ${path}`);
    } catch (error) {
      console.error(`❌ Error creating file ${path}:`, error);
    }
  }
  
  private async createInitialIssue(
    octokit: Octokit, 
    repo: GitHubRepository, 
    originalTodo: Todo, 
    sourceRepo: GitHubRepository
  ): Promise<any> {
    const issueTitle = `Implement: ${originalTodo.text}`;
    const issueBody = `
## Original Todo
From repository: [${sourceRepo.full_name}](${sourceRepo.html_url})

**Todo:** ${originalTodo.text}
**Priority:** ${originalTodo.priority}
**Tags:** ${originalTodo.tags.join(', ')}

## Implementation Request
@claude Please help implement this project based on the specifications in CLAUDE.md

## Features to Implement
- Core functionality as described in the original todo
- Clean, maintainable code structure
- Basic documentation
- Example usage

## Acceptance Criteria
- [ ] Core functionality working
- [ ] Code follows best practices
- [ ] Documentation is complete
- [ ] Example/demo is provided

*This issue was automatically created by the Claude Todo GitHub Service*
`;
    
    const { data: issue } = await octokit.rest.issues.create({
      owner: repo.owner.login,
      repo: repo.name,
      title: issueTitle,
      body: issueBody,
      labels: ['enhancement', 'claude-todo', 'auto-generated']
    });
    
    console.log(`📋 Created initial issue: ${issue.html_url}`);
    return issue;
  }
  
  private generateReadme(
    project: ProjectSuggestion['project'], 
    originalTodo: Todo, 
    sourceRepo: GitHubRepository
  ): string {
    return `# ${project.name}

${project.description}

## Origin
This project was automatically generated from a todo item in [${sourceRepo.full_name}](${sourceRepo.html_url}).

**Original Todo:** ${originalTodo.text}

## Features
${project.features.map(feature => `- ${feature}`).join('\n')}

## Technology Stack
- **Primary:** ${project.technology}
- **Generated with:** Claude Todo GitHub App

## Getting Started

1. Clone this repository
2. Install dependencies
3. Follow the implementation guide in \`CLAUDE.md\`
4. Check the issues for implementation tasks

## Implementation Status
🚧 **In Progress** - This project is currently being implemented.

## Contributing
This project welcomes contributions! Check the issues tab for tasks that need attention.

## Auto-Generated
This repository was created automatically by the Claude Todo GitHub Service.
The service detected a todo item mentioning "@claude" and created this implementation starter.

---
*Generated on ${new Date().toISOString()}*
`;
  }
  
  private generateProjectStructure(technology: string, project: ProjectSuggestion['project']): ProjectFiles {
    const structures: Record<string, ProjectFiles> = {
      javascript: {
        'package.json': this.generatePackageJson(project),
        'src/index.js': this.generateJavaScriptStarter(),
        '.gitignore': 'node_modules/\n.env\ndist/\nbuild/'
      },
      typescript: {
        'package.json': this.generatePackageJson(project, true),
        'src/index.ts': this.generateTypeScriptStarter(),
        'tsconfig.json': this.generateTsConfig(),
        '.gitignore': 'node_modules/\n.env\ndist/\nbuild/'
      },
      react: {
        'package.json': this.generateReactPackageJson(project),
        'src/App.jsx': this.generateReactStarter(),
        'src/index.js': this.generateReactIndexStarter(),
        'public/index.html': this.generateReactHtml(project),
        '.gitignore': 'node_modules/\n.env\nbuild/\ndist/'
      },
      python: {
        'requirements.txt': '# Add your dependencies here\n',
        'main.py': this.generatePythonStarter(),
        '.gitignore': '__pycache__/\n*.pyc\n.env\nvenv/\n.venv/'
      }
    };
    
    return structures[technology] || structures.javascript;
  }
  
  private generatePackageJson(project: ProjectSuggestion['project'], typescript = false): string {
    return JSON.stringify({
      name: project.name,
      version: "1.0.0",
      description: project.description,
      main: typescript ? "dist/index.js" : "src/index.js",
      scripts: {
        start: "node src/index.js",
        dev: "nodemon src/index.js",
        ...(typescript && {
          build: "tsc",
          "start:prod": "node dist/index.js"
        })
      },
      dependencies: {},
      devDependencies: {
        nodemon: "^3.0.0",
        ...(typescript && {
          typescript: "^5.0.0",
          "@types/node": "^20.0.0"
        })
      },
      keywords: project.features,
      author: "",
      license: "MIT"
    }, null, 2);
  }
  
  private generateReactPackageJson(project: ProjectSuggestion['project']): string {
    return JSON.stringify({
      name: project.name,
      version: "1.0.0",
      description: project.description,
      dependencies: {
        react: "^18.2.0",
        "react-dom": "^18.2.0"
      },
      devDependencies: {
        "@vitejs/plugin-react": "^4.0.0",
        vite: "^4.4.0"
      },
      scripts: {
        dev: "vite",
        build: "vite build",
        preview: "vite preview"
      },
      keywords: project.features,
      author: "",
      license: "MIT"
    }, null, 2);
  }
  
  private generateJavaScriptStarter(): string {
    return `// TODO: Implement your project here
console.log('Hello from your new project!');

// Add your implementation below
function main() {
    // Your code here
}

main();
`;
  }
  
  private generateTypeScriptStarter(): string {
    return `// TODO: Implement your project here
console.log('Hello from your new TypeScript project!');

// Add your implementation below
function main(): void {
    // Your code here
}

main();
`;
  }
  
  private generateReactStarter(): string {
    return `import React from 'react';

function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Welcome to Your New React Project!</h1>
      <p>This project was auto-generated from a todo item.</p>
      <p>Start implementing your features below!</p>
      
      {/* TODO: Add your components and features here */}
    </div>
  );
}

export default App;
`;
  }
  
  private generateReactIndexStarter(): string {
    return `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
`;
  }
  
  private generateReactHtml(project: ProjectSuggestion['project']): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${project.name}</title>
</head>
<body>
    <div id="root"></div>
</body>
</html>
`;
  }
  
  private generatePythonStarter(): string {
    return `#!/usr/bin/env python3
"""
TODO: Implement your project here
"""

def main():
    """Main function - add your implementation here"""
    print("Hello from your new Python project!")
    # Your code here

if __name__ == "__main__":
    main()
`;
  }
  
  private generateTsConfig(): string {
    return JSON.stringify({
      compilerOptions: {
        target: "ES2020",
        module: "commonjs",
        outDir: "./dist",
        rootDir: "./src",
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true
      },
      include: ["src/**/*"],
      exclude: ["node_modules"]
    }, null, 2);
  }
  
  private generateClaudeInstructions(
    project: ProjectSuggestion['project'], 
    originalTodo: Todo
  ): string {
    return `# Claude Implementation Instructions

## Project Overview
**Original Todo:** ${originalTodo.text}
**Technology:** ${project.technology}
**Priority:** ${originalTodo.priority}

## Implementation Guidelines

### Core Requirements
1. Implement the functionality described in the original todo
2. Follow best practices for ${project.technology}
3. Write clean, maintainable code
4. Add appropriate error handling
5. Include basic documentation

### Features to Implement
${project.features.map(feature => `- ${feature}`).join('\n')}

### Suggested Architecture
\`\`\`
src/
├── index.${project.technology === 'typescript' ? 'ts' : 'js'}    # Main entry point
├── core/                    # Core business logic
├── utils/                   # Utility functions
├── types/                   # Type definitions (if using TypeScript)
└── examples/                # Usage examples
\`\`\`

### Implementation Steps
1. **Setup**: Ensure all dependencies are installed
2. **Core Logic**: Implement the main functionality
3. **Testing**: Add basic tests if appropriate
4. **Documentation**: Update README with usage examples
5. **Examples**: Create demonstration of features

### Claude Commands
When working on this project, you can use these patterns:

- \`@claude implement [feature]\` - Ask Claude to implement a specific feature
- \`@claude refactor [component]\` - Ask Claude to refactor existing code
- \`@claude test [function]\` - Ask Claude to add tests
- \`@claude document [module]\` - Ask Claude to add documentation

## Quality Checklist
- [ ] Code follows language conventions
- [ ] Error handling is implemented
- [ ] Basic documentation exists
- [ ] Code is modular and reusable
- [ ] Examples demonstrate usage

## Notes
- This project was auto-generated from a todo item
- Focus on implementing the core functionality first
- Optimize and add features incrementally

---
*Generated by Claude Todo GitHub Service*
`;
  }
  
  private getGitignoreTemplate(technology: string): string | undefined {
    const templates: Record<string, string> = {
      javascript: 'Node',
      typescript: 'Node', 
      react: 'Node',
      python: 'Python'
    };
    
    return templates[technology] || 'Node';
  }
}

export const repositoryService = new RepositoryService();