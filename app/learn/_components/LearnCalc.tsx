"use client";

import { useState, useMemo } from "react";

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

const fmt = (n: number) =>
  "$" + Math.round(n).toLocaleString("en-US");

const fmtShort = (n: number) => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return fmt(n);
};

function calcYearsToFire(
  annualSavings: number,
  annualExpenses: number,
  currentSavings = 0,
  growthRate = 0.07
): number {
  const target = annualExpenses * 25;
  if (annualSavings <= 0) return 65;
  let bal = currentSavings;
  let yrs = 0;
  while (bal < target && yrs < 65) {
    bal = bal * (1 + growthRate) + annualSavings;
    yrs++;
  }
  return yrs;
}

function calcCoastFire(
  currentAge: number,
  retireAge: number,
  annualExpenses: number,
  growthRate = 0.07
): number {
  const target = annualExpenses * 25;
  const years = retireAge - currentAge;
  return target / Math.pow(1 + growthRate, years);
}

// ── Input component ──────────────────────────────────────────────────────────
function Inp({
  label,
  value,
  onChange,
  prefix = "$",
  suffix = "",
  min = 0,
  max = 10_000_000,
  step = 1000,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        {prefix && (
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.muted, fontSize: 14 }}>
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
            background: C.bg,
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            padding: prefix ? "10px 12px 10px 28px" : "10px 12px",
            color: C.text,
            fontSize: 15,
            fontFamily: "inherit",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
        {suffix && (
          <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: C.muted, fontSize: 13 }}>
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Stat card ────────────────────────────────────────────────────────────────
function Stat({ label, value, color = C.accent, sub }: { label: string; value: string; color?: string; sub?: string }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "20px 24px" }}>
      <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color, letterSpacing: "-0.02em" }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MODE: standard — "How long until I can retire?"
