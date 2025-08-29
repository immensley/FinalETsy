import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import { supabase } from '../lib/supabase'
import type { SubscriptionPlan, UsageStats } from '../types'

export function useSubscription() {
  const { user } = useAuth()
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan | null>(null)
  const [usage, setUsage] = useState<UsageStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchSubscriptionData()
    } else {
      // Default to free plan for non-authenticated users
      setCurrentPlan({
        id: 'free',
        name: 'Free',
        price: 0,
        features: {
          listingsPerMonth: 5,
          videosPerMonth: 2,
          aiModel: 'haiku',
          advancedFeatures: false
        }
      })
      setUsage({
        listingsUsed: 0,
        videosUsed: 0,
        remaining: { listings: 5, videos: 2 },
        resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      })
      setLoading(false)
    }
  }, [user])

  const fetchSubscriptionData = async () => {
    if (!user) return

    try {
      // Fetch user subscription
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single()

      // Fetch usage data
      const currentPeriod = new Date().toISOString().substring(0, 7)
      const { data: usageData } = await supabase
        .from('usage_quotas')
        .select('*')
        .eq('user_id', user.id)
        .eq('period', currentPeriod)
        .single()

      // Set plan data (mock for now)
      setCurrentPlan({
        id: subscription?.plan_id || 'free',
        name: subscription?.plan_id === 'pro' ? 'Pro' : 'Free',
        price: subscription?.plan_id === 'pro' ? 79 : 0,
        features: {
          listingsPerMonth: subscription?.plan_id === 'pro' ? -1 : 5,
          videosPerMonth: subscription?.plan_id === 'pro' ? -1 : 2,
          aiModel: subscription?.plan_id === 'pro' ? 'sonnet' : 'haiku',
          advancedFeatures: subscription?.plan_id === 'pro'
        }
      })

      setUsage({
        listingsUsed: usageData?.listings_used || 0,
        videosUsed: usageData?.videos_used || 0,
        remaining: {
          listings: Math.max(0, (subscription?.plan_id === 'pro' ? 999 : 5) - (usageData?.listings_used || 0)),
          videos: Math.max(0, (subscription?.plan_id === 'pro' ? 999 : 2) - (usageData?.videos_used || 0))
        },
        resetDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
      })
    } catch (error) {
      console.error('Error fetching subscription data:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkUsageLimit = (type: 'listing' | 'video') => {
    if (!currentPlan || !usage) return { allowed: false, remaining: 0 }

    const limit = type === 'listing' 
      ? currentPlan.features.listingsPerMonth 
      : currentPlan.features.videosPerMonth
    
    const used = type === 'listing' ? usage.listingsUsed : usage.videosUsed

    if (limit === -1) return { allowed: true, remaining: -1 } // Unlimited

    return {
      allowed: used < limit,
      remaining: Math.max(0, limit - used)
    }
  }

  return {
    currentPlan,
    usage,
    loading,
    checkUsageLimit,
    refetch: fetchSubscriptionData
  }
}