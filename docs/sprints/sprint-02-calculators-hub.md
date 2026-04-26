# Sprint 02 — Calculators Hub

**Date:** 2026-04-10  
**Status:** ✅ Shipped  
**Module:** Calculators → v1.0, v1.1  
**Branch:** `claude/setup-gstack-locally-E87N1`

## Problem

UntilFire has one calculator (the FIRE wizard) but no SEO surface area beyond the landing page. People searching for "APY calculator" or "coast FIRE calculator" never find the product. A calculators hub creates indexable, keyword-targeted pages that bring in top-of-funnel traffic and establish UntilFire as a comprehensive FIRE toolkit.

## User story

As someone searching for a financial calculator, I want to find a well-designed tool that explains the concept and gives me a result — and naturally leads me to calculate my full FIRE date.

## Done when

- [x] `/calculators` hub page lists all calculators with card grid, SEO metadata, ItemList JSON-LD
- [x] `/calculators/apy` — APR→APY converter, compounding frequency selector, growth table
- [x] `/calculators/compound-interest` — projection with visual year-by-year bars
- [x] `/calculators/savings-rate` — SR calculator + FIRE timeline comparison table
- [x] `/calculators/coast-fire` — Coast FIRE number, progress bar, growth milestones
- [x] `/calculators/4-percent-rule` → renamed "FIRE Number Calculator" — rate comparison table + itemised budget mode
- [x] Each page: unique title, description, canonical URL, OG tags, Schema.org SoftwareApplication + breadcrumb
- [x] Sitemap updated with all 6 new URLs at priority 0.8–0.9
- [x] All routes show as `○ Static` in build output
- [x] `npm run build` passes clean

## Out of scope

- User accounts or saved calculations
- Charts (kept to CSS-only visual bars to avoid recharts bundle cost)
- More than 5 calculators in this sprint

## Files changed

| File | Change |
|---|---|
| `app/calculators/page.tsx` | CREATE — hub |
| `app/calculators/apy/page.tsx` + `APYCalculator.tsx` | CREATE |
| `app/calculators/compound-interest/page.tsx` + `CompoundInterestCalculator.tsx` | CREATE |
| `app/calculators/savings-rate/page.tsx` + `SavingsRateCalculator.tsx` | CREATE |
| `app/calculators/coast-fire/page.tsx` + `CoastFireCalculator.tsx` | CREATE |
| `app/calculators/4-percent-rule/page.tsx` + `FourPercentRuleCalculator.tsx` | CREATE |
| `app/sitemap.ts` | MODIFY — add 6 new URLs |
