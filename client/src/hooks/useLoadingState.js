import { useState, useCallback } from 'react';

export const useLoadingState = () => {
  const [loading, setLoading] = useState({
    isLoading: false,
    error: null,
    success: false
  });

  const startLoading = useCallback(() => {
    setLoading({ isLoading: true, error: null, success: false });
  }, []);

  const setError = useCallback((errorMessage, severity = 'error') => {
    setLoading({ 
      isLoading: false, 
      error: { message: errorMessage, severity: severity }, 
      success: false });
  }, []);

  const setSuccess = useCallback(() => {
    setLoading({ isLoading: false, error: null, success: true });
  }, []);

  const reset = useCallback(() => {
    setLoading({ isLoading: false, error: null, success: false });
  }, []);

  return { loading, startLoading, setError, setSuccess, reset };
};