// src/hooks/useApi.js
import { useState, useCallback } from 'react';

/**
 * Simple hook for API calls with loading and error states
 */
const useApi = (apiFunction) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiFunction(...args);
      
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.message);
      }
      
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Something went wrong';
      setError(errorMessage);
      return {
        success: false,
        data: null,
        message: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);

  return { loading, error, data, execute };
};

export default useApi;