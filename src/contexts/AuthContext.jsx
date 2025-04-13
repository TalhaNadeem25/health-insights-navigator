import { createContext, useContext, useState, useEffect } from 'react';
import { auth as authApi } from '../lib/api';

// Create context
const AuthContext = createContext(null);

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Load user on initial mount if token exists
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        const data = await authApi.getProfile();
        setUser(data.user);
      } catch (err) {
        console.error('Failed to load user:', err);
        localStorage.removeItem('auth_token');
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);
  
  // Register a new user
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await authApi.register(userData);
      localStorage.setItem('auth_token', data.token);
      setUser(data.user);
      return data;
    } catch (err) {
      const errorMessage = err.message || 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  // Login user
  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await authApi.login(credentials);
      localStorage.setItem('auth_token', data.token);
      setUser(data.user);
      return data;
    } catch (err) {
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  // Logout user
  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
  };
  
  // Update user profile
  const updateProfile = async (profileData) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await authApi.updateProfile(profileData);
      setUser(data.user);
      return data;
    } catch (err) {
      const errorMessage = err.message || 'Failed to update profile';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  // Change password
  const changePassword = async (passwordData) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await authApi.changePassword(passwordData);
      return data;
    } catch (err) {
      const errorMessage = err.message || 'Failed to change password';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        register,
        login,
        logout,
        updateProfile,
        changePassword,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 