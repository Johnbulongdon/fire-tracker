import type { Metadata } from "next";
import IncomeFirePage from "../../_components/IncomeFirePage";

export const metadata: Metadata = {
  title: "FIRE Number on a $125,000 Salary — How to Retire Early (2025)",
  description: "Calculate your FIRE number on a $125,000 income. Lean, moderate, and Fat FIRE scenarios with realistic timelines and investment strategies.",
  keywords: "FIRE number $125000 salary, retire early $125k income, financial independence $125k",
  alternates: { canonical: "https://untilfire.com/learn/fire-number/125000-income" },
};

export default function Page() {
  return (
    <IncomeFirePage
      income={125_000}
      incomeLabel="$125,000"
      taxNote="On a $125k salary, effective federal tax is roughly 20–22%, leaving ~$95,000–$100,000 take-home before state taxes. At this income, FIRE in 10–20 years is highly achievable."
      scenarios={[
        { label: "Lean FIRE", savingsRate: 65, expenses: 35_000, fireNumber: 875_000, years: 9 },
        { label: "Moderate", savingsRate: 45, expenses: 56_000, fireNumber: 1_400_000, years: 18 },
        { label: "Fat FIRE", savingsRate: 25, expenses: 80_000, fireNumber: 2_000_000, years: 30 },
      ]}
      insight="$125k puts you in strong FIRE territory. At 45% savings (~$56k/year), you reach $1.4M in 18 years. The trap at this income level is lifestyle creep — restaurant dinners, newer car, bigger apartment — that consumes the extra income without moving FIRE closer. Protect your savings rate as income grows."
      tip="At $125k, consider a tax optimization strategy: max HSA ($4,150 single / $8,300 family) + 401(k) ($23,000) + Roth IRA ($7,000) = $34,150 in tax-advantaged accounts. This alone represents a 27% savings rate with significant tax benefits."
      faq={[
        { q: "What FIRE number do I need on $125k income?", a: "For moderate lifestyle ($55–60k/year spending): $1.375–1.5M. For a comfortable lifestyle ($75–80k/year): $1.875–2M. For Lean FIRE ($35k/year): $875k. The 25× rule: multiply your target annual retirement spending by 25." },
        { q: "How quickly can a $125k earner reach FIRE?", a: "At 45% savings: ~18 years. At 55%: ~13 years. At 65%: ~9 years. Most $125k earners with disciplined budgets achieve 40–55% savings rates, targeting FIRE in their early-to-mid 40s." },
        { q: "What are the tax implications of FIRE on $125k?", a: "At $125k income, you're in the 22% federal bracket. In retirement with $55–60k withdrawals, you'll drop to the 12% bracket or lower — significant tax savings. Build a mix of Traditional 401k (tax deferred, taxed at lower retirement rate) and Roth accounts (tax-free) for maximum flexibility." },
      ]}
      relatedPages={[
        { href: "/learn/fire-number/100000-income", label: "$100,000 Income Guide", sub: "FIRE on $100k" },
        { href: "/learn/fire-number/150000-income", label: "$150,000 Income Guide", sub: "FIRE on $150k" },
        { href: "/learn/coast-fire-calculator", label: "🏄 Coast FIRE Calculator", sub: "Your stop-saving milestone" },
        { href: "/learn/4-percent-rule", label: "📐 4% Rule Explained", sub: "Safe withdrawal rate guide" },
      ]}
    />
  );
}
