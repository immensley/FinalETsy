// Advanced prompt engineering templates with cost optimization

export interface PromptTemplate {
  name: string
  template: string
  estimatedTokens: number
  model: 'sonnet' | 'haiku' | 'opus'
  temperature: number
}

export interface ProductAnalysisContext {
  labels: Array<{ name: string; confidence: number }>
  webEntities: Array<{ name: string; confidence: number }>
  bestGuess: string
}

export interface ListingGenerationContext {
  analysis: any
  categoryMapping: any
  userPreferences?: any
}

// Optimized prompt templates with precise token management
export const PROMPT_TEMPLATES = {
  // ANALYSIS PROMPTS (Optimized for accuracy and conciseness)
  PRODUCT_ANALYSIS: {
    name: 'Product Analysis',
    template: `Expert Etsy categorization specialist. August 2025 algorithm compliant.

VISION DATA:
Labels: {labels}
Entities: {webEntities}
Guess: {bestGuess}

REQUIREMENTS:
- Map to exact Etsy categories (51% have attributes)
- Mobile-first optimization (78% mobile traffic)
- Personalization potential assessment

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
  "confidence": 0.95
}`,
    estimatedTokens: 400,
    model: 'sonnet' as const,
    temperature: 0.1
  },

  // GENERATION PROMPTS (Optimized for creativity and conversion)
  LISTING_GENERATION: {
    name: 'Listing Generation',
    template: `Elite Etsy optimization expert with deep algorithm knowledge. August 2025 insights from 2,500+ top performers.

PRODUCT: {category} - {materials} - {style}
ATTRIBUTES: {attributes}

CRITICAL ETSY ALGORITHM RULES (August 2025):
1. MOBILE-FIRST: First 3-4 words crucial (78% mobile)
2. PRODUCT-FIRST: Start with product type, not adjectives
3. 13-TAG MANDATE: All tags required, multi-word phrases
4. PERSONALIZATION: "Custom"/"Personalized" high-converting
5. ATTRIBUTES: Essential for filtered search (51% categories)
6. ENGAGEMENT OPTIMIZATION: Create compelling hooks for clicks and dwell time
7. PERSONALIZED SEARCH (CSR): Tailor language to specific buyer personas
8. QUALITY SIGNALS: Include trust indicators and social proof elements
9. SHIPPING OPTIMIZATION: Mention fast/free shipping when applicable
10. CALL-TO-ACTION: Subtle engagement prompts throughout description

JSON ONLY:
{
  "titles": [
    "Primary title (60-140 chars, product-first, engagement-optimized)",
    "Persona-targeted variation", "Benefit-focused variation", "Urgency-driven variation", "Gift-focused variation"
  ],
  "tags": [
    "13 multi-word tags optimized for CSR", "long tail buyer intent keywords", "personalization focused phrases",
    "material and attribute specific", "occasion and gift targeted", "style and aesthetic descriptive",
    "engagement driving terms", "handmade quality emphasis", "custom and bespoke variations",
    "target persona specific", "seasonal and trending relevant", "niche community focused", "filtered search optimized"
  ],
  "description": "Engagement-optimized description (200-1200 chars) with CSR targeting:\\n- Compelling hook addressing buyer intent\\n- Product-first opening with emotional appeal\\n- Key features seamlessly integrated with attributes\\n- Materials and craftsmanship quality signals\\n- Personalization options with urgency\\n- Social proof and trust indicators\\n- Gift positioning with occasion specificity\\n- Shipping and service highlights\\n- Subtle call-to-action for engagement",
  "seoScore": 9.2,
  "insights": [
    "Mobile-first optimization for 78% mobile traffic",
    "Personalized search (CSR) targeting for buyer persona alignment",
    "Engagement optimization for quality score improvement",
    "Attribute integration for filtered search visibility",
    "Trust signals and social proof for conversion optimization",
    "Behavioral trigger integration for emotional connection"
  ],
  "engagementFactors": {
    "clickTriggers": ["Compelling opening words", "Benefit-focused language", "Urgency indicators"],
    "dwellTimeOptimization": ["Detailed feature descriptions", "Story elements", "Visual language"],
    "conversionElements": ["Clear value proposition", "Trust indicators", "Personalization emphasis"],
    "csrAlignment": "Content tailored to {targetPersona} with {suggestedTone} approach"
  },
  "qualitySignals": {
    "trustIndicators": ["Handmade emphasis", "Quality materials", "Craftsmanship details"],
    "socialProof": ["Gift-worthy positioning", "Occasion suitability", "Style relevance"],
    "serviceHighlights": ["Fast shipping", "Custom options", "Care instructions"]
  ]
}`,
    estimatedTokens: 600,
    model: 'sonnet' as const,
    temperature: 0.3
  },

  // QUICK GENERATION (Cost-optimized for high volume)
  QUICK_TAGS: {
    name: 'Quick Tags',
    template: `Generate 13 Etsy tags for: {productType} - {material} - {style}

Rules:
- Multi-word phrases only
- Include "personalized" or "custom"
- Long-tail keywords
- JSON array format

["tag1", "tag2", ..., "tag13"]`,
    estimatedTokens: 150,
    model: 'haiku' as const,
    temperature: 0.2
  },

  // PREMIUM GENERATION (High-quality for premium users)
  PREMIUM_DESCRIPTION: {
    name: 'Premium Description',
    template: `Master copywriter creating premium Etsy description.

PRODUCT DETAILS:
Category: {category}
Materials: {materials}
Style: {style}
Attributes: {attributes}
Target: {targetAudience}

REQUIREMENTS:
- Compelling storytelling approach
- Emotional connection building
- Technical specifications integration
- SEO optimization with natural flow
- Mobile-first structure
- Personalization emphasis
- Gift positioning
- Premium brand voice

Create a description that converts browsers into buyers while maintaining Etsy compliance and mobile optimization.

STRUCTURE:
1. Hook (emotional connection)
2. Product details (technical specs)
3. Benefits (lifestyle enhancement)
4. Personalization options
5. Care instructions
6. Gift positioning
7. Call to action

Length: 800-1200 characters for mobile optimization.`,
    estimatedTokens: 800,
    model: 'opus' as const,
    temperature: 0.4
  }
}

