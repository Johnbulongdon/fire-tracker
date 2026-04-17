# Current State — UntilFire
Last updated: 2026-04-17

## Active branch
`claude/fix-onboarding-sync-2RxvW` → PR #7 (draft)

## What was just done

### Infrastructure cleanup (infra audit pass)

Cleaned up technical debt from Vite→Next.js migration:

**Security / debug code removed:**
- Removed `console.log` + `window.supabaseClient` exposure from `lib/supabase.ts`
- Deleted `/debug` route (`app/debug/page.tsx`) — was live with no auth, showed env vars

**Dead files deleted:**
- `next.config.ts` (duplicate of `next.config.js`)
- `vite.config.ts`, `tsconfig.node.json`, `index.html` (Vite migration artifacts)
- `components/` folder (7 components referencing old `user_plans` table, none imported)

**Config fixes:**
- `tsconfig.json`: removed `./src/*` path alias (pointed to non-existent `src/` dir)
- `.gitignore`: added `build.log`
- `package.json`: renamed from `fire-tracker` → `untilfire`

**Dependencies removed:**
- `@supabase/auth-helpers-nextjs` (deprecated, replaced by `@supabase/ssr`)
- `@supabase/auth-ui-react` + `@supabase/auth-ui-shared` (unused — login page uses custom button)
- `resend` (unused — no email routes exist)

**Memory system improvements:**
- `CLAUDE.md`: added explicit note to ignore `docs/CONTEXT.md` (stale pre-`_untilfire/` file)
- `_untilfire/index/MEMORY.md`: indexed `docs/ROADMAP.md`, `docs/PRD.md`, `docs/USER_JOURNEY.md`
- `_untilfire/core/decisions.md`: merged all architecture decisions from `docs/DECISIONS.md`

### Previous: Onboarding → dashboard sync (3 bugs in app/dashboard/page.tsx)

1. `baselineFireTarget` / `adjustedFireTarget` were never saved to Supabase `_fire_profile`
2. Supabase hydrate never read `baselineFireTarget` back from `_fire_profile`
3. First useEffect didn't call `applyInputs(loadLocalInputs())`

Also fixed 3 pre-existing JSX syntax errors that blocked the Vercel build.

## Known state

- Vercel build: should be green (last working commit 25536d7; infra changes don't touch build output)
- Data sync loop: functional
- Auth: Google OAuth only, client-side session check on dashboard
- Repo infra: clean — no Vite artifacts, no dead components, no deprecated packages

## What's next (not started)

- Nothing assigned — waiting for next task
