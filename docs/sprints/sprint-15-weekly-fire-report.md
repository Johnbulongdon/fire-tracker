# Sprint 15 — Weekly FIRE Progress Email

**Date:** —  
**Status:** 🔲 Planned  
**Module:** FIRE Dashboard  
**Destination:** Every Monday, active users receive a "Your FIRE score this week" email showing progress, net worth delta, and one insight — creating a weekly reason to open the app.

## Problem

UntilFire has no recurring touchpoint. Users who set up their dashboard and then forget about it have no pull to return. A weekly digest creates a habit loop — users check their progress email, click through to the dashboard, and update their numbers.

## User story

As an active user, I want a weekly summary of my FIRE progress in my inbox — so I stay connected to my goal even during busy weeks when I don't open the app.

## Done when

- [ ] Vercel Cron job configured to run every Monday at 8am UTC
- [ ] Cron route: `GET /api/cron/weekly-report` — fetches active users (logged in within 30 days) from Supabase
- [ ] For each user: compute progress %, net worth (from stored profile data), and select one insight
- [ ] Email content:
  - Subject: *"Your FIRE score this week — [X]% complete"*
  - Body: progress bar (HTML), net worth vs last week, one actionable insight, CTA to dashboard
  - Plain HTML, UntilFire design tokens
- [ ] Only sends to users who have income + expenses set (not blank dashboards)
- [ ] Cron route is authenticated (Vercel cron secret in Authorization header)
- [ ] Manual trigger works via `curl` for testing
- [ ] `npm run build` passes clean

## Out of scope

- Per-user send time personalisation
- Click tracking
- Unsubscribe preference (add in a later sprint)

## Files

| File | Change |
|---|---|
| `app/api/cron/weekly-report/route.ts` | CREATE — fetches users, computes progress, sends emails |
| `vercel.json` | ADD cron config: `{"path": "/api/cron/weekly-report", "schedule": "0 8 * * 1"}` |
| `lib/email-templates.ts` | ADD weekly report template |
