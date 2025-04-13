// Base API URL from environment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002/api';

// Helper for handling API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'An error occurred while processing your request');
  }
  return response.json();
};

// Helper to get auth token
const getAuthToken = () => localStorage.getItem('auth_token');

// Auth API endpoints
export const auth = {
  // Register a new user
  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },
  
  // Login user
  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    return handleResponse(response);
  },
  
  // Get current user profile
  getProfile: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },
  
  // Update user profile
  updateProfile: async (profileData) => {
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
  },
  
  // Change password
  changePassword: async (passwordData) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/users/change-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(passwordData),
    });
    return handleResponse(response);
  }
};

// Health data API endpoints
export const healthData = {
  // Submit health data
  submit: async (data) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/health-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
  
  // Get all health data entries for current user
  getAll: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/health-data`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },
  
  // Get latest health data entry
  getLatest: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/health-data/latest`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },
  
  // Get specific health data entry
  getById: async (id) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/health-data/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },
  
  // Update health data entry
  update: async (id, data) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/health-data/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
  
  // Delete health data entry
  delete: async (id) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/health-data/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  }
};

// Predictions API endpoints
export const predictions = {
  // Generate prediction from health data
  generate: async (healthDataId) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/predictions/generate/${healthDataId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },
  
  // Get all predictions for current user
  getAll: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/predictions`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },
  
  // Get latest prediction
  getLatest: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/predictions/latest`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },
  
  // Get specific prediction
  getById: async (id) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/predictions/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  }
};

// Model deployment API endpoints
export const deployModel = async (modelData) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/models/deploy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(modelData),
  });
  return handleResponse(response);
};

export const getModelMetrics = async (modelId) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/models/${modelId || 'latest'}/metrics`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleResponse(response);
};

export default {
  auth,
  healthData,
  predictions,
  deployModel,
  getModelMetrics
}; 