"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

function FadeIn({
  children,
  delay = 0,
  y = 28,
  className,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

interface MetricCardProps {
  value: string;
  label: string;
  sub?: string;
  color: string;
  delay: number;
}

function MetricCard({ value, label, sub, color, delay }: MetricCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.88, y: 20 }}
      animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.34, 1.56, 0.64, 1] }}
      style={{ background: "#13131e", border: "1px solid #1c1c2e", borderRadius: 14, padding: "20px 18px" }}
    >
      <div style={{ fontSize: 10, color: "#5e5e7a", fontFamily: "DM Mono, monospace", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color, fontFamily: "DM Mono, monospace", lineHeight: 1, marginBottom: sub ? 4 : 0 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "#5e5e7a", marginTop: 4 }}>{sub}</div>}
    </motion.div>
  );
}

// ─── Section A: Where you are now ──────────────────────────────────────────
function SectionNow() {
  return (
    <section style={{ maxWidth: 680, margin: "0 auto", padding: "0 24px 72px" }}>
      <FadeIn>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(167,139,250,0.15)", border: "1px solid rgba(167,139,250,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>📍</div>
          <div style={{ fontSize: 11, color: "#a78bfa", fontFamily: "DM Mono, monospace", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 600 }}>
            Chapter 1 · Where you are now
          </div>
        </div>
        <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "clamp(26px,4vw,38px)", fontWeight: 800, color: "#e8e8f2", lineHeight: 1.1, letterSpacing: "-0.8px", marginBottom: 12 }}>
          Most people have no idea<br />where they actually stand.
        </h2>
        <p style={{ fontSize: 15, color: "#6e6e8e", lineHeight: 1.7, marginBottom: 36, maxWidth: 520 }}>
          They know their salary. They might know their 401k balance. But they have no single number that answers: <em style={{ color: "#e8e8f2" }}>how far am I from never needing to work again?</em>
        </p>
      </FadeIn>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        <MetricCard value="$847k"   label="FIRE target" sub="25× annual expenses" color="#f97316" delay={0} />
        <MetricCard value="31%"     label="Progress"    sub="Most people guess 10%" color="#22d3a5" delay={0.08} />
        <MetricCard value="14 yrs"  label="Time to FIRE" sub="If you stay the course" color="#a78bfa" delay={0.16} />
      </div>

      <FadeIn delay={0.2} y={16}>
        <div style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 12, padding: "16px 20px", marginTop: 20 }}>
          <div style={{ fontSize: 13, color: "#9090a8", lineHeight: 1.7 }}>
            <strong style={{ color: "#ef4444" }}>The gap problem:</strong> traditional calculators show a retirement number but not how your actual city costs, spending, and savings rate interact. UntilFire builds the full picture.
          </div>
        </div>
      </FadeIn>
    </section>
  );
}

// ─── Section B: Your path ────────────────────────────────────────────────────
function PathStep({ n, label, sub, icon, delay }: { n: string; label: string; sub: string; icon: string; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -24 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      style={{ display: "flex", gap: 16, alignItems: "flex-start" }}
    >
      <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "DM Mono, monospace", fontWeight: 700, color: "#f97316", fontSize: 14 }}>
          {n}
        </div>
        {n !== "3" && (
          <motion.div
            initial={{ height: 0 }}
            animate={inView ? { height: 48 } : {}}
            transition={{ duration: 0.5, delay: delay + 0.3 }}
            style={{ width: 1, background: "rgba(249,115,22,0.2)" }}
          />
        )}
      </div>
      <div style={{ paddingTop: 8 }}>
        <div style={{ fontSize: 18 }}>{icon}</div>
        <div style={{ fontSize: 15, fontWeight: 600, color: "#e8e8f2", marginTop: 4, marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 13, color: "#6e6e8e", lineHeight: 1.6 }}>{sub}</div>
      </div>
    </motion.div>
  );
}

