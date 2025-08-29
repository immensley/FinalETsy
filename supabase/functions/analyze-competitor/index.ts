import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { huggingFaceService } from '../shared/huggingface-service.ts'
import { costTracker } from '../shared/cost-tracker.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface CompetitorAnalysisRequest {
  competitorText: string
  analysisType: 'messaging' | 'full'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const sessionId = crypto.randomUUID()
  const startTime = Date.now()

  try {
    const { competitorText, analysisType = 'messaging' }: CompetitorAnalysisRequest = await req.json()
    
    if (!competitorText || competitorText.trim().length === 0) {
      throw new Error('Competitor text is required')
    }

    // Analyze competitor messaging with Hugging Face
    const competitorInsights = await huggingFaceService.analyzeCompetitorMessaging(competitorText)
    
    // Generate actionable recommendations using Claude 3
    const recommendations = await generateRecommendations(competitorInsights, competitorText, sessionId)
    
    // Estimate costs
    const huggingFaceCost = 0.003 // Approximate cost for competitor analysis
    
    await costTracker.logUsage({
      service: 'claude',
      model: 'claude-3-sonnet-20240229',
      operation: 'analyze-competitor',
      timestamp: new Date().toISOString(),
      sessionId,
      cost: huggingFaceCost + (recommendations._cost || 0),
      success: true
    })
    
    return new Response(
      JSON.stringify({
        success: true,
        insights: competitorInsights,
        recommendations: recommendations.recommendations,
        actionableSteps: recommendations.actionableSteps,
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - startTime,
        costs: {
          huggingFace: huggingFaceCost,
          claude: recommendations._cost || 0,
          total: huggingFaceCost + (recommendations._cost || 0)
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Competitor analysis error:', error)
    
    await costTracker.logUsage({
      service: 'claude',
      operation: 'analyze-competitor',
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

async function generateRecommendations(insights: any, originalText: string, sessionId: string) {
  const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')
  
  if (!ANTHROPIC_API_KEY) {
    throw new Error('Anthropic API key not configured')
  }

  const prompt = `Expert Etsy marketing strategist analyzing competitor messaging for actionable insights.

COMPETITOR ANALYSIS RESULTS:
Persuasive Techniques: ${insights.persuasiveTechniques.join(', ')}
Emotional Appeals: ${insights.emotionalAppeals.join(', ')}
Value Propositions: ${insights.valuePropositions.join(', ')}
Tone: ${insights.tone}
Urgency Tactics: ${insights.urgencyTactics.join(', ')}
Trust Signals: ${insights.trustSignals.join(', ')}
Unique Selling Points: ${insights.uniqueSellingPoints.join(', ')}

ORIGINAL COMPETITOR TEXT:
"${originalText.substring(0, 500)}..."

TASK: Generate actionable recommendations for improving Etsy listings based on this competitor analysis.

JSON ONLY:
{
  "recommendations": [
    "Specific recommendation 1 based on competitor strengths",
    "Specific recommendation 2 for differentiation",
    "Specific recommendation 3 for messaging improvement"
  ],
  "actionableSteps": [
    {
      "category": "Title Optimization",
      "action": "Specific action to take",
      "reasoning": "Why this works based on competitor analysis",
      "example": "Example implementation"
    },
    {
      "category": "Description Enhancement",
      "action": "Specific action to take",
      "reasoning": "Why this works based on competitor analysis",
      "example": "Example implementation"
    },
    {
      "category": "Trust Building",
      "action": "Specific action to take",
      "reasoning": "Why this works based on competitor analysis",
      "example": "Example implementation"
    }
  ],
  "competitiveAdvantages": [
    "Advantage 1 to emphasize",
    "Advantage 2 to highlight",
    "Advantage 3 to leverage"
  ],
  "messagingGaps": [
    "Gap 1 competitor missed",
    "Gap 2 you can exploit",
    "Gap 3 for differentiation"
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
      max_tokens: 1500,
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

  const actualInputTokens = result.usage?.input_tokens || 600
  const actualOutputTokens = result.usage?.output_tokens || 800
  const actualCost = costTracker.calculateClaudeCost(
    'claude-3-sonnet-20240229',
    actualInputTokens,
    actualOutputTokens
  )

  await costTracker.logUsage({
    service: 'claude',
    model: 'claude-3-sonnet-20240229',
    operation: 'generate-competitor-recommendations',
    inputTokens: actualInputTokens,
    outputTokens: actualOutputTokens,
    timestamp: new Date().toISOString(),
    sessionId,
    cost: actualCost.totalCost,
    success: true
  })

  try {
    const recommendations = JSON.parse(content)
    return { ...recommendations, _cost: actualCost.totalCost }
  } catch (parseError) {
    console.error('Failed to parse Claude response:', content)
    throw new Error('Invalid response format from Claude')
  }
}