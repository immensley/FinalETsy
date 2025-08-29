// Server-side image optimization for cost and performance

export interface ImageOptimizationOptions {
  maxWidth: number
  maxHeight: number
  quality: number
  format: 'jpeg' | 'png' | 'webp'
  stripMetadata: boolean
}

export interface OptimizedImage {
  data: string // base64 encoded
  originalSize: number
  optimizedSize: number
  compressionRatio: number
  format: string
  dimensions: { width: number; height: number }
}

class ImageOptimizer {
  private defaultOptions: ImageOptimizationOptions = {
    maxWidth: 2000,
    maxHeight: 2000,
    quality: 85,
    format: 'jpeg',
    stripMetadata: true
  }

  async optimizeImage(
    imageData: string,
    options: Partial<ImageOptimizationOptions> = {}
  ): Promise<OptimizedImage> {
    const opts = { ...this.defaultOptions, ...options }
    
    try {
      // Parse the base64 image data
      const { data, mimeType } = this.parseImageData(imageData)
      const originalSize = data.length
      
      // For now, we'll simulate optimization
      // In production, you'd use a library like Sharp or ImageMagick
      const optimizedData = await this.simulateOptimization(data, opts)
      
      const optimizedSize = optimizedData.length
      const compressionRatio = (originalSize - optimizedSize) / originalSize
      
      return {
        data: `data:image/${opts.format};base64,${optimizedData}`,
        originalSize,
        optimizedSize,
        compressionRatio,
        format: opts.format,
        dimensions: await this.getDimensions(optimizedData)
      }
    } catch (error) {
      console.error('Image optimization failed:', error)
      throw new Error('Failed to optimize image')
    }
  }

  async validateImage(imageData: string): Promise<{
    valid: boolean
    error?: string
    metadata?: {
      format: string
      size: number
      dimensions: { width: number; height: number }
    }
  }> {
    try {
      const { data, mimeType } = this.parseImageData(imageData)
      const size = data.length
      
      // Check file size (max 10MB)
      if (size > 10 * 1024 * 1024) {
        return { valid: false, error: 'Image must be less than 10MB' }
      }
      
      // Check format
      const allowedFormats = ['image/jpeg', 'image/png', 'image/webp']
      if (!allowedFormats.includes(mimeType)) {
        return { valid: false, error: 'Only JPEG, PNG, and WebP formats are supported' }
      }
      
      const dimensions = await this.getDimensions(data)
      
      // Check minimum dimensions
      if (dimensions.width < 500 || dimensions.height < 500) {
        return { valid: false, error: 'Image must be at least 500x500 pixels' }
      }
      
      return {
        valid: true,
        metadata: {
          format: mimeType,
          size,
          dimensions
        }
      }
    } catch (error) {
      return { valid: false, error: 'Invalid image format' }
    }
  }

  private parseImageData(imageData: string): { data: string; mimeType: string } {
    if (!imageData.startsWith('data:')) {
      throw new Error('Invalid image data format')
    }
    
    const [header, data] = imageData.split(',')
    const mimeType = header.match(/data:([^;]+)/)?.[1] || 'image/jpeg'
    
    return { data, mimeType }
  }

  private async simulateOptimization(
    data: string,
    options: ImageOptimizationOptions
  ): Promise<string> {
    // In a real implementation, you'd use Sharp or similar:
    // const buffer = Buffer.from(data, 'base64')
    // const optimized = await sharp(buffer)
    //   .resize(options.maxWidth, options.maxHeight, { fit: 'inside' })
    //   .jpeg({ quality: options.quality })
    //   .toBuffer()
    // return optimized.toString('base64')
    
    // For simulation, we'll just return the original data with simulated compression
    const compressionFactor = options.quality / 100
    const simulatedSize = Math.floor(data.length * compressionFactor)
    
    // Return a truncated version to simulate compression
    return data.substring(0, simulatedSize) + data.substring(data.length - (data.length - simulatedSize))
  }

  private async getDimensions(data: string): Promise<{ width: number; height: number }> {
    // In a real implementation, you'd extract actual dimensions
    // For simulation, return reasonable defaults
    return { width: 1920, height: 1080 }
  }

  // Utility method to estimate Vision AI cost based on image size
  estimateVisionCost(imageSize: number): number {
    // Larger images may cost more to process
    const baseCost = 0.006 // $0.006 per image
    const sizeFactor = Math.min(imageSize / (1024 * 1024), 2) // Max 2x cost for very large images
    return baseCost * sizeFactor
  }

  // Utility method to recommend optimization settings
  recommendOptimization(imageSize: number, dimensions: { width: number; height: number }): Partial<ImageOptimizationOptions> {
    const recommendations: Partial<ImageOptimizationOptions> = {}
    
    // If image is very large, recommend more aggressive compression
    if (imageSize > 5 * 1024 * 1024) { // > 5MB
      recommendations.quality = 75
      recommendations.maxWidth = 1500
      recommendations.maxHeight = 1500
    } else if (imageSize > 2 * 1024 * 1024) { // > 2MB
      recommendations.quality = 80
      recommendations.maxWidth = 1800
      recommendations.maxHeight = 1800
    }
    
    // If dimensions are very large, recommend resizing
    if (dimensions.width > 3000 || dimensions.height > 3000) {
      recommendations.maxWidth = 2000
      recommendations.maxHeight = 2000
    }
    
    return recommendations
  }
}

export const imageOptimizer = new ImageOptimizer()