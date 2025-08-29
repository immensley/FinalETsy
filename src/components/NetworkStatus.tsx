import React from 'react';
import { Wifi, WifiOff, Upload, AlertTriangle } from 'lucide-react';
import { useOfflineSupport } from '../hooks/useOfflineSupport';

const NetworkStatus: React.FC = () => {
  const { isOnline, offlineData, syncOfflineData } = useOfflineSupport();

  if (isOnline && offlineData.pendingUploads.length === 0) {
    return null; // Don't show anything when online with no pending data
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {!isOnline ? (
        <div className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
          <WifiOff className="h-4 w-4" />
          <span className="text-sm font-medium">You're offline</span>
        </div>
      ) : offlineData.pendingUploads.length > 0 ? (
        <div className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Upload className="h-4 w-4" />
            <span className="text-sm font-medium">
              {offlineData.pendingUploads.length} pending upload(s)
            </span>
          </div>
          <button
            onClick={syncOfflineData}
            className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition-colors"
          >
            Sync Now
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default NetworkStatus;