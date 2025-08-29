import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper functions for common operations
export const supabaseApi = {
  // Auth helpers
  async signUp(email: string, password: string) {
    return await supabase.auth.signUp({ email, password })
  },

  async signIn(email: string, password: string) {
    return await supabase.auth.signInWithPassword({ email, password })
  },

  async signOut() {
    return await supabase.auth.signOut()
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  // API usage tracking
  async logApiUsage(usage: {
    service: string
    operation: string
    cost: number
    success: boolean
    sessionId: string
  }) {
    return await supabase
      .from('api_usage')
      .insert([{
        service: usage.service,
        operation: usage.operation,
        cost: usage.cost,
        success: usage.success,
        session_id: usage.sessionId,
        created_at: new Date().toISOString()
      }])
  },

  // Get user's API usage
  async getUserUsage(userId: string, days: number = 30) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    return await supabase
      .from('api_usage')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })
  }
}