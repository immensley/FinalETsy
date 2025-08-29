import React, { useState } from 'react';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Eye,
  Download,
  Trash2
} from 'lucide-react';
import { useOptimizedQuery } from '../hooks/useOptimizedQuery';

interface AsyncJob {
  id: string;
  type: 'analyze-product' | 'generate-listing' | 'generate-video';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  currentStep: string;
  estimatedTimeRemaining: number;
  createdAt: string;
  completedAt?: string;
  error?: string;
}

interface AsyncJobTrackerProps {
  onJobComplete?: (jobId: string, result: any) => void;
}

const AsyncJobTracker: React.FC<AsyncJobTrackerProps> = ({ onJobComplete }) => {
  const { data: jobs = [], isLoading: loading, refetch } = useOptimizedQuery({
    queryKey: ['async-jobs'],
    queryFn: async () => {
      // Simulate API call to fetch user's jobs
      // In real implementation, this would call your Supabase function
      const mockJobs: AsyncJob[] = [
        {
          id: '1',
          type: 'analyze-product',
          status: 'processing',
          progress: 65,
          currentStep: 'Processing with Claude 3...',
          estimatedTimeRemaining: 8,
          createdAt: new Date(Date.now() - 30000).toISOString()
        },
        {
          id: '2',
          type: 'generate-listing',
          status: 'completed',
          progress: 100,
          currentStep: 'Completed',
          estimatedTimeRemaining: 0,
          createdAt: new Date(Date.now() - 300000).toISOString(),
          completedAt: new Date(Date.now() - 60000).toISOString()
        },
        {
          id: '3',
          type: 'generate-video',
          status: 'failed',
          progress: 30,
          currentStep: 'Failed',
          estimatedTimeRemaining: 0,
          createdAt: new Date(Date.now() - 600000).toISOString(),
          error: 'Image processing failed'
        }
      ];
      return mockJobs;
    },
    staleDuration: 2000, // 2 seconds for real-time job tracking
    cacheDuration: 5000, // 5 seconds cache
  });

  const getJobIcon = (status: string) => {
    switch (status) {
      case 'pending':
      case 'processing':
        return <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getJobTypeLabel = (type: string) => {
    switch (type) {
      case 'analyze-product':
        return 'Product Analysis';
      case 'generate-listing':
        return 'Listing Generation';
      case 'generate-video':
        return 'Video Generation';
      default:
        return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'processing':
        return 'text-blue-600 bg-blue-100';
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTimeRemaining = (seconds: number) => {
    if (seconds <= 0) return '';
    if (seconds < 60) return `${seconds}s remaining`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s remaining`;
  };

  const formatRelativeTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const deleteJob = async (jobId: string) => {
    setJobs(jobs.filter(job => job.id !== jobId));
  };

  const viewJobResult = (jobId: string) => {
    // Navigate to job result or open modal
    console.log('Viewing result for job:', jobId);
  };

  if (jobs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Jobs</h3>
          <p className="text-gray-600">Your processing jobs will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Processing Jobs</h3>
          <button
            onClick={() => refetch()}
            disabled={loading}
            className="flex items-center space-x-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {jobs.map((job) => (
          <div key={job.id} className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                {getJobIcon(job.status)}
                <div>
                  <h4 className="font-medium text-gray-900">{getJobTypeLabel(job.type)}</h4>
                  <p className="text-sm text-gray-600">Started {formatRelativeTime(job.createdAt)}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(job.status)}`}>
                  {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                </span>
                
                <div className="flex space-x-1">
                  {job.status === 'completed' && (
                    <>
                      <button
                        onClick={() => viewJobResult(job.id)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="View Result"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </>
                  )}
                  
                  <button
                    onClick={() => deleteJob(job.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            {(job.status === 'processing' || job.status === 'pending') && (
              <div className="mb-3">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                  <span>{job.currentStep}</span>
                  <span>{job.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${job.progress}%` }}
                  ></div>
                </div>
                {job.estimatedTimeRemaining > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {formatTimeRemaining(job.estimatedTimeRemaining)}
                  </p>
                )}
              </div>
            )}

            {/* Error Message */}
            {job.status === 'failed' && job.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">{job.error}</p>
              </div>
            )}

            {/* Completion Info */}
            {job.status === 'completed' && job.completedAt && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800">
                  Completed {formatRelativeTime(job.completedAt)}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AsyncJobTracker;