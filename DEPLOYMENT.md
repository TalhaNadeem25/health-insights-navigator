# Health Insights Navigator - Deployment Guide

This guide explains how to deploy the Health Insights Navigator application to Cloudflare Pages and Workers.

## Prerequisites

- Cloudflare account 
- Wrangler CLI (`npm install -g wrangler`)
- Node.js (18+)
- MongoDB Atlas account (configured with the provided connection string)

## Environment Variables

### Frontend (.env.production)
```
VITE_GEMINI_API_KEY=AIzaSyAcE4ZbgOGLQsrS8ihpODooTDdNZXQMTTo
VITE_API_BASE_URL=<your API URL> # Either Workers URL or self-hosted backend URL
```

### Backend (.env)
```
PORT=5001
MONGODB_URI=mongodb+srv://txn2702:CareRisk-Navigation@cluster0.0jqv6jz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=health-insights-secure-jwt-key-for-authentication
GEMINI_API_KEY=AIzaSyAcE4ZbgOGLQsrS8ihpODooTDdNZXQMTTo
CLIENT_URL=<your frontend URL>
```

## Deployment Steps

### 1. Deploy Backend 

#### Option A: Deploy to Cloudflare Workers

1. Login to Cloudflare:
   ```bash
   wrangler login
   ```

2. Deploy the worker:
   ```bash
   cd backend
   wrangler publish deploy-cloudflare-worker.js --name health-insights-api
   ```

3. Set environment variables in the Cloudflare dashboard:
   - Go to Cloudflare Dashboard > Workers > health-insights-api > Settings > Variables
   - Add the required variables (MONGODB_URI, JWT_SECRET, etc.)

#### Option B: Self-host Backend

1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```

### 2. Deploy Frontend to Cloudflare Pages

1. Update environment variables:
   ```bash
   # Set API URL to your Cloudflare Worker or backend URL
   echo "VITE_API_BASE_URL=https://health-insights-api.workers.dev/api" > .env.production
   echo "VITE_GEMINI_API_KEY=AIzaSyAcE4ZbgOGLQsrS8ihpODooTDdNZXQMTTo" >> .env.production
   ```

2. Deploy manually:
   ```bash
   npm install
   npm run build
   npx wrangler pages publish dist --project-name=health-insights-navigator
   ```

3. Or use GitHub Actions (recommended):
   - Push your code to GitHub
   - Add the following secrets to your repository:
     - `CLOUDFLARE_API_TOKEN`
     - `CLOUDFLARE_ACCOUNT_ID`
     - `VITE_GEMINI_API_KEY`
   - The GitHub workflow will automatically deploy on push to main

## Troubleshooting

- **Axios Related Errors**: We're using the native fetch API instead of axios to avoid dependencies
- **API Connection Issues**: Verify CORS settings in backend/server.js
- **MongoDB Connection Errors**: The connection string is already configured correctly
- **Authentication Errors**: Ensure JWT_SECRET is properly set
- **Worker Deployment Issues**: Check Wrangler version compatibility

## Testing

Run the basic API connectivity test:
```bash
node test-api.js
```

## Monitoring

Monitor your application's performance in the Cloudflare dashboard:
- Pages > health-insights-navigator
- Workers > health-insights-api 