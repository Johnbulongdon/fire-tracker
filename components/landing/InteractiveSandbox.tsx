"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";

function calcFire(monthlySavings: number, monthlyExpenses: number, currentPortfolio: number) {
  const withdrawalRate = 0.04;
  const growthRate = 0.07;
  const fireTarget = (monthlyExpenses * 12) / withdrawalRate;
  let port = currentPortfolio;
  for (let y = 1; y <= 60; y++) {
    port = port * (1 + growthRate) + monthlySavings * 12;
    if (port >= fireTarget) return { years: y, fireTarget, finalPort: port };
  }
  return { years: null, fireTarget, finalPort: port };
}

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return "$" + Math.round(n).toLocaleString();
}

function useDebounced<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

// Smooth number display using requestAnimationFrame
function useAnimatedValue(target: number) {
  const [display, setDisplay] = useState(target);
  const ref = useRef<number>(target);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const start = ref.current;
    const diff = target - start;
    const duration = 600;
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = start + diff * ease;
      setDisplay(current);
      ref.current = current;
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target]);

  return display;
}

interface SliderProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  color: string;
}

function Slider({ label, value, onChange, min, max, step, format, color }: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 12, color: "#9090a8", fontFamily: "DM Mono, monospace", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
        <motion.span
          key={value}
          initial={{ scale: 1.15, color }}
          animate={{ scale: 1, color: "#e8e8f2" }}
          transition={{ duration: 0.3 }}
          style={{ fontSize: 14, fontWeight: 700, fontFamily: "DM Mono, monospace", color: "#e8e8f2" }}
        >
          {format(value)}
        </motion.span>
      </div>
      <div style={{ position: "relative" }}>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          style={{ width: "100%", appearance: "none", WebkitAppearance: "none", height: 6, borderRadius: 99, outline: "none", cursor: "pointer",
            background: `linear-gradient(to right, ${color} ${pct}%, #1c1c2e ${pct}%)` }}
        />
      </div>
    </div>
  );
}

interface DeltaCardProps {
  label: string;
  value: number;
  prevValue: number;
  format: (v: number) => string;
  positiveIsGood?: boolean;
}

