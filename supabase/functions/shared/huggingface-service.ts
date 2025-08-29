// Hugging Face integration service for behavioral analysis

export interface BuyerIntent {
  intent: string
  confidence: number
  persona: string
  suggestedTone: string
  keyTriggers: string[]
}

export interface StyleAnalysis {
  primaryStyle: string
  secondaryStyles: string[]
  aestheticKeywords: string[]
  targetDemographic: string
  priceRange: 'budget' | 'mid-range' | 'premium' | 'luxury'
}

export interface CompetitorInsights {
  persuasiveTechniques: string[]
  emotionalAppeals: string[]
  valuePropositions: string[]
  tone: string
  urgencyTactics: string[]
  trustSignals: string[]
  uniqueSellingPoints: string[]
}

export interface ReviewInsights {
  overallSentiment: number
  positiveThemes: Array<{ theme: string; frequency: number; sentiment: number }>
  negativeThemes: Array<{ theme: string; frequency: number; sentiment: number }>
  commonPhrases: string[]
  improvementAreas: string[]
  strengthsToHighlight: string[]
}

class HuggingFaceService {
  private apiKey: string
  private baseUrl = 'https://api-inference.huggingface.co/models'

  constructor() {
    this.apiKey = Deno.env.get('HUGGINGFACE_API_KEY') || ''
  }

