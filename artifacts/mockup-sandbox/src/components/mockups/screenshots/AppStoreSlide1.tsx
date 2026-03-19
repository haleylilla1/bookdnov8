const NAVY = "#03045e";
const CYAN = "#00b4d8";

export function AppStoreSlide1() {
  return (
    <div style={{
      width: 393, height: 852,
      background: NAVY,
      display: "flex", flexDirection: "column",
      fontFamily: "'Poppins', sans-serif",
      overflow: "hidden",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@700;800;900&family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* ── TEXT SECTION ── */}
      <div style={{
        padding: "44px 28px 20px",
        display: "flex", flexDirection: "column", alignItems: "flex-start",
        flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
          <img
            src="/__mockup/bookd-logo.png"
            style={{ width: 40, height: 40, borderRadius: 10 }}
          />
          <span style={{ fontSize: 20, fontWeight: 900, color: "#fff", letterSpacing: "-0.5px" }}>bookd</span>
        </div>

        {/* Audience badge */}
        <div style={{
          background: "rgba(0,180,216,0.15)",
          border: "1px solid rgba(0,180,216,0.4)",
          borderRadius: 20, padding: "4px 14px", marginBottom: 16,
        }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: CYAN, letterSpacing: "0.08em", fontFamily: "'Montserrat', sans-serif", textTransform: "uppercase" }}>
            Freelancers · Contractors · 1099 Workers
          </span>
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: 36, fontWeight: 900, color: "#fff",
          lineHeight: 1.12, margin: "0 0 12px",
          letterSpacing: "-0.8px",
        }}>
          Track gigs & income —{" "}
          <span style={{ color: CYAN }}>keep more of what you earn.</span>
        </h1>

        {/* Sub-copy */}
        <p style={{
          fontSize: 14, color: "rgba(255,255,255,0.6)",
          lineHeight: 1.55, margin: 0,
          fontFamily: "'Montserrat', sans-serif", fontWeight: 500,
        }}>
          Income, mileage, expenses & tax reports — all in one place.
        </p>
      </div>

      {/* ── SCREENSHOT SECTION ── */}
      <div style={{
        flex: 1,
        display: "flex", justifyContent: "center", alignItems: "flex-start",
        paddingTop: 8,
        background: "linear-gradient(to bottom, #03045e 0%, #020347 100%)",
        position: "relative",
      }}>
        {/* Glow behind phone */}
        <div style={{
          position: "absolute", top: "10%", left: "50%",
          transform: "translateX(-50%)",
          width: 260, height: 260, borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(0,180,216,0.18) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <img
          src="/__mockup/ss_dashboard_nobg.png"
          style={{
            width: "86%",
            height: "auto",
            display: "block",
            position: "relative", zIndex: 1,
            filter: "drop-shadow(0 8px 32px rgba(0,0,0,0.5))",
          }}
        />
      </div>
    </div>
  );
}
