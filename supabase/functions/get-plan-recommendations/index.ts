import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { subscriptionManager } from '../shared/subscription-manager.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface PlanRecommendationRequest {
  userId: string
  timeRange?: number // days to analyze, default 30
}

interface UsageProjection {
  currentUsage: {
    listings: number
    videos: number
    daysInPeriod: number
  }
  projectedMonthlyUsage: {
    listings: number
    videos: number
  }
  riskLevel: 'low' | 'medium' | 'high'
  daysUntilLimit: number | null
  willExceedLimit: boolean
}

interface PlanRecommendation {
  currentPlan: any
  recommendedPlan: any
  potentialSavings: number
  reason: string
  urgency: 'low' | 'medium' | 'high'
  benefits: string[]
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId, timeRange = 30 }: PlanRecommendationRequest = await req.json()
    
    if (!userId) {
      throw new Error('User ID is required')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing Supabase configuration')
    }

    // Fetch user's current subscription and usage data
    const currentSubscription = await subscriptionManager.getUserSubscription(userId)
    const currentUsage = await subscriptionManager.getUserUsage(userId)
    
    // Fetch historical usage for projection
    const historicalUsage = await fetchHistoricalUsage(userId, timeRange, supabaseUrl, serviceRoleKey)
    
    // Calculate usage projection
    const usageProjection = calculateUsageProjection(currentUsage, historicalUsage, currentSubscription)
    
    // Generate plan recommendation
    const planRecommendation = generatePlanRecommendation(
      currentSubscription,
      currentUsage,
      usageProjection,
      historicalUsage
    )
    
    return new Response(
      JSON.stringify({
        success: true,
        usageProjection,
        planRecommendation,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Plan recommendation error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

async function fetchHistoricalUsage(userId: string, days: number, supabaseUrl: string, serviceRoleKey: string) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  
  const response = await fetch(`${supabaseUrl}/rest/v1/api_usage?user_id=eq.${userId}&created_at=gte.${startDate.toISOString()}&order=created_at.desc`, {
    headers: {
      'Authorization': `Bearer ${serviceRoleKey}`,
      'apikey': serviceRoleKey
    }
  })

  if (!response.ok) {
    throw new Error('Failed to fetch historical usage')
  }

  return await response.json()
}

function calculateUsageProjection(currentUsage: any, historicalUsage: any[], currentSubscription: any): UsageProjection {
  const now = new Date()
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const daysInCurrentPeriod = Math.floor((now.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24))
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  
  // Calculate recent activity (last 7 days)
  const recentActivity = historicalUsage.filter(usage => {
    const usageDate = new Date(usage.created_at)
    const daysDiff = (now.getTime() - usageDate.getTime()) / (1000 * 60 * 60 * 24)
    return daysDiff <= 7
  })
  
  const recentListings = recentActivity.filter(u => u.operation.includes('listing')).length
  const recentVideos = recentActivity.filter(u => u.operation.includes('video')).length
  
  // Project monthly usage based on recent activity
  const weeklyListings = recentListings
  const weeklyVideos = recentVideos
  const projectedMonthlyListings = Math.ceil((weeklyListings / 7) * daysInMonth)
  const projectedMonthlyVideos = Math.ceil((weeklyVideos / 7) * daysInMonth)
  
  const currentPlan = subscriptionManager.getPlan(currentSubscription?.planId || 'free')
  
  // Calculate risk level and days until limit
  let riskLevel: 'low' | 'medium' | 'high' = 'low'
  let daysUntilLimit: number | null = null
  let willExceedLimit = false
  
  if (currentPlan.features.listingsPerMonth !== -1) {
    const listingsRemaining = currentPlan.features.listingsPerMonth - (currentUsage?.listingsUsed || 0)
    const dailyListingRate = weeklyListings / 7
    
    if (dailyListingRate > 0) {
      daysUntilLimit = Math.floor(listingsRemaining / dailyListingRate)
      const daysRemainingInPeriod = daysInMonth - daysInCurrentPeriod
      
      if (daysUntilLimit <= 3) riskLevel = 'high'
      else if (daysUntilLimit <= 7) riskLevel = 'medium'
      
      willExceedLimit = projectedMonthlyListings > currentPlan.features.listingsPerMonth
    }
  }
  
  return {
    currentUsage: {
      listings: currentUsage?.listingsUsed || 0,
      videos: currentUsage?.videosUsed || 0,
      daysInPeriod: daysInCurrentPeriod
    },
    projectedMonthlyUsage: {
      listings: projectedMonthlyListings,
      videos: projectedMonthlyVideos
    },
    riskLevel,
    daysUntilLimit,
    willExceedLimit
  }
}

function generatePlanRecommendation(
  currentSubscription: any,
  currentUsage: any,
  projection: UsageProjection,
  historicalUsage: any[]
): PlanRecommendation {
  const currentPlan = subscriptionManager.getPlan(currentSubscription?.planId || 'free')
  const allPlans = subscriptionManager.getAllPlans()
  
  // Use the subscription manager's cost estimation
  const costAnalysis = subscriptionManager.estimateMonthlyCost(
    projection.projectedMonthlyUsage.listings,
    projection.projectedMonthlyUsage.videos
  )
  
  let urgency: 'low' | 'medium' | 'high' = 'low'
  let reason = ''
  let benefits: string[] = []
  
  // Determine urgency based on projection
  if (projection.willExceedLimit && projection.daysUntilLimit && projection.daysUntilLimit <= 7) {
    urgency = 'high'
    reason = `You're likely to exceed your ${currentPlan.name} plan limits within ${projection.daysUntilLimit} days`
    benefits = [
      'Avoid service interruption',
      'Continue optimizing without limits',
      'Better value for your usage level'
    ]
  } else if (projection.willExceedLimit) {
    urgency = 'medium'
    reason = `Your projected usage (${projection.projectedMonthlyUsage.listings} listings) exceeds your current plan limits`
    benefits = [
      'Prevent hitting monthly limits',
      'More cost-effective for your usage',
      'Access to advanced features'
    ]
  } else if (costAnalysis.estimatedSavings > 10) {
    urgency = 'low'
    reason = `You could save $${costAnalysis.estimatedSavings.toFixed(2)}/month with a better plan`
    benefits = [
      `Save $${costAnalysis.estimatedSavings.toFixed(2)} monthly`,
      'Better value for your usage pattern',
      'Optimized for your business size'
    ]
  } else {
    reason = 'Your current plan fits your usage well'
    benefits = ['Current plan is well-suited for your needs']
  }
  
  return {
    currentPlan,
    recommendedPlan: costAnalysis.recommendedPlan,
    potentialSavings: costAnalysis.estimatedSavings,
    reason,
    urgency,
    benefits
  }
}