import { App } from '@octokit/app';
import { readFileSync } from 'fs';
import { config } from 'dotenv';

config();

// Read private key
const privateKey = readFileSync('./vibe-torch.2025-08-05.private-key.pem', 'utf8');

// Initialize GitHub App
const app = new App({
  appId: process.env.GITHUB_APP_ID,
  privateKey: privateKey,
});

async function findInstallationId() {
  try {
    console.log('🔍 Finding installation ID...');
    
    // List all installations for this app
    const { data: installations } = await app.octokit.request('GET /app/installations');
    
    console.log(`📋 Found ${installations.length} installation(s):`);
    
    for (const installation of installations) {
      console.log(`\n📦 Installation ID: ${installation.id}`);
      console.log(`👤 Account: ${installation.account.login}`);
      console.log(`📅 Created: ${installation.created_at}`);
      console.log(`🔧 Permissions:`, Object.keys(installation.permissions));
      
      // Get repositories for this installation
      try {
        const octokit = await app.getInstallationOctokit(installation.id);
        const { data: repos } = await octokit.request('GET /installation/repositories');
        
        console.log(`📚 Repositories (${repos.total_count}):`);
        for (const repo of repos.repositories) {
          console.log(`  - ${repo.full_name}`);
          if (repo.full_name === 'Vbraniumlads/vibetorch') {
            console.log(`✅ FOUND TARGET REPO! Installation ID: ${installation.id}`);
          }
        }
      } catch (error) {
        console.error(`❌ Error getting repositories for installation ${installation.id}:`, error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Error finding installation ID:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

findInstallationId();