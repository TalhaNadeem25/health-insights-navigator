import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js';
import healthDataRoutes from './routes/healthDataRoutes.js';
import predictionRoutes from './routes/predictionRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;

// CORS configuration
const corsOptions = {
  origin: [process.env.CLIENT_URL || 'http://localhost:3000', 'http://localhost:8080'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/health-data', healthDataRoutes);
app.use('/api/predictions', predictionRoutes);

// Temporary routes until we create the actual route files
app.get('/api/users/profile', (req, res) => {
  res.status(200).json({ user: { 
    id: '1', 
    email: 'demo@example.com', 
    firstName: 'Demo', 
    lastName: 'User',
    role: 'user' 
  }});
});

app.post('/api/users/login', (req, res) => {
  res.status(200).json({ 
    message: 'Login successful',
    token: 'demo-token-123456',
    user: { 
      id: '1', 
      email: 'demo@example.com', 
      firstName: 'Demo', 
      lastName: 'User',
      role: 'user' 
    }
  });
});

app.post('/api/users/register', (req, res) => {
  res.status(201).json({ 
    message: 'User registered successfully',
    token: 'demo-token-123456',
    user: { 
      id: '1', 
      email: req.body.email || 'demo@example.com', 
      firstName: req.body.firstName || 'Demo', 
      lastName: req.body.lastName || 'User',
      role: 'user' 
    }
  });
});

// Model deployment endpoints
app.post('/api/models/deploy', (req, res) => {
  res.status(200).json({
    message: 'Model deployed successfully',
    modelId: 'model-123',
    status: 'deployed',
    timestamp: new Date().toISOString(),
    metrics: {
      accuracy: 0.92,
      precision: 0.89,
      recall: 0.94,
      f1Score: 0.91
    }
  });
});

app.get('/api/models/:modelId/metrics', (req, res) => {
  res.status(200).json({
    modelId: req.params.modelId === 'latest' ? 'model-123' : req.params.modelId,
    status: 'deployed',
    timestamp: new Date().toISOString(),
    metrics: {
      accuracy: 0.92,
      precision: 0.89,
      recall: 0.94,
      f1Score: 0.91,
      latency: '120ms',
      throughput: '450 requests/min'
    },
    performanceHistory: [
      { date: '2023-04-01', accuracy: 0.89 },
      { date: '2023-04-15', accuracy: 0.90 },
      { date: '2023-05-01', accuracy: 0.92 }
    ]
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy', message: 'Health Insights API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Internal Server Error', 
    error: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 