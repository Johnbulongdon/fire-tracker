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

// Demo: pulse the numbers to show the tool working
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

const HERO_TOKENS = [
  { text: "$847,250",   x: "7%",  y: "16%", delay: 0 },
  { text: "26 yrs",    x: "80%", y: "24%", delay: 2.4 },
  { text: "4% rule",   x: "11%", y: "56%", delay: 1.1 },
  { text: "$2,100/mo", x: "72%", y: "66%", delay: 3.6 },
  { text: "7% growth", x: "16%", y: "36%", delay: 0.7 },
  { text: "FIRE 2041", x: "75%", y: "42%", delay: 2.0 },
  { text: "Age 48",    x: "5%",  y: "76%", delay: 4.0 },
  { text: "25× rule",  x: "62%", y: "82%", delay: 1.5 },
];

export function AnimatedHero({ onStart, onSignIn }: Props) {
  const [stateIdx, setStateIdx] = useState(0);
  const [calcCount, setCalcCount] = useState(14847);
  const state = DEMO_STATES[stateIdx];

  const netWorth = useAnimatedNumber(state.netWorth, 1.4);
  const yearsToFire = useAnimatedNumber(state.yearsToFire, 1.2);

  // Progress spring
  const spring = useSpring(state.progress, { stiffness: 80, damping: 20 });
  const progressPct = useTransform(spring, v => `${v.toFixed(1)}%`);
  useEffect(() => { spring.set(state.progress); }, [state.progress, spring]);

  // Cycle demo states
  useEffect(() => {
    const id = setInterval(() => {
      setStateIdx(i => (i + 1) % DEMO_STATES.length);
    }, 2800);
    return () => clearInterval(id);
  }, []);

  // Live counter
  useEffect(() => {
    const id = setInterval(() => setCalcCount(n => n + Math.floor(Math.random() * 2 + 1)), 3200);
    return () => clearInterval(id);
  }, []);

  const ease = [0.16, 1, 0.3, 1] as const;
  const stagger = {
    container: { hidden: {}, show: { transition: { staggerChildren: 0.1 } } },
    item: { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { ease, duration: 0.7 } } },
  };

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 540, padding: "40px 24px 24px", zIndex: 1 }}>
      {/* Floating tokens */}
      {HERO_TOKENS.map((t, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.18, scale: 1 }}
          transition={{ delay: t.delay, duration: 0.6, ease: "easeOut" }}
          style={{
            position: "absolute", left: t.x, top: t.y,
            fontFamily: "DM Mono, monospace", fontSize: 11, color: "#e8e8f2",
            whiteSpace: "nowrap", pointerEvents: "none", userSelect: "none",
            border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6,
            padding: "3px 8px", background: "rgba(255,255,255,0.03)",
          }}
        >
          {t.text}
        </motion.div>
      ))}

      <motion.div
        variants={stagger.container}
        initial="hidden"
        animate="show"
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}
      >
        {/* Live counter badge */}
        <motion.div variants={stagger.item}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(34,211,165,0.08)", border: "1px solid rgba(34,211,165,0.2)", borderRadius: 99, padding: "5px 14px", marginBottom: 20 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22d3a5", display: "inline-block", boxShadow: "0 0 8px #22d3a5" }} />
            <span style={{ fontFamily: "DM Mono, monospace", fontSize: 11, color: "#22d3a5" }}>
              {calcCount.toLocaleString()} FIRE numbers calculated today
            </span>
          </div>
        </motion.div>

        {/* Badge */}
        <motion.div variants={stagger.item}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.18)", borderRadius: 99, padding: "4px 12px", marginBottom: 16, fontSize: 12, color: "#f97316" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f97316", display: "inline-block" }} />
            Free — no login required
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={stagger.item}
          style={{ fontFamily: "Syne, sans-serif", fontSize: "clamp(32px,5vw,52px)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-1.5px", color: "#e8e8f2", marginBottom: 14, textAlign: "center" }}
        >
          Your spending is<br />
          <span style={{ color: "#f97316" }}>costing you years</span><br />
          of freedom.
        </motion.h1>

        <motion.p
          variants={stagger.item}
          style={{ fontSize: 16, lineHeight: 1.6, color: "#6e6e8e", maxWidth: 420, margin: "0 auto 28px", textAlign: "center" }}
        >
          Find out exactly when you can retire — adjusted for your city, income, and what you actually spend. Takes 60 seconds.
        </motion.p>

        {/* Live FIRE stats preview */}
        <motion.div
          variants={stagger.item}
          style={{ width: "100%", background: "rgba(8,8,14,0.7)", border: "1px solid #1c1c2e", borderRadius: 16, padding: "20px 22px", marginBottom: 20, backdropFilter: "blur(8px)" }}
        >
          <div style={{ fontSize: 10, color: "#3a3a5a", fontFamily: "DM Mono, monospace", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 14 }}>
            Live preview · updates every 3s
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 10, color: "#5e5e7a", fontFamily: "DM Mono, monospace", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Net worth</div>
              <motion.div
                key={netWorth}
                style={{ fontSize: 24, fontWeight: 700, color: "#22d3a5", fontFamily: "DM Mono, monospace", lineHeight: 1 }}
              >
                {fmt(netWorth)}
              </motion.div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: "#5e5e7a", fontFamily: "DM Mono, monospace", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Years to FIRE</div>
              <motion.div
                style={{ fontSize: 24, fontWeight: 700, color: "#f97316", fontFamily: "DM Mono, monospace", lineHeight: 1 }}
              >
                {yearsToFire}
                <span style={{ fontSize: 14, fontWeight: 400, color: "#5e5e7a", marginLeft: 4 }}>yrs</span>
              </motion.div>
            </div>
          </div>

          {/* Animated progress bar */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 10, color: "#5e5e7a", fontFamily: "DM Mono, monospace", textTransform: "uppercase", letterSpacing: "0.1em" }}>Progress to FIRE</span>
              <motion.span style={{ fontSize: 11, color: "#f97316", fontFamily: "DM Mono, monospace" }}>
                {progressPct}
              </motion.span>
            </div>
            <div style={{ height: 6, background: "#0f0f18", borderRadius: 99, overflow: "hidden" }}>
              <motion.div
                style={{
                  height: "100%",
                  width: `${state.progress}%`,
                  background: "linear-gradient(90deg, #22d3a5, #f97316)",
                  borderRadius: 99,
                  boxShadow: "0 0 12px rgba(249,115,22,0.4)",
                }}
                animate={{ width: `${state.progress}%` }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div variants={stagger.item} style={{ width: "100%" }}>
          <motion.button
            onClick={onStart}
            whileHover={{ scale: 1.02, boxShadow: "0 8px 32px rgba(249,115,22,0.45)" }}
            whileTap={{ scale: 0.98 }}
            style={{ width: "100%", background: "#f97316", border: "none", borderRadius: 12, padding: "16px 24px", color: "#fff", fontFamily: "DM Sans, sans-serif", fontSize: 16, fontWeight: 700, cursor: "pointer", letterSpacing: "-0.2px" }}
          >
            Calculate my FIRE number →
          </motion.button>
        </motion.div>

        <motion.button
          variants={stagger.item}
          onClick={onSignIn}
          style={{ background: "none", border: "none", color: "#6e6e8e", fontFamily: "DM Sans, sans-serif", fontSize: 14, cursor: "pointer", padding: 8, marginTop: 4 }}
          whileHover={{ color: "#e8e8f2" }}
        >
          Already have an account? Sign in →
        </motion.button>

        {/* Social proof */}
        <motion.div variants={stagger.item} style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 20 }}>
          <div style={{ display: "flex" }}>
            {["#f97316","#22d3a5","#a78bfa","#fb923c"].map((c, i) => (
              <div key={i} style={{ width: 26, height: 26, borderRadius: "50%", background: c, border: "2px solid #08080e", marginLeft: i === 0 ? 0 : -8 }} />
            ))}
          </div>
          <span style={{ fontSize: 13, color: "#6e6e8e" }}>
            Joined by <strong style={{ color: "#e8e8f2" }}>2,400+</strong> FIRE seekers this month
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}
