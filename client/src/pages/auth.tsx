import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import logoImage from "@assets/bookd-logo.png";
import { WelcomeSequence, RegistrationStep } from "@/components/welcome-sequence";

const NAVY = "#03045E";
const AQUA = "#00B4D8";

const GOOGLE_ERROR_MESSAGES: Record<string, string> = {
  google_denied: "Google sign-in was cancelled.",
  google_failed: "Google sign-in failed. Please try again.",
  google_no_email: "Your Google account didn't share an email address. Please use email sign-in.",
  google_not_configured: "Google sign-in is not available right now.",
  account_disabled: "This account has been disabled. Please contact support.",
};

/* ── Splash screen (glowing logo) ── */
function SplashScreen({ onDone }: { onDone: () => void }) {
  const [pulse, setPulse] = useState(1);

  useEffect(() => {
    const timer = setTimeout(onDone, 2800);
    return () => clearTimeout(timer);
  }, [onDone]);

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
    <div onClick={onDone} style={{
      position: "fixed", inset: 0,
      background: "#fff",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      cursor: "pointer", zIndex: 9999,
      fontFamily: "'Montserrat', sans-serif",
    }}>
      <img src={logoImage} alt="bookd" style={{ width: 200, height: "auto", marginBottom: 18 }} />
      <p style={{ fontSize: 14, fontWeight: 600, color: "#8A93A8", textAlign: "center", padding: "0 44px", lineHeight: 1.6, margin: 0 }}>
        The all-in-one financial tool for independent workers
      </p>
      <div style={{ position: "absolute", bottom: 52, opacity: pulse, transition: "opacity 0.05s linear" }}>
        <span style={{ fontSize: 11, color: "#8A93A8", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Tap to Continue
        </span>
      </div>
    </div>
  );
}

/* ── Login form ── */
function LoginForm({ onGetStarted }: { onGetStarted: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const { toast } = useToast();

  const isReady = email.includes("@") && password.length >= 6;

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!isReady) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Cache-Control": "no-cache" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: data.error || "Login failed. Please try again.", variant: "destructive" });
        return;
      }
      if (data.sessionId) localStorage.setItem("sessionId", data.sessionId);
      window.location.href = "/";
    } catch {
      toast({ title: "Unable to connect. Check your internet connection.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    if (!forgotEmail.includes("@")) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail.trim().toLowerCase() }),
      });
      setForgotSent(true);
    } catch {
      // still show "sent" to prevent email enumeration
      setForgotSent(true);
    } finally {
      setLoading(false);
    }
  }

  const input: React.CSSProperties = {
    width: "100%", height: 52, fontSize: 16, padding: "0 14px",
    border: "1.5px solid #e5e7eb", borderRadius: 12,
    outline: "none", background: "#fff", color: "#111827",
    fontFamily: "'Montserrat', sans-serif", boxSizing: "border-box",
  };

  if (forgotMode) {
    return (
      <div style={{ position: "fixed", inset: 0, background: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 28px", fontFamily: "'Montserrat', sans-serif" }}>
        <img src={logoImage} alt="bookd" style={{ width: 140, marginBottom: 36 }} />
        {forgotSent ? (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📬</div>
            <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: 22, color: NAVY, margin: "0 0 10px", textAlign: "center" }}>Check your email</h2>
            <p style={{ fontSize: 14, color: "#6b7280", textAlign: "center", lineHeight: 1.6, margin: "0 0 28px" }}>
              If an account exists for <strong>{forgotEmail}</strong>, we've sent a password reset link.
            </p>
            <button onClick={() => { setForgotMode(false); setForgotSent(false); setForgotEmail(""); }} style={{ fontSize: 14, color: AQUA, fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>
              ← Back to login
            </button>
          </>
        ) : (
          <>
            <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: 22, color: NAVY, margin: "0 0 8px", textAlign: "center" }}>Reset password</h2>
            <p style={{ fontSize: 14, color: "#6b7280", textAlign: "center", lineHeight: 1.6, margin: "0 0 24px" }}>Enter your email and we'll send a reset link.</p>
            <form onSubmit={handleForgot} style={{ width: "100%", maxWidth: 360 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6 }}>Email address</label>
              <input type="email" placeholder="you@example.com" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} style={{ ...input, marginBottom: 16 }} />
              <button type="submit" disabled={!forgotEmail.includes("@") || loading} style={{ width: "100%", background: forgotEmail.includes("@") ? NAVY : "#e5e7eb", border: "none", borderRadius: 100, padding: "16px 20px", cursor: forgotEmail.includes("@") ? "pointer" : "default", marginBottom: 16 }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: forgotEmail.includes("@") ? "#fff" : "#9ca3af", fontFamily: "'Poppins', sans-serif" }}>
                  {loading ? "Sending…" : "Send reset link"}
                </span>
              </button>
            </form>
            <button onClick={() => setForgotMode(false)} style={{ fontSize: 14, color: AQUA, fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>
              ← Back to login
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "#fff", display: "flex", flexDirection: "column", fontFamily: "'Montserrat', sans-serif", overflowY: "auto" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "60px 28px 24px", maxWidth: 430, width: "100%", margin: "0 auto", boxSizing: "border-box" }}>
        {/* Logo */}
        <img src={logoImage} alt="bookd" style={{ width: 120, marginBottom: 32, display: "block" }} />

        <h1 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: 28, color: NAVY, margin: "0 0 6px", lineHeight: 1.2 }}>Welcome back</h1>
        <p style={{ fontSize: 14, color: "#6b7280", margin: "0 0 30px", lineHeight: 1.5 }}>Sign in to your account to continue.</p>

        <form onSubmit={handleLogin}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Email</label>
          <input
            type="email" placeholder="you@email.com" value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ ...input, marginBottom: 18 }}
          />

          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Password</label>
          <div style={{ position: "relative", marginBottom: 24 }}>
            <input
              type={showPass ? "text" : "password"} placeholder="Enter your password" value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ ...input, paddingRight: 48 }}
            />
            <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center" }}>
              {showPass ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="12" r="3" stroke="#9ca3af" strokeWidth="2"/></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"/><line x1="1" y1="1" x2="23" y2="23" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"/></svg>
              )}
            </button>
          </div>

          <button type="submit" disabled={!isReady || loading} style={{
            width: "100%", background: isReady ? AQUA : "#e5e7eb",
            border: "none", borderRadius: 12, height: 52, cursor: isReady ? "pointer" : "default",
            marginBottom: 18, transition: "background 0.2s",
          }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: isReady ? "#fff" : "#9ca3af", fontFamily: "'Poppins', sans-serif" }}>
              {loading ? "Signing in…" : "Log in"}
            </span>
          </button>
        </form>

        <button onClick={() => setForgotMode(true)} style={{ background: "none", border: "none", cursor: "pointer", marginBottom: 24, textAlign: "center" }}>
          <span style={{ fontSize: 14, color: AQUA, fontWeight: 600 }}>Forgot password?</span>
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
          <span style={{ fontSize: 12, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em" }}>or</span>
          <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
        </div>

        <button
          type="button"
          onClick={() => { window.location.href = "/api/auth/google"; }}
          style={{ width: "100%", border: "1.5px solid #e5e7eb", borderRadius: 12, height: 52, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 28 }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span style={{ fontSize: 15, fontWeight: 600, color: "#374151", fontFamily: "'Montserrat', sans-serif" }}>Continue with Google</span>
        </button>

        <p style={{ textAlign: "center", fontSize: 14, color: "#6b7280", margin: 0 }}>
          Don't have an account?{" "}
          <span onClick={onGetStarted} style={{ color: AQUA, fontWeight: 700, cursor: "pointer" }}>Get started</span>
        </p>
      </div>

      <p style={{ textAlign: "center", fontSize: 11, color: "#d1d5db", padding: "12px 0 24px" }}>v1.3.0</p>
    </div>
  );
}

/* ── Main Auth Page ── */
export default function AuthPage() {
  const hasSeenWelcome = !!localStorage.getItem('bookd_welcome_seen');

  // Returning/logged-out users: skip video screens entirely
  const [view, setView] = useState<"welcome" | "splash" | "login" | "register">(
    hasSeenWelcome ? "splash" : "welcome"
  );

  // Handle Google OAuth errors — skip straight to login
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errorKey = params.get('error');
    if (errorKey && GOOGLE_ERROR_MESSAGES[errorKey]) {
      window.history.replaceState({}, '', '/auth');
      setView("login");
    }
  }, []);

  // First-time user: 3 video screens → registration → onboarding
  if (view === "welcome") {
    return (
      <WelcomeSequence
        showRegistration={true}
        onComplete={() => {
          localStorage.setItem('bookd_welcome_seen', '1');
          window.location.href = '/';
        }}
        onLogin={() => {
          localStorage.setItem('bookd_welcome_seen', '1');
          setView("login");
        }}
      />
    );
  }

  // Returning user: glowing splash → login
  if (view === "splash") {
    return <SplashScreen onDone={() => setView("login")} />;
  }

  // "Get started" from login → registration (skip video screens, already seen)
  if (view === "register") {
    return (
      <RegistrationStep
        onDone={() => {
          localStorage.setItem('bookd_welcome_seen', '1');
          window.location.href = '/';
        }}
        onLogin={() => setView("login")}
      />
    );
  }

  return <LoginForm onGetStarted={() => setView("register")} />;
}
