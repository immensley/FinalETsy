import React, { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw, Wifi, WifiOff } from 'lucide-react';

interface GracefulDegradationProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requiresNetwork?: boolean;
  requiresAuth?: boolean;
  minimumFeatures?: string[];
}

const GracefulDegradation: React.FC<GracefulDegradationProps> = ({
  children,
  fallback,
  requiresNetwork = false,
  requiresAuth = false,
  minimumFeatures = []
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [featuresAvailable, setFeaturesAvailable] = useState<Record<string, boolean>>({});
  const [degradationLevel, setDegradationLevel] = useState<'none' | 'partial' | 'full'>('none');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    checkFeatureAvailability();
  }, [isOnline, minimumFeatures]);

  const checkFeatureAvailability = async () => {
    const features: Record<string, boolean> = {};
    
    // Check network-dependent features
    if (requiresNetwork && !isOnline) {
      features.network = false;
      setDegradationLevel('full');
    } else {
      features.network = true;
    }

    // Check API availability
    try {
      if (isOnline) {
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/`, {
          method: 'HEAD',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          }
        });
        features.api = response.ok;
      } else {
        features.api = false;
      }
    } catch {
      features.api = false;
    }

    // Check authentication if required
    if (requiresAuth) {
      // This would check your auth state
      features.auth = true; // Placeholder
    }

    setFeaturesAvailable(features);

    // Determine degradation level
    const unavailableFeatures = Object.values(features).filter(available => !available).length;
    if (unavailableFeatures === 0) {
      setDegradationLevel('none');
    } else if (unavailableFeatures < Object.keys(features).length / 2) {
      setDegradationLevel('partial');
    } else {
      setDegradationLevel('full');
    }
  };

  // Full degradation - show fallback or basic message
  if (degradationLevel === 'full') {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            {isOnline ? (
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            ) : (
              <WifiOff className="h-8 w-8 text-orange-600" />
            )}
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {isOnline ? 'Service Temporarily Unavailable' : 'You\'re Offline'}
          </h2>
          
          <p className="text-gray-600 mb-6">
            {isOnline 
              ? 'Our AI services are temporarily unavailable. Please try again in a few minutes.'
              : 'Some features require an internet connection. Please check your connection and try again.'
            }
          </p>

          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <RefreshCw className="h-5 w-5" />
              <span>Try Again</span>
            </button>
            
            <button
              onClick={() => window.location.href = '/'}
              className="w-full flex items-center justify-center space-x-2 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <span>Go to Homepage</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Partial degradation - show warning but allow usage
  if (degradationLevel === 'partial') {
    return (
      <div>
        <div className="bg-yellow-50 border-b border-yellow-200 p-4">
          <div className="max-w-7xl mx-auto flex items-center space-x-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-yellow-800">
                Some features may be limited due to connectivity issues. 
                {!featuresAvailable.network && ' You\'re currently offline.'}
                {!featuresAvailable.api && ' Our AI services are experiencing issues.'}
              </p>
            </div>
            <button
              onClick={checkFeatureAvailability}
              className="text-yellow-600 hover:text-yellow-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
        {children}
      </div>
    );
  }

  // No degradation - normal operation
  return <>{children}</>;
};

export default GracefulDegradation;