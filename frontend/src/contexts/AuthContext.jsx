/**
 * Auth Context
 * 
 * Provides authentication state and functions throughout the application
 * - User state management
 * - Login/Register/Logout functions
 * - Token validation
 * - Auto-logout on token expiration
 */

import { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../services/authService';
import { extractErrorMessage } from '../utils/errorHandler';

// Create Auth Context
const AuthContext = createContext(null);

/**
 * AuthProvider Component
 * Wraps the application and provides auth state and functions
 * 
 * Note: Router integration (useNavigate) will be added when React Router is set up
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  /**
   * Initialize auth state from localStorage on mount
   */
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const currentUser = authService.getCurrentUser();
        const hasToken = authService.isAuthenticated();

        if (currentUser && hasToken) {
          setUser(currentUser);
          setIsAuthenticated(true);
        } else {
          // Clear invalid state
          setUser(null);
          setIsAuthenticated(false);
          authService.logout();
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setUser(null);
        setIsAuthenticated(false);
        authService.logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Register a new user
   * @param {Object} userData - Registration data (email, name, password)
   * @returns {Promise<Object>} Response data
   */
  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await authService.register(userData);

      if (response.success && response.data) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        return response;
      } else {
        throw new Error(response.error?.message || 'Registration failed');
      }
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Login user
   * @param {Object} credentials - Login credentials (email, password)
   * @returns {Promise<Object>} Response data
   */
  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await authService.login(credentials);

      if (response.success && response.data) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        return response;
      } else {
        throw new Error(response.error?.message || 'Login failed');
      }
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout user
   * Clears auth state and redirects to login
   * Note: Router integration will handle navigation when React Router is set up
   */
  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    // Navigation will be handled by Router when integrated
    // For now, use window.location if Router is not available
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
  };

  /**
   * Validate token and update auth state
   * Called when API returns 401 (token expired/invalid)
   * Note: Navigation handled by API interceptor or Router when integrated
   */
  const handleTokenExpiration = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    // Navigation is handled by API interceptor (api.js)
    // Router integration will use navigate() when React Router is set up
  };

  /**
   * Check if token is valid
   * Note: Full JWT validation would require jwt-decode library
   * This is a simple check - backend will return 401 if token is invalid
   * @returns {boolean} True if token exists
   */
  const validateToken = () => {
    const isValid = authService.isAuthenticated();
    if (!isValid) {
      handleTokenExpiration();
    }
    return isValid;
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    register,
    login,
    logout,
    validateToken,
    handleTokenExpiration,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * useAuth Hook
 * Provides access to auth context
 * @returns {Object} Auth context value
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

