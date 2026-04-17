# UntilFire — Product Definition

## What it is

A **FIRE OS** — not a calculator, not a tracker.
It models your path to Financial Independence / Retire Early as a continuous operating loop.

## The system loop

```
onboarding → state → dashboard → projection → feedback
```

Every feature must fit somewhere in this loop. If it doesn't, it doesn't ship.

## Data model (single source of truth)

Two localStorage keys + one Supabase table:

### `fire_user_data` (key: `fire_user_data`)
Type: `FireUserState`
Purpose: gates onboarding completion, fast-checks `hasCompletedOnboarding`
Fields: `{ mode, income, expenses (flat number), savings, fireNumber, hasCompletedOnboarding, age, goal, portfolio }`

### `untilfire_inputs` (key: `untilfire_inputs`)
Type: `UntilFireInputs`
Purpose: full financial state for dashboard hydration
Fields: `{ income, expenses (breakdown), fireAge, k401, rothIRA, taxable, totalDebt, mortgageBalance, mortgageMonthly, growthRate, withdrawalRate, baselineFireTarget, adjustedFireTarget, savings, city }`

### Supabase: `user_budget` table
Purpose: cross-session persistence after login
Key columns: `user_id, income, expenses (JSONB), fire_age, fire_assets`
FIRE targets stored inside: `expenses._fire_profile.baselineFireTarget`

## Data flow

```
Onboarding (app/page.tsx)
  → writes fire_user_data (hasCompletedOnboarding: true)
  → writes untilfire_inputs (full breakdown)
  → router.push("/dashboard")

Dashboard (app/dashboard/page.tsx) on mount:
  1. resolveFireUserState() from fire_user_data — gate check
  2. applyInputs(loadLocalInputs()) — fast hydrate from untilfire_inputs
  3. Supabase fetch — if row exists, applyInputs(backendInputs) overwrites
  4. isLoaded = true → save useEffect starts watching state changes
  5. On any state change → debounced upsert to Supabase (including baselineFireTarget)
```

## Onboarding modes

- **Starter** (3-step wizard): city → income range → savings → reveal screen
- **Advanced** (full form): direct numeric inputs
- Both save `hasCompletedOnboarding: true` to `fire_user_data` on completion

## Dashboard tabs

- **Overview** — KPIs, FIRE progress bar, snapshot chart
- **Budget** — income/expense inputs
- **FIRE Calculator** — portfolio inputs, projection chart
- **Expenses** — transaction log

## Auth

- Google OAuth via Supabase
- After SIGNED_IN event → check `hasCompletedOnboarding` → redirect to `/dashboard`
- Dashboard requires active Supabase session; redirects to `/login` if none

## Constraints

- No UI redesign without explicit request
- All FIRE projections use 4% withdrawal rule, 7% growth rate as defaults
- `baselineFireTarget` = from onboarding; `adjustedFireTarget` = user override on dashboard
