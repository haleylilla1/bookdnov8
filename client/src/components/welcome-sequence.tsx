import { useState, useEffect, useCallback } from "react";
import logoImage from "@assets/bookd-logo.png";

const NAVY = "#03045E";
const AQUA = "#00B4D8";

function ProgressDots({ current }: { current: 2 | 3 | 4 }) {
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

function VideoPanel({ src, poster, objectPosition = "center", height = 240 }: {
  src: string; poster: string; objectPosition?: string; height?: number;
}) {
  return (
    <div style={{
      flexShrink: 0,
      height,
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
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        height: 32,
        background: "linear-gradient(to bottom, transparent, #ffffff)",
        zIndex: 2, pointerEvents: "none",
      }} />
    </div>
  );
}

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
      <img
        src={logoImage}
        alt="bookd"
        style={{ width: 200, height: "auto", marginBottom: 18 }}
      />
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

function Screen2({ onAdvance, onLogin }: { onAdvance: () => void; onLogin: () => void }) {
  return (
    <div style={{ position: "absolute", inset: 0, background: "#fff", display: "flex", flexDirection: "column" }}>
      <div style={{ height: "env(safe-area-inset-top, 44px)", flexShrink: 0 }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", minHeight: 0, overflow: "hidden" }}>
        <VideoPanel src="/videos/girl_working2_slow.mp4" poster="/videos/girl_working2_poster.jpg" />
        <div style={{ padding: "18px 28px 0" }}>
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
            Independent workers miss{" "}
            <span style={{ color: AQUA }}>thousands</span>
            {" "}in deductions every year.
          </h2>
          <p style={{
            fontSize: 14, fontWeight: 600, color: "#3a3a5c",
            fontFamily: "'Montserrat', sans-serif", lineHeight: 1.5, margin: "0 0 10px",
          }}>
            Tracking mileage and expenses can save more than you think. Bookd helps with that.
          </p>
          <p style={{
            fontSize: 9, color: "#bbb", fontStyle: "italic",
            fontFamily: "'Montserrat', sans-serif", lineHeight: 1.55, margin: 0,
          }}>
            Bookd is a tracking and organization tool, not a tax advisor. Deduction opportunities vary by individual. Consult a qualified tax professional for advice specific to your situation.
          </p>
        </div>
      </div>
      <div style={{ padding: "12px 28px", paddingBottom: "max(28px, env(safe-area-inset-bottom, 28px))", flexShrink: 0 }}>
        <NavyButton label="See how →" onClick={onAdvance} />
        <button onClick={onLogin} style={{
          background: "none", border: "none", color: "#9ca3af",
          fontSize: 13, marginTop: 12, cursor: "pointer",
          display: "block", width: "100%", textAlign: "center",
          fontFamily: "'Montserrat', sans-serif",
        }}>Already have an account? Log in</button>
      </div>
    </div>
  );
}

function Screen3({ onAdvance, onLogin }: { onAdvance: () => void; onLogin: () => void }) {
  return (
    <div style={{ position: "absolute", inset: 0, background: "#fff", display: "flex", flexDirection: "column" }}>
      <div style={{ height: "env(safe-area-inset-top, 44px)", flexShrink: 0 }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", minHeight: 0, overflow: "hidden" }}>
        <VideoPanel src="/videos/girl_driving.mp4" poster="/videos/girl_driving_poster.jpg" objectPosition="top" />
        <div style={{ padding: "18px 28px 0" }}>
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
            At $0.725/mile (2026 IRS rate), logging 100 miles a week adds up to $3,770 in potential deductions per year.{" "}
            <span style={{ color: AQUA }}>And mileage isn't the only thing you need to track.</span>
          </p>
          <p style={{
            fontSize: 9, color: "#bbb", fontStyle: "italic",
            fontFamily: "'Montserrat', sans-serif", lineHeight: 1.55, margin: 0,
          }}>
            $3,770 = 100 mi/week × 52 weeks × $0.725 (2026 IRS standard mileage rate, Rev. Proc. 2025-29). Only business miles qualify. Verify all deductions with a tax professional.
          </p>
        </div>
      </div>
      <div style={{ padding: "12px 28px", paddingBottom: "max(28px, env(safe-area-inset-bottom, 28px))", flexShrink: 0 }}>
        <NavyButton label="Continue →" onClick={onAdvance} />
        <button onClick={onLogin} style={{
          background: "none", border: "none", color: "#9ca3af",
          fontSize: 13, marginTop: 12, cursor: "pointer",
          display: "block", width: "100%", textAlign: "center",
          fontFamily: "'Montserrat', sans-serif",
        }}>Already have an account? Log in</button>
      </div>
    </div>
  );
}

function Screen4({ onAdvance, onLogin }: { onAdvance: () => void; onLogin: () => void }) {
  return (
    <div style={{ position: "absolute", inset: 0, background: "#fff", display: "flex", flexDirection: "column" }}>
      <div style={{ height: "env(safe-area-inset-top, 44px)", flexShrink: 0 }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", minHeight: 0, overflow: "hidden" }}>
        <VideoPanel src="/videos/girl_cheering.mp4" poster="/videos/girl_cheering_poster.jpg" />
        <div style={{ padding: "18px 28px 0" }}>
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
            Bookd helps you keep more of the{" "}
            <span style={{ color: AQUA }}>money you earned.</span>
          </h2>
          <p style={{
            fontSize: 14, fontWeight: 600, color: "#3a3a5c",
            fontFamily: "'Montserrat', sans-serif", lineHeight: 1.5, margin: "0 0 10px",
          }}>
            This app was built with love from freelancers who really <em><span style={{ color: AQUA }}>care</span></em>. Tools for us are often overlooked, so we created something to help track your income, miles, and expenses so you're prepared for tax time.{" "}
            <span style={{ color: AQUA }}>Thanks for being here!</span>
          </p>
          <p style={{
            fontSize: 9, color: "#bbb", fontStyle: "italic",
            fontFamily: "'Montserrat', sans-serif", lineHeight: 1.55, margin: 0,
          }}>
            Bookd is a financial tracking and organization tool. It does not provide tax, legal, or financial advice. Results vary. Always consult a qualified tax professional.
          </p>
        </div>
      </div>
      <div style={{ padding: "12px 28px", paddingBottom: "max(28px, env(safe-area-inset-bottom, 28px))", flexShrink: 0 }}>
        <NavyButton label="Let's get set up →" onClick={onAdvance} />
        <button onClick={onLogin} style={{
          background: "none", border: "none", color: "#9ca3af",
          fontSize: 13, marginTop: 12, cursor: "pointer",
          display: "block", width: "100%", textAlign: "center",
          fontFamily: "'Montserrat', sans-serif",
        }}>Already have an account? Log in</button>
      </div>
    </div>
  );
}

interface WelcomeSequenceProps {
  onComplete: () => void;
  onLogin: () => void;
}

export function WelcomeSequence({ onComplete, onLogin }: WelcomeSequenceProps) {
  const [screen, setScreen] = useState<1 | 2 | 3 | 4>(1);
  const [opacity, setOpacity] = useState(1);

  const advance = useCallback((to: 1 | 2 | 3 | 4 | "done") => {
    setOpacity(0);
    setTimeout(() => {
      if (to === "done") {
        onComplete();
      } else {
        setScreen(to);
        setOpacity(1);
      }
    }, 400);
  }, [onComplete]);

  const next = useCallback(() => {
    if (screen === 1) advance(2);
    else if (screen === 2) advance(3);
    else if (screen === 3) advance(4);
    else if (screen === 4) advance("done");
  }, [screen, advance]);

  return (
    // Outer div: always fully opaque white — never lets the page behind bleed through
    <div style={{
      position: "fixed",
      inset: 0,
      background: "#fff",
      zIndex: 9999,
    }}>
      {/* Inner div: only the content fades, not the backdrop */}
      <div style={{
        position: "absolute",
        inset: 0,
        fontFamily: "'Montserrat', sans-serif",
        transition: "opacity 0.4s ease",
        opacity,
      }}>
        {screen === 1 && <Screen1 onAdvance={next} />}
        {screen === 2 && <Screen2 onAdvance={next} onLogin={onLogin} />}
        {screen === 3 && <Screen3 onAdvance={next} onLogin={onLogin} />}
        {screen === 4 && <Screen4 onAdvance={next} onLogin={onLogin} />}
      </div>
    </div>
  );
}
