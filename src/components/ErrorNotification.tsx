import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react';
import { AppError } from '../lib/errorHandler';

interface ErrorNotificationProps {
  error: AppError | null;
  onDismiss: () => void;
  autoHide?: boolean;
  autoHideDelay?: number;
}

const ErrorNotification: React.FC<ErrorNotificationProps> = ({
  error,
  onDismiss,
  autoHide = true,
  autoHideDelay = 5000
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (error) {
      setIsVisible(true);
      
      if (autoHide && error.severity !== 'critical') {
        const timer = setTimeout(() => {
          handleDismiss();
        }, autoHideDelay);
        
        return () => clearTimeout(timer);
      }
    }
  }, [error, autoHide, autoHideDelay]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300); // Wait for animation to complete
  };

  if (!error || !isVisible) return null;

  const getNotificationStyle = (severity: AppError['severity']) => {
    switch (severity) {
      case 'critical':
        return {
          bg: 'bg-red-500',
          border: 'border-red-600',
          text: 'text-white',
          icon: AlertTriangle
        };
      case 'high':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-800',
          icon: AlertTriangle
        };
      case 'medium':
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          text: 'text-orange-800',
          icon: AlertCircle
        };
      case 'low':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-800',
          icon: Info
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-800',
          icon: Info
        };
    }
  };

  const style = getNotificationStyle(error.severity);
  const IconComponent = style.icon;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`max-w-sm w-full ${style.bg} border ${style.border} rounded-lg shadow-lg p-4`}>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <IconComponent className={`h-5 w-5 ${style.text}`} />
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className={`text-sm font-medium ${style.text} mb-1`}>
              {error.severity === 'critical' ? 'Critical Error' :
               error.severity === 'high' ? 'Error' :
               error.severity === 'medium' ? 'Warning' : 'Notice'}
            </h4>
            <p className={`text-sm ${style.text} opacity-90`}>
              {error.userMessage}
            </p>
            
            {/* Error Code for Support */}
            {error.severity === 'high' || error.severity === 'critical' ? (
              <p className={`text-xs ${style.text} opacity-70 mt-2`}>
                Error Code: {error.code}
              </p>
            ) : null}
          </div>
          
          <button
            onClick={handleDismiss}
            className={`flex-shrink-0 ${style.text} opacity-70 hover:opacity-100 transition-opacity`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        {/* Progress bar for auto-hide */}
        {autoHide && error.severity !== 'critical' && (
          <div className="mt-3 w-full bg-black/10 rounded-full h-1">
            <div 
              className="bg-current h-1 rounded-full transition-all ease-linear"
              style={{ 
                width: '100%',
                animation: `shrink ${autoHideDelay}ms linear forwards`
              }}
            />
          </div>
        )}
      </div>
      
      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default ErrorNotification;