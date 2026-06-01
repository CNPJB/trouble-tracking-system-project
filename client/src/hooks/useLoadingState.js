import { useState, useCallback } from 'react';

export const useLoadingState = () => {
  const [loading, setLoading] = useState({
    isLoading: false,
    error: null,
    success: null
  });

  const startLoading = useCallback(() => {
    setLoading({ isLoading: true, error: null, success: null });
  }, []);

  const setError = useCallback((errorMessage, severity = 'error') => {
    setLoading({ 
      isLoading: false, 
      error: { message: errorMessage, severity: severity }, 
      success: null });
  }, []);

  const setSuccess = useCallback((successMessage = "ดำเนินการสำเร็จเรียบร้อย") => {
    setLoading({ 
      isLoading: false, 
      error: null, 
      success: { message: successMessage } 
    });
  }, []);

  const reset = useCallback(() => {
    setLoading({ isLoading: false, error: null, success: null });
  }, []);

  const clearError = useCallback(() => {
    setLoading(prev => ({ ...prev, error: null }));
  }, []);

  return { loading, startLoading, setError, setSuccess, reset, clearError };
};