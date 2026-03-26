import type { Metadata } from "next";
import IncomeFirePage from "../../_components/IncomeFirePage";

export const metadata: Metadata = {
  title: "FIRE Number on a $50,000 Salary — How to Retire Early (2025)",
  description: "Calculate your FIRE number on a $50,000 income. Lean, moderate, and comfortable scenarios with realistic timelines and tax-adjusted savings rates.",
  keywords: "FIRE number $50000 salary, retire early $50k income, financial independence $50000",
  alternates: { canonical: "https://untilfire.com/learn/fire-number/50000-income" },
};

export default function Page() {
  return (
    <IncomeFirePage
      income={50_000}
      incomeLabel="$50,000"
      taxNote="On a $50k salary in the US, effective federal tax is roughly 12–15%, leaving $42,000–$44,000 take-home (before state taxes). FIRE is achievable — it requires intentional spending."
      scenarios={[
        { label: "Lean FIRE", savingsRate: 40, expenses: 25_000, fireNumber: 625_000, years: 22 },
        { label: "Moderate", savingsRate: 25, expenses: 31_000, fireNumber: 775_000, years: 34 },
        { label: "Comfortable", savingsRate: 10, expenses: 40_000, fireNumber: 1_000_000, years: 51 },
      ]}
      insight="A $50k salary makes FIRE achievable but requires discipline. The biggest lever is housing — if you can keep rent or mortgage under $900/month (house hacking, roommates, low-COL city), a 40%+ savings rate is very realistic. At 40% savings, FIRE in 22 years is achievable."
      tip="Geo arbitrage is especially powerful at this income level. Moving from a high-COL city to a place like Medellín or Bali could let you FIRE immediately — your $25,000 annual FIRE expenses in the US become $18,000–20,000 abroad."
      faq={[
        { q: "Can you really retire early on a $50k salary?", a: "Yes — FIRE on $50k requires aggressive savings (35–50%) and low expenses, but it's very achievable over 15–25 years, especially with a partner. Many $50k earners in lower cost-of-living areas save 40%+ and reach FIRE in their late 40s." },
        { q: "What's a realistic savings rate on $50k income?", a: "After taxes and essential expenses, 20–35% is realistic for most $50k earners in medium-COL areas. With intentional choices (no car payments, roommates, cooking at home), 40–50% is achievable. In a high-COL city like NYC, 15–20% is more realistic." },
        { q: "How does $50k income affect FIRE strategy vs. higher incomes?", a: "At $50k, every dollar of expense reduction has double impact: it increases savings AND reduces your FIRE number. The math strongly favors minimizing lifestyle costs over maximizing income (though both help). Many $50k FIRE practitioners use geo arbitrage — FIRE in the US, then move abroad to stretch the portfolio." },
      ]}
      relatedPages={[
        { href: "/learn/fire-number/75000-income", label: "$75,000 Income Guide", sub: "FIRE number on $75k" },
        { href: "/learn/fire-number/100000-income", label: "$100,000 Income Guide", sub: "FIRE number on $100k" },
        { href: "/learn/fire-in-bali", label: "🇮🇩 FIRE in Bali", sub: "Make $50k go much further" },
        { href: "/learn/savings-rate-calculator", label: "📊 Savings Rate Calculator", sub: "Find your optimal rate" },
      ]}
    />
  );
}
