import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface OfflineErrorSyncRequest {
  errors: Array<{
    code: string
    message: string
    userMessage: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    context?: Record<string, any>
    timestamp: string
    userId?: string
    sessionId: string
  }>
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { errors }: OfflineErrorSyncRequest = await req.json()
    
    if (!errors || errors.length === 0) {
      return new Response(
        JSON.stringify({ success: true, synced: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing Supabase configuration')
    }

    let syncedCount = 0
    const failedSyncs: string[] = []

    // Batch insert errors
    for (const error of errors) {
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/error_logs`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: crypto.randomUUID(),
            error_code: error.code,
            error_message: error.message,
            user_message: error.userMessage,
            severity: error.severity,
            context: error.context || {},
            user_id: error.userId,
            session_id: error.sessionId,
            timestamp: error.timestamp,
            resolved: false,
            synced_from_offline: true
          })
        })

        if (response.ok) {
          syncedCount++
        } else {
          failedSyncs.push(error.sessionId)
        }
      } catch (syncError) {
        console.error('Failed to sync error:', error.sessionId, syncError)
        failedSyncs.push(error.sessionId)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        synced: syncedCount,
        failed: failedSyncs.length,
        failedIds: failedSyncs,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Offline error sync failed:', error)
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