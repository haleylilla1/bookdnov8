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
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@700;800;900&display=swap" rel="stylesheet" />

      {/* TOP TEXT ~22% */}
      <div style={{ padding: "48px 28px 0", flexShrink: 0 }}>
        <h1 style={{
          fontSize: 40, fontWeight: 900, color: "#fff",
          lineHeight: 1.1, margin: 0,
          letterSpacing: "-1px",
        }}>
          Finances for<br />
          <span style={{ color: CYAN }}>gig workers.</span>
        </h1>
      </div>

      {/* PHONE ~68% */}
      <div style={{
        flex: 1,
        display: "flex", justifyContent: "center", alignItems: "flex-start",
        paddingTop: 20,
        position: "relative",
        overflow: "visible",
      }}>
        <div style={{
          position: "absolute", top: "5%", left: "50%",
          transform: "translateX(-50%)",
          width: 300, height: 300, borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(0,180,216,0.2) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <img
          src="/__mockup/ss_dashboard_nobg.png"
          style={{
            width: "92%",
            height: "auto",
            display: "block",
            position: "relative", zIndex: 1,
            filter: "drop-shadow(0 12px 40px rgba(0,0,0,0.6))",
          }}
        />
      </div>

      {/* LOGO ROW ~10% */}
      <div style={{
        flexShrink: 0,
        padding: "0 28px 32px",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <img src="/__mockup/bookd-logo.png" style={{ width: 36, height: 36, borderRadius: 8 }} />
        <span style={{ fontSize: 20, fontWeight: 900, color: "#fff", letterSpacing: "-0.5px" }}>bookd</span>
      </div>
    </div>
  );
}
