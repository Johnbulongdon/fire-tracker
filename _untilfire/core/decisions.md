# UntilFire — Key Decisions

## Why two localStorage keys instead of one

`fire_user_data` (FireUserState) is a lightweight gate — only carries the minimum needed to know if onboarding is complete and what the FIRE number is. It normalizes both starter (income range) and advanced (numeric) modes.

`untilfire_inputs` (UntilFireInputs) carries the full breakdown needed to hydrate the dashboard. Keeping them separate means the gate check is fast and doesn't depend on the full inputs being valid.

## Why baselineFireTarget lives in Supabase `expenses._fire_profile`

The `user_budget` table schema was designed early without a dedicated column for FIRE targets. Adding `_fire_profile` as a JSONB key inside `expenses` avoids a schema migration while keeping all FIRE-specific fields together. Backwards-compatible.

## Why dashboard uses applyInputs(loadLocalInputs()) before Supabase loads

On first login there's no Supabase row. Without the localStorage fast-hydrate, the dashboard would show all zeros until Supabase returns empty and isLoaded fires. The fast-hydrate gives immediate accurate state; Supabase then overwrites it if data exists.

## Why the save useEffect has a 1s debounce

Every dashboard input field change would otherwise trigger an immediate Supabase write. Debouncing at 1s batches rapid edits into a single upsert.

## Why middleware.ts is empty

No route protection at the middleware level — auth is enforced client-side in the dashboard useEffect (redirect to `/login` if no session). This was a deliberate simplicity choice; server-side protection can be added later.
