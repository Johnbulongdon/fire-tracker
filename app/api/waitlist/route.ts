import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

  // Save to Supabase
  const { error } = await supabase.from('waitlist').insert({ email })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Send confirmation email
  const result = await resend.emails.send({
    from: 'UntilFire <onboarding@resend.dev>',
    to: email,
    subject: "You're on the UntilFire waitlist 🔥",
    html: `<p>Thanks for joining! We'll notify you when we launch.</p>`
  })

  console.log('Resend result:', JSON.stringify(result))

  // Notify yourself
  const result2 = await resend.emails.send({
    from: 'UntilFire <onboarding@resend.dev>',
    to: 'your@email.com',
    subject: `New waitlist signup: ${email}`,
    html: `<p>${email} just joined the UntilFire waitlist.</p>`
  })

  console.log('Notify result:', JSON.stringify(result2))

  return NextResponse.json({ success: true })
}