const NAVY = "#03045e";
const CYAN = "#00b4d8";

export function AppStoreSlide3() {
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
        <div style={{
          background: "rgba(0,180,216,0.15)",
          border: "1px solid rgba(0,180,216,0.4)",
          borderRadius: 20, padding: "4px 14px", marginBottom: 16,
        }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: CYAN, letterSpacing: "0.08em", fontFamily: "'Montserrat', sans-serif", textTransform: "uppercase" }}>
            Mileage Deductions
          </span>
        </div>

        <h1 style={{
          fontSize: 36, fontWeight: 900, color: "#fff",
          lineHeight: 1.12, margin: "0 0 12px",
          letterSpacing: "-0.8px",
        }}>
          Track your drives —{" "}
          <span style={{ color: CYAN }}>save thousands in deductions.</span>
        </h1>

        <p style={{
          fontSize: 14, color: "rgba(255,255,255,0.6)",
          lineHeight: 1.55, margin: "0 0 16px",
          fontFamily: "'Montserrat', sans-serif", fontWeight: 500,
        }}>
          Enter your route and Bookd calculates your deduction at the IRS standard rate. Every mile counts.
        </p>

        {/* Inline stat */}
        <div style={{
          display: "flex", alignItems: "center", gap: 16,
          background: "rgba(0,180,216,0.1)",
          border: "1px solid rgba(0,180,216,0.25)",
          borderRadius: 12, padding: "10px 16px",
        }}>
          <div>
            <div style={{ fontSize: 11, color: CYAN, fontFamily: "'Montserrat', sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>Example</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", fontFamily: "'Montserrat', sans-serif" }}>270 miles round trip</div>
          </div>
          <div style={{ marginLeft: "auto", textAlign: "right" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>$195.75</div>
            <div style={{ fontSize: 11, color: CYAN, fontFamily: "'Montserrat', sans-serif", fontWeight: 600 }}>deduction at 72.5¢/mi</div>
          </div>
        </div>
      </div>

      {/* ── SCREENSHOT SECTION ── */}
      <div style={{
        flex: 1,
        display: "flex", justifyContent: "center", alignItems: "flex-start",
        paddingTop: 8,
        background: "linear-gradient(to bottom, #03045e 0%, #020347 100%)",
        position: "relative",
      }}>
        <div style={{
          position: "absolute", top: "10%", left: "50%",
          transform: "translateX(-50%)",
          width: 260, height: 260, borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(0,180,216,0.16) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <img
          src="/__mockup/ss_mileage_nobg.png"
          style={{
            width: "86%", height: "auto", display: "block",
            position: "relative", zIndex: 1,
            filter: "drop-shadow(0 8px 32px rgba(0,0,0,0.5))",
          }}
        />
      </div>
    </div>
  );
}
