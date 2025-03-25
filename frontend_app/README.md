# VoiceMemo AI

VoiceMemo AI is an intelligent voice summarization system that transforms voice recordings into actionable insights.

## Deploy to Vercel

### Prerequisites

1. Make sure you have a [GitHub](https://github.com) account
2. Make sure you have a [Vercel](https://vercel.com) account (you can login with your GitHub account)

### Deploy from GitHub Repository

1. Push your code to a GitHub repository
   ```bash
   cd /path/to/your/project
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/your-username/your-repo-name.git
   git push -u origin main
   ```

2. Deploy through Vercel Console
   - Visit https://vercel.com and login
   - Click "Add New Project"
   - Import your GitHub repository
   - Configure project settings:
     - Root Directory: `frontend_app`
     - Framework Preset: Next.js
     - Build Command: `npm run build`
     - Install Command: `npm install --legacy-peer-deps`
     - Output Directory: `.next`
   - Click "Deploy"

### Environment Variables Configuration

If your application requires environment variables:

1. In the Vercel console, click on your project
2. Go to "Settings" > "Environment Variables"
3. Add necessary environment variables, such as API keys, etc.

### Deployment Complete

After successful deployment:
- Vercel will provide a deployment URL (e.g., https://your-project.vercel.app)
- You can manage your deployment in the Vercel console:
  - View deployment history
  - Set up custom domains
  - Configure environment variables
  - Monitor performance

## Local Development

```bash
# Navigate to the frontend app directory
cd frontend_app

# Install dependencies
npm install

# Start development server
npm run dev

# Build production version
npm run build

# Start production server
npm start
``` 