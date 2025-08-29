// Comprehensive monitoring and alerting system

export interface SystemMetric {
  name: string
  value: number
  unit: string
  timestamp: string
  tags: Record<string, string>
}

export interface Alert {
  id: string
  type: 'cost' | 'performance' | 'error' | 'usage'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  threshold: number
  currentValue: number
  timestamp: string
  resolved: boolean
}

export interface PerformanceMetrics {
  responseTime: {
    avg: number
    p95: number
    p99: number
  }
  errorRate: number
  throughput: number
  activeUsers: number
  systemLoad: number
}

class MonitoringSystem {
  private supabaseUrl: string
  private supabaseKey: string
  private alerts: Alert[] = []

  constructor() {
    this.supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    this.supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  }

  async recordMetric(metric: SystemMetric): Promise<void> {
    try {
      await fetch(`${this.supabaseUrl}/rest/v1/system_metrics`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.supabaseKey}`,
          'apikey': this.supabaseKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: metric.name,
          value: metric.value,
          unit: metric.unit,
          timestamp: metric.timestamp,
          tags: metric.tags
        })
      })
    } catch (error) {
      console.error('Error recording metric:', error)
    }
  }

  async checkThresholds(): Promise<Alert[]> {
    const newAlerts: Alert[] = []

    // Check cost thresholds
    const dailyCost = await this.getDailyCost()
    if (dailyCost > 50) {
      newAlerts.push({
        id: crypto.randomUUID(),
        type: 'cost',
        severity: dailyCost > 100 ? 'critical' : 'high',
        title: 'High Daily Costs',
        description: `Daily AI costs have reached $${dailyCost.toFixed(2)}`,
        threshold: 50,
        currentValue: dailyCost,
        timestamp: new Date().toISOString(),
        resolved: false
      })
    }

    // Check error rates
    const errorRate = await this.getErrorRate()
    if (errorRate > 0.05) { // 5% error rate
      newAlerts.push({
        id: crypto.randomUUID(),
        type: 'error',
        severity: errorRate > 0.1 ? 'critical' : 'high',
        title: 'High Error Rate',
        description: `Error rate has reached ${(errorRate * 100).toFixed(1)}%`,
        threshold: 0.05,
        currentValue: errorRate,
        timestamp: new Date().toISOString(),
        resolved: false
      })
    }

    // Check response times
    const avgResponseTime = await this.getAverageResponseTime()
    if (avgResponseTime > 5000) { // 5 seconds
      newAlerts.push({
        id: crypto.randomUUID(),
        type: 'performance',
        severity: avgResponseTime > 10000 ? 'critical' : 'medium',
        title: 'Slow Response Times',
        description: `Average response time is ${avgResponseTime}ms`,
        threshold: 5000,
        currentValue: avgResponseTime,
        timestamp: new Date().toISOString(),
        resolved: false
      })
    }

    // Store new alerts
    for (const alert of newAlerts) {
      await this.storeAlert(alert)
    }

    return newAlerts
  }

  async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    // In a real implementation, you'd query your metrics database
    // For now, we'll return simulated metrics
    return {
      responseTime: {
        avg: 1200 + Math.random() * 800,
        p95: 2500 + Math.random() * 1000,
        p99: 4000 + Math.random() * 2000
      },
      errorRate: Math.random() * 0.02, // 0-2% error rate
      throughput: 50 + Math.random() * 100, // requests per minute
      activeUsers: Math.floor(Math.random() * 500),
      systemLoad: Math.random() * 0.8 // 0-80% load
    }
  }

  async recordUserAction(
    userId: string | null,
    action: string,
    metadata: Record<string, any> = {}
  ): Promise<void> {
    try {
      await fetch(`${this.supabaseUrl}/rest/v1/user_actions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.supabaseKey}`,
          'apikey': this.supabaseKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: userId,
          action,
          metadata,
          timestamp: new Date().toISOString()
        })
      })
    } catch (error) {
      console.error('Error recording user action:', error)
    }
  }

  async getConversionFunnel(): Promise<{
    visitors: number
    signups: number
    firstListing: number
    paidConversion: number
    conversionRate: number
  }> {
    // In a real implementation, you'd query your analytics database
    const visitors = 1000 + Math.floor(Math.random() * 500)
    const signups = Math.floor(visitors * 0.15) // 15% signup rate
    const firstListing = Math.floor(signups * 0.8) // 80% create first listing
    const paidConversion = Math.floor(signups * 0.12) // 12% convert to paid

    return {
      visitors,
      signups,
      firstListing,
      paidConversion,
      conversionRate: paidConversion / visitors
    }
  }

  private async getDailyCost(): Promise<number> {
    const today = new Date().toISOString().split('T')[0]
    
    try {
      const response = await fetch(`${this.supabaseUrl}/rest/v1/api_usage?created_at=gte.${today}T00:00:00&created_at=lt.${today}T23:59:59`, {
        headers: {
          'Authorization': `Bearer ${this.supabaseKey}`,
          'apikey': this.supabaseKey
        }
      })

      if (!response.ok) return 0

      const usage = await response.json()
      return usage.reduce((sum: number, item: any) => sum + parseFloat(item.cost || 0), 0)
    } catch (error) {
      console.error('Error fetching daily cost:', error)
      return 0
    }
  }

  private async getErrorRate(): Promise<number> {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    
    try {
      const response = await fetch(`${this.supabaseUrl}/rest/v1/api_usage?created_at=gte.${oneDayAgo}`, {
        headers: {
          'Authorization': `Bearer ${this.supabaseKey}`,
          'apikey': this.supabaseKey
        }
      })

      if (!response.ok) return 0

      const usage = await response.json()
      const totalRequests = usage.length
      const failedRequests = usage.filter((item: any) => !item.success).length

      return totalRequests > 0 ? failedRequests / totalRequests : 0
    } catch (error) {
      console.error('Error calculating error rate:', error)
      return 0
    }
  }

  private async getAverageResponseTime(): Promise<number> {
    // Simulate response time calculation
    // In a real implementation, you'd track actual response times
    return 1200 + Math.random() * 2000
  }

  private async storeAlert(alert: Alert): Promise<void> {
    try {
      await fetch(`${this.supabaseUrl}/rest/v1/system_alerts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.supabaseKey}`,
          'apikey': this.supabaseKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: alert.id,
          type: alert.type,
          severity: alert.severity,
          title: alert.title,
          description: alert.description,
          threshold: alert.threshold,
          current_value: alert.currentValue,
          timestamp: alert.timestamp,
          resolved: alert.resolved
        })
      })
    } catch (error) {
      console.error('Error storing alert:', error)
    }
  }

  // Health check endpoint
  async getSystemHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'down'
    services: Record<string, 'up' | 'down' | 'degraded'>
    uptime: number
    version: string
  }> {
    const services = {
      database: 'up' as const,
      edgeFunctions: 'up' as const,
      claudeAPI: 'up' as const,
      visionAPI: 'up' as const
    }

    // Check each service (simplified)
    try {
      // Test database connection
      await fetch(`${this.supabaseUrl}/rest/v1/api_usage?limit=1`, {
        headers: {
          'Authorization': `Bearer ${this.supabaseKey}`,
          'apikey': this.supabaseKey
        }
      })
    } catch {
      services.database = 'down'
    }

    const downServices = Object.values(services).filter(status => status === 'down').length
    const degradedServices = Object.values(services).filter(status => status === 'degraded').length

    let status: 'healthy' | 'degraded' | 'down' = 'healthy'
    if (downServices > 0) status = 'down'
    else if (degradedServices > 0) status = 'degraded'

    return {
      status,
      services,
      uptime: Date.now() - (Date.now() % (24 * 60 * 60 * 1000)), // Simplified uptime
      version: '1.0.0'
    }
  }
}

export const monitoringSystem = new MonitoringSystem()