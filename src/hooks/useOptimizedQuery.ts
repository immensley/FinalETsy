import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useErrorHandler } from './useErrorHandler';
import { apiClient } from '../lib/apiClient';

interface OptimizedQueryOptions<T> extends Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'> {
  queryKey: string[];
  queryFn: () => Promise<T>;
  cacheDuration?: number;
  staleDuration?: number;
}

export function useOptimizedQuery<T>({
  queryKey,
  queryFn,
  cacheDuration = 10 * 60 * 1000, // 10 minutes default
  staleDuration = 5 * 60 * 1000,  // 5 minutes default
  ...options
}: OptimizedQueryOptions<T>) {
  const { handleError } = useErrorHandler();

  return useQuery({
    queryKey,
    queryFn: async () => {
      try {
        return await queryFn();
      } catch (error) {
        const result = await handleError(error, {
          operation: 'query',
          queryKey: queryKey.join('-')
        });
        
        if (!result.success) {
          throw result.error || error;
        }
        
        return result.data;
      }
    },
    staleTime: staleDuration,
    cacheTime: cacheDuration,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    refetchOnMount: 'always',
    ...options,
  });
}

// Specialized hook for API usage data
export function useApiUsageQuery(userId?: string) {
  const { handleError } = useErrorHandler();

  return useOptimizedQuery({
    queryKey: ['api-usage', userId || 'anonymous'],
    queryFn: async () => {
      const result = await apiClient.getUsageStats(userId);
      if (!result.success) {
        throw result.error || new Error('Failed to fetch usage stats');
      }
      return result.data;
    },
    staleDuration: 2 * 60 * 1000, // 2 minutes for usage data
    cacheDuration: 5 * 60 * 1000, // 5 minutes cache
    enabled: !!userId, // Only run if userId is provided
  });
}

// Specialized hook for admin stats
export function useAdminStatsQuery(timeRange: '24h' | '7d' | '30d' = '24h') {
  const { handleError } = useErrorHandler();

  return useOptimizedQuery({
    queryKey: ['admin-stats', timeRange],
    queryFn: async () => {
      const result = await apiClient.getAdminStats(timeRange);
      if (!result.success) {
        throw result.error || new Error('Failed to fetch admin stats');
      }
      return result.data;
    },
    staleDuration: 30 * 1000, // 30 seconds for admin data
    cacheDuration: 2 * 60 * 1000, // 2 minutes cache
  });
}