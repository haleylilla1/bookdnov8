
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2, ArrowLeft, TrendingUp, PiggyBank, Car } from "lucide-react";
import logoImage from "@assets/bookd-logo.png";
import { sanitizeEmail, sanitizeText } from "@/utils/validation";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: object) => void;
          prompt: (momentListener?: (notification: { isNotDisplayed: () => boolean; isSkippedMoment: () => boolean; isDismissedMoment: () => boolean; }) => void) => void;
          cancel: () => void;
        };
      };
    };
  }
}

type Mode = 'welcome' | 'login' | 'register' | 'reset-request' | 'reset-password';

const CYAN = "#00b4d8";
const NAVY = "#03045e";

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: "52px",
  fontSize: "16px",
  padding: "0 16px",
  border: "1.5px solid #d1d5db",
  borderRadius: "12px",
  backgroundColor: "#ffffff",
  color: "#111827",
  outline: "none",
  boxSizing: "border-box",
  WebkitAppearance: "none",
};

const btnPrimary: React.CSSProperties = {
  width: "100%",
  height: "52px",
  backgroundColor: CYAN,
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: 600,
  border: "none",
  borderRadius: "12px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
};

const btnOutline: React.CSSProperties = {
  width: "100%",
  height: "52px",
  backgroundColor: "#ffffff",
  color: "#374151",
  fontSize: "15px",
  fontWeight: 500,
  border: "1.5px solid #d1d5db",
  borderRadius: "12px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
};

