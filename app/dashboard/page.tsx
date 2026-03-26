"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend, ReferenceLine,
  PieChart, Pie, Cell,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────
type Expenses = Record<string, number>;
type TabKey = "dashboard" | "budget" | "fire" | "transactions";

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

const fmtCurrency = (n: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n);

// ─── Transaction Constants ────────────────────────────────────────────────────
const EXPENSE_CATEGORIES = [
  { key: "food",          label: "🍔 Food & Dining",  color: "#f97316" },
  { key: "transport",     label: "🚗 Transport",       color: "#22d3a5" },
  { key: "housing",       label: "🏠 Housing",         color: "#818cf8" },
  { key: "subscriptions", label: "📱 Subscriptions",   color: "#a78bfa" },
  { key: "healthcare",    label: "🏥 Healthcare",      color: "#ef4444" },
  { key: "entertainment", label: "🎬 Entertainment",   color: "#fbbf24" },
  { key: "shopping",      label: "🛍️ Shopping",        color: "#ec4899" },
  { key: "work",          label: "💼 Work Expense",    color: "#6366f1" },
  { key: "other",         label: "📦 Other",           color: "#6b6b85" },
];

const INCOME_CATEGORIES = [
  { key: "salary",       label: "💵 Salary",        color: "#22d3a5" },
  { key: "freelance",    label: "💻 Freelance",      color: "#34d399" },
  { key: "investment",   label: "📈 Investment",     color: "#818cf8" },
  { key: "gift",         label: "🎁 Gift",           color: "#a78bfa" },
  { key: "other_income", label: "📦 Other Income",   color: "#6b6b85" },
];

const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "CNY", "AUD", "CAD", "SGD", "HKD"];

type Transaction = {
  id: string;
  date: string;
  amount: number;
  currency: string;
  description: string;
  category: string;
  tags: string[];
  is_work_related: boolean;
  transaction_type: "expense" | "income";
};

async function aiCategorize(description: string, type: "expense" | "income"): Promise<{ category: string; tags: string[]; is_work_related: boolean }> {
  const categories = type === "income"
    ? "salary, freelance, investment, gift, other_income"
    : "food, transport, housing, subscriptions, healthcare, entertainment, shopping, work, other";
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 200,
        messages: [{
          role: "user",
          content: `Categorize this ${type} transaction and respond ONLY with valid JSON, no markdown:\nDescription: "${description}"\nCategories: ${categories}\nRespond with exactly: {"category": "...", "tags": ["tag1"], "is_work_related": false}\nRules: tags: 1-3 short tags; is_work_related: true only for expense type work items; pick most specific category`,
        }],
      }),
    });
    const data = await response.json();
    return JSON.parse(data.content[0].text.trim());
  } catch {
    return { category: type === "income" ? "other_income" : "other", tags: [], is_work_related: false };
  }
}

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

