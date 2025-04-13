# Health Insights Navigator

A comprehensive health data analysis and visualization platform.

## Environment Variables

This project uses environment variables for configuration. Create a `.env` file in the root directory with the following variables:

```
# API Configuration
VITE_API_BASE_URL=https://data.healthcare.gov/api/1

# Development Mode (set to false to use real data)
VITE_USE_REAL_DATA=false

# Gemini API Key (for health analysis)
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### Configuration Options

- `VITE_API_BASE_URL`: The base URL for the healthcare data API
- `VITE_USE_REAL_DATA`: Set to `false` to use real data from the API, `true` to use mock data
- `VITE_GEMINI_API_KEY`: Your Google Gemini API key for health analysis features

You can get a Gemini API key from [Google AI Studio](https://ai.google.dev/).

## Data Sources

The application can work with both real and mock data:

1. **Real Data Mode** (`VITE_USE_REAL_DATA=false`):
   - Fetches data from the healthcare API
   - Requires proper API endpoint configuration
   - Includes fallback to mock data if API is unavailable

2. **Mock Data Mode** (`VITE_USE_REAL_DATA=true`):
   - Uses predefined mock data for development
   - Useful for testing and development
   - No API connection required

## Development Setup

1. Clone the repository
2. Copy `.env.example` to `.env` and configure your environment variables
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Technologies Used

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Google Gemini AI
- React Query
- Recharts
- Leaflet

## Features

- Real-time health data visualization
- Community health risk assessment
- Individual health risk analysis
- Resource optimization recommendations
- Interactive data maps and charts
- AI-powered health insights

## Project info

**URL**: https://lovable.dev/projects/fcb93237-a2d8-4b75-8b9e-c85054bdd080

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/fcb93237-a2d8-4b75-8b9e-c85054bdd080) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Create a .env file with your Gemini API key
# Copy .env.example to .env and update with your API key

# Step 4: Install the necessary dependencies.
npm i

# Step 5: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/fcb93237-a2d8-4b75-8b9e-c85054bdd080) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
