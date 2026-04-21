"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import {
  DEFAULT_INPUTS,
  FIRE_USER_STATE_PRIORITY,
  hasLocalInputs,
  loadLocalInputs,
  registerFireUserStateInspector,
  resolveFireUserState,
  type UntilFireInputs,
} from "@/lib/local-inputs";
import Link from "next/link";
import { loadPrefs, savePrefs } from "@/lib/preferences";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend, ReferenceLine,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────
type Expenses = Record<string, number>;
type TabKey = "dashboard" | "budget" | "fire" | "expenses" | "settings";

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

function safeNumber(value: unknown): number {
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function buildFireChartData(input: {
  effectiveFireTarget?: number;
  investable: number;
  netWorth: number;
  k401: number;
  rothIRA: number;
  taxable: number;
  totalDebt: number;
  mortgageBalance: number;
}) {
  const effectiveFireTarget = safeNumber(input.effectiveFireTarget);
  if (effectiveFireTarget <= 0) return [];

  const point = {
    year: 0,
    "401(k)": Math.round(safeNumber(input.k401)),
    "Roth IRA": Math.round(safeNumber(input.rothIRA)),
    "Taxable": Math.round(safeNumber(input.taxable)),
    "Net Worth": Math.round(safeNumber(input.netWorth)),
    "FIRE Target": Math.round(effectiveFireTarget),
    "Investable": Math.round(safeNumber(input.investable)),
    "Debt": Math.round(-Math.abs(safeNumber(input.totalDebt) + safeNumber(input.mortgageBalance))),
  };

  return [point, { ...point, year: 1 }];
}

// ─── FIRE Engine ──────────────────────────────────────────────────────────────
// ─── Shared UI ────────────────────────────────────────────────────────────────
function NumberInput({ value, onChange, placeholder = "0", prefix = "$" }: {
  value: number; onChange: (v: number) => void;
  placeholder?: string; prefix?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 6,
      background: "#08080e", borderRadius: 8, padding: "9px 12px",
      border: `1px solid ${focused ? "#f97316" : "#1c1c2e"}`,
      transition: "border-color 0.2s",
    }}>
      <span style={{ color: "#5e5e7a", fontSize: 13, fontFamily: "DM Mono, monospace" }}>{prefix}</span>
      <input
        type="number" value={value || ""} placeholder={placeholder}
        onChange={e => onChange(Number(e.target.value))}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{ background: "none", border: "none", outline: "none", color: "#e8e8f2", fontSize: 14, width: "100%", fontFamily: "DM Mono, monospace" }}
      />
    </div>
  );
}

function FieldRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 11, fontFamily: "DM Mono, monospace", letterSpacing: "0.08em", textTransform: "uppercase", color: "#5e5e7a" }}>
        {label}
      </label>
      {children}
      {hint && <span style={{ fontSize: 11, color: "#3a3a5a", fontStyle: "italic" }}>{hint}</span>}
    </div>
  );
}

function KpiCard({ label, value, sub, color = "#e8e8f2", glow = false }: {
  label: string; value: string; sub?: string; color?: string; glow?: boolean;
}) {
  return (
    <div className={`uf-card ${glow ? "uf-card-glow" : ""}`} style={{ padding: "18px 20px" }}>
      <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#5e5e7a", marginBottom: 8, fontFamily: "DM Mono, monospace" }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color, fontFamily: "DM Mono, monospace", lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "#5e5e7a", marginTop: 5 }}>{sub}</div>}
    </div>
  );
}

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#1a1a2e", border: "1px solid #1c1c2e", borderRadius: 8, padding: "10px 14px", fontFamily: "DM Mono, monospace", fontSize: 12 }}>
      <p style={{ color: "#5e5e7a", marginBottom: 6 }}>Year {label}</p>
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

function FireOnboardingRequired({ title, body }: { title: string; body: string }) {
  return (
    <div className="uf-card" style={{ padding: "28px 32px", textAlign: "center" }}>
      <div style={{ fontSize: 34, marginBottom: 14 }}>🔥</div>
      <div style={{ fontFamily: "Syne, sans-serif", fontSize: 22, fontWeight: 700, marginBottom: 10 }}>{title}</div>
      <div style={{ color: "#5e5e7a", fontSize: 14, lineHeight: 1.6, marginBottom: 18 }}>{body}</div>
      <Link href="/" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", background: "#f97316", color: "#fff", borderRadius: 10, padding: "10px 18px", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
        Complete Onboarding
      </Link>
    </div>
  );
}

