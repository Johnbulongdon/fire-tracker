"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import {
  DEFAULT_INPUTS,
  FIRE_USER_STATE_PRIORITY,
  registerFireUserStateInspector,
  resolveFireUserState,
  type UntilFireInputs,
} from "@/lib/local-inputs";
import Link from "next/link";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend, ReferenceLine,
} from "recharts";

// 鈹€鈹€鈹€ Types 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
type Expenses = Record<string, number>;
type TabKey = "dashboard" | "budget" | "fire" | "expenses";

// 鈹€鈹€鈹€ Constants 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
const EXPENSE_CATS = [
  { key: "housing",       label: "Housing",       icon: "馃彔", color: "#818cf8" },
  { key: "food",          label: "Food & Dining",  icon: "馃崝", color: "#16a34a" },
  { key: "transport",     label: "Transport",      icon: "馃殫", color: "#10b981" },
  { key: "subscriptions", label: "Subscriptions",  icon: "馃摫", color: "#a78bfa" },
  { key: "healthcare",    label: "Healthcare",     icon: "馃彞", color: "#ef4444" },
  { key: "entertainment", label: "Entertainment",  icon: "馃幀", color: "#fbbf24" },
  { key: "other",         label: "Other",          icon: "馃摝", color: "#6b6b85" },
];

// 鈹€鈹€鈹€ Formatters 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
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

// 鈹€鈹€鈹€ FIRE Engine 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
// 鈹€鈹€鈹€ Shared UI 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
function NumberInput({ value, onChange, placeholder = "0", prefix = "$" }: {
  value: number; onChange: (v: number) => void;
  placeholder?: string; prefix?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 6,
      background: "#ffffff", borderRadius: 8, padding: "9px 12px",
      border: `1px solid ${focused ? "#16a34a" : "#dbe4dd"}`,
      transition: "border-color 0.2s",
    }}>
      <span style={{ color: "#6b7280", fontSize: 13, fontFamily: "DM Mono, monospace" }}>{prefix}</span>
      <input
        type="number" value={value || ""} placeholder={placeholder}
        onChange={e => onChange(Number(e.target.value))}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{ background: "none", border: "none", outline: "none", color: "#111827", fontSize: 14, width: "100%", fontFamily: "DM Mono, monospace" }}
      />
    </div>
  );
}

function FieldRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 11, fontFamily: "DM Mono, monospace", letterSpacing: "0.08em", textTransform: "uppercase", color: "#6b7280" }}>
        {label}
      </label>
      {children}
      {hint && <span style={{ fontSize: 11, color: "#94a3b8", fontStyle: "italic" }}>{hint}</span>}
    </div>
  );
}

function KpiCard({ label, value, sub, color = "#111827", glow = false }: {
  label: string; value: string; sub?: string; color?: string; glow?: boolean;
}) {
  return (
    <div className={`uf-card ${glow ? "uf-card-glow" : ""}`} style={{ padding: "18px 20px" }}>
      <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6b7280", marginBottom: 8, fontFamily: "DM Mono, monospace" }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color, fontFamily: "DM Mono, monospace", lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "#6b7280", marginTop: 5 }}>{sub}</div>}
    </div>
  );
}

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#ffffff", border: "1px solid #dbe4dd", borderRadius: 8, padding: "10px 14px", fontFamily: "DM Mono, monospace", fontSize: 12, boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)" }}>
      <p style={{ color: "#6b7280", marginBottom: 6 }}>Year {label}</p>
      {payload.map((p: any) => (
        <div key={p.name} style={{ color: p.color, marginBottom: 2 }}>{p.name}: {fmt(p.value, true)}</div>
      ))}
    </div>
  );
};

function SectionLabel({ icon, text, color = "#16a34a" }: { icon: string; text: string; color?: string }) {
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
      <div style={{ fontSize: 34, marginBottom: 14 }}>馃敟</div>
      <div style={{ fontFamily: "Syne, sans-serif", fontSize: 22, fontWeight: 700, marginBottom: 10 }}>{title}</div>
      <div style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.6, marginBottom: 18 }}>{body}</div>
      <Link href="/" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", background: "#16a34a", color: "#fff", borderRadius: 10, padding: "10px 18px", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
        Complete Onboarding
      </Link>
    </div>
  );
}