function DeltaCard({ label, value, prevValue, format, positiveIsGood = true }: DeltaCardProps) {
  const diff = value - prevValue;
  const improved = positiveIsGood ? diff > 0.5 : diff < -0.5;
  const worsened = positiveIsGood ? diff < -0.5 : diff > 0.5;
  const displayVal = useAnimatedValue(value);

  const borderColor = improved ? "rgba(34,211,165,0.3)" : worsened ? "rgba(239,68,68,0.3)" : "#1c1c2e";
  const bgColor = improved ? "rgba(34,211,165,0.05)" : worsened ? "rgba(239,68,68,0.05)" : "#13131e";
  const valueColor = improved ? "#22d3a5" : worsened ? "#ef4444" : "#e8e8f2";

  return (
    <motion.div
      animate={{ borderColor, background: bgColor }}
      transition={{ duration: 0.4 }}
      style={{ background: bgColor, border: `1px solid ${borderColor}`, borderRadius: 12, padding: "16px 18px" }}
    >
      <div style={{ fontSize: 10, color: "#5e5e7a", fontFamily: "DM Mono, monospace", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <motion.span
          animate={{ color: valueColor }}
          transition={{ duration: 0.4 }}
          style={{ fontSize: 22, fontWeight: 700, fontFamily: "DM Mono, monospace" }}
        >
          {format(Math.round(displayVal))}
        </motion.span>
        <AnimatePresence mode="wait">
          {(improved || worsened) && (
            <motion.span
              key={`${improved}-${worsened}`}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              style={{ fontSize: 11, color: improved ? "#22d3a5" : "#ef4444", fontFamily: "DM Mono, monospace" }}
            >
              {improved ? "▲" : "▼"} {Math.abs(diff).toFixed(label.includes("Year") ? 1 : 0)}{label.includes("Year") ? " yrs" : ""}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export function InteractiveSandbox() {
  const [savings, setSavings] = useState(1500);
  const [expenses, setExpenses] = useState(3500);
  const [portfolio, setPortfolio] = useState(50000);

  const dSavings  = useDebounced(savings,   50);
  const dExpenses = useDebounced(expenses, 50);
  const dPortfolio = useDebounced(portfolio, 50);

  const result = calcFire(dSavings, dExpenses, dPortfolio);
  const prevResultRef = useRef(result);
  const [prevResult, setPrevResult] = useState(result);

  useEffect(() => {
    const id = setTimeout(() => {
      setPrevResult(prevResultRef.current);
      prevResultRef.current = result;
    }, 100);
    return () => clearTimeout(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result.years, result.fireTarget]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      style={{ width: "100%", maxWidth: 680, margin: "0 auto", padding: "0 24px 56px" }}
    >
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 11, color: "#f97316", fontFamily: "DM Mono, monospace", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>Interactive</div>
        <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "clamp(24px,4vw,36px)", fontWeight: 800, color: "#e8e8f2", lineHeight: 1.1, letterSpacing: "-0.8px", marginBottom: 8 }}>
          See how every dollar moves your FIRE date
        </h2>
        <p style={{ fontSize: 15, color: "#6e6e8e", lineHeight: 1.6 }}>
          Drag the sliders — your retirement timeline updates instantly.
        </p>
      </div>

      <div style={{ background: "#13131e", border: "1px solid #1c1c2e", borderRadius: 20, padding: "28px 24px", display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Sliders */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Slider label="Monthly savings" value={savings} onChange={setSavings} min={0} max={6000} step={50}
            format={v => `$${v.toLocaleString()}/mo`} color="#22d3a5" />
          <Slider label="Monthly expenses" value={expenses} onChange={setExpenses} min={1000} max={8000} step={50}
            format={v => `$${v.toLocaleString()}/mo`} color="#ef4444" />
          <Slider label="Current portfolio" value={portfolio} onChange={setPortfolio} min={0} max={500000} step={5000}
            format={v => fmt(v)} color="#a78bfa" />
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "#1c1c2e" }} />

        {/* Output cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          <DeltaCard
            label="Years to FIRE"
            value={result.years ?? 60}
            prevValue={prevResult.years ?? 60}
            format={v => v >= 60 ? "60+ yrs" : `${v} yrs`}
            positiveIsGood={false}
          />
          <DeltaCard
            label="FIRE target"
            value={result.fireTarget}
            prevValue={prevResult.fireTarget}
            format={v => fmt(v)}
            positiveIsGood={false}
          />
          <DeltaCard
            label="Annual savings"
            value={savings * 12}
            prevValue={savings * 12}
            format={v => fmt(v)}
            positiveIsGood={true}
          />
        </div>

        {/* Savings rate bar */}
        {(() => {
          const monthlyIncome = savings + expenses;
          const rate = monthlyIncome > 0 ? (savings / monthlyIncome) * 100 : 0;
          const rateColor = rate >= 50 ? "#f97316" : rate >= 25 ? "#22d3a5" : "#ef4444";
          return (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: "#5e5e7a", fontFamily: "DM Mono, monospace", textTransform: "uppercase", letterSpacing: "0.08em" }}>Savings rate</span>
                <motion.span
                  animate={{ color: rateColor }}
                  style={{ fontSize: 12, fontFamily: "DM Mono, monospace", fontWeight: 600 }}
                >
                  {rate.toFixed(0)}% {rate >= 50 ? "🔥 FIRE pace" : rate >= 25 ? "· Good" : "· Needs work"}
                </motion.span>
              </div>
              <div style={{ height: 6, background: "#0f0f18", borderRadius: 99, overflow: "hidden" }}>
                <motion.div
                  animate={{ width: `${Math.min(rate, 100)}%`, background: rateColor }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  style={{ height: "100%", borderRadius: 99 }}
                />
              </div>
            </div>
          );
        })()}
      </div>

      <p style={{ textAlign: "center", fontSize: 11, color: "#3a3a5a", marginTop: 14, fontFamily: "DM Mono, monospace" }}>
        Assumes 7% annual return · 4% withdrawal rule · inflation-adjusted
      </p>
    </motion.section>
  );
}
