import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, MessageSquare } from 'lucide-react';
import { errorHandler } from '../lib/errorHandler';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorId: string | null;
  retryCount: number;
}

class ErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorId: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: crypto.randomUUID()
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log error using our error handler
    const appError = errorHandler.createError(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
      retryCount: this.state.retryCount
    });

    errorHandler.logError(appError, error.stack);
    
    // Call optional error callback
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorId: null,
        retryCount: prevState.retryCount + 1
      }));
    }
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReportError = () => {
    const errorDetails = {
      errorId: this.state.errorId,
      message: this.state.error?.message,
      timestamp: new Date().toISOString(),
      url: window.location.href
    };

    // Copy error details to clipboard
    navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2));
    alert('Error details copied to clipboard. Please send this to our support team.');
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const canRetry = this.state.retryCount < this.maxRetries;
      const isNetworkError = this.state.error?.message?.includes('fetch') || !navigator.onLine;

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {isNetworkError ? 'Connection Problem' : 'Something Went Wrong'}
            </h2>
            
            <p className="text-gray-600 mb-6 leading-relaxed">
              {isNetworkError 
                ? 'We\'re having trouble connecting to our servers. Please check your internet connection and try again.'
                : 'We encountered an unexpected error. Our team has been notified and is working on a fix.'
              }
            </p>

            {/* Error Details (for development) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-6 p-4 bg-gray-100 rounded-lg text-left">
                <h4 className="font-medium text-gray-900 mb-2">Error Details:</h4>
                <p className="text-sm text-gray-700 font-mono break-all">
                  {this.state.error?.message}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Error ID: {this.state.errorId}
                </p>
              </div>
            )}

            <div className="space-y-3">
              {canRetry && (
                <button
                  onClick={this.handleRetry}
                  className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  <RefreshCw className="h-5 w-5" />
                  <span>Try Again ({this.maxRetries - this.state.retryCount} attempts left)</span>
                </button>
              )}
              
              <button
                onClick={this.handleGoHome}
                className="w-full flex items-center justify-center space-x-2 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <Home className="h-5 w-5" />
                <span>Go to Homepage</span>
              </button>
              
              <button
                onClick={this.handleReportError}
                className="w-full flex items-center justify-center space-x-2 text-gray-500 hover:text-gray-700 px-6 py-2 text-sm transition-colors"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Report This Error</span>
              </button>
            </div>

            {/* Offline Indicator */}
            {!navigator.onLine && (
              <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  You're currently offline. Some features may not work until your connection is restored.
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;