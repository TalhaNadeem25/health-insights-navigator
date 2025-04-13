import express from 'express';
import axios from 'axios';
import Prediction from '../models/Prediction.js';
import HealthData from '../models/HealthData.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// Middleware to protect all routes
router.use(authenticateUser);

// Generate health prediction from health data
router.post('/generate/:healthDataId', async (req, res) => {
  try {
    // Find health data
    const healthData = await HealthData.findOne({
      _id: req.params.healthDataId,
      user: req.userId
    });
    
    if (!healthData) {
      return res.status(404).json({ message: 'Health data not found' });
    }
    
    // Check if a prediction already exists for this health data
    const existingPrediction = await Prediction.findOne({
      healthData: healthData._id
    });
    
    if (existingPrediction) {
      return res.status(200).json({
        message: 'Prediction already exists for this health data',
        prediction: existingPrediction,
        isExisting: true
      });
    }
    
    // Prepare data for LLM API call
    const llmRequestData = transformHealthDataForLLM(healthData);
    
    // Get Gemini API key from environment variable
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return res.status(500).json({ message: 'LLM API key not configured' });
    }
    
    // Call Gemini API
    const llmResponse = await callGeminiAPI(llmRequestData, geminiApiKey);
    
    // Process LLM response
    const predictionData = processPredictionResponse(llmResponse);
    
    // Create prediction record
    const prediction = new Prediction({
      user: req.userId,
      healthData: healthData._id,
      diabetesRisk: {
        score: predictionData.diabetesRisk,
        level: calculateRiskLevel(predictionData.diabetesRisk)
      },
      heartDiseaseRisk: {
        score: predictionData.heartRisk,
        level: calculateRiskLevel(predictionData.heartRisk)
      },
      keyFactors: predictionData.keyFactors.map(factor => ({
        factor: factor,
        impact: determineImpactLevel(factor),
        modifiable: isFactorModifiable(factor)
      })),
      recommendations: predictionData.recommendations || [],
      analysis: predictionData.analysis,
      modelInfo: {
        name: 'Google Gemini 1.5 Pro',
        version: '1.0',
        confidence: predictionData.confidence || 0.85
      }
    });
    
    await prediction.save();
    
    res.status(201).json({
      message: 'Health prediction generated successfully',
      prediction,
      isExisting: false
    });
  } catch (error) {
    console.error('Prediction generation error:', error);
    res.status(500).json({ 
      message: 'Server error generating prediction',
      error: error.message
    });
  }
});

// Get all predictions for a user
router.get('/', async (req, res) => {
  try {
    const predictions = await Prediction.find({ user: req.userId })
      .populate('healthData')
      .sort({ createdAt: -1 });
    
    res.json({
      count: predictions.length,
      predictions
    });
  } catch (error) {
    console.error('Predictions fetch error:', error);
    res.status(500).json({ message: 'Server error fetching predictions' });
  }
});

// Get a specific prediction
router.get('/:id', async (req, res) => {
  try {
    // Handle 'latest' as a special case
    if (req.params.id === 'latest') {
      const prediction = await Prediction.findOne({ user: req.userId })
        .populate('healthData')
        .sort({ createdAt: -1 });
        
      if (!prediction) {
        return res.status(404).json({ message: 'No predictions found for this user' });
      }
      
      return res.json({ prediction });
    }
    
    // Regular ID lookup
    const prediction = await Prediction.findOne({
      _id: req.params.id,
      user: req.userId
    }).populate('healthData');
    
    if (!prediction) {
      return res.status(404).json({ message: 'Prediction not found' });
    }
    
    res.json({ prediction });
  } catch (error) {
    console.error('Prediction fetch error:', error);
    res.status(500).json({ message: 'Server error fetching prediction' });
  }
});

// Get latest prediction for a user
router.get('/latest', async (req, res) => {
  try {
    const prediction = await Prediction.findOne({ user: req.userId })
      .populate('healthData')
      .sort({ createdAt: -1 });
    
    if (!prediction) {
      return res.status(404).json({ message: 'No predictions found for this user' });
    }
    
    res.json({ prediction });
  } catch (error) {
    console.error('Latest prediction fetch error:', error);
    res.status(500).json({ message: 'Server error fetching latest prediction' });
  }
});

// Helper functions

