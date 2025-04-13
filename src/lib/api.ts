import { geminiAnalyzeHealth, generateCommunityInsights, getGeminiApiKey } from './gemini';
import axios from 'axios';

// Define API endpoints for the application
// In a production environment, these would be server-side endpoints
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Set up base axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Mock data for testing without backend
const MOCK_ENABLED = true; // Set to false when real backend is available

// Error handling wrapper for API calls
const handleApiError = (error: any) => {
  console.error('API Error:', error);
  if (error.response) {
    // Server responded with a non-2xx status
    return {
      success: false,
      error: `Server error: ${error.response.status}`,
      message: error.response.data?.message || 'Unknown server error'
    };
  } else if (error.request) {
    // Request was made but no response received
    return {
      success: false,
      error: 'Network error',
      message: 'Could not connect to the server. Please check your internet connection.'
    };
  } else {
    // Error setting up the request
    return {
      success: false,
      error: 'Request error',
      message: error.message || 'An unexpected error occurred'
    };
  }
};

// Helper for handling API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'An error occurred while processing your request');
  }
  return response.json();
};

// Helper to get auth token
const getAuthToken = () => localStorage.getItem('auth_token');

// Authentication API
export const loginUser = async (email: string, password: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  
  return handleResponse(response);
};

export const registerUser = async (userData: any) => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  
  return handleResponse(response);
};

export const getCurrentUser = async () => {
  const token = getAuthToken();
  if (!token) return null;
  
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  return handleResponse(response);
};

// User Profile API
export const updateUserProfile = async (profileData: any) => {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/users/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });
  
  return handleResponse(response);
};

export const changePassword = async (currentPassword: string, newPassword: string) => {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/users/change-password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  
  return handleResponse(response);
};

// Health Data API
export const submitHealthData = async (healthData: any) => {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/health-data`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(healthData),
  });
  
  return handleResponse(response);
};

export const getLatestHealthData = async () => {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/health-data/latest`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  return handleResponse(response);
};

export const getHealthDataHistory = async () => {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/health-data/history`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  return handleResponse(response);
};

// Health Predictions API
export const generatePrediction = async (healthDataId: string) => {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/predictions/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ healthDataId }),
  });
  
  return handleResponse(response);
};

export const getLatestPrediction = async () => {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/predictions/latest`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  return handleResponse(response);
};

export const getPredictionHistory = async () => {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/predictions/history`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  return handleResponse(response);
};

// API functions for health data analysis
export const analyzeHealthData = async (healthData: any, useLocalProcessing = true) => {
  try {
    // In production, we'd send this to a secure backend
    // For demo purposes, we process it locally to avoid data privacy issues
    if (useLocalProcessing) {
      return await geminiAnalyzeHealth(healthData);
    }
    
    // Production version would use a secure API endpoint
    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getGeminiApiKey()}`
      },
      body: JSON.stringify(healthData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    return handleApiError(error);
  }
};

