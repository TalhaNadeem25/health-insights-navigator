import { GoogleGenerativeAI } from "@google/generative-ai";

// This is a frontend-only implementation for demo purposes
// In a production environment, this should be handled by a backend service
// with proper security measures

// Get API key from environment variable
const DEFAULT_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || null;

let userProvidedApiKey: string | null = DEFAULT_API_KEY;

export const setGeminiApiKey = (apiKey: string) => {
  userProvidedApiKey = apiKey;
  localStorage.setItem("gemini-api-key", apiKey);
};

export const getGeminiApiKey = (): string | null => {
  if (userProvidedApiKey) return userProvidedApiKey;
  return localStorage.getItem("gemini-api-key") || DEFAULT_API_KEY;
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

    let prompt = '';
    
    if (healthData.freeFormReport) {
      // First, check if the input is health-related
      const scopeCheckPrompt = `
        You are a health content validator. Your task is to determine if the following text contains health-related information.
        Only respond with "HEALTH_RELATED" if the text contains health information, symptoms, medical conditions, or health concerns.
        Respond with "NOT_HEALTH_RELATED" if the text does not contain any health information.
        
        Text to check:
        "${healthData.freeFormReport}"
        
        Respond with ONLY ONE of these exact phrases:
        - HEALTH_RELATED
        - NOT_HEALTH_RELATED
      `;
      
      const scopeCheckResult = await model.generateContent(scopeCheckPrompt);
      const scopeCheckResponse = await scopeCheckResult.response;
      const scopeCheckText = scopeCheckResponse.text().trim();
      
      if (scopeCheckText !== "HEALTH_RELATED") {
        return {
          diabetesRisk: 0,
          heartRisk: 0,
          analysis: "The provided text does not contain health-related information. Please enter health symptoms, conditions, or concerns for analysis.",
          success: false,
        };
      }
      
      // If health-related, proceed with analysis
      prompt = `
        You are a specialized health analysis AI. Your task is to analyze the following health report and provide a comprehensive health assessment.
        Focus ONLY on health-related information and ignore any non-health details.
        
        Health Report:
        "${healthData.freeFormReport}"
        
        Please provide your analysis in the following format:
        1. A numerical risk score for overall health (1-100)
        2. A detailed analysis that includes:
           - Identified health risks and their severity (focus only on medical conditions, symptoms, and health indicators)
           - Specific health recommendations for improvement
           - Any immediate medical actions that should be taken
           - Preventive health measures if applicable
        
        Format your response with clear sections for risks and recommendations.
        Be specific and actionable in your health recommendations.
        Ignore any non-health related information in the report.
      `;
    } else {
      // Handle structured health data with improved health focus
      prompt = `
        You are a specialized health analysis AI. Your task is to analyze the following health data for an individual and assess their risk for diabetes and heart disease.
        Focus ONLY on health-related information and ignore any non-health details.
        
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
        3. A detailed analysis of approximately 250 words that explains the health risk assessment, key health factors, and health recommendations
      `;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract risk scores and analysis from the response
    const diabetesRiskMatch = text.match(/diabetes[^\d]*(\d+)/i);
    const heartRiskMatch = text.match(/heart disease[^\d]*(\d+)/i);
    const overallRiskMatch = text.match(/overall health[^\d]*(\d+)/i);
    
    const diabetesRisk = diabetesRiskMatch ? parseInt(diabetesRiskMatch[1]) : 50;
    const heartRisk = heartRiskMatch ? parseInt(heartRiskMatch[1]) : 50;
    const overallRisk = overallRiskMatch ? parseInt(overallRiskMatch[1]) : 50;
    
    // For free-form reports, use the overall risk score for both diabetes and heart risk
    const finalDiabetesRisk = healthData.freeFormReport ? overallRisk : diabetesRisk;
    const finalHeartRisk = healthData.freeFormReport ? overallRisk : heartRisk;
    
    // Extract analysis - assume it's the last portion of the text
    let analysis = text;
    // Remove any risk scores at the beginning if present
    analysis = analysis.replace(/^\d+\s*\n+\s*\d+\s*\n+/g, '');
    
    return {
      diabetesRisk: Math.min(Math.max(finalDiabetesRisk, 1), 100),
      heartRisk: Math.min(Math.max(finalHeartRisk, 1), 100),
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
