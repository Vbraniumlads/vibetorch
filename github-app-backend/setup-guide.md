# Claude Todo GitHub App - Setup Guide

This guide will walk you through setting up the Claude Todo GitHub App step by step.

## Prerequisites

- Node.js 18+ installed
- GitHub account with repository access
- Basic understanding of GitHub Apps
- A domain/server for hosting (or ngrok for development)

## Step 1: Create GitHub App

### Option A: Using App Manifest (Recommended)

1. Go to https://github.com/settings/apps
2. Click "New GitHub App"
3. Click "Create GitHub App from manifest"
4. Paste the content from `app-manifest.json`
5. Update the URLs with your actual domain
6. Generate a webhook secret (save this!)
7. Generate and download the private key

### Option B: Manual Setup

1. Go to https://github.com/settings/apps
2. Click "New GitHub App"
3. Fill in the details:

**Basic Information:**
- GitHub App name: `Claude Todo Implementation Bot`
- Homepage URL: `https://your-domain.com`
- Webhook URL: `https://your-domain.com/webhook`
- Webhook secret: Generate a secure random string

**Permissions:**
- Repository permissions:
  - Contents: Read & Write
  - Issues: Read & Write
  - Metadata: Read
  - Pull requests: Read & Write
- Account permissions: (none needed)

**Events:**
- [x] Push
- [x] Issues  
- [x] Issue comment
- [x] Installation
- [x] Installation repositories

## Step 2: Configure Environment

1. Clone this repository:
```bash
git clone <your-repo-url>
cd github-app-backend
```

2. Install dependencies:
```bash
npm install
```

3. Setup environment variables:
```bash
cp .env.example .env
```

4. Edit `.env` file:
```env
# GitHub App Configuration (from step 1)
GITHUB_APP_ID=123456
GITHUB_PRIVATE_KEY_PATH=./private-key.pem
GITHUB_WEBHOOK_SECRET=your_webhook_secret_here

# Server Configuration
PORT=3001
NODE_ENV=development

# Optional: Claude API if using direct integration
CLAUDE_API_KEY=your_claude_api_key_here
```

5. Place your GitHub App private key file in the project root as `private-key.pem`

## Step 3: Development Setup

### Local Development with ngrok

1. Install ngrok: https://ngrok.com/download

2. Start your local server:
```bash
npm run dev
```

3. In another terminal, expose your local server:
```bash
ngrok http 3001
```

4. Copy the ngrok HTTPS URL (e.g., `https://abc123.ngrok.io`)

5. Update your GitHub App webhook URL:
   - Go to your GitHub App settings
   - Update Webhook URL to: `https://abc123.ngrok.io/webhook`

## Step 4: Install the App

1. Go to your GitHub App settings
2. Click "Install App"
3. Choose the account/organization
4. Select repositories (or "All repositories")
5. Click "Install"

## Step 5: Test the Setup

### Create a Test Repository

1. Create a new repository (or use existing)
2. Create a file called `TODO.md` or update `README.md`
3. Add some test todos:

```markdown
# Project Todo List

## Features to Implement
- [ ] Create user authentication system @claude
- [ ] Build React dashboard with charts @claude  
- [ ] Implement email notifications
- [ ] Add payment processing with Stripe @claude

## Bug Fixes
- [ ] Fix mobile responsive issues
- [ ] Optimize database queries @claude
```

4. Commit and push the changes
5. Check your server logs for webhook events

### Verify Webhook Reception

You should see logs like:
```
📨 Received push event
📋 Found 1 potential todo files
📋 Found 4 todos in TODO.md
🤖 Processing Claude-mentioned todo: Create user authentication system @claude
🚀 Creating implementation repo for todo: Create user authentication system @claude
✅ Created repository: username/create-user-authentication-system
```

## Step 6: Test Issue Mentions

1. Go to one of the auto-created repositories
2. Create a new issue
3. In the issue description, mention @claude:

```markdown
@claude help implement user authentication

I need help building a secure authentication system with:
- User registration and login
- Password hashing
- JWT tokens
- Session management

Please provide implementation guidance and code examples.
```

4. Submit the issue
5. Check for Claude's automated response

## Troubleshooting

### Common Issues

**1. Webhook not received**
- Check ngrok is running and URL is correct
- Verify webhook secret matches
- Look at GitHub App webhook delivery logs

**2. Authentication errors**
- Verify App ID is correct
- Check private key file path and format
- Ensure app is installed on the repository

**3. Repository creation fails**
- Check GitHub App permissions (Contents: Write)
- Verify the app is installed on the account
- Look at server error logs

**4. No todos detected**
- Check file names (README.md, TODO.md, etc.)
- Verify todo format matches supported patterns
- Look for "@claude" mentions in todos

### Debug Logs

Enable debug logging:
```env
NODE_ENV=development
DEBUG=*
```

Check webhook deliveries in GitHub:
1. Go to your GitHub App settings
2. Click "Advanced" tab
3. View "Recent Deliveries"

### Test Webhook Locally

Use curl to test your webhook endpoint:
```bash
curl -X POST http://localhost:3001/webhook \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: ping" \
  -d '{"zen": "Keep it simple."}'
```

## Production Deployment

### Deploy to Heroku

1. Install Heroku CLI
2. Create Heroku app:
```bash
heroku create your-app-name
```

3. Set environment variables:
```bash
heroku config:set GITHUB_APP_ID=123456
heroku config:set GITHUB_PRIVATE_KEY="$(cat private-key.pem)"
heroku config:set GITHUB_WEBHOOK_SECRET=your_secret
```

4. Deploy:
```bash
git push heroku main
```

5. Update GitHub App webhook URL to your Heroku URL

### Deploy to Other Platforms

- **Railway**: Connect GitHub repo and set environment variables
- **Render**: Similar to Heroku, add environment variables
- **DigitalOcean App Platform**: Use app spec with environment variables
- **VPS**: Use PM2 or similar process manager

## Security Considerations

1. **Keep private key secure**: Never commit to version control
2. **Use HTTPS**: Always use HTTPS for webhook URLs
3. **Validate webhooks**: The app verifies webhook signatures
4. **Environment variables**: Store sensitive data in environment variables
5. **Repository permissions**: Only grant necessary permissions

## Next Steps

Once setup is complete:

1. **Test thoroughly**: Try different todo formats and @claude mentions
2. **Monitor logs**: Watch for errors and performance issues  
3. **Customize**: Modify todo patterns and response templates
4. **Scale**: Consider rate limiting and error handling for production use

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review GitHub App webhook delivery logs
3. Check server logs for error messages
4. Create an issue in this repository

---

*Happy automating! 🤖*