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
          lineHeight: 1.1, margin: "0 0 14px",
          letterSpacing: "-1px",
        }}>
          Track your drives —{" "}
          <span style={{ color: CYAN }}>save thousands in deductions.</span>
        </h1>

        <p style={{
          fontSize: 15, color: "rgba(255,255,255,0.65)", lineHeight: 1.55,
          margin: "0 0 20px", fontFamily: "'Montserrat', sans-serif", fontWeight: 500,
        }}>
          Enter your route and Bookd auto-calculates your deduction at the IRS standard rate. Every mile counts at tax time.
        </p>

        <div style={{
          background: "rgba(0,180,216,0.12)", border: "1px solid rgba(0,180,216,0.3)",
          borderRadius: 14, padding: "14px 18px",
        }}>
          <div style={{ fontSize: 11, color: CYAN, fontFamily: "'Montserrat', sans-serif", fontWeight: 700, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Real example
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", fontFamily: "'Montserrat', sans-serif" }}>270 miles (round trip)</span>
            <span style={{ fontSize: 16, color: "#fff", fontWeight: 800, fontFamily: "'Poppins', sans-serif" }}>$195.75</span>
          </div>
          <div style={{ height: 1, background: "rgba(255,255,255,0.1)", marginBottom: 8 }} />
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", fontFamily: "'Montserrat', sans-serif" }}>2026 IRS rate: 72.5¢/mile</span>
            <span style={{ fontSize: 12, color: CYAN, fontWeight: 600, fontFamily: "'Montserrat', sans-serif" }}>deduction at filing</span>
          </div>
        </div>
      </div>

      <div style={{ position: "absolute", bottom: -30, left: "50%", transform: "translateX(-50%)", width: 330 }}>
        <img src="/__mockup/ss_mileage_nobg.png" style={{ width: "100%", display: "block" }} />
      </div>
    </div>
  );
}
