import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { costTracker } from '../shared/cost-tracker.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const date = url.searchParams.get('date') || new Date().toISOString().split('T')[0]
    
    // Get daily usage statistics
    const usageStats = await costTracker.getDailyUsage(date)
    
    // Check if we're approaching cost thresholds
    const threshold = parseFloat(url.searchParams.get('threshold') || '50')
    const thresholdExceeded = await costTracker.checkCostThreshold(threshold)
    
    return new Response(
      JSON.stringify({
        success: true,
        date,
        ...usageStats,
        thresholdExceeded,
        threshold,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Usage stats error:', error)
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