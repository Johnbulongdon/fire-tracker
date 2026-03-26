import type { Metadata } from "next";
import IncomeFirePage from "../../_components/IncomeFirePage";

export const metadata: Metadata = {
  title: "FIRE Number on a $200,000 Salary — How to Retire Early (2025)",
  description: "Calculate your FIRE number on a $200,000 income. High-income FIRE strategies, tax optimization for $200k earners, and realistic early retirement timelines.",
  keywords: "FIRE number $200000 salary, retire early $200k income, high income FIRE $200k",
  alternates: { canonical: "https://untilfire.com/learn/fire-number/200000-income" },
};

export default function Page() {
  return (
    <IncomeFirePage
      income={200_000}
      incomeLabel="$200,000"
      taxNote="On a $200k salary, effective federal tax is roughly 24–26%. Take-home before state taxes is ~$145,000–$152,000. At this income level, strategic tax optimization can save $20,000+ annually."
      scenarios={[
        { label: "Lean FIRE", savingsRate: 72, expenses: 50_000, fireNumber: 1_250_000, years: 8 },
        { label: "Moderate", savingsRate: 58, expenses: 75_000, fireNumber: 1_875_000, years: 13 },
        { label: "Fat FIRE", savingsRate: 38, expenses: 110_000, fireNumber: 2_750_000, years: 22 },
      ]}
      insight="At $200k, a 13-year path to Moderate FIRE is very realistic. The danger zone: many $200k earners spend like $200k earners — large mortgage, luxury car, frequent travel, expensive dining. This lifestyle requires $2.75M to sustain (Fat FIRE) and takes 22+ years. Intentional spending choices determine whether you FIRE at 42 or 60."
      tip="At $200k income, the NIIT (Net Investment Income Tax) of 3.8% applies to investment income above $200k ($250k married). Plan your taxable brokerage withdrawal strategy carefully in retirement. Consider tax-loss harvesting and asset location to minimize the NIIT impact."
      faq={[
        { q: "Can I retire in under 10 years on $200k?", a: "Yes — with 70%+ savings rate. At $200k income, living on $50–60k/year and investing $140k+ annually, you can build $1.25M in 8–9 years. This requires extreme frugality (paid-off housing, no car payment, minimal dining out) but is mathematically sound." },
        { q: "What investment accounts should a $200k earner use?", a: "Order: (1) 401(k) to full $23k deferral, (2) Mega Backdoor Roth if available, (3) HSA $4,150–$8,300, (4) Backdoor Roth IRA $7k, (5) Taxable brokerage for the rest. Total tax-advantaged capacity before taxable: $34k–$66k depending on plan." },
        { q: "How does state tax affect FIRE planning at $200k?", a: "Enormously. $200k in California (13.3% top bracket) loses ~$26k to state tax. $200k in Texas: $0 state tax. That's $26k more per year to invest — roughly 4–5 fewer years to FIRE over a 20-year horizon. Many high earners with remote work relocate from high-tax to no-income-tax states specifically for FIRE acceleration." },
      ]}
      relatedPages={[
        { href: "/learn/fire-number/175000-income", label: "$175,000 Income Guide", sub: "FIRE on $175k" },
        { href: "/learn/fire-number/250000-income", label: "$250,000 Income Guide", sub: "FIRE on $250k" },
        { href: "/learn/fire-calculator", label: "🔥 FIRE Calculator", sub: "Full projection tool" },
        { href: "/learn/savings-rate-calculator", label: "📊 Savings Rate Calculator", sub: "Rate vs. timeline" },
      ]}
    />
  );
}
