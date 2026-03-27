"use client";

import { motion, useSpring, useTransform, animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";

// ─── Animated counter hook ────────────────────────────────────────────────────
function useAnimatedNumber(target: number, duration = 1.8) {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);

  useEffect(() => {
    const controls = animate(prev.current, target, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(v) { setDisplay(Math.round(v)); },
    });
    prev.current = target;
    return controls.stop;
  }, [target, duration]);

  return display;
}

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  return "$" + Math.round(n).toLocaleString();
}

const DEMO_STATES = [
  { netWorth: 247000, yearsToFire: 14, progress: 31 },
  { netWorth: 412000, yearsToFire: 9,  progress: 52 },
  { netWorth: 631000, yearsToFire: 5,  progress: 74 },
  { netWorth: 847000, yearsToFire: 2,  progress: 91 },
];

interface Props {
  onStart: () => void;
  onSignIn: () => void;
}

// Tokens positioned toward the viewport edges so they appear in visual margins
const HERO_TOKENS = [
  { text: "$847,250",   x: "1.5%", y: "14%", delay: 0 },
  { text: "26 yrs",    x: "87%",  y: "20%", delay: 2.4 },
  { text: "4% rule",   x: "4%",   y: "52%", delay: 1.1 },
  { text: "$2,100/mo", x: "85%",  y: "60%", delay: 3.6 },
  { text: "7% growth", x: "2.5%", y: "34%", delay: 0.7 },
  { text: "FIRE 2041", x: "88%",  y: "38%", delay: 2.0 },
  { text: "Age 48",    x: "1%",   y: "72%", delay: 4.0 },
  { text: "25× rule",  x: "89%",  y: "76%", delay: 1.5 },
];

