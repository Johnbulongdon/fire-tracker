# Canonical Data Model

## Rule: Entities Are the Only Source of Truth

All derived values, module outputs, and actions flow exclusively from entities and profile. Nothing is hardcoded in modules or the interface. If a financial fact is not captured as an entity, it does not exist in the system.

Debt payments are NOT `Expense` entries. They are captured on `Liability` entities via `minimumPayment` and `actualPayment`. This prevents double-counting and keeps the FIRE number calculation accurate.

---

## UserFinancialState

```typescript
interface UserFinancialState {
  profile:  UserProfile;
  entities: EntitySet;
  derived:  DerivedState;   // always recalculated, never persisted
  system:   SystemOutput;   // produced by state engine from derived
}
```

---

## UserProfile

Personal context that parameterises state calculations.

```typescript
interface UserProfile {
  currentAge:           number;
  targetRetirementAge:  number;
  location:             string;   // city/country for COL adjustments
  taxJurisdiction:      string;   // US state or country code
  riskTolerance:        'conservative' | 'moderate' | 'aggressive';
  fireVariant:          'standard' | 'coast' | 'barista';
}
```

---

## EntitySet

The raw financial facts. The only inputs the state engine consumes.

```typescript
interface EntitySet {
  incomeStreams: IncomeStream[];
  expenses:     Expense[];
  assets:       Asset[];
  liabilities:  Liability[];
}
```

---

## DerivedState

Everything computed by the state engine from `EntitySet + UserProfile`. Never stored — always recalculated from scratch.

```typescript
interface DerivedState {
  // Cash flow
  totalMonthlyIncome:    number;   // sum(incomeStreams[].monthlyAmount)
  operatingExpenses:     number;   // sum(expenses[].monthlyAmount) — living costs only
  debtServicePayments:   number;   // sum(liabilities[].actualPayment)
  totalMonthlyOutflow:   number;   // operatingExpenses + debtServicePayments
  monthlySavings:        number;   // totalMonthlyIncome - totalMonthlyOutflow
  savingsRate:           number;   // monthlySavings / totalMonthlyIncome

  // Balance sheet
  totalAssets:           number;   // sum(assets[].currentValue)
  investableAssets:      number;   // sum(assets[isInvestable=true].currentValue)
  totalDebt:             number;   // sum(liabilities[].currentBalance)
  netWorth:              number;   // totalAssets - totalDebt

  // FIRE metrics
  fireNumber:            number;   // operatingExpenses × 12 × 25 (NOT including debt service)
  fireProgress:          number;   // investableAssets / fireNumber
  coastFireNumber:       number;   // fireNumber / (1 + weightedReturn)^yearsUntilRetirement
  coastFireAchieved:     boolean;  // investableAssets >= coastFireNumber
  yearsToFIRE:           number | null;

  // Classification
  financialStage:        FinancialStage;
  riskFlags:             RiskFlag[];

  // Pre-computed collections for modules (no module computes these)
  emergencyFundMonths:   number;              // cash assets / operatingExpenses
  debtsByPriority:       DebtSummary[];       // sorted by interestRate desc
  expensesByCategory:    ExpenseCategorySummary[];
}
```

---

## SystemOutput

Produced by the state engine after derived state is complete.

```typescript
interface SystemOutput {
  activeModules: ModuleId[];
  actions:       Action[];
  score:         number;     // 0–100 financial health score
}
```

---

## Entities

### IncomeStream

A single discrete source of income.

```typescript
interface IncomeStream {
  id:            string;
  name:          string;
  type:          'salary' | 'freelance' | 'business' | 'passive';
  monthlyAmount: number;
  isGross:       boolean;   // true = pre-tax gross, false = post-tax net
  taxable:       boolean;
  reliability:   'stable' | 'variable' | 'irregular';
  notes?:        string;
}
```

- `salary` — W-2 employment, employer withholds taxes
- `freelance` — 1099/self-employment, self-employment tax applies
- `business` — owner distributions from LLC, S-corp, partnership
- `passive` — rental income, dividends, royalties; no active labor required

