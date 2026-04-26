# Sprint 03 — FIRE Score Hero

**Date:** 2026-04-10  
**Status:** ✅ Shipped  
**Module:** FIRE Dashboard → v1.2  
**Branch:** `claude/setup-gstack-locally-E87N1`

## Problem

The dashboard Overview showed the FIRE date as one of four equal KPI cards ("FIRE Date", "Net Worth", "FIRE Target", "Savings Rate"). The most important number — when you retire — was visually buried. Users opening the dashboard had no immediate emotional anchor.

## User story

As a logged-in user, when I open the dashboard I want the first thing I see to be my retirement year and how far away it is — so I immediately know where I stand and feel motivated to engage.

## Done when

- [x] Retirement year (e.g. "2041") displayed in large orange type as the dominant dashboard element
- [x] Year countdown ("15 years away") shown beneath the year
- [x] FIRE target displayed as secondary context ("target $1.2M")
- [x] Net worth + savings rate shown as compact right-side stats (not full KPI cards)
- [x] Progress bar lives inside the hero card with 3-point label (saved / % complete / target)
- [x] "Set your inputs" state shown gracefully when income/expenses not yet entered
- [x] `npm run build` passes clean

## Out of scope

- Animated counter for the retirement year
- City name in the hero (not persisted on dashboard yet — Sprint 04)
- Mobile layout (Sprint 08)

## Files changed

| File | Change |
|---|---|
| `app/dashboard/page.tsx` | MODIFY — DashTab component: replaced KPI grid + standalone progress bar with hero section |
