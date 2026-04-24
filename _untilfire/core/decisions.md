# UntilFire — Key Decisions
Last updated: 2026-04-17

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

## Why no login wall on the calculator

Users complete the full 5-screen wizard and see their FIRE number without an account. The FIRE number is the hook — gating it destroys the viral loop. ProjectionLab's conversion model: show value first, then ask for login.

## Why city search is a single text input (not country → state → city cascade)

Search-as-you-type filtering 263 cities is familiar (Google, Airbnb) and works globally — cascades break on international cities with no "state" concept. Custom city fallback handles the long tail.

## Why custom city fallback uses monthly expenses in USD

Monthly spend is the most intuitive unit ("I spend about $2,500/month"). Annual figures feel abstract. For international users, USD is the FIRE community lingua franca. Trade-off: defaults to no state income tax.

## Why city data is hardcoded in lib/fire-data.ts, not a database

263 cities is manageable as a static file. Zero DB query latency, TypeScript typing catches errors at build time, no admin UI needed, COL data changes rarely (quarterly manual updates are fine).

## Why the onboarding wizard state lives in app/page.tsx (not URL params)

Simplicity — no routing complexity for a 5-screen flow. No need for deep linking into wizard steps. URL params would expose financial data in browser history. Trade-off: back button doesn't work within wizard (mitigated by Back button on each screen).

## Why Supabase for auth + database

Row Level Security out of the box, `@supabase/ssr` integrates cleanly with Next.js App Router, generous free tier, open source (can self-host later).

## Why Vercel for hosting

Zero-config Next.js deployment, preview deployments for every PR, edge network, Vercel Analytics already integrated. Constraint: Hobby plan requires all commits to use the `Johnbulongdon` GitHub identity.
