# Sprint 06 — Milestone Moments

**Date:** —  
**Status:** 🔲 Planned  
**Module:** FIRE Dashboard → v1.4  
**Destination:** When a user's portfolio crosses 10%, 25%, 50%, or 75% of their FIRE number, they see a celebratory toast — once, not repeatedly.

## Problem

The dashboard is informative but passive. Users see their progress percentage but nothing acknowledges when they cross a meaningful threshold. There are no emotional highs — no moment that makes the user want to tell someone or come back tomorrow.

## User story

As a user who just hit 25% of my FIRE number, I want the app to acknowledge it — so I feel the progress is real and worth sharing.

## Done when

- [ ] On dashboard load, `progress` is checked against thresholds: 10, 25, 50, 75
- [ ] If a threshold is newly crossed (not previously celebrated): toast fires via `react-hot-toast`
- [ ] Toast copy per milestone:
  - 10%: *"You've saved your first 10% of your FIRE number. The journey has started."*
  - 25%: *"25% there. Compound growth is starting to work for you."*
  - 50%: *"Halfway to FIRE. Most people never get here."*
  - 75%: *"75% of the way. The finish line is visible."*
- [ ] Milestones already seen are stored in `localStorage` key `uf_milestones_seen` (array of thresholds)
- [ ] Toast does not fire on every page load — only once per milestone, ever
- [ ] `react-hot-toast` already installed — no new dependencies
- [ ] `npm run build` passes clean

## Out of scope

- Server-side milestone persistence (localStorage is sufficient for now)
- Confetti animation (toast is enough for v1)
- 100% milestone (save for a dedicated FIRE achieved screen — future sprint)

## Files

| File | Change |
|---|---|
| `app/dashboard/page.tsx` | Add milestone check in useEffect after progress is computed |
