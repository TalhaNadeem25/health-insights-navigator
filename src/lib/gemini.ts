import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// This is a frontend-only implementation for demo purposes
// In a production environment, this should be handled by a backend service
// with proper security measures

// Safety settings for Gemini calls - more permissive for medical discussions
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

// Default server-side API key from environment variables
// In production, this should be handled by a secure backend service
const DEFAULT_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

// Local storage key for API key
const GEMINI_API_KEY_STORAGE = "gemini_api_key";

// Function to get the API key - tries local storage first, then falls back to default
export const getGeminiApiKey = (): string => {
  const storedKey = localStorage.getItem(GEMINI_API_KEY_STORAGE);
  return storedKey || DEFAULT_API_KEY;
};

// Function to set the API key in local storage
export const setGeminiApiKey = (apiKey: string): void => {
  localStorage.setItem(GEMINI_API_KEY_STORAGE, apiKey);
};

// Function to check if we have a valid API key (either stored or default)
export const hasValidApiKey = (): boolean => {
  return !!getGeminiApiKey();
};

// General purpose prompt template for health data analysis
const healthAnalysisPrompt = `You are an AI health advisor specializing in analyzing health data and providing insights.
I want you to analyze the following health information, understand symptoms and health details, and provide a thorough analysis.

Your analysis should include:
1. An assessment of potential health risks
2. Specific insights about any conditions that may be relevant
3. Clear recommendations based on the information provided
4. A confidence score for your analysis (0-100%)

Remember to be thorough but understandable, and make it clear when you're uncertain.
Do not provide a definitive diagnosis, but rather offer insights and recommendations.

Respond in a conversational tone that is helpful and empathetic.
`;

// RAG knowledge base for improved accuracy - these are pre-loaded medical contexts
const medicalKnowledgeBase = [
  {
    topic: "diabetes",
    information: `Diabetes is a chronic health condition that affects how your body turns food into energy. Most of the food you eat is broken down into glucose (sugar) and released into your bloodstream. When your blood sugar goes up, it signals your pancreas to release insulin, which acts like a key to let the blood sugar into your body's cells for use as energy.

Risk factors include:
- Family history of diabetes
- Overweight or obesity
- Age 45 or older
- Physical inactivity
- History of gestational diabetes
- Prediabetes
- High blood pressure
- Abnormal cholesterol levels

Common symptoms include:
- Increased thirst and urination
- Increased hunger
- Fatigue
- Blurred vision
- Numbness or tingling in feet or hands
- Slow-healing sores
- Unexplained weight loss

Early detection is key to preventing complications such as heart disease, kidney damage, and nerve damage.`
  },
  {
    topic: "heart disease",
    information: `Heart disease refers to several types of heart conditions. The most common type is coronary artery disease, which can cause heart attack, angina, heart failure, and arrhythmias.

Risk factors include:
- High blood pressure
- High cholesterol
- Smoking
- Diabetes
- Overweight or obesity
- Unhealthy diet
- Physical inactivity
- Excessive alcohol use
- Family history of heart disease
- Age (risk increases as you get older)

Common symptoms may include:
- Chest pain, chest tightness, chest pressure and chest discomfort (angina)
- Shortness of breath
- Pain, numbness, weakness or coldness in legs or arms
- Pain in the neck, jaw, throat, upper abdomen or back
- Fluttering in chest (palpitations)

Preventive measures include:
- Regular physical activity
- Maintaining a healthy diet and weight
- Not smoking
- Limiting alcohol consumption
- Managing stress
- Regular health screenings`
  },
  {
    topic: "respiratory conditions",
    information: `Respiratory conditions affect the airways and other structures of the lung. Common respiratory conditions include asthma, chronic obstructive pulmonary disease (COPD), pulmonary fibrosis, pneumonia, and lung cancer.

Risk factors vary by specific condition but may include:
- Smoking
- Environmental pollutants
- Occupational exposures
- Genetic factors
- Allergies
- Respiratory infections

Common symptoms across respiratory conditions may include:
- Shortness of breath
- Chronic cough
- Wheezing
- Chest pain or tightness
- Mucus production
- Fatigue
- Recurring respiratory infections

Prevention and management strategies include:
- Avoiding tobacco smoke and air pollution
- Vaccination against preventable respiratory infections
- Proper treatment of respiratory infections
- Regular exercise to strengthen lungs
- Management of allergies and asthma
- Occupational safety measures`
  },
  {
    topic: "mental health",
    information: `Mental health includes emotional, psychological, and social well-being. It affects how we think, feel, act, make choices, and relate to others. Mental health conditions include depression, anxiety disorders, bipolar disorder, schizophrenia, and eating disorders.

Risk factors include:
- Genetic factors
- Brain chemistry
- Trauma or abuse
- Family history of mental health conditions
- Life experiences such as stress or a history of abuse
- Biological factors such as chemical imbalances in the brain

Common symptoms vary by condition but may include:
- Persistent sadness or low mood
- Excessive worry or fear
- Extreme mood changes
- Social withdrawal
- Fatigue
- Problems with sleep
- Changes in appetite
- Difficulty perceiving reality
- Substance abuse

Treatment and management strategies include:
- Psychotherapy/counseling
- Medication
- Self-help strategies
- Lifestyle changes
- Support groups
- Stress management techniques`
  }
];

