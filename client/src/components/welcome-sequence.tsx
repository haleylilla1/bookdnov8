import { useState, useEffect, useCallback, useRef, type CSSProperties } from "react";
import logoImage from "@assets/bookd-logo.png";
import { hapticMedium, hapticLight } from "@/lib/haptics";

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
    <button onClick={() => { hapticMedium(); onClick(); }} style={{
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // iOS Safari requires muted+playsInline set as DOM properties (not just
    // React props) before it will allow autoplay.
    video.muted = true;
    video.playsInline = true;
    (video as any).webkitPlaysInline = true;

    const tryPlay = () => {
      video.play()
        .then(() => setVideoReady(true))
        .catch(() => {
          // Autoplay blocked — poster <img> stays visible as a still frame.
          // The webkit controls overlay is hidden via CSS below.
        });
    };

    if (video.readyState >= 1) {
      tryPlay();
    } else {
      video.addEventListener("loadedmetadata", tryPlay, { once: true });
      return () => video.removeEventListener("loadedmetadata", tryPlay);
    }
  }, []);

  const coverStyle: CSSProperties = {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition,
  };

  return (
    <div style={{
      flexShrink: 0,
      height,
      position: "relative",
      overflow: "hidden",
      background: "#EAF9FF",
    }}>
      {/*
        CSS kills the iOS native play-button overlay on <video>.
        -webkit-media-controls-start-playback-button is the large pill button
        iOS paints over every <video> that hasn't started playing yet.
      */}
      <style>{`
        .bookd-video::-webkit-media-controls { display: none !important; }
        .bookd-video::-webkit-media-controls-panel { display: none !important; }
        .bookd-video::-webkit-media-controls-play-button { display: none !important; }
        .bookd-video::-webkit-media-controls-start-playback-button { display: none !important; }
      `}</style>

      {/* Poster image — always shown until the video is playing */}
      <img
        src={poster}
        alt=""
        style={{
          ...coverStyle,
          zIndex: 1,
          opacity: videoReady ? 0 : 1,
          transition: "opacity 0.3s ease",
        }}
      />

      {/* Video on top — no `poster` attr (that triggers the iOS play overlay).
          The img above acts as the placeholder while it loads. */}
      <video
        ref={videoRef}
        src={src}
        autoPlay
        loop
        muted
        playsInline
        className="bookd-video"
        style={{
          ...coverStyle,
          zIndex: 2,
          opacity: videoReady ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
      />

      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        height: 32,
        background: "linear-gradient(to bottom, transparent, #ffffff)",
        zIndex: 3, pointerEvents: "none",
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
    <div onClick={() => { hapticMedium(); onAdvance(); }} style={{
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
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", minHeight: 0, overflow: "hidden", paddingTop: 70 }}>
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
        <button onClick={() => { hapticLight(); onLogin(); }} style={{
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
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", minHeight: 0, overflow: "hidden", paddingTop: 70 }}>
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
        <button onClick={() => { hapticLight(); onLogin(); }} style={{
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
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", minHeight: 0, overflow: "hidden", paddingTop: 70 }}>
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
        <button onClick={() => { hapticLight(); onLogin(); }} style={{
          background: "none", border: "none", color: "#9ca3af",
          fontSize: 13, marginTop: 12, cursor: "pointer",
          display: "block", width: "100%", textAlign: "center",
          fontFamily: "'Montserrat', sans-serif",
        }}>Already have an account? Log in</button>
      </div>
    </div>
  );
}

function EyeToggle({ visible, onToggle }: { visible: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} type="button" style={{ background: "none", border: "none", padding: "0 12px", cursor: "pointer", display: "flex", alignItems: "center", height: 50, flexShrink: 0 }}>
      {visible ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="12" cy="12" r="3" stroke="#9ca3af" strokeWidth="2"/>
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"/>
          <line x1="1" y1="1" x2="23" y2="23" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      )}
    </button>
  );
}

function regFieldStyle(focused: boolean, err?: boolean) {
  return {
    display: "flex", alignItems: "center",
    border: `1.5px solid ${err ? "#ef4444" : focused ? AQUA : "#e5e7eb"}`,
    borderRadius: 12, background: "#fff", overflow: "hidden",
    transition: "border-color 0.15s",
  } as const;
}

function TextField({ label, placeholder, type = "text", value, onChange, inputRef, onEnter, suffix, err }: {
  label: string; placeholder: string; type?: string; value: string;
  onChange: (v: string) => void; inputRef?: ReturnType<typeof useRef<HTMLInputElement>>;
  onEnter?: () => void; suffix?: React.ReactNode; err?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: err ? 6 : 14 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: err ? "#ef4444" : focused ? AQUA : "#6b7280", marginBottom: 5, letterSpacing: "0.02em", transition: "color 0.15s" }}>{label}</label>
      <div style={regFieldStyle(focused, !!err)}>
        <input ref={inputRef} type={type} placeholder={placeholder} value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          onKeyDown={(e) => { if (e.key === "Enter" && onEnter) { e.preventDefault(); onEnter(); } }}
          style={{ flex: 1, height: 50, border: "none", outline: "none", padding: "0 14px", fontSize: 15, color: "#111827", background: "transparent" }}
        />
        {suffix}
      </div>
      {err && <p style={{ fontSize: 11, color: "#ef4444", margin: "4px 0 8px 2px" }}>{err}</p>}
    </div>
  );
}

export function RegistrationStep({ onDone, onLogin }: { onDone: () => void; onLogin?: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);

  const passShort = password.length > 0 && password.length < 8;
  const passMismatch = touched && confirm.length > 0 && password !== confirm;
  const passMatch = confirm.length > 0 && password === confirm && password.length >= 8;
  const isReady = name.trim().length > 0 && email.includes("@") && password.length >= 8 && password === confirm && !loading;

  async function handleSubmit() {
    if (!isReady) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase(), phone: phone.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed. Please try again.");
        setLoading(false);
        return;
      }
      if (data.sessionId) localStorage.setItem("bookd_session", data.sessionId);
      onDone();
    } catch {
      setError("Network error. Please check your connection and try again.");
      setLoading(false);
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "#f9fafb", zIndex: 9999, display: "flex", flexDirection: "column", paddingTop: "env(safe-area-inset-top, 0px)", fontFamily: "'Montserrat', sans-serif" }}>
      {/* Progress dots — same style as OnboardingFlow (total=7, step 0) */}
      <div style={{ flex: 1, overflowY: "auto", overscrollBehavior: "none", padding: "56px 24px 0", boxSizing: "border-box" }}>
        <div style={{ display: "flex", gap: "6px", justifyContent: "center", marginBottom: "24px" }}>
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} style={{ width: i === 0 ? "24px" : "8px", height: "8px", borderRadius: "4px", backgroundColor: i === 0 ? AQUA : "#e5e7eb", transition: "all 0.3s ease" }} />
          ))}
        </div>

        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: AQUA, margin: "0 0 8px" }}>Get Started</p>
        <h1 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: 24, color: NAVY, lineHeight: 1.25, margin: "0 0 6px" }}>
          Create your <span style={{ color: AQUA }}>account</span>
        </h1>
        <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 22px", lineHeight: 1.5 }}>
          Takes about 2 minutes. We'll get you set up right away.
        </p>

        <TextField label="Full name" placeholder="Jane Smith" value={name} onChange={setName} onEnter={() => emailRef.current?.focus()} />
        <TextField label="Email address" placeholder="jane@example.com" type="email" value={email} onChange={setEmail} inputRef={emailRef} onEnter={() => phoneRef.current?.focus()} />

        {/* Phone with +1 prefix */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 5, letterSpacing: "0.02em" }}>Phone number <span style={{ color: "#9ca3af", fontWeight: 400 }}>(optional)</span></label>
          <div style={regFieldStyle(false)}>
            <div style={{ padding: "0 12px", borderRight: "1px solid #e5e7eb", height: 50, display: "flex", alignItems: "center", gap: 6, flexShrink: 0, fontSize: 14, fontWeight: 600, color: "#374151" }}>
              🇺🇸 <span style={{ color: "#9ca3af" }}>+1</span>
            </div>
            <input ref={phoneRef} type="tel" placeholder="(555) 000-0000" value={phone} onChange={(e) => setPhone(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); passwordRef.current?.focus(); } }}
              style={{ flex: 1, height: 50, border: "none", outline: "none", padding: "0 14px", fontSize: 15, color: "#111827", background: "transparent" }}
            />
          </div>
        </div>

        <TextField label="Password" placeholder="At least 8 characters" type={showPass ? "text" : "password"} value={password} onChange={setPassword}
          inputRef={passwordRef} onEnter={() => confirmRef.current?.focus()}
          err={passShort ? "Must be at least 8 characters" : undefined}
          suffix={<EyeToggle visible={showPass} onToggle={() => setShowPass(!showPass)} />}
        />

        {/* Confirm password */}
        <div style={{ marginBottom: 8 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: passMismatch ? "#ef4444" : passMatch ? "#10b981" : "#6b7280", marginBottom: 5, letterSpacing: "0.02em" }}>Confirm password</label>
          <div style={{ display: "flex", alignItems: "center", border: `1.5px solid ${passMismatch ? "#ef4444" : passMatch ? "#10b981" : "#e5e7eb"}`, borderRadius: 12, background: "#fff", overflow: "hidden" }}>
            <input ref={confirmRef} type={showConfirm ? "text" : "password"} placeholder="Re-enter your password" value={confirm}
              onChange={(e) => { setConfirm(e.target.value); setTouched(true); }}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSubmit(); } }}
              style={{ flex: 1, height: 50, border: "none", outline: "none", padding: "0 14px", fontSize: 15, color: "#111827", background: "transparent" }}
            />
            <div style={{ padding: "0 12px", display: "flex", alignItems: "center" }}>
              {passMatch ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              ) : (
                <EyeToggle visible={showConfirm} onToggle={() => setShowConfirm(!showConfirm)} />
              )}
            </div>
          </div>
          {passMismatch && <p style={{ fontSize: 11, color: "#ef4444", margin: "4px 0 0 2px" }}>Passwords don't match</p>}
          {passMatch && <p style={{ fontSize: 11, color: "#10b981", margin: "4px 0 0 2px" }}>Passwords match ✓</p>}
        </div>

        {error && <p style={{ fontSize: 13, color: "#ef4444", margin: "8px 0", textAlign: "center" }}>{error}</p>}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, margin: "14px 0 8px" }}>
          <svg width="12" height="14" viewBox="0 0 14 16" fill="none">
            <rect x="1.5" y="7" width="11" height="8" rx="2" fill={NAVY}/>
            <path d="M4 7V5C4 3.343 5.343 2 7 2C8.657 2 10 3.343 10 5V7" stroke={NAVY} strokeWidth="1.8" strokeLinecap="round" fill="none"/>
            <circle cx="7" cy="11" r="1.2" fill={AQUA}/><rect x="6.35" y="11" width="1.3" height="2" rx="0.65" fill={AQUA}/>
          </svg>
          <span style={{ fontSize: 11, color: "#9ca3af" }}>We never share or sell your data.</span>
        </div>
      </div>

      {/* Pinned CTA */}
      <div style={{ padding: "12px 24px 36px", background: "#f9fafb", flexShrink: 0 }}>
        <button onClick={handleSubmit} disabled={!isReady} style={{ width: "100%", background: isReady ? NAVY : "#e5e7eb", border: "none", borderRadius: 100, padding: "16px 20px", cursor: isReady ? "pointer" : "default", transition: "background 0.2s", boxShadow: isReady ? "0 4px 16px rgba(3,4,94,0.22)" : "none" }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: isReady ? "#fff" : "#9ca3af", fontFamily: "'Poppins', sans-serif" }}>
            {loading ? "Creating account…" : "Create Account →"}
          </span>
        </button>
        <p style={{ textAlign: "center", margin: "14px 0 0", fontSize: 13, color: "#9ca3af" }}>
          Already have an account?{" "}
          <span onClick={onLogin} style={{ color: AQUA, fontWeight: 600, cursor: "pointer" }}>Log in</span>
        </p>
      </div>
    </div>
  );
}

interface WelcomeSequenceProps {
  onComplete: () => void;
  onLogin: () => void;
  showRegistration?: boolean;
}

export function WelcomeSequence({ onComplete, onLogin, showRegistration = false }: WelcomeSequenceProps) {
  const [screen, setScreen] = useState<1 | 2 | 3 | 4 | "reg">(1);
  const [opacity, setOpacity] = useState(1);

  const advance = useCallback((to: 1 | 2 | 3 | 4 | "reg" | "done") => {
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
    else if (screen === 4) advance(showRegistration ? "reg" : "done");
  }, [screen, advance, showRegistration]);

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
        {screen === "reg" && <RegistrationStep onDone={onComplete} onLogin={onLogin} />}
      </div>
    </div>
  );
}
