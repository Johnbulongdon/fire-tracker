import type { Metadata } from "next";
import Link from "next/link";
import { StandardCalc } from "../_components/LearnCalc";

export const metadata: Metadata = {
  title: "FIRE in Lisbon: Cost of Living & Early Retirement Guide (2025)",
  description:
    "How much do you need to retire early in Lisbon? Real cost-of-living data, FIRE number for Portugal, D7 visa guide, and NHR tax regime explained.",
  keywords: "FIRE Lisbon, retire early Portugal, D7 visa Portugal, NHR tax regime, cost of living Lisbon",
  openGraph: {
    title: "FIRE in Lisbon: Your FIRE Number for Portugal",
    description: "Calculate how much you need to retire early in Lisbon. D7 visa, NHR tax regime, real cost data.",
    url: "https://untilfire.com/learn/fire-in-lisbon",
  },
  alternates: { canonical: "https://untilfire.com/learn/fire-in-lisbon" },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How much do I need to retire early in Lisbon?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A comfortable single-person life in Lisbon costs $2,500–3,500/month (~$36,000/year). Using the 4% rule (25× annual expenses), your FIRE number is approximately $900,000 USD. Outside Lisbon in cities like Porto, Braga, or Alentejo, you can live well on $1,800–2,500/month ($540k FIRE number).",
      },
    },
    {
      "@type": "Question",
      name: "What is the D7 Passive Income Visa for Portugal?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The D7 (Passive Income Visa) is Portugal's retirement visa. Requirements: proof of passive income of at least €760/month (minimum wage), accommodation in Portugal, and a clean criminal record. After 5 years of legal residency, you can apply for permanent residency or citizenship. The D7 is widely considered the best retirement visa in Europe.",
      },
    },
    {
      "@type": "Question",
      name: "What is Portugal's NHR tax regime?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The Non-Habitual Resident (NHR) regime offered 10 years of favorable tax treatment for new residents — foreign-source pension and investment income was often taxed at a flat 10% or exempt entirely. Portugal ended the original NHR regime in 2024 and replaced it with IFICI (similar benefits but more targeted). New arrivals should consult a Portuguese tax lawyer to understand current rules.",
      },
    },
    {
      "@type": "Question",
      name: "Is Lisbon getting too expensive for FIRE?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Lisbon has seen significant rent inflation since 2018 due to tourism and remote workers. Central neighborhoods (Chiado, Bairro Alto, Alfama) now cost €1,200–2,000/month for a 1BR. However, suburbs (Setúbal, Almada, Odivelas) accessible by train in 20–40 minutes still offer 1BRs for €700–1,000. The value proposition remains strong compared to Western Europe or the US.",
      },
    },
    {
      "@type": "Question",
      name: "How is healthcare for foreigners in Portugal?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Portugal's SNS (public health service) is available to legal residents, including D7 visa holders, at minimal cost. Quality varies — urban centers have modern facilities, rural areas are limited. Many expats use private health insurance (€100–200/month) for faster access and English-speaking doctors. Overall, healthcare quality is high and costs are a fraction of US rates.",
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
function CostRow({ item, low, high }: { item: string; low: string; high: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${C.border}`, alignItems: "center" }}>
      <span style={{ fontSize: 14, color: C.text }}>{item}</span>
      <span style={{ fontSize: 14, color: C.teal, fontWeight: 600 }}>{low} – {high}</span>
    </div>
  );
}

export default function FireInLisbon() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div style={{ marginBottom: 40 }}>
        <div style={{ fontSize: 12, color: C.accent, fontWeight: 600, marginBottom: 10, letterSpacing: "0.06em", textTransform: "uppercase" }}>
          🇵🇹 FIRE Destination Guide
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 800, color: C.text, lineHeight: 1.15, marginBottom: 14, marginTop: 0, letterSpacing: "-0.03em" }}>
          FIRE in Lisbon: How Much Do You Actually Need?
        </h1>
        <p style={{ fontSize: 17, color: C.muted, lineHeight: 1.6, marginTop: 0 }}>
          Lisbon is the FIRE community&apos;s favorite European destination — Mediterranean climate, excellent food, English widely spoken, and the D7 passive income visa is one of the best retirement visas in the world. Here&apos;s the real breakdown.
        </p>
      </div>

      <StandardCalc
        defaultIncome={90_000}
        defaultExpenses={36_000}
        defaultSavings={0}
        title="🇵🇹 FIRE Calculator — Lisbon Cost of Living"
      />

      <div style={{ marginBottom: 40 }}>
        <H2>Monthly Cost of Living in Lisbon (2025)</H2>
        <P>
          Lisbon has gentrified significantly since 2018, but remains far cheaper than London, Paris, or Amsterdam. The sweet spot for FIRE expats is suburban neighborhoods (Oeiras, Almada, Setúbal) with metro/train access to central Lisbon at 30–40% lower rent.
        </P>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "4px 20px 4px", marginBottom: 20 }}>
          <CostRow item="🏠 Rent — 1BR, Lisbon area" low="$900" high="$1,800" />
          <CostRow item="🍽️ Food & dining" low="$400" high="$700" />
          <CostRow item="🚇 Transport (metro + bus)" low="$50" high="$80" />
          <CostRow item="⚡ Utilities" low="$80" high="$150" />
          <CostRow item="📱 Phone + internet" low="$40" high="$70" />
          <CostRow item="🏥 Private health insurance" low="$100" high="$200" />
          <CostRow item="🎭 Entertainment & misc" low="$300" high="$600" />
        </div>
        <div style={{ background: "#0a1a12", border: `1px solid #166534`, borderRadius: 10, padding: "14px 18px" }}>
          <span style={{ color: C.teal, fontWeight: 700 }}>Total: $1,870–$3,600/month</span>
          <span style={{ color: C.muted, fontSize: 13 }}> · Comfortable lifestyle: ~$3,000/month · Annual: $36,000</span>
        </div>
      </div>

      <div style={{ marginBottom: 40 }}>
        <H2>Why Lisbon Dominates European FIRE Planning</H2>
        <P>
          Three things set Lisbon apart: the D7 visa, the NHR/IFICI tax regime, and the lifestyle-to-cost ratio. The D7 passive income visa requires just €760/month in proven passive income — your portfolio at 4% just needs to generate $9,120/year minimum, and you get the right to live in a Schengen country indefinitely.
        </P>
        <P>
          The NHR (Non-Habitual Resident) tax regime, now transitioning to IFICI, has attracted thousands of early retirees because foreign-source investment income was either taxed at a flat 10% or entirely exempt under the original scheme. The regime has changed in 2024 — consult a Portuguese tax lawyer, but the incentives for new residents remain meaningful.
        </P>
        <P>
          The lifestyle is genuinely excellent. Pastéis de nata for €1.20 at the neighborhood café. Fresh sardines and grilled octopus at €8 a plate. 300 days of sunshine. Easy access to the Algarve beaches (2 hours by train), Spain (3 hours to Madrid by AVE), and the rest of Europe (cheap RyanAir flights from LIS).
        </P>
        <P>
          English is widely spoken in Lisbon, especially among younger generations. Learning Portuguese helps enormously for bureaucracy and neighborhood integration, but you can function entirely in English initially.
        </P>
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
        <H2>Continue Exploring</H2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { href: "/learn/fire-in-medellin", label: "🇨🇴 FIRE in Medellín", sub: "$600k FIRE number" },
            { href: "/learn/fire-in-bali", label: "🇮🇩 FIRE in Bali", sub: "$600k FIRE number" },
            { href: "/learn/fire-in-tokyo", label: "🇯🇵 FIRE in Tokyo", sub: "$1.44M FIRE number" },
            { href: "/learn/4-percent-rule", label: "📐 The 4% Rule", sub: "Safe withdrawal rate guide" },
          ].map(({ href, label, sub }) => (
            <Link key={href} href={href} style={{ textDecoration: "none", background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px", display: "block" }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 12, color: C.muted }}>{sub}</div>
            </Link>
          ))}
        </div>
      </div>

      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 28, textAlign: "center" }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 8 }}>Track your path to FIRE in Lisbon</div>
        <div style={{ color: C.muted, fontSize: 14, marginBottom: 20 }}>Log every dollar, watch your net worth compound, see your D7 visa date approach.</div>
        <Link href="/dashboard" style={{ background: C.accent, color: "#fff", padding: "12px 28px", borderRadius: 8, textDecoration: "none", fontWeight: 600, fontSize: 15, display: "inline-block" }}>
          Open Dashboard →
        </Link>
      </div>
    </>
  );
}
