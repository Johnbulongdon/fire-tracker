import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { getOptionalSupabaseEnv, getSupabaseEnvErrorMessage } from '@/lib/env'

export async function POST(req: Request) {
  const env = getOptionalSupabaseEnv()

  if (!env) {
    return NextResponse.json({ error: getSupabaseEnvErrorMessage() }, { status: 503 })
  }

  const supabase = createClient(env.url, env.anonKey)
  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

  const { error } = await supabase.from('waitlist').insert({ email })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ success: true })
}
