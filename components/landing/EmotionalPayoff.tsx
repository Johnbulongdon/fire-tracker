"use client";

import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";

const WORK_ITEMS = [
  { icon: "⏰", label: "Monday alarm" },
  { icon: "📊", label: "Status meeting" },
  { icon: "🚇", label: "Daily commute" },
  { icon: "📧", label: "Inbox anxiety" },
  { icon: "💼", label: "Performance review" },
  { icon: "😶", label: "Sunday dread" },
];

const FREEDOM_ITEMS = [
  { icon: "🌅", label: "Wake naturally", color: "#22d3a5" },
  { icon: "🧭", label: "Work you choose", color: "#22d3a5" },
  { icon: "🌍", label: "Live anywhere",   color: "#f97316" },
  { icon: "📚", label: "Learn freely",    color: "#a78bfa" },
  { icon: "🎯", label: "Take real risks", color: "#f97316" },
  { icon: "🧘", label: "Present. Calm.",  color: "#22d3a5" },
];

export function EmotionalPayoff() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [phase, setPhase] = useState<"before" | "transition" | "after">("before");

  useEffect(() => {
    if (!inView) return;
    const t1 = setTimeout(() => setPhase("transition"), 600);
    const t2 = setTimeout(() => setPhase("after"), 1600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [inView]);

  return (
    <section
      ref={ref}
      style={{ maxWidth: 680, margin: "0 auto", padding: "0 24px 80px" }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{ textAlign: "center", marginBottom: 48 }}
      >
        <div style={{ fontSize: 11, color: "#a78bfa", fontFamily: "DM Mono, monospace", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>Life after FIRE</div>
        <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "clamp(26px,4vw,38px)", fontWeight: 800, color: "#e8e8f2", lineHeight: 1.1, letterSpacing: "-0.8px", marginBottom: 12 }}>
          From obligation<br />
          <span style={{ color: "#a78bfa" }}>to intention.</span>
        </h2>
        <p style={{ fontSize: 15, color: "#6e6e8e", lineHeight: 1.7, maxWidth: 480, margin: "0 auto" }}>
          FIRE doesn&apos;t mean lying on a beach forever. It means your time is finally yours to direct.
        </p>
      </motion.div>

      {/* Transition card */}
      <div style={{ background: "#13131e", border: "1px solid #1c1c2e", borderRadius: 20, padding: "28px 24px", overflow: "hidden" }}>
        {/* Labels */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 12, marginBottom: 20, alignItems: "center" }}>
          <AnimatePresence>
            {(phase === "before" || phase === "transition") && (
              <motion.div
                key="before-label"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ fontSize: 11, color: "#5e5e7a", fontFamily: "DM Mono, monospace", textTransform: "uppercase", letterSpacing: "0.1em" }}
              >
                Before FIRE
              </motion.div>
            )}
          </AnimatePresence>
          {phase === "after" && (
            <div style={{ fontSize: 11, color: "#3a3a5a", fontFamily: "DM Mono, monospace", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Before FIRE
            </div>
          )}

          {/* Arrow */}
          <motion.div
            animate={{
              color: phase === "after" ? "#f97316" : "#3a3a5a",
              scale: phase === "transition" ? 1.3 : 1,
            }}
            transition={{ duration: 0.4 }}
            style={{ fontSize: 18, textAlign: "center", fontFamily: "DM Mono, monospace" }}
          >
            →
          </motion.div>

          <motion.div
            animate={{ color: phase === "after" ? "#22d3a5" : "#3a3a5a" }}
            transition={{ duration: 0.4 }}
            style={{ fontSize: 11, fontFamily: "DM Mono, monospace", textTransform: "uppercase", letterSpacing: "0.1em", textAlign: "right" }}
          >
            After FIRE
          </motion.div>
        </div>

        {/* Item grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {WORK_ITEMS.map((item, i) => {
            const freed = phase === "after";
            const freedom = FREEDOM_ITEMS[i];
            return (
              <motion.div
                key={i}
                layout
                style={{
                  borderRadius: 12,
                  padding: "14px 12px",
                  textAlign: "center",
                  position: "relative",
                  overflow: "hidden",
                  border: `1px solid ${freed ? `${freedom.color}22` : "#1c1c2e"}`,
                  background: freed ? `${freedom.color}08` : "#0f0f18",
                }}
                animate={{
                  borderColor: freed ? `${freedom.color}30` : "#1c1c2e",
                  background: freed ? `${freedom.color}08` : "#0f0f18",
                }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
              >
                <AnimatePresence mode="wait">
                  {!freed ? (
                    <motion.div
                      key="work"
                      initial={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -16 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                    >
                      <div style={{ fontSize: 22, marginBottom: 6, filter: "grayscale(0.4)" }}>{item.icon}</div>
                      <div style={{ fontSize: 11, color: "#5e5e7a", fontFamily: "DM Mono, monospace", letterSpacing: "0.06em" }}>{item.label}</div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="free"
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.45, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div style={{ fontSize: 22, marginBottom: 6 }}>{freedom.icon}</div>
                      <div style={{ fontSize: 11, color: freedom.color, fontFamily: "DM Mono, monospace", letterSpacing: "0.06em", fontWeight: 600 }}>{freedom.label}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Progress indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
          style={{ marginTop: 20, height: 4, background: "#0f0f18", borderRadius: 99, overflow: "hidden" }}
        >
          <motion.div
            animate={{ width: phase === "before" ? "0%" : phase === "transition" ? "55%" : "100%" }}
            transition={{ duration: phase === "transition" ? 1.0 : 0.6, ease: "easeInOut" }}
            style={{ height: "100%", background: "linear-gradient(90deg, #a78bfa, #22d3a5)", borderRadius: 99 }}
          />
        </motion.div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 10, color: "#3a3a5a", fontFamily: "DM Mono, monospace" }}>
          <span>Today</span><span>FIRE date</span>
        </div>
      </div>

      {/* CTA underneath */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={inView && phase === "after" ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.6 }}
        style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: "#6e6e8e", lineHeight: 1.7 }}
      >
        This is what you&apos;re building toward. Your number is the first step.<br />
        <span style={{ color: "#e8e8f2" }}>It takes 60 seconds to find it.</span>
      </motion.p>
    </section>
  );
}
