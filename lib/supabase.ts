import { createClient } from '@supabase/supabase-js'
import { getOptionalSupabaseEnv, getSupabaseEnvErrorMessage } from './env'

const env = getOptionalSupabaseEnv()

export const supabase = createClient(
  env?.url ?? 'https://example.invalid',
  env?.anonKey ?? 'missing-public-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'fire-dashboard-auth',
      flowType: 'pkce',
    },
  }
)

function assertSupabaseEnv() {
  if (!env) {
    throw new Error(getSupabaseEnvErrorMessage())
  }
}

export const getCurrentUser = async () => {
  assertSupabaseEnv()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    console.error('Error getting user:', error)
    return null
  }

  return user
}

export const isAuthenticated = async () => {
  const user = await getCurrentUser()
  return !!user
}

export const getSubscription = async () => {
  assertSupabaseEnv()

  const {
    data: { session },
  } = await supabase.auth.getSession()

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
