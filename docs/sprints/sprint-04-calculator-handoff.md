# Sprint 04 — Calculator → Dashboard Handoff

**Date:** —  
**Status:** 🔲 Planned  
**Module:** Landing & Wizard → v1.2 · FIRE Dashboard → v1.3  
**Destination:** A user who completes the anonymous calculator and signs up arrives at a dashboard that already knows their city, income, and expenses — no re-entry required.

## Problem

The calculator result is thrown away on sign-up. After seeing their FIRE number, clicking "Make this more accurate" sends users to a blank dashboard. The aha moment is lost, the dashboard feels cold, and users have to re-enter the same data they just provided.

## User story

As someone who just saw my FIRE number on the calculator, when I sign up I want the dashboard to already reflect my numbers — so the experience feels continuous and personalised from the first moment.

## Done when

- [ ] Clicking the primary CTA on RevealScreen saves inputs to `localStorage` key `uf_calc_prefill` (city, income, monthlyExpenses)
- [ ] On dashboard mount, if `uf_calc_prefill` exists: pre-populate income + expense state, then delete the key
- [ ] The FIRE Calculator tab shows a projection immediately without manual entry
- [ ] If user is already logged in and has saved data: prefill is ignored (Supabase data wins)
- [ ] If user navigates away without signing up: no side effects from the localStorage write
- [ ] `npm run build` passes clean

## Out of scope

- Persisting city selection to Supabase (city is local-only for now)
- Prefilling the account snapshot fields (401k, Roth, etc.)

## Files

| File | Change |
|---|---|
| `app/page.tsx` | RevealScreen primary CTA: add `localStorage.setItem('uf_calc_prefill', ...)` before navigation |
| `app/dashboard/page.tsx` | Mount useEffect: read + apply + clear `uf_calc_prefill` |
