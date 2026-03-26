import type { Metadata } from "next";
import Link from "next/link";
import { StandardCalc } from "../_components/LearnCalc";

export const metadata: Metadata = {
  title: "FIRE in Bali: Cost of Living & Early Retirement Guide (2025)",
  description:
    "How much do you need to retire early in Bali? Real cost-of-living data, FIRE number for Indonesia, visa options, and comparison to other low-cost FIRE destinations.",
  keywords: "FIRE Bali, retire early Bali, financial independence Indonesia, cost of living Bali, geo arbitrage",
  openGraph: {
    title: "FIRE in Bali: Your FIRE Number for Indonesia",
    description: "Calculate how much you need to retire early in Bali. Real cost data + instant calculator.",
    url: "https://untilfire.com/learn/fire-in-bali",
  },
  alternates: { canonical: "https://untilfire.com/learn/fire-in-bali" },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How much do I need to retire early in Bali?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A comfortable life in Bali costs $1,500–2,500/month depending on your lifestyle (~$24,000/year at the midpoint). Using the 4% rule (25× annual expenses), your FIRE number is approximately $600,000 USD. You can live well on less — $1,200/month is achievable — or spend more for a villa with pool.",
      },
    },
    {
      "@type": "Question",
      name: "Is Bali a good place to retire early?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Bali is one of the most popular geo-arbitrage destinations for early retirees. The weather is tropical year-round, food is exceptional and cheap, the expat community is massive, and $2,000/month buys a lifestyle that would cost $6,000+ in the US. The main challenges are visa restrictions (no long-term retirement visa), limited healthcare outside of Denpasar/Seminyak, and increasing tourist crowding in popular areas.",
      },
    },
    {
      "@type": "Question",
      name: "What visa can I use to live in Bali long-term?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Indonesia introduced a Second Home Visa in 2022 (requires $129,000 USD deposit in Indonesian bank, renewable every 5 years) and a Digital Nomad Visa for remote workers. Many expats previously cycled through 60-day tourist visas with border runs to Singapore or Malaysia. The Second Home Visa is now the recommended legal path for long-term retirees.",
      },
    },
    {
      "@type": "Question",
      name: "How does healthcare work in Bali for foreigners?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Bali has international-standard hospitals in Denpasar and Seminyak (BIMC, Siloam, Kasih Ibu) used by expats. Basic care is cheap — a GP visit runs $20–40. For serious conditions, many expats fly to Singapore or Kuala Lumpur. International health insurance is strongly recommended ($150–300/month) and is a non-negotiable part of a Bali FIRE budget.",
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

export default function FireInBali() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div style={{ marginBottom: 40 }}>
        <div style={{ fontSize: 12, color: C.accent, fontWeight: 600, marginBottom: 10, letterSpacing: "0.06em", textTransform: "uppercase" }}>
          🇮🇩 FIRE Destination Guide
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 800, color: C.text, lineHeight: 1.15, marginBottom: 14, marginTop: 0, letterSpacing: "-0.03em" }}>
          FIRE in Bali: How Much Do You Actually Need?
        </h1>
        <p style={{ fontSize: 17, color: C.muted, lineHeight: 1.6, marginTop: 0 }}>
          Bali is the world&apos;s ultimate geo-arbitrage destination — $2,000/month buys a tropical lifestyle that would cost $6,000+ in the US. Here&apos;s what it actually costs and your minimum FIRE number.
        </p>
      </div>

      <StandardCalc
        defaultIncome={80_000}
        defaultExpenses={24_000}
        defaultSavings={0}
        title="🇮🇩 FIRE Calculator — Bali Cost of Living"
      />

      <div style={{ marginBottom: 40 }}>
        <H2>Monthly Cost of Living in Bali (2025)</H2>
        <P>
          Bali&apos;s cost of living varies dramatically by neighborhood and lifestyle. Canggu and Seminyak cater to the digital nomad crowd — cafés, co-working spaces, organic restaurants — and cost more. Ubud, Sanur, and Jimbaran offer a quieter life at lower prices. The numbers below reflect a comfortable, not budget, lifestyle.
        </P>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "4px 20px 4px", marginBottom: 20 }}>
          <CostRow item="🏠 Rent — private villa or 1BR" low="$500" high="$1,200" />
          <CostRow item="🍜 Food & dining" low="$300" high="$500" />
          <CostRow item="🛵 Scooter rental + fuel" low="$100" high="$150" />
          <CostRow item="⚡ Utilities (AC heavy!)" low="$80" high="$200" />
          <CostRow item="📱 Phone + internet" low="$30" high="$60" />
          <CostRow item="🏥 International health insurance" low="$150" high="$300" />
          <CostRow item="🎭 Entertainment & activities" low="$200" high="$400" />
        </div>
        <div style={{ background: "#0a1a12", border: `1px solid #166534`, borderRadius: 10, padding: "14px 18px" }}>
          <span style={{ color: C.teal, fontWeight: 700 }}>Total: $1,360–$2,810/month</span>
          <span style={{ color: C.muted, fontSize: 13 }}> · Comfortable lifestyle: ~$2,000/month · Annual: $24,000</span>
        </div>
      </div>

      <div style={{ marginBottom: 40 }}>
        <H2>The Bali FIRE Advantage: Geo-Arbitrage at Its Best</H2>
        <P>
          The numbers are staggering. A $600,000 portfolio generating 4% annually ($24,000/year) funds a genuinely good life in Bali — chef&apos;s kitchen in a villa, motorbike, fresh food daily, yoga and surfing. That same $24,000 doesn&apos;t cover rent alone in San Francisco.
        </P>
        <P>
          Food is the headline advantage. A full Indonesian meal (nasi goreng, satay, rendang) at a warung costs $2–4. Fresh tropical fruit smoothies are $1–2. Even Western food at expat cafés runs $8–15 for a full meal. Your $300–500 food budget in Bali eats like $1,500 in New York.
        </P>
        <P>
          The utilities trap: AC. Bali is hot and humid year-round. Running AC in a villa can spike your electric bill to $150–250/month. Budget for this honestly. Many expats run ceiling fans during the day and AC only at night to stay under $100/month.
        </P>
        <P>
          Healthcare is the non-negotiable line item. International insurance is expensive relative to Bali costs but cheap relative to US rates. Budget $150–300/month and never skip it — evacuation to Singapore for serious illness can cost $10,000+.
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
            { href: "/learn/fire-in-lisbon", label: "🇵🇹 FIRE in Lisbon", sub: "$900k + easy D7 visa" },
            { href: "/learn/fire-in-tokyo", label: "🇯🇵 FIRE in Tokyo", sub: "$1.44M FIRE number" },
            { href: "/learn/fire-calculator", label: "🔥 FIRE Calculator", sub: "Full projection tool" },
          ].map(({ href, label, sub }) => (
            <Link key={href} href={href} style={{ textDecoration: "none", background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px", display: "block" }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 12, color: C.muted }}>{sub}</div>
            </Link>
          ))}
        </div>
      </div>

      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 28, textAlign: "center" }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 8 }}>Track your path to FIRE in Bali</div>
        <div style={{ color: C.muted, fontSize: 14, marginBottom: 20 }}>Log income and expenses, watch your net worth grow, see your FIRE date move closer.</div>
        <Link href="/dashboard" style={{ background: C.accent, color: "#fff", padding: "12px 28px", borderRadius: 8, textDecoration: "none", fontWeight: 600, fontSize: 15, display: "inline-block" }}>
          Open Dashboard →
        </Link>
      </div>
    </>
  );
}
