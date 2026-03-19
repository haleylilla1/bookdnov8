const NAVY = "#03045e";
const CYAN = "#00b4d8";

export function AppStoreSlide2() {
  return (
    <div style={{
      width: 393, height: 852,
      background: NAVY,
      display: "flex", flexDirection: "column",
      fontFamily: "'Poppins', sans-serif",
      overflow: "hidden",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@700;800;900&display=swap" rel="stylesheet" />

      {/* TOP TEXT ~25% */}
      <div style={{ padding: "52px 28px 0", flexShrink: 0 }}>
        <h1 style={{ fontSize: 38, fontWeight: 900, lineHeight: 1.1, margin: 0, letterSpacing: "-1px" }}>
          <span style={{ color: CYAN }}>Log every payment.</span><br />
          <span style={{ color: "#fff" }}>See your real take-home.</span>
        </h1>
      </div>

      {/* PHONE ~75% */}
      <div style={{
        flex: 1,
        display: "flex", justifyContent: "center", alignItems: "flex-start",
        paddingTop: 24,
        position: "relative",
        overflow: "visible",
      }}>
        <div style={{
          position: "absolute", top: "5%", left: "50%",
          transform: "translateX(-50%)",
          width: 300, height: 300, borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(0,180,216,0.18) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <img
          src="/__mockup/ss_dashboard_nobg.png"
          style={{
            width: "92%", height: "auto", display: "block",
            position: "relative", zIndex: 1,
            filter: "drop-shadow(0 12px 40px rgba(0,0,0,0.6))",
          }}
        />
      </div>
    </div>
  );
}
