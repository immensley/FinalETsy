// Comprehensive error handling system

export interface AppError {
  code: string
  message: string
  userMessage: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  context?: Record<string, any>
  timestamp: string
  userId?: string
  sessionId: string
}

export interface ErrorLogEntry {
  id: string
  error: AppError
  stackTrace?: string
  userAgent: string
  url: string
  retryCount: number
  resolved: boolean
}

export type ErrorType = 
  | 'NETWORK_ERROR'
  | 'API_ERROR' 
  | 'VALIDATION_ERROR'
  | 'AUTHENTICATION_ERROR'
  | 'PERMISSION_ERROR'
  | 'RATE_LIMIT_ERROR'
  | 'FILE_UPLOAD_ERROR'
  | 'PROCESSING_ERROR'
  | 'UNKNOWN_ERROR'

class ErrorHandler {
  private errorLog: ErrorLogEntry[] = []
  private retryAttempts = new Map<string, number>()
  private maxRetries = 3
  private retryDelay = 1000

  // Error classification and user-friendly messages
  private errorMessages: Record<ErrorType, { message: string; userMessage: string; severity: AppError['severity'] }> = {
    NETWORK_ERROR: {
      message: 'Network connection failed',
      userMessage: 'Unable to connect to our servers. Please check your internet connection and try again.',
      severity: 'medium'
    },
    API_ERROR: {
      message: 'API request failed',
      userMessage: 'Our AI service is temporarily unavailable. We\'re working to resolve this quickly.',
      severity: 'high'
    },
    VALIDATION_ERROR: {
      message: 'Input validation failed',
      userMessage: 'Please check your input and try again. Some required information may be missing.',
      severity: 'low'
    },
    AUTHENTICATION_ERROR: {
      message: 'Authentication failed',
      userMessage: 'Please sign in again to continue using the service.',
      severity: 'medium'
    },
    PERMISSION_ERROR: {
      message: 'Insufficient permissions',
      userMessage: 'You don\'t have permission to perform this action. Please upgrade your plan or contact support.',
      severity: 'medium'
    },
    RATE_LIMIT_ERROR: {
      message: 'Rate limit exceeded',
      userMessage: 'You\'ve reached your usage limit. Please wait a moment or upgrade your plan for more capacity.',
      severity: 'medium'
    },
    FILE_UPLOAD_ERROR: {
      message: 'File upload failed',
      userMessage: 'Unable to upload your image. Please ensure it\'s under 10MB and in JPG, PNG, or WebP format.',
      severity: 'low'
    },
    PROCESSING_ERROR: {
      message: 'AI processing failed',
      userMessage: 'Our AI couldn\'t process your request. Please try with a different image or contact support.',
      severity: 'high'
    },
    UNKNOWN_ERROR: {
      message: 'Unknown error occurred',
      userMessage: 'Something unexpected happened. Please try again or contact support if the issue persists.',
      severity: 'medium'
    }
  }

  // Classify errors based on error object or message
  classifyError(error: any): ErrorType {
    const message = error.message?.toLowerCase() || ''
    const status = error.status || error.response?.status

    // Network errors
    if (error.name === 'TypeError' && message.includes('fetch')) return 'NETWORK_ERROR'
    if (message.includes('network') || message.includes('connection')) return 'NETWORK_ERROR'
    if (status === 0 || !navigator.onLine) return 'NETWORK_ERROR'

    // HTTP status code classification
    if (status === 401) return 'AUTHENTICATION_ERROR'
    if (status === 403) return 'PERMISSION_ERROR'
    if (status === 429) return 'RATE_LIMIT_ERROR'
    if (status >= 400 && status < 500) return 'VALIDATION_ERROR'
    if (status >= 500) return 'API_ERROR'

    // Specific error patterns
    if (message.includes('validation') || message.includes('invalid')) return 'VALIDATION_ERROR'
    if (message.includes('upload') || message.includes('file')) return 'FILE_UPLOAD_ERROR'
    if (message.includes('processing') || message.includes('analysis')) return 'PROCESSING_ERROR'
    if (message.includes('auth') || message.includes('token')) return 'AUTHENTICATION_ERROR'

    return 'UNKNOWN_ERROR'
  }

