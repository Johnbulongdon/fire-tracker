# Claude Agent Rules — UntilFire FIRE OS

## System Context

UntilFire is a state-driven FIRE Operating System. Before building any feature, Claude must reason about where it fits in the system architecture. Features that do not fit the architecture are rejected.

Architecture layers (in order of authority):
1. **Entity Store** — raw financial facts, source of truth
2. **State Engine** — all calculations, all derived state
3. **Modules** — read derived state, produce actions
4. **Interface Layer** — renders state engine outputs only

---

## System Thinking Rule

Before building anything, answer these four questions:

### 1. What entities does this affect?

Identify which entity types are involved:
- `IncomeStream` — income sources
- `Expense` — living costs
- `Asset` — owned value
- `Liability` — debts

If the feature requires a financial fact that is not captured in an existing entity, define the new field or entity first.

### 2. How does state change?

Identify which `DerivedState` fields are affected:
- Cash flow fields (`monthlySavings`, `savingsRate`, etc.)
- Balance sheet fields (`netWorth`, `investableAssets`, etc.)
- FIRE metrics (`fireNumber`, `fireProgress`, `yearsToFIRE`, etc.)
- Pre-computed collections (`debtsByPriority`, `emergencyFundMonths`, `expensesByCategory`)
- Classifications (`financialStage`, `riskFlags`)

If the feature requires a new derived value, add it to the state engine — not to a component or module.

### 3. What modules activate?

Identify which modules become active or inactive as a result of the state change:
- `debt` — activates when `totalDebt > 0`
- `savings` — activates when `savingsRate < 0.20` or `no_emergency_fund`
- `fire_progress` — activates at `accumulation` stage and above
- `budgeting` — activates when `negative_cash_flow`, `low_savings_rate`, or no expenses

If the feature requires a new module, define: activation condition + DerivedState reads + Action[] output.

### 4. What action is produced?

Define what the user should do as a result of this state. Actions must be:
- Specific (not generic advice)
- Quantified where possible (dollar amounts, timelines)
- Sourced from `DerivedState` values (no hardcoded numbers)
- Ranked by the state engine (not by the interface)

---

## Reject Conditions

Reject or escalate any request that:

- Puts financial calculation logic in a React component or API route
- Stores `DerivedState` in the database (only `EntitySet` is persisted)
- Adds a UI element that reads directly from entities (must go through state engine)
- Creates a module that computes financial values (modules only read derived state)
- Introduces a new financial concept without defining the entity or state engine formula
- Duplicates a formula that already exists in the state engine
- Adds a hardcoded threshold or benchmark in the interface layer

---

## Where Things Belong

| What | Where |
|---|---|
| New financial fact (e.g., "employer match rate") | New field on an entity |
| New calculation (e.g., "effective tax rate") | State engine — new `DerivedState` field |
| New risk condition (e.g., "over-leveraged") | State engine — new `RiskFlag` |
| New guidance domain (e.g., "tax optimisation") | New module with activation condition |
| Displaying a number to the user | Interface layer — reads from `DerivedState` |
| Deciding what to show the user | State engine — sets `activeModules[]` |

---

## Canonical References

When definitions conflict, these files are authoritative in this order:

1. `context/data-model.md` — entity schemas, DerivedState, SystemOutput
2. `context/state-engine.md` — all formulas and rules
3. `context/modules.md` — module contracts
4. `context/entities.md` — entity field documentation
5. `context/technical.md` — architecture layer rules
6. `vision/flows.md` — system flow description

If two files conflict, the higher-ranked file wins. Fix the lower-ranked file to match.

---

## Terminology

Use these terms consistently across all files and code:

| Term | Meaning |
|---|---|
| `operatingExpenses` | Living costs only — no debt payments |
| `debtServicePayments` | Sum of liability `actualPayment` fields |
| `totalMonthlyOutflow` | `operatingExpenses + debtServicePayments` |
| `fireNumber` | `operatingExpenses × 12 × 25` |
| `investableAssets` | Assets where `isInvestable = true` |
| `DerivedState` | Computed output of state engine — never stored |
| `EntitySet` | Raw financial entities — the only persisted input |
| `activeModules` | Set by state engine — not by UI or user preference |
