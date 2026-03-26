import type { Metadata } from "next";
import IncomeFirePage from "../../_components/IncomeFirePage";

export const metadata: Metadata = {
  title: "FIRE Number on a $75,000 Salary — How to Retire Early (2025)",
  description: "Calculate your FIRE number on a $75,000 income. Lean, moderate, and comfortable scenarios with realistic savings rates and FIRE timelines.",
  keywords: "FIRE number $75000 salary, retire early $75k income, financial independence $75000",
  alternates: { canonical: "https://untilfire.com/learn/fire-number/75000-income" },
};

export default function Page() {
  return (
    <IncomeFirePage
      income={75_000}
      incomeLabel="$75,000"
      taxNote="On a $75k salary, effective federal tax is roughly 16–18%, leaving ~$60,000–$63,000 take-home before state taxes. This income puts FIRE within comfortable reach with consistent saving."
      scenarios={[
        { label: "Lean FIRE", savingsRate: 50, expenses: 25_000, fireNumber: 625_000, years: 15 },
        { label: "Moderate", savingsRate: 35, expenses: 37_500, fireNumber: 937_500, years: 23 },
        { label: "Comfortable", savingsRate: 20, expenses: 50_000, fireNumber: 1_250_000, years: 36 },
      ]}
      insight="$75k is a sweet spot for FIRE: high enough to save aggressively, common enough that the math applies broadly. A 35% savings rate ($26,250/year invested) leads to FIRE in ~23 years on $37,500/year expenses. Maxing a 401(k) ($23,000) alone gets you to a 30% savings rate."
      tip="At $75k, maxing your 401(k) and Roth IRA uses most of your savings capacity. Build a taxable brokerage on top. For early retirement access before 59½, plan a Roth conversion ladder 5 years before your FIRE date."
      faq={[
        { q: "What FIRE number should I target on $75k?", a: "It depends on your target lifestyle. For Lean FIRE ($25k/year spending), your target is $625,000. For a moderate lifestyle ($40k/year), target $1,000,000. For comfortable FIRE ($50k/year), target $1,250,000. The 'right' FIRE number is 25× whatever annual spending makes you happy in retirement." },
        { q: "How long does it take to reach FIRE on $75k?", a: "At a 35% savings rate: ~23 years. At 50%: ~15 years. At 20%: ~36 years. Most $75k earners with standard expenses (rent, car, food) save 20–30% naturally; intentional budgeting pushes that to 40–50%, cutting the timeline by 10–15 years." },
        { q: "Should I prioritize 401k or IRA on $75k?", a: "Max the 401(k) to get employer match first (free money), then Roth IRA ($7,000/year). If you have more to save, fill the 401(k) to the $23,000 limit, then taxable brokerage. At $75k income, Roth is usually better than traditional due to lower current tax rates." },
      ]}
      relatedPages={[
        { href: "/learn/fire-number/50000-income", label: "$50,000 Income Guide", sub: "FIRE on $50k" },
        { href: "/learn/fire-number/100000-income", label: "$100,000 Income Guide", sub: "FIRE on $100k" },
        { href: "/learn/coast-fire-calculator", label: "🏄 Coast FIRE Calculator", sub: "Your stop-saving milestone" },
        { href: "/learn/savings-rate-calculator", label: "📊 Savings Rate Calculator", sub: "Rate vs. timeline" },
      ]}
    />
  );
}
