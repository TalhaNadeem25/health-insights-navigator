import { GoogleGenerativeAI } from '@google/generative-ai';
import * as XLSX from 'xlsx';

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

export interface ExtractedData {
  title: string;
  description: string;
  dataPoints: DataPoint[];
  metadata: Record<string, any>;
}

export interface DataPoint {
  id: string;
  values: Record<string, any>;
  category?: string;
  subcategory?: string;
}

/**
 * Extracts structured data from an Excel file using LLM
 */
export async function extractDataWithLLM(file: File): Promise<ExtractedData> {
  // First, read the Excel file to get raw data
  const rawData = await readExcelFile(file);
  
  // Convert the raw data to a string format for the LLM
  const dataString = JSON.stringify(rawData, null, 2);
  
  // Create a prompt for the LLM
  const prompt = `
    You are a data extraction assistant. Analyze the following Excel data and extract structured information.
    Identify the title, description, and data points from this data.
    Format the response as a JSON object with the following structure:
    {
      "title": "Title of the dataset",
      "description": "Brief description of what this data represents",
      "dataPoints": [
        {
          "id": "unique identifier",
          "values": { key-value pairs of data },
          "category": "optional category",
          "subcategory": "optional subcategory"
        }
      ],
      "metadata": { additional information about the dataset }
    }
    
    Here is the data to analyze:
    ${dataString}
  `;
  
  // Get the LLM model
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  
  // Generate content
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  
  // Extract the JSON from the response
  const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || 
                   text.match(/{[\s\S]*}/);
  
  if (!jsonMatch) {
    throw new Error('Failed to extract structured data from LLM response');
  }
  
  // Parse the JSON
  const jsonStr = jsonMatch[1] || jsonMatch[0];
  const extractedData = JSON.parse(jsonStr);
  
  return extractedData;
}

/**
 * Helper function to read Excel file and convert to JSON
 */
async function readExcelFile(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        
        // Get the first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
} 