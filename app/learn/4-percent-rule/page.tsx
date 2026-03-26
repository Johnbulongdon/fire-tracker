import type { Metadata } from "next";
import Link from "next/link";
import { StandardCalc } from "../_components/LearnCalc";

export const metadata: Metadata = {
  title: "The 4% Rule Explained — Safe Withdrawal Rate for Early Retirees (2025)",
  description:
    "The complete guide to the 4% rule: where it comes from, when it works, when it fails, and what withdrawal rate to use for early retirement. Includes calculator.",
  keywords: "4 percent rule, safe withdrawal rate, Trinity Study, FIRE withdrawal rate, retirement withdrawal calculator",
  openGraph: {
    title: "The 4% Rule: Complete Guide for Early Retirees",
    description: "Where the 4% rule comes from, when it fails, and what withdrawal rate FIRE retirees should actually use.",
    url: "https://untilfire.com/learn/4-percent-rule",
  },
  alternates: { canonical: "https://untilfire.com/learn/4-percent-rule" },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is the 4% rule?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The 4% rule states that you can withdraw 4% of your portfolio annually (adjusted for inflation) and your portfolio will survive 30 years in virtually all historical market conditions. It comes from the Trinity Study (1998) by Cooley, Hubbard, and Walz, which analyzed historical returns for 50/50 to 75/25 stock/bond portfolios from 1926–1995.",
      },
    },
    {
      "@type": "Question",
      name: "Is the 4% rule safe for early retirement?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The original 4% rule was designed for 30-year retirements. For early retirees with 40–50 year horizons, many experts recommend 3–3.5% to be safe. At 3.5%, your FIRE number is 28.6× annual expenses instead of 25×. The difference: $60,000/year expenses → FIRE number of $1.5M (4% rule) vs. $1.72M (3.5% rule). The extra $220k buys significantly more safety.",
      },
    },
    {
      "@type": "Question",
      name: "What's the difference between the 4% rule and the 25× rule?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "They're the same thing stated differently. The 25× rule says your FIRE number = annual expenses × 25. The 4% rule says your safe annual withdrawal = portfolio value × 4%. Mathematically: 1 ÷ 0.04 = 25. So '25× your expenses' and '4% withdrawal rate' are identical concepts.",
      },
    },
    {
      "@type": "Question",
      name: "What if the 4% rule fails?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Historical failure rates for the 4% rule over 30 years are very low (under 5%). Over 50 years, failure rates rise. Practical safeguards: (1) flexible spending — cut withdrawals by 10–20% in bad market years, (2) part-time income — even $10,000/year dramatically improves survivability, (3) geographic flexibility — move to a lower-COL location during downturns, (4) Roth conversion ladder — optimize tax efficiency during low-income years.",
      },
    },
    {
      "@type": "Question",
      name: "Should I use 3.5% or 4% for my FIRE plan?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "For most early retirees (retiring before 50), 3.25–3.5% provides a meaningful safety buffer. If you have flexibility (ability to earn some income, cut spending, or relocate), 4% is historically well-supported. The honest answer: build your plan around 3.5%, then treat anything beyond that as upside. The cost of being wrong is too high to optimize for the aggressive case.",
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
  purple: "#8b5cf6",
};

function H2({ children }: { children: React.ReactNode }) {
  return <h2 style={{ fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 16, marginTop: 0, letterSpacing: "-0.02em" }}>{children}</h2>;
}
function P({ children }: { children: React.ReactNode }) {
  return <p style={{ color: C.muted, lineHeight: 1.75, marginBottom: 14, marginTop: 0, fontSize: 15 }}>{children}</p>;
}

