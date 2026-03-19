const NAVY = "#03045e";
const CYAN = "#00b4d8";

export function AppStoreSlide6() {
  return (
    <div style={{
      width: 393, height: 852,
      background: NAVY,
      display: "flex", flexDirection: "column",
      fontFamily: "'Poppins', sans-serif",
      overflow: "hidden",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@700;800;900&display=swap" rel="stylesheet" />

      <div style={{ padding: "44px 28px 0", flexShrink: 0 }}>
        <h1 style={{ fontSize: 38, fontWeight: 900, lineHeight: 1.08, margin: 0, letterSpacing: "-1px" }}>
          <span style={{ color: CYAN }}>See who still owes you.</span><br />
          <span style={{ color: "#fff" }}>Never let a payment slip through.</span>
        </h1>
      </div>

      <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "flex-start", paddingTop: 16, position: "relative" }}>
        <div style={{
          position: "absolute", top: "8%", left: "50%", transform: "translateX(-50%)",
          width: 320, height: 320, borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(0,180,216,0.2) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <img src="/__mockup/ss_gotpaid_nobg.png"
          style={{ width: "96%", height: "auto", display: "block", position: "relative", zIndex: 1, filter: "drop-shadow(0 16px 48px rgba(0,0,0,0.65))" }}
        />
      </div>
    </div>
  );
}
