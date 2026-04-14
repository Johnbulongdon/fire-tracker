// Pure input-only FIRE scenario math.
// This module must not read, write, or mutate persisted FIRE state.
export function calcProjection({
  annualIncome, monthlyExpenses, k401, rothIRA, taxable,
  totalDebt, mortgageBalance, mortgageMonthly,
  growthRate = 0.07, withdrawalRate = 0.04, years = 50,
}: {
  annualIncome: number; monthlyExpenses: number; k401: number;
  rothIRA: number; taxable: number; totalDebt: number;
  mortgageBalance: number; mortgageMonthly: number;
  growthRate?: number; withdrawalRate?: number; years?: number;
}) {
  const annualExpenses = monthlyExpenses * 12;
  const annualMortgage = mortgageMonthly * 12;
  const annualSavings  = annualIncome - annualExpenses - annualMortgage;
  const fireTarget     = annualExpenses * (1 / withdrawalRate);

  const k401Contrib    = Math.min(Math.max(annualSavings * 0.4, 0), 23000);
  const rothContrib    = Math.min(Math.max(annualSavings * 0.2, 0), 7000);
  const taxableContrib = Math.max(annualSavings - k401Contrib - rothContrib, 0);

  const data: Record<string, number>[] = [];
  let cur401k    = k401;
  let curRoth    = rothIRA;
  let curTaxable = taxable;
  let curDebt    = totalDebt;
  let curMort    = mortgageBalance;
  let fireYear: number | null = null;

  for (let y = 0; y <= years; y++) {
    const investable = cur401k + curRoth + curTaxable;
    const netWorth   = investable - curDebt - curMort;
    if (fireYear === null && investable >= fireTarget && y > 0) fireYear = y;
    data.push({
      year: y,
      "401(k)":     Math.round(cur401k),
      "Roth IRA":   Math.round(curRoth),
      "Taxable":    Math.round(curTaxable),
      "Net Worth":  Math.round(netWorth),
      "FIRE Target":Math.round(fireTarget),
      "Investable": Math.round(investable),
      "Debt":       Math.round(-(curDebt + curMort)),
    });
    cur401k    = cur401k    * (1 + growthRate) + k401Contrib;
    curRoth    = curRoth    * (1 + growthRate) + rothContrib;
    curTaxable = curTaxable * (1 + growthRate) + taxableContrib;
    if (curDebt > 0) {
      const interest = curDebt * 0.05;
      const payment  = Math.min(curDebt + interest, Math.max(annualSavings * 0.3, 0));
      curDebt = Math.max(0, curDebt + interest - payment);
    }
    if (curMort > 0) {
      const mInt = curMort * 0.065;
      const prin = Math.max(0, annualMortgage - mInt);
      curMort = Math.max(0, curMort - prin);
    }
  }

  return { data, fireYear, fireTarget, annualSavings };
}
