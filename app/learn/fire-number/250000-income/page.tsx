import type { Metadata } from "next";
import IncomeFirePage from "../../_components/IncomeFirePage";

export const metadata: Metadata = {
  title: "FIRE Number on a $250,000 Salary — How to Retire Early (2025)",
  description: "Calculate your FIRE number on a $250,000 income. High-income FIRE in 5–15 years — tax strategies, investment vehicles, and realistic scenarios.",
  keywords: "FIRE number $250000 salary, retire early $250k income, high income FIRE, Fat FIRE $250k",
  alternates: { canonical: "https://untilfire.com/learn/fire-number/250000-income" },
};

export default function Page() {
  return (
    <IncomeFirePage
      income={250_000}
      incomeLabel="$250,000"
      taxNote="On a $250k salary, effective federal tax is roughly 28–30%. Take-home before state taxes is ~$170,000–$178,000. Income at this level warrants a CPA for tax optimization — the savings are substantial."
      scenarios={[
        { label: "Lean FIRE", savingsRate: 75, expenses: 55_000, fireNumber: 1_375_000, years: 7 },
        { label: "Moderate FIRE", savingsRate: 60, expenses: 90_000, fireNumber: 2_250_000, years: 11 },
        { label: "Fat FIRE", savingsRate: 40, expenses: 130_000, fireNumber: 3_250_000, years: 19 },
      ]}
      insight="At $250k, FIRE in under 10 years is achievable with intentional spending. Most $250k earners target Moderate FIRE ($90k/year spending) in 11 years — an excellent lifestyle that most people would consider very comfortable. The wealth-building math at this income is extraordinary: $150k/year invested at 7% becomes $2.25M in just 11 years."
      tip="At $250k income, you're subject to 37% marginal tax on income above $609k (married) or $578k (single). Maximize every tax deferral: Traditional 401k (saves ~8,050 in taxes on $23k deferral), deferred compensation plans if available, and consider a Donor Advised Fund for charitable giving to bunch deductions."
      faq={[
        { q: "What is the FIRE number for a $250k earner?", a: "For Moderate FIRE ($90k/year): $2.25M. For Fat FIRE ($130k/year): $3.25M. For Lean FIRE ($55k/year): $1.375M. Most $250k earners who are FIRE-focused target $2M–$2.5M, which provides $80k–$100k/year — an excellent retirement income." },
        { q: "How does a $250k earner optimize taxes pre-FIRE?", a: "Priority order: (1) 401(k) $23k traditional deferral, (2) Mega Backdoor Roth if available, (3) HSA max, (4) Backdoor Roth IRA $7k, (5) If you have a side business — Solo 401k, SEP-IRA, or S-corp. A CPA specializing in FIRE/high-income clients can often find an additional $10–20k in annual tax savings." },
        { q: "Should a $250k earner care about the Roth vs Traditional debate?", a: "Yes — significantly. At $250k income, you're in the 32–35% marginal bracket. In FIRE with $90k withdrawals, you'll be in the 22% bracket or lower. Traditional 401k makes mathematical sense: defer taxes at 32–35%, pay at 22% in retirement — an 10–13 percentage point arbitrage on every dollar." },
      ]}
      relatedPages={[
        { href: "/learn/fire-number/200000-income", label: "$200,000 Income Guide", sub: "FIRE on $200k" },
        { href: "/learn/fire-number/500000-income", label: "$500,000 Income Guide", sub: "FIRE on $500k" },
        { href: "/learn/coast-fire-calculator", label: "🏄 Coast FIRE Calculator", sub: "Your stop-saving milestone" },
        { href: "/learn/4-percent-rule", label: "📐 4% Rule Guide", sub: "Safe withdrawal science" },
      ]}
    />
  );
}
