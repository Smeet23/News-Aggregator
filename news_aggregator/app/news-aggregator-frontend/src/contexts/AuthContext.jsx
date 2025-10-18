import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI, profileAPI } from '../services/api';
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
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
        
        // If user doesn't have an ID, try to fetch it from profile
        if (!userData.id && !userData._id) {
          try {
            const profileResponse = await profileAPI.getMyProfile();
            const updatedUserData = {
              ...userData,
              id: profileResponse.data._id || profileResponse.data.id,
              username: profileResponse.data.username || userData.username
            };
            localStorage.setItem('user', JSON.stringify(updatedUserData));
            setUser(updatedUserData);
          } catch (error) {
            console.error('Failed to fetch user profile:', error);
          }
        }
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
        // After successful login, fetch user profile to get complete user data
        try {
          const profileResponse = await profileAPI.getMyProfile();
          const userData = {
            id: profileResponse.data._id || profileResponse.data.id,
            email: profileResponse.data.email,
            name: profileResponse.data.name,
            username: profileResponse.data.username
          };
          
          // Store user data
          localStorage.setItem('user', JSON.stringify(userData));
          setUser(userData);
          setIsAuthenticated(true);
          
          toast.success('Login successful!');
          return { success: true };
        } catch (profileError) {
          console.error('Failed to fetch profile after login:', profileError);
          // Fallback if profile fetch fails - try to extract from login response
          const storedRegData = localStorage.getItem('lastRegistration');
          let userData;
          
          if (response.data.user) {
            // If login response contains user data
            userData = {
              id: response.data.user._id || response.data.user.id,
              email: response.data.user.email || credentials.email,
              name: response.data.user.name || credentials.email.split('@')[0],
              username: response.data.user.username
            };
          } else if (storedRegData) {
            const regData = JSON.parse(storedRegData);
            if (regData.email === credentials.email) {
              userData = {
                email: credentials.email,
                name: regData.name,
                username: regData.username
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
        name: userData.name,
        username: userData.username
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