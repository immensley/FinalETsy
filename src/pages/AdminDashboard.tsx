import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Activity, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  RefreshCw,
  Download,
  Eye,
  Zap,
  Clock,
  Target,
  BarChart3,
  PieChart,
  Calendar
} from 'lucide-react';

interface AdminStats {
  costs: {
    today: number;
    yesterday: number;
    thisMonth: number;
    lastMonth: number;
    breakdown: Record<string, number>;
  };
  usage: {
    totalRequests: number;
    successRate: number;
    avgResponseTime: number;
    activeUsers: number;
    newUsers: number;
  };
  performance: {
    errorRate: number;
    avgTokensPerRequest: number;
    mostExpensiveOperations: Array<{
      operation: string;
      cost: number;
      count: number;
    }>;
  };
  trends: {
    hourlyUsage: Array<{ hour: string; requests: number; cost: number }>;
    dailyGrowth: number;
    costTrend: 'up' | 'down' | 'stable';
  };
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchAdminStats();
    
    if (autoRefresh) {
      const interval = setInterval(fetchAdminStats, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [timeRange, autoRefresh]);

  const fetchAdminStats = async () => {
    if (!refreshing) setRefreshing(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-stats`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({ timeRange })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch admin stats');
      }

      const data = await response.json();
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const exportData = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/export-admin-data`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY}`,
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `etsystudio-admin-data-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchAdminStats}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => `$${amount.toFixed(4)}`;
  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;
  const formatNumber = (num: number) => num.toLocaleString();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">EtsyStudio AI - System Monitoring & Analytics</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Time Range:</label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as '24h' | '7d' | '30d')}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="autoRefresh"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="autoRefresh" className="text-sm text-gray-700">Auto-refresh</label>
            </div>
            
            <button
              onClick={exportData}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download className="h-4 w-4" />
              <span>Export Data</span>
            </button>
            
            <button
              onClick={fetchAdminStats}
              disabled={refreshing}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Alert Section */}
        {stats && stats.costs.today > 10 && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <span className="font-medium text-yellow-800">
                High daily costs detected: {formatCurrency(stats.costs.today)}
              </span>
            </div>
          </div>
        )}

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats && (
            <>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Today's AI Costs</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.costs.today)}</p>
                    <p className="text-sm text-gray-500">
                      vs yesterday: {formatCurrency(stats.costs.yesterday)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Users</p>
                    <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.usage.activeUsers)}</p>
                    <p className="text-sm text-gray-500">
                      New: {formatNumber(stats.usage.newUsers)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">API Requests</p>
                    <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.usage.totalRequests)}</p>
                    <p className="text-sm text-gray-500">
                      Success: {formatPercentage(stats.usage.successRate)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Activity className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.usage.avgResponseTime}ms</p>
                    <p className="text-sm text-gray-500">
                      Error Rate: {formatPercentage(stats.performance.errorRate)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Charts and Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Cost Breakdown */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <PieChart className="h-5 w-5 mr-2" />
              Cost Breakdown
            </h3>
            {stats && (
              <div className="space-y-3">
                {Object.entries(stats.costs.breakdown).map(([service, cost]) => (
                  <div key={service} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        service.includes('claude') ? 'bg-blue-500' : 'bg-green-500'
                      }`}></div>
                      <span className="text-gray-700 capitalize">{service.replace('-', ' ')}</span>
                    </div>
                    <span className="font-medium text-gray-900">{formatCurrency(cost)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Most Expensive Operations */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Most Expensive Operations
            </h3>
            {stats && (
              <div className="space-y-3">
                {stats.performance.mostExpensiveOperations.map((op, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{op.operation}</p>
                      <p className="text-sm text-gray-600">{formatNumber(op.count)} requests</p>
                    </div>
                    <span className="font-bold text-red-600">{formatCurrency(op.cost)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Hourly Usage Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Hourly Usage Pattern
          </h3>
          {stats && (
            <div className="h-64 flex items-end space-x-2">
              {stats.trends.hourlyUsage.map((hour, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-blue-500 rounded-t"
                    style={{ 
                      height: `${(hour.requests / Math.max(...stats.trends.hourlyUsage.map(h => h.requests))) * 200}px`,
                      minHeight: '4px'
                    }}
                  ></div>
                  <span className="text-xs text-gray-600 mt-2">{hour.hour}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* System Health */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
              System Health
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">API Status</span>
                <span className="text-green-600 font-medium">Operational</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Database</span>
                <span className="text-green-600 font-medium">Healthy</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Edge Functions</span>
                <span className="text-green-600 font-medium">Running</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Growth Metrics
            </h3>
            {stats && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Daily Growth</span>
                  <span className={`font-medium ${stats.trends.dailyGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stats.trends.dailyGrowth > 0 ? '+' : ''}{stats.trends.dailyGrowth.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Cost Trend</span>
                  <span className={`font-medium ${
                    stats.trends.costTrend === 'up' ? 'text-red-600' : 
                    stats.trends.costTrend === 'down' ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {stats.trends.costTrend === 'up' ? '↗ Rising' : 
                     stats.trends.costTrend === 'down' ? '↘ Falling' : '→ Stable'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Avg Tokens/Request</span>
                  <span className="font-medium text-gray-900">
                    {formatNumber(stats.performance.avgTokensPerRequest)}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button className="w-full text-left px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                View Error Logs
              </button>
              <button className="w-full text-left px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
                Optimize Costs
              </button>
              <button className="w-full text-left px-3 py-2 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors">
                Scale Resources
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()} • 
          Auto-refresh: {autoRefresh ? 'ON' : 'OFF'} • 
          Data retention: 90 days
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;