export default function AuthForm() {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<Mode>("welcome");
  const [showPassword, setShowPassword] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const { toast } = useToast();

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [gsiReady, setGsiReady] = useState(false);

  // Verify Google credential with our server and establish a session
  const handleGoogleCredential = async (response: { credential: string }) => {
    try {
      const res = await fetch('/api/auth/google/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ credential: response.credential }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Google sign-in failed');
      if (data.sessionId) localStorage.setItem('bookd_session', data.sessionId);
      const userData = data.user;
      if (userData?.id) queryClient.setQueryData(['/api/user'], userData);
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    } catch (err: any) {
      toast({ title: 'Google sign-in failed', description: err.message, variant: 'destructive' });
    }
  };

  // Initialize GSI once on mount
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const init = () => {
      if (!window.google?.accounts?.id) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCredential,
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      setGsiReady(true);
    };

    if (window.google?.accounts?.id) {
      init();
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          init();
          clearInterval(interval);
        }
      }, 150);
      return () => clearInterval(interval);
    }
  }, []);

  // Show Google's in-page account picker when our button is tapped
  const handleGoogleSignIn = () => {
    if (!gsiReady || !window.google?.accounts?.id) {
      toast({ title: 'Google sign-in not ready', description: 'Please try again in a moment.', variant: 'destructive' });
      return;
    }
    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        toast({ title: 'Google sign-in unavailable', description: 'Please use email sign-in instead.', variant: 'destructive' });
      }
    });
  };

  useEffect(() => {
    // Handle error params from Google OAuth callback (redirect flow fallback)
    const urlParams = new URLSearchParams(window.location.search);
    const errorKey = urlParams.get("error");
    const errorMessages: Record<string, string> = {
      google_denied: "Google sign-in was cancelled.",
      google_failed: "Google sign-in failed. Please try again.",
      google_no_email: "Your Google account didn't share an email. Please use email sign-in.",
      google_not_configured: "Google sign-in is not available right now.",
      account_disabled: "This account has been disabled. Please contact support.",
    };
    if (errorKey && errorMessages[errorKey]) {
      toast({ title: errorMessages[errorKey], variant: "destructive" });
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("reset_token");
    if (token) {
      fetch("/api/auth/validate-reset-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.valid) {
            setResetToken(token);
            setMode("reset-password");
            toast({ title: "Reset link valid", description: `Resetting password for ${data.user.email}` });
          } else {
            toast({ title: "Link expired", description: "This reset link is invalid or has expired.", variant: "destructive" });
            setMode("login");
          }
        })
        .catch(() => setMode("login"));
    }
  }, [toast]);

  const loginMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: sanitizeEmail(loginData.email), password: loginData.password.trim() }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Login failed" }));
        throw new Error(err.message || "Login failed");
      }
      return res.json();
    },
    onSuccess: (data: any) => {
      if (data?.sessionId) localStorage.setItem('bookd_session', data.sessionId);
      const userData = data?.user ?? data;
      if (userData?.id) queryClient.setQueryData(['/api/user'], userData);
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    },
    onError: (e: any) => toast({ title: "Login failed", description: e.message === "Invalid credentials" ? "Wrong email or password." : e.message, variant: "destructive" }),
  });

  const registerMutation = useMutation({
    mutationFn: async () => {
      if (registerData.password !== registerData.confirmPassword) throw new Error("Passwords don't match");
      if (registerData.password.length < 6) throw new Error("Password must be at least 6 characters");
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: sanitizeText(registerData.name),
          email: sanitizeEmail(registerData.email),
          password: registerData.password.trim(),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Registration failed" }));
        throw new Error(err.error || err.message || "Registration failed");
      }
      return res.json();
    },
    onSuccess: (data: any) => {
      if (data?.sessionId) localStorage.setItem('bookd_session', data.sessionId);
      const userData = data?.user ?? data;
      if (userData?.id) queryClient.setQueryData(['/api/user'], userData);
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    },
    onError: (e: any) => toast({ title: "Sign up failed", description: e.message, variant: "destructive" }),
  });

  const resetRequestMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: sanitizeEmail(resetEmail) }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Reset failed" }));
        throw new Error(err.message);
      }
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: "Reset email sent", description: "Check your inbox for a reset link." });
      if (data.developmentResetUrl) {
        console.log("🔗 Dev Reset Link:", data.developmentResetUrl);
      }
      setMode("login");
    },
    onError: (e: any) => toast({ title: "Reset failed", description: e.message, variant: "destructive" }),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async () => {
      if (newPassword.length < 6) throw new Error("Password must be at least 6 characters");
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: resetToken, newPassword }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Reset failed" }));
        throw new Error(err.message);
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Password updated!", description: "You can now log in with your new password." });
      window.history.replaceState({}, "", window.location.pathname);
      setMode("login");
    },
    onError: (e: any) => toast({ title: "Reset failed", description: e.message, variant: "destructive" }),
  });

  const isLoading = loginMutation.isPending || registerMutation.isPending || resetRequestMutation.isPending || resetPasswordMutation.isPending;

  return (
    <div style={{ minHeight: "100dvh", backgroundColor: "#ffffff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", padding: "0 24px", paddingTop: "env(safe-area-inset-top, 0px)" }}>
      <div style={{ width: "100%", maxWidth: "390px", paddingTop: "48px", paddingBottom: "48px" }}>

        {/* WELCOME SCREEN */}
        {mode === "welcome" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <img src={logoImage} alt="bookd" style={{ height: "36px", objectFit: "contain", marginBottom: "28px" }} />

            <h1 style={{ fontSize: "28px", fontWeight: 800, color: NAVY, textAlign: "center", marginBottom: "24px", lineHeight: 1.25 }}>
              Welcome to <span style={{ color: CYAN }}>Bookd</span>
            </h1>

            <div style={{ width: "40px", height: "2px", backgroundColor: "#e5e7eb", marginBottom: "24px", borderRadius: "2px" }} />

            <p style={{ fontSize: "15px", fontWeight: 700, color: NAVY, textAlign: "center", marginBottom: "10px" }}>
              Hey, I'm Haley! 👋
            </p>
            <p style={{ fontSize: "14px", color: "#6b7280", textAlign: "center", lineHeight: 1.7, marginBottom: "24px" }}>
              After six years of gig work and one too many messy spreadsheets, I built <strong style={{ color: NAVY }}>Bookd</strong> because nothing out there was made for workers like us. Brand ambassadors, actors, creatives, dog walkers, mystery shoppers, dancers, tour guides — <strong style={{ color: NAVY }}>if you hustle gig to gig, this was built for you!</strong>
            </p>

            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
              {[
                { icon: <TrendingUp size={18} color="#fff" />, title: "Track & project income", sub: "Know exactly where you stand" },
                { icon: <PiggyBank size={18} color="#fff" />, title: "Smart tax set-asides", sub: "No more surprise tax bills" },
                { icon: <Car size={18} color="#fff" />, title: "Mileage & expense tracking", sub: "Maximize every deduction" },
              ].map(({ icon, title, sub }) => (
                <div key={title} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 16px", borderRadius: "14px", border: "1.5px solid #f0f0f0", backgroundColor: "#fafafa" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: CYAN, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {icon}
                  </div>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: NAVY }}>{title}</div>
                    <div style={{ fontSize: "12px", color: "#9B9B9B", marginTop: "2px" }}>{sub}</div>
                  </div>
                </div>
              ))}
            </div>

            <button style={btnPrimary} onClick={() => setMode("register")}>
              Get started
            </button>

            <button style={{ ...btnOutline, marginTop: "10px" }} onClick={handleGoogleSignIn}>
              <svg width="18" height="18" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              Continue with Google
            </button>

            <button
              style={{ background: "none", border: "none", color: "#6b7280", fontSize: "15px", marginTop: "16px", cursor: "pointer", padding: "8px" }}
              onClick={() => setMode("login")}
            >
              Already have an account?{" "}
              <span style={{ color: CYAN, fontWeight: 600 }}>Log in</span>
            </button>
          </div>
        )}

        {/* LOGIN SCREEN */}
        {mode === "login" && (
          <div>
            <img src={logoImage} alt="bookd" style={{ height: "36px", objectFit: "contain", marginBottom: "36px", display: "block" }} />

            <h1 style={{ fontSize: "26px", fontWeight: 700, color: NAVY, marginBottom: "6px" }}>Welcome back</h1>
            <p style={{ fontSize: "15px", color: "#6b7280", marginBottom: "28px" }}>Sign in to your account to continue.</p>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "20px" }}>
              <div>
                <label style={{ fontSize: "14px", fontWeight: 500, color: "#374151", display: "block", marginBottom: "6px" }}>Email</label>
                <input
                  type="email"
                  placeholder="you@email.com"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  style={inputStyle}
                  autoComplete="email"
                  autoCapitalize="off"
                  autoCorrect="off"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label style={{ fontSize: "14px", fontWeight: 500, color: "#374151", display: "block", marginBottom: "6px" }}>Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    style={{ ...inputStyle, paddingRight: "48px" }}
                    autoComplete="current-password"
                    disabled={isLoading}
                    onKeyDown={(e) => { if (e.key === "Enter") loginMutation.mutate(); }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 0, display: "flex", minHeight: "unset" }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <button
              style={btnPrimary}
              onClick={() => loginMutation.mutate()}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> : null}
              Log in
            </button>

            <button
              style={{ background: "none", border: "none", color: CYAN, fontSize: "14px", marginTop: "16px", cursor: "pointer", display: "block", width: "100%", textAlign: "center", padding: "8px", fontWeight: 500 }}
              onClick={() => setMode("reset-request")}
              disabled={isLoading}
            >
              Forgot password?
            </button>

            <div style={{ borderTop: "1px solid #e5e7eb", margin: "20px 0" }} />

            <button style={btnOutline} onClick={handleGoogleSignIn} disabled={isLoading}>
              <svg width="18" height="18" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              Continue with Google
            </button>

            <button
              style={{ background: "none", border: "none", color: "#6b7280", fontSize: "15px", marginTop: "12px", cursor: "pointer", display: "block", width: "100%", textAlign: "center", padding: "8px" }}
              onClick={() => setMode("register")}
              disabled={isLoading}
            >
              Don't have an account?{" "}
              <span style={{ color: CYAN, fontWeight: 600 }}>Get started</span>
            </button>
          </div>
        )}

        {/* REGISTER SCREEN */}
        {mode === "register" && (
          <div>
            <img src={logoImage} alt="bookd" style={{ height: "36px", objectFit: "contain", marginBottom: "36px", display: "block" }} />

            <h1 style={{ fontSize: "26px", fontWeight: 700, color: NAVY, marginBottom: "6px" }}>Create your account</h1>
            <p style={{ fontSize: "15px", color: "#6b7280", marginBottom: "28px" }}>Start tracking your gigs in under a minute.</p>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "20px" }}>
              <div>
                <label style={{ fontSize: "14px", fontWeight: 500, color: "#374151", display: "block", marginBottom: "6px" }}>Full name</label>
                <input
                  type="text"
                  placeholder="Your full name"
                  value={registerData.name}
                  onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                  style={inputStyle}
                  autoComplete="name"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label style={{ fontSize: "14px", fontWeight: 500, color: "#374151", display: "block", marginBottom: "6px" }}>Email</label>
                <input
                  type="email"
                  placeholder="you@email.com"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  style={inputStyle}
                  autoComplete="email"
                  autoCapitalize="off"
                  autoCorrect="off"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label style={{ fontSize: "14px", fontWeight: 500, color: "#374151", display: "block", marginBottom: "6px" }}>Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 6 characters"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    style={{ ...inputStyle, paddingRight: "48px" }}
                    autoComplete="new-password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 0, display: "flex", minHeight: "unset" }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label style={{ fontSize: "14px", fontWeight: 500, color: "#374151", display: "block", marginBottom: "6px" }}>Confirm password</label>
                <input
                  type="password"
                  placeholder="Re-enter your password"
                  value={registerData.confirmPassword}
                  onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                  style={inputStyle}
                  autoComplete="new-password"
                  disabled={isLoading}
                  onKeyDown={(e) => { if (e.key === "Enter") registerMutation.mutate(); }}
                />
              </div>
            </div>

            <button
              style={btnPrimary}
              onClick={() => registerMutation.mutate()}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> : null}
              Create my account
            </button>

            <p style={{ fontSize: "12px", color: "#9ca3af", textAlign: "center", marginTop: "12px", lineHeight: 1.4 }}>
              By signing up, you agree to our{" "}
              <a href="/terms-of-service" style={{ color: CYAN }}>Terms</a> and{" "}
              <a href="/privacy-policy" style={{ color: CYAN }}>Privacy Policy</a>.
            </p>

            <div style={{ borderTop: "1px solid #e5e7eb", margin: "20px 0" }} />

            <button style={btnOutline} onClick={handleGoogleSignIn} disabled={isLoading}>
              <svg width="18" height="18" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              Continue with Google
            </button>

            <button
              style={{ background: "none", border: "none", color: "#6b7280", fontSize: "15px", marginTop: "12px", cursor: "pointer", display: "block", width: "100%", textAlign: "center", padding: "8px" }}
              onClick={() => setMode("login")}
              disabled={isLoading}
            >
              Already have an account?{" "}
              <span style={{ color: CYAN, fontWeight: 600 }}>Log in</span>
            </button>
          </div>
        )}

        {/* RESET REQUEST SCREEN */}
        {mode === "reset-request" && (
          <div>
            <button
              style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", marginBottom: "28px", padding: 0, minHeight: "unset" }}
              onClick={() => setMode("login")}
            >
              <ArrowLeft size={16} /> Back to login
            </button>

            <h1 style={{ fontSize: "26px", fontWeight: 700, color: NAVY, marginBottom: "6px" }}>Reset your password</h1>
            <p style={{ fontSize: "15px", color: "#6b7280", marginBottom: "28px" }}>Enter your email and we'll send you a reset link.</p>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "14px", fontWeight: 500, color: "#374151", display: "block", marginBottom: "6px" }}>Email</label>
              <input
                type="email"
                placeholder="you@email.com"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                style={inputStyle}
                autoComplete="email"
                autoCapitalize="off"
                disabled={isLoading}
                onKeyDown={(e) => { if (e.key === "Enter") resetRequestMutation.mutate(); }}
              />
            </div>

            <button
              style={btnPrimary}
              onClick={() => resetRequestMutation.mutate()}
              disabled={isLoading || !resetEmail}
            >
              {isLoading ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> : null}
              Send reset link
            </button>
          </div>
        )}

        {/* RESET PASSWORD SCREEN */}
        {mode === "reset-password" && (
          <div>
            <h1 style={{ fontSize: "26px", fontWeight: 700, color: NAVY, marginBottom: "6px" }}>Set new password</h1>
            <p style={{ fontSize: "15px", color: "#6b7280", marginBottom: "28px" }}>Enter your new password below.</p>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "14px", fontWeight: 500, color: "#374151", display: "block", marginBottom: "6px" }}>New password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ ...inputStyle, paddingRight: "48px" }}
                  autoComplete="new-password"
                  disabled={isLoading}
                  onKeyDown={(e) => { if (e.key === "Enter") resetPasswordMutation.mutate(); }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 0, display: "flex", minHeight: "unset" }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              style={btnPrimary}
              onClick={() => resetPasswordMutation.mutate()}
              disabled={isLoading || !newPassword}
            >
              {isLoading ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> : null}
              Reset password
            </button>
          </div>
        )}

        <p style={{ textAlign: "center", fontSize: "11px", color: "#d1d5db", marginTop: "40px" }}>v1.3.0</p>
        <div style={{ height: "200px" }} aria-hidden="true" />
      </div>
    </div>
  );
}