export default function FourPercentRulePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div style={{ marginBottom: 40 }}>
        <div style={{ fontSize: 12, color: C.accent, fontWeight: 600, marginBottom: 10, letterSpacing: "0.06em", textTransform: "uppercase" }}>
          FIRE Fundamentals
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 800, color: C.text, lineHeight: 1.15, marginBottom: 14, marginTop: 0, letterSpacing: "-0.03em" }}>
          The 4% Rule: Complete Guide for Early Retirees
        </h1>
        <p style={{ fontSize: 17, color: C.muted, lineHeight: 1.6, marginTop: 0 }}>
          The 4% rule is the foundation of every FIRE plan — but it was designed for 30-year retirements, not 50-year ones. Here&apos;s what the research actually says, what rate to use, and how to plan for the cases where it fails.
        </p>
      </div>

      <StandardCalc
        defaultIncome={100_000}
        defaultExpenses={60_000}
        defaultSavings={0}
        title="4% Rule Calculator — Your FIRE Number"
      />

      <div style={{ marginBottom: 40 }}>
        <H2>The Origin: The Trinity Study</H2>
        <P>
          In 1998, three finance professors at Trinity University — Cooley, Hubbard, and Walz — published a paper called &quot;Retirement Savings: Choosing a Withdrawal Rate That Is Sustainable.&quot; They analyzed rolling 30-year periods from 1926 to 1995 and tested whether different withdrawal rates would leave a portfolio surviving to the end.
        </P>
        <P>
          The conclusion: a 4% annual withdrawal (inflation-adjusted) from a 50–75% stock portfolio survived all historical 30-year periods. The portfolio didn&apos;t just survive — in most periods, it grew. Retiring with $1 million at 4% ($40k/year), historically, usually left retirees with more than $1 million at the end of 30 years.
        </P>
        <P>
          Bill Bengen independently arrived at the same conclusion in 1994, calling it the &quot;4.15% rule&quot; based on his own simulations. The FIRE community simplified it to 4%, and the &quot;25× rule&quot; (1 ÷ 0.04) became the standard for calculating FIRE numbers.
        </P>
      </div>

      <div style={{ marginBottom: 40 }}>
        <H2>The Problem for Early Retirees</H2>
        <P>
          The Trinity Study modeled 30-year retirements. If you retire at 65, that covers you to 95 — reasonable. If you retire at 35, you need 60+ years of portfolio survival. The failure rates over 50 years are meaningfully higher.
        </P>
        <div style={{ overflowX: "auto", marginBottom: 16 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr>
                {["Withdrawal Rate", "FIRE Multiplier", "30-Year Success", "50-Year Success"].map((h) => (
                  <th key={h} style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, textAlign: "left", color: C.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["3%", "33×", "~100%", "~98%", C.teal],
                ["3.5%", "28.6×", "~100%", "~95%", C.teal],
                ["4%", "25×", "~96%", "~87%", C.accent],
                ["4.5%", "22×", "~91%", "~74%", "#f97316"],
                ["5%", "20×", "~80%", "~60%", "#ef4444"],
              ].map(([rate, mult, y30, y50, color]) => (
                <tr key={rate}>
                  <td style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, color: color as string, fontWeight: 600 }}>{rate}</td>
                  <td style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, color: C.muted }}>{mult}</td>
                  <td style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, color: C.muted }}>{y30}</td>
                  <td style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, color: C.muted }}>{y50}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <P>
          The practical recommendation for most early retirees: plan at 3.5% (28.6× expenses). This adds a meaningful safety buffer while only modestly increasing your FIRE number. At $60k/year in expenses: $1.5M at 4% vs. $1.72M at 3.5%. The extra $220k buys a lot of peace of mind.
        </P>
      </div>

      <div style={{ marginBottom: 40 }}>
        <H2>What If It Fails? Practical Safeguards</H2>
        <P>
          The 4% rule failing doesn&apos;t mean you go broke in year 1 — it means the portfolio trends toward zero over 30–50 years in the worst historical market sequences. You&apos;d see it coming years in advance and have time to adapt. Real-world safeguards:
        </P>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {[
            { tactic: "Flexible spending", detail: "In bad market years, cut withdrawals 10–20%. This simple rule dramatically improves portfolio survival rates." },
            { tactic: "Part-time income", detail: "Even $10–15k/year of earned income means you withdraw 15–25% less from your portfolio. A massive improvement in survival odds." },
            { tactic: "Geographic flexibility", detail: "Move to a lower cost-of-living city or country during a market downturn. $60k/year lifestyle becomes $30k in Medellín or Chiang Mai." },
            { tactic: "Roth conversion ladder", detail: "Convert traditional IRA/401(k) to Roth during low-income years. Build tax-free income for later decades." },
            { tactic: "Social Security buffer", detail: "If you retire early, SS kicks in decades later — reducing portfolio pressure significantly in your 60s and beyond." },
          ].map(({ tactic, detail }) => (
            <div key={tactic} style={{ display: "flex", gap: 12, padding: "14px 0", borderBottom: `1px solid ${C.border}`, alignItems: "flex-start" }}>
              <span style={{ color: C.teal, fontSize: 16, paddingTop: 1 }}>→</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 4 }}>{tactic}</div>
                <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>{detail}</div>
              </div>
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
        <H2>Related Tools</H2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { href: "/learn/fire-calculator", label: "🔥 FIRE Calculator", sub: "Calculate your retirement timeline" },
            { href: "/learn/coast-fire-calculator", label: "🏄 Coast FIRE Calculator", sub: "Your stop-saving milestone" },
            { href: "/learn/savings-rate-calculator", label: "📊 Savings Rate Calculator", sub: "Rate vs. years comparison" },
            { href: "/learn/fire-number", label: "🔢 FIRE Number Guide", sub: "Exactly what you need" },
          ].map(({ href, label, sub }) => (
            <Link key={href} href={href} style={{ textDecoration: "none", background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px", display: "block" }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 12, color: C.muted }}>{sub}</div>
            </Link>
          ))}
        </div>
      </div>

      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 28, textAlign: "center" }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 8 }}>Track your path to the 4% rule</div>
        <div style={{ color: C.muted, fontSize: 14, marginBottom: 20 }}>Log transactions, watch your portfolio grow, see the day your 4% withdrawal covers your lifestyle.</div>
        <Link href="/dashboard" style={{ background: C.accent, color: "#fff", padding: "12px 28px", borderRadius: 8, textDecoration: "none", fontWeight: 600, fontSize: 15, display: "inline-block" }}>
          Open Dashboard →
        </Link>
      </div>
    </>
  );
}
