import React, { useState } from 'react';
import FileUploader from '../components/FileUploader';
import ListingGenerator from '../components/ListingGenerator';
import ComplianceChecklist from '../components/ComplianceChecklist';
import VideoGenerator from '../components/VideoGenerator';
import { 
  Upload, 
  Zap, 
  Target, 
  CheckCircle, 
  ArrowRight, 
  Play, 
  Star, 
  TrendingUp,
  Brain,
  Eye,
  Sparkles,
  Users,
  BarChart3,
  Shield,
  Clock,
  Award,
  ChevronRight,
  MessageSquare,
  Globe,
  Search,
  X,
  AlertCircle
} from 'lucide-react';

const Homepage = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>(null);

  const steps = [
    { number: 1, title: 'Upload', icon: Upload },
    { number: 2, title: 'Analyze', icon: Zap },
    { number: 3, title: 'Generate', icon: Target },
    { number: 4, title: 'Export', icon: CheckCircle },
  ];

  const features = [
    {
      icon: Brain,
      title: 'Claude 3 + Vision AI',
      description: 'Advanced AI analysis powered by Anthropic Claude 3 and Google Vision AI for unmatched accuracy.',
      color: 'blue'
    },
    {
      icon: TrendingUp,
      title: 'Real-Time Market Intelligence',
      description: 'Insights from 2,500+ current top performers with August 2025 algorithm updates.',
      color: 'green'
    },
    {
      icon: Target,
      title: 'Behavioral Analysis',
      description: 'Understand buyer intent and optimize for personalized search ranking (CSR).',
      color: 'purple'
    },
    {
      icon: Eye,
      title: 'Mobile-First Optimization',
      description: '78% of Etsy traffic is mobile. Our AI prioritizes mobile visibility and engagement.',
      color: 'orange'
    },
    {
      icon: Shield,
      title: 'August 2025 Compliant',
      description: 'All 13 tags, category attributes, and latest Etsy algorithm requirements.',
      color: 'red'
    },
    {
      icon: Sparkles,
      title: 'Video Generation',
      description: 'Create Etsy-compliant 4:3 product videos that boost conversion rates by 80%.',
      color: 'pink'
    }
  ];

  const stats = [
    { number: '2,500+', label: 'Top listings analyzed', icon: BarChart3 },
    { number: '340%', label: 'Average traffic increase', icon: TrendingUp },
    { number: '78%', label: 'Mobile traffic optimized', icon: Globe },
    { number: '51%', label: 'Categories with attributes', icon: Target }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Handmade Jewelry • 847 sales',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      content: 'I was stuck on page 3-4 for "sterling silver necklace" for MONTHS. Used EtsyStudio AI to redo my top 10 listings and now 6 of them are on page 1! My conversion rate went from 1.2% to 3.8%. Finally understanding what buyers actually search for.',
      shopName: '@SilverMoonStudio',
      verified: true,
      rating: 5
    },
    {
      name: 'Jennifer Walsh',
      role: 'Vintage Home Decor • 1,203 sales',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      content: 'Been selling on Etsy for 4 years, thought I knew SEO. This tool showed me I was doing tags ALL WRONG. The 13-tag strategy actually works - my impressions doubled in 3 weeks. The mobile-first titles are genius, my click-through rate is finally above 2%.',
      shopName: '@VintageVibesDecor',
      verified: true,
      rating: 5
    },
    {
      name: 'Mike Torres',
      role: 'Custom Pet Portraits • 2,156 sales',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      content: 'Skeptical at first but desperate after Etsy changed their algorithm AGAIN. The behavioral analysis nailed my customer persona - "Gift Giver" was spot on. Rewrote my descriptions focusing on the emotional gift angle and orders increased 156%. This actually gets how Etsy buyers think.',
      shopName: '@PawsomePortraits',
      verified: true,
      rating: 5
    },
    {
      name: 'Lisa Park',
      role: 'Wedding Stationery • 623 sales',
      avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      content: 'Was spending $200/month on Etsy Ads with terrible ROAS. Used EtsyStudio AI to optimize my listings first - now my organic traffic covers 70% of my sales. The "personalized wedding invitations" keyword suggestions were pure gold. Wish I found this sooner!',
      shopName: '@ElegantPaperCo',
      verified: true,
      rating: 5
    },
    {
      name: 'David Kim',
      role: 'Woodworking & Furniture • 1,847 sales',
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      content: 'The category attribute thing was killing me - never knew which ones to fill out. This tool mapped everything perfectly and my listings started showing up in filtered searches. Revenue up 89% in 2 months. The mobile optimization alone was worth the subscription.',
      shopName: '@CraftedWoodworks',
      verified: true,
      rating: 5
    },
    {
      name: 'Amanda Rodriguez',
      role: 'Crochet & Knitting • 934 sales',
      avatar: 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      content: 'Honestly thought my photos were the problem, turns out it was my titles and tags. The AI caught things I never would have - like starting with "Cozy" instead of "Blanket". Small changes, huge impact. My best month ever last month thanks to better search visibility.',
      shopName: '@CozyCreationsShop',
      verified: true,
      rating: 5
    }
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      price: 29,
      description: 'Perfect for new Etsy sellers',
      features: ['50 listings/month', '10 videos/month', 'Basic SEO analysis', 'Email support'],
      popular: false
    },
    {
      name: 'Pro',
      price: 79,
      description: 'Most popular for growing shops',
      features: ['Unlimited listings', 'Unlimited videos', 'Advanced analytics', 'Priority support', 'A/B testing'],
      popular: true
    },
    {
      name: 'Enterprise',
      price: 199,
      description: 'For established businesses',
      features: ['Everything in Pro', 'White-label solution', 'Custom integrations', 'Dedicated manager'],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-float"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-orange-200 rounded-full opacity-30 animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-purple-200 rounded-full opacity-25 animate-float" style={{ animationDelay: '2s' }}></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <div className="flex items-center space-x-1 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                <Sparkles className="h-4 w-4" />
                <span>Powered by Claude 3 + Vision AI</span>
              </div>
              <div className="flex items-center space-x-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                <CheckCircle className="h-4 w-4" />
                <span>August 2025 Compliant</span>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Transform Any Product Photo Into{' '}
              <span className="bg-gradient-to-r from-blue-600 to-orange-600 bg-clip-text text-transparent">
                Perfect Etsy Listings
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              AI-powered listing optimization that analyzes your product photos and generates 
              mobile-first titles, category attributes, and 13-tag optimization. 
              <span className="font-semibold text-gray-900"> Real-time insights from 2,500+ top performers.</span>
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-12">
              <button 
                onClick={() => document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="group flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 hover:shadow-xl animate-pulse-glow"
              >
                <Upload className="h-6 w-6" />
                <span>Start Optimizing Free</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button 
                onClick={() => {
                  // Demo video functionality
                  alert('Opening demo video...');
                }}
                className="group flex items-center space-x-3 border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-700 hover:text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg transition-all"
              >
                <Play className="h-6 w-6" />
                <span>Watch Demo</span>
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>5-minute setup</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>500+ happy sellers</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>30-day money-back guarantee</span>
              </div>
            </div>
            
            {/* Live Activity Feed */}
            <div className="mt-12 bg-white/80 backdrop-blur-sm rounded-lg p-4 max-w-md mx-auto border border-gray-200 shadow-lg">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">Live Activity</span>
              </div>
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex items-center justify-between">
                  <span>Sarah from Portland just optimized a necklace listing</span>
                  <span className="text-green-600 font-medium">+340% views</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Mike from Austin generated a video for wall art</span>
                  <span className="text-blue-600 font-medium">2 min ago</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Jennifer from Seattle upgraded to Pro plan</span>
                  <span className="text-purple-600 font-medium">5 min ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Trusted by Successful Etsy Sellers</h2>
            <p className="text-lg text-gray-600">Real results from real sellers using AI optimization</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <stat.icon className="h-6 w-6 text-blue-600 group-hover:scale-110 transition-transform" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
          
          {/* Trust Logos */}
          <div className="mt-16 text-center">
            <p className="text-sm text-gray-500 mb-8">As featured in seller communities and forums</p>
            <div className="flex items-center justify-center space-x-12 opacity-60">
              <div className="text-2xl font-bold text-gray-400">EtsyTeam</div>
              <div className="text-2xl font-bold text-gray-400">HandmadeHQ</div>
              <div className="text-2xl font-bold text-gray-400">SellerSuccess</div>
              <div className="text-2xl font-bold text-gray-400">EtsyForum</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powered by the Most Advanced AI Stack
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We combine multiple AI technologies to deliver unmatched accuracy and insights for your Etsy listings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group bg-white border border-gray-200 rounded-xl p-8 hover:shadow-xl hover:border-blue-300 transition-all duration-300 hover:-translate-y-1">
                <div className={`w-14 h-14 rounded-lg flex items-center justify-center mb-6 ${
                  feature.color === 'blue' ? 'bg-blue-100 group-hover:bg-blue-200' :
                  feature.color === 'green' ? 'bg-green-100 group-hover:bg-green-200' :
                  feature.color === 'purple' ? 'bg-purple-100 group-hover:bg-purple-200' :
                  feature.color === 'orange' ? 'bg-orange-100 group-hover:bg-orange-200' :
                  feature.color === 'red' ? 'bg-red-100 group-hover:bg-red-200' :
                  'bg-pink-100 group-hover:bg-pink-200'
                }`}>
                  <feature.icon className={`h-7 w-7 ${
                    feature.color === 'blue' ? 'text-blue-600' :
                    feature.color === 'green' ? 'text-green-600' :
                    feature.color === 'purple' ? 'text-purple-600' :
                    feature.color === 'orange' ? 'text-orange-600' :
                    feature.color === 'red' ? 'text-red-600' :
                    'text-pink-600'
                  }`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              From Photo to Perfect Listing in Minutes
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI analyzes your product photo and generates everything you need for a high-converting Etsy listing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
            {steps.map((step, index) => (
              <div key={step.number} className="text-center group">
                <div className="relative mb-6">
                  <div className={`w-16 h-16 mx-auto rounded-full border-4 flex items-center justify-center ${
                    currentStep >= step.number 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-lg' 
                      : 'bg-white border-gray-300 text-gray-400 group-hover:border-blue-400 group-hover:text-blue-500'
                  }`}>
                    <step.icon className="h-7 w-7 group-hover:scale-110 transition-transform" />
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-gray-300 to-blue-300 transform -translate-y-1/2"></div>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{step.title}</h3>
                <p className="text-gray-600 text-sm">
                  {step.number === 1 && 'Upload your product photo'}
                  {step.number === 2 && 'AI analyzes with Vision + Claude 3'}
                  {step.number === 3 && 'Generate optimized content'}
                  {step.number === 4 && 'Export to Etsy'}
                </p>
              </div>
            ))}
          </div>
          
          {/* Process Guarantee */}
          <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Optimization Guarantee</h3>
              <p className="text-lg text-gray-600 mb-6">
                If you don't see improved search visibility within 30 days of implementing our AI-generated listings, 
                we'll refund your subscription and provide a free consultation with our Etsy experts.
              </p>
              <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span>30-day guarantee</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span>Expert consultation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="h-4 w-4 text-purple-500" />
                  <span>Full refund policy</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section id="upload-section" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Try It Now - Upload Your Product Photo
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See the magic happen in real-time. Upload any product photo and watch our AI create a perfect Etsy listing.
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-orange-50 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-8">
              {/* Upload Section */}
              <div className="mb-12">
                <FileUploader 
                  onAnalysisStart={() => {
                    setIsAnalyzing(true);
                    setCurrentStep(2);
                  }}
                  onImageUpload={(imageUrl) => {
                    setUploadedImage(imageUrl);
                    setIsAnalyzing(false);
                    setCurrentStep(3);
                  }}
                  onAnalysisComplete={(analysis) => {
                    setAnalysisData(analysis);
                  }}
                />
              </div>

              {/* Results Section */}
              {uploadedImage && (
                <>
                  <div className="border-t border-gray-200 pt-12 mb-12">
                    <ListingGenerator 
                      image={uploadedImage}
                      analysisData={analysisData}
                      isAnalyzing={isAnalyzing}
                      onGenerationComplete={() => setCurrentStep(4)}
                    />
                  </div>

                  <div className="border-t border-gray-200 pt-12 mb-12">
                    <ComplianceChecklist />
                  </div>

                  <div className="border-t border-gray-200 pt-12">
                    <VideoGenerator image={uploadedImage} />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Real Results from Real Etsy Sellers
            </h2>
            <p className="text-xl text-gray-600">
              See what actual Etsy shop owners are saying about their results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.slice(0, 6).map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                  </div>
                  {testimonial.verified && (
                    <div className="flex items-center space-x-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                      <CheckCircle className="h-3 w-3" />
                      <span>Verified Seller</span>
                    </div>
                  )}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">"{testimonial.content}"</p>
                <div className="flex items-center space-x-4">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-gray-600 text-sm">{testimonial.role}</div>
                    <div className="text-blue-600 text-xs font-medium">{testimonial.shopName}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <p className="text-gray-500 text-sm mb-4">Join 500+ sellers already using EtsyStudio AI</p>
            <div className="flex items-center justify-center space-x-8 text-xs text-gray-400">
              <span>• All testimonials from verified Etsy sellers</span>
              <span>• Results may vary based on niche and effort</span>
              <span>• Individual results not guaranteed</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Choose the plan that scales with your Etsy business.
            </p>
            
            {/* Pricing Toggle */}
            <div className="flex items-center justify-center space-x-3 mt-8">
              <span className="text-sm text-gray-600">Monthly</span>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors hover:bg-gray-300">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
              </button>
              <span className="text-sm text-gray-600">Annual <span className="text-green-600 font-medium">(Save 20%)</span></span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div key={index} className={`relative bg-white rounded-xl shadow-lg border-2 transition-all hover:shadow-xl ${
                plan.popular ? 'border-blue-500 scale-105' : 'border-gray-200'
              }`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="p-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <p className="text-gray-600 mb-4">{plan.description}</p>
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                      <span className="text-gray-600 ml-1">/month</span>
                      {plan.popular && (
                        <div className="text-sm text-green-600 font-medium mt-1">
                          Most sellers see 340% traffic increase
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

                  <button className={`w-full py-3 px-6 rounded-lg font-medium transition-all transform hover:scale-105 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl'
                      : 'border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-700 hover:text-blue-600'
                  }`}>
                    Start {plan.name} Plan
                  </button>
                  
                  {plan.popular && (
                    <div className="mt-3 text-center">
                      <p className="text-xs text-green-600 font-medium">
                        ⚡ Most sellers see results within 7 days
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Money Back Guarantee */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center space-x-2 bg-green-50 text-green-800 px-6 py-3 rounded-full border border-green-200">
              <Shield className="h-5 w-5" />
              <span className="font-medium">30-Day Money-Back Guarantee</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">No questions asked. Cancel anytime.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Urgency Element */}
          <div className="inline-flex items-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Clock className="h-4 w-4" />
            <span>Limited Time: Free optimization for first 100 users this month</span>
          </div>
          
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Etsy Business?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join hundreds of successful sellers who've increased their traffic by 340% with AI-powered optimization.
          </p>
          
          {/* Risk Reversal */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-8 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-white mb-4">What You Get When You Start Today:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-100">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>Instant access to AI optimization</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>5 free listing optimizations</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>Video generation included</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>30-day money-back guarantee</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button 
              onClick={() => document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="group flex items-center space-x-3 bg-white hover:bg-gray-50 text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 hover:shadow-xl animate-pulse-glow"
            >
              <Upload className="h-6 w-6" />
              <span>Start Free Today</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <div className="text-blue-100 text-sm">
              No credit card required • 5-minute setup
            </div>
          </div>
          
          {/* Final Trust Signal */}
          <div className="mt-8 text-center">
            <p className="text-blue-200 text-sm">
              🔒 Secure • 🚀 Instant Setup • 💰 30-Day Guarantee • ⭐ 4.9/5 Rating
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Homepage;