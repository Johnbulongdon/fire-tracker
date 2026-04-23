# Modules System

## Rule: Modules Only Read Derived State

Modules do not compute financial values. All calculations happen in the state engine before modules run. Modules read pre-computed `DerivedState` fields and produce `Action[]` descriptions.

Modules are activated by the state engine, not by user navigation or UI decisions.

---

## Module Contract

Every module:
1. Has an **activation condition** evaluated by the state engine
2. Reads **only from `DerivedState`** — never from entities directly
3. Produces **`Action[]`** as output
4. Has **no internal calculations** — all values it needs are in `DerivedState`

---

## `debt`

**Purpose**: Surface the optimal debt elimination path to free cash flow and reduce financial drag on FIRE progress.

**Activation condition** (evaluated by state engine):
```
totalDebt > 0
```

**Reads from DerivedState**:
- `debtsByPriority[]` — pre-sorted by interest rate, payoff timelines already computed
- `totalDebt`
- `monthlySavings`
- `riskFlags` — specifically `high_interest_debt`

**Output — example actions**:
- `critical` if `high_interest_debt`: "Pay off [debtsByPriority[0].name] ([rate]% APR) — paid off in [monthsToPayoff] months"
- `high`: "After [debt A] is gone, redirect $[actualPayment] to [debt B]"
- `medium`: "Total interest remaining across all debts: $[sum(totalInterestRemaining)]"

Actions are descriptions of `debtsByPriority[]` values. No sorting or interest math in the module.

---

## `savings`

**Purpose**: Establish emergency fund and increase savings rate toward a FIRE-enabling level.

**Activation condition** (evaluated by state engine):
```
savingsRate < 0.20 OR riskFlags includes 'no_emergency_fund'
```

**Reads from DerivedState**:
- `emergencyFundMonths` — already computed; no cash asset summation in module
- `operatingExpenses`
- `savingsRate`
- `monthlySavings`
- `riskFlags` — specifically `no_emergency_fund`, `low_savings_rate`

**Output — example actions**:
- `critical` if `no_emergency_fund`: "Emergency fund covers [emergencyFundMonths] months. Target: 3 months ($[operatingExpenses × 3])"
- `high` if `low_savings_rate`: "Current savings rate: [savingsRate]%. Reaching 20% requires saving $[delta]/month more"
- `medium`: "Automating $[amount]/month to a HYSA closes the emergency fund gap in [months] months"

All dollar figures come from `DerivedState`. No calculations in the module.

---

## `fire_progress`

**Purpose**: Show FIRE trajectory and project timeline under current and improved scenarios.

**Activation condition** (evaluated by state engine):
```
financialStage is 'accumulation' | 'acceleration' | 'coast' | 'fire_ready'
```

**Reads from DerivedState**:
- `fireNumber`
- `fireProgress`
- `investableAssets`
- `yearsToFIRE`
- `coastFireNumber`
- `coastFireAchieved`
- `savingsRate`
- `financialStage`
- `profile.fireVariant`

**Output — example actions**:
- Standard: "FIRE in [yearsToFIRE] years (age [currentAge + yearsToFIRE]) at current savings rate"
- Coast: "Coast FIRE number: $[coastFireNumber]. You've [achieved / need $X more]."
- `fire_ready`: "Investable assets ($[investableAssets]) meet FIRE number ($[fireNumber])"

Renders differently by `profile.fireVariant`. No FIRE calculations in the module — all values are read directly from `DerivedState`.

---

## `budgeting`

**Purpose**: Identify spending categories with optimisation potential to increase savings rate.

**Activation condition** (evaluated by state engine):
```
riskFlags includes 'negative_cash_flow'
OR riskFlags includes 'low_savings_rate'
OR expenses[].length === 0
```

**Reads from DerivedState**:
- `expensesByCategory[]` — already grouped and percentages computed
- `operatingExpenses`
- `totalMonthlyIncome`
- `savingsRate`
- `riskFlags` — specifically `negative_cash_flow`

**Output — example actions**:
- `critical` if `negative_cash_flow`: "Outflow exceeds income by $[|monthlySavings|]/month"
- `high`: "[Top category by percentOfIncome] consumes [percent]% of income — largest reduction opportunity"
- `medium`: Categories where `hasVariableItems AND hasDiscretionary` — "Reducing [category] by $X/month adds Y% to savings rate"
- `low` if no expenses: "Add expense entries to enable budget analysis"

All percentages and groupings come from `expensesByCategory[]`. No category logic in the module.

---

## Module Interaction

Modules share no direct communication. All interaction flows through state:

Paying off debt → `liabilities[].currentBalance` → lower `totalDebt` + lower `debtServicePayments` → higher `monthlySavings` → higher `savingsRate` → `savings` module may deactivate → `fire_progress` advances → `debt` module deactivates when `totalDebt = 0`

Adding expense entities → `operatingExpenses` increases → `savingsRate` decreases → may activate `budgeting` or `savings` → `fireNumber` increases → `fireProgress` decreases

---

## Future Modules

New modules require only: an activation condition, reads from `DerivedState`, and `Action[]` output. No changes to existing modules or the interface are needed.

| Module | Activation Trigger |
|---|---|
| `tax_optimization` | effective tax rate > 0.25 OR no tax-advantaged assets |
| `real_estate` | any `asset.type = 'real_estate'` |
| `business_owner` | any `incomeStream.type = 'business'` |
| `geo_arbitrage` | high COL location AND `fireProgress > 0.50` |
| `social_security` | `currentAge >= 55` |
