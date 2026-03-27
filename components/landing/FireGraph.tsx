"use client";

import { motion } from "framer-motion";
import { useState, useMemo, useEffect, useRef } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Area, AreaChart,
} from "recharts";

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return "$" + Math.round(n).toLocaleString();
}

function buildProjection(
  monthlySavings: number,
  monthlyExpenses: number,
  startPortfolio: number,
  growthRate = 0.07,
  withdrawalRate = 0.04,
) {
  const fireTarget = (monthlyExpenses * 12) / withdrawalRate;
  const points: { year: number; portfolio: number; fire: number }[] = [];
  let port = startPortfolio;
  let fireYear: number | null = null;

  for (let y = 0; y <= 40; y++) {
    points.push({ year: y, portfolio: Math.round(port), fire: Math.round(fireTarget) });
    if (port >= fireTarget && fireYear === null) fireYear = y;
    port = port * (1 + growthRate) + monthlySavings * 12;
  }
  return { points, fireYear, fireTarget };
}

const CUSTOM_DOT = () => null; // no dots on lines for clean look

interface TooltipProps {
  active?: boolean;
  payload?: { value: number; dataKey: string }[];
  label?: number;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#1a1a2e", border: "1px solid #1c1c2e", borderRadius: 10, padding: "10px 14px", fontFamily: "DM Mono, monospace", fontSize: 11 }}>
      <div style={{ color: "#5e5e7a", marginBottom: 6 }}>Year {label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.dataKey === "portfolio" ? "#22d3a5" : "#f97316" }}>
          {p.dataKey === "portfolio" ? "Portfolio" : "FIRE target"}: {fmt(p.value)}
        </div>
      ))}
    </div>
  );
}

export function FireGraph() {
  const [savings, setSavings]   = useState(1500);
  const [expenses, setExpenses] = useState(3500);
  const [visible, setVisible]   = useState(false);
  const [drawn, setDrawn]       = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Intersection observer to trigger entrance
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); setTimeout(() => setDrawn(true), 400); } },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const { points, fireYear, fireTarget } = useMemo(
    () => buildProjection(savings, expenses, 50000),
    [savings, expenses]
  );

  const maxY = Math.max(...points.map(p => Math.max(p.portfolio, p.fire))) * 1.12;

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      style={{ width: "100%", maxWidth: 680, margin: "0 auto", padding: "0 24px 56px" }}
    >
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ fontSize: 11, color: "#22d3a5", fontFamily: "DM Mono, monospace", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>Wealth Projection</div>
        <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "clamp(22px,3.5vw,32px)", fontWeight: 800, color: "#e8e8f2", lineHeight: 1.1, letterSpacing: "-0.6px", marginBottom: 8 }}>
          Watch your wealth cross the FIRE line
        </h2>
        <p style={{ fontSize: 14, color: "#6e6e8e", lineHeight: 1.6 }}>
          Adjust savings and expenses — the projection updates live.
        </p>
      </div>

      {/* Mini controls */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Monthly savings", value: savings, onChange: setSavings, min: 0, max: 5000, step: 50, color: "#22d3a5", fmt: (v: number) => `$${v.toLocaleString()}/mo` },
          { label: "Monthly expenses", value: expenses, onChange: setExpenses, min: 1000, max: 7000, step: 50, color: "#ef4444", fmt: (v: number) => `$${v.toLocaleString()}/mo` },
        ].map(s => {
          const pct = ((s.value - s.min) / (s.max - s.min)) * 100;
          return (
            <div key={s.label} style={{ background: "#13131e", border: "1px solid #1c1c2e", borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: 11, color: "#5e5e7a", fontFamily: "DM Mono, monospace", textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}</span>
                <span style={{ fontSize: 12, color: s.color, fontFamily: "DM Mono, monospace", fontWeight: 600 }}>{s.fmt(s.value)}</span>
              </div>
              <input
                type="range"
                min={s.min}
                max={s.max}
                step={s.step}
                value={s.value}
                onChange={e => s.onChange(Number(e.target.value))}
                style={{ width: "100%", appearance: "none", WebkitAppearance: "none", height: 4, borderRadius: 99, outline: "none", cursor: "pointer",
                  background: `linear-gradient(to right, ${s.color} ${pct}%, #1c1c2e ${pct}%)` }}
              />
            </div>
          );
        })}
      </div>

      {/* FIRE milestone callout */}
      {fireYear !== null && (
        <motion.div
          key={fireYear}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          style={{ display: "flex", alignItems: "center", gap: 14, background: "rgba(249,115,22,0.06)", border: "1px solid rgba(249,115,22,0.2)", borderRadius: 12, padding: "12px 18px", marginBottom: 20 }}
        >
          <span style={{ fontSize: 20 }}>🔥</span>
          <div>
            <span style={{ fontFamily: "DM Mono, monospace", fontSize: 13, color: "#e8e8f2" }}>
              FIRE reached in <strong style={{ color: "#f97316" }}>year {fireYear}</strong>
            </span>
            <div style={{ fontSize: 11, color: "#5e5e7a", marginTop: 2 }}>
              Target: {fmt(fireTarget)} · Adjust sliders to change your timeline
            </div>
          </div>
        </motion.div>
      )}

      {/* Chart */}
      <div style={{ background: "#13131e", border: "1px solid #1c1c2e", borderRadius: 16, padding: "20px 4px 12px 4px", position: "relative", overflow: "hidden" }}>
        {/* Line-draw animation overlay — mask that slides from right to left */}
        {drawn && (
          <motion.div
            initial={{ x: 0 }}
            animate={{ x: "100%" }}
            transition={{ duration: 1.8, ease: "easeInOut" }}
            style={{
              position: "absolute", inset: "20px 0 12px 0",
              background: "#13131e",
              zIndex: 2,
              transformOrigin: "left",
            }}
          />
        )}
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={points} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="gPortfolio" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3a5" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#22d3a5" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gFire" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f97316" stopOpacity={0.1} />
                <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1c1c2e" />
            <XAxis dataKey="year" tickFormatter={v => `Yr ${v}`} tick={{ fill: "#5e5e7a", fontSize: 10, fontFamily: "DM Mono" }} axisLine={false} tickLine={false} interval={7} />
            <YAxis tickFormatter={v => fmt(v)} tick={{ fill: "#5e5e7a", fontSize: 10, fontFamily: "DM Mono" }} axisLine={false} tickLine={false} width={60} domain={[0, maxY]} />
            <Tooltip content={<CustomTooltip />} />
            {fireYear !== null && (
              <ReferenceLine
                x={fireYear}
                stroke="#f97316"
                strokeDasharray="5 3"
                label={{ value: "🔥 FIRE", position: "insideTopLeft", fill: "#f97316", fontSize: 10, fontFamily: "DM Mono" }}
              />
            )}
            <Area type="monotone" dataKey="fire" stroke="#f97316" strokeWidth={1.5} strokeDasharray="5 3" fill="url(#gFire)" dot={CUSTOM_DOT} />
            <Area type="monotone" dataKey="portfolio" stroke="#22d3a5" strokeWidth={2.5} fill="url(#gPortfolio)" dot={CUSTOM_DOT} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <p style={{ textAlign: "center", fontSize: 11, color: "#3a3a5a", marginTop: 12, fontFamily: "DM Mono, monospace" }}>
        Teal = your portfolio · Orange dashed = FIRE threshold · Starting portfolio: $50,000
      </p>
    </motion.section>
  );
}
