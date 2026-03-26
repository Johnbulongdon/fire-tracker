import type { Metadata } from "next";
import Link from "next/link";
import { StandardCalc } from "../_components/LearnCalc";

export const metadata: Metadata = {
  title: "FIRE Calculator — Calculate Your Financial Independence Number (2025)",
  description:
    "Free FIRE calculator: enter your income, expenses, and current savings to see exactly when you can retire. Instant results, no sign-up required.",
  keywords: "FIRE calculator, financial independence calculator, retire early calculator, FIRE number calculator, FI calculator",
  openGraph: {
    title: "FIRE Calculator — When Can You Retire?",
    description: "Enter your income and expenses. See your FIRE number and retirement date instantly.",
    url: "https://untilfire.com/learn/fire-calculator",
  },
  alternates: { canonical: "https://untilfire.com/learn/fire-calculator" },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How does the FIRE calculator work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The FIRE calculator uses the 4% rule: your FIRE number = annual expenses × 25. Then it calculates how many years until your investments reach that target, assuming 7% annual growth (the historical average for a diversified index fund portfolio, before inflation). It accounts for your existing savings as the starting balance.",
      },
    },
    {
      "@type": "Question",
      name: "What is FIRE?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "FIRE stands for Financial Independence, Retire Early. It's a lifestyle movement focused on extreme saving and investing — typically 50–70% of income — to build a portfolio large enough to fund living expenses indefinitely. The movement has several variants: Lean FIRE (very frugal), Fat FIRE (maintain high spending), Barista FIRE (part-time work), and Coast FIRE (stop contributing, let investments compound).",
      },
    },
    {
      "@type": "Question",
      name: "What is the 4% rule?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The 4% rule comes from the Trinity Study (1998), which found that a portfolio of 50–75% stocks historically survived 30 years of 4% annual withdrawals in all historical periods. For early retirees with 40–50 year retirements, many experts recommend 3–3.5% to be safe. The 25× rule (your FIRE number) is derived from the 4% rule: 1 ÷ 0.04 = 25.",
      },
    },
    {
      "@type": "Question",
      name: "How much should I save to retire early?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Your savings rate determines your FIRE timeline more than anything else. At a 10% savings rate, you need ~46 years. At 30%: ~28 years. At 50%: ~17 years. At 70%: ~8 years. The math works because a higher savings rate simultaneously increases what you save AND decreases what you need to retire on (lower lifestyle cost = lower FIRE number).",
      },
    },
    {
      "@type": "Question",
      name: "Does the FIRE calculator assume Social Security?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No — this calculator is conservative and does not include Social Security income. If you plan to receive Social Security benefits, your actual FIRE number may be lower. Many FIRE practitioners exclude it for safety, treating SS as a bonus. You can manually reduce your annual expenses by your expected SS benefit to model this.",
      },
    },
  ],
};

const C = {
  border: "#1c1c2e",
  text: "#e8e8f2",
  muted: "#5e5e7a",
  accent: "#f97316",
  teal: "#22d3a5",
  card: "#13131e",
};

function H2({ children }: { children: React.ReactNode }) {
  return <h2 style={{ fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 16, marginTop: 0, letterSpacing: "-0.02em" }}>{children}</h2>;
}
function P({ children }: { children: React.ReactNode }) {
  return <p style={{ color: C.muted, lineHeight: 1.75, marginBottom: 14, marginTop: 0, fontSize: 15 }}>{children}</p>;
}

