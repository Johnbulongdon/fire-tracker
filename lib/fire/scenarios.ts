// Single-default-scenario read/write seam used by the dashboard.
//
// v1 always loads the user's one default scenario. The schema (profiles,
// scenarios, scenario_assumptions) is laid out for later compare/branch
// features, but no caller in v1 should look beyond the default — keeping
// that constraint in this module is what prevents the multi-scenario UI
// from leaking out before we want it.
//
// Legacy `user_budget` is left in place and dual-written so the
// transactions tab and any external consumers keep working during the
// cutover. New reads come from scenario_assumptions.

import type { SupabaseClient } from '@supabase/supabase-js';

export interface ScenarioAssumptions {
  monthlyIncome: number;
  fireAge: number;
  k401: number;
  rothIRA: number;
  taxable: number;
  totalDebt: number;
  mortgageBalance: number;
  mortgageMonthly: number;
  growthRate: number;
  withdrawalRate: number;
  /** Free-form category → monthly amount (housing, food, transport, ...). */
  budgetCategories: Record<string, number>;
}

export interface DefaultScenarioPayload extends ScenarioAssumptions {
  scenarioId: string;
}

const DEFAULTS: ScenarioAssumptions = {
  monthlyIncome: 0,
  fireAge: 30,
  k401: 0,
  rothIRA: 0,
  taxable: 0,
  totalDebt: 0,
  mortgageBalance: 0,
  mortgageMonthly: 0,
  growthRate: 0.07,
  withdrawalRate: 0.04,
  budgetCategories: {},
};

interface ScenarioAssumptionsRow {
  scenario_id: string;
  monthly_income: number | string | null;
  fire_age: number | null;
  k401: number | string | null;
  roth_ira: number | string | null;
  taxable: number | string | null;
  total_debt: number | string | null;
  mortgage_balance: number | string | null;
  mortgage_monthly: number | string | null;
  growth_rate: number | string | null;
  withdrawal_rate: number | string | null;
  budget_categories: Record<string, number> | null;
}

interface LegacyBudgetRow {
  income: number | string | null;
  expenses: Record<string, unknown> | null;
  fire_age: number | null;
  fire_assets: number | string | null;
}

const num = (v: number | string | null | undefined, fallback: number) => {
  if (v === null || v === undefined || v === '') return fallback;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
};

function rowToAssumptions(
  row: ScenarioAssumptionsRow,
): DefaultScenarioPayload {
  return {
    scenarioId: row.scenario_id,
    monthlyIncome: num(row.monthly_income, DEFAULTS.monthlyIncome),
    fireAge: num(row.fire_age, DEFAULTS.fireAge),
    k401: num(row.k401, DEFAULTS.k401),
    rothIRA: num(row.roth_ira, DEFAULTS.rothIRA),
    taxable: num(row.taxable, DEFAULTS.taxable),
    totalDebt: num(row.total_debt, DEFAULTS.totalDebt),
    mortgageBalance: num(row.mortgage_balance, DEFAULTS.mortgageBalance),
    mortgageMonthly: num(row.mortgage_monthly, DEFAULTS.mortgageMonthly),
    growthRate: num(row.growth_rate, DEFAULTS.growthRate),
    withdrawalRate: num(row.withdrawal_rate, DEFAULTS.withdrawalRate),
    budgetCategories: row.budget_categories ?? {},
  };
}

function legacyToAssumptions(row: LegacyBudgetRow): ScenarioAssumptions {
  const expenses = (row.expenses ?? {}) as Record<string, unknown>;
  const fireProfile =
    (expenses._fire_profile as Record<string, unknown> | undefined) ?? {};
  const { _fire_profile: _drop, ...categoriesUnknown } = expenses;
  const categories: Record<string, number> = {};
  for (const [key, value] of Object.entries(categoriesUnknown)) {
    const n = typeof value === 'number' ? value : Number(value);
    if (Number.isFinite(n)) categories[key] = n;
  }
  return {
    monthlyIncome: num(row.income as number | string | null, DEFAULTS.monthlyIncome),
    fireAge: num(row.fire_age, DEFAULTS.fireAge),
    k401: num(
      (fireProfile.k401 as number | string | null | undefined) ?? null,
      num(row.fire_assets, DEFAULTS.k401),
    ),
    rothIRA: num(
      (fireProfile.rothIRA as number | string | null | undefined) ?? null,
      DEFAULTS.rothIRA,
    ),
    taxable: num(
      (fireProfile.taxable as number | string | null | undefined) ?? null,
      DEFAULTS.taxable,
    ),
    totalDebt: num(
      (fireProfile.totalDebt as number | string | null | undefined) ?? null,
      DEFAULTS.totalDebt,
    ),
    mortgageBalance: num(
      (fireProfile.mortgageBalance as number | string | null | undefined) ?? null,
      DEFAULTS.mortgageBalance,
    ),
    mortgageMonthly: num(
      (fireProfile.mortgageMonthly as number | string | null | undefined) ?? null,
      DEFAULTS.mortgageMonthly,
    ),
    growthRate: num(
      (fireProfile.growthRate as number | string | null | undefined) ?? null,
      DEFAULTS.growthRate,
    ),
    withdrawalRate: num(
      (fireProfile.withdrawalRate as number | string | null | undefined) ?? null,
      DEFAULTS.withdrawalRate,
    ),
    budgetCategories: categories,
  };
}

