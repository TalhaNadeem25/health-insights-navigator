
import { GoogleGenerativeAI } from "@google/generative-ai";

// This is a frontend-only implementation for demo purposes
// In a production environment, this should be handled by a backend service
// with proper security measures

// Hard-coded API key for demo purposes
const GEMINI_API_KEY = "AIzaSyC4hmieneIcQwl6NJjoQvYoA62vPQYWoCM";

let userProvidedApiKey: string | null = GEMINI_API_KEY;

export const setGeminiApiKey = (apiKey: string) => {
  userProvidedApiKey = apiKey;
  localStorage.setItem("gemini-api-key", apiKey);
};

export const getGeminiApiKey = (): string | null => {
  if (userProvidedApiKey) return userProvidedApiKey;
  return localStorage.getItem("gemini-api-key") || GEMINI_API_KEY;
};

export const geminiAnalyzeHealth = async (
  healthData: any
): Promise<{
  diabetesRisk: number;
  heartRisk: number;
  analysis: string;
  success: boolean;
}> => {
  try {
    const apiKey = getGeminiApiKey();
    
    if (!apiKey) {
      return {
        diabetesRisk: 0,
        heartRisk: 0,
        analysis: "No API key provided. Please enter your Gemini API key in the settings.",
        success: false,
      };
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const prompt = `
      Analyze the following health data for an individual and assess their risk for diabetes and heart disease. 
      Provide a comprehensive analysis of risk factors and recommendations.
      
      Health Data:
      - Age: ${healthData.age}
      - Gender: ${healthData.gender}
      - BMI: ${healthData.bmi}
      - Blood Pressure: ${healthData.bloodPressure}
      - Smoking Status: ${healthData.smokingStatus}
      - Physical Activity Level: ${healthData.physicalActivity}
      - Family History of Chronic Diseases: ${healthData.familyHistory}
      - Dietary Habits: ${healthData.diet}
      
      Provide your response in the following format:
      1. A numerical risk score for diabetes (1-100)
      2. A numerical risk score for heart disease (1-100)
      3. A detailed analysis of approximately 250 words that explains the risk assessment, key factors, and recommendations
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract risk scores and analysis from the response
    const diabetesRiskMatch = text.match(/diabetes[^\d]*(\d+)/i);
    const heartRiskMatch = text.match(/heart disease[^\d]*(\d+)/i);
    
    const diabetesRisk = diabetesRiskMatch ? parseInt(diabetesRiskMatch[1]) : 50;
    const heartRisk = heartRiskMatch ? parseInt(heartRiskMatch[1]) : 50;
    
    // Extract analysis - assume it's the last portion of the text
    let analysis = text;
    // Remove any risk scores at the beginning if present
    analysis = analysis.replace(/^\d+\s*\n+\s*\d+\s*\n+/g, '');
    
    return {
      diabetesRisk: Math.min(Math.max(diabetesRisk, 1), 100),
      heartRisk: Math.min(Math.max(heartRisk, 1), 100),
      analysis: analysis.trim(),
      success: true,
    };
  } catch (error) {
    console.error("Error analyzing health data with Gemini:", error);
    return {
      diabetesRisk: 50,
      heartRisk: 50,
      analysis: `Error analyzing data: ${error instanceof Error ? error.message : String(error)}`,
      success: false,
    };
  }
};
