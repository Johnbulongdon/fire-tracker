import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://boqzhdfdetixnwnohtho.supabase.co'
const supabaseAnonKey = 'sbp_uXt2OykfORDHF6XHwNwsSQ_pvPd5HTP'

console.log('🔧 Supabase initialized:')
console.log('URL:', supabaseUrl)
console.log('Key loaded:', !!supabaseAnonKey)

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Expose for browser testing
if (typeof window !== 'undefined') {
  (window as any).supabaseClient = supabase
  console.log('✅ Supabase available as window.supabaseClient')
}
