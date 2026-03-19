const NAVY = "#03045e";
const CYAN = "#00b4d8";

export function AppStoreSlide3() {
  return (
    <div style={{
      width: 393, height: 852,
      background: `radial-gradient(ellipse at 55% 20%, #05077a 0%, ${NAVY} 70%)`,
      display: "flex", flexDirection: "column", alignItems: "center",
      position: "relative", overflow: "hidden",
      fontFamily: "'Poppins', sans-serif",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@700;800;900&family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <div style={{ position: "absolute", top: -80, left: -40, width: 260, height: 260, borderRadius: "50%", background: "rgba(0,180,216,0.07)" }} />

      <div style={{ paddingTop: 52, display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 22, fontWeight: 900, color: "#fff", letterSpacing: "-0.5px" }}>bookd</span>
        <span style={{ fontSize: 22, fontWeight: 900, color: CYAN }}>✓</span>
      </div>

      <div style={{ padding: "24px 28px 0", textAlign: "center" }}>
        <div style={{
          display: "inline-block", background: "rgba(0,180,216,0.15)",
          border: `1px solid rgba(0,180,216,0.35)`,
          borderRadius: 20, padding: "5px 16px", marginBottom: 18,
        }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: CYAN, letterSpacing: "0.08em", fontFamily: "'Montserrat', sans-serif", textTransform: "uppercase" }}>
            Mileage Deductions
          </span>
        </div>

        <h1 style={{
          fontSize: 40, fontWeight: 900, color: "#fff",
          lineHeight: 1.1, margin: "0 0 16px",
          letterSpacing: "-1px",
        }}>
          Every mile is worth{" "}
          <span style={{ color: CYAN }}>$0.725.</span>
        </h1>

        <p style={{
          fontSize: 15, color: "rgba(255,255,255,0.7)", lineHeight: 1.55,
          margin: "0 0 20px", fontFamily: "'Montserrat', sans-serif", fontWeight: 500,
        }}>
          Auto-calculated mileage deductions at the 2026 IRS standard rate — every drive tracked.
        </p>

        <div style={{
          background: "rgba(0,180,216,0.12)", border: "1px solid rgba(0,180,216,0.3)",
          borderRadius: 14, padding: "14px 18px", textAlign: "left",
        }}>
          <div style={{ fontSize: 12, color: CYAN, fontFamily: "'Montserrat', sans-serif", fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Example gig
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", fontFamily: "'Montserrat', sans-serif" }}>270 miles round trip</span>
            <span style={{ fontSize: 13, color: "#fff", fontWeight: 700, fontFamily: "'Montserrat', sans-serif" }}>$195.75 deduction</span>
          </div>
          <div style={{ height: 1, background: "rgba(255,255,255,0.1)", margin: "8px 0" }} />
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", fontFamily: "'Montserrat', sans-serif" }}>
            Calculated automatically from your route
          </div>
        </div>
      </div>

      <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 330 }}>
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 80,
          background: `linear-gradient(to bottom, ${NAVY}, transparent)`, zIndex: 1,
        }} />
        <img src="/__mockup/ss_mileage.png" style={{ width: "100%", display: "block" }} />
      </div>
    </div>
  );
}