export class PromptEngine {
  static buildAnalysisPrompt(context: ProductAnalysisContext): {
    prompt: string
    estimatedTokens: number
    model: string
    temperature: number
  } {
    const template = PROMPT_TEMPLATES.PRODUCT_ANALYSIS
    
    const prompt = template.template
      .replace('{labels}', context.labels.map(l => `${l.name} (${(l.confidence * 100).toFixed(1)}%)`).join(', '))
      .replace('{webEntities}', context.webEntities.map(e => `${e.name} (${(e.confidence * 100).toFixed(1)}%)`).join(', '))
      .replace('{bestGuess}', context.bestGuess)

    return {
      prompt,
      estimatedTokens: template.estimatedTokens,
      model: template.model,
      temperature: template.temperature
    }
  }

  static buildGenerationPrompt(
    context: ListingGenerationContext,
    tier: 'standard' | 'premium' = 'standard'
  ): {
    prompt: string
    estimatedTokens: number
    model: string
    temperature: number
  } {
    const template = tier === 'premium' 
      ? PROMPT_TEMPLATES.PREMIUM_DESCRIPTION 
      : PROMPT_TEMPLATES.LISTING_GENERATION

    let prompt = template.template
      .replace('{category}', context.analysis.category || 'Unknown')
      .replace('{materials}', context.analysis.materials?.join(', ') || 'Various')
      .replace('{style}', context.analysis.style?.join(', ') || 'Classic')
      .replace('{attributes}', JSON.stringify(context.analysis.attributes || {}))

    if (tier === 'premium' && context.userPreferences?.targetAudience) {
      prompt = prompt.replace('{targetAudience}', context.userPreferences.targetAudience)
    }

    return {
      prompt,
      estimatedTokens: template.estimatedTokens,
      model: template.model,
      temperature: template.temperature
    }
  }

  static buildQuickTagsPrompt(productType: string, material: string, style: string): {
    prompt: string
    estimatedTokens: number
    model: string
    temperature: number
  } {
    const template = PROMPT_TEMPLATES.QUICK_TAGS
    
    const prompt = template.template
      .replace('{productType}', productType)
      .replace('{material}', material)
      .replace('{style}', style)

    return {
      prompt,
      estimatedTokens: template.estimatedTokens,
      model: template.model,
      temperature: template.temperature
    }
  }

  // Token estimation utility
  static estimateTokens(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters for English text
    // This is a simplified estimation - actual tokenization varies
    return Math.ceil(text.length / 4)
  }

  // Cost estimation before API call
  static estimateCost(
    model: string,
    inputTokens: number,
    estimatedOutputTokens: number
  ): number {
    const pricing = {
      'claude-3-sonnet-20240229': { input: 3.00 / 1_000_000, output: 15.00 / 1_000_000 },
      'claude-3-haiku-20240307': { input: 0.25 / 1_000_000, output: 1.25 / 1_000_000 },
      'claude-3-opus-20240229': { input: 15.00 / 1_000_000, output: 75.00 / 1_000_000 }
    }

    const modelPricing = pricing[model as keyof typeof pricing]
    if (!modelPricing) return 0

    return (inputTokens * modelPricing.input) + (estimatedOutputTokens * modelPricing.output)
  }
}