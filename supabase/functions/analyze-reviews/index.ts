import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { huggingFaceService } from '../shared/huggingface-service.ts'
import { costTracker } from '../shared/cost-tracker.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface ReviewAnalysisRequest {
  reviewsText: string
  productCategory?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const sessionId = crypto.randomUUID()
  const startTime = Date.now()

  try {
    const { reviewsText, productCategory }: ReviewAnalysisRequest = await req.json()
    
    if (!reviewsText || reviewsText.trim().length === 0) {
      throw new Error('Reviews text is required')
    }

    // Analyze reviews with Hugging Face
    const reviewInsights = await huggingFaceService.analyzeCustomerReviews(reviewsText)
    
    // Generate listing optimization recommendations based on review insights
    const optimizationSuggestions = await generateOptimizationSuggestions(
      reviewInsights, 
      reviewsText, 
      productCategory,
      sessionId
    )
    
    // Estimate costs
    const huggingFaceCost = 0.004 // Approximate cost for review analysis
    
    await costTracker.logUsage({
      service: 'claude',
      model: 'claude-3-sonnet-20240229',
      operation: 'analyze-reviews',
      timestamp: new Date().toISOString(),
      sessionId,
      cost: huggingFaceCost + (optimizationSuggestions._cost || 0),
      success: true
    })
    
    return new Response(
      JSON.stringify({
        success: true,
        insights: reviewInsights,
        optimizationSuggestions: optimizationSuggestions.suggestions,
        listingImprovements: optimizationSuggestions.listingImprovements,
        customerPainPoints: optimizationSuggestions.customerPainPoints,
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - startTime,
        costs: {
          huggingFace: huggingFaceCost,
          claude: optimizationSuggestions._cost || 0,
          total: huggingFaceCost + (optimizationSuggestions._cost || 0)
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Review analysis error:', error)
    
    await costTracker.logUsage({
      service: 'claude',
      operation: 'analyze-reviews',
      timestamp: new Date().toISOString(),
      sessionId,
      cost: 0,
      success: false,
      errorType: error.name || 'UnknownError'
    })
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

async function generateOptimizationSuggestions(
  insights: any, 
  originalReviews: string, 
  category: string = 'general',
  sessionId: string
) {
  const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')
  
  if (!ANTHROPIC_API_KEY) {
    throw new Error('Anthropic API key not configured')
  }

  const prompt = `Expert Etsy listing optimizer analyzing customer feedback for actionable improvements.

REVIEW ANALYSIS RESULTS:
Overall Sentiment: ${insights.overallSentiment.toFixed(2)}
Positive Themes: ${insights.positiveThemes.map(t => `${t.theme} (${t.frequency}x, ${t.sentiment.toFixed(2)})`).join(', ')}
Negative Themes: ${insights.negativeThemes.map(t => `${t.theme} (${t.frequency}x, ${t.sentiment.toFixed(2)})`).join(', ')}
Common Phrases: ${insights.commonPhrases.join(', ')}
Strengths to Highlight: ${insights.strengthsToHighlight.join(', ')}
Improvement Areas: ${insights.improvementAreas.join(', ')}

PRODUCT CATEGORY: ${category}

SAMPLE REVIEWS:
"${originalReviews.substring(0, 800)}..."

TASK: Generate specific, actionable suggestions for optimizing Etsy listings based on customer feedback patterns.

JSON ONLY:
{
  "suggestions": [
    "Specific suggestion 1 based on positive feedback",
    "Specific suggestion 2 addressing negative feedback",
    "Specific suggestion 3 for competitive advantage"
  ],
  "listingImprovements": {
    "titleOptimization": {
      "recommendation": "Specific title improvement",
      "reasoning": "Based on customer feedback patterns",
      "keywords": ["keyword1", "keyword2", "keyword3"]
    },
    "descriptionEnhancements": {
      "recommendation": "Specific description improvement",
      "reasoning": "Based on customer feedback patterns",
      "sectionsToAdd": ["section1", "section2"]
    },
    "photoSuggestions": {
      "recommendation": "Specific photo improvement",
      "reasoning": "Based on customer feedback patterns",
      "focusAreas": ["area1", "area2"]
    }
  },
  "customerPainPoints": [
    {
      "issue": "Specific customer concern",
      "frequency": "how often mentioned",
      "solution": "How to address in listing",
      "prevention": "How to prevent the issue"
    }
  ],
  "strengthsToEmphasize": [
    {
      "strength": "What customers love",
      "frequency": "how often mentioned",
      "howToHighlight": "Where to emphasize in listing"
    }
  ],
  "competitiveAdvantages": [
    "Advantage 1 customers mention",
    "Advantage 2 to leverage",
    "Advantage 3 for differentiation"
  ]
}`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 2000,
      temperature: 0.3,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Claude API error: ${response.status} - ${errorText}`)
  }

  const result = await response.json()
  const content = result.content[0].text

  const actualInputTokens = result.usage?.input_tokens || 800
  const actualOutputTokens = result.usage?.output_tokens || 1000
  const actualCost = costTracker.calculateClaudeCost(
    'claude-3-sonnet-20240229',
    actualInputTokens,
    actualOutputTokens
  )

  await costTracker.logUsage({
    service: 'claude',
    model: 'claude-3-sonnet-20240229',
    operation: 'generate-review-optimization',
    inputTokens: actualInputTokens,
    outputTokens: actualOutputTokens,
    timestamp: new Date().toISOString(),
    sessionId,
    cost: actualCost.totalCost,
    success: true
  })

  try {
    const suggestions = JSON.parse(content)
    return { ...suggestions, _cost: actualCost.totalCost }
  } catch (parseError) {
    console.error('Failed to parse Claude response:', content)
    throw new Error('Invalid response format from Claude')
  }
}