// 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
// lib/local-inputs.ts
// Anonymous 鈫?authenticated state persistence layer for UntilFire
// 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

const STORAGE_KEY = "untilfire_inputs";
export const FIRE_USER_DATA_KEY = "fire_user_data";

export type FireMode = "starter" | "advanced";
export type FireGoal = "retire-early" | "financial-freedom" | "exploring";
export type FireStyle = "lean" | "standard" | "fat" | "barista" | "coast" | "unsure";

export interface FireIncomeRange {
  id: string;
  label: string;
  monthlyIncome: number;
}

export interface FireUserState {
  mode: FireMode;
  age?: number;
  income: number | FireIncomeRange;
  expenses?: number;
  savings: number;
  fireNumber: number;
  hasCompletedOnboarding: boolean;
  goal?: FireGoal;
  portfolio?: number;
  fireStyle?: FireStyle;
  targetAge?: number;
  city?: { name: string; col: number; stateKey: string; isCustom: boolean };
}

export interface FireUserStateValidationResult {
  valid: boolean;
  errors: string[];
  value: FireUserState | null;
}

export const FIRE_USER_STATE_PRIORITY = {
  onboardingDraft: ["in-memory draft", "localStorage draft"],
  dashboardBaseline: ["fire_user_data", "Supabase persistence"],
} as const;

// 鈹€鈹€鈹€ Type mirrors dashboard state exactly 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
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

function isFireIncomeRange(value: unknown): value is FireIncomeRange {
  return !!value
    && typeof value === "object"
    && typeof (value as FireIncomeRange).label === "string"
    && typeof (value as FireIncomeRange).monthlyIncome === "number";
}

function normalizeFireUserState(raw: unknown): FireUserState | null {
  if (!raw || typeof raw !== "object") return null;

  const legacy = raw as {
    income?: unknown;
    expenses?: unknown;
    savings?: unknown;
    fireNumber?: unknown;
    hasOnboarded?: unknown;
    hasCompletedOnboarding?: unknown;
    mode?: unknown;
    age?: unknown;
    goal?: unknown;
    portfolio?: unknown;
    fireStyle?: unknown;
    targetAge?: unknown;
    city?: unknown;
  };

  const normalizedIncome = typeof legacy.income === "number"
    ? legacy.income
    : isFireIncomeRange(legacy.income)
      ? legacy.income
      : null;

  if (normalizedIncome === null) return null;

  return {
    mode: legacy.mode === "starter" || legacy.mode === "advanced" ? legacy.mode : "advanced",
    age: typeof legacy.age === "number" ? legacy.age : undefined,
    income: normalizedIncome,
    expenses: typeof legacy.expenses === "number" ? legacy.expenses : undefined,
    savings: typeof legacy.savings === "number" ? legacy.savings : 0,
    fireNumber: typeof legacy.fireNumber === "number" ? legacy.fireNumber : 0,
    hasCompletedOnboarding:
      legacy.hasCompletedOnboarding === true || legacy.hasOnboarded === true,
    goal:
      legacy.goal === "retire-early"
      || legacy.goal === "financial-freedom"
      || legacy.goal === "exploring"
        ? legacy.goal
        : undefined,
    portfolio: typeof legacy.portfolio === "number" ? legacy.portfolio : undefined,
    fireStyle: (["lean","standard","fat","barista","coast","unsure"] as FireStyle[]).includes(legacy.fireStyle as FireStyle)
      ? (legacy.fireStyle as FireStyle) : undefined,
    targetAge: typeof legacy.targetAge === "number" ? legacy.targetAge : undefined,
    city: legacy.city && typeof legacy.city === "object"
      ? (legacy.city as FireUserState["city"]) : undefined,
  };
}

export function validateFireUserState(raw: unknown): FireUserStateValidationResult {
  const value = normalizeFireUserState(raw);
  const errors: string[] = [];

  if (!value) {
    return { valid: false, errors: ["State is missing or malformed."], value: null };
  }

  if (value.mode !== "starter" && value.mode !== "advanced") {
    errors.push("mode must be 'starter' or 'advanced'.");
  }
  if (value.age !== undefined && (!Number.isFinite(value.age) || value.age < 1 || value.age > 120)) {
    errors.push("age must be between 1 and 120 when provided.");
  }

  const incomeAmount = resolveFireIncomeAmount(value.income);
  if (!Number.isFinite(incomeAmount) || incomeAmount < 0) {
    errors.push("income must resolve to a non-negative number.");
  }
  if (!Number.isFinite(value.savings) || value.savings < 0) {
    errors.push("savings must be a non-negative number.");
  }
  if (value.expenses !== undefined && (!Number.isFinite(value.expenses) || value.expenses < 0)) {
    errors.push("expenses must be a non-negative number when provided.");
  }
  if (!Number.isFinite(value.fireNumber) || value.fireNumber < 0) {
    errors.push("fireNumber must be a non-negative number.");
  }
  if (value.targetAge !== undefined && (!Number.isFinite(value.targetAge) || value.targetAge < 1 || value.targetAge > 120)) {
    errors.push("targetAge must be between 1 and 120 when provided.");
  }
  if (value.targetAge !== undefined && value.age !== undefined && value.targetAge <= value.age) {
    errors.push("targetAge must be after current age.");
  }
  if (typeof value.hasCompletedOnboarding !== "boolean") {
    errors.push("hasCompletedOnboarding must be a boolean.");
  }
  if (value.mode === "starter" && !isFireIncomeRange(value.income)) {
    errors.push("starter mode requires an income range.");
  }
  if (value.mode === "advanced" && typeof value.income !== "number") {
    errors.push("advanced mode requires numeric income.");
  }

  return { valid: errors.length === 0, errors, value };
}

