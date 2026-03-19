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

      {/* TOP TEXT */}
      <div style={{ padding: "44px 28px 0", flexShrink: 0 }}>
        <h1 style={{
          fontSize: 42, fontWeight: 900, color: "#fff",
          lineHeight: 1.08, margin: 0, letterSpacing: "-1.2px",
        }}>
          Finances for<br />
          <span style={{ color: CYAN }}>gig workers.</span>
        </h1>
      </div>

      {/* PHONE — fills remaining space */}
      <div style={{
        flex: 1,
        display: "flex", justifyContent: "center", alignItems: "flex-start",
        paddingTop: 16, position: "relative",
      }}>
        <div style={{
          position: "absolute", top: "8%", left: "50%",
          transform: "translateX(-50%)",
          width: 320, height: 320, borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(0,180,216,0.22) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <img
          src="/__mockup/ss_dashboard_nobg.png"
          style={{
            width: "96%", height: "auto", display: "block",
            position: "relative", zIndex: 1,
            filter: "drop-shadow(0 16px 48px rgba(0,0,0,0.65))",
          }}
        />
      </div>

      {/* LOGO */}
      <div style={{ flexShrink: 0, padding: "0 28px 28px", display: "flex", alignItems: "center", gap: 10 }}>
        <img src="/__mockup/bookd-logo.png" style={{ width: 34, height: 34, borderRadius: 8 }} />
        <span style={{ fontSize: 19, fontWeight: 900, color: "#fff", letterSpacing: "-0.5px" }}>bookd</span>
      </div>
    </div>
  );
}
