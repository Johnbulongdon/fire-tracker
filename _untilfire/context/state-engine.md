# State Engine

## Purpose

The state engine is the sole logic layer of the FIRE OS. It is a pure function that transforms `EntitySet + UserProfile` into `DerivedState + SystemOutput`. No other layer performs financial calculations.

```
stateEngine(EntitySet, UserProfile) → { DerivedState, SystemOutput }
```

---

## Inputs

- `EntitySet` — incomeStreams, expenses, assets, liabilities (source of truth)
- `UserProfile` — currentAge, targetRetirementAge, fireVariant, taxJurisdiction

The state engine reads nothing else. It does not read from the UI, prior derived state, or module outputs.

---

## Step 1 — Cash Flow

```
totalMonthlyIncome   = sum(incomeStreams[].monthlyAmount)

operatingExpenses    = sum(expenses[].monthlyAmount)
                       // living costs only — no debt payments

debtServicePayments  = sum(liabilities[].actualPayment)

totalMonthlyOutflow  = operatingExpenses + debtServicePayments

monthlySavings       = totalMonthlyIncome - totalMonthlyOutflow

savingsRate          = monthlySavings / totalMonthlyIncome
                       // 0 if totalMonthlyIncome = 0
```

---

## Step 2 — Balance Sheet

```
totalAssets       = sum(assets[].currentValue)
investableAssets  = sum(assets[isInvestable=true].currentValue)
totalDebt         = sum(liabilities[].currentBalance)
netWorth          = totalAssets - totalDebt
```

---

## Step 3 — FIRE Metrics

FIRE number uses `operatingExpenses` only. Debt service is excluded because debts are eliminated before or at FIRE date.

```
fireNumber      = operatingExpenses × 12 × 25
                  // 4% withdrawal rule on living costs only

fireProgress    = investableAssets / fireNumber

weightedReturn  = sum(asset.currentValue × asset.expectedReturn) / totalAssets
                  // 0 if totalAssets = 0; use 0.07 as default fallback

yearsToFIRE     = solve for N where:
                  investableAssets × (1 + weightedReturn/12)^(N×12)
                  + monthlySavings × [((1 + weightedReturn/12)^(N×12) - 1) / (weightedReturn/12)]
                  >= fireNumber
                  // null if monthlySavings <= 0

yearsUntilRetirement = targetRetirementAge - currentAge

coastFireNumber = fireNumber / (1 + weightedReturn)^yearsUntilRetirement

coastFireAchieved = investableAssets >= coastFireNumber
```

---

## Step 4 — Pre-computed Module Collections

These are computed by the state engine so modules never perform calculations.

### debtsByPriority

```
debtsByPriority = liabilities[]
  .sortBy(interestRate, desc)
  .map(liability => {
    monthsToPayoff        = solve for M where balance paid off at actualPayment
                            accounting for interestRate/12 monthly interest
    totalInterestRemaining = (actualPayment × monthsToPayoff) - currentBalance
    return { ...liability, monthsToPayoff, totalInterestRemaining }
  })
```

### emergencyFundMonths

```
cashAssets          = sum(assets[type='cash'].currentValue)
emergencyFundMonths = cashAssets / operatingExpenses
                      // 0 if operatingExpenses = 0
```

### expensesByCategory

```
expensesByCategory = group expenses[] by category, then for each group:
  monthlyAmount    = sum(group[].monthlyAmount)
  percentOfIncome  = monthlyAmount / totalMonthlyIncome
  hasVariableItems = any(group[].type = 'variable')
  hasDiscretionary = any(group[].essential = false)
```

---

## Step 5 — Financial Stage

Evaluated in priority order. First matching condition wins.

| Condition | Stage |
|---|---|
| `monthlySavings < 0` | `survival` |
| `savingsRate < 0.01` | `stabilization` |
| `savingsRate < 0.20` | `foundation` |
| `fireProgress >= 1.0` | `fire_ready` |
| `coastFireAchieved = true` | `coast` |
| `savingsRate >= 0.40` | `acceleration` |
| `savingsRate >= 0.20` | `accumulation` |

---

## Step 6 — Risk Flags

All applicable flags are raised simultaneously.

| Flag | Condition |
|---|---|
| `negative_cash_flow` | `monthlySavings < 0` |
| `high_debt_ratio` | `totalDebt > 0 AND totalDebt / max(netWorth, 1) > 0.50` |
| `no_emergency_fund` | `emergencyFundMonths < 3` |
| `high_interest_debt` | any `liability.interestRate > 0.15` |
| `single_income_source` | `incomeStreams.length === 1` |
| `low_savings_rate` | `savingsRate > 0 AND savingsRate < 0.10` |
| `savings_rate_declining` | current `savingsRate` < previous period (only raised when history exists) |

---

## Step 7 — Module Activation

The state engine sets `activeModules[]`. Modules do not activate themselves.

| Module | Activates When |
|---|---|
| `debt` | `totalDebt > 0` |
| `savings` | `savingsRate < 0.20` OR `riskFlags` includes `no_emergency_fund` |
| `fire_progress` | `financialStage` is `accumulation`, `acceleration`, `coast`, or `fire_ready` |
| `budgeting` | `riskFlags` includes `negative_cash_flow` OR `low_savings_rate` OR `expenses[].length === 0` |

**Render priority** (when multiple active): `debt` → `savings` → `budgeting` → `fire_progress`

---

## Step 8 — Action Ranking

Each active module produces candidate `Action[]`. The state engine collects and ranks them.

**Ranking rules** (evaluated in order):
1. Actions addressing active risk flags rank first
2. Sort by `priority` descending (`critical` > `high` > `medium` > `low`)
3. Within same priority, sort by `effort` ascending (low effort first)
4. Maximum 5 actions in `SystemOutput.actions[]`

---

## Step 9 — Health Score

```
score = (savingsRateScore  × 0.30)
      + (debtRatioScore    × 0.25)
      + (fireProgressScore × 0.25)
      + (diversification   × 0.20)

// Each component normalised to 0–100 before weighting
```

---

## Determinism Guarantee

The state engine is a pure function:
- No side effects
- No randomness
- No external calls
- No reads from prior derived state
- Same `EntitySet + UserProfile` → same `DerivedState + SystemOutput`, always
