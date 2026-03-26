import type { Metadata } from "next";
import IncomeFirePage from "../../_components/IncomeFirePage";

export const metadata: Metadata = {
  title: "FIRE Number on a $1,000,000 Salary — Seven Figure Income FIRE Guide (2025)",
  description: "FIRE on a $1 million income: tax strategies, asset protection, why lifestyle inflation is the main risk, and how to FIRE in 3–8 years.",
  keywords: "FIRE number $1 million salary, retire early $1M income, ultra high net worth FIRE, seven figure FIRE",
  alternates: { canonical: "https://untilfire.com/learn/fire-number/1000000-income" },
};

export default function Page() {
  return (
    <IncomeFirePage
      income={1_000_000}
      incomeLabel="$1,000,000"
      taxNote="On a $1M salary, effective federal tax is roughly 37% marginal (and effective rate of 32–34%). High-tax states take another 10–13%. Total tax burden can exceed 50% in states like California or New York. Tax minimization is the #1 wealth-building lever at this income."
      scenarios={[
        { label: "Moderate FIRE", savingsRate: 75, expenses: 150_000, fireNumber: 3_750_000, years: 6 },
        { label: "Fat FIRE", savingsRate: 65, expenses: 250_000, fireNumber: 6_250_000, years: 8 },
        { label: "Ultra Fat FIRE", savingsRate: 50, expenses: 400_000, fireNumber: 10_000_000, years: 11 },
      ]}
      insight="At $1M income, FIRE is a 6–11 year timeline problem. The math is overwhelming in your favor: even after taxes and $250k/year spending, you're investing $350k+ annually. The real challenges are: (1) maintaining lifestyle discipline as income grows, (2) tax optimization — a 37% marginal rate means every extra deduction has outsized value, (3) portfolio construction for very large accounts where index funds alone may not be optimal."
      tip="At $1M income, a Qualified Opportunity Zone (QOZ) investment can defer and potentially eliminate capital gains taxes on sold investments. Conservation easements, charitable vehicles (DAF, CRTs, CLTs), and defined benefit pension plans can provide additional tax deferral beyond standard 401k limits. A team approach (CPA + estate attorney + fee-only CFP) is essential."
      faq={[
        { q: "What is the right FIRE number for a $1M earner?", a: "The FIRE number depends on your retirement lifestyle — not your income. If you want to spend $150k/year in retirement: $3.75M. For $250k/year: $6.25M. For $400k/year: $10M. Many $1M earners are surprised to find that their FIRE lifestyle looks very different from their working lifestyle — the status goods and status spending often feel less necessary once you're free." },
        { q: "What are the key tax strategies for a $1M earner building to FIRE?", a: "Priority strategies: (1) Maximize all tax-deferred accounts (401k, defined benefit pension if available — can shelter $200k+/year for business owners), (2) S-Corp structure if self-employed to minimize SE tax, (3) Invest through a Donor Advised Fund for charitable deductions, (4) Own real estate through professional investor status if applicable (unlimited passive losses), (5) Delaware Statutory Trust or 1031 exchanges for real estate portfolio." },
        { q: "What happens after FIRE at $1M income?", a: "Many $1M earners discover that full retirement feels hollow after 6–18 months. More common outcomes: transition to passion projects, consulting at reduced hours, philanthropy, or angel investing. The financial independence is real and permanent — the 'retire early' often evolves into 'work on my terms.' The FIRE number provides optionality, not necessarily a full stop." },
      ]}
      relatedPages={[
        { href: "/learn/fire-number/500000-income", label: "$500,000 Income Guide", sub: "FIRE on $500k" },
        { href: "/learn/fire-number/250000-income", label: "$250,000 Income Guide", sub: "FIRE on $250k" },
        { href: "/learn/4-percent-rule", label: "📐 4% Rule Guide", sub: "Safe withdrawal science" },
        { href: "/learn/coast-fire-calculator", label: "🏄 Coast FIRE Calculator", sub: "Your stop-saving milestone" },
      ]}
    />
  );
}
