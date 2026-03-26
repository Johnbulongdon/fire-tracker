"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend, ReferenceLine,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────
type Expenses = Record<string, number>;
type TabKey = "dashboard" | "budget" | "fire";

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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        <KpiCard label="Net Worth" value={fmt(netWorth, true)} color={netWorth >= 0 ? "#22d3a5" : "#ef4444"} sub="Assets minus all debt" />
        <KpiCard label="FIRE Target" value={fmt(fireTarget, true)} sub={`${(withdrawalRate * 100).toFixed(0)}% withdrawal rule`} />
        <KpiCard label="FIRE Date" value={fireYear ? `${fireYear} yrs` : "50+ yrs"} color="#f97316" sub={fireYear ? `~${new Date().getFullYear() + fireYear}` : "Adjust inputs"} glow={!!fireYear} />
        <KpiCard label="Savings Rate" value={`${savingsRate.toFixed(0)}%`} color={savingsRate >= 50 ? "#f97316" : savingsRate >= 25 ? "#22d3a5" : "#ef4444"} sub={savingsRate >= 50 ? "🔥 FIRE pace" : savingsRate >= 25 ? "Good progress" : "Needs work"} />
      </div>

      {/* Progress bar */}
      <div className="uf-card" style={{ padding: "18px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>Progress to FIRE</span>
          <span style={{ fontFamily: "DM Mono, monospace", fontSize: 13, color: "#f97316" }}>{fmt(investable, true)} / {fmt(fireTarget, true)}</span>
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
              <CartesianGrid strokeDasharray="3 3" stroke="#1c1c2e" />
              <XAxis dataKey="year" tickFormatter={v => `Yr ${v}`} tick={{ fill: "#5e5e7a", fontSize: 10, fontFamily: "DM Mono" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => fmt(v, true)} tick={{ fill: "#5e5e7a", fontSize: 10, fontFamily: "DM Mono" }} axisLine={false} tickLine={false} width={55} />
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
                body: `Target: ${fmt(fireTarget, true)}. Every $100/mo you cut reduces your FIRE number by $30k.`,
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
          { label: "FIRE Date",     val: fireYear ? `${fireYear} yrs` : "50+ yrs",      color: "#f97316", sub: fireYear ? `Age ${retireAge}` : "" },
          { label: "FIRE Target",   val: fmt(fireTarget, true),                          color: "#e8e8f2", sub: `${(withdrawalRate*100).toFixed(0)}% rule` },
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
              <CartesianGrid strokeDasharray="3 3" stroke="#1c1c2e" />
              <XAxis dataKey="year" tickFormatter={v => `Yr ${v}`} tick={{ fill: "#5e5e7a", fontSize: 10, fontFamily: "DM Mono" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => fmt(v, true)} tick={{ fill: "#5e5e7a", fontSize: 10, fontFamily: "DM Mono" }} axisLine={false} tickLine={false} width={58} />
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
              <CartesianGrid strokeDasharray="3 3" stroke="#1c1c2e" />
              <XAxis dataKey="year" tickFormatter={v => `Yr ${v}`} tick={{ fill: "#5e5e7a", fontSize: 10, fontFamily: "DM Mono" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => fmt(v, true)} tick={{ fill: "#5e5e7a", fontSize: 10, fontFamily: "DM Mono" }} axisLine={false} tickLine={false} width={58} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, fontFamily: "DM Mono", color: "#5e5e7a", paddingTop: 10 }} />
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
              <CartesianGrid strokeDasharray="3 3" stroke="#1c1c2e" />
              <XAxis dataKey="year" tickFormatter={v => `Yr ${v}`} tick={{ fill: "#5e5e7a", fontSize: 10, fontFamily: "DM Mono" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => fmt(v, true)} tick={{ fill: "#5e5e7a", fontSize: 10, fontFamily: "DM Mono" }} axisLine={false} tickLine={false} width={58} />
              <Tooltip content={<ChartTooltip />} />
              <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="3 3" />
              {fireYear && <ReferenceLine x={fireYear} stroke="#f97316" strokeDasharray="4 3" label={{ value: "🔥 FIRE", fill: "#f97316", fontSize: 10, fontFamily: "DM Mono" }} />}
              <Line type="monotone" dataKey="Net Worth" stroke="#f97316" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="Debt" stroke="#ef4444" strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}

        <p style={{ textAlign: "center", fontSize: 11, color: "#3a3a5a", marginTop: 10 }}>
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
      <span style={{ color: "#5e5e7a", fontSize: 13 }}>{email}</span>
      <button onClick={handleSignOut} style={{ background: "transparent", color: "#f97316", border: "1px solid #f97316", borderRadius: 8, padding: "7px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Sign Out</button>
    </div>
  );
}

// ─── Root ────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [tab, setTab] = useState<TabKey>("dashboard");

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
        if (data) {
          setIncome(data.income || 0);
          const raw = data.expenses || {};
          const fp  = raw._fire_profile || {};
          const { _fire_profile: _, ...budgetExpenses } = raw;
          setExpenses({ housing: 0, food: 0, transport: 0, subscriptions: 0, healthcare: 0, entertainment: 0, other: 0, ...budgetExpenses });
          setFireAge(data.fire_age || 30);
          // New FIRE profile fields (fall back to 0 if first load)
          setK401(fp.k401 || data.fire_assets || 0);
          setRothIRA(fp.rothIRA || 0);
          setTaxable(fp.taxable || 0);
          setTotalDebt(fp.totalDebt || 0);
          setMortgageBalance(fp.mortgageBalance || 0);
          setMortgageMonthly(fp.mortgageMonthly || 0);
          setGrowthRate(fp.growthRate || 0.07);
          setWithdrawalRate(fp.withdrawalRate || 0.04);
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
    { key: "dashboard", label: "📊 Overview" },
    { key: "budget",    label: "💰 Budget" },
    { key: "fire",      label: "🔥 FIRE Calculator" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        body { background: #08080e; color: #e8e8f2; font-family: 'DM Sans', sans-serif; margin: 0; }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        input[type=range] { -webkit-appearance: none; height: 4px; border-radius: 2px; background: #1c1c2e; outline: none; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: #f97316; border: 3px solid #08080e; cursor: pointer; box-shadow: 0 0 0 2px #f97316; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #1c1c2e; border-radius: 4px; }

        .uf-card { background: #13131e; border: 1px solid #1c1c2e; border-radius: 16px; padding: 20px 24px; }
        .uf-card-glow { box-shadow: 0 0 0 1px rgba(249,115,22,0.3), 0 0 24px rgba(249,115,22,0.08); border-color: rgba(249,115,22,0.35) !important; }
        .uf-tag { font-size: 11px; padding: 3px 9px; border-radius: 20px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; }

        .uf-nav { position: sticky; top: 0; z-index: 100; height: 60px; background: rgba(8,8,14,0.96); backdrop-filter: blur(16px); border-bottom: 1px solid #1c1c2e; display: flex; align-items: center; justify-content: space-between; padding: 0 32px; gap: 20px; }
        .uf-logo { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 800; color: #e8e8f2; text-decoration: none; letter-spacing: -0.04em; flex-shrink: 0; }
        .uf-logo span { color: #f97316; }

        .uf-tabs { display: flex; gap: 3px; background: #0b0b14; border-radius: 10px; padding: 4px; }
        .uf-tab { background: transparent; border: 1px solid transparent; border-radius: 7px; padding: 7px 18px; font-size: 13px; font-weight: 500; color: #5e5e7a; cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif; white-space: nowrap; }
        .uf-tab:hover { color: #9090a8; }
        .uf-tab.active { background: #13131e; border-color: #1c1c2e; color: #e8e8f2; font-weight: 600; }

        .uf-content { max-width: 1100px; margin: 0 auto; padding: 32px 24px 60px; }

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
          <Link href="/expenses" className="uf-tab">💳 Expenses</Link>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          {saveStatus === "saving" && <span style={{ color: "#5e5e7a", fontSize: 12, fontFamily: "DM Mono, monospace" }}>Saving…</span>}
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
          />
        )}
      </div>
    </>
  );
}
