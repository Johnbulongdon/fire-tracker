# Technical Context

## Architecture

```
┌──────────────────────────────────────────────┐
│               Interface Layer                 │
│  Renders SystemOutput. Zero financial logic.  │
└──────────────────┬───────────────────────────┘
                   │  reads SystemOutput + DerivedState
┌──────────────────▼───────────────────────────┐
│               State Engine                    │
│  Pure function. EntitySet → DerivedState      │
│  + SystemOutput. All calculations here only.  │
└──────────┬───────────────────────────────────┘
           │  reads
┌──────────▼───────────────────────────────────┐
│               Entity Store                    │
│  Single source of truth. Persisted.           │
│  localStorage (anon) / Supabase (auth'd).     │
└──────────────────────────────────────────────┘
```

**Rule**: Financial logic lives only in the state engine. The interface layer never computes. The entity store never derives.

---

## Layer Definitions

### Entity Store — Source of Truth

Persists `EntitySet` and `UserProfile`. Contains no logic.

- Anonymous users: `localStorage` via `lib/local-inputs.ts`
- Authenticated users: Supabase (PostgreSQL with RLS)
- On login: localStorage data syncs to Supabase (does not overwrite existing backend data)

The entity store exposes raw data only. All meaning is produced by the state engine.

### State Engine — Core Logic Layer

A set of pure functions. Defined in full in `context/state-engine.md`.

**Properties**:
- Deterministic — same inputs produce same outputs, always
- Stateless — reads entities, produces derived state, no side effects
- Synchronous — evaluates instantly on every entity change
- Testable — pure functions, no UI or external service dependencies

**Sole owner of**:
- All financial formulas (FIRE number, savings rate, net worth, years to FIRE)
- Financial stage classification
- Risk flag evaluation
- Module activation decisions
- Action ranking

**Target file**: `lib/state-engine.ts`

### Interface Layer — Rendering Only

All Next.js pages, React components, and the dashboard are the interface layer. They render `DerivedState` and `SystemOutput`. They contain zero financial logic.

**Interface does**:
- Render `DerivedState` values (fireProgress, savingsRate, netWorth, etc.)
- Render `activeModules[]` as UI sections in priority order
- Render `actions[]` as user-facing cards
- Accept entity input and write to entity store
- Re-render on state change

**Interface does NOT**:
- Calculate any financial metric
- Decide which modules to display
- Contain FIRE formulas
- Hardcode financial rules or thresholds

The dashboard is a window into `SystemOutput`, not a product in itself.

---

## Data Flow

```
1.  User creates/updates/deletes entity
2.  Entity store updated
3.  State engine triggered with full EntitySet + UserProfile
4.  Cash flow computed
5.  Balance sheet computed
6.  FIRE metrics computed
7.  Module collections computed (debtsByPriority, emergencyFundMonths, expensesByCategory)
8.  Financial stage determined
9.  Risk flags evaluated
10. Module activation evaluated → activeModules[] set
11. Active modules produce candidate Action[]
12. Actions ranked and top 5 placed in SystemOutput
13. Health score computed
14. Interface re-renders with new DerivedState + SystemOutput
```

Steps 3–13 are all within the state engine. The interface handles only steps 1–2 (write) and 14 (render).

---

## Technology Stack

| Component | Technology | Role |
|---|---|---|
| Framework | Next.js 15 (App Router) | Routing, SSR, API routes |
| UI | React 19 | Interface layer rendering |
| Styling | Tailwind CSS 4 | Design system |
| Auth | Supabase Auth | Google OAuth, session management |
| Database | Supabase (PostgreSQL) | Entity persistence for authenticated users |
| Charts | Recharts | Data visualisation in interface layer |
| Analytics | PostHog, Vercel Analytics, GA4 | Usage tracking |
| Language | TypeScript | Type safety enforced across all layers |

---

## Key Files

| File | Layer | Purpose |
|---|---|---|
| `lib/local-inputs.ts` | Entity Store | Persistence, entity shape (transitional) |
| `lib/fire-data.ts` | State Engine | FIRE data: cities, tax rates, COL |
| `lib/fire-scenarios.ts` | State Engine | FIRE projection algorithm (transitional) |
| `lib/state-engine.ts` | State Engine | Target file for canonical state engine |
| `app/dashboard/page.tsx` | Interface | Dashboard rendering |
| `app/page.tsx` | Interface + Input | Home page with calculator input |
| `components/EnhancedFIRECalculator.tsx` | Interface | FIRE projection chart |
| `lib/auth-context.tsx` | Infrastructure | Auth state provider |

---

## Development Rules

1. **All financial logic belongs in the state engine** — not in React components, not in API routes.
2. **Components are presentational** — they receive `DerivedState` / `SystemOutput` and render. They do not calculate.
3. **`DerivedState` is never persisted** — only `EntitySet` and `UserProfile` are stored.
4. **Entity schema is the contract** — changes to entity types require updating the state engine, all modules, and persistence layer.
5. **Adding a module** requires only: activation condition + `DerivedState` reads + `Action[]` output + interface component. No other files change.
