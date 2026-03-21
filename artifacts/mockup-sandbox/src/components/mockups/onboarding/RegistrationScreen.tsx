import { useState } from "react";

const NAVY = "#03045e";
const CYAN = "#00b4d8";

function Field({
  label, placeholder, type = "text", value, onChange, prefix,
}: {
  label: string; placeholder: string; type?: string;
  value: string; onChange: (v: string) => void; prefix?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{
        display: "block", fontSize: 12, fontWeight: 600,
        color: focused ? CYAN : "#6b7280",
        marginBottom: 6, letterSpacing: "0.02em",
        transition: "color 0.15s",
        fontFamily: "'Montserrat', sans-serif",
      }}>{label}</label>
      <div style={{
        display: "flex", alignItems: "center",
        border: `1.5px solid ${focused ? CYAN : "#e5e7eb"}`,
        borderRadius: 12, background: "#fff",
        transition: "border-color 0.15s",
        overflow: "hidden",
      }}>
        {prefix && (
          <div style={{
            padding: "0 12px", borderRight: `1px solid ${focused ? CYAN : "#e5e7eb"}`,
            color: "#374151", fontSize: 14, fontWeight: 600,
            fontFamily: "'Montserrat', sans-serif",
            height: 50, display: "flex", alignItems: "center",
            transition: "border-color 0.15s", flexShrink: 0,
          }}>
            {prefix}
          </div>
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex: 1, height: 50, border: "none", outline: "none",
            padding: "0 14px", fontSize: 15, color: "#111827",
            background: "transparent",
            fontFamily: "'Montserrat', sans-serif",
          }}
        />
      </div>
    </div>
  );
}

function EyeIcon({ visible }: { visible: boolean }) {
  return visible ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="12" cy="12" r="3" stroke="#9ca3af" strokeWidth="2"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"/>
      <line x1="1" y1="1" x2="23" y2="23" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

export function RegistrationScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const isReady = name.trim() && email.includes("@") && phone.length >= 7 && password.length >= 6;

  return (
    <div style={{
      width: 393, height: 852, borderRadius: 55, overflow: "hidden",
      background: "#f9fafb", fontFamily: "'Montserrat', sans-serif",
      display: "flex", flexDirection: "column",
      position: "relative",
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@700;800&family=Montserrat:wght@400;500;600;700&display=swap');`}</style>

      {/* Top safe area */}
      <div style={{ height: 44, flexShrink: 0 }} />

      {/* Scrollable form area */}
      <div style={{ flex: 1, overflowY: "auto", padding: "28px 28px 0", boxSizing: "border-box" }}>

        {/* Logo mark */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, background: NAVY,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M4 10l4 4 8-8" stroke={CYAN} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={{ fontSize: 18, fontWeight: 700, color: NAVY, fontFamily: "'Poppins', sans-serif", letterSpacing: "-0.02em" }}>
            bookd
          </span>
        </div>

        <h1 style={{
          fontFamily: "'Poppins', sans-serif", fontWeight: 800,
          fontSize: 26, color: NAVY, lineHeight: 1.2, margin: "0 0 6px",
        }}>
          Create your account
        </h1>
        <p style={{ fontSize: 14, color: "#6b7280", margin: "0 0 28px", lineHeight: 1.5 }}>
          Takes about 2 minutes. We'll get you set up right away.
        </p>

        {/* Name */}
        <Field
          label="Full name"
          placeholder="Jane Smith"
          value={name}
          onChange={setName}
        />

        {/* Email */}
        <Field
          label="Email address"
          placeholder="jane@example.com"
          type="email"
          value={email}
          onChange={setEmail}
        />

        {/* Phone */}
        <Field
          label="Phone number"
          placeholder="(555) 000-0000"
          type="tel"
          value={phone}
          onChange={setPhone}
          prefix={<span style={{ display: "flex", alignItems: "center", gap: 6 }}>🇺🇸 <span style={{ color: "#9ca3af" }}>+1</span></span>}
        />

        {/* Password */}
        <div style={{ marginBottom: 8 }}>
          <label style={{
            display: "block", fontSize: 12, fontWeight: 600,
            color: "#6b7280", marginBottom: 6, letterSpacing: "0.02em",
            fontFamily: "'Montserrat', sans-serif",
          }}>Password</label>
          <div style={{
            display: "flex", alignItems: "center",
            border: `1.5px solid #e5e7eb`, borderRadius: 12,
            background: "#fff", overflow: "hidden",
          }}>
            <input
              type={showPass ? "text" : "password"}
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                flex: 1, height: 50, border: "none", outline: "none",
                padding: "0 14px", fontSize: 15, color: "#111827",
                background: "transparent",
                fontFamily: "'Montserrat', sans-serif",
              }}
            />
            <button
              onClick={() => setShowPass(!showPass)}
              style={{ background: "none", border: "none", padding: "0 14px", cursor: "pointer", display: "flex", alignItems: "center" }}
            >
              <EyeIcon visible={showPass} />
            </button>
          </div>
          <p style={{ fontSize: 11, color: "#9ca3af", margin: "6px 0 0", fontFamily: "'Montserrat', sans-serif" }}>
            Must be at least 6 characters
          </p>
        </div>

        {/* Privacy note */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, margin: "20px 0 8px" }}>
          <svg width="12" height="14" viewBox="0 0 14 16" fill="none">
            <rect x="1.5" y="7" width="11" height="8" rx="2" fill={NAVY} />
            <path d="M4 7V5C4 3.343 5.343 2 7 2C8.657 2 10 3.343 10 5V7" stroke={NAVY} strokeWidth="1.8" strokeLinecap="round" fill="none" />
            <circle cx="7" cy="11" r="1.2" fill={CYAN} />
            <rect x="6.35" y="11" width="1.3" height="2" rx="0.65" fill={CYAN} />
          </svg>
          <span style={{ fontSize: 11, color: "#9ca3af" }}>We never share or sell your data.</span>
        </div>
      </div>

      {/* Pinned CTA */}
      <div style={{ padding: "12px 28px 36px", background: "#f9fafb", flexShrink: 0 }}>
        <button style={{
          width: "100%", background: isReady ? NAVY : "#e5e7eb",
          border: "none", borderRadius: 100, padding: "16px 20px",
          cursor: isReady ? "pointer" : "default",
          transition: "background 0.2s",
          boxShadow: isReady ? "0 4px 16px rgba(3,4,94,0.22)" : "none",
        }}>
          <span style={{
            fontSize: 16, fontWeight: 700,
            color: isReady ? "#fff" : "#9ca3af",
            fontFamily: "'Poppins', sans-serif",
          }}>
            Create Account →
          </span>
        </button>

        <p style={{
          textAlign: "center", margin: "14px 0 0",
          fontSize: 13, color: "#9ca3af",
          fontFamily: "'Montserrat', sans-serif",
        }}>
          Already have an account?{" "}
          <span style={{ color: CYAN, fontWeight: 600 }}>Log in</span>
        </p>
      </div>
    </div>
  );
}
