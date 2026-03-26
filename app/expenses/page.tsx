"use client";

import { useState, useEffect } from "react";
import { supabase } from '@/lib/supabase';
import Link from "next/link";
import { PieChart, Pie, Cell, Tooltip as ChartTooltip, ResponsiveContainer } from "recharts";

const CATEGORIES = [
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

const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "AUD", "CAD", "SGD", "HKD"];

const fmt = (n: number, currency = "USD") => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n);
};

type Expense = {
  id: string;
  date: string;
  amount: number;
  currency: string;
  description: string;
  category: string;
  tags: string[];
  is_work_related: boolean;
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

function UserNav() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setEmail(user?.email ?? null);
    });
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  if (!email) return <Link href="/login" style={{ background: "#f97316", color: "#fff", borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>Sign In</Link>;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{ color: "#5e5e7a", fontSize: 13 }}>{email}</span>
      <button onClick={handleSignOut} style={{ background: "transparent", color: "#f97316", border: "1px solid #f97316", borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Sign Out</button>
    </div>
  );
}

function AddExpenseForm({ onAdd }: { onAdd: (e: Expense) => void }) {
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

  const catInfo = CATEGORIES.find(c => c.key === category);

  return (
    <div className="uf-card" style={{ marginBottom: 24 }}>
      <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 20 }}>➕ Add Expense</div>
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
        <input type="text" placeholder="e.g. Starbucks latte, Uber to office, Netflix..."
          value={description} onChange={e => { setDescription(e.target.value); setAiUsed(false); setCategory(""); }}
          onBlur={handleDescriptionBlur}
          style={{ width: "100%", background: "#08080e", border: "1px solid #1c1c2e", borderRadius: 8, padding: "10px 12px", color: "#e8e8f2", fontSize: 14, outline: "none", fontFamily: "inherit" }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        <div>
          <div style={{ color: "#5e5e7a", fontSize: 12, marginBottom: 6 }}>Category</div>
          <select value={category} onChange={e => setCategory(e.target.value)}
            style={{ width: "100%", background: "#08080e", border: `1px solid ${catInfo ? catInfo.color + '66' : '#1c1c2e'}`, borderRadius: 8, padding: "8px 12px", color: catInfo ? catInfo.color : "#e8e8f2", fontSize: 14, outline: "none", fontFamily: "inherit" }}>
            <option value="">Select category...</option>
            {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <div style={{ color: "#5e5e7a", fontSize: 12, marginBottom: 6 }}>Tags</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", minHeight: 38, alignItems: "center", background: "#08080e", border: "1px solid #1c1c2e", borderRadius: 8, padding: "6px 12px" }}>
            {tags.length === 0 ? <span style={{ color: "#5e5e7a", fontSize: 13 }}>AI will suggest tags</span> :
              tags.map(t => <span key={t} style={{ background: "rgba(249,115,22,0.15)", color: "#f97316", borderRadius: 4, padding: "2px 8px", fontSize: 12 }}>#{t}</span>)}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: isWorkRelated ? "#6366f1" : "#5e5e7a" }}>
          <input type="checkbox" checked={isWorkRelated} onChange={e => setIsWorkRelated(e.target.checked)}
            style={{ accentColor: "#6366f1" }} />
          💼 Work expense
        </label>
        <button onClick={handleSubmit} disabled={saving || !amount || !description}
          style={{ background: "#f97316", color: "#fff", border: "none", borderRadius: 10, padding: "10px 28px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Syne', sans-serif", opacity: saving || !amount || !description ? 0.5 : 1 }}>
          {saving ? "Saving..." : "Add expense →"}
        </button>
      </div>
    </div>
  );
}

function ExpenseList({ expenses, onDelete }: { expenses: Expense[]; onDelete: (id: string) => void }) {
  const grouped = expenses.reduce((acc, e) => {
    const month = e.date.slice(0, 7);
    if (!acc[month]) acc[month] = [];
    acc[month].push(e);
    return acc;
  }, {} as Record<string, Expense[]>);

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
                    💼 Work: {fmt(workTotal)}
                  </span>
                )}
                <span style={{ fontFamily: "'DM Mono', monospace", color: "#f97316", fontWeight: 700 }}>
                  {fmt(total)}
                </span>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {monthExpenses.sort((a, b) => b.date.localeCompare(a.date)).map(expense => {
                const cat = CATEGORIES.find(c => c.key === expense.category);
                return (
                  <div key={expense.id} className="uf-card" style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: `${cat?.color || '#6b6b85'}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                      {cat?.label.split(' ')[0] || '📦'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>{expense.description}</div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        <span style={{ color: cat?.color || '#6b6b85', fontSize: 11, fontWeight: 600 }}>{cat?.label || expense.category}</span>
                        {expense.is_work_related && <span style={{ background: "rgba(99,102,241,0.15)", color: "#6366f1", borderRadius: 4, padding: "1px 6px", fontSize: 11 }}>💼 work</span>}
                        {expense.tags?.map(t => <span key={t} style={{ background: "rgba(249,115,22,0.1)", color: "#f97316", borderRadius: 4, padding: "1px 6px", fontSize: 11 }}>#{t}</span>)}
                        <span style={{ color: "#5e5e7a", fontSize: 11 }}>{new Date(expense.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontFamily: "'DM Mono', monospace", fontWeight: 700, fontSize: 15 }}>{fmt(expense.amount, expense.currency)}</div>
                      <button onClick={() => onDelete(expense.id)}
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

function MonthlySummary({
  expenses,
  viewMonth,
  onPrevMonth,
  onNextMonth,
  budgetExpenses,
}: {
  expenses: Expense[];
  viewMonth: string;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  budgetExpenses: Record<string, number> | null;
}) {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const isCurrentMonth = viewMonth === currentMonth;
  const [y, m] = viewMonth.split('-').map(Number);
  const monthLabel = new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const monthExpenses = expenses.filter(e => e.date.startsWith(viewMonth));
  const total = monthExpenses.reduce((s, e) => s + e.amount, 0);
  const workTotal = monthExpenses.filter(e => e.is_work_related).reduce((s, e) => s + e.amount, 0);

  const byCat = CATEGORIES.map(cat => ({
    ...cat,
    total: monthExpenses.filter(e => e.category === cat.key).reduce((s, e) => s + e.amount, 0)
  })).filter(c => c.total > 0).sort((a, b) => b.total - a.total);

  return (
    <div className="uf-card" style={{ marginBottom: 24 }}>
      {/* Header with month nav */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ fontWeight: 700, fontSize: 16 }}>📊 {monthLabel}</div>
        <div style={{ display: "flex", gap: 4 }}>
          <button onClick={onPrevMonth}
            style={{ background: "#1c1c2e", border: "none", color: "#e8e8f2", borderRadius: 6, padding: "4px 12px", cursor: "pointer", fontSize: 16, lineHeight: 1 }}>←</button>
          <button onClick={onNextMonth} disabled={isCurrentMonth}
            style={{ background: "#1c1c2e", border: "none", color: isCurrentMonth ? "#3a3a5a" : "#e8e8f2", borderRadius: 6, padding: "4px 12px", cursor: isCurrentMonth ? "default" : "pointer", fontSize: 16, lineHeight: 1 }}>→</button>
        </div>
      </div>

      {monthExpenses.length === 0 ? (
        <div style={{ textAlign: "center", padding: "32px 0", color: "#5e5e7a", fontSize: 14 }}>No expenses for this month</div>
      ) : (
        <>
          {/* KPI cards */}
          <div style={{ display: "grid", gridTemplateColumns: workTotal > 0 ? "1fr 1fr 1fr" : "1fr 1fr", gap: 12, marginBottom: 24 }}>
            <div style={{ background: "#08080e", borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ color: "#5e5e7a", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Total Spent</div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 22, fontWeight: 700, color: "#ef4444" }}>{fmt(total)}</div>
            </div>
            <div style={{ background: "#08080e", borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ color: "#5e5e7a", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Transactions</div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 22, fontWeight: 700, color: "#e8e8f2" }}>{monthExpenses.length}</div>
            </div>
            {workTotal > 0 && (
              <div style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 12, padding: "14px 16px" }}>
                <div style={{ color: "#6366f1", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>💼 Work Costs</div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 22, fontWeight: 700, color: "#6366f1" }}>{fmt(workTotal)}</div>
              </div>
            )}
          </div>

          {/* Donut chart + category breakdown */}
          <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
            <div style={{ flexShrink: 0 }}>
              <ResponsiveContainer width={176} height={176}>
                <PieChart>
                  <Pie data={byCat} cx="50%" cy="50%" innerRadius={52} outerRadius={80} paddingAngle={2} dataKey="total">
                    {byCat.map((cat) => <Cell key={cat.key} fill={cat.color} />)}
                  </Pie>
                  <ChartTooltip
                    formatter={(v: number) => [fmt(v), ""]}
                    contentStyle={{ background: "#1a1a2e", border: "1px solid #1c1c2e", borderRadius: 8, fontFamily: "DM Mono, monospace", fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10, paddingTop: 4 }}>
              {byCat.map(cat => {
                const budget = budgetExpenses?.[cat.key] || 0;
                const over = budget > 0 && cat.total > budget;
                const barPct = budget > 0 ? Math.min(100, (cat.total / budget) * 100) : (cat.total / total) * 100;
                return (
                  <div key={cat.key}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
                      <span style={{ color: "#9090a8" }}>{cat.label}</span>
                      <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 600, color: over ? "#ef4444" : cat.color }}>
                        {fmt(cat.total)}
                        {budget > 0
                          ? <span style={{ color: "#5e5e7a", fontWeight: 400 }}> / {fmt(budget)}</span>
                          : <span style={{ color: "#5e5e7a", fontWeight: 400 }}> ({((cat.total / total) * 100).toFixed(0)}%)</span>
                        }
                      </span>
                    </div>
                    <div style={{ height: 4, background: "#1c1c2e", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${barPct}%`, background: over ? "#ef4444" : cat.color, borderRadius: 4, transition: "width 0.4s" }} />
                    </div>
                    {over && <div style={{ fontSize: 11, color: "#ef4444", marginTop: 2 }}>over by {fmt(cat.total - budget)}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [viewMonth, setViewMonth] = useState(currentMonth);
  const [budgetExpenses, setBudgetExpenses] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { window.location.href = '/login'; return; }
      supabase.from('expenses').select('*').eq('user_id', session.user.id)
        .order('date', { ascending: false })
        .then(({ data }) => {
          if (data) setExpenses(data);
          setLoading(false);
        });
      supabase.from('user_budget').select('income, expenses').eq('user_id', session.user.id).maybeSingle()
        .then(({ data }) => {
          if (data?.expenses) {
            const { _fire_profile: _, ...budgetCats } = data.expenses as Record<string, unknown>;
            setBudgetExpenses(budgetCats as Record<string, number>);
          }
        });
    });
  }, []);

  const handleAdd = (expense: Expense) => {
    setExpenses(prev => [expense, ...prev]);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this expense?")) return;
    await supabase.from('expenses').delete().eq('id', id);
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const handlePrevMonth = () => {
    const [y, m] = viewMonth.split('-').map(Number);
    const d = new Date(y, m - 2, 1);
    setViewMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };
  const handleNextMonth = () => {
    const [y, m] = viewMonth.split('-').map(Number);
    const d = new Date(y, m, 1);
    const next = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (next <= currentMonth) setViewMonth(next);
  };

  const tabs = [
    { key: "dashboard", label: "📊 Dashboard", href: "/dashboard" },
    { key: "expenses", label: "💳 Expenses", href: "/expenses" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@500;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        body { background: #08080e; color: #e8e8f2; font-family: 'DM Sans', sans-serif; margin: 0; }
        input::-webkit-inner-spin-button { -webkit-appearance: none; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #1c1c2e; border-radius: 4px; }
        .uf-card { background: #13131e; border: 1px solid #1c1c2e; border-radius: 16px; padding: 20px 24px; box-shadow: 0 2px 20px rgba(0,0,0,0.3); }
        .uf-dash-nav { border-bottom: 1px solid #1c1c2e; padding: 0 32px; display: flex; align-items: center; justify-content: space-between; height: 60px; position: sticky; top: 0; background: rgba(8,8,14,0.95); backdrop-filter: blur(12px); z-index: 50; }
        .uf-logo { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 800; letter-spacing: -0.04em; text-decoration: none; color: #e8e8f2; }
        .uf-logo span { color: #f97316; }
        .uf-tabs { display: flex; gap: 4px; background: #0f0f18; border-radius: 10px; padding: 4px; }
        .uf-tab { background: transparent; border: 1px solid transparent; border-radius: 7px; padding: 6px 16px; font-size: 13px; font-weight: 600; color: #5e5e7a; cursor: pointer; transition: all 0.2s; font-family: inherit; text-decoration: none; display: inline-block; }
        .uf-tab.active { background: #13131e; border-color: #1c1c2e; color: #e8e8f2; }
        .uf-content { max-width: 900px; margin: 0 auto; padding: 32px 24px; }
        select option { background: #13131e; }
        @media(max-width:768px) {
          .uf-dash-nav { padding: 0 16px; }
          .uf-content { padding: 20px 16px; }
        }
      `}</style>

      <nav className="uf-dash-nav">
        <Link href="/" className="uf-logo">Until<span>Fire</span></Link>
        <div className="uf-tabs">
          {tabs.map(t => (
            <Link key={t.key} href={t.href} className={`uf-tab ${t.key === 'expenses' ? 'active' : ''}`}>{t.label}</Link>
          ))}
        </div>
        <UserNav />
      </nav>

      <div className="uf-content">
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#5e5e7a" }}>Loading expenses...</div>
        ) : (
          <>
            <MonthlySummary
              expenses={expenses}
              viewMonth={viewMonth}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
              budgetExpenses={budgetExpenses}
            />
            <AddExpenseForm onAdd={handleAdd} />
            <ExpenseList expenses={expenses} onDelete={handleDelete} />
          </>
        )}
      </div>
    </>
  );
}
