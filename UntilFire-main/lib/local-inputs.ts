// ─────────────────────────────────────────────────────────────────────────────
// lib/local-inputs.ts
// Anonymous → authenticated state persistence layer for UntilFire
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = "untilfire_inputs";

// ─── Type mirrors dashboard state exactly ─────────────────────────────────────
export interface UntilFireInputs {
  income: number;
  expenses: {
    housing: number;
    food: number;
    transport: number;
    subscriptions: number;
    healthcare: number;
    entertainment: number;
    other: number;
    [key: string]: number;
  };
  fireAge: number;
  k401: number;
  rothIRA: number;
  taxable: number;
  totalDebt: number;
  mortgageBalance: number;
  mortgageMonthly: number;
  growthRate: number;
  withdrawalRate: number;
  baselineFireTarget?: number;
  adjustedFireTarget?: number;
  savings?: number;
  city?: {
    name: string;
    col: number;
    stateKey: string;
    isCustom: boolean;
  };
}

export const DEFAULT_INPUTS: UntilFireInputs = {
  income: 0,
  expenses: {
    housing: 0,
    food: 0,
    transport: 0,
    subscriptions: 0,
    healthcare: 0,
    entertainment: 0,
    other: 0,
  },
  fireAge: 30,
  k401: 0,
  rothIRA: 0,
  taxable: 0,
  totalDebt: 0,
  mortgageBalance: 0,
  mortgageMonthly: 0,
  growthRate: 0.07,
  withdrawalRate: 0.04,
  baselineFireTarget: undefined,
  adjustedFireTarget: undefined,
  savings: undefined,
  city: undefined,
};

// ─── Read ──────────────────────────────────────────────────────────────────────
export function loadLocalInputs(): UntilFireInputs | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UntilFireInputs;
  } catch {
    return null;
  }
}

// ─── Write ─────────────────────────────────────────────────────────────────────
export function saveLocalInputs(inputs: UntilFireInputs): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs));
  } catch {
    // Storage quota exceeded — fail silently
  }
}

// ─── Check if local data has any meaningful user input ─────────────────────────
export function hasLocalInputs(inputs: UntilFireInputs | null): boolean {
  if (!inputs) return false;
  const legacyFireTarget = (inputs as UntilFireInputs & { fireTarget?: number }).fireTarget;
  if ((inputs.adjustedFireTarget && inputs.adjustedFireTarget > 0) || (inputs.baselineFireTarget && inputs.baselineFireTarget > 0) || (legacyFireTarget && legacyFireTarget > 0)) return true;
  if (inputs.income > 0) return true;
  if (inputs.k401 > 0 || inputs.rothIRA > 0 || inputs.taxable > 0) return true;
  if (inputs.totalDebt > 0 || inputs.mortgageBalance > 0) return true;
  const expTotal = Object.values(inputs.expenses).reduce((s, v) => s + (v || 0), 0);
  return expTotal > 0;
}

export function hasCompleteExpenses(inputs: Pick<UntilFireInputs, "expenses">): boolean {
  const expenseKeys = ["housing", "food", "transport", "subscriptions", "healthcare", "entertainment", "other"] as const;
  return expenseKeys.every((key) => typeof inputs.expenses?.[key] === "number");
}

export function hasCompleteOnboardingSnapshot(inputs: UntilFireInputs | null): boolean {
  if (!inputs) return false;
  const legacyFireTarget = (inputs as UntilFireInputs & { fireTarget?: number }).fireTarget;
  return !!(((inputs.baselineFireTarget && inputs.baselineFireTarget > 0) || (legacyFireTarget && legacyFireTarget > 0)) && hasCompleteExpenses(inputs));
}

// ─── Merge: backend wins on non-zero fields, local fills in gaps ───────────────
export function mergeInputs(
  backend: Partial<UntilFireInputs>,
  local: UntilFireInputs
): UntilFireInputs {
  const merged = { ...DEFAULT_INPUTS };

  // Scalar fields: prefer backend non-zero, else local non-zero, else default
  const scalarFields = [
    "income", "fireAge", "k401", "rothIRA", "taxable",
    "totalDebt", "mortgageBalance", "mortgageMonthly", "growthRate", "withdrawalRate",
  ] as const;

  for (const field of scalarFields) {
    const be = backend[field] as number | undefined;
    const lo = local[field] as number;
    if (be !== undefined && be !== 0) {
      merged[field] = be as never;
    } else if (lo !== 0) {
      merged[field] = lo as never;
    } else {
      merged[field] = (DEFAULT_INPUTS[field] as number) as never;
    }
  }

  // Expenses object: merge key-by-key
  const expenseKeys = ["housing", "food", "transport", "subscriptions", "healthcare", "entertainment", "other"];
  const beExp = backend.expenses || {};
  const loExp = local.expenses || {};
  for (const key of expenseKeys) {
    const beVal = beExp[key] || 0;
    const loVal = loExp[key] || 0;
    merged.expenses[key] = beVal !== 0 ? beVal : loVal;
  }

  merged.baselineFireTarget =
    backend.baselineFireTarget ??
    local.baselineFireTarget ??
    ((backend as UntilFireInputs & { fireTarget?: number }).fireTarget) ??
    ((local as UntilFireInputs & { fireTarget?: number }).fireTarget);
  merged.adjustedFireTarget = backend.adjustedFireTarget ?? local.adjustedFireTarget;
  merged.savings = backend.savings ?? local.savings;
  merged.city = backend.city ?? local.city;

  return merged;
}
