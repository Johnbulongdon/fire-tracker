"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg: "#F8FAFC",
  card: "#FFFFFF",
  border: "#E2E8F0",
  text: "#0F172A",
  muted: "#64748B",
  accent: "#064E3B",
  teal: "#20D4BF",
  red: "#EF4444",
  purple: "#475569",
  amber: "#F59E0B",
};

const fmt = (n: number, compact = false) => {
  if (compact && Math.abs(n) >= 1_000_000)
    return `$${(n / 1_000_000).toFixed(2)}M`;
  if (compact && Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
};

// ─── Barista FIRE Math ────────────────────────────────────────────────────────
// Barista FIRE target = (Annual Expenses - Part-time Income) / Withdrawal Rate
// This is the portfolio size needed so withdrawals + part-time income = expenses
function calcBaristaFIRE({
  annualExpenses,
  partTimeIncome,
  currentSavings,
  currentAge,
  retirementAge,
  growthRate = 0.07,
  withdrawalRate = 0.04,
}: {
  annualExpenses: number;
  partTimeIncome: number;
  currentSavings: number;
  currentAge: number;
  retirementAge: number;
  growthRate?: number;
  withdrawalRate?: number;
}) {
  const incomeGap = Math.max(0, annualExpenses - partTimeIncome);
  const baristaTarget = incomeGap / withdrawalRate;
  const fullFireTarget = annualExpenses / withdrawalRate;
  const savings = Math.max(0, annualExpenses - partTimeIncome); // annual savings toward barista target
  const yearsToRetirement = retirementAge - currentAge;

  // How many years to reach barista target from current savings
  // FV = PV*(1+r)^n + PMT*((1+r)^n - 1)/r
  // Solve for n numerically
  let yearsToBarista: number | null = null;
  if (currentSavings >= baristaTarget) {
    yearsToBarista = 0;
  } else {
    let portfolio = currentSavings;
    for (let y = 1; y <= 60; y++) {
      portfolio = portfolio * (1 + growthRate) + savings;
      if (portfolio >= baristaTarget) {
        yearsToBarista = y;
        break;
      }
    }
  }

  const progress = Math.min(100, (currentSavings / baristaTarget) * 100);
  const savings_reduction = fullFireTarget - baristaTarget;

  // Projection chart data
  const data = [];
  let portfolio = currentSavings;
  const chartYears = Math.min(yearsToBarista ? yearsToBarista + 5 : 30, yearsToRetirement + 5);
  for (let y = 0; y <= chartYears; y++) {
    data.push({
      age: currentAge + y,
      Portfolio: Math.round(portfolio),
      "Barista Target": Math.round(baristaTarget),
      "Full FIRE Target": Math.round(fullFireTarget),
    });
    portfolio = portfolio * (1 + growthRate) + savings;
  }

  return {
    baristaTarget,
    fullFireTarget,
    incomeGap,
    progress,
    yearsToBarista,
    savings_reduction,
    data,
  };
}

// ─── Reusable Field ───────────────────────────────────────────────────────────
function Field({
  label,
  value,
  onChange,
  prefix = "$",
  hint,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  hint?: string;
  min?: number;
  max?: number;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label
        style={{
          fontSize: 11,
          fontFamily: "monospace",
          letterSpacing: "0.08em",
          textTransform: "uppercase" as const,
          color: C.muted,
        }}
      >
        {label}
      </label>
      <div style={{ position: "relative" }}>
        {prefix && (
          <span
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: C.muted,
              fontFamily: "monospace",
              fontSize: 13,
            }}
          >
            {prefix}
          </span>
        )}
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{
            width: "100%",
            background: "#F1F5F9",
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            padding: prefix ? "10px 12px 10px 28px" : "10px 12px",
            color: C.text,
            fontFamily: "monospace",
            fontSize: 14,
            outline: "none",
            boxSizing: "border-box" as const,
            transition: "border-color 0.2s",
          }}
          onFocus={(e) => (e.target.style.borderColor = C.accent)}
          onBlur={(e) => (e.target.style.borderColor = C.border)}
        />
      </div>
      {hint && (
        <span style={{ fontSize: 11, color: C.muted, fontStyle: "italic" }}>{hint}</span>
      )}
    </div>
  );
}

