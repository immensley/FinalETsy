import React from 'react';
import { DollarSign, TrendingUp, AlertTriangle, Activity } from 'lucide-react';
import { useApiUsageQuery } from '../hooks/useOptimizedQuery';

interface CostMonitorProps {
  className?: string;
}

const CostMonitor: React.FC<CostMonitorProps> = ({ className = '' }) => {
  const { data: costData, isLoading: loading, error, refetch } = useApiUsageQuery();

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center space-x-2 text-red-800">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm">Cost monitoring unavailable</span>
        </div>
      </div>
    );
  }

  if (!costData) return null;

  const formatCost = (cost: number) => `$${cost.toFixed(4)}`;
  const formatPercentage = (rate: number) => `${(rate * 100).toFixed(1)}%`;

  return (
    <div className={`bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center">
          <DollarSign className="h-4 w-4 mr-2 text-blue-600" />
          Today's AI Costs
        </h3>
        <button
          onClick={() => refetch()}
          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-xs text-gray-600">Total Cost</p>
              <p className="text-lg font-bold text-gray-900">{formatCost(costData.totalCost)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="flex items-center space-x-2">
            <Activity className="h-4 w-4 text-blue-600" />
            <div>
              <p className="text-xs text-gray-600">Requests</p>
              <p className="text-lg font-bold text-gray-900">{costData.requestCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-orange-600" />
            <div>
              <p className="text-xs text-gray-600">Success Rate</p>
              <p className="text-lg font-bold text-gray-900">{formatPercentage(costData.successRate)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-purple-600" />
            <div>
              <p className="text-xs text-gray-600">Avg/Request</p>
              <p className="text-lg font-bold text-gray-900">
                {formatCost(costData.requestCount > 0 ? costData.totalCost / costData.requestCount : 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {Object.keys(costData.breakdown).length > 0 && (
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <h4 className="text-xs font-medium text-gray-700 mb-2">Cost Breakdown</h4>
          <div className="space-y-1">
            {Object.entries(costData.breakdown).map(([service, cost]) => (
              <div key={service} className="flex justify-between items-center text-xs">
                <span className="text-gray-600 capitalize">{service.replace('-', ' ')}</span>
                <span className="font-medium text-gray-900">{formatCost(cost)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-3 text-xs text-gray-500 text-center">
        Real-time AI usage monitoring • Updates every 5 minutes
      </div>
    </div>
  );
};

export default CostMonitor;