interface HealthInsight {
  condition: string;
  riskLevel: string;
  confidence: number;
  details: string;
  recommendations: string[];
}

// Function to analyze health data using Gemini
export const geminiAnalyzeHealth = async ({
  userInput,
  conversationHistory = "",
  enhancedAnalysis = false
}: {
  userInput: string;
  conversationHistory?: string;
  enhancedAnalysis?: boolean;
}): Promise<{
  success: boolean;
  analysis: string;
  error?: string;
  insights?: HealthInsight[];
  diabetesRisk?: number;
  heartRisk?: number;
}> => {
  try {
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      return {
        success: false,
        analysis: "No API key provided. Please set your Google Gemini API key first.",
      };
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      safetySettings,
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 2048,
      },
    });

    // Build a more comprehensive context for the model
    let context = healthAnalysisPrompt;
    
    // Add conversation history for continuity
    if (conversationHistory) {
      context += `\n\nPrevious conversation:\n${conversationHistory}\n\n`;
    }
    
    // Enhance analysis with RAG if enabled
    if (enhancedAnalysis) {
      // Extract keywords to match with our knowledge base
      const keywords = extractKeywords(userInput.toLowerCase());
      
      // Find relevant knowledge entries
      const relevantKnowledge = medicalKnowledgeBase.filter(entry => 
        keywords.some(keyword => entry.topic.includes(keyword))
      );
      
      // Add relevant knowledge to context
      if (relevantKnowledge.length > 0) {
        context += "\n\nAdditional medical context to inform your analysis:\n";
        relevantKnowledge.forEach(entry => {
          context += `\n--- ${entry.topic.toUpperCase()} ---\n${entry.information}\n`;
        });
      }
    }
    
    context += `\n\nUser health information:\n${userInput}\n\n`;
    
    // Add JSON output instructions for structured insights
    if (enhancedAnalysis) {
      context += `\nAfter your conversational response, please also include a JSON object with structured insights in the following format (enclosed in triple backticks):

\`\`\`json
{
  "insights": [
    {
      "condition": "condition name",
      "riskLevel": "high/medium/low",
      "confidence": 0.75,
      "details": "detailed information about this condition",
      "recommendations": ["recommendation 1", "recommendation 2"]
    }
  ],
  "diabetesRisk": 65,
  "heartRisk": 70,
  "confidenceScore": 0.85
}
\`\`\`

Make sure your response is helpful, accurate, and compassionate.`;
    }

    const result = await model.generateContent(context);
    const response = result.response;
    const textResponse = response.text();
    
    // Extract JSON insights if available
    let insights: HealthInsight[] = [];
    let diabetesRisk = 0;
    let heartRisk = 0;
    
    if (enhancedAnalysis) {
      const jsonMatch = textResponse.match(/```(?:json)?\s*({[\s\S]*?})\s*```/);
      
      if (jsonMatch && jsonMatch[1]) {
        try {
          const parsedData = JSON.parse(jsonMatch[1]);
          insights = parsedData.insights || [];
          diabetesRisk = parsedData.diabetesRisk || 0;
          heartRisk = parsedData.heartRisk || 0;
          
          // Remove the JSON block from the text response
          const cleanResponse = textResponse.replace(/```(?:json)?\s*{[\s\S]*?}\s*```/, '').trim();
          
          return {
            success: true,
            analysis: cleanResponse,
            insights,
            diabetesRisk,
            heartRisk
          };
        } catch (e) {
          console.error("Error parsing JSON from Gemini response:", e);
        }
      }
    }

    return {
      success: true,
      analysis: textResponse,
      insights,
      diabetesRisk,
      heartRisk
    };
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return {
      success: false,
      analysis: "",
      error: error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
};

// Helper function to extract keywords for RAG retrieval
function extractKeywords(text: string): string[] {
  const medicalKeywords = [
    "diabetes", "heart", "blood pressure", "cholesterol", "lung", "breathing", 
    "respiratory", "mental health", "depression", "anxiety", "asthma", "cancer", 
    "pain", "chronic", "surgery", "medication", "allergy", "fatigue", "weight", 
    "diet", "exercise", "sleep", "headache", "infection", "fever", "immune", 
    "thyroid", "kidney", "liver", "stomach", "intestine", "digestive"
  ];
  
  return medicalKeywords.filter(keyword => text.includes(keyword));
}

// Function to generate community health insights
export const generateCommunityInsights = async (communityData: any) => {
  try {
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      return {
        success: false,
        analysis: "No API key provided. Please set your Google Gemini API key first.",
      };
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      safetySettings,
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 2048,
      },
    });

    // Create prompt for community health data analysis
    const prompt = `You are an AI specializing in public health analysis. Analyze the following community health data to identify patterns, risks, and recommend resource allocations and interventions.

Community Health Data:
${JSON.stringify(communityData, null, 2)}

Your analysis should include:
1. Key health risk patterns in the community
2. Geographic distribution of health risks
3. Demographic factors influencing health outcomes
4. Recommendations for resource allocation
5. Suggested community health interventions
6. Priority areas requiring immediate attention
7. Long-term public health strategies

Be comprehensive, specific and data-driven in your analysis.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const textResponse = response.text();
    
    return {
      success: true,
      analysis: textResponse,
    };
  } catch (error) {
    console.error("Error generating community insights:", error);
    return {
      success: false,
      analysis: "",
      error: error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
};
