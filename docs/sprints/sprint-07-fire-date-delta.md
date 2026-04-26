# Sprint 07 — FIRE Date Delta

**Date:** —  
**Status:** 🔲 Planned  
**Module:** FIRE Dashboard → v1.5  
**Destination:** When a user updates their budget or expenses, the hero shows how many months/days that change moved their retirement date — making every financial decision feel tangible.

## Problem

Users update their expenses but feel nothing. The FIRE date changes but there's no signal calling attention to it. The connection between "I cut my dining budget by $200" and "I retire 8 months sooner" is invisible. Without that connection, budget tracking feels like data entry, not progress.

## User story

As a user who just reduced my monthly expenses, I want to see how that change moved my FIRE date — so the decision feels meaningful and I'm motivated to keep optimising.

## Done when

- [ ] Previous `fireYear` stored in a `useRef` before recalculation
- [ ] After recalculation, if `fireYear` changed: compute delta in months (`(prev - new) * 12`)
- [ ] Show delta indicator inline in the hero beneath the retirement year:
  - Positive (sooner): `"↑ 8 months closer"` in teal
  - Negative (further): `"↓ 3 months further"` in red
- [ ] Delta fades in with a CSS transition (opacity 0 → 1)
- [ ] Delta resets to null on page refresh (session-scoped, not persisted)
- [ ] Delta only shows when the change is ≥ 1 month (no noise for tiny changes)
- [ ] `npm run build` passes clean

## Out of scope

- Tracking which specific budget change caused the delta
- Persisting delta history
- Showing delta on the Budget tab (hero only for now)

## Files

| File | Change |
|---|---|
| `app/dashboard/page.tsx` | DashTab: add prevFireYear ref, compute delta, render indicator in hero |
