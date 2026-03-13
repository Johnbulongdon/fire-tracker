"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

const CITY_DATA: Record<string, { col: number; emoji: string; tax: number }> = {
  "New York": { col: 1.35, emoji: "🗽", tax: 0.30 },
  "San Francisco": { col: 1.45, emoji: "🌉", tax: 0.32 },
  "Los Angeles": { col: 1.20, emoji: "🎬", tax: 0.28 },
  "Chicago": { col: 1.00, emoji: "🏙️", tax: 0.25 },
  "Austin": { col: 0.90, emoji: "🤠", tax: 0.20 },
  "Miami": { col: 1.05, emoji: "🌴", tax: 0.21 },
  "Seattle": { col: 1.15, emoji: "☕", tax: 0.24 },
  "Denver": { col: 0.95, emoji: "🏔️", tax: 0.22 },
  "Nashville": { col: 0.85, emoji: "🎸", tax: 0.19 },
  "Phoenix": { col: 0.82, emoji: "☀️", tax: 0.20 },
  "Boston": { col: 1.25, emoji: "🦞", tax: 0.27 },
  "Portland": { col: 1.05, emoji: "🌲", tax: 0.24 },
  "Remote / Other": { col: 0.85, emoji: "🌍", tax: 0.22 },
};

const CITIES = Object.keys(CITY_DATA);

const fmt = (n: number) =>
  n >= 1_000_000
    ? `$${(n / 1_000_000).toFixed(2)}M`
    : n >= 1_000
    ? `$${(n / 1_000).toFixed(0)}k`
    : `$${Math.round(n).toLocaleString()}`;

function useCountUp(target: number, duration = 1800, running = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!running) return;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 4);
      setVal(Math.round(ease * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, running]);
  return val;
}

function Particles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const particles = Array.from({ length: 55 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      alpha: Math.random() * 0.4 + 0.1,
    }));
    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(249,115,22,${p.alpha})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.6 }}
    />
  );
}

