// src/api/client.js
import axios from 'axios';

// Base configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor (for adding auth tokens, logging, etc.)
apiClient.interceptors.request.use(
  (config) => {
    // Add timestamp to prevent caching
    config.params = {
      ...config.params,
      _t: Date.now(),
    };

    // Log requests in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        data: config.data,
        params: config.params,
      });
    }

    // Add auth token if available (for future use)
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor (for handling responses and errors globally)
apiClient.interceptors.response.use(
  (response) => {
    // Log responses in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
    }

    return response;
  },
  (error) => {
    // Handle different error types
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      console.error(`❌ API Error (${status}):`, {
        url: error.config?.url,
        method: error.config?.method,
        message: data?.message || error.message,
        data: data,
      });

      // Handle specific status codes
      switch (status) {
        case 401:
          // Unauthorized - redirect to login (future use)
          console.warn('Unauthorized access - consider redirecting to login');
          break;
        case 403:
          // Forbidden
          console.warn('Access forbidden');
          break;
        case 404:
          // Not found
          console.warn('Resource not found');
          break;
        case 500:
          // Server error
          console.error('Server error');
          break;
        default:
          break;
      }

      // Return structured error
      const apiError = {
        status,
        message: data?.message || 'An error occurred',
        data: data?.data || null,
        originalError: error,
      };

      return Promise.reject(apiError);
    } else if (error.request) {
      // Network error (no response received)
      console.error('❌ Network Error:', error.message);
      return Promise.reject({
        status: 0,
        message: 'Network error - please check your connection',
        data: null,
        originalError: error,
      });
    } else {
      // Other error
      console.error('❌ Unknown Error:', error.message);
      return Promise.reject({
        status: -1,
        message: error.message || 'An unknown error occurred',
        data: null,
        originalError: error,
      });
    }
  }
);

export default apiClient;