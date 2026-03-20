const NAVY = "#03045e";
const CYAN = "#00b4d8";

const WORKER_TYPES = [
  "independent contractors",
  "1099 workers",
  "freelancers",
  "gig workers",
];

export function AppStoreSlide1() {
  return (
    <div style={{
      width: 393, height: 852,
      background: NAVY,
      display: "flex", flexDirection: "column",
      fontFamily: "'Poppins', sans-serif",
      overflow: "hidden",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800;900&display=swap" rel="stylesheet" />

      {/* TOP TEXT */}
      <div style={{ padding: "36px 28px 0", flexShrink: 0 }}>
        <p style={{
          fontSize: 18, fontWeight: 700, color: "rgba(255,255,255,0.55)",
          margin: "0 0 6px", letterSpacing: "0.5px", textTransform: "uppercase",
        }}>
          Finances for
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {WORKER_TYPES.map((type, i) => (
            <div key={type} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 6, height: 6, borderRadius: "50%",
                background: CYAN, flexShrink: 0,
                marginTop: 2,
              }} />
              <span style={{
                fontSize: 28, fontWeight: 800, color: i === 0 ? "#fff" : CYAN,
                letterSpacing: "-0.8px", lineHeight: 1.15,
              }}>
                {type}{i < WORKER_TYPES.length - 1 ? "," : "."}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* PHONE — fills remaining space */}
      <div style={{
        flex: 1,
        display: "flex", justifyContent: "center", alignItems: "flex-start",
        paddingTop: 14, position: "relative",
      }}>
        <div style={{
          position: "absolute", top: "6%", left: "50%",
          transform: "translateX(-50%)",
          width: 340, height: 340, borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(0,180,216,0.22) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <img
          src="/__mockup/ss_dashboard_nobg.png"
          style={{
            width: "100%", height: "auto", display: "block",
            position: "relative", zIndex: 1,
            filter: "drop-shadow(0 16px 48px rgba(0,0,0,0.65))",
          }}
        />
      </div>

      {/* LOGO */}
      <div style={{ flexShrink: 0, padding: "0 28px 24px" }}>
        <img
          src="/__mockup/bookd-logo.png"
          style={{ width: 48, height: 48, borderRadius: 10, display: "block" }}
        />
      </div>
    </div>
  );
}
