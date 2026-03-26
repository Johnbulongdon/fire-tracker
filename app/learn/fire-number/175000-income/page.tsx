import type { Metadata } from "next";
import IncomeFirePage from "../../_components/IncomeFirePage";

export const metadata: Metadata = {
  title: "FIRE Number on a $175,000 Salary — How to Retire Early (2025)",
  description: "Calculate your FIRE number on a $175,000 income. High-income FIRE strategies, tax optimization, and realistic timelines.",
  keywords: "FIRE number $175000 salary, retire early $175k income, high income FIRE",
  alternates: { canonical: "https://untilfire.com/learn/fire-number/175000-income" },
};

export default function Page() {
  return (
    <IncomeFirePage
      income={175_000}
      incomeLabel="$175,000"
      taxNote="On a $175k salary, effective federal tax is roughly 23–25%. Take-home before state taxes is ~$128,000–$133,000. At this income, high-impact tax optimization strategies become especially valuable."
      scenarios={[
        { label: "Lean FIRE", savingsRate: 70, expenses: 45_000, fireNumber: 1_125_000, years: 9 },
        { label: "Moderate", savingsRate: 55, expenses: 68_000, fireNumber: 1_700_000, years: 14 },
        { label: "Fat FIRE", savingsRate: 35, expenses: 100_000, fireNumber: 2_500_000, years: 24 },
      ]}
      insight="$175k income makes early retirement very achievable. At 55% savings, you're investing $96k/year — the compounding effect at this level is dramatic. A $1.7M portfolio generating 4% ($68k/year) is a very comfortable lifestyle in most of the world. The main threat: lifestyle inflation driven by high-earning peer groups."
      tip="At $175k income, consider a mega backdoor Roth if your 401(k) plan allows after-tax contributions with in-service conversions — this can add up to $43,000/year (total contribution limit minus employee deferral) in Roth savings on top of your standard contributions."
      faq={[
        { q: "What FIRE number should I target on $175k?", a: "For moderate Fat FIRE ($68–75k/year spending): $1.7–1.875M. For true Fat FIRE ($100k/year): $2.5M. For Lean/Coast FIRE: $1M–$1.25M. Choose based on your target retirement lifestyle, not income." },
        { q: "How do I reduce taxes on $175k income while building to FIRE?", a: "Primary strategies: (1) Max traditional 401k to reduce taxable income from $175k to $152k — saves ~$5,000 in federal tax. (2) HSA contributions ($4,150–$8,300) — triple tax advantage. (3) Backdoor Roth IRA ($7k). (4) If self-employed, Solo 401k allows up to $66k/year total contributions." },
        { q: "Should a $175k earner use Lean or Fat FIRE strategy?", a: "Most $175k earners eventually target Moderate FIRE ($68–80k/year spending) — enough for an excellent lifestyle without the extreme frugality of Lean FIRE. True Fat FIRE ($100k+/year) requires $2.5M+ and takes 20+ years at standard savings rates. The optimal strategy: Lean early years, then inflate lifestyle after hitting Coast FIRE." },
      ]}
      relatedPages={[
        { href: "/learn/fire-number/150000-income", label: "$150,000 Income Guide", sub: "FIRE on $150k" },
        { href: "/learn/fire-number/200000-income", label: "$200,000 Income Guide", sub: "FIRE on $200k" },
        { href: "/learn/coast-fire-calculator", label: "🏄 Coast FIRE Calculator", sub: "Your stop-saving milestone" },
        { href: "/learn/4-percent-rule", label: "📐 4% Rule Guide", sub: "Safe withdrawal rate" },
      ]}
    />
  );
}