function SliderField({
  label,
  value,
  onChange,
  min,
  max,
  step = 0.001,
  format,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  format: (v: number) => string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <label
          style={{
            fontSize: 11,
            fontFamily: "monospace",
            letterSpacing: "0.08em",
            textTransform: "uppercase" as const,
            color: C.muted,
          }}
        >
          {label}
        </label>
        <span style={{ fontSize: 13, color: C.accent, fontFamily: "monospace" }}>
          {format(value)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ accentColor: C.accent, width: "100%", cursor: "pointer" }}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  color = C.text,
  accent = false,
}: {
  label: string;
  value: string;
  sub?: string;
  color?: string;
  accent?: boolean;
}) {
  return (
    <div
      style={{
        background: accent ? `${C.accent}10` : C.card,
        border: `1px solid ${accent ? C.accent + "40" : C.border}`,
        borderRadius: 12,
        padding: "16px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      <span
        style={{
          fontSize: 11,
          fontFamily: "monospace",
          letterSpacing: "0.08em",
          textTransform: "uppercase" as const,
          color: C.muted,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 22,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 700,
          color,
          lineHeight: 1.1,
        }}
      >
        {value}
      </span>
      {sub && <span style={{ fontSize: 12, color: C.muted }}>{sub}</span>}
    </div>
  );
}

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 8,
        padding: "10px 14px",
        fontFamily: "monospace",
        fontSize: 12,
      }}
    >
      <p style={{ color: C.muted, marginBottom: 6 }}>Age {label}</p>
      {payload.map((p: any) => (
        <div key={p.name} style={{ color: p.color, marginBottom: 2 }}>
          {p.name}: {fmt(p.value, true)}
        </div>
      ))}
    </div>
  );
};

function FAQ({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: `1px solid ${C.border}`, padding: "16px 0" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "transparent",
          border: "none",
          color: C.text,
          fontSize: 15,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 500,
          cursor: "pointer",
          textAlign: "left" as const,
          padding: 0,
          gap: 16,
        }}
      >
        <span>{q}</span>
        <span style={{ color: C.accent, fontSize: 20, flexShrink: 0 }}>{open ? "−" : "+"}</span>
      </button>
      {open && (
        <p
          style={{
            marginTop: 12,
            color: C.muted,
            fontSize: 14,
            lineHeight: 1.7,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          {a}
        </p>
      )}
    </div>
  );
}

