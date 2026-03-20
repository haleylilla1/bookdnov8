import { useState, useEffect, useCallback } from "react";

const NAVY = "#03045E";
const AQUA = "#00B4D8";

/* ── Progress Dots ── */
function ProgressDots({ current }: { current: 1 | 2 | 3 | 4 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
      {[1, 2, 3, 4].map((dot) => {
        const isDone = dot < current;
        const isActive = dot === current;
        return (
          <div key={dot} style={{
            height: 6,
            width: isActive ? 22 : 6,
            borderRadius: 3,
            backgroundColor: isActive ? AQUA : isDone ? AQUA : "#E8EBF0",
            opacity: isDone ? 0.4 : 1,
            transition: "width 0.3s ease",
          }} />
        );
      })}
    </div>
  );
}

/* ── Navy pill button ── */
function NavyButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      width: "100%",
      background: NAVY,
      border: "none",
      borderRadius: 100,
      padding: "17px 24px",
      cursor: "pointer",
      boxSizing: "border-box",
    }}>
      <span style={{
        fontSize: 15,
        fontWeight: 700,
        color: "#fff",
        fontFamily: "'Montserrat', sans-serif",
      }}>{label}</span>
    </button>
  );
}

/* ── Video panel ── */
function VideoPanel({ src, poster, objectPosition = "center" }: {
  src: string; poster: string; objectPosition?: string;
}) {
  return (
    <div style={{
      flexShrink: 0,
      height: 300,
      position: "relative",
      overflow: "hidden",
      background: "#EAF9FF",
    }}>
      <video
        src={src}
        poster={poster}
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition,
          zIndex: 1,
        }}
      />
      {/* Subtle edge dissolve — just enough to blend into white below */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        height: 32,
        background: "linear-gradient(to bottom, transparent, #ffffff)",
        zIndex: 2, pointerEvents: "none",
      }} />
    </div>
  );
}

