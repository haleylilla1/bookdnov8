const NAVY = "#03045e";
const CYAN = "#00b4d8";

export function AppStoreSlide1() {
  return (
    <div style={{
      width: 393, height: 852,
      background: `radial-gradient(ellipse at 60% 30%, #05077a 0%, ${NAVY} 70%)`,
      display: "flex", flexDirection: "column", alignItems: "center",
      position: "relative", overflow: "hidden",
      fontFamily: "'Poppins', sans-serif",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@700;800;900&family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <div style={{ position: "absolute", top: -80, right: -80, width: 280, height: 280, borderRadius: "50%", background: "rgba(0,180,216,0.07)" }} />
      <div style={{ position: "absolute", top: 60, left: -60, width: 180, height: 180, borderRadius: "50%", background: "rgba(0,180,216,0.05)" }} />

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
            Freelancers · Contractors · 1099 Workers
          </span>
        </div>

        <h1 style={{
          fontSize: 40, fontWeight: 900, color: "#fff",
          lineHeight: 1.1, margin: "0 0 14px",
          letterSpacing: "-1px",
        }}>
          Track gigs & income —{" "}
          <span style={{ color: CYAN }}>keep more of what you earn.</span>
        </h1>

        <p style={{
          fontSize: 15, color: "rgba(255,255,255,0.65)", lineHeight: 1.55,
          margin: 0, fontFamily: "'Montserrat', sans-serif", fontWeight: 500,
        }}>
          The financial companion built for independent workers — income, mileage, expenses & tax reports all in one place.
        </p>
      </div>

      <div style={{
        position: "absolute", bottom: -30, left: "50%",
        transform: "translateX(-50%)",
        width: 340,
      }}>
        <img
          src="/__mockup/ss_dashboard_nobg.png"
          style={{ width: "100%", display: "block" }}
        />
      </div>
    </div>
  );
}
