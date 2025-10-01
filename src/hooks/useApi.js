// src/hooks/useApi.js
import { useState, useCallback } from 'react';

/**
 * Generic hook for API calls with loading and error states
 * @param {Function} apiFunction - The API function to call
 * @returns {Object} Hook state and methods
 */
const useApi = (apiFunction) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const execute = useCallback(
    async (...args) => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await apiFunction(...args);
        
        if (result.success) {
          setData(result.data);
          return result;
        } else {
          setError(result.error || new Error(result.message));
          return result;
        }
      } catch (err) {
        const errorMessage = err.message || 'An unexpected error occurred';
        setError(err);
        return {
          success: false,
          data: null,
          message: errorMessage,
          error: err,
        };
      } finally {
        setLoading(false);
      }
    },
    [apiFunction]
  );

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    loading,
    error,
    data,
    execute,
    reset,
  };
};

export default useApi;