const NAVY = "#03045e";
const CYAN = "#00b4d8";

export function AppStoreSlide2() {
  return (
    <div style={{
      width: 393, height: 852,
      background: `radial-gradient(ellipse at 40% 25%, #05077a 0%, ${NAVY} 70%)`,
      display: "flex", flexDirection: "column", alignItems: "center",
      position: "relative", overflow: "hidden",
      fontFamily: "'Poppins', sans-serif",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@700;800;900&family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <div style={{ position: "absolute", top: -60, right: -60, width: 240, height: 240, borderRadius: "50%", background: "rgba(0,180,216,0.08)" }} />

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
            Income Tracking
          </span>
        </div>

        <h1 style={{
          fontSize: 40, fontWeight: 900, color: "#fff",
          lineHeight: 1.1, margin: "0 0 14px",
          letterSpacing: "-1px",
        }}>
          Log every payment —{" "}
          <span style={{ color: CYAN }}>see your real take-home instantly.</span>
        </h1>

        <p style={{
          fontSize: 15, color: "rgba(255,255,255,0.65)", lineHeight: 1.55,
          margin: "0 0 20px", fontFamily: "'Montserrat', sans-serif", fontWeight: 500,
        }}>
          Record what hit your bank, link it to a gig, and watch your income dashboard update in real time.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-start" }}>
          {[
            { fn: "Monthly & annual income views", val: "never lose track of a payment" },
            { fn: "Earned vs. upcoming split", val: "plan around what's coming in" },
            { fn: "Platform-by-platform breakdown", val: "see which gigs pay best" },
          ].map((item) => (
            <div key={item.fn} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", background: CYAN, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                <span style={{ fontSize: 11, color: "#fff", fontWeight: 700 }}>✓</span>
              </div>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", fontFamily: "'Montserrat', sans-serif", fontWeight: 500, textAlign: "left", lineHeight: 1.4 }}>
                <strong style={{ color: "#fff" }}>{item.fn}</strong> — {item.val}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ position: "absolute", bottom: -30, left: "50%", transform: "translateX(-50%)", width: 330 }}>
        <img src="/__mockup/ss_dashboard_nobg.png" style={{ width: "100%", display: "block" }} />
      </div>
    </div>
  );
}