// API function for community health insights
export const analyzeCommunityHealth = async (communityData: any, useLocalProcessing = true) => {
  try {
    // For demo purposes, process locally
    if (useLocalProcessing) {
      return await generateCommunityInsights(communityData);
    }
    
    // Production version would use a secure API endpoint
    const response = await fetch(`${API_BASE_URL}/community-insights`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getGeminiApiKey()}`
      },
      body: JSON.stringify(communityData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    return handleApiError(error);
  }
};

// Health data validation
export const validateHealthData = (data: any) => {
  const errors: Record<string, string> = {};
  
  // Age validation
  if (data.age) {
    const age = parseInt(data.age, 10);
    if (isNaN(age) || age < 0 || age > 120) {
      errors.age = 'Please enter a valid age between 0 and 120';
    }
  }
  
  // BMI validation
  if (data.bmi) {
    const bmi = parseFloat(data.bmi);
    if (isNaN(bmi) || bmi < 10 || bmi > 100) {
      errors.bmi = 'Please enter a valid BMI between 10 and 100';
    }
  }
  
  // Blood pressure validation
  if (data.bloodPressure) {
    const bpPattern = /^\d{2,3}\/\d{2,3}$/;
    if (!bpPattern.test(data.bloodPressure)) {
      errors.bloodPressure = 'Please enter blood pressure in format systolic/diastolic (e.g., 120/80)';
    } else {
      const [systolic, diastolic] = data.bloodPressure.split('/').map(Number);
      if (systolic < 70 || systolic > 250) {
        errors.bloodPressure = 'Systolic pressure should be between 70 and 250';
      }
      if (diastolic < 40 || diastolic > 150) {
        errors.bloodPressure = 'Diastolic pressure should be between 40 and 150';
      }
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Mock deployment endpoint - in production, this would connect to a model hosting service
export const deployModel = async (modelType: 'individual' | 'community') => {
  try {
    // Simulate API call to deploy model
    return {
      success: true,
      modelId: `hlth-${modelType}-${Date.now()}`,
      status: 'deployed',
      endpoint: `${API_BASE_URL}/${modelType}-health-analysis`,
      message: `Successfully deployed ${modelType} health analysis model`
    };
  } catch (error) {
    return handleApiError(error);
  }
};

// Model monitoring metrics - in production, this would connect to monitoring services
export const getModelMetrics = async (modelId: string) => {
  try {
    // Simulate fetching model performance metrics
    return {
      success: true,
      modelId,
      metrics: {
        accuracy: 0.92,
        precision: 0.91,
        recall: 0.89,
        f1Score: 0.90,
        latency: '245ms',
        requestsPerDay: 1243,
        averageConfidence: 0.84,
        dataDistribution: {
          ageGroups: {
            '0-18': 0.12,
            '19-35': 0.28,
            '36-50': 0.32,
            '51-65': 0.18,
            '65+': 0.10
          },
          genderDistribution: {
            male: 0.48,
            female: 0.51,
            other: 0.01
          }
        }
      }
    };
  } catch (error) {
    return handleApiError(error);
  }
};

// Mock API for health metrics and assessments
export const healthData = {
  // Get latest health data
  getLatest: async () => {
    if (MOCK_ENABLED) {
      return Promise.resolve({
        success: true,
        healthData: {
          _id: '123456',
          age: 45,
          gender: 'male',
          bmi: 28.5,
          bloodPressure: { systolic: 130, diastolic: 85 },
          smokingStatus: 'former',
          physicalActivity: 'moderate',
          familyHistory: { diabetes: true, heartDisease: false },
          diet: 'Balanced diet with occasional processed foods',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      });
    }
    
    return api.get('/health-data/latest');
  },
  
  // Submit new health data
  submit: async (data: any) => {
    if (MOCK_ENABLED) {
      return Promise.resolve({
        success: true,
        healthData: {
          _id: Math.random().toString(36).substring(2, 15),
          ...data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      });
    }
    
    return api.post('/health-data', data);
  }
};

// Mock API for predictions and assessments
export const predictions = {
  // Get latest prediction
  getLatest: async () => {
    if (MOCK_ENABLED) {
      return Promise.resolve({
        success: true,
        prediction: {
          _id: '789012',
          diabetesRisk: { score: 65, level: 'moderate' },
          heartDiseaseRisk: { score: 72, level: 'high' },
          analysis: 'Based on your health metrics, you have a moderate risk of diabetes and high risk of heart disease. Key factors include your BMI, family history of diabetes, and blood pressure readings.',
          keyFactors: [
            { factor: 'BMI above healthy range', impact: 'high' },
            { factor: 'Family history of diabetes', impact: 'high' },
            { factor: 'Elevated blood pressure', impact: 'medium' },
            { factor: 'Former smoker status', impact: 'medium' }
          ],
          modelInfo: {
            version: '1.0.0',
            confidence: 0.85,
            source: 'Gemini 1.5 Pro'
          },
          healthDataId: '123456',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      });
    }
    
    return api.get('/predictions/latest');
  },
  
  // Generate new prediction
  generate: async (healthDataId: string) => {
    if (MOCK_ENABLED) {
      return Promise.resolve({
        success: true,
        isExisting: false,
        prediction: {
          _id: Math.random().toString(36).substring(2, 15),
          diabetesRisk: { score: 65, level: 'moderate' },
          heartDiseaseRisk: { score: 72, level: 'high' },
          analysis: 'Based on your health metrics, you have a moderate risk of diabetes and high risk of heart disease. Key factors include your BMI, family history of diabetes, and blood pressure readings.',
          keyFactors: [
            { factor: 'BMI above healthy range', impact: 'high' },
            { factor: 'Family history of diabetes', impact: 'high' },
            { factor: 'Elevated blood pressure', impact: 'medium' },
            { factor: 'Former smoker status', impact: 'medium' }
          ],
          modelInfo: {
            version: '1.0.0',
            confidence: 0.85,
            source: 'Gemini 1.5 Pro'
          },
          healthDataId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      });
    }
    
    return api.post('/predictions/generate', { healthDataId });
  }
};

// Mock API for assessments
export const assessments = {
  // Get latest assessment
  getLatest: async () => {
    if (MOCK_ENABLED) {
      return Promise.resolve({
        success: true,
        assessment: {
          _id: '345678',
          diabetesRisk: 65,
          heartRisk: 72,
          recommendations: [
            'Follow a balanced diet with reduced processed foods and sugars',
            'Aim for at least 30 minutes of moderate activity 5 times per week',
            'Monitor your blood pressure regularly',
            'Schedule a follow-up with your healthcare provider'
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      });
    }
    
    return api.get('/assessments/latest');
  }
};

// Export all API functions
const apiModule = {
  api,
  healthData,
  predictions,
  assessments
};

export default apiModule;

// In production, we'd have functions for:
// - Model retraining
// - Data drift monitoring
// - A/B testing different model versions
// - User feedback collection 