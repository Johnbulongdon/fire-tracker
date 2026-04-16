# UntilFire — FIRE Operating System

## What UntilFire Is

UntilFire is a **state-driven FIRE Operating System** (FIRE OS).

It is not a calculator. It is not a dashboard. It is a continuous system that reads a user's financial reality, evaluates their state, and drives personalized actions toward financial independence.

The calculator is **only an input method** — one of several ways to load data into the system. The system's value lives in what happens after input.

---

## The Core Loop

```
Entities → State → Modules → Actions
```

1. **Entities** — The raw financial facts: income streams, expenses, assets, liabilities.
2. **State** — The system evaluates entities and derives the user's current financial position (savings rate, FIRE number, progress, risk flags).
3. **Modules** — State activates relevant modules (debt, savings, budgeting, FIRE progress). Only modules relevant to the user's state are active.
4. **Actions** — Each active module produces specific, prioritized actions the user should take next.

---

## Design Principles

### Entities Are the Only Source of Truth
All derived values, all module outputs, all actions — everything flows from entities. If it's not captured in an entity, it doesn't exist in the system.

### State Is Computed, Not Stored
State is always derived fresh from the current entity set. There is no "stale state." Every recalculation reflects the user's current reality.

### Modules Are Activated, Not Hardcoded
The UI does not decide what to show. State decides which modules are active. Modules decide what to render. The interface is a rendering layer only.

### Actions Are Contextual
Every action the system produces is generated from the user's specific state — not a generic checklist. A user with high-interest debt gets different actions than a user who is debt-free.

### Continuous, Not One-Time
UntilFire is designed for **ongoing use**, not a one-time calculation. Users return to update entities, track progress, and receive updated actions as their financial reality changes.

---

## What the Calculator Is NOT

The calculator is not the product.

It is an onboarding mechanism — a fast path for a new user to seed the system with initial entity data (income, expenses, savings, current assets). Once seeded, the FIRE OS takes over.

Treating the calculator as the core experience is an anti-pattern. It produces a static output. The OS produces continuous, evolving guidance.

---

## System Layers

| Layer | Role |
|---|---|
| Entities | Source of truth |
| State Engine | Derives all financial state |
| Modules | Domain-specific logic (debt, savings, FIRE, budget) |
| Interface | Renders module outputs and actions |
| Calculator | Input method only |

---

## Supported Financial Realities

The FIRE OS is designed to handle:

- **Multiple income types**: salary, freelance, business, passive income
- **Debt**: high-interest consumer debt, mortgages, student loans
- **Complex expense structures**: fixed vs. variable, essential vs. discretionary
- **Multiple assets**: investment accounts, real estate, business equity
- **Multiple FIRE targets**: standard, Coast FIRE, Barista FIRE

As entities grow in richness, the state engine produces more accurate outputs and the modules produce more targeted actions.

---

## Future Expansion

Because modules are state-activated, new financial domains can be added without redesigning the system. Add a new entity type, extend the state engine to derive new signals, and create a module that activates on those signals.

Examples of future modules:
- Tax optimization
- Real estate analysis
- Business owner track
- Geographic arbitrage (geo-FIRE)
- Social Security optimization
