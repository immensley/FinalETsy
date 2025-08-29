// Utility helper functions

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 4
  }).format(amount)
}

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num)
}

export const formatPercentage = (value: number): string => {
  return `${(value * 100).toFixed(1)}%`
}

export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(date))
}

export const formatRelativeTime = (timestamp: string): string => {
  const now = new Date()
  const time = new Date(timestamp)
  const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000)

  if (diffInSeconds < 60) return `${diffInSeconds}s ago`
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  return `${Math.floor(diffInSeconds / 86400)}d ago`
}

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export const generateSessionId = (): string => {
  return crypto.randomUUID()
}

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
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

export const calculateSEOScore = (title: string, tags: string[], description: string): number => {
  let score = 0
  
  // Title scoring (30 points max)
  if (title.length >= 60 && title.length <= 140) score += 15
  if (/^[A-Z][a-z]+\s+(Necklace|Ring|Bracelet|Earrings|Art|Print|Mug|Shirt|Dress|Bag|Decor|Wall|Hanging|Portrait|Invitation)/.test(title)) score += 15
  
  // Tags scoring (40 points max)
  if (tags.length === 13) score += 20
  const longTailTags = tags.filter(tag => tag.split(' ').length >= 2).length
  score += Math.min(20, longTailTags * 2)
  
  // Description scoring (30 points max)
  if (description.length >= 200 && description.length <= 1200) score += 15
  if (/\b(personalized|custom|handmade|unique)\b/i.test(description)) score += 15
  
  return Math.min(100, score)
}

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}