import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing Supabase configuration')
    }

    // Fetch all usage data from the last 30 days
    const thirtyDaysAgo = new Date(Date.now() - (30 * 24 * 60 * 60 * 1000))
    
    const response = await fetch(`${supabaseUrl}/rest/v1/api_usage?created_at=gte.${thirtyDaysAgo.toISOString()}&order=created_at.desc`, {
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch usage data')
    }

    const usageData = await response.json()
    
    // Convert to CSV format
    const csvContent = generateCSV(usageData)
    
    return new Response(csvContent, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="etsystudio-admin-data.csv"'
      },
      status: 200,
    })
  } catch (error) {
    console.error('Export error:', error)
    return new Response(
      JSON.stringify({
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

function generateCSV(data: any[]): string {
  if (data.length === 0) {
    return 'No data available'
  }

  // Define CSV headers
  const headers = [
    'Date',
    'Service',
    'Model',
    'Operation',
    'Input Tokens',
    'Output Tokens',
    'Image Count',
    'Cost (USD)',
    'Success',
    'Error Type',
    'Session ID'
  ]

  // Generate CSV rows
  const rows = data.map(item => [
    new Date(item.created_at).toISOString(),
    item.service || '',
    item.model || '',
    item.operation || '',
    item.input_tokens || 0,
    item.output_tokens || 0,
    item.image_count || 0,
    item.cost || 0,
    item.success ? 'Yes' : 'No',
    item.error_type || '',
    item.session_id || ''
  ])

  // Combine headers and rows
  const csvLines = [headers, ...rows].map(row => 
    row.map(field => `"${field}"`).join(',')
  )

  return csvLines.join('\n')
}