// ─── Dashboard Overview Tab ───────────────────────────────────────────────────
function DashTab({ income, expenses, k401, rothIRA, taxable, totalDebt, mortgageBalance, mortgageMonthly, growthRate, withdrawalRate, baselineFireTarget, adjustedFireTarget }: {
  income: number; expenses: Expenses; k401: number; rothIRA: number;
  taxable: number; totalDebt: number; mortgageBalance: number;
  mortgageMonthly: number; growthRate: number; withdrawalRate: number;
  baselineFireTarget?: number;
  adjustedFireTarget?: number;
}) {
  const monthlyExpenses = Object.entries(expenses)
    .filter(([k]) => !k.startsWith("_"))
    .reduce((s, [, v]) => s + (v || 0), 0);

  const effectiveFireTarget =
  (adjustedFireTarget && adjustedFireTarget > 0)
    ? adjustedFireTarget
    : (baselineFireTarget && baselineFireTarget > 0)
      ? baselineFireTarget
      : 0;

  const investable  = k401 + rothIRA + taxable;
  const netWorth    = investable - totalDebt - mortgageBalance;
  const annualSavings = income * 12 - monthlyExpenses * 12 - mortgageMonthly * 12;
  const savingsRate = income > 0 ? ((annualSavings / 12) / income) * 100 : 0;
  const progress    = effectiveFireTarget && effectiveFireTarget > 0 ? Math.min(100, (investable / effectiveFireTarget) * 100) : 0;
  const chartData   = buildFireChartData({
    effectiveFireTarget,
    investable,
    netWorth,
    k401,
    rothIRA,
    taxable,
    totalDebt,
    mortgageBalance,
  });
  const activeCats  = EXPENSE_CATS.filter(c => (expenses[c.key] || 0) > 0);

  if (!baselineFireTarget || baselineFireTarget <= 0) {
    return <FireOnboardingRequired title="Onboarding required" body="Complete onboarding to set your baseline FIRE target before using the dashboard FIRE view." />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        <KpiCard label="Net Worth" value={fmt(netWorth, true)} color={netWorth >= 0 ? "#22d3a5" : "#ef4444"} sub="Assets minus all debt" />
        <KpiCard label="FIRE Target" value={effectiveFireTarget ? fmt(effectiveFireTarget, true) : "Not set"} sub={adjustedFireTarget ? "Dashboard override" : baselineFireTarget ? "Onboarding baseline" : "Complete onboarding"} />
        <KpiCard label="FIRE Source" value={adjustedFireTarget ? "Override" : baselineFireTarget ? "Baseline" : "Missing"} color="#f97316" sub={effectiveFireTarget ? "Projection removed from main UI" : "No FIRE target yet"} glow={!!effectiveFireTarget} />
        <KpiCard label="Savings Rate" value={`${savingsRate.toFixed(0)}%`} color={savingsRate >= 50 ? "#f97316" : savingsRate >= 25 ? "#22d3a5" : "#ef4444"} sub={savingsRate >= 50 ? "🔥 FIRE pace" : savingsRate >= 25 ? "Good progress" : "Needs work"} />
      </div>

      {/* Progress bar */}
      <div className="uf-card" style={{ padding: "18px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>Progress to FIRE</span>
          <span style={{ fontFamily: "DM Mono, monospace", fontSize: 13, color: "#f97316" }}>{fmt(investable, true)} / {effectiveFireTarget ? fmt(effectiveFireTarget, true) : "Not set"}</span>
        </div>
        <div style={{ height: 10, background: "#0f0f18", borderRadius: 99, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg, #22d3a5, #f97316)", borderRadius: 99, transition: "width 0.8s cubic-bezier(0.34,1.56,0.64,1)" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#5e5e7a", marginTop: 7, fontFamily: "DM Mono, monospace" }}>
          <span>0%</span><span>{progress.toFixed(1)}% complete</span><span>100% = FIRE</span>
        </div>
      </div>

      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16 }}>
        {/* FIRE snapshot chart */}
        <div className="uf-card">
          <SectionLabel icon="📈" text="FIRE Snapshot" color="#22d3a5" />
          {chartData.length === 0 ? (
            <div style={{ color: "#5e5e7a", fontSize: 13, textAlign: "center", padding: "72px 0" }}>
              Complete onboarding to unlock your FIRE snapshot
            </div>
          ) : (
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
                <CartesianGrid strokeDasharray="3 3" stroke="#1c1c2e" />
                <XAxis dataKey="year" tickFormatter={v => `Yr ${v}`} tick={{ fill: "#5e5e7a", fontSize: 10, fontFamily: "DM Mono" }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => fmt(v, true)} tick={{ fill: "#5e5e7a", fontSize: 10, fontFamily: "DM Mono" }} axisLine={false} tickLine={false} width={55} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="FIRE Target" stroke="#f97316" strokeWidth={1.5} strokeDasharray="5 3" fill="url(#gTgt)" dot={false} />
                <Area type="monotone" dataKey="Investable" stroke="#22d3a5" strokeWidth={2.5} fill="url(#gInv)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Spending breakdown */}
        <div className="uf-card">
          <SectionLabel icon="💸" text="Spending Breakdown" color="#ef4444" />
          {activeCats.length === 0 ? (
            <div style={{ color: "#5e5e7a", fontSize: 13, textAlign: "center", padding: "40px 0" }}>
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
                      <span style={{ color: "#9090a8" }}>{cat.icon} {cat.label}</span>
                      <span style={{ color: cat.color, fontFamily: "DM Mono, monospace" }}>{fmt(val)} <span style={{ color: "#5e5e7a" }}>{pct.toFixed(0)}%</span></span>
                    </div>
                    <div style={{ height: 3, background: "#1c1c2e", borderRadius: 4, overflow: "hidden" }}>
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
                  <tr key={`d${i}`}><td colSpan={2} style={{ borderTop: "1px solid #1c1c2e", padding: "4px 0" }} /></tr>
                );
                return (
                  <tr key={row.label}>
                    <td style={{ padding: "6px 0", fontSize: 13, color: row.bold ? "#e8e8f2" : "#9090a8", fontWeight: row.bold ? 600 : 400 }}>{row.label}</td>
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
                color: "#e8e8f2",
              },
              {
                icon: "🔥",
                title: "Rule of 25",
                body: effectiveFireTarget ? `Target: ${fmt(effectiveFireTarget, true)}. Every $100/mo you cut reduces your FIRE number by $30k.` : "Complete onboarding to set your FIRE target.",
                color: "#e8e8f2",
              },
            ].map(ins => (
              <div key={ins.title} style={{ background: "#0a0a14", border: "1px solid #1c1c2e", borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                  <span style={{ fontSize: 14 }}>{ins.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: ins.color }}>{ins.title}</span>
                </div>
                <p style={{ fontSize: 12, color: "#5e5e7a", margin: "6px 0 0", lineHeight: 1.5 }}>{ins.body}</p>
              </div>
            ))}
          </div>
        </div>
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
            <div style={{ color: "#5e5e7a", fontSize: 12, marginTop: 2 }}>After-tax take-home pay</div>
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
            <div style={{ color: "#5e5e7a", fontSize: 12, marginTop: 2 }}>
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
                  <span style={{ fontSize: 13, color: "#9090a8" }}>{cat.icon} {cat.label}</span>
                  <NumberInput value={expenses[cat.key] || 0} onChange={v => setExpenses({ ...expenses, [cat.key]: v })} />
                  <div style={{ height: 4, background: "#1c1c2e", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${Math.min(100, income > 0 ? ((expenses[cat.key] || 0) / income) * 100 : 0)}%`, background: cat.color, borderRadius: 4, transition: "width 0.4s" }} />
                  </div>
                </div>
                {spent > 0 && (
                  <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 12, alignItems: "center" }}>
                    <span style={{ fontSize: 11, fontFamily: "DM Mono, monospace", color: over ? "#ef4444" : "#5e5e7a" }}>
                      {over ? "⚠ " : ""}Spent {fmt(spent)}{budget > 0 ? ` / ${fmt(budget)}` : ""}
                    </span>
                    {budget > 0 && (
                      <div style={{ height: 3, background: "#1c1c2e", borderRadius: 4, overflow: "hidden" }}>
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
              { label: "Annual Savings", val: fmt(Math.max(0, savings) * 12), color: "#e8e8f2" },
            ].map(k => (
              <div key={k.label}>
                <div style={{ color: "#5e5e7a", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4, fontFamily: "DM Mono, monospace" }}>{k.label}</div>
                <div style={{ color: k.color, fontSize: 22, fontWeight: 700, fontFamily: "DM Mono, monospace" }}>{k.val}</div>
              </div>
            ))}
          </div>
          {/* Rate bar */}
          <div style={{ marginTop: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#5e5e7a", marginBottom: 6, fontFamily: "DM Mono, monospace" }}>
              <span>Savings rate</span><span>{rate.toFixed(1)}% {rate >= 50 ? "🔥 FIRE pace" : rate >= 25 ? "· Good" : "· Needs work"}</span>
            </div>
            <div style={{ height: 6, background: "#0f0f18", borderRadius: 99, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${Math.min(100, rate)}%`, background: rate >= 50 ? "#f97316" : rate >= 25 ? "#22d3a5" : "#ef4444", borderRadius: 99, transition: "width 0.6s" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#3a3a5a", marginTop: 5 }}>
              <span>0%</span><span>25%</span><span>50% FIRE</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── FIRE Calculator Tab ──────────────────────────────────────────────────────
function FIRETab({ income, expenses, fireAge, setFireAge, k401, setK401, rothIRA, setRothIRA, taxable, setTaxable, totalDebt, setTotalDebt, mortgageBalance, setMortgageBalance, mortgageMonthly, setMortgageMonthly, growthRate, setGrowthRate, withdrawalRate, setWithdrawalRate, baselineFireTarget, adjustedFireTarget, setAdjustedFireTarget }: {
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
  baselineFireTarget?: number;
  adjustedFireTarget?: number;
  setAdjustedFireTarget: (v: number | undefined) => void;
}) {
  const [chartTab, setChartTab] = useState<"growth" | "accounts" | "networth">("growth");

  const monthlyExpenses = Object.entries(expenses)
    .filter(([k]) => !k.startsWith("_"))
    .reduce((s, [, v]) => s + (v || 0), 0);

  const effectiveFireTarget =
    adjustedFireTarget && adjustedFireTarget > 0
      ? adjustedFireTarget
      : baselineFireTarget && baselineFireTarget > 0
        ? baselineFireTarget
        : undefined;

  const investable  = k401 + rothIRA + taxable;
  const netWorth    = investable - totalDebt - mortgageBalance;
  const annualSavings = income * 12 - monthlyExpenses * 12 - mortgageMonthly * 12;
  const savingsRate = income > 0 ? (annualSavings / 12 / income) * 100 : 0;
  const progress    = effectiveFireTarget && effectiveFireTarget > 0 ? Math.min(100, (investable / effectiveFireTarget) * 100) : 0;
  const chartData   = buildFireChartData({
    effectiveFireTarget,
    investable,
    netWorth,
    k401,
    rothIRA,
    taxable,
    totalDebt,
    mortgageBalance,
  });

  if (!baselineFireTarget || baselineFireTarget <= 0) {
    return <FireOnboardingRequired title="Onboarding required" body="The FIRE tab requires a baseline FIRE target from onboarding before any dashboard adjustments can be made." />;
  }

  function TabBtn({ id, label }: { id: "growth" | "accounts" | "networth"; label: string }) {
    return (
      <button onClick={() => setChartTab(id)} style={{
        background: chartTab === id ? "#f97316" : "transparent",
        border: `1px solid ${chartTab === id ? "#f97316" : "#1c1c2e"}`,
        borderRadius: 6, padding: "5px 13px",
        color: chartTab === id ? "#fff" : "#5e5e7a",
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
            <FieldRow label="Adjusted FIRE Target" hint={baselineFireTarget ? `Baseline: ${fmt(baselineFireTarget, true)}` : "Optional dashboard override"}>
              <NumberInput value={adjustedFireTarget ?? 0} onChange={(v) => setAdjustedFireTarget(v > 0 ? v : undefined)} placeholder="0" />
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
                  <span style={{ fontSize: 11, color: "#5e5e7a", fontFamily: "DM Mono, monospace", textTransform: "uppercase", letterSpacing: "0.08em" }}>Annual Return</span>
                  <span style={{ fontSize: 12, color: "#f97316", fontFamily: "DM Mono, monospace" }}>{(growthRate * 100).toFixed(1)}%</span>
                </div>
                <input type="range" min={0.03} max={0.12} step={0.001} value={growthRate}
                  onChange={e => setGrowthRate(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "#f97316", cursor: "pointer" }} />
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: "#5e5e7a", fontFamily: "DM Mono, monospace", textTransform: "uppercase", letterSpacing: "0.08em" }}>Withdrawal Rate</span>
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
          { label: "FIRE Source",   val: adjustedFireTarget ? "Override" : baselineFireTarget ? "Baseline" : "Missing", color: "#f97316", sub: effectiveFireTarget ? "Projection removed from main UI" : "" },
          { label: "FIRE Target",   val: effectiveFireTarget ? fmt(effectiveFireTarget, true) : "Not set", color: "#e8e8f2", sub: adjustedFireTarget ? "Dashboard override" : baselineFireTarget ? "Onboarding baseline" : "Complete onboarding" },
          { label: "Net Worth",     val: fmt(netWorth, true),                            color: netWorth >= 0 ? "#22d3a5" : "#ef4444", sub: "Assets – debt" },
          { label: "Investable",    val: fmt(investable, true),                          color: "#22d3a5", sub: "All accounts" },
          { label: "Annual Savings",val: fmt(annualSavings),                             color: annualSavings > 0 ? "#e8e8f2" : "#ef4444", sub: `${savingsRate.toFixed(0)}% rate` },
          { label: "Progress",      val: `${progress.toFixed(0)}%`,                      color: progress >= 75 ? "#22d3a5" : progress >= 40 ? "#f97316" : "#e8e8f2", sub: "To FIRE" },
        ].map(k => (
          <div key={k.label} className="uf-card" style={{ padding: "14px 16px" }}>
            <div style={{ fontSize: 10, color: "#5e5e7a", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "DM Mono, monospace", marginBottom: 6 }}>{k.label}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: k.color, fontFamily: "DM Mono, monospace" }}>{k.val}</div>
            {k.sub && <div style={{ fontSize: 11, color: "#5e5e7a", marginTop: 3 }}>{k.sub}</div>}
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="uf-card" style={{ padding: "16px 22px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Investable Assets → FIRE Target</span>
          <span style={{ fontFamily: "DM Mono, monospace", fontSize: 13, color: "#f97316" }}>{progress.toFixed(1)}%</span>
        </div>
        <div style={{ height: 8, background: "#0f0f18", borderRadius: 99, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg, #22d3a5, #f97316)", borderRadius: 99, transition: "width 0.8s cubic-bezier(0.34,1.56,0.64,1)" }} />
        </div>
      </div>

      {/* Charts */}
      <div className="uf-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15 }}>FIRE Snapshot</span>
          <div style={{ display: "flex", gap: 6 }}>
            <TabBtn id="growth" label="Growth" />
            <TabBtn id="accounts" label="Accounts" />
            <TabBtn id="networth" label="Net Worth" />
          </div>
        </div>

        {chartData.length === 0 ? (
          <div style={{ color: "#5e5e7a", fontSize: 13, textAlign: "center", padding: "72px 0" }}>
            Add onboarding data to render this chart safely.
          </div>
        ) : chartTab === "growth" ? (
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
              <CartesianGrid strokeDasharray="3 3" stroke="#1c1c2e" />
              <XAxis dataKey="year" tickFormatter={v => `Yr ${v}`} tick={{ fill: "#5e5e7a", fontSize: 10, fontFamily: "DM Mono" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => fmt(v, true)} tick={{ fill: "#5e5e7a", fontSize: 10, fontFamily: "DM Mono" }} axisLine={false} tickLine={false} width={58} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="FIRE Target" stroke="#f97316" strokeWidth={1.5} strokeDasharray="5 3" fill="url(#gT2)" dot={false} />
              <Area type="monotone" dataKey="Investable" stroke="#22d3a5" strokeWidth={2.5} fill="url(#gI2)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        ) : null}

        {chartData.length > 0 && chartTab === "accounts" && (
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
              <CartesianGrid strokeDasharray="3 3" stroke="#1c1c2e" />
              <XAxis dataKey="year" tickFormatter={v => `Yr ${v}`} tick={{ fill: "#5e5e7a", fontSize: 10, fontFamily: "DM Mono" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => fmt(v, true)} tick={{ fill: "#5e5e7a", fontSize: 10, fontFamily: "DM Mono" }} axisLine={false} tickLine={false} width={58} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, fontFamily: "DM Mono", color: "#5e5e7a", paddingTop: 10 }} />
              <Area type="monotone" dataKey="401(k)" stroke="#818cf8" strokeWidth={2} fill="url(#g401c)" dot={false} stackId="a" />
              <Area type="monotone" dataKey="Roth IRA" stroke="#22d3a5" strokeWidth={2} fill="url(#gRothc)" dot={false} stackId="a" />
              <Area type="monotone" dataKey="Taxable" stroke="#a78bfa" strokeWidth={2} fill="url(#gTaxc)" dot={false} stackId="a" />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {chartData.length > 0 && chartTab === "networth" && (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1c1c2e" />
              <XAxis dataKey="year" tickFormatter={v => `Yr ${v}`} tick={{ fill: "#5e5e7a", fontSize: 10, fontFamily: "DM Mono" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => fmt(v, true)} tick={{ fill: "#5e5e7a", fontSize: 10, fontFamily: "DM Mono" }} axisLine={false} tickLine={false} width={58} />
              <Tooltip content={<ChartTooltip />} />
              <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="3 3" />
              <Line type="monotone" dataKey="Net Worth" stroke="#f97316" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="Debt" stroke="#ef4444" strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}

        <p style={{ textAlign: "center", fontSize: 11, color: "#3a3a5a", marginTop: 10 }}>
          {chartTab === "growth" && "Current investable assets vs FIRE target"}
          {chartTab === "accounts" && "Current account mix snapshot"}
          {chartTab === "networth" && "Current net worth and debt snapshot"}
        </p>
      </div>
    </div>
  );
}

// ─── Expenses Tab ─────────────────────────────────────────────────────────────
const EXP_CATEGORIES = [
  { key: "food", label: "🍔 Food & Dining", color: "#f97316" },
  { key: "transport", label: "🚗 Transport", color: "#22d3a5" },
  { key: "housing", label: "🏠 Housing", color: "#818cf8" },
  { key: "subscriptions", label: "📱 Subscriptions", color: "#a78bfa" },
  { key: "healthcare", label: "🏥 Healthcare", color: "#ef4444" },
  { key: "entertainment", label: "🎬 Entertainment", color: "#fbbf24" },
  { key: "shopping", label: "🛍️ Shopping", color: "#ec4899" },
  { key: "work", label: "💼 Work Expense", color: "#6366f1" },
  { key: "other", label: "📦 Other", color: "#6b6b85" },
];

const CURRENCIES = ["USD", "EUR", "GBP", "CNY", "JPY", "AUD", "CAD", "SGD", "HKD", "CHF", "KRW", "INR", "MXN", "BRL", "NZD", "THB", "SEK", "NOK", "DKK", "ZAR"];
const CURRENCY_FLAGS: Record<string, string> = {
  USD: "🇺🇸", EUR: "🇪🇺", GBP: "🇬🇧", CNY: "🇨🇳", JPY: "🇯🇵",
  AUD: "🇦🇺", CAD: "🇨🇦", SGD: "🇸🇬", HKD: "🇭🇰", CHF: "🇨🇭",
  KRW: "🇰🇷", INR: "🇮🇳", MXN: "🇲🇽", BRL: "🇧🇷", NZD: "🇳🇿",
  THB: "🇹🇭", SEK: "🇸🇪", NOK: "🇳🇴", DKK: "🇩🇰", ZAR: "🇿🇦",
};
const PREDEFINED_TAGS = ["work", "reimbursable"];

// Renders a flag emoji as a cross-platform Twemoji SVG image.
// Unicode regional indicator flags don't render on Windows — this fixes that.
function FlagEmoji({ emoji, size = 20 }: { emoji: string; size?: number }) {
  const cp = [...emoji].map(c => c.codePointAt(0)!.toString(16)).join("-");
  return (
    <img
      src={`https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/svg/${cp}.svg`}
      width={size} height={size} alt={emoji}
      style={{ display: "inline-block", verticalAlign: "middle" }}
    />
  );
}

type ExpenseRecord = {
  id: string;
  date: string;
  amount: number;
  currency: string;
  description: string;
  category: string;
  tags: string[];
  is_work_related?: boolean; // legacy — migrated into tags["work"] on load
};

let lastUsedCategory = "";

const expFmt = (n: number, currency = "USD") => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n);
};

function sumByCurrency(expenses: ExpenseRecord[]): Record<string, number> {
  return expenses.reduce((acc, e) => {
    acc[e.currency] = (acc[e.currency] ?? 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);
}

function fmtMulti(byCurrency: Record<string, number>): string {
  const entries = Object.entries(byCurrency);
  if (entries.length === 0) return "—";
  return entries.map(([c, n]) => expFmt(n, c)).join(" · ");
}

function convertToDisplay(byCurrency: Record<string, number>, displayCurrency: string, rates: Record<string, number>): number | null {
  if (!rates[displayCurrency]) return null;
  let total = 0;
  for (const [cur, amount] of Object.entries(byCurrency)) {
    if (!rates[cur]) return null;
    total += (amount / rates[cur]) * rates[displayCurrency];
  }
  return total;
}

function keywordCategory(desc: string): string | null {
  const d = desc.toLowerCase();
  if (/dine|dining|restaurant|cafe|coffee|lunch|dinner|breakfast|meal|grocery|groceries|pizza|burger|sushi|ramen|noodle|steak|bbq|dessert|smoothie|boba|buffet|eatery|bistro|takeout|takeaway|doordash|grubhub|ubereats|food|snack|brunch|bar|pub|eat/.test(d)) return "food";
  if (/uber|lyft|taxi|cab|gas|fuel|petrol|parking|metro|bus|train|subway|tram|ferry|flight|airline|airfare|airport|toll|transit|commute|grab|gojek|bolt|mrt|bts/.test(d)) return "transport";
  if (/rent|mortgage|electricity|water bill|power bill|internet|wifi|cable|maintenance|repair|plumber|electrician|furniture|home depot|ikea|landlord/.test(d)) return "housing";
  if (/netflix|spotify|hulu|disney|amazon prime|apple tv|youtube premium|subscription|membership|saas/.test(d)) return "subscriptions";
  if (/doctor|dentist|pharmacy|medicine|hospital|clinic|medical|prescription|therapy|therapist|dental|vision|optometrist|gym|fitness/.test(d)) return "healthcare";
  if (/movie|cinema|concert|ticket|show|museum|event|sports|gaming|game|streaming/.test(d)) return "entertainment";
  if (/amazon|shop|shopping|clothes|clothing|shoe|fashion|dress|pants|shirt|jacket|accessory|mall|store/.test(d)) return "shopping";
  if (/work|office|client|business|conference|coworking|supplies/.test(d)) return "work";
  return null;
}

async function aiCategorize(description: string): Promise<{ category: string; tags: string[] }> {
  const keyword = keywordCategory(description);
  if (keyword) return { category: keyword, tags: [] };
  try {
    const res = await fetch("/api/categorize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description }),
    });
    if (res.ok) return await res.json();
  } catch { /* fall through */ }
  return { category: "other", tags: [] };
}

// ─── Currency Select ───────────────────────────────────────────────────────────
function CurrencySelect({ value, onChange, allowEmpty }: {
  value: string;
  onChange: (v: string) => void;
  allowEmpty?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{ background: "#08080e", border: "1px solid #2a2a3e", borderRadius: 8, padding: "7px 12px", color: "#e8e8f2", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "DM Mono, monospace" }}
      >
        {value ? <FlagEmoji emoji={CURRENCY_FLAGS[value]} size={18} /> : null}
        <span>{value || "Per currency"}</span>
        <span style={{ color: "#5e5e7a", fontSize: 10 }}>▾</span>
      </button>
      {open && (
        <div style={{ position: "absolute", zIndex: 300, bottom: "calc(100% + 6px)", left: 0, background: "#0f0f18", border: "1px solid #2a2a3e", borderRadius: 12, padding: 10, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 5, width: 244 }}>
          {allowEmpty && (
            <button
              type="button"
              onClick={() => { onChange(""); setOpen(false); }}
              style={{ gridColumn: "1 / -1", background: value === "" ? "rgba(249,115,22,0.12)" : "#08080e", border: `1px solid ${value === "" ? "#f97316" : "#1c1c2e"}`, borderRadius: 8, padding: "8px 10px", color: value === "" ? "#f97316" : "#9090a8", fontSize: 11, cursor: "pointer", fontFamily: "DM Mono, monospace", textAlign: "left" }}
            >
              — Show each currency separately
            </button>
          )}
          {CURRENCIES.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => { onChange(c); setOpen(false); }}
              style={{ background: c === value ? "rgba(249,115,22,0.15)" : "#08080e", border: `1px solid ${c === value ? "#f97316" : "#1c1c2e"}`, borderRadius: 8, padding: "7px 4px", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, cursor: "pointer", transition: "all 0.1s" }}
            >
              <FlagEmoji emoji={CURRENCY_FLAGS[c]} size={22} />
              <span style={{ fontSize: 10, color: c === value ? "#f97316" : "#9090a8", fontFamily: "DM Mono, monospace" }}>{c}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function MonthlySummary({ expenses, displayCurrency, rates }: {
  expenses: ExpenseRecord[];
  displayCurrency?: string;
  rates?: Record<string, number>;
}) {
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthExpenses = expenses.filter(e => e.date.startsWith(thisMonth));
  const totalByCurrency = sumByCurrency(monthExpenses);
  const workByCurrency = sumByCurrency(monthExpenses.filter(e => e.tags?.includes("work") || e.is_work_related));
  const hasWork = Object.keys(workByCurrency).length > 0;
  const currencies = Object.keys(totalByCurrency);
  const singleCurrency = currencies.length === 1 ? currencies[0] : null;
  const grandTotal = monthExpenses.reduce((s, e) => s + e.amount, 0);

  const byCat = EXP_CATEGORIES.map(cat => ({
    ...cat,
    rawTotal: monthExpenses.filter(e => e.category === cat.key).reduce((s, e) => s + e.amount, 0),
    byCurrency: sumByCurrency(monthExpenses.filter(e => e.category === cat.key)),
  })).filter(c => c.rawTotal > 0).sort((a, b) => b.rawTotal - a.rawTotal);

  if (monthExpenses.length === 0) return null;

  return (
    <div className="uf-card" style={{ marginBottom: 24 }}>
      <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>
        📊 {now.toLocaleDateString('en-US', { month: 'long' })} Summary
      </div>
      <div style={{ display: "grid", gridTemplateColumns: hasWork ? "1fr 1fr 1fr" : "1fr 1fr", gap: 16, marginBottom: 20 }}>
        <div style={{ background: "#08080e", borderRadius: 12, padding: "14px 16px" }}>
          <div style={{ color: "#5e5e7a", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Total Spent</div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontWeight: 700, color: "#ef4444", fontSize: 24, lineHeight: 1.4 }}>
            {displayCurrency && rates ? (() => { const c = convertToDisplay(totalByCurrency, displayCurrency, rates); return c !== null ? `≈ ${expFmt(c, displayCurrency)}` : fmtMulti(totalByCurrency); })() : fmtMulti(totalByCurrency)}
          </div>
        </div>
        <div style={{ background: "#08080e", borderRadius: 12, padding: "14px 16px" }}>
          <div style={{ color: "#5e5e7a", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Transactions</div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 24, fontWeight: 700, color: "#e8e8f2" }}>{monthExpenses.length}</div>
        </div>
        {hasWork && (
          <div style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 12, padding: "14px 16px" }}>
            <div style={{ color: "#6366f1", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>💼 Work Costs</div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontWeight: 700, color: "#6366f1", fontSize: Object.keys(workByCurrency).length > 1 ? 16 : 24, lineHeight: 1.4 }}>{fmtMulti(workByCurrency)}</div>
          </div>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {byCat.map(cat => (
          <div key={cat.key}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
              <span>{cat.label}</span>
              <span style={{ color: cat.color, fontFamily: "'DM Mono', monospace", fontWeight: 600 }}>
                {fmtMulti(cat.byCurrency)}
                {singleCurrency && <span style={{ color: "#5e5e7a" }}> ({((cat.rawTotal / grandTotal) * 100).toFixed(0)}%)</span>}
              </span>
            </div>
            <div style={{ height: 4, background: "#1c1c2e", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(cat.rawTotal / grandTotal) * 100}%`, background: cat.color, borderRadius: 4 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AddExpenseForm({ onAdd }: { onAdd: (e: ExpenseRecord) => void }) {
  const amountRef = useRef<HTMLInputElement>(null);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [currency, setCurrency] = useState(() => loadPrefs().defaultCurrency || "USD");
  const [category, setCategory] = useState(lastUsedCategory);
  const [tags, setTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState("");
  const [categorizing, setCategorizing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => { amountRef.current?.focus(); }, []);

  const handleDescriptionBlur = async () => {
    if (!description || category) return;
    setCategorizing(true);
    const result = await aiCategorize(description);
    setCategory(result.category);
    if (tags.length === 0) setTags(result.tags);
    setCategorizing(false);
  };

  const handleSubmit = async () => {
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) return;
    setSaving(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setSaving(false); return; }

    let finalCategory = category;
    let finalTags = [...tags];

    if (!finalCategory && description) {
      const result = await aiCategorize(description);
      finalCategory = result.category;
      if (finalTags.length === 0) finalTags = result.tags;
    }
    if (!finalCategory) finalCategory = "other";

    const { data, error } = await supabase.from('expenses').insert({
      user_id: session.user.id,
      date,
      amount: parsedAmount,
      currency,
      description: description || "",
      category: finalCategory,
      tags: finalTags,
    }).select().single();

    if (!error && data) {
      lastUsedCategory = finalCategory;
      onAdd({ ...data, tags: data.tags ?? [] });
      setAmount("");
      setDescription("");
      setCategory(lastUsedCategory);
      setTags([]);
      amountRef.current?.focus();
    }
    setSaving(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") { e.preventDefault(); void handleSubmit(); }
  };

  const toggleTag = (tag: string) =>
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);

  const catInfo = EXP_CATEGORIES.find(c => c.key === category);
  const canSubmit = !!amount && parseFloat(amount) > 0;

  return (
    <div className="uf-card" style={{ marginBottom: 24 }}>
      {/* ── Primary row ── */}
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <div style={{ position: "relative", width: 148, flexShrink: 0 }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#5e5e7a", fontSize: 16, pointerEvents: "none" }}>$</span>
          <input
            ref={amountRef}
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ width: "100%", background: "#08080e", border: `1px solid ${canSubmit ? "#2a2a3e" : "#1c1c2e"}`, borderRadius: 10, padding: "12px 12px 12px 28px", color: "#e8e8f2", fontSize: 18, fontFamily: "'DM Mono', monospace", fontWeight: 700, outline: "none" }}
          />
        </div>
        <input
          type="text"
          placeholder="What for? (optional)"
          value={description}
          onChange={e => { setDescription(e.target.value); if (category === lastUsedCategory) setCategory(""); }}
          onBlur={handleDescriptionBlur}
          onKeyDown={handleKeyDown}
          style={{ flex: 1, background: "#08080e", border: "1px solid #1c1c2e", borderRadius: 10, padding: "12px 14px", color: "#e8e8f2", fontSize: 14, outline: "none", fontFamily: "inherit" }}
        />
        <button
          onClick={() => void handleSubmit()}
          disabled={saving || !canSubmit}
          style={{ background: canSubmit ? "#f97316" : "#1c1c2e", color: canSubmit ? "#fff" : "#3a3a5a", border: "none", borderRadius: 10, padding: "12px 22px", fontSize: 14, fontWeight: 700, cursor: canSubmit ? "pointer" : "default", fontFamily: "'Syne', sans-serif", transition: "all 0.15s", flexShrink: 0 }}
        >
          {saving ? "…" : "Add →"}
        </button>
      </div>

      {/* ── Date row (always visible) ── */}
      <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          style={{ background: "#12121e", border: "1px solid #2a2a3e", borderRadius: 8, color: "#a0a0c0", fontSize: 13, outline: "none", fontFamily: "inherit", cursor: "pointer", padding: "5px 10px", colorScheme: "dark" }} />
      </div>

      {/* ── Status line ── */}
      {(categorizing || category || tags.length > 0) && (
        <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {categorizing && <span style={{ fontSize: 12, color: "#f97316" }}>✨ Categorizing…</span>}
          {!categorizing && category && (
            <span style={{ fontSize: 12, color: catInfo?.color || "#e8e8f2", background: `${catInfo?.color || "#e8e8f2"}18`, borderRadius: 6, padding: "2px 10px" }}>
              {catInfo?.label || category}
            </span>
          )}
          {tags.map(t => (
            <span key={t} style={{ fontSize: 12, color: t === "work" ? "#6366f1" : "#f97316", background: t === "work" ? "rgba(99,102,241,0.12)" : "rgba(249,115,22,0.1)", borderRadius: 6, padding: "2px 10px" }}>
              {t === "work" ? "💼 work" : `#${t}`}
            </span>
          ))}
        </div>
      )}

      {/* ── More options toggle ── */}
      <button
        onClick={() => setExpanded(v => !v)}
        style={{ marginTop: 10, background: "none", border: "none", color: "#3a3a5a", fontSize: 12, cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 4, transition: "color 0.15s" }}
        onMouseEnter={e => (e.currentTarget.style.color = "#5e5e7a")}
        onMouseLeave={e => (e.currentTarget.style.color = "#3a3a5a")}
      >
        {expanded ? "▲" : "▼"} More options
      </button>

      {/* ── Expanded options ── */}
      {expanded && (
        <div style={{ marginTop: 12, paddingTop: 14, borderTop: "1px solid #1c1c2e", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <div style={{ color: "#5e5e7a", fontSize: 11, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>Category</div>
              <select value={category} onChange={e => setCategory(e.target.value)}
                style={{ width: "100%", background: "#08080e", border: `1px solid ${catInfo ? catInfo.color + "44" : "#1c1c2e"}`, borderRadius: 8, padding: "8px 10px", color: catInfo ? catInfo.color : "#e8e8f2", fontSize: 13, outline: "none", fontFamily: "inherit" }}>
                <option value="">Auto-detect</option>
                {EXP_CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <div style={{ color: "#5e5e7a", fontSize: 11, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>Currency</div>
              <CurrencySelect value={currency} onChange={setCurrency} />
            </div>
          </div>
          <div>
            <div style={{ color: "#5e5e7a", fontSize: 11, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Tags</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              {PREDEFINED_TAGS.map(tag => (
                <button key={tag} onClick={() => toggleTag(tag)}
                  style={{ background: tags.includes(tag) ? (tag === "work" ? "rgba(99,102,241,0.2)" : "rgba(249,115,22,0.2)") : "#08080e", color: tags.includes(tag) ? (tag === "work" ? "#6366f1" : "#f97316") : "#5e5e7a", border: `1px solid ${tags.includes(tag) ? (tag === "work" ? "rgba(99,102,241,0.5)" : "rgba(249,115,22,0.5)") : "#1c1c2e"}`, borderRadius: 8, padding: "5px 14px", fontSize: 13, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>
                  {tag === "work" ? "💼 work" : `#${tag}`}
                </button>
              ))}
              {tags.filter(t => !PREDEFINED_TAGS.includes(t)).map(t => (
                <span key={t} style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(99,102,241,0.15)", color: "#8b8cf8", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 8, padding: "5px 10px", fontSize: 13 }}>
                  #{t}
                  <button onClick={() => setTags(prev => prev.filter(x => x !== t))}
                    style={{ background: "none", border: "none", color: "#8b8cf8", cursor: "pointer", padding: 0, fontSize: 13, lineHeight: 1 }}>×</button>
                </span>
              ))}
              <input
                type="text"
                placeholder="+ tag"
                value={customTagInput}
                onChange={e => setCustomTagInput(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                onKeyDown={e => {
                  if (e.key === "Enter" && customTagInput.trim()) {
                    e.preventDefault();
                    const t = customTagInput.trim();
                    if (!tags.includes(t)) setTags(prev => [...prev, t]);
                    setCustomTagInput("");
                  }
                }}
                style={{ background: "#08080e", border: "1px solid #1c1c2e", borderRadius: 8, padding: "5px 12px", color: "#e8e8f2", fontSize: 13, outline: "none", fontFamily: "inherit", width: 110 }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ExpenseList({ expenses, onDelete, onUpdateTags, onUpdate, displayCurrency, rates }: {
  expenses: ExpenseRecord[];
  onDelete: (id: string) => void;
  onUpdateTags: (id: string, tags: string[]) => void;
  onUpdate: (id: string, updates: Partial<ExpenseRecord>) => void;
  displayCurrency?: string;
  rates?: Record<string, number>;
}) {
  const [editingTagsId, setEditingTagsId] = useState<string | null>(null);
  const [editingTags, setEditingTags] = useState<string[]>([]);
  const [editTagInput, setEditTagInput] = useState("");
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<ExpenseRecord>>({});

  const startEdit = (expense: ExpenseRecord) => {
    setEditingExpenseId(expense.id);
    setEditDraft({ amount: expense.amount, description: expense.description, date: expense.date, currency: expense.currency, category: expense.category });
    setEditingTagsId(null);
  };
  const saveEdit = (id: string) => {
    onUpdate(id, editDraft);
    setEditingExpenseId(null);
  };

  const startEditTags = (expense: ExpenseRecord) => {
    setEditingTagsId(expense.id);
    setEditingTags([...(expense.tags ?? [])]);
    setEditTagInput("");
  };

  const saveEditTags = (id: string) => {
    onUpdateTags(id, editingTags);
    setEditingTagsId(null);
  };

  const toggleEditTag = (tag: string) =>
    setEditingTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);

  const grouped = expenses.reduce((acc, e) => {
    const month = e.date.slice(0, 7);
    if (!acc[month]) acc[month] = [];
    acc[month].push(e);
    return acc;
  }, {} as Record<string, ExpenseRecord[]>);

  const months = Object.keys(grouped).sort().reverse();

  if (expenses.length === 0) {
    return (
      <div className="uf-card" style={{ textAlign: "center", padding: "48px 24px" }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>📋</div>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>No expenses yet</div>
        <div style={{ color: "#5e5e7a", fontSize: 14 }}>Add your first expense above — AI will categorize it automatically</div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {months.map(month => {
        const monthExpenses = grouped[month];
        const monthTotalByCurrency = sumByCurrency(monthExpenses);
        const workByCurrency = sumByCurrency(monthExpenses.filter(e => e.tags?.includes("work") || e.is_work_related));
        const date = new Date(month + '-01');
        const monthLabel = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        return (
          <div key={month}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{monthLabel}</div>
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                {Object.keys(workByCurrency).length > 0 && (
                  <span style={{ color: "#6366f1", fontSize: 12, fontWeight: 600 }}>
                    💼 Work: {fmtMulti(workByCurrency)}
                  </span>
                )}
                <span style={{ fontFamily: "'DM Mono', monospace", color: "#f97316", fontWeight: 700 }}>
                  {displayCurrency && rates ? (() => { const c = convertToDisplay(monthTotalByCurrency, displayCurrency, rates); return c !== null ? `≈ ${expFmt(c, displayCurrency)}` : fmtMulti(monthTotalByCurrency); })() : fmtMulti(monthTotalByCurrency)}
                </span>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {monthExpenses.sort((a, b) => b.date.localeCompare(a.date)).map(expense => {
                const cat = EXP_CATEGORIES.find(c => c.key === expense.category);
                const isEditingThis = editingExpenseId === expense.id;
                const editCat = EXP_CATEGORIES.find(c => c.key === editDraft.category);
                return (
                  <div key={expense.id} className="uf-card" style={{ padding: "14px 18px" }}>
                    {isEditingThis ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                          <input type="number" value={editDraft.amount ?? ""} onChange={e => setEditDraft(d => ({ ...d, amount: parseFloat(e.target.value) || 0 }))}
                            style={{ width: 110, background: "#08080e", border: "1px solid #2a2a3e", borderRadius: 8, padding: "8px 10px", color: "#e8e8f2", fontSize: 15, fontFamily: "'DM Mono',monospace", fontWeight: 700, outline: "none" }} />
                          <input type="text" value={editDraft.description ?? ""} onChange={e => setEditDraft(d => ({ ...d, description: e.target.value }))}
                            placeholder="Description"
                            style={{ flex: 1, minWidth: 140, background: "#08080e", border: "1px solid #2a2a3e", borderRadius: 8, padding: "8px 10px", color: "#e8e8f2", fontSize: 14, outline: "none", fontFamily: "inherit" }} />
                          <input type="date" value={editDraft.date ?? ""} onChange={e => setEditDraft(d => ({ ...d, date: e.target.value }))}
                            style={{ background: "#08080e", border: "1px solid #2a2a3e", borderRadius: 8, padding: "8px 10px", color: "#e8e8f2", fontSize: 13, outline: "none", fontFamily: "inherit", colorScheme: "dark" }} />
                        </div>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                          <CurrencySelect value={editDraft.currency ?? "USD"} onChange={v => setEditDraft(d => ({ ...d, currency: v }))} />
                          <select value={editDraft.category ?? ""} onChange={e => setEditDraft(d => ({ ...d, category: e.target.value }))}
                            style={{ background: "#08080e", border: `1px solid ${editCat ? editCat.color + "55" : "#2a2a3e"}`, borderRadius: 8, padding: "7px 10px", color: editCat ? editCat.color : "#e8e8f2", fontSize: 13, outline: "none", fontFamily: "inherit" }}>
                            {EXP_CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                          </select>
                          <button onClick={() => saveEdit(expense.id)}
                            style={{ background: "#f97316", color: "#fff", border: "none", borderRadius: 8, padding: "7px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                            Save
                          </button>
                          <button onClick={() => setEditingExpenseId(null)}
                            style={{ background: "none", color: "#5e5e7a", border: "1px solid #2a2a3e", borderRadius: 8, padding: "7px 14px", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: `${cat?.color || '#6b6b85'}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                      {cat?.label.split(' ')[0] || '📦'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>{expense.description}</div>
                      {editingTagsId === expense.id ? (
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", marginTop: 4 }}>
                          {PREDEFINED_TAGS.map(tag => (
                            <button key={tag} onClick={() => toggleEditTag(tag)}
                              style={{ background: editingTags.includes(tag) ? (tag === "work" ? "rgba(99,102,241,0.2)" : "rgba(249,115,22,0.2)") : "#08080e", color: editingTags.includes(tag) ? (tag === "work" ? "#6366f1" : "#f97316") : "#5e5e7a", border: `1px solid ${editingTags.includes(tag) ? (tag === "work" ? "rgba(99,102,241,0.5)" : "rgba(249,115,22,0.5)") : "#1c1c2e"}`, borderRadius: 6, padding: "3px 10px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                              {tag === "work" ? "💼 work" : `#${tag}`}
                            </button>
                          ))}
                          {editingTags.filter(t => !PREDEFINED_TAGS.includes(t)).map(t => (
                            <span key={t} style={{ display: "flex", alignItems: "center", gap: 3, background: "rgba(99,102,241,0.15)", color: "#8b8cf8", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 6, padding: "3px 8px", fontSize: 12 }}>
                              #{t}
                              <button onClick={() => setEditingTags(prev => prev.filter(x => x !== t))}
                                style={{ background: "none", border: "none", color: "#8b8cf8", cursor: "pointer", padding: 0, fontSize: 12, lineHeight: 1 }}>×</button>
                            </span>
                          ))}
                          <input
                            type="text"
                            placeholder="+ tag"
                            value={editTagInput}
                            onChange={e => setEditTagInput(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                            onKeyDown={e => {
                              if (e.key === "Enter" && editTagInput.trim()) {
                                e.preventDefault();
                                const t = editTagInput.trim();
                                if (!editingTags.includes(t)) setEditingTags(prev => [...prev, t]);
                                setEditTagInput("");
                              }
                            }}
                            style={{ background: "#08080e", border: "1px solid #1c1c2e", borderRadius: 6, padding: "3px 10px", color: "#e8e8f2", fontSize: 12, outline: "none", fontFamily: "inherit", width: 90 }}
                          />
                          <button onClick={() => saveEditTags(expense.id)}
                            style={{ background: "#f97316", color: "#fff", border: "none", borderRadius: 6, padding: "3px 12px", fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 700 }}>
                            Done
                          </button>
                          <button onClick={() => setEditingTagsId(null)}
                            style={{ background: "none", color: "#5e5e7a", border: "none", fontSize: 12, cursor: "pointer", padding: 0 }}>
                            cancel
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", cursor: "pointer" }} onClick={() => startEditTags(expense)}>
                          <span style={{ color: cat?.color || '#6b6b85', fontSize: 11, fontWeight: 600 }}>{cat?.label || expense.category}</span>
                          {expense.tags?.map(t => <span key={t} style={{ background: t === "work" ? "rgba(99,102,241,0.15)" : "rgba(249,115,22,0.1)", color: t === "work" ? "#6366f1" : "#f97316", borderRadius: 4, padding: "1px 6px", fontSize: 11 }}>{t === "work" ? "💼 work" : `#${t}`}</span>)}
                          <span style={{ color: "#3a3a5a", fontSize: 11 }}>+ tags</span>
                          <span style={{ color: "#5e5e7a", fontSize: 11 }}>{new Date(expense.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontFamily: "'DM Mono', monospace", fontWeight: 700, fontSize: 15 }}>{expFmt(expense.amount, expense.currency)}</div>
                      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
                        <button onClick={() => startEdit(expense)}
                          style={{ background: "none", border: "none", color: "#5e5e7a", fontSize: 11, cursor: "pointer" }}>
                          edit
                        </button>
                        <button onClick={() => onDelete(expense.id)}
                          style={{ background: "none", border: "none", color: "#5e5e7a", fontSize: 11, cursor: "pointer" }}>
                          delete
                        </button>
                      </div>
                    </div>
                    </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ExpensesTab() {
  const [expensesList, setExpensesList] = useState<ExpenseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayCurrency, setDisplayCurrency] = useState("");
  const [rates, setRates] = useState<Record<string, number> | undefined>(undefined);

  useEffect(() => {
    const prefs = loadPrefs();
    setDisplayCurrency(prefs.preferredCurrency);
    if (prefs.preferredCurrency) {
      fetch("/api/exchange-rates")
        .then(r => r.ok ? r.json() : null)
        .then(data => { if (data) setRates(data); })
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return;
      supabase.from('expenses').select('*').eq('user_id', session.user.id)
        .order('date', { ascending: false })
        .then(({ data }) => {
          if (data) {
            // Migrate legacy is_work_related into tags["work"]
            const migrated = data.map((e: ExpenseRecord) => {
              if (e.is_work_related && !(e.tags ?? []).includes("work")) {
                return { ...e, tags: [...(e.tags ?? []), "work"] };
              }
              return { ...e, tags: e.tags ?? [] };
            });
            setExpensesList(migrated);
          }
          setLoading(false);
        });
    });
  }, []);

  const handleAdd = (expense: ExpenseRecord) => {
    setExpensesList(prev => [expense, ...prev]);
  };

  const handleDelete = async (id: string) => {
    await supabase.from('expenses').delete().eq('id', id);
    setExpensesList(prev => prev.filter(e => e.id !== id));
  };

  const handleUpdateTags = async (id: string, tags: string[]) => {
    await supabase.from('expenses').update({ tags }).eq('id', id);
    setExpensesList(prev => prev.map(e => e.id === id ? { ...e, tags } : e));
  };

  const handleUpdate = async (id: string, updates: Partial<ExpenseRecord>) => {
    await supabase.from('expenses').update(updates).eq('id', id);
    setExpensesList(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  if (loading) {
    return <div style={{ textAlign: "center", padding: "60px 0", color: "#5e5e7a" }}>Loading expenses...</div>;
  }

  return (
    <>
      <MonthlySummary expenses={expensesList} displayCurrency={displayCurrency} rates={rates} />
      <AddExpenseForm onAdd={handleAdd} />
      <ExpenseList expenses={expensesList} onDelete={handleDelete} onUpdateTags={handleUpdateTags} onUpdate={handleUpdate} displayCurrency={displayCurrency} rates={rates} />
    </>
  );
}

// ─── Settings Tab ─────────────────────────────────────────────────────────────
function SettingsTab() {
  const [email, setEmail] = useState<string | null>(null);
  const [savedMsg, setSavedMsg] = useState(false);
  const [preferredCurrency, setPreferredCurrency] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setEmail(user?.email ?? null));
    const prefs = loadPrefs();
    setPreferredCurrency(prefs.preferredCurrency);
  }, []);

  const handleCurrencyChange = (v: string) => {
    setPreferredCurrency(v);
    savePrefs({ ...loadPrefs(), preferredCurrency: v });
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
  };

  const handleDelete = async () => {
    setDeleting(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setDeleting(false); return; }
    await fetch("/api/delete-account", {
      method: "DELETE",
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    // Clear localStorage
    localStorage.removeItem("fire_user_data");
    localStorage.removeItem("untilfire_inputs");
    localStorage.removeItem("untilfire_prefs");
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const cardStyle: React.CSSProperties = { background: "#0f0f18", border: "1px solid #1c1c2e", borderRadius: 16, padding: "24px 28px", marginBottom: 20 };
  const labelStyle: React.CSSProperties = { fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "#5e5e7a", marginBottom: 6, fontFamily: "DM Mono, monospace" };

  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 22, marginBottom: 24 }}>Settings</div>

      {/* Profile */}
      <div style={cardStyle}>
        <SectionLabel icon="👤" text="Profile" color="#818cf8" />
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div>
            <div style={labelStyle}>Email</div>
            <div style={{ color: "#e8e8f2", fontSize: 14, fontFamily: "DM Mono, monospace" }}>{email ?? "—"}</div>
          </div>
          <div>
            <div style={labelStyle}>Sign-in method</div>
            <div style={{ color: "#9090a8", fontSize: 14 }}>Google account</div>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div style={cardStyle}>
        <SectionLabel icon="⚙️" text="Preferences" color="#22d3a5" />
        <div>
          <div style={labelStyle}>Main display currency</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <CurrencySelect value={preferredCurrency} onChange={handleCurrencyChange} allowEmpty />
            {savedMsg && <span style={{ fontSize: 12, color: "#22d3a5" }}>Saved ✓</span>}
          </div>
          <div style={{ marginTop: 8, fontSize: 12, color: "#3a3a5a" }}>
            When set, expense totals convert to this currency using live rates.
          </div>
        </div>
      </div>

      {/* Account */}
      <div style={cardStyle}>
        <SectionLabel icon="🗑️" text="Account" color="#ef4444" />
        {!deleteConfirm ? (
          <button
            onClick={() => setDeleteConfirm(true)}
            style={{ background: "transparent", color: "#ef4444", border: "1px solid rgba(239,68,68,0.4)", borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
          >
            Delete my account
          </button>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ color: "#ef4444", fontSize: 13, lineHeight: 1.5 }}>
              This permanently deletes all your data. Continue?
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => void handleDelete()}
                disabled={deleting}
                style={{ background: "#ef4444", color: "#fff", border: "none", borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 700, cursor: deleting ? "default" : "pointer", fontFamily: "inherit", opacity: deleting ? 0.7 : 1 }}
              >
                {deleting ? "Deleting…" : "Yes, delete everything"}
              </button>
              <button
                onClick={() => setDeleteConfirm(false)}
                style={{ background: "transparent", color: "#5e5e7a", border: "1px solid #2a2a3e", borderRadius: 8, padding: "9px 14px", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
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
      <span style={{ color: "#5e5e7a", fontSize: 13 }}>{email}</span>
      <button onClick={handleSignOut} style={{ background: "transparent", color: "#f97316", border: "1px solid #f97316", borderRadius: 8, padding: "7px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Sign Out</button>
    </div>
  );
}

// ─── Root ────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [tab, setTab] = useState<TabKey>("dashboard");
  const [baselineFireTarget, setBaselineFireTarget] = useState<number | undefined>(undefined);
  const [adjustedFireTarget, setAdjustedFireTarget] = useState<number | undefined>(undefined);
  const [onboardingGateReady, setOnboardingGateReady] = useState(false);
  const onboardingRedirected = useRef(false);

  useEffect(() => {
    registerFireUserStateInspector();
  }, []);

  // Read initial tab from URL query string (e.g. ?tab=budget)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("tab") as TabKey | null;
    if (t && ["dashboard", "budget", "fire", "expenses", "settings"].includes(t)) setTab(t);
  }, []);

  // ─── Helpers to apply a flat UntilFireInputs snapshot to all state setters ──
  function applyInputs(s: UntilFireInputs) {
    const legacyFireTarget = (s as UntilFireInputs & { fireTarget?: number }).fireTarget;
    setIncome(s.income);
    setExpenses({ ...DEFAULT_INPUTS.expenses, ...s.expenses });
    setFireAge(s.fireAge);
    setK401(s.k401);
    setRothIRA(s.rothIRA);
    setTaxable(s.taxable);
    setTotalDebt(s.totalDebt);
    setMortgageBalance(s.mortgageBalance);
    setMortgageMonthly(s.mortgageMonthly);
    setGrowthRate(s.growthRate);
    setWithdrawalRate(s.withdrawalRate);
    setBaselineFireTarget(s.baselineFireTarget ?? legacyFireTarget);
    setAdjustedFireTarget(s.adjustedFireTarget);
  }

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
  const saveTimer    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLoaded     = useRef(false);

  useEffect(() => {
    const fireUserData = resolveFireUserState();
    console.log("[UntilFire] dashboard resolved FIRE state", fireUserData);

    if (!fireUserData?.hasCompletedOnboarding) {
      if (!onboardingRedirected.current) {
        onboardingRedirected.current = true;
        window.location.replace("/");
      }
      return;
    }

    const localInputs = loadLocalInputs();
    if (localInputs && hasLocalInputs(localInputs)) {
      applyInputs(localInputs);
    } else {
      setIncome(typeof fireUserData.income === "number" ? fireUserData.income : fireUserData.income.monthlyIncome);
      setExpenses((prev) => ({ ...prev, other: safeNumber(fireUserData.expenses) }));
      setFireAge(fireUserData.age ?? 30);
      setBaselineFireTarget(fireUserData.fireNumber);
    }
    setOnboardingGateReady(true);
  }, []);

  // ─── 1. HYDRATE: Load from Supabase on mount, merge with localStorage ────────
  useEffect(() => {
    if (!onboardingGateReady) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { isLoaded.current = true; return; }
      // Strict priority for baseline FIRE state: fire_user_data first, Supabase second.
      console.log("[UntilFire] FireUserState priority", FIRE_USER_STATE_PRIORITY);

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
        if (data) {
          // Backend has a row — extract it into the UntilFireInputs shape
          const raw = data.expenses || {};
          const fp  = raw._fire_profile || {};
          const { _fire_profile: _, ...budgetExpenses } = raw;

          const backendInputs: Partial<UntilFireInputs> = {
            income:             data.income || 0,
            expenses:           { ...DEFAULT_INPUTS.expenses, ...budgetExpenses },
            fireAge:            data.fire_age || 30,
            k401:               fp.k401 || data.fire_assets || 0,
            rothIRA:            fp.rothIRA || 0,
            taxable:            fp.taxable || 0,
            totalDebt:          fp.totalDebt || 0,
            mortgageBalance:    fp.mortgageBalance || 0,
            mortgageMonthly:    fp.mortgageMonthly || 0,
            growthRate:         fp.growthRate || 0.07,
            withdrawalRate:     fp.withdrawalRate || 0.04,
            baselineFireTarget: fp.baselineFireTarget || undefined,
            adjustedFireTarget: fp.adjustedFireTarget || undefined,
          };
          const fireUserData = resolveFireUserState(backendInputs);
          applyInputs(backendInputs as UntilFireInputs);
          if (fireUserData?.fireNumber) {
            setBaselineFireTarget(fireUserData.fireNumber);
          }
          if (fireUserData?.age) {
            setFireAge(fireUserData.age);
          }
          if (fireUserData) {
            setIncome(typeof fireUserData.income === "number" ? fireUserData.income : fireUserData.income.monthlyIncome);
            setExpenses((prev) => ({ ...prev, other: safeNumber(fireUserData.expenses) }));
          }
        }

        isLoaded.current = true;
      });
    });
  }, [onboardingGateReady]);

  // ─── 2. SAVE to Supabase with 1s debounce (authenticated users only) ─────────
  useEffect(() => {
    if (!isLoaded.current) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaveStatus("saving");
    saveTimer.current = setTimeout(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const fireProfile = { k401, rothIRA, taxable, totalDebt, mortgageBalance, mortgageMonthly, growthRate, withdrawalRate, baselineFireTarget, adjustedFireTarget };
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
  }, [income, expenses, fireAge, k401, rothIRA, taxable, totalDebt, mortgageBalance, mortgageMonthly, growthRate, withdrawalRate, baselineFireTarget, adjustedFireTarget]);

  if (!onboardingGateReady) {
    return null;
  }

  const navTabs: { key: TabKey; label: string }[] = [
    { key: "dashboard", label: "Overview" },
    { key: "budget",    label: "Budget" },
    { key: "fire",      label: "FIRE Calculator" },
    { key: "expenses",  label: "Expenses" },
    { key: "settings",  label: "Settings" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#08080e", color: "#e8e8f2", fontFamily: "'DM Sans', sans-serif" }}>
      {/* Top nav */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(8,8,14,0.92)", borderBottom: "1px solid #1c1c2e", backdropFilter: "blur(12px)", padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <div style={{ fontFamily: "Syne, sans-serif", fontSize: 18, fontWeight: 700, letterSpacing: -0.5, flexShrink: 0 }}>
          Until<span style={{ color: "#f97316" }}>Fire</span>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {navTabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                background: tab === t.key ? "rgba(249,115,22,0.12)" : "transparent",
                color: tab === t.key ? "#f97316" : "#6e6e8e",
                border: tab === t.key ? "1px solid rgba(249,115,22,0.3)" : "1px solid transparent",
                borderRadius: 8, padding: "6px 14px", fontSize: 13,
                fontWeight: tab === t.key ? 600 : 400,
                cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s",
              }}
            >{t.label}</button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          {saveStatus === "saving" && <span style={{ fontSize: 12, color: "#5e5e7a" }}>Saving…</span>}
          {saveStatus === "saved"  && <span style={{ fontSize: 12, color: "#22d3a5" }}>Saved ✓</span>}
          <UserNav />
        </div>
      </nav>

      {/* Tab content */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px" }}>
        {tab === "dashboard" && (
          <DashTab
            income={income} expenses={expenses}
            k401={k401} rothIRA={rothIRA} taxable={taxable}
            totalDebt={totalDebt} mortgageBalance={mortgageBalance} mortgageMonthly={mortgageMonthly}
            growthRate={growthRate} withdrawalRate={withdrawalRate}
            baselineFireTarget={baselineFireTarget} adjustedFireTarget={adjustedFireTarget}
          />
        )}
        {tab === "budget" && (
          <BudgetTab
            income={income} setIncome={setIncome}
            expenses={expenses} setExpenses={setExpenses}
            actuals={actuals}
          />
        )}
        {tab === "fire" && (
          <FIRETab
            income={income} expenses={expenses}
            fireAge={fireAge} setFireAge={setFireAge}
            k401={k401} setK401={setK401}
            rothIRA={rothIRA} setRothIRA={setRothIRA}
            taxable={taxable} setTaxable={setTaxable}
            totalDebt={totalDebt} setTotalDebt={setTotalDebt}
            mortgageBalance={mortgageBalance} setMortgageBalance={setMortgageBalance}
            mortgageMonthly={mortgageMonthly} setMortgageMonthly={setMortgageMonthly}
            growthRate={growthRate} setGrowthRate={setGrowthRate}
            withdrawalRate={withdrawalRate} setWithdrawalRate={setWithdrawalRate}
            baselineFireTarget={baselineFireTarget}
            adjustedFireTarget={adjustedFireTarget} setAdjustedFireTarget={setAdjustedFireTarget}
          />
        )}
        {tab === "expenses" && <ExpensesTab />}
        {tab === "settings" && <SettingsTab />}
      </div>
    </div>
  );
}