// ════════════════════════════════════════════════════════════════════════════
export function StandardCalc({
  defaultIncome = 100_000,
  defaultExpenses = 48_000,
  defaultSavings = 0,
  title = "Your FIRE Calculator",
}: {
  defaultIncome?: number;
  defaultExpenses?: number;
  defaultSavings?: number;
  title?: string;
}) {
  const [income, setIncome] = useState(defaultIncome);
  const [expenses, setExpenses] = useState(defaultExpenses);
  const [currentSavings, setCurrentSavings] = useState(defaultSavings);

  const annualSavings = Math.max(0, income - expenses);
  const fireTarget = expenses * 25;
  const years = calcYearsToFire(annualSavings, expenses, currentSavings);
  const retireYear = new Date().getFullYear() + years;
  const savingsRate = income > 0 ? Math.round((annualSavings / income) * 100) : 0;

  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28, marginBottom: 40 }}>
      <div style={{ fontSize: 13, color: C.accent, fontWeight: 600, marginBottom: 16 }}>{title}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <Inp label="Annual Income" value={income} onChange={setIncome} step={5000} max={2_000_000} />
        <Inp label="Annual Expenses" value={expenses} onChange={setExpenses} step={1000} max={500_000} />
      </div>
      <div style={{ marginBottom: 24 }}>
        <Inp label="Current Savings / Investments" value={currentSavings} onChange={setCurrentSavings} step={5000} max={5_000_000} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        <Stat
          label="FIRE Number"
          value={fmtShort(fireTarget)}
          color={C.teal}
          sub="25× annual expenses"
        />
        <Stat
          label="Years to FIRE"
          value={years >= 65 ? "65+ yrs" : `${years} yr${years !== 1 ? "s" : ""}`}
          color={C.accent}
          sub={years < 65 ? `Retire ~${retireYear}` : "Increase savings rate"}
        />
        <Stat
          label="Savings Rate"
          value={`${savingsRate}%`}
          color={savingsRate >= 50 ? C.teal : savingsRate >= 30 ? C.accent : C.red}
          sub={`${fmt(annualSavings)}/yr saved`}
        />
      </div>
      {annualSavings <= 0 && (
        <div style={{ marginTop: 16, padding: "10px 14px", background: "#1a0a00", border: "1px solid #7c2d12", borderRadius: 8, fontSize: 13, color: "#fb923c" }}>
          ⚠ Your expenses exceed your income — reduce expenses or increase income to begin saving.
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MODE: coast — "How much do I need invested to coast to retirement?"
// ════════════════════════════════════════════════════════════════════════════
export function CoastCalc({
  defaultExpenses = 60_000,
  defaultCurrentAge = 30,
  defaultRetireAge = 60,
  defaultCurrentSavings = 50_000,
}: {
  defaultExpenses?: number;
  defaultCurrentAge?: number;
  defaultRetireAge?: number;
  defaultCurrentSavings?: number;
}) {
  const [expenses, setExpenses] = useState(defaultExpenses);
  const [currentAge, setCurrentAge] = useState(defaultCurrentAge);
  const [retireAge, setRetireAge] = useState(defaultRetireAge);
  const [currentSavings, setCurrentSavings] = useState(defaultCurrentSavings);

  const coastNumber = useMemo(
    () => calcCoastFire(currentAge, retireAge, expenses),
    [currentAge, retireAge, expenses]
  );
  const hasCoasted = currentSavings >= coastNumber;
  const deficit = coastNumber - currentSavings;
  const yearsToCoast = !hasCoasted
    ? calcYearsToFire(Math.max(0, deficit / 10), deficit, currentSavings, 0.07)
    : 0;

  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28, marginBottom: 40 }}>
      <div style={{ fontSize: 13, color: C.accent, fontWeight: 600, marginBottom: 16 }}>Coast FIRE Calculator</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <Inp label="Annual Expenses (Retirement)" value={expenses} onChange={setExpenses} step={1000} max={500_000} />
        <Inp label="Current Savings" value={currentSavings} onChange={setCurrentSavings} step={5000} max={5_000_000} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <Inp label="Current Age" value={currentAge} onChange={setCurrentAge} prefix="" step={1} min={18} max={80} />
        <Inp label="Target Retirement Age" value={retireAge} onChange={setRetireAge} prefix="" step={1} min={currentAge + 5} max={90} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        <Stat
          label="Coast FIRE Number"
          value={fmtShort(coastNumber)}
          color={C.teal}
          sub={`Invest now, coast to ${fmtShort(expenses * 25)}`}
        />
        <Stat
          label="Status"
          value={hasCoasted ? "Coasting! 🏄" : `${fmt(deficit)} to go`}
          color={hasCoasted ? C.teal : C.accent}
          sub={hasCoasted ? "You can stop contributing" : `~${yearsToCoast} yr${yearsToCoast !== 1 ? "s" : ""} of saving`}
        />
        <Stat
          label="FIRE Target"
          value={fmtShort(expenses * 25)}
          color={C.purple}
          sub="At retirement"
        />
      </div>
      {hasCoasted && (
        <div style={{ marginTop: 16, padding: "10px 14px", background: "#001a0f", border: "1px solid #166534", borderRadius: 8, fontSize: 13, color: "#4ade80" }}>
          🎉 You&apos;ve hit Coast FIRE! Your investments will grow to your FIRE target by age {retireAge} even without adding more.
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MODE: savings-rate — "What savings rate do I need?"
// ════════════════════════════════════════════════════════════════════════════
export function SavingsRateCalc({
  defaultIncome = 100_000,
  defaultSavingsRate = 30,
}: {
  defaultIncome?: number;
  defaultSavingsRate?: number;
}) {
  const [income, setIncome] = useState(defaultIncome);
  const [savingsRate, setSavingsRate] = useState(defaultSavingsRate);

  const annualSavings = income * (savingsRate / 100);
  const annualExpenses = income - annualSavings;
  const fireTarget = annualExpenses * 25;
  const years = calcYearsToFire(annualSavings, annualExpenses);

  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28, marginBottom: 40 }}>
      <div style={{ fontSize: 13, color: C.accent, fontWeight: 600, marginBottom: 16 }}>Savings Rate Calculator</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <Inp label="Annual Income" value={income} onChange={setIncome} step={5000} max={2_000_000} />
        <Inp label="Savings Rate" value={savingsRate} onChange={setSavingsRate} prefix="" suffix="%" min={0} max={100} step={5} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        <Stat label="Annual Savings" value={fmtShort(annualSavings)} color={C.teal} sub={`${fmt(annualExpenses)}/yr to live`} />
        <Stat
          label="Years to FIRE"
          value={years >= 65 ? "65+ yrs" : `${years} yr${years !== 1 ? "s" : ""}`}
          color={C.accent}
          sub={`Retire ~${new Date().getFullYear() + years}`}
        />
        <Stat label="FIRE Number" value={fmtShort(fireTarget)} color={C.purple} sub="25× annual spending" />
      </div>

      {/* Comparison table */}
      <div style={{ marginTop: 24, borderTop: `1px solid ${C.border}`, paddingTop: 20 }}>
        <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
          Savings rate vs. years to FIRE
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {[10, 20, 30, 40, 50, 60, 70].map((rate) => {
            const s = income * (rate / 100);
            const e = income - s;
            const y = calcYearsToFire(s, e);
            const isCurrent = rate === savingsRate;
            return (
              <div
                key={rate}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "6px 10px",
                  borderRadius: 6,
                  background: isCurrent ? "#1c1c2e" : "transparent",
                  border: isCurrent ? `1px solid ${C.accent}` : "1px solid transparent",
                }}
              >
                <span style={{ width: 36, fontSize: 12, color: isCurrent ? C.accent : C.muted, fontWeight: isCurrent ? 700 : 400 }}>{rate}%</span>
                <div style={{ flex: 1, background: "#1c1c2e", borderRadius: 4, height: 6, overflow: "hidden" }}>
                  <div style={{ width: `${Math.min(100, (1 - y / 65) * 100)}%`, background: y < 20 ? C.teal : y < 35 ? C.accent : C.red, height: "100%", borderRadius: 4 }} />
                </div>
                <span style={{ width: 60, fontSize: 12, color: isCurrent ? C.text : C.muted, textAlign: "right" }}>
                  {y >= 65 ? "65+ yrs" : `${y} yr${y !== 1 ? "s" : ""}`}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MODE: fire-number — standalone FIRE number widget
// ════════════════════════════════════════════════════════════════════════════
export function FireNumberCalc({
  defaultIncome = 100_000,
  defaultExpenses = 48_000,
  label = "FIRE Number Calculator",
}: {
  defaultIncome?: number;
  defaultExpenses?: number;
  label?: string;
}) {
  const [income, setIncome] = useState(defaultIncome);
  const [expenses, setExpenses] = useState(defaultExpenses);
  const [currentSavings, setCurrentSavings] = useState(0);

  const annualSavings = Math.max(0, income - expenses);
  const fireTarget = expenses * 25;
  const years = calcYearsToFire(annualSavings, expenses, currentSavings);
  const monthsExpenses = expenses / 12;

  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28, marginBottom: 40 }}>
      <div style={{ fontSize: 13, color: C.accent, fontWeight: 600, marginBottom: 16 }}>{label}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <Inp label="Annual Income" value={income} onChange={setIncome} step={5000} max={2_000_000} />
        <Inp label="Annual Expenses" value={expenses} onChange={setExpenses} step={1000} max={500_000} />
      </div>
      <div style={{ marginBottom: 24 }}>
        <Inp label="Current Savings" value={currentSavings} onChange={setCurrentSavings} step={5000} max={5_000_000} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 16 }}>
        <Stat label="Your FIRE Number" value={fmtShort(fireTarget)} color={C.teal} sub="The 25× rule (4% withdrawal)" />
        <Stat
          label="Years to FIRE"
          value={years >= 65 ? "65+ yrs" : `${years} yr${years !== 1 ? "s" : ""}`}
          color={C.accent}
          sub={`Retire ~${new Date().getFullYear() + years}`}
        />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
        <Stat label="Monthly Expenses" value={fmtShort(monthsExpenses)} color={C.muted} sub="What you spend now" />
        <Stat label="Monthly Savings" value={fmtShort(annualSavings / 12)} color={C.purple} sub={`${Math.round((annualSavings / income) * 100)}% savings rate`} />
      </div>
    </div>
  );
}