export function AnimatedHero({ onStart, onSignIn }: Props) {
  const [stateIdx, setStateIdx] = useState(0);
  const [calcCount, setCalcCount] = useState(14847);
  const state = DEMO_STATES[stateIdx];

  const netWorth    = useAnimatedNumber(state.netWorth, 1.4);
  const yearsToFire = useAnimatedNumber(state.yearsToFire, 1.2);

  const spring      = useSpring(state.progress, { stiffness: 80, damping: 20 });
  const progressPct = useTransform(spring, v => `${v.toFixed(1)}%`);
  useEffect(() => { spring.set(state.progress); }, [state.progress, spring]);

  useEffect(() => {
    const id = setInterval(() => {
      setStateIdx(i => (i + 1) % DEMO_STATES.length);
    }, 2800);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setCalcCount(n => n + Math.floor(Math.random() * 2 + 1)), 3200);
    return () => clearInterval(id);
  }, []);

  const ease = [0.16, 1, 0.3, 1] as const;
  const stagger = {
    container: { hidden: {}, show: { transition: { staggerChildren: 0.09 } } },
    item: { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { ease, duration: 0.7 } } },
  };

  const fireYear = 2025 + state.yearsToFire;

  return (
    <div style={{
      position: "relative",
      width: "100%",
      padding: "72px max(24px, 5vw) 80px",
      overflow: "hidden",
    }}>
      {/* Edge-positioned floating tokens */}
      {HERO_TOKENS.map((t, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 0.14, scale: 1 }}
          transition={{ delay: t.delay, duration: 0.6, ease: "easeOut" }}
          style={{
            position: "absolute", left: t.x, top: t.y,
            fontFamily: "DM Mono, monospace", fontSize: 11, color: "#e8e8f2",
            whiteSpace: "nowrap", pointerEvents: "none", userSelect: "none",
            border: "1px solid rgba(255,255,255,0.07)", borderRadius: 6,
            padding: "3px 8px", background: "rgba(255,255,255,0.025)",
          }}
        >
          {t.text}
        </motion.div>
      ))}

      {/* Two-column inner layout */}
      <div style={{
        maxWidth: 1280,
        margin: "0 auto",
        display: "flex",
        flexWrap: "wrap",
        gap: "48px 72px",
        alignItems: "center",
        position: "relative",
        zIndex: 1,
      }}>
        {/* ── LEFT COLUMN: Text + CTA ── */}
        <motion.div
          variants={stagger.container}
          initial="hidden"
          animate="show"
          style={{ flex: "1 1 380px", minWidth: 0, display: "flex", flexDirection: "column", alignItems: "flex-start" }}
        >
          {/* Live counter */}
          <motion.div variants={stagger.item} style={{ marginBottom: 16 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(34,211,165,0.08)", border: "1px solid rgba(34,211,165,0.2)", borderRadius: 99, padding: "5px 14px" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22d3a5", display: "inline-block", boxShadow: "0 0 8px #22d3a5" }} />
              <span style={{ fontFamily: "DM Mono, monospace", fontSize: 11, color: "#22d3a5" }}>
                {calcCount.toLocaleString()} FIRE numbers calculated today
              </span>
            </div>
          </motion.div>

          {/* Free badge */}
          <motion.div variants={stagger.item} style={{ marginBottom: 20 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.18)", borderRadius: 99, padding: "4px 12px", fontSize: 12, color: "#f97316" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f97316", display: "inline-block" }} />
              Free — no login required
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={stagger.item}
            style={{ fontFamily: "Syne, sans-serif", fontSize: "clamp(36px, 5vw, 60px)", fontWeight: 800, lineHeight: 1.0, letterSpacing: "-2px", color: "#e8e8f2", marginBottom: 20, textAlign: "left" }}
          >
            Your spending is<br />
            <span style={{ color: "#f97316" }}>costing you years</span><br />
            of freedom.
          </motion.h1>

          <motion.p
            variants={stagger.item}
            style={{ fontSize: 17, lineHeight: 1.65, color: "#6e6e8e", maxWidth: 460, marginBottom: 32, textAlign: "left" }}
          >
            Find out exactly when you can retire — adjusted for your city, income, and what you actually spend. Takes 60 seconds.
          </motion.p>

          {/* CTA */}
          <motion.div variants={stagger.item} style={{ width: "100%", maxWidth: 400 }}>
            <motion.button
              onClick={onStart}
              whileHover={{ scale: 1.02, boxShadow: "0 8px 32px rgba(249,115,22,0.45)" }}
              whileTap={{ scale: 0.98 }}
              style={{ width: "100%", background: "#f97316", border: "none", borderRadius: 12, padding: "18px 28px", color: "#fff", fontFamily: "DM Sans, sans-serif", fontSize: 17, fontWeight: 700, cursor: "pointer", letterSpacing: "-0.2px" }}
            >
              Calculate my FIRE number →
            </motion.button>
          </motion.div>

          <motion.button
            variants={stagger.item}
            onClick={onSignIn}
            style={{ background: "none", border: "none", color: "#6e6e8e", fontFamily: "DM Sans, sans-serif", fontSize: 14, cursor: "pointer", padding: "10px 0", marginTop: 4 }}
            whileHover={{ color: "#e8e8f2" }}
          >
            Already have an account? Sign in →
          </motion.button>

          {/* Social proof */}
          <motion.div variants={stagger.item} style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 28 }}>
            <div style={{ display: "flex" }}>
              {["#f97316","#22d3a5","#a78bfa","#fb923c"].map((c, i) => (
                <div key={i} style={{ width: 28, height: 28, borderRadius: "50%", background: c, border: "2px solid #08080e", marginLeft: i === 0 ? 0 : -8 }} />
              ))}
            </div>
            <span style={{ fontSize: 13, color: "#6e6e8e" }}>
              Joined by <strong style={{ color: "#e8e8f2" }}>2,400+</strong> FIRE seekers this month
            </span>
          </motion.div>

          {/* Stats row */}
          <motion.div
            variants={stagger.item}
            style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginTop: 36, width: "100%", maxWidth: 440, borderTop: "1px solid #1c1c2e", paddingTop: 24 }}
          >
            {[
              { val: "$5.8B",  label: "market growing 10.3% CAGR", color: "#f97316" },
              { val: "2.2M",   label: "r/financialindependence members", color: "#22d3a5" },
              { val: "25%",    label: "Gen Z targeting retirement under 55", color: "#a78bfa" },
            ].map(s => (
              <div key={s.val} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "Syne, sans-serif", fontSize: 22, fontWeight: 800, color: s.color, marginBottom: 4 }}>{s.val}</div>
                <div style={{ fontSize: 10, color: "#3a3a5a", lineHeight: 1.4 }}>{s.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* ── RIGHT COLUMN: Live preview card ── */}
        <motion.div
          initial={{ opacity: 0, x: 48 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          style={{ flex: "1 1 360px", minWidth: 0 }}
        >
          <div style={{
            background: "rgba(10,10,18,0.85)",
            border: "1px solid #1c1c2e",
            borderRadius: 20,
            padding: "28px 28px 24px",
            backdropFilter: "blur(12px)",
            position: "relative",
            overflow: "hidden",
          }}>
            {/* Card inner glow */}
            <div style={{ position: "absolute", top: -60, right: -60, width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, rgba(249,115,22,0.07) 0%, transparent 65%)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: -40, left: -40, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(34,211,165,0.05) 0%, transparent 65%)", pointerEvents: "none" }} />

            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 22 }}>
              <motion.span
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ width: 7, height: 7, borderRadius: "50%", background: "#22d3a5", display: "inline-block", boxShadow: "0 0 8px #22d3a5", flexShrink: 0 }}
              />
              <span style={{ fontFamily: "DM Mono, monospace", fontSize: 11, color: "#3a3a5a", textTransform: "uppercase", letterSpacing: "0.12em" }}>
                Live preview · updates every 3s
              </span>
            </div>

            {/* Primary metrics */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 22 }}>
              <div>
                <div style={{ fontSize: 10, color: "#4a4a6a", fontFamily: "DM Mono, monospace", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Net worth</div>
                <motion.div key={netWorth} style={{ fontSize: 28, fontWeight: 700, color: "#22d3a5", fontFamily: "DM Mono, monospace", lineHeight: 1 }}>
                  {fmt(netWorth)}
                </motion.div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: "#4a4a6a", fontFamily: "DM Mono, monospace", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Years to FIRE</div>
                <motion.div style={{ fontSize: 28, fontWeight: 700, color: "#f97316", fontFamily: "DM Mono, monospace", lineHeight: 1 }}>
                  {yearsToFire}
                  <span style={{ fontSize: 15, fontWeight: 400, color: "#5e5e7a", marginLeft: 5 }}>yrs</span>
                </motion.div>
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 10, color: "#4a4a6a", fontFamily: "DM Mono, monospace", textTransform: "uppercase", letterSpacing: "0.1em" }}>Progress to FIRE</span>
                <motion.span style={{ fontSize: 11, color: "#f97316", fontFamily: "DM Mono, monospace" }}>
                  {progressPct}
                </motion.span>
              </div>
              <div style={{ height: 8, background: "#0c0c16", borderRadius: 99, overflow: "hidden" }}>
                <motion.div
                  animate={{ width: `${state.progress}%` }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                  style={{ height: "100%", background: "linear-gradient(90deg, #22d3a5, #f97316)", borderRadius: 99, boxShadow: "0 0 14px rgba(249,115,22,0.35)" }}
                />
              </div>
            </div>

            {/* Secondary stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { label: "FIRE year",  value: `~${fireYear}`, color: "#a78bfa" },
                { label: "Savings needed", value: fmt(netWorth / (state.progress / 100)), color: "#e8e8f2" },
              ].map(s => (
                <div key={s.label} style={{ background: "#0c0c18", borderRadius: 10, padding: "12px 14px" }}>
                  <div style={{ fontSize: 10, color: "#3a3a5a", fontFamily: "DM Mono, monospace", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>{s.label}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: s.color, fontFamily: "DM Mono, monospace" }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Bottom disclaimer */}
            <div style={{ marginTop: 16, fontSize: 10, color: "#2a2a3a", fontFamily: "DM Mono, monospace", textAlign: "center" }}>
              Demo data · Your numbers will be personalised
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
