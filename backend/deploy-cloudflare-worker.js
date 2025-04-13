// Cloudflare Worker for Health Insights Navigator API
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

// MongoDB connection string from environment variable
const MONGODB_URI = MONGODB_URI

// Define API routes
async function handleRequest(request) {
  const url = new URL(request.url)
  const path = url.pathname
  
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  }
  
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    })
  }
  
  // Add CORS headers to all responses
  const headers = {
    'Content-Type': 'application/json',
    ...corsHeaders
  }
  
  try {
    // Health check endpoint
    if (path === '/api/health') {
      return new Response(JSON.stringify({
        status: 'healthy',
        message: 'Health Insights API is running on Cloudflare Workers'
      }), { headers })
    }
    
    // Authentication endpoints
    if (path === '/api/users/login') {
      if (request.method === 'POST') {
        // Mock login response
        return new Response(JSON.stringify({
          message: 'Login successful',
          token: 'demo-token-123456',
          user: {
            id: '1',
            email: 'demo@example.com',
            firstName: 'Demo',
            lastName: 'User',
            role: 'user'
          }
        }), { headers })
      }
    }
    
    if (path === '/api/users/register') {
      if (request.method === 'POST') {
        // Mock registration response
        return new Response(JSON.stringify({
          message: 'User registered successfully',
          token: 'demo-token-123456',
          user: {
            id: '1',
            email: 'demo@example.com',
            firstName: 'Demo',
            lastName: 'User',
            role: 'user'
          }
        }), { headers })
      }
    }
    
    if (path === '/api/users/profile') {
      // Mock user profile response
      return new Response(JSON.stringify({
        user: {
          id: '1',
          email: 'demo@example.com',
          firstName: 'Demo',
          lastName: 'User',
          role: 'user'
        }
      }), { headers })
    }
    
    // Default response for unknown routes
    return new Response(JSON.stringify({
      error: 'Not Found',
      message: 'The requested endpoint does not exist'
    }), {
      status: 404,
      headers
    })
  } catch (error) {
    // Error handling
    return new Response(JSON.stringify({
      error: 'Internal Server Error',
      message: error.message
    }), {
      status: 500,
      headers
    })
  }
} 