export function resolveFireIncomeAmount(income: FireUserState["income"]): number {
  if (typeof income === "number") return income;
  if (isFireIncomeRange(income)) return income.monthlyIncome;
  return 0;
}

function deriveFireUserStateFromInputs(inputs: Partial<UntilFireInputs> | null | undefined): FireUserState | null {
  if (!inputs) return null;

  const expenses = Object.entries(inputs.expenses ?? {})
    .filter(([key]) => !key.startsWith("_"))
    .reduce((sum, [, value]) => sum + (typeof value === "number" ? value : 0), 0);
  const income = typeof inputs.income === "number" ? inputs.income : 0;
  const mortgageMonthly = typeof inputs.mortgageMonthly === "number" ? inputs.mortgageMonthly : 0;
  const derivedSavings = Math.max(0, income - expenses - mortgageMonthly);
  const derivedPortfolio =
    (typeof inputs.k401 === "number" ? inputs.k401 : 0) +
    (typeof inputs.rothIRA === "number" ? inputs.rothIRA : 0) +
    (typeof inputs.taxable === "number" ? inputs.taxable : 0);

  return {
    mode: "advanced",
    age: typeof inputs.fireAge === "number" ? inputs.fireAge : undefined,
    income,
    expenses,
    savings: typeof inputs.savings === "number" ? inputs.savings : derivedSavings,
    fireNumber: typeof inputs.baselineFireTarget === "number" ? inputs.baselineFireTarget : 0,
    hasCompletedOnboarding: typeof inputs.baselineFireTarget === "number" && inputs.baselineFireTarget > 0,
    portfolio: derivedPortfolio > 0 ? derivedPortfolio : undefined,
  };
}

export function resolveFireUserState(backendInputs?: Partial<UntilFireInputs> | null): FireUserState | null {
  const localValidation = validateFireUserState(loadFireUserData());
  const localState =
    localValidation.valid
    && localValidation.value
    && localValidation.value.hasCompletedOnboarding
      ? localValidation.value
      : null;
  const backendValidation = validateFireUserState(deriveFireUserStateFromInputs(backendInputs));
  const backendState =
    backendValidation.valid
    && backendValidation.value
    && backendValidation.value.hasCompletedOnboarding
      ? backendValidation.value
      : null;

  if (!localValidation.valid && localValidation.errors.length > 0) {
    console.warn("[UntilFire] resolveFireUserState ignored local FireUserState", localValidation.errors);
  }

  if (!backendValidation.valid && backendValidation.errors.length > 0) {
    console.warn("[UntilFire] resolveFireUserState ignored backend FireUserState", backendValidation.errors);
  }

  if (localState) return localState;
  if (backendState) return backendState;

  return null;
}

export function loadFireUserData(): FireUserState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(FIRE_USER_DATA_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const validation = validateFireUserState(parsed);
    if (!validation.valid) {
      console.warn("[UntilFire] Invalid FireUserState in localStorage", validation.errors);
      return validation.value;
    }
    return validation.value;
  } catch {
    return null;
  }
}

export async function saveFireUserData(data: FireUserState): Promise<void> {
  if (typeof window === "undefined") return;
  const validation = validateFireUserState(data);
  if (!validation.value) {
    console.warn("[UntilFire] Refusing to persist unnormalizable FireUserState", validation.errors);
    return;
  }
  localStorage.setItem(FIRE_USER_DATA_KEY, JSON.stringify(data));
}

export function clearFireUserData(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(FIRE_USER_DATA_KEY);
}

export function hasCompletedOnboarding(data: FireUserState | null): boolean {
  return !!data && data.hasCompletedOnboarding === true;
}

declare global {
  interface Window {
    __untilfireInspector?: {
      getFireUserState: () => FireUserStateValidationResult;
      getFireUserStatePriority: () => typeof FIRE_USER_STATE_PRIORITY;
      clearFireUserState: () => void;
    };
  }
}

export function registerFireUserStateInspector(): void {
  if (typeof window === "undefined") return;
  window.__untilfireInspector = {
    getFireUserState: () => {
      try {
        const raw = localStorage.getItem(FIRE_USER_DATA_KEY);
        return validateFireUserState(raw ? JSON.parse(raw) : null);
      } catch {
        return { valid: false, errors: ["Unable to parse fire_user_data."], value: null };
      }
    },
    getFireUserStatePriority: () => FIRE_USER_STATE_PRIORITY,
    clearFireUserState: () => clearFireUserData(),
  };
}

// 鈹€鈹€鈹€ Read 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
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

// 鈹€鈹€鈹€ Write 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
export function saveLocalInputs(inputs: UntilFireInputs): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs));
  } catch {
    // Storage quota exceeded 鈥?fail silently
  }
}

// 鈹€鈹€鈹€ Check if local data has any meaningful user input 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
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

// 鈹€鈹€鈹€ Merge: backend wins on non-zero fields, local fills in gaps 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
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
