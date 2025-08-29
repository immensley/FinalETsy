// Global TypeScript types for the application

export interface User {
  id: string
  email: string
  created_at: string
  subscription_plan?: string
}

export interface ProductAnalysis {
  category: string
  subcategory: string
  attributes: Record<string, string>
  materials: string[]
  style: string[]
  occasion: string[]
  confidence: number
  behavioralInsights?: {
    targetPersona: string
    suggestedTone: string
    keyTriggers: string[]
    pricePositioning: string
  }
}

export interface ListingContent {
  titles: string[]
  tags: string[]
  description: string
  seoScore: number
  insights: string[]
}

export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  timestamp: string
}

export interface SubscriptionPlan {
  id: string
  name: string
  price: number
  features: {
    listingsPerMonth: number
    videosPerMonth: number
    aiModel: string
    advancedFeatures: boolean
  }
}

export interface UsageStats {
  listingsUsed: number
  videosUsed: number
  remaining: {
    listings: number
    videos: number
  }
  resetDate: string
}