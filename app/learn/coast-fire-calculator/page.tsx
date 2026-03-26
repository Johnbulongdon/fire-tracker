import type { Metadata } from "next";
import Link from "next/link";
import { CoastCalc } from "../_components/LearnCalc";

export const metadata: Metadata = {
  title: "Coast FIRE Calculator — Find Your Coast FIRE Number (2025)",
  description:
    "Free Coast FIRE calculator: find out how much you need invested today to stop contributing and let compound interest carry you to FIRE. Instant results.",
  keywords: "coast FIRE calculator, coast FIRE number, coast FI, barista FIRE, financial independence calculator",
  openGraph: {
    title: "Coast FIRE Calculator — Stop Saving Now and Still Retire",
    description: "Find your Coast FIRE number — the amount you need invested today to retire on schedule without contributing another dollar.",
    url: "https://untilfire.com/learn/coast-fire-calculator",
  },
  alternates: { canonical: "https://untilfire.com/learn/coast-fire-calculator" },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is Coast FIRE?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Coast FIRE is a milestone where you have enough invested that — even without adding another dollar — your portfolio will grow to your full FIRE target by your planned retirement age. Once you hit Coast FIRE, you only need to cover your current living expenses (not save aggressively). Many people achieve Coast FIRE in their 30s and shift to lower-stress work.",
      },
    },
    {
      "@type": "Question",
      name: "How is the Coast FIRE number calculated?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Coast FIRE = FIRE Target ÷ (1 + growth rate)^years_until_retirement. Your FIRE target is annual expenses × 25. The formula discounts your FIRE target back to today's dollars at your expected portfolio growth rate. Example: $1.5M FIRE target in 30 years at 7% growth → Coast FIRE number = $1,500,000 ÷ (1.07)^30 = ~$197,000.",
      },
    },
    {
      "@type": "Question",
      name: "What can I do after hitting Coast FIRE?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "After Coast FIRE, you only need to cover your living expenses — no longer need to save aggressively. Common strategies: switch to part-time work (Barista FIRE), take a lower-paying job you love, start a passion project, move to a lower cost-of-living location. Some people use it as a mental reset: they feel financially secure enough to take career risks.",
      },
    },
    {
      "@type": "Question",
      name: "Is Coast FIRE risky?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The main risk is sequence-of-returns risk — if markets drop significantly early in your Coast FIRE period, your portfolio may not compound as expected. Build in a safety buffer: target a Coast FIRE number 10–20% higher than the calculator shows, or use 6% instead of 7% growth. Also ensure you have healthcare covered during the years you're not aggressively saving.",
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

export default function CoastFireCalculatorPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div style={{ marginBottom: 40 }}>
        <div style={{ fontSize: 12, color: C.accent, fontWeight: 600, marginBottom: 10, letterSpacing: "0.06em", textTransform: "uppercase" }}>
          Free Calculator
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 800, color: C.text, lineHeight: 1.15, marginBottom: 14, marginTop: 0, letterSpacing: "-0.03em" }}>
          Coast FIRE Calculator — Your Stop-Saving Number
        </h1>
        <p style={{ fontSize: 17, color: C.muted, lineHeight: 1.6, marginTop: 0 }}>
          Find exactly how much you need invested today so that compound interest alone carries you to full retirement — without contributing another dollar. Adjust any input and see results instantly.
        </p>
      </div>

      <CoastCalc
        defaultExpenses={60_000}
        defaultCurrentAge={30}
        defaultRetireAge={60}
        defaultCurrentSavings={80_000}
      />

      <div style={{ marginBottom: 40 }}>
        <H2>What Is Coast FIRE and Why It Changes Everything</H2>
        <P>
          Traditional FIRE thinking is binary: save aggressively until you hit your number, then stop working. Coast FIRE introduces a powerful middle milestone — the point where you can stop adding to your investments and let compound interest do the rest.
        </P>
        <P>
          The math is extraordinary. A 25-year-old who invests $100,000 in index funds and never contributes again will have approximately $2.1 million at age 65 (at 7% growth). That&apos;s the Coast FIRE principle — early money compounds for decades and dwarfs later contributions.
        </P>
        <P>
          Once you hit Coast FIRE, you shift from accumulation mode to sustenance mode: you only need to cover your current living expenses. You can take a lower-paying job you love, go part-time, start a business, or travel — without guilt about &quot;falling behind.&quot;
        </P>
        <P>
          Many people hit Coast FIRE in their early 30s after a few years of aggressive saving in their 20s. The rest of the path to full FIRE becomes optional — a freedom most people never experience.
        </P>
      </div>

      <div style={{ marginBottom: 40 }}>
        <H2>Coast FIRE vs. Regular FIRE vs. Barista FIRE</H2>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {[
            { name: "Lean FIRE", desc: "Retire early with minimal expenses ($25–40k/year). Maximum freedom, minimum spending.", target: "$625k–$1M" },
            { name: "Coast FIRE", desc: "Invest enough now to stop contributing. Work for fun/expenses, let investments compound.", target: "Varies by age" },
            { name: "Barista FIRE", desc: "Part-time work covers expenses. Portfolio compounds untouched until full FIRE.", target: "$300k–$600k" },
            { name: "Regular FIRE", desc: "Full financial independence. Portfolio covers all expenses. No work required.", target: "$1M–$2.5M" },
            { name: "Fat FIRE", desc: "Full independence with high spending ($100k+/year). Maximum lifestyle flexibility.", target: "$2.5M–$5M+" },
          ].map(({ name, desc, target }) => (
            <div key={name} style={{ display: "flex", gap: 16, padding: "14px 0", borderBottom: `1px solid ${C.border}`, alignItems: "flex-start" }}>
              <div style={{ minWidth: 120, fontSize: 14, fontWeight: 600, color: C.text, paddingTop: 2 }}>{name}</div>
              <div style={{ flex: 1, fontSize: 14, color: C.muted, lineHeight: 1.6 }}>{desc}</div>
              <div style={{ minWidth: 100, fontSize: 13, color: C.teal, fontWeight: 600, textAlign: "right" }}>{target}</div>
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
        <H2>Related Calculators</H2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { href: "/learn/fire-calculator", label: "🔥 FIRE Calculator", sub: "Full retirement timeline" },
            { href: "/learn/savings-rate-calculator", label: "📊 Savings Rate", sub: "Rate vs. years comparison" },
            { href: "/learn/4-percent-rule", label: "📐 4% Rule Explained", sub: "The science of safe withdrawal" },
            { href: "/learn/fire-number", label: "🔢 FIRE Number Guide", sub: "Calculate your target" },
          ].map(({ href, label, sub }) => (
            <Link key={href} href={href} style={{ textDecoration: "none", background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px", display: "block" }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 12, color: C.muted }}>{sub}</div>
            </Link>
          ))}
        </div>
      </div>

      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 28, textAlign: "center" }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 8 }}>Track your Coast FIRE progress</div>
        <div style={{ color: C.muted, fontSize: 14, marginBottom: 20 }}>Log net worth milestones, watch your investments compound, and see the moment you hit Coast FIRE.</div>
        <Link href="/dashboard" style={{ background: C.accent, color: "#fff", padding: "12px 28px", borderRadius: 8, textDecoration: "none", fontWeight: 600, fontSize: 15, display: "inline-block" }}>
          Open Dashboard →
        </Link>
      </div>
    </>
  );
}
