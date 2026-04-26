# Sprint 14 — Onboarding Email

**Date:** —  
**Status:** 🔲 Planned  
**Module:** FIRE Dashboard  
**Destination:** Every new signup receives a single well-crafted email within 60 seconds telling them exactly what to do next — so their first session isn't their last.

## Problem

Users sign up, land on the dashboard, and are left to figure it out. There's no follow-up. Most people don't return after their first visit. A well-timed onboarding email at peak interest can bring them back for session 2.

## User story

As a new user, I want to receive a clear "here's how to get the most out of UntilFire" email right after signing up — so I know what to do next even if I close the tab.

## Done when

- [ ] New user signup triggers email send (via Supabase auth webhook or API route called post-OAuth)
- [ ] Email provider: Resend (simple API, generous free tier)
- [ ] Email content:
  - Subject: *"Your FIRE number is saved — 3 things to do next"*
  - Body: their FIRE target (if prefill was captured), 3 steps (set budget, log first transaction, try a calculator), CTA to dashboard
  - Plain HTML, matches UntilFire design tokens (dark bg, orange accent)
- [ ] Email only sends once per user (idempotency check in Supabase)
- [ ] Test email sends correctly to a real inbox within 60 seconds of signup
- [ ] `npm run build` passes clean

## Out of scope

- Full drip sequence (save for after product-market fit signals)
- Unsubscribe flow (Resend handles this automatically)
- Email open/click tracking (add later)

## Files

| File | Change |
|---|---|
| `app/api/auth/onboarding/route.ts` | CREATE — called post-OAuth, sends welcome email via Resend |
| `app/auth/callback/page.tsx` | Call onboarding route after successful auth |
| `lib/email-templates.ts` | CREATE — welcome email HTML template |