  // Create standardized error object
  createError(
    error: any, 
    context: Record<string, any> = {},
    userId?: string
  ): AppError {
    const errorType = this.classifyError(error)
    const errorConfig = this.errorMessages[errorType]
    const sessionId = this.getSessionId()

    return {
      code: errorType,
      message: error.message || errorConfig.message,
      userMessage: errorConfig.userMessage,
      severity: errorConfig.severity,
      context: {
        ...context,
        originalError: error.name,
        stack: error.stack?.split('\n').slice(0, 3).join('\n'), // Truncated stack
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString(),
      userId,
      sessionId
    }
  }

  // Handle errors with automatic retry logic
  async handleError(
    error: any,
    context: Record<string, any> = {},
    userId?: string,
    retryFn?: () => Promise<any>
  ): Promise<{ success: boolean; data?: any; error?: AppError }> {
    const appError = this.createError(error, context, userId)
    
    // Log the error
    await this.logError(appError, error.stack)

    // Determine if we should retry
    const shouldRetry = this.shouldRetry(appError, retryFn)
    
    if (shouldRetry && retryFn) {
      const retryKey = `${appError.code}-${appError.sessionId}`
      const currentRetries = this.retryAttempts.get(retryKey) || 0
      
      if (currentRetries < this.maxRetries) {
        this.retryAttempts.set(retryKey, currentRetries + 1)
        
        // Exponential backoff
        const delay = this.retryDelay * Math.pow(2, currentRetries)
        await this.sleep(delay)
        
        try {
          const result = await retryFn()
          this.retryAttempts.delete(retryKey) // Clear retry count on success
          return { success: true, data: result }
        } catch (retryError) {
          return this.handleError(retryError, { ...context, retryAttempt: currentRetries + 1 }, userId, retryFn)
        }
      }
    }

    return { success: false, error: appError }
  }

  // Determine if error should be retried
  private shouldRetry(error: AppError, retryFn?: () => Promise<any>): boolean {
    if (!retryFn) return false
    
    const retryableErrors: ErrorType[] = [
      'NETWORK_ERROR',
      'API_ERROR',
      'RATE_LIMIT_ERROR'
    ]
    
    return retryableErrors.includes(error.code as ErrorType)
  }

  // Log errors to backend
  private async logError(error: AppError, stackTrace?: string): Promise<void> {
    try {
      // Store in local storage as backup
      this.storeErrorLocally(error)

      // Send to backend if online
      if (navigator.onLine) {
        await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/log-error`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            error,
            stackTrace,
            userAgent: navigator.userAgent,
            url: window.location.href
          })
        })
      }
    } catch (loggingError) {
      console.error('Failed to log error:', loggingError)
      // Don't throw - logging failures shouldn't break the app
    }
  }

  // Store errors locally for offline scenarios
  private storeErrorLocally(error: AppError): void {
    try {
      const stored = localStorage.getItem('app_errors') || '[]'
      const errors = JSON.parse(stored)
      errors.push(error)
      
      // Keep only last 50 errors
      if (errors.length > 50) {
        errors.splice(0, errors.length - 50)
      }
      
      localStorage.setItem('app_errors', JSON.stringify(errors))
    } catch (storageError) {
      console.error('Failed to store error locally:', storageError)
    }
  }

  // Get or create session ID
  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('session_id')
    if (!sessionId) {
      sessionId = crypto.randomUUID()
      sessionStorage.setItem('session_id', sessionId)
    }
    return sessionId
  }

  // Utility sleep function
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Get user-friendly error message
  getUserMessage(error: any): string {
    const errorType = this.classifyError(error)
    return this.errorMessages[errorType].userMessage
  }

  // Check if error is critical (requires immediate attention)
  isCritical(error: AppError): boolean {
    return error.severity === 'critical'
  }

  // Sync offline errors when back online
  async syncOfflineErrors(): Promise<void> {
    try {
      const stored = localStorage.getItem('app_errors')
      if (!stored) return

      const errors = JSON.parse(stored)
      if (errors.length === 0) return

      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-offline-errors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ errors })
      })

      // Clear local storage after successful sync
      localStorage.removeItem('app_errors')
    } catch (syncError) {
      console.error('Failed to sync offline errors:', syncError)
    }
  }
}

export const errorHandler = new ErrorHandler()