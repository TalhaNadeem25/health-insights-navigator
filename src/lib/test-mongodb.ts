import clientPromise from './mongodb';

async function testConnection() {
  try {
    const client = await clientPromise;
    const db = client.db("HealthIntelligences");
    
    // Test the connection by listing collections
    const collections = await db.listCollections().toArray();
    console.log("Successfully connected to MongoDB!");
    console.log("Available collections:", collections.map(c => c.name));
    
    // Test inserting a document
    const testCollection = db.collection('connection_test');
    const result = await testCollection.insertOne({
      test: true,
      timestamp: new Date(),
      message: "MongoDB connection test"
    });
    console.log("Test document inserted:", result.insertedId);
    
    // Clean up test document
    await testCollection.deleteOne({ _id: result.insertedId });
    console.log("Test document cleaned up");
    
    return { success: true, message: "MongoDB connection test successful" };
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    return { success: false, message: error instanceof Error ? error.message : "Unknown error" };
  }
}

// Execute the test
testConnection().then(result => {
  console.log("Test result:", result);
}); 