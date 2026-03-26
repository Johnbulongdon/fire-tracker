import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  metadataBase: new URL("https://untilfire.com"),
};

const C = {
  bg: "#08080e",
  card: "#13131e",
  border: "#1c1c2e",
  text: "#e8e8f2",
  muted: "#5e5e7a",
  accent: "#f97316",
  teal: "#22d3a5",
};

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text, fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Nav */}
      <nav style={{ borderBottom: `1px solid ${C.border}`, padding: "0 24px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 52 }}>
          <Link href="/" style={{ textDecoration: "none", color: C.text, fontWeight: 700, fontSize: 16, letterSpacing: "-0.02em" }}>
            Until<span style={{ color: C.accent }}>Fire</span>
          </Link>
          <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
            <Link href="/learn/fire-calculator" style={{ color: C.muted, fontSize: 13, textDecoration: "none" }}>Calculators</Link>
            <Link href="/learn/fire-in-tokyo" style={{ color: C.muted, fontSize: 13, textDecoration: "none" }}>Cities</Link>
            <Link href="/dashboard" style={{ background: C.accent, color: "#fff", fontSize: 12, fontWeight: 600, padding: "6px 14px", borderRadius: 6, textDecoration: "none" }}>
              Dashboard →
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main style={{ maxWidth: 760, margin: "0 auto", padding: "48px 24px 80px" }}>
        {children}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${C.border}`, padding: "32px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <p style={{ color: C.muted, fontSize: 13, marginBottom: 16 }}>
            UntilFire — FIRE calculator & financial independence tracker
          </p>
          <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap" }}>
            {[
              { href: "/learn/fire-calculator", label: "FIRE Calculator" },
              { href: "/learn/coast-fire-calculator", label: "Coast FIRE" },
              { href: "/learn/savings-rate-calculator", label: "Savings Rate" },
              { href: "/learn/4-percent-rule", label: "4% Rule" },
              { href: "/learn/fire-in-tokyo", label: "FIRE in Tokyo" },
              { href: "/learn/fire-in-bali", label: "FIRE in Bali" },
              { href: "/learn/fire-in-lisbon", label: "FIRE in Lisbon" },
            ].map(({ href, label }) => (
              <Link key={href} href={href} style={{ color: C.muted, fontSize: 12, textDecoration: "none" }}>{label}</Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
