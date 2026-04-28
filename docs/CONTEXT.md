# UntilFire — AI Context File
> Paste this file at the start of any AI conversation to get it fully up to speed.  
> Last updated: March 2026

---

## What is UntilFire?

UntilFire is a **personal FIRE adviser** — an app that meets you where you are, understands your actual financial situation, and tells you what to do next to retire earlier. Not just a number. Not a spreadsheet. A product that grows with you from "I just heard about FIRE" to "I know exactly what to do this month."

The market is split between tools that are too simple to trust (FIRECalc, generic calculators) and tools that are too complex to give you clear next steps (ProjectionLab, Boldin). UntilFire sits in the gap: credible enough to take seriously, clear enough to act on.

It is free to use with no login required for the core calculator. A paid tier ($9/mo) unlocks a personalised FIRE adviser — regular guidance based on your actual spending and progress, not generic tips.

**One-line pitch:** The FIRE adviser that tells you what to do next, not just what your number is.

**Live at:** https://untilfire.com  
**X/Twitter:** @GetUntilFire  
**GitHub:** github.com/Johnbulongdon/UntilFire (private)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Auth + Database | Supabase |
| Styling | Tailwind CSS v4 |
| Charts | Recharts |
| Email | Resend |
| Hosting | Vercel |
| Analytics | Vercel Analytics |

---

## Repo Structure

```
/app
  page.tsx              ← Main landing + calculator wizard (5 screens)
  layout.tsx            ← Root layout
  globals.css           ← Global styles
  dashboard/page.tsx    ← Logged-in dashboard (expense tracking)
  expenses/page.tsx     ← Expense log
  login/page.tsx        ← Auth page
  api/waitlist/route.ts ← Waitlist email signup API
  auth/callback/page.tsx← Supabase OAuth callback

/components
  CalculatorForm.tsx    ← (legacy, replaced by page.tsx wizard)
  ProjectionChart.tsx   ← Recharts projection chart
  LogStashForm.tsx      ← Expense logging form
  PlanList.tsx          ← FIRE plan list
  ProgressCircle.tsx    ← Progress ring component

/lib
  fire-data.ts          ← 263 cities, tax rates, FIRE calc logic
  supabase.ts           ← Supabase client

/docs                   ← YOU ARE HERE
```

---

## Current State (March 2026)

### What's built and live
- **5-screen calculator wizard**: Hero → City → Income → Savings → FIRE Reveal
- **263 cities** worldwide with search-as-you-type dropdown
- **Custom city fallback**: users can enter monthly expenses manually if city not found
- **Tax calculation**: US federal brackets (2025), FICA, all 50 state rates, international flat rates
- **FIRE reveal**: cinematic slam animation, count-up, glow effect, delta cards
- **Dashboard**: expense tracking, projection chart (requires login)
- **Waitlist**: collecting emails for AI roadmap feature
- **SEO**: robots.ts, sitemap.ts configured

### What is NOT built yet
- AI roadmap feature (waitlisted, planned at $9/mo)
- Stripe / payment integration
- Mobile app (web only)
- Social sharing card (share my FIRE number)
- City-specific SEO landing pages
- Email onboarding sequence

---

## Key Files to Know

| File | Purpose |
|---|---|
| `app/page.tsx` | Entire landing page + calculator wizard. All 5 screens, all CSS, all logic in one file. |
| `lib/fire-data.ts` | CITIES array (263 entries), STATE_TAX object, `calcTakeHome()`, `calcFIRE()` functions |
| `app/dashboard/page.tsx` | Logged-in user dashboard with charts and expense tracking |
| `app/api/waitlist/route.ts` | POST endpoint for waitlist signups |

---

## Business Model

| Tier | Price | Access |
|---|---|---|
| Free | $0 | Full FIRE calculator, no login required — city, income, savings → FIRE number + retirement date |
| Pro | $9/mo | Personal FIRE adviser: monthly action plan, budget tracker, real-time FIRE date, personalised next steps |

---

## Key Product Decisions

- **No login wall** on the calculator — friction-free discovery is the growth strategy
- **Search-as-you-type** city search (not country → state → city cascade)
- **25× rule** with 7% real annual return assumption
- **Custom city fallback** — user enters monthly expenses in USD if their city isn't listed
- **Syne + DM Sans + DM Mono** font stack; dark theme (#08080e background, #f97316 orange accent, #22d3a5 teal)
- Wizard state lives in `app/page.tsx` only — not in URL params or global state

---

## Repo Workflow Rule

- **Canonical baseline:** latest pushed GitHub `origin/main`
- **Local unpushed changes:** preserve them, but do not treat them as baseline by default
- **Live Vercel:** verification target for UI work, not the primary implementation baseline unless explicitly requested
- **Deployment/build IDs:** treat identifiers such as `6Tb7dySgE` as deployment references unless confirmed to be git revisions

---

## Links to Other Docs

- [PRD.md](./PRD.md) — full product requirements
- [MARKET.md](./MARKET.md) — market research, TAM, competitor analysis
- [PERSONAS.md](./PERSONAS.md) — user and buyer personas
- [USER_JOURNEY.md](./USER_JOURNEY.md) — full user journey map
- [ROADMAP.md](./ROADMAP.md) — phased roadmap
- [DECISIONS.md](./DECISIONS.md) — architecture and product decision log