// ─── Transaction Components ───────────────────────────────────────────────────
function AddTransactionForm({ onAdd }: { onAdd: (t: Transaction) => void }) {
  const [transactionType, setTransactionType] = useState<"expense" | "income">("expense");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isWorkRelated, setIsWorkRelated] = useState(false);
  const [categorizing, setCategorizing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [aiUsed, setAiUsed] = useState(false);

  const categories = transactionType === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const catInfo = categories.find(c => c.key === category);

  const switchType = (t: "expense" | "income") => {
    setTransactionType(t);
    setCategory("");
    setTags([]);
    setIsWorkRelated(false);
    setAiUsed(false);
  };

  const handleDescriptionBlur = async () => {
    if (!description || category) return;
    setCategorizing(true);
    const result = await aiCategorize(description, transactionType);
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
      const result = await aiCategorize(description, transactionType);
      finalCategory = result.category;
      finalTags = result.tags;
      finalWorkRelated = result.is_work_related;
    }

    const { data, error } = await supabase.from("expenses").insert({
      user_id: session.user.id,
      date,
      amount: parseFloat(amount),
      currency,
      description,
      category: finalCategory,
      tags: finalTags,
      is_work_related: finalWorkRelated,
      transaction_type: transactionType,
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

  const isIncome = transactionType === "income";

  return (
    <div className="uf-card" style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ fontWeight: 700, fontSize: 16 }}>➕ Add Transaction</div>
        <div style={{ display: "flex", background: "#0f0f18", borderRadius: 8, padding: 3, gap: 2 }}>
          {(["expense", "income"] as const).map(t => (
            <button key={t} onClick={() => switchType(t)} style={{
              background: transactionType === t ? (t === "income" ? "rgba(34,211,165,0.15)" : "rgba(239,68,68,0.12)") : "transparent",
              border: transactionType === t ? `1px solid ${t === "income" ? "rgba(34,211,165,0.3)" : "rgba(239,68,68,0.25)"}` : "1px solid transparent",
              color: transactionType === t ? (t === "income" ? "#22d3a5" : "#ef4444") : "#5e5e7a",
              borderRadius: 6, padding: "5px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
            }}>
              {t === "expense" ? "💸 Expense" : "📥 Income"}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
        <div>
          <div style={{ color: "#5e5e7a", fontSize: 12, marginBottom: 6 }}>Date</div>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            style={{ width: "100%", background: "#08080e", border: "1px solid #1c1c2e", borderRadius: 8, padding: "8px 12px", color: "#e8e8f2", fontSize: 14, outline: "none", fontFamily: "inherit" }} />
        </div>
        <div>
          <div style={{ color: "#5e5e7a", fontSize: 12, marginBottom: 6 }}>Amount</div>
          <input type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)}
            style={{ width: "100%", background: "#08080e", border: "1px solid #1c1c2e", borderRadius: 8, padding: "8px 12px", color: "#e8e8f2", fontSize: 14, outline: "none", fontFamily: "'DM Mono', monospace" }} />
        </div>
        <div>
          <div style={{ color: "#5e5e7a", fontSize: 12, marginBottom: 6 }}>Currency</div>
          <select value={currency} onChange={e => setCurrency(e.target.value)}
            style={{ width: "100%", background: "#08080e", border: "1px solid #1c1c2e", borderRadius: 8, padding: "8px 12px", color: "#e8e8f2", fontSize: 14, outline: "none", fontFamily: "inherit" }}>
            {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={{ color: "#5e5e7a", fontSize: 12, marginBottom: 6 }}>
          Description
          {categorizing && <span style={{ color: "#f97316", marginLeft: 8, fontSize: 11 }}>✨ AI categorizing...</span>}
          {aiUsed && !categorizing && <span style={{ color: "#22d3a5", marginLeft: 8, fontSize: 11 }}>✨ AI categorized</span>}
        </div>
        <input type="text"
          placeholder={isIncome ? "e.g. Monthly salary, Freelance project, Dividend..." : "e.g. Starbucks latte, Uber to office, Netflix..."}
          value={description} onChange={e => { setDescription(e.target.value); setAiUsed(false); setCategory(""); }}
          onBlur={handleDescriptionBlur}
          style={{ width: "100%", background: "#08080e", border: "1px solid #1c1c2e", borderRadius: 8, padding: "10px 12px", color: "#e8e8f2", fontSize: 14, outline: "none", fontFamily: "inherit" }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        <div>
          <div style={{ color: "#5e5e7a", fontSize: 12, marginBottom: 6 }}>Category</div>
          <select value={category} onChange={e => setCategory(e.target.value)}
            style={{ width: "100%", background: "#08080e", border: `1px solid ${catInfo ? catInfo.color + "66" : "#1c1c2e"}`, borderRadius: 8, padding: "8px 12px", color: catInfo ? catInfo.color : "#e8e8f2", fontSize: 14, outline: "none", fontFamily: "inherit" }}>
            <option value="">Select category...</option>
            {categories.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <div style={{ color: "#5e5e7a", fontSize: 12, marginBottom: 6 }}>Tags</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", minHeight: 38, alignItems: "center", background: "#08080e", border: "1px solid #1c1c2e", borderRadius: 8, padding: "6px 12px" }}>
            {tags.length === 0
              ? <span style={{ color: "#5e5e7a", fontSize: 13 }}>AI will suggest tags</span>
              : tags.map(t => <span key={t} style={{ background: "rgba(249,115,22,0.15)", color: "#f97316", borderRadius: 4, padding: "2px 8px", fontSize: 12 }}>#{t}</span>)}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {!isIncome ? (
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: isWorkRelated ? "#6366f1" : "#5e5e7a" }}>
            <input type="checkbox" checked={isWorkRelated} onChange={e => setIsWorkRelated(e.target.checked)} style={{ accentColor: "#6366f1" }} />
            💼 Work expense
          </label>
        ) : <div />}
        <button onClick={handleSubmit} disabled={saving || !amount || !description}
          style={{ background: isIncome ? "#22d3a5" : "#f97316", color: isIncome ? "#08080e" : "#fff", border: "none", borderRadius: 10, padding: "10px 28px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Syne', sans-serif", opacity: saving || !amount || !description ? 0.5 : 1 }}>
          {saving ? "Saving..." : "Add transaction →"}
        </button>
      </div>
    </div>
  );
}

function TransactionList({ transactions, onDelete }: { transactions: Transaction[]; onDelete: (id: string) => void }) {
  const grouped = transactions.reduce((acc, t) => {
    const month = t.date.slice(0, 7);
    if (!acc[month]) acc[month] = [];
    acc[month].push(t);
    return acc;
  }, {} as Record<string, Transaction[]>);

  const months = Object.keys(grouped).sort().reverse();

  if (transactions.length === 0) {
    return (
      <div className="uf-card" style={{ textAlign: "center", padding: "48px 24px" }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>📋</div>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>No transactions yet</div>
        <div style={{ color: "#5e5e7a", fontSize: 14 }}>Add your first transaction above — AI will categorize it automatically</div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {months.map(month => {
        const monthTxns = grouped[month];
        const income = monthTxns.filter(t => t.transaction_type === "income").reduce((s, t) => s + t.amount, 0);
        const spent = monthTxns.filter(t => t.transaction_type !== "income").reduce((s, t) => s + t.amount, 0);
        const net = income - spent;
        const date = new Date(month + "-01");
        const monthLabel = date.toLocaleDateString("en-US", { month: "long", year: "numeric" });

        return (
          <div key={month}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{monthLabel}</div>
              <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                {income > 0 && <span style={{ fontFamily: "'DM Mono', monospace", color: "#22d3a5", fontSize: 13, fontWeight: 600 }}>+{fmtCurrency(income)}</span>}
                {spent > 0 && <span style={{ fontFamily: "'DM Mono', monospace", color: "#ef4444", fontSize: 13, fontWeight: 600 }}>−{fmtCurrency(spent)}</span>}
                {income > 0 && spent > 0 && (
                  <span style={{ fontFamily: "'DM Mono', monospace", color: net >= 0 ? "#22d3a5" : "#ef4444", fontSize: 13, fontWeight: 700, borderLeft: "1px solid #1c1c2e", paddingLeft: 14 }}>
                    Net {net >= 0 ? "+" : "−"}{fmtCurrency(Math.abs(net))}
                  </span>
                )}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {monthTxns.sort((a, b) => b.date.localeCompare(a.date)).map(txn => {
                const isIncomeTxn = txn.transaction_type === "income";
                const cat = ALL_CATEGORIES.find(c => c.key === txn.category);
                return (
                  <div key={txn.id} className="uf-card" style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: `${cat?.color || "#6b6b85"}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                      {cat?.label.split(" ")[0] || (isIncomeTxn ? "📥" : "📦")}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>{txn.description}</div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        <span style={{ color: cat?.color || "#6b6b85", fontSize: 11, fontWeight: 600 }}>{cat?.label || txn.category}</span>
                        {txn.is_work_related && <span style={{ background: "rgba(99,102,241,0.15)", color: "#6366f1", borderRadius: 4, padding: "1px 6px", fontSize: 11 }}>💼 work</span>}
                        {txn.tags?.map(t => <span key={t} style={{ background: "rgba(249,115,22,0.1)", color: "#f97316", borderRadius: 4, padding: "1px 6px", fontSize: 11 }}>#{t}</span>)}
                        <span style={{ color: "#5e5e7a", fontSize: 11 }}>{new Date(txn.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontFamily: "'DM Mono', monospace", fontWeight: 700, fontSize: 15, color: isIncomeTxn ? "#22d3a5" : "#e8e8f2" }}>
                        {isIncomeTxn ? "+" : ""}{fmtCurrency(txn.amount, txn.currency)}
                      </div>
                      <button onClick={() => onDelete(txn.id)}
                        style={{ background: "none", border: "none", color: "#5e5e7a", fontSize: 11, cursor: "pointer", marginTop: 4 }}>
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

function NetWorthCard({ k401, setK401, taxable, setTaxable, totalDebt, setTotalDebt }: {
  k401: number; setK401: (v: number) => void;
  taxable: number; setTaxable: (v: number) => void;
  totalDebt: number; setTotalDebt: (v: number) => void;
}) {
  const isEmpty = k401 + taxable + totalDebt === 0;
  const [editing, setEditing] = useState(true);
  const [retirement, setRetirement] = useState(k401);
  const [brokerage, setBrokerage] = useState(taxable);
  const [debt, setDebt] = useState(totalDebt);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current && (k401 + taxable + totalDebt > 0)) {
      setRetirement(k401);
      setBrokerage(taxable);
      setDebt(totalDebt);
      setEditing(false);
      initialized.current = true;
    }
  }, [k401, taxable, totalDebt]);

  const investable = k401 + taxable;
  const netWorth = investable - totalDebt;

  const handleSave = () => {
    setK401(retirement);
    setTaxable(brokerage);
    setTotalDebt(debt);
    setEditing(false);
  };

  const inputStyle = {
    width: "100%", background: "#08080e", border: "1px solid #1c1c2e",
    borderRadius: 8, padding: "9px 12px", color: "#e8e8f2",
    fontSize: 14, outline: "none", fontFamily: "'DM Mono', monospace",
  };

  if (editing) {
    return (
      <div className="uf-card" style={{ marginBottom: 24, border: isEmpty ? "1px dashed #2a2a3e" : "1px solid #1c1c2e" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>🏦 Net Worth Snapshot</div>
            <div style={{ color: "#5e5e7a", fontSize: 13 }}>
              {isEmpty
                ? "Tell us where you stand — helps us show your true financial picture alongside cash flow."
                : "Update your balances."}
            </div>
          </div>
          {!isEmpty && (
            <button onClick={() => setEditing(false)} style={{ background: "none", border: "none", color: "#5e5e7a", fontSize: 13, cursor: "pointer" }}>Cancel</button>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 8 }}>
          <div>
            <div style={{ color: "#5e5e7a", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Retirement Accounts</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#08080e", borderRadius: 8, padding: "9px 12px", border: "1px solid #1c1c2e" }}>
              <span style={{ color: "#5e5e7a", fontSize: 13 }}>$</span>
              <input type="number" placeholder="0" value={retirement || ""} onChange={e => setRetirement(Number(e.target.value))}
                style={{ ...inputStyle, padding: 0, border: "none", background: "none" }} />
            </div>
            <div style={{ color: "#3a3a5a", fontSize: 11, marginTop: 4 }}>401(k), IRA, pension — all brokerages combined</div>
          </div>
          <div>
            <div style={{ color: "#5e5e7a", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Brokerage & Cash</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#08080e", borderRadius: 8, padding: "9px 12px", border: "1px solid #1c1c2e" }}>
              <span style={{ color: "#5e5e7a", fontSize: 13 }}>$</span>
              <input type="number" placeholder="0" value={brokerage || ""} onChange={e => setBrokerage(Number(e.target.value))}
                style={{ ...inputStyle, padding: 0, border: "none", background: "none" }} />
            </div>
            <div style={{ color: "#3a3a5a", fontSize: 11, marginTop: 4 }}>Taxable brokerage + savings accounts</div>
          </div>
          <div>
            <div style={{ color: "#5e5e7a", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Total Debt</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#08080e", borderRadius: 8, padding: "9px 12px", border: "1px solid #1c1c2e" }}>
              <span style={{ color: "#5e5e7a", fontSize: 13 }}>$</span>
              <input type="number" placeholder="0" value={debt || ""} onChange={e => setDebt(Number(e.target.value))}
                style={{ ...inputStyle, padding: 0, border: "none", background: "none" }} />
            </div>
            <div style={{ color: "#3a3a5a", fontSize: 11, marginTop: 4 }}>Credit cards, loans, mortgage balance</div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
          <div style={{ color: "#5e5e7a", fontSize: 12 }}>
            Net worth = <span style={{ color: (retirement + brokerage - debt) >= 0 ? "#22d3a5" : "#ef4444", fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>
              {(retirement + brokerage - debt) >= 0 ? "" : "−"}{fmtCurrency(Math.abs(retirement + brokerage - debt))}
            </span>
          </div>
          <button onClick={handleSave}
            style={{ background: "#f97316", color: "#fff", border: "none", borderRadius: 10, padding: "10px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Syne', sans-serif" }}>
            Save snapshot →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="uf-card" style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 16 }}>🏦 Net Worth</div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Link href="/dashboard?tab=fire" style={{ color: "#5e5e7a", fontSize: 12, textDecoration: "none" }}>Full breakdown →</Link>
          <button onClick={() => setEditing(true)} style={{ background: "#1c1c2e", border: "none", color: "#9090a8", borderRadius: 6, padding: "4px 12px", fontSize: 12, cursor: "pointer" }}>Edit</button>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <div style={{ background: "#08080e", borderRadius: 12, padding: "14px 16px" }}>
          <div style={{ color: "#5e5e7a", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Investable</div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 22, fontWeight: 700, color: "#22d3a5" }}>{fmtCurrency(investable)}</div>
          <div style={{ color: "#3a3a5a", fontSize: 11, marginTop: 3 }}>Retirement + brokerage</div>
        </div>
        <div style={{ background: "#08080e", borderRadius: 12, padding: "14px 16px" }}>
          <div style={{ color: "#5e5e7a", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Total Debt</div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 22, fontWeight: 700, color: "#ef4444" }}>{fmtCurrency(totalDebt)}</div>
          <div style={{ color: "#3a3a5a", fontSize: 11, marginTop: 3 }}>Loans + mortgage</div>
        </div>
        <div style={{
          background: netWorth >= 0 ? "rgba(34,211,165,0.06)" : "rgba(239,68,68,0.06)",
          border: `1px solid ${netWorth >= 0 ? "rgba(34,211,165,0.2)" : "rgba(239,68,68,0.2)"}`,
          borderRadius: 12, padding: "14px 16px",
        }}>
          <div style={{ color: "#5e5e7a", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Net Worth</div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 22, fontWeight: 700, color: netWorth >= 0 ? "#22d3a5" : "#ef4444" }}>
            {netWorth >= 0 ? "" : "−"}{fmtCurrency(Math.abs(netWorth))}
          </div>
          <div style={{ color: "#3a3a5a", fontSize: 11, marginTop: 3 }}>Assets minus debt</div>
        </div>
      </div>
    </div>
  );
}

function TransactionSummary({
  transactions, viewMonth, onPrevMonth, onNextMonth, budgetExpenses,
}: {
  transactions: Transaction[];
  viewMonth: string;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  budgetExpenses: Record<string, number> | null;
}) {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const isCurrentMonth = viewMonth === currentMonth;
  const [y, m] = viewMonth.split("-").map(Number);
  const monthLabel = new Date(y, m - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const monthTxns = transactions.filter(t => t.date.startsWith(viewMonth));
  const incomeTotal = monthTxns.filter(t => t.transaction_type === "income").reduce((s, t) => s + t.amount, 0);
  const expenseTotal = monthTxns.filter(t => t.transaction_type !== "income").reduce((s, t) => s + t.amount, 0);
  const net = incomeTotal - expenseTotal;
  const workTotal = monthTxns.filter(t => t.is_work_related).reduce((s, t) => s + t.amount, 0);

  const byCat = EXPENSE_CATEGORIES.map(cat => ({
    ...cat,
    total: monthTxns.filter(t => t.transaction_type !== "income" && t.category === cat.key).reduce((s, t) => s + t.amount, 0),
  })).filter(c => c.total > 0).sort((a, b) => b.total - a.total);

  return (
    <div className="uf-card" style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ fontWeight: 700, fontSize: 16 }}>📊 {monthLabel}</div>
        <div style={{ display: "flex", gap: 4 }}>
          <button onClick={onPrevMonth}
            style={{ background: "#1c1c2e", border: "none", color: "#e8e8f2", borderRadius: 6, padding: "4px 12px", cursor: "pointer", fontSize: 16, lineHeight: 1 }}>←</button>
          <button onClick={onNextMonth} disabled={isCurrentMonth}
            style={{ background: "#1c1c2e", border: "none", color: isCurrentMonth ? "#3a3a5a" : "#e8e8f2", borderRadius: 6, padding: "4px 12px", cursor: isCurrentMonth ? "default" : "pointer", fontSize: 16, lineHeight: 1 }}>→</button>
        </div>
      </div>

      {monthTxns.length === 0 ? (
        <div style={{ textAlign: "center", padding: "32px 0", color: "#5e5e7a", fontSize: 14 }}>No transactions for this month</div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: workTotal > 0 ? "1fr 1fr 1fr 1fr" : "1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
            <div style={{ background: "#08080e", borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ color: "#5e5e7a", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Income</div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 22, fontWeight: 700, color: "#22d3a5" }}>{fmtCurrency(incomeTotal)}</div>
            </div>
            <div style={{ background: "#08080e", borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ color: "#5e5e7a", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Spent</div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 22, fontWeight: 700, color: "#ef4444" }}>{fmtCurrency(expenseTotal)}</div>
            </div>
            <div style={{ background: net >= 0 ? "rgba(34,211,165,0.06)" : "rgba(239,68,68,0.06)", border: `1px solid ${net >= 0 ? "rgba(34,211,165,0.2)" : "rgba(239,68,68,0.2)"}`, borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ color: "#5e5e7a", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Net</div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 22, fontWeight: 700, color: net >= 0 ? "#22d3a5" : "#ef4444" }}>
                {net >= 0 ? "+" : "−"}{fmtCurrency(Math.abs(net))}
              </div>
            </div>
            {workTotal > 0 && (
              <div style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 12, padding: "14px 16px" }}>
                <div style={{ color: "#6366f1", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>💼 Work</div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 22, fontWeight: 700, color: "#6366f1" }}>{fmtCurrency(workTotal)}</div>
              </div>
            )}
          </div>

          {byCat.length > 0 && (
            <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
              <div style={{ flexShrink: 0 }}>
                <ResponsiveContainer width={176} height={176}>
                  <PieChart>
                    <Pie data={byCat} cx="50%" cy="50%" innerRadius={52} outerRadius={80} paddingAngle={2} dataKey="total">
                      {byCat.map(cat => <Cell key={cat.key} fill={cat.color} />)}
                    </Pie>
                    <Tooltip
                      formatter={(v: number) => [fmtCurrency(v), ""]}
                      contentStyle={{ background: "#1a1a2e", border: "1px solid #1c1c2e", borderRadius: 8, fontFamily: "DM Mono, monospace", fontSize: 12 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10, paddingTop: 4 }}>
                {byCat.map(cat => {
                  const budget = budgetExpenses?.[cat.key] || 0;
                  const over = budget > 0 && cat.total > budget;
                  const barPct = budget > 0 ? Math.min(100, (cat.total / budget) * 100) : (cat.total / expenseTotal) * 100;
                  return (
                    <div key={cat.key}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
                        <span style={{ color: "#9090a8" }}>{cat.label}</span>
                        <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 600, color: over ? "#ef4444" : cat.color }}>
                          {fmtCurrency(cat.total)}
                          {budget > 0
                            ? <span style={{ color: "#5e5e7a", fontWeight: 400 }}> / {fmtCurrency(budget)}</span>
                            : <span style={{ color: "#5e5e7a", fontWeight: 400 }}> ({((cat.total / expenseTotal) * 100).toFixed(0)}%)</span>
                          }
                        </span>
                      </div>
                      <div style={{ height: 4, background: "#1c1c2e", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${barPct}%`, background: over ? "#ef4444" : cat.color, borderRadius: 4, transition: "width 0.4s" }} />
                      </div>
                      {over && <div style={{ fontSize: 11, color: "#ef4444", marginTop: 2 }}>over by {fmtCurrency(cat.total - budget)}</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function TransactionTab({
  transactions, setTransactions, viewMonth, setViewMonth,
  budgetExpenses, k401, setK401, taxable, setTaxable,
  totalDebt, setTotalDebt, onTransactionAdded,
}: {
  transactions: Transaction[];
  setTransactions: (updater: (prev: Transaction[]) => Transaction[]) => void;
  viewMonth: string;
  setViewMonth: (v: string) => void;
  budgetExpenses: Expenses;
  k401: number; setK401: (v: number) => void;
  taxable: number; setTaxable: (v: number) => void;
  totalDebt: number; setTotalDebt: (v: number) => void;
  onTransactionAdded: (t: Transaction) => void;
}) {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const handlePrevMonth = () => {
    const [y, m] = viewMonth.split("-").map(Number);
    const d = new Date(y, m - 2, 1);
    setViewMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  };
  const handleNextMonth = () => {
    const [y, m] = viewMonth.split("-").map(Number);
    const d = new Date(y, m, 1);
    const next = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (next <= currentMonth) setViewMonth(next);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this transaction?")) return;
    await supabase.from("expenses").delete().eq("id", id);
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div>
      <NetWorthCard k401={k401} setK401={setK401} taxable={taxable} setTaxable={setTaxable} totalDebt={totalDebt} setTotalDebt={setTotalDebt} />
      <TransactionSummary
        transactions={transactions}
        viewMonth={viewMonth}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        budgetExpenses={budgetExpenses}
      />
      <AddTransactionForm onAdd={onTransactionAdded} />
      <TransactionList transactions={transactions} onDelete={handleDelete} />
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

  // Read initial tab from URL query string (e.g. ?tab=budget)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("tab") as TabKey | null;
    if (t && ["dashboard", "budget", "fire", "transactions"].includes(t)) setTab(t);
  }, []);

  // Transaction state
  const nowTxn = new Date();
  const currentMonthTxn = `${nowTxn.getFullYear()}-${String(nowTxn.getMonth() + 1).padStart(2, "0")}`;
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [viewMonth,    setViewMonth]    = useState(currentMonthTxn);

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
      supabase.from("expenses").select("*")
        .eq("user_id", session.user.id)
        .order("date", { ascending: false })
        .then(({ data }) => { if (data) setTransactions(data as Transaction[]); });
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

  const handleTransactionAdded = (txn: Transaction) => {
    setTransactions(prev => [txn, ...prev]);
    const nowD = new Date();
    const tm = `${nowD.getFullYear()}-${String(nowD.getMonth() + 1).padStart(2, "0")}`;
    if (txn.transaction_type !== "income" && txn.date.startsWith(tm)) {
      setActuals(prev => ({ ...prev, [txn.category]: (prev[txn.category] || 0) + txn.amount }));
    }
  };

  const navTabs: { key: TabKey; label: string }[] = [
    { key: "dashboard",    label: "📊 Overview" },
    { key: "budget",       label: "💰 Budget" },
    { key: "fire",         label: "🔥 FIRE Calculator" },
    { key: "transactions", label: "💳 Transactions" },
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
        {tab === "transactions" && (
          <TransactionTab
            transactions={transactions} setTransactions={setTransactions}
            viewMonth={viewMonth} setViewMonth={setViewMonth}
            budgetExpenses={expenses}
            k401={k401} setK401={setK401}
            taxable={taxable} setTaxable={setTaxable}
            totalDebt={totalDebt} setTotalDebt={setTotalDebt}
            onTransactionAdded={handleTransactionAdded}
          />
        )}
      </div>
    </>
  );
}
