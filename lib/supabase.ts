import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://boqzhdfdetixnwnohtho.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvcXpoZGZkZXRpeG53bm9odGhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc0Nzk1OTUsImV4cCI6MjA1MzA1NTU5NX0.uXt2OykfORDHF6XHwNwsSQ_pvPd5HTP'

console.log('🔧 Supabase initialized:')
console.log('URL:', supabaseUrl)
console.log('Key loaded:', !!supabaseAnonKey)

// Create a singleton Supabase client with auth persistence
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'fire-dashboard-auth',
    flowType: 'pkce',
  }
})

// Expose for browser testing
if (typeof window !== 'undefined') {
  (window as any).supabaseClient = supabase
  console.log('✅ Supabase available as window.supabaseClient')
}

// Helper to get current user
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) {
    console.error('Error getting user:', error)
    return null
  }
  return user
}

// Helper to check if user is authenticated
export const isAuthenticated = async () => {
  const user = await getCurrentUser()
  return !!user
}

// Helper to get subscription status for the current user
export const getSubscription = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null
  const { data } = await supabase
    .from('subscriptions')
    .select('status, plan, current_period_end')
    .eq('user_id', session.user.id)
    .single()
  return data
}

export const isPro = async () => {
  const sub = await getSubscription()
  return sub?.status === 'active' && sub?.plan === 'pro'
}
