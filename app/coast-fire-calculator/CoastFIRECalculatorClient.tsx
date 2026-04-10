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
  bg: "#08080e",
  card: "#13131e",
  border: "#1c1c2e",
  text: "#e8e8f2",
  muted: "#5e5e7a",
  accent: "#f97316",
  teal: "#22d3a5",
  red: "#ef4444",
  purple: "#8b5cf6",
};

const fmt = (n: number, compact = false) => {
  if (compact && Math.abs(n) >= 1_000_000)
    return `$${(n / 1_000_000).toFixed(2)}M`;
  if (compact && Math.abs(n) >= 1_000)
    return `$${(n / 1_000).toFixed(0)}k`;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
};

// ─── Coast FIRE Math ──────────────────────────────────────────────────────────
// Coast FIRE number = FIRE Target / (1 + r)^n
// where n = years until retirement, r = annual growth rate
function calcCoastFIRE({
  currentAge,
  retirementAge,
  annualExpenses,
  currentSavings,
  growthRate = 0.07,
  withdrawalRate = 0.04,
}: {
  currentAge: number;
  retirementAge: number;
  annualExpenses: number;
  currentSavings: number;
  growthRate?: number;
  withdrawalRate?: number;
}) {
  const yearsToRetirement = retirementAge - currentAge;
  const fireTarget = annualExpenses / withdrawalRate;
  const coastNumber = fireTarget / Math.pow(1 + growthRate, yearsToRetirement);
  const progress = Math.min(100, (currentSavings / coastNumber) * 100);
  const hasCoasted = currentSavings >= coastNumber;

  // Projection: two lines — "if you save nothing more" vs "FIRE target"
  const data = [];
  let portfolio = currentSavings;
  for (let y = 0; y <= yearsToRetirement; y++) {
    data.push({
      age: currentAge + y,
      Portfolio: Math.round(portfolio),
      "FIRE Target": Math.round(fireTarget),
      "Coast Number": Math.round(coastNumber),
    });
    portfolio = portfolio * (1 + growthRate);
  }

  return { fireTarget, coastNumber, progress, hasCoasted, data, yearsToRetirement };
}