/**
 * Load the user's default scenario, lazy-initialising profile + scenario +
 * scenario_assumptions if missing. Falls back to legacy `user_budget` to
 * seed a first scenario when an account predates this schema.
 */
export async function loadDefaultScenario(
  supabase: SupabaseClient,
  userId: string,
): Promise<DefaultScenarioPayload> {
  const { data: existing } = await supabase
    .from('scenario_assumptions')
    .select(
      'scenario_id, monthly_income, fire_age, k401, roth_ira, taxable, total_debt, mortgage_balance, mortgage_monthly, growth_rate, withdrawal_rate, budget_categories, scenarios!inner(user_id, is_default)',
    )
    .eq('user_id', userId)
    .eq('scenarios.is_default', true)
    .maybeSingle();

  if (existing) {
    return rowToAssumptions(existing as unknown as ScenarioAssumptionsRow);
  }

  // Lazy-init path. Seed from legacy user_budget when present so existing
  // accounts don't lose their numbers when they next open the dashboard.
  const { data: legacy } = await supabase
    .from('user_budget')
    .select('income, expenses, fire_age, fire_assets')
    .eq('user_id', userId)
    .maybeSingle();

  const seed = legacy
    ? legacyToAssumptions(legacy as LegacyBudgetRow)
    : { ...DEFAULTS };

  return ensureDefaultScenario(supabase, userId, seed);
}

/**
 * Create profile/scenario/assumptions rows for `userId` if they don't
 * already exist, populated with `seed`. Idempotent.
 */
export async function ensureDefaultScenario(
  supabase: SupabaseClient,
  userId: string,
  seed: ScenarioAssumptions = DEFAULTS,
): Promise<DefaultScenarioPayload> {
  await supabase
    .from('profiles')
    .upsert({ user_id: userId }, { onConflict: 'user_id' });

  let { data: scenario } = await supabase
    .from('scenarios')
    .select('id')
    .eq('user_id', userId)
    .eq('is_default', true)
    .maybeSingle();

  if (!scenario) {
    const inserted = await supabase
      .from('scenarios')
      .insert({ user_id: userId, name: 'Default', is_default: true })
      .select('id')
      .single();
    scenario = inserted.data ?? null;
  }

  if (!scenario) {
    throw new Error('failed to create default scenario');
  }

  await supabase.from('scenario_assumptions').upsert(
    {
      scenario_id: scenario.id,
      user_id: userId,
      monthly_income: seed.monthlyIncome,
      fire_age: seed.fireAge,
      k401: seed.k401,
      roth_ira: seed.rothIRA,
      taxable: seed.taxable,
      total_debt: seed.totalDebt,
      mortgage_balance: seed.mortgageBalance,
      mortgage_monthly: seed.mortgageMonthly,
      growth_rate: seed.growthRate,
      withdrawal_rate: seed.withdrawalRate,
      budget_categories: seed.budgetCategories,
    },
    { onConflict: 'scenario_id' },
  );

  return { scenarioId: scenario.id, ...seed };
}

/**
 * Persist the user's default scenario assumptions. Dual-writes the legacy
 * `user_budget` row so anything still reading the old shape stays in sync
 * during the cutover.
 */
export async function saveDefaultScenario(
  supabase: SupabaseClient,
  userId: string,
  payload: ScenarioAssumptions,
): Promise<DefaultScenarioPayload> {
  const persisted = await ensureDefaultScenario(supabase, userId, payload);

  await supabase.from('user_budget').upsert(
    {
      user_id: userId,
      income: payload.monthlyIncome,
      expenses: {
        ...payload.budgetCategories,
        _fire_profile: {
          k401: payload.k401,
          rothIRA: payload.rothIRA,
          taxable: payload.taxable,
          totalDebt: payload.totalDebt,
          mortgageBalance: payload.mortgageBalance,
          mortgageMonthly: payload.mortgageMonthly,
          growthRate: payload.growthRate,
          withdrawalRate: payload.withdrawalRate,
        },
      },
      fire_age: payload.fireAge,
      fire_assets: payload.k401,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  );

  return persisted;
}
