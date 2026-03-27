"use client";

import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { scaleLinear } from "d3-scale";

// ─── Formatters ───────────────────────────────────────────────────────────────
function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return "$" + Math.round(n).toLocaleString();
}

// ─── Projection math ──────────────────────────────────────────────────────────
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

// ─── SVG Hover Chart ──────────────────────────────────────────────────────────
const MARGIN = { top: 16, right: 20, bottom: 28, left: 64 };
const CHART_H = 280;

interface HoverPoint { year: number; portfolio: number; fire: number; isFireYear: boolean }

function buildPath(
  points: { year: number; portfolio: number; fire: number }[],
  xScale: (v: number) => number,
  yScale: (v: number) => number,
  key: "portfolio" | "fire",
): string {
  return points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xScale(p.year).toFixed(2)} ${yScale(p[key]).toFixed(2)}`)
    .join(" ");
}

function buildAreaPath(
  points: { year: number; portfolio: number; fire: number }[],
  xScale: (v: number) => number,
  yScale: (v: number) => number,
  key: "portfolio" | "fire",
  bottomY: number,
): string {
  const linePart = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xScale(p.year).toFixed(2)} ${yScale(p[key]).toFixed(2)}`)
    .join(" ");
  const lastX = xScale(points[points.length - 1].year).toFixed(2);
  const firstX = xScale(points[0].year).toFixed(2);
  return `${linePart} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
}

interface HoverChartProps {
  points: { year: number; portfolio: number; fire: number }[];
  fireYear: number | null;
  width: number;
}

function HoverChart({ points, fireYear, width }: HoverChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const innerW = width - MARGIN.left - MARGIN.right;
  const innerH = CHART_H - MARGIN.top - MARGIN.bottom;
  const bottomY = MARGIN.top + innerH;

  // Scales
  const maxY = Math.max(...points.map(p => Math.max(p.portfolio, p.fire))) * 1.12;
  const xScale = scaleLinear().domain([0, 40]).range([MARGIN.left, MARGIN.left + innerW]);
  const yScale = scaleLinear().domain([0, maxY]).range([MARGIN.top + innerH, MARGIN.top]);

  // Grid
  const yTicks = yScale.ticks(5);
  const xTicks = [0, 5, 10, 15, 20, 25, 30, 35, 40];

  // Paths
  const portfolioPath  = buildPath(points, xScale, yScale, "portfolio");
  const firePath       = buildPath(points, xScale, yScale, "fire");
  const portfolioArea  = buildAreaPath(points, xScale, yScale, "portfolio", bottomY);
  const fireArea       = buildAreaPath(points, xScale, yScale, "fire", bottomY);

  // ── Hover state (RAF-based, no React setState on mousemove) ─────────────────
  const rafRef       = useRef<number | null>(null);
  const hoverRef     = useRef<HoverPoint | null>(null);
  const [hover, setHover] = useState<HoverPoint | null>(null);

  // Spring-animated x/y for dot + guide
  const dotX     = useMotionValue(0);
  const dotY     = useMotionValue(0);
  const fireDotY = useMotionValue(0);
  const guideX   = useMotionValue(0);
  const sDotX    = useSpring(dotX,     { stiffness: 300, damping: 30 });
  const sDotY    = useSpring(dotY,     { stiffness: 300, damping: 30 });
  const sFireDotY= useSpring(fireDotY, { stiffness: 300, damping: 30 });
  const sGuideX  = useSpring(guideX,   { stiffness: 300, damping: 30 });

  const [isHovering, setIsHovering] = useState(false);

  const onMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      // Map to data year
      const rawYear = xScale.invert(mouseX);
      const clampedYear = Math.max(0, Math.min(40, Math.round(rawYear)));
      const pt = points[clampedYear];
      if (!pt) return;

      const px = xScale(pt.year);
      const py = yScale(pt.portfolio);
      const fy = yScale(pt.fire);

      dotX.set(px);
      dotY.set(py);
      fireDotY.set(fy);
      guideX.set(px);

      // Only call setState when data point changed
      if (!hoverRef.current || hoverRef.current.year !== pt.year) {
        hoverRef.current = { ...pt, isFireYear: pt.year === fireYear };
        setHover({ ...pt, isFireYear: pt.year === fireYear });
      }
    });
  }, [points, xScale, yScale, fireYear, dotX, dotY, fireDotY, guideX]);

  const onMouseEnter = useCallback(() => setIsHovering(true), []);
  const onMouseLeave = useCallback(() => {
    setIsHovering(false);
    setHover(null);
    hoverRef.current = null;
  }, []);

  // Tooltip position: offset from dot, flip near edges
  const tooltipOffsetX = 16;
  const tooltipOffsetY = -60;

  // Whether cursor is near FIRE year
  const nearFire = hover !== null && fireYear !== null && Math.abs(hover.year - fireYear) <= 1;

  return (
    <div style={{ position: "relative", userSelect: "none" }}>
      <svg
        ref={svgRef}
        width={width}
        height={CHART_H}
        style={{ display: "block", cursor: "crosshair" }}
        onMouseMove={onMouseMove}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <defs>
          {/* Glow filters */}
          <filter id="glowTeal" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glowTealStrong" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glowOrange" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          {/* Gradients */}
          <linearGradient id="gradPortfolio" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22d3a5" stopOpacity={0.28} />
            <stop offset="100%" stopColor="#22d3a5" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradFire" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f97316" stopOpacity={0.1} />
            <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
          </linearGradient>
          {/* Clip */}
          <clipPath id="chartClip">
            <rect x={MARGIN.left} y={MARGIN.top} width={innerW} height={innerH} />
          </clipPath>
        </defs>

        {/* Grid lines */}
        {yTicks.map(tick => (
          <line
            key={tick}
            x1={MARGIN.left}
            x2={MARGIN.left + innerW}
            y1={yScale(tick)}
            y2={yScale(tick)}
            stroke="#1c1c2e"
            strokeWidth={1}
          />
        ))}

        {/* Areas */}
        <path d={fireArea}      fill="url(#gradFire)"      clipPath="url(#chartClip)" />
        <path d={portfolioArea} fill="url(#gradPortfolio)" clipPath="url(#chartClip)" />

        {/* FIRE target line */}
        <path
          d={firePath}
          fill="none"
          stroke="#f97316"
          strokeWidth={isHovering ? 2 : 1.5}
          strokeDasharray="5 3"
          clipPath="url(#chartClip)"
          style={{ transition: "stroke-width 0.2s" }}
        />

        {/* Portfolio line — brightens on hover */}
        <path
          d={portfolioPath}
          fill="none"
          stroke="#22d3a5"
          strokeWidth={isHovering ? 3 : 2.5}
          clipPath="url(#chartClip)"
          filter={isHovering ? "url(#glowTeal)" : undefined}
          style={{ transition: "stroke-width 0.2s" }}
        />

        {/* FIRE year reference line */}
        {fireYear !== null && (
          <line
            x1={xScale(fireYear)}
            x2={xScale(fireYear)}
            y1={MARGIN.top}
            y2={MARGIN.top + innerH}
            stroke="#f97316"
            strokeWidth={1}
            strokeDasharray="4 3"
            opacity={0.5}
          />
        )}

        {/* X axis ticks */}
        {xTicks.map(tick => (
          <text
            key={tick}
            x={xScale(tick)}
            y={MARGIN.top + innerH + 18}
            textAnchor="middle"
            fill="#3a3a5a"
            fontSize={10}
            fontFamily="DM Mono, monospace"
          >
            {tick === 0 ? "Now" : `Yr ${tick}`}
          </text>
        ))}

        {/* Y axis ticks */}
        {yTicks.map(tick => (
          <text
            key={tick}
            x={MARGIN.left - 8}
            y={yScale(tick) + 4}
            textAnchor="end"
            fill="#3a3a5a"
            fontSize={10}
            fontFamily="DM Mono, monospace"
          >
            {fmt(tick)}
          </text>
        ))}

        {/* ── Hover overlays (motion.* SVG elements) ── */}
        {isHovering && (
          <>
            {/* Vertical guide line */}
            <motion.line
              x1={sGuideX}
              x2={sGuideX}
              y1={MARGIN.top}
              y2={MARGIN.top + innerH}
              stroke="#ffffff"
              strokeWidth={1}
              strokeDasharray="3 3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.15 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            />

            {/* Fire target dot */}
            <motion.circle
              cx={sGuideX}
              cy={sFireDotY}
              r={4}
              fill="#f97316"
              stroke="#08080e"
              strokeWidth={2}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              style={{ originX: "50%", originY: "50%" }}
            />

            {/* Portfolio dot — pulses near FIRE year */}
            <motion.circle
              cx={sDotX}
              cy={sDotY}
              r={nearFire ? 7 : 5}
              fill="#22d3a5"
              stroke="#08080e"
              strokeWidth={2.5}
              filter={nearFire ? "url(#glowTealStrong)" : "url(#glowTeal)"}
              animate={nearFire ? { r: [5, 8, 5], opacity: [1, 0.7, 1] } : { r: 5, opacity: 1 }}
              transition={nearFire ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" } : { duration: 0.2 }}
            />
          </>
        )}
      </svg>

      {/* ── Tooltip (HTML, spring-positioned) ── */}
      <AnimatePresence>
        {hover && isHovering && (
          <motion.div
            key="tooltip"
            initial={{ opacity: 0, scale: 0.9, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 8 }}
            transition={{ duration: 0.15 }}
            style={{
              position: "absolute",
              left: Math.min(
                xScale(hover.year) + tooltipOffsetX,
                width - 180,
              ),
              top: Math.max(yScale(hover.portfolio) + tooltipOffsetY, 4),
              pointerEvents: "none",
              zIndex: 10,
              background: "rgba(15,15,25,0.95)",
              border: `1px solid ${nearFire ? "rgba(249,115,22,0.5)" : "rgba(34,211,165,0.25)"}`,
              borderRadius: 10,
              padding: "10px 14px",
              minWidth: 160,
              fontFamily: "DM Mono, monospace",
              fontSize: 11,
              boxShadow: nearFire
                ? "0 0 20px rgba(249,115,22,0.3), 0 4px 16px rgba(0,0,0,0.4)"
                : "0 4px 20px rgba(0,0,0,0.4)",
            }}
          >
            <div style={{ color: "#5e5e7a", marginBottom: 6, letterSpacing: "0.06em" }}>
              {hover.year === 0 ? "Today" : `Year ${hover.year}`}
            </div>
            <div style={{ color: "#22d3a5", marginBottom: 3 }}>
              Portfolio&nbsp;&nbsp;{fmt(hover.portfolio)}
            </div>
            <div style={{ color: "#f97316", marginBottom: nearFire ? 8 : 0 }}>
              Target&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{fmt(hover.fire)}
            </div>
            {nearFire && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                style={{
                  borderTop: "1px solid rgba(249,115,22,0.3)",
                  paddingTop: 7,
                  color: "#f97316",
                  fontWeight: 700,
                  fontSize: 12,
                  letterSpacing: "0.04em",
                }}
              >
                🔥 FIRE milestone
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Outer section component ───────────────────────────────────────────────────
export function FireGraph() {
  const [savings, setSavings]   = useState(1500);
  const [expenses, setExpenses] = useState(3500);
  const [visible, setVisible]   = useState(false);
  const [drawn, setDrawn]       = useState(false);
  const [chartWidth, setChartWidth] = useState(640);
  const ref     = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Intersection observer
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setVisible(true); setTimeout(() => setDrawn(true), 400); }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Measure chart wrapper width
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setChartWidth(Math.floor(entry.contentRect.width));
    });
    ro.observe(el);
    setChartWidth(el.getBoundingClientRect().width || 640);
    return () => ro.disconnect();
  }, []);

  const { points, fireYear, fireTarget } = useMemo(
    () => buildProjection(savings, expenses, 50000),
    [savings, expenses]
  );

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as const }}
      style={{ width: "100%", maxWidth: 680, margin: "0 auto", padding: "0 24px 56px" }}
    >
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ fontSize: 11, color: "#22d3a5", fontFamily: "DM Mono, monospace", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>
          Wealth Projection
        </div>
        <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "clamp(22px,3.5vw,32px)", fontWeight: 800, color: "#e8e8f2", lineHeight: 1.1, letterSpacing: "-0.6px", marginBottom: 8 }}>
          Watch your wealth cross the FIRE line
        </h2>
        <p style={{ fontSize: 14, color: "#6e6e8e", lineHeight: 1.6 }}>
          Hover the chart to explore your journey. Adjust sliders to update live.
        </p>
      </div>

      {/* Controls */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Monthly savings",  value: savings,  onChange: setSavings,  min: 0,    max: 5000, step: 50, color: "#22d3a5", fmt: (v: number) => `$${v.toLocaleString()}/mo` },
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
              Target: {fmt(fireTarget)} · Hover the chart to explore your path
            </div>
          </div>
        </motion.div>
      )}

      {/* Chart */}
      <div
        ref={wrapRef}
        style={{ background: "#13131e", border: "1px solid #1c1c2e", borderRadius: 16, overflow: "hidden", position: "relative" }}
      >
        {/* Line-draw reveal overlay */}
        {drawn && (
          <motion.div
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: 1.8, ease: "easeInOut" }}
            style={{
              position: "absolute", inset: 0,
              background: "#13131e",
              transformOrigin: "right",
              zIndex: 2,
              pointerEvents: "none",
            }}
          />
        )}
        {chartWidth > 0 && (
          <HoverChart points={points} fireYear={fireYear} width={chartWidth} />
        )}
      </div>

      <p style={{ textAlign: "center", fontSize: 11, color: "#3a3a5a", marginTop: 12, fontFamily: "DM Mono, monospace" }}>
        Teal = your portfolio · Orange dashed = FIRE threshold · Starting portfolio: $50,000
      </p>
    </motion.section>
  );
}
