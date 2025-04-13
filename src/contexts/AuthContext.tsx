import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateProfile: (userData: UpdateProfileData) => Promise<boolean>;
  isAuthenticated: boolean;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface UpdateProfileData {
  name?: string;
  email?: string;
  password?: string;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          setLoading(false);
          return;
        }
        
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        };
        
        const res = await axios.get('/api/users/me', config);
        setUser(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Auth verification error:', err);
        localStorage.removeItem('token');
        setUser(null);
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setError(null);
    try {
      const res = await axios.post('/api/users/login', { email, password });
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
      return false;
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    setError(null);
    try {
      const res = await axios.post('/api/users/register', userData);
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateProfile = async (userData: UpdateProfileData): Promise<boolean> => {
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      
      const res = await axios.put('/api/users/profile', userData, config);
      setUser(res.data);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Profile update failed');
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      error, 
      login, 
      register, 
      logout,
      updateProfile,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 