---

### Expense

A recurring living cost. Does NOT include debt payments.

```typescript
interface Expense {
  id:            string;
  name:          string;
  category:      ExpenseCategory;
  monthlyAmount: number;
  type:          'fixed' | 'variable';
  essential:     boolean;
  notes?:        string;
}

type ExpenseCategory =
  | 'housing' | 'food' | 'transportation' | 'healthcare'
  | 'insurance' | 'subscriptions' | 'entertainment'
  | 'clothing' | 'education' | 'childcare' | 'personal' | 'other';
```

- `fixed` — same amount each month (rent, insurance premium)
- `variable` — fluctuates month to month (groceries, utilities)
- `essential: true` — necessary for basic living (housing, food, healthcare)
- `essential: false` — discretionary; can be reduced without impacting basic needs

---

### Asset

Something the user owns with financial value.

```typescript
interface Asset {
  id:                  string;
  name:                string;
  type:                'cash' | 'brokerage' | '401k' | 'roth_ira'
                       | 'real_estate' | 'business' | 'crypto' | 'other';
  currentValue:        number;
  isInvestable:        boolean;   // true = counts toward FIRE number
  monthlyContribution: number;    // 0 if not actively contributing
  expectedReturn:      number;    // annual rate as decimal (e.g. 0.07)
  notes?:              string;
}
```

- `isInvestable: true` — liquid; counts toward `fireProgress` (brokerage, 401k, Roth IRA)
- `isInvestable: false` — has value but not available for 4% withdrawals (primary home, business equity)

---

### Liability

A debt the user owes. Payment fields drive cash flow calculations.

```typescript
interface Liability {
  id:             string;
  name:           string;
  type:           'credit_card' | 'student_loan' | 'auto_loan'
                  | 'mortgage' | 'personal_loan' | 'medical' | 'other';
  currentBalance: number;
  interestRate:   number;   // annual rate as decimal (e.g. 0.22 for 22%)
  minimumPayment: number;   // contractual floor — must always be met
  actualPayment:  number;   // what the user currently pays monthly
  notes?:         string;
}
```

- `interestRate` — primary signal for debt prioritisation; triggers `high_interest_debt` flag if > 0.15
- `minimumPayment` — floor for cash flow calculations
- `actualPayment` — delta above minimum is extra principal reduction

---

## Supporting Types

```typescript
type FinancialStage =
  | 'survival'       // totalMonthlyOutflow > totalMonthlyIncome
  | 'stabilization'  // monthlySavings >= 0 but savingsRate < 0.01
  | 'foundation'     // savingsRate 0.01–0.19
  | 'accumulation'   // savingsRate 0.20–0.39
  | 'acceleration'   // savingsRate >= 0.40
  | 'coast'          // coastFireAchieved = true
  | 'fire_ready';    // fireProgress >= 1.0

type RiskFlag =
  | 'negative_cash_flow'
  | 'high_debt_ratio'
  | 'no_emergency_fund'
  | 'high_interest_debt'
  | 'single_income_source'
  | 'low_savings_rate'
  | 'savings_rate_declining';

type ModuleId = 'debt' | 'savings' | 'fire_progress' | 'budgeting';

interface Action {
  id:          string;
  module:      ModuleId;
  priority:    'critical' | 'high' | 'medium' | 'low';
  title:       string;
  description: string;
  impact:      string;   // quantified where possible
  effort:      'low' | 'medium' | 'high';
}

interface DebtSummary {
  id:                    string;
  name:                  string;
  interestRate:          number;
  currentBalance:        number;
  minimumPayment:        number;
  actualPayment:         number;
  monthsToPayoff:        number;   // computed by state engine
  totalInterestRemaining: number;  // computed by state engine
}

interface ExpenseCategorySummary {
  category:           ExpenseCategory;
  monthlyAmount:      number;
  percentOfIncome:    number;   // monthlyAmount / totalMonthlyIncome
  hasVariableItems:   boolean;
  hasDiscretionary:   boolean;
}
```