// 鈹€鈹€鈹€ Dashboard Overview Tab 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
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
    adjustedFireTarget && adjustedFireTarget > 0
      ? adjustedFireTarget
      : baselineFireTarget && baselineFireTarget > 0
        ? baselineFireTarget
        : undefined;

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
        <KpiCard label="Net Worth" value={fmt(netWorth, true)} color={netWorth >= 0 ? "#10b981" : "#ef4444"} sub="Assets minus all debt" />
        <KpiCard label="FIRE Target" value={effectiveFireTarget ? fmt(effectiveFireTarget, true) : "Not set"} sub={adjustedFireTarget ? "Dashboard override" : baselineFireTarget ? "Onboarding baseline" : "Complete onboarding"} />
        <KpiCard label="FIRE Source" value={adjustedFireTarget ? "Override" : baselineFireTarget ? "Baseline" : "Missing"} color="#16a34a" sub={effectiveFireTarget ? "Projection removed from main UI" : "No FIRE target yet"} glow={!!effectiveFireTarget} />
        <KpiCard label="Savings Rate" value={`${savingsRate.toFixed(0)}%`} color={savingsRate >= 50 ? "#16a34a" : savingsRate >= 25 ? "#10b981" : "#ef4444"} sub={savingsRate >= 50 ? "馃敟 FIRE pace" : savingsRate >= 25 ? "Good progress" : "Needs work"} />
      </div>

      {/* Progress bar */}
      <div className="uf-card" style={{ padding: "18px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>Progress to FIRE</span>
          <span style={{ fontFamily: "DM Mono, monospace", fontSize: 13, color: "#16a34a" }}>{fmt(investable, true)} / {effectiveFireTarget ? fmt(effectiveFireTarget, true) : "Not set"}</span>
        </div>
        <div style={{ height: 10, background: "#e5e7eb", borderRadius: 99, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg, #10b981, #16a34a)", borderRadius: 99, transition: "width 0.8s cubic-bezier(0.34,1.56,0.64,1)" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#6b7280", marginTop: 7, fontFamily: "DM Mono, monospace" }}>
          <span>0%</span><span>{progress.toFixed(1)}% complete</span><span>100% = FIRE</span>
        </div>
      </div>

      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16 }}>
        {/* FIRE snapshot chart */}
        <div className="uf-card">
          <SectionLabel icon="馃搱" text="FIRE Snapshot" color="#10b981" />
          {chartData.length === 0 ? (
            <div style={{ color: "#6b7280", fontSize: 13, textAlign: "center", padding: "72px 0" }}>
              Complete onboarding to unlock your FIRE snapshot
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="gInv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gTgt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#16a34a" stopOpacity={0.16} />
                    <stop offset="100%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#dbe4dd" />
                <XAxis dataKey="year" tickFormatter={v => `Yr ${v}`} tick={{ fill: "#6b7280", fontSize: 10, fontFamily: "DM Mono" }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => fmt(v, true)} tick={{ fill: "#6b7280", fontSize: 10, fontFamily: "DM Mono" }} axisLine={false} tickLine={false} width={55} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="FIRE Target" stroke="#16a34a" strokeWidth={1.5} strokeDasharray="5 3" fill="url(#gTgt)" dot={false} />
                <Area type="monotone" dataKey="Investable" stroke="#10b981" strokeWidth={2.5} fill="url(#gInv)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Spending breakdown */}
        <div className="uf-card">
          <SectionLabel icon="馃捀" text="Spending Breakdown" color="#ef4444" />
          {activeCats.length === 0 ? (
            <div style={{ color: "#6b7280", fontSize: 13, textAlign: "center", padding: "40px 0" }}>
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
                      <span style={{ color: "#475569" }}>{cat.icon} {cat.label}</span>
                      <span style={{ color: cat.color, fontFamily: "DM Mono, monospace" }}>{fmt(val)} <span style={{ color: "#6b7280" }}>{pct.toFixed(0)}%</span></span>
                    </div>
                    <div style={{ height: 3, background: "#dbe4dd", borderRadius: 4, overflow: "hidden" }}>
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
          <SectionLabel icon="馃彟" text="Account Snapshot" color="#818cf8" />
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              {[
                { label: "401(k)",            val: k401,                     color: "#818cf8" },
                { label: "Roth IRA",          val: rothIRA,                  color: "#10b981" },
                { label: "Taxable Brokerage", val: taxable,                  color: "#a78bfa" },
                null,
                { label: "Consumer Debt",     val: -totalDebt,               color: "#ef4444" },
                { label: "Mortgage",          val: -mortgageBalance,         color: "#ef4444" },
                null,
                { label: "Net Worth",         val: netWorth, bold: true,     color: netWorth >= 0 ? "#10b981" : "#ef4444" },
              ].map((row, i) => {
                if (!row) return (
                  <tr key={`d${i}`}><td colSpan={2} style={{ borderTop: "1px solid #dbe4dd", padding: "4px 0" }} /></tr>
                );
                return (
                  <tr key={row.label}>
                    <td style={{ padding: "6px 0", fontSize: 13, color: row.bold ? "#111827" : "#64748b", fontWeight: row.bold ? 600 : 400 }}>{row.label}</td>
                    <td style={{ padding: "6px 0", textAlign: "right", fontFamily: "DM Mono, monospace", fontSize: 13, color: row.color, fontWeight: row.bold ? 700 : 400 }}>
                      {row.val >= 0 ? fmt(row.val) : `鈭?{fmt(Math.abs(row.val))}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Insights */}
        <div className="uf-card">
          <SectionLabel icon="馃挕" text="Insights" color="#16a34a" />
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              {
                icon: "馃搳",
                title: "Savings Rate",
                body: savingsRate >= 50 ? `${savingsRate.toFixed(0)}% 鈥?you're on an aggressive FIRE track.` : savingsRate >= 25 ? `${savingsRate.toFixed(0)}% is solid. Hitting 50% cuts years off your date.` : `At ${savingsRate.toFixed(0)}%, reducing expenses is your biggest lever.`,
                color: savingsRate >= 50 ? "#10b981" : savingsRate >= 25 ? "#16a34a" : "#ef4444",
              },
              {
                icon: "馃彔",
                title: "Housing Ratio",
                body: income > 0 && expenses.housing > 0 ? `Housing is ${(((expenses.housing || 0) / income) * 100).toFixed(0)}% of take-home. ${(expenses.housing || 0) / income > 0.3 ? "Above 30% 鈥?your biggest cost lever." : "Under 30% 鈥?healthy ratio."}` : "Add housing expenses to see your ratio.",
                color: "#111827",
              },
              {
                icon: "馃敟",
                title: "Rule of 25",
                body: effectiveFireTarget ? `Target: ${fmt(effectiveFireTarget, true)}. Every $100/mo you cut reduces your FIRE number by $30k.` : "Complete onboarding to set your FIRE target.",
                color: "#111827",
              },
            ].map(ins => (
              <div key={ins.title} style={{ background: "#f8fafc", border: "1px solid #dbe4dd", borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                  <span style={{ fontSize: 14 }}>{ins.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: ins.color }}>{ins.title}</span>
                </div>
                <p style={{ fontSize: 12, color: "#64748b", margin: "6px 0 0", lineHeight: 1.5 }}>{ins.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// 鈹€鈹€鈹€ Budget Tracker Tab 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
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
            <div style={{ color: "#6b7280", fontSize: 12, marginTop: 2 }}>After-tax take-home pay</div>
          </div>
          <span className="uf-tag" style={{ color: "#10b981", background: "rgba(34,211,165,0.1)" }}>INCOME</span>
        </div>
        <NumberInput value={income} onChange={setIncome} placeholder="5000" />
      </div>

      {/* Expenses */}
      <div className="uf-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Monthly Budget</div>
            <div style={{ color: "#6b7280", fontSize: 12, marginTop: 2 }}>
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
                  <span style={{ fontSize: 13, color: "#64748b" }}>{cat.icon} {cat.label}</span>
                  <NumberInput value={expenses[cat.key] || 0} onChange={v => setExpenses({ ...expenses, [cat.key]: v })} />
                  <div style={{ height: 4, background: "#dbe4dd", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${Math.min(100, income > 0 ? ((expenses[cat.key] || 0) / income) * 100 : 0)}%`, background: cat.color, borderRadius: 4, transition: "width 0.4s" }} />
                  </div>
                </div>
                {spent > 0 && (
                  <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 12, alignItems: "center" }}>
                    <span style={{ fontSize: 11, fontFamily: "DM Mono, monospace", color: over ? "#ef4444" : "#6b7280" }}>
                      {over ? "鈿?" : ""}Spent {fmt(spent)}{budget > 0 ? ` / ${fmt(budget)}` : ""}
                    </span>
                    {budget > 0 && (
                      <div style={{ height: 3, background: "#dbe4dd", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${spentPct}%`, background: over ? "#ef4444" : "#10b981", borderRadius: 4, transition: "width 0.4s" }} />
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
              { label: "Monthly Savings", val: fmt(Math.max(0, savings)), color: "#10b981" },
              { label: "Savings Rate", val: `${rate.toFixed(1)}%`, color: rate >= 50 ? "#16a34a" : rate >= 25 ? "#10b981" : "#ef4444" },
              { label: "Annual Savings", val: fmt(Math.max(0, savings) * 12), color: "#111827" },
            ].map(k => (
              <div key={k.label}>
                <div style={{ color: "#6b7280", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4, fontFamily: "DM Mono, monospace" }}>{k.label}</div>
                <div style={{ color: k.color, fontSize: 22, fontWeight: 700, fontFamily: "DM Mono, monospace" }}>{k.val}</div>
              </div>
            ))}
          </div>
          {/* Rate bar */}
          <div style={{ marginTop: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#6b7280", marginBottom: 6, fontFamily: "DM Mono, monospace" }}>
              <span>Savings rate</span><span>{rate.toFixed(1)}% {rate >= 50 ? "馃敟 FIRE pace" : rate >= 25 ? "路 Good" : "路 Needs work"}</span>
            </div>
            <div style={{ height: 6, background: "#e5e7eb", borderRadius: 99, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${Math.min(100, rate)}%`, background: rate >= 50 ? "#16a34a" : rate >= 25 ? "#10b981" : "#ef4444", borderRadius: 99, transition: "width 0.6s" }} />
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

// 鈹€鈹€鈹€ FIRE Calculator Tab 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
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
        background: chartTab === id ? "#16a34a" : "transparent",
        border: `1px solid ${chartTab === id ? "#16a34a" : "#dbe4dd"}`,
        borderRadius: 6, padding: "5px 13px",
        color: chartTab === id ? "#fff" : "#6b7280",
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
          <SectionLabel icon="馃挵" text="Income & Spending" />
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
              <NumberInput value={fireAge} onChange={setFireAge} placeholder="30" prefix="馃巶" />
            </FieldRow>
          </div>
        </div>

        {/* Investment Accounts */}
        <div className="uf-card">
          <SectionLabel icon="馃搱" text="Investment Accounts" color="#10b981" />
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
            <SectionLabel icon="馃敾" text="Debt" color="#ef4444" />
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
            <SectionLabel icon="鈿欙笍" text="Assumptions" color="#a78bfa" />
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: "#6b7280", fontFamily: "DM Mono, monospace", textTransform: "uppercase", letterSpacing: "0.08em" }}>Annual Return</span>
                  <span style={{ fontSize: 12, color: "#16a34a", fontFamily: "DM Mono, monospace" }}>{(growthRate * 100).toFixed(1)}%</span>
                </div>
                <input type="range" min={0.03} max={0.12} step={0.001} value={growthRate}
                  onChange={e => setGrowthRate(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "#16a34a", cursor: "pointer" }} />
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: "#6b7280", fontFamily: "DM Mono, monospace", textTransform: "uppercase", letterSpacing: "0.08em" }}>Withdrawal Rate</span>
                  <span style={{ fontSize: 12, color: "#16a34a", fontFamily: "DM Mono, monospace" }}>{(withdrawalRate * 100).toFixed(1)}%</span>
                </div>
                <input type="range" min={0.03} max={0.06} step={0.001} value={withdrawalRate}
                  onChange={e => setWithdrawalRate(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "#16a34a", cursor: "pointer" }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12 }}>
        {[
          { label: "FIRE Source",   val: adjustedFireTarget ? "Override" : baselineFireTarget ? "Baseline" : "Missing", color: "#16a34a", sub: effectiveFireTarget ? "Projection removed from main UI" : "" },
          { label: "FIRE Target",   val: effectiveFireTarget ? fmt(effectiveFireTarget, true) : "Not set", color: "#111827", sub: adjustedFireTarget ? "Dashboard override" : baselineFireTarget ? "Onboarding baseline" : "Complete onboarding" },
          { label: "Net Worth",     val: fmt(netWorth, true),                            color: netWorth >= 0 ? "#10b981" : "#ef4444", sub: "Assets 鈥?debt" },
          { label: "Investable",    val: fmt(investable, true),                          color: "#10b981", sub: "All accounts" },
          { label: "Annual Savings",val: fmt(annualSavings),                             color: annualSavings > 0 ? "#111827" : "#ef4444", sub: `${savingsRate.toFixed(0)}% rate` },
          { label: "Progress",      val: `${progress.toFixed(0)}%`,                      color: progress >= 75 ? "#10b981" : progress >= 40 ? "#16a34a" : "#111827", sub: "To FIRE" },
        ].map(k => (
          <div key={k.label} className="uf-card" style={{ padding: "14px 16px" }}>
            <div style={{ fontSize: 10, color: "#6b7280", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "DM Mono, monospace", marginBottom: 6 }}>{k.label}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: k.color, fontFamily: "DM Mono, monospace" }}>{k.val}</div>
            {k.sub && <div style={{ fontSize: 11, color: "#6b7280", marginTop: 3 }}>{k.sub}</div>}
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="uf-card" style={{ padding: "16px 22px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Investable Assets 鈫?FIRE Target</span>
          <span style={{ fontFamily: "DM Mono, monospace", fontSize: 13, color: "#16a34a" }}>{progress.toFixed(1)}%</span>
        </div>
        <div style={{ height: 8, background: "#e5e7eb", borderRadius: 99, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg, #10b981, #16a34a)", borderRadius: 99, transition: "width 0.8s cubic-bezier(0.34,1.56,0.64,1)" }} />
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
          <div style={{ color: "#6b7280", fontSize: 13, textAlign: "center", padding: "72px 0" }}>
            Add onboarding data to render this chart safely.
          </div>
        ) : chartTab === "growth" ? (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="gI2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gT2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#16a34a" stopOpacity={0.12} />
                  <stop offset="100%" stopColor="#16a34a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#dbe4dd" />
              <XAxis dataKey="year" tickFormatter={v => `Yr ${v}`} tick={{ fill: "#6b7280", fontSize: 10, fontFamily: "DM Mono" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => fmt(v, true)} tick={{ fill: "#6b7280", fontSize: 10, fontFamily: "DM Mono" }} axisLine={false} tickLine={false} width={58} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="FIRE Target" stroke="#16a34a" strokeWidth={1.5} strokeDasharray="5 3" fill="url(#gT2)" dot={false} />
              <Area type="monotone" dataKey="Investable" stroke="#10b981" strokeWidth={2.5} fill="url(#gI2)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        ) : null}

        {chartData.length > 0 && chartTab === "accounts" && (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                {[["g401c","#818cf8"],["gRothc","#10b981"],["gTaxc","#a78bfa"]].map(([id, c]) => (
                  <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={c} stopOpacity={0.45} />
                    <stop offset="100%" stopColor={c} stopOpacity={0.04} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#dbe4dd" />
              <XAxis dataKey="year" tickFormatter={v => `Yr ${v}`} tick={{ fill: "#6b7280", fontSize: 10, fontFamily: "DM Mono" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => fmt(v, true)} tick={{ fill: "#6b7280", fontSize: 10, fontFamily: "DM Mono" }} axisLine={false} tickLine={false} width={58} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, fontFamily: "DM Mono", color: "#6b7280", paddingTop: 10 }} />
              <Area type="monotone" dataKey="401(k)" stroke="#818cf8" strokeWidth={2} fill="url(#g401c)" dot={false} stackId="a" />
              <Area type="monotone" dataKey="Roth IRA" stroke="#10b981" strokeWidth={2} fill="url(#gRothc)" dot={false} stackId="a" />
              <Area type="monotone" dataKey="Taxable" stroke="#a78bfa" strokeWidth={2} fill="url(#gTaxc)" dot={false} stackId="a" />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {chartData.length > 0 && chartTab === "networth" && (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#dbe4dd" />
              <XAxis dataKey="year" tickFormatter={v => `Yr ${v}`} tick={{ fill: "#6b7280", fontSize: 10, fontFamily: "DM Mono" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => fmt(v, true)} tick={{ fill: "#6b7280", fontSize: 10, fontFamily: "DM Mono" }} axisLine={false} tickLine={false} width={58} />
              <Tooltip content={<ChartTooltip />} />
              <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="3 3" />
              <Line type="monotone" dataKey="Net Worth" stroke="#16a34a" strokeWidth={2.5} dot={false} />
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

// 鈹€鈹€鈹€ Expenses Tab 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
const EXP_CATEGORIES = [
  { key: "food", label: "馃崝 Food & Dining", color: "#16a34a" },
  { key: "transport", label: "馃殫 Transport", color: "#10b981" },
  { key: "housing", label: "馃彔 Housing", color: "#818cf8" },
  { key: "subscriptions", label: "馃摫 Subscriptions", color: "#a78bfa" },
  { key: "healthcare", label: "馃彞 Healthcare", color: "#ef4444" },
  { key: "entertainment", label: "馃幀 Entertainment", color: "#fbbf24" },
  { key: "shopping", label: "馃泹锔?Shopping", color: "#ec4899" },
  { key: "work", label: "馃捈 Work Expense", color: "#6366f1" },
  { key: "other", label: "馃摝 Other", color: "#6b6b85" },
];

const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "AUD", "CAD", "SGD", "HKD"];

type ExpenseRecord = {
  id: string;
  date: string;
  amount: number;
  currency: string;
  description: string;
  category: string;
  tags: string[];
  is_work_related: boolean;
};

const expFmt = (n: number, currency = "USD") => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n);
};

async function aiCategorize(description: string): Promise<{ category: string; tags: string[]; is_work_related: boolean }> {
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 200,
        messages: [{
          role: "user",
          content: `Categorize this expense and respond ONLY with valid JSON, no markdown, no explanation:
Description: "${description}"

Categories: food, transport, housing, subscriptions, healthcare, entertainment, shopping, work, other

Respond with exactly this JSON format:
{"category": "food", "tags": ["lunch", "restaurant"], "is_work_related": false}

Rules:
- tags: 1-3 short descriptive tags
- is_work_related: true if this could be a work expense (lunch on weekday, commute, office supplies, etc)
- Pick the most specific category`
        }]
      })
    });
    const data = await response.json();
    const text = data.content[0].text.trim();
    return JSON.parse(text);
  } catch {
    return { category: "other", tags: [], is_work_related: false };
  }
}

function MonthlySummary({ expenses }: { expenses: ExpenseRecord[] }) {
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthExpenses = expenses.filter(e => e.date.startsWith(thisMonth));
  const total = monthExpenses.reduce((s, e) => s + e.amount, 0);
  const workTotal = monthExpenses.filter(e => e.is_work_related).reduce((s, e) => s + e.amount, 0);

  const byCat = EXP_CATEGORIES.map(cat => ({
    ...cat,
    total: monthExpenses.filter(e => e.category === cat.key).reduce((s, e) => s + e.amount, 0)
  })).filter(c => c.total > 0).sort((a, b) => b.total - a.total);

  if (monthExpenses.length === 0) return null;

  return (
    <div className="uf-card" style={{ marginBottom: 24 }}>
      <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>
        馃搳 {now.toLocaleDateString('en-US', { month: 'long' })} Summary
      </div>
      <div style={{ display: "grid", gridTemplateColumns: workTotal > 0 ? "1fr 1fr 1fr" : "1fr 1fr", gap: 16, marginBottom: 20 }}>
        <div style={{ background: "#f8fafc", borderRadius: 12, padding: "14px 16px" }}>
          <div style={{ color: "#6b7280", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Total Spent</div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 24, fontWeight: 700, color: "#ef4444" }}>{expFmt(total)}</div>
        </div>
        <div style={{ background: "#f8fafc", borderRadius: 12, padding: "14px 16px" }}>
          <div style={{ color: "#6b7280", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Transactions</div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 24, fontWeight: 700, color: "#111827" }}>{monthExpenses.length}</div>
        </div>
        {workTotal > 0 && (
          <div style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 12, padding: "14px 16px" }}>
            <div style={{ color: "#6366f1", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>馃捈 Work Costs</div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 24, fontWeight: 700, color: "#6366f1" }}>{expFmt(workTotal)}</div>
          </div>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {byCat.map(cat => (
          <div key={cat.key}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
              <span>{cat.label}</span>
              <span style={{ color: cat.color, fontFamily: "'DM Mono', monospace", fontWeight: 600 }}>{expFmt(cat.total)} <span style={{ color: "#6b7280" }}>({((cat.total / total) * 100).toFixed(0)}%)</span></span>
            </div>
            <div style={{ height: 4, background: "#dbe4dd", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(cat.total / total) * 100}%`, background: cat.color, borderRadius: 4 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AddExpenseForm({ onAdd }: { onAdd: (e: ExpenseRecord) => void }) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isWorkRelated, setIsWorkRelated] = useState(false);
  const [categorizing, setCategorizing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [aiUsed, setAiUsed] = useState(false);

  const handleDescriptionBlur = async () => {
    if (!description || category) return;
    setCategorizing(true);
    const result = await aiCategorize(description);
    setCategory(result.category);
    setTags(result.tags);
    setIsWorkRelated(result.is_work_related);
    setAiUsed(true);
    setCategorizing(false);
  };

  const handleSubmit = async () => {
    if (!date || !amount || !description) return;
    setSaving(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    let finalCategory = category;
    let finalTags = tags;
    let finalWorkRelated = isWorkRelated;

    if (!finalCategory) {
      const result = await aiCategorize(description);
      finalCategory = result.category;
      finalTags = result.tags;
      finalWorkRelated = result.is_work_related;
    }

    const { data, error } = await supabase.from('expenses').insert({
      user_id: session.user.id,
      date,
      amount: parseFloat(amount),
      currency,
      description,
      category: finalCategory,
      tags: finalTags,
      is_work_related: finalWorkRelated,
    }).select().single();

    if (!error && data) {
      onAdd(data);
      setAmount("");
      setDescription("");
      setCategory("");
      setTags([]);
      setIsWorkRelated(false);
      setAiUsed(false);
    }
    setSaving(false);
  };

  const catInfo = EXP_CATEGORIES.find(c => c.key === category);

  return (
    <div className="uf-card" style={{ marginBottom: 24 }}>
      <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 20 }}>鉃?Add Expense</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
        <div>
          <div style={{ color: "#6b7280", fontSize: 12, marginBottom: 6 }}>Date</div>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            style={{ width: "100%", background: "#f8fafc", border: "1px solid #dbe4dd", borderRadius: 8, padding: "8px 12px", color: "#111827", fontSize: 14, outline: "none", fontFamily: "inherit" }} />
        </div>
        <div>
          <div style={{ color: "#6b7280", fontSize: 12, marginBottom: 6 }}>Amount</div>
          <input type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)}
            style={{ width: "100%", background: "#f8fafc", border: "1px solid #dbe4dd", borderRadius: 8, padding: "8px 12px", color: "#111827", fontSize: 14, outline: "none", fontFamily: "'DM Mono', monospace" }} />
        </div>
        <div>
          <div style={{ color: "#6b7280", fontSize: 12, marginBottom: 6 }}>Currency</div>
          <select value={currency} onChange={e => setCurrency(e.target.value)}
            style={{ width: "100%", background: "#f8fafc", border: "1px solid #dbe4dd", borderRadius: 8, padding: "8px 12px", color: "#111827", fontSize: 14, outline: "none", fontFamily: "inherit" }}>
            {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ color: "#6b7280", fontSize: 12, marginBottom: 6 }}>
          Description
          {categorizing && <span style={{ color: "#16a34a", marginLeft: 8, fontSize: 11 }}>鉁?AI categorizing...</span>}
          {aiUsed && !categorizing && <span style={{ color: "#10b981", marginLeft: 8, fontSize: 11 }}>鉁?AI categorized</span>}
        </div>
        <input type="text" placeholder="e.g. Starbucks latte, Uber to office, Netflix..."
          value={description} onChange={e => { setDescription(e.target.value); setAiUsed(false); setCategory(""); }}
          onBlur={handleDescriptionBlur}
          style={{ width: "100%", background: "#f8fafc", border: "1px solid #dbe4dd", borderRadius: 8, padding: "10px 12px", color: "#111827", fontSize: 14, outline: "none", fontFamily: "inherit" }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        <div>
          <div style={{ color: "#6b7280", fontSize: 12, marginBottom: 6 }}>Category</div>
          <select value={category} onChange={e => setCategory(e.target.value)}
            style={{ width: "100%", background: "#f8fafc", border: `1px solid ${catInfo ? catInfo.color + '66' : '#dbe4dd'}`, borderRadius: 8, padding: "8px 12px", color: catInfo ? catInfo.color : "#111827", fontSize: 14, outline: "none", fontFamily: "inherit" }}>
            <option value="">Select category...</option>
            {EXP_CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <div style={{ color: "#6b7280", fontSize: 12, marginBottom: 6 }}>Tags</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", minHeight: 38, alignItems: "center", background: "#f8fafc", border: "1px solid #dbe4dd", borderRadius: 8, padding: "6px 12px" }}>
            {tags.length === 0 ? <span style={{ color: "#6b7280", fontSize: 13 }}>AI will suggest tags</span> :
              tags.map(t => <span key={t} style={{ background: "rgba(249,115,22,0.15)", color: "#16a34a", borderRadius: 4, padding: "2px 8px", fontSize: 12 }}>#{t}</span>)}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: isWorkRelated ? "#6366f1" : "#6b7280" }}>
          <input type="checkbox" checked={isWorkRelated} onChange={e => setIsWorkRelated(e.target.checked)}
            style={{ accentColor: "#6366f1" }} />
          馃捈 Work expense
        </label>
        <button onClick={handleSubmit} disabled={saving || !amount || !description}
          style={{ background: "#16a34a", color: "#fff", border: "none", borderRadius: 10, padding: "10px 28px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Syne', sans-serif", opacity: saving || !amount || !description ? 0.5 : 1 }}>
          {saving ? "Saving..." : "Add expense"}
        </button>
      </div>
    </div>
  );
}

function ExpenseList({ expenses, onDelete }: { expenses: ExpenseRecord[]; onDelete: (id: string) => void }) {
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
        <div style={{ fontSize: 40, marginBottom: 16 }}>馃搵</div>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>No expenses yet</div>
        <div style={{ color: "#6b7280", fontSize: 14 }}>Add your first expense above 鈥?AI will categorize it automatically</div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {months.map(month => {
        const monthExpenses = grouped[month];
        const total = monthExpenses.reduce((s, e) => s + e.amount, 0);
        const workTotal = monthExpenses.filter(e => e.is_work_related).reduce((s, e) => s + e.amount, 0);
        const date = new Date(month + '-01');
        const monthLabel = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        return (
          <div key={month}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{monthLabel}</div>
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                {workTotal > 0 && (
                  <span style={{ color: "#6366f1", fontSize: 12, fontWeight: 600 }}>
                    馃捈 Work: {expFmt(workTotal)}
                  </span>
                )}
                <span style={{ fontFamily: "'DM Mono', monospace", color: "#16a34a", fontWeight: 700 }}>
                  {expFmt(total)}
                </span>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {monthExpenses.sort((a, b) => b.date.localeCompare(a.date)).map(expense => {
                const cat = EXP_CATEGORIES.find(c => c.key === expense.category);
                return (
                  <div key={expense.id} className="uf-card" style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: `${cat?.color || '#6b6b85'}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                      {cat?.label.split(' ')[0] || '馃摝'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>{expense.description}</div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        <span style={{ color: cat?.color || '#6b6b85', fontSize: 11, fontWeight: 600 }}>{cat?.label || expense.category}</span>
                        {expense.is_work_related && <span style={{ background: "rgba(99,102,241,0.15)", color: "#6366f1", borderRadius: 4, padding: "1px 6px", fontSize: 11 }}>馃捈 work</span>}
                        {expense.tags?.map(t => <span key={t} style={{ background: "rgba(249,115,22,0.1)", color: "#16a34a", borderRadius: 4, padding: "1px 6px", fontSize: 11 }}>#{t}</span>)}
                        <span style={{ color: "#6b7280", fontSize: 11 }}>{new Date(expense.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontFamily: "'DM Mono', monospace", fontWeight: 700, fontSize: 15 }}>{expFmt(expense.amount, expense.currency)}</div>
                      <button onClick={() => onDelete(expense.id)}
                        style={{ background: "none", border: "none", color: "#6b7280", fontSize: 11, cursor: "pointer", marginTop: 4 }}>
                        delete
                      </button>
                    </div>
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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return;
      supabase.from('expenses').select('*').eq('user_id', session.user.id)
        .order('date', { ascending: false })
        .then(({ data }) => {
          if (data) setExpensesList(data);
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

  if (loading) {
    return <div style={{ textAlign: "center", padding: "60px 0", color: "#6b7280" }}>Loading expenses...</div>;
  }

  return (
    <>
      <MonthlySummary expenses={expensesList} />
      <AddExpenseForm onAdd={handleAdd} />
      <ExpenseList expenses={expensesList} onDelete={handleDelete} />
    </>
  );
}

// 鈹€鈹€鈹€ User Nav 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
function UserNav() {
  const [email, setEmail] = useState<string | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setEmail(user?.email ?? null));
  }, []);
  const handleSignOut = async () => { await supabase.auth.signOut(); window.location.href = "/"; };

  if (!email) return (
    <Link href="/login" style={{ background: "#16a34a", color: "#fff", borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>Sign In</Link>
  );
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{ color: "#6b7280", fontSize: 13 }}>{email}</span>
      <button onClick={handleSignOut} style={{ background: "transparent", color: "#16a34a", border: "1px solid #16a34a", borderRadius: 8, padding: "7px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Sign Out</button>
    </div>
  );
}

// 鈹€鈹€鈹€ Root 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
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
    if (t && ["dashboard", "budget", "fire", "expenses"].includes(t)) setTab(t);
  }, []);

  // 鈹€鈹€鈹€ Helpers to apply a flat UntilFireInputs snapshot to all state setters 鈹€鈹€
  function applyBudgetInputs(s: Partial<UntilFireInputs>) {
    if (typeof s.income === "number") setIncome(s.income);
    setExpenses({ ...DEFAULT_INPUTS.expenses, ...s.expenses });
    setK401(s.k401 ?? 0);
    setRothIRA(s.rothIRA ?? 0);
    setTaxable(s.taxable ?? 0);
    setTotalDebt(s.totalDebt ?? 0);
    setMortgageBalance(s.mortgageBalance ?? 0);
    setMortgageMonthly(s.mortgageMonthly ?? 0);
    setGrowthRate(s.growthRate ?? 0.07);
    setWithdrawalRate(s.withdrawalRate ?? 0.04);
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
    let cancelled = false;

    async function hydrateDashboard() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = "/login";
        return;
      }

      console.log("[UntilFire] FireUserState priority", FIRE_USER_STATE_PRIORITY);

      const nowD = new Date();
      const thisMonth = `${nowD.getFullYear()}-${String(nowD.getMonth() + 1).padStart(2, '0')}`;
      supabase.from("expenses").select("category, amount")
        .eq("user_id", session.user.id)
        .like("date", `${thisMonth}-%`)
        .then(({ data: expData }) => {
          if (cancelled || !expData) return;
          const agg: Record<string, number> = {};
          expData.forEach(e => { agg[e.category] = (agg[e.category] || 0) + e.amount; });
          setActuals(agg);
        });

      const { data } = await supabase.from("user_budget").select("*").eq("user_id", session.user.id).single();

      let backendInputs: Partial<UntilFireInputs> | null = null;
      if (data) {
        const raw = data.expenses || {};
        const fp  = raw._fire_profile || {};
        const { _fire_profile: _, ...budgetExpenses } = raw;

        backendInputs = {
          income:         data.income || 0,
          expenses:       { ...DEFAULT_INPUTS.expenses, ...budgetExpenses },
          fireAge:        data.fire_age || 30,
          k401:           fp.k401 || data.fire_assets || 0,
          rothIRA:        fp.rothIRA || 0,
          taxable:        fp.taxable || 0,
          totalDebt:      fp.totalDebt || 0,
          mortgageBalance:fp.mortgageBalance || 0,
          mortgageMonthly:fp.mortgageMonthly || 0,
          growthRate:     fp.growthRate || 0.07,
          withdrawalRate: fp.withdrawalRate || 0.04,
        };
      }

      const fireUserData = resolveFireUserState(backendInputs);
      console.log("[UntilFire] dashboard resolved FIRE state", fireUserData);

      if (!fireUserData?.hasCompletedOnboarding) {
        if (!onboardingRedirected.current) {
          onboardingRedirected.current = true;
          window.location.replace("/");
        }
        return;
      }

      if (cancelled) return;

      setFireAge(fireUserData.age ?? 30);
      setBaselineFireTarget(fireUserData.fireNumber);
      setAdjustedFireTarget(undefined);

      if (backendInputs) {
        applyBudgetInputs(backendInputs);
      } else {
        setIncome(typeof fireUserData.income === "number" ? fireUserData.income : fireUserData.income.monthlyIncome);
      }

      setOnboardingGateReady(true);
      isLoaded.current = true;
    }

    void hydrateDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  // 鈹€鈹€鈹€ 2. SAVE to Supabase with 1s debounce (authenticated users only) 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
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

  if (!onboardingGateReady) {
    return null;
  }

  const navTabs: { key: TabKey; label: string }[] = [
    { key: "dashboard", label: "Dashboard" },
    { key: "budget",    label: "Budget" },
    { key: "fire",      label: "FIRE Calculator" },
    { key: "expenses",  label: "Expenses" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        body { background: #f8fafc; color: #111827; font-family: 'DM Sans', sans-serif; margin: 0; }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        input[type=range] { -webkit-appearance: none; height: 4px; border-radius: 2px; background: #dbe4dd; outline: none; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: #16a34a; border: 3px solid #f8fafc; cursor: pointer; box-shadow: 0 0 0 2px #16a34a; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }

        .uf-card { background: #ffffff; border: 1px solid #dbe4dd; border-radius: 16px; padding: 20px 24px; box-shadow: 0 14px 35px rgba(15, 23, 42, 0.05); }
        .uf-card-glow { box-shadow: 0 0 0 1px rgba(22,163,74,0.26), 0 18px 36px rgba(22,163,74,0.10); border-color: rgba(22,163,74,0.30) !important; }
        .uf-tag { font-size: 11px; padding: 3px 9px; border-radius: 20px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; }

        .uf-nav { position: sticky; top: 0; z-index: 100; height: 60px; background: rgba(248,250,252,0.94); backdrop-filter: blur(16px); border-bottom: 1px solid #dbe4dd; display: flex; align-items: center; justify-content: space-between; padding: 0 32px; gap: 20px; }
        .uf-logo { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 800; color: #111827; text-decoration: none; letter-spacing: -0.04em; flex-shrink: 0; }
        .uf-logo span { color: #16a34a; }

        .uf-tabs { display: flex; gap: 3px; background: #f1f5f9; border-radius: 10px; padding: 4px; border: 1px solid #dbe4dd; }
        .uf-tab { background: transparent; border: 1px solid transparent; border-radius: 7px; padding: 7px 18px; font-size: 13px; font-weight: 500; color: #6b7280; cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif; white-space: nowrap; }
        .uf-tab:hover { color: #334155; }
        .uf-tab.active { background: #ffffff; border-color: #dbe4dd; color: #111827; font-weight: 600; }
        .uf-tab-link { display: inline-flex; align-items: center; justify-content: center; text-decoration: none; }

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
          <Link href="/learn" className="uf-tab uf-tab-link">Learning Hub</Link>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          {saveStatus === "saving" && <span style={{ color: "#6b7280", fontSize: 12, fontFamily: "DM Mono, monospace" }}>Saving...</span>}
          {saveStatus === "saved"  && <span style={{ color: "#10b981", fontSize: 12, fontFamily: "DM Mono, monospace" }}>Saved</span>}
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
            baselineFireTarget={baselineFireTarget}
            adjustedFireTarget={adjustedFireTarget}
          />
        )}
        {tab === "budget" && (
          <BudgetTab income={income} setIncome={setIncome} expenses={expenses} setExpenses={setExpenses} actuals={actuals} />
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
            adjustedFireTarget={adjustedFireTarget}
            setAdjustedFireTarget={setAdjustedFireTarget}
          />
        )}
        {tab === "expenses" && <ExpensesTab />}
      </div>
    </>
  );
}

