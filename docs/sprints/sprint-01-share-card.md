# Sprint 01 — City Discovery Share Card

**Date:** 2026-04-10  
**Status:** ✅ Shipped  
**Module:** Landing & Wizard → v1.1  
**Branch:** `claude/setup-gstack-locally-E87N1`

## Problem

The share modal asked users to share their personal FIRE number (a large dollar amount). This is financially exposing for the sharer and reads as a product ad to the receiver. Nobody clicks, nobody benefits.

## User story

As someone who just calculated my FIRE number, I want to share a discovery about my city — not my personal finances — so that my friends get something useful and I don't feel exposed.

## Done when

- [x] `/api/og` edge route renders a 1200×630 OG image: "Retire in [City] by [Year]" with orange accent
- [x] `/share?city=Austin&year=2041&years=15` renders a server page with correct OG/Twitter card metadata
- [x] ShareModal shows city + year + years away — no dollar amount visible
- [x] Share text is experiential: "Ran my FIRE numbers... mine came back Austin by 2041"
- [x] Pasting the share URL into Twitter Card Validator renders the custom card
- [x] `npm run build` passes clean

## Out of scope

- User-specific personalisation (no name, age, or income in the card)
- AB testing different card layouts
- Analytics on share clicks

## Files changed

| File | Change |
|---|---|
| `app/api/og/route.tsx` | CREATE — edge ImageResponse |
| `app/share/page.tsx` | CREATE — server component with generateMetadata |
| `app/page.tsx` | MODIFY — ShareModal: removed fireTarget/age, added years prop, new share URL/text |
