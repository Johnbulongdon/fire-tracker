import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#08080e",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Dot grid background */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* Orange glow */}
        <div
          style={{
            position: "absolute",
            top: -80,
            left: "50%",
            transform: "translateX(-50%)",
            width: 700,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(249,115,22,0.20) 0%, transparent 65%)",
            filter: "blur(40px)",
          }}
        />

        {/* Content */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 0,
          }}
        >
          {/* Logo */}
          <div
            style={{
              display: "flex",
              fontWeight: 800,
              fontSize: 28,
              letterSpacing: "-1px",
              color: "#e8e8f2",
              marginBottom: 36,
            }}
          >
            Until<span style={{ color: "#f97316" }}>Fire</span>
          </div>

          {/* Headline */}
          <div
            style={{
              fontSize: 64,
              fontWeight: 800,
              color: "#e8e8f2",
              letterSpacing: "-2px",
              lineHeight: 1.05,
              textAlign: "center",
              marginBottom: 20,
              maxWidth: 880,
            }}
          >
            Your spending is{" "}
            <span style={{ color: "#f97316" }}>costing you years</span>{" "}
            of freedom.
          </div>

          {/* Subline */}
          <div
            style={{
              fontSize: 22,
              color: "#6e6e8e",
              textAlign: "center",
              marginBottom: 44,
              maxWidth: 620,
              lineHeight: 1.5,
            }}
          >
            Find your FIRE number. See exactly when you can retire — adjusted for your city, income, and spending.
          </div>

          {/* Stats row */}
          <div style={{ display: "flex", gap: 40 }}>
            {[
              { val: "263", label: "cities worldwide" },
              { val: "60s", label: "to your number" },
              { val: "100%", label: "free, no login" },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 14,
                  padding: "16px 32px",
                }}
              >
                <div
                  style={{
                    fontSize: 32,
                    fontWeight: 700,
                    color: "#f97316",
                    fontFamily: "monospace",
                    marginBottom: 4,
                  }}
                >
                  {s.val}
                </div>
                <div style={{ fontSize: 14, color: "#6e6e8e" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* URL */}
          <div
            style={{
              marginTop: 40,
              fontSize: 16,
              color: "#3a3a5a",
              fontFamily: "monospace",
              letterSpacing: "1px",
            }}
          >
            untilfire.com
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
