# Sprint 16 — SEO & Performance Audit

**Date:** —  
**Status:** 🔲 Planned  
**Module:** Calculators · Landing & Wizard  
**Destination:** All calculator and landing pages are indexed by Google, passing Core Web Vitals, and internally linked — so organic search traffic actually materialises.

## Problem

Building SEO-optimised pages only works if Google can find and index them. Without a sitemap submission, internal links, and passing Core Web Vitals, the calculator pages may rank poorly or not at all. This sprint closes the gap between "built for SEO" and "actually getting SEO traffic."

## User story

As the product owner, I want to confirm every calculator page is indexed and performing well — so the SEO investment from Sprint 02 pays off in organic traffic.

## Done when

- [ ] `https://untilfire.com/sitemap.xml` submitted to Google Search Console
- [ ] All 8 calculator/hub URLs confirmed present in GSC "URL Inspection" (or queued for indexing)
- [ ] Each calculator page links to at least 2 other related calculators (internal links)
- [ ] Landing page links to `/calculators` in nav (Sprint 09 — confirm done first)
- [ ] `app/robots.ts` created/verified: allows `/calculators/*`, disallows `/api/*`, `/auth/*`
- [ ] Core Web Vitals check on Vercel Analytics: LCP < 2.5s, CLS < 0.1, FID < 100ms
- [ ] No pages with duplicate `<title>` tags (audit with GSC)
- [ ] `npm run build` passes clean (final clean build before considering SEO complete)

## Out of scope

- Link building / outreach
- Schema.org FAQ markup (can add later per calculator)
- Page speed optimisation beyond what Vercel already provides

## Checklist (run in order)

1. Run `npm run build` — confirm all calculator pages are `○ Static`
2. Open GSC → Sitemaps → Submit `https://untilfire.com/sitemap.xml`
3. GSC → URL Inspection → test each `/calculators/*` URL
4. Add internal cross-links between calculators where missing
5. Check `robots.ts` / `robots.txt`
6. Check Vercel Analytics for CWV data

## Files

| File | Change |
|---|---|
| `app/robots.ts` | VERIFY or CREATE — correct allow/disallow rules |
| `app/calculators/*/[Name]Calculator.tsx` | ADD 2 "related calculators" links per page if missing |