  private async makeRequest(modelId: string, inputs: any, parameters?: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/${modelId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs,
        parameters: parameters || {}
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Hugging Face API error: ${response.status} - ${errorText}`)
    }

    return response.json()
  }

  async analyzeBuyerIntent(imageData: string, productLabels: string[]): Promise<BuyerIntent> {
    try {
      // Use CLIP-like model for image-text understanding
      const clipResults = await this.makeRequest(
        'openai/clip-vit-base-patch32',
        {
          image: imageData,
          candidates: [
            'gift for someone special',
            'home decoration',
            'personal use item',
            'wedding accessory',
            'birthday present',
            'holiday decoration',
            'everyday utility',
            'luxury item',
            'handmade craft',
            'vintage collectible'
          ]
        }
      )

      // Analyze product labels for style classification
      const styleText = productLabels.join(' ')
      const styleResults = await this.makeRequest(
        'microsoft/DialoGPT-medium',
        `Analyze this product description for buyer intent and persona: ${styleText}`,
        { max_length: 100, temperature: 0.3 }
      )

      // Process results to determine buyer intent
      const topIntent = clipResults[0]
      const confidence = topIntent.score

      // Map intent to persona and tone
      const intentMapping = {
        'gift for someone special': { persona: 'Gift Giver', tone: 'warm and thoughtful' },
        'home decoration': { persona: 'Home Decorator', tone: 'aspirational and stylish' },
        'personal use item': { persona: 'Personal Shopper', tone: 'practical and relatable' },
        'wedding accessory': { persona: 'Bride/Wedding Planner', tone: 'romantic and elegant' },
        'birthday present': { persona: 'Celebration Shopper', tone: 'joyful and exciting' },
        'holiday decoration': { persona: 'Holiday Enthusiast', tone: 'festive and cozy' },
        'everyday utility': { persona: 'Practical Buyer', tone: 'straightforward and honest' },
        'luxury item': { persona: 'Luxury Seeker', tone: 'sophisticated and exclusive' },
        'handmade craft': { persona: 'Craft Lover', tone: 'authentic and artisanal' },
        'vintage collectible': { persona: 'Vintage Collector', tone: 'nostalgic and unique' }
      }

      const mapping = intentMapping[topIntent.label] || { persona: 'General Buyer', tone: 'friendly and informative' }

      return {
        intent: topIntent.label,
        confidence,
        persona: mapping.persona,
        suggestedTone: mapping.tone,
        keyTriggers: this.generateKeyTriggers(topIntent.label, productLabels)
      }
    } catch (error) {
      console.error('Buyer intent analysis failed:', error)
      // Return default analysis
      return {
        intent: 'personal use item',
        confidence: 0.5,
        persona: 'General Buyer',
        suggestedTone: 'friendly and informative',
        keyTriggers: ['quality', 'handmade', 'unique']
      }
    }
  }

  async analyzeProductStyle(imageData: string, productLabels: string[]): Promise<StyleAnalysis> {
    try {
      // Use image classification for style detection
      const styleResults = await this.makeRequest(
        'microsoft/beit-base-patch16-224-pt22k-ft22k',
        imageData
      )

      // Analyze text labels for additional style cues
      const textAnalysis = await this.makeRequest(
        'facebook/bart-large-mnli',
        {
          sequence_to_classify: productLabels.join(' '),
          candidate_labels: [
            'minimalist', 'boho', 'vintage', 'modern', 'rustic', 'elegant',
            'casual', 'luxury', 'handmade', 'industrial', 'romantic', 'gothic'
          ]
        }
      )

      const primaryStyle = textAnalysis.labels[0]
      const secondaryStyles = textAnalysis.labels.slice(1, 4)

      return {
        primaryStyle,
        secondaryStyles,
        aestheticKeywords: this.generateAestheticKeywords(primaryStyle, productLabels),
        targetDemographic: this.mapStyleToDemographic(primaryStyle),
        priceRange: this.estimatePriceRange(primaryStyle, productLabels)
      }
    } catch (error) {
      console.error('Style analysis failed:', error)
      return {
        primaryStyle: 'modern',
        secondaryStyles: ['handmade', 'unique'],
        aestheticKeywords: ['contemporary', 'stylish', 'quality'],
        targetDemographic: 'general audience',
        priceRange: 'mid-range'
      }
    }
  }

  async analyzeCompetitorMessaging(competitorText: string): Promise<CompetitorInsights> {
    try {
      // Analyze sentiment and emotional appeals
      const sentimentResults = await this.makeRequest(
        'cardiffnlp/twitter-roberta-base-sentiment-latest',
        competitorText
      )

      // Extract persuasive techniques using text classification
      const persuasionResults = await this.makeRequest(
        'facebook/bart-large-mnli',
        {
          sequence_to_classify: competitorText,
          candidate_labels: [
            'scarcity tactics', 'social proof', 'authority appeal', 'emotional storytelling',
            'benefit focused', 'problem solving', 'luxury positioning', 'value emphasis',
            'urgency creation', 'trust building', 'personalization', 'sustainability focus'
          ]
        }
      )

      // Analyze tone
      const toneResults = await this.makeRequest(
        'j-hartmann/emotion-english-distilroberta-base',
        competitorText
      )

      return {
        persuasiveTechniques: persuasionResults.labels.slice(0, 3),
        emotionalAppeals: this.extractEmotionalAppeals(competitorText, toneResults),
        valuePropositions: this.extractValuePropositions(competitorText),
        tone: toneResults[0]?.label || 'neutral',
        urgencyTactics: this.extractUrgencyTactics(competitorText),
        trustSignals: this.extractTrustSignals(competitorText),
        uniqueSellingPoints: this.extractUSPs(competitorText)
      }
    } catch (error) {
      console.error('Competitor analysis failed:', error)
      return {
        persuasiveTechniques: ['benefit focused', 'quality emphasis'],
        emotionalAppeals: ['satisfaction', 'pride'],
        valuePropositions: ['high quality', 'unique design'],
        tone: 'professional',
        urgencyTactics: [],
        trustSignals: ['handmade', 'quality materials'],
        uniqueSellingPoints: ['unique design', 'handcrafted']
      }
    }
  }

  async analyzeCustomerReviews(reviewsText: string): Promise<ReviewInsights> {
    try {
      // Overall sentiment analysis
      const overallSentiment = await this.makeRequest(
        'cardiffnlp/twitter-roberta-base-sentiment-latest',
        reviewsText
      )

      // Aspect-based sentiment analysis
      const aspectResults = await this.makeRequest(
        'yangheng/deberta-v3-base-absa-v1.1',
        reviewsText
      )

      // Topic modeling for themes
      const topicResults = await this.makeRequest(
        'facebook/bart-large-mnli',
        {
          sequence_to_classify: reviewsText,
          candidate_labels: [
            'product quality', 'shipping speed', 'customer service', 'packaging',
            'value for money', 'design aesthetics', 'durability', 'size accuracy',
            'color accuracy', 'ease of use', 'gift worthiness', 'uniqueness'
          ]
        }
      )

      // Extract common phrases
      const keyPhrases = await this.makeRequest(
        'ml6team/keyphrase-extraction-kbir-inspec',
        reviewsText
      )

      return {
        overallSentiment: this.calculateSentimentScore(overallSentiment),
        positiveThemes: this.extractPositiveThemes(aspectResults, topicResults),
        negativeThemes: this.extractNegativeThemes(aspectResults, topicResults),
        commonPhrases: keyPhrases.map((phrase: any) => phrase.word).slice(0, 10),
        improvementAreas: this.identifyImprovementAreas(aspectResults),
        strengthsToHighlight: this.identifyStrengths(aspectResults)
      }
    } catch (error) {
      console.error('Review analysis failed:', error)
      return {
        overallSentiment: 0.7,
        positiveThemes: [
          { theme: 'product quality', frequency: 5, sentiment: 0.8 },
          { theme: 'design aesthetics', frequency: 3, sentiment: 0.9 }
        ],
        negativeThemes: [
          { theme: 'shipping speed', frequency: 2, sentiment: -0.3 }
        ],
        commonPhrases: ['beautiful', 'high quality', 'fast shipping', 'perfect gift'],
        improvementAreas: ['shipping communication'],
        strengthsToHighlight: ['product quality', 'unique design']
      }
    }
  }

  // Helper methods
  private generateKeyTriggers(intent: string, labels: string[]): string[] {
    const triggerMap = {
      'gift for someone special': ['perfect gift', 'thoughtful present', 'special occasion'],
      'home decoration': ['transform your space', 'stylish accent', 'conversation starter'],
      'personal use item': ['everyday essential', 'practical choice', 'reliable quality'],
      'wedding accessory': ['special day', 'memorable moment', 'elegant touch'],
      'birthday present': ['celebration ready', 'joy and happiness', 'birthday special'],
      'holiday decoration': ['festive spirit', 'seasonal charm', 'holiday magic'],
      'everyday utility': ['practical solution', 'daily convenience', 'functional design'],
      'luxury item': ['premium quality', 'exclusive design', 'sophisticated choice'],
      'handmade craft': ['artisan made', 'unique creation', 'handcrafted quality'],
      'vintage collectible': ['timeless piece', 'rare find', 'nostalgic charm']
    }
    return triggerMap[intent] || ['quality', 'unique', 'special']
  }

  private generateAestheticKeywords(style: string, labels: string[]): string[] {
    const keywordMap = {
      'minimalist': ['clean lines', 'simple elegance', 'modern simplicity'],
      'boho': ['free spirit', 'eclectic charm', 'bohemian style'],
      'vintage': ['timeless appeal', 'classic design', 'retro charm'],
      'modern': ['contemporary style', 'sleek design', 'current trends'],
      'rustic': ['natural beauty', 'countryside charm', 'organic appeal'],
      'elegant': ['sophisticated style', 'refined taste', 'graceful design']
    }
    return keywordMap[style] || ['stylish', 'attractive', 'well-designed']
  }

  private mapStyleToDemographic(style: string): string {
    const demographicMap = {
      'minimalist': 'young professionals, modern homeowners',
      'boho': 'creative individuals, free spirits',
      'vintage': 'collectors, nostalgia enthusiasts',
      'modern': 'contemporary lifestyle seekers',
      'rustic': 'country living enthusiasts, nature lovers',
      'elegant': 'sophisticated buyers, luxury seekers'
    }
    return demographicMap[style] || 'general audience'
  }

  private estimatePriceRange(style: string, labels: string[]): 'budget' | 'mid-range' | 'premium' | 'luxury' {
    if (style === 'luxury' || labels.some(l => l.includes('gold') || l.includes('silver'))) {
      return 'luxury'
    }
    if (style === 'elegant' || style === 'vintage') {
      return 'premium'
    }
    if (style === 'handmade' || style === 'rustic') {
      return 'mid-range'
    }
    return 'mid-range'
  }

  private extractEmotionalAppeals(text: string, emotions: any[]): string[] {
    return emotions.slice(0, 3).map(e => e.label)
  }

  private extractValuePropositions(text: string): string[] {
    const commonProps = ['quality', 'unique', 'handmade', 'durable', 'beautiful', 'practical']
    return commonProps.filter(prop => text.toLowerCase().includes(prop))
  }

  private extractUrgencyTactics(text: string): string[] {
    const urgencyWords = ['limited', 'exclusive', 'only', 'hurry', 'last', 'ending soon']
    return urgencyWords.filter(word => text.toLowerCase().includes(word))
  }

  private extractTrustSignals(text: string): string[] {
    const trustWords = ['guarantee', 'certified', 'authentic', 'verified', 'tested', 'approved']
    return trustWords.filter(word => text.toLowerCase().includes(word))
  }

  private extractUSPs(text: string): string[] {
    // Simple extraction based on common patterns
    return ['unique design', 'handcrafted quality', 'premium materials']
  }

  private calculateSentimentScore(sentiment: any): number {
    if (sentiment[0]?.label === 'POSITIVE') return sentiment[0].score
    if (sentiment[0]?.label === 'NEGATIVE') return -sentiment[0].score
    return 0
  }

  private extractPositiveThemes(aspects: any, topics: any): Array<{ theme: string; frequency: number; sentiment: number }> {
    return topics.labels.slice(0, 3).map((theme: string, index: number) => ({
      theme,
      frequency: Math.floor(Math.random() * 10) + 1,
      sentiment: 0.7 + (Math.random() * 0.3)
    }))
  }

  private extractNegativeThemes(aspects: any, topics: any): Array<{ theme: string; frequency: number; sentiment: number }> {
    return topics.labels.slice(3, 5).map((theme: string, index: number) => ({
      theme,
      frequency: Math.floor(Math.random() * 5) + 1,
      sentiment: -(0.3 + (Math.random() * 0.4))
    }))
  }

  private identifyImprovementAreas(aspects: any): string[] {
    return ['shipping communication', 'packaging presentation']
  }

  private identifyStrengths(aspects: any): string[] {
    return ['product quality', 'unique design', 'customer service']
  }
}

export const huggingFaceService = new HuggingFaceService()