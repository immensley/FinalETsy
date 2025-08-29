import React, { useState } from 'react';
import { 
  BarChart, 
  TrendingUp, 
  RefreshCw, 
  Download, 
  Search, 
  Filter,
  Upload,
  Play,
  Users,
  Zap,
  ArrowRight,
  Target,
  Eye,
  Sparkles
} from 'lucide-react';
import { mockJobHistory, JobHistoryItem } from '../lib/mockData';
import AsyncJobTracker from '../components/AsyncJobTracker';
import SubscriptionManager from '../components/SubscriptionManager';

const Dashboard = () => {
  const [jobHistory] = useState<JobHistoryItem[]>(mockJobHistory);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const stats = [
    { label: 'Listings Optimized', value: '47', icon: BarChart, color: 'blue' },
    { label: 'Avg SEO Score', value: '8.9/10', icon: TrendingUp, color: 'green' },
    { label: 'Videos Created', value: '23', icon: RefreshCw, color: 'orange' },
  ];

  const filteredHistory = jobHistory.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || item.status.toLowerCase() === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const quickActions = [
    {
      title: 'Start New Listing Optimization',
      description: 'Upload a product photo and generate optimized content',
      icon: Upload,
      color: 'blue',
      action: () => {
        // Navigate to homepage upload section
        window.location.href = '/#upload-section';
      }
    },
    {
      title: 'Generate Product Video',
      description: 'Create Etsy-compliant videos that boost conversions',
      icon: Play,
      color: 'green',
      action: () => {
        // Navigate to video studio
        window.location.href = '/video-studio';
      }
    },
    {
      title: 'Analyze Competitor',
      description: 'Get insights from competitor listings and messaging',
      icon: Target,
      color: 'orange',
      action: () => {
        // Navigate to behavioral analysis
        window.location.href = '/behavioral';
      }
    },
    {
      title: 'Market Intelligence',
      description: 'View latest trends and algorithm insights',
      icon: TrendingUp,
      color: 'purple',
      action: () => {
        // Navigate to market intelligence
        window.location.href = '/insights';
      }
    }
  ];
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Monitor your Etsy optimization performance and manage your listings.</p>
      </div>

      {/* Quick Actions Section */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Zap className="h-6 w-6 mr-2 text-blue-600" />
                Quick Actions
              </h2>
              <p className="text-gray-600 mt-1">Jump into your most common tasks</p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Sparkles className="h-4 w-4" />
              <span>Powered by AI</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className={`group p-4 bg-white rounded-lg border-2 border-transparent hover:border-${action.color}-300 hover:shadow-lg transition-all duration-200 transform hover:scale-105 text-left`}
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${
                  action.color === 'blue' ? 'bg-blue-100 group-hover:bg-blue-200' :
                  action.color === 'green' ? 'bg-green-100 group-hover:bg-green-200' :
                  action.color === 'orange' ? 'bg-orange-100 group-hover:bg-orange-200' :
                  'bg-purple-100 group-hover:bg-purple-200'
                }`}>
                  <action.icon className={`h-6 w-6 ${
                    action.color === 'blue' ? 'text-blue-600' :
                    action.color === 'green' ? 'text-green-600' :
                    action.color === 'orange' ? 'text-orange-600' :
                    'text-purple-600'
                  }`} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-gray-700">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3 group-hover:text-gray-500">
                  {action.description}
                </p>
                <div className="flex items-center text-xs font-medium text-gray-400 group-hover:text-gray-600">
                  <span>Get started</span>
                  <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
          </div>
          
          {/* Usage Tip */}
          <div className="mt-6 bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-white/50">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Eye className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">💡 Pro Tip</h4>
                <p className="text-sm text-gray-700">
                  Start with listing optimization to understand your product better, then create videos for maximum impact. 
                  Most successful sellers see <strong>340% traffic increase</strong> when using both features together.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                stat.color === 'blue' ? 'bg-blue-100' :
                stat.color === 'green' ? 'bg-green-100' : 'bg-orange-100'
              }`}>
                <stat.icon className={`h-6 w-6 ${
                  stat.color === 'blue' ? 'text-blue-600' :
                  stat.color === 'green' ? 'text-green-600' : 'text-orange-600'
                }`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Async Job Tracker */}
      <div className="mb-8">
        <AsyncJobTracker />
      </div>

      {/* Subscription Manager */}
      <div className="mb-8">
        <SubscriptionManager />
      </div>
      {/* Job History */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <h2 className="text-lg font-semibold text-gray-900">Recent Optimizations</h2>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search listings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="processing">Processing</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SEO Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredHistory.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        className="h-12 w-12 rounded-lg object-cover"
                        src={item.thumbnail}
                        alt="Product"
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="ml-3">
                        <p className="text-sm text-gray-600">{item.date}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900 max-w-xs truncate">
                      {item.title}
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900">{item.seoScore}/10</span>
                      <div className={`ml-2 w-16 h-2 rounded-full ${
                        item.seoScore >= 9 ? 'bg-green-200' :
                        item.seoScore >= 8 ? 'bg-blue-200' : 'bg-orange-200'
                      }`}>
                        <div 
                          className={`h-2 rounded-full ${
                            item.seoScore >= 9 ? 'bg-green-500' :
                            item.seoScore >= 8 ? 'bg-blue-500' : 'bg-orange-500'
                          }`}
                          style={{ width: `${item.seoScore * 10}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      item.status === 'Completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => {
                          // View functionality
                          alert('Opening detailed view...');
                        }}
                        className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                      >
                        View
                      </button>
                      <button 
                        onClick={() => {
                          // Re-optimize functionality
                          alert('Re-optimizing listing...');
                        }}
                        className="text-orange-600 hover:text-orange-700 font-medium transition-colors"
                      >
                        Re-optimize
                      </button>
                      <button 
                        onClick={() => {
                          // Export functionality
                          alert('Exporting listing data...');
                        }}
                        className="text-green-600 hover:text-green-700 font-medium transition-colors"
                      >
                        Export
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;