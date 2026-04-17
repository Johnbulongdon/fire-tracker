# Current State — UntilFire
Last updated: 2026-04-17

## Active branch
`claude/fix-onboarding-sync-2RxvW` → PR #7 (draft)

## What was just fixed

### Onboarding → dashboard sync (3 bugs in app/dashboard/page.tsx)

1. `baselineFireTarget` / `adjustedFireTarget` were never saved to Supabase `_fire_profile` → FIRE target was lost after first login write
2. Supabase hydrate never read `baselineFireTarget` back from `_fire_profile` → even a correct DB row wouldn't restore it
3. First useEffect only set 4 fields manually; didn't call `applyInputs(loadLocalInputs())` → k401, rothIRA, taxable, expenses breakdown stayed at 0

Also fixed 3 pre-existing JSX syntax errors that blocked the Vercel build:
- Stray `)` inside FIRETab return
- `&& (` instead of `? (` in two ternary expressions
- Missing closing `}` for Dashboard function

## Known state

- Vercel build: should be green after last push (25536d7)
- Data sync loop: functional after fixes above
- Auth: Google OAuth only, client-side session check on dashboard

## What's next (not started)

- Nothing assigned — waiting for next task
