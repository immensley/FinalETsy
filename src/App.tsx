import React, { Suspense, lazy } from 'react';
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ErrorBoundary from './components/ErrorBoundary';
import ErrorNotification from './components/ErrorNotification';
import NetworkStatus from './components/NetworkStatus';
import Header from './components/Header';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';
import { useErrorHandler } from './hooks/useErrorHandler';
import { useOfflineSupport } from './hooks/useOfflineSupport';

// Lazy load pages for code splitting
const Homepage = lazy(() => import('./pages/Homepage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Pricing = lazy(() => import('./pages/Pricing'));
const VideoStudio = lazy(() => import('./pages/VideoStudio'));
const MarketIntelligence = lazy(() => import('./pages/MarketIntelligence'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const BehavioralAnalysis = lazy(() => import('./pages/BehavioralAnalysis'));

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const [currentPage, setCurrentPage] = useState('/');
  const { currentError, clearError } = useErrorHandler();
  const { isOnline } = useOfflineSupport();

  const renderPage = () => {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        {(() => {
          switch (currentPage) {
            case '/':
              return <Homepage />;
            case '/dashboard':
              return <Dashboard />;
            case '/pricing':
              return <Pricing />;
            case '/video-studio':
              return <VideoStudio />;
            case '/insights':
              return <MarketIntelligence />;
            case '/admin':
              return <AdminDashboard />;
            case '/behavioral':
              return <BehavioralAnalysis />;
            default:
              return <Homepage />;
          }
        })()}
      </Suspense>
    );
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />
          <main className="flex-1">
            {renderPage()}
          </main>
          <Footer />
          
          {/* Global error notification */}
          <ErrorNotification 
            error={currentError} 
            onDismiss={clearError}
            autoHide={true}
            autoHideDelay={6000}
          />
          
          {/* Network status indicator */}
          <NetworkStatus />
        </div>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;