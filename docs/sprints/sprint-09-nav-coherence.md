# Sprint 09 — Nav Coherence

**Date:** —  
**Status:** 🔲 Planned  
**Module:** Landing & Wizard · FIRE Dashboard · Calculators  
**Destination:** A user can navigate between the landing page, calculators, and dashboard without ever hitting a dead end or using the browser back button.

## Problem

The three main surfaces (landing, calculators, dashboard) are siloed. There's no link from the landing page to the calculators, no link from individual calculators to the dashboard, and no consistent nav chrome. Users who discover the product via a calculator have no obvious path to the core FIRE wizard.

## User story

As a user who found the APY calculator via Google, I want a clear path to the full FIRE calculator — so I don't have to manually type the URL or guess where to go.

## Done when

- [ ] Landing page nav: "Calculators" ghost link added (right side, alongside "Dashboard" for logged-in users)
- [ ] Each calculator page nav: "Dashboard" link shown when user is logged in (conditional on auth context)
- [ ] Dashboard nav: "Tools" or "Calculators" link added alongside the existing tabs
- [ ] `/calculators` hub nav: "Get FIRE Number →" CTA links to `/` (already present — confirm)
- [ ] No broken or dead-end nav paths across all tested routes
- [ ] `npm run build` passes clean

## Out of scope

- Mega-menu or dropdown navigation
- Active state highlighting on the landing page nav (dashboard already has this)

## Files

| File | Change |
|---|---|
| `app/page.tsx` | Landing nav: add "Calculators" link |
| `app/calculators/*/[Name]Calculator.tsx` | Nav: add conditional "Dashboard" link |
| `app/dashboard/page.tsx` | navTabs: add Calculators link |
