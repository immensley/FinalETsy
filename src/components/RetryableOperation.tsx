import React, { useState } from 'react';
import { RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { useErrorHandler } from '../hooks/useErrorHandler';

interface RetryableOperationProps {
  operation: () => Promise<any>;
  onSuccess?: (result: any) => void;
  onError?: (error: any) => void;
  maxRetries?: number;
  retryDelay?: number;
  children: (props: {
    execute: () => Promise<void>;
    isLoading: boolean;
    error: any;
    retryCount: number;
    canRetry: boolean;
  }) => React.ReactNode;
}

const RetryableOperation: React.FC<RetryableOperationProps> = ({
  operation,
  onSuccess,
  onError,
  maxRetries = 3,
  retryDelay = 1000,
  children
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { handleError } = useErrorHandler();

  const execute = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await operation();
      setRetryCount(0);
      onSuccess?.(result);
    } catch (err) {
      const errorResult = await handleError(
        err,
        { operation: 'retryable_operation', retryCount },
        undefined,
        retryCount < maxRetries ? operation : undefined
      );

      if (!errorResult.success) {
        setError(errorResult.error);
        setRetryCount(prev => prev + 1);
        onError?.(errorResult.error);
      } else {
        // Retry succeeded
        setRetryCount(0);
        onSuccess?.(errorResult.data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const canRetry = retryCount < maxRetries && error && !isLoading;

  return (
    <>
      {children({
        execute,
        isLoading,
        error,
        retryCount,
        canRetry
      })}
    </>
  );
};

// Example usage component
export const RetryableButton: React.FC<{
  operation: () => Promise<any>;
  onSuccess?: (result: any) => void;
  children: React.ReactNode;
  className?: string;
}> = ({ operation, onSuccess, children, className = '' }) => {
  return (
    <RetryableOperation operation={operation} onSuccess={onSuccess}>
      {({ execute, isLoading, error, canRetry }) => (
        <div>
          <button
            onClick={execute}
            disabled={isLoading}
            className={`${className} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              children
            )}
          </button>
          
          {error && (
            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <p className="text-sm text-red-800">{error.userMessage}</p>
              </div>
              {canRetry && (
                <button
                  onClick={execute}
                  className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Try Again
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </RetryableOperation>
  );
};

export default RetryableOperation;