// ─── Reusable components ──────────────────────────────────────────────────────
function Field({
  label,
  value,
  onChange,
  prefix = "$",
  hint,
  min,
  max,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  hint?: string;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label
        style={{
          fontSize: 11,
          fontFamily: "'DM Mono', monospace",
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
              fontFamily: "'DM Mono', monospace",
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
          step={step}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{
            width: "100%",
            background: "#0d0d18",
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            padding: prefix ? "10px 12px 10px 28px" : "10px 12px",
            color: C.text,
            fontFamily: "'DM Mono', monospace",
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
        <span style={{ fontSize: 11, color: C.muted, fontStyle: "italic" }}>
          {hint}
        </span>
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
            fontFamily: "'DM Mono', monospace",
            letterSpacing: "0.08em",
            textTransform: "uppercase" as const,
            color: C.muted,
          }}
        >
          {label}
        </label>
        <span style={{ fontSize: 13, color: C.accent, fontFamily: "'DM Mono', monospace" }}>
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
          fontFamily: "'DM Mono', monospace",
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
          fontFamily: "'Syne', sans-serif",
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
        background: "#1a1a2e",
        border: `1px solid ${C.border}`,
        borderRadius: 8,
        padding: "10px 14px",
        fontFamily: "'DM Mono', monospace",
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

// ─── FAQ Item ─────────────────────────────────────────────────────────────────
function FAQ({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        borderBottom: `1px solid ${C.border}`,
        padding: "16px 0",
      }}
    >
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
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 500,
          cursor: "pointer",
          textAlign: "left" as const,
          padding: 0,
          gap: 16,
        }}
      >
        <span>{q}</span>
        <span style={{ color: C.accent, fontSize: 20, flexShrink: 0 }}>
          {open ? "−" : "+"}
        </span>
      </button>
      {open && (
        <p
          style={{
            marginTop: 12,
            color: C.muted,
            fontSize: 14,
            lineHeight: 1.7,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {a}
        </p>
      )}
    </div>
  );
}

// ─── JSON-LD Structured Data ──────────────────────────────────────────────────
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "Coast FIRE Calculator",
      applicationCategory: "FinanceApplication",
      operatingSystem: "Web",
      url: "https://untilfire.com/coast-fire-calculator",
      description:
        "Calculate your Coast FIRE number — the amount you need invested today to coast to retirement without saving another dollar.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      provider: { "@type": "Organization", name: "UntilFire", url: "https://untilfire.com" },
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is Coast FIRE?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Coast FIRE is a financial independence strategy where you invest enough money early so that compound growth alone will reach your full FIRE number by retirement — without any additional contributions. Once you hit your Coast FIRE number, you only need to earn enough to cover living expenses.",
          },
        },
        {
          "@type": "Question",
          name: "How do you calculate your Coast FIRE number?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Your Coast FIRE number = FIRE Target ÷ (1 + annual growth rate)^years until retirement. For example, if your FIRE target is $1M, you have 25 years to retirement, and you expect 7% annual returns: Coast number = $1,000,000 ÷ (1.07)^25 = $184,249. If you have that amount invested today, you can stop contributing and still retire on time.",
          },
        },
        {
          "@type": "Question",
          name: "What is the difference between Coast FIRE and regular FIRE?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Regular FIRE requires you to save aggressively until you accumulate your full FIRE number (typically 25× annual expenses). Coast FIRE lets you stop saving once your invested portfolio will grow to the full FIRE target on its own. This means you can switch to a lower-stress, lower-paying job while your investments do the heavy lifting.",
          },
        },
        {
          "@type": "Question",
          name: "What is a good Coast FIRE number?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Your Coast FIRE number depends on your age, target retirement age, expected annual expenses in retirement, and investment return assumptions. A 30-year-old planning to retire at 60 with $50,000/year in expenses (4% rule = $1.25M FIRE target) needs approximately $230,000 invested today at 7% returns to coast to retirement.",
          },
        },
        {
          "@type": "Question",
          name: "How to calculate Coast FIRE number if I have multiple accounts?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Add together all your investable assets: 401(k), Roth IRA, traditional IRA, taxable brokerage accounts. Do not include home equity or cash savings unless they are invested. Enter this total as your current savings in the Coast FIRE calculator above.",
          },
        },
      ],
    },
  ],
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CoastFIRECalculatorClient() {
  const [currentAge, setCurrentAge] = useState(30);
  const [retirementAge, setRetirementAge] = useState(60);
  const [annualExpenses, setAnnualExpenses] = useState(50000);
  const [currentSavings, setCurrentSavings] = useState(80000);
  const [growthRate, setGrowthRate] = useState(0.07);
  const [withdrawalRate, setWithdrawalRate] = useState(0.04);

  const { fireTarget, coastNumber, progress, hasCoasted, data, yearsToRetirement } = useMemo(
    () =>
      calcCoastFIRE({
        currentAge,
        retirementAge,
        annualExpenses,
        currentSavings,
        growthRate,
        withdrawalRate,
      }),
    [currentAge, retirementAge, annualExpenses, currentSavings, growthRate, withdrawalRate]
  );

  const deficit = Math.max(0, coastNumber - currentSavings);
  const surplus = Math.max(0, currentSavings - coastNumber);

  return (
    <div
      style={{
        background: C.bg,
        color: C.text,
        fontFamily: "'DM Sans', sans-serif",
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
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: 20,
            color: C.accent,
            textDecoration: "none",
          }}
        >
          UntilFire
        </Link>
        <span style={{ color: C.muted, fontSize: 13 }}>/ Coast FIRE Calculator</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 16 }}>
          <Link
            href="/barista-fire-calculator"
            style={{ fontSize: 13, color: C.muted, textDecoration: "none" }}
          >
            Barista FIRE →
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
            background: `${C.accent}15`,
            border: `1px solid ${C.accent}30`,
            borderRadius: 99,
            padding: "5px 16px",
            fontSize: 12,
            color: C.accent,
            fontFamily: "'DM Mono', monospace",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: 20,
          }}
        >
          🌊 Coast FIRE Calculator
        </div>
        <h1
          style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: "clamp(32px, 5vw, 52px)",
            lineHeight: 1.1,
            margin: "0 0 16px",
            color: C.text,
          }}
        >
          Coast FIRE Calculator
        </h1>
        <p
          style={{
            fontSize: 18,
            color: C.muted,
            maxWidth: 560,
            margin: "0 auto 8px",
            lineHeight: 1.6,
          }}
        >
          How much do you need invested <em style={{ color: C.text }}>today</em> to coast to
          retirement — without saving another dollar?
        </p>
        <p style={{ fontSize: 13, color: C.muted, fontFamily: "'DM Mono', monospace" }}>
          Coast FIRE number = FIRE Target ÷ (1 + return rate)
          <sup>years to retirement</sup>
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
          {/* Your Numbers */}
          <div
            style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 16,
              padding: 24,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <span style={{ fontSize: 16 }}>👤</span>
              <span
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 700,
                  fontSize: 13,
                  color: C.accent,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                Your Numbers
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Field
                label="Current Age"
                value={currentAge}
                onChange={setCurrentAge}
                prefix=""
                min={18}
                max={80}
                hint="Your age today"
              />
              <Field
                label="Target Retirement Age"
                value={retirementAge}
                onChange={setRetirementAge}
                prefix=""
                min={currentAge + 1}
                max={80}
                hint="When you want to stop working"
              />
              <Field
                label="Annual Expenses in Retirement"
                value={annualExpenses}
                onChange={setAnnualExpenses}
                hint="Today's dollars. How much you'll spend per year."
              />
              <Field
                label="Current Invested Assets"
                value={currentSavings}
                onChange={setCurrentSavings}
                hint="401(k) + Roth IRA + brokerage. Not cash."
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
                  fontFamily: "'Syne', sans-serif",
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
              background: hasCoasted ? `${C.teal}10` : `${C.accent}10`,
              border: `1px solid ${hasCoasted ? C.teal + "40" : C.accent + "40"}`,
              borderRadius: 16,
              padding: "20px 24px",
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <span style={{ fontSize: 32 }}>{hasCoasted ? "🏄" : "🌊"}</span>
            <div>
              <div
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 700,
                  fontSize: 18,
                  color: hasCoasted ? C.teal : C.text,
                  marginBottom: 4,
                }}
              >
                {hasCoasted
                  ? "You've reached Coast FIRE!"
                  : `${fmt(deficit, true)} away from Coast FIRE`}
              </div>
              <div style={{ fontSize: 13, color: C.muted }}>
                {hasCoasted
                  ? `You have ${fmt(surplus, true)} more than needed. Your portfolio will reach ${fmt(fireTarget, true)} by age ${retirementAge} on its own.`
                  : `Once you invest ${fmt(coastNumber, true)} total, compound growth will do the rest — no more saving required.`}
              </div>
            </div>
          </div>

          {/* KPI grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 12,
            }}
          >
            <StatCard
              label="Coast FIRE Number"
              value={fmt(coastNumber, true)}
              sub={`Invest this today`}
              color={C.accent}
              accent
            />
            <StatCard
              label="Full FIRE Target"
              value={fmt(fireTarget, true)}
              sub={`${(withdrawalRate * 100).toFixed(0)}% rule · ${yearsToRetirement} yrs`}
            />
            <StatCard
              label="Current Progress"
              value={`${Math.min(progress, 100).toFixed(0)}%`}
              sub={`${fmt(currentSavings, true)} of ${fmt(coastNumber, true)}`}
              color={progress >= 100 ? C.teal : progress >= 60 ? C.accent : C.text}
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
              <span style={{ fontSize: 12, color: C.muted, fontFamily: "'DM Mono', monospace" }}>
                CURRENT SAVINGS → COAST FIRE NUMBER
              </span>
              <span style={{ fontSize: 12, color: C.accent, fontFamily: "'DM Mono', monospace" }}>
                {Math.min(progress, 100).toFixed(1)}%
              </span>
            </div>
            <div
              style={{
                height: 8,
                background: C.border,
                borderRadius: 99,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${Math.min(progress, 100)}%`,
                  height: "100%",
                  background: `linear-gradient(90deg, ${C.teal}, ${C.accent})`,
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
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 700,
                  fontSize: 15,
                  marginBottom: 4,
                }}
              >
                Portfolio Growth Projection
              </div>
              <div style={{ fontSize: 12, color: C.muted }}>
                If you invest nothing more from today — does your portfolio reach the FIRE target?
              </div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="gPort" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C.teal} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={C.teal} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gFire" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C.accent} stopOpacity={0.15} />
                    <stop offset="100%" stopColor={C.accent} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                <XAxis
                  dataKey="age"
                  tickFormatter={(v) => `Age ${v}`}
                  tick={{ fill: C.muted, fontSize: 11, fontFamily: "DM Mono" }}
                  axisLine={{ stroke: C.border }}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v) => fmt(v, true)}
                  tick={{ fill: C.muted, fontSize: 11, fontFamily: "DM Mono" }}
                  axisLine={false}
                  tickLine={false}
                  width={68}
                />
                <Tooltip content={<ChartTooltip />} />
                <ReferenceLine
                  y={coastNumber}
                  stroke={C.teal}
                  strokeDasharray="4 4"
                  label={{
                    value: "Coast #",
                    fill: C.teal,
                    fontSize: 10,
                    fontFamily: "DM Mono",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="FIRE Target"
                  stroke={C.accent}
                  strokeWidth={1.5}
                  strokeDasharray="5 3"
                  fill="url(#gFire)"
                  dot={false}
                />
                <Area
                  type="monotone"
                  dataKey="Portfolio"
                  stroke={C.teal}
                  strokeWidth={2.5}
                  fill="url(#gPort)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
            <p style={{ margin: "12px 0 0", fontSize: 11, color: C.muted, textAlign: "center" }}>
              Teal = your portfolio (no new contributions) · Orange dashed = FIRE target · Teal
              dashed = Coast FIRE number
            </p>
          </div>

          {/* How it works */}
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
                fontFamily: "'Syne', sans-serif",
                fontWeight: 700,
                fontSize: 15,
                marginBottom: 16,
              }}
            >
              How Coast FIRE Works
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                {
                  step: "1",
                  title: "Invest your Coast FIRE number",
                  desc: "Get to the Coast number as fast as possible while you're young — time is your biggest lever.",
                },
                {
                  step: "2",
                  title: "Stop saving for retirement",
                  desc: "Once you hit the Coast number, compound growth alone will reach your full FIRE target by retirement age.",
                },
                {
                  step: "3",
                  title: "Only cover living expenses",
                  desc: "Work less, take a lower-paying job you enjoy, or go part-time. You just need to cover today's bills.",
                },
              ].map(({ step, title, desc }) => (
                <div key={step} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 99,
                      background: `${C.accent}20`,
                      border: `1px solid ${C.accent}40`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      color: C.accent,
                      fontFamily: "'DM Mono', monospace",
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

      {/* FAQ Section */}
      <div style={{ maxWidth: 760, margin: "48px auto 0", padding: "0 24px" }}>
        <h2
          style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 700,
            fontSize: 26,
            marginBottom: 8,
          }}
        >
          Frequently Asked Questions
        </h2>
        <p style={{ color: C.muted, marginBottom: 32, fontSize: 14 }}>
          Everything you need to know about Coast FIRE.
        </p>
        <FAQ
          q="What is Coast FIRE?"
          a="Coast FIRE is a financial independence strategy where you invest enough money early so that compound growth alone will reach your full FIRE number by retirement — without any additional contributions. Once you hit your Coast FIRE number, you only need to earn enough to cover living expenses."
        />
        <FAQ
          q="How do you calculate your Coast FIRE number?"
          a="Coast FIRE number = FIRE Target ÷ (1 + annual growth rate)^years until retirement. For example, if your FIRE target is $1M, you have 25 years to retirement, and you expect 7% annual returns: Coast number = $1,000,000 ÷ (1.07)^25 = $184,249. The calculator above does this math instantly."
        />
        <FAQ
          q="What is the difference between Coast FIRE and regular FIRE?"
          a="Regular FIRE requires you to save aggressively until you accumulate your full FIRE number (typically 25× annual expenses). Coast FIRE lets you stop saving once your invested portfolio will grow to the full FIRE target on its own. This means you can switch to a lower-stress, lower-paying job while your investments do the heavy lifting."
        />
        <FAQ
          q="What is a good Coast FIRE number?"
          a="It depends entirely on your age, target retirement age, and expected annual spending in retirement. A 30-year-old retiring at 60 with $50,000/year in expenses (FIRE target = $1.25M) needs about $230,000 invested today at 7% returns. Use the calculator above to find your personal number."
        />
        <FAQ
          q="How to calculate Coast FIRE if I have multiple accounts?"
          a="Add together all your investable assets: 401(k), Roth IRA, traditional IRA, taxable brokerage accounts. Do not include home equity, cash savings, or your emergency fund. Enter this total as your current savings above."
        />
        <FAQ
          q="What happens after you reach Coast FIRE?"
          a="You stop being obligated to save for retirement. Many Coast FIRE people switch to Barista FIRE — taking a part-time or passion job that covers day-to-day expenses (and often health insurance) while their portfolio compounds. You can also continue saving to reach full FIRE faster."
        />
      </div>

      {/* Related calculators */}
      <div style={{ maxWidth: 760, margin: "48px auto 0", padding: "0 24px" }}>
        <h2
          style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 700,
            fontSize: 22,
            marginBottom: 20,
          }}
        >
          More FIRE Calculators
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
          {[
            { href: "/barista-fire-calculator", emoji: "☕", label: "Barista FIRE Calculator", sub: "Part-time work + portfolio" },
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
                transition: "border-color 0.2s",
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
