# UntilFire — Claude Instructions

## Session Start (required)

On every session start:
1. Read `_untilfire/index/MEMORY.md`
2. Always load: `_untilfire/state/current.md`
3. Load `_untilfire/core/product.md` if the task touches architecture, data flow, or onboarding
4. Load nothing else unless directly relevant to the task

Max 5 files loaded per session. Do not scan the whole `_untilfire/` folder.

## Project Identity

This is **UntilFire** — a FIRE OS (not a calculator, not a tracker).
The product loop is: onboarding → state → dashboard → projection → feedback.

## Stack

- Next.js 15 (App Router), React 19, TypeScript
- Supabase (auth + `user_budget` table for persistence)
- localStorage: two keys — `fire_user_data` (FireUserState) and `untilfire_inputs` (UntilFireInputs)
- Deployed on Vercel

## Key Files

| File | Role |
|---|---|
| `app/page.tsx` | Onboarding wizard (hero → city → income → savings → reveal) |
| `app/dashboard/page.tsx` | Dashboard (Overview / Budget / FIRE / Expenses tabs) |
| `lib/local-inputs.ts` | All types, localStorage read/write, state resolution |
| `lib/fire-data.ts` | City DB, tax calc, FIRE calc |
| `app/api/save-user-inputs/route.ts` | Supabase sync API |

## Write Rules

Update `_untilfire/state/current.md` when:
- a bug is fixed
- a feature ships
- priorities change

Write to `_untilfire/core/` only when the product definition itself changes.
Do NOT write logs, conversation summaries, or task notes unless explicitly asked.
