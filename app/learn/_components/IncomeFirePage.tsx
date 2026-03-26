import Link from "next/link";
import { FireNumberCalc } from "./LearnCalc";

const C = {
  border: "#1c1c2e",
  text: "#e8e8f2",
  muted: "#5e5e7a",
  accent: "#f97316",
  teal: "#22d3a5",
  card: "#13131e",
  red: "#ef4444",
};

function H2({ children }: { children: React.ReactNode }) {
  return <h2 style={{ fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 16, marginTop: 0, letterSpacing: "-0.02em" }}>{children}</h2>;
}
function P({ children }: { children: React.ReactNode }) {
  return <p style={{ color: C.muted, lineHeight: 1.75, marginBottom: 14, marginTop: 0, fontSize: 15 }}>{children}</p>;
}

export interface IncomeScenario {
  label: string;
  savingsRate: number;
  expenses: number;
  fireNumber: number;
  years: number;
}

export interface IncomeFirePageProps {
  income: number;
  incomeLabel: string;
  taxNote: string;
  scenarios: IncomeScenario[];
  insight: string;
  tip: string;
  relatedPages: { href: string; label: string; sub: string }[];
  faq: { q: string; a: string }[];
}

export default function IncomeFirePage({
  income,
  incomeLabel,
  taxNote,
  scenarios,
  insight,
  tip,
  relatedPages,
  faq,
}: IncomeFirePageProps) {
  const midScenario = scenarios[Math.floor(scenarios.length / 2)];

  return (
    <>
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ fontSize: 12, color: C.accent, fontWeight: 600, marginBottom: 10, letterSpacing: "0.06em", textTransform: "uppercase" }}>
          Income-Based FIRE Guide
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 800, color: C.text, lineHeight: 1.15, marginBottom: 14, marginTop: 0, letterSpacing: "-0.03em" }}>
          FIRE Number on a {incomeLabel} Salary
        </h1>
        <p style={{ fontSize: 17, color: C.muted, lineHeight: 1.6, marginTop: 0 }}>
          {taxNote} Adjust the inputs below to see your personalized FIRE number and retirement timeline.
        </p>
      </div>

      {/* Calculator */}
      <FireNumberCalc
        defaultIncome={income}
        defaultExpenses={midScenario.expenses}
        label={`FIRE Calculator — ${incomeLabel} Income`}
      />

      {/* Scenarios table */}
      <div style={{ marginBottom: 40 }}>
        <H2>FIRE Scenarios on {incomeLabel} Income</H2>
        <P>Your FIRE timeline depends on how much you spend. Here are three common scenarios — lean, moderate, and comfortable — for a {incomeLabel} salary:</P>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr>
                {["Lifestyle", "Savings Rate", "Annual Expenses", "FIRE Number", "Years to FIRE"].map((h) => (
                  <th key={h} style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, textAlign: "left", color: C.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {scenarios.map((s) => (
                <tr key={s.label}>
                  <td style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, color: C.text, fontWeight: 600 }}>{s.label}</td>
                  <td style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, color: C.teal }}>{s.savingsRate}%</td>
                  <td style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, color: C.muted }}>${s.expenses.toLocaleString()}</td>
                  <td style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, color: C.teal, fontWeight: 600 }}>${s.fireNumber.toLocaleString()}</td>
                  <td style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, color: s.years < 20 ? C.teal : s.years < 35 ? C.accent : C.muted }}>
                    {s.years >= 65 ? "65+" : s.years} yrs
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insight + tip */}
      <div style={{ marginBottom: 40 }}>
        <H2>Key Insight</H2>
        <P>{insight}</P>
        <div style={{ background: "#0a1a12", border: `1px solid #166534`, borderRadius: 10, padding: "14px 18px" }}>
          <span style={{ color: C.teal, fontWeight: 700 }}>💡 Pro tip: </span>
          <span style={{ color: C.muted, fontSize: 14 }}>{tip}</span>
        </div>
      </div>

      {/* FAQ */}
      <div style={{ marginBottom: 40 }}>
        <H2>Frequently Asked Questions</H2>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {faq.map((item, i) => (
            <details key={i} style={{ borderBottom: `1px solid ${C.border}`, padding: "16px 0" }}>
              <summary style={{ fontSize: 15, fontWeight: 600, color: C.text, cursor: "pointer", listStyle: "none", display: "flex", justifyContent: "space-between" }}>
                {item.q}
                <span style={{ color: C.accent, marginLeft: 8 }}>+</span>
              </summary>
              <p style={{ color: C.muted, lineHeight: 1.7, fontSize: 14, marginTop: 12, marginBottom: 0 }}>{item.a}</p>
            </details>
          ))}
        </div>
      </div>

      {/* Related pages */}
      <div style={{ marginBottom: 40 }}>
        <H2>Related Guides</H2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {relatedPages.map(({ href, label, sub }) => (
            <Link key={href} href={href} style={{ textDecoration: "none", background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px", display: "block" }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 12, color: C.muted }}>{sub}</div>
            </Link>
          ))}
        </div>
      </div>

      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 28, textAlign: "center" }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 8 }}>Track your actual progress to FIRE</div>
        <div style={{ color: C.muted, fontSize: 14, marginBottom: 20 }}>Log real income and expenses. Watch your net worth compound toward your FIRE number.</div>
        <Link href="/dashboard" style={{ background: C.accent, color: "#fff", padding: "12px 28px", borderRadius: 8, textDecoration: "none", fontWeight: 600, fontSize: 15, display: "inline-block" }}>
          Open Dashboard →
        </Link>
      </div>
    </>
  );
}
