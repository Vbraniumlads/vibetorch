# Claude Todo GitHub App

A GitHub App that automatically reads todo lists from repositories and creates new implementation repositories when todos mention "@claude".

## Features

- 🔍 **Todo Detection**: Scans repositories for todo items in various formats
- 🤖 **Claude Integration**: Responds to @claude mentions in issues and todos
- 🚀 **Auto Repository Creation**: Creates implementation repositories with project structure
- 📋 **Smart Parsing**: Supports multiple todo formats (markdown, comments, etc.)
- 🛠️ **Project Setup**: Generates appropriate project structure based on detected technology

## How It Works

1. **Monitor Repositories**: The app listens for push events and issue updates
2. **Parse Todo Lists**: Extracts todo items from files like README.md, TODO.md, etc.
3. **Detect Claude Mentions**: Identifies todos or issues mentioning "@claude"
4. **Create Implementation Repo**: Automatically creates a new repository with:
   - Project structure based on detected technology
   - Initial README with project description
   - CLAUDE.md with implementation instructions
   - Initial issue tagged for Claude assistance

## Supported Todo Formats

```markdown
# Markdown Checkboxes
- [ ] Create user authentication system @claude
- [x] Setup database connection

# Todo Comments  
// TODO: Implement payment processing @claude
# TODO: Add email notifications @claude

# Simple Lists
- Build React dashboard @claude
- Create API endpoints
- Write documentation

# Numbered Lists
1. Setup project structure @claude
2. Implement core features
3. Add tests
```

## Installation

### 1. Create GitHub App

1. Go to GitHub Settings > Developer settings > GitHub Apps
2. Click "New GitHub App"
3. Use the manifest from `app-manifest.json` or fill in manually:
   - **App name**: Claude Todo Implementation Bot
   - **Homepage URL**: Your app URL
   - **Webhook URL**: `https://your-domain.com/webhook`
   - **Webhook secret**: Generate a secure random string
   - **Permissions**: See manifest for required permissions
   - **Events**: push, issues, issue_comment, installation

### 2. Setup Environment

```bash
# Clone and setup
git clone <your-repo>
cd github-app-backend
npm install

# Configure environment
cp .env.example .env
# Edit .env with your GitHub App credentials
```

### 3. Environment Variables

```env
GITHUB_APP_ID=your_app_id
GITHUB_PRIVATE_KEY_PATH=path/to/private-key.pem
GITHUB_WEBHOOK_SECRET=your_webhook_secret
PORT=3001
NODE_ENV=development
```

### 4. Run the App

```bash
# Development
npm run dev

# Production
npm start
```

## Usage

### 1. Install the App
Install the GitHub App on repositories where you want todo monitoring.

### 2. Create Todos with @claude
Add todos mentioning @claude in your repository:

```markdown
# In README.md or TODO.md
- [ ] Build user dashboard with React @claude
- [ ] Create REST API for data management @claude
- [ ] Implement real-time notifications @claude
```

### 3. Automatic Repository Creation
When you push changes containing @claude todos, the app will:
1. Parse the todo items
2. Create a new repository named based on the todo
3. Setup initial project structure
4. Create an issue for implementation

### 4. Claude Assistance
In the created repository, you can:
- Comment on issues mentioning @claude for help
- Request implementation assistance
- Ask for code reviews
- Get explanations of concepts

## Project Structure

```
github-app-backend/
├── src/
│   ├── controllers/
│   │   └── webhookController.js    # Webhook event handling
│   ├── services/
│   │   ├── todoParser.js           # Todo extraction logic
│   │   ├── repositoryService.js    # Repository creation
│   │   └── claudeService.js        # Claude interaction
│   ├── routes/
│   │   └── index.js                # Route setup
│   └── index.js                    # Main server
├── app-manifest.json               # GitHub App configuration
├── package.json
└── README.md
```

## Supported Technologies

The app automatically detects technology from todo text and creates appropriate project structures:

- **JavaScript/Node.js**: Express.js starter
- **TypeScript**: TypeScript configuration
- **React**: React app with Vite
- **Python**: Python starter with requirements.txt
- **Auto-detection**: Based on keywords in todo text

## API Endpoints

- `GET /health` - Health check
- `POST /webhook` - GitHub webhook handler
- `GET /callback` - Installation callback

## Development

### Local Development

1. Use ngrok or similar service to expose your local server:
   ```bash
   ngrok http 3001
   ```

2. Update your GitHub App webhook URL to the ngrok URL

3. Install the app on a test repository

4. Create test todos and push changes

### Testing

Create test todos in a repository:

```markdown
# Test Todo List
- [ ] Create a simple calculator app with React @claude
- [ ] Build a todo list manager @claude
- [ ] Implement user authentication system @claude
```

## Webhook Events

The app responds to these GitHub events:

- **push**: Monitors for todo file changes
- **issues**: Responds to @claude mentions in issues
- **issue_comment**: Handles @claude mentions in comments
- **installation**: Manages app installations

## Security

- Webhook signatures are verified using the secret
- GitHub App authentication uses JWT tokens
- Private keys should be stored securely
- Environment variables contain sensitive data

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes and test
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
1. Check the GitHub Issues
2. Review the webhook logs
3. Verify GitHub App permissions
4. Test with simple todo examples

---

*Built with ❤️ for automated development workflows*