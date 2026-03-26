import type { Metadata } from "next";
import IncomeFirePage from "../../_components/IncomeFirePage";

export const metadata: Metadata = {
  title: "FIRE Number on a $100,000 Salary — How to Retire Early (2025)",
  description: "Calculate your FIRE number on a $100,000 income. Three scenarios, exact savings rates, tax-adjusted timelines, and the investment order of operations.",
  keywords: "FIRE number $100000 salary, retire early $100k income, financial independence six figures",
  alternates: { canonical: "https://untilfire.com/learn/fire-number/100000-income" },
};

export default function Page() {
  return (
    <IncomeFirePage
      income={100_000}
      incomeLabel="$100,000"
      taxNote="On a $100k salary, effective federal tax is roughly 18–20%, leaving ~$78,000–$82,000 take-home before state taxes. Six-figure income is the most searched FIRE scenario — and for good reason, it's highly actionable."
      scenarios={[
        { label: "Lean FIRE", savingsRate: 60, expenses: 30_000, fireNumber: 750_000, years: 11 },
        { label: "Moderate", savingsRate: 40, expenses: 48_000, fireNumber: 1_200_000, years: 20 },
        { label: "Comfortable", savingsRate: 25, expenses: 65_000, fireNumber: 1_625_000, years: 30 },
      ]}
      insight="$100k is the benchmark income where FIRE becomes straightforward with discipline. At 40% savings ($40k/year), you reach a $1.2M FIRE number in 20 years. The key choices: housing (keep under $1,500/month), car (buy used, no payment), and lifestyle inflation (resist it). These three decisions alone determine whether you FIRE at 45 or 65."
      tip="At $100k income, you can max 401(k) ($23k) + Roth IRA ($7k) = $30,000/year in tax-advantaged savings — a 30% savings rate before you even think about a taxable account. Build from there."
      faq={[
        { q: "What is the FIRE number on a $100k salary?", a: "It depends on spending. Common scenarios: Lean ($30k/year expenses) → $750,000 FIRE number. Moderate ($48k/year) → $1,200,000. Comfortable ($65k/year) → $1,625,000. The key driver is how much of your $100k income you actually spend in retirement." },
        { q: "How fast can you reach FIRE on $100k?", a: "At 60% savings rate: ~11 years. At 40%: ~20 years. At 25%: ~30 years. The most common realistic path for $100k earners: 40–50% savings rate, FIRE in 15–22 years, retiring in their mid-to-late 40s." },
        { q: "Should a $100k earner use Roth or Traditional 401k?", a: "At exactly $100k income, it's a close call. If you expect to be in a higher bracket in retirement (unlikely for FIRE practitioners with modest spending), Traditional is better. Most $100k FIRE investors split: Traditional 401(k) to lower current taxes, Roth IRA for tax-free retirement income. Consult a tax advisor for your specific situation." },
        { q: "What lifestyle can you afford in retirement on a $100k FIRE number?", a: "A $750,000 portfolio at 4% withdrawal generates $30,000/year. That's $2,500/month — achievable in a low-COL US city or abroad (Medellín, Lisbon, Bali). A $1.2M portfolio generates $48,000/year — comfortable in most US cities. A $1.6M+ portfolio generates $65k+ — Fat FIRE territory." },
      ]}
      relatedPages={[
        { href: "/learn/fire-number/75000-income", label: "$75,000 Income Guide", sub: "FIRE on $75k" },
        { href: "/learn/fire-number/125000-income", label: "$125,000 Income Guide", sub: "FIRE on $125k" },
        { href: "/learn/fire-calculator", label: "🔥 FIRE Calculator", sub: "Full projection tool" },
        { href: "/learn/coast-fire-calculator", label: "🏄 Coast FIRE Calculator", sub: "Your stop-saving milestone" },
      ]}
    />
  );
}
