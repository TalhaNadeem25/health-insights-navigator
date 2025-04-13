import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy', message: 'Health Insights API is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
