import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      
      // Check if login was successful
      if (response.data && response.data.message === 'Successfully logged in') {
        // Try to get stored registration data or use email prefix
        const storedRegData = localStorage.getItem('lastRegistration');
        let userData;
        
        if (storedRegData) {
          const regData = JSON.parse(storedRegData);
          if (regData.email === credentials.email) {
            userData = {
              email: credentials.email,
              name: regData.name
            };
          } else {
            userData = {
              email: credentials.email,
              name: credentials.email.split('@')[0]
            };
          }
        } else {
          userData = {
            email: credentials.email,
            name: credentials.email.split('@')[0]
          };
        }
        
        // Store user data
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
        
        toast.success('Login successful!');
        return { success: true };
      }
      
      return { success: false, error: 'Login failed' };
    } catch (error) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      await authAPI.register(userData);
      
      // Store registration data temporarily for login
      localStorage.setItem('lastRegistration', JSON.stringify({
        email: userData.email,
        name: userData.name
      }));
      
      toast.success('Registration successful! Please login.');
      return { success: true };
    } catch (error) {
      // Check if there are validation errors
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        // Show each validation error
        error.response.data.errors.forEach(err => {
          toast.error(err.msg);
        });
        return { success: false, error: 'Validation failed. Please check the errors above.' };
      }
      
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
      toast.success('Logged out successfully');
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};