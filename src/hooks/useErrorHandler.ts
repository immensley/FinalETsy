import { useState, useCallback } from 'react';
import { errorHandler, AppError } from '../lib/errorHandler';

export function useErrorHandler(userId?: string) {
  const [currentError, setCurrentError] = useState<AppError | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleError = useCallback(async (
    error: any,
    context: Record<string, any> = {},
    retryFn?: () => Promise<any>
  ) => {
    setIsRetrying(true);
    
    const result = await errorHandler.handleError(error, context, userId, retryFn);
    
    setIsRetrying(false);
    
    if (!result.success && result.error) {
      setCurrentError(result.error);
    }
    
    return result;
  }, [userId]);

  const clearError = useCallback(() => {
    setCurrentError(null);
  }, []);

  const showError = useCallback((message: string, severity: AppError['severity'] = 'medium') => {
    const error = errorHandler.createError(
      new Error(message),
      { userTriggered: true },
      userId
    );
    error.severity = severity;
    setCurrentError(error);
  }, [userId]);

  return {
    currentError,
    isRetrying,
    handleError,
    clearError,
    showError
  };
}