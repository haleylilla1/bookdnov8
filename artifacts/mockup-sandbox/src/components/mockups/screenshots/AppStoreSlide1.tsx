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
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@700;800;900&family=Montserrat:wght@400;500;600&display=swap" rel="stylesheet" />

      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: -80, right: -80, width: 280, height: 280, borderRadius: "50%", background: "rgba(0,180,216,0.07)" }} />
        <div style={{ position: "absolute", top: 60, left: -60, width: 180, height: 180, borderRadius: "50%", background: "rgba(0,180,216,0.05)" }} />
      </div>

      <div style={{ paddingTop: 52, display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 22, fontWeight: 900, color: "#fff", letterSpacing: "-0.5px" }}>bookd</span>
        <span style={{ fontSize: 22, fontWeight: 900, color: CYAN }}>✓</span>
      </div>

      <div style={{ padding: "28px 30px 0", textAlign: "center" }}>
        <div style={{
          display: "inline-block", background: "rgba(0,180,216,0.15)",
          border: `1px solid rgba(0,180,216,0.35)`,
          borderRadius: 20, padding: "5px 16px", marginBottom: 18,
        }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: CYAN, letterSpacing: "0.08em", fontFamily: "'Montserrat', sans-serif", textTransform: "uppercase" }}>
            For Gig Workers
          </span>
        </div>

        <h1 style={{
          fontSize: 42, fontWeight: 900, color: "#fff",
          lineHeight: 1.1, margin: "0 0 16px",
          letterSpacing: "-1px",
        }}>
          Your gig income,{" "}
          <span style={{ color: CYAN }}>organized.</span>
        </h1>

        <p style={{
          fontSize: 16, color: "rgba(255,255,255,0.7)", lineHeight: 1.55,
          margin: "0 0 10px", fontFamily: "'Montserrat', sans-serif", fontWeight: 500,
        }}>
          Built for <strong style={{ color: "#fff", fontWeight: 700 }}>freelancers</strong>,{" "}
          <strong style={{ color: "#fff", fontWeight: 700 }}>independent contractors</strong> & <strong style={{ color: "#fff", fontWeight: 700 }}>1099 workers</strong>.
        </p>

        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", margin: 0, fontFamily: "'Montserrat', sans-serif" }}>
          Track income · miles · expenses · taxes
        </p>
      </div>

      <div style={{
        position: "absolute", bottom: 0, left: "50%",
        transform: "translateX(-50%)",
        width: 340,
      }}>
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 80,
          background: `linear-gradient(to bottom, ${NAVY}, transparent)`,
          zIndex: 1,
        }} />
        <img
          src="/__mockup/ss_dashboard.png"
          style={{ width: "100%", display: "block" }}
        />
      </div>
    </div>
  );
}