function CityStep({ value, onChange, onNext }: { value: string; onChange: (v: string) => void; onNext: () => void }) {
  const [search, setSearch] = useState("");
  const filtered = CITIES.filter((c) => c.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="uf-step">
      <div className="uf-step-label">Step 1 of 3</div>
      <h2 className="uf-step-title">Where do you live?</h2>
      <p className="uf-step-sub">Cost of living varies hugely — your city shapes your FIRE number.</p>
      <input
        className="uf-search"
        placeholder="Search city..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        autoFocus
      />
      <div className="uf-city-grid">
        {filtered.map((city) => (
          <button
            key={city}
            className={`uf-city-btn ${value === city ? "active" : ""}`}
            onClick={() => { onChange(city); onNext(); }}
          >
            <span style={{ fontSize: 22 }}>{CITY_DATA[city].emoji}</span>
            <span style={{ fontSize: 12, fontWeight: 600 }}>{city}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function IncomeStep({ value, onChange, onNext, onBack }: { value: number; onChange: (v: number) => void; onNext: () => void; onBack: () => void }) {
  const [raw, setRaw] = useState<number | "">(value || "");
  const presets = [50000, 75000, 100000, 150000, 200000];
  return (
    <div className="uf-step">
      <div className="uf-step-label">Step 2 of 3</div>
      <h2 className="uf-step-title">What&apos;s your annual income?</h2>
      <p className="uf-step-sub">Enter your gross salary — we&apos;ll handle taxes based on your city.</p>
      <div className="uf-big-input-wrap">
        <span className="uf-big-prefix">$</span>
        <input
          className="uf-big-input"
          type="number"
          placeholder="80,000"
          value={raw}
          onChange={(e) => { const v = Number(e.target.value); setRaw(v); onChange(v); }}
          autoFocus
        />
        <span className="uf-big-suffix">/ yr</span>
      </div>
      <div className="uf-presets">
        {presets.map((p) => (
          <button key={p} className={`uf-preset ${raw === p ? "active" : ""}`} onClick={() => { setRaw(p); onChange(p); }}>{fmt(p)}</button>
        ))}
      </div>
      <div className="uf-nav">
        <button className="uf-back" onClick={onBack}>← Back</button>
        <button className="uf-next" disabled={!raw || raw <= 0} onClick={onNext}>Continue →</button>
      </div>
    </div>
  );
}

function SavingsStep({ value, income, onChange, onNext, onBack }: { value: number; income: number; onChange: (v: number) => void; onNext: () => void; onBack: () => void }) {
  const [raw, setRaw] = useState<number | "">(value || "");
  const monthly = Math.round((income || 0) / 12);
  const presets = [0.1, 0.2, 0.3, 0.5].map((r) => Math.round(monthly * r)).filter(Boolean);
  const rate = income && raw ? ((Number(raw) * 12) / income * 100).toFixed(0) : null;

  return (
    <div className="uf-step">
      <div className="uf-step-label">Step 3 of 3</div>
      <h2 className="uf-step-title">How much do you save monthly?</h2>
      <p className="uf-step-sub">Money you invest each month — 401k, brokerage, crypto, all of it.</p>
      <div className="uf-big-input-wrap">
        <span className="uf-big-prefix">$</span>
        <input
          className="uf-big-input"
          type="number"
          placeholder="1,000"
          value={raw}
          onChange={(e) => { const v = Number(e.target.value); setRaw(v); onChange(v); }}
          autoFocus
        />
        <span className="uf-big-suffix">/ mo</span>
      </div>
      {rate && (
        <div style={{ color: Number(rate) >= 30 ? "#22d3a5" : Number(rate) >= 15 ? "#f97316" : "#ef4444", fontWeight: 700, fontSize: 14, padding: "8px 14px", background: "rgba(255,255,255,0.04)", borderRadius: 8 }}>
          {Number(rate) >= 50 ? "🔥 FIRE pace!" : Number(rate) >= 30 ? "💪 Strong saver" : Number(rate) >= 15 ? "📈 Good start" : "⚠️ Room to grow"}&nbsp;&nbsp;{rate}% savings rate
        </div>
      )}
      <div className="uf-presets">
        {presets.map((p) => (
          <button key={p} className={`uf-preset ${raw === p ? "active" : ""}`} onClick={() => { setRaw(p); onChange(p); }}>{fmt(p)}/mo</button>
        ))}
      </div>
      <div className="uf-nav">
        <button className="uf-back" onClick={onBack}>← Back</button>
        <button className="uf-next" disabled={!raw || Number(raw) <= 0} onClick={onNext}>Calculate my number →</button>
      </div>
    </div>
  );
}

function MagicReveal({ city, income, monthlySavings }: { city: string; income: number; monthlySavings: number }) {
  const cityInfo = CITY_DATA[city] || CITY_DATA["Remote / Other"];
  const afterTax = income * (1 - cityInfo.tax);
  const annualExpenses = afterTax - monthlySavings * 12;
  const monthlyExpenses = annualExpenses / 12;
  const fireTarget = Math.round(annualExpenses * 25 * cityInfo.col);
  const currentAge = 30;
  const rate = 0.08 / 12;
  let months = 0;
  let balance = 0;
  while (balance < fireTarget && months < 960) {
    balance = balance * (1 + rate) + monthlySavings;
    months++;
  }
  const yearsToFire = months < 960 ? (months / 12).toFixed(1) : "50+";
  const fireAge = months < 960 ? Math.round(currentAge + months / 12) : 70;

  const [show, setShow] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const counted = useCountUp(fireTarget, 2200, show);

  useEffect(() => { const t = setTimeout(() => setShow(true), 300); return () => clearTimeout(t); }, []);
  useEffect(() => { if (counted >= fireTarget) setTimeout(() => setRevealed(true), 400); }, [counted, fireTarget]);

  return (
    <div className="uf-reveal">
      <div className="uf-orb" />
      <div className="uf-step-label" style={{ textAlign: "center" }}>{cityInfo.emoji} {city}</div>
      <h2 className="uf-step-title" style={{ textAlign: "center" }}>Your Magic Number</h2>
      <p className="uf-step-sub" style={{ textAlign: "center" }}>The exact amount you need to never work again</p>
      <div className="uf-magic-num">
        ${counted >= 1_000_000 ? `${(counted / 1_000_000).toFixed(2)}M` : `${(counted / 1_000).toFixed(0)}k`}
      </div>
      {revealed && (
        <>
          <div className="uf-stats-row">
            <div className="uf-stat"><div className="uf-stat-val">{yearsToFire} yrs</div><div className="uf-stat-lbl">Time to FIRE</div></div>
            <div className="uf-stat-div" />
            <div className="uf-stat"><div className="uf-stat-val">Age {fireAge}</div><div className="uf-stat-lbl">You retire at</div></div>
            <div className="uf-stat-div" />
            <div className="uf-stat"><div className="uf-stat-val">{fmt(monthlyExpenses)}</div><div className="uf-stat-lbl">Monthly spend</div></div>
          </div>
          <div className="uf-insights">
            <div className="uf-insight">
              <div style={{ fontSize: 20 }}>📍</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>City adjustment</div>
                <div style={{ color: "#5e5e7a", fontSize: 12, lineHeight: 1.5 }}>
                  Living in {city} adds a {((cityInfo.col - 1) * 100).toFixed(0)}% {cityInfo.col >= 1 ? "premium" : "discount"} to your number vs. average.
                </div>
              </div>
            </div>
            <div className="uf-insight">
              <div style={{ fontSize: 20 }}>⚡</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>The 4% rule</div>
                <div style={{ color: "#5e5e7a", fontSize: 12, lineHeight: 1.5 }}>
                  At {fmt(fireTarget)}, you can withdraw {fmt(fireTarget * 0.04 / 12)}/mo forever.
                </div>
              </div>
            </div>
          </div>
          <div className="uf-cta">
            <div>
              <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 4 }}>Track your journey to {fmt(fireTarget)}</div>
              <div style={{ color: "#5e5e7a", fontSize: 13 }}>Budget tracker · Monthly progress · AI roadmap</div>
            </div>
            <Link href="/dashboard" className="uf-cta-btn">Start tracking — Free →</Link>
          </div>
          <div style={{ color: "#5e5e7a", fontSize: 11, textAlign: "center" }}>
            Based on 8% average annual returns · 25x rule · {city} cost of living
          </div>
        </>
      )}
    </div>
  );
}

function WaitlistSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  const handleSubmit = async () => {
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) setStatus("done");
      else setStatus("error");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div style={{ background: "#08080e", borderTop: "1px solid #1c1c2e", padding: "80px 40px", textAlign: "center" }}>
      <div style={{ maxWidth: 520, margin: "0 auto" }}>
        <div style={{ color: "#f97316", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>
          🔥 Coming Soon
        </div>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 36, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 12 }}>
          Get the AI roadmap
        </h2>
        <p style={{ color: "#5e5e7a", fontSize: 16, lineHeight: 1.7, marginBottom: 32 }}>
          Join the waitlist for the AI-powered FIRE roadmap — personalized monthly plan to retire faster. Launching at $9/mo.
        </p>
        {status === "done" ? (
          <div style={{ background: "rgba(34,211,165,0.1)", border: "1px solid rgba(34,211,165,0.3)", borderRadius: 14, padding: "20px 24px", color: "#22d3a5", fontWeight: 700, fontSize: 16 }}>
            🎉 You&apos;re on the list! We&apos;ll email you when we launch.
          </div>
        ) : (
          <div style={{ display: "flex", gap: 10, maxWidth: 440, margin: "0 auto" }}>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              style={{ flex: 1, background: "#13131e", border: "1px solid #1c1c2e", borderRadius: 10, padding: "14px 16px", color: "#e8e8f2", fontSize: 14, outline: "none", fontFamily: "inherit" }}
            />
            <button
              onClick={handleSubmit}
              disabled={status === "loading"}
              style={{ background: "#f97316", color: "#fff", border: "none", borderRadius: 10, padding: "14px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Syne', sans-serif", whiteSpace: "nowrap", opacity: status === "loading" ? 0.7 : 1 }}
            >
              {status === "loading" ? "Joining..." : "Join waitlist →"}
            </button>
          </div>
        )}
        {status === "error" && <div style={{ color: "#ef4444", fontSize: 13, marginTop: 12 }}>Something went wrong — try again.</div>}
        <div style={{ color: "#5e5e7a", fontSize: 12, marginTop: 16 }}>No spam. Unsubscribe anytime.</div>
      </div>
    </div>
  );
}

export default function Home() {
  const [screen, setScreen] = useState<"hero" | "step1" | "step2" | "step3" | "reveal">("hero");
  const [city, setCity] = useState("");
  const [income, setIncome] = useState(0);
  const [savings, setSavings] = useState(0);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@500;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        body { background: #08080e; color: #e8e8f2; font-family: 'DM Sans', sans-serif; margin: 0; }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }

        .uf-nav-bar { display:flex; align-items:center; justify-content:space-between; padding:0 40px; height:60px; border-bottom:1px solid #1c1c2e; position:sticky; top:0; background:rgba(8,8,14,0.9); backdrop-filter:blur(12px); z-index:50; }
        .uf-logo { font-family:'Syne',sans-serif; font-size:20px; font-weight:800; letter-spacing:-0.04em; text-decoration:none; color:#e8e8f2; }
        .uf-logo span { color:#f97316; }
        .uf-nav-cta { background:#f97316; color:#fff; border:none; border-radius:8px; padding:8px 18px; font-size:13px; font-weight:700; cursor:pointer; font-family:inherit; text-decoration:none; }

        .uf-hero { min-height:calc(100vh - 60px); display:grid; grid-template-columns:1fr 1fr; align-items:center; gap:60px; padding:60px 80px; position:relative; overflow:hidden; }
        .uf-hero::before { content:''; position:absolute; inset:0; background:radial-gradient(ellipse 60% 60% at 30% 50%, rgba(249,115,22,0.08) 0%, transparent 70%), radial-gradient(ellipse 40% 40% at 70% 70%, rgba(34,211,165,0.05) 0%, transparent 70%); pointer-events:none; }
        .uf-hero-content { position:relative; z-index:2; }
        .uf-badge { display:inline-flex; align-items:center; gap:6px; background:rgba(249,115,22,0.12); border:1px solid rgba(249,115,22,0.25); color:#f97316; border-radius:20px; padding:5px 14px; font-size:12px; font-weight:700; letter-spacing:0.04em; text-transform:uppercase; margin-bottom:24px; animation:ufFadeUp 0.6s ease both; }
        .uf-headline { font-family:'Syne',sans-serif; font-size:clamp(44px,6vw,72px); font-weight:800; line-height:1.05; letter-spacing:-0.03em; animation:ufFadeUp 0.6s 0.1s ease both; margin:0 0 20px; }
        .uf-headline-accent { background:linear-gradient(90deg,#f97316,#fb923c,#fbbf24); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
        .uf-hero-sub { color:#5e5e7a; font-size:17px; line-height:1.7; margin:0 0 36px; max-width:480px; animation:ufFadeUp 0.6s 0.2s ease both; }
        .uf-btn-hero { background:#f97316; color:#fff; border:none; border-radius:12px; padding:16px 36px; font-size:16px; font-weight:700; cursor:pointer; font-family:'Syne',sans-serif; box-shadow:0 0 40px rgba(249,115,22,0.35); transition:transform 0.15s,box-shadow 0.15s; animation:ufFadeUp 0.6s 0.3s ease both; }
        .uf-btn-hero:hover { transform:translateY(-2px); box-shadow:0 0 60px rgba(249,115,22,0.5); }
        .uf-social-proof { display:flex; align-items:center; gap:12px; margin-top:20px; font-size:13px; color:#5e5e7a; animation:ufFadeUp 0.6s 0.4s ease both; }
        .uf-avatars { display:flex; }
        .uf-avatar { width:28px; height:28px; border-radius:50%; background:#13131e; border:2px solid #08080e; display:flex; align-items:center; justify-content:center; font-size:14px; margin-left:-6px; }
        .uf-avatar:first-child { margin-left:0; }

        .uf-float-card { position:relative; z-index:2; background:#13131e; border:1px solid #1c1c2e; border-radius:24px; padding:32px 36px; box-shadow:0 0 80px rgba(249,115,22,0.12), 0 20px 60px rgba(0,0,0,0.5); animation:ufFloatIn 0.8s 0.2s cubic-bezier(0.16,1,0.3,1) both; }
        .uf-float-label { color:#5e5e7a; font-size:11px; text-transform:uppercase; letter-spacing:0.1em; font-weight:700; margin-bottom:8px; }
        .uf-float-num { font-family:'DM Mono',monospace; font-size:48px; font-weight:700; color:#f97316; line-height:1; margin-bottom:8px; }
        .uf-float-sub { color:#5e5e7a; font-size:13px; margin-bottom:20px; }
        .uf-float-bar { height:8px; background:#1c1c2e; border-radius:8px; overflow:hidden; margin-bottom:6px; }
        .uf-float-fill { height:100%; width:23%; background:linear-gradient(90deg,#f97316,#fbbf24); border-radius:8px; animation:ufGrow 1.5s 1s cubic-bezier(0.16,1,0.3,1) both; }
        .uf-float-row { display:flex; justify-content:space-between; font-size:11px; }

        .uf-shell { min-height:calc(100vh - 60px); display:flex; flex-direction:column; align-items:center; justify-content:center; padding:40px 24px; }
        .uf-card { background:#13131e; border:1px solid #1c1c2e; border-radius:24px; padding:48px; width:100%; max-width:600px; box-shadow:0 20px 60px rgba(0,0,0,0.5); animation:ufFadeUp 0.4s ease both; position:relative; overflow:hidden; }
        .uf-progress { display:flex; gap:6px; margin-bottom:32px; }
        .uf-step { display:flex; flex-direction:column; gap:20px; }
        .uf-step-label { color:#f97316; font-size:11px; text-transform:uppercase; letter-spacing:0.12em; font-weight:700; }
        .uf-step-title { font-family:'Syne',sans-serif; font-size:28px; font-weight:800; letter-spacing:-0.03em; margin:0; }
        .uf-step-sub { color:#5e5e7a; font-size:14px; line-height:1.6; margin:0; }
        .uf-search { background:#08080e; border:1px solid #1c1c2e; border-radius:10px; padding:10px 14px; color:#e8e8f2; font-size:14px; width:100%; outline:none; font-family:inherit; transition:border-color 0.2s; }
        .uf-search:focus { border-color:#f97316; }
        .uf-city-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; max-height:280px; overflow-y:auto; }
        .uf-city-btn { display:flex; flex-direction:column; align-items:center; gap:4px; background:#08080e; border:1px solid #1c1c2e; border-radius:12px; padding:12px 8px; cursor:pointer; transition:all 0.15s; font-family:inherit; color:#e8e8f2; }
        .uf-city-btn:hover,.uf-city-btn.active { border-color:#f97316; background:rgba(249,115,22,0.1); }
        .uf-big-input-wrap { display:flex; align-items:center; gap:8px; background:#08080e; border:1px solid #1c1c2e; border-radius:14px; padding:14px 20px; transition:border-color 0.2s; }
        .uf-big-input-wrap:focus-within { border-color:#f97316; }
        .uf-big-prefix { color:#f97316; font-family:'DM Mono',monospace; font-size:24px; font-weight:700; }
        .uf-big-suffix { color:#5e5e7a; font-size:16px; white-space:nowrap; }
        .uf-big-input { background:none; border:none; outline:none; color:#e8e8f2; font-size:32px; font-family:'DM Mono',monospace; font-weight:700; width:100%; }
        .uf-presets { display:flex; gap:8px; flex-wrap:wrap; }
        .uf-preset { background:#08080e; border:1px solid #1c1c2e; border-radius:8px; padding:6px 14px; font-size:13px; color:#5e5e7a; cursor:pointer; font-family:inherit; font-weight:600; transition:all 0.15s; }
        .uf-preset:hover,.uf-preset.active { border-color:#f97316; color:#f97316; background:rgba(249,115,22,0.1); }
        .uf-nav { display:flex; justify-content:space-between; align-items:center; margin-top:8px; }
        .uf-back { background:none; border:none; color:#5e5e7a; font-size:14px; cursor:pointer; font-family:inherit; font-weight:600; }
        .uf-back:hover { color:#e8e8f2; }
        .uf-next { background:#f97316; color:#fff; border:none; border-radius:10px; padding:13px 28px; font-size:15px; font-weight:700; cursor:pointer; font-family:'Syne',sans-serif; transition:opacity 0.2s,transform 0.15s; }
        .uf-next:hover:not(:disabled) { transform:translateY(-1px); }
        .uf-next:disabled { opacity:0.35; cursor:not-allowed; }

        .uf-reveal { display:flex; flex-direction:column; align-items:center; gap:24px; }
        .uf-orb { position:absolute; width:300px; height:300px; border-radius:50%; background:radial-gradient(circle,rgba(249,115,22,0.18) 0%,transparent 70%); pointer-events:none; left:50%; top:50%; transform:translate(-50%,-50%); animation:ufPulse 3s ease-in-out infinite; }
        .uf-magic-num { font-family:'DM Mono',monospace; font-size:clamp(52px,10vw,80px); font-weight:700; color:#f97316; line-height:1; text-shadow:0 0 60px rgba(249,115,22,0.5); }
        .uf-stats-row { display:flex; align-items:center; background:#08080e; border:1px solid #1c1c2e; border-radius:16px; padding:20px 32px; width:100%; justify-content:space-between; animation:ufFadeUp 0.5s ease both; }
        .uf-stat { text-align:center; flex:1; }
        .uf-stat-val { font-family:'DM Mono',monospace; font-size:24px; font-weight:700; }
        .uf-stat-lbl { color:#5e5e7a; font-size:11px; text-transform:uppercase; letter-spacing:0.08em; margin-top:4px; }
        .uf-stat-div { width:1px; height:40px; background:#1c1c2e; }
        .uf-insights { display:grid; grid-template-columns:1fr 1fr; gap:12px; width:100%; animation:ufFadeUp 0.5s 0.1s ease both; }
        .uf-insight { display:flex; gap:12px; align-items:flex-start; background:#08080e; border:1px solid #1c1c2e; border-radius:14px; padding:16px; }
        .uf-cta { display:flex; align-items:center; justify-content:space-between; gap:20px; background:linear-gradient(135deg,rgba(249,115,22,0.12),rgba(34,211,165,0.06)); border:1px solid rgba(249,115,22,0.3); border-radius:16px; padding:24px 28px; width:100%; animation:ufFadeUp 0.5s 0.2s ease both; }
        .uf-cta-btn { background:#f97316; color:#fff; border:none; border-radius:10px; padding:13px 24px; font-size:14px; font-weight:700; cursor:pointer; font-family:'Syne',sans-serif; white-space:nowrap; text-decoration:none; box-shadow:0 0 30px rgba(249,115,22,0.3); transition:transform 0.15s; }
        .uf-cta-btn:hover { transform:translateY(-2px); }

        @keyframes ufFadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes ufFloatIn { from{opacity:0;transform:translateX(30px) rotate(2deg)} to{opacity:1;transform:translateX(0) rotate(0)} }
        @keyframes ufGrow { from{width:0} to{width:23%} }
        @keyframes ufPulse { 0%,100%{transform:translate(-50%,-50%) scale(1);opacity:1} 50%{transform:translate(-50%,-50%) scale(1.15);opacity:0.7} }

        @media(max-width:768px){
          .uf-hero{grid-template-columns:1fr;padding:40px 24px;}
          .uf-float-card{display:none;}
          .uf-city-grid{grid-template-columns:repeat(2,1fr);}
          .uf-insights{grid-template-columns:1fr;}
          .uf-cta{flex-direction:column;}
          .uf-card{padding:28px 20px;}
          .uf-nav-bar{padding:0 20px;}
        }
      `}</style>

      {/* NAV */}
      <nav className="uf-nav-bar">
        <Link href="/" className="uf-logo">Until<span>Fire</span></Link>
        <div style={{ display: "flex", gap: 28 }}>
          <Link href="/dashboard" style={{ color: "#5e5e7a", fontSize: 13, fontWeight: 500, textDecoration: "none" }}>Dashboard</Link>
        </div>
        <button className="uf-nav-cta" onClick={() => setScreen("step1")}>Calculate free →</button>
      </nav>

      {/* HERO */}
      {screen === "hero" && (
  <>
    <div className="uf-hero">
      <Particles />
      <div className="uf-hero-content">
        <div className="uf-badge">🔥 Free FIRE Calculator</div>
        <h1 className="uf-headline">
          What&apos;s your<br />
          <span className="uf-headline-accent">magic number?</span>
        </h1>
        <p className="uf-hero-sub">Find out exactly how much you need to retire — personalized to your city, income, and savings. Takes 60 seconds.</p>
        <button className="uf-btn-hero" onClick={() => setScreen("step1")}>Start my journey →</button>
        <div className="uf-social-proof">
          <div className="uf-avatars">
            {["🧑‍💻", "👩‍🏫", "🧑‍⚕️", "👨‍🎨", "👩‍🔬"].map((e, i) => <div key={i} className="uf-avatar">{e}</div>)}
          </div>
          <span>12,400+ people found their number this month</span>
        </div>
      </div>
      <div className="uf-float-card">
        <div className="uf-float-label">FIRE Target</div>
        <div className="uf-float-num">$1.84M</div>
        <div className="uf-float-sub">Retire at age 47 · 15.2 years away</div>
        <div className="uf-float-bar"><div className="uf-float-fill" /></div>
        <div className="uf-float-row">
          <span style={{ color: "#5e5e7a" }}>$0</span>
          <span style={{ color: "#f97316", fontWeight: 700 }}>23% there</span>
          <span style={{ color: "#5e5e7a" }}>$1.84M</span>
        </div>
      </div>
    </div>
    <WaitlistSection />
  </>
)}

      {/* ONBOARDING */}
      {(screen === "step1" || screen === "step2" || screen === "step3" || screen === "reveal") && (
        <div className="uf-shell">
          <div className="uf-card">
            {screen !== "reveal" && (
              <div className="uf-progress">
                {[1, 2, 3].map((n) => {
                  const active = screen === `step${n}`;
                  const done = (screen === "step2" && n === 1) || (screen === "step3" && n <= 2);
                  return (
                    <div key={n} style={{ height: 4, flex: active ? 3 : 1, borderRadius: 4, background: done || active ? "#f97316" : "#1c1c2e", transition: "all 0.4s" }} />
                  );
                })}
              </div>
            )}
            {screen === "step1" && <CityStep value={city} onChange={setCity} onNext={() => setScreen("step2")} />}
            {screen === "step2" && <IncomeStep value={income} onChange={setIncome} onNext={() => setScreen("step3")} onBack={() => setScreen("step1")} />}
            {screen === "step3" && <SavingsStep value={savings} income={income} onChange={setSavings} onNext={() => setScreen("reveal")} onBack={() => setScreen("step2")} />}
            {screen === "reveal" && <MagicReveal city={city} income={income} monthlySavings={savings} />}
          </div>
        </div>
      )}
    </>
  );
}