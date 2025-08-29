import React, { useState, useEffect } from 'react';
import { 
  Crown, 
  Zap, 
  Star, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp,
  Clock,
  Users,
  Sparkles,
  Target,
  ArrowUp,
  ArrowDown,
  Lightbulb
} from 'lucide-react';
import { useOptimizedQuery } from '../hooks/useOptimizedQuery';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: {
    listingsPerMonth: number;
    videosPerMonth: number;
    aiModel: 'haiku' | 'sonnet' | 'opus';
    advancedFeatures: boolean;
    prioritySupport: boolean;
    apiAccess: boolean;
  };
  limits: {
    maxImageSize: number;
    maxConcurrentJobs: number;
    retentionDays: number;
  };
}

interface UserUsage {
  listingsUsed: number;
  videosUsed: number;
  remaining: {
    listings: number;
    videos: number;
  };
  resetDate: string;
}

const SubscriptionManager = () => {
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan | null>(null);
  const [usage, setUsage] = useState<UserUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [userId] = useState('demo-user-123'); // In real app, get from auth context

  // Fetch plan recommendations
  const { data: recommendations, isLoading: recommendationsLoading } = useOptimizedQuery({
    queryKey: ['plan-recommendations', userId],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-plan-recommendations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
      });
      
      if (!response.ok) throw new Error('Failed to fetch recommendations');
      return response.json();
    },
    staleDuration: 5 * 60 * 1000, // 5 minutes
    cacheDuration: 10 * 60 * 1000, // 10 minutes
    enabled: !!userId
  });

  const plans: SubscriptionPlan[] = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      interval: 'month',
      features: {
        listingsPerMonth: 5,
        videosPerMonth: 2,
        aiModel: 'haiku',
        advancedFeatures: false,
        prioritySupport: false,
        apiAccess: false
      },
      limits: {
        maxImageSize: 5,
        maxConcurrentJobs: 1,
        retentionDays: 30
      }
    },
    {
      id: 'starter',
      name: 'Starter',
      price: 29,
      interval: 'month',
      features: {
        listingsPerMonth: 50,
        videosPerMonth: 10,
        aiModel: 'sonnet',
        advancedFeatures: false,
        prioritySupport: false,
        apiAccess: false
      },
      limits: {
        maxImageSize: 10,
        maxConcurrentJobs: 2,
        retentionDays: 90
      }
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 79,
      interval: 'month',
      features: {
        listingsPerMonth: -1,
        videosPerMonth: -1,
        aiModel: 'sonnet',
        advancedFeatures: true,
        prioritySupport: true,
        apiAccess: false
      },
      limits: {
        maxImageSize: 20,
        maxConcurrentJobs: 5,
        retentionDays: 365
      }
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 199,
      interval: 'month',
      features: {
        listingsPerMonth: -1,
        videosPerMonth: -1,
        aiModel: 'opus',
        advancedFeatures: true,
        prioritySupport: true,
        apiAccess: true
      },
      limits: {
        maxImageSize: 50,
        maxConcurrentJobs: 10,
        retentionDays: 365
      }
    }
  ];

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock current plan (Free tier)
      setCurrentPlan(plans[0]);
      
      // Mock usage data
      setUsage({
        listingsUsed: 3,
        videosUsed: 1,
        remaining: {
          listings: 2,
          videos: 1
        },
        resetDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
      });
    } catch (error) {
      console.error('Error fetching subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600 bg-red-100';
    if (percentage >= 70) return 'text-orange-600 bg-orange-100';
    return 'text-green-600 bg-green-100';
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'free': return Sparkles;
      case 'starter': return Zap;
      case 'pro': return Star;
      case 'enterprise': return Crown;
      default: return Sparkles;
    }
  };

  const getAIModelBadge = (model: string) => {
    const badges = {
      haiku: { label: 'Claude 3 Haiku', color: 'bg-gray-100 text-gray-800' },
      sonnet: { label: 'Claude 3 Sonnet', color: 'bg-blue-100 text-blue-800' },
      opus: { label: 'Claude 3 Opus', color: 'bg-purple-100 text-purple-800' }
    };
    return badges[model as keyof typeof badges] || badges.haiku;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Plan Overview */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {currentPlan && (
              <>
                {React.createElement(getPlanIcon(currentPlan.id), { 
                  className: "h-8 w-8 text-blue-600" 
                })}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{currentPlan.name} Plan</h2>
                  <p className="text-gray-600">
                    {currentPlan.price === 0 ? 'Free forever' : `$${currentPlan.price}/month`}
                  </p>
                </div>
              </>
            )}
          </div>
          
          <div className="text-right">
            {currentPlan && (
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getAIModelBadge(currentPlan.features.aiModel).color}`}>
                {getAIModelBadge(currentPlan.features.aiModel).label}
              </div>
            )}
          </div>
        </div>

        {/* Usage Projection Alert */}
        {recommendations?.usageProjection && (
          <div className={`mb-6 p-4 rounded-lg border ${
            recommendations.usageProjection.riskLevel === 'high' ? 'bg-red-50 border-red-200' :
            recommendations.usageProjection.riskLevel === 'medium' ? 'bg-orange-50 border-orange-200' :
            'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-start space-x-3">
              <div className={`mt-0.5 ${
                recommendations.usageProjection.riskLevel === 'high' ? 'text-red-600' :
                recommendations.usageProjection.riskLevel === 'medium' ? 'text-orange-600' :
                'text-blue-600'
              }`}>
                {recommendations.usageProjection.riskLevel === 'high' ? <AlertTriangle className="h-5 w-5" /> :
                 recommendations.usageProjection.riskLevel === 'medium' ? <Clock className="h-5 w-5" /> :
                 <TrendingUp className="h-5 w-5" />}
              </div>
              <div className="flex-1">
                <h4 className={`font-medium ${
                  recommendations.usageProjection.riskLevel === 'high' ? 'text-red-900' :
                  recommendations.usageProjection.riskLevel === 'medium' ? 'text-orange-900' :
                  'text-blue-900'
                }`}>
                  {recommendations.usageProjection.riskLevel === 'high' ? 'Usage Limit Warning' :
                   recommendations.usageProjection.riskLevel === 'medium' ? 'Approaching Usage Limit' :
                   'Usage Projection'}
                </h4>
                <p className={`text-sm mt-1 ${
                  recommendations.usageProjection.riskLevel === 'high' ? 'text-red-800' :
                  recommendations.usageProjection.riskLevel === 'medium' ? 'text-orange-800' :
                  'text-blue-800'
                }`}>
                  {recommendations.usageProjection.willExceedLimit ? (
                    <>
                      Projected monthly usage: <strong>{recommendations.usageProjection.projectedMonthlyUsage.listings} listings</strong>
                      {recommendations.usageProjection.daysUntilLimit && (
                        <> • You may hit your limit in <strong>{recommendations.usageProjection.daysUntilLimit} days</strong></>
                      )}
                    </>
                  ) : (
                    <>
                      You're on track to use <strong>{recommendations.usageProjection.projectedMonthlyUsage.listings} listings</strong> this month
                      {currentPlan?.features.listingsPerMonth !== -1 && (
                        <> (within your {currentPlan.features.listingsPerMonth} limit)</>
                      )}
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
        {/* Usage Progress */}
        {usage && currentPlan && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Listings Used</span>
                <span className="text-sm text-gray-600">
                  {usage.listingsUsed} / {currentPlan.features.listingsPerMonth === -1 ? '∞' : currentPlan.features.listingsPerMonth}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    getUsagePercentage(usage.listingsUsed, currentPlan.features.listingsPerMonth) >= 90 
                      ? 'bg-red-500' 
                      : getUsagePercentage(usage.listingsUsed, currentPlan.features.listingsPerMonth) >= 70 
                      ? 'bg-orange-500' 
                      : 'bg-green-500'
                  }`}
                  style={{ 
                    width: `${getUsagePercentage(usage.listingsUsed, currentPlan.features.listingsPerMonth)}%` 
                  }}
                ></div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Videos Used</span>
                <span className="text-sm text-gray-600">
                  {usage.videosUsed} / {currentPlan.features.videosPerMonth === -1 ? '∞' : currentPlan.features.videosPerMonth}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    getUsagePercentage(usage.videosUsed, currentPlan.features.videosPerMonth) >= 90 
                      ? 'bg-red-500' 
                      : getUsagePercentage(usage.videosUsed, currentPlan.features.videosPerMonth) >= 70 
                      ? 'bg-orange-500' 
                      : 'bg-green-500'
                  }`}
                  style={{ 
                    width: `${getUsagePercentage(usage.videosUsed, currentPlan.features.videosPerMonth)}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Reset Date */}
        {usage && (
          <div className="mt-4 flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>Usage resets on {new Date(usage.resetDate).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {/* Plan Recommendation */}
      {recommendations?.planRecommendation && recommendations.planRecommendation.urgency !== 'low' && (
        <div className={`p-6 rounded-lg border ${
          recommendations.planRecommendation.urgency === 'high' ? 'bg-red-50 border-red-200' :
          'bg-orange-50 border-orange-200'
        }`}>
          <div className="flex items-start space-x-4">
            <div className={`mt-1 ${
              recommendations.planRecommendation.urgency === 'high' ? 'text-red-600' : 'text-orange-600'
            }`}>
              <Target className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className={`text-lg font-semibold mb-2 ${
                recommendations.planRecommendation.urgency === 'high' ? 'text-red-900' : 'text-orange-900'
              }`}>
                {recommendations.planRecommendation.urgency === 'high' ? 'Urgent: Plan Upgrade Recommended' : 'Plan Optimization Available'}
              </h3>
              <p className={`mb-4 ${
                recommendations.planRecommendation.urgency === 'high' ? 'text-red-800' : 'text-orange-800'
              }`}>
                {recommendations.planRecommendation.reason}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-white p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Current Plan</span>
                    <span className="text-lg font-bold text-gray-900">
                      ${recommendations.planRecommendation.currentPlan.price}/mo
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{recommendations.planRecommendation.currentPlan.name}</p>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Recommended Plan</span>
                    <div className="text-right">
                      <span className="text-lg font-bold text-gray-900">
                        ${recommendations.planRecommendation.recommendedPlan.price}/mo
                      </span>
                      {recommendations.planRecommendation.potentialSavings > 0 && (
                        <div className="flex items-center text-green-600 text-xs">
                          <ArrowDown className="h-3 w-3 mr-1" />
                          Save ${recommendations.planRecommendation.potentialSavings.toFixed(2)}/mo
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">{recommendations.planRecommendation.recommendedPlan.name}</p>
                </div>
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Benefits of upgrading:</h4>
                <ul className="space-y-1">
                  {recommendations.planRecommendation.benefits.map((benefit: string, index: number) => (
                    <li key={index} className="flex items-center text-sm text-gray-700">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
              
              <button
                onClick={() => {
                  alert(`Upgrading to ${recommendations.planRecommendation.recommendedPlan.name} plan...`);
                }}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-all transform hover:scale-105 ${
                  recommendations.planRecommendation.urgency === 'high'
                    ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl'
                }`}
              >
                Upgrade to {recommendations.planRecommendation.recommendedPlan.name} Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Smart Insights */}
      {recommendations?.planRecommendation && recommendations.planRecommendation.urgency === 'low' && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200 p-6">
          <div className="flex items-start space-x-3">
            <Lightbulb className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-green-900 mb-2">Smart Insight</h3>
              <p className="text-green-800 mb-3">{recommendations.planRecommendation.reason}</p>
              {recommendations.planRecommendation.potentialSavings > 0 && (
                <div className="flex items-center text-sm text-green-700">
                  <ArrowDown className="h-4 w-4 mr-1" />
                  <span>Potential savings: ${recommendations.planRecommendation.potentialSavings.toFixed(2)}/month</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Usage Warnings */}
      {usage && currentPlan && (
        <>
          {getUsagePercentage(usage.listingsUsed, currentPlan.features.listingsPerMonth) >= 80 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <span className="font-medium text-orange-800">
                  You're running low on listings ({usage.remaining.listings} remaining)
                </span>
              </div>
              <p className="text-sm text-orange-700 mt-1">
                Consider upgrading to avoid interruption in your workflow.
              </p>
            </div>
          )}
        </>
      )}

      {/* Plan Comparison */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Available Plans</h3>
          <button
            onClick={() => setShowUpgrade(!showUpgrade)}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            {showUpgrade ? 'Hide Plans' : 'Compare Plans'}
          </button>
        </div>

        {showUpgrade && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((plan) => (
              <div 
                key={plan.id}
                className={`border rounded-lg p-4 transition-all hover:shadow-md ${
                  currentPlan?.id === plan.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-center mb-4">
                  {React.createElement(getPlanIcon(plan.id), { 
                    className: `h-8 w-8 mx-auto mb-2 ${
                      currentPlan?.id === plan.id ? 'text-blue-600' : 'text-gray-600'
                    }` 
                  })}
                  <h4 className="font-semibold text-gray-900">{plan.name}</h4>
                  <p className="text-2xl font-bold text-gray-900">
                    {plan.price === 0 ? 'Free' : `$${plan.price}`}
                    {plan.price > 0 && <span className="text-sm font-normal text-gray-600">/month</span>}
                  </p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Listings</span>
                    <span className="font-medium">
                      {plan.features.listingsPerMonth === -1 ? 'Unlimited' : plan.features.listingsPerMonth}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Videos</span>
                    <span className="font-medium">
                      {plan.features.videosPerMonth === -1 ? 'Unlimited' : plan.features.videosPerMonth}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">AI Model</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getAIModelBadge(plan.features.aiModel).color}`}>
                      {plan.features.aiModel.charAt(0).toUpperCase() + plan.features.aiModel.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 space-y-1">
                  {plan.features.advancedFeatures && (
                    <div className="flex items-center space-x-2 text-xs text-green-600">
                      <CheckCircle className="h-3 w-3" />
                      <span>Advanced Features</span>
                    </div>
                  )}
                  {plan.features.prioritySupport && (
                    <div className="flex items-center space-x-2 text-xs text-green-600">
                      <CheckCircle className="h-3 w-3" />
                      <span>Priority Support</span>
                    </div>
                  )}
                  {plan.features.apiAccess && (
                    <div className="flex items-center space-x-2 text-xs text-green-600">
                      <CheckCircle className="h-3 w-3" />
                      <span>API Access</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    if (currentPlan?.id !== plan.id) {
                      alert(`Upgrading to ${plan.name} plan...`);
                    }
                  }}
                  className={`w-full mt-4 py-2 px-4 rounded-lg font-medium transition-all transform ${
                    currentPlan?.id === plan.id
                      ? 'bg-gray-100 text-gray-600 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg hover:scale-105'
                  }`}
                  disabled={currentPlan?.id === plan.id}
                >
                  {currentPlan?.id === plan.id ? 'Current Plan' : 'Upgrade'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Billing History */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing History</h3>
        <div className="text-center py-8 text-gray-500">
          <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No billing history available</p>
          <p className="text-sm">Upgrade to a paid plan to see your billing history</p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionManager;