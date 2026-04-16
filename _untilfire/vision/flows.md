# FIRE OS Flows

## Overview

UntilFire is a continuous system, not a page flow. The four steps below run in sequence on every entity change. After initialization, the loop repeats for the life of the user's account.

```
Entities → State Evaluation → Module Activation → Action Generation
```

---

## Flow 1 — User Initialization (Input → Entities)

**Goal**: Populate `EntitySet` with enough data for the state engine to produce meaningful output.

**Entry paths**:
- **Calculator** (fast path) — form fields map directly to entity objects; submitting creates the same `IncomeStream`, `Expense`, `Asset`, and `Liability` records as manual entry
- **Manual entry** — guided entity wizard: income streams → expenses → assets → liabilities
- **Import** (future) — CSV or Plaid integration that maps to the entity schema

**Minimum viable entity set**:
```
≥ 1 IncomeStream
≥ 1 Expense OR a single aggregate monthly spend amount
≥ 1 Asset OR a current savings balance
```

**Outcome**: `EntitySet` is populated. `UserProfile` is set. System proceeds to State Evaluation.

**The calculator is an input method, not the product.** It does not have its own data model. Its fields are a UX convenience for creating entities quickly.

---

## Flow 2 — State Evaluation (Engine Runs)

**Trigger**: Any create, update, or delete of an entity or profile field.

**What the state engine computes** (in order):
1. Cash flow — `totalMonthlyIncome`, `operatingExpenses`, `debtServicePayments`, `totalMonthlyOutflow`, `monthlySavings`, `savingsRate`
2. Balance sheet — `totalAssets`, `investableAssets`, `totalDebt`, `netWorth`
3. FIRE metrics — `fireNumber`, `fireProgress`, `coastFireNumber`, `coastFireAchieved`, `yearsToFIRE`
4. Module collections — `debtsByPriority[]`, `emergencyFundMonths`, `expensesByCategory[]`
5. Financial stage classification
6. Risk flag evaluation

**Outcome**: Complete `DerivedState` is produced. No UI renders until this step completes.

**Performance**: Synchronous and instant. No async calls. No loading states.

---

## Flow 3 — Module Activation

**Trigger**: Runs immediately after State Evaluation.

**What happens**:
The state engine evaluates each module's activation condition against `DerivedState` and produces `activeModules[]` with priority order assigned.

Activation conditions and render priority are defined in `context/state-engine.md` and `context/modules.md`. They are not evaluated in the interface layer.

**Outcome**: `SystemOutput.activeModules[]` is set. The interface layer receives an ordered list of modules to render — nothing more.

---

## Flow 4 — Action Generation

**Trigger**: Runs immediately after Module Activation, before interface renders.

**What happens**:
1. Each active module reads `DerivedState` and produces candidate `Action[]`
2. State engine collects all candidate actions
3. Actions ranked: risk-flag-addressing first, then by priority, then by effort
4. Top 5 placed into `SystemOutput.actions[]`

**Action structure** (defined in `context/data-model.md`):
```
{ id, module, priority, title, description, impact, effort }
```

**Outcome**: `SystemOutput.actions[]` is current. Interface renders actions as the user's "what to do next."

---

## Continuous Loop

After initialization, every entity change re-runs the full sequence:

```
Entity change
  → State Evaluation  (engine recomputes DerivedState)
  → Module Activation (engine sets activeModules[])
  → Action Generation (modules produce Action[]; engine ranks)
  → Interface renders updated state + modules + actions
```

The system reflects the user's current reality at all times. Users return to update entities as their financial life changes — raises, paid-off debts, new accounts, life events.

---

## What This System Does NOT Do

- Produce a "your result" page and end — the OS produces continuous, evolving state
- Allow users to navigate directly to a module — modules appear because state demands them
- Store derived state — `DerivedState` is always recalculated from the current entity set
- Compute anything in the interface layer — the interface only renders `SystemOutput`
