import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

interface VectorDocument {
  id: string;
  content: string;
  vector?: number[];
  metadata?: Record<string, any>;
}

export class ClientSideVectorStore {
  private documents: VectorDocument[] = [];
  private model: GenerativeModel | null = null;
  private apiKey: string = '';
  private embeddingDimension: number = 768;

  constructor() {
    // Try to load from local storage on init
    this.loadFromLocalStorage();
    this.initializeModel();
  }

  private async initializeModel() {
    // Get API key from localStorage or env
    const apiKey = localStorage.getItem('geminiApiKey') || import.meta.env.VITE_GEMINI_API_KEY;
    
    if (apiKey) {
      this.apiKey = apiKey;
      const genAI = new GoogleGenerativeAI(apiKey);
      this.model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    }
  }

  // Add a document to the vector store
  async addDocument(content: string, metadata: Record<string, any> = {}): Promise<string> {
    if (!this.model) {
      await this.initializeModel();
      if (!this.model) {
        throw new Error('Unable to initialize model. API key may be missing.');
      }
    }

    // Generate an ID
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 9);
    
    // Generate embedding vector for the content
    const vector = await this.generateEmbedding(content);
    
    // Add to documents
    const document: VectorDocument = {
      id,
      content,
      vector,
      metadata
    };
    
    this.documents.push(document);
    
    // Save to localStorage
    this.saveToLocalStorage();
    
    return id;
  }

  // Generate embeddings using Gemini
  private async generateEmbedding(text: string): Promise<number[]> {
    if (!this.model) {
      throw new Error('Model not initialized');
    }
    
    try {
      // Use Gemini to generate embeddings indirectly (since direct embedding API may not be available)
      const prompt = `Convert the following text into an embedding vector representation with ${this.embeddingDimension} dimensions. Only return the vector as a JSON array of numbers, with no other text:

Text: "${text}"`;
  
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      // Extract the JSON array from the response
      const jsonMatch = response.match(/\[\s*-?\d+(\.\d+)?(,\s*-?\d+(\.\d+)?)*\s*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback: create a simple hash-based pseudo-embedding
      return this.createPseudoEmbedding(text);
      
    } catch (error) {
      console.error('Error generating embedding:', error);
      // Fallback to a simple pseudo-embedding if Gemini fails
      return this.createPseudoEmbedding(text);
    }
  }

  // Create a simple deterministic pseudo-embedding when API fails
  private createPseudoEmbedding(text: string): number[] {
    const vector: number[] = new Array(this.embeddingDimension).fill(0);
    
    // Simple hash function to generate pseudo-embeddings
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      const position = i % this.embeddingDimension;
      vector[position] += charCode / 255; // Normalize to 0-1 range
    }
    
    // Normalize the vector
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return vector.map(val => magnitude > 0 ? val / magnitude : 0);
  }

  // Search for similar documents
  async search(query: string, topK: number = 3): Promise<VectorDocument[]> {
    if (this.documents.length === 0) {
      return [];
    }
    
    // Generate embedding for the query
    const queryVector = await this.generateEmbedding(query);
    
    // Calculate similarity score for each document
    const scoredDocs = this.documents.map(doc => {
      const similarity = this.cosineSimilarity(queryVector, doc.vector || []);
      return { ...doc, score: similarity };
    });
    
    // Sort by similarity and return top K results
    return scoredDocs
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, topK);
  }

  // Calculate cosine similarity between two vectors
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length || vecA.length === 0) {
      return 0;
    }
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    
    if (normA === 0 || normB === 0) {
      return 0;
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  // Save documents to localStorage
  private saveToLocalStorage() {
    try {
      localStorage.setItem('vectorStore', JSON.stringify(this.documents));
    } catch (error) {
      console.error('Error saving vector store to localStorage:', error);
    }
  }

  // Load documents from localStorage
  private loadFromLocalStorage() {
    try {
      const stored = localStorage.getItem('vectorStore');
      if (stored) {
        this.documents = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading vector store from localStorage:', error);
    }
  }

  // Clear all documents
  clear() {
    this.documents = [];
    this.saveToLocalStorage();
  }

  // Get all documents
  getAllDocuments(): VectorDocument[] {
    return [...this.documents];
  }
} 