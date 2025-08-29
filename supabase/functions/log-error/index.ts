import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface ErrorLogRequest {
  error: {
    code: string
    message: string
    userMessage: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    context?: Record<string, any>
    timestamp: string
    userId?: string
    sessionId: string
  }
  stackTrace?: string
  userAgent: string
  url: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { error, stackTrace, userAgent, url }: ErrorLogRequest = await req.json()
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing Supabase configuration')
    }

    // Store error in database
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
        stack_trace: stackTrace,
        user_agent: userAgent,
        url: url,
        user_id: error.userId,
        session_id: error.sessionId,
        timestamp: error.timestamp,
        resolved: false
      })
    })

    if (!response.ok) {
      throw new Error('Failed to store error log')
    }

    // Send critical errors to monitoring service (if configured)
    if (error.severity === 'critical') {
      await sendCriticalAlert(error, stackTrace)
    }

    return new Response(
      JSON.stringify({
        success: true,
        errorId: error.sessionId,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (loggingError) {
    console.error('Error logging failed:', loggingError)
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to log error',
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

async function sendCriticalAlert(error: any, stackTrace?: string) {
  try {
    // In production, you might send to Slack, email, or monitoring service
    console.error('CRITICAL ERROR ALERT:', {
      code: error.code,
      message: error.message,
      userId: error.userId,
      timestamp: error.timestamp,
      context: error.context,
      stackTrace
    })
    
    // Example: Send to webhook or monitoring service
    // await fetch('https://hooks.slack.com/your-webhook', {
    //   method: 'POST',
    //   body: JSON.stringify({
    //     text: `🚨 Critical Error in EtsyStudio AI: ${error.message}`,
    //     attachments: [{
    //       color: 'danger',
    //       fields: [
    //         { title: 'Error Code', value: error.code, short: true },
    //         { title: 'User ID', value: error.userId || 'Anonymous', short: true },
    //         { title: 'Timestamp', value: error.timestamp, short: false }
    //       ]
    //     }]
    //   })
    // })
  } catch (alertError) {
    console.error('Failed to send critical alert:', alertError)
  }
}