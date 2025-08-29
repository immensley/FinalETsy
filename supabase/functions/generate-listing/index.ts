import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { costTracker } from '../shared/cost-tracker.ts'
import { PromptEngine } from '../shared/prompt-templates.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface GenerationRequest {
  productAnalysis: any
  categoryMapping: any
  userPreferences?: {
    style?: string
    priceRange?: string
    targetAudience?: string
  }
}

interface ListingContent {
  titles: string[]
  tags: string[]
  description: string
  seoScore: number
  insights: string[]
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const sessionId = crypto.randomUUID()
  const startTime = Date.now()

  try {
    const { productAnalysis, categoryMapping, userPreferences, tier }: GenerationRequest & { tier?: 'standard' | 'premium' } = await req.json()
    
    // Generate optimized content using Claude 3
    const listingContent = await generateOptimizedListing(
      productAnalysis, 
      categoryMapping, 
      userPreferences,
      sessionId,
      tier || 'standard'
    )
    
    return new Response(
      JSON.stringify({
        success: true,
        content: listingContent,
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - startTime,
        costs: {
          claude: listingContent._cost || 0,
          total: listingContent._cost || 0
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Generation error:', error)
    
    // Log failed request
    await costTracker.logUsage({
      service: 'claude',
      model: 'claude-3-sonnet-20240229',
      operation: 'generate-listing-claude',
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

async function generateOptimizedListing(
  analysis: any, 
  categoryMapping: any, 
  preferences: any = {},
  sessionId: string,
  tier: 'standard' | 'premium' = 'standard'
): Promise<ListingContent & { _cost?: number }> {
  const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')
  
  if (!ANTHROPIC_API_KEY) {
    throw new Error('Anthropic API key not configured')
  }

  // Use optimized prompt template based on tier
  const promptData = PromptEngine.buildGenerationPrompt(
    { analysis, categoryMapping, userPreferences },
    tier
  )

  // Select model based on tier
  const model = tier === 'premium' ? 'claude-3-opus-20240229' : 'claude-3-sonnet-20240229'
  const estimatedOutputTokens = tier === 'premium' ? 1500 : 1000

  // Estimate cost before making the call
  const estimatedCost = PromptEngine.estimateCost(
    model,
    promptData.estimatedTokens,
    estimatedOutputTokens
  )

  console.log(`Estimated Claude cost (${tier}): $${estimatedCost.toFixed(6)}`)

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model,
      max_tokens: tier === 'premium' ? 2500 : 2000,
      temperature: promptData.temperature,
      messages: [
        {
          role: 'user',
          content: promptData.prompt
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

  // Calculate actual cost
  const actualInputTokens = result.usage?.input_tokens || promptData.estimatedTokens
  const actualOutputTokens = result.usage?.output_tokens || estimatedOutputTokens
  const actualCost = costTracker.calculateClaudeCost(
    model,
    actualInputTokens,
    actualOutputTokens
  )

  // Log Claude usage
  await costTracker.logUsage({
    service: 'claude',
    model,
    operation: 'generate-listing-claude',
    inputTokens: actualInputTokens,
    outputTokens: actualOutputTokens,
    timestamp: new Date().toISOString(),
    sessionId,
    cost: actualCost.totalCost,
    success: true
  })

  try {
    const listingContent = JSON.parse(content)
    return { ...listingContent, _cost: actualCost.totalCost }
  } catch (parseError) {
    console.error('Failed to parse Claude response:', content)
    throw new Error('Invalid response format from Claude')
  }
}