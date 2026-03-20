const NAVY = "#03045e";
const CYAN = "#00b4d8";

function ProgressDots() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} style={{
          width: i === 3 ? 20 : 7,
          height: 7,
          borderRadius: 999,
          background: i === 3 ? CYAN : "#d1d5db",
          transition: "width 0.3s",
        }} />
      ))}
    </div>
  );
}

function HomeIndicator() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "8px 0 4px" }}>
      <div style={{ width: 134, height: 5, borderRadius: 3, background: "#1a1a2e" }} />
    </div>
  );
}

const FEATURES: { icon: React.ReactNode; title: string; body: string }[] = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M3 17h2l1-3h12l1 3h2M5 17v2a1 1 0 001 1h1a1 1 0 001-1v-1h8v1a1 1 0 001 1h1a1 1 0 001-1v-2" stroke={NAVY} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6 14l1.5-6h9L18 14" stroke={NAVY} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="8.5" cy="17" r="0.5" fill={NAVY}/>
        <circle cx="15.5" cy="17" r="0.5" fill={NAVY}/>
      </svg>
    ),
    title: "Mileage deduction tracker",
    body: "Log every drive at the IRS rate. Your tax savings add up automatically.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="5" width="18" height="14" rx="2" stroke={NAVY} strokeWidth="1.8"/>
        <path d="M8 12h8M12 9v6" stroke={NAVY} strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    title: "Gig income logging",
    body: "Add a gig in 90 seconds. See what's paid, pending, or owed at a glance.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M7 3h10a1 1 0 011 1v16a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1z" stroke={NAVY} strokeWidth="1.8"/>
        <path d="M9 8h6M9 12h6M9 16h4" stroke={NAVY} strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    title: "Expense tracking",
    body: "Capture every business cost in seconds. Organized by category for tax time.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="3" width="16" height="18" rx="2" stroke={NAVY} strokeWidth="1.8"/>
        <path d="M8 7h8M8 11h8M8 15h5" stroke={NAVY} strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M15 14.5l2 2 3-3" stroke={CYAN} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: "Real-time tax estimator",
    body: "Your estimated tax bill updates live. No more April surprises.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M12 3v12m0 0l-4-4m4 4l4-4" stroke={NAVY} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke={NAVY} strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    title: "One tap 1099 report",
    body: "Download a clean income report. Share it or file it yourself.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="9" cy="7" r="3" stroke={NAVY} strokeWidth="1.8"/>
        <path d="M3 20c0-3.314 2.686-6 6-6" stroke={NAVY} strokeWidth="1.8" strokeLinecap="round"/>
        <circle cx="17" cy="10" r="2.5" stroke={NAVY} strokeWidth="1.8"/>
        <path d="M13 20c0-2.761 1.791-5 4-5s4 2.239 4 5" stroke={NAVY} strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    title: "Client management",
    body: "All your clients, gigs, and history in one organized place.",
  },
];

export function WhatYouGetScreen() {
  return (
    <div style={{
      width: 393, height: 852,
      borderRadius: 55, overflow: "hidden",
      background: "#fff",
      display: "flex", flexDirection: "column",
      fontFamily: "'Montserrat', sans-serif",
      position: "relative",
      boxShadow: "0 32px 80px rgba(3,4,94,0.18)",
    }}>
      {/* Status bar */}
      <div style={{ height: 44, background: "#fff", flexShrink: 0 }} />

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 26px 16px", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 4 }}>
          <ProgressDots />
        </div>

        {/* Header */}
        <div style={{ marginBottom: 28, textAlign: "center" }}>
          <div style={{
            fontSize: 11, fontWeight: 700, color: CYAN,
            letterSpacing: "0.12em", textTransform: "uppercase",
            fontFamily: "'Montserrat', sans-serif", marginBottom: 8,
          }}>
            Everything included
          </div>
          <h1 style={{
            fontSize: 30, fontWeight: 900, color: NAVY, margin: 0,
            lineHeight: 1.1, fontFamily: "'Poppins', sans-serif",
            letterSpacing: "-0.01em",
          }}>
            What you get<br />with Bookd
          </h1>
        </div>

        {/* Feature list */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {FEATURES.map((f, i) => (
            <div key={i}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14, paddingBottom: 18 }}>
                {/* Icon circle */}
                <div style={{
                  width: 44, height: 44, borderRadius: "50%",
                  background: "#E0F7FF",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, marginTop: 1,
                }}>
                  {f.icon}
                </div>
                {/* Text */}
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 15, fontWeight: 700, color: NAVY,
                    fontFamily: "'Poppins', sans-serif",
                    marginBottom: 3, lineHeight: 1.3,
                  }}>
                    {f.title}
                  </div>
                  <div style={{
                    fontSize: 12.5, color: "#6b7280",
                    fontFamily: "'Montserrat', sans-serif",
                    lineHeight: 1.5,
                  }}>
                    {f.body}
                  </div>
                </div>
              </div>
              {i < FEATURES.length - 1 && (
                <div style={{ height: 1, background: "#f0f0f4", marginBottom: 18 }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Pinned CTA */}
      <div style={{ padding: "10px 26px 14px", background: "#fff", boxSizing: "border-box", flexShrink: 0 }}>
        <button style={{
          width: "100%", background: NAVY, border: "none",
          borderRadius: 100, padding: "16px 20px",
          cursor: "pointer", display: "flex",
          alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#fff", fontFamily: "'Poppins', sans-serif" }}>
            Continue →
          </span>
        </button>
      </div>

      <HomeIndicator />
    </div>
  );
}