// Transform health data to format expected by LLM
function transformHealthDataForLLM(healthData) {
  // Structure data in a format that's easily understood by the LLM
  const formattedHealthData = {
    age: healthData.age,
    gender: healthData.gender,
    bmi: healthData.bmi,
    bloodPressure: `${healthData.bloodPressure.systolic}/${healthData.bloodPressure.diastolic}`,
    smokingStatus: healthData.smokingStatus,
    physicalActivity: healthData.physicalActivity,
    diet: healthData.diet,
    familyHistory: Object.entries(healthData.familyHistory)
      .filter(([_, value]) => value === true)
      .map(([key]) => key)
      .join(', '),
    freeFormReport: healthData.freeFormReport
  };
  
  // Add lab results if available
  if (healthData.labResults && Object.keys(healthData.labResults).length > 0) {
    formattedHealthData.labResults = {};
    
    if (healthData.labResults.glucoseLevels) {
      formattedHealthData.labResults.glucoseLevels = healthData.labResults.glucoseLevels;
    }
    
    if (healthData.labResults.cholesterol) {
      formattedHealthData.labResults.cholesterol = healthData.labResults.cholesterol;
    }
    
    if (healthData.labResults.hba1c) {
      formattedHealthData.labResults.hba1c = healthData.labResults.hba1c;
    }
  }
  
  return formattedHealthData;
}

// Call Gemini LLM API
async function callGeminiAPI(healthData, apiKey) {
  try {
    const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';
    
    const prompt = `
      You are a specialized health analysis AI with extensive training in epidemiology, preventive medicine, and clinical risk assessment. Your task is to analyze the following health data and provide evidence-based risk scores and recommendations.
      
      Health Data:
      ${JSON.stringify(healthData, null, 2)}
      
      Please provide your analysis in the following JSON format only:
      {
        "diabetesRisk": <precise number between 1-100 based on established risk models>,
        "heartRisk": <precise number between 1-100 based on established risk models>,
        "analysis": "<detailed health analysis of approximately 250 words using evidence-based findings>",
        "keyFactors": ["<key risk factor 1 with specific measurement>", "<key risk factor 2 with specific measurement>", "<key risk factor 3 with specific measurement>"],
        "recommendations": ["<specific, actionable recommendation 1>", "<specific, actionable recommendation 2>", "<specific, actionable recommendation 3>"],
        "confidence": <number between 0-1 representing confidence level based on data completeness and quality>
      }
      
      Base your risk assessments on validated clinical models like the Framingham Risk Score, QRISK3, Finnish Diabetes Risk Score, or American Diabetes Association risk assessment tools.
      Do not include any other text or explanations outside of the JSON format.
    `;
    
    const response = await axios.post(`${apiUrl}?key=${apiKey}`, {
      contents: [{
        role: 'user',
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        topK: 40
      }
    });
    
    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Gemini API call error:', error.response?.data || error.message);
    throw new Error(`LLM API error: ${error.message}`);
  }
}

// Process LLM response
function processPredictionResponse(llmResponse) {
  try {
    // Extract JSON from the response
    const jsonMatch = llmResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Fallback parsing if JSON is malformed
    const diabetesRiskMatch = llmResponse.match(/diabetes[^\d]*(\d+)/i);
    const heartRiskMatch = llmResponse.match(/heart disease[^\d]*(\d+)/i);
    
    return {
      diabetesRisk: diabetesRiskMatch ? parseInt(diabetesRiskMatch[1]) : 50,
      heartRisk: heartRiskMatch ? parseInt(heartRiskMatch[1]) : 50,
      analysis: llmResponse.replace(/^\d+\s*\n+\s*\d+\s*\n+/g, ''),
      keyFactors: [],
      recommendations: [],
      confidence: 0.7
    };
  } catch (error) {
    console.error('Error parsing LLM response:', error);
    throw new Error('Failed to process prediction data');
  }
}

// Calculate risk level from score
function calculateRiskLevel(score) {
  if (score >= 75) return 'high';
  if (score >= 50) return 'moderate';
  return 'low';
}

// Determine impact level of a factor
function determineImpactLevel(factor) {
  const highImpactTerms = ['severe', 'high', 'significant', 'critical', 'extreme'];
  const lowImpactTerms = ['mild', 'low', 'minimal', 'slight'];
  
  const factorLower = factor.toLowerCase();
  
  if (highImpactTerms.some(term => factorLower.includes(term))) {
    return 'high';
  } else if (lowImpactTerms.some(term => factorLower.includes(term))) {
    return 'low';
  }
  
  return 'medium';
}

// Determine if a factor is modifiable
function isFactorModifiable(factor) {
  const nonModifiableFactors = [
    'age', 'gender', 'family history', 'genetic', 'genetics',
    'hereditary', 'ethnicity', 'race', 'history of'
  ];
  
  const factorLower = factor.toLowerCase();
  
  return !nonModifiableFactors.some(term => factorLower.includes(term));
}

export default router; 