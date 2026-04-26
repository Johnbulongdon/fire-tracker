# UntilFire — Claude Code Context

## What is this project?

UntilFire is a personal FIRE adviser web app. Free calculator (no login), paid AI adviser tier ($9/mo).
Live at untilfire.com. See `docs/CONTEXT.md` for full product context.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Auth + DB**: Supabase (Google OAuth)
- **Styling**: Tailwind CSS v4
- **Charts**: Recharts
- **Hosting**: Vercel

## Key Files

| File | Purpose |
|---|---|
| `app/page.tsx` | Landing page + full 5-screen calculator wizard |
| `lib/fire-data.ts` | 263 cities, tax logic, `calcFIRE()` |
| `app/dashboard/page.tsx` | Logged-in dashboard (expense tracking, charts) |
| `app/api/waitlist/route.ts` | Waitlist email signup endpoint |

## Current Phase

Phase 2 — Distribution & Monetisation (April–June 2026).
See `docs/ROADMAP.md` for full task list.

## gstack

gstack is installed globally at `~/.claude/skills/gstack` and available as slash commands.
Use these for structured development workflows:

- `/office-hours` — product interrogation before building
- `/plan-eng-review` — engineering review of a plan
- `/review` — staff engineer code review
- `/investigate` — deep codebase investigation
- `/ship` — PR creation workflow
- `/qa` — browser-based QA (requires Playwright, may not work in restricted envs)

## Dev Commands

```bash
npm run dev      # start dev server on localhost:3000
npm run build    # production build
npm run lint     # run ESLint
```

## gstack Design Doc Sync

After any `/office-hours`, `/plan-ceo-review`, or `/design-shotgun` session that produces
a design doc, always copy it into `docs/design/` and commit it to the current branch.

The source is `~/.gstack/projects/Johnbulongdon-UntilFire/`.
Use a short kebab-case filename that reflects the doc's topic (e.g. `distribution-demand-discovery.md`).
If a doc for the same topic already exists in `docs/design/`, overwrite it (it's a living document).

```bash
# Example sync command
cp ~/.gstack/projects/Johnbulongdon-UntilFire/<filename>.md docs/design/<topic>.md
git add docs/design/ && git commit -m "docs: sync gstack design doc — <topic>"
```

## Design Tokens

- Background: `#08080e`
- Accent orange: `#f97316`
- Accent teal: `#22d3a5`
- Fonts: Syne, DM Sans, DM Mono
