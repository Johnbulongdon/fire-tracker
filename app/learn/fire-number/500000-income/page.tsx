import type { Metadata } from "next";
import IncomeFirePage from "../../_components/IncomeFirePage";

export const metadata: Metadata = {
  title: "FIRE Number on a $500,000 Salary — Ultra High Income FIRE Guide (2025)",
  description: "Calculate your FIRE number on a $500,000 income. FIRE in 3–10 years, tax strategies for high earners, and how to avoid lifestyle inflation at $500k.",
  keywords: "FIRE number $500000 salary, retire early $500k income, ultra high income FIRE, Fat FIRE",
  alternates: { canonical: "https://untilfire.com/learn/fire-number/500000-income" },
};

export default function Page() {
  return (
    <IncomeFirePage
      income={500_000}
      incomeLabel="$500,000"
      taxNote="On a $500k salary, effective federal tax is roughly 33–35%. High-tax states add 9–13% more. Take-home can be as low as $270,000 in California or as high as $330,000 in Texas. Location matters enormously at this income."
      scenarios={[
        { label: "Lean/Moderate FIRE", savingsRate: 80, expenses: 80_000, fireNumber: 2_000_000, years: 5 },
        { label: "Fat FIRE", savingsRate: 70, expenses: 120_000, fireNumber: 3_000_000, years: 7 },
        { label: "Luxury FIRE", savingsRate: 50, expenses: 200_000, fireNumber: 5_000_000, years: 13 },
      ]}
      insight="At $500k income, you can FIRE in 5–13 years even with significant lifestyle spending. The primary risk at this income level is not reaching your FIRE number — it's failing to achieve it because of lifestyle inflation, tax inefficiency, or financial advisor fees eroding returns. Every 1% in annual fees costs you years of additional work."
      tip="At $500k income, you may be subject to FICA phase-outs, NIIT (3.8% on investment income), and potentially the Additional Medicare Tax (0.9%). Consider an S-Corp structure if self-employed to reduce SE taxes. A CPA + fee-only financial advisor is mandatory at this income — the potential savings dwarf their fees."
      faq={[
        { q: "What is FIRE like at a $500k income?", a: "At $500k, FIRE is a 5–13 year project depending on lifestyle choices. The challenge isn't the math — it's psychological: it's hard to live on $80k/year when earning $500k, and even harder when your peers are spending $300k+. The $500k earners who FIRE in 5–7 years are extreme outliers who maintain moderate lifestyles despite high income." },
        { q: "How should a $500k earner invest beyond maxing accounts?", a: "After maxing all tax-advantaged accounts (~$34–66k depending on plan type), a $500k earner invests $200k+ annually in taxable accounts. Key strategies: (1) Low-turnover index funds to minimize capital gains, (2) Tax-loss harvesting, (3) Municipal bonds (interest is often state and federal tax exempt), (4) Direct indexing at scale for customized tax optimization." },
        { q: "What lifestyle can $500k FIRE support?", a: "At Moderate FIRE ($80k/year from a $2M portfolio), you live comfortably in most US cities or very luxuriously abroad. At Fat FIRE ($120k/year from $3M), you maintain a genuinely excellent US lifestyle. At Luxury FIRE ($200k/year from $5M), you maintain near-current lifestyle. Note: $500k earners often discover their 'FIRE number' keeps growing as they earn more — a psychological trap to guard against." },
      ]}
      relatedPages={[
        { href: "/learn/fire-number/250000-income", label: "$250,000 Income Guide", sub: "FIRE on $250k" },
        { href: "/learn/fire-number/1000000-income", label: "$1,000,000 Income Guide", sub: "FIRE on $1M" },
        { href: "/learn/fire-calculator", label: "🔥 FIRE Calculator", sub: "Full projection tool" },
        { href: "/learn/4-percent-rule", label: "📐 4% Rule Guide", sub: "Safe withdrawal science" },
      ]}
    />
  );
}