/* ════════════════════════════════════
   SCREEN 1 — Splash
════════════════════════════════════ */
function Screen1({ onAdvance }: { onAdvance: () => void }) {
  const [pulse, setPulse] = useState(1);

  useEffect(() => {
    const timer = setTimeout(onAdvance, 3000);
    return () => clearTimeout(timer);
  }, [onAdvance]);

  useEffect(() => {
    let dir = -1;
    const interval = setInterval(() => {
      setPulse((p) => {
        const next = p + dir * 0.05;
        if (next <= 0.5) { dir = 1; return 0.5; }
        if (next >= 1.0) { dir = -1; return 1.0; }
        return next;
      });
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div onClick={onAdvance} style={{
      position: "absolute", inset: 0,
      background: "#fff",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
    }}>
      {/* Logo image */}
      <img
        src="/__mockup/bookd-logo.png"
        alt="bookd"
        style={{
          width: 200,
          height: "auto",
          marginBottom: 18,
        }}
      />

      {/* Tagline */}
      <p style={{
        fontSize: 14,
        fontWeight: 600,
        color: "#8A93A8",
        fontFamily: "'Montserrat', sans-serif",
        textAlign: "center",
        padding: "0 44px",
        lineHeight: 1.6,
        margin: 0,
      }}>
        The all-in-one financial tool for independent workers
      </p>

      {/* Tap hint */}
      <div style={{
        position: "absolute",
        bottom: 52,
        opacity: pulse,
        transition: "opacity 0.05s linear",
      }}>
        <span style={{
          fontSize: 11,
          color: "#8A93A8",
          fontFamily: "'Montserrat', sans-serif",
          letterSpacing: "0.08em",
          textTransform: "uppercase" as const,
        }}>Tap to Continue</span>
      </div>
    </div>
  );
}

/* ════════════════════════════════════
   SCREEN 2 — Girl Working
════════════════════════════════════ */
function Screen2({ onAdvance }: { onAdvance: () => void }) {
  return (
    <div style={{ position: "absolute", inset: 0, background: "#fff", display: "flex", flexDirection: "column", paddingTop: 80 }}>
      <VideoPanel src="/__mockup/girl_working2_slow.mp4" poster="/__mockup/girl_working2_poster.jpg" />

      <div style={{ display: "flex", flexDirection: "column", padding: "20px 28px 0", background: "#fff" }}>
        <div>
          <ProgressDots current={2} />

          <p style={{
            fontSize: 10, fontWeight: 700, color: AQUA,
            fontFamily: "'Montserrat', sans-serif",
            textTransform: "uppercase" as const, letterSpacing: "0.12em",
            margin: "0 0 10px",
          }}>The Reality</p>

          <h2 style={{
            fontFamily: "'Poppins', sans-serif", fontWeight: 800,
            fontSize: 22, color: NAVY, lineHeight: 1.2, margin: "0 0 10px",
          }}>
            Tracking mileage and expenses can save{" "}
            <span style={{ color: AQUA }}>more than you think.</span>
          </h2>

          <p style={{
            fontSize: 14, fontWeight: 600, color: "#3a3a5c",
            fontFamily: "'Montserrat', sans-serif", lineHeight: 1.5, margin: "0 0 10px",
          }}>
            Bookd helps with that.
          </p>

          <p style={{
            fontSize: 9, color: "#bbb", fontStyle: "italic",
            fontFamily: "'Montserrat', sans-serif", lineHeight: 1.55, margin: 0,
          }}>
            Bookd is a tracking and organization tool, not a tax advisor. Deduction opportunities vary by individual. Consult a qualified tax professional for advice specific to your situation.
          </p>
        </div>

        <div style={{ paddingTop: 20, paddingBottom: 36 }}>
          <NavyButton label="Continue →" onClick={onAdvance} />
        </div>
      </div>

      <HomeIndicator />
    </div>
  );
}

/* ════════════════════════════════════
   SCREEN 3 — Girl Driving
════════════════════════════════════ */
function Screen3({ onAdvance }: { onAdvance: () => void }) {
  return (
    <div style={{ position: "absolute", inset: 0, background: "#fff", display: "flex", flexDirection: "column", paddingTop: 80 }}>
      <VideoPanel src="/__mockup/girl_driving.mp4" poster="/__mockup/girl_driving_poster.jpg" objectPosition="top" />

      <div style={{ display: "flex", flexDirection: "column", padding: "20px 28px 0", background: "#fff" }}>
        <div>
          <ProgressDots current={3} />

          <p style={{
            fontSize: 10, fontWeight: 700, color: AQUA,
            fontFamily: "'Montserrat', sans-serif",
            textTransform: "uppercase" as const, letterSpacing: "0.12em",
            margin: "0 0 10px",
          }}>Every Mile Counts</p>

          <h2 style={{
            fontFamily: "'Poppins', sans-serif", fontWeight: 800,
            fontSize: 22, color: NAVY, lineHeight: 1.2, margin: "0 0 10px",
          }}>
            Every mile you drive is{" "}
            <span style={{ color: AQUA }}>money back</span>
            {" "}at tax time.
          </h2>

          <p style={{
            fontSize: 14, fontWeight: 600, color: "#3a3a5c",
            fontFamily: "'Montserrat', sans-serif", lineHeight: 1.5, margin: "0 0 10px",
          }}>
            At $0.725/mile, logging 100 miles a week adds up to $3,770 back from the IRS — most gig workers never claim a single one.
          </p>

          <p style={{
            fontSize: 9, color: "#bbb", fontStyle: "italic",
            fontFamily: "'Montserrat', sans-serif", lineHeight: 1.55, margin: 0,
          }}>
            $3,770 = 100 mi/week × 52 weeks × $0.725 (2026 IRS standard mileage rate, Rev. Proc. 2025-29). Only business miles qualify. Verify all deductions with a tax professional.
          </p>
        </div>

        <div style={{ paddingTop: 20, paddingBottom: 36 }}>
          <NavyButton label="Continue →" onClick={onAdvance} />
        </div>
      </div>

      <HomeIndicator />
    </div>
  );
}

/* ════════════════════════════════════
   SCREEN 4 — Girl Celebrating
════════════════════════════════════ */
function Screen4({ onAdvance }: { onAdvance: () => void }) {
  return (
    <div style={{ position: "absolute", inset: 0, background: "#fff", display: "flex", flexDirection: "column", paddingTop: 80 }}>
      <VideoPanel src="/__mockup/girl_cheering.mp4" poster="/__mockup/girl_cheering_poster.jpg" />

      <div style={{ display: "flex", flexDirection: "column", padding: "20px 28px 0", background: "#fff" }}>
        <div>
          <ProgressDots current={4} />

          <p style={{
            fontSize: 10, fontWeight: 700, color: AQUA,
            fontFamily: "'Montserrat', sans-serif",
            textTransform: "uppercase" as const, letterSpacing: "0.12em",
            margin: "0 0 10px",
          }}>Built for You</p>

          <h2 style={{
            fontFamily: "'Poppins', sans-serif", fontWeight: 800,
            fontSize: 22, color: NAVY, lineHeight: 1.2, margin: "0 0 10px",
          }}>
            Keep more of the money{" "}
            <span style={{ color: AQUA }}>you earned.</span>
          </h2>

          <p style={{
            fontSize: 14, fontWeight: 600, color: "#3a3a5c",
            fontFamily: "'Montserrat', sans-serif", lineHeight: 1.5, margin: "0 0 10px",
          }}>
            Built by a freelancer for freelancers — Bookd tracks your income, miles, and expenses so nothing slips through the cracks at tax time.
          </p>

          <p style={{
            fontSize: 9, color: "#bbb", fontStyle: "italic",
            fontFamily: "'Montserrat', sans-serif", lineHeight: 1.55, margin: 0,
          }}>
            Bookd is a financial tracking and organization tool. It does not provide tax, legal, or financial advice. Results vary. Always consult a qualified tax professional.
          </p>
        </div>

        <div style={{ paddingTop: 20, paddingBottom: 36 }}>
          <NavyButton label="Start saving what you earned →" onClick={onAdvance} />
        </div>
      </div>

      <HomeIndicator />
    </div>
  );
}

/* ── Home Indicator ── */
function HomeIndicator() {
  return (
    <div style={{
      position: "absolute", bottom: 10, left: "50%",
      transform: "translateX(-50%)",
      width: 134, height: 5,
      background: "#1a1a2e", borderRadius: 3,
    }} />
  );
}

/* ════════════════════════════════════
   ROOT — WelcomeSequence
════════════════════════════════════ */
export function WelcomeSequence() {
  const [screen, setScreen] = useState<1 | 2 | 3 | 4>(1);
  const [visible, setVisible] = useState<1 | 2 | 3 | 4>(1);
  const [opacity, setOpacity] = useState(1);

  const advance = useCallback((to: 1 | 2 | 3 | 4) => {
    setOpacity(0);
    setTimeout(() => {
      setScreen(to);
      setVisible(to);
      setOpacity(1);
    }, 500);
  }, []);

  const next = useCallback(() => {
    if (screen === 1) advance(2);
    else if (screen === 2) advance(3);
    else if (screen === 3) advance(4);
  }, [screen, advance]);

  return (
    <div style={{
      width: 393, height: 852,
      borderRadius: 55,
      overflow: "hidden",
      position: "relative",
      fontFamily: "'Montserrat', sans-serif",
      background: "#fff",
      transition: "opacity 0.5s ease",
      opacity,
    }}>
      {visible === 1 && <Screen1 onAdvance={next} />}
      {visible === 2 && <Screen2 onAdvance={next} />}
      {visible === 3 && <Screen3 onAdvance={next} />}
      {visible === 4 && <Screen4 onAdvance={() => advance(1)} />}
    </div>
  );
}
