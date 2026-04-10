# Sprint 11 — Social Proof on Landing

**Date:** —  
**Status:** 🔲 Planned  
**Module:** Landing & Wizard → v1.4  
**Destination:** First-time visitors see a stats row and 2–3 testimonial cards before they start the calculator — reducing friction and building trust.

## Problem

The landing page goes straight into the calculator wizard with no social proof. New visitors from social shares or organic search have no signal that real people use this — or that it works. Trust is established too late (after they've already done the work).

## User story

As a first-time visitor, I want to see that other people have used this and found it useful — so I feel confident starting the calculator rather than bouncing.

## Done when

- [ ] Stats row added between the landing hero and the calculator start: `[263 cities] · [60 seconds] · [Free forever]` — matches OG card stats
- [ ] 2–3 testimonial cards added below the stats row — short, city-specific quotes:
  - *"Calculated my FIRE date in 60 seconds. I had no idea it was this close." — Austin, TX*
  - *"Finally understood why my savings rate matters more than my salary." — London, UK*
  - *"Used the Coast FIRE calculator and realised I'm closer than I thought." — Sydney, AU*
- [ ] Testimonials are static (no CMS) — update manually as real ones come in
- [ ] Stats row + testimonials are visible without scrolling on a 1280px viewport
- [ ] `npm run build` passes clean

## Out of scope

- Dynamic user count pulled from database
- Star ratings or review scores
- Testimonial carousel

## Files

| File | Change |
|---|---|
| `app/page.tsx` | LandingHero / LandingPage: add stats row + testimonial cards |
