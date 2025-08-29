import { useState, useEffect } from 'react';
import { errorHandler } from '../lib/errorHandler';

interface OfflineData {
  pendingUploads: Array<{
    id: string;
    file: File;
    timestamp: string;
  }>;
  cachedResults: Array<{
    id: string;
    data: any;
    timestamp: string;
  }>;
}

export function useOfflineSupport() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineData, setOfflineData] = useState<OfflineData>({
    pendingUploads: [],
    cachedResults: []
  });

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineData();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load offline data from localStorage
    loadOfflineData();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadOfflineData = () => {
    try {
      const stored = localStorage.getItem('offline_data');
      if (stored) {
        setOfflineData(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load offline data:', error);
    }
  };

  const saveOfflineData = (data: OfflineData) => {
    try {
      localStorage.setItem('offline_data', JSON.stringify(data));
      setOfflineData(data);
    } catch (error) {
      console.error('Failed to save offline data:', error);
    }
  };

  const addPendingUpload = (file: File) => {
    const newUpload = {
      id: crypto.randomUUID(),
      file,
      timestamp: new Date().toISOString()
    };

    const updatedData = {
      ...offlineData,
      pendingUploads: [...offlineData.pendingUploads, newUpload]
    };

    saveOfflineData(updatedData);
    return newUpload.id;
  };

  const cacheResult = (id: string, data: any) => {
    const cachedResult = {
      id,
      data,
      timestamp: new Date().toISOString()
    };

    const updatedData = {
      ...offlineData,
      cachedResults: [...offlineData.cachedResults, cachedResult]
    };

    saveOfflineData(updatedData);
  };

  const getCachedResult = (id: string) => {
    return offlineData.cachedResults.find(result => result.id === id);
  };

  const syncOfflineData = async () => {
    if (!isOnline || offlineData.pendingUploads.length === 0) return;

    try {
      // Sync pending uploads
      for (const upload of offlineData.pendingUploads) {
        try {
          // Process the upload (this would call your actual upload function)
          console.log('Syncing upload:', upload.id);
          
          // Remove from pending after successful sync
          const updatedData = {
            ...offlineData,
            pendingUploads: offlineData.pendingUploads.filter(u => u.id !== upload.id)
          };
          saveOfflineData(updatedData);
        } catch (uploadError) {
          console.error('Failed to sync upload:', upload.id, uploadError);
        }
      }

      // Sync offline errors
      await errorHandler.syncOfflineErrors();
      
    } catch (error) {
      console.error('Failed to sync offline data:', error);
    }
  };

  const clearOfflineData = () => {
    const emptyData: OfflineData = {
      pendingUploads: [],
      cachedResults: []
    };
    saveOfflineData(emptyData);
  };

  return {
    isOnline,
    offlineData,
    addPendingUpload,
    cacheResult,
    getCachedResult,
    syncOfflineData,
    clearOfflineData,
    hasPendingData: offlineData.pendingUploads.length > 0 || offlineData.cachedResults.length > 0
  };
}