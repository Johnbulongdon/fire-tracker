# Entities

## What Are Entities?

Entities are the raw financial facts a user provides. They are the **only source of truth** in the FIRE OS. Every derived value, every module output, every action flows exclusively from entities.

Entities are not summaries or aggregates. They are structured records of discrete financial realities: a specific job, a specific credit card, a specific investment account.

**Canonical schema is defined in `context/data-model.md`. This file documents purpose and rules.**

---

## Core Rule: Debt Payments Are Not Expenses

Minimum and actual debt payments are captured on `Liability` entities, not as `Expense` entries. This ensures:
- No double-counting of debt service in cash flow
- FIRE number uses operating expenses only (debt will be eliminated before FIRE)
- State engine can separately track living costs vs. debt obligations

---

## Entity Types

### IncomeStream

**Purpose**: Represents a single, discrete source of income. Multiple streams are tracked separately because each has different tax treatment, reliability, and growth trajectory. Aggregating them loses information the state engine requires.

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier |
| `name` | string | Human label (e.g., "Salary — Acme Corp") |
| `type` | enum | `salary` \| `freelance` \| `business` \| `passive` |
| `monthlyAmount` | number | Monthly amount in user's currency |
| `isGross` | boolean | `true` = pre-tax gross, `false` = post-tax net |
| `taxable` | boolean | Subject to income tax |
| `reliability` | enum | `stable` \| `variable` \| `irregular` |
| `notes` | string? | Optional context |

**Type definitions**:

| Type | Description |
|---|---|
| `salary` | W-2 employment. Regular paycheck. Employer withholds taxes. |
| `freelance` | 1099/self-employment. Self-employment tax (15.3%) applies. |
| `business` | Owner distributions — LLC, S-corp, partnership. Pass-through tax treatment. |
| `passive` | Rental income, dividends, royalties. No active labor required. Capital gains rates may apply. |

**Reliability in projections**:
- `stable` — used at full value every month
- `variable` — use trailing average
- `irregular` — annualise and divide by 12

---

### Expense

**Purpose**: Represents a recurring living cost. Used to compute operating expenses and the FIRE number. Does NOT include debt payments.

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier |
| `name` | string | Human label (e.g., "Rent", "Netflix") |
| `category` | enum | See categories below |
| `monthlyAmount` | number | Monthly cost |
| `type` | enum | `fixed` \| `variable` |
| `essential` | boolean | `true` = necessary for basic living |
| `notes` | string? | Optional context |

**Categories**: `housing` | `food` | `transportation` | `healthcare` | `insurance` | `subscriptions` | `entertainment` | `clothing` | `education` | `childcare` | `personal` | `other`

**`fixed` vs `variable`**: Fixed amounts don't change month to month (rent). Variable amounts fluctuate (groceries, utilities). Variable non-essential expenses are the primary optimisation target for the budgeting module.

**`essential` flag**: Used by the budgeting module to identify discretionary spend. Essential expenses (housing, food, healthcare) are not optimisation candidates.

---

### Asset

**Purpose**: Represents something the user owns with financial value. Assets that are investable count toward the FIRE number. The `expectedReturn` field enables per-asset projection accuracy.

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier |
| `name` | string | Human label (e.g., "Vanguard Brokerage") |
| `type` | enum | `cash` \| `brokerage` \| `401k` \| `roth_ira` \| `real_estate` \| `business` \| `crypto` \| `other` |
| `currentValue` | number | Current market value |
| `isInvestable` | boolean | Counts toward FIRE number and `fireProgress` |
| `monthlyContribution` | number | Regular monthly contribution (0 if none) |
| `expectedReturn` | number | Annual expected return as decimal (e.g., `0.07`) |
| `notes` | string? | Optional context |

**`isInvestable`**:
- `true` — liquid; expected to fund 4% withdrawals in retirement (brokerage, 401k, Roth IRA, income-producing real estate)
- `false` — has value but not available for retirement withdrawals (primary home, business equity, illiquid assets)

**Default `isInvestable` by type**:

| Type | Default |
|---|---|
| `cash` | `false` |
| `brokerage` | `true` |
| `401k` | `true` |
| `roth_ira` | `true` |
| `real_estate` | `true` if rental; `false` if primary home |
| `business` | `false` |
| `crypto` | `true` |
| `other` | `false` |

---

### Liability

**Purpose**: Represents a debt the user owes. The `interestRate` drives debt prioritisation. The `actualPayment` field drives cash flow calculations. Eliminating debt reduces `debtServicePayments` and increases `monthlySavings`.

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier |
| `name` | string | Human label (e.g., "Discover Card", "Student Loan — Navient") |
| `type` | enum | `credit_card` \| `student_loan` \| `auto_loan` \| `mortgage` \| `personal_loan` \| `medical` \| `other` |
| `currentBalance` | number | Current outstanding balance |
| `interestRate` | number | Annual rate as decimal (e.g., `0.22` for 22%) |
| `minimumPayment` | number | Contractual minimum monthly payment |
| `actualPayment` | number | What the user currently pays monthly |
| `notes` | string? | Optional context |

**Key field rules**:
- `interestRate > 0.15` — triggers `high_interest_debt` risk flag; treated as a financial emergency
- `minimumPayment` — the floor; state engine verifies user meets minimums
- `actualPayment - minimumPayment` = extra principal reduction (used to project payoff timeline)

---

## Entity Lifecycle

```
Entity created/updated/deleted
  → EntitySet updated
    → State engine recalculates full DerivedState
      → Modules receive updated derived state
        → Actions regenerated
          → Interface re-renders
```

Every change triggers a complete state recalculation. There is no partial recalculation. The state engine always operates on the full, current entity set.