export default function FireCalculatorPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div style={{ marginBottom: 40 }}>
        <div style={{ fontSize: 12, color: C.accent, fontWeight: 600, marginBottom: 10, letterSpacing: "0.06em", textTransform: "uppercase" }}>
          Free Tool
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 800, color: C.text, lineHeight: 1.15, marginBottom: 14, marginTop: 0, letterSpacing: "-0.03em" }}>
          FIRE Calculator — Find Your Financial Independence Number
        </h1>
        <p style={{ fontSize: 17, color: C.muted, lineHeight: 1.6, marginTop: 0 }}>
          Enter your income, expenses, and current savings. See your FIRE number and exactly how many years until you can retire early.
        </p>
      </div>

      <StandardCalc
        defaultIncome={100_000}
        defaultExpenses={60_000}
        defaultSavings={25_000}
        title="FIRE Calculator"
      />

      <div style={{ marginBottom: 40 }}>
        <H2>How the FIRE Calculator Works</H2>
        <P>
          The calculator uses two core principles: the <strong style={{ color: C.text }}>4% rule</strong> to determine your FIRE number, and <strong style={{ color: C.text }}>7% annual portfolio growth</strong> to project how long it takes to get there.
        </P>
        <P>
          <strong style={{ color: C.text }}>Step 1 — FIRE Number:</strong> Multiply your annual expenses by 25. This is how much you need invested so that a 4% annual withdrawal covers your costs indefinitely. Example: $60,000/year in expenses × 25 = $1,500,000 FIRE number.
        </P>
        <P>
          <strong style={{ color: C.text }}>Step 2 — Years to FIRE:</strong> Starting from your current savings, the calculator adds your annual savings each year and grows the balance at 7% (historical average for a diversified stock index). It counts the years until the balance reaches your FIRE number.
        </P>
        <P>
          <strong style={{ color: C.text }}>Step 3 — Savings rate:</strong> (Income − Expenses) ÷ Income. This is the most important lever — small changes in savings rate create enormous changes in your FIRE timeline.
        </P>
      </div>

      <div style={{ marginBottom: 40 }}>
        <H2>The Most Important Insight: Savings Rate Beats Income</H2>
        <P>
          Two people earning $100k: one saves 20% ($20k/year), one saves 50% ($50k/year). The first has a FIRE timeline of ~37 years. The second: ~17 years — 20 fewer years of working. The difference isn&apos;t income, it&apos;s the rate of saving.
        </P>
        <P>
          Higher savings rate works doubly: you invest more every year AND your lifestyle costs less, so your FIRE number is smaller. A person spending $40k/year needs $1M to retire. A person spending $80k/year needs $2M. Same income, 2× the target.
        </P>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {[
            { rate: "10%", years: "46 yrs", color: "#ef4444" },
            { rate: "30%", years: "28 yrs", color: "#f97316" },
            { rate: "50%", years: "17 yrs", color: "#22d3a5" },
            { rate: "60%", years: "12 yrs", color: "#22d3a5" },
            { rate: "70%", years: "8 yrs", color: "#22d3a5" },
            { rate: "80%", years: "5 yrs", color: "#4ade80" },
          ].map(({ rate, years, color }) => (
            <div key={rate} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px", textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 700, color, marginBottom: 4 }}>{rate}</div>
              <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>savings rate</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{years}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 40 }}>
        <H2>Frequently Asked Questions</H2>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {faqSchema.mainEntity.map((item, i) => (
            <details key={i} style={{ borderBottom: `1px solid ${C.border}`, padding: "16px 0" }}>
              <summary style={{ fontSize: 15, fontWeight: 600, color: C.text, cursor: "pointer", listStyle: "none", display: "flex", justifyContent: "space-between" }}>
                {item.name}
                <span style={{ color: C.accent, marginLeft: 8 }}>+</span>
              </summary>
              <p style={{ color: C.muted, lineHeight: 1.7, fontSize: 14, marginTop: 12, marginBottom: 0 }}>
                {item.acceptedAnswer.text}
              </p>
            </details>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 40 }}>
        <H2>More FIRE Calculators & Guides</H2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { href: "/learn/coast-fire-calculator", label: "🏄 Coast FIRE Calculator", sub: "How much to invest now & coast" },
            { href: "/learn/savings-rate-calculator", label: "📊 Savings Rate Calculator", sub: "Compare rates vs. timeline" },
            { href: "/learn/4-percent-rule", label: "📐 The 4% Rule Explained", sub: "Safe withdrawal rate science" },
            { href: "/learn/fire-number", label: "🔢 FIRE Number Guide", sub: "Calculate your exact target" },
            { href: "/learn/fire-in-bali", label: "🇮🇩 FIRE in Bali", sub: "Retire on $600k" },
            { href: "/learn/fire-in-lisbon", label: "🇵🇹 FIRE in Lisbon", sub: "Europe's best retirement visa" },
          ].map(({ href, label, sub }) => (
            <Link key={href} href={href} style={{ textDecoration: "none", background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px", display: "block" }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 12, color: C.muted }}>{sub}</div>
            </Link>
          ))}
        </div>
      </div>

      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 28, textAlign: "center" }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 8 }}>Track your actual progress to FIRE</div>
        <div style={{ color: C.muted, fontSize: 14, marginBottom: 20 }}>Connect your real income, expenses, and net worth. See your FIRE date update in real-time as you make financial decisions.</div>
        <Link href="/dashboard" style={{ background: C.accent, color: "#fff", padding: "12px 28px", borderRadius: 8, textDecoration: "none", fontWeight: 600, fontSize: 15, display: "inline-block" }}>
          Open Dashboard →
        </Link>
      </div>
    </>
  );
}