function SectionPath() {
  const steps = [
    { n: "1", icon: "🏙️", label: "Start with your city", sub: "Cost of living is the most ignored variable. San Francisco vs Chiang Mai is a 15-year difference in retirement date." },
    { n: "2", icon: "💰", label: "Enter your actual numbers", sub: "Not rough estimates. Your real income, expenses by category, and current portfolio. The precision is what makes the result useful." },
    { n: "3", icon: "🔥", label: "Get your personalised FIRE plan", sub: "Exact number, exact year, and the specific levers that move your date most — savings rate, expenses, geo arbitrage." },
  ];

  return (
    <section style={{ maxWidth: 680, margin: "0 auto", padding: "0 24px 72px" }}>
      <FadeIn>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(34,211,165,0.12)", border: "1px solid rgba(34,211,165,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🗺️</div>
          <div style={{ fontSize: 11, color: "#22d3a5", fontFamily: "DM Mono, monospace", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 600 }}>
            Chapter 2 · Your path
          </div>
        </div>
        <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "clamp(26px,4vw,38px)", fontWeight: 800, color: "#e8e8f2", lineHeight: 1.1, letterSpacing: "-0.8px", marginBottom: 12 }}>
          Three questions.<br />
          <span style={{ color: "#22d3a5" }}>A number that actually holds.</span>
        </h2>
        <p style={{ fontSize: 15, color: "#6e6e8e", lineHeight: 1.7, marginBottom: 40, maxWidth: 520 }}>
          Most FIRE tools give you a formula. UntilFire gives you a conversation — one that adapts to where you live, how much you make, and what you spend.
        </p>
      </FadeIn>

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {steps.map((s, i) => <PathStep key={s.n} {...s} delay={i * 0.12} />)}
      </div>
    </section>
  );
}

// ─── Section C: Your future ───────────────────────────────────────────────────
function FutureCard({ icon, title, sub, delay }: { icon: string; title: string; sub: string; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28, scale: 0.94 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.34, 1.56, 0.64, 1] }}
      style={{ background: "rgba(249,115,22,0.04)", border: "1px solid rgba(249,115,22,0.14)", borderRadius: 14, padding: "20px 18px" }}
    >
      <div style={{ fontSize: 28, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontSize: 15, fontWeight: 600, color: "#e8e8f2", marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13, color: "#6e6e8e", lineHeight: 1.6 }}>{sub}</div>
    </motion.div>
  );
}

function SectionFuture() {
  return (
    <section style={{ maxWidth: 680, margin: "0 auto", padding: "0 24px 72px" }}>
      <FadeIn>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(249,115,22,0.12)", border: "1px solid rgba(249,115,22,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🔥</div>
          <div style={{ fontSize: 11, color: "#f97316", fontFamily: "DM Mono, monospace", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 600 }}>
            Chapter 3 · Your future
          </div>
        </div>
        <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "clamp(26px,4vw,38px)", fontWeight: 800, color: "#e8e8f2", lineHeight: 1.1, letterSpacing: "-0.8px", marginBottom: 12 }}>
          Financial independence isn&apos;t retirement.<br />
          <span style={{ color: "#f97316" }}>It&apos;s optionality.</span>
        </h2>
        <p style={{ fontSize: 15, color: "#6e6e8e", lineHeight: 1.7, marginBottom: 40, maxWidth: 540 }}>
          When you hit your FIRE number, you can work because you want to — not because you have to. That changes everything: the risks you take, the decisions you make, the life you build.
        </p>
      </FadeIn>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
        {[
          { icon: "🌍", title: "Work from anywhere",    sub: "Your income isn't tied to a location. Move to Lisbon. Spend summers in Japan.", delay: 0 },
          { icon: "⏰", title: "Own your time",         sub: "No alarm clock urgency. No Sunday dread. Your hours are yours.", delay: 0.08 },
          { icon: "🎯", title: "Take the risky bet",    sub: "Start the company. Write the book. The downside is just going back to work.", delay: 0.16 },
          { icon: "🧘", title: "Lower your baseline",   sub: "When you don't need a paycheck, you can choose work that actually matters to you.", delay: 0.24 },
        ].map(c => <FutureCard key={c.title} {...c} />)}
      </div>
    </section>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export function ScrollStory() {
  return (
    <>
      {/* Section divider */}
      <div style={{ width: 240, height: 1, margin: "0 auto 64px", background: "linear-gradient(90deg, transparent, #1c1c2e, transparent)" }} />
      <SectionNow />
      <div style={{ width: 240, height: 1, margin: "0 auto 64px", background: "linear-gradient(90deg, transparent, #1c1c2e, transparent)" }} />
      <SectionPath />
      <div style={{ width: 240, height: 1, margin: "0 auto 64px", background: "linear-gradient(90deg, transparent, #1c1c2e, transparent)" }} />
      <SectionFuture />
    </>
  );
}
