import React, { useState } from 'react';
import { CheckCircle, Zap, TrendingUp, Star, Search, Filter } from 'lucide-react';
import { mockJobHistory, JobHistoryItem } from '../lib/mockData';
import SubscriptionManager from '../components/SubscriptionManager';

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const [jobHistory] = useState<JobHistoryItem[]>(mockJobHistory);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const plans = [
    {
      name: 'Starter',
      price: { monthly: 29, annual: 23 },
      description: 'Perfect for new Etsy sellers',
      features: [
        '50 listing optimizations/month',
        '10 video generations/month',
        'Basic SEO analysis',
        'Email support',
        'Basic templates'
      ],
      icon: Zap,
      color: 'gray'
    },
    {
      name: 'Pro',
      price: { monthly: 79, annual: 63 },
      description: 'Most popular for growing shops',
      features: [
        'Unlimited listing optimizations',
        'Unlimited video generations',
        'Advanced SEO analysis',
        'Priority support',
        'Premium templates',
        'A/B testing tools',
        'Analytics dashboard',
        'Bulk export'
      ],
      icon: TrendingUp,
      color: 'orange',
      popular: true
    },
    {
      name: 'Enterprise',
      price: { monthly: 199, annual: 159 },
      description: 'For established Etsy businesses',
      features: [
        'Everything in Pro',
        'White-label solution',
        'Custom integrations',
        'Dedicated account manager',
        'Advanced analytics',
        'Custom AI training',
        'API access',
        'Team collaboration'
      ],
      icon: Star,
      color: 'blue'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Choose the plan that scales with your Etsy business. <span className="font-semibold text-gray-900">Powered by analysis of 2,500+ current top listings.</span>
        </p>

        {/* Annual Toggle */}
        <div className="flex items-center justify-center space-x-3 mb-12">
          <span className={`text-sm ${!isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>Monthly</span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isAnnual ? 'bg-orange-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isAnnual ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-sm ${isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
            Annual <span className="text-green-600 font-medium">(Save 20%)</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, index) => (
          <div
            key={index}
            className={`relative bg-white rounded-xl shadow-lg border-2 transition-all hover:shadow-xl ${
              plan.popular ? 'border-orange-500 scale-105' : 'border-gray-200'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-orange-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
            )}

            <div className="p-8">
              <div className="text-center mb-8">
                <div className={`w-16 h-16 mx-auto rounded-lg flex items-center justify-center mb-4 ${
                  plan.color === 'orange' ? 'bg-orange-100' :
                  plan.color === 'blue' ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <plan.icon className={`h-8 w-8 ${
                    plan.color === 'orange' ? 'text-orange-600' :
                    plan.color === 'blue' ? 'text-blue-600' : 'text-gray-600'
                  }`} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">
                    ${isAnnual ? plan.price.annual : plan.price.monthly}
                  </span>
                  <span className="text-gray-600 ml-1">/month</span>
                  {isAnnual && (
                    <div className="text-sm text-green-600 font-medium mt-1">
                      Save ${(plan.price.monthly - plan.price.annual) * 12}/year
                    </div>
                  )}
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <button className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                plan.popular
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                  : 'border-2 border-gray-300 hover:border-orange-400 hover:bg-orange-50 text-gray-700 hover:text-orange-600 transition-all'
              }`}
              onClick={() => {
                alert(`Starting ${plan.name} plan...`);
              }}
            >
                Start {plan.name} Plan
              </button>
              
              {plan.popular && (
                <div className="mt-3 text-center">
                  <p className="text-xs text-green-600 font-medium">
                    Most sellers see 340% traffic increase
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Trust Section */}
      <div className="mt-16 text-center">
        <div className="bg-gray-50 rounded-lg p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Trusted by Successful Etsy Sellers</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600">
            <div>
              <div className="text-2xl font-bold text-orange-600 mb-1">500+</div>
              <p>Active sellers using our platform</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600 mb-1">1,000+</div>
              <p>Listings analyzed for market intelligence</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600 mb-1">340%</div>
              <p>Average traffic increase reported</p>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Management */}
      <div className="mt-16">
        <SubscriptionManager />
      </div>
    </div>
  );
};

export default Pricing;