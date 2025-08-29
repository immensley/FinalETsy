// Subscription and usage management system

export interface SubscriptionPlan {
  id: string
  name: string
  price: number
  interval: 'month' | 'year'
  features: {
    listingsPerMonth: number
    videosPerMonth: number
    aiModel: 'haiku' | 'sonnet' | 'opus'
    advancedFeatures: boolean
    prioritySupport: boolean
    apiAccess: boolean
  }
  limits: {
    maxImageSize: number // in MB
    maxConcurrentJobs: number
    retentionDays: number
  }
}

export interface UserSubscription {
  userId: string
  planId: string
  status: 'active' | 'canceled' | 'past_due' | 'trialing'
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  trialEnd?: string
}

export interface UsageQuota {
  userId: string
  planId: string
  period: string // YYYY-MM format
  listingsUsed: number
  videosUsed: number
  storageUsed: number // in MB
  lastReset: string
}

class SubscriptionManager {
  private supabaseUrl: string
  private supabaseKey: string

  // Define available plans
  private plans: SubscriptionPlan[] = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      interval: 'month',
      features: {
        listingsPerMonth: 5,
        videosPerMonth: 2,
        aiModel: 'haiku',
        advancedFeatures: false,
        prioritySupport: false,
        apiAccess: false
      },
      limits: {
        maxImageSize: 5,
        maxConcurrentJobs: 1,
        retentionDays: 30
      }
    },
    {
      id: 'starter',
      name: 'Starter',
      price: 29,
      interval: 'month',
      features: {
        listingsPerMonth: 50,
        videosPerMonth: 10,
        aiModel: 'sonnet',
        advancedFeatures: false,
        prioritySupport: false,
        apiAccess: false
      },
      limits: {
        maxImageSize: 10,
        maxConcurrentJobs: 2,
        retentionDays: 90
      }
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 79,
      interval: 'month',
      features: {
        listingsPerMonth: -1, // unlimited
        videosPerMonth: -1, // unlimited
        aiModel: 'sonnet',
        advancedFeatures: true,
        prioritySupport: true,
        apiAccess: false
      },
      limits: {
        maxImageSize: 20,
        maxConcurrentJobs: 5,
        retentionDays: 365
      }
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 199,
      interval: 'month',
      features: {
        listingsPerMonth: -1, // unlimited
        videosPerMonth: -1, // unlimited
        aiModel: 'opus',
        advancedFeatures: true,
        prioritySupport: true,
        apiAccess: true
      },
      limits: {
        maxImageSize: 50,
        maxConcurrentJobs: 10,
        retentionDays: 365
      }
    }
  ]

  constructor() {
    this.supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    this.supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  }

  async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    try {
      const response = await fetch(`${this.supabaseUrl}/rest/v1/user_subscriptions?user_id=eq.${userId}`, {
        headers: {
          'Authorization': `Bearer ${this.supabaseKey}`,
          'apikey': this.supabaseKey
        }
      })

      if (!response.ok) return null

      const subscriptions = await response.json()
      return subscriptions.length > 0 ? subscriptions[0] : null
    } catch (error) {
      console.error('Error fetching user subscription:', error)
      return null
    }
  }

  async getUserUsage(userId: string): Promise<UsageQuota | null> {
    const currentPeriod = new Date().toISOString().substring(0, 7) // YYYY-MM

    try {
      const response = await fetch(`${this.supabaseUrl}/rest/v1/usage_quotas?user_id=eq.${userId}&period=eq.${currentPeriod}`, {
        headers: {
          'Authorization': `Bearer ${this.supabaseKey}`,
          'apikey': this.supabaseKey
        }
      })

      if (!response.ok) return null

      const usage = await response.json()
      return usage.length > 0 ? usage[0] : null
    } catch (error) {
      console.error('Error fetching user usage:', error)
      return null
    }
  }

  async checkUsageLimit(userId: string, type: 'listing' | 'video'): Promise<{
    allowed: boolean
    remaining: number
    limit: number
    planName: string
  }> {
    const subscription = await this.getUserSubscription(userId)
    const plan = this.getPlan(subscription?.planId || 'free')
    const usage = await this.getUserUsage(userId)

    const limit = type === 'listing' ? plan.features.listingsPerMonth : plan.features.videosPerMonth
    const used = usage ? (type === 'listing' ? usage.listingsUsed : usage.videosUsed) : 0

    // -1 means unlimited
    if (limit === -1) {
      return {
        allowed: true,
        remaining: -1,
        limit: -1,
        planName: plan.name
      }
    }

    const remaining = Math.max(0, limit - used)
    
    return {
      allowed: remaining > 0,
      remaining,
      limit,
      planName: plan.name
    }
  }

  async incrementUsage(userId: string, type: 'listing' | 'video', amount: number = 1): Promise<void> {
    const currentPeriod = new Date().toISOString().substring(0, 7)
    const subscription = await this.getUserSubscription(userId)
    const planId = subscription?.planId || 'free'

    try {
      // Upsert usage record
      await fetch(`${this.supabaseUrl}/rest/v1/usage_quotas`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.supabaseKey}`,
          'apikey': this.supabaseKey,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify({
          user_id: userId,
          plan_id: planId,
          period: currentPeriod,
          listings_used: type === 'listing' ? amount : 0,
          videos_used: type === 'video' ? amount : 0,
          last_reset: new Date().toISOString()
        })
      })
    } catch (error) {
      console.error('Error incrementing usage:', error)
    }
  }

  getPlan(planId: string): SubscriptionPlan {
    return this.plans.find(p => p.id === planId) || this.plans[0] // Default to free
  }

  getAllPlans(): SubscriptionPlan[] {
    return this.plans
  }

  async createTrialSubscription(userId: string, planId: string): Promise<UserSubscription> {
    const plan = this.getPlan(planId)
    const now = new Date()
    const trialEnd = new Date(now.getTime() + (14 * 24 * 60 * 60 * 1000)) // 14 days trial

    const subscription: UserSubscription = {
      userId,
      planId,
      status: 'trialing',
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: trialEnd.toISOString(),
      cancelAtPeriodEnd: false,
      trialEnd: trialEnd.toISOString()
    }

    await fetch(`${this.supabaseUrl}/rest/v1/user_subscriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.supabaseKey}`,
        'apikey': this.supabaseKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: subscription.userId,
        plan_id: subscription.planId,
        status: subscription.status,
        current_period_start: subscription.currentPeriodStart,
        current_period_end: subscription.currentPeriodEnd,
        cancel_at_period_end: subscription.cancelAtPeriodEnd,
        trial_end: subscription.trialEnd
      })
    })

    return subscription
  }

  // Calculate estimated monthly cost based on usage patterns
  estimateMonthlyCost(avgListingsPerMonth: number, avgVideosPerMonth: number): {
    recommendedPlan: SubscriptionPlan
    estimatedSavings: number
    alternatives: Array<{ plan: SubscriptionPlan; overage: number }>
  } {
    const alternatives = this.plans.map(plan => {
      let overage = 0
      
      // Calculate overage costs (simplified)
      if (plan.features.listingsPerMonth !== -1 && avgListingsPerMonth > plan.features.listingsPerMonth) {
        overage += (avgListingsPerMonth - plan.features.listingsPerMonth) * 0.50 // $0.50 per extra listing
      }
      
      if (plan.features.videosPerMonth !== -1 && avgVideosPerMonth > plan.features.videosPerMonth) {
        overage += (avgVideosPerMonth - plan.features.videosPerMonth) * 2.00 // $2.00 per extra video
      }

      return { plan, overage }
    })

    // Find the most cost-effective plan
    const costsWithOverage = alternatives.map(alt => ({
      ...alt,
      totalCost: alt.plan.price + alt.overage
    }))

    const recommendedPlan = costsWithOverage.reduce((best, current) => 
      current.totalCost < best.totalCost ? current : best
    )

    const mostExpensive = costsWithOverage.reduce((max, current) => 
      current.totalCost > max.totalCost ? current : max
    )

    return {
      recommendedPlan: recommendedPlan.plan,
      estimatedSavings: mostExpensive.totalCost - recommendedPlan.totalCost,
      alternatives
    }
  }
}

export const subscriptionManager = new SubscriptionManager()