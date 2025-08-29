// Cost tracking utilities for AI API usage monitoring

export interface APIUsage {
  service: 'claude' | 'vision-ai'
  model?: string
  operation: string
  inputTokens?: number
  outputTokens?: number
  imageCount?: number
  timestamp: string
  userId?: string
  sessionId: string
  cost: number
  success: boolean
  errorType?: string
}

export interface CostCalculation {
  service: 'claude' | 'vision-ai'
  model?: string
  inputTokens?: number
  outputTokens?: number
  imageCount?: number
  totalCost: number
  breakdown: {
    inputCost: number
    outputCost: number
    imageCost: number
  }
}

// Current pricing (as of August 2025) - Update these regularly
const PRICING = {
  claude: {
    'claude-3-sonnet-20240229': {
      input: 3.00 / 1_000_000,  // $3 per 1M tokens
      output: 15.00 / 1_000_000  // $15 per 1M tokens
    },
    'claude-3-haiku-20240307': {
      input: 0.25 / 1_000_000,  // $0.25 per 1M tokens
      output: 1.25 / 1_000_000  // $1.25 per 1M tokens
    },
    'claude-3-opus-20240229': {
      input: 15.00 / 1_000_000,  // $15 per 1M tokens
      output: 75.00 / 1_000_000  // $75 per 1M tokens
    }
  },
  visionAI: {
    labelDetection: 1.50 / 1000,     // $1.50 per 1K images
    webDetection: 3.50 / 1000,       // $3.50 per 1K images
    objectLocalization: 1.00 / 1000  // $1.00 per 1K images
  }
}

export class CostTracker {
  private supabaseUrl: string
  private supabaseKey: string

  constructor() {
    this.supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    this.supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  }

  calculateClaudeCost(
    model: string,
    inputTokens: number,
    outputTokens: number
  ): CostCalculation {
    const pricing = PRICING.claude[model as keyof typeof PRICING.claude]
    if (!pricing) {
      throw new Error(`Unknown Claude model: ${model}`)
    }

    const inputCost = inputTokens * pricing.input
    const outputCost = outputTokens * pricing.output
    const totalCost = inputCost + outputCost

    return {
      service: 'claude',
      model,
      inputTokens,
      outputTokens,
      totalCost,
      breakdown: {
        inputCost,
        outputCost,
        imageCost: 0
      }
    }
  }

  calculateVisionAICost(imageCount: number = 1): CostCalculation {
    // Assuming we use all three Vision AI features per image
    const imageCost = imageCount * (
      PRICING.visionAI.labelDetection +
      PRICING.visionAI.webDetection +
      PRICING.visionAI.objectLocalization
    )

    return {
      service: 'vision-ai',
      imageCount,
      totalCost: imageCost,
      breakdown: {
        inputCost: 0,
        outputCost: 0,
        imageCost
      }
    }
  }

  async logUsage(usage: APIUsage): Promise<void> {
    try {
      const response = await fetch(`${this.supabaseUrl}/rest/v1/api_usage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.supabaseKey}`,
          'apikey': this.supabaseKey
        },
        body: JSON.stringify({
          ...usage,
          created_at: new Date().toISOString()
        })
      })

      if (!response.ok) {
        console.error('Failed to log API usage:', await response.text())
      }
    } catch (error) {
      console.error('Error logging API usage:', error)
      // Don't throw - logging failures shouldn't break the main functionality
    }
  }

  async getDailyUsage(date: string = new Date().toISOString().split('T')[0]): Promise<{
    totalCost: number
    requestCount: number
    successRate: number
    breakdown: Record<string, number>
  }> {
    try {
      const response = await fetch(
        `${this.supabaseUrl}/rest/v1/api_usage?created_at=gte.${date}T00:00:00&created_at=lt.${date}T23:59:59`,
        {
          headers: {
            'Authorization': `Bearer ${this.supabaseKey}`,
            'apikey': this.supabaseKey
          }
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch usage data')
      }

      const usageData: APIUsage[] = await response.json()
      
      const totalCost = usageData.reduce((sum, usage) => sum + usage.cost, 0)
      const requestCount = usageData.length
      const successCount = usageData.filter(usage => usage.success).length
      const successRate = requestCount > 0 ? successCount / requestCount : 0

      const breakdown = usageData.reduce((acc, usage) => {
        const key = `${usage.service}${usage.model ? `-${usage.model}` : ''}`
        acc[key] = (acc[key] || 0) + usage.cost
        return acc
      }, {} as Record<string, number>)

      return {
        totalCost,
        requestCount,
        successRate,
        breakdown
      }
    } catch (error) {
      console.error('Error fetching usage data:', error)
      return {
        totalCost: 0,
        requestCount: 0,
        successRate: 0,
        breakdown: {}
      }
    }
  }

  // Alert if daily costs exceed threshold
  async checkCostThreshold(threshold: number = 50): Promise<boolean> {
    const usage = await this.getDailyUsage()
    if (usage.totalCost > threshold) {
      console.warn(`Daily cost threshold exceeded: $${usage.totalCost.toFixed(4)} > $${threshold}`)
      return true
    }
    return false
  }
}

export const costTracker = new CostTracker()