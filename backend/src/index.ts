import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// MongoDB setup
const uri = process.env.MONGODB_URI; // Note: Changed from VITE_MONGODB_URI
if (!uri) {
  throw new Error('Missing MONGODB_URI environment variable');
}

const client = new MongoClient(uri);
let clientPromise: Promise<MongoClient>;

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
    const db = client.db("healthinsights");
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

// Initialize MongoDB connection
async function initMongoDB() {
  try {
    clientPromise = client.connect();
    await clientPromise;
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

// Start server
initMongoDB().then(() => {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}); 