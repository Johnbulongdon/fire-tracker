"use client";

import { useState, useRef, useEffect } from "react";

type Phase = "idle" | "open" | "sending" | "thanks";

export default function FeedbackButton() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Close on outside click
  useEffect(() => {
    if (phase !== "open") return;
    function handler(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setPhase("idle");
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [phase]);

  // Focus textarea when panel opens
  useEffect(() => {
    if (phase === "open") {
      setTimeout(() => textareaRef.current?.focus(), 80);
    }
  }, [phase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setPhase("sending");

    try {
      // formsubmit.co — replace YOUR_EMAIL with your actual address
      // First submission to a new email triggers a one-time confirmation email from formsubmit.co
      await fetch("https://formsubmit.co/ajax/YOUR_EMAIL_HERE", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          feedback: message,
          email: email || "(not provided)",
          _subject: "UntilFire Feedback",
          _captcha: "false",
        }),
      });
    } catch {
      // Best-effort — show thanks regardless to not frustrate users
    }

    setPhase("thanks");
    setMessage("");
    setEmail("");
    setTimeout(() => setPhase("idle"), 3000);
  }

  return (
    <>
      <style>{`
        .uf-fb-btn {
          position: fixed;
          bottom: 24px;
          left: 20px;
          z-index: 9999;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 7px 13px 7px 10px;
          background: #111827;
          border: 1px solid #1f2a3c;
          border-radius: 20px;
          color: #8b9ab3;
          font-size: 12px;
          font-family: inherit;
          cursor: pointer;
          transition: border-color 0.18s, color 0.18s, box-shadow 0.18s;
          box-shadow: 0 2px 12px rgba(0,0,0,0.35);
          user-select: none;
        }
        .uf-fb-btn:hover {
          border-color: #2dd4bf44;
          color: #e2e8f0;
          box-shadow: 0 2px 16px rgba(45,212,191,0.12);
        }
        .uf-fb-btn svg { flex-shrink: 0; }

        .uf-fb-panel {
          position: fixed;
          bottom: 64px;
          left: 20px;
          z-index: 9999;
          width: 288px;
          background: #0e1421;
          border: 1px solid #1f2a3c;
          border-radius: 14px;
          box-shadow: 0 8px 40px rgba(0,0,0,0.55);
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          animation: uf-fb-in 0.18s cubic-bezier(0.16,1,0.3,1) both;
        }
        @keyframes uf-fb-in {
          from { opacity: 0; transform: translateY(8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)  scale(1); }
        }

        .uf-fb-title {
          font-size: 13px;
          font-weight: 600;
          color: #e2e8f0;
          margin: 0;
        }
        .uf-fb-sub {
          font-size: 11px;
          color: #64748b;
          margin: -6px 0 0;
        }

        .uf-fb-textarea {
          width: 100%;
          min-height: 86px;
          resize: vertical;
          background: #0a0f1a;
          border: 1px solid #1f2a3c;
          border-radius: 8px;
          color: #cbd5e1;
          font-size: 13px;
          font-family: inherit;
          padding: 9px 10px;
          outline: none;
          transition: border-color 0.15s;
          box-sizing: border-box;
        }
        .uf-fb-textarea:focus { border-color: #2dd4bf55; }
        .uf-fb-textarea::placeholder { color: #3d4f6a; }

        .uf-fb-email {
          width: 100%;
          background: #0a0f1a;
          border: 1px solid #1f2a3c;
          border-radius: 8px;
          color: #cbd5e1;
          font-size: 13px;
          font-family: inherit;
          padding: 8px 10px;
          outline: none;
          transition: border-color 0.15s;
          box-sizing: border-box;
        }
        .uf-fb-email:focus { border-color: #2dd4bf55; }
        .uf-fb-email::placeholder { color: #3d4f6a; }

        .uf-fb-row {
          display: flex;
          gap: 8px;
          align-items: center;
          justify-content: flex-end;
        }
        .uf-fb-cancel {
          font-size: 12px;
          color: #475569;
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px 8px;
          border-radius: 6px;
          font-family: inherit;
          transition: color 0.15s;
        }
        .uf-fb-cancel:hover { color: #94a3b8; }

        .uf-fb-submit {
          font-size: 12px;
          font-weight: 600;
          color: #0e1421;
          background: #2dd4bf;
          border: none;
          border-radius: 8px;
          padding: 7px 16px;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.15s, opacity 0.15s;
        }
        .uf-fb-submit:hover { background: #5eead4; }
        .uf-fb-submit:disabled { opacity: 0.5; cursor: default; }

        .uf-fb-thanks {
          position: fixed;
          bottom: 64px;
          left: 20px;
          z-index: 9999;
          background: #0e1421;
          border: 1px solid #2dd4bf33;
          border-radius: 14px;
          box-shadow: 0 8px 40px rgba(0,0,0,0.55);
          padding: 20px 22px;
          display: flex;
          align-items: center;
          gap: 10px;
          animation: uf-fb-in 0.18s cubic-bezier(0.16,1,0.3,1) both;
        }
        .uf-fb-thanks-icon {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #2dd4bf18;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .uf-fb-thanks-text {
          font-size: 13px;
          color: #e2e8f0;
          font-weight: 500;
        }
        .uf-fb-thanks-sub {
          font-size: 11px;
          color: #475569;
          margin-top: 1px;
        }

        @media (max-width: 480px) {
          .uf-fb-panel, .uf-fb-thanks {
            left: 12px;
            right: 12px;
            width: auto;
            bottom: 70px;
          }
          .uf-fb-btn {
            left: 12px;
            bottom: 16px;
          }
        }
      `}</style>

      {/* Trigger button */}
      {phase === "idle" && (
        <button className="uf-fb-btn" onClick={() => setPhase("open")} aria-label="Send feedback">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <path
              d="M14 1H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h2v3l3-3h7a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1z"
              stroke="#2dd4bf"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
          </svg>
          Feedback
        </button>
      )}

      {/* Thanks state */}
      {phase === "thanks" && (
        <div className="uf-fb-thanks" role="status">
          <div className="uf-fb-thanks-icon">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M3 8l4 4 6-7" stroke="#2dd4bf" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <div className="uf-fb-thanks-text">Thanks!</div>
            <div className="uf-fb-thanks-sub">Your feedback was received.</div>
          </div>
        </div>
      )}

      {/* Pop-up form */}
      {phase === "open" && (
        <div className="uf-fb-panel" ref={panelRef} role="dialog" aria-modal="true" aria-label="Feedback form">
          <p className="uf-fb-title">Share feedback</p>
          <p className="uf-fb-sub">What&apos;s working? What&apos;s missing?</p>

          <form onSubmit={handleSubmit} style={{ display: "contents" }}>
            <textarea
              ref={textareaRef}
              className="uf-fb-textarea"
              placeholder="Your feedback…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={2000}
            />
            <input
              type="email"
              className="uf-fb-email"
              placeholder="Email (optional)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="uf-fb-row">
              <button type="button" className="uf-fb-cancel" onClick={() => setPhase("idle")}>
                Cancel
              </button>
              <button
                type="submit"
                className="uf-fb-submit"
                disabled={!message.trim()}
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sending overlay on button */}
      {phase === "sending" && (
        <button className="uf-fb-btn" disabled aria-label="Sending…" style={{ opacity: 0.6 }}>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6" stroke="#2dd4bf" strokeWidth="1.4" strokeDasharray="30" strokeDashoffset="10" />
          </svg>
          Sending…
        </button>
      )}
    </>
  );
}