// ─── JSON-LD ──────────────────────────────────────────────────────────────────
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "Barista FIRE Calculator",
      applicationCategory: "FinanceApplication",
      operatingSystem: "Web",
      url: "https://untilfire.com/barista-fire-calculator",
      description:
        "Calculate your Barista FIRE number — the portfolio size where part-time income + withdrawals cover all your expenses.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      provider: { "@type": "Organization", name: "UntilFire", url: "https://untilfire.com" },
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is Barista FIRE?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Barista FIRE is a semi-retirement strategy where you build a smaller investment portfolio and supplement withdrawals with part-time income — enough to cover your full living expenses together. The name comes from people who take a part-time barista job for the health insurance benefits while their portfolio grows.",
          },
        },
        {
          "@type": "Question",
          name: "How do you calculate your Barista FIRE number?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Barista FIRE number = (Annual Expenses − Part-time Income) ÷ Withdrawal Rate. For example, if you spend $60,000/year, earn $20,000 from part-time work, and use a 4% withdrawal rate: Barista FIRE number = ($60,000 − $20,000) ÷ 0.04 = $1,000,000. You need $1M invested so 4% withdrawals ($40k) plus your $20k income cover your $60k expenses.",
          },
        },
        {
          "@type": "Question",
          name: "What is the difference between Barista FIRE and Coast FIRE?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Barista FIRE means you're already semi-retired — you're working part-time AND withdrawing from your portfolio to cover expenses. Coast FIRE means you've invested enough that compound growth will reach your FIRE number by retirement with no further contributions — but you're not withdrawing yet, just covering current living costs through work.",
          },
        },
        {
          "@type": "Question",
          name: "Why is it called Barista FIRE?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "The term originated in the FIRE community because a part-time barista job at companies like Starbucks offers health insurance benefits, which is a major expense for early retirees in the US. The barista income + benefits dramatically reduce the portfolio size needed before you can semi-retire.",
          },
        },
        {
          "@type": "Question",
          name: "How much do I need for Barista FIRE?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "It depends on your annual expenses and how much you plan to earn part-time. If you spend $50,000/year and plan to earn $15,000 from part-time work, your income gap is $35,000. At a 4% withdrawal rate, you need $875,000 invested. Compare this to $1.25M for full FIRE — Barista FIRE cuts the target by 30%.",
          },
        },
      ],
    },
  ],
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BaristaFIRECalculatorClient() {
  const [annualExpenses, setAnnualExpenses] = useState(60000);
  const [partTimeIncome, setPartTimeIncome] = useState(20000);
  const [currentSavings, setCurrentSavings] = useState(200000);
  const [currentAge, setCurrentAge] = useState(35);
  const [retirementAge, setRetirementAge] = useState(55);
  const [growthRate, setGrowthRate] = useState(0.07);
  const [withdrawalRate, setWithdrawalRate] = useState(0.04);

  const { baristaTarget, fullFireTarget, incomeGap, progress, yearsToBarista, savings_reduction, data } =
    useMemo(
      () =>
        calcBaristaFIRE({
          annualExpenses,
          partTimeIncome,
          currentSavings,
          currentAge,
          retirementAge,
          growthRate,
          withdrawalRate,
        }),
      [annualExpenses, partTimeIncome, currentSavings, currentAge, retirementAge, growthRate, withdrawalRate]
    );

  const hasReached = currentSavings >= baristaTarget;
  const savingsReductionPct =
    fullFireTarget > 0 ? ((savings_reduction / fullFireTarget) * 100).toFixed(0) : "0";

  return (
    <div
      style={{
        background: C.bg,
        color: C.text,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        minHeight: "100vh",
        padding: "0 0 80px 0",
      }}
    >
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Nav */}
      <nav
        style={{
          borderBottom: `1px solid ${C.border}`,
          padding: "18px 32px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          backdropFilter: "blur(20px)",
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(8,8,14,0.85)",
        }}
      >
        <Link
          href="/"
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 800,
            fontSize: 20,
            color: C.accent,
            textDecoration: "none",
          }}
        >
          UntilFire
        </Link>
        <span style={{ color: C.muted, fontSize: 13 }}>/ Barista FIRE Calculator</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 16 }}>
          <Link
            href="/coast-fire-calculator"
            style={{ fontSize: 13, color: C.muted, textDecoration: "none" }}
          >
            Coast FIRE →
          </Link>
          <Link
            href="/calculator"
            style={{ fontSize: 13, color: C.muted, textDecoration: "none" }}
          >
            Full Calculator →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div
        style={{
          maxWidth: 800,
          margin: "0 auto",
          padding: "52px 24px 32px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-block",
            background: `${C.amber}15`,
            border: `1px solid ${C.amber}30`,
            borderRadius: 99,
            padding: "5px 16px",
            fontSize: 12,
            color: C.amber,
            fontFamily: "monospace",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: 20,
          }}
        >
          ☕ Barista FIRE Calculator
        </div>
        <h1
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 800,
            fontSize: "clamp(32px, 5vw, 52px)",
            lineHeight: 1.1,
            margin: "0 0 16px",
            color: C.text,
          }}
        >
          Barista FIRE Calculator
        </h1>
        <p
          style={{
            fontSize: 18,
            color: C.muted,
            maxWidth: 580,
            margin: "0 auto 8px",
            lineHeight: 1.6,
          }}
        >
          Part-time work + portfolio withdrawals = your full expenses. Find the{" "}
          <em style={{ color: C.text }}>smaller portfolio</em> that lets you semi-retire now.
        </p>
        <p style={{ fontSize: 13, color: C.muted, fontFamily: "monospace" }}>
          Barista FIRE target = (Annual Expenses − Part-time Income) ÷ Withdrawal Rate
        </p>
      </div>

      {/* Calculator */}
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0 24px",
          display: "grid",
          gridTemplateColumns: "clamp(280px, 33%, 360px) 1fr",
          gap: 28,
          alignItems: "start",
        }}
      >
        {/* Inputs */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Expenses & Income */}
          <div
            style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 16,
              padding: 24,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <span style={{ fontSize: 16 }}>☕</span>
              <span
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700,
                  fontSize: 13,
                  color: C.amber,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                Expenses & Income
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Field
                label="Annual Expenses"
                value={annualExpenses}
                onChange={setAnnualExpenses}
                hint="Total spending per year in semi-retirement"
              />
              <Field
                label="Part-time Income"
                value={partTimeIncome}
                onChange={setPartTimeIncome}
                hint="Annual income from your part-time or passion job"
              />
            </div>

            {/* Income gap visual */}
            <div
              style={{
                marginTop: 20,
                background: "#F1F5F9",
                borderRadius: 10,
                padding: "14px 16px",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                <span style={{ color: C.muted }}>Expenses covered by work</span>
                <span style={{ color: C.teal }}>
                  {fmt(Math.min(partTimeIncome, annualExpenses), true)}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                <span style={{ color: C.muted }}>Gap covered by portfolio</span>
                <span style={{ color: C.accent }}>{fmt(incomeGap, true)}/yr</span>
              </div>
              <div
                style={{ height: 6, background: C.border, borderRadius: 99, overflow: "hidden" }}
              >
                <div
                  style={{
                    width: `${Math.min(100, (partTimeIncome / annualExpenses) * 100)}%`,
                    height: "100%",
                    background: C.teal,
                    borderRadius: 99,
                  }}
                />
              </div>
              <div style={{ fontSize: 11, color: C.muted, textAlign: "center" }}>
                Work covers {Math.min(100, ((partTimeIncome / annualExpenses) * 100).toFixed(0))}%
                of expenses
              </div>
            </div>
          </div>

          {/* Portfolio & Age */}
          <div
            style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 16,
              padding: 24,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <span style={{ fontSize: 16 }}>📈</span>
              <span
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700,
                  fontSize: 13,
                  color: C.teal,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                Portfolio & Timeline
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Field
                label="Current Invested Assets"
                value={currentSavings}
                onChange={setCurrentSavings}
                hint="401(k) + Roth IRA + brokerage total"
              />
              <Field
                label="Current Age"
                value={currentAge}
                onChange={setCurrentAge}
                prefix=""
                min={18}
                max={70}
              />
              <Field
                label="Semi-retirement Age"
                value={retirementAge}
                onChange={setRetirementAge}
                prefix=""
                min={currentAge + 1}
                max={80}
                hint="When you want to go part-time"
              />
            </div>
          </div>

          {/* Assumptions */}
          <div
            style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 16,
              padding: 24,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <span style={{ fontSize: 16 }}>⚙️</span>
              <span
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700,
                  fontSize: 13,
                  color: C.purple,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                Assumptions
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <SliderField
                label="Annual Return Rate"
                value={growthRate}
                onChange={setGrowthRate}
                min={0.03}
                max={0.12}
                step={0.001}
                format={(v) => `${(v * 100).toFixed(1)}%`}
              />
              <SliderField
                label="Safe Withdrawal Rate"
                value={withdrawalRate}
                onChange={setWithdrawalRate}
                min={0.03}
                max={0.06}
                step={0.001}
                format={(v) => `${(v * 100).toFixed(1)}%`}
              />
            </div>
          </div>
        </div>

        {/* Results */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Status banner */}
          <div
            style={{
              background: hasReached ? `${C.teal}10` : `${C.amber}08`,
              border: `1px solid ${hasReached ? C.teal + "40" : C.amber + "30"}`,
              borderRadius: 16,
              padding: "20px 24px",
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <span style={{ fontSize: 32 }}>{hasReached ? "✅" : "☕"}</span>
            <div>
              <div
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700,
                  fontSize: 18,
                  color: hasReached ? C.teal : C.text,
                  marginBottom: 4,
                }}
              >
                {hasReached
                  ? "You've reached Barista FIRE!"
                  : `${fmt(baristaTarget - currentSavings, true)} away from Barista FIRE`}
              </div>
              <div style={{ fontSize: 13, color: C.muted }}>
                {hasReached
                  ? `Your ${fmt(baristaTarget, true)} portfolio covers the ${fmt(incomeGap, true)}/yr gap. Go part-time anytime.`
                  : yearsToBarista
                  ? `At your current savings rate, you could reach Barista FIRE in ~${yearsToBarista} years (age ${currentAge + yearsToBarista}).`
                  : "Keep saving — your portfolio will get there."}
              </div>
            </div>
          </div>

          {/* KPI grid */}
          <div
            style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}
          >
            <StatCard
              label="Barista FIRE Target"
              value={fmt(baristaTarget, true)}
              sub={`${fmt(incomeGap, true)}/yr gap ÷ ${(withdrawalRate * 100).toFixed(0)}%`}
              color={C.accent}
              accent
            />
            <StatCard
              label="vs Full FIRE"
              value={`−${savingsReductionPct}%`}
              sub={`Save ${fmt(savings_reduction, true)} less`}
              color={C.teal}
            />
            <StatCard
              label="Progress"
              value={`${Math.min(progress, 100).toFixed(0)}%`}
              sub={`${fmt(currentSavings, true)} of ${fmt(baristaTarget, true)}`}
              color={progress >= 100 ? C.teal : progress >= 60 ? C.accent : C.text}
            />
            <StatCard
              label="Income Gap"
              value={fmt(incomeGap, true)}
              sub="Portfolio must cover this/year"
            />
            <StatCard
              label="Full FIRE Target"
              value={fmt(fullFireTarget, true)}
              sub="If you didn't work at all"
            />
            <StatCard
              label="Years to Barista FIRE"
              value={
                currentSavings >= baristaTarget
                  ? "Now"
                  : yearsToBarista
                  ? `${yearsToBarista} yrs`
                  : "50+ yrs"
              }
              sub={
                yearsToBarista && currentSavings < baristaTarget
                  ? `~Age ${currentAge + yearsToBarista}`
                  : undefined
              }
              color={hasReached ? C.teal : C.text}
            />
          </div>

          {/* Progress bar */}
          <div
            style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              padding: "16px 20px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: C.muted, fontFamily: "monospace" }}>
                CURRENT SAVINGS → BARISTA FIRE TARGET
              </span>
              <span style={{ fontSize: 12, color: C.accent, fontFamily: "monospace" }}>
                {Math.min(progress, 100).toFixed(1)}%
              </span>
            </div>
            <div
              style={{ height: 8, background: C.border, borderRadius: 99, overflow: "hidden" }}
            >
              <div
                style={{
                  width: `${Math.min(progress, 100)}%`,
                  height: "100%",
                  background: `linear-gradient(90deg, ${C.amber}, ${C.accent})`,
                  borderRadius: 99,
                  transition: "width 0.6s cubic-bezier(0.34,1.56,0.64,1)",
                }}
              />
            </div>
          </div>

          {/* Chart */}
          <div
            style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 16,
              padding: 24,
            }}
          >
            <div style={{ marginBottom: 20 }}>
              <div
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700,
                  fontSize: 15,
                  marginBottom: 4,
                }}
              >
                Portfolio Growth vs Targets
              </div>
              <div style={{ fontSize: 12, color: C.muted }}>
                Orange dashed = Barista FIRE target · Red dashed = Full FIRE target
              </div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="gBPort" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C.teal} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={C.teal} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                <XAxis
                  dataKey="age"
                  tickFormatter={(v) => `Age ${v}`}
                  tick={{ fill: C.muted, fontSize: 11, fontFamily: "monospace" }}
                  axisLine={{ stroke: C.border }}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v) => fmt(v, true)}
                  tick={{ fill: C.muted, fontSize: 11, fontFamily: "monospace" }}
                  axisLine={false}
                  tickLine={false}
                  width={68}
                />
                <Tooltip content={<ChartTooltip />} />
                <ReferenceLine
                  y={baristaTarget}
                  stroke={C.accent}
                  strokeDasharray="4 4"
                  label={{
                    value: "Barista FIRE",
                    fill: C.accent,
                    fontSize: 10,
                    fontFamily: "monospace",
                  }}
                />
                <ReferenceLine
                  y={fullFireTarget}
                  stroke={C.red}
                  strokeDasharray="4 4"
                  label={{
                    value: "Full FIRE",
                    fill: C.red,
                    fontSize: 10,
                    fontFamily: "monospace",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="Portfolio"
                  stroke={C.teal}
                  strokeWidth={2.5}
                  fill="url(#gBPort)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* How Barista FIRE works */}
          <div
            style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 16,
              padding: 24,
            }}
          >
            <div
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 700,
                fontSize: 15,
                marginBottom: 16,
              }}
            >
              How Barista FIRE Works
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                {
                  step: "1",
                  title: "Build your Barista FIRE portfolio",
                  desc: "Invest aggressively until you hit the Barista target — a much smaller number than full FIRE because your income gap is smaller.",
                },
                {
                  step: "2",
                  title: "Go part-time",
                  desc: "Take the lower-stress job. Work as a barista, consultant, freelancer, or in any role you actually enjoy. You only need to cover your expenses — your portfolio handles the gap.",
                },
                {
                  step: "3",
                  title: "Let time work for you",
                  desc: "Your portfolio keeps compounding. Many Barista FIRE folks reach full FIRE years ahead of schedule because they stopped stressing, made better decisions, and kept a toe in the market.",
                },
              ].map(({ step, title, desc }) => (
                <div key={step} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 99,
                      background: `${C.amber}20`,
                      border: `1px solid ${C.amber}40`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      color: C.amber,
                      fontFamily: "monospace",
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {step}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 14 }}>{title}</div>
                    <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div style={{ maxWidth: 760, margin: "48px auto 0", padding: "0 24px" }}>
        <h2
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 700,
            fontSize: 26,
            marginBottom: 8,
          }}
        >
          Frequently Asked Questions
        </h2>
        <p style={{ color: C.muted, marginBottom: 32, fontSize: 14 }}>
          Everything you need to know about Barista FIRE.
        </p>
        <FAQ
          q="What is Barista FIRE?"
          a="Barista FIRE is a semi-retirement strategy where you build a smaller investment portfolio and supplement withdrawals with part-time income. Together, they cover all your expenses. The name comes from people who take a part-time barista job at companies like Starbucks to get health insurance while their portfolio does the heavy lifting."
        />
        <FAQ
          q="How do you calculate your Barista FIRE number?"
          a="Barista FIRE number = (Annual Expenses − Part-time Income) ÷ Withdrawal Rate. Example: $60,000 expenses − $20,000 part-time income = $40,000 gap. At 4% withdrawal rate: $40,000 ÷ 0.04 = $1,000,000 Barista FIRE number. The calculator above does this instantly."
        />
        <FAQ
          q="What is the difference between Barista FIRE and Coast FIRE?"
          a="Barista FIRE = you're already semi-retired, withdrawing from your portfolio + working part-time. Coast FIRE = you've invested enough that compound growth will reach your full FIRE target by retirement — but you're not withdrawing yet, just covering living costs. Coast FIRE is a milestone on the path; Barista FIRE is a destination."
        />
        <FAQ
          q="Why is it called Barista FIRE?"
          a="The term came from the FIRE community because Starbucks offers health insurance to part-time workers. For early retirees in the US, healthcare is the biggest expense wildcard. A part-time barista job solving the healthcare problem means your portfolio needs to cover much less."
        />
        <FAQ
          q="How much do I need for Barista FIRE?"
          a="If you spend $50,000/year and earn $15,000 part-time, your income gap is $35,000. At a 4% withdrawal rate, you need $875,000 invested — vs $1.25M for full FIRE. Barista FIRE cuts the target by 30% and can be reached years earlier."
        />
        <FAQ
          q="Is Barista FIRE right for me?"
          a="Barista FIRE works well if you have a passion, skill, or job you'd enjoy doing part-time anyway — and you don't want to wait the additional years to reach full FIRE. It's especially powerful for people who hate their current full-time career and want an exit earlier rather than later."
        />
      </div>

      {/* Related */}
      <div style={{ maxWidth: 760, margin: "48px auto 0", padding: "0 24px" }}>
        <h2
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 700,
            fontSize: 22,
            marginBottom: 20,
          }}
        >
          More FIRE Calculators
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
          {[
            { href: "/coast-fire-calculator", emoji: "🌊", label: "Coast FIRE Calculator", sub: "Stop saving, let it grow" },
            { href: "/calculator", emoji: "🔥", label: "Full FIRE Calculator", sub: "Complete projection tool" },
            { href: "/", emoji: "🌍", label: "FIRE Number by City", sub: "Geo-adjusted planning" },
          ].map(({ href, emoji, label, sub }) => (
            <Link
              key={href}
              href={href}
              style={{
                display: "block",
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                padding: "16px 20px",
                textDecoration: "none",
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 8 }}>{emoji}</div>
              <div style={{ fontWeight: 600, color: C.text, marginBottom: 4, fontSize: 14 }}>
                {label}
              </div>
              <div style={{ fontSize: 12, color: C.muted }}>{sub}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
