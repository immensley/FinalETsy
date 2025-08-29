import React, { useState } from 'react';
import { 
  Brain, 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Upload, 
  Search,
  Target,
  Lightbulb,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Eye,
  Heart,
  Star
} from 'lucide-react';

const BehavioralAnalysis = () => {
  const [activeTab, setActiveTab] = useState<'buyer-intent' | 'competitor' | 'reviews'>('buyer-intent');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [inputText, setInputText] = useState('');

  const tabs = [
    { id: 'buyer-intent', label: 'Buyer Intent Analysis', icon: Brain },
    { id: 'competitor', label: 'Competitor Insights', icon: Search },
    { id: 'reviews', label: 'Review Analysis', icon: MessageSquare }
  ];

  const handleAnalysis = async () => {
    setLoading(true);
    setResults(null);

    try {
      let endpoint = '';
      let payload = {};

      switch (activeTab) {
        case 'buyer-intent':
          // This would typically be triggered from the main listing generator
          // For demo purposes, we'll show mock results
          await new Promise(resolve => setTimeout(resolve, 2000));
          setResults({
            buyerIntent: {
              intent: 'gift for someone special',
              confidence: 0.87,
              persona: 'Gift Giver',
              suggestedTone: 'warm and thoughtful',
              keyTriggers: ['perfect gift', 'thoughtful present', 'special occasion']
            },
            styleAnalysis: {
              primaryStyle: 'boho',
              secondaryStyles: ['handmade', 'vintage'],
              aestheticKeywords: ['free spirit', 'eclectic charm', 'bohemian style'],
              targetDemographic: 'creative individuals, free spirits',
              priceRange: 'mid-range'
            }
          });
          break;

        case 'competitor':
          endpoint = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-competitor`;
          payload = {
            competitorText: inputText,
            analysisType: 'messaging'
          };
          break;

        case 'reviews':
          endpoint = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-reviews`;
          payload = {
            reviewsText: inputText,
            productCategory: 'general'
          };
          break;
      }

      if (endpoint) {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error('Analysis failed');
        }

        const data = await response.json();
        setResults(data);
      }
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderBuyerIntentResults = () => {
    if (!results?.buyerIntent) return null;

    const { buyerIntent, styleAnalysis } = results;

    return (
      <div className="space-y-6">
        {/* Buyer Intent Card */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Target className="h-5 w-5 mr-2 text-blue-600" />
            Buyer Intent Analysis
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="mb-4">
                <span className="text-sm font-medium text-gray-600">Primary Intent</span>
                <p className="text-lg font-bold text-blue-900">{buyerIntent.intent}</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${buyerIntent.confidence * 100}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500">{(buyerIntent.confidence * 100).toFixed(1)}% confidence</span>
              </div>

              <div className="mb-4">
                <span className="text-sm font-medium text-gray-600">Target Persona</span>
                <p className="text-md font-semibold text-gray-900">{buyerIntent.persona}</p>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-600">Suggested Tone</span>
                <p className="text-md text-gray-700">{buyerIntent.suggestedTone}</p>
              </div>
            </div>

            <div>
              <span className="text-sm font-medium text-gray-600 mb-2 block">Key Triggers</span>
              <div className="flex flex-wrap gap-2">
                {buyerIntent.keyTriggers.map((trigger: string, index: number) => (
                  <span 
                    key={index}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {trigger}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          {/* Actionable Takeaways */}
          <div className="mt-6 bg-white p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
              <Lightbulb className="h-4 w-4 mr-2" />
              How to Use This for Etsy Optimization:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-900 mb-1">Title Optimization:</p>
                <p className="text-gray-700">Use "{buyerIntent.suggestedTone}" language and lead with "{buyerIntent.intent}" keywords to match buyer search patterns.</p>
              </div>
              <div>
                <p className="font-medium text-gray-900 mb-1">Description Strategy:</p>
                <p className="text-gray-700">Address the "{buyerIntent.persona}" persona directly and incorporate key triggers throughout your description.</p>
              </div>
              <div>
                <p className="font-medium text-gray-900 mb-1">Tag Selection:</p>
                <p className="text-gray-700">Focus on long-tail keywords that match this buyer intent for better personalized search ranking (CSR).</p>
              </div>
              <div>
                <p className="font-medium text-gray-900 mb-1">Photo Strategy:</p>
                <p className="text-gray-700">Show your product in context that appeals to "{buyerIntent.persona}" to improve engagement signals.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Style Analysis Card */}
        <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-lg border border-orange-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Eye className="h-5 w-5 mr-2 text-orange-600" />
            Style & Aesthetic Analysis
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="mb-4">
                <span className="text-sm font-medium text-gray-600">Primary Style</span>
                <p className="text-lg font-bold text-orange-900 capitalize">{styleAnalysis.primaryStyle}</p>
              </div>

              <div className="mb-4">
                <span className="text-sm font-medium text-gray-600">Target Demographic</span>
                <p className="text-md text-gray-700">{styleAnalysis.targetDemographic}</p>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-600">Price Range</span>
                <p className="text-md font-semibold text-gray-900 capitalize">{styleAnalysis.priceRange}</p>
              </div>
            </div>

            <div>
              <div className="mb-4">
                <span className="text-sm font-medium text-gray-600 mb-2 block">Secondary Styles</span>
                <div className="flex flex-wrap gap-2">
                  {styleAnalysis.secondaryStyles.map((style: string, index: number) => (
                    <span 
                      key={index}
                      className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm"
                    >
                      {style}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-600 mb-2 block">Aesthetic Keywords</span>
                <div className="flex flex-wrap gap-2">
                  {styleAnalysis.aestheticKeywords.map((keyword: string, index: number) => (
                    <span 
                      key={index}
                      className="bg-pink-100 text-pink-800 px-2 py-1 rounded text-sm"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Style-Based Optimization Tips */}
          <div className="mt-6 bg-white p-4 rounded-lg border border-orange-200">
            <h4 className="font-semibold text-orange-900 mb-3 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Style-Based Etsy Optimization:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-900 mb-1">Attribute Strategy:</p>
                <p className="text-gray-700">Emphasize "{styleAnalysis.primaryStyle}" in your attributes and naturally integrate aesthetic keywords in descriptions.</p>
              </div>
              <div>
                <p className="font-medium text-gray-900 mb-1">Pricing Position:</p>
                <p className="text-gray-700">Position in "{styleAnalysis.priceRange}" range to match buyer expectations for this style category.</p>
              </div>
              <div>
                <p className="font-medium text-gray-900 mb-1">Target Audience:</p>
                <p className="text-gray-700">Craft messaging that resonates with "{styleAnalysis.targetDemographic}" for better CSR performance.</p>
              </div>
              <div>
                <p className="font-medium text-gray-900 mb-1">Cross-Selling:</p>
                <p className="text-gray-700">Use secondary styles for related product suggestions and shop section organization.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCompetitorResults = () => {
    if (!results?.insights) return null;

    const { insights, recommendations, actionableSteps } = results;

    return (
      <div className="space-y-6">
        {/* Insights Overview */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Search className="h-5 w-5 mr-2 text-green-600" />
            Competitor Messaging Insights
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <span className="text-sm font-medium text-gray-600 mb-2 block">Persuasive Techniques</span>
              <div className="space-y-1">
                {insights.persuasiveTechniques.map((technique: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700">{technique}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <span className="text-sm font-medium text-gray-600 mb-2 block">Emotional Appeals</span>
              <div className="space-y-1">
                {insights.emotionalAppeals.map((appeal: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-gray-700">{appeal}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <span className="text-sm font-medium text-gray-600 mb-2 block">Trust Signals</span>
              <div className="space-y-1">
                {insights.trustSignals.map((signal: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm text-gray-700">{signal}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Actionable Steps */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Lightbulb className="h-5 w-5 mr-2 text-yellow-600" />
            Actionable Improvements
          </h3>
          
          <div className="space-y-4">
            {actionableSteps?.map((step: any, index: number) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{step.category}</h4>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    Action Required
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-2">{step.action}</p>
                <p className="text-xs text-gray-600 mb-2"><strong>Why:</strong> {step.reasoning}</p>
                <div className="bg-gray-50 p-2 rounded text-xs text-gray-600">
                  <strong>Example:</strong> {step.example}
                </div>
              </div>
            ))}
          </div>
          
          {/* Etsy Algorithm Impact */}
          <div className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-900 mb-3 flex items-center">
              <Target className="h-4 w-4 mr-2" />
              Expected Etsy Algorithm Impact:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">Search Ranking</div>
                <p className="text-green-800">Improved relevancy matching and quality signals</p>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">Engagement</div>
                <p className="text-blue-800">Higher click-through and dwell time rates</p>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-orange-600">Personalization</div>
                <p className="text-orange-800">Better CSR performance for targeted buyers</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderReviewResults = () => {
    if (!results?.insights) return null;

    const { insights, optimizationSuggestions, listingImprovements } = results;

    return (
      <div className="space-y-6">
        {/* Sentiment Overview */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
            Review Sentiment Analysis
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {(insights.overallSentiment * 100).toFixed(0)}%
              </div>
              <p className="text-sm text-gray-600">Overall Positive Sentiment</p>
            </div>

            <div>
              <span className="text-sm font-medium text-gray-600 mb-2 block">Top Positive Themes</span>
              <div className="space-y-1">
                {insights.positiveThemes.map((theme: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-green-700">{theme.theme}</span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      {theme.frequency}x
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <span className="text-sm font-medium text-gray-600 mb-2 block">Areas for Improvement</span>
              <div className="space-y-1">
                {insights.negativeThemes.map((theme: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-red-700">{theme.theme}</span>
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                      {theme.frequency}x
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Listing Improvements */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
            Listing Optimization Recommendations
          </h3>
          
          <div className="space-y-6">
            {listingImprovements?.titleOptimization && (
              <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                <h4 className="font-medium text-blue-900 mb-2">Title Optimization</h4>
                <p className="text-sm text-blue-800 mb-2">{listingImprovements.titleOptimization.recommendation}</p>
                <p className="text-xs text-blue-700 mb-2"><strong>Reasoning:</strong> {listingImprovements.titleOptimization.reasoning}</p>
                <div className="flex flex-wrap gap-1">
                  {listingImprovements.titleOptimization.keywords.map((keyword: string, index: number) => (
                    <span key={index} className="bg-blue-200 text-blue-800 px-2 py-1 rounded text-xs">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {listingImprovements?.descriptionEnhancements && (
              <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                <h4 className="font-medium text-green-900 mb-2">Description Enhancements</h4>
                <p className="text-sm text-green-800 mb-2">{listingImprovements.descriptionEnhancements.recommendation}</p>
                <p className="text-xs text-green-700 mb-2"><strong>Reasoning:</strong> {listingImprovements.descriptionEnhancements.reasoning}</p>
                <div className="space-y-1">
                  <span className="text-xs font-medium text-green-800">Sections to Add:</span>
                  {listingImprovements.descriptionEnhancements.sectionsToAdd.map((section: string, index: number) => (
                    <div key={index} className="text-xs text-green-700">• {section}</div>
                  ))}
                </div>
              </div>
            )}

            {listingImprovements?.photoSuggestions && (
              <div className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                <h4 className="font-medium text-orange-900 mb-2">Photo Suggestions</h4>
                <p className="text-sm text-orange-800 mb-2">{listingImprovements.photoSuggestions.recommendation}</p>
                <p className="text-xs text-orange-700 mb-2"><strong>Reasoning:</strong> {listingImprovements.photoSuggestions.reasoning}</p>
                <div className="space-y-1">
                  <span className="text-xs font-medium text-orange-800">Focus Areas:</span>
                  {listingImprovements.photoSuggestions.focusAreas.map((area: string, index: number) => (
                    <div key={index} className="text-xs text-orange-700">• {area}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
            
          {/* Customer Feedback Implementation Guide */}
          <div className="mt-6 bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
            <h4 className="font-semibold text-purple-900 mb-3 flex items-center">
              <MessageSquare className="h-4 w-4 mr-2" />
              How to Implement Customer Feedback Insights:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-900 mb-1">Positive Themes → Listing Content:</p>
                <p className="text-gray-700">Highlight frequently praised aspects in your title and first paragraph to improve engagement signals.</p>
              </div>
              <div>
                <p className="font-medium text-gray-900 mb-1">Common Phrases → Tags:</p>
                <p className="text-gray-700">Use customer language in your tags - these are actual search terms buyers use.</p>
              </div>
              <div>
                <p className="font-medium text-gray-900 mb-1">Pain Points → Proactive Solutions:</p>
                <p className="text-gray-700">Address common concerns upfront in your description to reduce cart abandonment.</p>
              </div>
              <div>
                <p className="font-medium text-gray-900 mb-1">Strengths → Competitive Advantage:</p>
                <p className="text-gray-700">Emphasize what customers love most to differentiate from competitors in search results.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Behavioral Analysis</h1>
        <p className="text-gray-600">
          Leverage AI to understand buyer behavior, competitor strategies, and customer feedback patterns.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-8">
        {/* Input Section */}
        {activeTab !== 'buyer-intent' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {activeTab === 'competitor' ? 'Competitor Text Analysis' : 'Customer Reviews Analysis'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {activeTab === 'competitor' 
                    ? 'Paste competitor listing text (title, description, etc.)'
                    : 'Paste customer reviews (multiple reviews work best)'
                  }
                </label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder={
                    activeTab === 'competitor'
                      ? 'Example: "Handmade Sterling Silver Moon Phase Necklace - Perfect Gift for Astronomy Lovers - Celestial Jewelry - Boho Style Pendant..."'
                      : 'Example: "Beautiful necklace, exactly as described! Fast shipping and great quality. Perfect gift for my daughter\'s birthday. The packaging was lovely too..."'
                  }
                />
              </div>
              
              <button
                onClick={handleAnalysis}
                disabled={loading || !inputText.trim()}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all transform ${
                  loading || !inputText.trim()
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl hover:scale-105'
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                    <span>Analyzing with Hugging Face AI...</span>
                  </>
                ) : (
                  <>
                    <Brain className="h-5 w-5" />
                    <span>Analyze with AI</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Buyer Intent Demo */}
        {activeTab === 'buyer-intent' && !results && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Buyer Intent & Style Analysis</h2>
            <p className="text-gray-600 mb-4">
              This analysis is automatically performed when you upload a product image in the main Studio. 
              Click below to see a demo of the behavioral insights generated.
            </p>
            <button
              onClick={handleAnalysis}
              disabled={loading}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all transform ${
                loading
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl hover:scale-105'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Brain className="h-5 w-5" />
                  <span>Show Demo Analysis</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Results Section */}
        {results && (
          <div>
            {activeTab === 'buyer-intent' && renderBuyerIntentResults()}
            {activeTab === 'competitor' && renderCompetitorResults()}
            {activeTab === 'reviews' && renderReviewResults()}
          </div>
        )}
      </div>
    </div>
  );
};

export default BehavioralAnalysis;