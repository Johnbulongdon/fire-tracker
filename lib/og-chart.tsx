import React from "react";

export interface OGConfig {
  savings: number;
  expenses: number;
  startPortfolio: number;
}

const FMT = (n: number) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M`
  : n >= 1_000   ? `$${(n / 1_000).toFixed(0)}k`
  : `$${Math.round(n)}`;

function buildProjection(savings: number, expenses: number, start: number, displayYears = 22) {
  const target = (expenses * 12) / 0.04;
  const vals: number[] = [];
  let p = start;
  let fy: number | null = null;
  for (let y = 0; y <= displayYears; y++) {
    vals.push(Math.round(p));
    if (p >= target && fy === null) fy = y;
    p = p * 1.07 + savings * 12;
  }
  return { vals, fireYear: fy, fireTarget: Math.round(target) };
}

export function renderOGImage({ savings, expenses, startPortfolio }: OGConfig): React.ReactElement {
  const YEARS = 22;
  const { vals, fireYear, fireTarget } = buildProjection(savings, expenses, startPortfolio, YEARS);

  // Chart dimensions
  const CW = 650, CH = 540;
  const ml = 64, mr = 28, mt = 32, mb = 52;
  const iW = CW - ml - mr, iH = CH - mt - mb;
  const maxVal = vals[YEARS] * 1.08;

  const xOf = (y: number) => ml + (y / YEARS) * iW;
  const yOf = (v: number) => mt + iH - (v / maxVal) * iH;

  const pts = vals.map((v, y) => ({ x: xOf(y), y: yOf(v) }));
  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L ${(ml + iW).toFixed(1)} ${(mt + iH).toFixed(1)} L ${ml.toFixed(1)} ${(mt + iH).toFixed(1)} Z`;

  const fireLineY = yOf(fireTarget).toFixed(1);
  const fireLine  = `M ${ml} ${fireLineY} L ${(ml + iW).toFixed(1)} ${fireLineY}`;
  const dotPt     = fireYear !== null ? pts[fireYear] : null;
  const fireX     = fireYear !== null ? xOf(fireYear) : null;

  const yearsLabel  = fireYear !== null ? String(fireYear) : "—";
  const targetLabel = FMT(fireTarget);
  const savingsDisp = savings >= 1000 ? `$${(savings / 1000).toFixed(0)}k` : `$${savings}`;

  return (
    <div
      style={{
        background: "#08080e",
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        fontFamily: "sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Dot grid */}
      <div style={{
        position: "absolute", inset: "0",
        backgroundImage: "radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }} />

      {/* Teal glow — right side behind chart */}
      <div style={{
        position: "absolute", right: "-60px", top: "-40px",
        width: "680px", height: "680px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(34,211,165,0.13) 0%, transparent 62%)",
      }} />

      {/* Orange accent glow — upper right */}
      <div style={{
        position: "absolute", right: "220px", top: "-100px",
        width: "400px", height: "400px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(249,115,22,0.10) 0%, transparent 60%)",
      }} />

      {/* ── LEFT COLUMN ── */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        width: "510px",
        padding: "52px 0 48px 72px",
        position: "relative",
        zIndex: "1",
        justifyContent: "space-between",
      }}>
        {/* Brand */}
        <div style={{ display: "flex", fontSize: "21px", fontWeight: "700", color: "#e8e8f2", letterSpacing: "-0.5px" }}>
          Until<span style={{ color: "#f97316" }}>Fire</span>
        </div>

        {/* Main headline */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{
            fontSize: "12px", color: "#22d3a5", fontFamily: "monospace",
            letterSpacing: "0.14em", marginBottom: "14px",
          }}>
            FIRE CALCULATOR
          </div>
          <div style={{ fontSize: "48px", fontWeight: "800", color: "#6a6a88", lineHeight: "1.1", letterSpacing: "-1.5px" }}>
            Retire in
          </div>
          <div style={{ fontSize: "110px", fontWeight: "800", color: "#e8e8f2", lineHeight: "0.88", letterSpacing: "-5px" }}>
            {yearsLabel}
          </div>
          <div style={{ fontSize: "48px", fontWeight: "700", color: "#22d3a5", letterSpacing: "-1.5px", marginTop: "8px" }}>
            Years
          </div>
          <div style={{ height: "1px", background: "rgba(255,255,255,0.07)", margin: "22px 0" }} />
          <div style={{ fontSize: "15px", color: "#4a4a6a", lineHeight: "1.55", maxWidth: "360px" }}>
            See how fast you can reach financial independence with real-time projections.
          </div>
        </div>

        {/* Stat pills */}
        <div style={{ display: "flex", gap: "10px" }}>
          {[
            { label: "FIRE target",     val: targetLabel  },
            { label: "Monthly savings", val: savingsDisp  },
            { label: "Est. growth",     val: "7% / yr"    },
          ].map(s => (
            <div key={s.label} style={{
              display: "flex", flexDirection: "column",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "10px", padding: "10px 14px",
            }}>
              <div style={{ fontSize: "16px", fontWeight: "700", color: "#e8e8f2", fontFamily: "monospace" }}>
                {s.val}
              </div>
              <div style={{ fontSize: "11px", color: "#36364a", marginTop: "3px" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT COLUMN: CHART ── */}
      <div style={{ display: "flex", flex: "1", position: "relative" }}>
        <svg
          width={CW}
          height={CH}
          style={{ position: "absolute", right: "0px", top: "48px" }}
        >
          <defs>
            <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3a5" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#22d3a5" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Area fill */}
          <path d={areaPath} fill="url(#ag)" />

          {/* FIRE threshold — horizontal dashed */}
          <path d={fireLine} stroke="#f97316" strokeWidth="1.5" strokeDasharray="6 4" fill="none" opacity="0.5" />

          {/* FIRE year — vertical dashed marker */}
          {fireX !== null && (
            <line
              x1={fireX.toFixed(1)} y1={String(mt)}
              x2={fireX.toFixed(1)} y2={String(mt + iH)}
              stroke="#f97316" strokeWidth="1" strokeDasharray="4 3" opacity="0.4"
            />
          )}

          {/* Portfolio growth line */}
          <path
            d={linePath}
            stroke="#22d3a5" strokeWidth="3"
            fill="none" strokeLinecap="round" strokeLinejoin="round"
          />

          {/* Glow rings at FIRE dot */}
          {dotPt && (
            <>
              <circle cx={dotPt.x.toFixed(1)} cy={dotPt.y.toFixed(1)} r="24" fill="#22d3a5" opacity="0.05" />
              <circle cx={dotPt.x.toFixed(1)} cy={dotPt.y.toFixed(1)} r="15" fill="#22d3a5" opacity="0.10" />
              <circle cx={dotPt.x.toFixed(1)} cy={dotPt.y.toFixed(1)} r="9"  fill="#22d3a5" opacity="0.20" />
              <circle
                cx={dotPt.x.toFixed(1)} cy={dotPt.y.toFixed(1)} r="5"
                fill="#22d3a5" stroke="#08080e" strokeWidth="2.5"
              />
            </>
          )}

          {/* "FIRE" label */}
          {dotPt && (
            <text
              x={(dotPt.x + 13).toFixed(1)} y={(dotPt.y - 13).toFixed(1)}
              fill="#f97316" fontSize="12" fontFamily="monospace" fontWeight="bold"
            >
              FIRE
            </text>
          )}

          {/* Y-axis labels */}
          <text x={String(ml - 7)} y={(yOf(0) + 4).toFixed(1)}
            textAnchor="end" fill="#2a2a3a" fontSize="11" fontFamily="monospace">
            $0
          </text>
          <text x={String(ml - 7)} y={(yOf(fireTarget) + 4).toFixed(1)}
            textAnchor="end" fill="#f97316" fontSize="11" fontFamily="monospace" opacity="0.65">
            {targetLabel}
          </text>
          <text x={String(ml - 7)} y={(yOf(maxVal) + 4).toFixed(1)}
            textAnchor="end" fill="#2a2a3a" fontSize="11" fontFamily="monospace">
            {FMT(maxVal)}
          </text>

          {/* X-axis labels */}
          <text x={xOf(0).toFixed(1)} y={String(mt + iH + 22)}
            textAnchor="middle" fill="#2a2a3a" fontSize="11" fontFamily="monospace">
            Now
          </text>
          {fireYear !== null && (
            <text
              x={xOf(fireYear).toFixed(1)} y={String(mt + iH + 22)}
              textAnchor="middle" fill="#f97316" fontSize="11" fontFamily="monospace" opacity="0.8">
              Yr {fireYear}
            </text>
          )}
          <text x={xOf(YEARS).toFixed(1)} y={String(mt + iH + 22)}
            textAnchor="middle" fill="#2a2a3a" fontSize="11" fontFamily="monospace">
            Yr {YEARS}
          </text>
        </svg>
      </div>

      {/* Bottom gradient bar */}
      <div style={{
        position: "absolute", bottom: "0", left: "0", right: "0", height: "3px",
        background: "linear-gradient(to right, transparent, #22d3a5, #f97316, transparent)",
        opacity: "0.55",
      }} />

      {/* URL watermark */}
      <div style={{
        position: "absolute", bottom: "18px", right: "28px",
        fontSize: "13px", color: "#252534",
        fontFamily: "monospace", letterSpacing: "0.05em",
      }}>
        untilfire.com
      </div>
    </div>
  );
}
