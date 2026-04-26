"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend, ReferenceLine,
} from "recharts";
import TransactionsTab from "./TransactionsTab";
import { monteCarloFIRE } from "@/lib/monte-carlo";

// ─── Types ────────────────────────────────────────────────────────────────────
type Expenses = Record<string, number>;
type TabKey = "dashboard" | "calculators" | "budget";

// ─── Constants ────────────────────────────────────────────────────────────────
const EXPENSE_CATS = [
  { key: "housing",       label: "Housing",       icon: "🏠", color: "#818cf8" },
  { key: "food",          label: "Food & Dining",  icon: "🍔", color: "#f97316" },
  { key: "transport",     label: "Transport",      icon: "🚗", color: "#22d3a5" },
  { key: "subscriptions", label: "Subscriptions",  icon: "📱", color: "#a78bfa" },
  { key: "healthcare",    label: "Healthcare",     icon: "🏥", color: "#ef4444" },
  { key: "entertainment", label: "Entertainment",  icon: "🎬", color: "#fbbf24" },
  { key: "other",         label: "Other",          icon: "📦", color: "#6b6b85" },
];

// ─── Formatters ───────────────────────────────────────────────────────────────
const fmt = (n: number, compact = false) => {
  if (compact && Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (compact && Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return "$" + Math.round(n).toLocaleString();
};

// ─── FIRE Engine ──────────────────────────────────────────────────────────────
function calcProjection({
  annualIncome, monthlyExpenses, k401, rothIRA, taxable,
  totalDebt, mortgageBalance, mortgageMonthly,
  growthRate = 0.07, withdrawalRate = 0.04, years = 50,
}: {
  annualIncome: number; monthlyExpenses: number; k401: number;
  rothIRA: number; taxable: number; totalDebt: number;
  mortgageBalance: number; mortgageMonthly: number;
  growthRate?: number; withdrawalRate?: number; years?: number;
}) {
  const annualExpenses = monthlyExpenses * 12;
  const annualMortgage = mortgageMonthly * 12;
  const annualSavings  = annualIncome - annualExpenses - annualMortgage;
  const fireTarget     = annualExpenses * (1 / withdrawalRate);

  const k401Contrib    = Math.min(Math.max(annualSavings * 0.4, 0), 23000);
  const rothContrib    = Math.min(Math.max(annualSavings * 0.2, 0), 7000);
  const taxableContrib = Math.max(annualSavings - k401Contrib - rothContrib, 0);

  const data: Record<string, number>[] = [];
  let cur401k    = k401;
  let curRoth    = rothIRA;
  let curTaxable = taxable;
  let curDebt    = totalDebt;
  let curMort    = mortgageBalance;
  let fireYear: number | null = null;

  for (let y = 0; y <= years; y++) {
    const investable = cur401k + curRoth + curTaxable;
    const netWorth   = investable - curDebt - curMort;
    if (fireYear === null && investable >= fireTarget && y > 0) fireYear = y;
    data.push({
      year: y,
      "401(k)":     Math.round(cur401k),
      "Roth IRA":   Math.round(curRoth),
      "Taxable":    Math.round(curTaxable),
      "Net Worth":  Math.round(netWorth),
      "FIRE Target":Math.round(fireTarget),
      "Investable": Math.round(investable),
      "Debt":       Math.round(-(curDebt + curMort)),
    });
    cur401k    = cur401k    * (1 + growthRate) + k401Contrib;
    curRoth    = curRoth    * (1 + growthRate) + rothContrib;
    curTaxable = curTaxable * (1 + growthRate) + taxableContrib;
    if (curDebt > 0) {
      const interest = curDebt * 0.05;
      const payment  = Math.min(curDebt + interest, Math.max(annualSavings * 0.3, 0));
      curDebt = Math.max(0, curDebt + interest - payment);
    }
    if (curMort > 0) {
      const mInt = curMort * 0.065;
      const prin = Math.max(0, annualMortgage - mInt);
      curMort = Math.max(0, curMort - prin);
    }
  }
  return { data, fireYear, fireTarget, annualSavings };
}

// ─── Shared UI ────────────────────────────────────────────────────────────────
function NumberInput({ value, onChange, placeholder = "0", prefix = "$" }: {
  value: number; onChange: (v: number) => void;
  placeholder?: string; prefix?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 6,
      background: "#f9f9fb", borderRadius: 8, padding: "9px 12px",
      border: `1px solid ${focused ? "#f97316" : "#e8e8f0"}`,
      transition: "border-color 0.2s",
    }}>
      <span style={{ color: "#9090a8", fontSize: 13, fontFamily: "DM Mono, monospace" }}>{prefix}</span>
      <input
        type="number" value={value || ""} placeholder={placeholder}
        onChange={e => onChange(Number(e.target.value))}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{ background: "none", border: "none", outline: "none", color: "#1a1a2e", fontSize: 14, width: "100%", fontFamily: "DM Mono, monospace" }}
      />
    </div>
  );
}

function FieldRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 11, fontFamily: "DM Mono, monospace", letterSpacing: "0.08em", textTransform: "uppercase", color: "#9090a8" }}>
        {label}
      </label>
      {children}
      {hint && <span style={{ fontSize: 11, color: "#b8b8cc", fontStyle: "italic" }}>{hint}</span>}
    </div>
  );
}

function KpiCard({ label, value, sub, color = "#1a1a2e", glow = false }: {
  label: string; value: string; sub?: string; color?: string; glow?: boolean;
}) {
  return (
    <div className={`uf-card ${glow ? "uf-card-glow" : ""}`} style={{ padding: "18px 20px" }}>
      <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9090a8", marginBottom: 8, fontFamily: "DM Mono, monospace" }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color, fontFamily: "DM Mono, monospace", lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "#9090a8", marginTop: 5 }}>{sub}</div>}
    </div>
  );
}

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#ffffff", border: "1px solid #e8e8f0", borderRadius: 8, padding: "10px 14px", fontFamily: "DM Mono, monospace", fontSize: 12 }}>
      <p style={{ color: "#9090a8", marginBottom: 6 }}>Year {label}</p>
      {payload.map((p: any) => (
        <div key={p.name} style={{ color: p.color, marginBottom: 2 }}>{p.name}: {fmt(p.value, true)}</div>
      ))}
    </div>
  );
};

function SectionLabel({ icon, text, color = "#f97316" }: { icon: string; text: string; color?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
      <span style={{ fontSize: 14 }}>{icon}</span>
      <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 12, color, letterSpacing: "0.08em", textTransform: "uppercase" }}>{text}</span>
    </div>
  );
}

