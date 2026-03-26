"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  CITIES, City, calcTakeHome, calcFIRE, STATE_TAX,
} from "@/lib/fire-data";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function fmtUSD(n: number) {
  return "$" + Math.round(n).toLocaleString();
}

// ─────────────────────────────────────────────────────────────────────────────
// NAV
// ─────────────────────────────────────────────────────────────────────────────

function Nav({ step, totalSteps, onRestart }: {
  step: number; totalSteps: number; onRestart: () => void;
}) {
  return (
    <nav className="uf-nav">
      <div className="uf-nav-logo">Until<span>Fire</span></div>
      <div className="uf-nav-dots">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div key={i} className={`uf-nav-dot ${i === step ? "active" : i < step ? "done" : ""}`} />
        ))}
      </div>
      <div className="uf-nav-right">
        {step > 0 && (
          <button className="uf-nav-restart" onClick={onRestart}>← Start over</button>
        )}
        {step === 0 && (
          <Link href="/login" className="uf-nav-signin">Sign in →</Link>
        )}
      </div>
    </nav>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WIZARD PROGRESS BAR
// ─────────────────────────────────────────────────────────────────────────────

function WizardProgress({ step }: { step: number }) {
  const steps = ["City", "Income", "Savings"];
  return (
    <div className="uf-wizard-progress">
      {steps.map((_, i) => (
        <div key={i} className="uf-wizard-row">
          <div className={`uf-wdot ${i < step ? "done" : i === step ? "active" : ""}`} />
          {i < steps.length - 1 && (
            <div className={`uf-wline ${i < step ? "done" : i === step ? "active" : ""}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 0 — HERO
// ─────────────────────────────────────────────────────────────────────────────

function HeroScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="uf-screen uf-hero">
      {/* Floating decorative elements */}
      <div className="uf-float-el uf-float-dollar">$</div>
      <div className="uf-float-el uf-float-percent">%</div>
      <div className="uf-float-el uf-float-dot1" />
      <div className="uf-float-el uf-float-dot2" />
      <div className="uf-float-el uf-float-star1">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0l2 6h6l-5 3.5 2 6.5-5-4-5 4 2-6.5L0 6h6z"/></svg>
      </div>
      <div className="uf-float-el uf-float-star2">
        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0l2 6h6l-5 3.5 2 6.5-5-4-5 4 2-6.5L0 6h6z"/></svg>
      </div>

      {/* Radial glow */}
      <div className="uf-hero-glow" />

      <div className="uf-badge">
        <span className="uf-badge-dot" /> Free — no login required
      </div>
      <h1 className="uf-h1">
        Your spending is<br />
        <span className="uf-accent-gradient">costing you years</span><br />
        of freedom.
      </h1>
      <p className="uf-body" style={{ maxWidth: 480, margin: "0 auto 36px" }}>
        Find out exactly when you can retire — adjusted for your city, your income,
        and what you actually spend. Takes 60 seconds.
      </p>
      <button className="uf-btn uf-btn-primary uf-btn-lg uf-btn-full uf-btn-glow" onClick={onStart}>
        Calculate my FIRE number →
      </button>
      <div className="uf-social-proof">
        <div className="uf-avatars">
          {["#f97316","#22d3a5","#a78bfa","#fb923c"].map((c, i) => (
            <div key={i} className="uf-avatar" style={{ background: c }} />
          ))}
        </div>
        <span className="uf-proof-text">
          Joined by <strong>2,400+</strong> FIRE seekers this month
        </span>
      </div>
      <div className="uf-stats-grid">
        <div className="uf-stat-hero"><span className="uf-accent">$5.8B</span><div>market growing 10.3% CAGR</div></div>
        <div className="uf-stat-hero"><span style={{ color: "var(--teal)" }}>2.2M</span><div>r/financialindependence members</div></div>
        <div className="uf-stat-hero"><span style={{ color: "var(--purple)" }}>25%</span><div>Gen Z targeting retirement under 55</div></div>
      </div>

      {/* Scroll indicator chevron */}
      <div className="uf-scroll-indicator">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 1 — CITY
// ─────────────────────────────────────────────────────────────────────────────

interface CityState {
  name: string;
  col: number;
  stateKey: string;
  isCustom: boolean;
}

function CityScreen({ onNext, onBack }: {
  onNext: (c: CityState) => void;
  onBack: () => void;
}) {
  const [query, setQuery]           = useState("");
  const [open, setOpen]             = useState(false);
  const [selected, setSelected]     = useState<CityState | null>(null);
  const [showCustom, setShowCustom] = useState(false);
  const [customMonthly, setCustomMonthly] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const dropRef  = useRef<HTMLDivElement>(null);

  const matches = query.trim()
    ? CITIES.filter(c => c.name.toLowerCase().includes(query.toLowerCase())).slice(0, 8)
    : [];

  function pickCity(city: City) {
    setSelected({ name: city.name, col: city.col, stateKey: city.state, isCustom: false });
    setQuery(city.name);
    setOpen(false);
    setShowCustom(false);
  }

  function openCustom() {
    setOpen(false);
    setShowCustom(true);
    setSelected(null);
    setTimeout(() => document.getElementById("customMonthly")?.focus(), 80);
  }

  function confirmCustom() {
    const monthly = parseInt(customMonthly) || 0;
    if (monthly < 100) return;
    setSelected({ name: query || "Custom City", col: monthly * 12, stateKey: "tx", isCustom: true });
    setShowCustom(false);
  }

  // close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const diff = selected ? selected.col - 52000 : 0;

  return (
    <div className="uf-screen uf-screen-animated">
      <WizardProgress step={0} />
      <p className="uf-step-label">Step 1 of 3</p>
      <div className="uf-eyebrow">Location</div>
      <h2 className="uf-h2">Where do you want<br />to <span className="uf-accent">retire?</span></h2>
      <p className="uf-body" style={{ marginBottom: 32 }}>
        Your FIRE number changes significantly by city. We use real cost-of-living data — not national averages.
      </p>

      {/* Search input */}
      <label className="uf-label">Start typing your city or country</label>
      <div style={{ position: "relative" }}>
        <input
          ref={inputRef}
          type="text"
          className="uf-input"
          placeholder="e.g. Austin, Tokyo, London…"
          value={query}
          autoComplete="off"
          onChange={e => {
            setQuery(e.target.value);
            setOpen(true);
            setSelected(null);
            setShowCustom(false);
          }}
          onFocus={() => { if (query.trim()) setOpen(true); }}
        />
        <svg className="uf-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
        </svg>

        {/* Dropdown */}
        {open && query.trim() && (
          <div ref={dropRef} className="uf-dropdown">
            {matches.map(c => (
              <button key={c.key} className="uf-dropdown-item" onMouseDown={() => pickCity(c)}>
                <span className="uf-dropdown-flag">{c.flag}</span>
                <div>
                  <div className="uf-dropdown-name">{c.name}</div>
                  <div className="uf-dropdown-sub">
                    Est. {fmtUSD(c.col)}/yr · FIRE target {fmtUSD(c.col * 25)}
                  </div>
                </div>
              </button>
            ))}
            {/* Always show custom option */}
            <button className="uf-dropdown-custom" onMouseDown={openCustom}>
              <span className="uf-dropdown-flag">📍</span>
              <div>
                <div className="uf-dropdown-custom-title">
                  &ldquo;{query}&rdquo; — enter my monthly expenses
                </div>
                <div className="uf-dropdown-sub">My city isn&apos;t in the list — I&apos;ll set it manually</div>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Custom city inline form */}
      {showCustom && (
        <div className="uf-custom-city">
          <label className="uf-label">
            Your city isn&apos;t in our list — enter your estimated monthly expenses (USD)
          </label>
          <div className="uf-custom-row">
            <div style={{ position: "relative", flex: 1 }}>
              <span className="uf-input-prefix">$</span>
              <input
                id="customMonthly"
                type="number"
                className="uf-input uf-input-mono"
                style={{ paddingLeft: 28 }}
                placeholder="e.g. 2800"
                min={100}
                value={customMonthly}
                onChange={e => setCustomMonthly(e.target.value)}
              />
            </div>
            <span className="uf-unit">/month</span>
            <button
              className="uf-btn uf-btn-primary"
              disabled={!customMonthly || parseInt(customMonthly) < 100}
              onClick={confirmCustom}
            >
              Use this
            </button>
          </div>
          <p className="uf-hint">
            We&apos;ll calculate your FIRE number using the 25× rule on your annual expenses.
          </p>
        </div>
      )}

      {/* City info card */}
      {selected && (
        <div className="uf-city-info">
          <div className="uf-city-info-label">
            {selected.isCustom
              ? "📍 Custom city — using your manual monthly expense figure"
              : `${CITIES.find(c => c.name === selected.name)?.flag ?? ""} ${STATE_TAX[selected.stateKey]?.label ?? "Local tax rates apply"}`}
          </div>
          <div className="uf-info-card">
            <div className="uf-info-col">
              <div className="uf-info-val">{fmtUSD(selected.col)}</div>
              <div className="uf-info-lab">Est. annual expenses</div>
            </div>
            <div className="uf-info-divider" />
            <div className="uf-info-col">
              <div className="uf-info-val">{fmtUSD(selected.col * 25)}</div>
              <div className="uf-info-lab">FIRE target (25× rule)</div>
            </div>
            <div className="uf-info-divider" />
            <div className="uf-info-col">
              <div className="uf-info-val" style={{ color: diff > 0 ? "var(--danger)" : "var(--teal)" }}>
                {diff >= 0 ? "+" : ""}{fmtUSD(diff)}
              </div>
              <div className="uf-info-lab">vs. US avg</div>
            </div>
          </div>
        </div>
      )}

      <div className="uf-nav-row">
        <button className="uf-btn uf-btn-ghost" onClick={onBack}>Back</button>
        <button
          className="uf-btn uf-btn-primary"
          style={{ flex: 1 }}
          disabled={!selected}
          onClick={() => selected && onNext(selected)}
        >
          Continue →
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 2 — INCOME
// ─────────────────────────────────────────────────────────────────────────────

type IncomeMode = 'annual' | 'monthly' | 'biweekly' | 'hourly' | 'takehome';

const INCOME_MODES: { key: IncomeMode; label: string; unit: string; hint: string }[] = [
  { key: 'annual',    label: 'Annual',    unit: '/year',       hint: 'Yearly gross salary' },
  { key: 'monthly',   label: 'Monthly',   unit: '/month',      hint: 'Monthly gross (×12)' },
  { key: 'biweekly',  label: 'Bi-weekly', unit: '/paycheck',   hint: '26 paychecks/yr' },
  { key: 'hourly',    label: 'Hourly',    unit: '/hr',         hint: '2,080 hrs/yr' },
  { key: 'takehome',  label: 'Take-home', unit: '/month',      hint: 'Skip tax calc — enter what lands in your bank' },
];

// Convert any mode's raw value to annual gross
function toAnnualGross(value: number, mode: IncomeMode): number {
  switch (mode) {
    case 'annual':   return value;
    case 'monthly':  return value * 12;
    case 'biweekly': return value * 26;
    case 'hourly':   return value * 2080;
    case 'takehome': return 0; // handled separately
    default:         return value;
  }
}

function IncomeScreen({ stateKey, onNext, onBack }: {
  stateKey: string;
  onNext: (income: number, takeHomeOverride?: number) => void;
  onBack: () => void;
}) {
  const [mode, setMode]         = useState<IncomeMode>('annual');
  const [rawValue, setRawValue] = useState<string>('90000');
  const [takeHomeRaw, setTakeHomeRaw] = useState<string>(''); // for take-home mode

  const numVal = parseFloat(rawValue) || 0;

  // Derived annual gross
  const annualGross = mode === 'takehome' ? 0 : toAnnualGross(numVal, mode);

  // Take-home mode: user enters monthly take-home directly
  const monthlyTakeHome = mode === 'takehome'
    ? (parseFloat(takeHomeRaw) || 0)
    : 0;
  const annualTakeHome = monthlyTakeHome * 12;

  // Tax calc — use real calc for gross modes, back-calculate for take-home mode
  const tax = mode !== 'takehome' ? calcTakeHome(annualGross, stateKey) : null;

  // For take-home mode: back-calculate effective rate if gross also entered
  const customEffectiveRate = (mode === 'takehome' && annualGross === 0)
    ? null
    : null; // could extend later to accept both gross + take-home

  // What we display in the stat cards
  const displayGross    = mode === 'takehome' ? null : annualGross;
  const displayTakeHome = mode === 'takehome' ? annualTakeHome : (tax?.takeHome ?? 0);
  const displayMonthly  = displayTakeHome / 12;
  const displayHourly   = displayTakeHome / 2080;
  const displayEffRate  = mode === 'takehome' ? null : (tax?.effectiveRate ?? 0);

  // What we pass to FIRE calc (always annual take-home equivalent)
  // For gross modes: use tax.takeHome as proxy for income used in savings rate calc
  // For take-home mode: monthly * 12 is the take-home
  const incomeForFIRE = mode === 'takehome' ? annualTakeHome : (tax?.takeHome ?? 0);

  // Placeholder per mode
  const placeholders: Record<IncomeMode, string> = {
    annual:   '90000',
    monthly:  '7500',
    biweekly: '3462',
    hourly:   '43',
    takehome: '5000',
  };

  const canContinue = mode === 'takehome'
    ? monthlyTakeHome > 0
    : annualGross > 0;

  return (
    <div className="uf-screen uf-screen-animated">
      <WizardProgress step={1} />
      <p className="uf-step-label">Step 2 of 3</p>
      <div className="uf-eyebrow">Income</div>
      <h2 className="uf-h2">What do you <span className="uf-accent">earn?</span></h2>
      <p className="uf-body" style={{ marginBottom: 24 }}>
        Enter however your pay is structured — we&apos;ll handle the conversion.
      </p>

      {/* Mode pills */}
      <div className="uf-mode-pills">
        {INCOME_MODES.map(m => (
          <button
            key={m.key}
            className={`uf-mode-pill ${mode === m.key ? 'active' : ''}`}
            onClick={() => { setMode(m.key); setRawValue(''); }}
          >
            {m.label}
          </button>
        ))}
      </div>
      <p className="uf-hint" style={{ marginBottom: 16 }}>
        {INCOME_MODES.find(m => m.key === mode)?.hint}
      </p>

      {/* Main input */}
      {mode !== 'takehome' ? (
        <>
          <label className="uf-label">
            {mode === 'annual'   && 'Annual gross income'}
            {mode === 'monthly'  && 'Monthly gross income (before tax)'}
            {mode === 'biweekly' && 'Bi-weekly gross paycheck'}
            {mode === 'hourly'   && 'Hourly rate (gross)'}
          </label>
          <div className="uf-big-input-wrap">
            <span className="uf-input-prefix uf-big-prefix">$</span>
            <input
              key={mode}
              type="number"
              className="uf-input uf-input-mono uf-input-big"
              style={{ paddingLeft: 28 }}
              value={rawValue}
              placeholder={placeholders[mode]}
              min={0}
              onChange={e => setRawValue(e.target.value)}
              autoFocus
            />
            <span className="uf-unit">{INCOME_MODES.find(m => m.key === mode)?.unit}</span>
          </div>
          {/* Slider only for annual mode */}
          {mode === 'annual' && (
            <div className="uf-slider-wrap">
              <input
                type="range" min={20000} max={500000} step={5000}
                value={Math.min(annualGross || 0, 500000)}
                className="uf-range"
                onChange={e => setRawValue(e.target.value)}
              />
              <div className="uf-range-labels"><span>$20k</span><span>$250k</span><span>$500k+</span></div>
            </div>
          )}
        </>
      ) : (
        /* Take-home mode */
        <>
          <label className="uf-label">Monthly take-home (what actually lands in your bank)</label>
          <div className="uf-big-input-wrap">
            <span className="uf-input-prefix uf-big-prefix">$</span>
            <input
              type="number"
              className="uf-input uf-input-mono uf-input-big"
              style={{ paddingLeft: 28 }}
              value={takeHomeRaw}
              placeholder="5000"
              min={0}
              onChange={e => setTakeHomeRaw(e.target.value)}
              autoFocus
            />
            <span className="uf-unit">/month</span>
          </div>
          <p className="uf-hint" style={{ marginBottom: 8 }}>
            We&apos;ll skip the tax calculator and use this directly for your FIRE projection.
          </p>
        </>
      )}

      {/* Stat cards */}
      {canContinue && (
        <div className="uf-stat-row" style={{ marginTop: 20 }}>
          {mode !== 'takehome' && displayGross !== null && (
            <div className="uf-stat-box">
              <div className="uf-stat-val">{fmtUSD(displayGross)}</div>
              <div className="uf-stat-lab">Gross annual</div>
            </div>
          )}
          <div className="uf-stat-box">
            <div className="uf-stat-val" style={{ color: 'var(--teal)' }}>{fmtUSD(displayTakeHome)}</div>
            <div className="uf-stat-lab">Annual take-home</div>
          </div>
          <div className="uf-stat-box">
            <div className="uf-stat-val">{fmtUSD(displayMonthly)}</div>
            <div className="uf-stat-lab">Monthly take-home</div>
          </div>
        </div>
      )}

      {/* Tax breakdown — only for gross modes */}
      {mode !== 'takehome' && tax && canContinue && (
        <>
          <div className="uf-card" style={{ marginTop: 14 }}>
            <div className="uf-card-head">Tax breakdown</div>
            <div className="uf-tax-row">
              <span className="uf-tax-label">Federal income tax</span>
              <span className="uf-mono">{tax.fedTax > 0 ? `-${fmtUSD(tax.fedTax)}` : tax.isUSCity ? '$0' : 'n/a'}</span>
            </div>
            <div className="uf-tax-row">
              <span className="uf-tax-label">{tax.isUSCity ? 'State / local tax' : 'Est. income tax'} ({tax.stateInfo.label})</span>
              <span className="uf-mono">{tax.stateTax > 0 ? `-${fmtUSD(tax.stateTax)}` : '$0'}</span>
            </div>
            {tax.isUSCity && (
              <div className="uf-tax-row">
                <span className="uf-tax-label">FICA (Social Security + Medicare)</span>
                <span className="uf-mono">{tax.fica > 0 ? `-${fmtUSD(tax.fica)}` : '$0'}</span>
              </div>
            )}
            <div className="uf-tax-divider" />
            <div className="uf-tax-row" style={{ fontWeight: 500 }}>
              <span>Effective total tax rate</span>
              <span className="uf-mono uf-accent">{displayEffRate?.toFixed(1)}%</span>
            </div>
          </div>
          <div className="uf-card uf-card-accent" style={{ marginTop: 12 }}>
            <div className="uf-card-sub">Your <strong>real hourly rate</strong> after all taxes</div>
            <div className="uf-hourly">{displayHourly.toFixed(2)}/hr</div>
            <div className="uf-card-hint">Based on 2,080 working hours/yr</div>
          </div>
        </>
      )}

      {/* Take-home mode note */}
      {mode === 'takehome' && canContinue && (
        <div className="uf-card" style={{ marginTop: 14, background: 'var(--teal-dim)', borderColor: 'rgba(34,211,165,0.2)' }}>
          <div className="uf-tax-row" style={{ fontWeight: 500 }}>
            <span>Annual take-home (estimated)</span>
            <span className="uf-mono" style={{ color: 'var(--teal)' }}>{fmtUSD(annualTakeHome)}</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 6 }}>
            Tax breakdown skipped — using your real take-home directly. Most accurate option if our tax estimate felt off.
          </div>
        </div>
      )}

      <div className="uf-nav-row">
        <button className="uf-btn uf-btn-ghost" onClick={onBack}>Back</button>
        <button
          className="uf-btn uf-btn-primary"
          style={{ flex: 1 }}
          disabled={!canContinue}
          onClick={() => onNext(incomeForFIRE)}
        >
          Continue →
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 3 — SAVINGS
// ─────────────────────────────────────────────────────────────────────────────

// income is now always annual take-home (already post-tax) from IncomeScreen
function SavingsScreen({ income, stateKey, onNext, onBack }: {
  income: number; stateKey: string;
  onNext: (savings: number) => void;
  onBack: () => void;
}) {
  const [savings, setSavings] = useState(1500);
  // income is already take-home annual — divide by 12 for monthly
  const monthly = income / 12;
  const rate = monthly > 0 ? Math.round((savings / monthly) * 100) : 0;

  const rateColor = rate < 15 ? "var(--danger)" : rate < 30 ? "var(--accent)" : "var(--teal)";
  const rateLabel = rate < 10 ? "Very low" : rate < 20 ? "Below average" : rate < 30 ? "Average"
    : rate < 40 ? "Good" : rate < 50 ? "Strong" : "FIRE pace! 🔥";

  return (
    <div className="uf-screen uf-screen-animated">
      <WizardProgress step={2} />
      <p className="uf-step-label">Step 3 of 3</p>
      <div className="uf-eyebrow">Savings</div>
      <h2 className="uf-h2">How much are you <span className="uf-accent">saving?</span></h2>
      <p className="uf-body" style={{ marginBottom: 32 }}>
        Don&apos;t worry about being exact — we&apos;ll help you track real numbers after setup.
      </p>

      <label className="uf-label">Monthly savings amount</label>
      <div className="uf-big-input-wrap">
        <span className="uf-input-prefix uf-big-prefix">$</span>
        <input
          type="number"
          className="uf-input uf-input-mono uf-input-big"
          style={{ paddingLeft: 28 }}
          value={savings || ""}
          min={0}
          onChange={e => setSavings(Math.max(0, parseInt(e.target.value) || 0))}
          autoFocus
        />
        <span className="uf-unit">/month</span>
      </div>

      <div className="uf-slider-wrap">
        <input
          type="range" min={0} max={10000} step={100}
          value={Math.min(savings, 10000)}
          className="uf-range"
          onChange={e => setSavings(parseInt(e.target.value))}
        />
        <div className="uf-range-labels"><span>$0</span><span>$5k</span><span>$10k/mo</span></div>
      </div>

      <div className="uf-stat-row">
        <div className="uf-stat-box">
          <div className="uf-stat-val uf-accent">{fmtUSD(savings)}/mo</div>
          <div className="uf-stat-lab">Monthly savings</div>
        </div>
        <div className="uf-stat-box">
          <div className="uf-stat-val">{rate}%</div>
          <div className="uf-stat-lab">Of take-home income</div>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <div className="uf-rate-head">
          <span className="uf-tax-label">Savings rate benchmark</span>
          <span style={{ color: rateColor, fontSize: 13, fontWeight: 500 }}>{rateLabel}</span>
        </div>
        <div className="uf-progress-track">
          <div className="uf-progress-fill" style={{ width: `${Math.min(rate * 2, 100)}%`, background: rateColor }} />
        </div>
        <div className="uf-range-labels" style={{ marginTop: 4 }}>
          <span>0%</span><span>20% (Good)</span><span>50%+ (FIRE)</span>
        </div>
      </div>

      <div className="uf-nav-row">
        <button className="uf-btn uf-btn-ghost" onClick={onBack}>Back</button>
        <button className="uf-btn uf-btn-primary" style={{ flex: 1 }} onClick={() => onNext(savings)}>
          Show my FIRE number 🔥
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WAITLIST INLINE — shown on reveal screen
// ─────────────────────────────────────────────────────────────────────────────

function WaitlistInline({ fireTarget, retireYear }: { fireTarget: number; retireYear: number }) {
  const [email, setEmail]   = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  async function handleSubmit() {
    if (!isValid || status === "loading") return;
    setStatus("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, fireTarget, retireYear }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="uf-wl-inline uf-wl-done">
        <span style={{ fontSize: 18 }}>&#x2713;</span>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14, color: "var(--teal)" }}>You&apos;re on the list</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>We&apos;ll email you when the FIRE adviser launches.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="uf-wl-inline">
      <div className="uf-wl-inline-head">
        <div className="uf-wl-inline-title">Get early access to the FIRE adviser</div>
        <div className="uf-wl-inline-sub">
          Tells you exactly what to do each month to reach {fmtUSD(fireTarget)} by {retireYear}. Launching at $9/mo.
        </div>
      </div>
      <div className="uf-wl-inline-form">
        <input
          type="email"
          className="uf-input"
          style={{ flex: 1, fontSize: 14, padding: "11px 14px" }}
          placeholder="your@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
        />
        <button
          className="uf-btn uf-btn-primary"
          style={{ whiteSpace: "nowrap", padding: "11px 20px", fontSize: 14, opacity: status === "loading" ? 0.6 : 1 }}
          disabled={!isValid || status === "loading"}
          onClick={handleSubmit}
        >
          {status === "loading" ? "Joining…" : "Join waitlist"}
        </button>
      </div>
      {status === "error" && (
        <p style={{ fontSize: 12, color: "var(--danger)", marginTop: 6 }}>Something went wrong — try again.</p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 4 — REVEAL
// ─────────────────────────────────────────────────────────────────────────────

function useCountUp(target: number, duration: number, running: boolean) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!running) return;
    const start = performance.now();
    function ease(t: number) { return 1 - Math.pow(1 - t, 4); }
    function tick(now: number) {
      const t = Math.min((now - start) / duration, 1);
      setVal(Math.round(ease(t) * target));
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [target, duration, running]);
  return val;
}

function RevealScreen({ city, income, savings, stateKey, onAdjust }: {
  city: CityState; income: number; savings: number; stateKey: string;
  onAdjust: () => void;
}) {
  const result = calcFIRE(savings, city.col);
  const { takeHome } = calcTakeHome(income, stateKey);

  // Phase 1: calculating steps
  const [calcPhase, setCalcPhase] = useState(true);
  const [activeSteps, setActiveSteps] = useState<number[]>([]);
  const [barPct, setBarPct] = useState(0);

  // Phase 2: number reveal
  const [counting, setCounting] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const numRef = useRef<HTMLDivElement>(null);

  const counted = useCountUp(result.fireTarget, 2200, counting);

  // Run calculating sequence
  useEffect(() => {
    setCalcPhase(true);
    setActiveSteps([]);
    setBarPct(0);
    setCounting(false);
    setRevealed(false);

    const calcSteps = [0, 1, 2, 3];
    calcSteps.forEach((i) => {
      setTimeout(() => {
        setActiveSteps(prev => [...prev, i]);
        setBarPct(((i + 1) / calcSteps.length) * 85);
      }, i * 620);
    });
    setTimeout(() => {
      setBarPct(100);
    }, calcSteps.length * 620);
    setTimeout(() => {
      setCalcPhase(false);
      setCounting(true);
      // Trigger slam animation
      setTimeout(() => {
        numRef.current?.classList.add("uf-fire-slam");
      }, 50);
    }, calcSteps.length * 620 + 800);
  }, []);

  useEffect(() => {
    if (counted >= result.fireTarget && counting) {
      setTimeout(() => setRevealed(true), 300);
    }
  }, [counted, result.fireTarget, counting]);

  // Delta calculations
  const highSaver = calcFIRE((takeHome / 12) * 0.5, city.col);
  const costYears = Math.max(0, result.years - highSaver.years).toFixed(1);

  const d1 = calcFIRE(savings + city.col * 0.04 / 12, city.col);
  const d2 = calcFIRE(savings + 416, city.col);
  const d3 = calcFIRE(Math.max(0, savings - income * 0.1 / 12), city.col);
  const d4 = calcFIRE(savings + 500, city.col);

  const calcLabels = ["City cost-of-living", "After-tax income", "Compound growth at 7%", "25× withdrawal rule"];

  return (
    <div className="uf-screen uf-reveal-screen uf-screen-animated">
      {/* PHASE 1 */}
      {calcPhase && (
        <div className="uf-calc-phase">
          <div className="uf-calc-label">Running your projection…</div>
          <div className="uf-calc-steps">
            {calcLabels.map((label, i) => (
              <span key={i} className={`uf-calc-step ${activeSteps.includes(i) ? "lit" : ""}`}>
                {label}
                {i < calcLabels.length - 1 && <span className="uf-calc-dot">·</span>}
              </span>
            ))}
          </div>
          <div className="uf-calc-bar-track">
            <div className="uf-calc-bar-fill" style={{ width: `${barPct}%` }} />
          </div>
        </div>
      )}

      {/* PHASE 2 */}
      {!calcPhase && (
        <div className="uf-number-phase">
          {/* Hero number */}
          <div className="uf-fire-hero">
            {/* Sparkle decorations around number */}
            <div className="uf-sparkle uf-sparkle-1" />
            <div className="uf-sparkle uf-sparkle-2" />
            <div className="uf-sparkle uf-sparkle-3" />
            <div className="uf-sparkle uf-sparkle-4" />
            <div className="uf-sparkle uf-sparkle-5" />
            <div className="uf-sparkle uf-sparkle-6" />

            <div className="uf-fire-eyebrow">Your estimated FIRE number</div>
            <div ref={numRef} className="uf-fire-num">
              {fmtUSD(counted)}
            </div>
            <div className="uf-fire-date-row">
              <div className="uf-fire-date-line" />
              <div className="uf-fire-date">
                You could retire in {result.retireYear} — age {result.age}
              </div>
              <div className="uf-fire-date-line" />
            </div>
            <div className="uf-fire-city">{city.name}</div>
          </div>

          {revealed && (
            <>
              {/* Cost statement */}
              <div className="uf-cost-card">
                <div className="uf-cost-label">At your current savings rate, your spending is costing you</div>
                <div className="uf-cost-years">{costYears} years</div>
                <div className="uf-cost-sub">of freedom vs. someone saving 50% of their income</div>
              </div>

              {/* Delta grid */}
              <div className="uf-delta-grid">
                {[
                  { label: "Cut dining out by 20%",    val: (result.years - d1.years), positive: true },
                  { label: "Save $500/mo more today",  val: (result.years - d4.years), positive: true },
                  { label: "Take a 10% pay cut",       val: (d3.years - result.years), positive: false },
                  { label: "Invest your annual bonus", val: (result.years - d2.years), positive: true },
                ].map((item, i) => (
                  <div key={i} className={`uf-delta-card ${item.positive ? "positive" : "negative"}`}>
                    <div className="uf-delta-label">{item.label}</div>
                    <div className={`uf-delta-val ${item.positive ? "pos" : "neg"}`}>
                      {item.positive
                        ? item.val > 0 ? `-${item.val.toFixed(1)} yrs` : "< 1 yr"
                        : `+${item.val.toFixed(1)} yrs`}
                    </div>
                  </div>
                ))}
              </div>

              {/* PRIMARY CTA */}
              <Link href="/dashboard" className="uf-btn uf-btn-teal uf-btn-full uf-btn-lg" style={{ marginBottom: 10, display: "flex", justifyContent: "center" }}>
                Make this more accurate — it&apos;s free →
              </Link>
              <Link href="/calculator" className="uf-btn uf-btn-ghost uf-btn-full" style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
                See full wealth projection + charts →
              </Link>

              {/* SECONDARY CTA — waitlist */}
              <WaitlistInline fireTarget={result.fireTarget} retireYear={result.retireYear} />

              <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                <button className="uf-btn uf-btn-ghost" style={{ flex: 1, fontSize: 13 }} onClick={onAdjust}>
                  ← Adjust inputs
                </button>
              </div>
              <p className="uf-disclaimer">
                Estimate only. Not financial advice. Based on 7% real return (historical S&P500 average after inflation).
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WAITLIST
// ─────────────────────────────────────────────────────────────────────────────

function WaitlistSection() {
  const [email, setEmail]   = useState("");
  const [status, setStatus] = useState<"idle"|"loading"|"done"|"error">("idle");

  async function handleSubmit() {
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch { setStatus("error"); }
  }

  return (
    <div className="uf-waitlist-cta">
      <div className="uf-waitlist-cta-inner">
        <div className="uf-waitlist-overline">TRUSTED BY 2,400+ FIRE SEEKERS</div>
        <h2 className="uf-waitlist-headline">Start your path to freedom.</h2>
        <div className="uf-waitlist-card">
          {status === "done" ? (
            <div className="uf-waitlist-success-card">
              <span style={{ fontSize: 24 }}>🎉</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, color: "#1a1a1a" }}>You&apos;re on the list!</div>
                <div style={{ fontSize: 13, color: "#6b6b6b", marginTop: 4 }}>We&apos;ll email you when we launch.</div>
              </div>
            </div>
          ) : (
            <>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#1a1a1a", marginBottom: 4 }}>Get the AI-powered FIRE roadmap</div>
              <div style={{ fontSize: 13, color: "#6b6b6b", marginBottom: 16 }}>Personalized monthly plan to retire faster. Launching at $9/mo.</div>
              <div className="uf-waitlist-form">
                <input
                  type="email" placeholder="your@email.com" value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSubmit()}
                  className="uf-input uf-waitlist-input"
                />
                <button
                  className="uf-btn uf-btn-primary uf-btn-waitlist"
                  disabled={status === "loading"}
                  onClick={handleSubmit}
                  style={{ whiteSpace: "nowrap" }}
                >
                  {status === "loading" ? "Joining…" : "Join waitlist →"}
                </button>
              </div>
              <p className="uf-waitlist-note">No spam. Unsubscribe anytime.</p>
            </>
          )}
          {status === "error" && <p style={{ color: "#ef4444", fontSize: 13, marginTop: 8 }}>Something went wrong — try again.</p>}
        </div>
        <div className="uf-waitlist-footer">© 2026 UntilFire</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT
// ─────────────────────────────────────────────────────────────────────────────

type Screen = "hero" | "city" | "income" | "savings" | "reveal";

export default function Home() {
  const router = useRouter();
  const [screen, setScreen] = useState<Screen>("hero");

  // Wizard state
  const [cityState, setCityState]   = useState<CityState | null>(null);
  const [income, setIncome]         = useState(90000);
  const [savings, setSavings]       = useState(1500);

  // Auth redirect — keep existing behaviour
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push("/dashboard");
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) router.push("/dashboard");
    });
    return () => subscription.unsubscribe();
  }, [router]);

  const STEP_MAP: Record<Screen, number> = { hero: 0, city: 1, income: 2, savings: 3, reveal: 4 };
  const totalDots = 5;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #08080e;
          --bg-card: #13131e;
          --bg-elevated: #1a1a28;
          --bg-light: #f5f0e8;
          --bg-light-card: #ffffff;
          --text-on-light: #1a1a1a;
          --text-muted-light: #6b6b6b;
          --border: #1c1c2e;
          --border-light: #2a2a3e;
          --text: #e8e8f2;
          --text-muted: #6e6e8e;
          --text-dim: #3a3a5a;
          --accent: #f97316;
          --accent-deep: #c2410c;
          --accent-dim: rgba(249,115,22,0.12);
          --accent-glow: rgba(249,115,22,0.25);
          --teal: #22d3a5;
          --teal-dim: rgba(34,211,165,0.12);
          --danger: #ef4444;
          --purple: #a78bfa;
          --font-display: 'Syne', sans-serif;
          --font-body: 'DM Sans', sans-serif;
          --font-mono: 'DM Mono', monospace;
        }

        body { background: var(--bg); color: var(--text); font-family: var(--font-body); min-height: 100vh; }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
        input[type=number] { -moz-appearance: textfield; }

        /* ── ANIMATIONS ── */
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(3deg); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(249,115,22,0.3); }
          50% { box-shadow: 0 0 40px rgba(249,115,22,0.5), 0 0 80px rgba(249,115,22,0.2); }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(8px); }
        }
        @keyframes fireGlow {
          0%   { text-shadow: 0 0 0px rgba(249,115,22,0); }
          40%  { text-shadow: 0 0 60px rgba(249,115,22,0.9), 0 0 120px rgba(249,115,22,0.5); }
          70%  { text-shadow: 0 0 40px rgba(249,115,22,0.7), 0 0 80px rgba(249,115,22,0.35); }
          100% { text-shadow: 0 0 28px rgba(249,115,22,0.5), 0 0 60px rgba(249,115,22,0.2); }
        }
        @keyframes revealSlam {
          0%   { opacity: 0; transform: scale(0.55); }
          60%  { opacity: 1; transform: scale(1.06); }
          80%  { transform: scale(0.97); }
          100% { transform: scale(1); }
        }
        @keyframes pulseBorder {
          0%,100% { box-shadow: 0 0 0 0 rgba(249,115,22,0), 0 0 40px rgba(249,115,22,0.15); }
          50%      { box-shadow: 0 0 0 8px rgba(249,115,22,0.12), 0 0 60px rgba(249,115,22,0.25); }
        }

        .uf-screen-animated { animation: fadeSlideUp 0.6s ease-out; }

        /* ── NAV ── */
        .uf-nav { position: fixed; top: 0; left: 0; right: 0; height: 56px; background: rgba(8,8,14,0.7); display: flex; align-items: center; justify-content: space-between; padding: 0 24px; z-index: 100; backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }
        .uf-nav-logo { font-family: var(--font-display); font-size: 20px; font-weight: 700; color: var(--text); letter-spacing: -0.5px; }
        .uf-nav-logo span { color: var(--accent); }
        .uf-nav-dots { display: flex; gap: 6px; align-items: center; }
        .uf-nav-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--border-light); transition: all 0.3s; }
        .uf-nav-dot.active { background: var(--accent); width: 24px; border-radius: 4px; }
        .uf-nav-dot.done { background: var(--teal); }
        .uf-nav-right { display: flex; align-items: center; min-width: 90px; justify-content: flex-end; }
        .uf-nav-restart { font-size: 13px; color: var(--text-muted); background: none; border: none; cursor: pointer; font-family: var(--font-body); transition: color 0.2s; }
        .uf-nav-restart:hover { color: var(--text); }
        .uf-nav-signin { font-size: 13px; color: var(--text-muted); text-decoration: none; font-family: var(--font-body); transition: color 0.2s; font-weight: 500; }
        .uf-nav-signin:hover { color: var(--accent); }

        /* ── SCREEN ── */
        .uf-page { padding-top: 56px; min-height: 100vh; display: flex; flex-direction: column; align-items: center; }
        .uf-screen { width: 100%; max-width: 540px; padding: 48px 24px 40px; }
        .uf-reveal-screen { max-width: 680px; }

        /* ── TYPOGRAPHY ── */
        .uf-eyebrow { font-size: 12px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; color: var(--accent); margin-bottom: 12px; }
        .uf-h1 { font-family: var(--font-display); font-size: clamp(48px,8vw,90px); font-weight: 800; line-height: 0.95; letter-spacing: -3px; color: var(--text); margin-bottom: 24px; }
        .uf-h2 { font-family: var(--font-display); font-size: clamp(28px,5vw,48px); font-weight: 700; line-height: 1.05; letter-spacing: -1.5px; color: var(--text); margin-bottom: 8px; }
        .uf-accent { color: var(--accent); }
        .uf-accent-gradient { background: linear-gradient(135deg, #f97316, #fb923c); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .uf-body { font-size: 16px; line-height: 1.6; color: var(--text-muted); }
        .uf-mono { font-family: var(--font-mono); }
        .uf-hint { font-size: 11px; color: var(--text-dim); margin-top: 8px; }
        .uf-step-label { font-size: 12px; color: var(--text-muted); margin-bottom: 32px; }

        /* ── WIZARD PROGRESS ── */
        .uf-wizard-progress { display: flex; align-items: center; margin-bottom: 8px; }
        .uf-wizard-row { display: flex; align-items: center; flex: 1; }
        .uf-wizard-row:last-child { flex: 0; }
        .uf-wdot { width: 14px; height: 14px; border-radius: 50%; background: var(--border); flex-shrink: 0; transition: all 0.3s; }
        .uf-wdot.done { background: var(--teal); }
        .uf-wdot.active { background: var(--accent); box-shadow: 0 0 0 4px var(--accent-dim); }
        .uf-wline { flex: 1; height: 2px; background: var(--border); margin: 0 4px; transition: background 0.4s; }
        .uf-wline.done { background: var(--teal); }
        .uf-wline.active { background: var(--accent); }

        /* ── BUTTONS ── */
        .uf-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 14px 28px; border-radius: 999px; font-family: var(--font-body); font-size: 15px; font-weight: 500; cursor: pointer; border: none; transition: all 0.25s; text-decoration: none; }
        .uf-btn-primary { background: var(--accent); color: #fff; }
        .uf-btn-primary:hover:not(:disabled) { background: #ea6b10; transform: translateY(-2px); box-shadow: 0 8px 32px var(--accent-glow), 0 0 40px rgba(249,115,22,0.15); }
        .uf-btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
        .uf-btn-ghost { background: transparent; color: var(--text-muted); border: 1px solid var(--border-light); border-radius: 999px; }
        .uf-btn-ghost:hover { color: var(--text); background: var(--bg-elevated); transform: translateY(-2px); }
        .uf-btn-teal { background: var(--teal); color: #08080e; font-weight: 600; }
        .uf-btn-teal:hover { background: #1dbf96; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(34,211,165,0.25); }
        .uf-btn-full { width: 100%; }
        .uf-btn-lg { padding: 18px 36px; font-size: 17px; }
        .uf-btn-glow { box-shadow: 0 0 40px rgba(249,115,22,0.3), 0 4px 12px rgba(0,0,0,0.3); animation: pulseGlow 3s ease-in-out infinite; }
        .uf-nav-row { margin-top: 32px; display: flex; gap: 12px; }

        /* ── INPUTS ── */
        .uf-label { font-size: 13px; font-weight: 500; color: var(--text-muted); margin-bottom: 8px; display: block; }
        .uf-input { width: 100%; background: var(--bg-elevated); border: 1px solid var(--border-light); border-radius: 10px; padding: 14px 16px; font-family: var(--font-body); font-size: 16px; color: var(--text); outline: none; transition: border-color 0.2s; }
        .uf-input:focus { border-color: var(--accent); }
        .uf-input-mono { font-family: var(--font-mono); font-size: 18px; font-weight: 500; }
        .uf-input-big { padding: 12px 14px; }
        .uf-big-input-wrap { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
        .uf-input-prefix { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-size: 15px; pointer-events: none; }
        .uf-big-prefix { font-size: 18px; font-weight: 500; }
        .uf-unit { font-size: 14px; color: var(--text-muted); white-space: nowrap; }

        /* ── MODE PILLS ── */
        .uf-mode-pills { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 8px; }
        .uf-mode-pill { padding: 8px 18px; border-radius: 999px; font-size: 13px; font-weight: 500; cursor: pointer; border: 1px solid var(--border-light); background: transparent; color: var(--text-muted); font-family: var(--font-body); transition: all 0.15s; }
        .uf-mode-pill:hover { border-color: var(--accent); color: var(--text); }
        .uf-mode-pill.active { background: var(--accent-dim); border-color: var(--accent); color: var(--accent); font-weight: 600; }

        /* ── RANGE SLIDER ── */
        .uf-slider-wrap { margin: 8px 0; }
        .uf-range { width: 100%; -webkit-appearance: none; height: 4px; border-radius: 2px; background: var(--border-light); outline: none; cursor: pointer; }
        .uf-range::-webkit-slider-thumb { -webkit-appearance: none; width: 20px; height: 20px; border-radius: 50%; background: var(--accent); border: 3px solid var(--bg); box-shadow: 0 0 0 2px var(--accent); cursor: pointer; }
        .uf-range-labels { display: flex; justify-content: space-between; font-size: 12px; color: var(--text-dim); margin-top: 6px; }

        /* ── DROPDOWN ── */
        .uf-dropdown { position: absolute; left: 0; right: 0; top: calc(100% + 6px); background: var(--bg-elevated); border: 1px solid var(--border-light); border-radius: 16px; max-height: 280px; overflow-y: auto; z-index: 50; box-shadow: 0 16px 40px rgba(0,0,0,0.4); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }
        .uf-dropdown-item { width: 100%; display: flex; align-items: center; gap: 10px; padding: 12px 16px; background: transparent; border: none; border-bottom: 1px solid var(--border); cursor: pointer; transition: background 0.15s; text-align: left; }
        .uf-dropdown-item:hover { background: var(--bg-card); }
        .uf-dropdown-flag { font-size: 18px; line-height: 1; flex-shrink: 0; }
        .uf-dropdown-name { font-size: 14px; color: var(--text); }
        .uf-dropdown-sub { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
        .uf-dropdown-custom { width: 100%; display: flex; align-items: center; gap: 10px; padding: 13px 16px; background: rgba(249,115,22,0.05); border: none; border-top: 1px solid rgba(249,115,22,0.18); cursor: pointer; transition: background 0.15s; text-align: left; }
        .uf-dropdown-custom:hover { background: rgba(249,115,22,0.12); }
        .uf-dropdown-custom-title { font-size: 14px; color: var(--accent); font-weight: 500; }

        /* ── CUSTOM CITY ── */
        .uf-custom-city { background: rgba(249,115,22,0.07); border: 1px solid rgba(249,115,22,0.3); border-radius: 16px; padding: 16px; margin-top: 14px; }
        .uf-custom-row { display: flex; gap: 10px; align-items: center; }

        /* ── CITY INFO ── */
        .uf-city-info { margin-top: 16px; }
        .uf-city-info-label { font-size: 13px; color: var(--text-muted); margin-bottom: 10px; }
        .uf-info-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; display: flex; overflow: hidden; backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }
        .uf-info-col { flex: 1; padding: 14px 16px; }
        .uf-info-col:not(:last-child) { border-right: 1px solid rgba(255,255,255,0.06); }
        .uf-info-val { font-family: var(--font-mono); font-size: 18px; font-weight: 500; color: var(--accent); }
        .uf-info-lab { font-size: 11px; color: var(--text-muted); margin-top: 4px; }
        .uf-info-divider { width: 1px; background: rgba(255,255,255,0.06); }

        /* ── STAT ROW ── */
        .uf-stat-row { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; margin-top: 20px; }
        .uf-stat-box { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 14px 16px; backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); transition: all 0.25s; }
        .uf-stat-box:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(0,0,0,0.3); }
        .uf-stat-val { font-family: var(--font-mono); font-size: 18px; font-weight: 500; color: var(--text); }
        .uf-stat-lab { font-size: 11px; color: var(--text-muted); margin-top: 4px; }

        /* ── CARD ── */
        .uf-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 16px 20px; backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }
        .uf-card-accent { background: var(--accent-dim); border-color: rgba(249,115,22,0.2); }
        .uf-card-head { font-size: 11px; color: var(--text-muted); font-weight: 500; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
        .uf-card-sub { font-size: 13px; color: var(--text-muted); }
        .uf-card-hint { font-size: 12px; color: var(--text-dim); margin-top: 4px; }
        .uf-hourly { font-family: var(--font-mono); font-size: 24px; font-weight: 500; color: var(--accent); margin-top: 4px; }
        .uf-hourly::before { content: '$'; }

        /* ── TAX ── */
        .uf-tax-row { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 7px; }
        .uf-tax-label { color: var(--text-muted); }
        .uf-tax-divider { border-top: 1px solid var(--border); margin: 6px 0; }

        /* ── PROGRESS BAR ── */
        .uf-progress-track { background: var(--border); border-radius: 4px; height: 8px; overflow: hidden; }
        .uf-progress-fill { height: 100%; border-radius: 4px; transition: width 0.6s ease; }
        .uf-rate-head { display: flex; justify-content: space-between; margin-bottom: 6px; }

        /* ── HERO SCREEN ── */
        .uf-hero { text-align: center; max-width: 680px; padding-top: 100px; padding-bottom: 60px; position: relative; border-radius: 0 0 24px 24px; overflow: hidden; min-height: calc(100vh - 56px); display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .uf-hero-glow { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: radial-gradient(ellipse at 50% 40%, rgba(249,115,22,0.12) 0%, transparent 60%); pointer-events: none; z-index: 0; }
        .uf-hero > * { position: relative; z-index: 1; }
        .uf-badge { display: inline-flex; align-items: center; gap: 8px; padding: 7px 18px; background: var(--accent-dim); color: var(--accent); border-radius: 999px; font-size: 13px; font-weight: 500; margin-bottom: 28px; }
        .uf-badge-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--accent); }
        .uf-social-proof { display: flex; align-items: center; justify-content: center; gap: 12px; margin-top: 28px; }
        .uf-avatars { display: flex; }
        .uf-avatar { width: 28px; height: 28px; border-radius: 50%; border: 2px solid var(--bg); margin-left: -6px; }
        .uf-avatar:first-child { margin-left: 0; }
        .uf-proof-text { font-size: 13px; color: var(--text-muted); }
        .uf-stats-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; margin-top: 48px; width: 100%; }
        .uf-stat-hero { background: rgba(255,255,255,0.04); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 20px; text-align: center; font-size: 12px; color: var(--text-muted); transition: all 0.25s; }
        .uf-stat-hero:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(0,0,0,0.3); }
        .uf-stat-hero span { display: block; font-family: var(--font-display); font-size: 28px; font-weight: 800; margin-bottom: 4px; }

        /* ── FLOATING DECORATIVE ELEMENTS ── */
        .uf-float-el { position: absolute; pointer-events: none; z-index: 0; }
        .uf-float-dollar { top: 12%; right: 10%; font-family: var(--font-display); font-size: 40px; color: var(--text); opacity: 0.06; animation: float 8s ease-in-out infinite; }
        .uf-float-percent { bottom: 18%; left: 8%; font-family: var(--font-display); font-size: 30px; color: var(--text); opacity: 0.05; animation: float 10s ease-in-out infinite 1s; }
        .uf-float-dot1 { top: 50%; left: 6%; width: 6px; height: 6px; border-radius: 50%; background: var(--accent); opacity: 0.15; animation: sparkle 3s ease-in-out infinite; }
        .uf-float-dot2 { top: 20%; left: 15%; width: 4px; height: 4px; border-radius: 50%; background: var(--teal); opacity: 0.1; animation: sparkle 4s ease-in-out infinite 0.5s; }
        .uf-float-star1 { top: 25%; right: 15%; color: var(--accent); opacity: 0.08; animation: float 12s ease-in-out infinite 2s; }
        .uf-float-star2 { bottom: 30%; right: 8%; color: var(--accent); opacity: 0.06; animation: float 9s ease-in-out infinite 3s; }

        /* ── SCROLL INDICATOR ── */
        .uf-scroll-indicator { margin-top: 40px; color: var(--text-muted); opacity: 0.4; animation: bounce 2s ease-in-out infinite; }

        /* ── REVEAL ── */
        .uf-calc-phase { text-align: center; padding: 60px 0; }
        .uf-calc-label { font-size: 13px; color: var(--text-muted); letter-spacing: 2px; text-transform: uppercase; margin-bottom: 32px; }
        .uf-calc-steps { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin-bottom: 32px; }
        .uf-calc-step { font-size: 13px; color: var(--text-muted); opacity: 0.3; transition: opacity 0.4s, color 0.4s, font-weight 0.4s; }
        .uf-calc-step.lit { opacity: 1; color: var(--accent); font-weight: 600; }
        .uf-calc-dot { margin: 0 6px; color: var(--border-light); }
        .uf-calc-bar-track { max-width: 320px; margin: 0 auto; background: var(--border); border-radius: 4px; height: 3px; overflow: hidden; }
        .uf-calc-bar-fill { height: 100%; background: var(--accent); border-radius: 4px; transition: width 0.4s ease; }

        .uf-number-phase {}

        .uf-fire-slam { animation: revealSlam 0.7s cubic-bezier(0.34,1.56,0.64,1) forwards, fireGlow 1.6s ease 0.5s forwards; }

        .uf-fire-hero {
          text-align: center;
          padding: 48px 28px;
          margin-bottom: 28px;
          border-radius: 24px;
          background: radial-gradient(ellipse at 50% 50%, rgba(249,115,22,0.1) 0%, transparent 70%), rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          animation: pulseBorder 2.5s ease 0.8s infinite;
          width: 100%;
          overflow: hidden;
          position: relative;
        }
        .uf-fire-eyebrow { font-size: 11px; font-weight: 500; letter-spacing: 4px; text-transform: uppercase; color: var(--text-muted); margin-bottom: 18px; }
        .uf-fire-num {
          font-family: var(--font-mono);
          font-size: clamp(32px, 7vw, 72px);
          font-weight: 500;
          letter-spacing: -1px;
          line-height: 1.1;
          color: var(--accent);
          width: 100%;
          text-align: center;
          word-break: break-all;
        }
        .uf-fire-date-row { margin-top: 20px; display: flex; align-items: center; justify-content: center; gap: 16px; }
        .uf-fire-date-line { height: 1px; flex: 1; max-width: 60px; background: var(--border-light); }
        .uf-fire-date { font-family: var(--font-mono); font-size: 16px; color: var(--teal); letter-spacing: 0.5px; }
        .uf-fire-city { font-size: 12px; color: var(--text-dim); margin-top: 8px; }

        /* ── SPARKLE DOTS ── */
        .uf-sparkle { position: absolute; width: 5px; height: 5px; border-radius: 50%; background: var(--accent); pointer-events: none; }
        .uf-sparkle-1 { top: 15%; left: 10%; animation: sparkle 2.5s ease-in-out infinite; }
        .uf-sparkle-2 { top: 10%; right: 15%; animation: sparkle 3s ease-in-out infinite 0.3s; }
        .uf-sparkle-3 { bottom: 20%; left: 8%; animation: sparkle 2.8s ease-in-out infinite 0.6s; }
        .uf-sparkle-4 { bottom: 15%; right: 10%; animation: sparkle 3.2s ease-in-out infinite 1s; }
        .uf-sparkle-5 { top: 40%; left: 3%; width: 3px; height: 3px; animation: sparkle 4s ease-in-out infinite 1.5s; background: var(--teal); }
        .uf-sparkle-6 { top: 35%; right: 5%; width: 4px; height: 4px; animation: sparkle 3.5s ease-in-out infinite 0.8s; background: var(--purple); }

        .uf-cost-card { background: rgba(249,115,22,0.06); border: 1px solid rgba(249,115,22,0.18); border-radius: 16px; padding: 20px 24px; text-align: center; margin-bottom: 20px; }
        .uf-cost-label { font-size: 13px; color: var(--text-muted); margin-bottom: 6px; }
        .uf-cost-years { font-family: var(--font-display); font-size: 40px; font-weight: 800; color: var(--accent); line-height: 1; }
        .uf-cost-sub { font-size: 12px; color: var(--text-muted); margin-top: 6px; }

        .uf-delta-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 12px; margin-bottom: 20px; }
        .uf-delta-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 16px; backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); transition: all 0.25s; }
        .uf-delta-card:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(0,0,0,0.3); }
        .uf-delta-card.positive { border-color: rgba(34,211,165,0.25); }
        .uf-delta-card.negative { border-color: rgba(239,68,68,0.2); }
        .uf-delta-label { font-size: 12px; color: var(--text-muted); margin-bottom: 6px; }
        .uf-delta-val { font-family: var(--font-mono); font-size: 20px; font-weight: 500; }
        .uf-delta-val.pos { color: var(--teal); }
        .uf-delta-val.neg { color: var(--danger); }

        .uf-disclaimer { text-align: center; font-size: 11px; color: var(--text-dim); margin-top: 14px; }

        /* ── WAITLIST INLINE ── */
        .uf-wl-inline { background: rgba(255,255,255,0.04); border: 1px solid rgba(249,115,22,0.2); border-radius: 16px; padding: 18px 20px; margin-top: 12px; backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }
        .uf-wl-inline-head { margin-bottom: 12px; }
        .uf-wl-inline-title { font-size: 14px; font-weight: 600; color: var(--text); margin-bottom: 4px; }
        .uf-wl-inline-sub { font-size: 12px; color: var(--text-muted); line-height: 1.5; }
        .uf-wl-inline-form { display: flex; gap: 8px; }
        .uf-wl-done { display: flex; align-items: center; gap: 12px; background: var(--teal-dim); border-color: rgba(34,211,165,0.25); }

        /* ── WAITLIST CTA (Bold orange full-bleed) ── */
        .uf-waitlist-cta { width: 100%; background: var(--accent); padding: 80px 24px 48px; }
        .uf-waitlist-cta-inner { max-width: 560px; margin: 0 auto; text-align: center; }
        .uf-waitlist-overline { font-size: 12px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: rgba(255,255,255,0.8); margin-bottom: 16px; }
        .uf-waitlist-headline { font-family: var(--font-display); font-size: clamp(32px, 5vw, 64px); font-weight: 800; color: #fff; line-height: 1.05; letter-spacing: -2px; margin-bottom: 36px; }
        .uf-waitlist-card { background: #fff; border-radius: 24px; padding: 32px 28px; box-shadow: 0 24px 64px rgba(0,0,0,0.15); text-align: left; }
        .uf-waitlist-success-card { display: flex; align-items: center; gap: 14px; }
        .uf-waitlist-form { display: flex; gap: 10px; }
        .uf-waitlist-input { background: #f5f5f5; border: 1px solid #e0e0e0; color: #1a1a1a; border-radius: 999px; }
        .uf-waitlist-input:focus { border-color: var(--accent); }
        .uf-waitlist-input::placeholder { color: #999; }
        .uf-btn-waitlist { border-radius: 999px; }
        .uf-waitlist-note { font-size: 12px; color: #999; margin-top: 12px; text-align: center; }
        .uf-waitlist-footer { color: rgba(255,255,255,0.6); font-size: 13px; margin-top: 32px; }

        /* ── FOOTER DIVIDER ── */
        .uf-divider { border: none; border-top: 1px solid var(--border); margin: 0; }

        /* ── RESPONSIVE ── */
        @media (max-width: 639px) {
          .uf-float-el { display: none; }
          .uf-hero { padding-top: 72px; min-height: auto; }
          .uf-stats-grid { grid-template-columns: 1fr; gap: 12px; }
          .uf-stat-row { grid-template-columns: 1fr 1fr; }
          .uf-delta-grid { grid-template-columns: 1fr; }
          .uf-waitlist-form { flex-direction: column; }
          .uf-wl-inline-form { flex-direction: column; }
          .uf-info-card { flex-direction: column; }
          .uf-info-col:not(:last-child) { border-right: none; border-bottom: 1px solid rgba(255,255,255,0.06); }
          .uf-info-divider { width: auto; height: 1px; background: rgba(255,255,255,0.06); }
          .uf-waitlist-card { padding: 24px 20px; }
        }
      `}</style>

      <Nav
        step={STEP_MAP[screen]}
        totalSteps={totalDots}
        onRestart={() => setScreen("hero")}
      />

      <div className="uf-page">
        {screen === "hero" && (
          <HeroScreen onStart={() => setScreen("city")} />
        )}
        {screen === "city" && (
          <CityScreen
            onNext={c => { setCityState(c); setScreen("income"); }}
            onBack={() => setScreen("hero")}
          />
        )}
        {screen === "income" && (
          <IncomeScreen
            stateKey={cityState?.stateKey ?? "tx"}
            onNext={inc => { setIncome(inc); setScreen("savings"); }}
            onBack={() => setScreen("city")}
          />
        )}
        {screen === "savings" && (
          <SavingsScreen
            income={income}
            stateKey={cityState?.stateKey ?? "tx"}
            onNext={sav => { setSavings(sav); setScreen("reveal"); }}
            onBack={() => setScreen("income")}
          />
        )}
        {screen === "reveal" && cityState && (
          <RevealScreen
            city={cityState}
            income={income}
            savings={savings}
            stateKey={cityState.stateKey}
            onAdjust={() => setScreen("savings")}
          />
        )}

        <WaitlistSection />
      </div>
    </>
  );
}
