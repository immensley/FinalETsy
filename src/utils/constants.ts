// Application constants

export const APP_CONFIG = {
  name: 'EtsyStudio AI',
  version: '1.0.0',
  description: 'AI-powered Etsy listing optimization and video generation',
  url: 'https://etsystudio.ai'
}

export const AI_MODELS = {
  CLAUDE_HAIKU: 'claude-3-haiku-20240307',
  CLAUDE_SONNET: 'claude-3-sonnet-20240229',
  CLAUDE_OPUS: 'claude-3-opus-20240229'
} as const

export const SUBSCRIPTION_PLANS = {
  FREE: 'free',
  STARTER: 'starter',
  PRO: 'pro',
  ENTERPRISE: 'enterprise'
} as const

export const USAGE_LIMITS = {
  FREE: {
    listings: 5,
    videos: 2,
    imageSize: 5 // MB
  },
  STARTER: {
    listings: 50,
    videos: 10,
    imageSize: 10
  },
  PRO: {
    listings: -1, // unlimited
    videos: -1,
    imageSize: 20
  },
  ENTERPRISE: {
    listings: -1,
    videos: -1,
    imageSize: 50
  }
} as const

export const ETSY_CATEGORIES = [
  'Jewelry',
  'Clothing',
  'Home & Living',
  'Wedding & Party',
  'Toys & Entertainment',
  'Art & Collectibles',
  'Craft Supplies & Tools',
  'Vintage',
  'Electronics & Accessories',
  'Bags & Purses',
  'Bath & Beauty',
  'Books, Movies & Music',
  'Pet Supplies'
] as const

export const COMMON_MATERIALS = [
  'Sterling Silver',
  'Gold',
  'Cotton',
  'Wool',
  'Leather',
  'Wood',
  'Ceramic',
  'Glass',
  'Plastic',
  'Metal',
  'Paper',
  'Fabric'
] as const

export const STYLE_CATEGORIES = [
  'Modern',
  'Vintage',
  'Boho',
  'Minimalist',
  'Rustic',
  'Elegant',
  'Casual',
  'Gothic',
  'Industrial',
  'Romantic'
] as const

export const OCCASION_TYPES = [
  'Birthday',
  'Wedding',
  'Anniversary',
  'Christmas',
  'Valentine\'s Day',
  'Mother\'s Day',
  'Father\'s Day',
  'Graduation',
  'Housewarming',
  'Baby Shower'
] as const