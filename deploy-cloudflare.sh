#!/bin/bash

# Health Insights Navigator Cloudflare Deployment Script
echo "🚀 Starting Health Insights Navigator deployment to Cloudflare..."

# Check if .env file exists and create .env.production
if [ ! -f .env ]; then
  echo "❌ .env file not found. Creating from .env.example..."
  cp .env.example .env
  echo "⚠️ Please edit .env file and add your Gemini API key"
  exit 1
fi

# Create .env.production for the Cloudflare deployment
cp .env .env.production

# Install Cloudflare pages if not installed
if ! command -v wrangler &> /dev/null; then
  echo "Installing Wrangler CLI for Cloudflare Pages..."
  npm install -g wrangler
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building application..."
npm run build

# Validate build
if [ ! -d "dist" ]; then
  echo "❌ Build failed: dist directory not found"
  exit 1
fi

# Check if user is logged in to Cloudflare
echo "🔑 Checking Cloudflare authentication..."
wrangler whoami || (echo "❌ Not logged in to Cloudflare. Please login." && wrangler login)

# Deploy to Cloudflare Pages
echo "☁️ Deploying to Cloudflare Pages..."
wrangler pages publish dist --project-name="health-insights-navigator" --branch=main

echo "🎉 Deployment complete!"
echo "Your Health Insights Navigator will be available at: https://health-insights-navigator.pages.dev"
echo "You can also set up your custom domain in the Cloudflare Pages dashboard."

# Add secrets to Cloudflare
echo "🔐 Do you want to add your Gemini API key as a secret to Cloudflare? (y/n)"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
  echo "Enter your Gemini API key:"
  read -r apikey
  wrangler pages secret put VITE_GEMINI_API_KEY --project-name="health-insights-navigator" << EOF
  $apikey
EOF
  echo "✅ API key added to Cloudflare Pages secrets"
fi

echo "
Health Insights Navigator v1.0.0
---------------------------------
Cloudflare Deployment Summary:
- Deployment URL: https://health-insights-navigator.pages.dev
- Build Size: $(du -sh dist | cut -f1)
- API Version: v1
- LLM Model: Google Gemini 1.5 Pro
- Deployment Time: $(date)
- Environment: Production

For support, contact: support@health-insights-navigator.com
"

# Save API key to .env.production
echo "VITE_GEMINI_API_KEY=$VITE_GEMINI_API_KEY" > .env.production
echo "VITE_API_BASE_URL=https://health-insights-api.domain.com/api" >> .env.production

# Deploy with Wrangler
echo "Deploying to Cloudflare Pages..."
npx wrangler pages publish dist --project-name=health-insights-navigator

echo "Deployment complete!" 