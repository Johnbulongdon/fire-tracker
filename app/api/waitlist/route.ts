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

  // Send confirmation email to user
  await resend.emails.send({
    from: 'UntilFire <waitlist@untilfire.com>',
    to: email,
    subject: "You're on the UntilFire waitlist 🔥",
    html: `
      <div style="background:#08080e;color:#e8e8f2;font-family:sans-serif;padding:40px;max-width:520px;margin:0 auto;border-radius:16px;">
        <div style="font-size:36px;margin-bottom:16px;">🔥</div>
        <h1 style="font-size:28px;font-weight:800;margin:0 0 12px;">You're in!</h1>
        <p style="color:#9999aa;font-size:16px;line-height:1.7;margin:0 0 24px;">
          Thanks for joining the UntilFire waitlist. We're building the AI-powered FIRE roadmap 
          that tells you exactly what to do each month to retire faster.
        </p>
        <p style="color:#9999aa;font-size:16px;line-height:1.7;margin:0 0 32px;">
          We'll email you the moment we launch at $9/mo. Early waitlist members get 
          <strong style="color:#f97316;">50% off for life</strong>.
        </p>
        <a href="https://untilfire.com" style="background:#f97316;color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;">
          Calculate your FIRE number →
        </a>
        <p style="color:#5e5e7a;font-size:12px;margin-top:32px;">
          UntilFire · You're receiving this because you joined our waitlist.
        </p>
      </div>
    `
  })

  // Notify yourself
  await resend.emails.send({
    from: 'UntilFire <waitlist@untilfire.com>',
    to: 'ngjohn101@gmail.com', // ← change this to your email
    subject: `New waitlist signup: ${email}`,
    html: `<p>${email} just joined the UntilFire waitlist.</p>`
  })

  return NextResponse.json({ success: true })
}