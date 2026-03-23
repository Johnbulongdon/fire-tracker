"use client";

import { useState, useEffect } from "react";
import { supabase } from '@/lib/supabase';
import Link from "next/link";

const fmt = (n: number) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(2)}M` : n >= 1_000 ? `$${(n / 1_000).toFixed(1)}k` : `$${Math.round(n).toLocaleString()}`;

const EXPENSE_CATS = [
  { key: "housing", label: "🏠 Housing", color: "#818cf8" },
  { key: "food", label: "🍔 Food & Dining", color: "#f97316" },
  { key: "transport", label: "🚗 Transport", color: "#22d3a5" },
  { key: "subscriptions", label: "📱 Subscriptions", color: "#a78bfa" },
  { key: "healthcare", label: "🏥 Healthcare", color: "#ef4444" },
  { key: "entertainment", label: "🎬 Entertainment", color: "#fbbf24" },
  { key: "other", label: "📦 Other", color: "#6b6b85" },
];

type Expenses = Record<string, number>;

function NumberInput({ value, onChange, placeholder = "0" }: { value: number; onChange: (v: number) => void; placeholder?: string }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", alignItems: "center", background: "#08080e", border: `1px solid ${focused ? "#f97316" : "#1c1c2e"}`, borderRadius: 8, padding: "8px 12px", gap: 6, transition: "border-color 0.2s" }}>
      <span style={{ color: "#5e5e7a", fontSize: 13 }}>$</span>
      <input
        type="number"
        value={value || ""}
        onChange={(e) => onChange(Number(e.target.value))}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        style={{ background: "none", border: "none", outline: "none", color: "#e8e8f2", fontSize: 14, width: "100%", fontFamily: "'DM Mono', monospace" }}
      />
    </div>
  );
}

function BudgetTab({ income, setIncome, expenses, setExpenses }: { income: number; setIncome: (v: number) => void; expenses: Expenses; setExpenses: (e: Expenses) => void }) {
  const totalExp = Object.values(expenses).reduce((s, v) => s + (v || 0), 0);
  const savings = income - totalExp;
  const savingsRate = income > 0 ? ((savings / income) * 100).toFixed(1) : "0";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="uf-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div><div style={{ fontWeight: 700, fontSize: 16 }}>Monthly Income</div><div style={{ color: "#5e5e7a", fontSize: 12 }}>After-tax take-home</div></div>
          <span className="uf-tag" style={{ color: "#22d3a5", background: "rgba(34,211,165,0.1)" }}>INCOME</span>
        </div>
        <NumberInput value={income} onChange={setIncome} placeholder="5000" />
      </div>

      <div className="uf-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div><div style={{ fontWeight: 700, fontSize: 16 }}>Monthly Expenses</div><div style={{ color: "#5e5e7a", fontSize: 12 }}>Break it down by category</div></div>
          <span className="uf-tag" style={{ color: "#ef4444", background: "rgba(239,68,68,0.1)" }}>EXPENSES</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {EXPENSE_CATS.map((cat) => (
            <div key={cat.key} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 150, color: "#5e5e7a", fontSize: 13 }}>{cat.label}</div>
              <div style={{ flex: 1 }}>
                <NumberInput value={expenses[cat.key] || 0} onChange={(v) => setExpenses({ ...expenses, [cat.key]: v })} />
              </div>
              {(expenses[cat.key] || 0) > 0 && (
                <div style={{ width: 60, height: 4, borderRadius: 4, background: "#1c1c2e", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.min(100, ((expenses[cat.key] || 0) / (income || 1)) * 100)}%`, background: cat.color, borderRadius: 4, transition: "width 0.4s" }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {income > 0 && (
        <div className="uf-card" style={{ background: savings > 0 ? "rgba(34,211,165,0.04)" : "rgba(239,68,68,0.04)", border: `1px solid ${savings > 0 ? "rgba(34,211,165,0.2)" : "rgba(239,68,68,0.2)"}` }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            <div><div style={{ color: "#5e5e7a", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Total Expenses</div><div style={{ color: "#ef4444", fontSize: 24, fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>{fmt(totalExp)}</div></div>
            <div><div style={{ color: "#5e5e7a", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Monthly Savings</div><div style={{ color: "#22d3a5", fontSize: 24, fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>{fmt(Math.max(0, savings))}</div></div>
            <div><div style={{ color: "#5e5e7a", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Savings Rate</div><div style={{ color: Number(savingsRate) >= 50 ? "#f97316" : Number(savingsRate) >= 25 ? "#22d3a5" : "#ef4444", fontSize: 24, fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>{savingsRate}%</div><div style={{ color: "#5e5e7a", fontSize: 12 }}>{Number(savingsRate) >= 50 ? "🔥 FIRE pace" : Number(savingsRate) >= 25 ? "Good progress" : "Needs work"}</div></div>
          </div>
        </div>
      )}
    </div>
  );
}

function FIRETab({ income, expenses }: { income: number; expenses: Expenses }) {
  const totalExp = Object.values(expenses).reduce((s, v) => s + (v || 0), 0);
  const autoSavings = Math.max(0, income - totalExp);
  const [age, setAge] = useState(30);
  const [assets, setAssets] = useState(0);
  const [monthlySpend, setMonthlySpend] = useState(totalExp);
  const [monthlyContrib, setMonthlyContrib] = useState(autoSavings);

  const fireTarget = monthlySpend * 12 * 25;
  const rate = 0.08 / 12;
  let months = 0;
  let balance = assets;
  while (balance < fireTarget && months < 960) { balance = balance * (1 + rate) + monthlyContrib; months++; }
  const fireAge = months < 960 ? age + Math.floor(months / 12) : null;
  const progress = fireTarget > 0 ? Math.min(100, (assets / fireTarget) * 100) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {totalExp > 0 && (
        <div style={{ background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.25)", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#f97316", display: "flex", gap: 10 }}>
          <span>⚡</span><span><strong>Auto-filled from your budget</strong> — monthly spending {fmt(totalExp)} and savings {fmt(autoSavings)} imported.</span>
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {[
          { label: "Current Age", value: age, onChange: setAge, placeholder: "30" },
          { label: "Current Invested Assets", value: assets, onChange: setAssets, placeholder: "50000" },
          { label: "Monthly Spend", value: monthlySpend, onChange: setMonthlySpend, placeholder: String(totalExp || 3000) },
          { label: "Monthly Investment", value: monthlyContrib, onChange: setMonthlyContrib, placeholder: String(autoSavings || 1000) },
        ].map((f) => (
          <div key={f.label} className="uf-card">
            <div style={{ color: "#5e5e7a", fontSize: 12, marginBottom: 8 }}>{f.label}</div>
            <NumberInput value={f.value} onChange={f.onChange} placeholder={f.placeholder} />
          </div>
        ))}
      </div>

      {fireAge && (
        <div className="uf-card" style={{ background: "linear-gradient(135deg, #13131e, #1a1205)", border: "1px solid rgba(249,115,22,0.3)", boxShadow: "0 0 40px rgba(249,115,22,0.1)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 24, alignItems: "center" }}>
            <div>
              <div style={{ color: "#5e5e7a", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>🔥 Your FIRE Date</div>
              <div style={{ color: "#f97316", fontSize: 56, fontWeight: 800, fontFamily: "'DM Mono', monospace", lineHeight: 1 }}>Age {fireAge}</div>
              <div style={{ color: "#5e5e7a", fontSize: 13, marginTop: 6 }}>{Math.floor(months / 12)} years {months % 12} months to go</div>
            </div>
            <div><div style={{ color: "#5e5e7a", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>FIRE Target</div><div style={{ fontSize: 20, fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>{fmt(fireTarget)}</div></div>
            <div><div style={{ color: "#5e5e7a", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Annual Spend</div><div style={{ fontSize: 20, fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>{fmt(monthlySpend * 12)}</div></div>
          </div>
          <div style={{ marginTop: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#5e5e7a", marginBottom: 6 }}>
              <span>Progress to FIRE</span><span>{progress.toFixed(1)}%</span>
            </div>
            <div style={{ height: 6, background: "#1c1c2e", borderRadius: 6, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg, #f97316, #22d3a5)", borderRadius: 6, transition: "width 0.6s" }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DashTab({ income, expenses }: { income: number; expenses: Expenses }) {
  const totalExp = Object.values(expenses).reduce((s, v) => s + (v || 0), 0);
  const savings = income - totalExp;
  const savingsRate = income > 0 ? (savings / income) * 100 : 0;
  const fireTarget = totalExp * 12 * 25;
  const activeCats = EXPENSE_CATS.filter((c) => (expenses[c.key] || 0) > 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        {[
          { label: "Monthly Income", value: fmt(income), color: "#22d3a5", sub: "after tax" },
          { label: "Monthly Savings", value: fmt(Math.max(0, savings)), color: "#f97316", sub: `${savingsRate.toFixed(1)}% rate` },
          { label: "FIRE Target", value: fmt(fireTarget), color: "#818cf8", sub: "25x annual spend" },
          { label: "Monthly Expenses", value: fmt(totalExp), color: "#e8e8f2", sub: "total outgoing" },
        ].map((kpi) => (
          <div key={kpi.label} className="uf-card">
            <div style={{ color: "#5e5e7a", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{kpi.label}</div>
            <div style={{ color: kpi.color, fontSize: 24, fontWeight: 700, fontFamily: "'DM Mono', monospace", lineHeight: 1.1 }}>{kpi.value}</div>
            <div style={{ color: "#5e5e7a", fontSize: 12, marginTop: 4 }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>
        <div className="uf-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontWeight: 700 }}>Savings Rate</div>
            <span className="uf-tag" style={{ color: "#818cf8", background: "rgba(129,140,248,0.1)" }}>PROGRESS</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {[25, 50, 75, 100].map((m) => (
              <div key={m} style={{ flex: 1, background: savingsRate >= m ? "rgba(249,115,22,0.1)" : "#08080e", border: `1px solid ${savingsRate >= m ? "#f97316" : "#1c1c2e"}`, borderRadius: 8, padding: "8px 12px", textAlign: "center", fontSize: 11, color: savingsRate >= m ? "#f97316" : "#5e5e7a", transition: "all 0.3s" }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{m}%</div>
                <div>{["Starter", "Halfway", "Almost", "FIRE!🔥"][m / 25 - 1]}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, height: 8, background: "#1c1c2e", borderRadius: 8, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.min(100, savingsRate)}%`, background: "linear-gradient(90deg, #f97316, #22d3a5)", borderRadius: 8, transition: "width 0.6s" }} />
          </div>
        </div>

        <div className="uf-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontWeight: 700 }}>Spending Breakdown</div>
            <span className="uf-tag" style={{ color: "#ef4444", background: "rgba(239,68,68,0.1)" }}>MONTHLY</span>
          </div>
          {activeCats.length === 0 ? (
            <div style={{ color: "#5e5e7a", fontSize: 13, textAlign: "center", padding: "20px 0" }}>Add expenses in Budget Tracker</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {activeCats.map((cat) => {
                const val = expenses[cat.key] || 0;
                const pct = totalExp > 0 ? (val / totalExp) * 100 : 0;
                return (
                  <div key={cat.key}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                      <span>{cat.label}</span>
                      <span style={{ color: cat.color, fontFamily: "'DM Mono', monospace" }}>{fmt(val)} <span style={{ color: "#5e5e7a" }}>({pct.toFixed(0)}%)</span></span>
                    </div>
                    <div style={{ height: 4, background: "#1c1c2e", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: cat.color, borderRadius: 4, transition: "width 0.5s" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="uf-card">
        <div style={{ fontWeight: 700, marginBottom: 16 }}>💡 Personalized Insights</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {[
            { icon: "📊", title: "Savings Rate", body: savingsRate >= 50 ? `${savingsRate.toFixed(0)}% savings rate puts you on an aggressive FIRE track.` : savingsRate >= 25 ? `${savingsRate.toFixed(0)}% is solid. Hitting 50% would cut years off your FIRE date.` : `At ${savingsRate.toFixed(0)}%, your FIRE date is far out. Reducing expenses has the biggest impact.`, color: savingsRate >= 50 ? "#22d3a5" : savingsRate >= 25 ? "#f97316" : "#ef4444" },
            { icon: "🏠", title: "Housing Ratio", body: income > 0 && expenses.housing > 0 ? `Housing is ${(((expenses.housing || 0) / income) * 100).toFixed(0)}% of income. ${(expenses.housing || 0) / income > 0.3 ? "Above 30% — your biggest lever." : "Under 30% — doing well here."}` : "Enter your housing cost to see your ratio.", color: "#e8e8f2" },
            { icon: "🔥", title: "Rule of 25", body: `You need ${fmt(fireTarget)} to retire. Every $100/mo you cut reduces your target by $30k.`, color: "#e8e8f2" },
          ].map((i) => (
            <div key={i.title} style={{ background: "#08080e", border: "1px solid #1c1c2e", borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ fontSize: 20, marginBottom: 8 }}>{i.icon}</div>
              <div style={{ color: i.color, fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{i.title}</div>
              <div style={{ color: "#5e5e7a", fontSize: 12, lineHeight: 1.5 }}>{i.body}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function UserNav() {
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setEmail(user?.email ?? null)
    })
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (!email) {
    return <Link href="/login" style={{ background: "#f97316", color: "#fff", borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>Sign In</Link>
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{ color: "#5e5e7a", fontSize: 13 }}>{email}</span>
      <button onClick={handleSignOut} style={{ background: "transparent", color: "#f97316", border: "1px solid #f97316", borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Sign Out</button>
    </div>
  )
}

export default function Dashboard() {
  const [tab, setTab] = useState<"dashboard" | "budget" | "fire">("budget");
  const [income, setIncome] = useState(7000);
  const [expenses, setExpenses] = useState<Expenses>({ housing: 1800, food: 600, transport: 400, subscriptions: 150, healthcare: 200, entertainment: 200, other: 150 });

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        await new Promise(resolve => setTimeout(resolve, 500))
        const { data: { session: session2 } } = await supabase.auth.getSession()
        if (!session2) {
          window.location.href = '/login'
        }
      }
    }
    checkSession()
  }, [])

  const tabs = [
    { key: "dashboard", label: "📊 Dashboard" },
    { key: "budget", label: "💰 Budget Tracker" },
    { key: "fire", label: "🔥 FIRE Calculator" },
  ] as const;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@500;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        body { background: #08080e; color: #e8e8f2; font-family: 'DM Sans', sans-serif; margin: 0; }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #1c1c2e; border-radius: 4px; }

        .uf-card { background: #13131e; border: 1px solid #1c1c2e; border-radius: 16px; padding: 20px 24px; box-shadow: 0 2px 20px rgba(0,0,0,0.3); }
        .uf-tag { font-size: 11px; padding: 2px 8px; border-radius: 20px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; }
        .uf-dash-nav { border-bottom: 1px solid #1c1c2e; padding: 0 32px; display: flex; align-items: center; justify-content: space-between; height: 60px; position: sticky; top: 0; background: rgba(8,8,14,0.95); backdrop-filter: blur(12px); z-index: 50; }
        .uf-logo { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 800; letter-spacing: -0.04em; text-decoration: none; color: #e8e8f2; }
        .uf-logo span { color: #f97316; }
        .uf-tabs { display: flex; gap: 4px; background: #0f0f18; border-radius: 10px; padding: 4px; }
        .uf-tab { background: transparent; border: 1px solid transparent; border-radius: 7px; padding: 6px 16px; font-size: 13px; font-weight: 600; color: #5e5e7a; cursor: pointer; transition: all 0.2s; font-family: inherit; }
        .uf-tab.active { background: #13131e; border-color: #1c1c2e; color: #e8e8f2; }
        .uf-content { max-width: 900px; margin: 0 auto; padding: 32px 24px; }

        @media(max-width:768px) {
          .uf-dash-nav { padding: 0 16px; }
          .uf-content { padding: 20px 16px; }
        }
      `}</style>

      <nav className="uf-dash-nav">
        <Link href="/" className="uf-logo">Until<span>Fire</span></Link>
        <div className="uf-tabs">
          {tabs.map((t) => (
            <button key={t.key} className={`uf-tab ${tab === t.key ? "active" : ""}`} onClick={() => setTab(t.key)}>{t.label}</button>
          ))}
        </div>
        <UserNav />
      </nav>

      <div className="uf-content">
        {tab === "budget" && <BudgetTab income={income} setIncome={setIncome} expenses={expenses} setExpenses={setExpenses} />}
        {tab === "fire" && <FIRETab income={income} expenses={expenses} />}
        {tab === "dashboard" && <DashTab income={income} expenses={expenses} />}
      </div>
    </>
  );
}
