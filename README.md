# EtsyStudio AI - Claude 3 + Vision AI Integration

A powerful SaaS tool for Etsy sellers that combines Claude 3's advanced language capabilities with Google Cloud Vision AI to generate optimized product listings.

## Features

- **Claude 3 Integration**: Advanced text generation for titles, descriptions, and tags
- **Google Vision AI**: Intelligent product detection and categorization
- **Hugging Face Behavioral Analysis**: Buyer intent mapping and competitor insights
- **Real-time Analysis**: Instant product analysis and category mapping
- **August 2025 Insights**: Latest Etsy algorithm optimizations
- **Mobile-First Optimization**: 78% mobile traffic considerations
- **Attribute Integration**: 51% category attribute coverage
- **Holistic Approach**: Behavioral psychology and customer feedback analysis

## AI Services Used

### Claude 3 (Anthropic)
- **Model**: Claude 3 Sonnet for cost-effective generation
- **Purpose**: Generate optimized titles, descriptions, tags, and insights
- **Features**: Mobile-first optimization, personalization focus, long-tail keywords

### Google Cloud Vision AI
- **Services**: Label Detection, Web Detection, Object Localization
- **Purpose**: Product detection, category mapping, attribute extraction
- **Benefits**: Accurate product identification and categorization

### Hugging Face Models
- **Models**: CLIP, BERT, RoBERTa, BART for specialized tasks
- **Purpose**: Buyer intent analysis, competitor messaging insights, review sentiment analysis
- **Benefits**: Deep behavioral understanding and holistic optimization
## Setup Instructions

### 1. Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI Service API Keys
ANTHROPIC_API_KEY=your_anthropic_api_key
GOOGLE_CLOUD_API_KEY=your_google_cloud_api_key
HUGGINGFACE_API_KEY=your_huggingface_api_key
```

### 2. API Key Setup

#### Anthropic Claude 3
1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Create an account and get your API key
3. Add to environment variables

#### Hugging Face
1. Go to [Hugging Face](https://huggingface.co/)
2. Create an account and get your API token
3. Add to environment variables

#### Google Cloud Vision AI
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Vision AI API
3. Create API credentials
4. Add to environment variables

### 3. Supabase Edge Functions

The backend uses Supabase Edge Functions for AI processing:

- `analyze-product-enhanced`: Handles image analysis with Vision AI + Claude 3 + Hugging Face
- `generate-listing`: Generates optimized content with Claude 3
- `analyze-competitor`: Analyzes competitor messaging with Hugging Face
- `analyze-reviews`: Processes customer feedback with Hugging Face

### 4. Cost Management

#### Prompt Engineering Best Practices
- Concise, specific prompts to minimize token usage
- Structured JSON responses for consistency
- Temperature optimization for different tasks
- Context window management

#### Model Selection Strategy
- **Claude 3 Sonnet**: Primary model for cost-effectiveness
- **Claude 3 Haiku**: For simple, high-volume tasks
- **Claude 3 Opus**: For complex analysis (premium features)
- **Hugging Face Models**: Specialized behavioral analysis tasks

## Architecture

```
Frontend (React/TypeScript)
    ↓
Supabase Edge Functions
    ↓
AI Services (Claude 3 + Vision AI + Hugging Face)
    ↓
Optimized Etsy Listings
```

## Data Flow

1. **Image Upload** → User uploads product photo
2. **Vision AI Analysis** → Google Vision detects objects, labels, categories
3. **Hugging Face Behavioral Analysis** → Buyer intent and style analysis
4. **Claude 3 Processing** → Analyzes all data for holistic optimization
5. **Category Mapping** → Maps to Etsy categories with attributes
6. **Content Generation** → Claude 3 generates behaviorally-optimized content
7. **Real-time Validation** → Compliance checking and scoring
8. **Export Ready** → Formatted content ready for Etsy

## Performance Optimizations

- **Caching**: Results cached to avoid redundant API calls
- **Batching**: Multiple requests processed efficiently
- **Error Handling**: Robust error recovery and user feedback
- **Loading States**: Professional UX during AI processing

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Deploy Supabase functions
# (Functions are auto-deployed in this environment)
```

## Cost Considerations

### Claude 3 Pricing (Approximate)
- **Sonnet**: ~$3 per million input tokens, ~$15 per million output tokens
- **Haiku**: ~$0.25 per million input tokens, ~$1.25 per million output tokens

### Google Vision AI Pricing
- **Label Detection**: ~$1.50 per 1,000 images
- **Web Detection**: ~$3.50 per 1,000 images

### Hugging Face Pricing
- **Inference API**: ~$0.002-0.005 per request (varies by model)
- **Dedicated Endpoints**: Custom pricing for high-volume usage
### Optimization Strategies
1. Use appropriate model tiers for different tasks
2. Implement caching for repeated requests
3. Optimize prompt length and structure
4. Monitor usage with detailed logging

## Support

For issues with AI integrations:
- Check API key configuration
- Verify service quotas and limits
- Review error logs in Supabase dashboard
- Monitor token usage and costs