import type { Metadata } from "next";
import IncomeFirePage from "../../_components/IncomeFirePage";

export const metadata: Metadata = {
  title: "FIRE Number on a $150,000 Salary — How to Retire Early (2025)",
  description: "Calculate your FIRE number on a $150,000 income. Three FIRE scenarios, tax-optimized savings strategies, and realistic timelines for six-figure earners.",
  keywords: "FIRE number $150000 salary, retire early $150k income, financial independence $150k",
  alternates: { canonical: "https://untilfire.com/learn/fire-number/150000-income" },
};

export default function Page() {
  return (
    <IncomeFirePage
      income={150_000}
      incomeLabel="$150,000"
      taxNote="On a $150k salary, effective federal tax is roughly 22–24%, leaving ~$110,000–$115,000 take-home before state taxes. High state taxes (CA, NY) can significantly reduce take-home — model your specific location."
      scenarios={[
        { label: "Lean FIRE", savingsRate: 68, expenses: 40_000, fireNumber: 1_000_000, years: 9 },
        { label: "Moderate", savingsRate: 50, expenses: 60_000, fireNumber: 1_500_000, years: 15 },
        { label: "Fat FIRE", savingsRate: 30, expenses: 90_000, fireNumber: 2_250_000, years: 27 },
      ]}
      insight="At $150k, a 50% savings rate ($75k/year) is very achievable for a single person — it leaves $75k/year for comfortable living in most US cities. With this approach, FIRE in 15 years on $1.5M is realistic. High-tax states change the math significantly — $150k in California has much less savings potential than $150k in Texas."
      tip="High-income earners should maximize all tax-advantaged space aggressively: 401(k) $23k + HSA $4.15k + Backdoor Roth IRA $7k = $34k+ saved before state and federal taxes can touch it. In high-tax states, this is worth $8,000–12,000 in annual tax savings."
      faq={[
        { q: "Can I retire in 10 years on $150k salary?", a: "Yes, if you save 65–70% of your income. At $150k with a 68% savings rate ($102k/year saved), you can FIRE in ~9 years on $40k/year retirement spending. This requires living on ~$48k/year — achievable if housing costs are low (paid-off home, low-COL city, or no car)." },
        { q: "How does the Backdoor Roth IRA work for $150k earners?", a: "At $150k income (over the Roth IRA phase-out limits of $146k–$161k for single filers in 2024), you can't contribute to a Roth IRA directly. Instead, contribute to a traditional IRA (non-deductible) then immediately convert to Roth — the 'backdoor' strategy. This preserves tax-free growth. Max: $7,000/year." },
        { q: "What's the difference between $150k FIRE in California vs Texas?", a: "Dramatically different. $150k in California after state taxes (9.3%) leaves ~$100k take-home. In Texas (no income tax), take-home is ~$112k. That's a 12% difference in savings capacity — roughly 2–3 fewer years to FIRE for the Texas resident, all else equal." },
      ]}
      relatedPages={[
        { href: "/learn/fire-number/125000-income", label: "$125,000 Income Guide", sub: "FIRE on $125k" },
        { href: "/learn/fire-number/175000-income", label: "$175,000 Income Guide", sub: "FIRE on $175k" },
        { href: "/learn/fire-calculator", label: "🔥 FIRE Calculator", sub: "Full projection tool" },
        { href: "/learn/savings-rate-calculator", label: "📊 Savings Rate Calculator", sub: "Rate vs. timeline" },
      ]}
    />
  );
}
