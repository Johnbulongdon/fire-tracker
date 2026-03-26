import type { Metadata } from "next";
import Link from "next/link";
import { StandardCalc } from "../_components/LearnCalc";

export const metadata: Metadata = {
  title: "FIRE in Medellín: Cost of Living & Early Retirement Guide (2025)",
  description:
    "How much do you need to retire early in Medellín? Real cost-of-living data, FIRE number for Colombia, visa options, and neighborhood guide for early retirees.",
  keywords: "FIRE Medellin, retire early Colombia, financial independence Medellin, cost of living Medellin",
  openGraph: {
    title: "FIRE in Medellín: Your FIRE Number for Colombia",
    description: "Calculate how much you need to retire early in Medellín. Real cost data + instant calculator.",
    url: "https://untilfire.com/learn/fire-in-medellin",
  },
  alternates: { canonical: "https://untilfire.com/learn/fire-in-medellin" },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How much do I need to retire early in Medellín?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A comfortable single-person life in Medellín costs $1,500–2,500/month (~$24,000/year at the midpoint). Using the 4% rule (25× annual expenses), your FIRE number is approximately $600,000 USD. Budget expats live on $1,000–1,200/month; those who want Western comforts budget $2,500–3,000/month.",
      },
    },
    {
      "@type": "Question",
      name: "Is Medellín safe for early retirees?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Medellín has transformed dramatically since the 1990s and is now one of Latin America's most innovative cities. Neighborhoods like El Poblado, Laureles, and Envigado are safe, walkable, and have large expat communities. Standard city-safety precautions apply: don't flash valuables, use registered taxis or Uber, avoid unfamiliar areas at night. Most expats report feeling as safe as in a medium-sized US city.",
      },
    },
    {
      "@type": "Question",
      name: "What visa allows long-term stay in Colombia for retirees?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Colombia's Pensionado Visa (retirement visa) requires proof of a monthly pension or passive income of at least 3× the Colombian minimum wage (~$800 USD/month in 2025). It's renewable annually and after 5 years qualifies you for permanent residency. There's also the Digital Nomad Visa for remote workers with income over $684/month. Colombia is one of the easiest countries for visa-based early retirement in Latin America.",
      },
    },
    {
      "@type": "Question",
      name: "What is the weather like in Medellín?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Medellín sits at 1,495 meters (4,900 feet) elevation in the Andes, giving it the famous 'City of Eternal Spring' climate: 65–80°F (18–27°C) year-round. No need for AC (saves $50–100/month vs. coastal cities), no heating needed, two rainy seasons (April–May and October–November) but rarely all-day rain. The climate is widely considered one of the best in the world for year-round outdoor living.",
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

export default function FireInMedellin() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div style={{ marginBottom: 40 }}>
        <div style={{ fontSize: 12, color: C.accent, fontWeight: 600, marginBottom: 10, letterSpacing: "0.06em", textTransform: "uppercase" }}>
          🇨🇴 FIRE Destination Guide
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 800, color: C.text, lineHeight: 1.15, marginBottom: 14, marginTop: 0, letterSpacing: "-0.03em" }}>
          FIRE in Medellín: How Much Do You Actually Need?
        </h1>
        <p style={{ fontSize: 17, color: C.muted, lineHeight: 1.6, marginTop: 0 }}>
          The City of Eternal Spring offers a $600k FIRE number, an easy pensionado visa, and a growing expat community — all with a world-class urban metro system and year-round perfect weather. Here&apos;s the real breakdown.
        </p>
      </div>

      <StandardCalc
        defaultIncome={70_000}
        defaultExpenses={24_000}
        defaultSavings={0}
        title="🇨🇴 FIRE Calculator — Medellín Cost of Living"
      />

      <div style={{ marginBottom: 40 }}>
        <H2>Monthly Cost of Living in Medellín (2025)</H2>
        <P>
          El Poblado is the expat hub — modern apartments, international restaurants, nightlife — and the most expensive. Laureles and Envigado offer equivalent quality at 20–30% lower cost and are preferred by longer-term residents. The metro system connects everything efficiently for pennies.
        </P>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "4px 20px 4px", marginBottom: 20 }}>
          <CostRow item="🏠 Rent — 1BR, El Poblado" low="$500" high="$900" />
          <CostRow item="🍽️ Food & dining" low="$300" high="$450" />
          <CostRow item="🚇 Metro + bus card" low="$30" high="$60" />
          <CostRow item="⚡ Utilities (no AC needed!)" low="$40" high="$80" />
          <CostRow item="📱 Phone + fiber internet" low="$30" high="$50" />
          <CostRow item="🏥 International health insurance" low="$100" high="$250" />
          <CostRow item="🎭 Entertainment & misc" low="$200" high="$400" />
        </div>
        <div style={{ background: "#0a1a12", border: `1px solid #166534`, borderRadius: 10, padding: "14px 18px" }}>
          <span style={{ color: C.teal, fontWeight: 700 }}>Total: $1,200–$2,190/month</span>
          <span style={{ color: C.muted, fontSize: 13 }}> · Comfortable lifestyle: ~$2,000/month · Annual: $24,000</span>
        </div>
      </div>

      <div style={{ marginBottom: 40 }}>
        <H2>Why Medellín Wins the Latin America FIRE Race</H2>
        <P>
          The pensionado visa requires just ~$800 USD/month in proven passive income. Your FIRE portfolio at even a conservative 3% withdrawal rate only needs $320,000 to qualify. This makes Colombia one of the easiest countries on earth for legal early retirement — no large investment required, no property purchase, just proof of income.
        </P>
        <P>
          The climate is the overlooked superpower. No AC = no $100–200 electricity bill shock every month. No heating. Perfect conditions for outdoor living, cycling, and hiking year-round. The city is carved into valleys in the Andes — every neighborhood has mountains as a backdrop and the temperature rarely exceeds 85°F.
        </P>
        <P>
          The metro and cable car system is extraordinary for a Latin American city — reliable, safe, and cheap. A full-day pass costs under $2. Combined with Uber (widely used, $3–5 for most rides), you can easily live without a car and save $500+/month versus US car ownership costs.
        </P>
        <P>
          Food quality and value is exceptional. Fresh tropical fruits (mango, maracuyá, lulo) from markets at $0.50/lb. A traditional bandeja paisa (full meal) at a local restaurant: $4–6. Excellent Colombian coffee at every corner for $0.50. Even in the most tourist-heavy parts of El Poblado, a good restaurant meal runs $8–15.
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
            { href: "/learn/fire-in-bali", label: "🇮🇩 FIRE in Bali", sub: "$600k FIRE number" },
            { href: "/learn/fire-in-lisbon", label: "🇵🇹 FIRE in Lisbon", sub: "$900k + D7 visa" },
            { href: "/learn/fire-in-tokyo", label: "🇯🇵 FIRE in Tokyo", sub: "$1.44M FIRE number" },
            { href: "/learn/savings-rate-calculator", label: "📊 Savings Rate Calculator", sub: "How fast can you save?" },
          ].map(({ href, label, sub }) => (
            <Link key={href} href={href} style={{ textDecoration: "none", background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px", display: "block" }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 12, color: C.muted }}>{sub}</div>
            </Link>
          ))}
        </div>
      </div>

      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 28, textAlign: "center" }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 8 }}>Track your path to FIRE in Medellín</div>
        <div style={{ color: C.muted, fontSize: 14, marginBottom: 20 }}>Log income and expenses, watch your net worth compound, see your pensionado visa date approach.</div>
        <Link href="/dashboard" style={{ background: C.accent, color: "#fff", padding: "12px 28px", borderRadius: 8, textDecoration: "none", fontWeight: 600, fontSize: 15, display: "inline-block" }}>
          Open Dashboard →
        </Link>
      </div>
    </>
  );
}