// ─── Monte Carlo Probability Card ─────────────────────────────────────────────
function MonteCarloCard({ income, expenses, k401, rothIRA, taxable, growthRate, withdrawalRate }: {
  income: number; expenses: Expenses; k401: number; rothIRA: number;
  taxable: number; growthRate: number; withdrawalRate: number;
}) {
  const [extraSavings, setExtraSavings] = useState(0);

  const monthlyExpenses = Object.entries(expenses)
    .filter(([k]) => !k.startsWith("_"))
    .reduce((s, [, v]) => s + (v || 0), 0);

  const annualExpenses = monthlyExpenses * 12;
  const fireTarget     = annualExpenses / withdrawalRate;
  const annualSavings  = income * 12 - annualExpenses;
  const investable     = k401 + rothIRA + taxable;

  const base = useMemo(() => {
    if (fireTarget <= 0 || income <= 0) return null;
    return monteCarloFIRE({ initialInvestable: investable, annualSavings, fireTarget, meanReturn: growthRate });
  }, [investable, annualSavings, fireTarget, growthRate]);

  const delta = useMemo(() => {
    if (!base || extraSavings === 0) return null;
    return monteCarloFIRE({
      initialInvestable: investable,
      annualSavings: annualSavings + extraSavings * 12,
      fireTarget,
      meanReturn: growthRate,
    });
  }, [base, investable, annualSavings, fireTarget, growthRate, extraSavings]);

  if (!base) {
    return (
      <div className="uf-card" style={{ padding: "28px 32px", textAlign: "center" }}>
        <p style={{ color: "#9090a8", fontSize: 14, margin: 0 }}>Add income &amp; expenses to see your success probability</p>
      </div>
    );
  }

  const result     = delta ?? base;
  const yearDelta  = delta ? Math.max(0, base.p50Years - delta.p50Years) : 0;
  const maxCount   = Math.max(...result.histogram.map(h => h.count), 1);
  const scoreColor = result.probability >= 80 ? "#22d3a5" : result.probability >= 60 ? "#f97316" : result.probability >= 40 ? "#fbbf24" : "#ef4444";
  const scoreLabel = result.probability >= 80 ? "HIGHLY LIKELY" : result.probability >= 60 ? "LIKELY" : result.probability >= 40 ? "POSSIBLE" : "UNLIKELY";
  const pctYr      = (y: number) => y > 50 ? "50+ yr" : `${y} yr`;

  return (
    <div className="uf-card" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr" }}>

        {/* Score */}
        <div style={{ padding: "28px 28px 24px", borderRight: "1px solid #e8e8f0" }}>
          <div style={{ fontSize: 11, fontFamily: "DM Mono, monospace", letterSpacing: "0.1em", textTransform: "uppercase", color: "#9090a8", marginBottom: 16 }}>Success Probability</div>
          <div style={{ fontSize: 60, fontWeight: 800, color: scoreColor, fontFamily: "Syne, sans-serif", letterSpacing: "-3px", lineHeight: 1, marginBottom: 4 }}>
            {result.probability}%
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: scoreColor, letterSpacing: "0.1em", marginBottom: 24 }}>{scoreLabel}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
            {([
              { label: "Best case",  years: result.p10Years, color: "#22d3a5" },
              { label: "Median",     years: result.p50Years, color: "#f97316" },
              { label: "Worst case", years: result.p90Years, color: "#9090a8" },
            ] as const).map(row => (
              <div key={row.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: "#9090a8" }}>{row.label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: row.color, background: `${row.color}18`, borderRadius: 20, padding: "3px 10px", fontFamily: "DM Mono, monospace" }}>
                  {pctYr(row.years)}
                </span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 11, color: "#b8b8cc", margin: 0, lineHeight: 1.5 }}>1,000 simulations · σ=12% annual returns</p>
        </div>

        {/* Histogram */}
        <div style={{ padding: "28px 28px 24px" }}>
          <div style={{ fontSize: 11, fontFamily: "DM Mono, monospace", letterSpacing: "0.1em", textTransform: "uppercase", color: "#9090a8", marginBottom: 12 }}>Distribution</div>
          <div style={{ display: "flex", gap: 16, marginBottom: 14 }}>
            {([["#22d3a5", "Within 40 yr"], ["#f97316", "Beyond 40 yr"]] as const).map(([c, l]) => (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: c }} />
                <span style={{ fontSize: 11, color: "#9090a8", fontFamily: "DM Mono, monospace" }}>{l}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {result.histogram.map(h => (
              <div key={h.bucket} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 10, color: "#b8b8cc", fontFamily: "DM Mono, monospace", width: 36, flexShrink: 0, textAlign: "right" }}>{h.bucket}</span>
                <div style={{ flex: 1, height: 14, background: "#f0f0f8", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(h.count / maxCount) * 100}%`, background: h.within40 ? "#22d3a5" : "#f97316", borderRadius: 3, transition: "width 0.4s" }} />
                </div>
                <span style={{ fontSize: 10, color: "#b8b8cc", fontFamily: "DM Mono, monospace", width: 26, flexShrink: 0, textAlign: "right" }}>
                  {Math.round((h.count / result.totalRuns) * 100)}%
                </span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 14 }}>
            {([
              { label: "p10", val: result.p10Years, color: "#22d3a5" },
              { label: "p50", val: result.p50Years, color: "#f97316" },
              { label: "p90", val: result.p90Years, color: "#9090a8" },
            ] as const).map(m => (
              <div key={m.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 10, fontFamily: "DM Mono, monospace", color: m.color, textDecoration: "underline dotted" }}>{m.label}</span>
                <span style={{ fontSize: 10, fontFamily: "DM Mono, monospace", color: "#9090a8", marginLeft: 2 }}>{pctYr(m.val)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* What-if slider */}
      <div style={{ borderTop: "1px solid #e8e8f0", padding: "16px 28px", display: "flex", alignItems: "center", gap: 16, background: "#f9f9fb", flexWrap: "wrap" }}>
        <span style={{ fontSize: 13, color: "#6b6b85", flexShrink: 0 }}>What if you saved</span>
        <input type="range" min={0} max={2000} step={50} value={extraSavings}
          onChange={e => setExtraSavings(Number(e.target.value))}
          style={{ flex: 1, minWidth: 120, accentColor: "#f97316" }} />
        <span style={{ fontSize: 13, fontFamily: "DM Mono, monospace", color: "#1a1a2e", flexShrink: 0, minWidth: 90 }}>
          +${extraSavings.toLocaleString()}/mo
        </span>
        {yearDelta > 0 ? (
          <span style={{ fontSize: 12, fontWeight: 700, color: "#22d3a5", background: "rgba(34,211,165,0.12)", borderRadius: 20, padding: "4px 12px", fontFamily: "DM Mono, monospace", flexShrink: 0 }}>
            −{yearDelta} yr
          </span>
        ) : (
          <span style={{ fontSize: 12, color: "#b8b8cc", fontFamily: "DM Mono, monospace", flexShrink: 0 }}>drag to simulate</span>
        )}
      </div>
    </div>
  );
}

// ─── Dashboard Overview Tab ───────────────────────────────────────────────────
function DashTab({ income, expenses, k401, rothIRA, taxable, totalDebt, mortgageBalance, mortgageMonthly, growthRate, withdrawalRate }: {
  income: number; expenses: Expenses; k401: number; rothIRA: number;
  taxable: number; totalDebt: number; mortgageBalance: number;
  mortgageMonthly: number; growthRate: number; withdrawalRate: number;
}) {
  const monthlyExpenses = Object.entries(expenses)
    .filter(([k]) => !k.startsWith("_"))
    .reduce((s, [, v]) => s + (v || 0), 0);

  const { data, fireYear, fireTarget, annualSavings } = useMemo(() => calcProjection({
    annualIncome: income * 12, monthlyExpenses,
    k401, rothIRA, taxable, totalDebt, mortgageBalance, mortgageMonthly,
    growthRate, withdrawalRate,
  }), [income, monthlyExpenses, k401, rothIRA, taxable, totalDebt, mortgageBalance, mortgageMonthly, growthRate, withdrawalRate]);

  const investable  = k401 + rothIRA + taxable;
  const netWorth    = investable - totalDebt - mortgageBalance;
  const savingsRate = income > 0 ? ((annualSavings / 12) / income) * 100 : 0;
  const progress    = fireTarget > 0 ? Math.min(100, (investable / fireTarget) * 100) : 0;
  const chartData   = data.slice(0, Math.min(data.length, (fireYear ?? 30) + 6));
  const activeCats  = EXPENSE_CATS.filter(c => (expenses[c.key] || 0) > 0);

  const retireYear = fireYear ? new Date().getFullYear() + fireYear : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── HERO: FIRE Score ──────────────────────────────────────────────── */}
      <div className="uf-card" style={{ padding: "28px 32px", background: "linear-gradient(135deg, #f0f0f8 0%, #ffffff 100%)", borderColor: "#e0e0ec", position: "relative", overflow: "hidden" }}>
        {/* Background glow */}
        <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(249,115,22,0.06) 0%, transparent 70%)", top: -100, right: -100, pointerEvents: "none" }} />

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 24, position: "relative" }}>
          {/* Left: headline */}
          <div>
            <div style={{ fontSize: 11, fontFamily: "DM Mono, monospace", letterSpacing: "0.12em", textTransform: "uppercase", color: "#9090a8", marginBottom: 10 }}>
              Your FIRE Journey
            </div>
            {fireYear ? (
              <>
                <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap" }}>
                  <span style={{ fontSize: "clamp(48px, 8vw, 72px)", fontWeight: 800, color: "#f97316", fontFamily: "Syne, sans-serif", letterSpacing: "-3px", lineHeight: 1 }}>
                    {retireYear}
                  </span>
                  <span style={{ fontSize: 20, color: "#6b6b85", fontWeight: 500 }}>
                    retire by
                  </span>
                </div>
                <div style={{ marginTop: 8, fontSize: 16, color: "#6b6b85" }}>
                  <span style={{ color: "#1a1a2e", fontWeight: 600 }}>{fireYear} years</span> away · target{" "}
                  <span style={{ color: "#22d3a5", fontFamily: "DM Mono, monospace" }}>{fmt(fireTarget, true)}</span>
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 36, fontWeight: 800, color: "#9090a8", fontFamily: "Syne, sans-serif", letterSpacing: "-2px" }}>
                  Set your inputs
                </div>
                <div style={{ marginTop: 8, fontSize: 14, color: "#9090a8" }}>
                  Add income &amp; expenses in the Budget tab to see your FIRE date
                </div>
              </>
            )}
          </div>

          {/* Right: supporting KPIs */}
          <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, fontFamily: "DM Mono, monospace", letterSpacing: "0.1em", textTransform: "uppercase", color: "#9090a8", marginBottom: 4 }}>Net Worth</div>
              <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "DM Mono, monospace", color: netWorth >= 0 ? "#22d3a5" : "#ef4444" }}>{fmt(netWorth, true)}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, fontFamily: "DM Mono, monospace", letterSpacing: "0.1em", textTransform: "uppercase", color: "#9090a8", marginBottom: 4 }}>Savings Rate</div>
              <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "DM Mono, monospace", color: savingsRate >= 50 ? "#f97316" : savingsRate >= 25 ? "#22d3a5" : "#ef4444" }}>
                {savingsRate.toFixed(0)}%
              </div>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ marginTop: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: "#9090a8", fontFamily: "DM Mono, monospace" }}>
              {fmt(investable, true)} saved
            </span>
            <span style={{ fontSize: 12, color: "#f97316", fontFamily: "DM Mono, monospace", fontWeight: 600 }}>
              {progress.toFixed(1)}% to FIRE
            </span>
            <span style={{ fontSize: 12, color: "#9090a8", fontFamily: "DM Mono, monospace" }}>
              {fmt(fireTarget, true)} target
            </span>
          </div>
          <div style={{ height: 8, background: "#e8e8f0", borderRadius: 99, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg, #22d3a5, #f97316)", borderRadius: 99, transition: "width 0.8s cubic-bezier(0.34,1.56,0.64,1)" }} />
          </div>
        </div>
      </div>

      {/* Monte Carlo probability card */}
      <MonteCarloCard
        income={income} expenses={expenses}
        k401={k401} rothIRA={rothIRA} taxable={taxable}
        growthRate={growthRate} withdrawalRate={withdrawalRate}
      />

      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16 }}>
        {/* Wealth projection chart */}
        <div className="uf-card">
          <SectionLabel icon="📈" text="Wealth Projection" color="#22d3a5" />
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="gInv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22d3a5" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#22d3a5" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gTgt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8e8f0" />
              <XAxis dataKey="year" tickFormatter={v => `Yr ${v}`} tick={{ fill: "#9090a8", fontSize: 10, fontFamily: "DM Mono" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => fmt(v, true)} tick={{ fill: "#9090a8", fontSize: 10, fontFamily: "DM Mono" }} axisLine={false} tickLine={false} width={55} />
              <Tooltip content={<ChartTooltip />} />
              {fireYear && <ReferenceLine x={fireYear} stroke="#f97316" strokeDasharray="4 3" label={{ value: "🔥", fill: "#f97316", fontSize: 12 }} />}
              <Area type="monotone" dataKey="FIRE Target" stroke="#f97316" strokeWidth={1.5} strokeDasharray="5 3" fill="url(#gTgt)" dot={false} />
              <Area type="monotone" dataKey="Investable" stroke="#22d3a5" strokeWidth={2.5} fill="url(#gInv)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Spending breakdown */}
        <div className="uf-card">
          <SectionLabel icon="💸" text="Spending Breakdown" color="#ef4444" />
          {activeCats.length === 0 ? (
            <div style={{ color: "#9090a8", fontSize: 13, textAlign: "center", padding: "40px 0" }}>
              Add expenses in the<br />Budget Tracker tab
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {activeCats.map(cat => {
                const val = expenses[cat.key] || 0;
                const pct = monthlyExpenses > 0 ? (val / monthlyExpenses) * 100 : 0;
                return (
                  <div key={cat.key}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                      <span style={{ color: "#6b6b85" }}>{cat.icon} {cat.label}</span>
                      <span style={{ color: cat.color, fontFamily: "DM Mono, monospace" }}>{fmt(val)} <span style={{ color: "#9090a8" }}>{pct.toFixed(0)}%</span></span>
                    </div>
                    <div style={{ height: 3, background: "#e8e8f0", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: cat.color, borderRadius: 4, transition: "width 0.5s" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Account snapshot + insights */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Account snapshot */}
        <div className="uf-card">
          <SectionLabel icon="🏦" text="Account Snapshot" color="#818cf8" />
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              {[
                { label: "401(k)",            val: k401,                     color: "#818cf8" },
                { label: "Roth IRA",          val: rothIRA,                  color: "#22d3a5" },
                { label: "Taxable Brokerage", val: taxable,                  color: "#a78bfa" },
                null,
                { label: "Consumer Debt",     val: -totalDebt,               color: "#ef4444" },
                { label: "Mortgage",          val: -mortgageBalance,         color: "#ef4444" },
                null,
                { label: "Net Worth",         val: netWorth, bold: true,     color: netWorth >= 0 ? "#22d3a5" : "#ef4444" },
              ].map((row, i) => {
                if (!row) return (
                  <tr key={`d${i}`}><td colSpan={2} style={{ borderTop: "1px solid #e8e8f0", padding: "4px 0" }} /></tr>
                );
                return (
                  <tr key={row.label}>
                    <td style={{ padding: "6px 0", fontSize: 13, color: row.bold ? "#1a1a2e" : "#6b6b85", fontWeight: row.bold ? 600 : 400 }}>{row.label}</td>
                    <td style={{ padding: "6px 0", textAlign: "right", fontFamily: "DM Mono, monospace", fontSize: 13, color: row.color, fontWeight: row.bold ? 700 : 400 }}>
                      {row.val >= 0 ? fmt(row.val) : `−${fmt(Math.abs(row.val))}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Insights */}
        <div className="uf-card">
          <SectionLabel icon="💡" text="Insights" color="#fbbf24" />
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              {
                icon: "📊",
                title: "Savings Rate",
                body: savingsRate >= 50 ? `${savingsRate.toFixed(0)}% — you're on an aggressive FIRE track.` : savingsRate >= 25 ? `${savingsRate.toFixed(0)}% is solid. Hitting 50% cuts years off your date.` : `At ${savingsRate.toFixed(0)}%, reducing expenses is your biggest lever.`,
                color: savingsRate >= 50 ? "#22d3a5" : savingsRate >= 25 ? "#f97316" : "#ef4444",
              },
              {
                icon: "🏠",
                title: "Housing Ratio",
                body: income > 0 && expenses.housing > 0 ? `Housing is ${(((expenses.housing || 0) / income) * 100).toFixed(0)}% of take-home. ${(expenses.housing || 0) / income > 0.3 ? "Above 30% — your biggest cost lever." : "Under 30% — healthy ratio."}` : "Add housing expenses to see your ratio.",
                color: "#1a1a2e",
              },
              {
                icon: "🔥",
                title: "Rule of 25",
                body: `Target: ${fmt(fireTarget, true)}. Every $100/mo you cut reduces your FIRE number by $30k.`,
                color: "#1a1a2e",
              },
            ].map(ins => (
              <div key={ins.title} style={{ background: "#f5f5fa", border: "1px solid #e8e8f0", borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                  <span style={{ fontSize: 14 }}>{ins.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: ins.color }}>{ins.title}</span>
                </div>
                <p style={{ fontSize: 12, color: "#9090a8", margin: "6px 0 0", lineHeight: 1.5 }}>{ins.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Calculators Hub Tab ─────────────────────────────────────────────────────
const CALCULATORS = [
  {
    href: "/calculators/4-percent-rule",
    title: "FIRE Number Calculator",
    description: "Calculate exactly how much you need to retire. Adjust the withdrawal rate and see how it changes your target.",
    tag: "FIRE · Retirement",
    color: "#f97316",
    label: "FI",
  },
  {
    href: "/calculators/savings-rate",
    title: "Savings Rate Calculator",
    description: "Find your savings rate and see exactly how it shifts your FIRE date — the single most powerful FIRE lever.",
    tag: "FIRE · Core",
    color: "#f97316",
    label: "SR",
  },
  {
    href: "/calculators/coast-fire",
    title: "Coast FIRE Calculator",
    description: "Find the magic number where you can stop saving and let compound growth carry you to retirement.",
    tag: "FIRE · Strategy",
    color: "#8b5cf6",
    label: "~",
  },
  {
    href: "/calculators/compound-interest",
    title: "Compound Interest Calculator",
    description: "Project how your investments grow with regular contributions over any time horizon.",
    tag: "Investing",
    color: "#f97316",
    label: "↗",
  },
  {
    href: "/calculators/apy",
    title: "APY Calculator",
    description: "Convert APR to APY and see exactly how compounding frequency affects your real return.",
    tag: "Savings",
    color: "#22d3a5",
    label: "%",
  },
];

function CalculatorsTab() {
  return (
    <div>
      <p style={{ color: "#9090a8", fontSize: 12, fontFamily: "DM Mono, monospace", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 20 }}>
        All tools
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {CALCULATORS.map(c => (
          <Link key={c.href} href={c.href} target="_blank" style={{ textDecoration: "none" }}>
            <div
              style={{ background: "#ffffff", border: "1px solid #e8e8f0", borderRadius: 12, padding: "24px 20px", height: "100%", display: "flex", flexDirection: "column", gap: 10, cursor: "pointer", transition: "border-color 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = c.color)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "#e8e8f0")}
            >
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${c.color}18`, border: `1px solid ${c.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: c.color, letterSpacing: "-1px" }}>
                {c.label}
              </div>
              <p style={{ fontSize: 11, fontWeight: 700, color: c.color, letterSpacing: "1.5px", textTransform: "uppercase", margin: 0 }}>{c.tag}</p>
              <p style={{ fontSize: 16, fontWeight: 700, color: "#1a1a2e", margin: 0, letterSpacing: "-0.3px" }}>{c.title}</p>
              <p style={{ fontSize: 13, color: "#6b6b85", margin: 0, lineHeight: 1.6, flexGrow: 1 }}>{c.description}</p>
              <p style={{ fontSize: 12, color: c.color, fontWeight: 600, margin: 0 }}>Open calculator →</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ─── Budget Tracker Tab ───────────────────────────────────────────────────────
function BudgetTab({ income, setIncome, expenses, setExpenses, actuals }: {
  income: number; setIncome: (v: number) => void;
  expenses: Expenses; setExpenses: (e: Expenses) => void;
  actuals: Record<string, number>;
}) {
  const totalExp = EXPENSE_CATS.reduce((s, c) => s + (expenses[c.key] || 0), 0);
  const savings  = income - totalExp;
  const rate     = income > 0 ? (savings / income) * 100 : 0;
  const hasActuals = Object.values(actuals).some(v => v > 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Income */}
      <div className="uf-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Monthly Income</div>
            <div style={{ color: "#9090a8", fontSize: 12, marginTop: 2 }}>After-tax take-home pay</div>
          </div>
          <span className="uf-tag" style={{ color: "#22d3a5", background: "rgba(34,211,165,0.1)" }}>INCOME</span>
        </div>
        <NumberInput value={income} onChange={setIncome} placeholder="5000" />
      </div>

      {/* Expenses */}
      <div className="uf-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Monthly Budget</div>
            <div style={{ color: "#9090a8", fontSize: 12, marginTop: 2 }}>
              {hasActuals ? "Budget vs. this month's actual spending" : "Set your budget by category"}
            </div>
          </div>
          <span className="uf-tag" style={{ color: "#ef4444", background: "rgba(239,68,68,0.1)" }}>EXPENSES</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {EXPENSE_CATS.map(cat => {
            const budget = expenses[cat.key] || 0;
            const spent = actuals[cat.key] || 0;
            const over = budget > 0 && spent > budget;
            const spentPct = budget > 0 ? Math.min(100, (spent / budget) * 100) : 0;
            return (
              <div key={cat.key} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <div style={{ display: "grid", gridTemplateColumns: "160px 1fr 80px", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 13, color: "#6b6b85" }}>{cat.icon} {cat.label}</span>
                  <NumberInput value={expenses[cat.key] || 0} onChange={v => setExpenses({ ...expenses, [cat.key]: v })} />
                  <div style={{ height: 4, background: "#e8e8f0", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${Math.min(100, income > 0 ? ((expenses[cat.key] || 0) / income) * 100 : 0)}%`, background: cat.color, borderRadius: 4, transition: "width 0.4s" }} />
                  </div>
                </div>
                {spent > 0 && (
                  <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 12, alignItems: "center" }}>
                    <span style={{ fontSize: 11, fontFamily: "DM Mono, monospace", color: over ? "#ef4444" : "#9090a8" }}>
                      {over ? "⚠ " : ""}Spent {fmt(spent)}{budget > 0 ? ` / ${fmt(budget)}` : ""}
                    </span>
                    {budget > 0 && (
                      <div style={{ height: 3, background: "#e8e8f0", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${spentPct}%`, background: over ? "#ef4444" : "#22d3a5", borderRadius: 4, transition: "width 0.4s" }} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      {income > 0 && (
        <div className="uf-card" style={{
          background: savings >= 0 ? "rgba(34,211,165,0.04)" : "rgba(239,68,68,0.04)",
          border: `1px solid ${savings >= 0 ? "rgba(34,211,165,0.2)" : "rgba(239,68,68,0.2)"}`,
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
            {[
              { label: "Total Expenses", val: fmt(totalExp), color: "#ef4444" },
              { label: "Monthly Savings", val: fmt(Math.max(0, savings)), color: "#22d3a5" },
              { label: "Savings Rate", val: `${rate.toFixed(1)}%`, color: rate >= 50 ? "#f97316" : rate >= 25 ? "#22d3a5" : "#ef4444" },
              { label: "Annual Savings", val: fmt(Math.max(0, savings) * 12), color: "#1a1a2e" },
            ].map(k => (
              <div key={k.label}>
                <div style={{ color: "#9090a8", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4, fontFamily: "DM Mono, monospace" }}>{k.label}</div>
                <div style={{ color: k.color, fontSize: 22, fontWeight: 700, fontFamily: "DM Mono, monospace" }}>{k.val}</div>
              </div>
            ))}
          </div>
          {/* Rate bar */}
          <div style={{ marginTop: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#9090a8", marginBottom: 6, fontFamily: "DM Mono, monospace" }}>
              <span>Savings rate</span><span>{rate.toFixed(1)}% {rate >= 50 ? "🔥 FIRE pace" : rate >= 25 ? "· Good" : "· Needs work"}</span>
            </div>
            <div style={{ height: 6, background: "#e8e8f0", borderRadius: 99, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${Math.min(100, rate)}%`, background: rate >= 50 ? "#f97316" : rate >= 25 ? "#22d3a5" : "#ef4444", borderRadius: 99, transition: "width 0.6s" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#b8b8cc", marginTop: 5 }}>
              <span>0%</span><span>25%</span><span>50% FIRE</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── FIRE Calculator Tab ──────────────────────────────────────────────────────
function FIRETab({ income, expenses, fireAge, setFireAge, k401, setK401, rothIRA, setRothIRA, taxable, setTaxable, totalDebt, setTotalDebt, mortgageBalance, setMortgageBalance, mortgageMonthly, setMortgageMonthly, growthRate, setGrowthRate, withdrawalRate, setWithdrawalRate }: {
  income: number; expenses: Expenses;
  fireAge: number; setFireAge: (v: number) => void;
  k401: number; setK401: (v: number) => void;
  rothIRA: number; setRothIRA: (v: number) => void;
  taxable: number; setTaxable: (v: number) => void;
  totalDebt: number; setTotalDebt: (v: number) => void;
  mortgageBalance: number; setMortgageBalance: (v: number) => void;
  mortgageMonthly: number; setMortgageMonthly: (v: number) => void;
  growthRate: number; setGrowthRate: (v: number) => void;
  withdrawalRate: number; setWithdrawalRate: (v: number) => void;
}) {
  const [chartTab, setChartTab] = useState<"growth" | "accounts" | "networth">("growth");

  const monthlyExpenses = Object.entries(expenses)
    .filter(([k]) => !k.startsWith("_"))
    .reduce((s, [, v]) => s + (v || 0), 0);

  const { data, fireYear, fireTarget, annualSavings } = useMemo(() => calcProjection({
    annualIncome: income * 12, monthlyExpenses,
    k401, rothIRA, taxable, totalDebt, mortgageBalance, mortgageMonthly,
    growthRate, withdrawalRate,
  }), [income, monthlyExpenses, k401, rothIRA, taxable, totalDebt, mortgageBalance, mortgageMonthly, growthRate, withdrawalRate]);

  const investable  = k401 + rothIRA + taxable;
  const netWorth    = investable - totalDebt - mortgageBalance;
  const savingsRate = income > 0 ? (annualSavings / 12 / income) * 100 : 0;
  const progress    = fireTarget > 0 ? Math.min(100, (investable / fireTarget) * 100) : 0;
  const retireAge   = fireAge + (fireYear ?? 0);
  const chartData   = data.slice(0, Math.min(data.length, (fireYear ?? 30) + 7));

  function TabBtn({ id, label }: { id: "growth" | "accounts" | "networth"; label: string }) {
    return (
      <button onClick={() => setChartTab(id)} style={{
        background: chartTab === id ? "#f97316" : "transparent",
        border: `1px solid ${chartTab === id ? "#f97316" : "#e8e8f0"}`,
        borderRadius: 6, padding: "5px 13px",
        color: chartTab === id ? "#fff" : "#9090a8",
        fontFamily: "DM Mono, monospace", fontSize: 11,
        letterSpacing: "0.06em", textTransform: "uppercase",
        cursor: "pointer", transition: "all 0.2s",
      }}>{label}</button>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Input panels */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>

        {/* Income & Spending */}
        <div className="uf-card">
          <SectionLabel icon="💰" text="Income & Spending" />
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <FieldRow label="Monthly Income (take-home)" hint="Auto-filled from Budget tab">
              <NumberInput value={income} onChange={() => {}} placeholder="5000" />
            </FieldRow>
            <FieldRow label="Monthly Expenses" hint="Auto-filled from Budget tab">
              <NumberInput value={monthlyExpenses} onChange={() => {}} placeholder="3000" />
            </FieldRow>
            <FieldRow label="Current Age">
              <NumberInput value={fireAge} onChange={setFireAge} placeholder="30" prefix="🎂" />
            </FieldRow>
          </div>
        </div>

        {/* Investment Accounts */}
        <div className="uf-card">
          <SectionLabel icon="📈" text="Investment Accounts" color="#22d3a5" />
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <FieldRow label="401(k) Balance">
              <NumberInput value={k401} onChange={setK401} placeholder="0" />
            </FieldRow>
            <FieldRow label="Roth IRA Balance">
              <NumberInput value={rothIRA} onChange={setRothIRA} placeholder="0" />
            </FieldRow>
            <FieldRow label="Taxable Brokerage">
              <NumberInput value={taxable} onChange={setTaxable} placeholder="0" />
            </FieldRow>
          </div>
        </div>

        {/* Debt + Assumptions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="uf-card">
            <SectionLabel icon="🔻" text="Debt" color="#ef4444" />
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <FieldRow label="Non-Mortgage Debt" hint="Credit cards, loans, auto">
                <NumberInput value={totalDebt} onChange={setTotalDebt} placeholder="0" />
              </FieldRow>
              <FieldRow label="Mortgage Balance">
                <NumberInput value={mortgageBalance} onChange={setMortgageBalance} placeholder="0" />
              </FieldRow>
              <FieldRow label="Monthly Mortgage Payment">
                <NumberInput value={mortgageMonthly} onChange={setMortgageMonthly} placeholder="0" />
              </FieldRow>
            </div>
          </div>

          <div className="uf-card">
            <SectionLabel icon="⚙️" text="Assumptions" color="#a78bfa" />
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: "#9090a8", fontFamily: "DM Mono, monospace", textTransform: "uppercase", letterSpacing: "0.08em" }}>Annual Return</span>
                  <span style={{ fontSize: 12, color: "#f97316", fontFamily: "DM Mono, monospace" }}>{(growthRate * 100).toFixed(1)}%</span>
                </div>
                <input type="range" min={0.03} max={0.12} step={0.001} value={growthRate}
                  onChange={e => setGrowthRate(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "#f97316", cursor: "pointer" }} />
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: "#9090a8", fontFamily: "DM Mono, monospace", textTransform: "uppercase", letterSpacing: "0.08em" }}>Withdrawal Rate</span>
                  <span style={{ fontSize: 12, color: "#f97316", fontFamily: "DM Mono, monospace" }}>{(withdrawalRate * 100).toFixed(1)}%</span>
                </div>
                <input type="range" min={0.03} max={0.06} step={0.001} value={withdrawalRate}
                  onChange={e => setWithdrawalRate(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "#f97316", cursor: "pointer" }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12 }}>
        {[
          { label: "FIRE Date",     val: fireYear ? `${fireYear} yrs` : "50+ yrs",      color: "#f97316", sub: fireYear ? `Age ${retireAge}` : "" },
          { label: "FIRE Target",   val: fmt(fireTarget, true),                          color: "#1a1a2e", sub: `${(withdrawalRate*100).toFixed(0)}% rule` },
          { label: "Net Worth",     val: fmt(netWorth, true),                            color: netWorth >= 0 ? "#22d3a5" : "#ef4444", sub: "Assets – debt" },
          { label: "Investable",    val: fmt(investable, true),                          color: "#22d3a5", sub: "All accounts" },
          { label: "Annual Savings",val: fmt(annualSavings),                             color: annualSavings > 0 ? "#1a1a2e" : "#ef4444", sub: `${savingsRate.toFixed(0)}% rate` },
          { label: "Progress",      val: `${progress.toFixed(0)}%`,                      color: progress >= 75 ? "#22d3a5" : progress >= 40 ? "#f97316" : "#1a1a2e", sub: "To FIRE" },
        ].map(k => (
          <div key={k.label} className="uf-card" style={{ padding: "14px 16px" }}>
            <div style={{ fontSize: 10, color: "#9090a8", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "DM Mono, monospace", marginBottom: 6 }}>{k.label}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: k.color, fontFamily: "DM Mono, monospace" }}>{k.val}</div>
            {k.sub && <div style={{ fontSize: 11, color: "#9090a8", marginTop: 3 }}>{k.sub}</div>}
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="uf-card" style={{ padding: "16px 22px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Investable Assets → FIRE Target</span>
          <span style={{ fontFamily: "DM Mono, monospace", fontSize: 13, color: "#f97316" }}>{progress.toFixed(1)}%</span>
        </div>
        <div style={{ height: 8, background: "#e8e8f0", borderRadius: 99, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg, #22d3a5, #f97316)", borderRadius: 99, transition: "width 0.8s cubic-bezier(0.34,1.56,0.64,1)" }} />
        </div>
      </div>

      {/* Charts */}
      <div className="uf-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15 }}>Wealth Projection</span>
          <div style={{ display: "flex", gap: 6 }}>
            <TabBtn id="growth" label="Growth" />
            <TabBtn id="accounts" label="Accounts" />
            <TabBtn id="networth" label="Net Worth" />
          </div>
        </div>

        {chartTab === "growth" && (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="gI2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22d3a5" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#22d3a5" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gT2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity={0.12} />
                  <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8e8f0" />
              <XAxis dataKey="year" tickFormatter={v => `Yr ${v}`} tick={{ fill: "#9090a8", fontSize: 10, fontFamily: "DM Mono" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => fmt(v, true)} tick={{ fill: "#9090a8", fontSize: 10, fontFamily: "DM Mono" }} axisLine={false} tickLine={false} width={58} />
              <Tooltip content={<ChartTooltip />} />
              {fireYear && <ReferenceLine x={fireYear} stroke="#f97316" strokeDasharray="4 3" label={{ value: "🔥 FIRE", fill: "#f97316", fontSize: 10, fontFamily: "DM Mono" }} />}
              <Area type="monotone" dataKey="FIRE Target" stroke="#f97316" strokeWidth={1.5} strokeDasharray="5 3" fill="url(#gT2)" dot={false} />
              <Area type="monotone" dataKey="Investable" stroke="#22d3a5" strokeWidth={2.5} fill="url(#gI2)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {chartTab === "accounts" && (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                {[["g401c","#818cf8"],["gRothc","#22d3a5"],["gTaxc","#a78bfa"]].map(([id, c]) => (
                  <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={c} stopOpacity={0.45} />
                    <stop offset="100%" stopColor={c} stopOpacity={0.04} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8e8f0" />
              <XAxis dataKey="year" tickFormatter={v => `Yr ${v}`} tick={{ fill: "#9090a8", fontSize: 10, fontFamily: "DM Mono" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => fmt(v, true)} tick={{ fill: "#9090a8", fontSize: 10, fontFamily: "DM Mono" }} axisLine={false} tickLine={false} width={58} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, fontFamily: "DM Mono", color: "#9090a8", paddingTop: 10 }} />
              {fireYear && <ReferenceLine x={fireYear} stroke="#f97316" strokeDasharray="4 3" />}
              <Area type="monotone" dataKey="401(k)" stroke="#818cf8" strokeWidth={2} fill="url(#g401c)" dot={false} stackId="a" />
              <Area type="monotone" dataKey="Roth IRA" stroke="#22d3a5" strokeWidth={2} fill="url(#gRothc)" dot={false} stackId="a" />
              <Area type="monotone" dataKey="Taxable" stroke="#a78bfa" strokeWidth={2} fill="url(#gTaxc)" dot={false} stackId="a" />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {chartTab === "networth" && (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8e8f0" />
              <XAxis dataKey="year" tickFormatter={v => `Yr ${v}`} tick={{ fill: "#9090a8", fontSize: 10, fontFamily: "DM Mono" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => fmt(v, true)} tick={{ fill: "#9090a8", fontSize: 10, fontFamily: "DM Mono" }} axisLine={false} tickLine={false} width={58} />
              <Tooltip content={<ChartTooltip />} />
              <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="3 3" />
              {fireYear && <ReferenceLine x={fireYear} stroke="#f97316" strokeDasharray="4 3" label={{ value: "🔥 FIRE", fill: "#f97316", fontSize: 10, fontFamily: "DM Mono" }} />}
              <Line type="monotone" dataKey="Net Worth" stroke="#f97316" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="Debt" stroke="#ef4444" strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}

        <p style={{ textAlign: "center", fontSize: 11, color: "#b8b8cc", marginTop: 10 }}>
          {chartTab === "growth" && "Teal = investable assets · Orange dashed = FIRE target"}
          {chartTab === "accounts" && "Stacked: 401(k) · Roth IRA · Taxable brokerage"}
          {chartTab === "networth" && "Total net worth vs debt paydown over time"}
        </p>
      </div>
    </div>
  );
}

// ─── User Nav ─────────────────────────────────────────────────────────────────
function UserNav() {
  const [email, setEmail] = useState<string | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setEmail(user?.email ?? null));
  }, []);
  const handleSignOut = async () => { await supabase.auth.signOut(); window.location.href = "/"; };

  if (!email) return (
    <Link href="/login" style={{ background: "#f97316", color: "#fff", borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>Sign In</Link>
  );
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{ color: "#9090a8", fontSize: 13 }}>{email}</span>
      <button onClick={handleSignOut} style={{ background: "transparent", color: "#f97316", border: "1px solid #f97316", borderRadius: 8, padding: "7px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Sign Out</button>
    </div>
  );
}

// ─── Root ────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [tab, setTab] = useState<TabKey>("dashboard");

  // Read initial tab from URL query string (e.g. ?tab=budget)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("tab") as TabKey | null;
    if (t && ["dashboard", "calculators", "budget"].includes(t)) setTab(t);
  }, []);

  // Budget state
  const [income,   setIncome]   = useState(0);
  const [expenses, setExpenses] = useState<Expenses>({ housing: 0, food: 0, transport: 0, subscriptions: 0, healthcare: 0, entertainment: 0, other: 0 });

  // FIRE profile state (stored in expenses._fire_profile to avoid schema changes)
  const [fireAge,         setFireAge]         = useState(30);
  const [k401,            setK401]            = useState(0);
  const [rothIRA,         setRothIRA]         = useState(0);
  const [taxable,         setTaxable]         = useState(0);
  const [totalDebt,       setTotalDebt]       = useState(0);
  const [mortgageBalance, setMortgageBalance] = useState(0);
  const [mortgageMonthly, setMortgageMonthly] = useState(0);
  const [growthRate,      setGrowthRate]      = useState(0.07);
  const [withdrawalRate,  setWithdrawalRate]  = useState(0.04);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [actuals, setActuals] = useState<Record<string, number>>({});
  const saveTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLoaded   = useRef(false);

  // Load from Supabase on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { window.location.href = "/login"; return; }
      // Fetch current-month actuals from expenses table
      const nowD = new Date();
      const thisMonth = `${nowD.getFullYear()}-${String(nowD.getMonth() + 1).padStart(2, '0')}`;
      supabase.from("expenses").select("category, amount")
        .eq("user_id", session.user.id)
        .like("date", `${thisMonth}-%`)
        .then(({ data: expData }) => {
          if (expData) {
            const agg: Record<string, number> = {};
            expData.forEach(e => { agg[e.category] = (agg[e.category] || 0) + e.amount; });
            setActuals(agg);
          }
        });
      supabase.from("user_budget").select("*").eq("user_id", session.user.id).single().then(({ data }) => {
        // Check for calculator prefill from the landing page
        let prefill: { income?: number; monthlySavings?: number } = {};
        try {
          const raw = localStorage.getItem("uf_calc_prefill");
          if (raw) { prefill = JSON.parse(raw); localStorage.removeItem("uf_calc_prefill"); }
        } catch {}

        if (data) {
          setIncome(prefill.income || data.income || 0);
          const raw = data.expenses || {};
          const fp  = raw._fire_profile || {};
          const { _fire_profile: _, ...budgetExpenses } = raw;
          setExpenses({ housing: 0, food: 0, transport: 0, subscriptions: 0, healthcare: 0, entertainment: 0, other: 0, ...budgetExpenses });
          setFireAge(data.fire_age || 30);
          setK401(fp.k401 || data.fire_assets || 0);
          setRothIRA(fp.rothIRA || 0);
          setTaxable(fp.taxable || 0);
          setTotalDebt(fp.totalDebt || 0);
          setMortgageBalance(fp.mortgageBalance || 0);
          setMortgageMonthly(fp.mortgageMonthly || 0);
          setGrowthRate(fp.growthRate || 0.07);
          setWithdrawalRate(fp.withdrawalRate || 0.04);
        } else if (prefill.income) {
          // New user — no saved budget yet, seed from calculator
          setIncome(prefill.income);
        }
        isLoaded.current = true;
      });
    });
  }, []);

  // Auto-save with 1s debounce
  useEffect(() => {
    if (!isLoaded.current) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaveStatus("saving");
    saveTimer.current = setTimeout(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const fireProfile = { k401, rothIRA, taxable, totalDebt, mortgageBalance, mortgageMonthly, growthRate, withdrawalRate };
      await supabase.from("user_budget").upsert({
        user_id:     session.user.id,
        income,
        expenses:    { ...expenses, _fire_profile: fireProfile },
        fire_age:    fireAge,
        fire_assets: k401, // keep backwards-compatible
        updated_at:  new Date().toISOString(),
      }, { onConflict: "user_id" });
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    }, 1000);
  }, [income, expenses, fireAge, k401, rothIRA, taxable, totalDebt, mortgageBalance, mortgageMonthly, growthRate, withdrawalRate]);

  const navTabs: { key: TabKey; label: string }[] = [
    { key: "dashboard",   label: "Overview" },
    { key: "calculators", label: "Calculator Hub" },
    { key: "budget",      label: "Budget & Transactions" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        body { background: #f9f9fb; color: #1a1a2e; font-family: 'DM Sans', sans-serif; margin: 0; }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        input[type=range] { -webkit-appearance: none; height: 4px; border-radius: 2px; background: #e8e8f0; outline: none; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: #f97316; border: 3px solid #f9f9fb; cursor: pointer; box-shadow: 0 0 0 2px #f97316; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #e8e8f0; border-radius: 4px; }

        .uf-card { background: #ffffff; border: 1px solid #e8e8f0; border-radius: 16px; padding: 20px 24px; }
        .uf-card-glow { box-shadow: 0 0 0 1px rgba(249,115,22,0.3), 0 0 24px rgba(249,115,22,0.08); border-color: rgba(249,115,22,0.35) !important; }
        .uf-tag { font-size: 11px; padding: 3px 9px; border-radius: 20px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; }

        .uf-nav { position: sticky; top: 0; z-index: 100; height: 60px; background: rgba(249,249,251,0.97); backdrop-filter: blur(16px); border-bottom: 1px solid #e8e8f0; display: flex; align-items: center; justify-content: space-between; padding: 0 32px; gap: 20px; }
        .uf-logo { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 800; color: #1a1a2e; text-decoration: none; letter-spacing: -0.04em; flex-shrink: 0; }
        .uf-logo span { color: #f97316; }

        .uf-tabs { display: flex; gap: 3px; background: #e8e8f0; border-radius: 10px; padding: 4px; }
        .uf-tab { background: transparent; border: 1px solid transparent; border-radius: 7px; padding: 7px 18px; font-size: 13px; font-weight: 500; color: #9090a8; cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif; white-space: nowrap; }
        .uf-tab:hover { color: #6b6b85; }
        .uf-tab.active { background: #ffffff; border-color: #e8e8f0; color: #1a1a2e; font-weight: 600; }

        .uf-content { max-width: 1100px; margin: 0 auto; padding: 32px 24px 60px; }
        select option { background: #ffffff; }

        @media(max-width: 900px) {
          .uf-nav { padding: 0 16px; }
          .uf-content { padding: 20px 16px 48px; }
          .uf-tab { padding: 6px 12px; font-size: 12px; }
        }
      `}</style>

      <nav className="uf-nav">
        <Link href="/" className="uf-logo">Until<span>Fire</span></Link>
        <div className="uf-tabs">
          {navTabs.map(t => (
            <button key={t.key} className={`uf-tab ${tab === t.key ? "active" : ""}`} onClick={() => setTab(t.key)}>{t.label}</button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          {saveStatus === "saving" && <span style={{ color: "#9090a8", fontSize: 12, fontFamily: "DM Mono, monospace" }}>Saving…</span>}
          {saveStatus === "saved"  && <span style={{ color: "#22d3a5", fontSize: 12, fontFamily: "DM Mono, monospace" }}>✓ Saved</span>}
          <UserNav />
        </div>
      </nav>

      <div className="uf-content">
        {tab === "dashboard" && (
          <DashTab
            income={income} expenses={expenses}
            k401={k401} rothIRA={rothIRA} taxable={taxable}
            totalDebt={totalDebt} mortgageBalance={mortgageBalance}
            mortgageMonthly={mortgageMonthly} growthRate={growthRate}
            withdrawalRate={withdrawalRate}
          />
        )}
        {tab === "calculators" && <CalculatorsTab />}
        {tab === "budget" && (
          <>
            <BudgetTab income={income} setIncome={setIncome} expenses={expenses} setExpenses={setExpenses} actuals={actuals} />
            <div style={{ borderTop: "1px solid #e8e8f0", margin: "32px 0" }} />
            <TransactionsTab />
          </>
        )}
      </div>
    </>
  );
}
