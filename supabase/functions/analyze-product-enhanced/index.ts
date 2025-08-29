import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { costTracker } from '../shared/cost-tracker.ts'
import { huggingFaceService } from '../shared/huggingface-service.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface EnhancedAnalysisRequest {
  imageUrl?: string
  imageData?: string
  productLabels?: string[]
  enableBehavioralAnalysis?: boolean
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const sessionId = crypto.randomUUID()
  const startTime = Date.now()

  try {
    const { 
      imageUrl, 
      imageData, 
      productLabels = [],
      enableBehavioralAnalysis = true 
    }: EnhancedAnalysisRequest = await req.json()
    
    if (!imageUrl && !imageData) {
      throw new Error('Either imageUrl or imageData is required')
    }

    // Step 1: Basic Vision AI Analysis (existing functionality)
    const visionResponse = await analyzeImageWithVision(imageUrl || imageData)
    const visionCost = costTracker.calculateVisionAICost(1)
    
    // Step 2: Enhanced Hugging Face Analysis
    let behavioralAnalysis = null
    let huggingFaceCost = 0

    if (enableBehavioralAnalysis) {
      const labels = visionResponse.labelAnnotations?.map(label => label.description) || productLabels
      
      // Buyer Intent Analysis
      const buyerIntent = await huggingFaceService.analyzeBuyerIntent(
        imageData || imageUrl, 
        labels
      )
      
      // Style Analysis
      const styleAnalysis = await huggingFaceService.analyzeProductStyle(
        imageData || imageUrl,
        labels
      )

      behavioralAnalysis = {
        buyerIntent,
        styleAnalysis,
        enhancedAttributes: {
          primaryStyle: styleAnalysis.primaryStyle,
          targetPersona: buyerIntent.persona,
          suggestedTone: buyerIntent.suggestedTone,
          keyTriggers: buyerIntent.keyTriggers,
          aestheticKeywords: styleAnalysis.aestheticKeywords,
          priceRange: styleAnalysis.priceRange
        }
      }

      // Estimate Hugging Face costs (simplified)
      huggingFaceCost = 0.002 // Approximate cost per request
    }

    // Step 3: Process with Claude 3 (enhanced with behavioral data)
    const productAnalysis = await analyzeWithClaude(visionResponse, behavioralAnalysis, sessionId)
    
    // Log usage
    await costTracker.logUsage({
      service: 'vision-ai',
      operation: 'analyze-product-enhanced',
      imageCount: 1,
      timestamp: new Date().toISOString(),
      sessionId,
      cost: visionCost.totalCost + huggingFaceCost,
      success: true
    })
    
    return new Response(
      JSON.stringify({
        success: true,
        analysis: productAnalysis,
        behavioralAnalysis,
        visionLabels: visionResponse.labelAnnotations?.slice(0, 10) || [],
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - startTime,
        costs: {
          vision: visionCost.totalCost,
          huggingFace: huggingFaceCost,
          claude: productAnalysis._cost || 0,
          total: visionCost.totalCost + huggingFaceCost + (productAnalysis._cost || 0)
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Enhanced analysis error:', error)
    
    await costTracker.logUsage({
      service: 'vision-ai',
      operation: 'analyze-product-enhanced',
      imageCount: 1,
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

async function analyzeImageWithVision(imageInput: string) {
  const GOOGLE_CLOUD_API_KEY = Deno.env.get('GOOGLE_CLOUD_API_KEY')
  
  if (!GOOGLE_CLOUD_API_KEY) {
    throw new Error('Google Cloud API key not configured')
  }

  const visionUrl = `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_CLOUD_API_KEY}`
  
  let imageContent: any
  if (imageInput.startsWith('data:')) {
    const base64Data = imageInput.split(',')[1]
    imageContent = { content: base64Data }
  } else {
    imageContent = { source: { imageUri: imageInput } }
  }

  const requestBody = {
    requests: [
      {
        image: imageContent,
        features: [
          { type: 'LABEL_DETECTION', maxResults: 20 },
          { type: 'WEB_DETECTION', maxResults: 10 },
          { type: 'OBJECT_LOCALIZATION', maxResults: 10 }
        ]
      }
    ]
  }

  const response = await fetch(visionUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody)
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Vision API error: ${response.status} - ${errorText}`)
  }

  const result = await response.json()
  return result.responses[0]
}

async function analyzeWithClaude(visionData: any, behavioralData: any, sessionId: string) {
  const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')
  
  if (!ANTHROPIC_API_KEY) {
    throw new Error('Anthropic API key not configured')
  }

  const labels = visionData.labelAnnotations?.map(label => ({
    name: label.description,
    confidence: label.score
  })) || []

  const webEntities = visionData.webDetection?.webEntities?.map(entity => ({
    name: entity.description,
    confidence: entity.score
  })) || []

  const bestGuess = visionData.webDetection?.bestGuessLabels?.[0]?.label || ''

  // Enhanced prompt with behavioral insights
  let prompt = `Expert Etsy categorization specialist with behavioral analysis. August 2025 algorithm compliant.

VISION DATA:
Labels: ${labels.map(l => `${l.name} (${(l.confidence * 100).toFixed(1)}%)`).join(', ')}
Entities: ${webEntities.map(e => `${e.name} (${(e.confidence * 100).toFixed(1)}%)`).join(', ')}
Guess: ${bestGuess}`

  if (behavioralData) {
    prompt += `

BEHAVIORAL INSIGHTS:
Buyer Intent: ${behavioralData.buyerIntent.intent} (${behavioralData.buyerIntent.persona})
Primary Style: ${behavioralData.styleAnalysis.primaryStyle}
Target Demographic: ${behavioralData.styleAnalysis.targetDemographic}
Suggested Tone: ${behavioralData.buyerIntent.suggestedTone}
Key Triggers: ${behavioralData.buyerIntent.keyTriggers.join(', ')}
Aesthetic Keywords: ${behavioralData.styleAnalysis.aestheticKeywords.join(', ')}
Price Range: ${behavioralData.styleAnalysis.priceRange}`
  }

  prompt += `

REQUIREMENTS:
- Map to exact Etsy categories (51% have attributes)
- Mobile-first optimization (78% mobile traffic)
- Incorporate behavioral insights for buyer persona targeting
- Consider holistic buyer journey and emotional triggers

JSON ONLY:
{
  "category": "Primary Etsy category",
  "subcategory": "Specific subcategory",
  "attributes": {
    "material": "primary material",
    "color": "dominant color",
    "style": "style classification",
    "occasion": "primary use case"
  },
  "materials": ["material1", "material2"],
  "style": ["style1", "style2"],
  "occasion": ["occasion1", "occasion2"],
  "behavioralInsights": {
    "targetPersona": "${behavioralData?.buyerIntent.persona || 'General Buyer'}",
    "suggestedTone": "${behavioralData?.buyerIntent.suggestedTone || 'friendly and informative'}",
    "keyTriggers": ${JSON.stringify(behavioralData?.buyerIntent.keyTriggers || ['quality', 'unique'])},
    "pricePositioning": "${behavioralData?.styleAnalysis.priceRange || 'mid-range'}"
  },
  "confidence": 0.95
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
      max_tokens: 1000,
      temperature: 0.1,
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
  const actualOutputTokens = result.usage?.output_tokens || 300
  const actualCost = costTracker.calculateClaudeCost(
    'claude-3-sonnet-20240229',
    actualInputTokens,
    actualOutputTokens
  )

  await costTracker.logUsage({
    service: 'claude',
    model: 'claude-3-sonnet-20240229',
    operation: 'analyze-product-enhanced',
    inputTokens: actualInputTokens,
    outputTokens: actualOutputTokens,
    timestamp: new Date().toISOString(),
    sessionId,
    cost: actualCost.totalCost,
    success: true
  })

  try {
    const analysis = JSON.parse(content)
    return { ...analysis, _cost: actualCost.totalCost }
  } catch (parseError) {
    console.error('Failed to parse Claude response:', content)
    throw new Error('Invalid response format from Claude')
  }
}