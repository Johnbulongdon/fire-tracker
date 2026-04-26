# Sprint 08 — Mobile Responsive Pass

**Date:** —  
**Status:** 🔲 Planned  
**Module:** Landing & Wizard → v1.3 · FIRE Dashboard → v1.6  
**Destination:** The full calculator flow and dashboard are usable on a 375px screen without horizontal scrolling, broken layouts, or illegible text.

## Problem

The calculator and dashboard were built desktop-first with fixed grid columns and large font sizes. On mobile (where a significant share of first-time visitors land from social shares), the layout breaks or requires horizontal scrolling.

## User story

As someone who clicked a shared FIRE link on my phone, I want the calculator to work properly — so I don't immediately bounce and never come back.

## Done when

- [ ] Landing page wizard: inputs are full-width, font sizes scale down gracefully on 375px viewport
- [ ] Dashboard KPI area: hero stats stack vertically on mobile (no horizontal overflow)
- [ ] Dashboard chart row: stacks to single column on mobile
- [ ] `/calculators` hub grid: already uses `auto-fill minmax(280px)` — verify on mobile
- [ ] Each calculator page: input grids drop from 2-col to 1-col on mobile
- [ ] No horizontal scroll on any page at 375px viewport width
- [ ] `<meta name="viewport" content="width=device-width, initial-scale=1">` confirmed present
- [ ] `npm run build` passes clean

## Out of scope

- Native app or PWA features
- Touch-specific interactions
- Tablet-specific layouts (375–768px breakpoint is the priority)

## Approach

Use inline `@media` queries via `style` attributes where possible. For complex cases, add utility classes to `globals.css`. No new CSS framework — keep the existing inline style pattern.

## Files

| File | Change |
|---|---|
| `app/page.tsx` | Responsive wizard inputs + font scaling |
| `app/dashboard/page.tsx` | Responsive hero, chart grid, KPI layout |
| `app/calculators/*/[Name]Calculator.tsx` | Input grid: 2-col → 1-col on mobile |
| `app/layout.tsx` | Confirm viewport meta tag present |
