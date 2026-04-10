# Sprint 10 — Email Capture on Calculator Results

**Date:** —  
**Status:** 🔲 Planned  
**Module:** Landing & Wizard → v1.3  
**Destination:** Anonymous users who see their FIRE number can save it by email — creating a lead that can be nurtured toward sign-up.

## Problem

A user completes the calculator, sees their FIRE number, doesn't sign up, and leaves. The result is lost. There's no way to re-engage them later. Email capture at peak interest (right after the reveal) is the highest-leverage moment to collect a lead.

## User story

As someone who just saw my FIRE number but isn't ready to create an account, I want to save my result by email — so I can come back to it later.

## Done when

- [ ] RevealScreen: below the share button, show `"Get your FIRE plan by email — free"` with an email input + "Send it →" button
- [ ] On submit: POST to `/api/waitlist` (existing endpoint) with email + FIRE data
- [ ] Success state: `"Check your inbox"` confirmation replaces the input
- [ ] If user is logged in: email capture hidden entirely (no duplicate prompt)
- [ ] If user already submitted: don't show again in the session (sessionStorage flag)
- [ ] Input is dismissible (small "✕" to hide it)
- [ ] `npm run build` passes clean

## Out of scope

- Double opt-in email confirmation
- CRM integration (use existing waitlist endpoint for now)
- Personalised email content (generic "here's your FIRE plan" for now)

## Files

| File | Change |
|---|---|
| `app/page.tsx` | RevealScreen: add email capture block below share button |
| `app/api/waitlist/route.ts` | Verify it accepts optional metadata fields (fireTarget, city) |
