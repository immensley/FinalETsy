// Enhanced API client with comprehensive error handling

import { errorHandler, AppError } from './errorHandler';

export interface ApiRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  validateResponse?: (response: Response) => boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: AppError;
  fromCache?: boolean;
}

class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  constructor() {
    this.baseUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    };
  }

  async request<T = any>(
    endpoint: string,
    config: ApiRequestConfig = {},
    userId?: string
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = 30000,
      retries = 3,
      retryDelay = 1000,
      validateResponse = (response) => response.ok
    } = config;

    const url = `${this.baseUrl}/${endpoint}`;
    const cacheKey = `${method}:${url}:${JSON.stringify(body)}`;

    // Check cache for GET requests
    if (method === 'GET') {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return { success: true, data: cached, fromCache: true };
      }
    }

    // Check if offline
    if (!navigator.onLine) {
      const cachedData = this.getFromCache(cacheKey);
      if (cachedData) {
        return { success: true, data: cachedData, fromCache: true };
      } else {
        const offlineError = errorHandler.createError(
          new Error('No internet connection'),
          { endpoint, method },
          userId
        );
        return { success: false, error: offlineError };
      }
    }

    const requestOptions: RequestInit = {
      method,
      headers: { ...this.defaultHeaders, ...headers },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(timeout)
    };

    let lastError: any;

    // Retry logic
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, requestOptions);

        // Custom response validation
        if (!validateResponse(response)) {
          throw new Error(`Request validation failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // Cache successful GET requests
        if (method === 'GET' && response.ok) {
          this.setCache(cacheKey, data, 5 * 60 * 1000); // 5 minutes TTL
        }

        return { success: true, data };

      } catch (error) {
        lastError = error;
        
        // Don't retry on certain errors
        if (error.name === 'AbortError' || 
            (error.status >= 400 && error.status < 500 && error.status !== 429)) {
          break;
        }

        // Wait before retry (exponential backoff)
        if (attempt < retries) {
          await this.sleep(retryDelay * Math.pow(2, attempt));
        }
      }
    }

    // Handle final error
    const result = await errorHandler.handleError(
      lastError,
      { endpoint, method, attempt: retries + 1 },
      userId
    );

    return { success: false, error: result.error };
  }

  // Specialized methods for common operations
  async analyzeProduct(imageData: string, userId?: string): Promise<ApiResponse> {
    return this.request('analyze-product-enhanced', {
      method: 'POST',
      body: { imageData, enableBehavioralAnalysis: true },
      timeout: 45000, // Longer timeout for AI processing
      validateResponse: (response) => response.ok || response.status === 429 // Allow rate limit for retry
    }, userId);
  }

  async generateListing(analysisData: any, userId?: string): Promise<ApiResponse> {
    return this.request('generate-listing', {
      method: 'POST',
      body: analysisData,
      timeout: 30000
    }, userId);
  }

  async getUsageStats(userId?: string): Promise<ApiResponse> {
    return this.request('get-usage-stats', {
      method: 'GET',
      timeout: 10000
    }, userId);
  }

  async getPlanRecommendations(userId: string): Promise<ApiResponse> {
    return this.request('get-plan-recommendations', {
      method: 'POST',
      body: { userId },
      timeout: 15000
    }, userId);
  }

  async getAdminStats(timeRange: '24h' | '7d' | '30d' = '24h'): Promise<ApiResponse> {
    return this.request('admin-stats', {
      method: 'POST',
      body: { timeRange },
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY}`,
      },
      timeout: 20000
    });
  }

  // Cache management
  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now > cached.timestamp + cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  private setCache(key: string, data: any, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Clear cache (useful for forced refresh)
  clearCache(): void {
    this.cache.clear();
  }

  // Get cache stats
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

export const apiClient = new ApiClient();