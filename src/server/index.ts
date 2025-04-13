import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import clientPromise from './mongodb';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// MongoDB connection test endpoint
app.get('/api/db-test', async (req, res) => {
  try {
    const client = await clientPromise;
    const db = client.db("HealthIntelligencess");
    const collections = await db.listCollections().toArray();
    
    res.json({
      status: 'ok',
      message: 'Successfully connected to MongoDB',
      collections: collections.map(c => c.name)
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Failed to connect to database'
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 