import type { FireInputs, FireOutput, FireStrategy } from '../types';

/**
 * Traditional FIRE: 25× annual expenses target (4% safe withdrawal), 7% real
 * return assumption, capped at 65 years of accumulation.
 *
 * Year-over-year balance update mirrors the v1 reveal exactly so this seam
 * does not move any user-visible numbers.
 */
function compute({
  monthlySavings,
  annualExpenses,
  currentAge,
  startingBalance = 0,
  expectedRealReturn = 0.07,
  withdrawalRate = 0.04,
  maxYears = 65,
}: FireInputs): FireOutput {
  const fireTarget = annualExpenses * (1 / withdrawalRate);
  let bal = startingBalance;
  let yrs = 0;
  while (bal < fireTarget && yrs < maxYears) {
    bal = bal * (1 + expectedRealReturn) + monthlySavings * 12;
    yrs++;
  }
  const out: FireOutput = {
    fireTarget,
    years: yrs,
    retireYear: new Date().getFullYear() + yrs,
  };
  if (typeof currentAge === 'number' && currentAge > 0) {
    out.age = currentAge + yrs;
  }
  return out;
}

export const traditionalStrategy: FireStrategy = {
  id: 'traditional',
  label: 'Traditional FIRE',
  description: '25× annual expenses, 4% safe withdrawal rate, 7% real return.',
  compute,
};

/**
 * Drop-in replacement for the legacy positional `calcFIRE` signature so the
 * landing wizard can adopt the engine without rewriting six call sites.
 */
export function calcFIRE(
  monthlySavings: number,
  annualExpenses: number,
  currentAge?: number,
  startingBalance: number = 0,
): FireOutput {
  return compute({ monthlySavings, annualExpenses, currentAge, startingBalance });
}
