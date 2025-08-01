# VibeTorch 🔥

**AI-Powered Autonomous Code Agent Platform**

VibeTorch is an intelligent development automation platform that provides 24/7 AI agents to enhance your coding workflow. With the tagline "Vibe must flow. Rest easy, AI's got the night shift," VibeTorch offers automated code maintenance, optimization, and feature development when you're not around.

## 🚀 Core Features

### 🤖 **Intelligent Agent Modes**
- **Maintainer Mode**: Focuses on bug fixes, code optimization, and maintenance tasks
- **Visionary Mode**: Suggests new features, architecture improvements, and innovations  
- **Both Mode**: Full AI capabilities combining maintenance and visionary features
- **Off Mode**: Disable AI agent for all repositories

### 📋 **Task Management System**
- Plan and track work before agent execution
- Interactive task table with status tracking (Pending, In Progress, Completed, Blocked)
- Real-time task editing and status updates
- Task analytics and progress monitoring

### 📊 **Real-time Dashboard**
- Live monitoring of AI agent activities
- Token usage tracking and cost analysis
- Repository status indicators
- Performance metrics and optimization insights

### 🔗 **GitHub Integration**
- Seamless OAuth authentication
- Multi-repository support
- Automatic code analysis and suggestions
- Pull request automation

## 🛠 User Flow

### 1. **Authentication & Setup**
```
User visits VibeTorch → GitHub OAuth → Repository Access Granted
```

### 2. **Agent Configuration**
```
Select Agent Mode → Configure Activity Level → Connect Repositories
```

### 3. **Task Planning**
```
Create Tasks → Set Priorities → Define Success Criteria
```

### 4. **Autonomous Execution**
```
AI Agent Analyzes Code → Executes Tasks → Reports Results
```

### 5. **Monitoring & Review**
```
Real-time Dashboard → Review Changes → Approve/Reject → Iterate
```

## 🏗 System Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[React UI] --> B[VibeTorch Steps]
        B --> C[Task Management]
        B --> D[Agent Dashboard]
    end
    
    subgraph "Authentication"
        E[GitHub OAuth] --> F[Repository Access]
    end
    
    subgraph "Agent Core"
        G[Mode Selector] --> H{Agent Type}
        H -->|Maintainer| I[Bug Fixes & Optimization]
        H -->|Visionary| J[Feature Development]
        H -->|Both| K[Full Capabilities]
        H -->|Off| L[Disabled]
    end
    
    subgraph "Task Engine"
        M[Task Planner] --> N[Priority Queue]
        N --> O[Execution Engine]
        O --> P[Status Tracker]
    end
    
    subgraph "External Services"
        Q[GitHub API] --> R[Code Repository]
        S[Claude API] --> T[Token Management]
        U[Cost Tracker] --> V[Usage Analytics]
    end
    
    A --> E
    F --> G
    C --> M
    I --> Q
    J --> Q
    K --> Q
    O --> S
    P --> D
    T --> U
    V --> D
    
    style A fill:#f9f,stroke:#333,stroke-width:2px
    style G fill:#bbf,stroke:#333,stroke-width:2px
    style O fill:#bfb,stroke:#333,stroke-width:2px
    style Q fill:#ffb,stroke:#333,stroke-width:2px
```

## 📈 Technical Flow

```mermaid
sequenceDiagram
    participant U as User
    participant UI as VibeTorch UI
    participant Auth as GitHub OAuth
    participant Agent as AI Agent
    participant Repo as GitHub Repo
    participant API as Claude API
    
    U->>UI: Access Platform
    UI->>Auth: Initiate OAuth
    Auth->>U: Authentication Flow
    U->>Auth: Grant Permissions
    Auth->>UI: Access Token
    
    U->>UI: Configure Agent Mode
    UI->>Agent: Set Activity Level
    U->>UI: Create Tasks
    UI->>Agent: Queue Tasks
    
    loop Autonomous Execution
        Agent->>Repo: Analyze Code
        Agent->>API: Generate Solutions
        API->>Agent: Code Suggestions
        Agent->>Repo: Apply Changes
        Agent->>UI: Update Status
    end
    
    UI->>U: Display Results
    U->>UI: Review & Approve
```

## 🎯 Key Benefits

- **24/7 Automation**: AI works while you sleep
- **Smart Task Management**: Organized workflow with status tracking
- **Cost Transparency**: Real-time token usage and cost monitoring
- **Flexible Modes**: Customize AI behavior to your needs
- **GitHub Integration**: Seamless repository management

## 🔧 Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: React Hooks
- **Authentication**: GitHub OAuth
- **AI Provider**: Claude API
- **Build Tool**: Vite
- **Styling**: Custom design system with consistent color palette

## 🚦 Getting Started

1. **Clone the repository**
```bash
git clone <repository-url>
cd vibetorch
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

4. **Visit the application**
```
http://localhost:5173
```

## 📊 Usage Metrics

- **Token Tracking**: Monitor Claude API usage
- **Cost Analysis**: Real-time spending insights  
- **Task Analytics**: Success rates and completion times
- **Repository Health**: Code quality improvements

---

*VibeTorch - Where AI meets productivity. Let your code vibe while you rest.* 🌙✨