import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { costTracker } from '../shared/cost-tracker.ts'
import { PromptEngine } from '../shared/prompt-templates.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface AnalysisRequest {
  imageUrl: string
  imageData?: string // base64 encoded image
}

interface VisionResponse {
  labelAnnotations: Array<{
    description: string
    score: number
    topicality: number
  }>
  webDetection: {
    webEntities: Array<{
      entityId: string
      description: string
      score: number
    }>
    bestGuessLabels: Array<{
      label: string
      languageCode: string
    }>
  }
}

interface ProductAnalysis {
  category: string
  subcategory: string
  attributes: Record<string, string>
  materials: string[]
  style: string[]
  occasion: string[]
  confidence: number
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const sessionId = crypto.randomUUID()
  const startTime = Date.now()

  try {
    const { imageUrl, imageData }: AnalysisRequest = await req.json()
    
    if (!imageUrl && !imageData) {
      throw new Error('Either imageUrl or imageData is required')
    }

    // Step 1: Analyze image with Google Cloud Vision AI
    const visionStartTime = Date.now()
    const visionResponse = await analyzeImageWithVision(imageUrl || imageData)
    const visionCost = costTracker.calculateVisionAICost(1)
    
    // Log Vision AI usage
    await costTracker.logUsage({
      service: 'vision-ai',
      operation: 'analyze-product-vision',
      imageCount: 1,
      timestamp: new Date().toISOString(),
      sessionId,
      cost: visionCost.totalCost,
      success: true
    })
    
    // Step 2: Process Vision AI results with Claude 3
    const claudeStartTime = Date.now()
    const productAnalysis = await analyzeWithClaude(visionResponse)
    
    // Step 3: Generate category mapping and attributes
    const categoryMapping = await generateCategoryMapping(productAnalysis)
    
    return new Response(
      JSON.stringify({
        success: true,
        analysis: productAnalysis,
        categoryMapping,
        visionLabels: visionResponse.labelAnnotations?.slice(0, 10) || [],
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - startTime,
        costs: {
          vision: visionCost.totalCost,
          claude: productAnalysis._cost || 0,
          total: visionCost.totalCost + (productAnalysis._cost || 0)
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Analysis error:', error)
    
    // Log failed request
    await costTracker.logUsage({
      service: 'vision-ai',
      operation: 'analyze-product-vision',
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

async function analyzeImageWithVision(imageInput: string): Promise<VisionResponse> {
  const GOOGLE_CLOUD_API_KEY = Deno.env.get('GOOGLE_CLOUD_API_KEY')
  
  if (!GOOGLE_CLOUD_API_KEY) {
    throw new Error('Google Cloud API key not configured')
  }

  const visionUrl = `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_CLOUD_API_KEY}`
  
  // Prepare image data
  let imageContent: any
  if (imageInput.startsWith('data:')) {
    // Base64 encoded image
    const base64Data = imageInput.split(',')[1]
    imageContent = { content: base64Data }
  } else {
    // Image URL
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

async function analyzeWithClaude(visionData: VisionResponse, sessionId: string): Promise<ProductAnalysis & { _cost?: number }> {
  const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')
  
  if (!ANTHROPIC_API_KEY) {
    throw new Error('Anthropic API key not configured')
  }

  // Extract relevant data from Vision AI
  const labels = visionData.labelAnnotations?.map(label => ({
    name: label.description,
    confidence: label.score
  })) || []

  const webEntities = visionData.webDetection?.webEntities?.map(entity => ({
    name: entity.description,
    confidence: entity.score
  })) || []

  const bestGuess = visionData.webDetection?.bestGuessLabels?.[0]?.label || ''

  // Use optimized prompt template
  const promptData = PromptEngine.buildAnalysisPrompt({
    labels,
    webEntities,
    bestGuess
  })

  // Estimate cost before making the call
  const estimatedCost = PromptEngine.estimateCost(
    'claude-3-sonnet-20240229',
    promptData.estimatedTokens,
    200 // estimated output tokens
  )

  console.log(`Estimated Claude cost: $${estimatedCost.toFixed(6)}`)

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-sonnet-20240229', // Using Sonnet for cost-effectiveness
      max_tokens: 1000,
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
  const actualOutputTokens = result.usage?.output_tokens || 200
  const actualCost = costTracker.calculateClaudeCost(
    'claude-3-sonnet-20240229',
    actualInputTokens,
    actualOutputTokens
  )

  // Log Claude usage
  await costTracker.logUsage({
    service: 'claude',
    model: 'claude-3-sonnet-20240229',
    operation: 'analyze-product-claude',
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

async function generateCategoryMapping(analysis: ProductAnalysis) {
  // Map to Etsy's category structure with attribute requirements
  const categoryMappings = {
    'Jewelry': {
      attributes: ['material', 'color', 'style', 'occasion'],
      hasAttributes: true,
      filterImportance: 'high'
    },
    'Clothing': {
      attributes: ['material', 'color', 'size', 'style'],
      hasAttributes: true,
      filterImportance: 'high'
    },
    'Home & Living': {
      attributes: ['material', 'color', 'style', 'room'],
      hasAttributes: true,
      filterImportance: 'medium'
    },
    'Art & Collectibles': {
      attributes: ['material', 'color', 'style', 'subject'],
      hasAttributes: false,
      filterImportance: 'low'
    }
  }

  const mapping = categoryMappings[analysis.category] || {
    attributes: ['material', 'color', 'style'],
    hasAttributes: false,
    filterImportance: 'low'
  }

  return {
    category: analysis.category,
    subcategory: analysis.subcategory,
    requiredAttributes: mapping.attributes,
    hasAttributeSupport: mapping.hasAttributes,
    filterImportance: mapping.filterImportance,
    recommendedAttributes: analysis.attributes
  }
}