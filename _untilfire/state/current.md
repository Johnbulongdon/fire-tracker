# Current State — UntilFire
Last updated: 2026-04-21

## Active branch
`claude/fix-onboarding-sync-2RxvW` → PR #8 (draft)

## What was just done

### Settings tab + display currency + onboarding currency step + flag fix

**Settings tab (dashboard):**
- New "Settings" tab in dashboard nav (Profile, Preferences, Account sections)
- `lib/preferences.ts` created: `untilfire_prefs` localStorage key with `preferredCurrency` + `defaultCurrency` fields
- `app/api/exchange-rates/route.ts`: server-side proxy for live exchange rates (6h in-memory cache)
- `app/api/delete-account/route.ts`: DELETE endpoint — wipes `expenses` + `user_budget`, client signs out

**Display currency (Expenses tab):**
- When `preferredCurrency` is set in Settings, expense totals in `MonthlySummary` and `ExpenseList` month headers convert and show as `≈ $X.XX USD`
- Falls back to per-currency breakdown if unset

**Onboarding currency step:**
- New `CurrencyScreen` step: hero → advanced form → **currency picker** → dashboard
- 4-column grid of 20 flag boxes; selected currency saved as `defaultCurrency` in prefs
- Nav dots: 3 total
- Screen type union: `"hero" | "advanced" | "currency"`

**Flag emoji fix:**
- Root cause: Unicode regional indicator flag emoji (🇺🇸) don't render on Windows in any DOM element
- Fix: `FlagEmoji` component loads Twemoji SVG images from jsDelivr CDN (`jdecked/twemoji@15.1.0`)
  - Defined inline in both `app/dashboard/page.tsx` and `app/page.tsx`
  - `CurrencySelect` uses `<FlagEmoji>` for both the trigger button and grid
  - `CurrencyScreen` uses `<FlagEmoji>` for each currency box
  - Settings tab `<select>` replaced with `<CurrencySelect allowEmpty>` (includes "Show each separately" row)
- `AddExpenseForm` currency defaults to `loadPrefs().defaultCurrency` (not hardcoded USD)

## Key architectural notes

- `lib/preferences.ts`: `untilfire_prefs` key — `{ preferredCurrency: "", defaultCurrency: "USD" }`
- `FlagEmoji` URL formula: `[...emoji].map(c => c.codePointAt(0).toString(16)).join("-")` → Twemoji SVG
- `CurrencySelect`: accepts `allowEmpty` prop for Settings tab (shows "—" empty option row)

## Known state

- Vercel build: should be green
- Data sync loop: functional
- Auth: Google OAuth only, client-side session check on dashboard
- Repo infra: clean — no Vite artifacts, no dead components, no deprecated packages
- Pre-existing TS error in `app/page.tsx:1419` (AdvancedPathScreen income state `number | ""`): not introduced by us, not blocking build (`ignoreBuildErrors: true`)

## What's next (not started)

- Nothing assigned — waiting for next task

---

## Previous: Infrastructure cleanup (infra audit pass)

Cleaned up technical debt from Vite→Next.js migration:

- Removed `console.log` + `window.supabaseClient` from `lib/supabase.ts`
- Deleted `/debug` route, `next.config.ts`, Vite artifacts, `components/` folder (dead code)
- Removed deprecated packages: `@supabase/auth-helpers-nextjs`, `@supabase/auth-ui-react`, `resend`
- Config fixes: `tsconfig.json`, `.gitignore`, `package.json` rename

## Previous: Onboarding → dashboard sync

1. `baselineFireTarget` / `adjustedFireTarget` never saved to Supabase `_fire_profile`
2. Supabase hydrate never read `baselineFireTarget` back
3. First useEffect didn't call `applyInputs(loadLocalInputs())`
