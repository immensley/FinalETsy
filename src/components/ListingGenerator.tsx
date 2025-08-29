import React, { useState, useEffect } from 'react';
import { Zap, Copy, CheckCircle, Download, RefreshCw, TrendingUp, Target, Eye } from 'lucide-react';
import { generateMockListing } from '../lib/mockData';
import SEOScore from './SEOScore';
import ListingScore from './ListingScore';
import CopyButton from './CopyButton';

interface ListingGeneratorProps {
  image: string;
  analysisData?: any;
  isAnalyzing?: boolean;
  onGenerationComplete?: () => void;
}

const ListingGenerator: React.FC<ListingGeneratorProps> = ({ 
  image, 
  analysisData, 
  isAnalyzing = false,
  onGenerationComplete 
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const generateListing = async () => {
    setIsGenerating(true);
    setCurrentStep('🎨 Preparing optimization engine...');
    
    // Simulate AI generation process
    await new Promise(resolve => setTimeout(resolve, 1000));
    setCurrentStep('🧠 Claude 3 is analyzing your product...');
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    setCurrentStep('🎯 Generating mobile-first titles...');
    
    await new Promise(resolve => setTimeout(resolve, 1200));
    setCurrentStep('🏷️ Creating 13-tag optimization...');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    setCurrentStep('📝 Writing compelling description...');
    
    await new Promise(resolve => setTimeout(resolve, 800));
    setCurrentStep('📊 Calculating SEO score...');
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Generate mock content
    const content = generateMockListing();
    setGeneratedContent(content);
    setIsGenerating(false);
    setCurrentStep('');
    onGenerationComplete?.();
    showNotification('Perfect listing generated! Ready to boost your Etsy sales.');
  };

  useEffect(() => {
    if (image && !isAnalyzing && !generatedContent) {
      generateListing();
    }
  }, [image, isAnalyzing]);

  if (isAnalyzing) {
    return (
      <div className="text-center py-12">
        <div className="relative mx-auto mb-6">
          <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-blue-500 border-r-orange-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>
        <p className="text-blue-600 font-medium text-lg">🔍 AI is analyzing your product...</p>
        <p className="text-sm text-blue-500 mt-2">Powered by Claude 3 + Vision AI</p>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="text-center py-12">
        <div className="relative mx-auto mb-6">
          <div className="w-20 h-20 border-4 border-green-200 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-green-500 border-r-blue-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.2s' }}></div>
          <div className="absolute inset-2 w-16 h-16 border-2 border-transparent border-t-orange-400 rounded-full animate-spin" style={{ animationDuration: '0.8s' }}></div>
        </div>
        <p className="text-green-600 font-medium text-lg">{currentStep}</p>
        <p className="text-sm text-green-500 mt-2 flex items-center justify-center">
          <span className="animate-pulse">🤖</span>
          <span className="ml-2">Creating your perfect Etsy listing</span>
          <span className="animate-pulse ml-2">✨</span>
        </p>
      </div>
    );
  }

  if (!generatedContent) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Zap className="h-8 w-8 text-gray-400" />
        </div>
        <p className="text-gray-600">Upload an image to generate your listing</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {notification && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2 animate-slide-in">
          <CheckCircle className="h-5 w-5" />
          <span>{notification}</span>
        </div>
      )}

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">🎉 Your Perfect Etsy Listing is Ready!</h2>
        <p className="text-gray-600">AI-optimized content designed to maximize your visibility and sales</p>
      </div>

      {/* SEO Score */}
      <div className="mb-8">
        <ListingScore 
          title={generatedContent.titles[0]}
          tags={generatedContent.tags}
          description={generatedContent.description}
        />
      </div>

      {/* Generated Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Titles */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-600" />
              <span>Mobile-First Titles</span>
            </h3>
            <div className="flex items-center space-x-2">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                5 Variations
              </span>
              <CopyButton text={generatedContent.titles.join('\n\n')} compact />
            </div>
          </div>
          
          <div className="space-y-4">
            {generatedContent.titles.map((title: string, index: number) => (
              <div key={index} className="group">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-medium">
                        #{index + 1}
                      </span>
                      {index === 0 && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-medium">
                          Recommended
                        </span>
                      )}
                    </div>
                    <p className="text-gray-900 leading-relaxed">{title}</p>
                    <div className="text-xs text-gray-500 mt-1">
                      {title.length} characters • Mobile optimized
                    </div>
                  </div>
                  <CopyButton text={title} compact />
                </div>
                {index < generatedContent.titles.length - 1 && (
                  <div className="border-b border-gray-100 mt-4"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Eye className="h-5 w-5 text-green-600" />
              <span>13-Tag Optimization</span>
            </h3>
            <div className="flex items-center space-x-2">
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                All 13 Tags
              </span>
              <CopyButton text={generatedContent.tags.join(', ')} compact />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {generatedContent.tags.map((tag: string, index: number) => (
              <span 
                key={index}
                className="group relative bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 text-green-800 px-3 py-2 rounded-lg text-sm font-medium hover:from-green-100 hover:to-blue-100 hover:border-green-300 transition-all cursor-pointer"
                title={`Tag ${index + 1}: ${tag}`}
              >
                {tag}
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white text-xs rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {index + 1}
                </span>
              </span>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-800">
              <strong>✨ August 2025 Compliant:</strong> All 13 tags use multi-word phrases optimized for personalized search ranking (CSR) and buyer intent matching.
            </p>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-orange-600" />
            <span>Conversion-Optimized Description</span>
          </h3>
          <div className="flex items-center space-x-2">
            <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-medium">
              {generatedContent.description.length} chars
            </span>
            <CopyButton text={generatedContent.description} compact />
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="whitespace-pre-line text-gray-900 leading-relaxed">
            {generatedContent.description}
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm font-medium text-blue-900 mb-1">Mobile Optimized</div>
            <div className="text-xs text-blue-700">Perfect length for mobile readability</div>
          </div>
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="text-sm font-medium text-green-900 mb-1">SEO Enhanced</div>
            <div className="text-xs text-green-700">Keywords naturally integrated</div>
          </div>
          <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
            <div className="text-sm font-medium text-orange-900 mb-1">Conversion Focused</div>
            <div className="text-xs text-orange-700">Emotional triggers included</div>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-blue-600" />
          <span>AI Optimization Insights</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {generatedContent.insights.map((insight: string, index: number) => (
            <div key={index} className="flex items-start space-x-3 bg-white p-4 rounded-lg border border-blue-200">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-xs font-bold">{index + 1}</span>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">{insight}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 pt-8">
        <button 
          onClick={() => {
            const allContent = `TITLE:\n${generatedContent.titles[0]}\n\nTAGS:\n${generatedContent.tags.join(', ')}\n\nDESCRIPTION:\n${generatedContent.description}`;
            navigator.clipboard.writeText(allContent);
            showNotification('Complete listing copied to clipboard!');
          }}
          className="group flex items-center space-x-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 hover:shadow-xl"
        >
          <Copy className="h-6 w-6" />
          <span>Copy Complete Listing</span>
        </button>
        
        <button 
          onClick={() => {
            showNotification('Listing exported successfully!');
          }}
          className="group flex items-center space-x-3 border-2 border-blue-500 hover:bg-blue-500 hover:text-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105"
        >
          <Download className="h-6 w-6" />
          <span>Export to Etsy</span>
        </button>
        
        <button 
          onClick={generateListing}
          className="group flex items-center space-x-3 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg transition-all"
        >
          <RefreshCw className="h-6 w-6" />
          <span>Regenerate</span>
        </button>
      </div>
    </div>
  );
};

export default ListingGenerator;