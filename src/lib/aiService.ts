// AI Service for handling backend API calls

export interface ProductAnalysis {
  category: string
  subcategory: string
  attributes: Record<string, string>
  materials: string[]
  style: string[]
  occasion: string[]
  confidence: number
}

export interface CategoryMapping {
  category: string
  subcategory: string
  requiredAttributes: string[]
  hasAttributeSupport: boolean
  filterImportance: string
  recommendedAttributes: Record<string, string>
}

export interface ListingContent {
  titles: string[]
  tags: string[]
  description: string
  seoScore: number
  insights: string[]
}

export interface AnalysisResult {
  success: boolean
  analysis: ProductAnalysis
  categoryMapping: CategoryMapping
  visionLabels: Array<{ description: string; score: number }>
  timestamp: string
  error?: string
}

export interface GenerationResult {
  success: boolean
  content: ListingContent
  timestamp: string
  error?: string
}

class AIService {
  private baseUrl: string

  constructor() {
    this.baseUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`
  }

  private async makeRequest(endpoint: string, data: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }))
      throw new Error(errorData.error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  async analyzeProduct(imageUrl: string, imageData?: string): Promise<AnalysisResult> {
    try {
      return await this.makeRequest('analyze-product-enhanced', {
        imageUrl,
        imageData,
        enableBehavioralAnalysis: true
      })
    } catch (error) {
      console.error('Product analysis failed:', error)
      throw new Error(`Analysis failed: ${error.message}`)
    }
  }

  async generateListing(
    productAnalysis: ProductAnalysis,
    categoryMapping: CategoryMapping,
    userPreferences?: any,
    tier: 'standard' | 'premium' = 'standard'
  ): Promise<GenerationResult> {
    try {
      return await this.makeRequest('generate-listing', {
        productAnalysis,
        categoryMapping,
        userPreferences,
        tier
      })
    } catch (error) {
      console.error('Listing generation failed:', error)
      throw new Error(`Generation failed: ${error.message}`)
    }
  }

  // Utility method to convert file to base64
  async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  // Validate image before processing
  validateImage(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Please upload a JPG, PNG, or WebP image' }
    }

    if (file.size > maxSize) {
      return { valid: false, error: 'Image must be less than 10MB' }
    }

    return { valid: true }
  }
}

export const aiService = new AIService()